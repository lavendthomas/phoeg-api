import {
  StaticArray,
  TLiteral,
  TNumber,
  TObject,
  TOptional,
  TString,
  TUnion,
} from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import nearley from "nearley";
import phoeg from "../../../db/phoeg";
import grammar, { PhoegLangResult } from "../../../phoeglang/phoeglang";
import {
  Directions,
  DirectionsOrder,
  DirectionsRational,
  initialDirections,
  initialDirectionsRational,
  MinMax,
  MinMaxOrder,
} from "../../interfaces";
import {
  IPointsPhoegLangBody,
  IPolytopeQueryArgs,
  condition,
  pointsPhoegLangBody,
  polytopeQueryArgs,
} from "../utils";
import assert from "assert";
import { compute_concave_hull, compute_concave_hull_rational } from "./concave";
import { PointRational } from "../../interfaces";
import { Point } from "../../interfaces";

export function postConcaves(fastify: FastifyInstance, endpoint: string) {
  return fastify.post<{
    Querystring: IPolytopeQueryArgs;
    Body: IPointsPhoegLangBody;
  }>(
    endpoint,
    {
      schema: {
        querystring: polytopeQueryArgs,
        body: pointsPhoegLangBody,
      },
    },
    async (request, reply) => {
      const bounds = request.query.constraints;

      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

      // Parse the advanced constraints
      try {
        parser.feed(request.body.query || "");
      } catch (parseError: any) {
        fastify.log.error("Error at character " + parseError.offset); // "Error at character 9"
        reply.code(400).send({
          message: "Error at character " + parseError.offset,
          parseError: parseError,
        });
      }
      const invariants = [request.query.x_invariant, request.query.y_invariant];
      if (bounds) invariants.concat(bounds.map((e) => e.name));

      const advancedConstraints = parser.results[0] as PhoegLangResult;

      let isWithRational = false;
      invariants.forEach((invariant) => {
        if (invariant.includes("_rational")) {
          isWithRational = true;
        }
      });

      const queries: Array<string> = [];

      if (isWithRational) {
        queries.push(
          build_concaves_query(invariants, true, bounds, advancedConstraints)
        );
        queries.push(
          build_concaves_query(invariants, false, bounds, advancedConstraints)
        );
      } else {
        queries.push(
          build_concaves_query(invariants, false, bounds, advancedConstraints)
        );
      }

      queries.forEach((query) => {
        fastify.log.debug("Query: " + query);
      });

      let directionsOrder = Array<DirectionsOrder>();
      let minMaxOrder = Array<MinMaxOrder>();

      const orders = request.query.orders;
      if (orders) {
        for (const ord of orders) {
          if (isWithRational) {
            // fetch num then denom
            await phoeg.cached_query(
              queries[0],
              [ord],
              async (error, result) => {
                if (error) {
                  fastify.log.error(error);
                  reply.code(400).send({});
                } else {
                  const results_num = result.rows[0];
                  fastify.log.debug(results_num);

                  await phoeg.cached_query(
                    queries[1],
                    [ord],
                    async (error, result) => {
                      if (error) {
                        fastify.log.error(error);
                        reply.code(400).send({});
                      } else {
                        const results_denom = result.rows[0];
                        fastify.log.debug(results_denom);

                        const results = {} as any;

                        invariants.forEach((invariant) => {
                          if (invariant.includes("_rational")) {
                            const invariant_num = invariant.replace(
                              "_rational",
                              "_num"
                            );
                            const invariant_denom = invariant.replace(
                              "_rational",
                              "_denom"
                            );
                            results[invariant_num] =
                              results_num.json_build_object[invariant];
                            results[invariant_denom] =
                              results_denom.json_build_object[invariant];
                          } else {
                            results[invariant] =
                              results_num.json_build_object[invariant];
                          }
                        });
                        const concaves = compute_concave_hull_rational(results);
                        directionsOrder.push({
                          order: ord,
                          directions: concaves.concave,
                        });
                        minMaxOrder.push({
                          order: ord,
                          minMax: concaves.minMax,
                        });
                      }
                    }
                  );
                }
              }
            );
          } else {
            // fetch only val
            await phoeg.cached_query(
              queries[0],
              [ord],
              async (error, result) => {
                if (error) {
                  fastify.log.error(error);
                  reply.code(400).send({});
                } else {
                  const results = result.rows[0];
                  fastify.log.debug(results);

                  const concaves = results
                    ? compute_concave_hull(results.json_build_object)
                    : {
                        minMax: undefined,
                        concave: undefined,
                      };

                  directionsOrder.push({
                    order: ord,
                    directions: concaves.concave,
                  });
                  minMaxOrder.push({ order: ord, minMax: concaves.minMax });
                }
              }
            );
          }
        }
      }
      // Sort results by order asc
      directionsOrder.sort((a, b) => a.order - b.order); // DirectionsOrder
      minMaxOrder.sort((a, b) => a.order - b.order);

      const new_concaves: Array<Directions | DirectionsRational> = [];
      for (const dirsOrder of directionsOrder) {
        const new_directions = regroupByDirection(dirsOrder, isWithRational);

        new_concaves.push({ ...new_directions });
      }

      reply.send({
        concaves: new_concaves,
        minMax: minMaxOrder.map((current) => current.minMax),
      });
    }
  );
}

const regroupByDirection = (
  dirs: DirectionsOrder,
  isWithRational: boolean
): Directions | DirectionsRational => {
  if (isWithRational) {
    const new_directions: DirectionsRational = {
      ...initialDirectionsRational,
    };
    if (dirs.directions === undefined) return new_directions;
    const keys = Object.keys(dirs.directions); // minX, maxX, minY, maxY, minXminY, maxXmaxY, etc.

    for (const key of keys) {
      const coords = [];
      for (const coord of dirs.directions[key as keyof DirectionsRational]) {
        coords.push({
          ...(coord as PointRational),
          order: dirs.order,
          clicked: false,
        });
      }
      new_directions[key as keyof DirectionsRational] = coords;
    }

    return new_directions;
  } else {
    const new_directions: Directions = { ...initialDirections };
    if (dirs.directions === undefined) return new_directions;
    const keys = Object.keys(dirs.directions); // minX, maxX, minY, maxY, minXminY, maxXmaxY, etc.

    for (const key of keys) {
      const coords = [];
      for (const coord of dirs.directions[key as keyof Directions]) {
        coords.push({ ...(coord as Point), order: dirs.order, clicked: false });
      }
      new_directions[key as keyof Directions] = coords;
    }

    return new_directions;
  }
};

const build_concaves_query = (
  // special query because invariant can be rational
  invariants: StaticArray<TUnion<TLiteral<string>[]>>,
  is_num: boolean,
  bounds?: StaticArray<
    TObject<{
      name: TString;
      minimum_bound: TOptional<TNumber>;
      maximum_bound: TOptional<TNumber>;
    }>
  >,
  constraints?: PhoegLangResult
) => {
  let query = `WITH data AS (
SELECT
    COUNT(*) as mult,\n`;

  invariants.forEach((invariant, index) => {
    if (invariant.includes("_rational")) {
      if (is_num) {
        query += `    ${invariant}.num AS ${invariant}`;
      } else {
        query += `    ${invariant}.denom AS ${invariant}`;
      }
    } else {
      query += `    ${invariant}.val AS ${invariant}`;
    }
    if (index < invariants.length - 1) query += ",";
    query += "\n";
  });

  // Make sure that all invariants exist in the constraints
  constraints?.invariants.forEach((invariant) => {
    assert(
      invariants.includes(invariant),
      `Invariant ${invariant} not found in the invariants`
    );
  });

  query += `    FROM num_vertices n\n`;

  // Join all invariants from the form and Phoeglang
  const all_form_invariants = bounds
    ? [
        ...new Set(
          invariants
            .concat(bounds.map((c) => c.name))
            .concat(constraints?.invariants || [])
        ),
      ]
    : invariants; // Unique on the name of invariants
  const all_phoeglang_invariants = constraints?.invariants || [];
  const all_invariant_names = [
    ...new Set(all_form_invariants.concat(all_phoeglang_invariants)),
  ];

  all_invariant_names.forEach((invariant, index) => {
    query += `    JOIN ${invariant} ${invariant} USING(signature)\n`;
  });

  query += `    WHERE n.val = $1\n`;

  // Filter simple constraints
  if (bounds)
    bounds.forEach((bound: any) => {
      query += condition(bound.name, bound.minimum_bound, bound.maximum_bound);
    });

  // Filter advanced constraints
  if (constraints) query += `    AND (${constraints.constraints})\n`;

  query += `    GROUP BY `;
  query += invariants.join(", ");
  query += `\n`;

  query += "    ORDER BY ";
  query += invariants.join(", "); // Order according to invariant order
  query += `\n
)
SELECT json_build_object(\n`;

  invariants.concat(["mult"]).forEach((invariant, index) => {
    query += `    '${invariant}',array_to_json(array_agg(${invariant}))`;
    if (index < invariants.length) {
      // Add , except for the last invariant
      query += ",";
    }
    query += "\n";
  });

  query += `)
FROM data;`;

  return query;
};

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
import phoeg, { QueryMult } from "../../../db/phoeg";
import grammar, { PhoegLangResult } from "../../../phoeglang/phoeglang";
import { Directions, DirectionsOrders, MinMax } from "../../interfaces";
import {
  IPointsPhoegLangBody,
  IPolytopeQueryArgs,
  condition,
  pointsPhoegLangBody,
  polytopeQueryArgs,
} from "../utils";
import assert from "assert";
import { compute_concave_hull } from "./concave";
import Rational from "./rational";

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

      const query = build_concaves_query(
        invariants,
        bounds,
        advancedConstraints
      );

      fastify.log.debug("Query: " + query);
      console.debug("Query: " + query);

      let directionsList = Array<Directions>();
      let minMaxList = Array<MinMax>();

      const orders = request.query.orders;
      if (orders) {
        const queries: Array<QueryMult> = [];
        for (const order of orders) {
          queries.push({
            text: query,
            params: [order],
          });
        }

        await phoeg.cached_multiple_queries(queries).then((results) => {
          for (const result of results) {
            const result_data = result.rows[0].json_build_object;
            fastify.log.debug(result_data);
            const keys = Object.keys(result_data);

            for (const key of keys) {
              // Convert rational to Rational class
              if (key.includes("_rational")) {
                const data = result_data[key];
                const temp = [];
                for (const d of data) {
                  temp.push(new Rational(d.num, d.denom));
                }
                result_data[key] = temp;
              }
            }

            const res_concave = compute_concave_hull(result_data);

            if (
              res_concave.concave !== undefined &&
              res_concave.minMax !== undefined
            ) {
              directionsList.push(res_concave.concave);
              minMaxList.push(res_concave.minMax);
            }
          }
        });
      }

      reply.send({
        concaves: directionsList,
        minMax: minMaxList,
      });
    }
  );
}

const build_concaves_query = (
  // special query because invariant can be rational
  invariants: StaticArray<TUnion<TLiteral<string>[]>>,
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
      query += `    ${invariant} AS ${invariant}`;
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

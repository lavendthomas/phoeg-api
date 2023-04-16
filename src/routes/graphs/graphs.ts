import { FastifyInstance } from "fastify";
import phoeg from "../../db/phoeg";
import {
  StaticArray,
  TLiteral,
  TNumber,
  TObject,
  TOptional,
  TString,
  TUnion,
} from "@sinclair/typebox";
import nearley from "nearley";
import grammar, { PhoegLangResult } from "../../phoeglang/phoeglang";
import {
  condition,
  graphsQueryArgs,
  IGraphsQueryArgs,
  IGraphsQueryResults,
  InvariantConstraints,
  IPointsPhoegLangBody,
  IPolytopeQueryArgs,
  part_select_signature,
  part_where_val,
  part_select_json_build_array,
  part_from_data,
  pointsPhoegLangBody,
  polytopeQueryArgs,
  InvariantConstraint,
} from "./utils";
import { build_points_query, update_points } from "./points";
import { build_polytope_query, update_polytope } from "./polytope";
import { compute_concave_hull } from "./autoconjectures/concave";
import { postConcaves } from "./autoconjectures/concaves";
import { postPolytopes } from "./autoconjectures/polytopes";

function build_graph_query(
  invariants: StaticArray<TUnion<TLiteral<string>[]>>,
  bounds: InvariantConstraints,
  constraints?: PhoegLangResult
): string {
  let raw_query = part_select_signature();

  invariants.forEach((invariant, index) => {
    raw_query += `    ${invariant}.val AS ${invariant}`;
    if (index < invariants.length - 1) {
      raw_query += ",";
    }
    raw_query += "\n";
  });

  raw_query += `    FROM num_vertices n\n`;

  const all_invariant_names = bounds
    ? [
        ...new Set(
          invariants
            .concat(bounds.map((c) => c.name))
            .concat(constraints?.invariants || [])
        ),
      ]
    : invariants; // Unique on the name of invariants

  all_invariant_names.forEach((invariant) => {
    raw_query += `    JOIN ${invariant} ${invariant} USING(signature)\n`;
  });

  raw_query += part_where_val();

  // Filter simple constraints
  if (bounds) {
    bounds.forEach((cst) => {
      raw_query += condition(cst.name, cst.minimum_bound, cst.maximum_bound);
    });
  }

  // Filter advanced constraints
  if (constraints) raw_query += `    AND (${constraints.constraints})\n`;

  raw_query += "    ORDER BY ";
  raw_query += invariants.join(", "); // Order according to invariant order

  raw_query += part_select_json_build_array();

  invariants.forEach((invariant, index) => {
    raw_query += `    '${invariant}',array_to_json(array_agg(${invariant}))`;
    if (index < invariants.length - 1) {
      // Add , except for the last invariant
      raw_query += ",";
    }
    raw_query += "\n";
  });

  raw_query += part_from_data();
  return raw_query;
}

function postPolytopeOrPoints(
  fastify: FastifyInstance,
  endpoint: string,
  build_query_function: (
    invariants: StaticArray<TUnion<TLiteral<string>[]>>,
    bounds?: StaticArray<
      TObject<{
        name: TString;
        minimum_bound: TOptional<TNumber>;
        maximum_bound: TOptional<TNumber>;
      }>
    >,
    constraints?: PhoegLangResult
  ) => string,
  data_processing_function: (data: any, order: number) => any
) {
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
      const query_params = [request.query.order];
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
      if (request.query.colour) invariants.push(request.query.colour);
      if (bounds) invariants.concat(bounds.map((e) => e.name));

      const advancedConstraints = parser.results[0] as PhoegLangResult;

      const query = build_query_function(
        invariants,
        bounds,
        advancedConstraints
      );

      fastify.log.debug("Query: " + query);
      console.debug("Query: " + query);

      await phoeg.cached_query(query, query_params, async (error, result) => {
        if (error) {
          fastify.log.error(error);
          reply.code(400).send({});
        } else {
          let results = {};
          if (data_processing_function) {
            results = result.rows[0]
              ? data_processing_function(
                  result.rows[0].json_build_object,
                  request.query.order
                )
              : {};
          } else {
            results = result.rows[0] ? result.rows[0].json_build_object : {};
          }
          fastify.log.debug(results);
          reply.send(results);
        }
      });
    }
  );
}

/**
 * Execute a request to the phoeg database
 * WARNING: unsafe
 * @param fastify
 * @param options
 */
export async function routes(fastify: FastifyInstance, options: any) {
  // fastify.addSchema(phoegDefinitions())
  fastify.post<{
    Querystring: IGraphsQueryArgs;
    Body: IPointsPhoegLangBody;
  }>(
    "/",
    {
      schema: {
        querystring: graphsQueryArgs,
        body: pointsPhoegLangBody,
      },
    },
    async (request, reply) => {
      const query_params = [request.query.order];

      // @ts-ignore
      const invariants: InvariantConstraints = request.query.invariants;

      const bounds = request.query.constraints;

      if (bounds) {
        bounds.forEach((cst) => {
          invariants.push(cst as InvariantConstraint);
        });
      }

      fastify.log.debug(invariants);

      const query = build_graph_query(
        invariants.map((e) => e.name),
        invariants
      );

      fastify.log.debug("Query: " + query);

      await phoeg.cached_query(query, query_params, async (error, result) => {
        if (error) {
          fastify.log.error(error);
          reply.code(400).send({});
        } else {
          const results: IGraphsQueryResults = result.rows[0]
            ? result.rows[0].json_build_object
            : {};
          reply.send(results);
        }
      });
    }
  );

  postPolytopeOrPoints(fastify, "/points", build_points_query, update_points);

  postPolytopeOrPoints(
    fastify,
    "/polytope",
    build_polytope_query,
    update_polytope
  );

  postPolytopeOrPoints(
    fastify,
    "/concave",
    build_points_query,
    compute_concave_hull
  );

  postConcaves(fastify, "/concaves", build_points_query, compute_concave_hull);

  postPolytopes(fastify, "/polytopes", build_polytope_query, update_polytope);
}

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
  initialDirections,
  MinMaxOrder,
} from "../../interfaces";
import {
  IPointsPhoegLangBody,
  IPolytopeQueryArgs,
  pointsPhoegLangBody,
  polytopeQueryArgs,
} from "../utils";

export function postConcaves(
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
  data_processing_function: (data: any) => any
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
      let res = Array<DirectionsOrder>();
      let minMax = Array<MinMaxOrder>();

      const orders = request.query.orders;
      if (orders) {
        for (const ord of orders) {
          await phoeg.cached_query(query, [ord], async (error, result) => {
            if (error) {
              fastify.log.error(error);
              reply.code(400).send({});
            } else {
              const results = result.rows[0]
                ? data_processing_function(result.rows[0].json_build_object)
                : {};

              fastify.log.debug(results);
              res.push({
                order: ord,
                directions: results.concave,
              });
              minMax.push({ order: ord, minMax: results.minMax });
            }
          });
        }
      }
      res.sort((a, b) => a.order - b.order); // DirectionsOrder
      minMax.sort((a, b) => a.order - b.order);

      const new_concaves: Array<Directions> = [];
      for (const dirsOrder of res) {
        const new_directions: Directions = convert_dirs_order(dirsOrder);

        new_concaves.push({ ...new_directions });
      }

      reply.send({
        concaves: new_concaves,
        minMax: minMax.map((current) => current.minMax),
      });
    }
  );
}

const convert_dirs_order = (dirs: DirectionsOrder): Directions => {
  const new_directions: Directions = initialDirections;
  if (dirs.directions === undefined) return new_directions;
  const keys = Object.keys(dirs.directions);

  for (const key of keys) {
    const coords = [];
    for (const coord of dirs.directions[key as keyof Directions]) {
      coords.push({ ...coord, order: dirs.order, clicked: false });
    }
    new_directions[key as keyof Directions] = coords;
  }

  return new_directions;
};

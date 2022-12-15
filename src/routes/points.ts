import { FastifyInstance } from "fastify";
import phoeg from "../db/phoeg";
import { get_default_query } from "../queries/DefaultQueries";
import format from "pg-format";
import { Static, Type } from "@sinclair/typebox";

export const pointsQueryArgs = Type.Object({
  nb_val: Type.Number(),
  invariant: Type.String(),
});

export type IPointsQueryArgs = Static<typeof pointsQueryArgs>;

export interface IPointsQueryResults {
  m: number[];
  invariant: number[];
  chi: number[];
  mult: number[];
}

/**
 * Execute a request to the phoeg database
 * WARNING: unsafe
 * @param fastify
 * @param options
 */
export async function routes(fastify: FastifyInstance, options: any) {
  fastify.get<{
    Querystring: IPointsQueryArgs;
  }>(
    "/points",
    {
      schema: { querystring: pointsQueryArgs },
      preValidation: (request, reply, done) => {
        done(
          !request.query.nb_val
            ? new Error("Please provide a nb_val.")
            : undefined
        );
        done(
          !request.query.invariant
            ? new Error("Please provide an invariant.")
            : undefined
        );

        const acceptable_invariants = ["av_col", "num_col"];
        done(
          !acceptable_invariants.includes(request.query.invariant)
            ? new Error(
                "Please provide an invariant in " +
                  acceptable_invariants.join(", ") +
                  "."
              )
            : undefined
        ); // only accept valid invariants
      },
    },
    async (request, reply) => {
      const raw_query = get_default_query("points-json-transpose");
      const query = format(raw_query, request.query.invariant);

      await phoeg.cached_query(
        query,
        [request.query.nb_val],
        (error, result) => {
          if (error) {
            fastify.log.error(error);
            reply.code(400).send({});
          } else {
            const results: IPointsQueryResults =
              result.rows[0].json_build_object;
            reply.send(results);
          }
        }
      );
    }
  );
}

import {FastifyInstance} from "fastify";
import phoeg from "../../db/phoeg";
import {get_default_query} from "../../queries/DefaultQueries";
import {Static, Type} from "@sinclair/typebox";
import format from "pg-format";

export const polytopQueryArgs = Type.Object({
    nb_val: Type.Number(),
    invariant: Type.String(),
})

export type IPolytopQueryArgs = Static<typeof polytopQueryArgs>;

/**
 * Execute a request to the phoeg database
 * WARNING: unsafe
 * @param fastify
 * @param options
 */
export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.get<{
        Querystring: IPolytopQueryArgs
    }>('/polytop', {
        schema: {querystring: polytopQueryArgs},
        preValidation: (request, reply, done) => {
            done(!request.query.nb_val ? new Error("Please provide a nb_val.") : undefined)
            done(!request.query.invariant ? new Error("Please provide an invariant.") : undefined)

            const acceptable_invariants = ["av_col", "num_col"]
            done(!acceptable_invariants.includes(request.query.invariant)
                ? new Error("Please provide an invariant in " + acceptable_invariants.join(", ") + ".")
                : undefined) // only accept valid invariants
        }
    }, async (request, reply) => {

        const raw_query = get_default_query("poly-json")
        const query = format(raw_query, request.query.invariant)

        await phoeg.cached_query(query, [request.query.nb_val], async (error, result) => {
            if (error) {
                fastify.log.error(error)
                reply.code(400).send({})
            } else {
                //fastify.log.info(result)
                reply.send(result.rows[0].json_build_object)
            }

        })

    })
}
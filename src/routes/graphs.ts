import {FastifyInstance} from "fastify";
import phoeg from "../db/phoeg";
import format from "pg-format";
import {get_default_query} from "../queries/DefaultQueries";

export interface IGraphsQueryArgs {
    nb_val: number,
    invariant: string
}

/**
 * Execute a request to the phoeg database
 * WARNING: unsafe
 * @param fastify
 * @param options
 */
export async function routes(fastify: FastifyInstance, options: any) {
    fastify.get<{
        Querystring: IGraphsQueryArgs
    }>('/graphs', async (request, reply) => {

        const acceptable_invariants = ["av_col" , "num_col"]

        if (!request.query.nb_val) {
            reply.code(400).send({message: "Please provide a nb_val."})
        }

        if (!request.query.invariant) {
            reply.code(400).send({message: "Please provide an invariant."})
        }
        if (!acceptable_invariants.includes(request.query.invariant)) {
            reply.code(400).send({message: "Please provide an invariant in " + acceptable_invariants.join(", ") + "."})
        }

        const raw_query = get_default_query("graphs-json-transpose")
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
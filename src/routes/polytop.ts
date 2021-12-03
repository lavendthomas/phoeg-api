import {FastifyInstance} from "fastify";
import phoeg from "../db/phoeg";
import {get_default_query} from "../queries/DefaultQueries";

interface IPolytopQueryArgs {
    nb_val: number
}

/**
 * Execute a request to the phoeg database
 * WARNING: unsafe
 * @param fastify
 * @param options
 */
export async function routes(fastify: FastifyInstance, options: any) {
    fastify.get<{
        Querystring: IPolytopQueryArgs
    }>('/polytop', async (request, reply) => {

        if (!request.query.nb_val) {
            reply.code(400).send({message: "Please provide a nb_val."})
        }

        const query = get_default_query("poly-json")

        await phoeg.cached_query(query, [request.query.nb_val], async (error, result) => {
            if (error) {
                fastify.log.error(error)
                reply.code(400).send({})
            } else {
                //fastify.log.info(result)
                reply.send(result.rows)
            }

        })

    })
}
import {FastifyInstance} from "fastify";
import phoeg from "../db/phoeg";
import {get_default_query} from "../queries/DefaultQueries";

/**
 * Execute a request to the phoeg database
 * WARNING: unsafe
 * @param fastify
 * @param options
 */
export async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/extremals', async (request, reply) => {

        const query = get_default_query("extremals-json")

        await phoeg.cached_query(query, [], async (error, result) => {
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
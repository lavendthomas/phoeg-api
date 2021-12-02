import {FastifyInstance} from "fastify";
import phoeg from "../db/phoeg";
import {get_default_query} from "../queries/DefaultQueries";
import {createClient} from "redis";

interface IPointsQueryArgs {
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
        Querystring: IPointsQueryArgs
    }>('/points', async (request, reply) => {

        if (!request.query.nb_val) {
            reply.code(400).send({message: "Please provide a nb_val."})
        }

        const query = get_default_query("points")

        fastify.log.debug("Querying" + query)

        const client = createClient({
            url: 'redis://:@localhost:6379' // No username nor password     is needed
        })
        await client.connect()

        if (await client.exists("key")) {
            reply.type("application/json; charset=utf-8").send(await client.get("key") as string)
            //reply.send(JSON.parse(await client.get("key") as string))

        } else {

            phoeg.query(query, [request.query.nb_val], async (error, result) => {
                if (error) {
                    fastify.log.error(error)
                    reply.code(400).send({})
                } else {
                    //fastify.log.info(result)
                    await client.set("key", JSON.stringify(result.rows))
                    reply.send(result.rows)
                }

            })

        }


    })
}
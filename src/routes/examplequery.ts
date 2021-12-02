import {FastifyInstance} from "fastify";
import phoeg from "../db/phoeg";

/**
 * Execute a request to the phoeg database
 * WARNING: unsafe
 * @param fastify
 * @param options
 */
export async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/example', async (request, reply) => {
        // do something with request data

        const query = `
SELECT P.val AS eci, num_edges.val AS m,
COUNT(*) AS mult
FROM eci P
JOIN num_vertices USING(signature)
JOIN num_edges USING(signature)
WHERE num_vertices.val = 7
GROUP BY m, eci;
`.replace(/\n/g, ' ')

        fastify.log.debug("Querying" + query)

        phoeg.query(query, [], (error, result) => {
            if (error) {
                fastify.log.error(error)
                reply.code(400).send({})
            } else {
                fastify.log.info(result)
                reply.send(result.rows)
            }

        })
    })
}

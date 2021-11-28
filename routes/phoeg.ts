import {FastifyInstance} from "fastify";
import {IQuerystring, IHeaders} from '../libs/query';

/**
 * Execute a request to the phoeg database
 * WARNING: unsafe
 * @param fastify
 * @param options
 */
export async function routes(fastify: FastifyInstance, options: any) {
    fastify.get<{
        Querystring: IQuerystring,
        Headers: IHeaders
    }>('/phoeg', async (request, reply) => {
        const {username, password} = request.query
        const customerHeader = request.headers['h-Custom']
        // do something with request data
        console.log(username + ":" + password)

        return `logged in!`
    })
}



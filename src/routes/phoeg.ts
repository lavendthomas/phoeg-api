import {FastifyInstance} from "fastify";

interface ISqlQueryArgs {
    sqlquery: string
}

/**
 * Execute a request to the phoeg database
 * WARNING: unsafe
 * @param fastify
 * @param options
 */
export async function routes(fastify: FastifyInstance, options: any) {
    fastify.get<{
        Querystring: ISqlQueryArgs,
    }>('/phoeg', async (request, reply) => {
        const {sqlquery} = request.query
        // do something with request data
        console.log(sqlquery)
        return `logged in!`
    })
}



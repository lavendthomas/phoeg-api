import {FastifyInstance} from "fastify";


export async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/', async (request, reply) => {
        reply.code(200).send({hello: 'ok'})
    })
}
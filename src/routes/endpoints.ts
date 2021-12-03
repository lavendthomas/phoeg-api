import {FastifyInstance} from "fastify";


export async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/endpoints', async (request, reply) => {
        reply.code(200).send({
            endpoints: [
                {
                    path: '/graphs',
                    params: {
                        nb_val: 'number'
                    }
                },
                {
                    path: '/points',
                    params: {
                        nb_val: 'number'
                    }
                }
            ]
        })
    })
}
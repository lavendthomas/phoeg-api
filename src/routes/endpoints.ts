import {FastifyInstance} from "fastify";

import {allInvariants, graphQueryArgsFn, phoegDefinitions} from "./graphs"

export async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/endpoints', async (request, reply) => {
        reply.code(200).send({
            endpoints: [
                {
                    name: 'Graphs',
                    description: 'The default template.',
                    path: '/graphs',
                    definitions: phoegDefinitions(),
                    invariants: allInvariants(),
                    params: graphQueryArgsFn(),
                },
            ]
        })
    })
}
import {FastifyInstance} from "fastify";

import {graphsQueryArgs, phoegDefinitions} from "./graphs"
import {pointsQueryArgs} from "./points"


export async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/endpoints', async (request, reply) => {
        reply.code(200).send({
            endpoints: [
                {
                    name: 'Graphs',
                    description: '',
                    path: '/graphs',
                    definitions: phoegDefinitions,
                    params: graphsQueryArgs
                },
                {
                    name: 'Points',
                    description: '',
                    path: '/points',
                    params: pointsQueryArgs
                }
            ]
        })
    })
}
import {FastifyInstance} from "fastify";

import {graphsQueryArgs} from "./graphs"
import {polytopQueryArgs} from "./polytop"
import {pointsQueryArgs} from "./points"


export async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/endpoints', async (request, reply) => {
        reply.code(200).send({
            endpoints: [
                {
                    path: '/graphs',
                    params: graphsQueryArgs
                },
                {
                    path: '/points',
                    params: pointsQueryArgs
                },
                {
                    path: 'polytop',
                    params: polytopQueryArgs
                }
            ],
            invariants: {
                avcol: {},
                numcol: {}
            }
        })
    })
}
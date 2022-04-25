import {FastifyInstance} from "fastify";

import {allInvariants} from "./graphs"

export async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/invariants', async (request, reply) => {
        reply.code(200).send(await allInvariants())
    })
}
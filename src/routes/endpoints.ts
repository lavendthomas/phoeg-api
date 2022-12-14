import { FastifyInstance } from "fastify";

import { graphQueryArgsFn, phoegDefinitions } from "./graphs/utils";
import { allInvariants, InvariantTypes } from "./invariants";

export async function routes(fastify: FastifyInstance, options: any) {
  fastify.get("/endpoints", async (request, reply) => {
    reply.code(200).send({
      endpoints: [
        {
          name: "Graphs",
          description: "The default template.",
          path: "/graphs",
          definitions: phoegDefinitions(),
          invariants: allInvariants(InvariantTypes.numbers),
          params: graphQueryArgsFn(),
        },
      ],
    });
  });
}

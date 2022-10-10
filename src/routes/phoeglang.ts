import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import nearley from "nearley";

import grammar from "../phoeglang/phoeglang";

export const phoegLangBody = Type.Object({
  query: Type.String(),
});

export type IPhoegLangBody = typeof phoegLangBody;

export async function routes(fastify: FastifyInstance, options: any) {
  fastify.post<{
    Body: IPhoegLangBody;
  }>(
    "/phoeglang",
    {
      schema: {
        body: phoegLangBody,
      },
    },
    async (request, reply) => {
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
      try {
        parser.feed(request.body.query);
      } catch (parseError: any) {
        console.log("Error at character " + parseError.offset); // "Error at character 9"
        reply.code(400).send({
          message: "Error at character " + parseError.offset,
          parseError: parseError,
        });
      }
      reply.code(200).send(parser.results);
    }
  );
}

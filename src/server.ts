import fastify, { FastifyInstance } from "fastify";
import { parse } from "qs";
import fastify_compress from "fastify-compress";
import fastifyCors from "fastify-cors";
import fastifySwagger from "fastify-swagger";
import { API_PATH, API_PORT, SERVER_ADDRESS } from "./.env";
import { routes as endpointRoutes } from "./routes/endpoints";
import { routes as invariantsRoutes } from "./routes/invariants";
import { routes as phoeglangRoutes } from "./routes/phoeglang";
import { routes as graphsRoutes } from "./routes/graphs/graphs";

export function buildServer(): FastifyInstance {
  const server = fastify({
    logger: {
      level: "debug",
      // file: "/tmp/phoeg-api.log"
    },
    ajv: {
      customOptions: {
        coerceTypes: "array", // Accept arrays in querystrings
      },
    },
    querystringParser: (str) => parse(str),
  });

  /*
   * Enable compression
   */
  server.register(fastify_compress, { threshold: 1024 });

  /*
   * Allow Cross-origin resource sharing
   */
  server.register(fastifyCors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  /**
   * Add a web swagger documentation for the API.
   */
  server.register(fastifySwagger, {
    routePrefix: "/documentation",
    swagger: {
      info: {
        title: "Phoeg REST API",
        description: "A REST API for Phoeg",
        version: "0.1.0",
      },
      externalDocs: {
        url: "http://informatique.umons.ac.be/phoeg/",
        description: "Find more info here",
      },
      host: `${SERVER_ADDRESS}:${API_PORT}${API_PATH}`,
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [],
      definitions: {},
      securityDefinitions: {},
    },
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    exposeRoute: true,
  });

  server.register(endpointRoutes);
  server.register(invariantsRoutes);
  server.register(phoeglangRoutes);
  server.register(graphsRoutes, { prefix: "/graphs" });

  return server;
}

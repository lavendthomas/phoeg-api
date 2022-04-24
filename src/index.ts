import fastify from 'fastify';
import fastify_compress from "fastify-compress";
import fastifyCors from "fastify-cors";
import fastifySwagger from "fastify-swagger";

import {parse} from 'qs';

import {API_PATH, API_PORT, SERVER_ADDRESS} from "./.env";
const grammar = require("./phoeglang/phoeglang.js");

import {routes as endpointRoutes} from "./routes/endpoints"
import {routes as graphsRoutes} from "./routes/graphs"
import {routes as invariantsRoutes} from "./routes/invariants"
import nearley from 'nearley';

const server = fastify({
    logger: {level: 'debug'},
    ajv: {
        customOptions: {
            coerceTypes: 'array'        // Accept arrays in querystrings
        }
    },
    querystringParser: str => parse(str)
})

/*
 * Enable compression
 */
server.register(
    fastify_compress,
    { threshold: 1024 }
)

/*
 * Allow Cross-origin resource sharing
 */
server.register(
    fastifyCors, {
        origin: "*",
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204
    }
)

/**
 * Add a web swagger documentation for the API.
 */
server.register(
    fastifySwagger,
    {
        routePrefix: '/documentation',
        swagger: {
            info: {
                title: 'Phoeg REST API',
                description: 'A REST API for Phoeg',
                version: '0.1.0'
            },
            externalDocs: {
                url: 'http://informatique.umons.ac.be/phoeg/',
                description: 'Find more info here'
            },
            host: `${SERVER_ADDRESS}:${API_PORT}${API_PATH}`,
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json'],
            tags: [],
            definitions: {},
            securityDefinitions: {}
        },
        uiConfig: {
            docExpansion: 'full',
            deepLinking: false
        },
        uiHooks: {
            onRequest: function (request, reply, next) { next() },
            preHandler: function (request, reply, next) { next() }
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
        exposeRoute: true
    }
)

server.register(endpointRoutes)
server.register(invariantsRoutes)
server.register(graphsRoutes, {prefix: "/graphs"})


server.listen(API_PORT, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    // const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar))
    // try {
    //     parser.feed('MAX(7,6-5)')
    // } catch (parseError: any) {
    //     console.log("Error at character " + parseError.offset); // "Error at character 9"
    // }
    // console.log(JSON.stringify(parser.results));
    console.log(`Server listening at ${address}`)
})
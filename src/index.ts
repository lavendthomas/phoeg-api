import fastify from 'fastify'
import fastify_compress from "fastify-compress";
import fastifyCors from "fastify-cors";
import fastifySwagger from "fastify-swagger";
import {API_PORT, SERVER_ADDRESS} from "./.env";


import {routes as endpointRoutes} from "./routes/endpoints"
import {routes as indexRoutes} from "./routes"
import {routes as polytopRoutes} from "./routes/polytop"
import {routes as pointsRoutes} from "./routes/points"
import {routes as graphsRoutes} from "./routes/graphs"
import {routes as extremalsRoutes} from "./routes/extremals"

const server = fastify({
    logger: {level: 'debug'}
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
    fastifyCors
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
            host: `${SERVER_ADDRESS}:${API_PORT}`,
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
server.register(indexRoutes)
server.register(polytopRoutes)
server.register(pointsRoutes)
server.register(graphsRoutes)
server.register(extremalsRoutes)


server.listen(API_PORT, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
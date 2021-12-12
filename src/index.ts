import fastify from 'fastify'
import fastify_compress from "fastify-compress";
import fastifyCors from "fastify-cors";

import {routes as endpointRoutes} from "./routes/endpoints"
import {routes as indexRoutes} from "./routes"
import {routes as polytopRoutes} from "./routes/polytop"
import {routes as pointsRoutes} from "./routes/points"
import {routes as graphsRoutes} from "./routes/graphs"
import {routes as extremalsRoutes} from "./routes/extremals"

const server = fastify({
    logger: {level: 'debug'}
})

/**
 * Enable compression
 */
server.register(
    fastify_compress,
    { threshold: 1024 }
)

/**
 * Allow Cross-origin resource sharing
 */
server.register(
    fastifyCors
)

server.register(endpointRoutes)
server.register(indexRoutes)
server.register(polytopRoutes)
server.register(pointsRoutes)
server.register(graphsRoutes)
server.register(extremalsRoutes)


server.listen(8080, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
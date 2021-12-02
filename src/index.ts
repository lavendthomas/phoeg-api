import fastify from 'fastify'

import {CacheStorage} from "./db/CacheStorage";

import {routes as indexRoutes} from "./routes"
import {routes as phoegRoutes} from "./routes/phoeg"
import {routes as examplePhoegRoutes} from  "./routes/examplequery"
import {routes as pointsRoutes} from "./routes/points"

const server = fastify({
    logger: {level: 'debug'}
})

server.register(indexRoutes)
server.register(phoegRoutes)
server.register(examplePhoegRoutes)
server.register(pointsRoutes)

const cache = new CacheStorage()
cache.set("key", "val")
cache.get("key").then()

server.listen(8080, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
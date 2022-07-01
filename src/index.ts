
import { buildServer } from "./server"

import {API_PATH, API_PORT, SERVER_ADDRESS} from "./.env"
import {allInvariants, InvariantTypes, routes as invariantsRoutes} from "./routes/invariants"

const server = buildServer()

server.listen(API_PORT, async (err, address) =>  {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    await allInvariants(InvariantTypes.any); // pre-fetch invariants


    console.log(`Server listening at ${address}`)
})
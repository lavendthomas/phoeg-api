import {Client, Pool, QueryResult} from "pg";
import {POSTGRESQL_LOGIN} from "../.env";

const pool = new Pool({
    user: POSTGRESQL_LOGIN.user,
    host: POSTGRESQL_LOGIN.host,
    database: POSTGRESQL_LOGIN.database,
    password: POSTGRESQL_LOGIN.password,
    port: POSTGRESQL_LOGIN.port,
})

export default {
    query: async (text: string, params: any, callback: (err: Error, result: QueryResult) => any) => {
        console.debug("Querying: " + text)
        // return pool.query(text, params, callback)

        const client = new Client({
            user: POSTGRESQL_LOGIN.user,
            host: POSTGRESQL_LOGIN.host,
            database: POSTGRESQL_LOGIN.database,
            password: POSTGRESQL_LOGIN.password,
            port: POSTGRESQL_LOGIN.port,
        })
        await client.connect()
        return client.query(text, params, callback)
    },
};
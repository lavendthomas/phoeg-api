import {Client, Pool, QueryResult} from "pg";
import {POSTGRESQL_LOGIN} from "../.env";
import {createClient} from "redis";
import {sha1} from "sha.js";

class PooledDB {

    private static instance: PooledDB

    private static _pool: Pool

    private constructor() {
        PooledDB._pool = new Pool({
            user: POSTGRESQL_LOGIN.user,
            host: POSTGRESQL_LOGIN.host,
            database: POSTGRESQL_LOGIN.database,
            password: POSTGRESQL_LOGIN.password,
            port: POSTGRESQL_LOGIN.port,
        })
    }

    public static async getInstance() {
        if (!PooledDB.instance) {
            PooledDB.instance = new PooledDB();
        }
        await PooledDB._pool.connect()
        return PooledDB.instance;
    }

    public async query(text: string, params: any[], callback: (err: Error, result: QueryResult) => any) {
        return PooledDB._pool.query(text, params, callback)
    }
}


class RedisCient {

}


export default {
    query: async (text: string, params: any[], callback: (err: Error, result: QueryResult) => any) => {
        const psql_pool = await PooledDB.getInstance()

        return psql_pool.query(text, params, callback)
    },

    cached_query: async (text: string, params: any[], callback: (err: Error, result: QueryResult) => any) => {
        const psql_pool = await PooledDB.getInstance()

        const redis_client = createClient({
            url: 'redis://:@localhost:6379' // No username nor password     is needed
        })
        await redis_client.connect()

        const redis_key = new sha1().update("text").digest('hex') + JSON.stringify(params)

        if (await redis_client.exists(redis_key)) {
            console.debug("Received " + redis_key + " from cache.")
            const query_result: QueryResult = JSON.parse(await redis_client.get(redis_key) as string)
            // @ts-ignore
            callback(null, query_result)
        } else {
            return psql_pool.query(text, params, (err: Error, result: QueryResult) => {
                console.debug("Querying " + redis_key + " and adding it to the cache.")
                redis_client.set(redis_key, JSON.stringify(result))
                callback(err, result)
            })
        }
    }
}
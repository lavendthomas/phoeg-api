import { Pool, QueryResult } from "pg";
import { POSTGRESQL_LOGIN, REDIS_LOGIN } from "../.env";
import { createClient } from "redis";
import { sha1 } from "sha.js";
import { RedisClientType } from "@node-redis/client/dist/lib/client";

class PooledDB {
  private static instance: PooledDB;

  private static _pool: Pool;

  private constructor() {
    PooledDB._pool = new Pool({
      user: POSTGRESQL_LOGIN.user,
      host: POSTGRESQL_LOGIN.host,
      database: POSTGRESQL_LOGIN.database,
      password: POSTGRESQL_LOGIN.password,
      port: POSTGRESQL_LOGIN.port,
    });
  }

  public static async getInstance() {
    if (!PooledDB.instance) {
      PooledDB.instance = new PooledDB();
      await PooledDB._pool.connect();
    }
    return PooledDB.instance;
  }

  public async query(
    text: string,
    params: any[],
    callback: (err: Error, result: QueryResult) => any
  ) {
    return PooledDB._pool.query(text, params, callback);
  }
}

class RedisClient {
  get client(): RedisClientType<any, any> {
    return this._client;
  }

  private static instance: RedisClient;

  private _client: RedisClientType<any, any>;

  private constructor() {
    this._client = createClient({
      url: `redis://${REDIS_LOGIN.user}:${REDIS_LOGIN.password}@${REDIS_LOGIN.host}:${REDIS_LOGIN.port}`,
    });
  }

  public static async getInstance() {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
      await this.instance._client.connect();
    }
    return RedisClient.instance;
  }
}

export default {
  query: async (
    text: string,
    params: any[],
    callback: (err: Error, result: QueryResult) => any
  ) => {
    const psql_pool = await PooledDB.getInstance();

    return psql_pool.query(text, params, callback);
  },

  cached_query: async (
    text: string,
    params: any[],
    callback: (err: Error, result: QueryResult) => any
  ) => {
    const psql_pool = await PooledDB.getInstance();

    const redis_client = await RedisClient.getInstance();

    const redis_key =
      new sha1().update(text).digest("hex") + JSON.stringify(params);

    if (await redis_client.client.exists(redis_key)) {
      console.debug("Received " + redis_key + " from cache.");
      const query_result: QueryResult = JSON.parse(
        (await redis_client.client.get(redis_key)) as string
      );
      // @ts-ignore
      callback(null, query_result);
    } else {
      await psql_pool.query(
        text,
        params,
        (error: Error, result: QueryResult) => {
          if (error) {
            console.error(error);
            // @ts-ignore
            callback(error, null);
          } else {
            console.debug(
              "Querying " + redis_key + " and adding it to the cache."
            );
            redis_client.client.set(redis_key, JSON.stringify(result));
            callback(error, result);
          }
        }
      );
    }
  },
};

import { Pool, QueryResult, QueryResultOrder } from "pg";
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

  public async query_multiple(queries: QueryMult[]) {
    // call many queries in once
    const res: QueryResult<any>[] = [];
    for (const query of queries) {
      PooledDB._pool.query(query.text, query.params).then((result) => {
        res.push(result);
      });
    }
    return res;
  }

  public async query_without_callback(text: string, params: any[]) {
    return await PooledDB._pool.query(text, params);
  }
}

export interface QueryMult {
  text: string;
  params: any[];
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
        (await redis_client.client.get(redis_key)) as string // Because redis returns a string
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
            redis_client.client.set(redis_key, JSON.stringify(result)); // Because redis only accepts strings
            callback(error, result);
          }
        }
      );
    }
  },

  cached_multiple_queries: async (queries: QueryMult[]) => {
    const psql_pool = await PooledDB.getInstance();

    const redis_client = await RedisClient.getInstance();

    const results: QueryResultOrder<any>[] = [];

    for (const query of queries) {
      const redis_key =
        new sha1().update(query.text).digest("hex") +
        JSON.stringify(query.params);

      if (await redis_client.client.exists(redis_key)) {
        console.debug("Received " + redis_key + " from cache.");
        const query_result: QueryResult = JSON.parse(
          (await redis_client.client.get(redis_key)) as string // Because redis returns a string
        );
        results.push({ ...query_result, order: query.params[0] });
      } else {
        await psql_pool
          .query_without_callback(query.text, query.params)
          .then((result) => {
            console.debug(
              "Querying " + redis_key + " and adding it to the cache."
            );
            redis_client.client.set(redis_key, JSON.stringify(result)); // Because redis only accepts strings
            results.push({
              ...result,
              order: query.params[0],
            });
          });
      }
    }
    return results;
  },
};

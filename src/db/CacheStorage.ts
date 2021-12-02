import {createClient} from "redis";
import {RedisClientType} from "@node-redis/client/dist/lib/client";
import {promisify} from "util";

export class CacheStorage {

    protected redisClient: RedisClientType<{json: {}, ft: {}}>

    private setAsync: (key: string, value: any) => any
    private getAsync: (key: string) => any

    constructor() {

        this.redisClient = createClient({
            url: 'redis://:@localhost:6379' // No username nor password     is needed
        })

        //client.on('error', (err) => console.log('Redis Client Error', err));

        this.redisClient.connect();

        this.setAsync = promisify(this.redisClient.set).bind(this.redisClient)
        this.getAsync = promisify(this.redisClient.get).bind(this.redisClient)


    }

    set(key: string, value: any) {
        const setAsync = promisify(this.redisClient.set).bind(this.redisClient)
        return setAsync(key, value)
    }



    async get(key: string): Promise<any> {
        const getAsync = promisify(this.redisClient.get).bind(this.redisClient)
        console.log("get called.")
        const res = await getAsync(key)
        console.log("get received.")
        return res
    }
}
import * as flatCache from "flat-cache";

class CacheStorage {
    private cache: flatCache.Cache;

    constructor() {
        this.cache = flatCache.load("phoeg-db-cache")
    }
}
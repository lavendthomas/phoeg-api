import {Pool, Submittable} from "pg";


class CachedPool extends Pool {


    query<T extends Submittable>(queryStream: T): T {
        return super.query(queryStream);
    }

}
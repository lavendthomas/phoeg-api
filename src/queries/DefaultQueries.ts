import {readFileSync} from "fs";

export function get_default_query(name: string): string {
    return readFileSync(`./build/queries/${name}.sql`, "utf-8")
}
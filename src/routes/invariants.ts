import {FastifyInstance} from "fastify";
import {Static, Type} from '@sinclair/typebox';
import phoeg from "../db/phoeg";

export enum InvariantTypes {
    any,
    numbers,
    integers,
    reals,
    doubles
}

export const InvariantsQueryArgs = Type.Object({
    type: Type.Optional(Type.String())
})

export type IInvariantsQueryArgs = Static<typeof InvariantsQueryArgs>;

export let ACCEPTABLE_INVARIANTS: string[] = []

export async function allInvariants(type: InvariantTypes = InvariantTypes.any): Promise<string[]> {
    // Cache the result in a variable
    return fetchInvariants(type).then((i) => {if (type == InvariantTypes.numbers) ACCEPTABLE_INVARIANTS = i; return i});
}

export async function fetchInvariants(type: InvariantTypes): Promise<string[]> {
    let answer: string[] = []
    let query = "SELECT tablename FROM tables "
    switch (type) {
        case InvariantTypes.numbers:
            query += "WHERE datatype = 'integer' or datatype = 'double precision' or datatype = 'real'"
            break
        case InvariantTypes.integers:
            query += "WHERE datatype = 'integer'"
            break
        case InvariantTypes.reals:
            query += "WHERE datatype = 'real'"
            break;
        case InvariantTypes.doubles:
            query += "WHERE datatype = 'double precision'"
            break;
    }
    query += ";"
    console.log(query)
    await phoeg.cached_query(query, [], async (error, result) => {
        answer = result.rows.map((row) => row.tablename).sort()
    })
    return answer
}

export async function routes(fastify: FastifyInstance, options: any) {
    fastify.get<{
        Querystring: IInvariantsQueryArgs,
    }>('/invariants', {schema: InvariantsQueryArgs}, async (request, reply) => {
        let type: InvariantTypes
        switch (request.query.type) {
            case null: type = InvariantTypes.numbers; break; // by default, give only numbers
            case "any": type = InvariantTypes.any; break;
            case "numbers": type = InvariantTypes.numbers; break;
            case "reals": type = InvariantTypes.reals; break;
            case "doubles": type = InvariantTypes.doubles; break;
            default: reply.code(400).send({reason: "Please enter a valid type"}); return;
        }
        console.log(type)
        reply.code(200).send(await allInvariants(type))
    })
}
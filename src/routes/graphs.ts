import {FastifyInstance} from "fastify";
import phoeg from "../db/phoeg";
import {Static, StaticArray, TLiteral, TUnion, Type} from '@sinclair/typebox';

const PATH = "/graphs"

const ACCEPTABLE_INVARIANTS = ["av_col", "num_col"] as const
type Invariant = typeof ACCEPTABLE_INVARIANTS[number]

type InvariantValues = {
    [inv in Invariant]?: number
}

const ACCEPTABLE_NB_VAL = Array.from(Array(10).keys())

export const graphsQueryArgs = Type.Object({
    max_graph_size: Type.Union(ACCEPTABLE_NB_VAL.map(nb => Type.Literal(nb)),
        {default: 1, description: "Maximum size of the graphs."}),
    invariants: Type.Array(Type.Union(ACCEPTABLE_INVARIANTS.map(i => Type.Literal(i))),
        {minItems: 2, description: "Name of each invariant to analyse. The first two will be used on the axis."}),
    //[inv in Invariant]?: Type.Optional(Type.Number())
})

ACCEPTABLE_INVARIANTS.forEach((invariant) => {
    // @ts-ignore
    graphsQueryArgs.properties[invariant] = Type.Optional(Type.Number(
        {description: `Fixed value for the invariant ${invariant}.`}))
})

export type IGraphsQueryArgs = Static<typeof graphsQueryArgs>;


interface IGraphsQueryResults {
    sig: string[],
    m: number[],
    invariant: number[],
    chi: number[]
}


function part1(): string {
    return `WITH data AS (
SELECT
    n.signature AS sig,\n`
}

function part2(): string {
    return `    FROM num_vertices n\n`
}

function part3(): string {
    return `    WHERE n.val = $1\n`
}

function part4(): string {
    return `
)
SELECT json_build_object(
    'sig',array_to_json(array_agg(sig)),\n`
}

function part5(): string {
    return `)
FROM data;`
}

function build_graph_query(invariants: StaticArray<TUnion<TLiteral<string>[]>>, values: InvariantValues): string {
    let raw_query = part1()

    invariants.forEach((invariant, index) => {
        raw_query += `    ${invariant}.val AS ${invariant},\n`
    })

    raw_query += part2()

    invariants.forEach((invariant, index) => {
        raw_query += `    JOIN ${invariant} ${invariant} USING(signature)\n`
    })

    raw_query += part3()

    Object.keys(values).forEach(key => {
        console.log(key)
        // @ts-ignore
        raw_query += `    AND ${key}.val = ${values[key]}\n`
    })

    // TODO WHERE invariant_values

    raw_query += '    ORDER BY '
    raw_query += invariants.join(", ") // Order according to invariant order

    raw_query += part4()

    invariants.forEach((invariant, index) => {
        raw_query += `    '${invariant}',array_to_json(array_agg(${invariant}))`
        if (index < invariants.length-1) {
            // Add , except for the last invariant
            raw_query += ","
        }
        raw_query += "\n"
    })

    raw_query += part5()
    return raw_query
}

/**
 * Execute a request to the phoeg database
 * WARNING: unsafe
 * @param fastify
 * @param options
 */
export async function routes(fastify: FastifyInstance, options: any) {
    fastify.get<{
        Querystring: IGraphsQueryArgs
    }>(PATH, {
        schema: {querystring: graphsQueryArgs},
        /*
        preValidation: (request, reply, done) => {
            done(request.query.invariants.length != request.query.invariant_values.length
                ? new Error("invariants and invariant_values must be the same size.") : undefined)
            done(!ACCEPTABLE_INVARIANTS.includes(request.query.invariant)
                ? new Error("Please provide an invariant in " + ACCEPTABLE_INVARIANTS.join(", ") + ".")
                : undefined) // only accept valid invariants
        }*/
    }, async (request, reply) => {

        const query_params = [request.query.max_graph_size]

        fastify.log.debug(request.query)

        const fixed_arguments: InvariantValues = {}
        ACCEPTABLE_INVARIANTS.forEach((invariant) => {
            // @ts-ignore
            if (request.query[invariant]) {
                // @ts-ignore
                fixed_arguments[invariant] = request.query[invariant]
            }
        })


        console.debug(fixed_arguments)


        //const query = format(raw_query, ...request.query.invariants) // TODO use format instead of building by hand ?
        const query = build_graph_query(request.query.invariants, fixed_arguments)

        console.debug("Query: " + query)

        await phoeg.cached_query(query, query_params, async (error, result) => {
            if (error) {
                fastify.log.error(error)
                reply.code(400).send({})
            } else {
                //fastify.log.info(result)
                const results: IGraphsQueryResults = result.rows[0].json_build_object
                reply.send(results)
            }
        })
    })
}
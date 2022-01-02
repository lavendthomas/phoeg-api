import {FastifyInstance} from "fastify";
import phoeg from "../db/phoeg";
import {Static, StaticArray, TLiteral, TUnion, Type, TypeBuilder} from '@sinclair/typebox';
import {type} from "os";

const ACCEPTABLE_INVARIANTS = ["av_col", "num_col", "num_edges", "chromatic_number"] as const
type Invariant = typeof ACCEPTABLE_INVARIANTS[number]

type InvariantValues = {
    [inv in Invariant]?: number
}


const ACCEPTABLE_NB_VAL = Array.from(Array(10).keys())

export const phoegDefinitions = Type.Namespace({
    invariant: Type.Union(ACCEPTABLE_INVARIANTS.map(i => Type.Literal(i)))
}, {$id: 'Phoeg'})

export const graphsQueryArgs = Type.Object({
    max_graph_size: Type.Integer({
        minimum: 1, maximum: 10, default: 8,
        description: "Maximum size of the graphs."}),
    invariants: Type.Array(Type.String({pattern: ACCEPTABLE_INVARIANTS.join("|"), examples: ACCEPTABLE_INVARIANTS, default: ACCEPTABLE_INVARIANTS[0]}),
    {minItems: 2, description: "Name of each invariant to analyse. The first two will be used on the axis. Acceptable values are: " + ACCEPTABLE_INVARIANTS.join(", ") + "."}),

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

function part1_points(): string {
    return `WITH data AS (
SELECT
    COUNT(*) as mult,\n`
}

function part1_polytope(): string {
    return `WITH data AS (
SELECT\n`
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

function part4_points(): string {
    return `
)
SELECT json_build_object(\n`
}

function part4_polytope(invariant1: string, invariant2: string): string {
    return `
),
polytable as (
    -- Build the convex hull and output it as json
    SELECT st_asgeojson(ST_ConvexHull(ST_Collect(ST_Point(${invariant1}, ${invariant2})))) as poly
    FROM data
),
points as (
    -- We split the list of points of the convex hull as a table with a row per
    -- point of the convex hull. The function json_array_elements splits a json
    -- array into rows.
    select poly::json->'type' as tp, json_array_elements(
        -- Since the arrays are different based on the type of convex hull
        -- (point, line or polygon), we format it so we have an array of points
        -- (which are also arrays)
        -- thing::json->'key' casts 'thing' into json and extracts the value
        -- for the key. Also works on arrays with indices.
        case (poly::json->'type')::text
            -- If we have a point, make it an array containing a single point.
        when '"Point"' then json_build_array(poly::json->'coordinates')
            -- A line is already an array of points.
        when '"LineString"' then poly::json->'coordinates'
            -- A polygon is an array containing an array of points so we
            -- extract this array.
        when '"Polygon"' then (poly::json->'coordinates')::json->0
        end
    ) as xy
    from polytable
),
formatted as (
    -- Format each row as a json dict with keys x and y
    select tp::text as tp, json_build_object('x', xy::json->0, 'y', xy::json->1) as xy
    from points
)
select json_build_object('type', tp::json, 'coordinates', (
        case tp::text
        when '"Point"' then json_agg(xy)->0
        else json_agg(xy)
        end
    ))
from formatted
group by tp;
`
}

function part5(): string {
    return `)
FROM data;`
}

function part5_polytope(invariants: string[]): string {
    return `)
SELECT ST_AsText(ST_ConvexHull(ST_Collect(ST_Point(${invariants.join(",")})))) FROM data;`
}

function build_graph_query(invariants: StaticArray<TUnion<TLiteral<string>[]>>, values: InvariantValues): string {
    let raw_query = part1()

    invariants.forEach((invariant, index) => {
        raw_query += `    ${invariant}.val AS ${invariant}`
        if (index < invariants.length-1) {
            raw_query += ","
        }
        raw_query += "\n"
    })

    raw_query += part2()

    invariants.forEach((invariant, index) => {
        raw_query += `    JOIN ${invariant} ${invariant} USING(signature)\n`
    })

    raw_query += part3()

    // Filter
    console.log(values)
    ACCEPTABLE_INVARIANTS.forEach((invariant) => {
        if (values[invariant]) { // Why ! ?
            if (Number.isInteger(values[invariant])) {
                raw_query += `    AND ${invariant}.val = ${values[invariant]}\n`
            } else { // Is a number but not an integer -> float
                raw_query += `    AND ABS(${invariant}.val - ${values[invariant]}) < 0.00001\n`
            }
        }
    })


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

function build_points_query(invariants: StaticArray<TUnion<TLiteral<string>[]>>, values: InvariantValues): string {
    let raw_query = part1_points()

    invariants.forEach((invariant, index) => {
        raw_query += `    ${invariant}.val AS ${invariant}`
        if (index < invariants.length-1) {
            raw_query += ","
        }
        raw_query += "\n"
    })

    raw_query += part2()

    invariants.forEach((invariant, index) => {
        raw_query += `    JOIN ${invariant} ${invariant} USING(signature)\n`
    })

    raw_query += part3()

    raw_query += '    GROUP BY '
    raw_query += invariants.join(", ") // Order according to invariant order
    raw_query += "\n"

    raw_query += '    ORDER BY '
    raw_query += invariants.join(", ") // Order according to invariant order

    raw_query += part4_points()

    invariants.concat(["mult"]).forEach((invariant, index) => {
        raw_query += `    '${invariant}',array_to_json(array_agg(${invariant}))`
        if (index < invariants.length) {
            // Add , except for the last invariant
            raw_query += ","
        }
        raw_query += "\n"
    })

    raw_query += part5()
    return raw_query
}

function build_polytope_query(invariants: StaticArray<TUnion<TLiteral<string>[]>>, values: InvariantValues): string {
    let raw_query = part1_polytope()

    invariants.forEach((invariant, index) => {
        raw_query += `    ${invariant}.val AS ${invariant}`
        if (index < invariants.length-1) {
            raw_query += ","
        }
        raw_query += "\n"
    })

    raw_query += part2()

    invariants.forEach((invariant, index) => {
        raw_query += `    JOIN ${invariant} ${invariant} USING(signature)\n`
    })

    raw_query += part3()

    raw_query += '    GROUP BY '
    raw_query += invariants.join(", ") // Order according to invariant order
    raw_query += '\n'


    raw_query += '    ORDER BY '
    raw_query += invariants.join(", ") // Order according to invariant order

    raw_query += part4_polytope(invariants[0], invariants[1])
    /*
    raw_query += part4()

    invariants.concat(["mult"]).forEach((invariant, index) => {
        raw_query += `    '${invariant}',array_to_json(array_agg(${invariant}))`
        if (index < invariants.length-1) {
            // Add , except for the last invariant
            raw_query += ","
        }
        raw_query += "\n"
    })
    */

    // raw_query += part5_polytope(invariants)
    return raw_query
}

/**
 * Execute a request to the phoeg database
 * WARNING: unsafe
 * @param fastify
 * @param options
 */
export async function routes(fastify: FastifyInstance, options: any) {
    fastify.addSchema(phoegDefinitions)
    fastify.get<{
        Querystring: IGraphsQueryArgs
    }>("/", {
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


        //const query = format(raw_query, ...request.query.invariants) // TODO use format instead of building by hand ?
        const query = build_graph_query(request.query.invariants, fixed_arguments)

        console.debug("Query: " + query)

        await phoeg.cached_query(query, query_params, async (error, result) => {
            if (error) {
                fastify.log.error(error)
                reply.code(400).send({})
            } else {
                const results: IGraphsQueryResults = result.rows[0].json_build_object
                reply.send(results)
            }
        })
    })



    fastify.get<{
        Querystring: IGraphsQueryArgs
    }>("/points", {
        schema: {querystring: graphsQueryArgs}
    }, async (request, reply) => {
        const query_params = [request.query.max_graph_size]

        const query = build_points_query(request.query.invariants, {})

        console.debug("Query: " + query)

        await phoeg.cached_query(query, query_params, async (error, result) => {
            if (error) {
                fastify.log.error(error)
                reply.code(400).send({})
            } else {
                const results: IGraphsQueryResults = result.rows[0].json_build_object
                reply.send(results)
            }
        })

    })


    fastify.get<{
        Querystring: IGraphsQueryArgs
    }>("/polytope", {
        schema: {querystring: graphsQueryArgs}
    }, async (request, reply) => {
        const query_params = [request.query.max_graph_size]

        const query = build_polytope_query(request.query.invariants, {})

        console.debug("Query: " + query)

        await phoeg.cached_query(query, query_params, async (error, result) => {
            if (error) {
                fastify.log.error(error)
                reply.code(400).send({})
            } else {
                const results: IGraphsQueryResults = result.rows[0].json_build_object
                console.debug(results)
                reply.send(results)
            }
        })
    })
}
import {FastifyInstance} from "fastify";
import phoeg from "../db/phoeg";
import {Static, StaticArray, TLiteral, TNumber, TObject, TOptional, TString, TUnion, Type} from '@sinclair/typebox';

let ACCEPTABLE_INVARIANTS: string[] = []

type Invariant = typeof ACCEPTABLE_INVARIANTS[number]


type InvariantConstraint = {
    name: Invariant
    minimum_bound: number
    maximum_bound: number
}

type InvariantConstraints = InvariantConstraint[]

export async function allInvariants(): Promise<string[]> {
    // Cache the result in a variable
    return fetchInvariants().then((i) => ACCEPTABLE_INVARIANTS = i);
}

export async function fetchInvariants(): Promise<string[]> {
    let answer: string[] = []
    await phoeg.cached_query("SELECT tablename FROM tables WHERE datatype = 'integer' or datatype = 'double precision' or datatype = 'real';", [], async (error, result) => {
        answer = result.rows.map((row) => row.tablename).sort()
    })
    return answer
}


/**
 * Return a JSON Schema definition
 */
export function phoegDefinitions(): any {
    return {
        "definitions": {
            "invariants": {
                "type": "string",
                "enum": ACCEPTABLE_INVARIANTS
            }
        }
    }
}

export function graphQueryArgsFn() {
    return {
        "type": "object",
        "title": "Phoeg Request",
        "properties": {
            "order": {
                "minimum": 1,
                "maximum": 10,
                "default": 8,
                "title": "Graph Order",
                "description": "This setting affects the number of vertices of the graphs that are displayed in the polytope.",
                "type": "integer"
            },
            "x_invariant": {
                "title": "Invariant on the X axis",
                "description": "The invariant to use for the x-axis.",
                "type": "string",
                "enum": ACCEPTABLE_INVARIANTS,
                "default": "av_col"
            },
            "y_invariant": {
                "title": "Invariant on the Y axis",
                "description": "The invariant to use for the y-axis.",
                "type": "string",
                "enum": ACCEPTABLE_INVARIANTS,
                "default": "num_col"
            },
            "add_colouring": {
                "title": "Add colouring?",
                "description": "The invariant selected in the following box will be used to colour the points in the graph.",
                "$ref": "#/definitions/colour"
            },
            "constraints": {
                "title": "Constraints",
                "description": "Add additional constraints to the query.",
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "description": "The invariant to use for the constraint.",
                            "title": "Invariant",
                            "type": "string",
                            "enum": ACCEPTABLE_INVARIANTS,
                        },
                        "minimum_bound": {
                            "title": "Minimum Bound",
                            "type": "number"
                        },
                        "maximum_bound": {
                            "title": "Maximum Bound",
                            "type": "number"
                        }
                    }
                }
            }
        },
        "required": ["order", "x_invariant", "y_invariant", "add_colouring"],
        "definitions":  {
            "colour": {
                "title": "colour",
                "type": "object",
                "properties": {
                    "Add colouring?": {
                        "type": "string",
                        "enum": [
                            "No",
                            "Yes",
                        ],
                        "default": "No"
                    }
                },
                "required": [
                    "Add colouring?"
                ],
                "dependencies": {
                    "Add colouring?": {
                        "oneOf": [
                            {
                                "properties": {
                                    "Add colouring?": {
                                        "enum": [
                                            "No"
                                        ]
                                    }
                                }
                            },
                            {
                                "properties": {
                                    "Add colouring?": {
                                        "enum": [
                                            "Yes"
                                        ]
                                    },
                                    "The invariant to use for the colouring.": {
                                        "type": "string",
                                        "enum": ACCEPTABLE_INVARIANTS,
                                        "default": ACCEPTABLE_INVARIANTS[2]
                                    }
                                },
                                "required": [
                                    "The invariant to use for the colouring."
                                ]
                            },
                        ]
                    }
                }
            }
        }
    }
}

export const polytopeQueryArgs = Type.Object({
    order: Type.Integer({
        minimum: 1, maximum: 10, default: 8,
        description: "Maximum size of the graphs."}),
    x_invariant: Type.String({
        pattern: ACCEPTABLE_INVARIANTS.join("|"),
        examples: ACCEPTABLE_INVARIANTS,
        title: "X Invariant Name"
    }),
    y_invariant: Type.String({
        pattern: ACCEPTABLE_INVARIANTS.join("|"),
        examples: ACCEPTABLE_INVARIANTS,
        title: "Y Invariant Name"
    }),
    colour: Type.Optional(Type.String({
        pattern: ACCEPTABLE_INVARIANTS.join("|"),
        examples: ACCEPTABLE_INVARIANTS,
        title: "Colour Invariant Name"
    })),
    constraints: Type.Optional(Type.Array(Type.Object({
        name: Type.String({
            pattern: ACCEPTABLE_INVARIANTS.join("|"),
            examples: ACCEPTABLE_INVARIANTS,
            title: "Invariant Name"
        }),
        minimum_bound: Type.Optional(Type.Number({title: "Minimum Bound"})),
        maximum_bound: Type.Optional(Type.Number({title: "Maximum Bound"})),
    }), {description: "Name of each invariant to analyse. The first two will be used on the axis. Acceptable values are: " + ACCEPTABLE_INVARIANTS.join(", ") + "."})),
})

export const graphsQueryArgs = Type.Object({
    order: Type.Integer({
        minimum: 1, maximum: 10, default: 8,
        description: "Maximum size of the graphs."}),
    invariants: Type.Array(Type.Object({
        name: Type.String({
            pattern: ACCEPTABLE_INVARIANTS.join("|"),
            examples: ACCEPTABLE_INVARIANTS,
            title: "Invariant Name"
        }),
        minimum_bound: Type.Optional(Type.Number({title: "Minimum Bound"})),
        maximum_bound: Type.Optional(Type.Number({title: "Maximum Bound"})),
    }), {description: "Name of each invariant to analyse. The first two will be used on the axis. Acceptable values are: " + ACCEPTABLE_INVARIANTS.join(", ") + "."})
})

export type IGraphsQueryArgs = Static<typeof graphsQueryArgs>;
export type IPolytopeQueryArgs = Static<typeof polytopeQueryArgs>;


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

function build_graph_query(invariants: StaticArray<TUnion<TLiteral<string>[]>>, constraints: InvariantConstraints): string {
    let raw_query = part1()

    const all_invariant_names = [...new Set(invariants.concat(constraints.map((c) => c.name)))] // Unique on the name of invariants
    all_invariant_names.forEach((invariant, index) => {
        raw_query += `    ${invariant}.val AS ${invariant}`
        if (index < invariants.length-1) {
            raw_query += ","
        }
        raw_query += "\n"
    })

    raw_query += `    FROM num_vertices n\n`

    invariants.forEach((invariant, index) => {
        raw_query += `    JOIN ${invariant} ${invariant} USING(signature)\n`
    })

    raw_query += part3()

    // Filter
    constraints.forEach((cst) => {
        raw_query += `    AND ${cst.name}.val > ${cst.minimum_bound}\n`
        raw_query += `    AND ${cst.name}.val < ${cst.maximum_bound}\n`
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

function build_points_query(invariants: StaticArray<TUnion<TLiteral<string>[]>>, bounds?: StaticArray<TObject<{name: TString, minimum_bound: TOptional<TNumber>, maximum_bound: TOptional<TNumber>}>>): string {
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

    // Filter
    if (bounds) bounds.forEach((bound: any) => {
        if (bound.minimum_bound) {
            raw_query += `    AND ${bound.name}.val >= ${bound.minimum_bound}\n`
        }
        if (bound.maximum_bound) {
            raw_query += `    AND ${bound.name}.val <= ${bound.maximum_bound}\n`
        }
    })

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

function build_polytope_query(invariants: StaticArray<TUnion<TLiteral<string>[]>>, bounds?: StaticArray<TObject<{name: TString, minimum_bound: TOptional<TNumber>, maximum_bound: TOptional<TNumber>}>>): string {
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

    // Filter
    if (bounds) bounds.forEach((bound: any) => {
        if (bound.minimum_bound) {
            raw_query += `    AND ${bound.name}.val >= ${bound.minimum_bound}\n`
        }
        if (bound.maximum_bound) {
            raw_query += `    AND ${bound.name}.val <= ${bound.maximum_bound}\n`
        }
    })

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
    //fastify.addSchema(phoegDefinitions())
    fastify.get<{
        Querystring: IGraphsQueryArgs
    }>("/", {
        schema: {querystring: graphsQueryArgs},
    }, async (request, reply) => {

        const query_params = [request.query.order]

        // @ts-ignore
        const constraints: InvariantConstraints = request.query.constraints

        fastify.log.debug(constraints)

        const query = build_graph_query(request.query.invariants.map((e) => e.name), constraints)

        console.debug("Query: " + query)

        await phoeg.cached_query(query, query_params, async (error, result) => {
            if (error) {
                fastify.log.error(error)
                reply.code(400).send({})
            } else {
                const results: IGraphsQueryResults = result.rows[0] ? result.rows[0].json_build_object : {}
                reply.send(results)
            }
        })
    })



    fastify.get<{
        Querystring: IPolytopeQueryArgs
    }>("/points", {
        schema: {querystring: polytopeQueryArgs}
    }, async (request, reply) => {
        const query_params = [request.query.order]

        const invariants = [request.query.x_invariant, request.query.y_invariant];
        if (request.query.colour) invariants.push(request.query.colour)
        if (request.query.constraints) invariants.concat(request.query.constraints.map(e => e.name))

        const query = build_points_query(invariants, request.query.constraints)

        console.debug("Query: " + query)

        await phoeg.cached_query(query, query_params, async (error, result) => {
            if (error) {
                fastify.log.error(error)
                reply.code(400).send({})
            } else {
                const results: IGraphsQueryResults = result.rows[0] ? result.rows[0].json_build_object : {}
                reply.send(results)
            }
        })

    })


    fastify.get<{
        Querystring: IPolytopeQueryArgs
    }>("/polytope", {
        schema: {querystring: polytopeQueryArgs}
    }, async (request, reply) => {
        const query_params = [request.query.order]

        const invariants = [request.query.x_invariant, request.query.y_invariant];
        if (request.query.colour) invariants.push(request.query.colour)
        if (request.query.constraints) invariants.concat(request.query.constraints.map(e => e.name))

        const query = build_polytope_query(invariants, request.query.constraints)

        console.debug("Query: " + query)

        await phoeg.cached_query(query, query_params, async (error, result) => {
            if (error) {
                fastify.log.error(error)
                reply.code(400).send({})
            } else {
                const results: IGraphsQueryResults = result.rows[0] ? result.rows[0].json_build_object : {}
                console.debug(results)
                reply.send(results)
            }
        })
    })
}
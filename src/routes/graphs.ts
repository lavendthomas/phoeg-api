import {FastifyInstance} from "fastify";
import phoeg from "../../db/phoeg";
import format from "pg-format";
import {get_default_query} from "../../queries/DefaultQueries";
import {Static, Type} from '@sinclair/typebox';

const ACCEPTABLE_INVARIANTS = ["av_col", "num_col"]
const ACCEPTABLE_NB_VAL = Array.from(Array(10).keys())

export const graphsQueryArgs = Type.Object({
    nb_val: Type.Union(ACCEPTABLE_NB_VAL.map(nb => Type.Literal(nb)),
        {default: 1, description: "Maximum size of the graphs."}),
    invariant: Type.Union(ACCEPTABLE_INVARIANTS.map(i => Type.Literal(i)),
        {default: ACCEPTABLE_INVARIANTS[0], description: "Type of invariant to study."}),
    m: Type.Optional(Type.Number(
        {default: 1, description: "description"})),
    invariant_value: Type.Optional(Type.Number(
        {default: 0, minimum: 0, description: "Value of the selected invariant."})),
    chi: Type.Optional(Type.Number(
        {default: 0, minimum: 0, description: "Value of chi"}))
})

export type IGraphsQueryArgs = Static<typeof graphsQueryArgs>;


interface IGraphsQueryResults {
    sig: string[],
    m: number[],
    invariant: number[],
    chi: number[]
}

/**
 * Execute a request to the phoeg database
 * WARNING: unsafe
 * @param fastify
 * @param options
 */
export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.get<{
        Querystring: IGraphsQueryArgs
    }>('/graphs', {
        schema: {querystring: graphsQueryArgs},
        preValidation: (request, reply, done) => {
            done(!request.query.nb_val ? new Error("Please provide a nb_val.") : undefined)
            done(!request.query.invariant ? new Error("Please provide an invariant.") : undefined)

            done(!ACCEPTABLE_INVARIANTS.includes(request.query.invariant)
                ? new Error("Please provide an invariant in " + ACCEPTABLE_INVARIANTS.join(", ") + ".")
                : undefined) // only accept valid invariants
        }
    }, async (request, reply) => {

        const query_params = [request.query.nb_val]

        let raw_query = get_default_query("graphs-json-transpose-1")
        let cnt = 2
        if (request.query.m) {
            raw_query += `AND m.val = $${cnt++}\n`
            query_params.push(request.query.m)
        }
        if (request.query.invariant_value) {
            raw_query += `AND invariant.val = $${cnt++}\n`
            query_params.push(request.query.invariant_value)
        }
        if (request.query.chi) {
            raw_query += `AND chi.val = $${cnt++}\n`
            query_params.push(request.query.chi)
        }
        raw_query += get_default_query("graphs-json-transpose-2")
        const query = format(raw_query, request.query.invariant)

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
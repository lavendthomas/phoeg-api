import {FastifyInstance} from "fastify";
import phoeg from "../db/phoeg";
import format from "pg-format";
import {get_default_query} from "../queries/DefaultQueries";

export interface IGraphsQueryArgs {
    nb_val: number,
    invariant: string,
    m?: number,
    invariant_value?: number
    chi?: number
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
    }>('/graphs', async (request, reply) => {

        const acceptable_invariants = ["av_col" , "num_col"]
        const query_params = [request.query.nb_val]

        if (!request.query.nb_val) {
            reply.code(400).send({message: "Please provide a nb_val."})
        }

        if (!request.query.invariant) {
            reply.code(400).send({message: "Please provide an invariant."})
        }
        if (!acceptable_invariants.includes(request.query.invariant)) {
            reply.code(400).send({message: "Please provide an invariant in " + acceptable_invariants.join(", ") + "."})
        }

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
                reply.send(result.rows[0].json_build_object)
            }

        })

    })
}
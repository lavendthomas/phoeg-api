import { FastifyInstance } from "fastify";
import { Static, Type } from "@sinclair/typebox";
import phoeg from "../db/phoeg";

export enum InvariantTypes {
  any = "any",
  number = "number",
  integer = "integer",
  real = "real",
  double = "double",
  boolean = "boolean",
  rational = "rational",
}

export class Invariant {
  tablename: string = "";
  datatype: InvariantTypes = InvariantTypes.any;
  name: string = "";
  description?: string = "";

  constructor(
    tablename: string,
    datatype: string,
    name: string,
    description?: string
  ) {
    this.tablename = tablename;
    switch (datatype) {
      case "integer":
        this.datatype = InvariantTypes.integer;
        break;
      case "real":
        this.datatype = InvariantTypes.real;
        break;
      case "double precision":
        this.datatype = InvariantTypes.double;
        break;
      case "boolean":
        this.datatype = InvariantTypes.boolean;
        break;
      case "rational":
        this.datatype = InvariantTypes.rational;
        break;
    }
    this.name = name;
    this.description = description;
  }
}

export const InvariantsQueryArgs = Type.Object({
  type: Type.Optional(Type.String()),
});

export type IInvariantsQueryArgs = Static<typeof InvariantsQueryArgs>;

export let ACCEPTABLE_INVARIANTS: string[] = [];

export let INVARIANTS: Invariant[] = [];

export async function allInvariants(
  type: InvariantTypes = InvariantTypes.any
): Promise<Invariant[]> {
  // Cache the result in a variable
  return fetchInvariants(type).then((i: Invariant[]) => {
    const allInvariants = i.map((invariant: Invariant) => invariant.tablename);
    if (type == InvariantTypes.any) {
      ACCEPTABLE_INVARIANTS = allInvariants.map(
        (invariant: any) => invariant.tablename
      );
      INVARIANTS = i;
    }
    return i;
  });
}

export async function fetchInvariants(
  type: InvariantTypes
): Promise<Invariant[]> {
  let answer: Invariant[] = [];
  let query = "SELECT tablename, datatype, name, description FROM tables ";
  switch (type) {
    case InvariantTypes.number:
      query +=
        "WHERE datatype = 'integer' or datatype = 'double precision' or datatype = 'real'";
      break;
    case InvariantTypes.integer:
      query += "WHERE datatype = 'integer'";
      break;
    case InvariantTypes.real:
      query += "WHERE datatype = 'real'";
      break;
    case InvariantTypes.double:
      query += "WHERE datatype = 'double precision'";
      break;
    case InvariantTypes.boolean:
      query += "WHERE datatype = 'boolean'";
      break;
    case InvariantTypes.rational:
      query += "WHERE datatype = 'rational'";
      break;
  }
  query += ";";
  await phoeg.cached_query(query, [], async (error, result) => {
    answer = result.rows
      .map(
        (row) =>
          new Invariant(row.tablename, row.datatype, row.name, row.description)
      )
      .sort((a, b) => {
        if (a.tablename < b.tablename) return -1;
        if (a.tablename > b.tablename) return 1;
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
  });
  return answer;
}

export async function routes(fastify: FastifyInstance, options: any) {
  fastify.get<{
    Querystring: IInvariantsQueryArgs;
  }>("/invariants", fastify, async (request, reply) => {
    let type: InvariantTypes;
    switch (request.query.type) {
      case null:
        type = InvariantTypes.number;
        break; // by default, give only numbers
      case "any":
        type = InvariantTypes.any;
        break;
      case "numbers":
        type = InvariantTypes.number;
        break;
      case "reals":
        type = InvariantTypes.real;
        break;
      case "doubles":
        type = InvariantTypes.double;
        break;
      case "booleans":
        type = InvariantTypes.boolean;
        break;
      case "rationals":
        type = InvariantTypes.rational;
        break;
      default:
        reply.code(400).send({ reason: "Please enter a valid type" });
        return;
    }
    fastify.log.info(type);
    reply.code(200).send(await allInvariants(type));
  });
}

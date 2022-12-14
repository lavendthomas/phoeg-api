import { StaticArray, TLiteral, TNumber, TObject, TOptional, TString, TUnion } from "@sinclair/typebox";
import assert from "assert";
import { PhoegLangResult } from "../../phoeglang/phoeglang";
import { part_select, part_from, part_where_val, condition, part_compute_polytope } from "./utils";

export function build_polytope_query(
    invariants: StaticArray<TUnion<TLiteral<string>[]>>,
    bounds?: StaticArray<
      TObject<{
        name: TString;
        minimum_bound: TOptional<TNumber>;
        maximum_bound: TOptional<TNumber>;
      }>
    >,
    constraints?: PhoegLangResult
  ): string {
    let raw_query = part_select();
  
    invariants.forEach((invariant, index) => {
      raw_query += `    ${invariant}.val AS ${invariant}`;
      if (index < invariants.length - 1) {
        raw_query += ",";
      }
      raw_query += "\n";
    });
  
    // Make sure that all invariants exist in the constraints
    constraints?.invariants.forEach((invariant) => {
      assert(
        invariants.includes(invariant),
        `Invariant ${invariant} not found in the invariants`
      );
    });
  
    raw_query += part_from();
  
    const all_invariant_names = bounds
      ? [...new Set(invariants.concat(bounds.map((c) => c.name)).concat(constraints?.invariants || []))]
      : invariants; // Unique on the name of invariants
  
    all_invariant_names.forEach((invariant, index) => {
      raw_query += `    JOIN ${invariant} ${invariant} USING(signature)\n`;
    });
  
    raw_query += part_where_val();
  
    // Filter
    if (bounds)
      bounds.forEach((bound: any) => {
        raw_query += condition(
          bound.name,
          bound.minimum_bound,
          bound.maximum_bound
        );
      });
  
    // Filter advanced constraints
    if (constraints)
      raw_query += `    AND (${constraints.constraints})\n`;
  
    raw_query += "    GROUP BY ";
    raw_query += invariants.join(", "); // Order according to invariant order
    raw_query += "\n";
  
    raw_query += "    ORDER BY ";
    raw_query += invariants.join(", "); // Order according to invariant order
  
    raw_query += part_compute_polytope(invariants[0], invariants[1]);
  
    return raw_query;
  }
import {
  StaticArray,
  TLiteral,
  TNumber,
  TObject,
  TOptional,
  TString,
  TUnion,
} from "@sinclair/typebox";
import { PhoegLangResult } from "../../phoeglang/phoeglang";
import { build_polytope_or_point_query } from "./polytope";
import {
  part_select_count,
  part_json_build_object,
  part_from_data,
  part_invariants_to_json,
} from "./utils";

export function build_points_query(
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
  return build_polytope_or_point_query(
    {
      select_function: part_select_count,
      end_query_function: part_end_query,
    },
    invariants,
    bounds,
    constraints
  );
}

function part_end_query(invariants: string[]): string {
  return (
    part_json_build_object() +
    part_invariants_to_json(invariants) +
    part_from_data()
  );
}

// export function build_points_query_old(
//   invariants: StaticArray<TUnion<TLiteral<string>[]>>,
//   bounds?: StaticArray<
//     TObject<{
//       name: TString;
//       minimum_bound: TOptional<TNumber>;
//       maximum_bound: TOptional<TNumber>;
//     }>
//   >,
//   constraints?: PhoegLangResult
// ): string {
//   let raw_query = part_select_count();

//   invariants.forEach((invariant, index) => {
//     raw_query += `    ${invariant}.val AS ${invariant}`;
//     if (index < invariants.length - 1) {
//       raw_query += ",";
//     }
//     raw_query += "\n";
//   });

//   // Make sure that all invariants exist in the constraints
//   constraints?.invariants.forEach((invariant) => {
//     assert(
//       invariants.includes(invariant),
//       `Invariant ${invariant} not found in the invariants`
//     );
//   });

//   raw_query += part_from();

//   const all_form_invariants = bounds
//   ? [...new Set(invariants.concat(bounds.map((c) => c.name)).concat(constraints?.invariants || []))]
//   : invariants; // Unique on the name of invariants

// const all_phoeglang_invariants = constraints?.invariants || [];

// const all_invariant_names = [...new Set(all_form_invariants.concat(all_phoeglang_invariants))];

//   all_invariant_names.forEach((invariant) => {
//     raw_query += `    JOIN ${invariant} ${invariant} USING(signature)\n`;
//   });

//   raw_query += part_where_val();

//   // Filter simple constraints
//   if (bounds)
//     bounds.forEach((bound) => {
//       raw_query += condition(
//         bound.name,
//         bound.minimum_bound,
//         bound.maximum_bound
//       );
//     });

//   // Filter advanced constraints
//   if (constraints)
//     raw_query += `    AND (${constraints.constraints})\n`;

//   raw_query += "    GROUP BY ";
//   raw_query += invariants.join(", "); // Order according to invariant order
//   raw_query += "\n";

//   raw_query += "    ORDER BY ";
//   raw_query += invariants.join(", "); // Order according to invariant order

//   raw_query += part_end_query(invariants);
//   return raw_query;
// }

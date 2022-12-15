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

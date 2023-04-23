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
import { Coordinate, MinMax, PointResult } from "../interfaces";
import { build_polytope_or_point_query } from "./polytope";
import {
  part_select_count,
  part_json_build_object,
  part_from_data,
  part_invariants_to_json,
} from "./utils";
import NumRat from "./autoconjectures/numrat";

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

export function update_points(result: any): PointResult {
  const keys = Object.keys(result);
  // No data found for the given query so stop here
  if (
    result[keys[0]] === null ||
    result[keys[0]].length === 0 ||
    result[keys[1]] === null ||
    result[keys[1]].length === 0
  ) {
    return {
      coordinates: [],
      minMax: undefined,
      sorted: undefined,
    };
  }

  const coordinates = result_to_coordinates(result);
  const minMax = computeMinMax(coordinates);
  const sorted = sort_by_color(coordinates);
  return {
    coordinates: coordinates,
    minMax: minMax,
    sorted: sorted,
  };
}

const result_to_coordinates = (results: any): Array<Coordinate> => {
  const keys: Array<string> = Object.keys(results);
  let coordinates: Array<Coordinate> = [];

  if (results[keys[0]].length === 0) {
    return coordinates;
  }

  for (let i = 0; i < results[keys[0]].length; i++) {
    coordinates.push({
      x: results[keys[0]][i],
      y: results[keys[1]][i],
      color: results[keys[2]][i],
      mult: results[keys[keys.length === 4 ? 3 : 2]][i],
    });
  }
  return coordinates;
};

const computeMinMax = (coordinates: Array<Coordinate>): MinMax => {
  let minX = coordinates[0].x;
  let maxX = coordinates[0].x;
  let minY = coordinates[0].y;
  let maxY = coordinates[0].y;
  let minColor = coordinates[0].color;
  let maxColor = coordinates[0].color;

  for (let i = 1; i < coordinates.length; i++) {
    if (coordinates[i].x < minX) {
      minX = coordinates[i].x;
    } else if (coordinates[i].x > maxX) {
      maxX = coordinates[i].x;
    }

    if (coordinates[i].y < minY) {
      minY = coordinates[i].y;
    } else if (coordinates[i].y > maxY) {
      maxY = coordinates[i].y;
    }

    if (coordinates[i].color < minColor) {
      minColor = coordinates[i].color;
    } else if (coordinates[i].color > maxColor) {
      maxColor = coordinates[i].color;
    }
  }
  return {
    minX: new NumRat(minX),
    maxX: new NumRat(maxX),
    minY: new NumRat(minY),
    maxY: new NumRat(maxY),
    minColor: minColor,
    maxColor: maxColor,
  };
};

const sort_by_color = (
  coordinates: Array<Coordinate>
): { [key: number]: Array<Coordinate> } => {
  let colors: Array<number> = [];
  let sortedByColor: { [key: number]: Array<Coordinate> } = {};
  for (let i = 0; i < coordinates.length; i++) {
    if (coordinates[i].color !== undefined) {
      const colorValue = parse_int(coordinates[i].color);
      coordinates[i].color = colorValue;
      if (!colors.includes(colorValue)) {
        colors.push(colorValue);
        sortedByColor[colorValue] = [];
      }
      sortedByColor[colorValue].push(coordinates[i]);
    }
  }
  return sortedByColor;
};

const parse_int = (color: string | number | boolean): number => {
  if (typeof color === "string") {
    return parseInt(color);
  } else if (typeof color === "boolean") {
    return color ? 1 : 0;
  } else {
    return color;
  }
};

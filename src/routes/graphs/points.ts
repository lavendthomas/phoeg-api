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

export function update_points(result: any, order?: number): PointResult {
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
    minX: minX,
    maxX: maxX,
    minY: minY,
    maxY: maxY,
    minColor: minColor,
    maxColor: maxColor,
  };
};

// const compute_all_clusters = (
//   coordinates: Array<Coordinate>
// ): {
//   clustersList: Array<number>;
//   allClusters: { [key: number]: Array<Array<Coordinate>> };
// } => {
//   const { colors, sortedByColor } = sort_by_color(coordinates);
//   let currentNbCluster = 2;
//   let currentSizeCluster = Math.floor(colors.length / currentNbCluster);
//   let viewedNb = [1];
//   let result: { [key: number]: Array<Array<Coordinate>> } = {
//     1: [coordinates],
//   };
//   while (currentNbCluster <= colors.length) {
//     let currentClusters = regroupPointsInCluster(
//       currentSizeCluster,
//       colors,
//       sortedByColor
//     );
//     if (!viewedNb.includes(currentClusters.length)) {
//       viewedNb.push(currentClusters.length);
//       result[currentClusters.length] = currentClusters;
//     }
//     currentNbCluster += 1;
//     currentSizeCluster = Math.ceil(colors.length / currentNbCluster);
//   }
//   return {
//     clustersList: viewedNb.sort((a, b) => a - b),
//     allClusters: result,
//   };
// };

// export const regroupPointsInCluster = (
//   sizeCluster: number,
//   colors: Array<number>,
//   sortedByColor: { [key: number]: Array<Coordinate> }
// ) => {
//   let result = [];
//   let start = 0;
//   let end = sizeCluster;
//   while (end <= colors.length - sizeCluster) {
//     let temp = [];
//     while (start < end) {
//       temp.push(...sortedByColor[colors[start]]);
//       start += 1;
//     }
//     result.push(temp);
//     end += sizeCluster;
//   }
//   let temp = [];
//   while (start < colors.length) {
//     temp.push(...sortedByColor[colors[start]]);
//     start += 1;
//   }
//   result.push(temp);
//   return result;
// };

const sort_by_color = (
  coordinates: Array<Coordinate>
): { [key: number]: Array<Coordinate> } => {
  let colors: Array<number> = [];
  let sortedByColor: { [key: number]: Array<Coordinate> } = {};
  for (let i = 0; i < coordinates.length; i++) {
    if (coordinates[i].color !== undefined) {
      const colorValue = parse_int(coordinates[i].color);
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

import {
  Directions,
  initialDirections,
  initialMinMax,
  MinMax,
  Point,
} from "../../interfaces";

export const compute_concave_hull = (
  results: any
): { minMax: MinMax; concave: Directions } => {
  const keys = Object.keys(results);
  if (results[keys[0]] === null || results[keys[1]] === null) {
    return {
      minMax: initialMinMax,
      concave: initialDirections,
    };
  }
  const coordinates = result_to_coordinates(results);
  if (coordinates.length === 0) {
    return {
      minMax: initialMinMax,
      concave: initialDirections,
    };
  }
  const minMax = computeMinMax(coordinates);
  return {
    minMax: minMax,
    concave: sort_directions(computeDirections(coordinates, minMax)),
  };
};

const result_to_coordinates = (results: any): Array<Point> => {
  const keys = Object.keys(results);
  const xKey: string = keys[0];
  const yKey: string = keys[1];
  let points: Array<Point> = [];
  for (let i = 0; i < results[xKey].length; i++) {
    points.push({
      x: results[xKey][i],
      y: results[yKey][i],
    });
  }
  return points;
};

const sort_directions = (directions: Directions): Directions => {
  directions.minY.sort((a, b) => b.x - a.x);
  directions.minXminY.sort((a, b) => b.x - a.x);
  directions.minX.sort((a, b) => a.y - b.y);
  directions.minXmaxY.sort((a, b) => a.x - b.x);
  directions.maxY.sort((a, b) => a.x - b.x);
  directions.maxXmaxY.sort((a, b) => a.x - b.x);
  directions.maxX.sort((a, b) => b.y - a.y);
  directions.maxXminY.sort((a, b) => b.x - a.x);
  return directions;
};

const isMinY = (point: Point, minMax: MinMax): boolean => {
  return point.y === minMax.minY;
};

const isMinXminY = (point: Point, coordinates: Array<Point>): boolean => {
  let ok = true;
  for (let i = 0; i < coordinates.length; i++) {
    if (
      point !== coordinates[i] &&
      coordinates[i].x <= point.x &&
      coordinates[i].y <= point.y
    ) {
      ok = false;
      break;
    }
  }
  return ok;
};

const isMinX = (point: Point, minMax: MinMax): boolean => {
  return point.x === minMax.minX;
};

const isMinXmaxY = (point: Point, coordinates: Array<Point>): boolean => {
  let ok = true;
  for (let i = 0; i < coordinates.length; i++) {
    if (
      point !== coordinates[i] &&
      coordinates[i].x <= point.x &&
      coordinates[i].y >= point.y
    ) {
      ok = false;
      break;
    }
  }
  return ok;
};

const isMaxY = (point: Point, minMax: MinMax): boolean => {
  return point.y === minMax.maxY;
};

const isMaxXmaxY = (point: Point, coordinates: Array<Point>): boolean => {
  let ok = true;
  for (let i = 0; i < coordinates.length; i++) {
    if (
      point !== coordinates[i] &&
      coordinates[i].x >= point.x &&
      coordinates[i].y >= point.y
    ) {
      ok = false;
      break;
    }
  }
  return ok;
};

const isMaxX = (point: Point, minMax: MinMax): boolean => {
  return point.x === minMax.maxX;
};

const isMaxXminY = (point: Point, coordinates: Array<Point>): boolean => {
  let ok = true;
  for (let i = 0; i < coordinates.length; i++) {
    if (
      point !== coordinates[i] &&
      coordinates[i].x >= point.x &&
      coordinates[i].y <= point.y
    ) {
      ok = false;
      break;
    }
  }
  return ok;
};

const computeMinMax = (coordinates: Array<Point>): MinMax => {
  let minMax: MinMax = {
    minX: coordinates[0].x,
    maxX: coordinates[0].x,
    minY: coordinates[0].y,
    maxY: coordinates[0].y,
  };
  for (let i = 0; i < coordinates.length; i++) {
    if (coordinates[i].x < minMax.minX) {
      minMax.minX = coordinates[i].x;
    }
    if (coordinates[i].x > minMax.maxX) {
      minMax.maxX = coordinates[i].x;
    }
    if (coordinates[i].y < minMax.minY) {
      minMax.minY = coordinates[i].y;
    }
    if (coordinates[i].y > minMax.maxY) {
      minMax.maxY = coordinates[i].y;
    }
  }
  return minMax;
};

const computeDirections = (
  coordinates: Array<Point>,
  minMax: MinMax
): Directions => {
  const directions: Directions = {
    minY: [],
    minXminY: [],
    minX: [],
    minXmaxY: [],
    maxY: [],
    maxXmaxY: [],
    maxX: [],
    maxXminY: [],
  };

  for (let i = 0; i < coordinates.length; i++) {
    // not if else structure because a point may be on several directions
    const point = coordinates[i];
    if (isMinY(point, minMax)) {
      directions.minY.push(point);
    }
    if (isMinXminY(point, coordinates)) {
      directions.minXminY.push(point);
    }
    if (isMinX(point, minMax)) {
      directions.minX.push(point);
    }
    if (isMinXmaxY(point, coordinates)) {
      directions.minXmaxY.push(point);
    }
    if (isMaxY(point, minMax)) {
      directions.maxY.push(point);
    }
    if (isMaxXmaxY(point, coordinates)) {
      directions.maxXmaxY.push(point);
    }
    if (isMaxX(point, minMax)) {
      directions.maxX.push(point);
    }
    if (isMaxXminY(point, coordinates)) {
      directions.maxXminY.push(point);
    }
  }

  return directions;
};

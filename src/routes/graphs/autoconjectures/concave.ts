import { Directions, MinMax, Point } from "../../interfaces";
import NumRat from "./numrat";

export const compute_concave_hull = (
  results: any
): { minMax: MinMax | undefined; concave: Directions | undefined } => {
  const keys = Object.keys(results);

  if (
    results[keys[0]] === null ||
    results[keys[0]].length === 0 ||
    results[keys[1]] === null ||
    results[keys[1]].length === 0
  ) {
    return {
      minMax: undefined,
      concave: undefined,
    };
  }

  const coordinates = resultToCoordinates(results);
  const minMax = computeMinMax(coordinates);

  return {
    minMax: minMax,
    concave: sortDirections(computeDirections(coordinates, minMax)),
  };
};

const resultToCoordinates = (results: any): Array<Point> => {
  const keys = Object.keys(results);
  const xKey: string = keys[0];
  const yKey: string = keys[1];
  let points: Array<Point> = [];
  for (let i = 0; i < results[xKey].length; i++) {
    points.push({
      x: new NumRat(results[xKey][i]),
      y: new NumRat(results[yKey][i]),
    });
  }
  return points;
};

const computeMinMax = (coordinates: Array<Point>): MinMax => {
  let minMax: MinMax = {
    minX: coordinates[0].x,
    maxX: coordinates[0].x,
    minY: coordinates[0].y,
    maxY: coordinates[0].y,
  };
  for (let i = 0; i < coordinates.length; i++) {
    if (coordinates[i].x.isLessThan(minMax.minX)) {
      minMax.minX = coordinates[i].x;
    }
    if (coordinates[i].x.isGreaterThan(minMax.maxX)) {
      minMax.maxX = coordinates[i].x;
    }
    if (coordinates[i].y.isLessThan(minMax.minY)) {
      minMax.minY = coordinates[i].y;
    }
    if (coordinates[i].y.isGreaterThan(minMax.maxY)) {
      minMax.maxY = coordinates[i].y;
    }
  }
  return minMax;
};

const isMinX = (point: Point, minMax: MinMax): boolean => {
  return point.x.equals(minMax.minX);
};

const isMaxX = (point: Point, minMax: MinMax): boolean => {
  return point.x.equals(minMax.maxX);
};

const isMinY = (point: Point, minMax: MinMax): boolean => {
  return point.y.equals(minMax.minY);
};

const isMaxY = (point: Point, minMax: MinMax): boolean => {
  return point.y.equals(minMax.maxY);
};

const equalsPoint = (point1: Point, point2: Point): boolean => {
  return point1.x.equals(point2.x) && point1.y.equals(point2.y);
};

const isMinXminY = (point: Point, coordinates: Array<Point>): boolean => {
  let isOk = true;
  for (let i = 0; i < coordinates.length; i++) {
    if (
      !equalsPoint(point, coordinates[i]) &&
      coordinates[i].x.isLessThanOrEqualTo(point.x) &&
      coordinates[i].y.isLessThanOrEqualTo(point.y)
    ) {
      isOk = false;
      break;
    }
  }
  return isOk;
};

const isMinXmaxY = (point: Point, coordinates: Array<Point>): boolean => {
  let isOk = true;
  for (let i = 0; i < coordinates.length; i++) {
    if (
      !equalsPoint(point, coordinates[i]) &&
      coordinates[i].x.isLessThanOrEqualTo(point.x) &&
      coordinates[i].y.isGreaterThanOrEqualTo(point.y)
    ) {
      isOk = false;
      break;
    }
  }
  return isOk;
};

const isMaxXminY = (point: Point, coordinates: Array<Point>): boolean => {
  let isOk = true;
  for (let i = 0; i < coordinates.length; i++) {
    if (
      !equalsPoint(point, coordinates[i]) &&
      coordinates[i].x.isGreaterThanOrEqualTo(point.x) &&
      coordinates[i].y.isLessThanOrEqualTo(point.y)
    ) {
      isOk = false;
      break;
    }
  }
  return isOk;
};

const isMaxXmaxY = (point: Point, coordinates: Array<Point>): boolean => {
  let isOk = true;
  for (let i = 0; i < coordinates.length; i++) {
    if (
      !equalsPoint(point, coordinates[i]) &&
      coordinates[i].x.isGreaterThanOrEqualTo(point.x) &&
      coordinates[i].y.isGreaterThanOrEqualTo(point.y)
    ) {
      isOk = false;
      break;
    }
  }
  return isOk;
};

const computeDirections = (
  coordinates: Array<Point>,
  minMax: MinMax
): Directions => {
  const directions: Directions = {
    minX: [],
    maxX: [],
    minY: [],
    maxY: [],
    minXminY: [],
    minXmaxY: [],
    maxXminY: [],
    maxXmaxY: [],
  };

  for (let i = 0; i < coordinates.length; i++) {
    // not if else structure because a point may be on several directions
    const point = coordinates[i];
    if (isMinX(point, minMax)) {
      directions.minX.push(point);
    }
    if (isMaxX(point, minMax)) {
      directions.maxX.push(point);
    }
    if (isMinY(point, minMax)) {
      directions.minY.push(point);
    }
    if (isMaxY(point, minMax)) {
      directions.maxY.push(point);
    }

    if (isMinXminY(point, coordinates)) {
      directions.minXminY.push(point);
    }
    if (isMinXmaxY(point, coordinates)) {
      directions.minXmaxY.push(point);
    }
    if (isMaxXmaxY(point, coordinates)) {
      directions.maxXmaxY.push(point);
    }
    if (isMaxXminY(point, coordinates)) {
      directions.maxXminY.push(point);
    }
  }
  return directions;
};

const sortDirections = (directions: Directions): Directions => {
  directions.minX.sort((a, b) => b.y.compare(a.y));
  directions.maxX.sort((a, b) => a.y.compare(b.y));
  directions.minY.sort((a, b) => a.x.compare(b.x));
  directions.maxY.sort((a, b) => b.x.compare(a.x));

  directions.minXminY.sort((a, b) => b.x.compare(a.x));
  directions.minXmaxY.sort((a, b) => b.x.compare(a.x));
  directions.maxXminY.sort((a, b) => a.x.compare(b.x));
  directions.maxXmaxY.sort((a, b) => a.x.compare(b.x));

  return directions;
};

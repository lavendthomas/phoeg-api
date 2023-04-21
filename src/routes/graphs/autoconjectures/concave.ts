import {
  Directions,
  DirectionsRational,
  MinMax,
  MinMaxRational,
  Point,
  PointRational,
  initialDirections,
  initialDirectionsRational,
} from "../../interfaces";
import Rational from "./rational";

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

// only call from concaves.ts because can be have rational numbers
export const compute_concave_hull_rational = (
  results: any
): {
  minMax: MinMaxRational | undefined;
  concave: DirectionsRational | undefined;
} => {
  const keys = Object.keys(results);
  if (
    results[keys[0]] === null ||
    results[keys[0]].length === 0 ||
    results[keys[1]] === null ||
    results[keys[1]].length === 0 ||
    results[keys[2]] === null || // Because three keys are used for rational numbers
    results[keys[2]].length === 0
  ) {
    return {
      minMax: undefined,
      concave: undefined,
    };
  }

  const coordinates = resultToCoordinatesRational(results);
  const minMax = computeMinMaxRational(coordinates);

  return {
    minMax: minMax,
    concave: sortDirectionsRational(
      computeDirectionsRational(coordinates, minMax)
    ),
  };
};

const resultToCoordinates = (results: any): Array<Point> => {
  const keys = Object.keys(results);
  const xKey: string = keys[0];
  const yKey: string = keys[1];
  let points: Array<Point> = [];
  for (let i = 0; i < results[xKey].length; i++) {
    const temp = {
      x: results[xKey][i],
      y: results[yKey][i],
    };
    if (!points.includes(temp)) points.push(temp); // remove duplicates if coloration is used
  }
  return points;
};

const resultToCoordinatesRational = (results: any): Array<PointRational> => {
  const keys = Object.keys(results);
  const result: Array<PointRational> = [];

  if (keys[0].includes("_num")) {
    const xKeyNum = keys[0];
    const xKeyDenom = keys[1];
    const yKey = keys[2];
    for (let i = 0; i < results[xKeyNum].length; i++) {
      result.push({
        x: new Rational(results[xKeyNum][i], results[xKeyDenom][i]),
        y: Rational.fromNumber(results[yKey][i]),
      });
    }
  } else if (keys[1].includes("_num")) {
    const xKey = keys[0];
    const yKeyNum = keys[1];
    const yKeyDenom = keys[2];
    for (let i = 0; i < results[xKey].length; i++) {
      result.push({
        x: Rational.fromNumber(results[xKey][i]),
        y: new Rational(results[yKeyNum][i], results[yKeyDenom][i]),
      });
    }
  }
  return result;
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

const computeMinMaxRational = (
  coordinates: Array<PointRational>
): MinMaxRational => {
  let minMax: MinMaxRational = {
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
  return point.x === minMax.minX;
};

const isMinXRational = (
  point: PointRational,
  minMax: MinMaxRational
): boolean => {
  return point.x.isEqualTo(minMax.minX);
};

const isMaxX = (point: Point, minMax: MinMax): boolean => {
  return point.x === minMax.maxX;
};

const isMaxXRational = (
  point: PointRational,
  minMax: MinMaxRational
): boolean => {
  return point.x.isEqualTo(minMax.maxX);
};

const isMinY = (point: Point, minMax: MinMax): boolean => {
  return point.y === minMax.minY;
};

const isMinYRational = (
  point: PointRational,
  minMax: MinMaxRational
): boolean => {
  return point.y.isEqualTo(minMax.minY);
};

const isMaxY = (point: Point, minMax: MinMax): boolean => {
  return point.y === minMax.maxY;
};

const isMaxYRational = (
  point: PointRational,
  minMax: MinMaxRational
): boolean => {
  return point.y.isEqualTo(minMax.maxY);
};

const isMinXminY = (point: Point, coordinates: Array<Point>): boolean => {
  let isOk = true;
  for (let i = 0; i < coordinates.length; i++) {
    if (
      point !== coordinates[i] &&
      coordinates[i].x <= point.x &&
      coordinates[i].y <= point.y
    ) {
      isOk = false;
      break;
    }
  }
  return isOk;
};

const isMinXminYRational = (
  point: PointRational,
  coordinates: Array<PointRational>
): boolean => {
  let isOk = true;
  for (let i = 0; i < coordinates.length; i++) {
    if (
      point !== coordinates[i] &&
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
      point !== coordinates[i] &&
      coordinates[i].x <= point.x &&
      coordinates[i].y >= point.y
    ) {
      isOk = false;
      break;
    }
  }
  return isOk;
};

const isMinXmaxYRational = (
  point: PointRational,
  coordinates: Array<PointRational>
): boolean => {
  let isOk = true;
  for (let i = 0; i < coordinates.length; i++) {
    if (
      point !== coordinates[i] &&
      coordinates[i].x.isLessThanOrEqualTo(point.x) &&
      coordinates[i].y.isGreaterThanOrEqualTo(point.y)
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
      point !== coordinates[i] &&
      coordinates[i].x >= point.x &&
      coordinates[i].y >= point.y
    ) {
      isOk = false;
      break;
    }
  }
  return isOk;
};

const isMaxXmaxYRational = (
  point: PointRational,
  coordinates: Array<PointRational>
): boolean => {
  let isOk = true;
  for (let i = 0; i < coordinates.length; i++) {
    if (
      point !== coordinates[i] &&
      coordinates[i].x.isGreaterThanOrEqualTo(point.x) &&
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
      point !== coordinates[i] &&
      coordinates[i].x >= point.x &&
      coordinates[i].y <= point.y
    ) {
      isOk = false;
      break;
    }
  }
  return isOk;
};

const isMaxXminYRational = (
  point: PointRational,
  coordinates: Array<PointRational>
): boolean => {
  let isOk = true;
  for (let i = 0; i < coordinates.length; i++) {
    if (
      point !== coordinates[i] &&
      coordinates[i].x.isGreaterThanOrEqualTo(point.x) &&
      coordinates[i].y.isLessThanOrEqualTo(point.y)
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
  const directions: Directions = initialDirections;

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

const computeDirectionsRational = (
  coordinates: Array<PointRational>,
  minMax: MinMaxRational
): DirectionsRational => {
  const directions: DirectionsRational = initialDirectionsRational;

  for (let i = 0; i < coordinates.length; i++) {
    // not if else structure because a point may be on several directions
    const point = coordinates[i];
    if (isMinXRational(point, minMax)) {
      directions.minX.push(point);
    }
    if (isMaxXRational(point, minMax)) {
      directions.maxX.push(point);
    }
    if (isMinYRational(point, minMax)) {
      directions.minY.push(point);
    }
    if (isMaxYRational(point, minMax)) {
      directions.maxY.push(point);
    }

    if (isMinXminYRational(point, coordinates)) {
      directions.minXminY.push(point);
    }
    if (isMinXmaxYRational(point, coordinates)) {
      directions.minXmaxY.push(point);
    }
    if (isMaxXmaxYRational(point, coordinates)) {
      directions.maxXmaxY.push(point);
    }
    if (isMaxXminYRational(point, coordinates)) {
      directions.maxXminY.push(point);
    }
  }
  return directions;
};

const sortDirections = (directions: Directions): Directions => {
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

const sortDirectionsRational = (
  directions: DirectionsRational
): DirectionsRational => {
  directions.minY.sort((a, b) => b.x.compare(a.x));
  directions.minXminY.sort((a, b) => b.x.compare(a.x));
  directions.minX.sort((a, b) => a.y.compare(b.y));
  directions.minXmaxY.sort((a, b) => a.x.compare(b.x));
  directions.maxY.sort((a, b) => a.x.compare(b.x));
  directions.maxXmaxY.sort((a, b) => a.x.compare(b.x));
  directions.maxX.sort((a, b) => b.y.compare(a.y));
  directions.maxXminY.sort((a, b) => b.x.compare(a.x));
  return directions;
};

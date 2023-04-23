import NumRat from "./graphs/autoconjectures/numrat";

export interface Coordinate {
  x: number;
  y: number;
  mult: number;
  color: number;
}

export interface Point {
  x: NumRat;
  y: NumRat;
}

export interface Directions {
  // for concave
  minX: Array<Point>;
  maxX: Array<Point>;
  minY: Array<Point>;
  maxY: Array<Point>;
  minXminY: Array<Point>;
  minXmaxY: Array<Point>;
  maxXminY: Array<Point>;
  maxXmaxY: Array<Point>;
}

export interface DirectionsOrders {
  // for concaves query
  minX: Array<Array<Point>>;
  maxX: Array<Array<Point>>;
  minY: Array<Array<Point>>;
  maxY: Array<Array<Point>>;
  minXminY: Array<Array<Point>>;
  minXmaxY: Array<Array<Point>>;
  maxXminY: Array<Array<Point>>;
  maxXmaxY: Array<Array<Point>>;
}

export interface MinMax {
  // number or rational only in concaves
  // (just number in points so minColor and maxColor are optional (number))
  minX: NumRat;
  maxX: NumRat;
  minY: NumRat;
  maxY: NumRat;
  minColor?: number;
  maxColor?: number;
}

export const initialMinMax = {
  minX: 0,
  maxX: 0,
  minY: 0,
  maxY: 0,
};

export interface PointResult {
  coordinates: Array<Coordinate>;
  minMax: MinMax | undefined;
  sorted: { [key: string]: Array<Coordinate> } | undefined;
}

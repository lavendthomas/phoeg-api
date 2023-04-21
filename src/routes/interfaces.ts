import Rational from "./graphs/autoconjectures/rational";

export interface Coordinate {
  x: number;
  y: number;
  mult: number;
  color: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface PointOrder extends Point {
  order: number;
  clicked: boolean;
}

export interface PointRational {
  x: Rational;
  y: Rational;
}

export interface PointRationalOrder extends PointRational {
  order: number;
  clicked: boolean;
}

export interface Directions {
  minX: Array<Point | PointOrder>;
  maxX: Array<Point | PointOrder>;
  minY: Array<Point | PointOrder>;
  maxY: Array<Point | PointOrder>;
  minXminY: Array<Point | PointOrder>;
  minXmaxY: Array<Point | PointOrder>;
  maxXminY: Array<Point | PointOrder>;
  maxXmaxY: Array<Point | PointOrder>;
}

export interface DirectionsRational {
  minX: Array<PointRational | PointRationalOrder>;
  maxX: Array<PointRational | PointRationalOrder>;
  minY: Array<PointRational | PointRationalOrder>;
  maxY: Array<PointRational | PointRationalOrder>;
  minXminY: Array<PointRational | PointRationalOrder>;
  minXmaxY: Array<PointRational | PointRationalOrder>;
  maxXminY: Array<PointRational | PointRationalOrder>;
  maxXmaxY: Array<PointRational | PointRationalOrder>;
}

export interface MinMax {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minColor?: number;
  maxColor?: number;
}

export const initialMinMax = {
  minX: 0,
  maxX: 0,
  minY: 0,
  maxY: 0,
};

export interface MinMaxRational {
  minX: Rational;
  maxX: Rational;
  minY: Rational;
  maxY: Rational;
}

export const initialMinMaxRational = {
  minX: new Rational(0, 1),
  maxX: new Rational(0, 1),
  minY: new Rational(0, 1),
  maxY: new Rational(0, 1),
};

export interface PointResult {
  coordinates: Array<Point>;
  minMax: MinMax | undefined;
  sorted: { [key: string]: Array<Point> } | undefined;
}

export interface DirectionsOrder {
  order: number;
  directions: Directions | DirectionsRational | undefined;
}

export interface MinMaxOrder {
  order: number;
  minMax: MinMax | MinMaxRational | undefined;
}

export interface PolytopeOrder {
  order: number;
  polytope: Array<Coordinate>;
}

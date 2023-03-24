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

export interface Directions {
  minY: Array<Point>;
  minXminY: Array<Point>;
  minX: Array<Point>;
  minXmaxY: Array<Point>;
  maxY: Array<Point>;
  maxXmaxY: Array<Point>;
  maxX: Array<Point>;
  maxXminY: Array<Point>;
}

export const initialDirections = {
  minY: [],
  minXminY: [],
  minX: [],
  minXmaxY: [],
  maxY: [],
  maxXmaxY: [],
  maxX: [],
  maxXminY: [],
};

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

export interface PointResult {
  coordinates: Array<Point>;
  minMax: MinMax;
  sorted: { [key: string]: Array<Point> };
}

export interface DirectionsOrder {
  order: number;
  directions: Directions;
}

export interface MinMaxOrder {
  order: number;
  minMax: MinMax;
}

export interface PolytopeOrder {
  order: number;
  polytope: Array<Coordinate>;
}

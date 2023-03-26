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

export interface Directions {
  minY: Array<Point | PointOrder>;
  minXminY: Array<Point | PointOrder>;
  minX: Array<Point | PointOrder>;
  minXmaxY: Array<Point | PointOrder>;
  maxY: Array<Point | PointOrder>;
  maxXmaxY: Array<Point | PointOrder>;
  maxX: Array<Point | PointOrder>;
  maxXminY: Array<Point | PointOrder>;
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
  minMax: MinMax | undefined;
  sorted: { [key: string]: Array<Point> } | undefined;
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

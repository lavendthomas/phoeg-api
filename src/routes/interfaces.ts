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

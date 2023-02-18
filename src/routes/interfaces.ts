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

export interface MinMax {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minColor?: number;
  maxColor?: number;
}

export interface PointResult {
  coordinates: Array<Point>;
  minMax: MinMax;
  sorted: { [key: string]: Array<Point> };
}

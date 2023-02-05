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
}

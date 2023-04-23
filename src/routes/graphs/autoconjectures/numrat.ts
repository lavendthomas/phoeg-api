import Rational from "./rational";

class NumRat {
  public numerator: number;
  public denominator: number | undefined;

  constructor(value: number | Rational) {
    if (value instanceof Rational) {
      this.numerator = value.numerator;
      this.denominator = value.denominator;
    } else {
      this.numerator = value;
      this.denominator = undefined;
    }
  }

  equals(other: NumRat): boolean {
    if (this.denominator && other.denominator) {
      // Compare rational to rational
      return (
        this.numerator * other.denominator ===
        this.denominator * other.numerator
      );
    } else if (this.denominator || other.denominator) {
      // It shouldn't happen because compare number to number or rational to rational
      return false;
    } else {
      // Compare number to number
      return this.numerator === other.numerator;
    }
  }

  isLessThan(other: NumRat): boolean {
    if (this.denominator && other.denominator) {
      // Compare rational to rational
      return (
        this.numerator * other.denominator < this.denominator * other.numerator
      );
    } else if (this.denominator || other.denominator) {
      // It shouldn't happen because compare number to number or rational to rational
      return false;
    } else {
      // Compare number to number
      return this.numerator < other.numerator;
    }
  }

  isGreaterThan(other: NumRat): boolean {
    if (this.denominator && other.denominator) {
      // Compare rational to rational
      return (
        this.numerator * other.denominator > this.denominator * other.numerator
      );
    } else if (this.denominator || other.denominator) {
      // It shouldn't happen because compare number to number or rational to rational
      return false;
    } else {
      // Compare number to number
      return this.numerator > other.numerator;
    }
  }

  isLessThanOrEqualTo(other: NumRat): boolean {
    if (this.denominator && other.denominator) {
      // Compare rational to rational
      return (
        this.numerator * other.denominator <= this.denominator * other.numerator
      );
    } else if (this.denominator || other.denominator) {
      // It shouldn't happen because compare number to number or rational to rational
      return false;
    } else {
      // Compare number to number
      return this.numerator <= other.numerator;
    }
  }

  isGreaterThanOrEqualTo(other: NumRat): boolean {
    if (this.denominator && other.denominator) {
      // Compare rational to rational
      return (
        this.numerator * other.denominator >= this.denominator * other.numerator
      );
    } else if (this.denominator || other.denominator) {
      // It shouldn't happen because compare number to number or rational to rational
      return false;
    } else {
      // Compare number to number
      return this.numerator >= other.numerator;
    }
  }

  compare(other: NumRat): number {
    if (this.denominator && other.denominator) {
      // Compare rational to rational
      return (
        this.numerator * other.denominator - this.denominator * other.numerator
      );
    } else if (this.denominator || other.denominator) {
      // It shouldn't happen because compare number to number or rational to rational
      return 0;
    } else {
      // Compare number to number
      return this.numerator - other.numerator;
    }
  }
}

export default NumRat;

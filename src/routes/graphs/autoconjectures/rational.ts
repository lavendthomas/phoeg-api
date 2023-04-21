class Rational {
  public numerator: number;
  public denominator: number;

  constructor(numerator: number, denominator: number) {
    if (denominator === 0) {
      throw new Error("Denominator cannot be zero");
    }
    this.numerator = numerator;
    this.denominator = denominator;
  }

  static fromNumber(n: number): Rational {
    return new Rational(n, 1);
  }

  isEqualTo(other: Rational): boolean {
    return (
      this.numerator * other.denominator === this.denominator * other.numerator
    );
  }

  isLessThan(other: Rational): boolean {
    return (
      this.numerator * other.denominator < this.denominator * other.numerator
    );
  }

  isGreaterThan(other: Rational): boolean {
    return (
      this.numerator * other.denominator > this.denominator * other.numerator
    );
  }

  isLessThanOrEqualTo(other: Rational): boolean {
    return (
      this.numerator * other.denominator <= this.denominator * other.numerator
    );
  }

  isGreaterThanOrEqualTo(other: Rational): boolean {
    return (
      this.numerator * other.denominator >= this.denominator * other.numerator
    );
  }

  add(other: Rational): Rational {
    return new Rational(
      this.numerator * other.denominator + this.denominator * other.numerator,
      this.denominator * other.denominator
    );
  }

  subtract(other: Rational): Rational {
    return new Rational(
      this.numerator * other.denominator - this.denominator * other.numerator,
      this.denominator * other.denominator
    );
  }

  compare(other: Rational): number {
    if (this.isEqualTo(other)) return 0;
    if (this.isLessThan(other)) return -1;
    return 1;
  }
}

export default Rational;

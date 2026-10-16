// Optional sign, `$`, whole dollars (optionally comma-grouped), one or two decimals,
// optional per-month suffix: `$14.33`, `$50,000`, `+$4.6/MO`, `-$12`.
const AMOUNT = /^([+-])?\$(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?(?:\/MO)?$/i;

/** An exact amount of US dollars, held as integer cents. */
export class Money {
  private constructor(readonly cents: number) {}

  static parse(text: string): Money {
    if (/^free$/i.test(text)) return new Money(0);
    const match = AMOUNT.exec(text);
    if (!match) throw new Error(`Cannot read a money amount from "${text}"`);
    const [, sign, dollars = '', fraction = ''] = match;
    const cents = Number(dollars.replaceAll(',', '')) * 100 + Number(fraction.padEnd(2, '0'));
    return new Money(sign === '-' ? -cents : cents);
  }

  plus(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  minus(other: Money): Money {
    return new Money(this.cents - other.cents);
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  isGreaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }

  isLessThan(other: Money): boolean {
    return this.cents < other.cents;
  }

  /** The amount in whole dollars, for typing into a value field. */
  wholeDollars(): number {
    if (this.cents % 100 !== 0)
      throw new Error(`${this.toString()} is not a whole number of dollars`);
    return this.cents / 100;
  }

  /** Formats in the page's style, e.g. `$1,234.50` or `-$0.40`. */
  toString(): string {
    const sign = this.cents < 0 ? '-' : '';
    const absolute = Math.abs(this.cents);
    const dollars = Math.trunc(absolute / 100).toLocaleString('en-US');
    const cents = String(absolute % 100).padStart(2, '0');
    return `${sign}$${dollars}.${cents}`;
  }
}

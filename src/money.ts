// "$50,000", "$14.33", "+$4.6/MO": optional sign, "$", digits (comma-grouped
// by three, or ungrouped), one or two decimals, optional per-month suffix.
const AMOUNT = /^([+-])?\$(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?(?:\/MO)?$/;

/** An exact money amount in USD, stored as integer cents. Immutable. */
export class Money {
  static readonly ZERO = new Money(0);

  private constructor(readonly cents: number) {}

  static fromCents(cents: number): Money {
    if (!Number.isSafeInteger(cents)) {
      throw new Error(
        `Cannot create money from ${String(cents)} cents: expected a whole number of cents`,
      );
    }
    return new Money(cents);
  }

  /**
   * Reads an amount as the Quote page shows it: a Price, List price, Coverage
   * or Deductible (`$14.33`, `$50,000`), a signed Price impact (`+$4.6/MO`) or
   * `FREE`. Anything else throws rather than being guessed at.
   */
  static parse(text: string): Money {
    if (text === 'FREE') {
      return Money.ZERO;
    }
    const match = AMOUNT.exec(text);
    if (!match) {
      throw unreadable(text);
    }
    const [, sign, dollars = '', decimals = ''] = match;
    const cents = Number(dollars.replaceAll(',', '')) * 100 + Number(decimals.padEnd(2, '0'));
    if (!Number.isSafeInteger(cents)) {
      throw unreadable(text);
    }
    return new Money(sign === '-' ? -cents : cents);
  }

  plus(other: Money): Money {
    return Money.fromCents(this.cents + other.cents);
  }

  minus(other: Money): Money {
    return Money.fromCents(this.cents - other.cents);
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  isLessThan(other: Money): boolean {
    return this.cents < other.cents;
  }

  isGreaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }

  /** The page's style: `$14.33`, with thousands separators and a `-` for a negative amount. */
  format(): string {
    const absolute = Math.abs(this.cents);
    const dollars = Math.floor(absolute / 100).toLocaleString('en-US');
    const cents = String(absolute % 100).padStart(2, '0');
    return `${this.cents < 0 ? '-' : ''}$${dollars}.${cents}`;
  }

  toString(): string {
    return this.format();
  }
}

function unreadable(text: string): Error {
  return new Error(
    `Cannot read "${text}" as a money amount: expected e.g. $14.33, $50,000, +$4.6/MO or FREE`,
  );
}

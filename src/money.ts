const DIGITS = String.raw`\$(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?`;

// "$50,000", "$14.33": optional minus, "$", digits (comma-grouped by three,
// or ungrouped), up to two decimals. No period suffix.
const AMOUNT = new RegExp(String.raw`^(-)?${DIGITS}$`);
// "+$4.6/MO", "+$1.67": optional sign, the digits, optional per-month suffix.
const MONTHLY_IMPACT = new RegExp(String.raw`^([+-])?${DIGITS}(?:/MO)?$`);
// "+$20.04/YR": the same, with the per-year suffix.
const ANNUAL_IMPACT = new RegExp(String.raw`^([+-])?${DIGITS}(?:/YR)?$`);

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
   * Reads a period-free amount as the Quote page shows it: a Price, List price,
   * Coverage or Deductible (`$14.33`, `$50,000`), or `FREE`. A Price impact
   * with a period suffix is not accepted; use `parseMonthlyImpact` or
   * `parseAnnualImpact`. Anything else throws rather than being guessed at.
   */
  static parse(text: string): Money {
    return parseWith(AMOUNT, text);
  }

  /** Reads a monthly Price impact (`+$4.6/MO`, `+$1.67`) or `FREE`. A `/YR` amount throws. */
  static parseMonthlyImpact(text: string): Money {
    return parseWith(MONTHLY_IMPACT, text);
  }

  /** Reads an annual Price impact (`+$20.04/YR`, `+$20.04`) or `FREE`. A `/MO` amount throws. */
  static parseAnnualImpact(text: string): Money {
    return parseWith(ANNUAL_IMPACT, text);
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

function parseWith(pattern: RegExp, text: string): Money {
  if (text === 'FREE') {
    return Money.ZERO;
  }
  const match = pattern.exec(text);
  if (!match) {
    throw unreadable(text);
  }
  const [, sign, dollars = '', decimals = ''] = match;
  const cents = Number(dollars.replaceAll(',', '')) * 100 + Number(decimals.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents)) {
    throw unreadable(text);
  }
  return Money.fromCents(sign === '-' ? -cents : cents);
}

function unreadable(text: string): Error {
  return new Error(
    `Cannot read "${text}" as a money amount: expected e.g. $14.33, $50,000, +$4.6/MO, +$20.04/YR or FREE`,
  );
}

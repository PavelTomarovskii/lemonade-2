/**
 * Baseline price, in cents, of each Quote the suite supports. It is the only absolute
 * Price the suite knows; every other price check is relational (ADR-0002).
 */
const BASELINE_PRICE_CENTS: Readonly<Record<string, number>> = {
  LQ42EE07089: 1433,
};

export function baselinePriceCentsFor(quoteId: string): number {
  const cents = BASELINE_PRICE_CENTS[quoteId];
  if (cents === undefined) {
    throw new Error(
      `No Baseline price is known for Quote "${quoteId}"; add it to src/test-data/quotes.ts`,
    );
  }
  return cents;
}

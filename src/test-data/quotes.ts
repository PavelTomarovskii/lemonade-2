import { Money } from '../money';

/**
 * Baseline price of each Quote the suite supports. It is the only absolute Price the suite
 * knows; every other price check is relational (ADR-0002).
 */
const BASELINE_PRICES: Readonly<Record<string, Money>> = {
  LQ42EE07089: Money.parse('$14.33'),
};

export function baselinePriceFor(quoteId: string): Money {
  const price = BASELINE_PRICES[quoteId];
  if (price === undefined) {
    throw new Error(
      `No Baseline price is known for Quote "${quoteId}"; add it to src/test-data/quotes.ts`,
    );
  }
  return price;
}

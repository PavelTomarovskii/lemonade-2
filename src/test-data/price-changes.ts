import { Money } from '../money';
import type { QuotePage } from '../pages/quote-page';

/** A customer action that moves the Price, and the way it moves it. */
export interface PriceChange {
  readonly name: string;
  readonly direction: 'raises' | 'lowers';
  apply(quote: QuotePage): Promise<void>;
}

/**
 * Price-changing actions, one per kind of control, none of them touching a Coverage step with a
 * known bug. Each starts from a fresh Quote and moves the Price in the stated direction.
 */
export const PRICE_CHANGES: readonly PriceChange[] = [
  {
    name: 'raising Personal Liability',
    direction: 'raises',
    apply: (quote) => quote.coverage('personalLiability').stepUp(),
  },
  {
    name: 'lowering Personal Property',
    direction: 'lowers',
    apply: (quote) => quote.coverage('personalProperty').stepDown(),
  },
  {
    name: 'choosing the lowest Deductible',
    direction: 'raises',
    apply: async (quote) => {
      const [lowest] = (await quote.deductible.optionAmounts()).sort((a, b) => a.cents - b.cents);
      await quote.deductible.select(lowest ?? Money.ZERO);
    },
  },
  {
    name: 'choosing the highest Deductible',
    direction: 'lowers',
    apply: async (quote) => {
      const [highest] = (await quote.deductible.optionAmounts()).sort((a, b) => b.cents - a.cents);
      await quote.deductible.select(highest ?? Money.ZERO);
    },
  },
  {
    name: 'switching on a paid Add-on',
    direction: 'raises',
    apply: async (quote) => {
      await quote.addOn('waterBackup').switchOn();
    },
  },
  {
    name: 'adding a Valuable item',
    direction: 'raises',
    apply: async (quote) => {
      await quote.valuableItems.add('jewelry', Money.fromCents(200_000));
    },
  },
];

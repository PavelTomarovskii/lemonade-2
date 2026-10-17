import { test as base } from '@playwright/test';
import { loadConfig } from './config';
import { Money } from './money';
import { QuotePage } from './pages/quote-page';
import { baselinePriceCentsFor } from './test-data/quotes';

interface Fixtures {
  /** A freshly opened Quote with the cookie banner dismissed. */
  quote: QuotePage;
  /** The Baseline price of the Quote under test. */
  baselinePrice: Money;
}

const { quoteId } = loadConfig(process.env);

export const test = base.extend<Fixtures>({
  quote: async ({ page }, use) => {
    const quote = new QuotePage(page, quoteId);
    await quote.open();
    await quote.cookieBanner.dismiss();
    await use(quote);
  },
  // Playwright reads the fixture's dependencies from the destructured argument, so it stays empty.
  // eslint-disable-next-line no-empty-pattern
  baselinePrice: async ({}, use) => {
    await use(Money.fromCents(baselinePriceCentsFor(quoteId)));
  },
});

export { expect } from '@playwright/test';

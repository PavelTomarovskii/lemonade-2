import { expect as baseExpect, test as base } from '@playwright/test';
import { loadConfig } from './config';
import type { Money } from './money';
import { QuotePage } from './pages/quote-page';
import { moneyMatchers } from './support/money-matchers';
import { baselinePriceFor } from './test-data/quotes';

const { quoteId } = loadConfig(process.env);

interface QuoteFixtures {
  /** A freshly opened Quote with the cookie banner dismissed. */
  quotePage: QuotePage;
  /** The Baseline price of the Quote under test. */
  baselinePrice: Money;
}

export const test = base.extend<QuoteFixtures>({
  quotePage: async ({ page }, use) => {
    const quotePage = new QuotePage(page);
    await quotePage.open(quoteId);
    await quotePage.cookieBanner.rejectAll();
    await use(quotePage);
  },
  // eslint-disable-next-line no-empty-pattern -- Playwright fixtures must destructure their dependencies
  baselinePrice: async ({}, use) => {
    await use(baselinePriceFor(quoteId));
  },
});

export const expect = baseExpect.extend(moneyMatchers);

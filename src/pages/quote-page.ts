import type { Page } from '@playwright/test';
import { CookieBanner } from './components/cookie-banner';
import { PriceSummary } from './components/price-summary';

/**
 * The Quote page. Open a fresh Quote with `open()`; never reload the page or use "Start over",
 * which both lead to a 404 in the current build.
 */
export class QuotePage {
  readonly cookieBanner: CookieBanner;
  readonly priceSummary: PriceSummary;

  constructor(private readonly page: Page) {
    this.cookieBanner = new CookieBanner(page);
    this.priceSummary = new PriceSummary(page);
  }

  async open(quoteId: string): Promise<void> {
    await this.page.goto(`quotes/${quoteId}`);
    await this.priceSummary.waitUntilShown();
  }
}

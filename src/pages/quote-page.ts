import type { Page } from '@playwright/test';
import { CookieBanner } from './components/cookie-banner';
import { CoverageStepper, type CoverageName } from './components/coverage-stepper';
import { DeductibleSelect } from './components/deductible-select';
import { PriceSummary } from './components/price-summary';
import { sectionTitled } from './components/section';

/**
 * The Quote page. Open a fresh Quote with `open()`; never reload the page or use "Start over",
 * which both lead to a 404 in the current build.
 */
export class QuotePage {
  readonly cookieBanner: CookieBanner;
  readonly priceSummary: PriceSummary;
  readonly deductible: DeductibleSelect;

  constructor(private readonly page: Page) {
    this.cookieBanner = new CookieBanner(page);
    this.priceSummary = new PriceSummary(page);
    this.deductible = new DeductibleSelect(page);
  }

  coverage(name: CoverageName): CoverageStepper {
    return new CoverageStepper(sectionTitled(this.page, 'Coverage Amounts'), name);
  }

  async open(quoteId: string): Promise<void> {
    await this.page.goto(`quotes/${quoteId}`);
    await this.priceSummary.waitUntilShown();
  }
}

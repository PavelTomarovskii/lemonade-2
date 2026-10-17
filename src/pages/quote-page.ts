import type { Page } from '@playwright/test';
import { CookieBanner } from './components/cookie-banner';
import { CoverageStepper, type CoverageName } from './components/coverage-stepper';
import { DeductibleSelect } from './components/deductible-select';
import { PriceSummary } from './components/price-summary';

/**
 * The Quote page. Holds no assertions. Never reload it or use "Start over" (both lead to a 404,
 * issue #32): open it again, which restores the default state.
 */
export class QuotePage {
  readonly cookieBanner: CookieBanner;
  readonly priceSummary: PriceSummary;
  readonly deductible: DeductibleSelect;

  constructor(
    private readonly page: Page,
    private readonly quoteId: string,
  ) {
    this.cookieBanner = new CookieBanner(page);
    this.priceSummary = new PriceSummary(page);
    this.deductible = new DeductibleSelect(page, this.priceSummary);
  }

  coverage(name: CoverageName): CoverageStepper {
    return new CoverageStepper(this.page, this.priceSummary, name);
  }

  /** Opens the Quote at its default state, once its Price is shown. */
  async open(): Promise<void> {
    await this.page.goto(`quotes/${this.quoteId}`);
    await this.priceSummary.watchUpdates();
  }
}

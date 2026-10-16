import type { Page } from '@playwright/test';
import { AddOn, type AddOnName } from './components/add-on';
import { CookieBanner } from './components/cookie-banner';
import { CoverageStepper, type CoverageName } from './components/coverage-stepper';
import { DeductibleSelect } from './components/deductible-select';
import { PriceSummary } from './components/price-summary';
import { sectionTitled } from './components/section';
import { ValuableItems } from './components/valuable-items';

/**
 * The Quote page. Open a fresh Quote with `open()`; never reload the page or use "Start over",
 * which both lead to a 404 in the current build.
 */
export class QuotePage {
  readonly cookieBanner: CookieBanner;
  readonly priceSummary: PriceSummary;
  readonly deductible: DeductibleSelect;
  readonly valuableItems: ValuableItems;

  constructor(private readonly page: Page) {
    this.cookieBanner = new CookieBanner(page);
    this.priceSummary = new PriceSummary(page);
    this.deductible = new DeductibleSelect(page);
    this.valuableItems = new ValuableItems(page);
  }

  async open(quoteId: string): Promise<void> {
    await this.page.goto(`quotes/${quoteId}`);
    await this.priceSummary.waitUntilShown();
  }

  coverage(name: CoverageName): CoverageStepper {
    return new CoverageStepper(sectionTitled(this.page, 'Coverage Amounts'), name);
  }

  addOn(name: AddOnName): AddOn {
    return new AddOn(this.page, sectionTitled(this.page, 'Policy Options'), name);
  }
}

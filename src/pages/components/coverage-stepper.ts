import type { Locator, Page } from '@playwright/test';
import { Money } from '../../money';
import type { PriceSummary } from './price-summary';

/** The Coverages, mapped to the heading each one has on the page. */
export const COVERAGE_HEADINGS = {
  personalProperty: 'Personal Property',
  personalLiability: 'Personal Liability',
  lossOfUse: 'Loss of use',
  medicalPayments: 'Medical payments to others',
} as const;

export type CoverageName = keyof typeof COVERAGE_HEADINGS;

/**
 * One Coverage's stepper, found by the Coverage's name. A step triggers a Price update, so it
 * returns once that update has finished: the step controls are disabled while it is in flight,
 * and a click in that window would be ignored.
 */
export class CoverageStepper {
  private readonly increase: Locator;
  private readonly decrease: Locator;
  private readonly value: Locator;

  constructor(
    page: Page,
    private readonly priceSummary: PriceSummary,
    name: CoverageName,
  ) {
    const card = page
      .locator('div.box-white')
      .filter({ has: page.getByRole('heading', { name: COVERAGE_HEADINGS[name], exact: true }) });
    this.increase = card.getByRole('button', { name: 'increase' });
    this.decrease = card.getByRole('button', { name: 'decrease' });
    this.value = card.locator('[aria-label=input-value]');
  }

  async stepUp(): Promise<void> {
    await this.priceSummary.afterUpdate(() => this.increase.click());
  }

  async stepDown(): Promise<void> {
    await this.priceSummary.afterUpdate(() => this.decrease.click());
  }

  /** The Coverage's current amount. */
  async currentValue(): Promise<Money> {
    return Money.parse((await this.value.textContent()) ?? '');
  }

  async canStepUp(): Promise<boolean> {
    return this.increase.isEnabled();
  }

  async canStepDown(): Promise<boolean> {
    return this.decrease.isEnabled();
  }
}

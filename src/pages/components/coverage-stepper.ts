import type { Locator } from '@playwright/test';
import { Money } from '../../money';

export type CoverageName =
  'Personal Property' | 'Personal Liability' | 'Loss of Use' | 'Medical Payments';

const CARD_TITLES: Readonly<Record<CoverageName, string>> = {
  'Personal Property': 'Personal Property',
  'Personal Liability': 'Personal Liability',
  'Loss of Use': 'Loss of use',
  'Medical Payments': 'Medical payments to others',
};

/** One Coverage's card: steps its amount up or down its ladder of values. */
export class CoverageStepper {
  private readonly root: Locator;
  private readonly increase: Locator;
  private readonly decrease: Locator;

  constructor(coverageSection: Locator, name: CoverageName) {
    this.root = coverageSection
      .getByRole('heading', { name: CARD_TITLES[name], exact: true })
      .locator('xpath=..');
    this.increase = this.root.getByRole('button', { name: 'increase', exact: true });
    this.decrease = this.root.getByRole('button', { name: 'decrease', exact: true });
  }

  async stepUp(): Promise<void> {
    await this.increase.click();
  }

  async stepDown(): Promise<void> {
    await this.decrease.click();
  }

  async value(): Promise<Money> {
    return Money.parse(
      (await this.root.getByLabel('input-value', { exact: true }).textContent()) ?? '',
    );
  }

  async canStepUp(): Promise<boolean> {
    return this.increase.isEnabled();
  }

  async canStepDown(): Promise<boolean> {
    return this.decrease.isEnabled();
  }
}

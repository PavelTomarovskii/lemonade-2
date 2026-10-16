import type { Locator, Page } from '@playwright/test';
import { Money } from '../../money';
import { readSettled } from '../../support/settled';
import { exactText } from './exact-text';

export type CoverageName =
  'Personal Property' | 'Personal Liability' | 'Loss of Use' | 'Medical Payments';

const CARD_TITLES: Readonly<Record<CoverageName, string>> = {
  'Personal Property': 'Personal Property',
  'Personal Liability': 'Personal Liability',
  'Loss of Use': 'Loss of use',
  'Medical Payments': 'Medical payments to others',
};

/**
 * One Coverage's card: steps its amount up or down its ladder of values.
 *
 * The page saves a Coverage about 300 ms after the last click and disables both buttons while
 * it does, so a click or a bound check in that moment would be lost or wrong. Each step
 * therefore returns only once the card has settled, after its save.
 */
export class CoverageStepper {
  private readonly root: Locator;
  private readonly increase: Locator;
  private readonly decrease: Locator;
  private readonly valueText: Locator;

  private readonly page: Page;

  constructor(
    coverageSection: Locator,
    private readonly name: CoverageName,
  ) {
    this.page = coverageSection.page();
    this.root = coverageSection
      .getByRole('heading', { name: CARD_TITLES[name], exact: true })
      .locator('xpath=..');
    this.increase = this.root.getByRole('button', { name: 'increase', exact: true });
    this.decrease = this.root.getByRole('button', { name: 'decrease', exact: true });
    this.valueText = this.root.getByLabel('input-value', { exact: true });
  }

  /** Steps one value up and waits until the card has settled on it. */
  async stepUp(): Promise<void> {
    await this.step(this.increase);
  }

  /** Steps one value down and waits until the card has settled on it. */
  async stepDown(): Promise<void> {
    await this.step(this.decrease);
  }

  /** Steps up or down, one value at a time, until the Coverage is `target`. */
  async stepTo(target: Money): Promise<void> {
    let current = await this.value();
    const goingUp = current.isLessThan(target);
    while (!current.equals(target)) {
      const overshot = goingUp ? current.isGreaterThan(target) : current.isLessThan(target);
      const button = goingUp ? this.increase : this.decrease;
      if (overshot || !(await button.isEnabled())) {
        throw new Error(
          `Cannot step ${this.name} to ${target.toString()}: it stopped at ${current.toString()}`,
        );
      }
      await this.step(button);
      current = await this.value();
    }
  }

  async value(): Promise<Money> {
    return Money.parse(((await this.valueText.textContent()) ?? '').trim());
  }

  async canStepUp(): Promise<boolean> {
    return this.increase.isEnabled();
  }

  async canStepDown(): Promise<boolean> {
    return this.decrease.isEnabled();
  }

  private async step(button: Locator): Promise<void> {
    const before = ((await this.valueText.textContent()) ?? '').trim();
    await button.click();
    await this.valueText.filter({ hasNotText: exactText(before) }).waitFor();
    await readSettled(this.page, () => this.cardState());
  }

  /** What the card shows: its value and which buttons are enabled. */
  private async cardState(): Promise<string> {
    const [value, canStepDown, canStepUp] = await Promise.all([
      this.valueText.textContent(),
      this.canStepDown(),
      this.canStepUp(),
    ]);
    return `${String(value)} down:${String(canStepDown)} up:${String(canStepUp)}`;
  }
}

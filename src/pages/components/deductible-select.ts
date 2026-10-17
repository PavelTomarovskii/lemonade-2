import type { Locator, Page } from '@playwright/test';
import { Money } from '../../money';
import type { PriceSummary } from './price-summary';

/**
 * The Deductible select. Its `select` test id is shared with the Start date selects, so it is
 * found through the Deductible article's heading. Choosing an option triggers a Price update,
 * so it returns once that update has finished.
 */
export class DeductibleSelect {
  private readonly header: Locator;
  private readonly options: Locator;

  constructor(
    page: Page,
    private readonly priceSummary: PriceSummary,
  ) {
    const section = page
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { name: 'Deductible', exact: true }) });
    this.header = section.getByTestId('select-header');
    // The options are always in the DOM, hidden until the select is opened, so
    // they are found by attribute: role queries skip hidden elements.
    this.options = section.locator('[role=option]');
  }

  /** The amount currently selected. */
  async currentValue(): Promise<Money> {
    return Money.parse((await this.header.textContent()) ?? '');
  }

  /** Every amount on offer, in the order listed. */
  async optionAmounts(): Promise<Money[]> {
    await this.header.waitFor();
    const texts = await this.options.allTextContents();
    return texts.map((text) => Money.parse(text.trim()));
  }

  async select(amount: Money): Promise<void> {
    const amounts = await this.optionAmounts();
    const index = amounts.findIndex((candidate) => candidate.equals(amount));
    if (index === -1) {
      throw new Error(
        `The Deductible has no ${amount.format()} option; it offers ${amounts.map(String).join(', ')}`,
      );
    }
    await this.priceSummary.afterUpdate(async () => {
      await this.header.click();
      await this.options.nth(index).click();
    });
  }
}

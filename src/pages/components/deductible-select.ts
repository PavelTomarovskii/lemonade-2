import type { Locator, Page } from '@playwright/test';
import { Money } from '../../money';

/**
 * The Deductible dropdown. It is found by its "Deductible" heading, because its test ids
 * are shared with the start date controls.
 */
export class DeductibleSelect {
  private readonly root: Locator;
  private readonly options: Locator;

  constructor(page: Page) {
    this.root = page
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { name: 'Deductible', exact: true, level: 2 }) });
    this.options = this.root.getByRole('option', { includeHidden: true });
  }

  /** Every Deductible on offer, in the order listed. */
  async amounts(): Promise<Money[]> {
    return (await this.options.allTextContents()).map((text) => Money.parse(text.trim()));
  }

  async value(): Promise<Money> {
    return Money.parse((await this.root.getByTestId('select-header').textContent()) ?? '');
  }

  async select(amount: Money): Promise<void> {
    const index = (await this.amounts()).findIndex((offered) => offered.equals(amount));
    if (index === -1) throw new Error(`No Deductible of ${amount.toString()} is offered`);
    await this.root.getByTestId('select').click();
    await this.options.nth(index).click();
  }
}

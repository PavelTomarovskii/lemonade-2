import type { Locator, Page } from '@playwright/test';
import { Money } from '../../money';
import { exactText } from './exact-text';

/**
 * The Deductible dropdown. It is found by its "Deductible" heading, because its test ids
 * are shared with the start date controls.
 */
export class DeductibleSelect {
  private readonly root: Locator;
  private readonly options: Locator;
  private readonly selected: Locator;

  constructor(page: Page) {
    this.root = page
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { name: 'Deductible', exact: true, level: 2 }) });
    this.options = this.root.getByRole('option', { includeHidden: true });
    this.selected = this.root.getByTestId('select-header');
  }

  /** Every Deductible on offer, in the order listed. */
  async amounts(): Promise<Money[]> {
    return (await this.options.allTextContents()).map((text) => Money.parse(text.trim()));
  }

  async value(): Promise<Money> {
    return Money.parse((await this.selected.textContent()) ?? '');
  }

  /**
   * Chooses a Deductible and waits until the select shows it. The Price follows a little later.
   * Does nothing when it is already chosen: the open list does not let you pick it again.
   */
  async select(amount: Money): Promise<void> {
    if ((await this.value()).equals(amount)) return;
    const index = (await this.amounts()).findIndex((offered) => offered.equals(amount));
    if (index === -1) throw new Error(`No Deductible of ${amount.toString()} is offered`);
    const option = this.options.nth(index);
    const label = ((await option.textContent()) ?? '').trim();
    await this.root.getByTestId('select').click();
    await option.click();
    await this.selected.filter({ hasText: exactText(label) }).waitFor();
  }
}

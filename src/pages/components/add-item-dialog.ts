import type { Locator, Page } from '@playwright/test';
import { Money } from '../../money';
import { claimedImpactOf, formDialog } from './dialogs';

const MIN_VALUE = Money.fromCents(100_000);
const MAX_VALUE = Money.fromCents(5_000_000);

/**
 * The two-step dialog that adds a Valuable item. Step one takes the value; step two shows
 * "This is important". Both steps share one action button, which reads "Add (+$x)/MO" and then
 * "Got it", so the button is found by its class. Holds no assertions.
 */
export class AddItemDialog {
  private readonly root: Locator;
  private readonly valueInput: Locator;
  private readonly action: Locator;
  private readonly error: Locator;

  constructor(private readonly page: Page) {
    this.root = formDialog(page);
    this.valueInput = this.root.getByRole('textbox', { name: 'input-field' });
    this.action = this.root.locator('button.item-action');
    this.error = this.root.locator('[aria-label=error-message]');
  }

  async waitUntilOpen(): Promise<void> {
    await this.valueInput.waitFor();
  }

  /**
   * Types the value key by key, so validation re-runs, then leaves the field, which is when the
   * action button's claimed Price impact refreshes. A value inside the allowed range is
   * simulated by the page, so this returns once that answer is in.
   */
  async enterValue(value: Money): Promise<void> {
    const digits = String(value.cents / 100);
    const simulated = this.isInRange(value)
      ? this.page.waitForResponse((response) =>
          new URL(response.url()).pathname.endsWith('/simulation/scheduled-item'),
        )
      : undefined;
    await this.valueInput.clear();
    await this.valueInput.pressSequentially(digits);
    await this.valueInput.press('Tab');
    await simulated;
    // Let the page render the answer it has just received.
    await this.page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
  }

  /** The monthly Price impact the action button claims for the value entered. */
  async claimedImpact(): Promise<Money> {
    return claimedImpactOf((await this.action.locator('span').first().textContent()) ?? '');
  }

  /**
   * The validation message the page shows for the value entered, or null when it shows none.
   * The page validates after a short debounce, and a message from an earlier value stays up
   * until then, so this can lag: to read the message for an invalid value use
   * `waitForValidationError`. The absence of a message cannot be waited for.
   */
  async validationError(): Promise<string | null> {
    const text = ((await this.error.textContent()) ?? '').trim();
    return text === '' ? null : text;
  }

  /** Waits for the validation message to appear, then returns it. */
  async waitForValidationError(): Promise<string> {
    await this.error.filter({ hasText: /\S/ }).waitFor();
    return (await this.validationError()) ?? '';
  }

  async canConfirm(): Promise<boolean> {
    return this.action.isEnabled();
  }

  /** Confirms the value (step one), moving on to "This is important". */
  async confirmValue(): Promise<void> {
    await this.action.click();
    await this.action.getByText('Got it').waitFor();
  }

  /** Confirms "This is important" (step two), which adds the item and closes the dialog. */
  async confirmImportant(): Promise<void> {
    await this.action.click();
  }

  async waitUntilClosed(): Promise<void> {
    await this.root.waitFor({ state: 'hidden' });
  }

  private isInRange(value: Money): boolean {
    return !value.isLessThan(MIN_VALUE) && !value.isGreaterThan(MAX_VALUE);
  }
}

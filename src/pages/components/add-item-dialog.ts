import type { Locator, Page } from '@playwright/test';
import type { Money } from '../../money';
import { openModal, settledClaim } from './modal';

/**
 * The two-step dialog that adds a Valuable item: enter its value, confirm it ("Add"), then
 * acknowledge the notice ("Got it"). Both steps share one call-to-action button.
 */
export class AddItemDialog {
  /** The validation error, shown only while the entered value is invalid. */
  readonly errorMessage: Locator;
  private readonly root: Locator;
  private readonly valueInput: Locator;
  private readonly callToAction: Locator;

  constructor(private readonly page: Page) {
    this.root = openModal(page);
    this.valueInput = this.root.getByRole('textbox', { name: 'input-field', exact: true });
    // One button serves both steps, and its accessible name changes between them ("Add (+$x)/MO",
    // then "Got it"), so it is found by its stable `item-action` class instead of its name.
    this.callToAction = this.root.locator('button.item-action');
    this.errorMessage = this.root.getByLabel('error-message', { exact: true });
  }

  async waitUntilOpen(): Promise<void> {
    await this.valueInput.waitFor();
  }

  /**
   * Types the value key by key and leaves the field, as a customer would: the dialog only
   * validates and re-prices on real keystrokes and blur.
   */
  async enterValue(value: Money): Promise<void> {
    const digits = String(value.wholeDollars());
    await this.valueInput.click();
    await this.valueInput.press('ControlOrMeta+a');
    await this.valueInput.pressSequentially(digits);
    await this.valueInput.press('Tab');
  }

  /** The Price impact the dialog claims for the entered value. */
  async claimedPriceImpact(): Promise<Money> {
    return settledClaim(this.page, this.callToAction);
  }

  async canConfirm(): Promise<boolean> {
    return this.callToAction.isEnabled();
  }

  /** Step 1: "Add". The Price does not change yet. */
  async confirmValue(): Promise<void> {
    await this.callToAction.click();
  }

  /** Step 2: "Got it". The dialog closes and the item is added. */
  async acknowledge(): Promise<void> {
    await this.callToAction.click();
    await this.root.waitFor({ state: 'hidden' });
  }

  /** Closes the dialog without adding anything. */
  async close(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.root.waitFor({ state: 'hidden' });
  }
}

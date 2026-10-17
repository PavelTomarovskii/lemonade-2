import type { Locator, Page } from '@playwright/test';
import { Money } from '../../money';

/**
 * The dialog the Add item and Add-on flows open: the inner `div[role=dialog]` that holds a
 * "close dialog" button. `getByRole('dialog')` would also match the outer native dialog and the
 * cookie banner, which stays in the DOM.
 */
export function formDialog(page: Page): Locator {
  return page
    .locator('div[role=dialog]')
    .filter({ has: page.getByRole('button', { name: 'close dialog' }) });
}

/** The "ARE YOU SURE?" dialog that every removal asks for. */
export class ConfirmDialog {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.locator('div[role=dialog]').filter({ hasText: 'are you sure?' });
  }

  async confirm(): Promise<void> {
    await this.root.getByRole('button', { name: 'Yes', exact: true }).click();
  }
}

const CLAIMED_IMPACT = /\(([+-]\$[\d,]+(?:\.\d{1,2})?)\)/;

/**
 * The monthly Price impact a dialog's action button claims, e.g. "Add (+$0.92)/MO". A button
 * that claims none (a free Add-on's "Add") claims nothing: zero.
 */
export function claimedImpactOf(buttonText: string): Money {
  const match = CLAIMED_IMPACT.exec(buttonText);
  return match?.[1] ? Money.parseMonthlyImpact(match[1]) : Money.ZERO;
}

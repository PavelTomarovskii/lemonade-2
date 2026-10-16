import type { Locator, Page } from '@playwright/test';
import { Money } from '../../money';
import { readSettled } from '../../support/settled';

/**
 * The dialog currently open over the page. Each one is a `role=dialog` element inside a native
 * open `<dialog>`; scoping to that excludes the cookie banner, which is a dialog too.
 */
export function openModal(page: Page): Locator {
  return page.locator('dialog[open]').getByRole('dialog');
}

/**
 * The Price impact a dialog's button claims, e.g. "Add (+$1.67)/MO". The claim refreshes
 * shortly after the form changes, with no visible loading state, so it is read once settled.
 */
export async function settledClaim(page: Page, button: Locator): Promise<Money> {
  return readSettled(page, async () => {
    const label = await button.textContent();
    const claim = /\(([+-]?\$[\d,]+(?:\.\d{1,2})?)\)/.exec(label ?? '')?.[1];
    if (claim === undefined) throw new Error(`No Price impact claimed in "${String(label)}"`);
    return Money.parse(claim);
  });
}

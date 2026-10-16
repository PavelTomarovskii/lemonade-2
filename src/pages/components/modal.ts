import type { Locator, Page } from '@playwright/test';

/**
 * The dialog currently open over the page. Each one is a `role=dialog` element inside a native
 * open `<dialog>`; scoping to that excludes the cookie banner, which is a dialog too.
 */
export function openModal(page: Page): Locator {
  return page.locator('dialog[open]').getByRole('dialog');
}

/** Reads the Price impact a dialog's call to action claims, e.g. "Add (+$1.67)/MO". */
export function claimInLabel(label: string | null): string | undefined {
  return /\(([+-]?\$[\d,]+(?:\.\d{1,2})?)\)/.exec(label ?? '')?.[1];
}

import type { Locator, Page } from '@playwright/test';

/**
 * A titled area of the Quote page. Most areas have no landmark role, so the area is the
 * element that directly holds its `h2`.
 */
export function sectionTitled(page: Page, title: string): Locator {
  return page.getByRole('heading', { name: title, exact: true, level: 2 }).locator('xpath=..');
}

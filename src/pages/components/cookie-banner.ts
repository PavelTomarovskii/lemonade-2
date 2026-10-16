import type { Locator, Page } from '@playwright/test';

/** The cookie consent banner shown on every fresh browser context. */
export class CookieBanner {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('dialog', { name: 'lemonade and cookies' });
  }

  async rejectAll(): Promise<void> {
    await this.root.getByRole('button', { name: 'Reject all' }).click();
    await this.root.waitFor({ state: 'hidden' });
  }
}

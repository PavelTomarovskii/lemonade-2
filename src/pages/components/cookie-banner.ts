import type { Locator, Page } from '@playwright/test';

/** The cookie consent dialog that overlays every freshly opened Quote. */
export class CookieBanner {
  private readonly rejectAll: Locator;

  constructor(page: Page) {
    this.rejectAll = page.getByRole('button', { name: 'Reject all' });
  }

  async dismiss(): Promise<void> {
    await this.rejectAll.click();
  }
}

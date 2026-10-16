import type { Locator, Page } from '@playwright/test';
import { openModal } from './modal';

/** The "Are you sure?" dialog shown before removing a Valuable item or an Add-on. */
export class ConfirmDialog {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = openModal(page);
  }

  async confirm(): Promise<void> {
    await this.root.getByRole('button', { name: 'Yes', exact: true }).click();
    await this.root.waitFor({ state: 'hidden' });
  }

  async cancel(): Promise<void> {
    await this.root.getByRole('button', { name: 'Cancel', exact: true }).click();
    await this.root.waitFor({ state: 'hidden' });
  }
}

import type { Locator, Page } from '@playwright/test';
import { Money } from '../../money';
import { AddItemDialog } from './add-item-dialog';
import { ConfirmDialog } from './confirm-dialog';
import { sectionTitled } from './section';

export type ValuableItemKind =
  'Jewelry' | 'Bicycles' | 'Cameras' | 'Musical instruments' | 'Fine art';

const TILE_LABELS: Readonly<Record<ValuableItemKind, string>> = {
  Jewelry: 'jewelry',
  Bicycles: 'bicycles',
  Cameras: 'cameras',
  'Musical instruments': 'musical instruments',
  'Fine art': 'fine art',
};

/** The "Add Extra Coverage" area: one tile per kind of Valuable item. */
export class ValuableItems {
  private readonly section: Locator;

  constructor(private readonly page: Page) {
    this.section = sectionTitled(page, 'Add Extra Coverage');
  }

  /** Opens the add dialog for a kind of item, without entering anything. */
  async openAddDialog(kind: ValuableItemKind): Promise<AddItemDialog> {
    await this.tile(kind).getByRole('button', { name: 'add', exact: true }).click();
    const dialog = new AddItemDialog(this.page);
    await dialog.waitUntilOpen();
    return dialog;
  }

  /**
   * Adds an item through every step of the dialog, up to and including "Got it".
   * Returns the Price impact the dialog claimed.
   */
  async add(kind: ValuableItemKind, value: Money): Promise<Money> {
    const dialog = await this.openAddDialog(kind);
    await dialog.enterValue(value);
    const claimed = await dialog.claimedPriceImpact();
    await dialog.confirmValue();
    await dialog.acknowledge();
    await this.removeButton(kind).waitFor();
    return claimed;
  }

  /** Removes an item, confirming the removal. */
  async remove(kind: ValuableItemKind): Promise<void> {
    await this.removeButton(kind).click();
    await new ConfirmDialog(this.page).confirm();
    await this.removeButton(kind).waitFor({ state: 'detached' });
  }

  /** The Price impact shown on an added item's tile. */
  async tilePriceImpact(kind: ValuableItemKind): Promise<Money> {
    const text = await this.tile(kind)
      .getByText(/^[+-]\$[\d,.]+\/MO$/i)
      .textContent();
    return Money.parse(text ?? '');
  }

  /** The kinds of item currently added, in tile order. */
  async added(): Promise<ValuableItemKind[]> {
    const kinds = Object.keys(TILE_LABELS) as ValuableItemKind[];
    const isAdded = await Promise.all(kinds.map((kind) => this.removeButton(kind).isVisible()));
    return kinds.filter((_, index) => isAdded[index]);
  }

  private tile(kind: ValuableItemKind): Locator {
    return this.section.getByLabel(TILE_LABELS[kind], { exact: true });
  }

  private removeButton(kind: ValuableItemKind): Locator {
    return this.tile(kind).getByRole('button', { name: 'delete', exact: true });
  }
}

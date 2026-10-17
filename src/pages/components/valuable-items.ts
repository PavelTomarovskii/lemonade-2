import type { Locator, Page } from '@playwright/test';
import { Money } from '../../money';
import { AddItemDialog } from './add-item-dialog';
import { ConfirmDialog } from './dialogs';
import type { PriceSummary } from './price-summary';

/** The kinds of Valuable item, mapped to the label each one's tile carries. */
export const ITEM_TILE_LABELS = {
  jewelry: 'jewelry',
  bicycles: 'bicycles',
  cameras: 'cameras',
  musicalInstruments: 'musical instruments',
  fineArt: 'fine art',
} as const;

export type ItemKind = keyof typeof ITEM_TILE_LABELS;

export interface ListedItem {
  kind: ItemKind;
  value: Money;
}

const TILE_IMPACT = /\+\$[\d,.]+\/MO/i;

const ITEM_KINDS = Object.keys(ITEM_TILE_LABELS) as ItemKind[];

/**
 * The Valuable items section: one tile per kind. Adding or removing an item changes the Price,
 * so both return once that update has finished.
 */
export class ValuableItems {
  readonly addDialog: AddItemDialog;
  private readonly confirmDialog: ConfirmDialog;

  constructor(
    private readonly page: Page,
    private readonly priceSummary: PriceSummary,
  ) {
    this.addDialog = new AddItemDialog(page);
    this.confirmDialog = new ConfirmDialog(page);
  }

  /** Opens the add dialog for `kind`, leaving its steps to the caller. */
  async openAddDialog(kind: ItemKind): Promise<AddItemDialog> {
    await this.tile(kind).getByRole('button', { name: 'add' }).click();
    await this.addDialog.waitUntilOpen();
    return this.addDialog;
  }

  /** Adds an item through every step of the dialog; returns the Price impact the dialog claimed. */
  async add(kind: ItemKind, value: Money): Promise<Money> {
    const dialog = await this.openAddDialog(kind);
    await dialog.enterValue(value);
    const claimed = await dialog.claimedImpact();
    await dialog.confirmValue();
    await this.priceSummary.afterUpdate(() => dialog.confirmImportant());
    await dialog.waitUntilClosed();
    return claimed;
  }

  /** Removes the item of `kind`, including the confirmation. */
  async remove(kind: ItemKind): Promise<void> {
    await this.tile(kind).getByRole('button', { name: 'delete' }).click();
    await this.priceSummary.afterUpdate(() => this.confirmDialog.confirm());
  }

  /** The monthly Price impact on the item's tile, exactly as shown (e.g. "+$4.6/MO"). */
  async tileMonthlyImpactText(kind: ItemKind): Promise<string> {
    const text = await this.tile(kind).getByText(TILE_IMPACT).last().textContent();
    return firstMatch(TILE_IMPACT, text).toUpperCase();
  }

  /** The monthly Price impact shown on the item's tile, read as an amount. */
  async tileMonthlyImpact(kind: ItemKind): Promise<Money> {
    return Money.parseMonthlyImpact(await this.tileMonthlyImpactText(kind));
  }

  /** The items currently added, in the order the tiles are shown. */
  async list(): Promise<ListedItem[]> {
    const found = await Promise.all(
      ITEM_KINDS.map(async (kind) => {
        const tile = this.tile(kind);
        if ((await tile.getByRole('button', { name: 'delete' }).count()) === 0) {
          return undefined;
        }
        const text = await tile
          .getByText(/\$[\d,]+/)
          .first()
          .textContent();
        return { kind, value: Money.parse(firstMatch(/\$[\d,]+/, text)) };
      }),
    );
    return found.filter((item) => item !== undefined);
  }

  private tile(kind: ItemKind): Locator {
    return this.page.locator(`[aria-label="${ITEM_TILE_LABELS[kind]}"]`);
  }
}

/** Tile text carries icons and other text around the amount, so the amount is picked out. */
function firstMatch(pattern: RegExp, text: string | null): string {
  const match = pattern.exec(text ?? '');
  if (!match) {
    throw new Error(`Cannot find ${String(pattern)} in the tile text "${text ?? ''}"`);
  }
  return match[0];
}

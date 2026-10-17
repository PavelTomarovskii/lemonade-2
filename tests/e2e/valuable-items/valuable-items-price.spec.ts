import { expect, test } from '../../../src/fixtures';
import { expectKnownBug, type KnownBug } from '../../../src/known-bug';
import { Money } from '../../../src/money';
import { ITEM_TILE_LABELS, type ItemKind } from '../../../src/pages/components/valuable-items';
import { Tag } from '../../../src/tags';

const TILE_FORMAT_BUG: KnownBug = {
  issue: 'https://github.com/PavelTomarovskii/lemonade-2/issues/31',
};

/**
 * Each kind is added at $5,000. Jewelry and Cameras then claim +$4.60, a Price impact ending in
 * a zero, which is the case where the tile drops the trailing zero (issue #31).
 */
const VALUE = Money.fromCents(500_000);
const ITEMS: readonly { kind: ItemKind; tileBug?: KnownBug }[] = [
  { kind: 'jewelry', tileBug: TILE_FORMAT_BUG },
  { kind: 'bicycles' },
  { kind: 'cameras', tileBug: TILE_FORMAT_BUG },
  { kind: 'musicalInstruments' },
  { kind: 'fineArt' },
];

test.describe('Valuable items price behaviour', { tag: Tag.valuableItems }, () => {
  for (const { kind, tileBug } of ITEMS) {
    test.describe(ITEM_TILE_LABELS[kind], () => {
      test('charges the claimed Price impact when added, and returns to the Baseline price when removed', async ({
        quote,
        baselinePrice,
      }) => {
        const claimed = await quote.valuableItems.add(kind, VALUE);
        expect(claimed.isGreaterThan(Money.ZERO), 'the dialog claims a Price impact').toBe(true);
        expect(await quote.priceSummary.monthlyPrice()).toEqual(baselinePrice.plus(claimed));

        await quote.valuableItems.remove(kind);
        expect(await quote.valuableItems.list()).toEqual([]);
        expect(await quote.priceSummary.monthlyPrice()).toEqual(baselinePrice);
      });

      test("shows the claimed Price impact on the item's tile", async ({ quote }) => {
        expectKnownBug(tileBug);

        const claimed = await quote.valuableItems.add(kind, VALUE);

        expect(await quote.valuableItems.tileMonthlyImpactText(kind)).toBe(
          `+${claimed.format()}/MO`,
        );
      });
    });
  }
});

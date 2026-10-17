import { expect, test } from '../../../src/fixtures';
import { expectKnownBug } from '../../../src/known-bug';
import { Money } from '../../../src/money';
import { ITEM_TILE_LABELS } from '../../../src/pages/components/valuable-items';
import { ITEM_KINDS, ITEM_VALUE, knownBugFor } from '../../../src/test-data/valuable-items';
import { Tag } from '../../../src/tags';

test.describe('Valuable items price behaviour', { tag: Tag.valuableItems }, () => {
  for (const kind of ITEM_KINDS) {
    test.describe(ITEM_TILE_LABELS[kind], () => {
      test('charges the claimed Price impact when added, and returns to the Baseline price when removed', async ({
        quote,
        baselinePrice,
      }) => {
        const claimed = await quote.valuableItems.add(kind, ITEM_VALUE);
        expect(claimed.isGreaterThan(Money.ZERO), 'the dialog claims a Price impact').toBe(true);
        expect(await quote.priceSummary.monthlyPrice()).toEqual(baselinePrice.plus(claimed));

        await quote.valuableItems.remove(kind);
        expect(await quote.valuableItems.list()).toEqual([]);
        expect(await quote.priceSummary.monthlyPrice()).toEqual(baselinePrice);
      });

      test("shows the claimed Price impact on the item's tile", async ({ quote }) => {
        expectKnownBug(knownBugFor(kind));

        const claimed = await quote.valuableItems.add(kind, ITEM_VALUE);

        expect(await quote.valuableItems.tileMonthlyImpactText(kind)).toBe(
          `+${claimed.format()}/MO`,
        );
      });
    });
  }
});

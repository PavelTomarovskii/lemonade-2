import { expect, test } from '../../../src/fixtures';
import { ACCEPTED_VALUES, REJECTED_VALUES } from '../../../src/test-data/valuable-items';
import { Tag } from '../../../src/tags';

// The range is the same for every kind, so one kind stands for all of them.
const KIND = 'jewelry';

test.describe('Valuable item value bounds', { tag: Tag.valuableItems }, () => {
  for (const value of ACCEPTED_VALUES) {
    test(`accepts ${value.format()} and adds the item`, async ({ quote }) => {
      await quote.valuableItems.add(KIND, value);

      expect(await quote.valuableItems.list()).toEqual([{ kind: KIND, value }]);
    });
  }

  for (const { value, message } of REJECTED_VALUES) {
    test(`rejects ${value.format()} with a validation message and adds nothing`, async ({
      quote,
      baselinePrice,
    }) => {
      const dialog = await quote.valuableItems.openAddDialog(KIND);

      await dialog.enterValue(value);

      await expect
        .poll(() => dialog.validationError(), 'the page shows a validation message')
        .toMatch(message);
      await expect.poll(() => dialog.canConfirm(), 'the value cannot be confirmed').toBe(false);

      await dialog.close();
      expect(await quote.valuableItems.list()).toEqual([]);
      expect(await quote.priceSummary.monthlyPrice()).toEqual(baselinePrice);
    });
  }
});

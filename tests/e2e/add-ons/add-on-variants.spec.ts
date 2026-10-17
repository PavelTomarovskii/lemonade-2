import { expect, test } from '../../../src/fixtures';
import { ADD_ON_HEADINGS } from '../../../src/pages/components/add-on';
import { ADD_ON_VARIANTS } from '../../../src/test-data/add-ons';
import { Tag } from '../../../src/tags';

test.describe('Add-on configuration variants', { tag: Tag.addOns }, () => {
  for (const { name, configuration, options } of ADD_ON_VARIANTS) {
    test.describe(`${ADD_ON_HEADINGS[name]} ${configuration}`, () => {
      test('claims a higher Price impact and charges exactly that', async ({
        quote,
        baselinePrice,
      }) => {
        const addOn = quote.addOn(name);
        const sectionClaim = await addOn.claimedMonthlyImpact();

        const claimed = await addOn.switchOn(options);

        expect(
          claimed.isGreaterThan(sectionClaim),
          'the configuration claims more than the section does',
        ).toBe(true);
        expect(await quote.priceSummary.monthlyPrice()).toEqual(baselinePrice.plus(claimed));
      });

      test('returns to the Baseline price when switched off', async ({ quote, baselinePrice }) => {
        const addOn = quote.addOn(name);
        await addOn.switchOn(options);

        await addOn.switchOff();

        expect(await addOn.isOn()).toBe(false);
        expect(await quote.priceSummary.monthlyPrice()).toEqual(baselinePrice);
      });
    });
  }
});

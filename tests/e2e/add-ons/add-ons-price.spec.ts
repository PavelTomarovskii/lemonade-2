import { expect, test } from '../../../src/fixtures';
import { Money } from '../../../src/money';
import { ADD_ON_HEADINGS } from '../../../src/pages/components/add-on';
import { ADD_ONS } from '../../../src/test-data/add-ons';
import { Tag } from '../../../src/tags';

test.describe('Add-ons price behaviour', { tag: Tag.addOns }, () => {
  for (const { name, free } of ADD_ONS) {
    test.describe(ADD_ON_HEADINGS[name], () => {
      test('returns to the Baseline price when switched off', async ({ quote, baselinePrice }) => {
        const addOn = quote.addOn(name);
        await addOn.switchOn();

        await addOn.switchOff();

        expect(await addOn.isOn()).toBe(false);
        expect(await quote.priceSummary.monthlyPrice()).toEqual(baselinePrice);
      });

      if (free) {
        test('leaves the Price unchanged when switched on', async ({ quote, baselinePrice }) => {
          const addOn = quote.addOn(name);
          expect(await addOn.isFree(), 'the page labels the Add-on as free').toBe(true);

          const claimed = await addOn.switchOn();

          expect(await addOn.isOn()).toBe(true);
          expect(claimed, 'a free Add-on claims no Price impact').toEqual(Money.ZERO);
          expect(await quote.priceSummary.monthlyPrice()).toEqual(baselinePrice);
        });
      } else {
        test('charges the claimed Price impact when switched on', async ({
          quote,
          baselinePrice,
        }) => {
          const addOn = quote.addOn(name);
          expect(await addOn.isFree(), 'the page labels the Add-on as paid').toBe(false);

          const claimed = await addOn.switchOn();

          expect(await addOn.isOn()).toBe(true);
          expect(claimed.isGreaterThan(Money.ZERO), 'the Add-on claims a Price impact').toBe(true);
          expect(await quote.priceSummary.monthlyPrice()).toEqual(baselinePrice.plus(claimed));
        });
      }
    });
  }
});

import { expect, test } from '../../../src/fixtures';
import { Money } from '../../../src/money';
import { PRICE_CHANGES } from '../../../src/test-data/price-changes';
import { Tag } from '../../../src/tags';

const MONTHS_IN_YEAR = 12;

const hasMoved = (direction: 'raises' | 'lowers', from: Money, to: Money): boolean =>
  direction === 'raises' ? to.isGreaterThan(from) : to.isLessThan(from);

const twelveTimes = (price: Money): Money => Money.fromCents(price.cents * MONTHS_IN_YEAR);

test.describe('Price display consistency', { tag: Tag.priceDisplay }, () => {
  test('shows the same Price on every Pay button of a fresh Quote', async ({
    quote,
    baselinePrice,
  }) => {
    expect(await quote.priceSummary.monthlyPayPrices()).toEqual([
      baselinePrice,
      baselinePrice,
      baselinePrice,
    ]);
  });

  for (const change of PRICE_CHANGES) {
    const moves = change.direction === 'raises' ? 'rises' : 'falls';

    test.describe(`after ${change.name}`, () => {
      test('every Pay button shows the same Price', async ({ quote }) => {
        await change.apply(quote);

        const [main, ...others] = await quote.priceSummary.monthlyPayPrices();
        expect(others, 'the other Pay buttons agree with the main one').toEqual([main, main]);
      });

      test('the List price stays above the Price by the same amount', async ({ quote }) => {
        const gapAtBaseline = (await quote.priceSummary.monthlyListPrice()).minus(
          await quote.priceSummary.monthlyPrice(),
        );
        expect(gapAtBaseline.isGreaterThan(Money.ZERO), 'the List price is above the Price').toBe(
          true,
        );

        await change.apply(quote);

        const gap = (await quote.priceSummary.monthlyListPrice()).minus(
          await quote.priceSummary.monthlyPrice(),
        );
        expect(gap).toEqual(gapAtBaseline);
      });

      test(`the annual figure ${moves}`, async ({ quote }) => {
        await quote.priceSummary.switchToAnnual();
        const annualAtBaseline = await quote.priceSummary.annualPrice();
        await quote.priceSummary.switchToMonthly();

        await change.apply(quote);
        await quote.priceSummary.switchToAnnual();
        const annual = await quote.priceSummary.annualPrice();

        expect(
          hasMoved(change.direction, annualAtBaseline, annual),
          `the annual figure ${moves}, from ${annualAtBaseline.format()} to ${annual.format()}`,
        ).toBe(true);
      });
    });
  }

  test.describe('annual Billing period', () => {
    test('shows an annual figure below twelve times the Price', async ({ quote }) => {
      const monthly = await quote.priceSummary.monthlyPrice();

      await quote.priceSummary.switchToAnnual();

      const annual = await quote.priceSummary.annualPrice();
      expect(annual.isLessThan(twelveTimes(monthly))).toBe(true);
    });

    test('shows the same annual figure on every Pay button', async ({ quote }) => {
      await quote.priceSummary.switchToAnnual();

      const [main, ...others] = await quote.priceSummary.annualPayPrices();
      expect(others, 'the other Pay buttons agree with the main one').toEqual([main, main]);
    });
  });
});

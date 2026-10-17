import { expect, test } from '../../../src/fixtures';
import { Money } from '../../../src/money';
import { PRICE_CHANGES } from '../../../src/test-data/price-changes';
import { Tag } from '../../../src/tags';

const MONTHS_IN_YEAR = 12;

const hasMoved = (direction: 'raises' | 'lowers', from: Money, to: Money): boolean =>
  direction === 'raises' ? to.isGreaterThan(from) : to.isLessThan(from);

const distinct = (prices: Money[]): string[] => [...new Set(prices.map(String))];

const twelveTimes = (price: Money): Money => Money.fromCents(price.cents * MONTHS_IN_YEAR);

test.describe('Price display consistency', { tag: Tag.priceDisplay }, () => {
  test('shows the same Price on every Pay button of a fresh Quote', async ({
    quote,
    baselinePrice,
  }) => {
    const prices = await quote.priceSummary.monthlyPayPrices();
    expect(distinct(prices), 'every Pay button shows the same Price').toEqual([
      baselinePrice.format(),
    ]);
  });

  for (const change of PRICE_CHANGES) {
    const verb = change.direction === 'raises' ? 'rises' : 'falls';

    test.describe(`after ${change.name}`, () => {
      test('every Pay button shows the same Price', async ({ quote }) => {
        await change.apply(quote);

        expect(
          distinct(await quote.priceSummary.monthlyPayPrices()),
          'every Pay button shows the same Price',
        ).toHaveLength(1);
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

      test(`the annual figure ${verb}`, async ({ quote }) => {
        await quote.priceSummary.switchToAnnual();
        const annualAtBaseline = await quote.priceSummary.annualPrice();
        await quote.priceSummary.switchToMonthly();

        await change.apply(quote);
        const monthly = await quote.priceSummary.monthlyPrice();
        await quote.priceSummary.switchToAnnual();
        const annual = await quote.priceSummary.annualPrice();

        expect(
          hasMoved(change.direction, annualAtBaseline, annual),
          `the annual figure ${verb}, from ${annualAtBaseline.format()} to ${annual.format()}`,
        ).toBe(true);
        expect(annual.isLessThan(twelveTimes(monthly)), 'below twelve times the Price').toBe(true);
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

      expect(
        distinct(await quote.priceSummary.annualPayPrices()),
        'every Pay button shows the same Price',
      ).toHaveLength(1);
    });
  });
});

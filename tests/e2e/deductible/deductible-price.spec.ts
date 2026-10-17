import { expect, test } from '../../../src/fixtures';
import { Tag } from '../../../src/tags';

test.describe('Deductible price behaviour', { tag: Tag.deductible }, () => {
  test('lowers the Price at every step as the Deductible rises', async ({ quote }) => {
    const ascending = (await quote.deductible.optionAmounts()).sort((a, b) => a.cents - b.cents);
    expect(ascending.length, 'the Deductible offers several options').toBeGreaterThan(1);

    const cents: number[] = [];
    for (const amount of ascending) {
      await quote.deductible.select(amount);
      cents.push((await quote.priceSummary.monthlyPrice()).cents);
    }

    const strictlyDecreasing = [...new Set(cents)].sort((a, b) => b - a);
    expect(cents, 'the Price falls with every rise of the Deductible').toEqual(strictlyDecreasing);
  });

  test('returns to the Baseline price when the default Deductible is selected again', async ({
    quote,
    baselinePrice,
  }) => {
    const defaultDeductible = await quote.deductible.currentValue();
    const others = (await quote.deductible.optionAmounts()).filter(
      (amount) => !amount.equals(defaultDeductible),
    );

    for (const other of others) {
      await quote.deductible.select(other);
      await quote.deductible.select(defaultDeductible);
      expect(await quote.deductible.currentValue()).toEqual(defaultDeductible);
      expect(
        await quote.priceSummary.monthlyPrice(),
        `back from ${other.format()} to the default`,
      ).toEqual(baselinePrice);
    }
  });
});

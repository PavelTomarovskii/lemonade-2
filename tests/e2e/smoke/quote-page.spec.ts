import { expect, test } from '../../../src/fixtures';
import { Tag } from '../../../src/tags';

test.describe('Quote page', { tag: Tag.smoke }, () => {
  test('a fresh Quote shows the Baseline price', async ({ quote, baselinePrice }) => {
    expect(await quote.priceSummary.monthlyPrice()).toEqual(baselinePrice);
  });
});

import { expect, test } from '../../../src/fixtures';
import { Tag } from '../../../src/tags';

test.describe('Quote page', { tag: Tag.smoke }, () => {
  test('a fresh Quote shows the Baseline price', async ({ quotePage, baselinePrice }) => {
    await expect.poll(() => quotePage.priceSummary.price()).toEqual(baselinePrice);
  });
});

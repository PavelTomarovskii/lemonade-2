import { expect, test } from '../../../src/fixtures';
import { Money } from '../../../src/money';
import { Tag } from '../../../src/tags';
import { DEDUCTIBLE_AMOUNTS, DEFAULT_DEDUCTIBLE } from '../../../src/test-data/deductibles';

test.describe('Deductible select', { tag: Tag.smoke }, () => {
  test('lists its options and changes the selected Deductible', async ({ quotePage }) => {
    const { deductible } = quotePage;
    expect(await deductible.amounts()).toEqual(DEDUCTIBLE_AMOUNTS);
    await expect.poll(() => deductible.value()).toEqual(DEFAULT_DEDUCTIBLE);

    await deductible.select(Money.parse('$1,000'));

    await expect.poll(() => deductible.value()).toEqual(Money.parse('$1,000'));
  });
});

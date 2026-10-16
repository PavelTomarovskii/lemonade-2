import { expect, test } from '../../../src/fixtures';
import { Money } from '../../../src/money';
import { Tag } from '../../../src/tags';

test.describe('Deductible select', { tag: Tag.smoke }, () => {
  test('lists its options and changes the selected Deductible', async ({ quotePage }) => {
    const { deductible } = quotePage;
    expect(await deductible.amounts()).toEqual(
      ['$250', '$500', '$1,000', '$2,500'].map((amount) => Money.parse(amount)),
    );
    await expect.poll(() => deductible.value()).toEqual(Money.parse('$500'));

    await deductible.select(Money.parse('$1,000'));

    await expect.poll(() => deductible.value()).toEqual(Money.parse('$1,000'));
  });
});

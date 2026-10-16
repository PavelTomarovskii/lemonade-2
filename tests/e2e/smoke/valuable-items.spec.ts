import { expect, test } from '../../../src/fixtures';
import { Money } from '../../../src/money';
import { Tag } from '../../../src/tags';

test.describe('Valuable items', { tag: Tag.smoke }, () => {
  test('adds and removes a Valuable item', async ({ quotePage }) => {
    const { valuableItems } = quotePage;
    expect(await valuableItems.added()).toEqual([]);

    await valuableItems.add('Jewelry', Money.parse('$2,000'));
    expect(await valuableItems.added()).toEqual(['Jewelry']);

    await valuableItems.remove('Jewelry');
    expect(await valuableItems.added()).toEqual([]);
  });
});

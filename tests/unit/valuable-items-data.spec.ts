import { expect, test } from '@playwright/test';
import { ITEM_KINDS, knownBugFor } from '../../src/test-data/valuable-items';

test.describe('Valuable item test data', () => {
  test('a known bug is found only for the kinds it affects', () => {
    expect(ITEM_KINDS.map((kind) => knownBugFor(kind)?.issue)).toEqual([
      'https://github.com/PavelTomarovskii/lemonade-2/issues/31',
      undefined,
      'https://github.com/PavelTomarovskii/lemonade-2/issues/31',
      undefined,
      undefined,
    ]);
  });
});

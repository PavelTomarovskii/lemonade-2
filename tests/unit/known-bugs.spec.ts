import { expect, test } from '@playwright/test';
import { KnownBug, knownBug } from '../../src/known-bugs';

test.describe('Known bugs', () => {
  test("annotate a test with the bug's GitHub issue", () => {
    expect(knownBug(KnownBug.lossOfUseStepLowersPrice)).toEqual([
      {
        type: 'known bug',
        description: 'https://github.com/PavelTomarovskii/lemonade-2/issues/29',
      },
    ]);
  });

  test('add no annotation when no bug applies', () => {
    expect(knownBug(undefined)).toEqual([]);
  });
});

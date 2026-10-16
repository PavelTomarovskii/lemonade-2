import { expect, test } from '@playwright/test';
import { baselinePriceFor } from '../../src/test-data/quotes';

test.describe('Quote test data', () => {
  test('refuses a Quote that has no known Baseline price', () => {
    expect(() => baselinePriceFor('LQ00AA00001')).toThrow(
      'No Baseline price is known for Quote "LQ00AA00001"; add it to src/test-data/quotes.ts',
    );
  });
});

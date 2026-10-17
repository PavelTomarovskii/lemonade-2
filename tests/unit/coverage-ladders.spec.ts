import { expect, test } from '@playwright/test';
import { Money } from '../../src/money';
import {
  COVERAGE_LADDERS,
  COVERAGE_NAMES,
  knownBugFor,
  neighbouringPairs,
} from '../../src/test-data/coverage-ladders';

test.describe('Coverage ladders', () => {
  test('every ladder is strictly ascending', () => {
    for (const name of COVERAGE_NAMES) {
      for (const pair of neighbouringPairs(COVERAGE_LADDERS[name])) {
        expect(pair.upper.isGreaterThan(pair.lower)).toBe(true);
      }
    }
  });

  test('neighbouring pairs link each step to the next', () => {
    const pairs = neighbouringPairs(COVERAGE_LADDERS.personalLiability);
    expect(pairs.map((pair) => [pair.lower.cents, pair.upper.cents])).toEqual([
      [10_000_000, 30_000_000],
      [30_000_000, 50_000_000],
    ]);
  });

  test('a known bug is found only for exactly its affected pairs', () => {
    const pairs = neighbouringPairs(COVERAGE_LADDERS.lossOfUse);
    expect(pairs.map((pair) => knownBugFor('lossOfUse', pair)?.issue)).toEqual([
      undefined,
      'https://github.com/PavelTomarovskii/lemonade-2/issues/29',
      undefined,
    ]);
    const medical = neighbouringPairs(COVERAGE_LADDERS.medicalPayments);
    expect(medical.map((pair) => knownBugFor('medicalPayments', pair) !== undefined)).toEqual([
      true,
      true,
      true,
      false,
    ]);
    expect(
      knownBugFor('personalProperty', { lower: Money.fromCents(1), upper: Money.fromCents(2) }),
    ).toBeUndefined();
  });
});

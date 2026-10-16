import { expect, test } from '@playwright/test';
import { KnownBug } from '../../src/known-bugs';
import { Money } from '../../src/money';
import { coverageLadder } from '../../src/test-data/coverages';

const money = (text: string): Money => Money.parse(text);

test.describe('Coverage ladders', () => {
  test('pair each value with the next one up', () => {
    const ladder = coverageLadder('Loss of Use', ['$15,000', '$20,000', '$25,000'], '$15,000');

    expect(ladder.steps).toEqual([
      { lower: money('$15,000'), higher: money('$20,000') },
      { lower: money('$20,000'), higher: money('$25,000') },
    ]);
  });

  test('give the bottom, the top and the default of the ladder', () => {
    const ladder = coverageLadder('Loss of Use', ['$15,000', '$20,000', '$25,000'], '$20,000');

    expect(ladder.bottom).toEqual(money('$15,000'));
    expect(ladder.top).toEqual(money('$25,000'));
    expect(ladder.defaultValue).toEqual(money('$20,000'));
  });

  test('mark exactly the step a known bug affects', () => {
    const ladder = coverageLadder('Loss of Use', ['$15,000', '$20,000', '$25,000'], '$15,000', [
      { step: ['$20,000', '$25,000'], bug: KnownBug.lossOfUseStepLowersPrice },
    ]);

    expect(ladder.steps.map((step) => step.bug)).toEqual([
      undefined,
      KnownBug.lossOfUseStepLowersPrice,
    ]);
  });

  test('reject a known bug on values that are not neighbours on the ladder', () => {
    expect(() =>
      coverageLadder('Loss of Use', ['$15,000', '$20,000', '$25,000'], '$15,000', [
        { step: ['$15,000', '$25,000'], bug: KnownBug.lossOfUseStepLowersPrice },
      ]),
    ).toThrow('Loss of Use has no step from $15,000 to $25,000');
  });

  test('reject a default that is not on the ladder', () => {
    expect(() => coverageLadder('Loss of Use', ['$15,000', '$20,000'], '$10,000')).toThrow(
      'Loss of Use has no $10,000 on its ladder',
    );
  });

  test('reject values that do not rise strictly', () => {
    expect(() => coverageLadder('Loss of Use', ['$20,000', '$15,000'], '$15,000')).toThrow(
      "Loss of Use's ladder must rise strictly, lowest value first",
    );
  });
});

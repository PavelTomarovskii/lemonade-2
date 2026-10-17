import { expect, test } from '../../../src/fixtures';
import { Money } from '../../../src/money';
import {
  COVERAGE_HEADINGS,
  type CoverageName,
  type CoverageStepper,
} from '../../../src/pages/components/coverage-stepper';
import { Tag } from '../../../src/tags';

// Each Coverage starts at one end of its ladder (A2), so it can only step away from there first.
const stepUp = (stepper: CoverageStepper) => stepper.stepUp();
const stepDown = (stepper: CoverageStepper) => stepper.stepDown();
const COVERAGES: {
  name: CoverageName;
  away: typeof stepUp;
  back: typeof stepUp;
  canStepBack: (stepper: CoverageStepper) => Promise<boolean>;
}[] = [
  { name: 'personalProperty', away: stepDown, back: stepUp, canStepBack: (s) => s.canStepUp() },
  { name: 'personalLiability', away: stepUp, back: stepDown, canStepBack: (s) => s.canStepDown() },
  { name: 'lossOfUse', away: stepUp, back: stepDown, canStepBack: (s) => s.canStepDown() },
  { name: 'medicalPayments', away: stepUp, back: stepDown, canStepBack: (s) => s.canStepDown() },
];

test.describe('Quote components', { tag: Tag.smoke }, () => {
  for (const { name, away, back, canStepBack } of COVERAGES) {
    test(`the ${COVERAGE_HEADINGS[name]} stepper changes and reads its value`, async ({
      quote,
    }) => {
      const stepper = quote.coverage(name);
      const start = await stepper.currentValue();
      expect(await canStepBack(stepper)).toBe(false);

      await away(stepper);
      expect(await stepper.currentValue()).not.toEqual(start);
      expect(await canStepBack(stepper)).toBe(true);

      await back(stepper);
      expect(await stepper.currentValue()).toEqual(start);
    });
  }

  test('the Deductible select lists its options and changes its value', async ({ quote }) => {
    const { deductible } = quote;
    const options = (await deductible.optionAmounts()).map((amount) => amount.cents);
    expect(options).toEqual([25_000, 50_000, 100_000, 250_000]);
    expect(await deductible.currentValue()).toEqual(Money.fromCents(50_000));

    await deductible.select(Money.fromCents(100_000));
    expect(await deductible.currentValue()).toEqual(Money.fromCents(100_000));
  });
});

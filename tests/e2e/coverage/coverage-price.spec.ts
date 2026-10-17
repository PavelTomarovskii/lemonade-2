import { expect, test } from '../../../src/fixtures';
import { expectKnownBug } from '../../../src/known-bug';
import type { Money } from '../../../src/money';
import {
  COVERAGE_HEADINGS,
  type CoverageStepper,
} from '../../../src/pages/components/coverage-stepper';
import {
  bottomOf,
  COVERAGE_LADDERS,
  COVERAGE_NAMES,
  knownBugFor,
  neighbouringPairs,
  topOf,
} from '../../../src/test-data/coverage-ladders';
import { Tag } from '../../../src/tags';

const wholeDollars = (amount: Money): string => amount.format().replace(/\.00$/, '');

/** Steps the Coverage, one step at a time, until it shows `target`. */
async function stepTo(stepper: CoverageStepper, target: Money): Promise<void> {
  for (;;) {
    const current = await stepper.currentValue();
    if (current.equals(target)) return;
    await (current.isLessThan(target) ? stepper.stepUp() : stepper.stepDown());
  }
}

test.describe('Coverage price behaviour', { tag: Tag.coverage }, () => {
  for (const name of COVERAGE_NAMES) {
    const ladder = COVERAGE_LADDERS[name];
    const heading = COVERAGE_HEADINGS[name];
    const bottom = bottomOf(ladder);
    const top = topOf(ladder);
    // Each Coverage starts at one end of its ladder (A2): it steps away from there first.
    const startValue = ladder.start === 'top' ? top : bottom;
    const farEnd = ladder.start === 'top' ? bottom : top;
    const away = ladder.start === 'top' ? 'stepDown' : 'stepUp';
    const back = ladder.start === 'top' ? 'stepUp' : 'stepDown';

    test.describe(heading, () => {
      test(`starts at the ${ladder.start} of its ladder`, async ({ quote }) => {
        const stepper = quote.coverage(name);
        expect(await stepper.currentValue()).toEqual(startValue);
      });

      for (const pair of neighbouringPairs(ladder)) {
        test(`stepping between ${wholeDollars(pair.lower)} and ${wholeDollars(pair.upper)} moves the Price the right way`, async ({
          quote,
        }) => {
          expectKnownBug(knownBugFor(name, pair));

          const stepper = quote.coverage(name);
          await stepTo(stepper, pair.lower);
          const atLower = await quote.priceSummary.monthlyPrice();

          await stepper.stepUp();
          const atUpper = await quote.priceSummary.monthlyPrice();
          expect(atUpper.isGreaterThan(atLower), 'stepping up raises the Price').toBe(true);

          await stepper.stepDown();
          const backAtLower = await quote.priceSummary.monthlyPrice();
          expect(backAtLower.isLessThan(atUpper), 'stepping down lowers the Price').toBe(true);
        });
      }

      test('disables the increase control at the top and the decrease control at the bottom', async ({
        quote,
      }) => {
        const stepper = quote.coverage(name);

        await stepTo(stepper, top);
        expect(await stepper.canStepUp()).toBe(false);
        expect(await stepper.canStepDown()).toBe(true);

        await stepTo(stepper, bottom);
        expect(await stepper.canStepDown()).toBe(false);
        expect(await stepper.canStepUp()).toBe(true);
      });

      test('returns to the Baseline price after a step away and back', async ({
        quote,
        baselinePrice,
      }) => {
        const stepper = quote.coverage(name);
        const start = await stepper.currentValue();

        await stepper[away]();
        await stepper[back]();

        expect(await stepper.currentValue()).toEqual(start);
        expect(await quote.priceSummary.monthlyPrice()).toEqual(baselinePrice);
      });

      test('returns to the Baseline price after a walk to the far end and back', async ({
        quote,
        baselinePrice,
      }) => {
        const stepper = quote.coverage(name);
        const start = await stepper.currentValue();

        await stepTo(stepper, farEnd);
        await stepTo(stepper, start);

        expect(await quote.priceSummary.monthlyPrice()).toEqual(baselinePrice);
      });
    });
  }
});

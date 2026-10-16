import { expect, test } from '../../src/fixtures';
import { knownBug } from '../../src/known-bugs';
import { Tag } from '../../src/tags';
import { COVERAGE_LADDERS } from '../../src/test-data/coverages';

test.describe('Coverage', { tag: Tag.coverage }, () => {
  for (const ladder of COVERAGE_LADDERS) {
    const { bottom, top, defaultValue } = ladder;

    test.describe(ladder.coverage, () => {
      for (const { lower, higher, bug } of ladder.steps) {
        const [from, to] = [lower.toShortString(), higher.toShortString()];

        test(
          `stepping up from ${from} to ${to} raises the Price`,
          { annotation: knownBug(bug) },
          async ({ quotePage }) => {
            const coverage = quotePage.coverage(ladder.coverage);
            const { priceSummary } = quotePage;
            await coverage.stepTo(lower);
            const priceAtLower = await priceSummary.settledPrice();

            await coverage.stepUp();

            await expect.poll(() => priceSummary.price()).toBeAbove(priceAtLower);
          },
        );

        test(
          `stepping down from ${to} to ${from} lowers the Price`,
          { annotation: knownBug(bug) },
          async ({ quotePage }) => {
            const coverage = quotePage.coverage(ladder.coverage);
            const { priceSummary } = quotePage;
            await coverage.stepTo(higher);
            const priceAtHigher = await priceSummary.settledPrice();

            await coverage.stepDown();

            await expect.poll(() => priceSummary.price()).toBeBelow(priceAtHigher);
          },
        );
      }

      // Starts from the default, so a Coverage that starts at its top (Personal Property)
      // walks down first.
      test(`starts at ${defaultValue.toShortString()} and steps from ${bottom.toShortString()} to ${top.toShortString()}, no further`, async ({
        quotePage,
      }) => {
        const coverage = quotePage.coverage(ladder.coverage);
        expect(await coverage.value()).toEqual(defaultValue);

        await coverage.stepTo(bottom);
        expect(await coverage.canStepDown()).toBe(false);

        for (const value of ladder.values.slice(1)) {
          await coverage.stepUp();
          expect(await coverage.value()).toEqual(value);
        }
        expect(await coverage.canStepUp()).toBe(false);
      });

      const farEnd = defaultValue.equals(top) ? bottom : top;

      test(`stepping to ${farEnd.toShortString()} and back to ${defaultValue.toShortString()} restores the Baseline price`, async ({
        quotePage,
        baselinePrice,
      }) => {
        const coverage = quotePage.coverage(ladder.coverage);
        const { priceSummary } = quotePage;
        await coverage.stepTo(farEnd);
        await expect.poll(() => priceSummary.price()).not.toEqual(baselinePrice);

        await coverage.stepTo(defaultValue);

        expect(await priceSummary.settledPrice()).toEqual(baselinePrice);
      });
    });
  }
});

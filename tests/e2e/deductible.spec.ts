import { expect, test } from '../../src/fixtures';
import { Tag } from '../../src/tags';
import {
  DEDUCTIBLE_AMOUNTS,
  DEDUCTIBLE_STEPS,
  DEFAULT_DEDUCTIBLE,
} from '../../src/test-data/deductibles';

test.describe('Deductible', { tag: Tag.deductible }, () => {
  test(`offers ${DEDUCTIBLE_AMOUNTS.map((amount) => amount.toShortString()).join(', ')}, starting at ${DEFAULT_DEDUCTIBLE.toShortString()}`, async ({
    quotePage,
  }) => {
    expect(await quotePage.deductible.amounts()).toEqual(DEDUCTIBLE_AMOUNTS);
    expect(await quotePage.deductible.value()).toEqual(DEFAULT_DEDUCTIBLE);
  });

  // Neighbouring pairs together span every option, so the Price falls strictly across all of them.
  for (const { lower, higher } of DEDUCTIBLE_STEPS) {
    test(`raising the Deductible from ${lower.toShortString()} to ${higher.toShortString()} lowers the Price`, async ({
      quotePage,
    }) => {
      const { deductible, priceSummary } = quotePage;
      await deductible.select(lower);
      const priceAtLower = await priceSummary.settledPrice();

      await deductible.select(higher);

      await expect.poll(() => priceSummary.price()).toBeBelow(priceAtLower);
    });
  }

  for (const amount of DEDUCTIBLE_AMOUNTS.filter(
    (offered) => !offered.equals(DEFAULT_DEDUCTIBLE),
  )) {
    test(`returning from a ${amount.toShortString()} Deductible to the default restores the Baseline price`, async ({
      quotePage,
      baselinePrice,
    }) => {
      const { deductible, priceSummary } = quotePage;
      await deductible.select(amount);
      await expect.poll(() => priceSummary.price()).not.toEqual(baselinePrice);

      await deductible.select(DEFAULT_DEDUCTIBLE);

      expect(await priceSummary.settledPrice()).toEqual(baselinePrice);
    });
  }
});

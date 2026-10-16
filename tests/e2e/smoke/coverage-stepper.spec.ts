import { expect, test } from '../../../src/fixtures';
import { Money } from '../../../src/money';
import { Tag } from '../../../src/tags';

test.describe('Coverage stepper', { tag: Tag.smoke }, () => {
  test('Personal Property starts at the top of its ladder and steps down', async ({
    quotePage,
  }) => {
    const personalProperty = quotePage.coverage('Personal Property');
    await expect.poll(() => personalProperty.value()).toEqual(Money.parse('$50,000'));
    expect(await personalProperty.canStepUp()).toBe(false);

    await personalProperty.stepDown();

    await expect.poll(() => personalProperty.value()).toEqual(Money.parse('$45,000'));
    expect(await personalProperty.canStepUp()).toBe(true);
  });

  test('Personal Liability starts at the bottom of its ladder and steps up', async ({
    quotePage,
  }) => {
    const personalLiability = quotePage.coverage('Personal Liability');
    await expect.poll(() => personalLiability.value()).toEqual(Money.parse('$100,000'));
    expect(await personalLiability.canStepDown()).toBe(false);

    await personalLiability.stepUp();

    await expect.poll(() => personalLiability.value()).toEqual(Money.parse('$300,000'));
    expect(await personalLiability.canStepDown()).toBe(true);
  });

  test('Loss of Use starts at the bottom of its ladder and steps up', async ({ quotePage }) => {
    const lossOfUse = quotePage.coverage('Loss of Use');
    await expect.poll(() => lossOfUse.value()).toEqual(Money.parse('$15,000'));
    expect(await lossOfUse.canStepDown()).toBe(false);

    await lossOfUse.stepUp();

    await expect.poll(() => lossOfUse.value()).toEqual(Money.parse('$20,000'));
    expect(await lossOfUse.canStepDown()).toBe(true);
  });

  test('Medical Payments starts at the bottom of its ladder and steps up', async ({
    quotePage,
  }) => {
    const medicalPayments = quotePage.coverage('Medical Payments');
    await expect.poll(() => medicalPayments.value()).toEqual(Money.parse('$1,000'));
    expect(await medicalPayments.canStepDown()).toBe(false);

    await medicalPayments.stepUp();

    await expect.poll(() => medicalPayments.value()).toEqual(Money.parse('$2,000'));
    expect(await medicalPayments.canStepDown()).toBe(true);
  });
});

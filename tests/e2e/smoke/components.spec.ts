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

test.describe('Quote components: Valuable items and Add-ons', { tag: Tag.smoke }, () => {
  test('a Valuable item is added, listed and removed', async ({ quote }) => {
    const { valuableItems } = quote;
    const value = Money.fromCents(200_000);

    const claimed = await valuableItems.add('jewelry', value);
    expect(claimed.cents).toBeGreaterThan(0);
    expect(await valuableItems.list()).toEqual([{ kind: 'jewelry', value }]);
    expect(await valuableItems.tileMonthlyImpact('jewelry')).toEqual(claimed);

    await valuableItems.remove('jewelry');
    expect(await valuableItems.list()).toEqual([]);
  });

  test('the add dialog validates the value typed into it', async ({ quote }) => {
    const dialog = await quote.valuableItems.openAddDialog('bicycles');
    await dialog.enterValue(Money.fromCents(6_000_000));
    expect(await dialog.canConfirm()).toBe(false);
    await dialog.enterValue(Money.fromCents(300_000));
    expect(await dialog.canConfirm()).toBe(true);
  });

  test('an Add-on with a form is switched on and off', async ({ quote }) => {
    const waterBackup = quote.addOn('waterBackup');
    expect(await waterBackup.isOn()).toBe(false);
    expect(await waterBackup.isFree()).toBe(false);

    const claimed = await waterBackup.switchOn({ limit: Money.fromCents(1_000_000) });
    expect(claimed.cents).toBeGreaterThan(0);
    expect(await waterBackup.isOn()).toBe(true);

    await waterBackup.switchOff();
    expect(await waterBackup.isOn()).toBe(false);
  });

  test('a free Add-on with a form is switched on and off', async ({ quote }) => {
    const spouse = quote.addOn('spouse');
    expect(await spouse.isFree()).toBe(true);

    expect(await spouse.switchOn()).toEqual(Money.ZERO);
    expect(await spouse.isOn()).toBe(true);

    await spouse.switchOff();
    expect(await spouse.isOn()).toBe(false);
  });

  test('an Add-on without a form is switched on and off', async ({ quote }) => {
    const equipment = quote.addOn('equipmentBreakdown');

    expect((await equipment.switchOn()).cents).toBeGreaterThan(0);
    expect(await equipment.isOn()).toBe(true);

    await equipment.switchOff();
    expect(await equipment.isOn()).toBe(false);
  });
});

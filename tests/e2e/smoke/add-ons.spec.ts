import { expect, test } from '../../../src/fixtures';
import { Tag } from '../../../src/tags';

test.describe('Add-ons', { tag: Tag.smoke }, () => {
  test('switches an Add-on with a form dialog on and off', async ({ quotePage }) => {
    const significantOther = quotePage.addOn('Significant other');
    expect(await significantOther.isOn()).toBe(false);

    await significantOther.switchOn();
    expect(await significantOther.isOn()).toBe(true);

    await significantOther.switchOff();
    expect(await significantOther.isOn()).toBe(false);
  });

  test('switches an Add-on without a form dialog on and off', async ({ quotePage }) => {
    const applianceBreakdown = quotePage.addOn('Appliance breakdown');
    expect(await applianceBreakdown.isOn()).toBe(false);

    await applianceBreakdown.switchOn();
    expect(await applianceBreakdown.isOn()).toBe(true);

    await applianceBreakdown.switchOff();
    expect(await applianceBreakdown.isOn()).toBe(false);
  });

  test('tells free Add-ons from paid ones', async ({ quotePage }) => {
    expect(await quotePage.addOn('Spouse').isFree()).toBe(true);
    expect(await quotePage.addOn('Appliance breakdown').isFree()).toBe(false);
  });
});

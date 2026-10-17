import type { Locator, Page } from '@playwright/test';
import { Money } from '../../money';
import { ConfirmDialog, claimedImpactOf, formDialog } from './dialogs';
import type { PriceSummary } from './price-summary';

/** The Add-ons, mapped to the heading each one has on the page. */
export const ADD_ON_HEADINGS = {
  interestedParty: 'Interested party/Landlord',
  spouse: 'Spouse',
  significantOther: 'Significant other',
  waterBackup: 'Water back-up',
  landlordPropertyDamage: 'Landlord property damage',
  equipmentBreakdown: 'Appliance (a.k.a. Equipment) Breakdown',
} as const;

export type AddOnName = keyof typeof ADD_ON_HEADINGS;

interface PersonOptions {
  firstName?: string;
  lastName?: string;
  email?: string;
}

/** What each Add-on's form takes; every field is optional and falls back to a default. */
export interface AddOnOptions {
  interestedParty: { name?: string; address?: string; email?: string };
  spouse: PersonOptions;
  significantOther: PersonOptions;
  waterBackup: { limit?: Money; firstFloorOrLower?: boolean };
  landlordPropertyDamage: { waterDamage?: boolean; petDamage?: boolean };
  equipmentBreakdown: undefined;
}

const DEFAULT_PERSON = { firstName: 'Sam', lastName: 'Doe', email: 'sam.doe@example.com' };
const DEFAULT_INTERESTED_PARTY = {
  name: 'Jane Landlord',
  address: '1 Main Street, Springfield',
  email: 'jane.landlord@example.com',
};
const PRICE_LABEL = /free|\+\$[\d,]+(?:\.\d{1,2})?\/mo/i;
const WATER_BACKUP_LIMIT_STEPS = [5_000, 10_000];

/**
 * One Add-on, found by its name within its own section: every switch shares the accessible
 * name "Toggle" and has a random id, so neither can identify it. Switching on or off changes
 * the Price, so both return once that update has finished.
 */
export class AddOn<Name extends AddOnName> {
  private readonly section: Locator;
  private readonly switchInput: Locator;
  private readonly switchLabel: Locator;
  private readonly priceLabel: Locator;
  private readonly dialog: Locator;
  private readonly confirmDialog: ConfirmDialog;

  constructor(
    private readonly page: Page,
    private readonly priceSummary: PriceSummary,
    private readonly name: Name,
  ) {
    this.section = page
      .locator('[id^="addon-"]')
      .filter({ has: page.getByRole('heading', { name: ADD_ON_HEADINGS[name] }) });
    this.switchInput = this.section.getByRole('checkbox');
    this.switchLabel = this.section.locator('label', { hasText: 'Toggle' });
    // "STARTS FROM" shares an element with the amount, so the label is matched unanchored.
    this.priceLabel = this.section.getByText(PRICE_LABEL).last();
    this.dialog = formDialog(page);
    this.confirmDialog = new ConfirmDialog(page);
  }

  /** The monthly Price impact the section claims. Water back-up claims its "starts from" amount. */
  async claimedMonthlyImpact(): Promise<Money> {
    return Money.parseMonthlyImpact(await this.priceLabelText());
  }

  async isFree(): Promise<boolean> {
    return (await this.priceLabelText()) === 'FREE';
  }

  /** "FREE" or the amount, e.g. "+$0.83/MO", without any "STARTS FROM". */
  private async priceLabelText(): Promise<string> {
    const text = (await this.priceLabel.textContent()) ?? '';
    const match = PRICE_LABEL.exec(text);
    if (!match) {
      throw new Error(`Cannot find a price label in the Add-on text "${text}"`);
    }
    return match[0].toUpperCase();
  }

  async isOn(): Promise<boolean> {
    return this.switchInput.isChecked();
  }

  /**
   * Switches on, filling the form dialog (when there is one) from `options`, with defaults for
   * what is left out. Returns the Price impact claimed for that configuration: the dialog
   * button's, or the section's when the Add-on has no dialog.
   */
  async switchOn(options?: AddOnOptions[Name]): Promise<Money> {
    if (this.name === 'equipmentBreakdown') {
      await this.priceSummary.afterUpdate(() => this.switchLabel.click());
      return this.claimedMonthlyImpact();
    }
    await this.switchLabel.click();
    await this.dialog.waitFor();
    await this.fillForm(options ?? {});
    const submit = this.dialog.getByRole('button', { name: /^add/i });
    const claimed = claimedImpactOf((await submit.textContent()) ?? '');
    await this.priceSummary.afterUpdate(() => submit.click());
    await this.dialog.waitFor({ state: 'hidden' });
    return claimed;
  }

  /** Switches off, including the confirmation. */
  async switchOff(): Promise<void> {
    await this.switchLabel.click();
    await this.priceSummary.afterUpdate(() => this.confirmDialog.confirm());
  }

  private async fillForm(options: object): Promise<void> {
    switch (this.name) {
      case 'interestedParty': {
        const form = { ...DEFAULT_INTERESTED_PARTY, ...options };
        await this.type('Name', form.name, true);
        await this.type('Address', form.address, true);
        await this.type('Email', form.email, true);
        break;
      }
      case 'spouse':
      case 'significantOther': {
        const form = { ...DEFAULT_PERSON, ...options };
        await this.type('First name', form.firstName, true);
        await this.type('Last name', form.lastName, true);
        await this.type(/^email/i, form.email, false);
        break;
      }
      case 'waterBackup': {
        const form: AddOnOptions['waterBackup'] = options;
        await this.chooseWaterBackupLimit(form.limit);
        // The radio input is covered by its styled circle, so the visible label is clicked.
        const answer = form.firstFloorOrLower ? 'Yes' : 'No';
        if (!(await this.dialog.getByRole('radio', { name: answer }).isChecked())) {
          await this.dialog.getByText(answer, { exact: true }).click();
        }
        break;
      }
      case 'landlordPropertyDamage': {
        const form: AddOnOptions['landlordPropertyDamage'] = options;
        await this.setCoverage(/water damage/i, form.waterDamage ?? true);
        await this.setCoverage(/pet damage/i, form.petDamage ?? false);
        break;
      }
      case 'equipmentBreakdown':
        break;
    }
  }

  /** Types key by key: the forms only re-validate on real keystrokes. */
  private async type(label: string | RegExp, text: string, exact: boolean): Promise<void> {
    const field = this.dialog.getByRole('textbox', { name: label, exact });
    await field.clear();
    await field.pressSequentially(text);
  }

  /**
   * Runs a form change that alters the claimed Price impact, and returns once the dialog's
   * button shows the new one (it is derived in the page, with no request to wait for).
   */
  private async afterClaimChange(action: () => Promise<void>): Promise<void> {
    const submit = this.dialog.getByRole('button', { name: /^add/i });
    const before = (await submit.textContent()) ?? '';
    await action();
    await submit.filter({ hasNotText: before }).waitFor();
  }

  /** The checkbox input is covered by its styled box, so the visible label is clicked instead. */
  private async setCoverage(label: RegExp, wanted: boolean): Promise<void> {
    const checkbox = this.dialog.getByRole('checkbox', { name: label });
    if ((await checkbox.isChecked()) !== wanted) {
      await this.afterClaimChange(() => this.dialog.getByText(label).first().click());
    }
  }

  private async chooseWaterBackupLimit(limit: Money | undefined): Promise<void> {
    if (limit === undefined) {
      return;
    }
    const wanted = WATER_BACKUP_LIMIT_STEPS.indexOf(limit.cents / 100);
    if (wanted === -1) {
      throw new Error(
        `Water back-up offers ${WATER_BACKUP_LIMIT_STEPS.join(' or ')}, not ${limit.format()}`,
      );
    }
    const stepper = this.dialog.getByRole('button', {
      name: wanted === 0 ? 'decrease' : 'increase',
    });
    if (await stepper.isEnabled()) {
      await this.afterClaimChange(() => stepper.click());
    }
  }
}

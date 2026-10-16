import type { Locator, Page } from '@playwright/test';
import { Money } from '../../money';
import { ConfirmDialog } from './confirm-dialog';
import { openModal, settledClaim } from './modal';

export type AddOnName =
  | 'Interested party'
  | 'Spouse'
  | 'Significant other'
  | 'Water back-up'
  | 'Landlord property damage'
  | 'Appliance breakdown';

/** How an Add-on's form dialog is configured when switching it on. */
export interface AddOnOptions {
  /** Water back-up only: the insured amount, in dollars. Defaults to the dialog's 5,000. */
  waterBackUpAmount?: 5_000 | 10_000;
  /** Landlord property damage only: also cover tenant pet damage. Water damage stays on. */
  tenantPetDamage?: boolean;
}

type Form = 'interested party' | 'person' | 'water back-up' | 'landlord damage' | 'none';

interface Card {
  title: RegExp;
  form: Form;
  /** Whether the form dialog's Add button claims a Price impact ("Add (+$x)/MO" vs "Add"). */
  dialogClaimsImpact: boolean;
}

const CARDS: Readonly<Record<AddOnName, Card>> = {
  'Interested party': {
    title: /^interested party\/landlord$/i,
    form: 'interested party',
    dialogClaimsImpact: false,
  },
  Spouse: { title: /^spouse$/i, form: 'person', dialogClaimsImpact: false },
  'Significant other': { title: /^significant other$/i, form: 'person', dialogClaimsImpact: true },
  'Water back-up': { title: /^water back-up$/i, form: 'water back-up', dialogClaimsImpact: true },
  'Landlord property damage': {
    title: /^landlord property damage$/i,
    form: 'landlord damage',
    dialogClaimsImpact: true,
  },
  'Appliance breakdown': {
    title: /^appliance \(a\.k\.a\. equipment\) breakdown$/i,
    form: 'none',
    dialogClaimsImpact: false,
  },
};

// The card's price label: "Free", "+$1.67/MO" or "Starts from+$0.83/MO".
const CARD_CLAIM = /^(?:starts from\s*)?(free|[+-]\$[\d,]+(?:\.\d{1,2})?\/MO)$/i;

/**
 * One Add-on's card under Policy Options. Every switch on the page has the same accessible
 * name and a random id, so the card is found by its title instead.
 */
export class AddOn {
  private readonly root: Locator;
  private readonly card: Card;
  private readonly switchLabel: Locator;

  constructor(
    private readonly page: Page,
    policyOptions: Locator,
    name: AddOnName,
  ) {
    this.card = CARDS[name];
    // Each card's id is "addon-<type>"; the prefix marks the card's bounds, the title picks it.
    this.root = policyOptions
      .locator('[id^="addon-"]')
      .filter({ has: page.getByRole('heading', { name: this.card.title }) });
    this.switchLabel = this.root.getByText('Toggle', { exact: true });
  }

  /** The Price impact the card claims; zero for a free Add-on. */
  async claimedPriceImpact(): Promise<Money> {
    return Money.parse(await this.cardClaim());
  }

  async isFree(): Promise<boolean> {
    return /^free$/i.test(await this.cardClaim());
  }

  async isOn(): Promise<boolean> {
    return this.root.getByRole('checkbox').isChecked();
  }

  /**
   * Switches the Add-on on, filling and confirming its form dialog when it has one.
   * Returns the Price impact claimed for the chosen configuration: the dialog's claim when
   * it shows one, otherwise the card's.
   */
  async switchOn(options: AddOnOptions = {}): Promise<Money> {
    await this.switchLabel.click();
    if (this.card.form === 'none') {
      await this.waitUntilSwitched(true);
      return this.claimedPriceImpact();
    }
    const dialog = openModal(this.page);
    const addButton = dialog.getByRole('button', { name: /^Add/ });
    await this.fillForm(dialog, options);
    const claimed = this.card.dialogClaimsImpact
      ? await settledClaim(this.page, addButton)
      : await this.claimedPriceImpact();
    await addButton.click();
    await dialog.waitFor({ state: 'hidden' });
    await this.waitUntilSwitched(true);
    return claimed;
  }

  /** Switches the Add-on off, confirming the removal. */
  async switchOff(): Promise<void> {
    await this.switchLabel.click();
    await new ConfirmDialog(this.page).confirm();
    await this.waitUntilSwitched(false);
  }

  private async fillForm(dialog: Locator, options: AddOnOptions): Promise<void> {
    switch (this.card.form) {
      case 'interested party':
        await typeInto(dialog, 'Name', 'Jane Landlord');
        await typeInto(dialog, 'Address', '1 Main Street, Springfield');
        await typeInto(dialog, 'Email', 'jane.landlord@example.com');
        break;
      case 'person':
        await typeInto(dialog, 'First name', 'Sam');
        await typeInto(dialog, 'Last name', 'Doe');
        break;
      case 'water back-up':
        await dialog.getByLabel('input-value', { exact: true }).waitFor();
        if (options.waterBackUpAmount === 10_000) {
          await dialog.getByRole('button', { name: 'increase', exact: true }).click();
        }
        break;
      case 'landlord damage':
        await dialog.getByText('Tenant Water Damage', { exact: true }).waitFor();
        if (options.tenantPetDamage) {
          await dialog.getByText('Tenant Pet Damage', { exact: true }).click();
        }
        break;
      case 'none':
        break;
    }
  }

  private async cardClaim(): Promise<string> {
    const text = (await this.root.getByText(CARD_CLAIM).first().textContent()) ?? '';
    const claim = CARD_CLAIM.exec(text.trim())?.[1];
    if (claim === undefined) throw new Error(`Cannot read the Add-on's claim from "${text}"`);
    return claim;
  }

  private async waitUntilSwitched(on: boolean): Promise<void> {
    const checkbox = this.root.getByRole('checkbox');
    await checkbox.and(this.page.locator(on ? ':checked' : ':not(:checked)')).waitFor({
      state: 'attached',
    });
  }
}

/** Types into a form field key by key, so the form re-validates as it would for a customer. */
async function typeInto(dialog: Locator, field: string, text: string): Promise<void> {
  await dialog.getByRole('textbox', { name: field, exact: true }).pressSequentially(text);
}

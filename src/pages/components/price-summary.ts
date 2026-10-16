import type { Locator, Page } from '@playwright/test';
import { Money } from '../../money';
import { readSettled } from '../../support/settled';

export type BillingPeriod = 'monthly' | 'annual';

export interface PayAmount {
  amount: Money;
  billingPeriod: BillingPeriod;
}

const BILLING_PERIOD_LABELS: Readonly<Record<BillingPeriod, RegExp>> = {
  monthly: /^MONTHLY$/,
  annual: /^ANNUAL/,
};

const PAY_LABEL = /^Pay (\$[\d,]+\.\d{2}) \/ (month|year)$/i;

/**
 * The Price as the page shows it: the Pay buttons, the List price and the Billing period switch.
 * The Price is read from the main Pay button, never from the animated price bubble, whose
 * digit roller holds every digit it has ever shown.
 */
export class PriceSummary {
  /** The top block holding the price bubble, the Billing period switch and the main Pay button. */
  private readonly priceBlock: Locator;
  private readonly mainPayButton: Locator;
  private readonly payButtons: Locator;

  constructor(private readonly page: Page) {
    this.priceBlock = page.getByTestId('baseQuoteTopWrapper');
    // Several buttons share the "Pay $…" name; the main one is the only one with a stable id.
    this.mainPayButton = page.locator('#gtm_button_pay_main');
    this.payButtons = page.getByRole('button', { name: /^Pay \$/ });
  }

  /** Waits until the page has rendered a Price. */
  async waitUntilShown(): Promise<void> {
    await this.mainPayButton.waitFor();
  }

  /** The monthly Price shown on the main Pay button. */
  async price(): Promise<Money> {
    const { amount, billingPeriod } = await this.payAmount();
    if (billingPeriod !== 'monthly') {
      throw new Error('The Price is shown per year; select monthly billing first');
    }
    return amount;
  }

  /** The Price once it has stopped changing; see `readSettled`. */
  async settledPrice(): Promise<Money> {
    return readSettled(this.page, () => this.price());
  }

  /** The amount on the main Pay button, monthly or annual depending on the Billing period. */
  async payAmount(): Promise<PayAmount> {
    return parsePayLabel(await this.mainPayButton.textContent());
  }

  /** The amount on every Pay button. */
  async everyPayAmount(): Promise<PayAmount[]> {
    // Three Pay buttons: the main one, the bottom one, and the sticky header one that only
    // renders once the page is scrolled past the top block.
    await this.payButtons.last().scrollIntoViewIfNeeded();
    await this.payButtons.nth(2).waitFor();
    const labels = await this.payButtons.allTextContents();
    return labels.map(parsePayLabel);
  }

  /** The crossed-out amount above the Price in the price bubble. */
  async listPrice(): Promise<Money> {
    const bubble = this.priceBlock.getByRole('button', { disabled: true });
    // The digit roller below it can also read as a whole amount; the List price comes first.
    const text = await bubble
      .getByText(/^\$[\d,]+\.\d{2}$/)
      .first()
      .textContent();
    return Money.parse(text ?? '');
  }

  async billingPeriod(): Promise<BillingPeriod> {
    return (await this.billingPeriodRadio('annual').isChecked()) ? 'annual' : 'monthly';
  }

  async selectBillingPeriod(period: BillingPeriod): Promise<void> {
    // The styled label covers the native radio, so click the label as a customer would.
    await this.priceBlock
      .locator('label')
      .filter({ hasText: BILLING_PERIOD_LABELS[period] })
      .click();
  }

  private billingPeriodRadio(period: BillingPeriod): Locator {
    return this.priceBlock.getByRole('radio', { name: BILLING_PERIOD_LABELS[period] });
  }
}

function parsePayLabel(label: string | null): PayAmount {
  const match = PAY_LABEL.exec(label?.trim() ?? '');
  if (!match) throw new Error(`Cannot read a Pay button label "${String(label)}"`);
  const [, amount = '', per = ''] = match;
  return {
    amount: Money.parse(amount),
    billingPeriod: per.toLowerCase() === 'month' ? 'monthly' : 'annual',
  };
}

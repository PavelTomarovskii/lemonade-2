import type { Locator, Page } from '@playwright/test';
import { Money } from '../../money';

const PAY_BUTTON_ID = 'gtm_button_pay_main';
// Shorter than the test timeout, so a Quote that never loads fails the test (an expected failure
// can absorb that) instead of timing it out.
const QUOTE_LOAD_TIMEOUT_MS = 15_000;
const AMOUNT = /\$[\d,]+\.\d{2}/;

interface PriceUpdateWatcher {
  priceUpdates: number;
}

/**
 * The Price as the page shows it: on the Pay buttons, never on the animated price bubble
 * (whose text carries every digit of the roller). Monthly and annual amounts have separate
 * methods; none of them branches on the Billing period.
 */
export class PriceSummary {
  private readonly mainPay: Locator;
  private readonly stickyPay: Locator;
  private readonly bottomPay: Locator;
  private readonly priceBubble: Locator;
  private readonly monthlyPeriod: Locator;
  private readonly annualPeriod: Locator;

  constructor(private readonly page: Page) {
    const hero = page.getByTestId('baseQuoteTopWrapper');
    this.mainPay = page.locator(`#${PAY_BUTTON_ID}`);
    const payButton = page.getByRole('button', { name: /^Pay \$/ });
    this.stickyPay = page.locator('header').getByRole('button', { name: /^Pay \$/ });
    // The innermost block that holds both the section heading and its Pay button.
    this.bottomPay = page
      .locator('div')
      .filter({ has: page.getByRole('heading', { name: 'Activate Your Insurance' }) })
      .filter({ has: payButton })
      .last()
      .getByRole('button', { name: /^Pay \$/ });
    this.priceBubble = hero.locator('button:disabled');
    this.monthlyPeriod = hero.locator('label', { hasText: 'MONTHLY' });
    this.annualPeriod = hero.locator('label', { hasText: 'ANNUAL' });
  }

  /** Waits for the Quote to render its Price, then starts counting Price updates. */
  async watchUpdates(): Promise<void> {
    await this.mainPay.waitFor({ timeout: QUOTE_LOAD_TIMEOUT_MS });
    await this.page.evaluate((buttonId) => {
      const watcher = window as unknown as PriceUpdateWatcher;
      watcher.priceUpdates = 0;
      let wasLoading = false;
      new MutationObserver(() => {
        const button = document.getElementById(buttonId);
        const isLoading =
          button !== null && getComputedStyle(button, '::before').animationName !== 'none';
        if (wasLoading && !isLoading) {
          watcher.priceUpdates += 1;
        }
        wasLoading = isLoading;
      }).observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class'],
      });
    }, PAY_BUTTON_ID);
  }

  /**
   * Runs `action`, then waits until one more Price update has finished, so the Price read next
   * is settled, including when the action leaves the Price unchanged.
   *
   * Every Price update puts a loading spinner (a CSS animation on `::before`) on the main Pay
   * button, and takes it off once the new Price is shown. The spinner lasts only a few tens of
   * milliseconds, too short to poll for, so the page is watched from inside (`watchUpdates`) and
   * the finished updates are counted. There is no timed wait; an action that causes no Price
   * update fails by timeout.
   */
  async afterUpdate<T>(action: () => Promise<T>): Promise<T> {
    const before = await this.finishedUpdates();
    const result = await action();
    await this.page.waitForFunction(
      (finished) => (window as unknown as PriceUpdateWatcher).priceUpdates > finished,
      before,
    );
    return result;
  }

  /** The monthly Price, from the main Pay button. */
  async monthlyPrice(): Promise<Money> {
    return readAmount(this.mainPay.filter({ hasText: '/ month' }));
  }

  /** The annual Price, from the main Pay button. */
  async annualPrice(): Promise<Money> {
    return readAmount(this.mainPay.filter({ hasText: '/ year' }));
  }

  /** The monthly Price on each of the three Pay buttons: main, sticky header and bottom. */
  async monthlyPayPrices(): Promise<Money[]> {
    return this.readAllPayPrices('/ month');
  }

  /** The annual Price on each of the three Pay buttons: main, sticky header and bottom. */
  async annualPayPrices(): Promise<Money[]> {
    return this.readAllPayPrices('/ year');
  }

  /** The crossed-out monthly amount above the Price. */
  async monthlyListPrice(): Promise<Money> {
    return Money.parse(await this.listPriceText('PER MONTH'));
  }

  /** The crossed-out annual amount above the Price. */
  async annualListPrice(): Promise<Money> {
    return Money.parse(await this.listPriceText('PER YEAR'));
  }

  async switchToAnnual(): Promise<void> {
    await this.annualPeriod.click();
  }

  async switchToMonthly(): Promise<void> {
    await this.monthlyPeriod.click();
  }

  private async finishedUpdates(): Promise<number> {
    return this.page.evaluate(() => (window as unknown as PriceUpdateWatcher).priceUpdates);
  }

  /**
   * The bubble is read only for its crossed-out amount, and only while it shows `periodText`,
   * so a List price of the other Billing period is never returned. The amount's text also
   * appears on a wrapper inside the bubble; the amount itself comes first.
   */
  private async listPriceText(periodText: string): Promise<string> {
    const bubble = this.priceBubble.filter({ hasText: periodText });
    return (
      (await bubble
        .getByText(new RegExp(`^${AMOUNT.source}$`))
        .first()
        .textContent()) ?? ''
    );
  }

  /** The sticky header's Pay button only renders after scrolling, so scroll to the bottom one. */
  private async readAllPayPrices(periodText: string): Promise<Money[]> {
    await this.bottomPay.scrollIntoViewIfNeeded();
    return Promise.all(
      [this.mainPay, this.stickyPay, this.bottomPay].map((button) =>
        readAmount(button.filter({ hasText: periodText })),
      ),
    );
  }
}

async function readAmount(button: Locator): Promise<Money> {
  const text = (await button.textContent()) ?? '';
  const amount = AMOUNT.exec(text);
  if (!amount) {
    throw new Error(`Cannot find a Price in the Pay button text "${text}"`);
  }
  return Money.parse(amount[0]);
}

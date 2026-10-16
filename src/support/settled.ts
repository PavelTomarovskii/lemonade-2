import type { Page } from '@playwright/test';

/**
 * How long a value must stay unchanged before it counts as settled.
 *
 * The Price updates up to ~500 ms after a Coverage step (the page debounces its request) and
 * within ~100 ms of every other action; a dialog's claimed Price impact refreshes within ~50 ms
 * of its form changing. One second is the shortest window that is reliably longer than all of
 * these, with headroom for slower CI machines.
 *
 * This is the suite's only time-window wait. Use it only where a retrying assertion cannot work:
 * when the value may legitimately not change at all (a free Add-on, a round trip back to the
 * Baseline price, a claim that refreshes with no visible loading state).
 */
export const STABILITY_WINDOW_MS = 1_000;

const POLL_INTERVAL_MS = 100;
const TIMEOUT_MS = 10_000;

/**
 * Reads a value repeatedly until it has stayed the same for {@link STABILITY_WINDOW_MS}.
 * Call it only after the triggering action has been confirmed in the UI.
 */
export async function readSettled<T extends { equals(other: T): boolean; toString(): string }>(
  page: Page,
  read: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now();
  let value = await read();
  let unchangedSince = Date.now();
  while (Date.now() - unchangedSince < STABILITY_WINDOW_MS) {
    if (Date.now() - startedAt > TIMEOUT_MS) {
      throw new Error(
        `Value did not settle within ${String(TIMEOUT_MS)} ms; last read ${value.toString()}`,
      );
    }
    // eslint-disable-next-line playwright/no-wait-for-timeout -- the documented stability window
    await page.waitForTimeout(POLL_INTERVAL_MS);
    const next = await read();
    if (!next.equals(value)) {
      value = next;
      unchangedSince = Date.now();
    }
  }
  return value;
}

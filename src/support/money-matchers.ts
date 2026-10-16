import type { ExpectMatcherState, MatcherReturnType } from '@playwright/test';
import type { Money } from '../money';

/**
 * Matchers for which way an amount moved, stating both amounts in dollars when they fail:
 * `expect.poll(() => priceSummary.price()).toBeAbove(before)`.
 */
export const moneyMatchers = {
  toBeAbove(this: ExpectMatcherState, received: Money, other: Money): MatcherReturnType {
    return compare(this, 'toBeAbove', 'above', received, other, received.isGreaterThan(other));
  },

  toBeBelow(this: ExpectMatcherState, received: Money, other: Money): MatcherReturnType {
    return compare(this, 'toBeBelow', 'below', received, other, received.isLessThan(other));
  },
};

function compare(
  state: ExpectMatcherState,
  name: string,
  relation: string,
  received: Money,
  other: Money,
  pass: boolean,
): MatcherReturnType {
  const expected = `${state.isNot ? 'not ' : ''}${relation} ${other.toString()}`;
  return {
    name,
    pass,
    expected,
    actual: received.toString(),
    message: () =>
      `${state.utils.matcherHint(name, undefined, undefined, { isNot: state.isNot })}\n\n` +
      `Expected: ${expected}\nReceived: ${received.toString()}`,
  };
}

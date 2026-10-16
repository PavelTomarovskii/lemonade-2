import { expect as baseExpect, test } from '@playwright/test';
import { Money } from '../../src/money';
import { moneyMatchers } from '../../src/support/money-matchers';

const expect = baseExpect.extend(moneyMatchers);

const lower = Money.parse('$14.33');
const higher = Money.parse('$14.73');

test.describe('Money matchers', () => {
  test('pass when an amount is above or below another', () => {
    expect(higher).toBeAbove(lower);
    expect(lower).toBeBelow(higher);
    expect(lower).not.toBeAbove(higher);
    expect(higher).not.toBeBelow(lower);
  });

  test('treat an equal amount as neither above nor below', () => {
    expect(lower).not.toBeAbove(lower);
    expect(lower).not.toBeBelow(lower);
  });

  test('state both amounts in dollars when an amount is not above another', () => {
    expect(() => {
      expect(lower).toBeAbove(higher);
    }).toThrow(/Expected: above \$14\.73\nReceived: \$14\.33/);
  });

  test('state both amounts in dollars when an amount is not below another', () => {
    expect(() => {
      expect(higher).toBeBelow(lower);
    }).toThrow(/Expected: below \$14\.33\nReceived: \$14\.73/);
  });

  test('state the negated expectation when an amount is unexpectedly above another', () => {
    expect(() => {
      expect(higher).not.toBeAbove(lower);
    }).toThrow(/Expected: not above \$14\.33\nReceived: \$14\.73/);
  });
});

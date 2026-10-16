import { expect, test } from '@playwright/test';
import { Money } from '../../src/money';

test.describe('Money', () => {
  test('parses a Price', () => {
    expect(Money.parse('$14.33').cents).toBe(1433);
  });

  for (const [text, cents] of [
    ['$250', 250_00],
    ['$1,000', 1_000_00],
    ['$50,000', 50_000_00],
    ['$500,000', 500_000_00],
  ] as const) {
    test(`parses the Coverage or Deductible amount ${text}`, () => {
      expect(Money.parse(text).cents).toBe(cents);
    });
  }

  for (const [text, cents] of [
    ['+$1.67', 167],
    ['+$1.67/MO', 167],
    ['+$4.6/MO', 460],
    ['+$46.00/mo', 46_00],
    ['-$12', -12_00],
  ] as const) {
    test(`parses the signed Price impact ${text}`, () => {
      expect(Money.parse(text).cents).toBe(cents);
    });
  }

  for (const text of ['FREE', 'Free']) {
    test(`parses "${text}" as zero`, () => {
      expect(Money.parse(text).cents).toBe(0);
    });
  }

  for (const text of [
    '',
    '14.33',
    '$',
    '$14.333',
    '$1,00',
    '$10000,000',
    '$ 14.33',
    '++$1.67',
    '$1.67/YR',
    'Pay $14.33 / month',
    'STARTS FROM +$0.83/MO',
    'Free shipping',
  ]) {
    test(`rejects the unsupported text "${text}"`, () => {
      expect(() => Money.parse(text)).toThrow(`Cannot read a money amount from "${text}"`);
    });
  }

  test('adds a Price impact to a Price', () => {
    expect(Money.parse('$14.33').plus(Money.parse('+$1.67')).cents).toBe(16_00);
  });

  test('subtracts one amount from another, going below zero when needed', () => {
    expect(Money.parse('$16.17').minus(Money.parse('$14.33')).cents).toBe(184);
    expect(Money.parse('$14.33').minus(Money.parse('$14.73')).cents).toBe(-40);
  });

  test('treats amounts written differently as equal when their cents match', () => {
    expect(Money.parse('+$4.6/MO').equals(Money.parse('$4.60'))).toBe(true);
    expect(Money.parse('FREE').equals(Money.parse('$0'))).toBe(true);
    expect(Money.parse('$14.33').equals(Money.parse('$14.34'))).toBe(false);
  });

  test('compares amounts', () => {
    const lower = Money.parse('$14.33');
    const higher = Money.parse('$14.73');

    expect(higher.isGreaterThan(lower)).toBe(true);
    expect(lower.isGreaterThan(higher)).toBe(false);
    expect(lower.isGreaterThan(lower)).toBe(false);
    expect(lower.isLessThan(higher)).toBe(true);
    expect(higher.isLessThan(lower)).toBe(false);
    expect(lower.isLessThan(lower)).toBe(false);
  });

  for (const [text, formatted] of [
    ['$14.33', '$14.33'],
    ['+$4.6/MO', '$4.60'],
    ['$50,000', '$50,000.00'],
    ['$1,234,567.8', '$1,234,567.80'],
    ['FREE', '$0.00'],
    ['-$0.4', '-$0.40'],
  ] as const) {
    test(`formats ${text} as ${formatted}`, () => {
      expect(Money.parse(text).toString()).toBe(formatted);
    });
  }

  test('gives a whole amount in dollars', () => {
    expect(Money.parse('$50,000').wholeDollars()).toBe(50_000);
  });

  test('refuses to give dollars for an amount with cents', () => {
    expect(() => Money.parse('$14.33').wholeDollars()).toThrow(
      '$14.33 is not a whole number of dollars',
    );
  });
});

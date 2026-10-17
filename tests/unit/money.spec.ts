import { expect, test } from '@playwright/test';
import { Money } from '../../src/money';

const MALFORMED = [
  '',
  ' ',
  '14.33',
  '$',
  '$.50',
  '$14.',
  '$1.234',
  '$1,00',
  '$1,0000',
  '$,100',
  '$1,000,00',
  '$1 000',
  '$abc',
  '$-1.50',
  '++$1.50',
  ' $14.33',
  '$14.33 ',
  '$14.33 / month',
  'Pay $14.33',
  'STARTS FROM +$0.83/MO',
  'free',
  'FREE/MO',
  '€14.33',
  '$9007199254740993',
];

function expectRejected(parse: (text: string) => Money, texts: string[]) {
  for (const text of texts) {
    test(`rejects "${text}" and names it in the error`, () => {
      expect(() => parse(text)).toThrow(`Cannot read "${text}" as a money amount`);
    });
  }
}

test.describe('parsing a period-free amount', () => {
  const supported: [string, string, number][] = [
    ['the Price', '$14.33', 1433],
    ['the List price', '$15.33', 1533],
    ['an annual Price', '$159.96', 15996],
    ['a whole-dollar amount', '$14', 1400],
    ['a Coverage with a thousands separator', '$50,000', 5_000_000],
    ['a Coverage with two thousands separators', '$1,000,000', 100_000_000],
    ['a Deductible', '$250', 25_000],
    ['a Deductible with a thousands separator', '$2,500', 250_000],
    ['a negative amount', '-$1.50', -150],
    ['zero', '$0.00', 0],
    ['FREE', 'FREE', 0],
  ];

  for (const [description, text, cents] of supported) {
    test(`reads ${description} "${text}" as ${String(cents)} cents`, () => {
      expect(Money.parse(text).cents).toBe(cents);
    });
  }

  expectRejected(
    (text) => Money.parse(text),
    [...MALFORMED, '+$1.67', '$14.33/MO', '+$1.67/MO', '$14.33/YR', '+$20.04/YR'],
  );
});

test.describe('parsing a monthly Price impact', () => {
  const supported: [string, string, number][] = [
    ['two decimals', '+$1.67', 167],
    ['a per-month suffix', '+$1.67/MO', 167],
    ['one decimal', '+$4.6/MO', 460],
    ['one decimal and no suffix', '+$4.6', 460],
    ['a trailing zero', '+$4.60/MO', 460],
    ['an amount under a dollar', '+$0.83/MO', 83],
    ['a thousands separator', '+$1,000.50/MO', 100_050],
    ['a negative sign', '-$1.50/MO', -150],
    ['no sign', '$1.67/MO', 167],
    ['FREE', 'FREE', 0],
  ];

  for (const [description, text, cents] of supported) {
    test(`reads an impact with ${description} "${text}" as ${String(cents)} cents`, () => {
      expect(Money.parseMonthlyImpact(text).cents).toBe(cents);
    });
  }

  expectRejected(
    (text) => Money.parseMonthlyImpact(text),
    [...MALFORMED, '+$20.04/YR', '$14.33/YR', '+$1.67/mo'],
  );
});

test.describe('parsing an annual Price impact', () => {
  const supported: [string, string, number][] = [
    ['two decimals and a per-year suffix', '+$20.04/YR', 2004],
    ['no suffix', '+$20.04', 2004],
    ['a trailing zero', '+$6.00/YR', 600],
    ['a thousands separator', '+$1,000.50/YR', 100_050],
    ['a negative sign', '-$12.00/YR', -1200],
    ['FREE', 'FREE', 0],
  ];

  for (const [description, text, cents] of supported) {
    test(`reads an impact with ${description} "${text}" as ${String(cents)} cents`, () => {
      expect(Money.parseAnnualImpact(text).cents).toBe(cents);
    });
  }

  expectRejected(
    (text) => Money.parseAnnualImpact(text),
    [...MALFORMED, '+$1.67/MO', '$14.33/MO', '+$20.04/yr'],
  );
});

test.describe('formatting', () => {
  const formatted: [number, string][] = [
    [1433, '$14.33'],
    [1400, '$14.00'],
    [5, '$0.05'],
    [0, '$0.00'],
    [5_000_000, '$50,000.00'],
    [100_000_000, '$1,000,000.00'],
    [-150, '-$1.50'],
  ];

  for (const [cents, text] of formatted) {
    test(`formats ${String(cents)} cents as ${text}`, () => {
      expect(Money.fromCents(cents).format()).toBe(text);
    });
  }

  test('reads back what it formats', () => {
    for (const cents of [0, 5, 1433, 5_000_000, -150]) {
      expect(Money.parse(Money.fromCents(cents).format()).cents).toBe(cents);
    }
  });
});

test.describe('creating from cents', () => {
  for (const cents of [1.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53]) {
    test(`rejects ${String(cents)} cents`, () => {
      expect(() => Money.fromCents(cents)).toThrow(
        `Cannot create money from ${String(cents)} cents`,
      );
    });
  }

  test('has a zero amount', () => {
    expect(Money.ZERO.cents).toBe(0);
  });
});

test.describe('arithmetic', () => {
  test('adds exactly where floating point would not', () => {
    // 0.1 + 0.2 !== 0.3 in floating point
    expect(Money.parse('$0.10').plus(Money.parse('$0.20')).equals(Money.parse('$0.30'))).toBe(true);
  });

  test('adds a Price impact to a Price', () => {
    expect(Money.parse('$14.33').plus(Money.parseMonthlyImpact('+$1.67/MO')).format()).toBe(
      '$16.00',
    );
  });

  test('subtracts to the change between two Prices', () => {
    expect(Money.parse('$15.16').minus(Money.parse('$14.33')).format()).toBe('$0.83');
  });

  test('subtracts to a negative change when the Price falls', () => {
    expect(Money.parse('$13.18').minus(Money.parse('$14.33')).format()).toBe('-$1.15');
  });

  test('leaves its operands unchanged', () => {
    const price = Money.parse('$14.33');
    price.plus(Money.parse('$1.00'));
    expect(price.cents).toBe(1433);
  });
});

test.describe('comparison', () => {
  const lower = Money.parse('$14.33');
  const higher = Money.parse('$14.34');

  test('treats equal amounts as equal however they were written', () => {
    expect(Money.parseMonthlyImpact('+$4.6/MO').equals(Money.parse('$4.60'))).toBe(true);
  });

  test('tells different amounts apart', () => {
    expect(lower.equals(higher)).toBe(false);
  });

  test('orders amounts', () => {
    expect(lower.isLessThan(higher)).toBe(true);
    expect(higher.isGreaterThan(lower)).toBe(true);
    expect(lower.isGreaterThan(higher)).toBe(false);
    expect(higher.isLessThan(lower)).toBe(false);
  });

  test('is neither less nor greater than an equal amount', () => {
    expect(lower.isLessThan(Money.parse('$14.33'))).toBe(false);
    expect(lower.isGreaterThan(Money.parse('$14.33'))).toBe(false);
  });
});

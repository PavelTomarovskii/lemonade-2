import { expect, test } from '@playwright/test';
import { loadConfig } from '../../src/config';

test.describe('configuration', () => {
  test('defaults to the public test Quote', () => {
    expect(loadConfig({})).toEqual({
      baseUrl: 'https://lemonade-hq.github.io/qa-interview-task/',
      quoteId: 'LQ42EE07089',
    });
  });

  test('reads the base URL and the Quote id from the environment', () => {
    expect(
      loadConfig({ BASE_URL: 'https://staging.example.com/quote-app/', QUOTE_ID: 'LQ00AA00001' }),
    ).toEqual({ baseUrl: 'https://staging.example.com/quote-app/', quoteId: 'LQ00AA00001' });
  });

  test('keeps the base path when the base URL has no trailing slash', () => {
    const { baseUrl } = loadConfig({ BASE_URL: 'https://staging.example.com/quote-app' });

    expect(new URL('quotes/LQ00AA00001', baseUrl).href).toBe(
      'https://staging.example.com/quote-app/quotes/LQ00AA00001',
    );
  });

  for (const malformed of ['', 'lemonade-hq.github.io/qa-interview-task/', 'ftp://example.com/']) {
    test(`rejects the malformed base URL "${malformed}"`, () => {
      expect(() => loadConfig({ BASE_URL: malformed })).toThrow(
        `Invalid BASE_URL "${malformed}": expected an absolute http(s) URL`,
      );
    });
  }

  for (const malformed of ['', '   ', 'LQ42 EE07089', 'LQ42EE07089/extra']) {
    test(`rejects the malformed Quote id "${malformed}"`, () => {
      expect(() => loadConfig({ QUOTE_ID: malformed })).toThrow(
        `Invalid QUOTE_ID "${malformed}": expected letters and digits only, e.g. LQ42EE07089`,
      );
    });
  }
});

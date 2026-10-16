export interface Config {
  /** Root the Quote paths resolve against; always ends with `/`. */
  baseUrl: string;
  /** The Quote under test, e.g. `LQ42EE07089`. */
  quoteId: string;
}

const DEFAULT_BASE_URL = 'https://lemonade-hq.github.io/qa-interview-task/';
const DEFAULT_QUOTE_ID = 'LQ42EE07089';

export function loadConfig(env: Record<string, string | undefined>): Config {
  return {
    baseUrl: parseBaseUrl(env.BASE_URL ?? DEFAULT_BASE_URL),
    quoteId: parseQuoteId(env.QUOTE_ID ?? DEFAULT_QUOTE_ID),
  };
}

function parseBaseUrl(value: string): string {
  const url = URL.parse(value);
  if (url?.protocol !== 'http:' && url?.protocol !== 'https:') {
    throw new Error(`Invalid BASE_URL "${value}": expected an absolute http(s) URL`);
  }
  return value.endsWith('/') ? value : `${value}/`;
}

function parseQuoteId(value: string): string {
  if (!/^[A-Za-z0-9]+$/.test(value)) {
    throw new Error(
      `Invalid QUOTE_ID "${value}": expected letters and digits only, e.g. ${DEFAULT_QUOTE_ID}`,
    );
  }
  return value;
}

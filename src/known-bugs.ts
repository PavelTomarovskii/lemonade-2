import type { TestDetailsAnnotation } from '@playwright/test';

/**
 * Confirmed product bugs that tests hit, by GitHub issue number: the bug's only ID (ADR-0001).
 */
export const KnownBug = {
  /** Loss of Use from $20,000 to $25,000 lowers the Price. */
  lossOfUseStepLowersPrice: 29,
  /** Medical Payments steps between $1,000 and $4,000 don't change the Price. */
  medicalPaymentsStepsKeepPrice: 30,
} as const;

export type KnownBug = (typeof KnownBug)[keyof typeof KnownBug];

/** The annotation type that the `knownBugMarker` fixture turns into an expected failure. */
export const KNOWN_BUG_ANNOTATION = 'known bug';

const ISSUES_URL = 'https://github.com/PavelTomarovskii/lemonade-2/issues/';

/**
 * Marks a test that hits a confirmed bug: `test(title, { annotation: knownBug(bug) }, body)`.
 * The fixtures then expect the test to fail, so the suite stays green while the report links
 * the bug; once the bug is fixed the test passes unexpectedly and the marker must go.
 * Gives no annotation when `bug` is undefined, so data-driven cases can pass theirs straight in.
 */
export function knownBug(bug: KnownBug | undefined): TestDetailsAnnotation[] {
  if (bug === undefined) return [];
  return [{ type: KNOWN_BUG_ANNOTATION, description: `${ISSUES_URL}${String(bug)}` }];
}

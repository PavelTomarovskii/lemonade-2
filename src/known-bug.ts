import { test } from '@playwright/test';

/** A confirmed product bug, tracked as a GitHub issue. */
export interface KnownBug {
  readonly issue: string;
}

/**
 * Marks the running test as catching a known bug (ADR-0001): it is expected to fail, and its
 * report carries the bug's issue URL as an `issue` annotation. Call it first in the test body.
 * Passing `undefined` does nothing, so data-driven tests need no conditional of their own.
 * Once the bug is fixed the test passes unexpectedly, which says the marker can go.
 */
export function expectKnownBug(bug: KnownBug | undefined): void {
  if (!bug) return;
  test.fail();
  test.info().annotations.push({ type: 'issue', description: bug.issue });
}

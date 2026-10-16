import { KnownBug } from '../known-bugs';
import { Money } from '../money';
import type { CoverageName } from '../pages/components/coverage-stepper';
import { type Neighbours, neighbouringPairs } from './neighbours';

/** Two neighbouring values on a Coverage ladder. */
export interface CoverageStep extends Neighbours<Money> {
  /** The confirmed bug that stepping between these values hits, if any. */
  bug?: KnownBug;
}

/** Every value a Coverage can take, lowest first, with its default on a fresh Quote. */
export interface CoverageLadder {
  coverage: CoverageName;
  values: readonly Money[];
  bottom: Money;
  top: Money;
  defaultValue: Money;
  steps: readonly CoverageStep[];
}

interface KnownBugStep {
  step: readonly [lower: string, higher: string];
  bug: KnownBug;
}

/** Builds a ladder from the page's own amount texts, checking that it is consistent. */
export function coverageLadder(
  coverage: CoverageName,
  valueTexts: readonly string[],
  defaultText: string,
  knownBugSteps: readonly KnownBugStep[] = [],
): CoverageLadder {
  const values = valueTexts.map((text) => Money.parse(text));
  const steps: CoverageStep[] = neighbouringPairs(values);
  const [bottom, top] = [values[0], values.at(-1)];
  if (!bottom || !top || steps.some(({ lower, higher }) => !higher.isGreaterThan(lower))) {
    throw new Error(`${coverage}'s ladder must rise strictly, lowest value first`);
  }
  const defaultValue = Money.parse(defaultText);
  if (!values.some((value) => value.equals(defaultValue))) {
    throw new Error(`${coverage} has no ${defaultValue.toShortString()} on its ladder`);
  }

  for (const { step, bug } of knownBugSteps) {
    const [lower, higher] = [Money.parse(step[0]), Money.parse(step[1])];
    const affected = steps.find(
      (candidate) => candidate.lower.equals(lower) && candidate.higher.equals(higher),
    );
    if (!affected) {
      throw new Error(
        `${coverage} has no step from ${lower.toShortString()} to ${higher.toShortString()}`,
      );
    }
    affected.bug = bug;
  }

  return { coverage, values, bottom, top, defaultValue, steps };
}

/** The four Coverages of the Quote under test, as a fresh Quote offers them. */
export const COVERAGE_LADDERS: readonly CoverageLadder[] = [
  // Starts at the top of its ladder, so it can only be stepped down from a fresh Quote.
  coverageLadder(
    'Personal Property',
    ['$30,000', '$35,000', '$40,000', '$45,000', '$50,000'],
    '$50,000',
  ),
  coverageLadder('Personal Liability', ['$100,000', '$300,000', '$500,000'], '$100,000'),
  coverageLadder('Loss of Use', ['$15,000', '$20,000', '$25,000', '$30,000'], '$15,000', [
    { step: ['$20,000', '$25,000'], bug: KnownBug.lossOfUseStepLowersPrice },
  ]),
  coverageLadder('Medical Payments', ['$1,000', '$2,000', '$3,000', '$4,000', '$5,000'], '$1,000', [
    { step: ['$1,000', '$2,000'], bug: KnownBug.medicalPaymentsStepsKeepPrice },
    { step: ['$2,000', '$3,000'], bug: KnownBug.medicalPaymentsStepsKeepPrice },
    { step: ['$3,000', '$4,000'], bug: KnownBug.medicalPaymentsStepsKeepPrice },
  ]),
];

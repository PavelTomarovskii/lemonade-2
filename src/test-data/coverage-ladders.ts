import { Money } from '../money';
import type { CoverageName } from '../pages/components/coverage-stepper';
import type { KnownBug } from '../known-bug';

/** One Coverage's ladder: its amounts in ascending order, and the end it starts at on a fresh Quote. */
export interface CoverageLadder {
  readonly steps: readonly Money[];
  readonly start: 'top' | 'bottom';
}

const amounts = (...cents: number[]): Money[] => cents.map((value) => Money.fromCents(value));

export const COVERAGE_LADDERS: Readonly<Record<CoverageName, CoverageLadder>> = {
  personalProperty: {
    steps: amounts(3_000_000, 3_500_000, 4_000_000, 4_500_000, 5_000_000),
    start: 'top',
  },
  personalLiability: { steps: amounts(10_000_000, 30_000_000, 50_000_000), start: 'bottom' },
  lossOfUse: {
    steps: amounts(1_500_000, 2_000_000, 2_500_000, 3_000_000),
    start: 'bottom',
  },
  medicalPayments: {
    steps: amounts(100_000, 200_000, 300_000, 400_000, 500_000),
    start: 'bottom',
  },
};

export const COVERAGE_NAMES = Object.keys(COVERAGE_LADDERS) as CoverageName[];

/** Two neighbouring steps of a ladder: `lower` is the smaller amount. */
export interface StepPair {
  readonly lower: Money;
  readonly upper: Money;
}

export function neighbouringPairs({ steps }: CoverageLadder): StepPair[] {
  return steps.flatMap((lower, index) => {
    const upper = steps[index + 1];
    return upper ? [{ lower, upper }] : [];
  });
}

export function bottomOf({ steps }: CoverageLadder): Money {
  return steps[0] ?? Money.ZERO;
}

export function topOf({ steps }: CoverageLadder): Money {
  return steps[steps.length - 1] ?? Money.ZERO;
}

/** Confirmed Coverage pricing bugs, each scoped to exactly the step pairs it affects. */
const COVERAGE_BUGS: readonly (KnownBug & {
  coverage: CoverageName;
  pairs: readonly StepPair[];
})[] = [
  {
    coverage: 'lossOfUse',
    issue: 'https://github.com/PavelTomarovskii/lemonade-2/issues/29',
    pairs: [{ lower: Money.fromCents(2_000_000), upper: Money.fromCents(2_500_000) }],
  },
  {
    coverage: 'medicalPayments',
    issue: 'https://github.com/PavelTomarovskii/lemonade-2/issues/30',
    pairs: [
      { lower: Money.fromCents(100_000), upper: Money.fromCents(200_000) },
      { lower: Money.fromCents(200_000), upper: Money.fromCents(300_000) },
      { lower: Money.fromCents(300_000), upper: Money.fromCents(400_000) },
    ],
  },
];

/** The known bug that affects this step pair of this Coverage, if any. */
export function knownBugFor(coverage: CoverageName, pair: StepPair): KnownBug | undefined {
  return COVERAGE_BUGS.find(
    (bug) =>
      bug.coverage === coverage &&
      bug.pairs.some(
        (affected) => affected.lower.equals(pair.lower) && affected.upper.equals(pair.upper),
      ),
  );
}

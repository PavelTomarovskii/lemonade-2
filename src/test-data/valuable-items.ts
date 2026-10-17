import type { KnownBug } from '../known-bug';
import { Money } from '../money';
import type { ItemKind } from '../pages/components/valuable-items';

/**
 * The value every kind is added at. At $5,000 Jewelry and Cameras claim a Price impact ending in
 * a zero (+$4.60), which is the case the tile mis-formats (see `ITEM_BUGS`).
 */
export const ITEM_VALUE = Money.fromCents(500_000);

export const ITEM_KINDS: readonly ItemKind[] = [
  'jewelry',
  'bicycles',
  'cameras',
  'musicalInstruments',
  'fineArt',
];

/** Confirmed Valuable item bugs, each scoped to the kinds it affects at `ITEM_VALUE`. */
const ITEM_BUGS: readonly (KnownBug & { kinds: readonly ItemKind[] })[] = [
  {
    // The tile drops the trailing zero of the Price impact ("+$4.6/MO").
    issue: 'https://github.com/PavelTomarovskii/lemonade-2/issues/31',
    kinds: ['jewelry', 'cameras'],
  },
];

/** The known bug that affects this kind's tile at `ITEM_VALUE`, if any. */
export function knownBugFor(kind: ItemKind): KnownBug | undefined {
  return ITEM_BUGS.find((bug) => bug.kinds.includes(kind));
}

/**
 * Declared values the page must accept: the bounds of the allowed range. Stated here, not read
 * from the add dialog, so the tests check the page against the requirement and not against the
 * page object's own idea of the range.
 */
export const ACCEPTED_VALUES: readonly Money[] = [
  Money.fromCents(100_000),
  Money.fromCents(5_000_000),
];

/** Declared values just outside the allowed range, with the message the page must give. */
export const REJECTED_VALUES: readonly { value: Money; message: RegExp }[] = [
  { value: Money.fromCents(99_900), message: /minimum coverage/i },
  { value: Money.fromCents(5_000_100), message: /cover up to/i },
];

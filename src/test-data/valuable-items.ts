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

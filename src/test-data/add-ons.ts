import { Money } from '../money';
import type { AddOnName, AddOnOptions } from '../pages/components/add-on';

/**
 * Whether the page offers each Add-on free. Keyed by every Add-on, so adding one to the page
 * objects fails the typecheck until it is listed here and gets its tests.
 */
export const OFFERED_FREE: Record<AddOnName, boolean> = {
  interestedParty: true,
  spouse: true,
  significantOther: false,
  waterBackup: false,
  landlordPropertyDamage: false,
  equipmentBreakdown: false,
};

export const ADD_ON_NAMES = Object.keys(OFFERED_FREE) as AddOnName[];

/** An Add-on switched on in a form configuration that changes its claimed Price impact. */
export interface AddOnVariant<Name extends AddOnName = AddOnName> {
  readonly name: Name;
  readonly configuration: string;
  readonly options: AddOnOptions[Name];
}

function variant<Name extends AddOnName>(
  name: Name,
  configuration: string,
  options: AddOnOptions[Name],
): AddOnVariant {
  return { name, configuration, options };
}

/**
 * The form configurations that claim a higher Price impact than the Add-on's section does:
 * Water back-up claims its $5,000 "starts from" amount, Landlord property damage its
 * water-damage-only amount.
 */
export const ADD_ON_VARIANTS: readonly AddOnVariant[] = [
  variant('waterBackup', 'at the higher $10,000 limit', { limit: Money.fromCents(1_000_000) }),
  variant('landlordPropertyDamage', 'with pet damage', { petDamage: true }),
];

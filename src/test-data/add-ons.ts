import type { AddOnName } from '../pages/components/add-on';

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

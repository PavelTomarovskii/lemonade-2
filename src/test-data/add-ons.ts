import type { AddOnName } from '../pages/components/add-on';

/**
 * Every Add-on, with whether the page offers it free. Interested party, Spouse and Equipment
 * breakdown cover the three shapes: a free one with a form, a paid one with a form, and one
 * without a form dialog.
 */
export const ADD_ONS: readonly { name: AddOnName; free: boolean }[] = [
  { name: 'interestedParty', free: true },
  { name: 'spouse', free: true },
  { name: 'significantOther', free: false },
  { name: 'waterBackup', free: false },
  { name: 'landlordPropertyDamage', free: false },
  { name: 'equipmentBreakdown', free: false },
];

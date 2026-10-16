/**
 * Test tags: one per area of the Quote page, plus a small cross-area smoke subset.
 * Apply them with `test.describe('…', { tag: Tag.coverage }, …)`; the npm scripts grep for them.
 */
export const Tag = {
  coverage: '@coverage',
  valuableItems: '@valuable-items',
  addOns: '@add-ons',
  deductible: '@deductible',
  priceDisplay: '@price-display',
  smoke: '@smoke',
} as const;

/** Matches an element whose whole text is `text`, for `filter({ hasText })` and friends. */
export function exactText(text: string): RegExp {
  return new RegExp(`^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
}

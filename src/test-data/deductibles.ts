import { Money } from '../money';
import { neighbouringPairs } from './neighbours';

/** Every Deductible a fresh Quote offers, lowest first. */
export const DEDUCTIBLE_AMOUNTS: readonly Money[] = ['$250', '$500', '$1,000', '$2,500'].map(
  (text) => Money.parse(text),
);

/** The Deductible of a fresh Quote. */
export const DEFAULT_DEDUCTIBLE = Money.parse('$500');

/** Each Deductible with the next one up; together they span every option. */
export const DEDUCTIBLE_STEPS = neighbouringPairs(DEDUCTIBLE_AMOUNTS);

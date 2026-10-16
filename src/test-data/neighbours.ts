/** Two neighbouring values of an ordered list, such as a Coverage ladder or the Deductibles. */
export interface Neighbours<T> {
  lower: T;
  higher: T;
}

/** Pairs each value with the next one up: `[a, b, c]` gives `a`–`b` and `b`–`c`. */
export function neighbouringPairs<T>(values: readonly T[]): Neighbours<T>[] {
  return values.flatMap((higher, i) => {
    const lower = values[i - 1];
    return lower === undefined ? [] : [{ lower, higher }];
  });
}

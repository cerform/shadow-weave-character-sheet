/**
 * Stable sort utility to prevent React Error #185
 * Maintains original order for equal elements
 */
export function stableSort<T>(
  array: T[],
  compareFn: (a: T, b: T) => number
): T[] {
  return array
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const order = compareFn(a.item, b.item);
      return order !== 0 ? order : a.index - b.index;
    })
    .map(({ item }) => item);
}

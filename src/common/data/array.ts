export const removeBatchByNumericId = <T>(
  source: T[],
  ids: number[],
  getId: (item: T) => number
): number => {
  const idSet = new Set(ids);
  const before = source.length;
  source.splice(
    0,
    source.length,
    ...source.filter((item) => !idSet.has(getId(item)))
  );
  return before - source.length;
};

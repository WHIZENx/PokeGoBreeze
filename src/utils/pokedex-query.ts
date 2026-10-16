export const serializePokedexSelection = <T>(
  selected: readonly T[],
  available: readonly T[],
  serialize: (value: T) => string | number
) => {
  const selectedValues = new Set(selected);
  if (selectedValues.size === available.length && available.every((value) => selectedValues.has(value))) {
    return undefined;
  }
  return selected.map(serialize).join(',');
};

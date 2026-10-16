export const displayPokemonGoStat = (value: number | undefined) =>
  value !== undefined && Number.isFinite(value) ? Math.floor(value) : '-';

export const displayPokemonGoStatDifference = (
  modifiedValue: number | undefined,
  difference: number | undefined,
  direction: 'increase' | 'decrease'
) => {
  if (
    modifiedValue === undefined ||
    difference === undefined ||
    !Number.isFinite(modifiedValue) ||
    !Number.isFinite(difference)
  ) {
    return 0;
  }
  const normalValue = direction === 'increase' ? modifiedValue - difference : modifiedValue + difference;
  return Math.abs(Math.floor(modifiedValue) - Math.floor(normalValue));
};

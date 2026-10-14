export const encounterProbabilityPercent = (
  normal: number | undefined,
  shadow: number | undefined,
  useShadow: boolean
) => (useShadow ? (shadow ?? normal ?? 0) : (normal ?? 0)) * 100;

export const encounterTimeSeconds = (value: number | undefined) => (Number.isFinite(value) ? (value as number) : 0);

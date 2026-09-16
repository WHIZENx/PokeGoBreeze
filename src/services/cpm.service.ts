type CpmEntry = { level: number; multiplier: number };

let cpmByLevel = new Map<number, number>();

export const setCpmData = (entries: CpmEntry[]) => {
  cpmByLevel = new Map(entries.map((entry) => [entry.level, entry.multiplier]));
};

export const getCpmMultiplier = (level: number): number => {
  const multiplier = cpmByLevel.get(level);
  if (multiplier === undefined) {
    throw new Error(`CP multiplier for level ${level} has not been loaded.`);
  }
  return multiplier;
};

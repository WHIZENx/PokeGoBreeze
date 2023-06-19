import { CPM } from './models/cpm.model';

export const calculateCPM = (baseCPM: number[], min: number, max: number) => {
  const CPMModel = () => {
    return {
      level: 0,
      multiplier: 0,
      step: 0,
    };
  };

  const cpmList: CPM[] = [];
  for (let i = min; i <= max; i += 1) {
    const result: CPM = CPMModel();
    result.level = i;
    if (baseCPM[i]) {
      result.multiplier = baseCPM[i];
    } else {
      const lvLow: any = Object.keys(baseCPM).find((key) => parseInt(key) <= i);
      const lvHigh: any = Object.keys(baseCPM).find((key) => parseInt(key) >= i);
      result.multiplier = Math.sqrt(
        ((Math.pow(baseCPM[lvHigh], 2) - Math.pow(baseCPM[lvLow], 2)) / (lvHigh - lvLow)) * (i - lvLow) + Math.pow(baseCPM[lvLow], 2)
      );
    }
    cpmList.push(result);
  }

  for (let i = min + 0.5; i <= max; i += 1) {
    const result: CPM = CPMModel();
    result.level = i;
    const cpmLow = cpmList.find((cp) => cp.level === Math.floor(i))?.multiplier;
    const cpmHigh = cpmList.find((cp) => cp.level === Math.ceil(i))?.multiplier;
    result.multiplier = Math.sqrt(Math.pow(cpmLow ?? 0, 2) - Math.pow(cpmLow ?? 0, 2) / 2 + Math.pow(cpmHigh ?? 0, 2) / 2);
    cpmList.push(result);
  }
  return cpmList.sort((a, b) => a.level - b.level);
};

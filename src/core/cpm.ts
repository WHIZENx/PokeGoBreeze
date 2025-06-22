import { DynamicObj, toFloat, toNumber } from '../utils/extension';
import { CPM, ICPM } from './models/cpm.model';

export const calculateBaseCPM = (baseCPM: DynamicObj<number>, min: number, max: number) => {
  const cpmList: ICPM[] = [];
  for (let i = min; i <= max; i += 1) {
    const result = new CPM();
    result.level = i;
    if (baseCPM[i]) {
      result.multiplier = baseCPM[i];
    } else {
      const lvLow = toNumber(Object.keys(baseCPM).find((key) => toNumber(key) <= i));
      const lvHigh = toNumber(Object.keys(baseCPM).find((key) => toNumber(key) >= i));
      result.multiplier = Math.sqrt(
        ((Math.pow(baseCPM[lvHigh], 2) - Math.pow(baseCPM[lvLow], 2)) / (lvHigh - lvLow)) * (i - lvLow) +
          Math.pow(baseCPM[lvLow], 2)
      );
    }
    cpmList.push(result);
  }

  for (let i = min + 0.5; i <= max; i += 1) {
    const result = new CPM();
    result.level = i;
    const cpmLow = toNumber(cpmList.find((cp) => cp.level === Math.floor(i))?.multiplier);
    const cpmHigh = toNumber(cpmList.find((cp) => cp.level === Math.ceil(i))?.multiplier);
    result.multiplier = Math.sqrt(Math.pow(cpmLow, 2) - Math.pow(cpmLow, 2) / 2 + Math.pow(cpmHigh, 2) / 2);

    if (i > 0) {
      result.step = result.multiplier - cpmList[i - 0]?.multiplier;
    }

    cpmList.push(result);
  }

  for (let i = min; i <= max; i += 0.5) {
    const currLevel = cpmList.find((j) => j.level === i);
    if (currLevel && i > 1) {
      currLevel.step = currLevel.multiplier - toNumber(cpmList.find((j) => j.level === i - 0.5)?.multiplier);
    }
  }
  return cpmList.sort((a, b) => a.level - b.level);
};

export const calculateCPM = (cpmList: DynamicObj<number>, min: number, max: number) => {
  const result = Object.entries(cpmList).map(([l, v]) => {
    const cpm = new CPM();
    const level = toFloat(l);
    cpm.level = level;
    cpm.multiplier = v;

    if (level > 1) {
      const cpmLow = toNumber(cpmList[level - 0.5]);
      const cpmHeight = toNumber(cpmList[level]);
      cpm.step = Math.max(0, cpmHeight - cpmLow);
    }
    return cpm;
  });

  return result.sort((a, b) => a.level - b.level).filter((r) => r.level >= min && r.level <= max);
};

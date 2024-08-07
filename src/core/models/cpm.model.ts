export interface ICPM {
  level: number;
  multiplier: number;
  step?: number;
}

export interface CPMData {
  level: number;
  multiplier: number;
  stadust: number;
  sum_stadust: number;
  candy: number;
  sum_candy: number;
  xl_candy: number;
  sum_xl_candy: number;
}

export class CPM implements ICPM {
  level: number;
  multiplier: number;
  step: number;

  constructor() {
    this.level = 0;
    this.multiplier = 0;
    this.step = 0;
  }
}

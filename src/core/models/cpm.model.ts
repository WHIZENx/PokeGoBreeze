export interface ICPM {
  level: number;
  multiplier: number;
  step?: number;
}

export interface CPMData {
  level: number;
  multiplier: number;
  stadust: number | null;
  sum_stadust: number | null;
  candy: number | null;
  sum_candy: number | null;
  xl_candy: number | null;
  sum_xl_candy: number | null;
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

export interface ICPMDetail {
  level: number;
  multiplier: number;
  stardust: number;
  sumStardust: number;
  candy: number;
  sumCandy: number;
  xlCandy: number;
  sumXlCandy: number;
}

// tslint:disable-next-line:max-classes-per-file
export class CPMDetail implements ICPMDetail {
  level: number = 0;
  multiplier: number = 1;
  stardust: number = 0;
  sumStardust: number = 0;
  candy: number = 0;
  sumCandy: number = 0;
  xlCandy: number = 0;
  sumXlCandy: number = 0;

  static create() {
    const obj = new CPMDetail();
    Object.assign(this, obj);
    return obj;
  }

  constructor() {
    this.level = 0;
    this.multiplier = 0;
  }

  static mapping(value: CPMData) {
    const obj = new CPMDetail();
    if (value) {
      obj.level = value.level;
      obj.multiplier = value.multiplier;
      obj.stardust = value.stadust ?? 0;
      obj.sumStardust = value.sum_stadust ?? 0;
      obj.candy = value.candy ?? 0;
      obj.sumCandy = value.sum_candy ?? 0;
      obj.xlCandy = value.xl_candy ?? 0;
      obj.sumXlCandy = value.sum_xl_candy ?? 0;
    }
    return obj;
  }
}

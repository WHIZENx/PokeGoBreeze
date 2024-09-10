import { getValueOrDefault } from '../../util/models/util.model';

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
  level = 0;
  multiplier = 1;
  stardust = 0;
  sumStardust = 0;
  candy = 0;
  sumCandy = 0;
  xlCandy = 0;
  sumXlCandy = 0;

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
      obj.stardust = getValueOrDefault(Number, value.stadust);
      obj.sumStardust = getValueOrDefault(Number, value.sum_stadust);
      obj.candy = getValueOrDefault(Number, value.candy);
      obj.sumCandy = getValueOrDefault(Number, value.sum_candy);
      obj.xlCandy = getValueOrDefault(Number, value.xl_candy);
      obj.sumXlCandy = getValueOrDefault(Number, value.sum_xl_candy);
    }
    return obj;
  }
}

export interface ITier {
  level: number;
  CPm: number;
  sta: number;
  timer: number;
}

export class Tier implements ITier {
  level: number = 0;
  CPm: number = 0;
  sta: number = 0;
  timer: number = 0;

  static create(value: ITier) {
    const obj = new Tier();
    Object.assign(obj, value);
    return obj;
  }
}

interface ICostPowerUp {
  stardust: number;
  candy: number;
  type: string;
}

// tslint:disable-next-line:max-classes-per-file
export class CostPowerUp implements ICostPowerUp {
  stardust: number = 0;
  candy: number = 0;
  type: string = '';

  static create(value: ICostPowerUp) {
    const obj = new CostPowerUp();
    Object.assign(obj, value);
    return obj;
  }
}

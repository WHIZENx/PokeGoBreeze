import { PokemonType } from '../../enums/type.enum';

export interface ITier {
  level: number;
  CPm: number;
  sta: number;
  timer: number;
}

export class Tier implements ITier {
  level = 0;
  CPm = 0;
  sta = 0;
  timer = 0;

  static create(value: ITier) {
    const obj = new Tier();
    Object.assign(obj, value);
    return obj;
  }
}

interface ICostPowerUp {
  stardust: number;
  candy: number;
  type: PokemonType | undefined;
}

export class CostPowerUp implements ICostPowerUp {
  stardust = 0;
  candy = 0;
  type: PokemonType | undefined;

  static create(value: ICostPowerUp) {
    const obj = new CostPowerUp();
    Object.assign(obj, value);
    return obj;
  }
}

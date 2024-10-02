import { BuffType, TypeAction } from '../../enums/type.enum';
import { MoveSetting } from './options.model';

export interface IBuff {
  type?: TypeAction;
  target?: BuffType;
  power: number;
  buffChance?: number;
}

export class Buff implements IBuff {
  type?: TypeAction;
  target?: BuffType;
  power = 0;
  buffChance?: number;

  static create(value: IBuff) {
    const obj = new Buff();
    Object.assign(obj, value);
    return obj;
  }
}

interface IMove extends MoveSetting {
  id: number;
}

export class Move implements IMove {
  id = 0;
  movementId: string | number = '';
  animationId = 0;
  pokemonType = '';
  power = 0;
  accuracyChance = 0;
  criticalChance = 0;
  staminaLossScalar = 0;
  trainerLevelMin = 0;
  trainerLevelMax = 0;
  vfxName = '';
  durationMs = 0;
  damageWindowStartMs = 0;
  damageWindowEndMs = 0;
  energyDelta = 0;

  constructor({ ...props }: IMove) {
    Object.assign(this, props);
  }
}

interface ISequence {
  id: string;
  path: string | undefined;
}

export class Sequence implements ISequence {
  id = '';
  path: string | undefined;

  constructor({ ...props }: ISequence) {
    Object.assign(this, props);
  }
}

export interface ICombat {
  name: string;
  type: string | undefined;
  typeMove: string | undefined;
  pvpPower: number;
  pvpEnergy: number;
  sound: string | undefined;
  buffs: IBuff[];
  id: number;
  track: number;
  pvePower: number;
  pveEnergy: number;
  durationMs: number;
  damageWindowStartMs: number;
  damageWindowEndMs: number;
  accuracyChance: number;
  criticalChance: number;
  staminaLossScalar: number;
  archetype: string | undefined;
  abbreviation: string | undefined;
  elite?: boolean;
  shadow?: boolean;
  purified?: boolean;
  special?: boolean;
}

export class Combat implements ICombat {
  name = '';
  type: string | undefined;
  typeMove: string | undefined;
  pvpPower = 0;
  pvpEnergy = 0;
  sound: string | undefined;
  buffs: IBuff[] = [];
  id = 0;
  track = 0;
  pvePower = 0;
  pveEnergy = 0;
  durationMs = 0;
  damageWindowStartMs = 0;
  damageWindowEndMs = 0;
  accuracyChance = 0;
  criticalChance = 0;
  staminaLossScalar = 0;
  archetype: string | undefined;
  abbreviation: string | undefined;
  elite?: boolean;
  shadow?: boolean;
  purified?: boolean;
  special?: boolean;

  static create(value: ICombat) {
    const obj = new Combat();
    Object.assign(obj, value);
    return obj;
  }
}

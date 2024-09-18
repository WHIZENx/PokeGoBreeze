import { MoveSetting } from './options.model';

export interface IBuff {
  type: string;
  target: string;
  power: number;
  buffChance?: number;
}

export class Buff implements IBuff {
  type = '';
  target = '';
  power = 0;
  buffChance?: number;

  constructor({ ...props }: IBuff) {
    Object.assign(this, props);
  }
}

interface IMove extends MoveSetting {
  id: number;
}

// tslint:disable-next-line:max-classes-per-file
export class Move implements IMove {
  id = 0;
  movementId = '';
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

// tslint:disable-next-line:max-classes-per-file
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

// tslint:disable-next-line:max-classes-per-file
export class Combat implements ICombat {
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

  constructor() {
    this.name = '';
    this.pvpPower = 0;
    this.pvpEnergy = 0;
    this.buffs = [];
    this.id = 0;
    this.track = 0;
    this.pvePower = 0;
    this.pveEnergy = 0;
    this.durationMs = 0;
    this.damageWindowStartMs = 0;
    this.damageWindowEndMs = 0;
    this.accuracyChance = 0;
    this.criticalChance = 0;
    this.staminaLossScalar = 0;
  }

  static create(value: ICombat) {
    const obj = new Combat();
    Object.assign(obj, value);
    return obj;
  }
}

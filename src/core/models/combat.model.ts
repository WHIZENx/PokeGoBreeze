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

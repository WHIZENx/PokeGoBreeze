export interface IBuff {
  type: string;
  target: string;
  power: number;
  buffChance?: number;
}

export class Buff implements IBuff {
  type: string = '';
  target: string = '';
  power: number = 0;
  buffChance?: number;

  constructor({ ...props }: IBuff) {
    Object.assign(this, props);
  }
}

export interface ICombat {
  name: string;
  type: string | null;
  type_move: string | null;
  pvp_power: number;
  pvp_energy: number;
  sound: string | null;
  buffs: IBuff[];
  id: number;
  track: number;
  pve_power: number;
  pve_energy: number;
  durationMs: number;
  damageWindowStartMs: number;
  damageWindowEndMs: number;
  accuracyChance: number;
  criticalChance: number;
  staminaLossScalar: number;
  archetype: string | null;
  elite?: boolean;
  shadow?: boolean;
  purified?: boolean;
  special?: boolean;
}

// tslint:disable-next-line:max-classes-per-file
export class Combat implements ICombat {
  name: string;
  type!: string | null;
  // tslint:disable-next-line:variable-name
  type_move!: string | null;
  // tslint:disable-next-line:variable-name
  pvp_power: number;
  // tslint:disable-next-line:variable-name
  pvp_energy: number;
  sound!: string | null;
  buffs: IBuff[];
  id: number;
  track: number;
  // tslint:disable-next-line:variable-name
  pve_power: number;
  // tslint:disable-next-line:variable-name
  pve_energy: number;
  durationMs: number;
  damageWindowStartMs: number;
  damageWindowEndMs: number;
  accuracyChance: number;
  criticalChance: number;
  staminaLossScalar: number;
  archetype!: string | null;
  elite?: boolean;
  shadow?: boolean;
  purified?: boolean;
  special?: boolean;

  constructor() {
    this.name = '';
    this.pvp_power = 0;
    this.pvp_energy = 0;
    this.buffs = [];
    this.id = 0;
    this.track = 0;
    this.pve_power = 0;
    this.pve_energy = 0;
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

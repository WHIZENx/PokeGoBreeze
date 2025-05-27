import { BuffType, MoveType, TypeAction, TypeMove } from '../../enums/type.enum';
import { ArcheType } from '../../pages/PVP/enums/arche-type.enum';
import { BonusType } from '../enums/bonus-type.enum';
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

interface IMove extends Partial<MoveSetting> {
  id: number;
  name: string;
}

export class Move implements IMove {
  id = 0;
  name = '';
  power = 0;
  energyDelta = 0;
  durationMs = 0;
  damageWindowStartMs = 0;
  damageWindowEndMs = 0;
  accuracyChance = 0;
  criticalChance = 0;
  staminaLossScalar = 0;

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

interface ICost {
  candyCost: number;
  stardustCost: number;
}

export class Cost implements ICost {
  candyCost = 0;
  stardustCost = 0;
}

interface SpaceBonus {
  pokemonVisibleRangeMeters: number;
  encounterRangeMeters: number;
  serverAllowableEncounterRangeMeters: number;
}

interface TimeBonus {
  affectedItems: string[];
}

interface DayNightBonus {
  incenseItem: string;
}

interface SlowFreezeBonus {
  catchCircleTimeScaleOverride: number;
  catchRateIncreaseMultiplier: number;
  catchCircleSpeedChangeThreshold: number;
  catchCircleOuterTimeScaleOverride: number;
}

export type BonusEffectType = SpaceBonus | TimeBonus | DayNightBonus | SlowFreezeBonus;

export interface IBonusEffect {
  spaceBonus?: SpaceBonus;
  timeBonus?: TimeBonus;
  dayNightBonus?: DayNightBonus;
  slowFreezeBonus?: SlowFreezeBonus;
}

class BonusEffect implements IBonusEffect {
  spaceBonus?: SpaceBonus;
  timeBonus?: TimeBonus;
  dayNightBonus?: DayNightBonus;
  slowFreezeBonus?: SlowFreezeBonus;
}

interface IBonus {
  cost: Cost;
  bonusEffect: IBonusEffect;
  durationMs: number;
  bonusType: BonusType;
  enableMultiUse?: boolean;
  extraDurationMs: number;
  enableNonCombatMove?: boolean;
}

export class Bonus implements IBonus {
  cost = new Cost();
  bonusEffect = new BonusEffect();
  durationMs = 0;
  bonusType = BonusType.None;
  enableMultiUse?: boolean;
  extraDurationMs = 0;
  enableNonCombatMove?: boolean;

  static create(value: IBonus) {
    const obj = new Bonus();
    Object.assign(obj, value);
    return obj;
  }
}

export interface ICombat {
  name: string;
  type?: string;
  typeMove?: TypeMove;
  pvpPower: number;
  pvpEnergy: number;
  sound?: string;
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
  archetype?: ArcheType;
  abbreviation?: string;
  isMultipleWithType: boolean;
  moveType?: MoveType;
  bonus?: IBonus;
}

export class Combat implements ICombat {
  name = '';
  type?: string;
  typeMove?: TypeMove;
  pvpPower = 0;
  pvpEnergy = 0;
  sound?: string;
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
  archetype?: ArcheType;
  abbreviation?: string;
  isMultipleWithType = false;
  moveType?: MoveType;
  bonus?: IBonus;

  static create(value: ICombat) {
    const obj = new Combat();
    Object.assign(obj, value);
    return obj;
  }
}

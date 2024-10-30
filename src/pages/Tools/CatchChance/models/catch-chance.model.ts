import { DynamicObj } from '../../../../util/extension';
import { PokeBallType } from '../enums/poke-ball.enum';

export interface PokemonCatchChance {
  baseCaptureRate?: number;
  baseFleeRate?: number;
  movementType?: string;
  movementTimerS?: number;
  jumpTimeS?: number;
  attackTimerS?: number;
  attackProbability?: number;
  dodgeProbability?: number;
  dodgeDurationS?: number;
  dodgeDistance?: number;
  obShadowFormBaseCaptureRate?: number;
  obShadowFormAttackProbability?: number;
  obShadowFormDodgeProbability?: number;
  result?: DynamicObj<DynamicObj<number>>;
}

interface ITitleThrow {
  title: string;
  type: string;
  threshold: number[];
}

export class TitleThrow implements ITitleThrow {
  title = '';
  type = '';
  threshold: number[] = [];

  constructor({ ...props }: ITitleThrow) {
    Object.assign(this, props);
  }
}

interface IDataAdvance {
  result: number;
  ballName: string;
  throwType: string;
}

export class DataAdvance implements IDataAdvance {
  result = 0;
  ballName = '';
  throwType = '';

  static create(value: IDataAdvance) {
    const obj = new DataAdvance();
    Object.assign(obj, value);
    return obj;
  }
}

interface IMedalType {
  priority: number;
  type: string;
}

export class MedalType implements IMedalType {
  priority = 0;
  type = '';

  static create(value: IMedalType) {
    const obj = new MedalType();
    Object.assign(obj, value);
    return obj;
  }
}

interface IMedal {
  typePri: IMedalType;
  typeSec: IMedalType;
}

export class Medal implements IMedal {
  typePri = new MedalType();
  typeSec = new MedalType();

  static create(value: IMedal) {
    const obj = new Medal();
    Object.assign(obj, value);
    return obj;
  }
}

interface IAdvanceOption {
  ballType: PokeBallType;
  isNormalThrow: boolean;
}

export class AdvanceOption implements IAdvanceOption {
  ballType = PokeBallType.PokeBall;
  isNormalThrow = false;

  static create(value: IAdvanceOption) {
    const obj = new AdvanceOption();
    Object.assign(obj, value);
    return obj;
  }
}

interface IPokeBallOption {
  isAdvance: boolean;
  isCurveBall: boolean;
  isRazzBerry: boolean;
  isGoldenRazzBerry: boolean;
  isSilverPinaps: boolean;
  isShadow: boolean;
}

export class PokeBallOption implements IPokeBallOption {
  isAdvance = false;
  isCurveBall = false;
  isRazzBerry = false;
  isGoldenRazzBerry = false;
  isSilverPinaps = false;
  isShadow = false;

  static create(value: IPokeBallOption) {
    const obj = new PokeBallOption();
    Object.assign(obj, value);
    return obj;
  }
}

export interface PokeBallThreshold {
  name: string;
  threshold: number;
}

export interface ThrowThreshold {
  name: string;
  threshold: number[];
}

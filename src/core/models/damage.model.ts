import { PokemonType, ThrowType } from '../../enums/type.enum';
import { MIN_LEVEL } from '../../util/constants';
import { IPokemonFormModify } from './API/form.model';
import { ICombat } from './combat.model';

export interface ILabelDamage {
  label?: number;
  color?: string;
  style: string;
}

export class LabelDamage implements ILabelDamage {
  label?: number;
  color?: string;
  style = '';

  static create(value: ILabelDamage) {
    const obj = new LabelDamage();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IBattleState {
  isStab: boolean;
  isWb: boolean;
  isDodge?: boolean;
  isTrainer?: boolean;
  fLevel?: number;
  cLevel?: ThrowType;
  effective: number;
  isMega?: boolean;
}

export class BattleState implements IBattleState {
  isStab = false;
  isWb = false;
  isDodge?: boolean;
  isTrainer?: boolean;
  fLevel?: number;
  cLevel?: number;
  effective = 0;

  static create(value: IBattleState) {
    const obj = new BattleState();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IPokemonDmgOption {
  objPoke?: IPokemonFormModify;
  type?: PokemonType;
  currPoke?: IPokemonFormModify;
  currLevel: number;
  typeObj?: PokemonType;
  objLevel: number;
  move?: ICombat;
  battleState?: IBattleState;
  damage?: number;
  hp?: number;
}

export class PokemonDmgOption implements IPokemonDmgOption {
  objPoke?: IPokemonFormModify;
  type?: PokemonType;
  currPoke?: IPokemonFormModify;
  currLevel = MIN_LEVEL;
  typeObj?: PokemonType;
  objLevel = MIN_LEVEL;
  move?: ICombat;
  battleState?: IBattleState;
  damage?: number;
  hp?: number;

  static create(value: IPokemonDmgOption) {
    const obj = new PokemonDmgOption();
    Object.assign(obj, value);
    return obj;
  }
}

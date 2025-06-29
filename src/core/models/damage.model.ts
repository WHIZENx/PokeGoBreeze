import { PokemonType, ThrowType } from '../../enums/type.enum';
import { minLevel } from '../../utils/helpers/options-context.helpers';
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
  friendshipLevel?: number;
  throwLevel?: ThrowType;
  effective: number;
  isMega?: boolean;
}

export class BattleState implements IBattleState {
  isStab = false;
  isWb = false;
  isDodge?: boolean;
  isTrainer?: boolean;
  friendshipLevel?: number;
  throwLevel?: number;
  effective = 0;

  static create(value: IBattleState) {
    const obj = new BattleState();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IPokemonDmgOption {
  objPoke?: Partial<IPokemonFormModify>;
  type?: PokemonType;
  currPoke?: Partial<IPokemonFormModify>;
  currLevel: number;
  typeObj?: PokemonType;
  objLevel: number;
  move?: ICombat;
  battleState?: IBattleState;
  damage?: number;
  hp?: number;
}

export class PokemonDmgOption implements IPokemonDmgOption {
  objPoke?: Partial<IPokemonFormModify>;
  type?: PokemonType;
  currPoke?: Partial<IPokemonFormModify>;
  currLevel = minLevel();
  typeObj?: PokemonType;
  objLevel = minLevel();
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

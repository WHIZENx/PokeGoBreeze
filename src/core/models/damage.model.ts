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
  stab: boolean;
  wb: boolean;
  dodge?: boolean;
  trainer?: boolean;
  fLevel?: number;
  cLevel?: number;
  effective: number;
  mega?: boolean;
}

// tslint:disable-next-line:max-classes-per-file
export class BattleState implements IBattleState {
  stab = false;
  wb = false;
  dodge?: boolean;
  trainer?: boolean;
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
  type?: string;
  currPoke?: IPokemonFormModify;
  currLevel: number;
  typeObj?: string;
  objLevel: number;
  move?: ICombat;
  battleState?: IBattleState;
  damage?: number;
  hp?: number;
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonDmgOption implements IPokemonDmgOption {
  objPoke?: IPokemonFormModify;
  type?: string;
  currPoke?: IPokemonFormModify;
  currLevel = 0;
  typeObj?: string;
  objLevel = 0;
  move?: ICombat;
  battleState?: IBattleState;
  damage?: number;
  hp?: number;

  constructor() {
    this.currLevel = 0;
    this.objLevel = 1;
  }
}

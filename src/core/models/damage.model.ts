import { IPokemonFormModify } from './API/form.model';
import { ICombat } from './combat.model';

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

export class BattleState implements IBattleState {
  stab: boolean = false;
  wb: boolean = false;
  dodge?: boolean = false;
  trainer?: boolean = false;
  fLevel?: number = 0;
  cLevel?: number = 0;
  effective: number = 0;

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
  currLevel: number = 0;
  typeObj?: string;
  objLevel: number = 0;
  move?: ICombat;
  battleState?: IBattleState;
  damage?: number;
  hp?: number;

  constructor() {
    this.currLevel = 0;
    this.objLevel = 1;
  }
}

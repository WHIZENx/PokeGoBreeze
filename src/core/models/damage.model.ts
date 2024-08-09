import { IPokemonFormModify } from './API/form.model';
import { ICombat } from './combat.model';

export interface IPokemonDmgOption {
  objPoke?: IPokemonFormModify;
  type?: string;
  currPoke?: IPokemonFormModify;
  currLevel: number;
  typeObj?: string;
  objLevel: number;
  move?: ICombat;
  battleState?: {
    stab: boolean;
    wb: boolean;
    dodge: boolean;
    trainer: boolean;
    fLevel: number;
    cLevel: string | number;
    effective: string | number;
  };
  damage?: number;
  hp?: number;
}

export class PokemonDmgOption implements IPokemonDmgOption {
  objPoke?: IPokemonFormModify;
  type?: string;
  currPoke?: IPokemonFormModify;
  currLevel: number = 0;
  typeObj?: string;
  objLevel: number = 0;
  move?: ICombat;
  battleState?: {
    stab: boolean;
    wb: boolean;
    dodge: boolean;
    trainer: boolean;
    fLevel: number;
    cLevel: string | number;
    effective: string | number;
  };
  damage?: number;
  hp?: number;

  constructor() {
    this.currLevel = 0;
    this.objLevel = 1;
  }
}

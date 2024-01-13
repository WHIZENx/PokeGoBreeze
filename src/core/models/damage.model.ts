import { PokemonFormModify } from './API/form.model';
import { Combat } from './combat.model';

export interface PokemonDmgOption {
  objPoke?: PokemonFormModify;
  type?: string;
  currPoke?: PokemonFormModify;
  currLevel: number;
  typeObj?: string;
  objLevel: number;
  move?: Combat;
  battleState?: {
    stab: boolean;
    wb: boolean;
    dodge: boolean;
    trainer: boolean;
    flevel: number;
    clevel: string | number;
    effective: string | number;
  };
  damage?: number;
  hp?: number;
}

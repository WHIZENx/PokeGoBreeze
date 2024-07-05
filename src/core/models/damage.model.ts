import { IPokemonFormModify } from './API/form.model';
import { ICombat } from './combat.model';

export interface PokemonDmgOption {
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
    flevel: number;
    clevel: string | number;
    effective: string | number;
  };
  damage?: number;
  hp?: number;
}

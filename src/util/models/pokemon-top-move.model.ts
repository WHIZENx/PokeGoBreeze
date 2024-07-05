import { ICombat } from '../../core/models/combat.model';

export interface PokemonTopMove {
  num: number;
  forme: string | null;
  name: string;
  baseSpecies: string | null;
  sprite: string;
  releasedGO: boolean;
  isElite: boolean;
  isSpecial: boolean;
  dps: number;
  tdo: number;
}

export interface IPokemonQueryMove {
  fmove: ICombat;
  cmove: ICombat;
  eDPS: {
    offensive: number;
    defensive: number;
  };
}

export interface PokemonQueryRankMove {
  data: IPokemonQueryMove[];
  maxOff?: number;
  maxDef?: number;
}

export interface IPokemonQueryCounter {
  pokemon_id: number;
  pokemon_name: string;
  pokemon_forme: string | null;
  releasedGO: boolean;
  dps: number;
  fmove: ICombat;
  cmove: ICombat;
}

import { Combat } from '../../core/models/combat.model';

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

export interface PokemonQueryMove {
  fmove: Combat;
  cmove: Combat;
  eDPS: {
    offensive: number;
    defensive: number;
  };
}

export interface PokemonQueryRankMove {
  data: PokemonQueryMove[];
  maxOff?: number;
  maxDef?: number;
}

export interface PokemonQueryCounter {
  pokemon_id: number;
  pokemon_name: string;
  pokemon_forme: string | null;
  releasedGO: boolean;
  dps: number;
  fmove: Combat;
  cmove: Combat;
}

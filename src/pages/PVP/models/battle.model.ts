import { Combat, CombatPokemon } from '../../../core/models/combat.model';
import { PokemonDataModel } from '../../../core/models/pokemon.model';

export interface PokemonBattleData {
  speciesId?: string;
  name?: string;
  form?: string;
  id?: number;
  shadow: boolean;
  allStats?: any;
  hp?: number;
  stats: any;
  bestStats: any;
  currentStats: any;
  pokemon: PokemonDataModel;
  fmove?: Combat;
  cmove?: Combat;
  cmoveSec?: any;
  energy?: number;
  block?: number;
  turn?: number;
  combatPoke?: CombatPokemon;
  disableCMoveSec?: boolean;
  disableCMovePri?: boolean;
}

export interface PokemonBattle {
  disableCMoveSec?: boolean;
  disableCMovePri?: boolean;
  shadow: boolean;
  pokemonData: PokemonBattleData;
  fMove?: any;
  cMovePri?: any;
  cMoveSec?: any;
  timeline?: any[];
  energy?: number;
  block?: number;
}

export interface PokemonTeamData {
  id: number | undefined;
  name: string | undefined;
  speciesId: number;
  pokemonData: PokemonDataModel | undefined;
  form: string | null;
  stats:
    | { hp?: number; atk: number; def: number; sta?: number | undefined; spa?: number; spd?: number; spe?: number }
    | { atk: number; def: number; sta: number };
  atk: { id: number; form: string; attack: number; rank: number } | undefined;
  def: { id: number; form: string; defense: number; rank: number } | undefined;
  sta: { id: number; form: string; stamina: number; rank: number } | undefined;
  fmove: Combat | undefined;
  cmovePri: Combat | undefined;
  cmoveSec: Combat | undefined;
  combatPoke: CombatPokemon;
  shadow: boolean;
  purified: boolean;
}

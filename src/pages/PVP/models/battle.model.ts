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

import { Combat, CombatPokemon } from './combat.model';
import { PokemonDataModel } from './pokemon.model';
import { StatsPokemon } from './stats.model';

export interface PVPDataModel {
  rankings: PVPInfo[];
  trains: PVPInfo[];
}

interface PVPInfo {
  id: string;
  name: string;
  cp: number[];
  logo: string | null;
}

export interface TeamsPVP {
  performers: Performers[];
  properties: Properties;
  teams: Teams[];
}

export interface Performers {
  id: number | undefined;
  name: string | undefined;
  speciesId: number;
  pokemonData: PokemonDataModel | undefined;
  form: string | null;
  stats: StatsPokemon;
  atk: { id: number; form: string; attack: number; rank: number } | undefined;
  def: { id: number; form: string; defense: number; rank: number } | undefined;
  sta: { id: number; form: string; stamina: number; rank: number } | undefined;
  fmove: Combat | undefined;
  cmovePri: Combat | undefined;
  cmoveSec: Combat | undefined;
  combatPoke: CombatPokemon | undefined;
  shadow: boolean;
  purified: boolean | undefined;
  games: number;
  individualScore: number;
  pokemon: string;
  teamScore: number;
  performersTotalGames: number;
}

interface Properties {
  lastUpdated: string;
  totalPerformers: number;
  totalTeams: number;
}

interface Teams {
  games: number;
  team: string;
  teamScore: number;
}

export interface RankingsPVP {
  counters: PokemonVersus[];
  matchups: PokemonVersus[];
  moves: {
    chargedMoves: PokemonRankingMove[];
    fastMoves: PokemonRankingMove[];
  };
  moveset: string[];
  rating: number;
  score: number;
  scores: number[];
  speciesId: string;
  speciesName: string;
  stats: PokemonRankingStats;
}

export interface PokemonVersus {
  opponent: string;
  rating: number;
}

interface PokemonRankingMove {
  moveId: string;
  uses: number | null;
}

interface PokemonRankingStats {
  product?: number;
  atk: number;
  def: number;
  hp?: number;
}

export interface BattlePokemonData {
  counters: PokemonVersus[];
  matchups: PokemonVersus[];
  moves: {
    chargedMoves: PokemonRankingMove[];
    fastMoves: PokemonRankingMove[];
  };
  moveset: string[];
  rating: number;
  score: number;
  scores: number[];
  speciesId: string;
  speciesName: string;
  stats: PokemonRankingStats;
  name: string | undefined;
  pokemon: PokemonDataModel;
  id: number;
  form: string | null;
}

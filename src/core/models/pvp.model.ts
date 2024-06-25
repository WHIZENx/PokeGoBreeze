import { PokemonTeamData } from '../../pages/PVP/models/battle.model';
import { Combat } from './combat.model';
import { PokemonDataModel } from './pokemon.model';
import { StatsAtk, StatsDef, StatsPokemon, StatsSta } from './stats.model';

export interface PVPDataModel {
  rankings: PVPInfo[];
  trains: PVPInfo[];
}

export interface PVPInfo {
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
  speciesId: string;
  pokemonData: PokemonDataModel | undefined;
  form: string | null;
  stats: StatsPokemon;
  atk: StatsAtk | undefined;
  def: StatsDef | undefined;
  sta: StatsSta | undefined;
  fmove: Combat | undefined;
  cmovePri: Combat | undefined;
  cmoveSec: Combat | undefined;
  combatPoke: PokemonDataModel | undefined;
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
  teamsData: PokemonTeamData[];
  teamsTotalGames: number;
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

export interface PokemonRankingMove {
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
  shadow?: boolean;
  purified?: boolean;
}

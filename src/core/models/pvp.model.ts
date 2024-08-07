import { IPokemonTeamData } from '../../pages/PVP/models/battle.model';
import { ICombat } from './combat.model';
import { IPokemonData, PokemonData } from './pokemon.model';
import { IStatsAtk, IStatsDef, IStatsPokemon, IStatsSta } from './stats.model';

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
  pokemonData: IPokemonData | undefined;
  form: string | null;
  stats: IStatsPokemon;
  atk: IStatsAtk | undefined;
  def: IStatsDef | undefined;
  sta: IStatsSta | undefined;
  fMove: ICombat | undefined;
  cMovePri: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  combatPoke: IPokemonData | undefined;
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

export interface Teams {
  games: number;
  team: string;
  teamScore: number;
  teamsData: IPokemonTeamData[];
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

interface IPokemonRankingStats {
  product?: number;
  atk: number;
  def: number;
  hp?: number;
}

export class PokemonRankingStats implements IPokemonRankingStats {
  product?: number;
  atk: number = 0;
  def: number = 0;
  hp?: number;

  constructor() {
    this.atk = 0;
    this.def = 0;
  }
}

interface IMovePokemonRanking {
  chargedMoves: PokemonRankingMove[];
  fastMoves: PokemonRankingMove[];
}

// tslint:disable-next-line:max-classes-per-file
class MovePokemonRanking implements IMovePokemonRanking {
  chargedMoves: PokemonRankingMove[] = [];
  fastMoves: PokemonRankingMove[] = [];
}

export interface IBattlePokemonData {
  counters: PokemonVersus[];
  matchups: PokemonVersus[];
  moves: IMovePokemonRanking;
  moveset: string[];
  rating: number;
  score: number;
  scores: number[];
  speciesId: string;
  speciesName: string;
  stats: IPokemonRankingStats;
  name: string | undefined;
  pokemon: IPokemonData;
  id: number;
  form: string | null;
  shadow?: boolean;
  purified?: boolean;
}

// tslint:disable-next-line:max-classes-per-file
export class BattlePokemonData implements IBattlePokemonData {
  counters: PokemonVersus[] = [];
  matchups: PokemonVersus[] = [];
  moves: IMovePokemonRanking = new MovePokemonRanking();
  moveset: string[] = [];
  rating: number = 0;
  score: number = 0;
  scores: number[] = [];
  speciesId: string = '';
  speciesName: string = '';
  stats: IPokemonRankingStats = new PokemonRankingStats();
  name: string | undefined;
  pokemon: IPokemonData = new PokemonData();
  id: number = 0;
  form: string | null = null;
  shadow?: boolean;
  purified?: boolean;

  // tslint:disable-next-line:no-empty
  constructor() {}

  static create(value: IBattlePokemonData) {
    const obj = new BattlePokemonData();
    Object.assign(obj, value);
    return obj;
  }
}

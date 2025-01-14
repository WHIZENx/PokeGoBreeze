import { PokemonType } from '../../enums/type.enum';
import { ArcheType } from '../../pages/PVP/enums/arche-type.enum';
import { IPokemonTeamData } from '../../pages/PVP/models/battle.model';
import { BattleLeagueCPType } from '../../util/enums/compute.enum';
import { getPokemonType } from '../../util/utils';
import { ICombat } from './combat.model';
import { IPokemonData, PokemonData } from './pokemon.model';
import { IStatsAtk, IStatsBase, IStatsDef, IStatsSta, StatsBase } from './stats.model';

export interface IPVPDataModel {
  rankings: IPVPInfo[];
  trains: IPVPInfo[];
}

export class PVPDataModel implements IPVPDataModel {
  rankings: IPVPInfo[] = [];
  trains: IPVPInfo[] = [];
}

export interface IPVPInfo {
  id: string;
  name: string;
  cp: BattleLeagueCPType[];
  logo?: string;
}

export class PVPInfo implements IPVPInfo {
  id = '';
  name = '';
  cp: BattleLeagueCPType[] = [];
  logo?: string;
}

export interface TeamsPVP {
  performers: Performers[];
  properties: Properties;
  teams: Teams[];
}

export interface IPerformers {
  id: number | undefined;
  name: string | undefined;
  speciesId: string;
  pokemonData: IPokemonData | undefined;
  form: string | undefined | null;
  stats: IStatsBase;
  atk: IStatsAtk | undefined;
  def: IStatsDef | undefined;
  sta: IStatsSta | undefined;
  fMove: ICombat | undefined;
  cMovePri: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  pokemonType: PokemonType;
  games: number;
  individualScore: number;
  pokemon: string;
  teamScore: number;
  performersTotalGames: number;
  usageTrend: string[];
}

export class Performers implements IPerformers {
  id: number | undefined;
  name: string | undefined;
  speciesId = '';
  pokemonData: IPokemonData | undefined;
  form: string | undefined | null;
  stats = new StatsBase();
  atk: IStatsAtk | undefined;
  def: IStatsDef | undefined;
  sta: IStatsSta | undefined;
  fMove: ICombat | undefined;
  cMovePri: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  pokemonType = PokemonType.Normal;
  games = 0;
  individualScore = 0;
  pokemon = '';
  teamScore = 0;
  performersTotalGames = 0;
  usageTrend: string[] = [];

  constructor({ ...props }: IPerformers) {
    props.pokemonType = getPokemonType(props.form);
    Object.assign(this, props);
  }
}

interface Properties {
  lastUpdated: string;
  totalPerformers: number;
  totalTeams: number;
}

export interface ITeams {
  games: number;
  team: string;
  teamScore: number;
  teamsData: IPokemonTeamData[];
  teamsTotalGames: number;
}

export class Teams implements ITeams {
  games = 0;
  team = '';
  teamScore = 0;
  teamsData: IPokemonTeamData[] = [];
  teamsTotalGames = 0;

  constructor({ ...props }: ITeams) {
    Object.assign(this, props);
  }
}

export interface RankingsPVP {
  counters: PokemonVersus[];
  matchups: PokemonVersus[];
  moves: IMovePokemonRanking;
  moveset: string[];
  rating: number;
  score: number;
  scores: number[];
  speciesId?: string;
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
  sta: number;
  hp?: number;
}

export class PokemonRankingStats implements IPokemonRankingStats {
  product?: number;
  atk = 0;
  def = 0;
  sta = 0;
  hp?: number;
}

export interface IMovePokemonRanking {
  chargedMoves: PokemonRankingMove[];
  fastMoves: PokemonRankingMove[];
}

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
  speciesId?: string;
  speciesName: string;
  stats: IPokemonRankingStats;
  name: string | undefined;
  pokemon: IPokemonData;
  id: number;
  form: string | undefined | null;
  pokemonType: PokemonType;
}

export class BattlePokemonData implements IBattlePokemonData {
  counters: PokemonVersus[] = [];
  matchups: PokemonVersus[] = [];
  moves = new MovePokemonRanking();
  moveset: string[] = [];
  rating = 0;
  score = 0;
  scores: number[] = [];
  speciesId?: string;
  speciesName = '';
  stats = new PokemonRankingStats();
  name: string | undefined;
  pokemon = new PokemonData();
  id = 0;
  form: string | undefined | null;
  pokemonType = PokemonType.Normal;

  static create(value: IBattlePokemonData) {
    const obj = new BattlePokemonData();
    obj.pokemonType = getPokemonType(obj.form);
    Object.assign(obj, value);
    return obj;
  }
}

export interface PokemonPVPMove {
  abbreviation: string;
  archetype: ArcheType;
  cooldown: number;
  energy: number;
  energyGain: number;
  moveId: string;
  name: string;
  power: number;
  type: string;
  buffApplyChance?: string;
  buffTarget?: string;
  buffs?: number[];
}

export interface Toggle {
  eventKey: string;
  children?: JSX.Element;
}

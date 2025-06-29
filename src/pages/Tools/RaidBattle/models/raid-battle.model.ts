import {
  PokemonRaidModel,
  PokemonMoveData,
  IPokemonData,
  IPokemonMoveData,
} from '../../../../core/models/pokemon.model';
import { IStatsIV, StatsIV } from '../../../../core/models/stats.model';
import { PokemonType } from '../../../../enums/type.enum';
import { minLevel } from '../../../../utils/helpers/options-context.helpers';
import { SortDirectionType } from '../../../Sheets/DpsTdo/enums/column-select-type.enum';
import { SortType } from '../enums/raid-state.enum';

export interface ITrainerBattle {
  pokemons: PokemonRaidModel[];
  trainerId: number;
}

export class TrainerBattle implements ITrainerBattle {
  pokemons: PokemonRaidModel[] = [];
  trainerId = 0;

  static create(value: ITrainerBattle) {
    const obj = new TrainerBattle();
    Object.assign(obj, value);
    return obj;
  }
}

export interface BattleResult {
  minDPS: number;
  maxDPS: number;
  minTDO: number;
  maxTDO: number;
  minHP: number;
  maxHP: number;
}

interface IRaidSummary {
  dpsAtk: number;
  dpsDef: number;
  tdoAtk: number;
  tdoDef: number;
  timer: number;
  bossHp: number;
}

export class RaidSummary implements IRaidSummary {
  dpsAtk = 0;
  dpsDef = 0;
  tdoAtk = 0;
  tdoDef = 0;
  timer = 0;
  bossHp = 0;

  static create(value: IRaidSummary) {
    const obj = new RaidSummary();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IRaidResult {
  pokemon: PokemonMoveData[];
  summary: RaidSummary;
}

export class RaidResult implements IRaidResult {
  pokemon: PokemonMoveData[] = [];
  summary = new RaidSummary();

  constructor({ ...props }: IRaidResult) {
    Object.assign(this, props);
  }
}

interface IRaidSetting {
  isShow: boolean;
  id: number;
  pokemon?: IPokemonData;
}

export class RaidSetting implements IRaidSetting {
  isShow = false;
  id = 0;
  pokemon?: IPokemonData;

  static create(value: IRaidSetting) {
    const obj = new RaidSetting();
    Object.assign(obj, value);
    return obj;
  }
}

interface IMovePokemon {
  isShow: boolean;
  id: number;
  pokemon?: IPokemonMoveData;
}

export class MovePokemon implements IMovePokemon {
  isShow = false;
  id = 0;
  pokemon?: IPokemonMoveData;

  static create(value: IMovePokemon) {
    const obj = new MovePokemon();
    Object.assign(obj, value);
    return obj;
  }
}

interface IRaidOption {
  isWeatherBoss: boolean;
  isWeatherCounter: boolean;
  isReleased: boolean;
  enableTimeAllow: boolean;
}

export class RaidOption implements IRaidOption {
  isWeatherBoss = false;
  isWeatherCounter = false;
  isReleased = false;
  enableTimeAllow = false;

  constructor({ ...props }: IRaidOption) {
    Object.assign(this, props);
  }
}

interface IFilterGroup {
  level: number;
  pokemonType: PokemonType;
  iv: IStatsIV;
  onlyShadow: boolean;
  onlyMega: boolean;
  onlyReleasedGO: boolean;
  sortBy: SortType;
  sorted: SortDirectionType;
}

export class FilterGroup implements IFilterGroup {
  level = minLevel();
  pokemonType = PokemonType.Normal;
  iv = new StatsIV();
  onlyShadow = false;
  onlyMega = false;
  onlyReleasedGO = false;
  sortBy = SortType.DPS;
  sorted = SortDirectionType.ASC;

  static create(value: IFilterGroup) {
    const obj = new FilterGroup();
    Object.assign(obj, value);
    return obj;
  }
}

interface IFilter {
  used: IFilterGroup;
  selected: IFilterGroup;
}

export class Filter implements IFilter {
  used = new FilterGroup();
  selected = new FilterGroup();

  constructor({ ...props }: IFilter) {
    Object.assign(this, props);
  }
}

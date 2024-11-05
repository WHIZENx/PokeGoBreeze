import { ISelectMoveModel } from '../../components/Input/models/select-move.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { ColumnSelectType, SortDirectionType } from '../../pages/Sheets/DpsTdo/enums/column-select-type.enum';
import { DEFAULT_POKEMON_DEF_OBJ, DEFAULT_POKEMON_LEVEL, MAX_IV } from '../../util/constants';

interface IOptionDPSSort {
  selectedColumn: number;
  sortDirection: string;
}

export class OptionDPSSort implements IOptionDPSSort {
  selectedColumn = ColumnSelectType.Total;
  sortDirection = SortDirectionType.DESC;

  static create(value: IOptionDPSSort) {
    const obj = new OptionDPSSort();
    Object.assign(obj, value);
    return obj;
  }
}

export interface OptionDPSModel {
  filters: OptionFiltersDPS;
  options: OptionOtherDPS;
  dataTargetPokemon?: IPokemonData;
  fMoveTargetPokemon?: ISelectMoveModel;
  cMoveTargetPokemon?: ISelectMoveModel;
  selectTypes: string[];
  searchTerm: string;
  defaultPage: number;
  defaultRowPerPage: number;
  defaultSorted: OptionDPSSort;
}

interface IOptionFiltersDPS {
  isMatch: boolean;
  showEliteMove: boolean;
  showShadow: boolean;
  showMega: boolean;
  showGmax: boolean;
  showPrimal: boolean;
  showLegendary: boolean;
  showMythic: boolean;
  showUltraBeast: boolean;
  enableShadow: boolean;
  enableElite: boolean;
  enableMega: boolean;
  enableGmax: boolean;
  enablePrimal: boolean;
  enableLegendary: boolean;
  enableMythic: boolean;
  enableUltraBeast: boolean;
  enableBest: boolean;
  enableDelay: boolean;
  releasedGO: boolean;
  bestOf: number;
  ivAtk: number;
  ivDef: number;
  ivHp: number;
  pokemonLevel: number;
}

export class OptionFiltersDPS implements IOptionFiltersDPS {
  isMatch = false;
  showEliteMove = true;
  showShadow = true;
  showMega = true;
  showGmax = true;
  showPrimal = true;
  showLegendary = true;
  showMythic = true;
  showUltraBeast = true;
  enableShadow = false;
  enableElite = false;
  enableMega = false;
  enableGmax = false;
  enablePrimal = false;
  enableLegendary = false;
  enableMythic = false;
  enableUltraBeast = false;
  enableBest = false;
  enableDelay = false;
  releasedGO = true;
  bestOf = 3;
  ivAtk = MAX_IV;
  ivDef = MAX_IV;
  ivHp = MAX_IV;
  pokemonLevel = 40;
}

interface IDelay {
  fTime: number;
  cTime: number;
}

export class Delay implements IDelay {
  fTime = 0;
  cTime = 0;

  static create(value: IDelay) {
    const obj = new Delay();
    Object.assign(obj, value);
    return obj;
  }
}

interface Specific {
  FDmgEnemy: number;
  CDmgEnemy: number;
}

export interface IOptionOtherDPS {
  delay?: IDelay;
  specific?: Specific;
  weatherBoosts?: string;
  isTrainerFriend?: boolean;
  pokemonFriendLevel?: number;
  pokemonDefObj: number;
  ivAtk: number;
  ivDef: number;
  ivHp: number;
  pokemonLevel: number;
  objTypes?: string[];
}

export class OptionOtherDPS implements IOptionOtherDPS {
  delay?: IDelay;
  specific?: Specific;
  weatherBoosts?: string;
  isTrainerFriend?: boolean;
  pokemonFriendLevel?: number;
  pokemonDefObj = DEFAULT_POKEMON_DEF_OBJ;
  ivAtk = MAX_IV;
  ivDef = MAX_IV;
  ivHp = MAX_IV;
  pokemonLevel = DEFAULT_POKEMON_LEVEL;
  objTypes?: string[];

  static create(value: IOptionOtherDPS) {
    const obj = new OptionOtherDPS();
    Object.assign(obj, value);
    return obj;
  }
}

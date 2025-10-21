import { ISelectMoveModel } from '../../components/Commons/Inputs/models/select-move.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { ColumnType } from '../../enums/type.enum';
import { BestOptionType, SortDirectionType } from '../../pages/Sheets/DpsTdo/enums/column-select-type.enum';
import { defaultPokemonDefObj, defaultPokemonLevel, maxIv } from '../../utils/helpers/options-context.helpers';

interface IOptionDPSSort {
  selectedColumn: number;
  sortDirection: SortDirectionType;
}

export class OptionDPSSort implements IOptionDPSSort {
  selectedColumn = ColumnType.Total;
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
  showSpecialMove: boolean;
  showShadow: boolean;
  showMega: boolean;
  showGMax: boolean;
  showPrimal: boolean;
  showLegendary: boolean;
  showMythic: boolean;
  showUltraBeast: boolean;
  enableShadow: boolean;
  enableSpecial: boolean;
  enableMega: boolean;
  enableGMax: boolean;
  enablePrimal: boolean;
  enableLegendary: boolean;
  enableMythic: boolean;
  enableUltraBeast: boolean;
  enableBest: boolean;
  enableDelay: boolean;
  releasedGO: boolean;
  bestOf: BestOptionType;
  ivAtk: number;
  ivDef: number;
  ivHp: number;
  pokemonLevel: number;
}

export class OptionFiltersDPS implements IOptionFiltersDPS {
  isMatch = false;
  showSpecialMove = true;
  showShadow = true;
  showMega = true;
  showGMax = true;
  showPrimal = true;
  showLegendary = true;
  showMythic = true;
  showUltraBeast = true;
  enableShadow = false;
  enableSpecial = false;
  enableMega = false;
  enableGMax = false;
  enablePrimal = false;
  enableLegendary = false;
  enableMythic = false;
  enableUltraBeast = false;
  enableBest = false;
  enableDelay = false;
  releasedGO = true;
  bestOf = BestOptionType.multiDpsTdo;
  ivAtk = maxIv();
  ivDef = maxIv();
  ivHp = maxIv();
  pokemonLevel = defaultPokemonLevel();
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

export interface Specific {
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
  pokemonDefObj = defaultPokemonDefObj();
  ivAtk = maxIv();
  ivDef = maxIv();
  ivHp = maxIv();
  pokemonLevel = defaultPokemonLevel();
  objTypes?: string[];

  static create(value: IOptionOtherDPS) {
    const obj = new OptionOtherDPS();
    Object.assign(obj, value);
    return obj;
  }
}

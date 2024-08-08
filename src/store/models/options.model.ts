import { ISelectMoveModel } from '../../components/Input/models/select-move.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { DEFAULT_POKEMON_DEF_OBJ, DEFAULT_POKEMON_LEVEL, MAX_IV } from '../../util/Constants';

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
  defaultSorted: {
    selectedColumn: number;
    sortDirection: string;
  };
}

interface IOptionFiltersDPS {
  match: boolean;
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
  IV_ATK: number;
  IV_DEF: number;
  IV_HP: number;
  POKEMON_LEVEL: number;
}

export class OptionFiltersDPS implements IOptionFiltersDPS {
  match: boolean;
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
  IV_ATK: number;
  IV_DEF: number;
  IV_HP: number;
  POKEMON_LEVEL: number;

  constructor() {
    this.match = false;
    this.showEliteMove = true;
    this.showShadow = true;
    this.showMega = true;
    this.showGmax = true;
    this.showPrimal = true;
    this.showLegendary = true;
    this.showMythic = true;
    this.showUltraBeast = true;
    this.enableShadow = false;
    this.enableElite = false;
    this.enableMega = false;
    this.enableGmax = false;
    this.enablePrimal = false;
    this.enableLegendary = false;
    this.enableMythic = false;
    this.enableUltraBeast = false;
    this.enableBest = false;
    this.enableDelay = false;
    this.releasedGO = true;
    this.bestOf = 3;
    this.IV_ATK = MAX_IV;
    this.IV_DEF = MAX_IV;
    this.IV_HP = MAX_IV;
    this.POKEMON_LEVEL = 40;
  }
}

export interface IOptionOtherDPS {
  delay?: { fTime: number; cTime: number };
  specific?: { FDmgEnemy: number; CDmgEnemy: number };
  WEATHER_BOOSTS?: string;
  TRAINER_FRIEND?: boolean;
  POKEMON_FRIEND_LEVEL?: number;
  POKEMON_DEF_OBJ: number;
  IV_ATK: number;
  IV_DEF: number;
  IV_HP: number;
  POKEMON_LEVEL: number;
  objTypes?: string[];
}

// tslint:disable-next-line:max-classes-per-file
export class OptionOtherDPS implements IOptionOtherDPS {
  delay?: { fTime: number; cTime: number };
  specific?: { FDmgEnemy: number; CDmgEnemy: number };
  WEATHER_BOOSTS?: string;
  TRAINER_FRIEND?: boolean;
  POKEMON_FRIEND_LEVEL?: number;
  POKEMON_DEF_OBJ: number = DEFAULT_POKEMON_DEF_OBJ;
  IV_ATK: number = MAX_IV;
  IV_DEF: number = MAX_IV;
  IV_HP: number = MAX_IV;
  POKEMON_LEVEL: number = DEFAULT_POKEMON_LEVEL;
  objTypes?: string[];

  // tslint:disable-next-line:no-empty
  constructor() {}

  static create(value: IOptionOtherDPS) {
    const obj = new OptionOtherDPS();
    Object.assign(obj, value);
    return obj;
  }
}

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
  ivAtk: number;
  ivDef: number;
  ivHp: number;
  pokemonLevel: number;
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
  ivAtk: number;
  ivDef: number;
  ivHp: number;
  pokemonLevel: number;

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
    this.ivAtk = MAX_IV;
    this.ivDef = MAX_IV;
    this.ivHp = MAX_IV;
    this.pokemonLevel = 40;
  }
}

export interface IOptionOtherDPS {
  delay?: { fTime: number; cTime: number };
  specific?: { FDmgEnemy: number; CDmgEnemy: number };
  weatherBoosts?: string;
  trainerFriend?: boolean;
  pokemonFriendLevel?: number;
  pokemonDefObj: number;
  ivAtk: number;
  ivDef: number;
  ivHp: number;
  pokemonLevel: number;
  objTypes?: string[];
}

// tslint:disable-next-line:max-classes-per-file
export class OptionOtherDPS implements IOptionOtherDPS {
  delay?: { fTime: number; cTime: number };
  specific?: { FDmgEnemy: number; CDmgEnemy: number };
  weatherBoosts?: string;
  trainerFriend?: boolean;
  pokemonFriendLevel?: number;
  pokemonDefObj: number = DEFAULT_POKEMON_DEF_OBJ;
  ivAtk: number = MAX_IV;
  ivDef: number = MAX_IV;
  ivHp: number = MAX_IV;
  pokemonLevel: number = DEFAULT_POKEMON_LEVEL;
  objTypes?: string[];

  // tslint:disable-next-line:no-empty
  constructor() {}

  static create(value: IOptionOtherDPS) {
    const obj = new OptionOtherDPS();
    Object.assign(obj, value);
    return obj;
  }
}

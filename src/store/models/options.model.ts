import { SelectMoveModel } from '../../components/Input/models/select-move.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { MAX_IV } from '../../util/Constants';

export interface OptionDPSModel {
  filters: OptionFiltersDPS;
  options: OptionOtherDPS;
  dataTargetPokemon?: IPokemonData;
  fmoveTargetPokemon?: SelectMoveModel;
  cmoveTargetPokemon?: SelectMoveModel;
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
  showUltrabeast: boolean;
  enableShadow: boolean;
  enableElite: boolean;
  enableMega: boolean;
  enableGmax: boolean;
  enablePrimal: boolean;
  enableLegendary: boolean;
  enableMythic: boolean;
  enableUltrabeast: boolean;
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
  showUltrabeast: boolean;
  enableShadow: boolean;
  enableElite: boolean;
  enableMega: boolean;
  enableGmax: boolean;
  enablePrimal: boolean;
  enableLegendary: boolean;
  enableMythic: boolean;
  enableUltrabeast: boolean;
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
    this.showUltrabeast = true;
    this.enableShadow = false;
    this.enableElite = false;
    this.enableMega = false;
    this.enableGmax = false;
    this.enablePrimal = false;
    this.enableLegendary = false;
    this.enableMythic = false;
    this.enableUltrabeast = false;
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

export interface OptionOtherDPS {
  delay?: { ftime: number; ctime: number };
  specific?: { FDmgenemy: number; CDmgenemy: number };
  WEATHER_BOOSTS?: string;
  TRAINER_FRIEND?: boolean;
  POKEMON_FRIEND_LEVEL?: number;
  POKEMON_DEF_OBJ: number;
  IV_ATK?: number;
  IV_DEF?: number;
  IV_HP?: number;
  POKEMON_LEVEL?: number;
  objTypes?: string[];
}

import { PokemonDataModel } from '../../core/models/pokemon.model';

export interface OptionDPSModel {
  filters: OptionFiltersDPS;
  options: OptionOtherDPS;
  dataTargetPokemon?: PokemonDataModel;
  fmoveTargetPokemon?: DPSPokemonMove;
  cmoveTargetPokemon?: DPSPokemonMove;
  selectTypes: string[];
  searchTerm: string;
  defaultPage: number;
  defaultRowPerPage: number;
  defaultSorted: {
    selectedColumn: number;
    sortDirection: string;
  };
}

interface OptionFiltersDPS {
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

interface OptionOtherDPS {
  delay: number | null;
  specific: number | null;
  WEATHER_BOOSTS: boolean;
  TRAINER_FRIEND: boolean;
  POKEMON_FRIEND_LEVEL: number;
  POKEMON_DEF_OBJ: number;
}

interface DPSPokemonMove {
  name: string;
  elite: boolean;
  shadow: boolean;
  purified: boolean;
}

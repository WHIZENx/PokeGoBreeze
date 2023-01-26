export interface OptionDPSModel {
  filters: OptionFiltersDPS;
  options: OptionOtherDPS;
  dataTargetPokemon?: any;
  fmoveTargetPokemon?: any;
  cmoveTargetPokemon?: any;
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
  enableShadow: boolean;
  enableElite: boolean;
  enableMega: boolean;
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

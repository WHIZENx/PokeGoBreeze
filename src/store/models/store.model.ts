export interface StoreModel {
  icon: string | null;
  data: DataModel | null;
  searching: any;
  timestamp: Date | null;
}

export interface DataModel {
  cpm?: any[];
  typeEff?: any[];
  weatherBoost?: any[];
  options?: any[];
  pokemonData?: any[];
  pokemon?: any[];
  pokemonName?: any[];
  candy?: any[];
  evolution?: any[];
  stickers?: any[];
  assets?: any[];
  combat?: any[];
  pokemonCombat?: any[];
  leagues?: any;
  details?: any[];
  pvp?: PVPDataModel;
  released?: any[];
}

export interface PVPDataModel {
  rankings: any[];
  trains: any[];
}

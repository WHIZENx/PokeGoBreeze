import { IAsset } from '../../core/models/asset.model';
import { ICombat } from '../../core/models/combat.model';
import { ICPM } from '../../core/models/cpm.model';
import { ILeagueData } from '../../core/models/league.model';
import { IOptions } from '../../core/models/options.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { PVPDataModel } from '../../core/models/pvp.model';
import { SearchingOptionsModel } from '../../core/models/searching.model';
import { ISticker } from '../../core/models/sticker.model';
import { ITypeEff } from '../../core/models/type-eff.model';
import { IWeatherBoost } from '../../core/models/weatherBoost.model';

export interface StoreModel {
  icon?: string;
  data?: DataModel;
  searching?: SearchingOptionsModel;
  timestamp?: number;
}

export class Store implements StoreModel {
  icon?: string;
  data?: DataModel;
  searching?: SearchingOptionsModel;
  timestamp?: number;
}

export interface DataModel {
  cpm: ICPM[];
  typeEff: ITypeEff;
  weatherBoost: IWeatherBoost;
  options: IOptions;
  pokemon: IPokemonData[];
  stickers: ISticker[];
  assets: IAsset[];
  combat: ICombat[];
  leagues: ILeagueData;
  pvp: PVPDataModel;
}

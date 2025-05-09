import { IAsset } from '../../core/models/asset.model';
import { ICombat } from '../../core/models/combat.model';
import { ICPM } from '../../core/models/cpm.model';
import { IEvolutionChain } from '../../core/models/evolution-chain.model';
import { IInformationData, InformationData } from '../../core/models/information';
import { ILeagueData, LeagueData } from '../../core/models/league.model';
import { IOptions, Options } from '../../core/models/options.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { IPVPDataModel, PVPDataModel } from '../../core/models/pvp.model';
import { SearchingOptionsModel } from '../../core/models/searching.model';
import { ISticker } from '../../core/models/sticker.model';
import { ITrainerLevelUp } from '../../core/models/trainer.model';
import { ITypeEff, TypeEff } from '../../core/models/type-eff.model';
import { IWeatherBoost, WeatherBoost } from '../../core/models/weatherBoost.model';

export interface StoreModel {
  icon?: string;
  data: IDataModel;
  searching?: SearchingOptionsModel;
}

export class Store implements StoreModel {
  icon?: string;
  data: IDataModel = new Data();
  searching?: SearchingOptionsModel;
}

export interface IDataModel {
  cpm: ICPM[];
  typeEff: ITypeEff;
  weatherBoost: IWeatherBoost;
  options: IOptions;
  pokemons: IPokemonData[];
  stickers: ISticker[];
  assets: IAsset[];
  combats: ICombat[];
  evolutionChains: IEvolutionChain[];
  information: IInformationData;
  trainers: ITrainerLevelUp[];
  leagues: ILeagueData;
  pvp: IPVPDataModel;
}

export class Data implements IDataModel {
  cpm: ICPM[] = [];
  typeEff = new TypeEff();
  weatherBoost = new WeatherBoost();
  options = new Options();
  pokemons: IPokemonData[] = [];
  stickers: ISticker[] = [];
  assets: IAsset[] = [];
  combats: ICombat[] = [];
  evolutionChains: IEvolutionChain[] = [];
  information = new InformationData();
  trainers: ITrainerLevelUp[] = [];
  leagues = new LeagueData();
  pvp = new PVPDataModel();

  static create(value: IDataModel | undefined) {
    const obj = new Data();
    if (value) {
      Object.assign(obj, value);
    }
    return obj;
  }
}

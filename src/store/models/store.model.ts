import { IAsset } from '../../core/models/asset.model';
import { ICombat } from '../../core/models/combat.model';
import { ICPM } from '../../core/models/cpm.model';
import { IEvolutionChain } from '../../core/models/evolution-chain.model';
import { IInformationData, InformationData } from '../../core/models/information';
import { ILeagueData, LeagueData } from '../../core/models/league.model';
import { IOptions, Options } from '../../core/models/options.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { IPVPDataModel, PVPDataModel } from '../../core/models/pvp.model';
import { ISticker } from '../../core/models/sticker.model';
import { ITrainerBattlePreset, ITrainerLevelUp } from '../../core/models/trainer.model';
import { ICandy } from '../../core/models/candy.model';

export interface StoreModel {
  icon?: string;
  data: IDataModel;
}

export class Store implements StoreModel {
  icon?: string;
  data: IDataModel = new Data();
}

export interface IDataModel {
  cpm: ICPM[];
  candy: ICandy[];
  options: IOptions;
  pokemons: IPokemonData[];
  stickers: ISticker[];
  assets: IAsset[];
  combats: ICombat[];
  evolutionChains: IEvolutionChain[];
  information: IInformationData;
  trainers: ITrainerLevelUp[];
  trainerBattlePresets: ITrainerBattlePreset[];
  leagues: ILeagueData;
  pvp: IPVPDataModel;
}

export class Data implements IDataModel {
  cpm: ICPM[] = [];
  candy: ICandy[] = [];
  options = new Options();
  pokemons: IPokemonData[] = [];
  stickers: ISticker[] = [];
  assets: IAsset[] = [];
  combats: ICombat[] = [];
  evolutionChains: IEvolutionChain[] = [];
  information = new InformationData();
  trainers: ITrainerLevelUp[] = [];
  trainerBattlePresets: ITrainerBattlePreset[] = [];
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

export interface Files {
  files: FileName[];
}

export interface FileName {
  filename: string;
}

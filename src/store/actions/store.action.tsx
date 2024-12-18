/* eslint-disable no-unused-vars */
import { Action } from 'redux';
import { ICPM } from '../../core/models/cpm.model';
import { IOptions } from '../../core/models/options.model';
import { ITypeSet } from '../../core/models/type.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { ISticker } from '../../core/models/sticker.model';
import { ICombat } from '../../core/models/combat.model';
import { IAsset } from '../../core/models/asset.model';
import { LeagueData } from '../../core/models/league.model';
import { PokemonPVPMove } from '../../core/models/pvp.model';
import { DynamicObj } from '../../util/extension';
import { IEvolutionChain } from '../../core/models/evolution-chain.model';
import { IInformation } from '../../core/models/information';

export enum StoreActionTypes {
  getStore = '[Store] GetStore',
  setTimestamp = '[Store] SetTimestamp',
  setOptions = '[Store] SetOptions',
  setTypeEff = '[Store] SetTypeEff',
  setWeatherBoost = '[Store] SetWeatherBoost',
  setPokemon = '[Store] SetPokemon',
  setSticker = '[Store] SetSticker',
  setCombat = '[Store] SetCombat',
  setAssets = '[Store] SetAssets',
  setEvolutionChain = '[Store] SetEvolutionChain',
  setInformation = '[Store] SetInformation',
  setLeagues = '[Store] SetLeagues',
  setLogoPokeGO = '[Store] SetLogoPokeGO',
  setCPM = '[Store] SetCPM',
  setPVP = '[Store] SetPVP',
  setPVPMoves = '[Store] SetPVPMoves',
  resetStore = '[Store] ResetStore',
}

export class LoadStore implements Action {
  readonly type = StoreActionTypes.getStore;

  static create() {
    const { type } = new LoadStore();
    return {
      type,
    };
  }
}

export class SetTimestamp implements Action {
  readonly type = StoreActionTypes.setTimestamp;

  constructor(public payload: number) {}

  static create(value: number) {
    const { type, payload } = new SetTimestamp(value);
    return {
      type,
      payload,
    };
  }
}

export class SetOptions implements Action {
  readonly type = StoreActionTypes.setOptions;

  constructor(public payload: IOptions) {}

  static create(value: IOptions) {
    const { type, payload } = new SetOptions(value);
    return {
      type,
      payload,
    };
  }
}

export class SetTypeEff implements Action {
  readonly type = StoreActionTypes.setTypeEff;

  constructor(public payload: ITypeSet) {}

  static create(value: ITypeSet) {
    const { type, payload } = new SetTypeEff(value);
    return {
      type,
      payload,
    };
  }
}

export class SetWeatherBoost implements Action {
  readonly type = StoreActionTypes.setWeatherBoost;

  constructor(public payload: DynamicObj<string[]>) {}

  static create(value: DynamicObj<string[]>) {
    const { type, payload } = new SetWeatherBoost(value);
    return {
      type,
      payload,
    };
  }
}

export class SetPokemon implements Action {
  readonly type = StoreActionTypes.setPokemon;

  constructor(public payload: IPokemonData[]) {}

  static create(value: IPokemonData[]) {
    const { type, payload } = new SetPokemon(value);
    return {
      type,
      payload,
    };
  }
}

export class SetSticker implements Action {
  readonly type = StoreActionTypes.setSticker;

  constructor(public payload: ISticker[]) {}

  static create(value: ISticker[]) {
    const { type, payload } = new SetSticker(value);
    return {
      type,
      payload,
    };
  }
}

export class SetCombat implements Action {
  readonly type = StoreActionTypes.setCombat;

  constructor(public payload: ICombat[]) {}

  static create(value: ICombat[]) {
    const { type, payload } = new SetCombat(value);
    return {
      type,
      payload,
    };
  }
}

export class SetEvolutionChain implements Action {
  readonly type = StoreActionTypes.setEvolutionChain;

  constructor(public payload: IEvolutionChain[]) {}

  static create(value: IEvolutionChain[]) {
    const { type, payload } = new SetEvolutionChain(value);
    return {
      type,
      payload,
    };
  }
}

export class SetInformation implements Action {
  readonly type = StoreActionTypes.setInformation;

  constructor(public payload: IInformation[]) {}

  static create(value: IInformation[]) {
    const { type, payload } = new SetInformation(value);
    return {
      type,
      payload,
    };
  }
}

export class SetAssets implements Action {
  readonly type = StoreActionTypes.setAssets;

  constructor(public payload: IAsset[]) {}

  static create(value: IAsset[]) {
    const { type, payload } = new SetAssets(value);
    return {
      type,
      payload,
    };
  }
}

export class SetLeagues implements Action {
  readonly type = StoreActionTypes.setLeagues;

  constructor(public payload: LeagueData) {}

  static create(value: LeagueData) {
    const { type, payload } = new SetLeagues(value);
    return {
      type,
      payload,
    };
  }
}

export class SetLogoPokeGO implements Action {
  readonly type = StoreActionTypes.setLogoPokeGO;

  constructor(public payload: string) {}

  static create(value = '') {
    const { type, payload } = new SetLogoPokeGO(value);
    return {
      type,
      payload,
    };
  }
}

export class SetCPM implements Action {
  readonly type = StoreActionTypes.setCPM;

  constructor(public payload: ICPM[]) {}

  static create(value: ICPM[]) {
    const { type, payload } = new SetCPM(value);
    return {
      type,
      payload,
    };
  }
}

export class SetPVP implements Action {
  readonly type = StoreActionTypes.setPVP;

  constructor(public payload: { rankings: string[]; trains: string[] }) {}

  static create(value: { rankings: string[]; trains: string[] }) {
    const { type, payload } = new SetPVP(value);
    return {
      type,
      payload,
    };
  }
}

export class SetPVPMoves implements Action {
  readonly type = StoreActionTypes.setPVPMoves;

  constructor(public payload: PokemonPVPMove[]) {}

  static create(value: PokemonPVPMove[]) {
    const { type, payload } = new SetPVPMoves(value);
    return {
      type,
      payload,
    };
  }
}

export class ResetStore implements Action {
  readonly type = StoreActionTypes.resetStore;

  static create() {
    const { type } = new ResetStore();
    return {
      type,
    };
  }
}

export type StoreActionsUnion =
  | LoadStore
  | SetTimestamp
  | SetOptions
  | SetTypeEff
  | SetWeatherBoost
  | SetPokemon
  | SetSticker
  | SetCombat
  | SetEvolutionChain
  | SetInformation
  | SetAssets
  | SetLeagues
  | SetLogoPokeGO
  | SetCPM
  | SetPVP
  | SetPVPMoves
  | ResetStore;

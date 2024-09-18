/* eslint-disable no-unused-vars */
import { ReduxRouterState } from '@lagunovsky/redux-react-router';
import { OptionsPokemon } from '../../core/models/pokemon.model';
import { ISearchingModel } from '../../store/models/searching.model';
import { IBattlePokemonData } from '../../core/models/pvp.model';
import { IPokemonBattle } from '../PVP/models/battle.model';
import { IPokemonDmgOption } from '../../core/models/damage.model';
import { ITypeEff } from '../../core/models/type-eff.model';
import { IWeatherBoost } from '../../core/models/weatherBoost.model';

export interface IMovePage {
  id?: number;
}

export interface IAlertReleasedComponent {
  released: boolean;
  formName: string | undefined;
  icon: string | undefined;
}

export interface ISearchBarComponent {
  data: OptionsPokemon | undefined;
  router: ReduxRouterState;
  onDecId?: () => void;
  onIncId?: () => void;
}

export interface ISearchBarMainComponent {
  data: OptionsPokemon | undefined;
}

export interface IPokemonPage {
  prevRouter?: ReduxRouterState;
  searching?: ISearchingModel | null;
  id?: string;
  onDecId?: () => void;
  onIncId?: () => void;
  isSearch?: boolean;
  setId?: (id: number) => void;
}

export interface ISelectPokeComponent {
  data: IBattlePokemonData[];
  league: number;
  pokemonBattle: IPokemonBattle;
  setPokemonBattle: React.Dispatch<React.SetStateAction<IPokemonBattle>>;
  clearData: (removeMove: boolean) => void;
}

export interface IDamageTableComponent {
  result: IPokemonDmgOption;
}

export interface IStatsTableComponent {
  setStatType?: React.Dispatch<React.SetStateAction<string>>;
  setStatLevel?: React.Dispatch<React.SetStateAction<number>>;
  statATK: number;
  statDEF: number;
  statSTA: number;
  setStatLvATK?: React.Dispatch<React.SetStateAction<number>>;
  setStatLvDEF?: React.Dispatch<React.SetStateAction<number>>;
  setStatLvSTA?: React.Dispatch<React.SetStateAction<number>>;
}

export interface ITypeEffComponent {
  types: ITypeEff | undefined;
}

export interface IWeatherAffComponent {
  weathers: IWeatherBoost | undefined;
}

export interface IWeatherEffComponent {
  weathers: IWeatherBoost | undefined;
  types: ITypeEff | undefined;
}

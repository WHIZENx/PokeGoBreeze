import { OptionsPokemon } from '../../core/models/pokemon.model';
import { ISearchingModel } from '../../store/models/searching.model';
import { IBattlePokemonData } from '../../core/models/pvp.model';
import { IPokemonBattle } from '../PVP/models/battle.model';
import { IPokemonDmgOption } from '../../core/models/damage.model';
import { ITypeEff } from '../../core/models/type-eff.model';
import { IWeatherBoost } from '../../core/models/weatherBoost.model';
import { PokemonType } from '../../enums/type.enum';
import { SearchOption } from '../Search/Pokemon/models/pokemon-search.model';

export interface IMovePage {
  id?: number;
}

export interface IAlertReleasedComponent {
  formName: string | undefined;
  pokemonType?: PokemonType;
  icon: string | undefined;
}

export interface ISearchBarComponent {
  data: OptionsPokemon | undefined;
  onDecId?: () => void;
  onIncId?: () => void;
}

export interface ISearchBarMainComponent {
  data: OptionsPokemon | undefined;
}

export interface IPokemonPage {
  searching?: ISearchingModel | null;
  searchOption?: SearchOption;
  onDecId?: () => void;
  onIncId?: () => void;
  isSearch?: boolean;
  setSearchOption?: (searchOption: SearchOption) => void;
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
  pokemonType?: PokemonType;
  setStatType?: React.Dispatch<React.SetStateAction<PokemonType>>;
  setStatLevel?: React.Dispatch<React.SetStateAction<number>>;
  statATK: number | undefined;
  statDEF: number | undefined;
  statSTA: number | undefined;
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

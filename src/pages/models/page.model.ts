import { OptionsPokemon } from '../../core/models/pokemon.model';
import { IBattlePokemonData } from '../../core/models/pvp.model';
import { IPokemonBattle } from '../PVP/models/battle.model';
import { IPokemonDmgOption } from '../../core/models/damage.model';
import { PokemonType } from '../../enums/type.enum';
import { SearchOption } from '../Search/Pokemon/models/pokemon-search.model';
import { IStyleData } from '../../utils/models/util.model';

export interface IStyleSheetData {
  styleSheet: IStyleData[];
}

export interface IErrorPage {
  isShowTitle?: boolean;
  isError?: boolean;
  children?: React.ReactNode;
}

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

export interface IStatsDamageTableComponent {
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

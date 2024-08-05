/* eslint-disable no-unused-vars */
import { ReduxRouterState } from '@lagunovsky/redux-react-router';
import { IForm, IFormSoundCry, IPokemonFormModify, PokemonDataForm } from '../../core/models/API/form.model';
import { IImage } from '../../core/models/asset.model';
import { ICombat } from '../../core/models/combat.model';
import { IPokemonData, IPokemonDataStats, IPokemonGenderRatio, PokemonRaidModel } from '../../core/models/pokemon.model';
import { ToolSearching } from '../../core/models/searching.model';
import {
  HexagonStats,
  IStatsPokemon,
  IStatsRank,
  IPokemonStatsRanking,
  IStatsAtk,
  IStatsDef,
  IStatsProd,
  IStatsSta,
} from '../../core/models/stats.model';
import { ITypeEffChart } from '../../core/models/type-eff.model';
import { ISelectMoveModel } from '../Input/models/select-move.model';
import { PokemonInfo } from '../../core/models/API/info.model';

export interface ICardMoveComponent {
  value: ISelectMoveModel | ICombat | undefined;
}

export interface ICardSmallComponent {
  value: ISelectMoveModel | ICombat | undefined;
  empty?: boolean;
  disable?: boolean;
  show?: boolean;
  select?: boolean;
  clearData?: () => void;
}

export interface ICardPokemonComponent {
  value: IPokemonData;
  score?: number;
  isShadow?: boolean;
}

export interface ICardPokemonInfoComponent {
  image: IImage;
  id: number;
  name: string;
  forme: string;
  defaultImg: boolean;
  types: string[];
  pokemonStat: IStatsPokemon;
  stats: IStatsRank | null;
  icon: string;
  releasedGO: boolean;
}

export interface ICardTypeComponent {
  value?: string;
  name?: string;
  elite?: boolean;
  shadow?: boolean;
  purified?: boolean;
  special?: boolean;
}

export interface ICardWeatherComponent {
  value: string;
}

export interface ITypeEffectiveComponent {
  typeEffective: ITypeEffChart | undefined;
}

export interface ITypeEffectiveSelectComponent {
  block?: boolean;
  effect: number;
  types: string[];
}

export interface IWeatherEffectiveComponent {
  weatherEffective: string[];
}

export interface IFindComponent {
  setId?: React.Dispatch<React.SetStateAction<number>>;
  setName?: React.Dispatch<React.SetStateAction<string>>;
  clearStats?: (reset?: boolean) => void;
  setStatATK?: React.Dispatch<React.SetStateAction<number>>;
  setStatDEF?: React.Dispatch<React.SetStateAction<number>>;
  setStatSTA?: React.Dispatch<React.SetStateAction<number>>;
  hide?: boolean;
  raid?: boolean;
  setRaid?: React.Dispatch<React.SetStateAction<boolean>>;
  tier?: number;
  setTier?: React.Dispatch<React.SetStateAction<number>>;
  setForm?: (form: IPokemonFormModify | undefined) => void;
  urlEvo?: { url: string | null };
  setUrlEvo?: React.Dispatch<
    React.SetStateAction<{
      url: string;
    }>
  >;
  title?: string;
  swap?: boolean;
  objective?: boolean;
}

export interface IFormSelectComponent {
  router: ReduxRouterState;
  searching: ToolSearching | null;
  raid?: boolean | undefined;
  tier?: number;
  id?: number;
  onClearStats?: ((reset?: boolean) => void) | undefined;
  setTier?: React.Dispatch<React.SetStateAction<number>>;
  onSetPrev?: () => void;
  onSetNext?: () => void;
  name: string;
  setName?: React.Dispatch<React.SetStateAction<string>>;
  hide?: boolean;
  setRaid?: React.Dispatch<React.SetStateAction<boolean>>;
  setForm?: (form: IPokemonFormModify | undefined) => void;
  stats: IStatsRank | null;
  onHandleSetStats?: (type: string, value: number) => void;
  data: IPokemonData[];
  setUrlEvo?: React.Dispatch<
    React.SetStateAction<{
      url: string;
    }>
  >;
  objective?: boolean;
  pokemonName: IPokemonData[];
}

export interface IToolsComponent {
  id: number | undefined;
  currForm: IPokemonFormModify | undefined;
  formList: IPokemonFormModify[][];
  dataPoke: PokemonInfo[];
  stats: IStatsRank | null;
  setForm: ((form: IPokemonFormModify | undefined) => void) | undefined;
  onSetStats: ((type: string, value: number) => void) | undefined;
  onClearStats: ((reset?: boolean) => void) | undefined;
  isRaid: boolean;
  tier: number;
  setTier: (tier: number) => void;
  hide: boolean | undefined;
}

export interface IAssetPokemonModelComponent {
  id: number;
  name: string;
  originSoundCry: IFormSoundCry[];
  isLoadedForms: boolean;
}

export interface IEvolutionComponent {
  forme: IForm | undefined;
  region: string;
  formDefault: boolean;
  id: number | undefined;
  setId?: (id: number) => void;
  pokemonRouter: ReduxRouterState;
  purified: boolean | undefined;
  shadow: boolean | undefined;
  setProgress: React.Dispatch<
    React.SetStateAction<{
      isLoadedForms: boolean;
    }>
  >;
  isLoadedForms: boolean;
}

export interface IFormInfoComponent {
  pokemonRouter: ReduxRouterState;
  form: IPokemonFormModify | undefined;
  setForm: React.Dispatch<React.SetStateAction<IPokemonFormModify | undefined>>;
  setOriginForm: React.Dispatch<React.SetStateAction<string | undefined>>;
  data: PokemonInfo | undefined;
  setData: React.Dispatch<React.SetStateAction<PokemonInfo | undefined>>;
  setWH: React.Dispatch<
    React.SetStateAction<{
      weight: number;
      height: number;
    }>
  >;
  pokeData: PokemonInfo[];
  formList: IPokemonFormModify[][] | undefined;
  ratio: IPokemonGenderRatio | undefined;
  setId?: (id: number) => void;
  pokemonDetail: IPokemonData | undefined;
  defaultId: number;
  region: string;
  setProgress: React.Dispatch<
    React.SetStateAction<{
      isLoadedForms: boolean;
    }>
  >;
  isLoadedForms: boolean;
}

export interface IFromChangeComponent {
  details: IPokemonData | undefined;
  defaultName: string | undefined;
}

export interface IFormSpecialComponent {
  formList: IPokemonFormModify[][];
  id: number;
}

export interface IStatsComponent {
  isShadow?: boolean;
  pokemonStats: IStatsRank | null;
  stats?: IStatsPokemon | null;
  statATK?: IStatsAtk;
  statDEF?: IStatsDef;
  statSTA?: IStatsSta;
  statProd?: IStatsProd;
  id?: number;
  form?: string;
}

export interface IGenderComponent {
  sex: string;
  ratio?: IPokemonGenderRatio | undefined;
  default_m?: string;
  default_f?: string;
  shiny_m?: string;
  shiny_f?: string;
}

export interface IInfoComponent {
  currForm: IPokemonFormModify | undefined;
}

export interface IDynamicInputCPComponent {
  statATK: number;
  statDEF: number;
  statSTA: number;
  IV_ATK: number;
  IV_DEF: number;
  IV_STA: number;
  searchCP: string;
  setSearchCP: React.Dispatch<React.SetStateAction<string>>;
  label?: string;
  width?: number | string;
  minWidth?: number | string;
}

export interface ISelectBadgeComponent {
  type: string;
  priority: number;
  setPriority: (priority: number) => void;
}

export interface ISelectMoveComponent {
  move: ISelectMoveModel | ICombat | undefined;
  setMovePokemon: React.Dispatch<React.SetStateAction<ISelectMoveModel | undefined>>;
  clearData?: () => void;
  pokemon: IPokemonData | undefined;
  moveType: string;
  inputType?: string;
  selected?: boolean;
  disable?: boolean;
}

export interface ISelectPokemonComponent {
  pokemon?: IPokemonData;
  setCurrentPokemon: React.Dispatch<React.SetStateAction<IPokemonData | undefined>>;
  selected: boolean;
  setFMovePokemon: React.Dispatch<React.SetStateAction<ISelectMoveModel | undefined>>;
  setCMovePokemon: React.Dispatch<React.SetStateAction<ISelectMoveModel | undefined>>;
  clearData?: () => void;
  disable?: boolean;
  defaultSetting?: IPokemonDataStats;
  maxHeight?: number;
}

export interface IPokemonRaidComponent {
  id: number;
  pokemon: PokemonRaidModel;
  data: PokemonRaidModel[];
  setData: React.Dispatch<React.SetStateAction<PokemonRaidModel[]>>;
  defaultSetting: IPokemonDataStats;
  controls: boolean;
  onCopyPokemon: (index: number) => void;
  onRemovePokemon: (index: number) => void;
  onOptionsPokemon: (index: number, pokemon: IPokemonData) => void;
  clearData?: () => void;
}

export interface IRaidComponent {
  clearData?: () => void;
  setTierBoss?: React.Dispatch<React.SetStateAction<number>>;
  currForm: IPokemonFormModify | undefined;
  id: number | undefined;
  statATK: number;
  statDEF: number;
  setStatBossATK?: React.Dispatch<React.SetStateAction<number>>;
  setStatBossDEF?: React.Dispatch<React.SetStateAction<number>>;
  setStatBossHP?: React.Dispatch<React.SetStateAction<number>>;
  setTimeAllow?: React.Dispatch<React.SetStateAction<number>>;
  isLoadedForms?: boolean;
}

export interface ICandyComponent {
  id: number | undefined;
  style?: React.CSSProperties;
  size?: number;
}

export interface IChargedBarComponent {
  barCount: number;
  color: string | undefined;
  width?: number;
  gap?: number;
}

export interface ICircleComponent {
  line: number;
  size: number;
  color: string;
}

export interface IHexagonComponent {
  defaultStats?: HexagonStats;
  stats: HexagonStats;
  size: number;
  animation: number;
  borderSize: number;
}

export interface IIVBarComponent {
  iv: number;
  style: React.CSSProperties;
  title: string;
}

export interface ICircleBarComponent {
  text: string;
  type: string | null | undefined;
  size: number;
  moveEnergy: number;
  energy: number;
  maxEnergy: number;
  disable: boolean | undefined;
}

export interface IHpBarComponent {
  text: string;
  height: number;
  hp: number;
  maxHp: number;
  dmg?: number;
}

export interface IProgressBarComponent {
  height: number;
  value: number | undefined;
  maxValue: number;
  bgColor: string;
  color: string;
  style?: React.CSSProperties;
}

export interface IStatsBarComponent {
  tag: string;
  class: string;
  statsPercent: number;
  rank: number | string;
  pokemonStats: IStatsRank | null;
  currentStats: number;
  optionalStats?: string;
  id?: number;
  form?: string;
  statType?: string;
}

export interface ITypeComponent {
  arr: string[] | undefined;
  block?: boolean;
  shadow?: boolean;
  style?: React.CSSProperties | undefined;
  text?: string;
  hideText?: boolean;
  height?: string | number | undefined;
  color?: string;
  isShow?: boolean;
}

export interface ITypeBadgeComponent {
  move: ISelectMoveModel | ICombat | null | undefined;
  find?: boolean;
  grow?: boolean;
  style?: React.CSSProperties | undefined;
  color?: string;
  title?: string;
  elite?: boolean;
  shadow?: boolean;
  purified?: boolean;
  special?: boolean;
}

export interface ITypeBarComponent {
  type: string | null;
}

export interface IWeatherComponent {
  arr: string[];
  style: React.CSSProperties | undefined;
  text?: string;
}

export interface ICounterComponent {
  def: number;
  types: string[] | undefined;
  isShadow: boolean | undefined;
}

export interface ITableMoveComponent {
  data: PokemonDataForm | IPokemonStatsRanking | undefined;
  statATK: number;
  statDEF: number;
  statSTA: number;
  form: IForm | undefined;
  id?: number;
  maxHeight?: number | string;
}

export interface IPokemonTableComponent {
  id: number | undefined;
  formName: string | undefined;
  gen: number | undefined;
  region: string | undefined;
  version: string | undefined;
  weight: number;
  height: number;
  className?: string;
  isLoadedForms?: boolean;
}

export interface IMoveComponent {
  type?: string;
  id: number;
  form: string;
  move: ICombat | undefined;
  setMove: (move: ICombat | undefined) => void | React.Dispatch<React.SetStateAction<ICombat | undefined>>;
  text: string;
  selectDefault: boolean;
  clearData?: (option?: boolean) => void;
}

import { IFormSoundCry, IPokemonFormModify, IPokemonSprit } from '../../core/models/API/form.model';
import { IImage } from '../../core/models/asset.model';
import { ICombat } from '../../core/models/combat.model';
import {
  IPokemonData,
  IPokemonDataStats,
  IPokemonGenderRatio,
  PokemonRaidModel,
} from '../../core/models/pokemon.model';
import {
  IStatsPokemon,
  IStatsAtk,
  IStatsDef,
  IStatsProd,
  IStatsSta,
  IStatsPokemonGO,
  IHexagonStats,
  IStatsRankAtk,
  IStatsRankDef,
  IStatsRankSta,
  IStatsRankProd,
} from '../../core/models/stats.model';
import { ITypeEffectiveChart } from '../../core/models/type-effective.model';
import { ISelectMoveModel, ISelectMovePokemonModel } from '../Input/models/select-move.model';
import { IPokemonDetail, IPokemonDetailInfo } from '../../core/models/API/info.model';
import { InputType } from '../Input/enums/input-type.enum';
import { CardType, MoveType, PokemonClass, PokemonType, TypeAction, TypeMove, TypeSex } from '../../enums/type.enum';
import { BadgeType } from '../enums/badge-type.enum';
import { AnimationType } from '../Sprites/Hexagon/enums/hexagon.enum';
import { EffectiveType } from '../Effective/enums/type-effective.enum';
import { SearchOption } from '../../pages/Search/Pokemon/models/pokemon-search.model';
import { IStyleData } from '../../utils/models/util.model';
import { PaletteMode } from '@mui/material';
import { TableProps, TableStyles } from 'react-data-table-component';
import { TableColumnModify } from '../../utils/models/overrides/data-table.model';
import { SelectPosition } from '../Select/enums/select-type.enum';
import React from 'react';

export interface INavbarComponent {
  mode: PaletteMode;
  version?: string;
  toggleColorMode: () => void;
}

export interface ICardMoveComponent {
  value: ISelectMoveModel | ICombat | undefined;
}

export interface ICardSmallComponent {
  value: ISelectMoveModel | ICombat | undefined;
  isEmpty?: boolean;
  isDisable?: boolean;
  isShow?: boolean;
  isSelect?: boolean;
  clearData?: () => void;
}

export interface ICardPokemonComponent {
  value: IPokemonData;
  score?: number;
  pokemonType?: PokemonType;
}

export interface ICardPokemonInfoComponent {
  image: IImage;
  id: number;
  name: string;
  form: string | undefined;
  isDefaultImg: boolean;
  types: string[];
  pokemonStat: IStatsPokemonGO;
  icon: string | undefined;
  releasedGO: boolean;
  styleList: IStyleData[];
}

export interface ICardTypeComponent {
  isHideDefaultTitle?: boolean;
  value?: string;
  name?: string;
  moveType?: MoveType;
  cardType?: CardType;
}

export interface IEffectiveComponent {
  title: string;
  children: React.ReactNode;
}

export interface ITypeEffectiveComponent {
  typeEffective: ITypeEffectiveChart | undefined;
}

export interface ITypeEffectiveSelectComponent {
  isBlock?: boolean;
  effect: EffectiveType;
  types: string[] | undefined;
}

export interface IWeatherEffectiveComponent {
  weatherEffective: string[] | undefined;
}

export interface IFindComponent {
  setId?: React.Dispatch<React.SetStateAction<number>>;
  setName?: React.Dispatch<React.SetStateAction<string>>;
  clearStats?: (reset?: boolean) => void;
  setStatATK?: React.Dispatch<React.SetStateAction<number>>;
  setStatDEF?: React.Dispatch<React.SetStateAction<number>>;
  setStatSTA?: React.Dispatch<React.SetStateAction<number>>;
  isHide?: boolean;
  isRaid?: boolean;
  setRaid?: React.Dispatch<React.SetStateAction<boolean>>;
  tier?: number;
  setTier?: React.Dispatch<React.SetStateAction<number>>;
  setForm?: (form: IPokemonFormModify | undefined) => void;
  title?: string;
  isSwap?: boolean;
  isObjective?: boolean;
}

export interface IFormSelectComponent {
  isRaid?: boolean;
  tier?: number;
  id?: number;
  onClearStats?: (reset?: boolean) => void;
  setTier?: React.Dispatch<React.SetStateAction<number>>;
  onSetPrev?: () => void;
  onSetNext?: () => void;
  name: string | undefined;
  setName?: React.Dispatch<React.SetStateAction<string>>;
  isHide?: boolean;
  setRaid?: React.Dispatch<React.SetStateAction<boolean>>;
  setForm?: (form: IPokemonFormModify | undefined) => void;
  onHandleSetStats?: (type: TypeAction, value: number) => void;
  isObjective?: boolean;
}

export interface IToolsComponent {
  id: number | undefined;
  dataPoke: IPokemonDetailInfo[];
  onSetStats: ((type: TypeAction, value: number) => void) | undefined;
  onClearStats: ((reset?: boolean) => void) | undefined;
  isRaid: boolean | undefined;
  tier: number;
  setTier: (tier: number) => void;
  isHide?: boolean;
}

export interface IAssetPokemonModelComponent {
  originSoundCry: IFormSoundCry[];
  isLoadedForms: boolean;
}

export interface IEvolutionComponent {
  pokemonData: Partial<IPokemonDetail> | undefined;
  id: number | undefined;
  setSearchOption?: (searchOption: SearchOption) => void;
  isLoadedForms: boolean;
  urlEvolutionChain?: string;
}

export interface IFormInfoComponent {
  pokeData: IPokemonDetailInfo[];
  formList: IPokemonFormModify[][];
  setSearchOption?: (searchOption: SearchOption) => void;
  defaultId: number | undefined;
  urlEvolutionChain?: string;
  isLoadedForms: boolean;
}

export interface IFromChangeComponent {
  pokemonData: Partial<IPokemonDetail> | undefined;
  currentId: number | undefined;
}

export interface IFormSpecialComponent {
  formList: IPokemonFormModify[][];
  id: number | undefined;
  className?: string;
  style?: React.CSSProperties;
}

export interface IStatsComponent {
  pokemonType?: PokemonType;
  stats?: IStatsPokemon;
  statATK?: IStatsAtk;
  statDEF?: IStatsDef;
  statSTA?: IStatsSta;
  statProd?: IStatsProd;
  id?: number;
  form?: string;
  isDisabled?: boolean;
}

export interface IGenderComponent {
  sex: TypeSex;
  ratio?: IPokemonGenderRatio;
  sprit?: IPokemonSprit;
}

export interface IMenuItem {
  label: string | React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isClose?: boolean;
}

export interface ICustomInputComponent {
  isAutoSearch?: boolean;
  setSearchData?: () => void;
  optionsIcon?: React.ReactNode;
  inputPlaceholder?: string;
  defaultValue?: string;
  setSearchTerm?: (searchTerm: string) => void;
  onOptionsClick?: React.MouseEventHandler<HTMLButtonElement>;
  menuItems?: IMenuItem[];
}

export interface IDynamicInputCPComponent {
  statATK: number | undefined;
  statDEF: number | undefined;
  statSTA: number | undefined;
  ivAtk: number;
  ivDef: number;
  ivSta: number;
  searchCP: string;
  setSearchCP: React.Dispatch<React.SetStateAction<string>>;
  label?: string;
  width?: number | string;
  minWidth?: number | string;
}

export interface ISelectTierComponent {
  pokemonType: PokemonType | undefined;
  pokemonClass?: PokemonClass;
  tier: number;
  className?: string;
  setCurrTier?: (tier: number) => void;
  setTier?: (tier: number) => void;
  clearData?: () => void;
}

export interface ISelectTypeComponent<T> {
  title: string;
  data: T;
  currentType: string;
  setCurrentType: React.Dispatch<React.SetStateAction<string>>;
  filterType?: string[];
  isShowRemove?: boolean;
  cardType?: CardType;
}

export interface ISelectMoveComponent {
  move: ISelectMoveModel | ICombat | undefined;
  setMovePokemon: React.Dispatch<React.SetStateAction<ISelectMoveModel | undefined>>;
  clearData?: () => void;
  pokemon: ISelectMovePokemonModel;
  moveType: TypeMove;
  inputType?: InputType;
  isSelected?: boolean;
  isDisable?: boolean;
  maxHeight?: number;
  position?: SelectPosition;
}

export interface ISelectPokemonComponent {
  pokemon?: IPokemonData;
  setCurrentPokemon: React.Dispatch<React.SetStateAction<IPokemonData | undefined>>;
  isSelected: boolean;
  setFMovePokemon: React.Dispatch<React.SetStateAction<ISelectMoveModel | undefined>>;
  setCMovePokemon: React.Dispatch<React.SetStateAction<ISelectMoveModel | undefined>>;
  clearData?: () => void;
  isDisable?: boolean;
  defaultSetting?: IPokemonDataStats;
  maxHeight?: number;
  position?: SelectPosition;
}

export interface ISelectBadgeComponent {
  type: string;
  priority: BadgeType;
  setPriority: (priority: BadgeType) => void;
}

export interface IPokemonRaidComponent {
  id: number;
  pokemon: PokemonRaidModel;
  data: PokemonRaidModel[];
  setData: React.Dispatch<React.SetStateAction<PokemonRaidModel[]>>;
  defaultSetting: IPokemonDataStats;
  isControls: boolean;
  onCopyPokemon: (index: number) => void;
  onRemovePokemon: (index: number) => void;
  onOptionsPokemon: (index: number, pokemon: IPokemonData) => void;
  clearData?: (isForceClear?: boolean) => void;
}

export interface IRaidComponent {
  clearData?: (isForceClear?: boolean) => void;
  setTierBoss?: React.Dispatch<React.SetStateAction<number>>;
  pokemonType: PokemonType | undefined;
  id: number | undefined;
  statATK: number | undefined;
  statDEF: number | undefined;
  setStatBossATK?: React.Dispatch<React.SetStateAction<number>>;
  setStatBossDEF?: React.Dispatch<React.SetStateAction<number>>;
  setStatBossHP?: React.Dispatch<React.SetStateAction<number>>;
  setTimeAllow?: React.Dispatch<React.SetStateAction<number>>;
  isLoadedForms?: boolean;
}

export interface ICandyComponent {
  id: number | undefined;
  className?: string;
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
  name?: string;
  defaultStats?: IHexagonStats;
  stats: IHexagonStats | undefined;
  size: number;
  animation: AnimationType;
  borderSize: number;
}

export interface IIconTypeComponent {
  type: string | undefined;
  className?: string;
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
  alt?: string;
  title?: string;
  isBorder?: boolean;
}

export interface IIVBarComponent {
  iv: number;
  style: React.CSSProperties;
  title: string;
}

export interface ICircleBarComponent {
  text: string;
  type: string | undefined;
  size: number;
  moveEnergy: number;
  energy: number;
  maxEnergy: number;
  isDisable?: boolean;
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
  maxValue: number | undefined;
  bgColor: string;
  color: string;
  style?: React.CSSProperties;
}

export interface IStatsBarComponent {
  tag: string;
  class: string;
  statsPercent: number;
  rank: number | string | undefined;
  pokemonStatsRank: IStatsRankAtk | IStatsRankDef | IStatsRankSta | IStatsRankProd | undefined;
  currentStats: number;
  optionalStats?: string;
  id?: number;
  form?: string;
  statType: TypeAction;
  isDisabled?: boolean;
  pokemonType?: PokemonType;
}

export interface ITypeComponent {
  arr: string[] | undefined;
  isBlock?: boolean;
  isShowShadow?: boolean;
  className?: string;
  style?: React.CSSProperties;
  text?: string;
  isHideText?: boolean;
  height?: string | number;
  color?: string;
  isShow?: boolean;
}

export interface ITypeBadgeComponent {
  move: ISelectMoveModel | ICombat | undefined;
  isFind?: boolean;
  isGrow?: boolean;
  style?: React.CSSProperties;
  color?: string;
  title?: string;
  moveType: MoveType;
}

export interface ITypeBarComponent {
  type: string | undefined;
}

export interface ILoadingComponent {
  isShow: boolean;
  size?: number;
  fontSize?: number;
  opacity?: number;
  bgColor?: string;
  isVertical?: boolean;
}

export interface ILoadGroupComponent {
  className?: string;
  isShow: boolean;
  size?: number;
  opacity?: number;
  bgColor?: string;
  isVertical?: boolean;
  isHideAttr?: boolean;
}

export interface IPokemonIconTypeComponent {
  pokemonType?: PokemonType;
  size: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export interface IWeatherComponent {
  arr: string[] | undefined;
  className?: string;
  style?: React.CSSProperties;
  text?: string;
}

export interface ICounterComponent {
  pokemonData: Partial<IPokemonDetail> | undefined;
}

export interface ICustomDataTableProps<T> extends Partial<TableProps<T>> {
  isAutoSearch?: boolean;
  menuItems?: IMenuItem[];
  customColumns?: TableColumnModify<T>[];
  customDataStyles?: TableStyles;
  isShowSearch?: boolean;
  customStyles?: TableStyles;
  inputPlaceholder?: string;
  searchFunction?: (item: T, searchTerm: string) => boolean;
  debounceTime?: number;
  isShowModalOptions?: boolean;
  titleModalOptions?: string;
  customOptionsModal?: () => React.ReactNode;
  isXFixed?: boolean;
}

export interface ITableMoveComponent {
  pokemonData: Partial<IPokemonDetail> | undefined;
  maxHeight?: number | string;
}

export interface IPokemonTableComponent {
  id: number | undefined;
  formName: string | undefined;
  gen: number | string | undefined;
  region: string | undefined;
  version: string | undefined;
  weight: number | undefined;
  height: number | undefined;
  className?: string;
  isLoadedForms?: boolean;
}

export interface ISelectCustomMoveComponent {
  type?: TypeMove;
  id: number | undefined;
  form: string | undefined;
  move: ICombat | undefined;
  setMove: (move: ICombat | undefined) => void | React.Dispatch<React.SetStateAction<ICombat | undefined>>;
  text: string;
  isSelectDefault: boolean;
  clearData?: (option?: boolean) => void;
  isHighlight?: boolean;
  pokemonType?: PokemonType;
}

export interface IStatsTableComponent {
  isLoadedForms?: boolean;
  isShowHp?: boolean;
  tier: number;
  pokemonType: PokemonType | undefined;
  statATK: number | undefined;
  statDEF: number | undefined;
  statSTA?: number;
}

interface IRowOption {
  value: string | number | React.ReactNode;
  className?: string;
  colSpan?: number;
  isSubTitle?: boolean;
}

export interface IRow {
  subRows?: IRowOption[];
  align?: string;
  className?: string;
}

export interface IColGroup {
  className?: string;
  cols?: ICol[];
}

export interface ICol {
  className?: string;
}

export interface ITableComponent {
  isTableInfo?: boolean;
  tableClass?: string;
  rows: IRow[];
  headerRows?: IRow[];
  colGroups?: IColGroup[];
}

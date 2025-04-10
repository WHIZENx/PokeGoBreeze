/* eslint-disable no-unused-vars */
import { IFormSoundCry, IPokemonFormModify, IPokemonSprit } from '../../core/models/API/form.model';
import { IImage } from '../../core/models/asset.model';
import { ICombat } from '../../core/models/combat.model';
import { IPokemonData, IPokemonDataStats, IPokemonGenderRatio, PokemonRaidModel } from '../../core/models/pokemon.model';
import { IToolSearching } from '../../core/models/searching.model';
import {
  IStatsPokemon,
  IStatsRank,
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
import { ITypeEffChart } from '../../core/models/type-eff.model';
import { ISelectMoveModel, ISelectMovePokemonModel } from '../Input/models/select-move.model';
import { IPokemonDetail } from '../../core/models/API/info.model';
import { InputType, SelectPosition } from '../Input/enums/input-type.enum';
import { MoveType, PokemonType, TypeAction, TypeMove, TypeSex } from '../../enums/type.enum';
import { BadgeType } from '../Input/enums/badge-type.enum';
import { AnimationType } from '../Sprites/Hexagon/enums/hexagon.enum';
import { EffectiveType } from '../Effective/enums/type-effective.enum';
import { SearchOption } from '../../pages/Search/Pokemon/models/pokemon-search.model';

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
  forme: string | undefined;
  isDefaultImg: boolean;
  types: string[];
  pokemonStat: IStatsPokemonGO;
  atkMaxStats: number | undefined;
  defMaxStats: number | undefined;
  staMaxStats: number | undefined;
  icon: string | undefined;
  releasedGO: boolean;
}

export interface ICardTypeComponent {
  value?: string;
  name?: string;
  moveType?: MoveType;
}

export interface ICardWeatherComponent {
  value: string;
}

export interface ITypeEffectiveComponent {
  typeEffective: ITypeEffChart | undefined;
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
  searching: IToolSearching | null;
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
  stats: IStatsRank | null;
  onHandleSetStats?: (type: TypeAction, value: number) => void;
  pokemonData: IPokemonData[];
  isObjective?: boolean;
}

export interface IToolsComponent {
  id: number | undefined;
  dataPoke: IPokemonDetail[];
  stats: IStatsRank | null;
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
  pokemonData: IPokemonData | undefined | null;
  id: number | undefined;
  setSearchOption?: (searchOption: SearchOption) => void;
  isLoadedForms: boolean;
  urlEvolutionChain?: string;
}

export interface IFormInfoComponent {
  pokeData: IPokemonDetail[];
  formList: IPokemonFormModify[][] | undefined;
  setSearchOption?: (searchOption: SearchOption) => void;
  defaultId: number | undefined;
  urlEvolutionChain?: string;
  isLoadedForms: boolean;
}

export interface IFromChangeComponent {
  pokemonData: IPokemonData | undefined | null;
  currentId: number | undefined;
}

export interface IFormSpecialComponent {
  formList: IPokemonFormModify[][] | undefined;
  id: number | undefined;
  className?: string;
  style?: React.CSSProperties;
}

export interface IStatsComponent {
  pokemonType?: PokemonType;
  pokemonStats: IStatsRank | null;
  stats?: IStatsPokemon;
  statATK?: IStatsAtk;
  statDEF?: IStatsDef;
  statSTA?: IStatsSta;
  statProd?: IStatsProd;
  id?: number;
  form?: string | null;
  isDisabled?: boolean;
}

export interface IGenderComponent {
  sex: TypeSex;
  ratio?: IPokemonGenderRatio;
  sprit?: IPokemonSprit;
}

export interface IDynamicInputCPComponent {
  statATK: number;
  statDEF: number;
  statSTA: number;
  ivAtk: number;
  ivDef: number;
  ivSta: number;
  searchCP: string;
  setSearchCP: React.Dispatch<React.SetStateAction<string>>;
  label?: string;
  width?: number | string;
  minWidth?: number | string;
}

export interface ISelectBadgeComponent {
  type: string;
  priority: BadgeType;
  setPriority: (priority: BadgeType) => void;
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
  name?: string;
  defaultStats?: IHexagonStats;
  stats: IHexagonStats;
  size: number;
  animation: AnimationType;
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
  rank: number | string;
  pokemonStatsRank: IStatsRankAtk | IStatsRankDef | IStatsRankSta | IStatsRankProd | undefined;
  currentStats: number;
  optionalStats?: string;
  id?: number;
  form?: string | null;
  statType: TypeAction;
  isDisabled?: boolean;
  pokemonType?: PokemonType;
}

export interface ITypeComponent {
  arr: string[] | undefined;
  isBlock?: boolean;
  isShowShadow?: boolean;
  style?: React.CSSProperties;
  text?: string;
  isHideText?: boolean;
  height?: string | number;
  color?: string;
  isShow?: boolean;
}

export interface ITypeBadgeComponent {
  move: ISelectMoveModel | ICombat | null | undefined;
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
  fontSize?: number;
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
}

export interface IWeatherComponent {
  arr: string[] | undefined;
  style?: React.CSSProperties;
  text?: string;
}

export interface ICounterComponent {
  pokemonData: IPokemonData | undefined | null;
}

export interface ITableMoveComponent {
  pokemonData: IPokemonData | undefined | null;
  maxHeight?: number | string;
}

export interface IPokemonTableComponent {
  id: number | undefined;
  formName: string | undefined;
  gen: number | string | undefined;
  region: string | null | undefined;
  version: string | null | undefined;
  weight: number | undefined;
  height: number | undefined;
  className?: string;
  isLoadedForms?: boolean;
}

export interface IMoveComponent {
  type?: TypeMove;
  id: number;
  form: string;
  move: ICombat | undefined;
  setMove: (move: ICombat | undefined) => void | React.Dispatch<React.SetStateAction<ICombat | undefined>>;
  text: string;
  isSelectDefault: boolean;
  clearData?: (option?: boolean) => void;
  isHighlight?: boolean;
  pokemonType?: PokemonType;
}

import {
  BaseSelectProps,
  BaseTextFieldProps,
  ButtonProps,
  FormControlLabelProps,
  PaletteMode,
  SxProps,
  Theme,
  ToggleButtonGroupProps,
  ToggleButtonProps,
} from '@mui/material';
import { ICombat } from '../../../core/models/combat.model';
import { IPokemonData, IPokemonDataStats } from '../../../core/models/pokemon.model';
import { LabelType, PokemonType, PokemonClass, CardType, TypeMove } from '../../../enums/type.enum';
import { BadgeType } from '../../enums/badge-type.enum';
import { InputSearchType, InputType } from '../Inputs/enums/input-type.enum';
import { ISelectMoveModel, ISelectMovePokemonModel } from '../Inputs/models/select-move.model';
import { SelectPosition } from '../Selects/enums/select-type.enum';
import { IPokemonDetail } from '../../../core/models/API/info.model';
import { TableProps, TableStyles } from 'react-data-table-component';
import { TableColumnModify } from '../../../utils/models/overrides/data-table.model';
import { IPokemonFormModify } from '../../../core/models/API/form.model';
import { BattleLeagueCPType } from '../../../utils/enums/compute.enum';
import { PVPInfo } from '../../../core/models/pvp.model';
import React from 'react';
import { IAppMenuItem, IMenuItem } from './menu.model';

export interface IResponsiveAppBarComponent {
  mode: PaletteMode;
  version?: string;
  toggleColorMode: () => void;
}

export interface IDrawerSideBarComponent {
  currentPage?: string;
  setCurrentPage?: React.Dispatch<React.SetStateAction<string | undefined>>;
  currentPageSub?: string;
  setCurrentPageSub?: React.Dispatch<React.SetStateAction<string | undefined>>;
  open: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  footer?: React.ReactNode;
}

export interface ICollapseComponent<T> {
  page: IAppMenuItem<T>;
  onClick?: (page: IAppMenuItem<T>) => void;
  onHeaderClick?: () => void;
  component?: 'div' | 'ul';
  listSx?: SxProps<Theme>;
  subheader?: React.ReactNode;
  isSelect?: (value: IAppMenuItem<T>) => boolean;
}

export interface SwitchReleasedComponent {
  releasedGO: boolean;
  setReleaseGO: (releasedGO: boolean) => void;
  isDisabled?: boolean;
  isAvailable?: boolean;
  isBlock?: boolean;
  label?: string | React.ReactNode;
  width?: number | string;
  inputMode?: 'switch' | 'checkbox';
}

export interface ICustomInputComponent<T> {
  isAutoSearch?: boolean;
  setSearchData?: () => void;
  optionsIcon?: React.ReactNode;
  inputPlaceholder?: string;
  defaultValue?: string;
  setSearchTerm?: (searchTerm: string) => void;
  onOptionsClick?: React.MouseEventHandler<HTMLButtonElement>;
  menuItems?: IMenuItem<T>[];
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

interface IFormControlProps {
  isTextarea?: boolean;
}

interface ILabelControl {
  value?: React.ReactNode;
  type?: LabelType;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: string;
}

export interface IInputComponent {
  prepend?: ILabelControl[];
  append?: ILabelControl[];
  label?: string;
  size?: 'sm' | 'lg';
  controls: IFormControl[];
  className?: string;
}

export type IFormControl = IFormControlProps & React.InputHTMLAttributes<HTMLInputElement>;

export interface IInputSearchComponent {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>, value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  onSearch?: () => void;
  onRemove?: () => void;
  isHideIcon?: boolean;
  isShowRemove?: boolean;
  prepend?: React.ReactNode;
  append?: React.ReactNode;
  style?: React.CSSProperties;
  inputType?: InputSearchType;
}

export interface IInputMuiComponent extends BaseTextFieldProps {
  onChange?: (value: string) => void;
  labelPrepend?: string;
  labelAppend?: string;
  width?: number | string;
  menuItems?: IMenuItem<string | number>[];
  disableGrow?: boolean;
  inputAlign?: 'left' | 'center' | 'right';
  basis?: number | string;
}

export interface IInputMuiSearchComponent extends IInputMuiComponent {
  value?: string;
  onChange?: (value: string) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSearch?: () => void;
  onRemove?: () => void;
  isHideIcon?: boolean;
  isShowRemove?: boolean;
  inputType?: InputSearchType;
  maxHeight?: number | string;
  customPrepend?: React.ReactNode;
  customAppend?: React.ReactNode;
  customIconStart?: React.ReactNode;
  customIconEnd?: React.ReactNode;
  isNoWrap?: boolean;
  prependRef?: React.RefObject<HTMLDivElement>;
  textRef?: React.RefObject<HTMLDivElement>;
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

export interface FormControlMuiComponent extends Omit<FormControlLabelProps, 'control' | 'label'> {
  boxClassName?: string;
  labelPrepend?: string;
  children?: React.ReactNode;
  width?: number | string;
  isNotGroup?: boolean;
  label?: React.ReactNode;
  control?: React.ReactElement;
}

export interface IButtonMuiStyle {
  textTransform?: 'capitalize' | 'uppercase' | 'lowercase' | 'none';
  isNoneBorder?: boolean;
  active?: boolean;
}

export interface IButtonMuiComponent extends ButtonProps, IButtonMuiStyle {
  label?: React.ReactNode;
}

export interface IToggleButton extends ToggleButtonProps {
  label?: React.ReactNode;
}

export interface IToggleGroupMuiComponent extends ToggleButtonGroupProps, IButtonMuiStyle {
  toggles?: IToggleButton[];
  isDivContain?: boolean;
  isDivClassName?: string;
}

export interface IButtonGroupFormComponent {
  className?: string;
  width?: number | string;
  height?: number | string;
  forms: IPokemonFormModify[][];
  isLoaded: boolean;
  isFullWidth?: boolean;
  loading: React.ReactNode;
  id: number | undefined;
  defaultId: number | undefined;
  changeForm: (value: IPokemonFormModify) => void;
}

export interface IButtonGroupLeagueComponent {
  className?: string;
  width?: number | string;
  height?: number | string;
  leagues: BattleLeagueCPType[] | undefined;
  isLoaded: boolean;
  isFullWidth?: boolean;
  loading?: React.ReactNode;
  data?: PVPInfo;
  path?: string;
  onClick?: (value: BattleLeagueCPType) => void;
  value?: BattleLeagueCPType;
}

export interface IToggleTypeComponent extends IToggleGroupMuiComponent {
  onSelectType?: (value: string) => void;
}

export interface ISelectMuiComponent<T> extends BaseSelectProps<T> {
  inputLabel?: string;
  formClassName?: string;
  formSx?: SxProps<Theme>;
  insertItems?: IMenuItem<T>[];
  extendItems?: IMenuItem<T>[];
  menuItems?: IMenuItem<T>[];
  isNoneBorder?: boolean;
  onChangeSelect?: (value: T) => void;
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
  labelPrepend?: string;
  isNoWrap?: boolean;
  isFit?: boolean;
}

export interface ISelectBadgeComponent {
  type: string;
  priority: BadgeType;
  setPriority: (priority: BadgeType) => void;
}

export interface ICustomDataTableProps<T> extends Partial<TableProps<T>> {
  isAutoSearch?: boolean;
  menuItems?: IMenuItem<T>[];
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

export interface ISelectCardMoveComponent<T> {
  style?: React.CSSProperties;
  move: T | undefined;
  setMovePokemon: (value: T | undefined) => void;
  clearData?: () => void;
  pokemon: ISelectMovePokemonModel;
  moveType?: TypeMove;
  inputType?: InputType;
  isSelected?: boolean;
  isDisable?: boolean;
  maxHeight?: number;
  labelPrepend?: string;
  isNoWrap?: boolean;
  isHideEmpty?: boolean;
  emptyText?: string;
  moves?: T[];
}

export interface ISelectCardPokemonComponent<T> {
  pokemonList: T[];
  value?: string;
  placeholder?: string;
  isShowPokemon?: boolean;
  onChangeSelect?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  label?: string;
  onSetSelectId?: (id: T) => void;
  onSetPokemon?: (pokemon: T) => void;
  position?: SelectPosition;
  cardElement?: (pokemon: T) => React.ReactNode;
  onSetSearch?: (value: string) => void;
  maxHeight?: number | string;
  isFit?: boolean;
  onRemove?: () => void;
  onSelect?: (pokemon: T) => string | undefined;
  customIconStart?: JSX.Element;
  onIsSelectedPokemon?: (pokemon: T) => boolean;
  onFilter?: (pokemon: T) => { name: string | undefined; id: number };
  inputRef?: React.RefObject<HTMLInputElement>;
  isShowPokemonIcon?: boolean;
  sprite?: string;
  onSprite?: (pokemon: T) => string | undefined;
  isDisable?: boolean;
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

export interface IMenuItemComponent<T> {
  item: IMenuItem<T>;
  index: number;
}

export interface ITab {
  label?: string | React.ReactNode;
  value?: number;
  children?: React.ReactNode;
  tabValue?: number;
}

export interface TabPanelComponent {
  defaultValue?: number;
  className?: string;
  tabs: ITab[];
}

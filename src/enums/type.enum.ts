export enum TypeMove {
  Fast = 1,
  Charged = 2,
  All = 3,
  None = 4,
  Max = 5,
}

export enum TypeTheme {
  Light = 'light',
  Dark = 'dark',
}

export enum TypeRaid {
  Pokemon = 0,
  Boss = 1,
}

export enum TypeSex {
  Genderless = 0,
  Male = 1,
  Female = 2,
}

export enum TypeAction {
  Prod = 0,
  Atk = 1,
  Def = 2,
  Sta = 3,
}

export enum BuffType {
  Target = 0,
  Attacker = 1,
}

export enum GlobalType {
  None = -1,
  All,
}

export enum VariantType {
  Default = 'default',
  Error = 'error',
  Success = 'success',
  Warning = 'warning',
  Info = 'info',
  Dark = 'dark',
  Light = 'light',
  Determinate = 'determinate',
  Danger = 'danger',
  Standard = 'standard',
  Secondary = 'secondary',
  Outlined = 'outlined',
  OutlinedSecondary = 'outlined-secondary',
  Primary = 'primary',
  Contained = 'contained',
}

export enum CardType {
  Type = 0,
  Weather = 1,
  Move = 2,
}

export enum MoveType {
  None = 0,
  Shadow = 1,
  Purified = 2,
  Elite = 3,
  Special = 4,
  Exclusive = 5,
  Max = 6,
  Unavailable = 7,
  Disable = 8,
}

export enum MaxMoveType {
  Attack = 'attack',
  Guard = 'guard',
  Spirit = 'spirit',
}

export enum PokemonType {
  None = 0,
  Normal = 1,
  Shadow = 2,
  Purified = 3,
  Mega = 4,
  Primal = 5,
  GMax = 6,
  Buddy = 7,
  Lucky = 8,
}

export enum PokemonClass {
  None = 0,
  Legendary = 1,
  Mythical = 2,
  UltraBeast = 3,
}

export enum ThrowType {
  Normal = 0,
  Nice = 1,
  Great = 2,
  Excellent = 3,
}

export enum ColumnType {
  None = 1,
  Ranking,
  Id,
  Released,
  Name,
  Type,
  Atk,
  Def,
  Sta,
  Prod,
  PercentProd,
  Percent,
  DPS,
  TDO,
  FastMove,
  ChargedMove,
  Total,
  CP,
  MinCP,
  MaxCP,
  Level,
  Hp,
  Pokemon,
  PowerPVE,
  PowerPVP,
  EnergyPVE,
  EnergyPVP,
  Power,
}

export enum LabelType {
  Text,
  Button,
  Dropdown,
  SplitButton,
}

export enum BooleanType {
  False = 'false',
  True = 'true',
}

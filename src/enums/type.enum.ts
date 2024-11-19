/* eslint-disable no-unused-vars */
export enum TypeMove {
  Fast = 'FAST',
  Charge = 'CHARGE',
}

export enum TypeTheme {
  Light = 'light',
  Dark = 'dark',
}

export enum TypeRaid {
  Pokemon = 0,
  Boss,
}

export enum TypeSex {
  Genderless = 0,
  Male,
  Female,
}

export enum TypeAction {
  Atk = 0,
  Def,
  Sta,
  Prod,
}

export enum BuffType {
  Target = 0,
  Attacker,
}

export enum GlobalType {
  None = -1,
  All = 0,
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
  Primary = 'primary',
}

export enum MoveType {
  None = 0,
  Shadow,
  Purified,
  Elite,
  Special,
  Unavailable,
}

export enum PokemonType {
  None = 0,
  Normal,
  Shadow,
  Purified,
  Mega,
  Primal,
  GMax,
  Buddy,
  Lucky,
}

/* eslint-disable no-unused-vars */
export enum TypeMove {
  FAST = 'FAST',
  CHARGE = 'CHARGE',
}

export enum TypeTheme {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum TypeRaid {
  POKEMON = 'pokemon',
  BOSS = 'boss',
}

export enum TypeSex {
  MALE = 'male',
  FEMALE = 'female',
  GENDERLESS = 'genderless',
}

export enum TypeAction {
  ATK = 'atk',
  DEF = 'def',
  STA = 'sta',
  PROD = 'prod',
}

export enum BuffType {
  Target = 'target',
  Attacker = 'attacker',
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

import { Combat } from './combat.model';

export interface PokemonDataStats {
  level: number;
  isShadow: boolean;
  iv: {
    atk: number;
    def: number;
    sta: number;
  };
}

interface EvolutionBranch {
  evolution: string;
  candyCost: number;
  form: string;
  obPurificationEvolutionCandyCost: number;
  genderRequirement: number;
  kmBuddyDistanceRequirement: number;
  mustBeBuddy: boolean;
  onlyDaytime: boolean;
  onlyNighttime: boolean;
  lureItemRequirement: string;
  evolutionItemRequirement: string;
  onlyUpsideDown: boolean;
  questDisplay: any;
  temporaryEvolution: string;
  temporaryEvolutionEnergyCost: number;
  temporaryEvolutionEnergyCostSubsequent: number;
}

export interface PokemonModel {
  eliteQuickMove?: string[];
  eliteCinematicMove?: string[];
  form?: string | number | null;
  disableTransferToPokemonHome?: boolean;
  pokemonClass: any;
  formChange: null;
  tempEvoOverrides: any;
  pokemonId: string;
  modelScale: number;
  type: string;
  type2: string;
  camera: {
    diskRadiusM: number;
    cylinderRadiusM: number;
    cylinderHeightM: number;
    shoulderModeScale: number;
  };
  encounter: {
    collisionRadiusM: number;
    collisionHeightM: number;
    collisionHeadRadiusM: number;
    movementType: string;
    movementTimerS: number;
    jumpTimeS: number;
    attackTimerS: number;
    attackProbability: number;
    dodgeProbability: number;
    dodgeDurationS: number;
    dodgeDistance: number;
    cameraDistance: number;
    minPokemonActionFrequencyS: number;
    maxPokemonActionFrequencyS: number;
    obShadowFormBaseCaptureRate: number;
    obShadowFormAttackProbability: number;
    obShadowFormDodgeProbability: number;
  };
  stats: {
    baseStamina: number;
    baseAttack: number;
    baseDefense: number;
  };
  quickMoves: string[];
  cinematicMoves: string[];
  animationTime: number[];
  evolutionIds: string[];
  evolutionPips: number;
  pokedexHeightM: number;
  pokedexWeightKg: number;
  heightStdDev: number;
  weightStdDev: number;
  familyId: string;
  candyToEvolve: number;
  kmBuddyDistance: number;
  modelHeight: number;
  parentPokemonId?: string;
  evolutionBranch: EvolutionBranch[];
  modelScaleV2: number;
  buddyOffsetMale: number[];
  buddyOffsetFemale: number[];
  buddyScale: number;
  thirdMove?: {
    stardustToUnlock: number;
    candyToUnlock: number;
  };
  isTransferable: boolean;
  isDeployable: boolean;
  isTradable: boolean;
  shadow?: {
    purificationStardustNeeded: number;
    purificationCandyNeeded: number;
    purifiedChargeMove: string;
    shadowChargeMove: string;
  };
  buddyGroupNumber: number;
  buddyWalkedMegaEnergyAward: number;
  id: number;
  name: string;
}

export interface PokemonDataModel {
  num: number;
  name: string;
  alias: string;
  slug: string;
  sprite: string;
  types: string[];
  genderRatio: {
    M: number;
    F: number;
  };
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    sta?: number;
    spa: number;
    spd: number;
    spe: number;
  };
  heightm: number;
  weightkg: number;
  color: string;
  evos: string[];
  baseForme: string | null;
  baseFormeAlias: string | null;
  baseFormeSlug: string | null;
  baseFormeSprite: string | null;
  cosmeticFormes: string[];
  cosmeticFormesAliases: string[];
  cosmeticFormesSprites: string[];
  otherFormes: string[];
  otherFormesAliases: string[];
  otherFormesSprites: string[];
  formeOrder: string[];
  prevo: string | null;
  canGigantamax: boolean | null | string;
  baseSpecies: string | null;
  forme: string | null;
  changesFrom: string | null;
  cannotDynamax: boolean;
  releasedGO: boolean;
  isTransferable?: boolean | null;
  isDeployable: boolean | null;
  isTradable: boolean | null;
  pokemonClass: string | null;
  disableTransferToPokemonHome: boolean | null;
  isBaby: boolean;
  gen: number;
  region: string | null;
  version: string | null;
  isForceReleasedGO?: boolean;
  baseStatsGO?: boolean;
  stats?: PokemonDataStats | null;
}

export interface PokemonNameModel {
  index: number;
  id: number;
  name: string;
}

export interface PokemonMoveData {
  pokemon: any;
  fmove: Combat | undefined;
  cmove: Combat | undefined;
  dpsDef: number;
  dpsAtk: number;
  tdoAtk: number;
  tdoDef: number;
  multiDpsTdo: number;
  ttkAtk: number;
  ttkDef: number;
  attackHpRemain: number;
  defendHpRemain: number;
  death: number;
  shadow: boolean;
  purified: boolean;
  mShadow: boolean;
  elite: { fmove: boolean; cmove: boolean };
}

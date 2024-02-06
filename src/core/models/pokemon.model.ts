import { capitalize, checkMoveSetAvailable } from '../../util/Utils';
import { Combat } from './combat.model';
import { genList } from '../../util/Constants';
import { StatsPokemon } from './stats.model';
import { SelectMoveModel } from '../../components/Input/models/select-move.model';

export interface PokemonDataStats {
  level: number;
  isShadow: boolean;
  iv: StatsPokemon;
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
  obEvolutionBranchRequiredMove?: string;
}

export interface Encounter {
  baseCaptureRate?: number;
  baseFleeRate?: number;
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
}

export interface PokemonModel {
  obSpecialAttackMoves?: string[];
  eliteQuickMove?: string[];
  eliteCinematicMove?: string[];
  form?: string | number | null;
  disableTransferToPokemonHome?: boolean;
  pokemonClass: string | undefined;
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
  encounter: Encounter;
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

export interface PokemonGenderRatio {
  M: number;
  F: number;
}

export interface PokemonDataModel {
  num: number;
  name: string;
  alias: string;
  slug: string;
  sprite: string;
  types: string[];
  genderRatio: PokemonGenderRatio;
  baseStats: StatsPokemon;
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
  pokemon: PokemonDataModel | undefined;
  fmove: Combat | undefined;
  cmove: Combat | undefined;
  dpsDef: number;
  dpsAtk: number;
  tdoAtk: number;
  tdoDef: number;
  multiDpsTdo?: number;
  ttkAtk: number;
  ttkDef: number;
  attackHpRemain?: number;
  defendHpRemain?: number;
  death?: number;
  shadow?: boolean;
  purified?: boolean;
  mShadow?: boolean;
  elite?: { fmove: boolean; cmove: boolean };
  trainerId?: number;
  atk?: number;
  def?: number;
  hp?: number;
  timer?: number;
  defHpRemain?: number;
  atkHpRemain?: number;
  special?: boolean;
}

export interface PokemonEncounter {
  id: number;
  name: string;
  basecapturerate: number;
  basefleerate: number;
}

export interface PokemonRaidModel {
  dataTargetPokemon?: PokemonDataModel;
  fmoveTargetPokemon?: SelectMoveModel;
  cmoveTargetPokemon?: SelectMoveModel;
  trainerId?: number;
  dpsAtk?: number;
  hp?: number;
  ttkDef?: number;
  dpsDef?: number;
  tdoAtk?: number;
  tdoDef?: number;
  attackHpRemain?: number;
}

export class PokemonDataModel {
  num!: number;
  name!: string;
  alias!: string;
  slug!: string;
  sprite!: string;
  types!: string[];
  genderRatio!: {
    M: number;
    F: number;
  };
  baseStats!: StatsPokemon;
  heightm!: number;
  weightkg!: number;
  color!: string;
  evos!: string[];
  baseForme!: string | null;
  baseFormeAlias!: string | null;
  baseFormeSlug!: string | null;
  baseFormeSprite!: string | null;
  cosmeticFormes!: string[];
  cosmeticFormesAliases!: string[];
  cosmeticFormesSprites!: string[];
  otherFormes!: string[];
  otherFormesAliases!: string[];
  otherFormesSprites!: string[];
  formeOrder!: string[];
  prevo!: string | null;
  canGigantamax!: boolean | null | string;
  baseSpecies!: string | null;
  forme!: string | null;
  changesFrom!: string | null;
  cannotDynamax!: boolean;
  releasedGO!: boolean;
  isTransferable?: boolean | null;
  isDeployable!: boolean | null;
  isTradable!: boolean | null;
  pokemonClass!: string | null;
  disableTransferToPokemonHome!: boolean | null;
  isBaby!: boolean;
  gen!: number;
  region!: string | null;
  version!: string | null;
  isForceReleasedGO?: boolean;
  baseStatsGO?: boolean;
  stats?: PokemonDataStats | null;

  constructor(pokemon: PokemonModel, types: string[]) {
    let gen = 0;
    Object.entries(genList).forEach(([key, value]) => {
      const [minId, maxId] = value;
      if (pokemon.id >= minId && pokemon.id <= maxId) {
        gen = parseInt(key);
        return;
      }
    });
    this.num = pokemon.id;
    this.name = capitalize(pokemon.name);
    this.alias = pokemon.name.toLowerCase();
    this.slug = pokemon.name.toLowerCase();
    this.sprite = 'unknown-pokemon';
    this.types = types;
    this.genderRatio = {
      M: 0.5,
      F: 0.5,
    };
    this.baseStatsGO = true;
    this.baseStats = {
      atk: pokemon.stats?.baseAttack,
      def: pokemon.stats?.baseDefense,
      sta: pokemon.stats?.baseStamina,
    };
    this.heightm = pokemon.pokedexHeightM;
    this.weightkg = pokemon.pokedexWeightKg;
    this.color = 'None';
    this.evos = pokemon.evolutionIds ? pokemon.evolutionIds.map((name) => capitalize(name)) : [];
    this.baseForme = null;
    this.prevo = capitalize(pokemon.parentPokemonId ?? '');
    this.isForceReleasedGO = checkMoveSetAvailable(pokemon);
    this.releasedGO = false;
    this.isTransferable = pokemon.isTransferable;
    this.isDeployable = pokemon.isDeployable;
    this.isTradable = pokemon.isTradable;
    this.pokemonClass = pokemon.pokemonClass?.replace('POKEMON_CLASS_', '') ?? null;
    this.disableTransferToPokemonHome = pokemon.disableTransferToPokemonHome ?? false;
    this.isBaby = false;
    this.gen = gen;
    this.region = 'Unknown';
    this.version = 'scarlet-violet';
    this.baseSpecies = capitalize(pokemon.pokemonId);
    this.forme =
      this.name.indexOf('_') > -1
        ? this.name.slice(this.name.indexOf('_') + 1).replaceAll('_', '-') + (this.num === 931 ? '-plumage' : '')
        : null;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonModel {
  id!: number;
  name!: string;

  constructor(id: number, name: string | undefined) {
    this.id = id;
    this.name = name ?? '';
  }
}

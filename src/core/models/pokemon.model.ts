import { capitalize } from '../../util/Utils';
import { ICombat } from './combat.model';
import { FORM_GALARIAN, FORM_HISUIAN, FORM_NORMAL, genList } from '../../util/Constants';
import { IStatsPokemon } from './stats.model';
import { SelectMoveModel } from '../../components/Input/models/select-move.model';
import { IEvoList, ITempEvo } from './evolution.model';

export interface OptionsPokemon {
  prev?: IPokemonName | undefined;
  current: IPokemonName | undefined;
  next?: IPokemonName | undefined;
}

export interface PokemonGender {
  malePercent?: number;
  femalePercent?: number;
  genderlessPercent?: number;
}

export interface IPokemonDataStats {
  level: number;
  isShadow: boolean;
  iv: IStatsPokemon;
}

interface IPokemonFormChange {
  availableForm: string[];
  candyCost: string;
  stardustCost: string;
  item?: string;
  itemCostCount?: number;
  componentPokemonSettings?: {
    pokedexId: string;
    componentCandyCost: number;
    formChangeType: string;
  };
}

interface EvolutionBranch {
  evolution: string;
  candyCost: number;
  evolutionItemRequirementCost?: number;
  form: string;
  candyCostPurified: number;
  genderRequirement: string;
  kmBuddyDistanceRequirement: number;
  mustBeBuddy: boolean;
  onlyDaytime: boolean;
  onlyNighttime: boolean;
  lureItemRequirement: string;
  evolutionItemRequirement: string;
  onlyUpsideDown: boolean;
  questDisplay: {
    questRequirementTemplateId: string;
  }[];
  temporaryEvolution: string;
  temporaryEvolutionEnergyCost: number;
  temporaryEvolutionEnergyCostSubsequent: number;
  obEvolutionBranchRequiredMove?: string;
}

interface IEncounter {
  baseCaptureRate?: number;
  baseFleeRate?: number;
  collisionRadiusM?: number;
  collisionHeightM?: number;
  collisionHeadRadiusM?: number;
  movementType?: string;
  movementTimerS?: number;
  jumpTimeS?: number;
  attackTimerS?: number;
  attackProbability?: number;
  dodgeProbability?: number;
  dodgeDurationS?: number;
  dodgeDistance?: number;
  cameraDistance?: number;
  minPokemonActionFrequencyS?: number;
  maxPokemonActionFrequencyS?: number;
  obShadowFormBaseCaptureRate?: number;
  obShadowFormAttackProbability?: number;
  obShadowFormDodgeProbability?: number;
}

export interface PokemonModel {
  obSpecialAttackMoves?: string[];
  eliteQuickMove?: string[];
  eliteCinematicMove?: string[];
  form?: string | number | null;
  disableTransferToPokemonHome?: boolean;
  pokemonClass: string | undefined;
  formChange?: IPokemonFormChange[];
  tempEvoOverrides: {
    tempEvoId: string;
    stats: {
      baseStamina: number;
      baseAttack: number;
      baseDefense: number;
    };
  }[];
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
  encounter: IEncounter;
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

export interface IPokemonData {
  pokemonId?: string;
  num: number;
  name: string;
  fullName?: string;
  slug: string;
  sprite: string;
  types: string[];
  genderRatio: PokemonGenderRatio;
  baseStats: IStatsPokemon;
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
  baseStatsGO?: boolean;
  stats?: IPokemonDataStats | null;
  isShadow?: boolean;
  formChange?: IPokemonFormChange[];
  quickMoves?: string[];
  cinematicMoves?: string[];
  specialMoves?: string[];
  eliteQuickMove?: string[];
  eliteCinematicMove?: string[];
  shadowMoves?: string[];
  purifiedMoves?: string[];
  evoList?: IEvoList[];
  tempEvo?: ITempEvo[];
  purified?: {
    stardust?: number;
    candy?: number;
  };
  thirdMove?: {
    stardust?: number;
    candy?: number;
  };
  encounter?: IEncounter;
}

export interface IPokemonName {
  id: number;
  name: string;
}

export interface PokemonMoveData {
  pokemon: IPokemonData | undefined;
  fmove: ICombat | undefined;
  cmove: ICombat | undefined;
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
  dataTargetPokemon?: IPokemonData;
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

export interface IPokemonDataOptional {
  slug?: string;
  sprite?: string;
  baseStatsGO?: boolean;
  genderRatio?: {
    M: number;
    F: number;
  };
  color?: string;
  baseForme?: string | null;
  releasedGO?: boolean;
  isBaby?: boolean;
  region?: string | null;
  version?: string | null;
  shadowMoves?: string[];
  purifiedMoves?: string[];
  evoList?: IEvoList[];
  tempEvo?: ITempEvo[];
  purified?: {
    stardust?: number;
    candy?: number;
  };
  thirdMove?: {
    stardust?: number;
    candy?: number;
  };
}

export class PokemonDataOptional implements IPokemonDataOptional {
  slug?: string;
  sprite?: string;
  baseStatsGO?: boolean;
  genderRatio?: {
    M: number;
    F: number;
  };
  color?: string;
  baseForme?: string | null;
  releasedGO?: boolean;
  isBaby?: boolean;
  region?: string | null;
  version?: string | null;
  shadowMoves?: string[];
  purifiedMoves?: string[];
  evoList?: IEvoList[];
  tempEvo?: ITempEvo[];
  purified?: {
    stardust?: number;
    candy?: number;
  };
  thirdMove?: {
    stardust?: number;
    candy?: number;
  };

  constructor({ ...props }: IPokemonDataOptional) {
    Object.assign(this, props);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonData implements IPokemonData {
  pokemonId?: string;
  num: number;
  name: string;
  fullName?: string;
  slug: string;
  sprite: string;
  types: string[];
  genderRatio: {
    M: number;
    F: number;
  };
  baseStats: IStatsPokemon;
  heightm: number;
  weightkg: number;
  color: string;
  evos: string[];
  baseForme: string | null;
  prevo: string | null;
  baseSpecies: string | null;
  forme: string | null;
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
  baseStatsGO?: boolean;
  stats?: IPokemonDataStats | null;
  encounter?: IEncounter;
  isShadow?: boolean;
  formChange?: IPokemonFormChange[];
  quickMoves?: string[];
  cinematicMoves?: string[];
  specialMoves?: string[];
  eliteQuickMove?: string[];
  eliteCinematicMove?: string[];
  shadowMoves?: string[];
  purifiedMoves?: string[];
  evoList?: IEvoList[];
  tempEvo?: ITempEvo[];
  purified?: {
    stardust?: number;
    candy?: number;
  };
  thirdMove?: {
    stardust?: number;
    candy?: number;
  };
  baseFormeAlias!: string;
  baseFormeSlug!: string;
  baseFormeSprite!: string;
  cosmeticFormes!: string[];
  cosmeticFormesAliases!: string[];
  cosmeticFormesSprites!: string[];
  otherFormes!: string[];
  otherFormesAliases!: string[];
  otherFormesSprites!: string[];
  formeOrder!: string[];
  canGigantamax!: string | boolean;
  changesFrom!: string | null;
  cannotDynamax!: boolean;

  constructor(pokemon: PokemonModel, types: string[], options?: IPokemonDataOptional) {
    let gen = 0;
    Object.entries(genList).forEach(([key, value]) => {
      const [minId, maxId] = value;
      if (pokemon.id >= minId && pokemon.id <= maxId) {
        gen = parseInt(key);
        return;
      }
    });
    this.pokemonId = pokemon.pokemonId;
    this.num = pokemon.id;
    this.name = capitalize(pokemon.name.replaceAll('_', '-'));
    this.fullName = pokemon.form && pokemon.form !== FORM_NORMAL ? `${pokemon.pokemonId}_${pokemon.form}` : pokemon.pokemonId;
    this.slug =
      options?.slug ??
      pokemon.name.replace(`_${FORM_GALARIAN}`, '_GALAR').replace(`_${FORM_HISUIAN}`, '_HISUI').replaceAll('_', '-').toLowerCase();
    this.sprite = options?.sprite ?? 'unknown-pokemon';
    this.types = types;
    this.genderRatio = {
      M: options?.genderRatio?.M ?? 0.5,
      F: options?.genderRatio?.F ?? 0.5,
    };
    this.baseStatsGO = options?.baseStatsGO === undefined ? true : options?.baseStatsGO;
    this.baseStats = {
      atk: pokemon.stats?.baseAttack,
      def: pokemon.stats?.baseDefense,
      sta: pokemon.stats?.baseStamina,
    };
    this.heightm = pokemon.pokedexHeightM;
    this.weightkg = pokemon.pokedexWeightKg;
    this.color = options?.color ?? 'None';
    this.evos = pokemon.evolutionIds ? pokemon.evolutionIds.map((name) => capitalize(name)) : [];
    this.baseForme = options?.baseForme ?? null;
    this.prevo = capitalize(pokemon.parentPokemonId ?? '');
    this.releasedGO = options?.releasedGO ?? false;
    this.isTransferable = pokemon.isTransferable;
    this.isDeployable = pokemon.isDeployable;
    this.isTradable = pokemon.isTradable;
    this.pokemonClass = pokemon.pokemonClass?.replace('POKEMON_CLASS_', '') ?? null;
    this.disableTransferToPokemonHome = pokemon.disableTransferToPokemonHome ?? false;
    this.isBaby = options?.isBaby ?? false;
    this.gen = gen;
    this.region = options?.region ?? 'Unknown';
    this.version = options?.version ?? 'scarlet-violet';
    this.baseSpecies = capitalize(pokemon.pokemonId);
    this.forme = pokemon.form ? pokemon.form.toString() : FORM_NORMAL;
    this.encounter = pokemon.encounter;
    this.isShadow = pokemon.shadow ? true : false;
    this.formChange = pokemon.formChange ?? [];

    this.quickMoves = pokemon.quickMoves?.map((move) => move?.toString().replace('_FAST', '')) ?? [];
    this.cinematicMoves = pokemon.cinematicMoves?.map((move) => move?.toString()) ?? [];
    this.eliteQuickMove = pokemon.eliteQuickMove?.map((move) => move?.toString().replace('_FAST', '')) ?? [];
    this.eliteCinematicMove = pokemon.eliteCinematicMove?.map((move) => move?.toString()) ?? [];
    this.specialMoves = pokemon.obSpecialAttackMoves?.map((move) => move?.toString()) ?? [];
    this.shadowMoves = options?.shadowMoves ?? [];
    this.purifiedMoves = options?.purifiedMoves ?? [];

    this.evoList = options?.evoList ?? [];
    this.tempEvo = options?.tempEvo ?? [];
    this.purified = options?.purified;
    this.thirdMove = options?.thirdMove;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonModel implements IPokemonName {
  id: number;
  name: string;

  constructor(id: number, name?: string) {
    this.id = id;
    this.name = name ?? '';
  }
}

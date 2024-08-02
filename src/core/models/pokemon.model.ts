import { capitalize } from '../../util/Utils';
import { ICombat } from './combat.model';
import { FORM_GALARIAN, FORM_HISUIAN, FORM_NORMAL, genList } from '../../util/Constants';
import { IStatsPokemon, StatsPokemon } from './stats.model';
import { ISelectMoveModel } from '../../components/Input/models/select-move.model';
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

export class Encounter implements IEncounter {
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

  constructor({ ...props }: IEncounter) {
    Object.assign(this, props);
  }
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

export interface IPokemonGenderRatio {
  M: number;
  F: number;
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonGenderRatio implements IPokemonGenderRatio {
  M: number;
  F: number;

  constructor() {
    this.M = 0;
    this.F = 0;
  }

  static create(male: number, female: number) {
    const obj = new PokemonGenderRatio();
    obj.M = male;
    obj.F = female;
    return obj;
  }
}

export interface IPokemonData {
  pokemonId?: string;
  num: number;
  name: string;
  fullName?: string;
  slug: string;
  sprite: string;
  types: string[];
  genderRatio: IPokemonGenderRatio;
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
  canGigantamax: string | null;
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
  fmoveTargetPokemon?: ISelectMoveModel;
  cmoveTargetPokemon?: ISelectMoveModel;
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
  genderRatio?: IPokemonGenderRatio;
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

// tslint:disable-next-line:max-classes-per-file
export class PokemonDataOptional implements IPokemonDataOptional {
  slug?: string;
  sprite?: string;
  baseStatsGO?: boolean;
  genderRatio?: IPokemonGenderRatio;
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
  num: number = 0;
  name: string = '';
  fullName?: string;
  slug: string = '';
  sprite: string = '';
  types: string[] = [];
  genderRatio: IPokemonGenderRatio = new PokemonGenderRatio();
  baseStats: IStatsPokemon = new StatsPokemon();
  heightm: number = 0;
  weightkg: number = 0;
  color: string = '';
  evos: string[] = [];
  baseForme: string | null = null;
  prevo: string | null = null;
  baseSpecies: string | null = null;
  forme: string | null = null;
  releasedGO: boolean = false;
  isTransferable?: boolean | null;
  isDeployable: boolean | null = false;
  isTradable: boolean | null = false;
  pokemonClass: string | null = null;
  disableTransferToPokemonHome: boolean | null = false;
  isBaby: boolean = false;
  gen: number = 0;
  region: string | null = null;
  version: string | null = null;
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
  baseFormeAlias: string = '';
  baseFormeSlug: string = '';
  baseFormeSprite: string = '';
  cosmeticFormes: string[] = [];
  cosmeticFormesAliases: string[] = [];
  cosmeticFormesSprites: string[] = [];
  otherFormes: string[] = [];
  otherFormesAliases: string[] = [];
  otherFormesSprites: string[] = [];
  formeOrder: string[] = [];
  canGigantamax: string | null = null;
  changesFrom: string | null = null;
  cannotDynamax: boolean = false;

  // tslint:disable-next-line:no-empty
  constructor() {}

  static create(pokemon: PokemonModel, types: string[], options?: IPokemonDataOptional) {
    const obj = new PokemonData();
    Object.entries(genList).forEach(([key, value]) => {
      const [minId, maxId] = value;
      if (pokemon.id >= minId && pokemon.id <= maxId) {
        obj.gen = parseInt(key);
        return;
      }
    });
    obj.pokemonId = pokemon.pokemonId;
    obj.num = pokemon.id;
    obj.name = capitalize(pokemon.name.replaceAll('_', '-'));
    obj.fullName = pokemon.form && pokemon.form !== FORM_NORMAL ? `${pokemon.pokemonId}_${pokemon.form}` : pokemon.pokemonId;
    obj.slug =
      options?.slug ??
      pokemon.name.replace(`_${FORM_GALARIAN}`, '_GALAR').replace(`_${FORM_HISUIAN}`, '_HISUI').replaceAll('_', '-').toLowerCase();
    obj.sprite = options?.sprite ?? 'unknown-pokemon';
    obj.types = types;
    obj.genderRatio = PokemonGenderRatio.create(options?.genderRatio?.M ?? 0.5, options?.genderRatio?.F ?? 0.5);
    obj.baseStatsGO = options?.baseStatsGO === undefined ? true : options?.baseStatsGO;
    obj.baseStats = {
      atk: pokemon.stats?.baseAttack,
      def: pokemon.stats?.baseDefense,
      sta: pokemon.stats?.baseStamina,
    };
    obj.heightm = pokemon.pokedexHeightM;
    obj.weightkg = pokemon.pokedexWeightKg;
    obj.color = options?.color ?? 'None';
    obj.evos = pokemon.evolutionIds ? pokemon.evolutionIds.map((name) => capitalize(name)) : [];
    obj.baseForme = options?.baseForme ?? null;
    obj.prevo = capitalize(pokemon.parentPokemonId ?? '');
    obj.releasedGO = options?.releasedGO ?? false;
    obj.isTransferable = pokemon.isTransferable;
    obj.isDeployable = pokemon.isDeployable;
    obj.isTradable = pokemon.isTradable;
    obj.pokemonClass = pokemon.pokemonClass?.replace('POKEMON_CLASS_', '') ?? null;
    obj.disableTransferToPokemonHome = pokemon.disableTransferToPokemonHome ?? false;
    obj.isBaby = options?.isBaby ?? false;
    obj.region = options?.region ?? 'Unknown';
    obj.version = options?.version ?? 'scarlet-violet';
    obj.baseSpecies = capitalize(pokemon.pokemonId);
    obj.forme = pokemon.form ? pokemon.form.toString() : FORM_NORMAL;
    obj.encounter = pokemon.encounter;
    obj.isShadow = pokemon.shadow ? true : false;
    obj.formChange = pokemon.formChange ?? [];

    obj.quickMoves = pokemon.quickMoves?.map((move) => move?.toString().replace('_FAST', '')) ?? [];
    obj.cinematicMoves = pokemon.cinematicMoves?.map((move) => move?.toString()) ?? [];
    obj.eliteQuickMove = pokemon.eliteQuickMove?.map((move) => move?.toString().replace('_FAST', '')) ?? [];
    obj.eliteCinematicMove = pokemon.eliteCinematicMove?.map((move) => move?.toString()) ?? [];
    obj.specialMoves = pokemon.obSpecialAttackMoves?.map((move) => move?.toString()) ?? [];
    obj.shadowMoves = options?.shadowMoves ?? [];
    obj.purifiedMoves = options?.purifiedMoves ?? [];

    obj.evoList = options?.evoList ?? [];
    obj.tempEvo = options?.tempEvo ?? [];
    obj.purified = options?.purified;
    obj.thirdMove = options?.thirdMove;

    return obj;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonModel implements IPokemonName {
  id: number;
  name: string;

  constructor(id: number, name?: string, settings?: PokemonModel) {
    this.id = id;
    this.name = name ?? '';
    if (settings) {
      Object.assign(this, { ...settings });
    }
  }
}

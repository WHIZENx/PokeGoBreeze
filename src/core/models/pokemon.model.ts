import {
  capitalize,
  convertPokemonDataName,
  getGenerationPokemon,
  getKeyWithData,
  getPokemonClass,
  replaceTempMoveName,
} from '../../utils/utils';
import { ICombat } from './combat.model';
import { genList, regionList, versionList } from '../../utils/constants';
import { IStatsIV, IStatsPokemon, IStatsPokemonGO, StatsIV, StatsPokemon, StatsPokemonGO } from './stats.model';
import { ISelectMoveModel } from '../../components/Input/models/select-move.model';
import { IEvoList, IPokemonTypeCost, ITempEvo } from './evolution.model';
import { getValueOrDefault, isUndefined, safeObjectEntries, toNumber, UniqValueInArray } from '../../utils/extension';
import { ItemEvolutionType, ItemLureType } from '../enums/option.enum';
import { GlobalType, MoveType, PokemonClass, PokemonType } from '../../enums/type.enum';
import { Species, Variety } from './API/species.model';
import { minLevel, formNormal, defaultSpriteName } from '../../utils/helpers/options-context.helpers';

export interface OptionsPokemon {
  prev?: IPokemonName;
  current: IPokemonName | undefined;
  next?: IPokemonName;
}

export interface PokemonGender {
  malePercent?: number;
  femalePercent?: number;
  genderlessPercent?: number;
}

export interface IPokemonDataStats {
  level: number;
  pokemonType: PokemonType;
  iv: IStatsIV;
}

export class PokemonDataStats implements IPokemonDataStats {
  level = minLevel();
  pokemonType = PokemonType.None;
  iv = new StatsIV();

  constructor({ ...props }: IPokemonDataStats) {
    Object.assign(this, props);
  }
}

interface ComponentPokemonSettings {
  id: number;
  pokedexId: string;
  componentCandyCost: number;
  formChangeType: string;
  familyId: string;
}

interface MoveReassignType {
  existingMoves?: string[];
  replacementMoves?: string[];
}

interface MoveReassignment {
  cinematicMoves?: MoveReassignType[];
}

export interface IPokemonFormChange {
  availableForm: string[];
  candyCost?: string;
  stardustCost?: string;
  item?: string;
  itemCostCount?: number;
  componentPokemonSettings?: ComponentPokemonSettings;
  moveReassignment?: MoveReassignment;
}

interface QuestDisplay {
  questRequirementTemplateId: string;
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
  lureItemRequirement: ItemLureType;
  evolutionItemRequirement: ItemEvolutionType;
  onlyUpsideDown: boolean;
  questDisplay: QuestDisplay[];
  temporaryEvolution: string;
  temporaryEvolutionEnergyCost: number;
  temporaryEvolutionEnergyCostSubsequent: number;
  obEvolutionBranchRequiredMove?: string;
  evolutionMoveRequirement?: string;
}

export interface IEncounter {
  baseCaptureRate?: number;
  baseFleeRate?: number;
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
  bonusCandyCaptureReward?: number;
  bonusStardustCaptureReward?: number;
  bonusXlCandyCaptureReward?: number;
  shadowBaseCaptureRate?: number;
  shadowAttackProbability?: number;
  shadowDodgeProbability?: number;
}

export class Encounter implements IEncounter {
  baseCaptureRate?: number;
  baseFleeRate?: number;
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
  bonusCandyCaptureReward?: number;
  bonusStardustCaptureReward?: number;
  bonusXlCandyCaptureReward?: number;
  shadowBaseCaptureRate?: number;
  shadowAttackProbability?: number;
  shadowDodgeProbability?: number;

  constructor({ ...props }: IEncounter) {
    Object.assign(this, props);
  }
}

interface IStatsGO {
  baseStamina: number;
  baseAttack: number;
  baseDefense: number;
}

export class StatsGO implements IStatsGO {
  baseStamina = 0;
  baseAttack = 0;
  baseDefense = 0;

  static create(value: IStatsGO) {
    const obj = new StatsGO();
    Object.assign(obj, value);
    return obj;
  }
}

interface TempEvoOverrides {
  tempEvoId: string;
  stats: IStatsGO;
  typeOverride1: string;
  typeOverride2?: string;
}

interface Camera {
  diskRadiusM: number;
  cylinderRadiusM: number;
  cylinderHeightM: number;
  shoulderModeScale: number;
}

interface ThirdMove {
  stardustToUnlock: number;
  candyToUnlock: number;
}

interface ShadowSetting {
  purificationStardustNeeded: number;
  purificationCandyNeeded: number;
  purifiedChargeMove: string;
  shadowChargeMove: string;
}

export interface PokemonModel {
  form?: string | number;
  disableTransferToPokemonHome?: boolean;
  pokemonClass: string | undefined;
  formChange?: IPokemonFormChange[];
  tempEvoOverrides?: TempEvoOverrides[];
  pokemonId: string;
  modelScale: number;
  type?: string;
  type2?: string;
  camera?: Camera;
  encounter?: IEncounter;
  stats?: IStatsGO;
  quickMoves?: (string | number)[];
  cinematicMoves?: (string | number)[];
  animationTime: number[];
  evolutionIds?: string[];
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
  evolutionBranch?: EvolutionBranch[];
  modelScaleV2: number;
  buddyOffsetMale: number[];
  buddyOffsetFemale: number[];
  buddyScale: number;
  thirdMove?: ThirdMove;
  isTransferable: boolean;
  isDeployable: boolean;
  isTradable: boolean;
  shadow?: ShadowSetting;
  buddyGroupNumber: number;
  buddyWalkedMegaEnergyAward: number;
  nonTmCinematicMoves?: (string | number)[];
  obSpecialAttackMoves?: (string | number)[];
  eliteQuickMove?: (string | number)[];
  eliteCinematicMove?: (string | number)[];
  id: number;
  name: string;
  isForceReleaseGO?: boolean;
  pokemonType: PokemonType;
  types: string[] | undefined;
}

export interface IPokemonGenderRatio {
  M: number;
  F: number;
}

export class PokemonGenderRatio implements IPokemonGenderRatio {
  M = 0;
  F = 0;

  static create(male: number | undefined, female: number | undefined) {
    const obj = new PokemonGenderRatio();
    obj.M = toNumber(male);
    obj.F = toNumber(female);
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
  statsGO: IStatsPokemonGO;
  heightM: number;
  weightKg: number;
  color: string;
  evos: string[] | undefined;
  baseForme: string | undefined;
  baseFormeAlias: string | undefined;
  baseFormeSlug: string | undefined;
  baseFormeSprite: string | undefined;
  cosmeticFormes: string[] | undefined;
  cosmeticFormesAliases: string[] | undefined;
  cosmeticFormesSprites: string[] | undefined;
  otherFormes: string[] | undefined;
  otherFormesAliases: string[] | undefined;
  otherFormesSprites: string[] | undefined;
  formeOrder: string[] | undefined;
  prevEvo: string | undefined;
  canGigantamax: string | undefined;
  baseSpecies: string | undefined;
  form: string | undefined;
  changesFrom: string | undefined;
  cannotDynamax: boolean;
  releasedGO: boolean;
  isTransferable?: boolean | undefined;
  isDeployable: boolean | undefined;
  isTradable: boolean | undefined;
  pokemonClass: PokemonClass;
  disableTransferToPokemonHome: boolean | undefined;
  isBaby: boolean;
  gen: number;
  region: string | undefined;
  version: string | undefined;
  baseStatsGO?: boolean;
  stats?: IPokemonDataStats;
  hasShadowForm?: boolean;
  formChange?: IPokemonFormChange[];
  quickMoves?: string[];
  cinematicMoves?: string[];
  specialMoves?: string[];
  exclusiveMoves?: string[];
  dynamaxMoves?: string[];
  eliteQuickMoves?: string[];
  eliteCinematicMoves?: string[];
  shadowMoves?: string[];
  purifiedMoves?: string[];
  evoList?: IEvoList[];
  tempEvo?: ITempEvo[];
  purified?: IPokemonTypeCost;
  thirdMove?: IPokemonTypeCost;
  encounter?: IEncounter;
  pokemonType: PokemonType;
}

export interface IPokemonName {
  id: number;
  name: string;
}

interface IPokemonDPSBattle {
  pokemon: IPokemonData | undefined;
  fMove: ICombat | undefined;
  cMove: ICombat | undefined;
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
  pokemonType?: PokemonType;
  fMoveType?: MoveType;
  cMoveType?: MoveType;
  atk?: number;
  def?: number;
  hp?: number;
  timer?: number;
  defHpRemain?: number;
  atkHpRemain?: number;
}

export class PokemonDPSBattle implements IPokemonDPSBattle {
  pokemon: IPokemonData | undefined;
  fMove: ICombat | undefined;
  cMove: ICombat | undefined;
  dpsDef = 0;
  dpsAtk = 0;
  tdoAtk = 0;
  tdoDef = 0;
  multiDpsTdo?: number;
  ttkAtk = 0;
  ttkDef = 0;
  attackHpRemain?: number;
  defendHpRemain?: number;
  death?: number;
  pokemonType?: PokemonType;
  fMoveType?: MoveType;
  cMoveType?: MoveType;
  atk?: number;
  def?: number;
  hp?: number;
  timer?: number;
  defHpRemain?: number;
  atkHpRemain?: number;

  static create(value: IPokemonDPSBattle) {
    const obj = new PokemonDPSBattle();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IPokemonMoveData extends Partial<IPokemonDPSBattle> {
  trainerId?: number;
  ttkAtk: number;
  ttkDef: number;
  tdoAtk: number;
  tdoDef: number;
  dpsAtk: number;
  dpsDef: number;
}

export class PokemonMoveData implements IPokemonMoveData {
  trainerId?: number;
  pokemon: IPokemonData | undefined;
  hp?: number;
  atkHpRemain?: number;
  defHpRemain?: number;
  ttkAtk = 0;
  ttkDef = 0;
  tdoAtk = 0;
  tdoDef = 0;
  dpsAtk = 0;
  dpsDef = 0;

  static create(value: IPokemonMoveData) {
    const obj = new PokemonMoveData();
    Object.assign(obj, value);
    return obj;
  }
}

export interface PokemonEncounter {
  id: number;
  name: string;
  basecapturerate: number;
  basefleerate: number;
}

export interface IPokemonRaidModel {
  dataTargetPokemon?: IPokemonData;
  fMoveTargetPokemon?: ISelectMoveModel;
  cMoveTargetPokemon?: ISelectMoveModel;
  trainerId?: number;
  dpsAtk?: number;
  hp?: number;
  ttkDef?: number;
  dpsDef?: number;
  tdoAtk?: number;
  tdoDef?: number;
  attackHpRemain?: number;
}

export class PokemonRaidModel implements IPokemonRaidModel {
  dataTargetPokemon?: IPokemonData;
  fMoveTargetPokemon?: ISelectMoveModel;
  cMoveTargetPokemon?: ISelectMoveModel;
  trainerId?: number;
  dpsAtk?: number;
  hp?: number;
  ttkDef?: number;
  dpsDef?: number;
  tdoAtk?: number;
  tdoDef?: number;
  attackHpRemain?: number;

  static create(value: IPokemonRaidModel) {
    const obj = new PokemonRaidModel();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IPokemonDataOptional {
  slug?: string;
  sprite?: string;
  baseStatsGO?: boolean;
  genderRatio?: IPokemonGenderRatio;
  color?: string;
  baseForme?: string;
  releasedGO?: boolean;
  isBaby?: boolean;
  region?: string;
  version?: string;
  shadowMoves?: string[];
  purifiedMoves?: string[];
  evoList?: IEvoList[];
  tempEvo?: ITempEvo[];
  purified?: IPokemonTypeCost;
  thirdMove?: IPokemonTypeCost;
  prevEvo?: string;
  baseStats?: IStatsPokemon;
}

export class PokemonDataOptional implements IPokemonDataOptional {
  slug?: string;
  sprite?: string;
  baseStatsGO?: boolean;
  genderRatio?: IPokemonGenderRatio;
  color?: string;
  baseForme?: string;
  releasedGO?: boolean;
  isBaby?: boolean;
  region?: string;
  version?: string;
  shadowMoves?: string[];
  purifiedMoves?: string[];
  evoList?: IEvoList[];
  tempEvo?: ITempEvo[];
  purified?: IPokemonTypeCost;
  thirdMove?: IPokemonTypeCost;
  prevEvo?: string;
  baseStats?: IStatsPokemon;

  constructor({ ...props }: IPokemonDataOptional) {
    Object.assign(this, props);
  }
}

export class PokemonData implements IPokemonData {
  pokemonId?: string;
  num = 0;
  name = '';
  fullName?: string;
  slug = '';
  sprite = '';
  types: string[] = [];
  genderRatio = new PokemonGenderRatio();
  baseStats = new StatsPokemon();
  statsGO = new StatsPokemonGO();
  heightM = 0;
  weightKg = 0;
  color = '';
  evos: string[] | undefined;
  baseForme: string | undefined;
  prevEvo: string | undefined;
  baseSpecies: string | undefined;
  form: string | undefined;
  releasedGO = false;
  isTransferable?: boolean | undefined;
  isDeployable = false;
  isTradable = false;
  pokemonClass = PokemonClass.None;
  disableTransferToPokemonHome = false;
  isBaby = false;
  gen = 0;
  region: string | undefined;
  version: string | undefined;
  baseStatsGO?: boolean;
  stats?: IPokemonDataStats;
  encounter?: IEncounter;
  hasShadowForm?: boolean;
  formChange?: IPokemonFormChange[];
  quickMoves?: string[];
  cinematicMoves?: string[];
  specialMoves?: string[];
  exclusiveMoves?: string[];
  dynamaxMoves?: string[];
  eliteQuickMoves?: string[];
  eliteCinematicMoves?: string[];
  shadowMoves?: string[];
  purifiedMoves?: string[];
  evoList?: IEvoList[];
  tempEvo?: ITempEvo[];
  purified?: IPokemonTypeCost;
  thirdMove?: IPokemonTypeCost;
  baseFormeAlias: string | undefined;
  baseFormeSlug: string | undefined;
  baseFormeSprite: string | undefined;
  cosmeticFormes: string[] | undefined;
  cosmeticFormesAliases: string[] | undefined;
  cosmeticFormesSprites: string[] | undefined;
  otherFormes: string[] | undefined;
  otherFormesAliases: string[] | undefined;
  otherFormesSprites: string[] | undefined;
  formeOrder: string[] | undefined;
  canGigantamax: string | undefined;
  changesFrom: string | undefined;
  cannotDynamax = true;
  pokemonType = PokemonType.Normal;

  static copy(pokemon: IPokemonData | undefined) {
    if (pokemon) {
      const obj = new PokemonData();
      Object.assign(obj, pokemon);
      return obj;
    }
  }

  static copyWithCreate(pokemon: IPokemonData | undefined) {
    const obj = new PokemonData();
    if (pokemon) {
      Object.assign(obj, pokemon);
    }
    return obj;
  }

  static create(pokemon: PokemonDataModel, options?: IPokemonDataOptional) {
    const obj = new PokemonData();
    safeObjectEntries(genList).forEach(([key, value]) => {
      const [minId, maxId] = value;
      if (pokemon.id >= minId && pokemon.id <= maxId) {
        obj.gen = toNumber(key);
        return;
      }
    });
    const name = pokemon.name.replaceAll('_', '-');
    obj.pokemonId = pokemon.pokemonId;
    obj.num = pokemon.id;
    obj.name = capitalize(name);
    if (pokemon.id !== 201) {
      obj.fullName =
        pokemon.form && pokemon.pokemonType !== PokemonType.Normal
          ? `${pokemon.pokemonId}_${pokemon.form}`
          : pokemon.pokemonId;
    } else {
      obj.fullName = getValueOrDefault(String, pokemon.form?.toString());
    }
    obj.slug = (options?.slug ?? name).toLowerCase();
    obj.sprite = getValueOrDefault(String, options?.sprite, defaultSpriteName());
    obj.types = getValueOrDefault(Array, pokemon.types);
    obj.genderRatio = PokemonGenderRatio.create(
      toNumber(options?.genderRatio?.M, 0.5),
      toNumber(options?.genderRatio?.F, 0.5)
    );
    obj.baseStatsGO = isUndefined(options?.baseStatsGO) ? true : options.baseStatsGO;
    obj.baseStats = options?.baseStats ?? new StatsPokemon();
    obj.statsGO = StatsPokemonGO.create(
      pokemon.stats?.baseAttack,
      pokemon.stats?.baseDefense,
      pokemon.stats?.baseStamina
    );
    obj.heightM = pokemon.pokedexHeightM;
    obj.weightKg = pokemon.pokedexWeightKg;
    obj.color = getValueOrDefault(String, options?.color, getKeyWithData(GlobalType, GlobalType.None));
    obj.evos = getValueOrDefault(
      Array,
      pokemon.evolutionIds?.map((name) => capitalize(name))
    );
    obj.baseForme = options?.baseForme;
    obj.prevEvo = capitalize(pokemon.parentPokemonId || options?.prevEvo) || undefined;
    obj.releasedGO = getValueOrDefault(Boolean, options?.releasedGO);
    obj.isTransferable = pokemon.isTransferable;
    obj.isDeployable = pokemon.isDeployable;
    obj.isTradable = pokemon.isTradable;
    obj.pokemonClass = getPokemonClass(pokemon.pokemonClass);
    obj.disableTransferToPokemonHome = getValueOrDefault(Boolean, pokemon.disableTransferToPokemonHome);
    obj.isBaby = getValueOrDefault(Boolean, options?.isBaby);
    obj.region = getValueOrDefault(String, options?.region, regionList[0]);
    obj.version = getValueOrDefault(
      String,
      options?.version,
      versionList[versionList.length - 1].toLowerCase().replaceAll(' ', '-')
    );
    obj.baseSpecies = capitalize(pokemon.pokemonId);
    obj.form = pokemon.form ? pokemon.form.toString() : formNormal();
    obj.encounter = pokemon.encounter;
    obj.hasShadowForm = Boolean(pokemon.shadow);
    obj.formChange = pokemon.formChange;

    obj.quickMoves = UniqValueInArray(pokemon.quickMoves?.map((move) => replaceTempMoveName(move)));
    obj.cinematicMoves = UniqValueInArray(pokemon.cinematicMoves?.map((move) => replaceTempMoveName(move)));
    obj.eliteQuickMoves = UniqValueInArray(pokemon.eliteQuickMove?.map((move) => replaceTempMoveName(move)));
    obj.eliteCinematicMoves = UniqValueInArray(pokemon.eliteCinematicMove?.map((move) => replaceTempMoveName(move)));
    obj.specialMoves = UniqValueInArray(pokemon.obSpecialAttackMoves?.map((move) => replaceTempMoveName(move)));
    obj.exclusiveMoves = UniqValueInArray(pokemon.nonTmCinematicMoves?.map((move) => replaceTempMoveName(move)));
    obj.shadowMoves = UniqValueInArray(options?.shadowMoves?.map((move) => replaceTempMoveName(move)));
    obj.purifiedMoves = UniqValueInArray(options?.purifiedMoves?.map((move) => replaceTempMoveName(move)));

    obj.evoList = options?.evoList;
    obj.tempEvo = options?.tempEvo;
    obj.purified = options?.purified;
    obj.thirdMove = options?.thirdMove;

    obj.pokemonType = pokemon.pokemonType;
    return obj;
  }
}

export class PokemonModel implements IPokemonName {
  id: number;
  name: string;

  constructor(id: string | number | undefined, name?: string) {
    this.id = toNumber(id);
    this.name = getValueOrDefault(String, name);
  }
}

export class PokemonDataModel {
  form?: string | number;
  disableTransferToPokemonHome?: boolean | undefined;
  pokemonClass: string | undefined;
  formChange?: IPokemonFormChange[] | undefined;
  tempEvoOverrides?: TempEvoOverrides[] | undefined;
  pokemonId = '';
  modelScale = 0;
  type?: string | undefined;
  type2?: string | undefined;
  camera?: Camera;
  encounter?: IEncounter;
  stats?: IStatsGO | undefined;
  quickMoves?: (string | number)[] | undefined;
  cinematicMoves?: (string | number)[] | undefined;
  animationTime: number[] = [];
  evolutionIds?: string[] | undefined;
  evolutionPips = 0;
  pokedexHeightM = 0;
  pokedexWeightKg = 0;
  heightStdDev = 0;
  weightStdDev = 0;
  familyId = '';
  candyToEvolve = 0;
  kmBuddyDistance = 0;
  modelHeight = 0;
  parentPokemonId?: string | undefined;
  evolutionBranch?: EvolutionBranch[] | undefined;
  modelScaleV2 = 0;
  buddyOffsetMale: number[] = [];
  buddyOffsetFemale: number[] = [];
  buddyScale = 0;
  thirdMove?: ThirdMove | undefined;
  isTransferable = false;
  isDeployable = false;
  isTradable = false;
  shadow?: ShadowSetting | undefined;
  buddyGroupNumber = 0;
  buddyWalkedMegaEnergyAward = 0;
  nonTmCinematicMoves?: (string | number)[] | undefined;
  obSpecialAttackMoves?: (string | number)[] | undefined;
  eliteQuickMove?: (string | number)[] | undefined;
  eliteCinematicMove?: (string | number)[] | undefined;
  id = 0;
  name = '';
  isForceReleaseGO?: boolean | undefined;
  pokemonType = PokemonType.Normal;
  types: string[] | undefined;

  static create(id: string | number | undefined, name?: string, settings?: PokemonModel) {
    const obj = new PokemonDataModel();
    obj.id = toNumber(id);
    obj.name = convertPokemonDataName(name);
    if (settings) {
      Object.assign(obj, { ...settings });
    }
    return obj;
  }
}

export interface IPokemonProgress {
  isLoadedForms: boolean;
}

export class PokemonProgress implements IPokemonProgress {
  isLoadedForms = false;

  static create(value: IPokemonProgress) {
    const obj = new PokemonProgress();
    Object.assign(obj, value);
    return obj;
  }
}

interface IPokemonVariety {
  isDefault: boolean;
  path: string;
  name: string;
}

class PokemonVariety implements IPokemonVariety {
  isDefault = false;
  path = '';
  name = '';

  static create(value: Variety) {
    const obj = new PokemonVariety();
    obj.isDefault = value.is_default;
    obj.path = value.pokemon.url;
    obj.name = value.pokemon.name;
    return obj;
  }
}

export interface IPokemonSpecie {
  evolutionChainPath?: string;
  generation: number;
  hasGenderDifferences: boolean;
  id: number;
  isBaby: boolean;
  isLegendary: boolean;
  isMythical: boolean;
  name: string;
  order: number;
  varieties: PokemonVariety[];
}

export class PokemonSpecie implements IPokemonSpecie {
  evolutionChainPath?: string;
  generation = 0;
  hasGenderDifferences = false;
  id = 0;
  isBaby = false;
  isLegendary = false;
  isMythical = false;
  name = '';
  order = 0;
  varieties: IPokemonVariety[] = [];

  static create(value: Species) {
    const obj = new PokemonSpecie();
    obj.evolutionChainPath = value.evolution_chain.url;
    obj.generation = getGenerationPokemon(value.generation.url);
    obj.hasGenderDifferences = value.has_gender_differences;
    obj.id = value.id;
    obj.isBaby = value.is_baby;
    obj.isLegendary = value.is_legendary;
    obj.isMythical = value.is_mythical;
    obj.name = value.name;
    obj.order = value.order;
    obj.varieties = value.varieties.map((v) => PokemonVariety.create(v));
    return obj;
  }
}

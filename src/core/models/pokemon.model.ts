import { capitalize, getPokemonClass, replaceTempMoveName } from '../../util/utils';
import { ICombat } from './combat.model';
import { DEFAULT_SPRITE_NAME, FORM_GALAR, FORM_HISUI, FORM_NORMAL, genList } from '../../util/constants';
import { IStatsBase, IStatsPokemon, IStatsPokemonGO, StatsPokemon, StatsPokemonGO } from './stats.model';
import { ISelectMoveModel } from '../../components/Input/models/select-move.model';
import { IEvoList, IPokemonTypeCost, ITempEvo } from './evolution.model';
import { getValueOrDefault, isUndefined, toNumber } from '../../util/extension';
import { ItemEvolutionType, ItemLureType } from '../enums/option.enum';
import { MoveType, PokemonClass, PokemonType } from '../../enums/type.enum';

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
  iv: IStatsBase;
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
  quickMoves?: MoveReassignType[];
  cinematicMoves?: MoveReassignType[];
}

interface IPokemonFormChange {
  availableForm: string[];
  candyCost: string;
  stardustCost: string;
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

interface IThirdMove {
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
  form?: string | number | null;
  disableTransferToPokemonHome?: boolean;
  pokemonClass: string | null | undefined;
  formChange?: IPokemonFormChange[];
  tempEvoOverrides?: TempEvoOverrides[];
  pokemonId: string;
  modelScale: number;
  type: string;
  type2: string;
  camera: Camera;
  encounter: IEncounter;
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
  thirdMove?: IThirdMove;
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
  statsGO?: IStatsPokemonGO;
  heightM: number;
  weightKg: number;
  color: string;
  evos: string[];
  baseForme: string | undefined | null;
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
  pokemonClass: PokemonClass;
  disableTransferToPokemonHome: boolean | null;
  isBaby: boolean;
  gen: number;
  region: string | null;
  version: string | null;
  baseStatsGO?: boolean;
  stats?: IPokemonDataStats | null;
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
  baseForme?: string | null;
  releasedGO?: boolean;
  isBaby?: boolean;
  region?: string | null;
  version?: string | null;
  shadowMoves?: string[];
  purifiedMoves?: string[];
  evoList?: IEvoList[];
  tempEvo?: ITempEvo[];
  purified?: IPokemonTypeCost;
  thirdMove?: IPokemonTypeCost;
}

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
  purified?: IPokemonTypeCost;
  thirdMove?: IPokemonTypeCost;

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
  evos: string[] = [];
  baseForme: string | undefined | null;
  prevo: string | null = null;
  baseSpecies: string | null = null;
  forme: string | null = null;
  releasedGO = false;
  isTransferable?: boolean | null;
  isDeployable = false;
  isTradable = false;
  pokemonClass = PokemonClass.None;
  disableTransferToPokemonHome = false;
  isBaby = false;
  gen = 0;
  region: string | null = null;
  version: string | null = null;
  baseStatsGO?: boolean;
  stats?: IPokemonDataStats | null;
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
  baseFormeAlias = '';
  baseFormeSlug = '';
  baseFormeSprite = '';
  cosmeticFormes: string[] = [];
  cosmeticFormesAliases: string[] = [];
  cosmeticFormesSprites: string[] = [];
  otherFormes: string[] = [];
  otherFormesAliases: string[] = [];
  otherFormesSprites: string[] = [];
  formeOrder: string[] = [];
  canGigantamax: string | null = null;
  changesFrom: string | null = null;
  cannotDynamax = true;
  pokemonType = PokemonType.Normal;

  static create(pokemon: PokemonModel, types: string[] | undefined, options?: IPokemonDataOptional) {
    const obj = new PokemonData();
    Object.entries(genList).forEach(([key, value]) => {
      const [minId, maxId] = value;
      if (pokemon.id >= minId && pokemon.id <= maxId) {
        obj.gen = toNumber(key);
        return;
      }
    });
    obj.pokemonId = pokemon.pokemonId;
    obj.num = pokemon.id;
    obj.name = capitalize(pokemon.name.replaceAll('_', '-'));
    if (pokemon.id !== 201) {
      obj.fullName =
        pokemon.form && pokemon.pokemonType !== PokemonType.Normal ? `${pokemon.pokemonId}_${pokemon.form}` : pokemon.pokemonId;
    } else {
      obj.fullName = getValueOrDefault(String, pokemon.form?.toString());
    }
    obj.slug =
      options?.slug ??
      pokemon.name
        .replace(`_${FORM_GALAR}IAN`, `_${FORM_GALAR}`)
        .replace(`_${FORM_HISUI}AN`, `_${FORM_HISUI}`)
        .replaceAll('_', '-')
        .toLowerCase();
    obj.sprite = getValueOrDefault(String, options?.sprite, DEFAULT_SPRITE_NAME);
    obj.types = getValueOrDefault(Array, types);
    obj.genderRatio = PokemonGenderRatio.create(toNumber(options?.genderRatio?.M, 0.5), toNumber(options?.genderRatio?.F, 0.5));
    obj.baseStatsGO = isUndefined(options?.baseStatsGO) ? true : options.baseStatsGO;
    obj.baseStats = StatsPokemon.create({
      atk: toNumber(pokemon.stats?.baseAttack),
      def: toNumber(pokemon.stats?.baseDefense),
      sta: pokemon.stats?.baseStamina,
    });
    const sta = toNumber(obj.baseStats.sta);
    obj.statsGO = StatsPokemonGO.create({
      atk: obj.baseStats.atk,
      def: obj.baseStats.def,
      sta,
      prod: obj.baseStats.atk * obj.baseStats.def * sta,
    });
    obj.heightM = pokemon.pokedexHeightM;
    obj.weightKg = pokemon.pokedexWeightKg;
    obj.color = getValueOrDefault(String, options?.color, 'None');
    obj.evos = getValueOrDefault(
      Array,
      pokemon.evolutionIds?.map((name) => capitalize(name))
    );
    obj.baseForme = options?.baseForme;
    obj.prevo = capitalize(pokemon.parentPokemonId);
    obj.releasedGO = getValueOrDefault(Boolean, options?.releasedGO);
    obj.isTransferable = pokemon.isTransferable;
    obj.isDeployable = pokemon.isDeployable;
    obj.isTradable = pokemon.isTradable;
    obj.pokemonClass = getPokemonClass(pokemon.pokemonClass);
    obj.disableTransferToPokemonHome = getValueOrDefault(Boolean, pokemon.disableTransferToPokemonHome);
    obj.isBaby = getValueOrDefault(Boolean, options?.isBaby);
    obj.region = getValueOrDefault(String, options?.region, 'Unknown');
    obj.version = getValueOrDefault(String, options?.version, 'scarlet-violet');
    obj.baseSpecies = capitalize(pokemon.pokemonId);
    obj.forme = pokemon.form ? pokemon.form.toString() : FORM_NORMAL;
    obj.encounter = pokemon.encounter;
    obj.hasShadowForm = Boolean(pokemon.shadow);
    obj.formChange = pokemon.formChange;

    obj.quickMoves = pokemon.quickMoves?.map((move) => replaceTempMoveName(move));
    obj.cinematicMoves = pokemon.cinematicMoves?.map((move) => replaceTempMoveName(move));
    obj.eliteQuickMoves = pokemon.eliteQuickMove?.map((move) => replaceTempMoveName(move));
    obj.eliteCinematicMoves = pokemon.eliteCinematicMove?.map((move) => replaceTempMoveName(move));
    obj.specialMoves = pokemon.obSpecialAttackMoves?.map((move) => replaceTempMoveName(move));
    obj.exclusiveMoves = pokemon.nonTmCinematicMoves?.map((move) => replaceTempMoveName(move));
    obj.shadowMoves = options?.shadowMoves?.map((move) => replaceTempMoveName(move));
    obj.purifiedMoves = options?.purifiedMoves?.map((move) => replaceTempMoveName(move));

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

  constructor(id: string | number | undefined, name?: string | null, settings?: PokemonModel) {
    this.id = toNumber(id);
    this.name = getValueOrDefault(String, name);
    if (settings) {
      Object.assign(this, { ...settings });
    }
  }
}

export interface IWeightHeight {
  weight: number;
  height: number;
}

export class WeightHeight implements IWeightHeight {
  weight = -1;
  height = -1;

  static create(value: IWeightHeight) {
    const obj = new WeightHeight();
    Object.assign(obj, value);
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

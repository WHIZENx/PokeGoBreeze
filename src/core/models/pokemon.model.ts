import { capitalize, replaceTempMoveName } from '../../util/utils';
import { ICombat } from './combat.model';
import { FORM_GALARIAN, FORM_HISUIAN, FORM_NORMAL, genList } from '../../util/constants';
import { IStatsBase, IStatsPokemon, IStatsPokemonGO, StatsPokemon, StatsPokemonGO } from './stats.model';
import { ISelectMoveModel } from '../../components/Input/models/select-move.model';
import { IEvoList, IPokemonTypeCost, ITempEvo } from './evolution.model';
import { getValueOrDefault, isUndefined } from '../../util/extension';

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
  isShadow: boolean;
  iv: IStatsBase;
}

interface ComponentPokemonSettings {
  pokedexId: string;
  componentCandyCost: number;
  formChangeType: string;
}

interface IPokemonFormChange {
  availableForm: string[];
  candyCost: string;
  stardustCost: string;
  item?: string;
  itemCostCount?: number;
  componentPokemonSettings?: ComponentPokemonSettings;
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
  lureItemRequirement: string;
  evolutionItemRequirement: string;
  onlyUpsideDown: boolean;
  questDisplay: QuestDisplay[];
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

interface IStatsGO {
  baseStamina: number;
  baseAttack: number;
  baseDefense: number;
}

// tslint:disable-next-line:max-classes-per-file
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
  obSpecialAttackMoves?: string[];
  eliteQuickMove?: string[];
  eliteCinematicMove?: string[];
  form?: string | null;
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
  quickMoves?: string[];
  cinematicMoves?: string[];
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
  statsGO?: IStatsPokemonGO;
  heightm: number;
  weightkg: number;
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
  pokemonClass: string | undefined | null;
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
  purified?: IPokemonTypeCost;
  thirdMove?: IPokemonTypeCost;
  encounter?: IEncounter;
}

export interface IPokemonName {
  id: number;
  name: string;
}

export interface Elite {
  fMove: boolean;
  cMove: boolean;
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
  shadow?: boolean;
  purified?: boolean;
  mShadow?: boolean;
  elite?: Elite;
  atk?: number;
  def?: number;
  hp?: number;
  timer?: number;
  defHpRemain?: number;
  atkHpRemain?: number;
  special?: boolean;
}

// tslint:disable-next-line:max-classes-per-file
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
  shadow?: boolean;
  purified?: boolean;
  mShadow?: boolean;
  elite?: Elite;
  atk?: number;
  def?: number;
  hp?: number;
  timer?: number;
  defHpRemain?: number;
  atkHpRemain?: number;
  special?: boolean;

  static create(value: IPokemonDPSBattle) {
    const obj = new PokemonDPSBattle();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IPokemonMoveData extends IPokemonDPSBattle {
  trainerId?: number;
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonMoveData implements IPokemonMoveData {
  trainerId?: number;
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
  shadow?: boolean;
  purified?: boolean;
  mShadow?: boolean;
  elite?: Elite;
  atk?: number;
  def?: number;
  hp?: number;
  timer?: number;
  defHpRemain?: number;
  atkHpRemain?: number;
  special?: boolean;

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

// tslint:disable-next-line:max-classes-per-file
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
  purified?: IPokemonTypeCost;
  thirdMove?: IPokemonTypeCost;

  constructor({ ...props }: IPokemonDataOptional) {
    Object.assign(this, props);
  }
}

// tslint:disable-next-line:max-classes-per-file
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
  statsGO? = new StatsPokemonGO();
  heightm = 0;
  weightkg = 0;
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
  pokemonClass: string | undefined | null;
  disableTransferToPokemonHome = false;
  isBaby = false;
  gen = 0;
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
  cannotDynamax = false;

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
    if (pokemon.id !== 201) {
      obj.fullName = pokemon.form && pokemon.form !== FORM_NORMAL ? `${pokemon.pokemonId}_${pokemon.form}` : pokemon.pokemonId;
    } else {
      obj.fullName = getValueOrDefault(String, pokemon.form);
    }
    obj.slug =
      options?.slug ??
      pokemon.name.replace(`_${FORM_GALARIAN}`, '_GALAR').replace(`_${FORM_HISUIAN}`, '_HISUI').replaceAll('_', '-').toLowerCase();
    obj.sprite = options?.sprite ?? 'unknown-pokemon';
    obj.types = types;
    obj.genderRatio = PokemonGenderRatio.create(
      getValueOrDefault(Number, options?.genderRatio?.M, 0.5),
      getValueOrDefault(Number, options?.genderRatio?.F, 0.5)
    );
    obj.baseStatsGO = isUndefined(options?.baseStatsGO) ? true : options?.baseStatsGO;
    obj.baseStats = StatsPokemon.create({
      atk: getValueOrDefault(Number, pokemon.stats?.baseAttack),
      def: getValueOrDefault(Number, pokemon.stats?.baseDefense),
      sta: getValueOrDefault(Number, pokemon.stats?.baseStamina),
    });
    obj.statsGO = StatsPokemonGO.create({
      atk: obj.baseStats.atk,
      def: obj.baseStats.def,
      sta: getValueOrDefault(Number, obj.baseStats.sta),
      prod: obj.baseStats.atk * obj.baseStats.def * getValueOrDefault(Number, obj.baseStats.sta),
    });
    obj.heightm = pokemon.pokedexHeightM;
    obj.weightkg = pokemon.pokedexWeightKg;
    obj.color = options?.color ?? 'None';
    obj.evos = pokemon.evolutionIds ? pokemon.evolutionIds.map((name) => capitalize(name)) : [];
    obj.baseForme = options?.baseForme;
    obj.prevo = capitalize(getValueOrDefault(String, pokemon.parentPokemonId));
    obj.releasedGO = getValueOrDefault(Boolean, options?.releasedGO);
    obj.isTransferable = pokemon.isTransferable;
    obj.isDeployable = pokemon.isDeployable;
    obj.isTradable = pokemon.isTradable;
    obj.pokemonClass = pokemon.pokemonClass?.replace('POKEMON_CLASS_', '');
    obj.disableTransferToPokemonHome = getValueOrDefault(Boolean, pokemon.disableTransferToPokemonHome);
    obj.isBaby = getValueOrDefault(Boolean, options?.isBaby);
    obj.region = options?.region ?? 'Unknown';
    obj.version = options?.version ?? 'scarlet-violet';
    obj.baseSpecies = capitalize(pokemon.pokemonId);
    obj.forme = pokemon.form ? pokemon.form : FORM_NORMAL;
    obj.encounter = pokemon.encounter;
    obj.isShadow = pokemon.shadow ? true : false;
    obj.formChange = getValueOrDefault(Array, pokemon.formChange);

    obj.quickMoves = getValueOrDefault(
      Array,
      pokemon.quickMoves?.map((move) => replaceTempMoveName(move.toString()))
    );
    obj.cinematicMoves = getValueOrDefault(
      Array,
      pokemon.cinematicMoves?.map((move) => replaceTempMoveName(move.toString()))
    );
    obj.eliteQuickMove = getValueOrDefault(
      Array,
      pokemon.eliteQuickMove?.map((move) => replaceTempMoveName(move.toString()))
    );
    obj.eliteCinematicMove = getValueOrDefault(
      Array,
      pokemon.eliteCinematicMove?.map((move) => replaceTempMoveName(move.toString()))
    );
    obj.specialMoves = getValueOrDefault(
      Array,
      pokemon.obSpecialAttackMoves?.map((move) => replaceTempMoveName(move.toString()))
    );
    obj.shadowMoves = getValueOrDefault(
      Array,
      options?.shadowMoves?.map((move) => replaceTempMoveName(move.toString()))
    );
    obj.purifiedMoves = getValueOrDefault(
      Array,
      options?.purifiedMoves?.map((move) => replaceTempMoveName(move.toString()))
    );

    obj.evoList = getValueOrDefault(Array, options?.evoList);
    obj.tempEvo = getValueOrDefault(Array, options?.tempEvo);
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
    this.name = getValueOrDefault(String, name);
    if (settings) {
      Object.assign(this, { ...settings });
    }
  }
}

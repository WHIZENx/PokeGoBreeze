import { PokemonType } from '../../enums/type.enum';
import { DynamicObj } from '../../utils/extension';
import { getPokemonType } from '../../utils/utils';
import { ConditionType, LeagueConditionType, QuestType } from '../enums/option.enum';
import { Cost, IBonusEffect } from './combat.model';
import { LeagueReward, SettingLeague } from './league.model';
import { PokemonDataModel } from './pokemon.model';
import { IStatsPokemonGO, StatsPokemonGO } from './stats.model';

interface CombatSetting {
  sameTypeAttackBonusMultiplier: number;
  shadowPokemonAttackBonusMultiplier: number;
  shadowPokemonDefenseBonusMultiplier: number;
  chargeScoreBase: number;
  chargeScoreNice: number;
  chargeScoreGreat: number;
  chargeScoreExcellent: number;
  maxEnergy: number;
  purifiedPokemonAttackMultiplierVsShadow: number;
}

interface BattleSetting {
  enemyAttackInterval: number;
  sameTypeAttackBonusMultiplier: number;
  shadowPokemonAttackBonusMultiplier: number;
  shadowPokemonDefenseBonusMultiplier: number;
  maximumEnergy: number;
  dodgeDamageReductionPercent: number;
  purifiedPokemonAttackMultiplierVsShadow: number;
}

interface BuddyLevelSetting {
  level: string;
  minNonCumulativePointsRequired: number;
  unlockedTraits: string[];
}

interface FriendshipMilestoneSetting {
  minPointsToReach: number;
  milestoneXpReward: number;
  attackBonusPercentage: number;
  unlockedTrading: string[];
}

interface TypeEffective {
  attackScalar: number[];
  attackType: string;
}

interface WeatherAffinity {
  weatherCondition: string;
  pokemonType: string[];
}

interface Gender {
  malePercent: number;
  femalePercent: number;
}

interface GenderSetting {
  pokemon: string;
  gender?: Gender;
}

interface Form {
  assetBundleSuffix?: string;
  isCostume?: boolean;
  form: string;
}

interface FormSetting {
  pokemon: string;
  forms: Form[];
}

interface PokemonFamily {
  familyId: string;
  candyPerXlCandy: number;
  megaEvolvablePokemonId?: string;
}

interface IapItemDisplay {
  sku: string;
  category: string;
  sortOrder: number;
  hidden: boolean;
  spriteId: string;
  title: string;
  description?: string;
  skuEnableTime?: Date;
  skuDisableTime?: Date;
  skuEnableTimeUtcMs?: number;
  skuDisableTimeUtcMs?: number;
  imageUrl?: string;
  sale?: boolean;
}

interface StickerMetadata {
  stickerId: string;
  maxCount: number;
  stickerUrl?: string;
  pokemonId?: string;
  category: string[];
  releaseDate: number;
  regionId: number;
}

export interface MoveBuff {
  attackerAttackStatStageChange?: number;
  attackerDefenseStatStageChange?: number;
  targetAttackStatStageChange?: number;
  targetDefenseStatStageChange?: number;
  buffActivationChance: number;
}

interface CombatMove {
  uniqueId: string | number;
  type: string;
  power: number;
  energyDelta: number;
  vfxName: string;
  buffs?: MoveBuff;
}

export interface MoveSetting {
  movementId: string | number;
  animationId: number;
  pokemonType: string;
  power?: number;
  accuracyChance: number;
  criticalChance?: number;
  staminaLossScalar: number;
  trainerLevelMin: number;
  trainerLevelMax: number;
  vfxName: string;
  durationMs: number;
  damageWindowStartMs: number;
  damageWindowEndMs: number;
  energyDelta?: number;
}

interface MoveSequenceSetting {
  sequence: string[];
}

interface VsSeekerClientSetting {
  allowedVsSeekerLeagueTemplateId: string[];
}

interface IPokemonFromReward {
  form: string;
}

class PokemonFromReward implements IPokemonFromReward {
  form = '';
}

export interface IPokemonReward {
  pokemonId: string;
  pokemonDisplay: IPokemonFromReward;
}

export class PokemonReward implements IPokemonReward {
  pokemonId = '';
  pokemonDisplay = new PokemonFromReward();
}

interface GuaranteedLimitedPokemonReward {
  pokemon: IPokemonReward;
}

interface RangeOverride {
  max: number;
  min?: number;
}

interface IvOverride {
  range: RangeOverride;
}

interface AvailablePokemon {
  unlockedAtRank: number;
  guaranteedLimitedPokemonReward?: GuaranteedLimitedPokemonReward;
  pokemon: IPokemonReward;
  attackIvOverride: IvOverride;
  defenseIvOverride: IvOverride;
  staminaIvOverride: IvOverride;
}

interface VsSeekerPokemonReward {
  availablePokemon: AvailablePokemon[];
}

interface CombatCompetitiveSeasonSetting {
  seasonEndTimeTimestamp: string[];
  ratingAdjustmentPercentage: number;
  rankingAdjustmentPercentage: number;
}

interface RequiredForReward {
  rankLevel: number;
  additionalTotalBattlesRequired: number;
}

interface CombatRankingProtoSetting {
  rankLevel: SettingLeague[];
  requiredForRewards: RequiredForReward;
  minRankToDisplayRating: number;
  minRatingRequired: number;
}

interface VsSeekerLoot {
  rankLevel: number;
  reward: LeagueReward[];
  rewardTrack?: string;
}

interface PokemonConditionPermission {
  pokemon: IPokemonPermission[];
}

interface PokemonCaughtTimestamp {
  afterTimestamp: number;
  beforeTimestamp: number;
}

interface WithPokemonType {
  pokemonType: string[];
}

interface PokemonLevelRange {
  maxLevel: number;
}

interface WithPokemonCpLimit {
  maxCp: number;
}

interface PokemonCondition {
  pokemonBanList?: PokemonConditionPermission;
  type: LeagueConditionType;
  pokemonCaughtTimestamp?: PokemonCaughtTimestamp;
  withPokemonType?: WithPokemonType;
  pokemonLevelRange?: PokemonLevelRange;
  withPokemonCpLimit?: WithPokemonCpLimit;
  pokemonWhiteList?: PokemonConditionPermission;
}

interface CombatLeague {
  title?: string;
  enabled: boolean;
  pokemonCondition: PokemonCondition[];
  iconUrl: string;
  badgeType: string | undefined;
  bannedPokemon: string[];
  pokemonCount: number;
  leagueType: string;
  battlePartyCombatLeagueTemplateId?: string;
  allowTempEvos?: boolean;
}

interface EvolutionQuestTemplate {
  questTemplateId: string;
  questType: QuestType;
  goals: EvolutionGoal[];
}

interface EvolutionInfo {
  pokemon: string;
  form?: string;
}

export interface EvolutionChainData {
  headerMessage?: string;
  evolutionInfos: EvolutionInfo[];
}

interface EvolutionChainDisplaySettings {
  pokemon: string;
  evolutionChains?: EvolutionChainData[];
}

interface IconRewardItem {
  item: string | number;
  amount?: number;
}

interface IconRewardPokemonDisplay {
  costume: string;
  form?: string;
}

interface IconRewardPokemon {
  pokemonId: string;
  pokemonDisplay?: IconRewardPokemonDisplay;
}

interface NeutralAvatarItem {
  neutralAvatarItemTemplateString1: string;
  neutralAvatarItemTemplateString2: string;
}

interface IconCandyReward {
  pokemonId: string;
  amount: number;
}

interface IconReward {
  type: string;
  item?: IconRewardItem;
  pokemonEncounter?: IconRewardPokemon;
  stardust?: number;
  pokecoin?: number;
  exp?: number;
  avatarTemplateId?: string;
  neutralAvatarItemTemplate?: NeutralAvatarItem;
  candy?: IconCandyReward;
}

export interface GlobalEventTicket {
  eventStartTime: string;
  eventEndTime: string;
  itemBagDescriptionKey: string;
  eventBannerUrl: string;
  clientEventStartTimeUtcMs: string;
  clientEventEndTimeUtcMs: string;
  ticketItem?: string;
  giftable?: boolean;
  giftItem?: string;
  displayV2Enabled?: boolean;
  backgroundImageUrl?: string;
  titleImageUrl?: string;
  eventDatetimeRangeKey?: string;
  textRewardsKey?: string;
  iconRewards?: IconReward[];
  detailsLinkKey?: string;
}

export interface ItemSettings {
  itemId: string;
  itemType: string;
  category: string;
  globalEventTicket: GlobalEventTicket;
  ignoreInventorySpace?: boolean;
  nameOverride?: string;
  descriptionOverride?: string;
}

export interface PlayerLevel {
  rankNum: number[];
  requiredExperience: number[];
  cpMultiplier: number[];
  maxEncounterPlayerLevel: number;
  maxQuestEncounterPlayerLevel: number;
}

export interface LevelUpRewardSettings {
  level: number;
  items: string[];
  itemsCount: number[];
  itemsUnlocked?: string[];
}

interface MoveMapping {
  pokemonId: string;
  form: string;
  move: string;
}

interface SourdoughMoveMappingSettings {
  mappings: MoveMapping[];
}

interface NonCombatMoveSettings {
  uniqueId: string;
  cost: Cost;
  bonusEffect: IBonusEffect;
  durationMs: string;
  bonusType: string | number;
  enableMultiUse?: boolean;
  extraDurationMs: string;
  enableNonCombatMove?: boolean;
}

interface DataGM {
  pokemonSettings: PokemonDataModel;
  combatSettings: CombatSetting;
  battleSettings: BattleSetting;
  buddyLevelSettings: BuddyLevelSetting;
  friendshipMilestoneSettings: FriendshipMilestoneSetting;
  typeEffective: TypeEffective;
  weatherAffinities: WeatherAffinity;
  genderSettings: GenderSetting;
  formSettings: FormSetting;
  pokemonFamily: PokemonFamily;
  iapItemDisplay: IapItemDisplay;
  stickerMetadata: StickerMetadata;
  combatMove: CombatMove;
  moveSettings: MoveSetting;
  moveSequenceSettings: MoveSequenceSetting;
  smeargleMovesSettings: PokemonDataModel;
  vsSeekerClientSettings: VsSeekerClientSetting;
  vsSeekerPokemonRewards: VsSeekerPokemonReward;
  combatCompetitiveSeasonSettings: CombatCompetitiveSeasonSetting;
  combatRankingProtoSettings: CombatRankingProtoSetting;
  vsSeekerLoot: VsSeekerLoot;
  combatLeague?: CombatLeague;
  evolutionQuestTemplate?: EvolutionQuestTemplate;
  evolutionChainDisplaySettings: EvolutionChainDisplaySettings;
  itemSettings?: ItemSettings;
  playerLevel: PlayerLevel;
  levelUpRewardSettings: LevelUpRewardSettings;
  sourdoughMoveMappingSettings?: SourdoughMoveMappingSettings;
  nonCombatMoveSettings?: NonCombatMoveSettings;
}

export interface PokemonDataGM {
  templateId: string;
  data: DataGM;
}

interface EvolutionGoal {
  condition?: EvolutionCondition[];
  target: number;
}

interface WithPokemonType {
  pokemonType: string[];
}

interface WithThrowType {
  throwType: string;
}

interface OpponentPokemonBattleStatus {
  requireDefeat: boolean;
  opponentPokemonType: string[];
}

interface EvolutionCondition {
  type: ConditionType;
  withPokemonType?: WithPokemonType;
  withThrowType?: WithThrowType;
  withOpponentPokemonBattleStatus?: OpponentPokemonBattleStatus;
}

export interface IPokemonPermission {
  id: number | undefined;
  form?: string;
  forms?: string[];
  name: string | undefined;
  pokemonType: PokemonType;
}

export class PokemonPermission implements IPokemonPermission {
  id: number | undefined;
  form = '';
  forms?: string[];
  name: string | undefined;
  pokemonType = PokemonType.Normal;

  constructor({ ...props }: IPokemonPermission) {
    props.pokemonType = getPokemonType(props.form);
    Object.assign(this, props);
  }
}

interface PlayerLevelUp {
  level: number;
  amount: number;
  requiredExp: number;
}

interface IPlayerSetting {
  levelUps: PlayerLevelUp[];
  cpMultipliers: DynamicObj<number>;
  maxEncounterPlayerLevel: number;
  maxQuestEncounterPlayerLevel: number;
}

export class PlayerSetting implements IPlayerSetting {
  levelUps: PlayerLevelUp[] = [];
  cpMultipliers: DynamicObj<number> = {};
  maxEncounterPlayerLevel = 0;
  maxQuestEncounterPlayerLevel = 0;
}

interface ICombatOption {
  stab: number;
  shadowBonus: IStatsPokemonGO;
  purifiedBonus: IStatsPokemonGO;
  maxEnergy: number;
}

class CombatOption implements ICombatOption {
  stab = 0;
  shadowBonus = new StatsPokemonGO();
  purifiedBonus = new StatsPokemonGO();
  maxEnergy = 0;
}

interface IBattleOption {
  enemyAttackInterval: number;
  stab: number;
  shadowBonus: IStatsPokemonGO;
  purifiedBonus: IStatsPokemonGO;
  maxEnergy: number;
  dodgeDamageReductionPercent: number;
}

class BattleOption implements IBattleOption {
  enemyAttackInterval = 0;
  stab = 0;
  shadowBonus = new StatsPokemonGO();
  purifiedBonus = new StatsPokemonGO();
  maxEnergy = 0;
  dodgeDamageReductionPercent = 0;
}

interface IThrowOption {
  normal: number;
  nice: number;
  great: number;
  excellent: number;
}

export class ThrowOption implements IThrowOption {
  normal = 0;
  nice = 0;
  great = 0;
  excellent = 0;
}

export interface IBuddyFriendship {
  level: number;
  minNonCumulativePointsRequired: number;
  unlockedTrading?: string[];
}

export class BuddyFriendship implements IBuddyFriendship {
  level = 0;
  minNonCumulativePointsRequired = 0;
}

export interface ITrainerFriendship {
  level: number;
  atkBonus: number;
  unlockedTrading?: string[];
}

export class TrainerFriendship implements ITrainerFriendship {
  level = 0;
  atkBonus = 0;
}

interface IConfig {
  lightThemeBg: string;
  darkThemeBg: string;
  persistkey: string;
  persisttimeout: number;
  battleDelay: number;
  loadDataDelay: number;
  counterDelay: number;
  statsDelay: number;
  keyEnter: number;
  keyLeft: number;
  keyUp: number;
  keyRight: number;
  keyDown: number;
  syncMsg: string;
  pathAssetPokego: string;
  defaultSpriteName: string;
  transitionTime: string;
  formNormal: string;
  formSpecial: string;
  formShadow: string;
  formPurified: string;
  formMega: string;
  formGmax: string;
  formPrimal: string;
  formAlola: string;
  formHisui: string;
  formGalar: string;
  formGalarian: string;
  formHisuian: string;
  formAlolan: string;
  formHero: string;
  formStandard: string;
  formIncarnate: string;
  formArmor: string;
  formMegaX: string;
  formMegaY: string;
  classLegendary: string;
  classMythic: string;
  classUltraBeast: string;
  defaultSheetPage: number;
  defaultSheetRow: number;
  defaultPokemonDefObj: number;
  defaultPokemonShadow: boolean;
  defaultTrainerFriend: boolean;
  defaultWeatherBoosts: boolean;
  defaultPokemonFriendLevel: number;
  defaultPokemonLevel: number;
  defaultEnergyPerHpLost: number;
  defaultDamageMultiply: number;
  defaultDamageConst: number;
  defaultEnemyAtkDelay: number;
  defaultTrainerMultiply: number;
  defaultMegaMultiply: number;
  curveIncChance: number;
  platinumIncChance: number;
  goldIncChance: number;
  silverIncChance: number;
  bronzeIncChance: number;
  pokeBallIncChance: number;
  greatBallIncChance: number;
  ultraBallIncChance: number;
  razzBerryIncChance: number;
  silverPinapsIncChance: number;
  goldRazzBerryIncChance: number;
  normalThrowIncChance: number[];
  niceThrowIncChance: number[];
  greatThrowIncChance: number[];
  excellentThrowIncChance: number[];
  minCp: number;
  cpDiffRatio: number;
  minLevel: number;
  maxLevel: number;
  minIv: number;
  maxIv: number;
  defaultSize: number;
  defaultPlusSize: number;
  defaultAmount: number;
  defaultBlock: number;
}

export class Config implements IConfig {
  lightThemeBg = '';
  darkThemeBg = '';
  persistkey = '';
  persisttimeout = 0;
  battleDelay = 0;
  loadDataDelay = 0;
  counterDelay = 0;
  statsDelay = 0;
  keyEnter = 0;
  keyLeft = 0;
  keyUp = 0;
  keyRight = 0;
  keyDown = 0;
  syncMsg = '';
  pathAssetPokego = '';
  defaultSpriteName = '';
  transitionTime = '';
  formNormal = '';
  formSpecial = '';
  formShadow = '';
  formPurified = '';
  formMega = '';
  formGmax = '';
  formPrimal = '';
  formAlola = '';
  formHisui = '';
  formGalar = '';
  formGalarian = '';
  formHisuian = '';
  formAlolan = '';
  formHero = '';
  formStandard = '';
  formIncarnate = '';
  formArmor = '';
  formMegaX = '';
  formMegaY = '';
  classLegendary = '';
  classMythic = '';
  classUltraBeast = '';
  defaultSheetPage = 0;
  defaultSheetRow = 0;
  defaultPokemonDefObj = 0;
  defaultPokemonShadow = false;
  defaultTrainerFriend = false;
  defaultWeatherBoosts = false;
  defaultPokemonFriendLevel = 0;
  defaultPokemonLevel = 0;
  defaultEnergyPerHpLost = 0;
  defaultDamageMultiply = 0;
  defaultDamageConst = 0;
  defaultEnemyAtkDelay = 0;
  defaultTrainerMultiply = 0;
  defaultMegaMultiply = 0;
  curveIncChance = 0;
  platinumIncChance = 0;
  goldIncChance = 0;
  silverIncChance = 0;
  bronzeIncChance = 0;
  pokeBallIncChance = 0;
  greatBallIncChance = 0;
  ultraBallIncChance = 0;
  razzBerryIncChance = 0;
  silverPinapsIncChance = 0;
  goldRazzBerryIncChance = 0;
  normalThrowIncChance = [];
  niceThrowIncChance = [];
  greatThrowIncChance = [];
  excellentThrowIncChance = [];
  minCp = 0;
  cpDiffRatio = 0;
  minLevel = 0;
  maxLevel = 0;
  minIv = 0;
  maxIv = 0;
  defaultSize = 0;
  defaultPlusSize = 0;
  defaultAmount = 0;
  defaultBlock = 0;
}

export interface IOptions {
  playerSetting: IPlayerSetting;
  combatOptions: ICombatOption;
  battleOptions: IBattleOption;
  throwCharge: IThrowOption;
  buddyFriendship: DynamicObj<IBuddyFriendship>;
  trainerFriendship: DynamicObj<ITrainerFriendship>;
  config: IConfig;
}

export class Options implements IOptions {
  playerSetting = new PlayerSetting();
  combatOptions = new CombatOption();
  battleOptions = new BattleOption();
  throwCharge = new ThrowOption();
  buddyFriendship: DynamicObj<IBuddyFriendship> = {};
  trainerFriendship: DynamicObj<ITrainerFriendship> = {};
  config = new Config();
}

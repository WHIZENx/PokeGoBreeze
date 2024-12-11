import { PokemonType } from '../../enums/type.enum';
import { DynamicObj } from '../../util/extension';
import { getPokemonType } from '../../util/utils';
import { ConditionType, LeagueConditionType, QuestType } from '../enums/option.enum';
import { LeagueReward, SettingLeague } from './league.model';
import { PokemonModel } from './pokemon.model';
import { IStatsBase, StatsBase } from './stats.model';

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

interface MoveBuff {
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
  power: number;
  accuracyChance: number;
  criticalChance: number;
  staminaLossScalar: number;
  trainerLevelMin: number;
  trainerLevelMax: number;
  vfxName: string;
  durationMs: number;
  damageWindowStartMs: number;
  damageWindowEndMs: number;
  energyDelta: number;
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
  title: string;
  enabled: boolean;
  pokemonCondition: PokemonCondition[];
  iconUrl: string;
  badgeType: string;
  bannedPokemon: string[];
  pokemonCount: number;
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

interface DataGM {
  pokemonSettings: PokemonModel;
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
  smeargleMovesSettings: PokemonModel;
  vsSeekerClientSettings: VsSeekerClientSetting;
  vsSeekerPokemonRewards: VsSeekerPokemonReward;
  combatCompetitiveSeasonSettings: CombatCompetitiveSeasonSetting;
  combatRankingProtoSettings: CombatRankingProtoSetting;
  vsSeekerLoot: VsSeekerLoot;
  combatLeague: CombatLeague;
  evolutionQuestTemplate?: EvolutionQuestTemplate;
  evolutionChainDisplaySettings: EvolutionChainDisplaySettings;
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
  form: string;
  forms?: string;
  name: string | undefined;
  pokemonType: PokemonType;
}

export class PokemonPermission implements IPokemonPermission {
  id: number | undefined;
  form = '';
  forms?: string;
  name: string | undefined;
  pokemonType = PokemonType.Normal;

  constructor({ ...props }: IPokemonPermission) {
    props.pokemonType = getPokemonType(props.form);
    Object.assign(this, props);
  }
}

interface ICombatOption {
  stab: number;
  shadowBonus: IStatsBase;
  purifiedBonus: IStatsBase;
  maxEnergy: number;
}

class CombatOption implements ICombatOption {
  stab = 0;
  shadowBonus = new StatsBase();
  purifiedBonus = new StatsBase();
  maxEnergy = 0;
}

interface IBattleOption {
  enemyAttackInterval: number;
  stab: number;
  shadowBonus: IStatsBase;
  purifiedBonus: IStatsBase;
  maxEnergy: number;
  dodgeDamageReductionPercent: number;
}

class BattleOption implements IBattleOption {
  enemyAttackInterval = 0;
  stab = 0;
  shadowBonus = new StatsBase();
  purifiedBonus = new StatsBase();
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

export interface IOptions {
  combatOptions: ICombatOption;
  battleOptions: IBattleOption;
  throwCharge: IThrowOption;
  buddyFriendship: DynamicObj<IBuddyFriendship>;
  trainerFriendship: DynamicObj<ITrainerFriendship>;
}

export class Options implements IOptions {
  combatOptions = new CombatOption();
  battleOptions = new BattleOption();
  throwCharge = new ThrowOption();
  buddyFriendship: DynamicObj<IBuddyFriendship> = {};
  trainerFriendship: DynamicObj<ITrainerFriendship> = {};
}

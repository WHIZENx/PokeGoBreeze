import { DynamicObj } from '../../util/extension';
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
}

interface BattleSetting {
  enemyAttackInterval: number;
  sameTypeAttackBonusMultiplier: number;
  shadowPokemonAttackBonusMultiplier: number;
  shadowPokemonDefenseBonusMultiplier: number;
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

interface CombatMove {
  uniqueId: string;
  type: string;
  power: number;
  energyDelta: number;
  vfxName: string;
  buffs?: DynamicObj<number>;
}

interface MoveSetting {
  movementId: string;
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

// tslint:disable-next-line:max-classes-per-file
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
  type: string;
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
  questType: string;
  goals: EvolutionGoal[];
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
}

export interface PokemonDataGM {
  templateId: string;
  data: DataGM;
}

interface EvolutionGoal {
  condition: EvolutionCondition[];
  target: number;
}

interface EvolutionCondition {
  type: string;
  withPokemonType?: {
    pokemonType: string[];
  };
  withThrowType?: {
    throwType: string;
  };
}

export interface IPokemonPermission {
  id: number | undefined;
  form: string;
  forms?: string;
  name: string | undefined;
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonPermission implements IPokemonPermission {
  id: number | undefined;
  form = '';
  forms?: string;
  name: string | undefined;

  constructor({ ...props }: IPokemonPermission) {
    Object.assign(this, props);
  }
}

interface ICombatOption {
  stab: number;
  shadowBonus: IStatsBase;
}

// tslint:disable-next-line:max-classes-per-file
class CombatOption implements ICombatOption {
  stab: number;
  shadowBonus: IStatsBase;

  constructor() {
    this.stab = 0;
    this.shadowBonus = new StatsBase();
  }
}

interface IBattleOption {
  enemyAttackInterval: number;
  stab: number;
  shadowBonus: IStatsBase;
}

// tslint:disable-next-line:max-classes-per-file
class BattleOption implements IBattleOption {
  enemyAttackInterval: number;
  stab: number;
  shadowBonus: IStatsBase;

  constructor() {
    this.enemyAttackInterval = 0;
    this.stab = 0;
    this.shadowBonus = new StatsBase();
  }
}

interface IThrowOption {
  normal: number;
  nice: number;
  great: number;
  excellent: number;
}

// tslint:disable-next-line:max-classes-per-file
export class ThrowOption implements IThrowOption {
  normal: number;
  nice: number;
  great: number;
  excellent: number;

  constructor() {
    this.normal = 0;
    this.nice = 0;
    this.great = 0;
    this.excellent = 0;
  }
}

export interface IBuddyFriendship {
  level: number;
  minNonCumulativePointsRequired: number;
  unlockedTrading?: string[];
}

// tslint:disable-next-line:max-classes-per-file
export class BuddyFriendship implements IBuddyFriendship {
  level: number;
  minNonCumulativePointsRequired: number;

  constructor() {
    this.level = 0;
    this.minNonCumulativePointsRequired = 0;
  }
}

export interface ITrainerFriendship {
  level: number;
  atkBonus: number;
  unlockedTrading?: string[];
}

// tslint:disable-next-line:max-classes-per-file
export class TrainerFriendship implements ITrainerFriendship {
  level: number;
  atkBonus: number;

  constructor() {
    this.level = 0;
    this.atkBonus = 0;
  }
}

export interface IOptions {
  combatOptions: ICombatOption;
  battleOptions: IBattleOption;
  throwCharge: IThrowOption;
  buddyFriendship: DynamicObj<IBuddyFriendship>;
  trainerFriendship: DynamicObj<ITrainerFriendship>;
}

// tslint:disable-next-line:max-classes-per-file
export class Options implements IOptions {
  combatOptions: ICombatOption;
  battleOptions: IBattleOption;
  throwCharge: IThrowOption;
  buddyFriendship: DynamicObj<IBuddyFriendship>;
  trainerFriendship: DynamicObj<ITrainerFriendship>;

  constructor() {
    this.combatOptions = new CombatOption();
    this.battleOptions = new BattleOption();
    this.throwCharge = new ThrowOption();
    this.buddyFriendship = {};
    this.trainerFriendship = {};
  }
}

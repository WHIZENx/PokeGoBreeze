import { LeagueReward, IPokemonRewardLeague, SettingLeague } from './league.model';
import { PokemonModel } from './pokemon.model';
import { IStatsBase, StatsBase } from './stats.model';

export interface PokemonDataGM {
  templateId: string;
  data: {
    pokemonSettings: PokemonModel;
    combatSettings: {
      sameTypeAttackBonusMultiplier: number;
      shadowPokemonAttackBonusMultiplier: number;
      shadowPokemonDefenseBonusMultiplier: number;
      chargeScoreBase: number;
      chargeScoreNice: number;
      chargeScoreGreat: number;
      chargeScoreExcellent: number;
    };
    battleSettings: {
      enemyAttackInterval: number;
      sameTypeAttackBonusMultiplier: number;
      shadowPokemonAttackBonusMultiplier: number;
      shadowPokemonDefenseBonusMultiplier: number;
    };
    buddyLevelSettings: { minNonCumulativePointsRequired: number; unlockedTraits: string[] };
    friendshipMilestoneSettings: { attackBonusPercentage: number; unlockedTrading: string[] };
    typeEffective: { attackScalar: number[] };
    weatherAffinities: { weatherCondition: string; pokemonType: string[] };
    genderSettings: {
      pokemon: string;
      gender:
        | {
            malePercent: number;
            femalePercent: number;
          }
        | undefined;
    };
    formSettings: { pokemon: string; forms: { assetBundleSuffix: string; isCostume: boolean; form: string }[] };
    pokemonFamily: { familyId: string };
    iapItemDisplay: { sku: string };
    stickerMetadata: { stickerId: string; maxCount: number; stickerUrl: string | null; pokemonId: string | undefined };
    combatMove: {
      uniqueId: string;
      type: string;
      power: number;
      energyDelta: number;
      buffs: { [x: string]: number };
    };
    moveSettings: {
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
    };
    moveSequenceSettings: { sequence: string[] };
    smeargleMovesSettings: PokemonModel;
    vsSeekerClientSettings: { allowedVsSeekerLeagueTemplateId: string[] };
    vsSeekerPokemonRewards: {
      availablePokemon: {
        unlockedAtRank: number;
        guaranteedLimitedPokemonReward: { pokemon: { pokemonId: string; pokemonDisplay: { form: string } } };
        pokemon: { pokemonId: string; pokemonDisplay: { form: string } };
      }[];
    };
    combatCompetitiveSeasonSettings: { seasonEndTimeTimestamp: string[] };
    combatRankingProtoSettings: { rankLevel: SettingLeague[] | undefined };
    vsSeekerLoot: {
      rankLevel: number;
      rank: IPokemonRewardLeague;
      pokemon: IPokemonRewardLeague;
      reward: LeagueReward[];
      rewardTrack: string;
    };
    combatLeague: {
      title: string;
      enabled: boolean;
      pokemonCondition: {
        pokemonBanList: { pokemon: IPokemonPermission[] };
        type: string;
        pokemonCaughtTimestamp: { afterTimestamp: number; beforeTimestamp: number };
        withPokemonType: { pokemonType: string[] };
        pokemonLevelRange: { maxLevel: number };
        withPokemonCpLimit: { maxCp: number };
        pokemonWhiteList: { pokemon: IPokemonPermission[] };
      }[];
      iconUrl: string;
      badgeType: string;
      bannedPokemon: string[];
    };
    evolutionQuestTemplate?: {
      questTemplateId: string;
      questType: string;
      goals: EvolutionGoal[];
    };
  };
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

export class PokemonPermission implements IPokemonPermission {
  id: number | undefined;
  form: string = '';
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
    this.shadowBonus = new StatsBase(0, 0, 0);
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
    this.shadowBonus = new StatsBase(0, 0, 0);
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
  buddyFriendship: { [x: string]: IBuddyFriendship };
  trainerFriendship: { [x: string]: ITrainerFriendship };
}

// tslint:disable-next-line:max-classes-per-file
export class Options implements IOptions {
  combatOptions: ICombatOption;
  battleOptions: IBattleOption;
  throwCharge: IThrowOption;
  buddyFriendship: { [x: string]: IBuddyFriendship };
  trainerFriendship: { [x: string]: ITrainerFriendship };

  constructor() {
    this.combatOptions = new CombatOption();
    this.battleOptions = new BattleOption();
    this.throwCharge = new ThrowOption();
    this.buddyFriendship = {};
    this.trainerFriendship = {};
  }
}

import { LeagueReward, PokemonRewardLeague, SettingLeague } from './league.model';
import { PokemonModel } from './pokemon.model';

export interface PokemonData {
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
    buddyLevelSettings: { minNonCumulativePointsRequired: number; unlockedTraits: number };
    friendshipMilestoneSettings: { attackBonusPercentage: number; unlockedTrading: number };
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
      rank: PokemonRewardLeague;
      pokemon: PokemonRewardLeague;
      reward: LeagueReward[];
      rewardTrack: string;
    };
    combatLeague: {
      title: string;
      enabled: boolean;
      pokemonCondition: {
        pokemonBanList: { pokemon: PokemonPermission[] };
        type: string;
        pokemonCaughtTimestamp: { afterTimestamp: number; beforeTimestamp: number };
        withPokemonType: { pokemonType: string[] };
        pokemonLevelRange: { maxLevel: number };
        withPokemonCpLimit: { maxCp: number };
        pokemonWhiteList: { pokemon: PokemonPermission[] };
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

export interface PokemonPermission {
  id: number | undefined;
  form: string;
  forms?: string;
  name: string | undefined;
}

interface CombatOption {
  stab: number;
  shadow_bonus: {
    atk: number;
    def: number;
  };
}

interface BattleOption {
  enemyAttackInterval: number;
  stab: number;
  shadow_bonus: {
    atk: number;
    def: number;
  };
}

interface ThrowOption {
  normal: number;
  nice: number;
  great: number;
  excellent: number;
}

interface BuddyFriendship {
  level: number;
  minNonCumulativePointsRequired: number;
  unlockedTrading?: string[];
}

export interface TrainerFriendship {
  level: number;
  atk_bonus: number;
  unlockedTrading?: string[];
}

export interface Options {
  combat_options: CombatOption;
  battle_options: BattleOption;
  throw_charge: ThrowOption;
  buddy_friendship: {
    '0': BuddyFriendship;
    '1': BuddyFriendship;
    '2': BuddyFriendship;
    '3': BuddyFriendship;
    '4': BuddyFriendship;
  };
  trainer_friendship: {
    '0': TrainerFriendship;
    '1': TrainerFriendship;
    '2': TrainerFriendship;
    '3': TrainerFriendship;
    '4': TrainerFriendship;
  };
}

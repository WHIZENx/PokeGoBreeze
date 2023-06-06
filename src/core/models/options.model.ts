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

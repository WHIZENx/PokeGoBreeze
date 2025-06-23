import { defaultOptions } from '../../contexts/options.context';
import { IOptions } from '../../core/models/options.model';
import { ThrowType } from '../../enums/type.enum';
import { DEFAULT_POKEMON_FRIEND_LEVEL } from '../constants';

// This variable will store the latest options from the context
let currentOptions = defaultOptions;

// Function to update the current options (called from a React component)
export const updateCurrentOptions = (newOptions: IOptions) => {
  currentOptions = newOptions;
};

// Function to get the current options (can be called from any file)
export const getOptions = () => currentOptions;

// Battle options
export const getBattleOptions = () => currentOptions.battleOptions;
export const battleStab = () => currentOptions.battleOptions.stab;
export const enemyAttackInterval = () => currentOptions.battleOptions.enemyAttackInterval;
export const dodgeDamageReductionPercent = () => currentOptions.battleOptions.dodgeDamageReductionPercent;
export const battleShadowBonus = () => currentOptions.battleOptions.shadowBonus;
export const battleShadowBonusAtk = () => currentOptions.battleOptions.shadowBonus.atk;
export const battleShadowBonusDef = () => currentOptions.battleOptions.shadowBonus.def;
export const battlePurifiedBonus = () => currentOptions.battleOptions.purifiedBonus;
export const battlePurifiedBonusAtk = () => currentOptions.battleOptions.purifiedBonus.atk;
export const battlePurifiedBonusDef = () => currentOptions.battleOptions.purifiedBonus.def;
export const battleMaxEnergy = () => currentOptions.battleOptions.maxEnergy;

// Combat options
export const getCombatOptions = () => currentOptions.combatOptions;
export const combatStab = () => currentOptions.combatOptions.stab;
export const combatShadowBonus = () => currentOptions.combatOptions.shadowBonus;
export const combatShadowBonusAtk = () => currentOptions.combatOptions.shadowBonus.atk;
export const combatShadowBonusDef = () => currentOptions.combatOptions.shadowBonus.def;
export const combatPurifiedBonus = () => currentOptions.combatOptions.purifiedBonus;
export const combatPurifiedBonusAtk = () => currentOptions.combatOptions.purifiedBonus.atk;
export const combatPurifiedBonusDef = () => currentOptions.combatOptions.purifiedBonus.def;
export const combatMaxEnergy = () => currentOptions.combatOptions.maxEnergy;

// Throw charge options
export const getThrowCharge = () => currentOptions.throwCharge;
export const throwNormal = () => currentOptions.throwCharge.normal;
export const throwNice = () => currentOptions.throwCharge.nice;
export const throwGreat = () => currentOptions.throwCharge.great;
export const throwExcellent = () => currentOptions.throwCharge.excellent;
export const getMultiplyThrownByType = (type: ThrowType | undefined) => {
  switch (type) {
    case ThrowType.Nice:
      return throwNice();
    case ThrowType.Great:
      return throwGreat();
    case ThrowType.Excellent:
      return throwExcellent();
    default:
      return throwNormal();
  }
};

// Player settings
export const getPlayerSetting = () => currentOptions.playerSetting;
export const levelUps = () => currentOptions.playerSetting.levelUps;
export const cpMultipliers = () => currentOptions.playerSetting.cpMultipliers;
export const maxEncounterPlayerLevel = () => currentOptions.playerSetting.maxEncounterPlayerLevel;
export const maxQuestEncounterPlayerLevel = () => currentOptions.playerSetting.maxQuestEncounterPlayerLevel;

// Friendship settings
export const getBuddyFriendship = () => currentOptions.buddyFriendship;

// Trainer settings
export const getTrainerFriendship = () => currentOptions.trainerFriendship;
export const getMultiplyFriendship = (level = DEFAULT_POKEMON_FRIEND_LEVEL) =>
  currentOptions.trainerFriendship[level.toString()].atkBonus || 1;

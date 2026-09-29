import { ICombat } from '../core/models/combat.model';
import { MaxMoveEffect, MaxMoveType, MaxMoveVariant } from '../enums/type.enum';

export const defaultMaxMoveLevel = 3;

export const getMaxMoveLevelValue = (move: Pick<ICombat, 'maxMoveLevels'> | undefined, level: number) =>
  move?.maxMoveLevels?.[Math.max(1, Math.min(4, level)) - 1];

export const getMaxMoveVariantLabel = (move: Pick<ICombat, 'maxMoveType' | 'maxMoveVariant'> | undefined) => {
  if (move?.maxMoveVariant === MaxMoveVariant.Gigantamax) {
    return 'Gigantamax Attack';
  }
  if (move?.maxMoveVariant === MaxMoveVariant.Dynamax) {
    return 'Dynamax Attack';
  }
  if (move?.maxMoveType === MaxMoveType.Guard) {
    return 'Max Guard';
  }
  if (move?.maxMoveType === MaxMoveType.Spirit) {
    return 'Max Spirit';
  }
  return 'Special Max Attack';
};

export const formatMaxMoveEffect = (move: Pick<ICombat, 'maxMoveEffect'> | undefined, value: number | undefined) => {
  if (value === undefined) {
    return '-';
  }
  if (move?.maxMoveEffect === MaxMoveEffect.HealPercent) {
    return `${value}% HP`;
  }
  if (move?.maxMoveEffect === MaxMoveEffect.TemporaryHp) {
    return `+${value} HP`;
  }
  return `${value}`;
};

export const formatMaxMoveLevelSummary = (move: Pick<ICombat, 'maxMoveEffect' | 'maxMoveLevels'>) =>
  (move.maxMoveLevels ?? []).map((value) => formatMaxMoveEffect(move, value)).join(' / ');

export const formatMaxMoveUpgradeCosts = (move: Pick<ICombat, 'maxMoveCosts' | 'maxMoveType'>) =>
  (move.maxMoveCosts ?? [])
    .map((cost) => {
      if (move.maxMoveType === MaxMoveType.Attack && cost.level === 1) {
        return 'Lv. 1: Base move';
      }
      const values = [
        cost.mpCost ? `${cost.mpCost} MP` : undefined,
        cost.candyCost ? `${cost.candyCost} Candy` : undefined,
        cost.xlCandyCost ? `${cost.xlCandyCost} XL Candy` : undefined,
        cost.stardustCost ? `${cost.stardustCost.toLocaleString()} Stardust` : undefined,
      ].filter(Boolean);
      const reward = cost.xpReward ? ` (+${cost.xpReward.toLocaleString()} XP)` : '';
      return `Lv. ${cost.level}: ${values.join(' + ')}${reward}`;
    })
    .join(' · ');

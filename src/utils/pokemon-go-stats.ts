export const pokemonGoBattleHp = (effectiveStamina: number) => Math.max(10, Math.floor(effectiveStamina));

export const pokemonGoStatProduct = (effectiveAttack: number, effectiveDefense: number, effectiveStamina: number) =>
  effectiveAttack * effectiveDefense * pokemonGoBattleHp(effectiveStamina);

export const pokemonGoBattleHp = (effectiveStamina: number) => Math.max(10, Math.floor(effectiveStamina));

export const pokemonGoBaseStatProduct = (attack: number, defense: number, stamina: number) =>
  Math.round(attack) * Math.round(defense) * Math.round(stamina);

export const pokemonGoStatProduct = (effectiveAttack: number, effectiveDefense: number, effectiveStamina: number) =>
  effectiveAttack * effectiveDefense * pokemonGoBattleHp(effectiveStamina);

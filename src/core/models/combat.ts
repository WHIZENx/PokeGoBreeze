export interface Combat {
  name: string;
  type: string | null;
  type_move: string | null;
  pvp_power: number;
  pvp_energy: number;
  sound: string | null;
  buffs: any[];
  id: number;
  track: number;
  pve_power: number;
  pve_energy: number;
  durationMs: number;
  damageWindowStartMs: number;
  damageWindowEndMs: number;
  accuracyChance: number;
  criticalChance: number;
  staminaLossScalar: number;
  archetype: string | null;
}

export interface CombatPokemon {
  id: number;
  name: string;
  baseSpecies: string;
  quickMoves: string[];
  cinematicMoves: string[];
  shadowMoves: string[];
  purifiedMoves: string[];
  eliteQuickMoves: string[];
  eliteCinematicMoves: string[];
}
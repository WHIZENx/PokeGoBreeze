import type { MoveType, PokemonType } from '../../../enums/type.enum';

const SHADOW_MOVE_TYPE = 1;
const PURIFIED_MOVE_TYPE = 2;
const SHADOW_POKEMON_TYPE = 2;
const PURIFIED_POKEMON_TYPE = 3;

export const filterBattleModifierMoves = <T extends { moveType: MoveType }>(moves: T[], pokemonType: PokemonType) =>
  moves.filter(
    (move) =>
      (move.moveType !== SHADOW_MOVE_TYPE || pokemonType === SHADOW_POKEMON_TYPE) &&
      (move.moveType !== PURIFIED_MOVE_TYPE || pokemonType === PURIFIED_POKEMON_TYPE)
  );

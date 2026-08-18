import type { IPokemonQueryRankMove } from '../../../utils/models/pokemon-top-move.model';
import type { PokemonForm } from './form.model';
import type { PokemonInfo, PokemonInfoEvo } from './info.model';
import type { Species } from './species.model';

export interface PokemonBundleVariety {
  pokemon: PokemonInfo;
  forms: PokemonForm[];
}

export interface PokemonMoveRanking {
  num: number;
  form?: string;
  fullName?: string;
  pokemonType: number;
  bestMoves: IPokemonQueryRankMove;
}

export interface PokemonBundle {
  species: Species;
  varieties: PokemonBundleVariety[];
  evolutionChain: PokemonInfoEvo | null;
  moveRankings?: PokemonMoveRanking[];
}

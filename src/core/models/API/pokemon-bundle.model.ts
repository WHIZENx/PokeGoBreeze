import type { IPokemonQueryRankMove } from '../../../utils/models/pokemon-top-move.model';
import type { PokemonForm } from './form.model';
import type { PokemonInfo, PokemonInfoEvo } from './info.model';
import type { Species } from './species.model';
import type { IAsset } from '../asset.model';
import type { IEvolutionChain } from '../evolution-chain.model';
import type { ICombat } from '../combat.model';
import type { PokemonType } from '../../../enums/type.enum';

export interface PokemonBundleVariety {
  pokemon: PokemonInfo;
  forms: PokemonForm[];
}

export interface PokemonMoveRanking {
  num: number;
  form?: string;
  fullName?: string;
  pokemonType: PokemonType;
  moves: PokemonMoves;
  bestMoves: IPokemonQueryRankMove;
}

export interface PokemonMoves {
  fastMoves: ICombat[];
  chargedMoves: ICombat[];
  eliteFastMoves: ICombat[];
  eliteChargedMoves: ICombat[];
  purifiedMoves: ICombat[];
  shadowMoves: ICombat[];
  specialMoves: ICombat[];
  exclusiveMoves: ICombat[];
  dynamaxMoves: ICombat[];
}

export interface PokemonBundle {
  species: Species;
  varieties: PokemonBundleVariety[];
  evolutionChain: PokemonInfoEvo | null;
  moveRankings?: PokemonMoveRanking[];
  pokemonGo?: {
    asset: IAsset | null;
    evolutionChains: IEvolutionChain[];
  };
}

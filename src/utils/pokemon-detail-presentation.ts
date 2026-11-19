import type { PokemonGoFormCatalogEntry, PokemonMoveRanking } from '../core/models/API/pokemon-bundle.model';
import { findPokemonGoFormIdentityMatch, type PokemonGoFormIdentity } from './pokemon-form-identity';

export type PokemonDetailSelection = Pick<PokemonGoFormIdentity, 'num' | 'form' | 'fullName' | 'pokemonType'>;

/** Resolves the exact generated GO form shared by Pokémon Details and Stats Ranking. */
export const findPokemonDetailGoForm = (
  forms: readonly PokemonGoFormCatalogEntry[] | undefined,
  selection: PokemonDetailSelection
) => findPokemonGoFormIdentityMatch(forms, selection);

/** Resolves one move dataset for the same normalized form/modifier identity on both routes. */
export const findPokemonDetailMoveRanking = (
  rankings: readonly PokemonMoveRanking[] | undefined,
  selection: PokemonDetailSelection
) => findPokemonGoFormIdentityMatch(rankings, selection);

interface PokemonDetailImageCandidateInput {
  pokemonGoImage?: string;
  preferredImage?: string;
  officialImage?: string;
  hybridImage?: string;
  fullAssetImage?: string;
}

/**
 * One ordered profile-image contract for every Pokémon detail consumer.
 * The exact generated GO form wins before canonical and species fallbacks.
 */
export const buildPokemonDetailImageCandidates = ({
  pokemonGoImage,
  preferredImage,
  officialImage,
  hybridImage,
  fullAssetImage,
}: PokemonDetailImageCandidateInput) =>
  [
    ...new Set([pokemonGoImage, preferredImage, officialImage, hybridImage, fullAssetImage].filter(Boolean)),
  ] as string[];

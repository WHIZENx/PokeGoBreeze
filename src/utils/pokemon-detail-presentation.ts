import type { PokemonGoFormCatalogEntry, PokemonMoveRanking } from '../core/models/API/pokemon-bundle.model';
import {
  findPokemonGoFormIdentityMatch,
  normalizePokemonFormIdentity,
  type PokemonGoFormIdentity,
} from './pokemon-form-identity';

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

export interface PokemonDetailCanonicalForm {
  id?: number;
  num?: number;
  form?: string | number;
  form_name?: string;
  isDefault?: boolean;
  is_default?: boolean;
  name?: string;
}

/**
 * Finds canonical artwork only for the selected form identity. GO-only forms
 * must not borrow the species' default artwork ahead of their exact GO asset.
 */
export const findPokemonDetailCanonicalForm = <T extends PokemonDetailCanonicalForm>(
  forms: readonly T[] | undefined,
  selection: PokemonDetailSelection
) => {
  const modifier = selection.pokemonType === 2 ? 'SHADOW' : selection.pokemonType === 3 ? 'PURIFIED' : undefined;
  const selectedForm = String(selection.form || 'NORMAL').toUpperCase();
  const canonicalForm = modifier
    ? selectedForm.replace(new RegExp(`_${modifier}$|^${modifier}$`), '') || 'NORMAL'
    : selectedForm;
  const selectedIdentity = normalizePokemonFormIdentity(selection.num, canonicalForm);

  return forms?.find((form) => {
    const formId = form.id ?? form.num;
    const formName =
      form.form_name ||
      form.form ||
      (formId === selection.num && (form.is_default || form.isDefault) ? 'NORMAL' : form.name);
    return normalizePokemonFormIdentity(selection.num, formName) === selectedIdentity;
  });
};
interface PokemonDetailImageCandidateInput {
  pokemonGoImage?: string;
  preferredImage?: string;
  officialImage?: string;
  hybridImage?: string;
  fullAssetImage?: string;
}

/**
 * One ordered profile-image contract for every Pokémon detail consumer.
 * Prefer the canonical form artwork used by the detail bundle, then fall back
 * to the exact generated GO asset and species-level images.
 */
export const buildPokemonDetailImageCandidates = ({
  pokemonGoImage,
  preferredImage,
  officialImage,
  hybridImage,
  fullAssetImage,
}: PokemonDetailImageCandidateInput) =>
  [
    ...new Set([preferredImage, pokemonGoImage, officialImage, hybridImage, fullAssetImage].filter(Boolean)),
  ] as string[];

interface PokemonDetailProfilePresentationInput<T extends PokemonDetailCanonicalForm> {
  canonicalForms?: readonly T[];
  pokemonGoForms?: readonly PokemonGoFormCatalogEntry[];
  selection: PokemonDetailSelection;
  getCanonicalImage: (form: T) => string | undefined;
  getPokemonGoImage: (form: PokemonGoFormCatalogEntry) => string | undefined;
  officialImage?: string;
  hybridImage?: string;
  fullAssetImage?: string;
}

/** One exact identity and ordered image chain shared by every detail route. */
export const buildPokemonDetailProfilePresentation = <T extends PokemonDetailCanonicalForm>({
  canonicalForms,
  pokemonGoForms,
  selection,
  getCanonicalImage,
  getPokemonGoImage,
  officialImage,
  hybridImage,
  fullAssetImage,
}: PokemonDetailProfilePresentationInput<T>) => {
  const canonicalForm = findPokemonDetailCanonicalForm(canonicalForms, selection);
  const pokemonGoForm = findPokemonDetailGoForm(pokemonGoForms, selection);
  const preferredImage = canonicalForm ? getCanonicalImage(canonicalForm) : undefined;
  const pokemonGoImage = pokemonGoForm ? getPokemonGoImage(pokemonGoForm) : undefined;

  return {
    canonicalForm,
    pokemonGoForm,
    preferredImage,
    pokemonGoImage,
    officialImage,
    hybridImage,
    fullAssetImage,
    imageCandidates: buildPokemonDetailImageCandidates({
      preferredImage,
      pokemonGoImage,
      officialImage,
      hybridImage,
      fullAssetImage,
    }),
  };
};

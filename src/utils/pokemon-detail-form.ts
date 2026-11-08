interface PokemonDetailFormIdentity {
  num: number;
  name: string;
  fullName?: string;
  slug: string;
  sprite: string;
  types: string[];
  pokemonId?: string | number;
  form?: string;
}

interface SelectedPokemonFormIdentity {
  defaultName?: string;
  name?: string;
  form?: {
    formName?: string;
    id?: number;
    isDefault?: boolean;
    name?: string;
    types?: string[];
  };
}

const normalizedForm = (value: string | undefined) => (value || 'NORMAL').replaceAll('-', '_').toUpperCase();

const normalizedFullName = (value: string) => value.replaceAll('-', '_').toUpperCase();

const normalizedIdentityName = (value: string | undefined) => (value ?? '').trim().replaceAll('_', '-').toLowerCase();

/**
 * PokéAPI marks the primary form inside every variety as is_default. Only the
 * species' own variety may use the generated NORMAL row as a fallback.
 */
export const isCanonicalSpeciesDefaultForm = (selection: SelectedPokemonFormIdentity, speciesId: number) => {
  if (!selection.form?.isDefault) {
    return false;
  }
  const speciesName = normalizedIdentityName(selection.defaultName);
  return selection.form.id === speciesId || normalizedIdentityName(selection.form.name) === speciesName;
};

/** Preserve the selected canonical identity when no matching GO row exists. */
export const hydrateCanonicalPokemonDetail = <T extends PokemonDetailFormIdentity>(
  pokemon: T,
  id: number,
  selection: SelectedPokemonFormIdentity
) => {
  const form = normalizedForm(selection.form?.formName);
  const speciesSlug = selection.defaultName?.replaceAll('_', '-').toLowerCase() ?? '';
  const formSlug =
    selection.form?.name?.replaceAll('_', '-').toLowerCase() ||
    selection.name?.replaceAll('_', '-').toLowerCase() ||
    (form === 'NORMAL' ? speciesSlug : `${speciesSlug}-${form.replaceAll('_', '-').toLowerCase()}`);

  pokemon.num ||= id;
  pokemon.pokemonId ||= selection.defaultName?.replaceAll('-', '_').toUpperCase();
  pokemon.name ||= formSlug;
  pokemon.fullName ||= normalizedFullName(formSlug);
  pokemon.form ||= form;
  pokemon.slug ||= formSlug;
  pokemon.sprite ||= formSlug;
  if (!pokemon.types.length && selection.form?.types?.length) {
    pokemon.types = [...selection.form.types];
  }
  return pokemon;
};

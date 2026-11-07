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
    name?: string;
    types?: string[];
  };
}

const normalizedForm = (value: string | undefined) => (value || 'NORMAL').replaceAll('-', '_').toUpperCase();

const normalizedFullName = (value: string) => value.replaceAll('-', '_').toUpperCase();

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

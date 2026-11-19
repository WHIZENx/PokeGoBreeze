import type { IPokemonData } from '../core/models/pokemon.model';
import { PokemonType } from '../enums/type.enum';
import { normalizePokemonFormIdentity, selectPreferredPokemonGoFormIdentity } from './pokemon-form-identity';
import { getPokemonFormWithNoneSpecialForm } from './pokemon-form-routing';

const normalizePokemonForm = (value: string | undefined) =>
  (value ?? '').trim().replaceAll('-', '_').replaceAll(' ', '_').toUpperCase();

const stripStandardSuffix = (value: string, standardForm: string) =>
  value === standardForm ? value : value.replace(`_${standardForm}`, '');

const getPokemonFormCandidates = (
  pokemons: IPokemonData[],
  form: string,
  pokemonType: PokemonType,
  standardForm: string
) => {
  const candidates = new Set<string>();
  const id = pokemons[0]?.num ?? 0;
  [form, getPokemonFormWithNoneSpecialForm(form, pokemonType)].forEach((value) => {
    const candidate = stripStandardSuffix(normalizePokemonForm(value), standardForm);
    candidates.add(candidate);
    candidates.add(normalizePokemonFormIdentity(id, candidate));
    if (id === 422 || id === 423) {
      candidates.add(candidate.replace(/_EAST$/, '_EAST_SEA').replace(/_WEST$/, '_WEST_SEA'));
      candidates.add(candidate.replace(/^EAST$/, 'EAST_SEA').replace(/^WEST$/, 'WEST_SEA'));
    }
  });
  return candidates;
};

/** Resolve a displayed form to the generated Game Master row that owns its GO mechanics. */
export const resolvePokemonForm = (
  pokemons: IPokemonData[],
  form: string | undefined,
  pokemonType = PokemonType.None,
  normalForm = 'NORMAL',
  standardForm = 'STANDARD'
) => {
  if (!form) {
    return pokemons.find(
      (pokemon) =>
        pokemon.form?.toUpperCase() === normalForm.toUpperCase() ||
        (Boolean(pokemon.baseForme) && pokemon.baseForme?.toUpperCase() === pokemon.form?.toUpperCase())
    );
  }
  const requestedForms = getPokemonFormCandidates(pokemons, form, pokemonType, standardForm.toUpperCase());
  const id = pokemons[0]?.num ?? 0;
  return selectPreferredPokemonGoFormIdentity(
    pokemons.filter(
      (pokemon) =>
        requestedForms.has(normalizePokemonFormIdentity(id, pokemon.fullName)) ||
        requestedForms.has(normalizePokemonFormIdentity(id, pokemon.form))
    )
  );
};

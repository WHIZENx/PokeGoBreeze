import assert from 'node:assert/strict';
import { hydrateCanonicalPokemonDetail, isCanonicalSpeciesDefaultForm } from '../../src/utils/pokemon-detail-form.ts';

assert.equal(
  isCanonicalSpeciesDefaultForm(
    {
      defaultName: 'clefable',
      // The current variety lookup may retain the base species name because
      // "clefable" is a substring of "clefable-mega". It must not decide
      // whether this is the species default form.
      name: 'clefable',
      form: { id: 10503, isDefault: true, name: 'clefable-mega', formName: 'mega' },
    },
    36
  ),
  false,
  "A variety's default Mega form must not fall back to the species' NORMAL Game Master row"
);
assert.equal(
  isCanonicalSpeciesDefaultForm(
    {
      defaultName: 'clefable',
      name: 'clefable',
      form: { id: 36, isDefault: true, name: 'clefable', formName: '' },
    },
    36
  ),
  true,
  'The canonical species form may fall back to its NORMAL Game Master row'
);

const detail = hydrateCanonicalPokemonDetail(
  {
    num: 0,
    name: '',
    slug: '',
    sprite: '',
    types: [],
  },
  36,
  {
    defaultName: 'clefable',
    name: 'clefable-mega',
    form: {
      formName: 'mega',
      name: 'clefable-mega',
      types: ['fairy'],
    },
  }
);

assert.deepEqual(detail, {
  num: 36,
  pokemonId: 'CLEFABLE',
  name: 'clefable-mega',
  fullName: 'CLEFABLE_MEGA',
  form: 'MEGA',
  slug: 'clefable-mega',
  sprite: 'clefable-mega',
  types: ['fairy'],
});

console.log('Validated canonical-only Pokémon Detail form identity hydration.');

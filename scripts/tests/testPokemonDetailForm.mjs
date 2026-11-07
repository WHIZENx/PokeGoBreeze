import assert from 'node:assert/strict';
import { hydrateCanonicalPokemonDetail } from '../../src/utils/pokemon-detail-form.ts';

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

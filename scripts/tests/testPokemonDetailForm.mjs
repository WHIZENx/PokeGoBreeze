import assert from 'node:assert/strict';
import {
  findCanonicalSpeciesDefaultForm,
  getSpeciesGenderRatio,
  hydrateCanonicalPokemonDetail,
  isCanonicalSpeciesDefaultForm,
  isDuplicatePokemonGoNormalForm,
} from '../../src/utils/pokemon-detail-form.ts';
import { readFile } from 'node:fs/promises';

const mothimForms = [
  {
    defaultName: 'mothim',
    name: 'mothim',
    form: { id: 414, isDefault: true, name: 'mothim-plant', formName: 'plant' },
  },
  {
    defaultName: 'mothim',
    name: 'mothim',
    form: { id: -1, isDefault: false, name: 'mothim', formName: 'normal' },
  },
];
assert.equal(
  findCanonicalSpeciesDefaultForm(mothimForms, 414),
  mothimForms[0],
  'Mothim must select its tagged Plant default before its GO-only NORMAL form'
);
assert.equal(
  isDuplicatePokemonGoNormalForm(mothimForms[0], 414, { form: 'NORMAL', pokemonType: 1 }, 1),
  true,
  'Mothim GO NORMAL must merge into its canonical Plant default'
);
const pokemonPage = await readFile(new URL('../../src/pages/Pokemon/Pokemon.tsx', import.meta.url), 'utf8');
const formComponent = await readFile(new URL('../../src/components/Info/Form/Form.tsx', import.meta.url), 'utf8');
const pokemonModel = await readFile(new URL('../../src/core/models/pokemon.model.ts', import.meta.url), 'utf8');
assert.match(
  formComponent,
  /setSearchParams\(\(currentSearchParams\) => \{[\s\S]*new URLSearchParams\(currentSearchParams\)[\s\S]*return nextSearchParams/,
  'form changes must navigate with a new URLSearchParams value instead of mutating the active router state'
);
assert.match(
  pokemonModel,
  /obj\.genderRate = value\.gender_rate/,
  'the normalized species model must preserve the PokéAPI gender rate'
);
assert.match(
  pokemonPage,
  /pokemon\.canonicalAliases \?\? \[\]/,
  'equivalent canonical forms must consume the alias mapping supplied by the API'
);
assert.match(
  pokemonPage,
  /canonicalForm\.pokemonGoStatsForm = pokemon\.canonicalForm/,
  'canonical aliases must retain the ranking form that owns the shared GO stats'
);
assert.equal(
  isDuplicatePokemonGoNormalForm(mothimForms[0], 414, { form: 'SHADOW', pokemonType: 2 }, 1),
  false,
  'Battle modifiers must remain separate from the canonical default'
);
const gimmighoulDefault = {
  defaultName: 'gimmighoul',
  name: 'gimmighoul',
  form: { id: 999, isDefault: true, name: 'gimmighoul-chest', formName: 'chest' },
};
assert.equal(
  isDuplicatePokemonGoNormalForm(gimmighoulDefault, 999, { form: 'NORMAL', pokemonType: 1 }, 1, true),
  false,
  'GO NORMAL must remain separate when another canonical form already owns that identity'
);

assert.match(
  pokemonPage,
  /getPokemonDetails\(id, formName, form\.form\?\.pokemonType, Boolean\(form\.pokemonGoForm\)\)/,
  'canonical defaults may reuse GO NORMAL mechanics only after an explicit identity merge'
);
assert.match(
  pokemonPage,
  /if \(!form\.pokemonGoForm\)[\s\S]*getSpeciesGenderRatio\(data\?\.genderRate\)/,
  'PokéAPI-only forms must fall back to their species gender rate'
);
assert.deepEqual(getSpeciesGenderRatio(0), { M: 1, F: 0 }, 'Mothim gender_rate 0 must resolve to 100% male');
assert.deepEqual(getSpeciesGenderRatio(4), { M: 0.5, F: 0.5 }, 'gender_rate 4 must resolve to an even ratio');
assert.deepEqual(getSpeciesGenderRatio(8), { M: 0, F: 1 }, 'gender_rate 8 must resolve to 100% female');
assert.deepEqual(getSpeciesGenderRatio(-1), { M: 0, F: 0 }, 'gender_rate -1 must remain genderless');
assert.equal(getSpeciesGenderRatio(9), undefined, 'invalid species gender rates must not create a ratio');

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

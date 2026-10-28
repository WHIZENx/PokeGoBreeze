#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [hook, form, specialForm, evolution, gender, assets, formChange, fusion, navigationImage] = await Promise.all([
  readFile(new URL('../../src/utils/hooks/useImageSourceSequence.ts', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Form/Form.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/SpecialForm/SpecialForm.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Evolution/EvolutionPokemonDisplay.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Gender.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Assets/PokemonModel.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/FormChange/FormChange.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/FormChange/Fusion.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/Pokemon/components/PokemonNavigationImage.tsx', import.meta.url), 'utf8'),
]);

assert.match(hook, /failureState\.sourceKey === sourceKey \? failureState\.failedSourceCount : 0/);
assert.match(hook, /current\.sourceKey === sourceKey \? current\.failedSourceCount : 0/);
assert.doesNotMatch(hook, /useEffect/);

for (const component of [specialForm, evolution, gender, assets, navigationImage]) {
  assert.match(component, /useImageSourceSequence/);
}

assert.match(specialForm, /\.\.\.imageSources,[\s\S]*APIService\.getPokeSprite\(\)/);
assert.doesNotMatch(specialForm, /sourceIndex|setSourceIndex/);
assert.match(form, /const isCurrentPokemonLoaded = Boolean\(/);
assert.match(form, /!params\.id \|\| Number\(params\.id\) === props\.defaultId/);
assert.match(form, /searchingMainDetails\?\.id === props\.defaultId/);
assert.match(form, /isCurrentPokemonLoaded && \(\s*<SpecialForm/);
assert.match(evolution, /if \(formVaries\) \{\s*return \[\];/);
assert.match(evolution, /exactMiniIcon !== undefined[\s\S]*<PokemonTableIcon/);
assert.doesNotMatch(evolution, /sourceIndex|setSourceIndex/);
assert.match(gender, /useImageSourceSequence\(defaultSpriteCandidates\)/);
assert.match(gender, /useImageSourceSequence\(shinySpriteCandidates\)/);
assert.doesNotMatch(gender, /setNextPokemonImageFallback/);
assert.match(assets, /getValidPokemonImgPath\(primarySource, id, asset\)/);
assert.match(assets, /APIService\.getPokeSprite\(id\),[\s\S]*APIService\.getPokeSprite\(\)/);
assert.doesNotMatch(assets, /currentTarget\.onerror = null/);
assert.match(formChange, /<EvolutionPokemonDisplay/);
assert.match(fusion, /<EvolutionPokemonDisplay/);
assert.match(navigationImage, /key=\{`\$\{id\}-\$\{source\}`\}/);
assert.match(navigationImage, /APIService\.getPokeOfficialArtwork\(id\)/);
assert.match(navigationImage, /APIService\.getPokeFullSprite\(id\)/);
assert.match(navigationImage, /APIService\.getPokeSprite\(id\)/);

console.log('Pokémon Detail image fallback sequences reset safely across navigation.');

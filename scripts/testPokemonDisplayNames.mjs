import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { formatPokemonDisplayName } from '../src/utils/pokemon-display-name.ts';

for (const [input, expected] of [
  ['Furfrou-natural', 'Furfrou Natural'],
  ['FURFROU_PHARAOH', 'Furfrou Pharaoh'],
  ['Charizard-mega-x', 'Charizard Mega X'],
  ['Ho-Oh', 'Ho-Oh'],
  ['Ho-Oh-shadow', 'Ho-Oh Shadow'],
  ['Porygon-Z', 'Porygon-Z'],
  ['Jangmo-o', 'Jangmo-o'],
  ['Kommo-o-totem', 'Kommo-o Totem'],
  ['MR_MIME', 'Mr. Mime'],
  ['Mime-jr', 'Mime Jr.'],
  ['Type-null', 'Type: Null'],
  ['Farfetchd-galar', 'Farfetch’d Galar'],
  ['Nidoran-female', 'Nidoran Female'],
  ['Wo-Chien', 'Wo-Chien'],
  ['Pikachu-gmax', 'Pikachu Gigantamax'],
  [undefined, ''],
  ['', ''],
])
  assert.equal(formatPokemonDisplayName(input), expected);

if (process.argv[2]) {
  const pokemon = JSON.parse(await readFile(process.argv[2], 'utf8'));
  const legitimateHyphens = /Ho-Oh|Porygon-Z|Jangmo-o|Hakamo-o|Kommo-o|Wo-Chien|Chien-Pao|Ting-Lu|Chi-Yu/g;
  for (const entry of pokemon) {
    const label = formatPokemonDisplayName(entry.name);
    assert.ok(label, `Empty display name: ${entry.name}`);
    assert.ok(!/[-_]/.test(label.replace(legitimateHyphens, '')), `Unmapped separator: ${entry.name} → ${label}`);
  }
  console.log(`Audited ${pokemon.length} Pokémon/form dropdown labels.`);
}
console.log('Pokémon display-name regression tests passed.');

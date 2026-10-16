import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const manifestPath = resolve(webRoot, 'src/assets/generated/pokemon-go-ui/manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const expectedTypeCount = 18;
const expectedHqTypeCount = 18;
const expectedTypeMaskCount = 18;
const expectedUiKeys = [
  'shadow',
  'purified',
  'buddyCrown',
  'shiny',
  'genderMale',
  'genderFemale',
  'fastMove',
  'chargedMove',
  'stardust',
  'experience',
];
const entries = Object.entries(manifest.assets);

const fail = (message) => {
  throw new Error(message);
};

for (const key of expectedUiKeys) {
  if (!manifest.assets[key]) fail(`Local UI asset is missing from the manifest: ${key}`);
}
if (entries.filter(([key]) => key.startsWith('type') && !key.startsWith('typeMask')).length !== expectedTypeCount) {
  fail(`Expected ${expectedTypeCount} local type icons.`);
}
if (entries.filter(([key]) => key.startsWith('hqType')).length !== expectedHqTypeCount) {
  fail(`Expected ${expectedHqTypeCount} local HQ move-type icons.`);
}
if (entries.filter(([key]) => key.startsWith('typeMask')).length !== expectedTypeMaskCount) {
  fail(`Expected ${expectedTypeMaskCount} local move-type mask icons.`);
}

let totalBytes = 0;
for (const [key, asset] of entries) {
  const data = await readFile(resolve(webRoot, asset.localPath));
  if (data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') fail(`${key} is not a PNG file.`);
  if (key.startsWith('hqType')) {
    if (data.readUInt32BE(16) !== 148 || data.readUInt32BE(20) !== 148) {
      fail(`${key} must preserve the original 148x148 HQ artwork bounds.`);
    }
    if (asset.source !== 'Pokémon GO Wiki') fail(`${key} has an unexpected source.`);
  }
  if (key.startsWith('typeMask')) {
    if (data.readUInt32BE(16) !== 512 || data.readUInt32BE(20) !== 512) {
      fail(`${key} must preserve the original 512x512 mask bounds.`);
    }
    if (asset.source !== 'HybridShivam/Pokemon type icons') fail(`${key} has an unexpected source.`);
  }
  if (data.byteLength !== asset.bytes) fail(`${key} byte size does not match its manifest.`);
  if (createHash('sha256').update(data).digest('hex') !== asset.sha256) fail(`${key} checksum does not match.`);
  totalBytes += data.byteLength;
}

const service = await readFile(resolve(webRoot, 'src/services/api.service.ts'), 'utf8');
for (const helper of [
  'getLocalTypeIcon',
  'getLocalHqTypeIcon',
  'getLocalTypeMaskIcon',
  'getLocalItemIcon',
  'getLocalGenderIcon',
  'LocalPokemonGoUi',
]) {
  if (!service.includes(helper)) fail(`APIService does not use ${helper}.`);
}
if (/POKE_ICON_SPRITES_TYPE_API_URL|POKE_TYPES_API_URL/.test(service)) {
  fail('APIService still contains a remote type-icon path.');
}
if (!/getTypeHqSprite[\s\S]*?getLocalHqTypeIcon\(type\)/.test(service)) {
  fail('getTypeHqSprite does not use the dedicated local HQ type artwork.');
}
if (!/getTypeIcon[\s\S]*?getLocalTypeMaskIcon\(type\)/.test(service)) {
  fail('getTypeIcon does not use the dedicated local CSS-mask artwork.');
}

const placeholder = await readFile(resolve(webRoot, 'src/assets/error.png'));
if (placeholder.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') fail('Local placeholder is not a PNG.');
if (!service.includes('LocalPokemonGoUi.placeholder')) fail('APIService does not use the local placeholder.');

console.log(
  `Local UI asset audit passed: ${entries.length + 1} PNG files, ${totalBytes + placeholder.byteLength} bytes, ` +
    'checksums verified for generated assets.'
);

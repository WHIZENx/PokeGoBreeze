import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pngDimensions, sha256, webRoot } from '../support/assetFiles.mjs';

const fail = (message) => {
  throw new Error(message);
};

const auditLocalUiAssets = async () => {
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
    const { width, height } = pngDimensions(data, key);
    if (key.startsWith('hqType')) {
      if (width !== 148 || height !== 148) {
        fail(`${key} must preserve the original 148x148 HQ artwork bounds.`);
      }
      if (asset.source !== 'Pokémon GO Wiki') fail(`${key} has an unexpected source.`);
    }
    if (key.startsWith('typeMask')) {
      if (width !== 512 || height !== 512) {
        fail(`${key} must preserve the original 512x512 mask bounds.`);
      }
      if (asset.source !== 'HybridShivam/Pokemon type icons') fail(`${key} has an unexpected source.`);
    }
    if (data.byteLength !== asset.bytes) fail(`${key} byte size does not match its manifest.`);
    if (sha256(data) !== asset.sha256) fail(`${key} checksum does not match.`);
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
  const { width, height } = pngDimensions(placeholder, 'Local placeholder');
  if (width !== 192 || height !== 192 || placeholder[25] !== 6) {
    fail('Local placeholder must preserve the transparent 192x192 circular artwork.');
  }
  const placeholderSha256 = sha256(placeholder);
  if (placeholderSha256 !== '90e954b3f2d4f8c6460d4a7f8916fb844369c045101e6320d40444d49c4b85fe') {
    fail('Local placeholder does not match the approved theme-safe circular question icon.');
  }
  if (!service.includes('LocalPokemonGoUi.placeholder')) fail('APIService does not use the local placeholder.');

  console.log(
    `Local UI asset audit passed: ${entries.length + 1} PNG files, ${totalBytes + placeholder.byteLength} bytes, ` +
      'checksums verified for generated assets. Placeholder reference: PokeMiners/pogo_assets@df0598b84318f68a5bbe5494caa4292c9b49caae ' +
      '(Images/Menu Icons/btn_question_02_normal_white_shadow.png), adapted for dual-theme contrast.'
  );
};

const auditPokemonIconSheet = async () => {
  const { default: ts } = await import('typescript');
  const assetRoot = resolve(webRoot, 'src/assets/generated/pokemon-icons');
  const manifest = JSON.parse(await readFile(resolve(assetRoot, 'pokemon-icon-index.json'), 'utf8'));
  const sheet = await readFile(resolve(assetRoot, 'pokemonicons-sheet.png'));
  const pokemon = JSON.parse(await readFile(resolve(webRoot, '../api/data/pokemons.json'), 'utf8'));

  const hasLegacyPokemonPickerProps = (source, fileName = 'picker.tsx') => {
    const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let legacyPropsFound = false;
    const visit = (node) => {
      if (
        (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        node.tagName.getText(sourceFile) === 'SelectCardPokemon'
      ) {
        legacyPropsFound = node.attributes.properties.some(
          (attribute) =>
            ts.isJsxAttribute(attribute) && ['sprite', 'onSprite'].includes(attribute.name.getText(sourceFile))
        );
      }
      if (!legacyPropsFound) ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return legacyPropsFound;
  };

  if (!hasLegacyPokemonPickerProps('<SelectCardPokemon sprite="legacy.png" />')) {
    fail('Legacy Pokémon picker prop audit no longer detects sprite.');
  }
  if (!hasLegacyPokemonPickerProps('<SelectCardPokemon onSprite={() => "legacy"} />')) {
    fail('Legacy Pokémon picker prop audit no longer detects onSprite.');
  }
  if (hasLegacyPokemonPickerProps('<PokemonTableIcon sprite="darkrai-mega" />')) {
    fail('Pokémon icon sprite identity must not be treated as a legacy picker prop.');
  }
  const toId = (value = '') =>
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
  const normalize = (value = '', pokemonType = 1) => {
    let id = toId(value);
    if (['', 'unknown', 'unknownpokemon'].includes(id)) return '';
    if ([2, 3].includes(Number(pokemonType))) id = id.replace(/(?:shadow|purified)$/, '');
    id = id
      .replaceAll('hisuian', 'hisui')
      .replaceAll('galarian', 'galar')
      .replaceAll('alolan', 'alola')
      .replaceAll('paldean', 'paldea')
      .replace(/breed$/, '')
      .replace(/exclamationpoint$/, 'exclamation')
      .replace(/questionmark$/, 'question')
      .replace(/eastsea$/, 'east')
      .replace(/female$/, 'f')
      .replace(/complete(?:fifty|ten)percent$/, 'complete')
      .replace(/tenpercent$/, '10')
      .replace(/originalcolor$/, 'original')
      .replace(/familyoffour$/, 'four')
      .replace(/crownedsword$/, 'crowned')
      .replace(/crownedshield$/, 'crowned')
      .replace(/icerider$/, 'ice')
      .replace(/shadowrider$/, 'shadow')
      .replace(/totemalola$/, 'alolatotem')
      .replace(/totembusted$/, 'bustedtotem')
      .replace(/totemdisguised$/, 'totem')
      .replace(/standard$/, '');
    return id === 'marowaktotem' ? 'marowakalolatotem' : id;
  };
  const candidates = (entry) => {
    const base = normalize(entry.baseSpecies, entry.pokemonType);
    return [
      normalize(entry.sprite, entry.pokemonType),
      normalize(entry.slug, entry.pokemonType),
      normalize(entry.fullName, entry.pokemonType),
      normalize(entry.name, entry.pokemonType),
      base ? normalize(`${base}-${entry.form}`, entry.pokemonType) : '',
    ].filter(Boolean);
  };
  const alternateIndex = (entry) => {
    const key = candidates(entry).find((candidate) => manifest.indexes[candidate] !== undefined);
    return key ? { key, index: manifest.indexes[key] } : undefined;
  };

  const { width: imageWidth, height: imageHeight } = pngDimensions(sheet, 'Local icon sheet');
  if (imageWidth !== manifest.sheet.imageWidth || imageHeight !== manifest.sheet.imageHeight) {
    fail(`Manifest dimensions do not match the PNG (${imageWidth}x${imageHeight}).`);
  }
  if (sha256(sheet) !== manifest.source.sheetSha256) {
    fail('Local icon sheet checksum does not match the generated manifest.');
  }

  const cellCount =
    (manifest.sheet.imageWidth / manifest.sheet.cellWidth) * (manifest.sheet.imageHeight / manifest.sheet.cellHeight);
  for (const [key, index] of Object.entries(manifest.indexes)) {
    if (!Number.isInteger(index) || index < 0 || index >= cellCount)
      fail(`${key} has an invalid sheet index: ${index}`);
  }

  const expectedForms = new Map([
    ['ZACIAN:CROWNED_SWORD', 'zaciancrowned'],
    ['ZAMAZENTA:CROWNED_SHIELD', 'zamazentacrowned'],
    ['CALYREX:ICE_RIDER', 'calyrexice'],
    ['CALYREX:SHADOW_RIDER', 'calyrexshadow'],
    ['DECIDUEYE:HISUIAN', 'decidueyehisui'],
    ['DIALGA:ORIGIN', 'dialgaorigin'],
    ['PALKIA:ORIGIN', 'palkiaorigin'],
    ['UNOWN:EXCLAMATION_POINT', 'unownexclamation'],
    ['SHELLOS:EAST_SEA', 'shelloseast'],
    ['FRILLISH:FEMALE', 'frillishf'],
    ['ZYGARDE:TEN_PERCENT', 'zygarde10'],
    ['ZYGARDE:COMPLETE_FIFTY_PERCENT', 'zygardecomplete'],
    ['MAGEARNA:ORIGINAL_COLOR', 'magearnaoriginal'],
    ['MAUSHOLD:FAMILY_OF_FOUR', 'mausholdfour'],
  ]);
  for (const [identity, expectedKey] of expectedForms) {
    const [pokemonId, form] = identity.split(':');
    const entry = pokemon.find((item) => item.pokemonId === pokemonId && item.form === form);
    if (!entry) fail(`Fixture ${identity} is missing from the API Pokémon data.`);
    const resolved = alternateIndex(entry);
    if (resolved?.key !== expectedKey)
      fail(`${identity} resolved to ${resolved?.key ?? 'base species'}, not ${expectedKey}.`);
  }

  const detailFormCardFixtures = [
    [
      { fullName: 'raticate-totem-alola', form: 'totem-alola', baseSpecies: 'raticate', pokemonType: 0 },
      'raticatealolatotem',
    ],
    [{ fullName: 'marowak-totem', form: 'totem', baseSpecies: 'marowak', pokemonType: 0 }, 'marowakalolatotem'],
    [
      { fullName: 'mimikyu-totem-disguised', form: 'totem-disguised', baseSpecies: 'mimikyu', pokemonType: 0 },
      'mimikyutotem',
    ],
    [
      { fullName: 'mimikyu-totem-busted', form: 'totem-busted', baseSpecies: 'mimikyu', pokemonType: 0 },
      'mimikyubustedtotem',
    ],
    [
      { fullName: 'darmanitan-galar-standard', form: 'galar-standard', baseSpecies: 'darmanitan', pokemonType: 1 },
      'darmanitangalar',
    ],
    [
      {
        fullName: 'darmanitan-galar-standard-shadow',
        form: 'galar-standard-shadow',
        baseSpecies: 'darmanitan',
        pokemonType: 2,
      },
      'darmanitangalar',
    ],
    [
      {
        fullName: 'darmanitan-galar-standard-purified',
        form: 'galar-standard-purified',
        baseSpecies: 'darmanitan',
        pokemonType: 3,
      },
      'darmanitangalar',
    ],
    [
      { fullName: 'darmanitan-galar-zen-shadow', form: 'galar-zen-shadow', baseSpecies: 'darmanitan', pokemonType: 2 },
      'darmanitangalarzen',
    ],
    [
      { fullName: 'calyrex-shadow-rider', form: 'shadow-rider', baseSpecies: 'calyrex', pokemonType: 1 },
      'calyrexshadow',
    ],
  ];
  for (const [entry, expectedKey] of detailFormCardFixtures) {
    const resolved = alternateIndex(entry);
    if (resolved?.key !== expectedKey) {
      fail(
        `Pokémon Detail form card ${entry.fullName} resolved to ${resolved?.key ?? 'base species'}, not ${expectedKey}.`
      );
    }
  }

  const tableFiles = [
    'src/pages/Sheets/StatsRanking/StatsRanking.tsx',
    'src/pages/Sheets/DpsTdo/DpsTdo.tsx',
    'src/pages/Search/Types/Types.tsx',
    'src/pages/Move/Move.tsx',
    'src/components/Commons/Buttons/ButtonGroupForm.tsx',
  ];
  for (const relativePath of tableFiles) {
    const source = await readFile(resolve(webRoot, relativePath), 'utf8');
    if (!source.includes('<PokemonTableIcon')) fail(`${relativePath} is not using the local sheet component.`);
    if (/getPokeIconSprite\(row(?:\.pokemon)?\.sprite/.test(source)) {
      fail(`${relativePath} still requests a per-Pokémon table icon.`);
    }
  }

  const dropdownIconFiles = [
    'src/components/Card/CardPokemon.tsx',
    'src/components/Commons/Selects/SelectPokemon.tsx',
    'src/components/Find/Find.tsx',
    'src/pages/Search/Pokemon/Search.tsx',
    'src/pages/PVP/Battle/Select.tsx',
    'src/pages/Trainer/TrainerLab.tsx',
  ];
  for (const relativePath of dropdownIconFiles) {
    const source = await readFile(resolve(webRoot, relativePath), 'utf8');
    if (!source.includes('<PokemonTableIcon'))
      fail(`${relativePath} is not using the local sheet in its Pokémon picker.`);
    if (hasLegacyPokemonPickerProps(source, relativePath)) {
      fail(`${relativePath} still passes the legacy per-Pokémon icon props to a picker.`);
    }
  }

  const selectCardSource = await readFile(
    resolve(webRoot, 'src/components/Commons/Selects/SelectCardPokemon.tsx'),
    'utf8'
  );
  if (/getPokeIconSprite|<img\b/.test(selectCardSource)) {
    fail('SelectCardPokemon still renders a per-Pokémon image request.');
  }

  const alternateRows = pokemon.filter((entry) => alternateIndex(entry)).length;
  console.log(
    `Pokémon icon sheet audit passed: ${Object.keys(manifest.indexes).length} alternate indexes, ` +
      `${alternateRows}/${pokemon.length} data rows use a form cell; remaining rows use their National Pokédex cell.`
  );
};

const [target = 'all', ...extraArgs] = process.argv.slice(2);
if (extraArgs.length || !['all', 'ui', 'icon-sheet'].includes(target)) {
  throw new Error('Usage: node scripts/audits/auditAssets.mjs [ui|icon-sheet|all]');
}

if (target === 'ui' || target === 'all') await auditLocalUiAssets();
if (target === 'icon-sheet' || target === 'all') await auditPokemonIconSheet();

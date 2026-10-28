#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(scriptDir, '../..');
const workspaceRoot = resolve(webRoot, '../..');

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const argument = process.argv[index];
  if (!argument.startsWith('--')) continue;
  const [key, inlineValue] = argument.slice(2).split('=', 2);
  const nextValue = process.argv[index + 1];
  const value = inlineValue ?? (nextValue && !nextValue.startsWith('--') ? process.argv[++index] : 'true');
  args.set(key, value);
}

const baseUrl = (args.get('base-url') ?? 'http://localhost:9000').replace(/\/$/, '');
const fromId = Number.parseInt(args.get('from') ?? '1', 10);
const timeoutMs = Number.parseInt(args.get('timeout') ?? '20000', 10);
const viewportWidth = Math.max(320, Number.parseInt(args.get('viewport-width') ?? '1280', 10));
const viewportHeight = Math.max(568, Number.parseInt(args.get('viewport-height') ?? '900', 10));
const auditLoadingContinuity = args.get('audit-loading-continuity') === 'true';
const auditEvolutionTooltip = args.get('audit-evolution-tooltip') === 'true';
const auditEvolutionOverlap = args.get('audit-evolution-overlap') !== 'false';
const navigationOnly = args.get('navigation-only') === 'true';
const multipleFormsOnly = args.get('multiple-forms-only') === 'true';
const formSwitchCycles = Math.max(1, Number.parseInt(args.get('form-switch-cycles') ?? '1', 10));
const outputPath = resolve(workspaceRoot, args.get('output') ?? 'artifacts/pokemon-details-audit.json');
const chromePath = args.get('chrome') ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const normalize = (value) =>
  String(value ?? '')
    .trim()
    .replaceAll('-', '_')
    .replaceAll(' ', '_')
    .toUpperCase();

const normalizeForm = (value) => normalize(value) || 'NORMAL';
const normalizeAssetUrl = (value) => {
  try {
    return decodeURI(String(value ?? ''));
  } catch {
    return String(value ?? '');
  }
};
const normalizeMove = (value) =>
  normalize(value)
    .replace(/^V\d{4}_MOVE_/, '')
    .replace(/_FAST$/, '');
const normalizePokemonType = (value) => (Number(value) === 0 ? 1 : Number(value));
const profileMatchesButton = (page, index) => {
  const button = page?.buttons?.[index];
  if (!button || !page.profileAura?.src || page.profileAura.loading) return false;
  const expected = [button.sprites.frontArtwork, button.sprites.frontHome, button.sprites.frontDefault]
    .filter(Boolean)
    .map(normalizeAssetUrl);
  return expected.length === 0 || expected.includes(normalizeAssetUrl(page.profileAura.src));
};
const normalizeIconCandidate = (value, pokemonType) => {
  let identity = String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
  if (['', 'unknown', 'unknownpokemon'].includes(identity)) return '';
  if ([2, 3].includes(normalizePokemonType(pokemonType))) {
    identity = identity.replace(/(?:shadow|purified)$/, '');
  }
  identity = identity
    .replaceAll('hisuian', 'hisui')
    .replaceAll('galarian', 'galar')
    .replaceAll('alolan', 'alola')
    .replaceAll('paldean', 'paldea')
    .replace(/breed$/, '')
    .replace(/female(?=mega$)/, 'f')
    .replace(/male(?=mega$)/, 'm')
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
  return identity === 'marowaktotem' ? 'marowakalolatotem' : identity;
};

const [pokemons, pokemonAssets] = await Promise.all([
  readFile(resolve(workspaceRoot, 'modules/api/data/pokemons.json'), 'utf8').then(JSON.parse),
  readFile(resolve(workspaceRoot, 'modules/api/data/assets.json'), 'utf8').then(JSON.parse),
]);
const pokemonAssetsById = new Map(pokemonAssets.map((asset) => [Number(asset.id), asset]));
const hasAnimationForForm = (id, form, pokemonType) => {
  const normalizedForm = normalizeForm(form);
  const candidateTypes = [2, 3].includes(Number(pokemonType)) ? [Number(pokemonType), 1, 0] : [Number(pokemonType)];
  return candidateTypes.some((candidateType) =>
    pokemonAssetsById
      .get(Number(id))
      ?.animation?.some(
        (animation) =>
          normalizeForm(animation.form) === normalizedForm &&
          Number(animation.pokemonType) === candidateType &&
          animation.sources?.length
      )
  );
};
const iconManifest = JSON.parse(
  await readFile(resolve(webRoot, 'src/assets/generated/pokemon-icons/pokemon-icon-index.json'), 'utf8')
);
const iconIndexes = iconManifest.indexes;
const lastPokemonId = Math.max(...pokemons.map((pokemon) => Number(pokemon.num) || 0));
const toId = Math.min(Number.parseInt(args.get('to') ?? String(lastPokemonId), 10), lastPokemonId);
const requestedIds = new Set(
  (args.get('ids') ?? '')
    .split(',')
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value) && value >= fromId && value <= toId)
);
const requestedSequence = (args.get('id-sequence') ?? '')
  .split(',')
  .map((value) => Number.parseInt(value, 10))
  .filter((value) => Number.isInteger(value) && value >= fromId && value <= toId);
const requestedSequenceIds = new Set(requestedSequence);
const rowsById = new Map();
for (const pokemon of pokemons) {
  const id = Number(pokemon.num);
  if (
    id < fromId ||
    id > toId ||
    (requestedIds.size && !requestedIds.has(id)) ||
    (requestedSequenceIds.size && !requestedSequenceIds.has(id))
  )
    continue;
  const rows = rowsById.get(id) ?? [];
  rows.push(pokemon);
  rowsById.set(id, rows);
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.sequence = 0;
    this.pending = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    await new Promise((resolveOpen, rejectOpen) => {
      const timer = setTimeout(() => rejectOpen(new Error('Timed out connecting to Chrome DevTools')), timeoutMs);
      this.socket.addEventListener('open', () => {
        clearTimeout(timer);
        resolveOpen();
      });
      this.socket.addEventListener('error', (event) => {
        clearTimeout(timer);
        rejectOpen(event.error ?? new Error('Chrome DevTools WebSocket failed'));
      });
    });
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  send(method, params = {}, sessionId) {
    const id = ++this.sequence;
    return new Promise((resolveMessage, rejectMessage) => {
      this.pending.set(id, { resolve: resolveMessage, reject: rejectMessage });
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }

  close() {
    this.socket?.close();
  }
}

const delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));

const normalizeCanonicalIdentity = (id, value) => {
  let identity = normalize(value)
    .replace(/_MALE$/, '')
    .replace(/_GALAR$/, '_GALARIAN')
    .replace(/_HISUI$/, '_HISUIAN')
    .replace(/_GALAR_/, '_GALARIAN_')
    .replace(/_CAP$/, '')
    .replace(/PALDEA_COMBAT_BREED$/, 'PALDEA_COMBAT')
    .replace(/PALDEA_BLAZE_BREED$/, 'PALDEA_BLAZE')
    .replace(/PALDEA_AQUA_BREED$/, 'PALDEA_AQUA')
    .replace(/_POWER_CONSTRUCT$/, '')
    .replace(/_BATTLE_BOND$/, '')
    .replace(/_OF_MANY_BATTLES$/, '_HERO')
    .replace(/_POM_POM$/, '_POMPOM')
    .replace(/_OWN_TEMPO$/, '_DUSK')
    .replace('NECROZMA_DAWN', 'NECROZMA_DAWN_WINGS')
    .replace('NECROZMA_DUSK', 'NECROZMA_DUSK_MANE')
    .replace('BASCULEGION_MALE', 'BASCULEGION')
    .replace(/_PLUMAGE$/, '')
    .replace(/_ROAMING$/, '')
    .replace(/_SEGMENT$/, '')
    .replace(/_M$/, '_MALE')
    .replace(/_F$/, '_FEMALE');
  if (id === 422 || id === 423) identity = identity.replace(/_EAST$/, '_EAST_SEA').replace(/_WEST$/, '_WEST_SEA');
  if (id === 718) identity = identity.replace(/_10$/, '_TEN_PERCENT').replace(/_50$/, '_FIFTY_PERCENT');
  if (id === 201) {
    identity = identity
      .replace(/^UNOWN_/, '')
      .replace(/_EXCLAMATION$/, '_EXCLAMATION_POINT')
      .replace(/^EXCLAMATION$/, 'EXCLAMATION_POINT')
      .replace(/_QUESTION$/, '_QUESTION_MARK')
      .replace(/^QUESTION$/, 'QUESTION_MARK');
  }
  if (id === 801) identity = identity.replace(/_ORIGINAL$/, '_ORIGINAL_COLOR');
  if (id === 888) identity = identity.replace(/_CROWNED$/, '_CROWNED_SWORD');
  if (id === 889) identity = identity.replace(/_CROWNED$/, '_CROWNED_SHIELD');
  if (id === 898) {
    identity = identity.replace(/_ICE$/, '_ICE_RIDER').replace(/_SHADOW$/, '_SHADOW_RIDER');
  }
  if (id === 386) identity = identity.replace(/_NORMAL$/, '');
  if (id === 20) identity = identity.replace(/_TOTEM_ALOLA$/, '_ALOLA_TOTEM');
  if (id === 105) identity = identity.replace(/^MAROWAK_TOTEM$/, 'MAROWAK_ALOLA_TOTEM');
  if (id === 778) {
    identity = identity
      .replace(/_TOTEM_DISGUISED$/, '_TOTEM')
      .replace(/_TOTEM_BUSTED$/, '_BUSTED_TOTEM')
      .replace(/_DISGUISED$/, '');
  }
  if (id === 555) identity = identity.replace(/_GALARIAN_STANDARD$/, '_GALARIAN');
  if ((id === 664 || id === 665) && !identity.includes('_')) identity += '_ICY_SNOW';
  if (id === 664 || id === 665) identity = identity.replace(/POKE_BALL$/, 'POKEBALL');
  if (id === 716) identity = identity.replace(/_ACTIVE$/, '');
  if (id === 1007) {
    identity = identity.replace(/_APEX$/, '_APEX_BUILD');
    if (identity === 'KORAIDON') identity = 'KORAIDON_APEX_BUILD';
  }
  if (id === 1008) {
    identity = identity.replace(/_ULTIMATE$/, '_ULTIMATE_MODE');
    if (identity === 'MIRAIDON') identity = 'MIRAIDON_ULTIMATE_MODE';
  }
  if (id === 875 && identity === 'EISCUE') identity = 'EISCUE_ICE';
  if (id === 877 && identity === 'MORPEKO') identity = 'MORPEKO_FULL_BELLY';
  if (id === 925 && identity === 'MAUSHOLD') identity = 'MAUSHOLD_FAMILY_OF_FOUR';
  if (id === 931 && identity === 'SQUAWKABILLY') identity = 'SQUAWKABILLY_GREEN';
  if (id === 964 && identity === 'PALAFIN') identity = 'PALAFIN_ZERO';
  if (id === 1012 && identity === 'POLTCHAGEIST') identity = 'POLTCHAGEIST_COUNTERFEIT';
  if (id === 1013 && identity === 'SINISTCHA') identity = 'SINISTCHA_UNREMARKABLE';
  if (id === 978 && identity === 'TATSUGIRI') identity = 'TATSUGIRI_CURLY';
  if (id === 982 && identity === 'DUDUNSPARCE') identity = 'DUDUNSPARCE_TWO';
  return identity;
};

const moveCount = (row) =>
  [
    ...(row.quickMoves ?? []),
    ...(row.cinematicMoves ?? []),
    ...(row.eliteQuickMoves ?? []),
    ...(row.eliteCinematicMoves ?? []),
    ...(row.specialMoves ?? []),
    ...(row.exclusiveMoves ?? []),
  ].length;

const preferredGoRows = (id, rows) =>
  rows.filter((row) => {
    const identity = normalizeCanonicalIdentity(id, row.fullName);
    const rowPriority =
      Number(normalizeForm(row.form) !== 'NORMAL') * 8 +
      Number(Boolean(row.releasedGO)) * 4 +
      Number(moveCount(row) > 0) * 2;
    return !rows.some(
      (candidate) =>
        candidate !== row &&
        normalizeCanonicalIdentity(id, candidate.fullName) === identity &&
        Number(normalizeForm(candidate.form) !== 'NORMAL') * 8 +
          Number(Boolean(candidate.releasedGO)) * 4 +
          Number(moveCount(candidate) > 0) * 2 >
          rowPriority
    );
  });

const buttonMatchScore = (id, button, row) => {
  if (normalizePokemonType(button.pokemonType) !== normalizePokemonType(row.pokemonType)) return 0;
  if (normalizeCanonicalIdentity(id, button.name) === normalizeCanonicalIdentity(id, row.fullName)) return 3;
  if (normalizeForm(button.form) === normalizeForm(row.form)) return 2;
  if (
    (normalizeForm(row.form) === 'NORMAL' || normalizeForm(row.form) === normalizeForm(row.baseForme)) &&
    button.formId === id
  ) {
    return 1;
  }
  return 0;
};

const findButtonIndexForRow = (id, buttons, row) => {
  let bestIndex = -1;
  let bestScore = 0;
  buttons.forEach((button, index) => {
    const score = buttonMatchScore(id, button, row);
    if (score > bestScore) {
      bestIndex = index;
      bestScore = score;
    }
  });
  return bestIndex;
};

const profileBaseIdentity = (id, button) => {
  const pokemonType = normalizePokemonType(button.pokemonType);
  const modifier = pokemonType === 2 ? 'SHADOW' : pokemonType === 3 ? 'PURIFIED' : undefined;
  const form = modifier
    ? normalizeForm(button.form).replace(new RegExp(`_${modifier}$|^${modifier}$`), '') || 'NORMAL'
    : normalizeForm(button.form);
  return normalizeCanonicalIdentity(id, form || 'NORMAL');
};

const expectedFormCardIconIndex = (id, button) => {
  const baseForms = new Set(['', 'normal', 'ordinary', 'standard', 'hero']);
  const formId = normalizeIconCandidate(button.form, button.pokemonType);
  const candidates = [
    button.name,
    button.iconName,
    !baseForms.has(formId) && button.iconBaseSpecies ? `${button.iconBaseSpecies}-${button.form}` : '',
    button.form,
  ]
    .map((value) => normalizeIconCandidate(value, button.pokemonType))
    .filter(Boolean);
  const alternate = candidates.find((candidate) => iconIndexes[candidate] !== undefined);
  return alternate ? iconIndexes[alternate] : Math.min(Math.max(Math.trunc(id), 0), 1025);
};

const startChrome = async () => {
  const profilePath = await mkdtemp(join(tmpdir(), 'pokebreeze-pokemon-audit-'));
  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--disable-background-networking',
      '--no-first-run',
      '--no-default-browser-check',
      `--window-size=${viewportWidth},${viewportHeight}`,
      '--remote-debugging-port=0',
      `--user-data-dir=${profilePath}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );

  const debuggerUrl = await new Promise((resolveUrl, rejectUrl) => {
    const timer = setTimeout(() => rejectUrl(new Error('Chrome did not expose a DevTools URL')), timeoutMs);
    let stderr = '';
    chrome.stderr.setEncoding('utf8');
    chrome.stderr.on('data', (chunk) => {
      stderr += chunk;
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        resolveUrl(match[1]);
      }
    });
    chrome.once('exit', (code) => {
      clearTimeout(timer);
      rejectUrl(new Error(`Chrome exited before startup (code ${code})`));
    });
  });

  return { chrome, debuggerUrl, profilePath };
};

let browser;
let client;

const evaluate = async (expression) => {
  const result = await client.send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    browser.sessionId
  );
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  }
  return result.result.value;
};

const waitFor = async (readValue, predicate, description) => {
  const deadline = Date.now() + timeoutMs;
  let lastValue;
  let lastError;
  while (Date.now() < deadline) {
    try {
      lastValue = await readValue();
      if (predicate(lastValue)) return lastValue;
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }
  throw new Error(
    `Timed out waiting for ${description}; last=${JSON.stringify(lastValue)}${lastError ? `; error=${lastError.message}` : ''}`
  );
};

const readPage = () =>
  evaluate(`(() => {
    const page = document.querySelector('[data-testid="pokemon-details-page"]');
    if (!page) return null;
    const infoTable = document.querySelector('[data-testid="pokemon-info-table"]');
    const buttons = [...document.querySelectorAll('.form-container button[data-form]')].map((button, index) => {
      const icon = button.querySelector('[data-pokemon-icon-index]');
      return {
        index,
        name: button.dataset.formName ?? '',
        form: button.dataset.form ?? '',
        iconName: button.dataset.iconName ?? '',
        iconBaseSpecies: button.dataset.iconBaseSpecies ?? '',
        pokemonType: Number(button.dataset.pokemonType),
        formId: Number(button.dataset.formId),
        sprites: {
          frontDefault: button.dataset.spriteFrontDefault ?? '',
          frontFemale: button.dataset.spriteFrontFemale ?? '',
          frontShiny: button.dataset.spriteFrontShiny ?? '',
          frontShinyFemale: button.dataset.spriteFrontShinyFemale ?? '',
          frontHome: button.dataset.spriteFrontHome ?? '',
          frontArtwork: button.dataset.spriteFrontArtwork ?? '',
        },
        active: button.getAttribute('aria-pressed') === 'true',
        label: button.innerText.trim().replace(/\\s+/g, ' '),
        iconIndex: icon ? Number(icon.dataset.pokemonIconIndex) : null,
      };
    });
    const moves = (selector) => [...document.querySelectorAll(selector + ' tr')]
      .map((row) => [...row.querySelectorAll('a span.tw-mr-1')]
        .map((span) => span.textContent?.trim() ?? '')
      .find(Boolean) ?? '')
      .filter(Boolean);
    const bounds = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      };
    };
    const evolutionNodes = [...document.querySelectorAll('[data-testid="evolution-node"]')].map((node) => ({
      ...(() => {
        const name = node.querySelector('[data-testid="evolution-pokemon-name"]');
        if (!name) return { nameLines: 0 };
        const lineHeight = Number.parseFloat(getComputedStyle(name).lineHeight);
        return { nameLines: Number.isFinite(lineHeight) ? Math.round(name.getBoundingClientRect().height / lineHeight) : 0 };
      })(),
      key: (node.dataset.evolutionStage ?? '') + ':' + (node.dataset.evolutionIndex ?? ''),
      stage: Number(node.dataset.evolutionStage),
      id: Number(node.dataset.evolutionId),
      form: node.dataset.evolutionForm ?? '',
      sprite: node.querySelector('[data-testid="evolution-pokemon-image"]')?.getAttribute('src') ?? '',
      bounds: bounds(node),
    }));
    const evolutionContainer = document.querySelector('[data-testid="evolution-container"]');
    const megaCards = [...document.querySelectorAll('[data-testid="mega-evolution-card"]')].map((card) => {
      const benefits = card.querySelector('[data-testid="mega-level-benefits"]');
      return {
        benefitsOpen: benefits?.hasAttribute('open') ?? false,
        expectedLevelRows: Number(card.dataset.megaLevelCount ?? 0),
        levelRows: card.querySelectorAll('[data-testid="mega-level-row"]').length,
        horizontalOverflow: card.scrollWidth > card.clientWidth + 2,
      };
    });
    const megaSection = document.querySelector('[data-testid="mega-evolution-section"]');
    const megaScroll = document.querySelector('[data-testid="mega-evolution-scroll"]');
    const evolutionSection = document.querySelector('[data-testid="evolution-section"]');
    const megaSectionStyle = megaSection ? getComputedStyle(megaSection) : null;
    const formChangeSection = document.querySelector('[data-testid="form-change-section"]');
    const formChangeOrigin = formChangeSection?.querySelector('[data-testid="form-change-origin"]');
    const formChangeTargets = formChangeSection
      ? [...formChangeSection.querySelectorAll('[data-testid="form-change-target"]')].map((target) => ({
          ...bounds(target),
          target: target.dataset.formChangeTarget ?? '',
        }))
      : [];
    const formChangeDetails = formChangeSection
      ? [...formChangeSection.querySelectorAll('[data-testid="form-change-detail"]')].map((detail) => ({
          bounds: bounds(detail),
          horizontalOverflow: detail.scrollWidth > detail.clientWidth + 2,
        }))
      : [];
    const fusionSection = document.querySelector('[data-testid="fusion-section"]');
    const fusionOrigins = fusionSection ? [...fusionSection.querySelectorAll('[data-testid="fusion-origin"]')] : [];
    const fusionTargets = fusionSection ? [...fusionSection.querySelectorAll('[data-testid="fusion-target"]')] : [];
    const profileImage = document.querySelector('[data-testid="pokemon-profile-image"]');
    const formVarietiesContent = document.querySelector('[data-testid="form-varieties-content"]');
    const genderRatioContent = document.querySelector('[data-testid="gender-ratio-content"]');
    const statsRanking = document.querySelector('[data-testid="pokemon-stats-ranking"]');
    const informationSection = document.querySelector('[data-testid="pokemon-information"]');
    const statsBars = [...document.querySelectorAll('[data-testid="pokemon-stat-bar"]')];
    const stats = Object.fromEntries(
      statsBars.map((stat) => [
        stat.dataset.statTag ?? '',
        Number(stat.dataset.statValue),
      ])
    );
    const statsLoading = statsRanking?.getAttribute('aria-busy') === 'true';
    const statsLoadingBars = statsBars.filter((stat) => stat.dataset.statLoading === 'true').length;
    const informationLoading = informationSection?.getAttribute('aria-busy') === 'true';
    const informationLoadingLabel = informationSection?.textContent?.includes('Loading information…') ?? false;
    const evolutionEdges = [...document.querySelectorAll('[data-testid="evolution-edge"]')].map((edge) => {
      const edgeBounds = bounds(edge);
      let lineOverlapsCard = false;
      for (
        let x = edgeBounds.left + 2;
        ${auditEvolutionOverlap ? 'x < edgeBounds.right && !lineOverlapsCard' : 'false'};
        x += 4
      ) {
        for (let y = edgeBounds.top + 2; y < edgeBounds.bottom; y += 4) {
          const stack = document.elementsFromPoint(x, y);
          const cardIndex = stack.findIndex((element) => element === edge || edge.contains(element));
          const arrowIndex = stack.findIndex(
            (element) =>
              element.closest?.('[data-testid="evolution-connector-canvas"]') && !edge.contains(element)
          );
          if (cardIndex >= 0 && arrowIndex >= 0 && arrowIndex < cardIndex) {
            lineOverlapsCard = true;
            break;
          }
        }
      }
      return {
        source: edge.dataset.evolutionSource ?? '',
        target: edge.dataset.evolutionTarget ?? '',
        targetForm: edge.dataset.evolutionTargetForm ?? '',
        labelAnchor: edge.dataset.evolutionLabelAnchor ?? '',
        layer: Number(edge.dataset.evolutionLayer),
        sourceGenderRequirement: edge.dataset.evolutionGenderRequirement ?? '',
        genderRequirement: edge.querySelector('[data-testid="MaleIcon"]')
          ? 'MALE'
          : edge.querySelector('[data-testid="FemaleIcon"]')
            ? 'FEMALE'
            : '',
        lineOverlapsCard,
        labelLayer: Number.parseInt(getComputedStyle(edge.parentElement).zIndex, 10),
        canvasLayer: Number.parseInt(
          getComputedStyle(
            edge.closest('[data-testid="evolution-connector"]')?.querySelector(
              '[data-testid="evolution-connector-canvas"]'
            )
          ).zIndex,
          10
        ),
        bounds: edgeBounds,
      };
    });
    return {
      id: Number(page.dataset.pokemonId),
      viewportWidth: window.innerWidth,
      busy: page.getAttribute('aria-busy') === 'true',
      selectedName: page.dataset.selectedName ?? '',
      selectedForm: page.dataset.selectedForm ?? '',
      selectedPokemonType: Number(page.dataset.selectedPokemonType),
      detailFullName: page.dataset.detailFullName ?? '',
      detailForm: page.dataset.detailForm ?? '',
      detailBodyName: page.dataset.detailBodyName ?? '',
      bodyFormNames: (page.dataset.bodyFormNames ?? '').split(',').filter(Boolean),
      detailPokemonType: Number(page.dataset.detailPokemonType),
      detailTypes: (page.dataset.detailTypes ?? '').split(',').filter(Boolean),
      profileAura: profileImage
        ? {
            loading: profileImage.getAttribute('aria-busy') === 'true',
            modifier: profileImage.dataset.profileModifier ?? '',
            src: profileImage.querySelector('img')?.currentSrc || profileImage.querySelector('img')?.getAttribute('src') || '',
            beforeBackground: getComputedStyle(profileImage, '::before').backgroundImage,
            afterBackground: getComputedStyle(profileImage, '::after').backgroundImage,
          }
        : null,
      stats,
      statsLoading,
      statsBars: statsBars.length,
      statsLoadingBars,
      informationLoading,
      informationLoadingLabel,
      informationTypes: informationSection?.dataset.informationTypes ?? '',
      detailLayout: {
        formVarieties: formVarietiesContent ? bounds(formVarietiesContent) : null,
        genderRatio: genderRatioContent ? bounds(genderRatioContent) : null,
        statsRanking: statsRanking ? bounds(statsRanking) : null,
        information: informationSection ? bounds(informationSection) : null,
      },
      bodyWeight: infoTable?.dataset.bodyWeight ?? '',
      bodyHeight: infoTable?.dataset.bodyHeight ?? '',
      title: document.title,
      href: location.href,
      bodyText: document.body.innerText,
      evolutionInfoButton: Boolean(document.querySelector('[data-testid="evolution-info-button"]')),
      evolutionTooltipOpen: Boolean(document.querySelector('.MuiTooltip-popper .info-evo')),
      evolutionTooltipConditions: [
        ...new Set(
          [...document.querySelectorAll('.MuiTooltip-popper [data-evolution-condition]')].flatMap((item) =>
            (item.dataset.evolutionCondition ?? '').split(' ').filter(Boolean)
          )
        ),
      ],
      evolutionTooltipIcons: [...document.querySelectorAll('.MuiTooltip-popper [data-evolution-condition]')].map(
        (item) => ({
          conditions: (item.dataset.evolutionCondition ?? '').split(' ').filter(Boolean),
          icon: item.dataset.evolutionIcon ?? '',
        })
      ),
      evolutionDetailConditions: [...document.querySelectorAll('[data-evolution-detail-condition]')].map((item) => ({
        condition: item.dataset.evolutionDetailCondition ?? '',
        icon: item.dataset.evolutionIcon ?? '',
      })),
      evolutionStackingContext: evolutionContainer
        ? {
            isolation: getComputedStyle(evolutionContainer).isolation,
            zIndex: getComputedStyle(evolutionContainer).zIndex,
          }
        : null,
      evolutionOverflow: evolutionContainer
        ? {
            bounds: bounds(evolutionContainer),
            firstNode: evolutionNodes[0]?.bounds ?? null,
            scrollLeft: evolutionContainer.scrollLeft,
            clientHeight: evolutionContainer.clientHeight,
            scrollHeight: evolutionContainer.scrollHeight,
            vertical: evolutionContainer.scrollHeight > evolutionContainer.clientHeight + 2,
          }
        : null,
      buttons,
      megaCards,
      megaScrollLayout:
        megaScroll && megaCards.length
          ? {
              bounds: bounds(megaScroll),
              firstCard: bounds(document.querySelector('[data-testid="mega-evolution-card"]')),
              scrollLeft: megaScroll.scrollLeft,
              clientWidth: megaScroll.clientWidth,
              scrollWidth: megaScroll.scrollWidth,
            }
          : null,
      megaSectionSeparator: megaSectionStyle
        ? {
            borderTop: megaSectionStyle.borderTopStyle,
            borderLeft: megaSectionStyle.borderLeftStyle,
          }
        : null,
      megaSectionLayout:
        megaSection && evolutionSection
          ? {
              evolution: bounds(evolutionSection),
              mega: bounds(megaSection),
            }
          : null,
      formChangeLayout:
        formChangeSection && formChangeOrigin
          ? {
              bounds: bounds(formChangeSection),
              path: formChangeSection.dataset.formChangePath ?? '',
              origin: bounds(formChangeOrigin),
              targets: formChangeTargets,
              details: formChangeDetails,
            }
          : null,
      fusionLayout: fusionSection
        ? {
            bounds: bounds(fusionSection),
            origins: fusionOrigins.map(bounds),
            targets: fusionTargets.map((target) => ({
              ...bounds(target),
              form: target.dataset.fusionTargetForm ?? '',
              pokemonType: Number(target.dataset.fusionTargetPokemonType),
              imageSrc: target.querySelector('[data-testid="evolution-pokemon-image"]')?.getAttribute('src') ?? '',
            })),
          }
        : null,
      renderedFormSprites: {
        defaults: [...document.querySelectorAll('[data-testid="pokemon-form-default-sprite"]')]
          .map((image) => image.getAttribute('src') ?? '')
          .filter(Boolean),
        shiny: [...document.querySelectorAll('[data-testid="pokemon-form-shiny-sprite"]')]
          .map((image) => image.getAttribute('src') ?? '')
          .filter(Boolean),
      },
      fastMoves: moves('[data-testid="pokemon-fast-moves"]'),
      chargedMoves: moves('[data-testid="pokemon-charged-moves"]'),
      evolutionNodes,
      evolutionEdges,
    };
  })()`);

const startBodyTransitionCapture = () =>
  evaluate(`(() => {
    const table = document.querySelector('[data-testid="pokemon-info-table"]');
    window.__pokemonBodyTransitions = [];
    if (!table) return;
    const capture = () => window.__pokemonBodyTransitions.push({
      weight: table.dataset.bodyWeight ?? '',
      height: table.dataset.bodyHeight ?? '',
    });
    capture();
    window.__pokemonBodyObserver?.disconnect();
    window.__pokemonBodyObserver = new MutationObserver(capture);
    window.__pokemonBodyObserver.observe(table, {
      attributes: true,
      attributeFilter: ['data-body-weight', 'data-body-height'],
    });
  })()`);

const readBodyTransitions = () =>
  evaluate(`(() => {
    window.__pokemonBodyObserver?.disconnect();
    const transitions = window.__pokemonBodyTransitions ?? [];
    window.__pokemonBodyTransitions = [];
    return transitions.filter((value, index) =>
      index === 0 || value.weight !== transitions[index - 1].weight || value.height !== transitions[index - 1].height
    );
  })()`);

const validateBodyTransition = (issues, id, context, transitions) => {
  if (transitions.some((value) => value.weight === '' || value.height === '')) {
    addIssue(issues, id, 'form_body_value_cleared_during_switch', { ...context, transitions });
  }
  if (transitions.length > 2) {
    addIssue(issues, id, 'form_body_multiple_updates_during_switch', { ...context, transitions });
  }
};

const navigate = async (id, isInitial) => {
  const url = `${baseUrl}/pokemon/${id}`;
  if (isInitial) {
    await client.send('Page.navigate', { url }, browser.sessionId);
  } else {
    await evaluate(`(() => {
      history.pushState({}, '', ${JSON.stringify(`/pokemon/${id}`)});
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    })()`);
  }
  return waitFor(
    readPage,
    (page) =>
      page?.id === id &&
      !page.busy &&
      !page.profileAura?.loading &&
      page.buttons.length > 0 &&
      page.detailFullName &&
      page.title.includes(`#${id}`),
    `Pokémon #${id}`
  );
};

const addIssue = (issues, id, code, details = {}) => issues.push({ id, code, ...details });

const expectedMoves = (row) => {
  const pokemonType = normalizePokemonType(row.pokemonType);
  return {
    fast: [...(row.quickMoves ?? []), ...(row.eliteQuickMoves ?? [])].map(normalizeMove),
    charged: [
      ...(row.cinematicMoves ?? []),
      ...(row.eliteCinematicMoves ?? []),
      ...(pokemonType === 3 ? (row.purifiedMoves ?? []) : []),
      ...(pokemonType === 2 ? (row.shadowMoves ?? []) : []),
      ...(row.specialMoves ?? []),
      ...(row.exclusiveMoves ?? []),
    ].map(normalizeMove),
  };
};

const validateUniqueMoveRows = (issues, id, context, page) => {
  for (const [moveType, moves] of [
    ['fast', page.fastMoves.map(normalizeMove)],
    ['charged', page.chargedMoves.map(normalizeMove)],
  ]) {
    const duplicates = [...new Set(moves.filter((move, index) => moves.indexOf(move) !== index))];
    if (duplicates.length) {
      addIssue(issues, id, 'duplicate_move_rows', { ...context, moveType, duplicates, actual: moves });
    }
  }
};

const validateModifierFormSprites = (issues, id, context, button, page) => {
  if (![2, 3].includes(normalizePokemonType(button.pokemonType))) return;
  const modifier = normalizePokemonType(button.pokemonType) === 2 ? 'SHADOW' : 'PURIFIED';
  const baseForm = normalizeForm(normalizeForm(button.form).replace(new RegExp(`_${modifier}$|^${modifier}$`), ''));
  for (const node of page.evolutionNodes) {
    if (hasAnimationForForm(node.id, node.form, button.pokemonType) && !/\.gif(?:$|\?)/i.test(node.sprite)) {
      addIssue(issues, id, 'modifier_evolution_gif_missing', {
        ...context,
        evolutionId: node.id,
        evolutionForm: node.form,
        imageSrc: node.sprite,
      });
    }
  }
  const pokeApiBaseButton = page.buttons.find(
    (candidate) =>
      ![2, 3].includes(normalizePokemonType(candidate.pokemonType)) &&
      normalizeCanonicalIdentity(id, candidate.form) === normalizeCanonicalIdentity(id, baseForm)
  );
  const expectedProfile = [
    pokeApiBaseButton?.sprites.frontArtwork,
    pokeApiBaseButton?.sprites.frontHome,
    pokeApiBaseButton?.sprites.frontDefault,
  ].find(Boolean);
  if (expectedProfile && normalizeAssetUrl(page.profileAura?.src) !== normalizeAssetUrl(expectedProfile)) {
    addIssue(issues, id, 'modifier_profile_sprite_mismatch', {
      ...context,
      expected: expectedProfile,
      actual: page.profileAura?.src,
    });
  }
  const baseDefaults = [pokeApiBaseButton?.sprites.frontDefault, pokeApiBaseButton?.sprites.frontFemale].filter(
    Boolean
  );
  const baseShiny = [pokeApiBaseButton?.sprites.frontShiny, pokeApiBaseButton?.sprites.frontShinyFemale].filter(
    Boolean
  );
  const expectedDefaults = baseDefaults.length
    ? baseDefaults
    : [button.sprites.frontDefault, button.sprites.frontFemale].filter(Boolean);
  const expectedShiny = baseShiny.length
    ? baseShiny
    : [button.sprites.frontShiny, button.sprites.frontShinyFemale].filter(Boolean);
  const renderedSprites = [...page.renderedFormSprites.defaults, ...page.renderedFormSprites.shiny];
  if (
    !pokeApiBaseButton &&
    renderedSprites.length &&
    renderedSprites.every((sprite) => sprite.includes('PokeAPI/sprites'))
  ) {
    return;
  }
  if (!expectedDefaults.length || !expectedShiny.length) {
    addIssue(issues, id, 'modifier_form_sprite_source_missing', {
      ...context,
      pokeApiBaseButton,
      buttonSprites: button.sprites,
    });
    return;
  }
  const normalizedDefaults = expectedDefaults.map(normalizeAssetUrl);
  const normalizedShiny = expectedShiny.map(normalizeAssetUrl);
  const invalidDefaults = page.renderedFormSprites.defaults.filter(
    (sprite) => !normalizedDefaults.includes(normalizeAssetUrl(sprite))
  );
  const invalidShiny = page.renderedFormSprites.shiny.filter(
    (sprite) => !normalizedShiny.includes(normalizeAssetUrl(sprite))
  );
  if (invalidDefaults.length || invalidShiny.length) {
    addIssue(issues, id, 'modifier_form_sprite_mismatch', {
      ...context,
      source: pokeApiBaseButton ? 'pokeapi-base-form' : 'pokemon-go-fallback',
      expected: { defaults: expectedDefaults, shiny: expectedShiny },
      actual: page.renderedFormSprites,
    });
  }
};

const validateExpectedRow = (issues, id, row, button, page) => {
  const context = { fullName: row.fullName, form: row.form, pokemonType: row.pokemonType };
  const expectedProfileModifier = button.pokemonType === 2 ? 'shadow' : button.pokemonType === 3 ? 'purified' : '';
  if (
    !page.profileAura ||
    page.profileAura.modifier !== expectedProfileModifier ||
    (expectedProfileModifier &&
      (page.profileAura.beforeBackground === 'none' || page.profileAura.afterBackground === 'none'))
  ) {
    addIssue(issues, id, 'profile_modifier_aura_mismatch', {
      ...context,
      expected: expectedProfileModifier,
      actual: page.profileAura,
    });
  }
  const expectedCanonicalIdentity = normalizeCanonicalIdentity(id, row.fullName);
  const actualCanonicalIdentity = normalizeCanonicalIdentity(id, page.detailFullName);
  if (actualCanonicalIdentity !== expectedCanonicalIdentity) {
    addIssue(issues, id, 'detail_identity_mismatch', {
      ...context,
      actualFullName: page.detailFullName,
      actualForm: page.detailForm,
    });
  }
  if (normalizePokemonType(page.detailPokemonType) !== normalizePokemonType(row.pokemonType)) {
    addIssue(issues, id, 'detail_pokemon_type_mismatch', { ...context, actual: page.detailPokemonType });
  }
  const expectedCanonicalBody = normalizeCanonicalIdentity(id, row.fullName);
  const hasFormSpecificCanonicalBody = page.bodyFormNames.some(
    (name) => normalizeCanonicalIdentity(id, name) === expectedCanonicalBody
  );
  if (
    hasFormSpecificCanonicalBody &&
    page.detailBodyName &&
    normalizeCanonicalIdentity(id, page.detailBodyName) !== expectedCanonicalBody
  ) {
    addIssue(issues, id, 'body_form_mismatch', { ...context, actual: page.detailBodyName });
  }
  const expectedTypes = (row.types ?? []).map(normalize).sort();
  const actualTypes = page.detailTypes.map(normalize).sort();
  if (JSON.stringify(actualTypes) !== JSON.stringify(expectedTypes)) {
    addIssue(issues, id, 'types_mismatch', { ...context, expected: expectedTypes, actual: actualTypes });
  }

  const expected = expectedMoves(row);
  const actualFast = page.fastMoves.map(normalizeMove);
  const actualCharged = page.chargedMoves.map(normalizeMove);
  validateUniqueMoveRows(issues, id, context, page);
  for (const move of expected.fast) {
    if (!actualFast.includes(move)) addIssue(issues, id, 'fast_move_missing', { ...context, move, actual: actualFast });
  }
  for (const move of expected.charged) {
    if (!actualCharged.includes(move)) {
      addIssue(issues, id, 'charged_move_missing', { ...context, move, actual: actualCharged });
    }
  }
  if (!button.active) addIssue(issues, id, 'clicked_form_not_active', { ...context, button });
  validateModifierFormSprites(issues, id, context, button, page);
  for (const [cardIndex, card] of page.megaCards.entries()) {
    if (card.benefitsOpen) addIssue(issues, id, 'mega_level_benefits_expanded_by_default', { ...context, cardIndex });
    if (card.levelRows !== card.expectedLevelRows) {
      addIssue(issues, id, 'mega_level_benefits_mismatch', {
        ...context,
        cardIndex,
        expected: card.expectedLevelRows,
        actual: card.levelRows,
      });
    }
    if (card.horizontalOverflow) addIssue(issues, id, 'mega_card_horizontal_overflow', { ...context, cardIndex });
  }
  if (page.megaCards.length) {
    const scrollLayout = page.megaScrollLayout;
    if (
      !scrollLayout ||
      scrollLayout.scrollLeft > 1 ||
      scrollLayout.firstCard.left < scrollLayout.bounds.left - 1 ||
      scrollLayout.firstCard.left > scrollLayout.bounds.right + 1
    ) {
      addIssue(issues, id, 'mega_evolution_invalid_initial_scroll_position', {
        ...context,
        layout: scrollLayout,
      });
    }
    if (page.megaSectionSeparator?.borderTop !== 'none' || page.megaSectionSeparator?.borderLeft !== 'none') {
      addIssue(issues, id, 'mega_evolution_section_divider_present', {
        ...context,
        separator: page.megaSectionSeparator,
      });
    }
    const layout = page.megaSectionLayout;
    if (!layout || layout.mega.top < layout.evolution.bottom + 24) {
      addIssue(issues, id, 'mega_evolution_section_not_stacked', { ...context, layout });
    }
  }
  if (page.formChangeLayout?.targets.length) {
    const targetIdentities = page.formChangeLayout.targets.map((target) => target.target).filter(Boolean);
    if (new Set(targetIdentities).size !== targetIdentities.length) {
      addIssue(issues, id, 'form_change_duplicate_target', {
        ...context,
        targets: targetIdentities,
      });
    }
    if (page.formChangeLayout.path !== 'grid') {
      addIssue(issues, id, 'form_change_connector_not_grid', {
        ...context,
        path: page.formChangeLayout.path,
      });
    }
    const primaryTarget = page.formChangeLayout.targets[0];
    const axisDifference =
      page.viewportWidth >= 640
        ? Math.abs(page.formChangeLayout.origin.centerY - primaryTarget.centerY)
        : Math.abs(page.formChangeLayout.origin.centerX - primaryTarget.centerX);
    if (axisDifference > 2) {
      addIssue(issues, id, 'form_change_primary_nodes_misaligned', {
        ...context,
        axisDifference,
        layout: page.formChangeLayout,
      });
    }
    for (const [detailIndex, detail] of page.formChangeLayout.details.entries()) {
      if (detail.horizontalOverflow) {
        addIssue(issues, id, 'form_change_detail_horizontal_overflow', {
          ...context,
          detailIndex,
          detail,
        });
      }
      if (
        page.viewportWidth < 640 &&
        (detail.bounds.left < page.formChangeLayout.bounds.left - 1 ||
          detail.bounds.right > page.formChangeLayout.bounds.right + 1)
      ) {
        addIssue(issues, id, 'form_change_detail_outside_mobile_viewport', {
          ...context,
          detailIndex,
          detail,
        });
      }
    }
  }
  if (page.viewportWidth < 640 && page.fusionLayout) {
    for (const [nodeIndex, node] of [...page.fusionLayout.origins, ...page.fusionLayout.targets].entries()) {
      if (node.left < page.fusionLayout.bounds.left - 1 || node.right > page.fusionLayout.bounds.right + 1) {
        addIssue(issues, id, 'fusion_node_outside_mobile_section', {
          ...context,
          nodeIndex,
          node,
          section: page.fusionLayout.bounds,
        });
      }
    }
  }
  for (const [targetIndex, target] of (page.fusionLayout?.targets ?? []).entries()) {
    if (!/\.gif(?:$|\?)/i.test(target.imageSrc)) {
      addIssue(issues, id, 'fusion_target_gif_missing', {
        ...context,
        targetIndex,
        targetForm: target.form,
        targetPokemonType: target.pokemonType,
        imageSrc: target.imageSrc,
      });
    }
  }
  const nodeKeys = new Set(page.evolutionNodes.map((node) => node.key));
  if (
    page.evolutionEdges.length &&
    (page.evolutionStackingContext?.isolation !== 'isolate' || page.evolutionStackingContext?.zIndex !== '0')
  ) {
    addIssue(issues, id, 'evolution_stacking_context_missing', {
      ...context,
      actual: page.evolutionStackingContext,
    });
  }
  if (page.evolutionEdges.length && page.evolutionOverflow?.vertical) {
    addIssue(issues, id, 'evolution_vertical_overflow', {
      ...context,
      overflow: page.evolutionOverflow,
    });
  }
  if (
    page.evolutionOverflow?.firstNode &&
    (page.evolutionOverflow.scrollLeft > 1 ||
      page.evolutionOverflow.firstNode.left < page.evolutionOverflow.bounds.left - 1)
  ) {
    addIssue(issues, id, 'evolution_invalid_initial_scroll_position', {
      ...context,
      overflow: page.evolutionOverflow,
    });
  }
  for (const edge of page.evolutionEdges) {
    if (!nodeKeys.has(edge.source) || !nodeKeys.has(edge.target)) {
      addIssue(issues, id, 'evolution_edge_endpoint_missing', { ...context, edge });
    }
    if (edge.lineOverlapsCard) {
      addIssue(issues, id, 'evolution_line_overlaps_detail_card', { ...context, edge });
    }
    if (
      !Number.isFinite(edge.labelLayer) ||
      !Number.isFinite(edge.canvasLayer) ||
      edge.labelLayer <= edge.canvasLayer
    ) {
      addIssue(issues, id, 'evolution_detail_layer_not_above_connector', { ...context, edge });
    }
    const sourceGenderRequirement = normalize(edge.sourceGenderRequirement);
    if (['MALE', 'FEMALE'].includes(sourceGenderRequirement) && edge.genderRequirement !== sourceGenderRequirement) {
      addIssue(issues, id, 'evolution_gender_requirement_mismatch', {
        ...context,
        expectedGender: sourceGenderRequirement,
        edge,
      });
    }
  }
  const layeredEdges = [...page.evolutionEdges]
    .filter((edge) => Number.isFinite(edge.layer) && edge.layer > 0)
    .sort((left, right) => {
      const [leftStage, leftIndex] = left.target.split(':').map(Number);
      const [rightStage, rightIndex] = right.target.split(':').map(Number);
      return leftStage - rightStage || leftIndex - rightIndex;
    });
  for (let index = 1; index < layeredEdges.length; index += 1) {
    const previous = layeredEdges[index - 1];
    const current = layeredEdges[index];
    const previousStage = Number(previous.target.split(':')[0]);
    const currentStage = Number(current.target.split(':')[0]);
    if (previous.target !== current.target && previousStage === currentStage && previous.layer <= current.layer) {
      addIssue(issues, id, 'evolution_edge_layer_order_invalid', {
        ...context,
        previous,
        current,
      });
    }
  }
  for (const node of page.evolutionNodes.filter((item) => item.stage > 0)) {
    if (!page.evolutionEdges.some((edge) => edge.target === node.key && edge.targetForm === node.form)) {
      addIssue(issues, id, 'evolution_node_missing_incoming_edge', { ...context, node });
    }
  }
  if (id === 678) {
    const expectedForm = normalizeForm(row.form) === 'FEMALE' ? 'FEMALE' : 'NORMAL';
    const expectedSprite = expectedForm === 'FEMALE' ? 'meowstic-f.gif' : 'meowstic.gif';
    const currentNode = page.evolutionNodes.find((node) => node.id === id && normalizeForm(node.form) === expectedForm);
    if (!currentNode || !currentNode.sprite.endsWith(`/${expectedSprite}`)) {
      addIssue(issues, id, 'evolution_form_sprite_mismatch', {
        ...context,
        expectedForm,
        expectedSprite,
        actual: currentNode,
      });
    }
  }
};

const validateDisplayedStats = (issues, id, button, page) => {
  const invalid = Object.entries(page.stats ?? {}).filter(([, value]) => !Number.isFinite(value) || value <= 0);
  if (invalid.length || Object.keys(page.stats ?? {}).length !== 4) {
    addIssue(issues, id, 'displayed_form_stats_missing', {
      form: button.form,
      label: button.label,
      pokemonType: button.pokemonType,
      stats: page.stats,
    });
  }
};

const validateEvolutionDetailAlignment = (issues, id, context, page) => {
  for (const node of page.evolutionNodes.filter((item) => item.nameLines !== 1)) {
    addIssue(issues, id, 'evolution_name_wrapped', { ...context, node });
  }
  const nodesByKey = new Map(page.evolutionNodes.map((node) => [node.key, node]));
  const anchoredEdges = page.evolutionEdges.filter((item) => ['source', 'target'].includes(item.labelAnchor));
  for (const edge of anchoredEdges) {
    const anchorKey = edge.labelAnchor === 'source' ? edge.source : edge.target;
    const anchorNode = nodesByKey.get(anchorKey);
    if (!anchorNode) continue;
    const candidates = page.evolutionNodes.filter((node) => node.stage === anchorNode.stage);
    const nearestTarget = candidates.reduce((nearest, node) =>
      Math.abs(node.bounds.centerY - edge.bounds.centerY) < Math.abs(nearest.bounds.centerY - edge.bounds.centerY)
        ? node
        : nearest
    );
    if (nearestTarget.key !== anchorNode.key) {
      addIssue(issues, id, 'evolution_detail_target_mismatch', {
        ...context,
        edge: { source: edge.source, target: edge.target, targetForm: edge.targetForm },
        labelAnchor: edge.labelAnchor,
        nearestTarget: nearestTarget.key,
        detailCenterY: edge.bounds.centerY,
        anchorCenterY: anchorNode.bounds.centerY,
      });
    }
    const verticalDistance = Math.abs(anchorNode.bounds.centerY - edge.bounds.centerY);
    const alignmentTolerance = Math.max(24, (anchorNode.bounds.height + edge.bounds.height) / 2);
    if (verticalDistance > alignmentTolerance) {
      addIssue(issues, id, 'evolution_detail_detached_from_target', {
        ...context,
        edge: { source: edge.source, target: edge.target, targetForm: edge.targetForm },
        labelAnchor: edge.labelAnchor,
        verticalDistance,
        alignmentTolerance,
      });
    }
  }
  for (let index = 0; index < anchoredEdges.length; index += 1) {
    const edge = anchoredEdges[index];
    const anchorKey = edge.labelAnchor === 'source' ? edge.source : edge.target;
    const anchorStage = anchorKey.split(':')[0];
    for (const sibling of anchoredEdges.slice(index + 1)) {
      const siblingAnchorKey = sibling.labelAnchor === 'source' ? sibling.source : sibling.target;
      if (sibling.labelAnchor !== edge.labelAnchor || siblingAnchorKey.split(':')[0] !== anchorStage) continue;
      const horizontalOverlap =
        Math.min(edge.bounds.right, sibling.bounds.right) - Math.max(edge.bounds.left, sibling.bounds.left);
      const verticalOverlap =
        Math.min(edge.bounds.bottom, sibling.bounds.bottom) - Math.max(edge.bounds.top, sibling.bounds.top);
      if (horizontalOverlap > 1 && verticalOverlap > 1) {
        addIssue(issues, id, 'evolution_details_overlap', {
          ...context,
          edges: [
            { source: edge.source, target: edge.target, targetForm: edge.targetForm },
            { source: sibling.source, target: sibling.target, targetForm: sibling.targetForm },
          ],
          horizontalOverlap,
          verticalOverlap,
        });
      }
    }
  }
};

const main = async () => {
  const startedAt = new Date().toISOString();
  const issues = [];
  const browserErrors = [];
  let auditedIds = 0;
  let auditedForms = 0;
  let auditedFormIcons = 0;
  let auditedModifierFormSprites = 0;
  let auditedEvolutionDetails = 0;
  let auditedEvolutionTooltips = 0;
  let auditedFormSwitches = 0;
  let delayPokemonRequests = false;

  const chromeRuntime = await startChrome();
  client = new CdpClient(chromeRuntime.debuggerUrl);
  await client.connect();
  const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await client.send('Target.attachToTarget', { targetId, flatten: true });
  browser = { ...chromeRuntime, targetId, sessionId };
  client.socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.sessionId !== sessionId) return;
    if (message.method === 'Fetch.requestPaused') {
      const requestId = message.params.requestId;
      const continueRequest = () =>
        client.send('Fetch.continueRequest', { requestId }, sessionId).catch(() => undefined);
      if (delayPokemonRequests) setTimeout(continueRequest, 1200);
      else continueRequest();
      return;
    }
    if (message.method === 'Runtime.exceptionThrown') {
      const exceptionDetails = message.params.exceptionDetails;
      if (
        exceptionDetails.url?.includes('/@vite/client') &&
        (exceptionDetails.exception?.description ?? exceptionDetails.text).includes('WebSocket closed without opened')
      ) {
        return;
      }
      browserErrors.push({
        id: browser.currentId,
        text: exceptionDetails.exception?.description ?? exceptionDetails.text,
      });
    }
  });
  await client.send('Page.enable', {}, sessionId);
  await client.send('Runtime.enable', {}, sessionId);
  await client.send(
    'Emulation.setDeviceMetricsOverride',
    {
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor: 1,
      mobile: viewportWidth < 640,
    },
    sessionId
  );

  let isInitial = true;
  let previousPage;
  const idsToAudit = requestedSequence.length
    ? requestedSequence
    : (requestedIds.size
        ? [...requestedIds]
        : multipleFormsOnly
          ? [...rowsById.entries()].filter(([, rows]) => rows.length > 1).map(([id]) => id)
          : [...Array(toId - fromId + 1)].map((_, index) => fromId + index)
      ).sort((a, b) => a - b);
  for (const id of idsToAudit) {
    browser.currentId = id;
    const rows = preferredGoRows(id, rowsById.get(id) ?? []);
    try {
      let page;
      if (auditLoadingContinuity && !isInitial && previousPage) {
        delayPokemonRequests = true;
        await client.send(
          'Fetch.enable',
          { patterns: [{ urlPattern: '*api/v1/pokemon*', requestStage: 'Request' }] },
          browser.sessionId
        );
        await evaluate(`(() => {
          history.pushState({}, '', ${JSON.stringify(`/pokemon/${id}`)});
          window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
        })()`);
        const loadingPage = await waitFor(readPage, (value) => value?.busy, `Pokémon #${id} loading state`);
        if (loadingPage.id !== previousPage.id) {
          addIssue(issues, id, 'loading_snapshot_id_changed', {
            expected: previousPage.id,
            actual: loadingPage.id,
          });
        }
        if (loadingPage.bodyWeight !== previousPage.bodyWeight || loadingPage.bodyHeight !== previousPage.bodyHeight) {
          addIssue(issues, id, 'loading_body_snapshot_changed', {
            expected: { weight: previousPage.bodyWeight, height: previousPage.bodyHeight },
            actual: { weight: loadingPage.bodyWeight, height: loadingPage.bodyHeight },
          });
        }
        const loadingLayout = loadingPage.detailLayout;
        page = await waitFor(
          readPage,
          (value) =>
            value?.id === id &&
            !value.busy &&
            !value.profileAura?.loading &&
            value.buttons.length > 0 &&
            value.detailFullName &&
            value.title.includes(`#${id}`),
          `Pokémon #${id}`
        );
        for (const section of ['formVarieties', 'genderRatio', 'statsRanking']) {
          const loadingBounds = loadingLayout?.[section];
          const loadedBounds = page.detailLayout?.[section];
          if (loadingBounds && loadedBounds && Math.abs(loadingBounds.height - loadedBounds.height) > 0.1) {
            addIssue(issues, id, 'pokemon_detail_loading_height_shift', {
              section,
              loadingHeight: loadingBounds.height,
              loadedHeight: loadedBounds.height,
              delta: loadedBounds.height - loadingBounds.height,
            });
          }
        }
        if (
          !loadingPage.statsLoading ||
          loadingPage.statsBars !== 4 ||
          loadingPage.statsLoadingBars !== 4 ||
          Object.keys(loadingPage.stats).length !== 4 ||
          JSON.stringify(loadingPage.stats) !== JSON.stringify(previousPage.stats)
        ) {
          addIssue(issues, id, 'pokemon_stats_loading_state_invalid', {
            statsLoading: loadingPage.statsLoading,
            statsBars: loadingPage.statsBars,
            statsLoadingBars: loadingPage.statsLoadingBars,
            expectedRetainedStats: previousPage.stats,
            actualRetainedStats: loadingPage.stats,
          });
        }
        if (
          !loadingPage.informationLoading ||
          !loadingPage.informationLoadingLabel ||
          loadingPage.informationTypes !== previousPage.informationTypes
        ) {
          addIssue(issues, id, 'pokemon_information_loading_state_invalid', {
            informationLoading: loadingPage.informationLoading,
            informationLoadingLabel: loadingPage.informationLoadingLabel,
            expectedRetainedTypes: previousPage.informationTypes,
            actualRetainedTypes: loadingPage.informationTypes,
          });
        }
        if (page.informationLoading || page.informationLoadingLabel) {
          addIssue(issues, id, 'pokemon_information_loaded_state_invalid', {
            informationLoading: page.informationLoading,
            informationLoadingLabel: page.informationLoadingLabel,
          });
        }
        if (
          page.statsLoading ||
          page.statsBars !== 4 ||
          page.statsLoadingBars !== 0 ||
          Object.keys(page.stats).length !== 4
        ) {
          addIssue(issues, id, 'pokemon_stats_loaded_state_invalid', {
            statsLoading: page.statsLoading,
            statsBars: page.statsBars,
            statsLoadingBars: page.statsLoadingBars,
            stats: page.stats,
          });
        }
        const loadingStatsGap =
          loadingLayout?.statsRanking && loadingLayout?.genderRatio
            ? loadingLayout.statsRanking.top - loadingLayout.genderRatio.bottom
            : undefined;
        const loadedStatsGap =
          page.detailLayout?.statsRanking && page.detailLayout?.genderRatio
            ? page.detailLayout.statsRanking.top - page.detailLayout.genderRatio.bottom
            : undefined;
        if (
          Number.isFinite(loadingStatsGap) &&
          Number.isFinite(loadedStatsGap) &&
          Math.abs(loadingStatsGap - loadedStatsGap) > 0.1
        ) {
          addIssue(issues, id, 'pokemon_stats_ranking_loading_shift', {
            loadingGap: loadingStatsGap,
            loadedGap: loadedStatsGap,
            delta: loadedStatsGap - loadingStatsGap,
          });
        }
        delayPokemonRequests = false;
        await client.send('Fetch.disable', {}, browser.sessionId);
      } else {
        page = await navigate(id, isInitial);
      }
      await delay(100);
      page = await readPage();
      isInitial = false;
      auditedIds += 1;
      const testedForms = new Set();
      const profileSources = [];
      const recordProfileSource = (button, selectedPage) => {
        profileSources.push({
          identity: profileBaseIdentity(id, button),
          pokemonType: normalizePokemonType(button.pokemonType),
          form: button.form,
          src: selectedPage.profileAura?.src ?? '',
        });
      };

      if (!page.title.includes(`#${id}`)) addIssue(issues, id, 'title_id_mismatch', { actual: page.title });
      if (/\b(undefined|NaN)\b/.test(page.bodyText)) addIssue(issues, id, 'invalid_text_rendered');
      if (navigationOnly) {
        previousPage = page;
        continue;
      }

      if (auditEvolutionTooltip && page.evolutionInfoButton) {
        await evaluate(`document.querySelector('[data-testid="evolution-info-button"]').click()`);
        page = await waitFor(readPage, (value) => value?.evolutionTooltipOpen, `Pokémon #${id} evolution tooltip open`);
        const expectedConditions = [
          'candyCost',
          'evolutionItemRequirement',
          'isRandomEvolution',
          'genderRequirement',
          'kmBuddyDistanceRequirement',
          'isMustBeBuddy',
          'isOnlyDaytime',
          'isOnlyNighttime',
          'isOnlyFullMoon',
          'isOnlyDuskPeriod',
          'lureItemRequirement',
          'isOnlyUpsideDown',
          'noCandyCostViaTrade',
          'highestIv',
          'nickname',
          'QUEST_CATCH_POKEMON',
          'QUEST_COMPLETE_BATTLE',
          'QUEST_COMPLETE_RAID_BATTLE',
          'QUEST_FIGHT_POKEMON',
          'QUEST_LAND_THROW',
          'QUEST_BUDDY_EARN_AFFECTION_POINTS',
          'QUEST_BUDDY_FEED',
          'QUEST_BUDDY_EVOLUTION_WALK',
          'QUEST_USE_INCENSE',
        ];
        const missingConditions = expectedConditions.filter(
          (condition) => !page.evolutionTooltipConditions.includes(condition)
        );
        if (missingConditions.length) {
          addIssue(issues, id, 'evolution_tooltip_condition_missing', {
            missingConditions,
            actualConditions: page.evolutionTooltipConditions,
          });
        }
        const iconOwners = new Map();
        for (const row of page.evolutionTooltipIcons) {
          if (!row.icon) {
            addIssue(issues, id, 'evolution_tooltip_icon_missing', { conditions: row.conditions });
            continue;
          }
          const existing = iconOwners.get(row.icon);
          if (existing && JSON.stringify(existing) !== JSON.stringify(row.conditions)) {
            addIssue(issues, id, 'evolution_tooltip_icon_reused', {
              icon: row.icon,
              conditions: [...existing, ...row.conditions],
            });
          } else {
            iconOwners.set(row.icon, row.conditions);
          }
        }
        for (const detail of page.evolutionDetailConditions) {
          const tooltip = page.evolutionTooltipIcons.find((row) => row.conditions.includes(detail.condition));
          if (!tooltip || tooltip.icon !== detail.icon) {
            addIssue(issues, id, 'evolution_detail_tooltip_icon_mismatch', { detail, tooltip });
          }
        }
        await evaluate(`document.querySelector('[data-testid="evolution-info-button"]').click()`);
        page = await waitFor(
          readPage,
          (value) => !value?.evolutionTooltipOpen,
          `Pokémon #${id} evolution tooltip close`
        );
        auditedEvolutionTooltips += 1;
      }

      const buttonsByIdentity = new Map();
      for (const button of page.buttons) {
        const key = `${normalizeCanonicalIdentity(id, button.name)}:${normalizePokemonType(button.pokemonType)}`;
        buttonsByIdentity.set(key, [...(buttonsByIdentity.get(key) ?? []), button]);
      }
      for (const [identity, buttons] of buttonsByIdentity) {
        // Canonical PokéAPI varieties can intentionally share one GO identity
        // (for example Battle Bond or Own Tempo). The regression we need to
        // reject is a synthetic "Only in GO" button duplicating an existing
        // canonical variety/form.
        if (buttons.length > 1 && buttons.some((button) => button.formId <= 0)) {
          addIssue(issues, id, 'duplicate_form_buttons', { identity, buttons });
        }
      }

      for (const button of page.buttons) {
        auditedFormIcons += 1;
        const expectedIconIndex = expectedFormCardIconIndex(id, button);
        if (button.iconIndex === null) {
          addIssue(issues, id, 'form_card_icon_missing', { button, expectedIconIndex });
        } else if (button.iconIndex !== expectedIconIndex) {
          addIssue(issues, id, 'form_card_icon_mismatch', {
            button,
            expectedIconIndex,
          });
        }
      }

      for (const row of rows) {
        const buttonIndex = findButtonIndexForRow(id, page.buttons, row);
        if (buttonIndex < 0) {
          addIssue(issues, id, 'go_form_button_missing', {
            fullName: row.fullName,
            form: row.form,
            pokemonType: row.pokemonType,
            buttons: page.buttons,
          });
          continue;
        }

        const target = page.buttons[buttonIndex];
        testedForms.add(`${normalizeForm(target.form)}:${normalizePokemonType(target.pokemonType)}`);
        if (!target.active) {
          await startBodyTransitionCapture();
          await evaluate(`document.querySelectorAll('.form-container button[data-form]')[${buttonIndex}].click()`);
          page = await waitFor(
            readPage,
            (value) =>
              value?.id === id &&
              !value.busy &&
              !value.profileAura?.loading &&
              value.buttons[buttonIndex]?.active &&
              profileMatchesButton(value, buttonIndex) &&
              normalizeForm(value.selectedForm) === normalizeForm(target.form) &&
              normalizePokemonType(value.selectedPokemonType) === normalizePokemonType(target.pokemonType),
            `Pokémon #${id} form ${row.fullName}`
          );
          await delay(0);
          validateBodyTransition(
            issues,
            id,
            { fullName: row.fullName, form: row.form, pokemonType: row.pokemonType },
            await readBodyTransitions()
          );
        }
        page = await waitFor(
          readPage,
          (value) => profileMatchesButton(value, buttonIndex),
          `Pokémon #${id} form image`
        );
        recordProfileSource(page.buttons[buttonIndex], page);
        auditedForms += 1;
        if ([2, 3].includes(normalizePokemonType(target.pokemonType))) auditedModifierFormSprites += 1;
        validateExpectedRow(issues, id, row, page.buttons[buttonIndex], page);
        validateDisplayedStats(issues, id, page.buttons[buttonIndex], page);
        validateEvolutionDetailAlignment(
          issues,
          id,
          { fullName: row.fullName, form: row.form, pokemonType: row.pokemonType },
          page
        );
        auditedEvolutionDetails += page.evolutionEdges.length;
        if (!page.bodyWeight || !page.bodyHeight) {
          addIssue(issues, id, 'form_body_value_missing', {
            fullName: row.fullName,
            weight: page.bodyWeight,
            height: page.bodyHeight,
          });
        }
      }

      for (let index = 0; index < page.buttons.length; index += 1) {
        const target = page.buttons[index];
        const targetKey = `${normalizeForm(target.form)}:${normalizePokemonType(target.pokemonType)}`;
        if (testedForms.has(targetKey)) continue;
        if (!target.active) {
          await startBodyTransitionCapture();
          await evaluate(`document.querySelectorAll('.form-container button[data-form]')[${index}].click()`);
          page = await waitFor(
            readPage,
            (value) =>
              value?.id === id &&
              !value.busy &&
              !value.profileAura?.loading &&
              value.buttons[index]?.active &&
              profileMatchesButton(value, index) &&
              normalizeForm(value.selectedForm) === normalizeForm(target.form) &&
              normalizePokemonType(value.selectedPokemonType) === normalizePokemonType(target.pokemonType),
            `Pokémon #${id} displayed form ${target.label}`
          );
          await delay(0);
          validateBodyTransition(
            issues,
            id,
            { form: target.form, pokemonType: target.pokemonType, label: target.label },
            await readBodyTransitions()
          );
        }
        page = await waitFor(
          readPage,
          (value) => profileMatchesButton(value, index),
          `Pokémon #${id} displayed form image`
        );
        recordProfileSource(page.buttons[index], page);
        validateUniqueMoveRows(
          issues,
          id,
          { form: target.form, pokemonType: target.pokemonType, label: target.label },
          page
        );
        validateDisplayedStats(issues, id, page.buttons[index], page);
        validateModifierFormSprites(
          issues,
          id,
          { form: target.form, pokemonType: target.pokemonType, label: target.label },
          page.buttons[index],
          page
        );
        if ([2, 3].includes(normalizePokemonType(target.pokemonType))) auditedModifierFormSprites += 1;
        if (!page.bodyWeight || !page.bodyHeight) {
          addIssue(issues, id, 'displayed_form_body_value_missing', {
            form: target.form,
            pokemonType: target.pokemonType,
            label: target.label,
          });
        }
        validateEvolutionDetailAlignment(
          issues,
          id,
          { form: target.form, pokemonType: target.pokemonType, label: target.label },
          page
        );
        auditedEvolutionDetails += page.evolutionEdges.length;
        auditedForms += 1;
        testedForms.add(targetKey);
      }
      if (formSwitchCycles > 1 && page.buttons.length > 1) {
        for (let cycle = 1; cycle < formSwitchCycles; cycle += 1) {
          for (let index = 0; index < page.buttons.length; index += 1) {
            const target = page.buttons[index];
            if (!target.active) {
              await evaluate(`document.querySelectorAll('.form-container button[data-form]')[${index}].click()`);
              page = await waitFor(
                readPage,
                (value) =>
                  value?.id === id &&
                  !value.busy &&
                  !value.profileAura?.loading &&
                  value.buttons[index]?.active &&
                  profileMatchesButton(value, index) &&
                  normalizeForm(value.selectedForm) === normalizeForm(target.form) &&
                  normalizePokemonType(value.selectedPokemonType) === normalizePokemonType(target.pokemonType),
                `Pokémon #${id} repeated form switch ${cycle}:${target.label}`
              );
              auditedFormSwitches += 1;
            }
            page = await waitFor(
              readPage,
              (value) => profileMatchesButton(value, index),
              `Pokémon #${id} repeated form image`
            );
            validateUniqueMoveRows(
              issues,
              id,
              { cycle, form: target.form, pokemonType: target.pokemonType, label: target.label },
              page
            );
          }
        }
      }
      for (const modifierSource of profileSources.filter((source) => [2, 3].includes(source.pokemonType))) {
        const baseSource = profileSources.find(
          (source) => ![2, 3].includes(source.pokemonType) && source.identity === modifierSource.identity
        );
        if (baseSource?.src && normalizeAssetUrl(modifierSource.src) !== normalizeAssetUrl(baseSource.src)) {
          addIssue(issues, id, 'modifier_profile_differs_from_base', {
            identity: modifierSource.identity,
            base: baseSource,
            modifier: modifierSource,
          });
        }
      }
      previousPage = page;
    } catch (error) {
      delayPokemonRequests = false;
      await client.send('Fetch.disable', {}, browser.sessionId).catch(() => undefined);
      addIssue(issues, id, 'page_audit_failed', { error: error.message });
      isInitial = true;
      previousPage = undefined;
    }

    if (auditedIds % 25 === 0 || id === idsToAudit.at(-1)) {
      process.stdout.write(
        `Audited ${auditedIds}/${idsToAudit.length} IDs, ${auditedForms} forms, ${issues.length} issues\n`
      );
    }
  }

  const report = {
    startedAt,
    completedAt: new Date().toISOString(),
    source: 'Pokémon GO generated data + rendered Pokémon detail page',
    baseUrl,
    viewport: { width: viewportWidth, height: viewportHeight },
    range: { from: fromId, to: toId, latestPokemonGoId: lastPokemonId },
    multipleFormsOnly,
    navigationOnly,
    summary: {
      expectedIds: idsToAudit.length,
      auditedIds,
      expectedGoForms: [...rowsById.values()].reduce((total, rows) => total + rows.length, 0),
      auditedForms,
      auditedFormIcons,
      auditedModifierFormSprites,
      auditedEvolutionDetails,
      auditedEvolutionTooltips,
      auditedFormSwitches,
      issues: issues.length,
      browserErrors: browserErrors.length,
    },
    issues,
    browserErrors,
  };
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`Report: ${outputPath}\n`);
  process.exitCode = issues.length || browserErrors.length ? 1 : 0;
};

try {
  await main();
} finally {
  client?.close();
  if (browser?.chrome && !browser.chrome.killed) {
    browser.chrome.kill('SIGTERM');
    await Promise.race([new Promise((resolveExit) => browser.chrome.once('exit', resolveExit)), delay(2000)]);
  }
  if (browser?.profilePath) {
    try {
      await rm(browser.profilePath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } catch {
      // Chrome may briefly retain files on macOS; the OS will clean this temporary directory.
    }
  }
}

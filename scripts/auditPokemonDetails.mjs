#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(scriptDir, '..');
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
const auditLoadingContinuity = args.get('audit-loading-continuity') === 'true';
const outputPath = resolve(
  workspaceRoot,
  args.get('output') ?? 'artifacts/pokemon-details-audit.json'
);
const chromePath =
  args.get('chrome') ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const normalize = (value) =>
  String(value ?? '')
    .trim()
    .replaceAll('-', '_')
    .replaceAll(' ', '_')
    .toUpperCase();

const normalizeForm = (value) => normalize(value) || 'NORMAL';
const normalizeMove = (value) => normalize(value).replace(/^V\d{4}_MOVE_/, '').replace(/_FAST$/, '');
const normalizePokemonType = (value) => (Number(value) === 0 ? 1 : Number(value));

const pokemons = JSON.parse(await readFile(resolve(workspaceRoot, 'modules/api/data/pokemons.json'), 'utf8'));
const lastPokemonId = Math.max(...pokemons.map((pokemon) => Number(pokemon.num) || 0));
const toId = Math.min(Number.parseInt(args.get('to') ?? String(lastPokemonId), 10), lastPokemonId);
const requestedIds = new Set(
  (args.get('ids') ?? '')
    .split(',')
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value) && value >= fromId && value <= toId)
);
const rowsById = new Map();
for (const pokemon of pokemons) {
  const id = Number(pokemon.num);
  if (id < fromId || id > toId || (requestedIds.size && !requestedIds.has(id))) continue;
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
    .replace(/_OWN_TEMPO$/, '')
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
  if (id === 801) identity = identity.replace(/_ORIGINAL$/, '_ORIGINAL_COLOR');
  if (id === 888) identity = identity.replace(/_CROWNED$/, '_CROWNED_SWORD');
  if (id === 889) identity = identity.replace(/_CROWNED$/, '_CROWNED_SHIELD');
  if (id === 898) {
    identity = identity.replace(/_ICE$/, '_ICE_RIDER').replace(/_SHADOW$/, '_SHADOW_RIDER');
  }
  if (id === 555) identity = identity.replace(/_GALARIAN_STANDARD$/, '_GALARIAN');
  if ((id === 664 || id === 665) && !identity.includes('_')) identity += '_ICY_SNOW';
  if (id === 716) identity = identity.replace(/_ACTIVE$/, '');
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
    const rowPriority = moveCount(row) * 2 + Number(normalizeForm(row.form) !== 'NORMAL');
    return !rows.some(
      (candidate) =>
        candidate !== row &&
        normalizeCanonicalIdentity(id, candidate.fullName) === identity &&
        moveCount(candidate) * 2 + Number(normalizeForm(candidate.form) !== 'NORMAL') > rowPriority
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
    const buttons = [...document.querySelectorAll('.form-container button[data-form]')].map((button, index) => ({
      index,
      name: button.dataset.formName ?? '',
      form: button.dataset.form ?? '',
      pokemonType: Number(button.dataset.pokemonType),
      formId: Number(button.dataset.formId),
      active: button.getAttribute('aria-pressed') === 'true',
      label: button.innerText.trim().replace(/\\s+/g, ' '),
    }));
    const moves = (selector) => [...document.querySelectorAll(selector + ' tr')]
      .map((row) => [...row.querySelectorAll('a span.tw-mr-1')]
        .map((span) => span.textContent?.trim() ?? '')
        .find(Boolean) ?? '')
      .filter(Boolean);
    const evolutionNodes = [...document.querySelectorAll('[data-testid="evolution-node"]')].map((node) => ({
      key: (node.dataset.evolutionStage ?? '') + ':' + (node.dataset.evolutionIndex ?? ''),
      stage: Number(node.dataset.evolutionStage),
      id: Number(node.dataset.evolutionId),
      form: node.dataset.evolutionForm ?? '',
    }));
    const evolutionEdges = [...document.querySelectorAll('[data-testid="evolution-edge"]')].map((edge) => ({
      source: edge.dataset.evolutionSource ?? '',
      target: edge.dataset.evolutionTarget ?? '',
      targetForm: edge.dataset.evolutionTargetForm ?? '',
    }));
    return {
      id: Number(page.dataset.pokemonId),
      busy: page.getAttribute('aria-busy') === 'true',
      selectedName: page.dataset.selectedName ?? '',
      selectedForm: page.dataset.selectedForm ?? '',
      selectedPokemonType: Number(page.dataset.selectedPokemonType),
      detailFullName: page.dataset.detailFullName ?? '',
      detailForm: page.dataset.detailForm ?? '',
      detailPokemonType: Number(page.dataset.detailPokemonType),
      detailTypes: (page.dataset.detailTypes ?? '').split(',').filter(Boolean),
      bodyWeight: infoTable?.dataset.bodyWeight ?? '',
      bodyHeight: infoTable?.dataset.bodyHeight ?? '',
      title: document.title,
      href: location.href,
      bodyText: document.body.innerText,
      buttons,
      fastMoves: moves('[data-testid="pokemon-fast-moves"]'),
      chargedMoves: moves('[data-testid="pokemon-charged-moves"]'),
      evolutionNodes,
      evolutionEdges,
    };
  })()`);

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
      page.buttons.length > 0 &&
      page.detailFullName &&
      page.title.includes(`#${id}`),
    `Pokémon #${id}`
  );
};

const addIssue = (issues, id, code, details = {}) => issues.push({ id, code, ...details });

const expectedMoves = (row) => ({
  fast: [...(row.quickMoves ?? []), ...(row.eliteQuickMoves ?? [])].map(normalizeMove),
  charged: [
    ...(row.cinematicMoves ?? []),
    ...(row.eliteCinematicMoves ?? []),
    ...(row.purifiedMoves ?? []),
    ...(row.shadowMoves ?? []),
    ...(row.specialMoves ?? []),
    ...(row.exclusiveMoves ?? []),
  ].map(normalizeMove),
});

const validateExpectedRow = (issues, id, row, button, page) => {
  const context = { fullName: row.fullName, form: row.form, pokemonType: row.pokemonType };
  if (normalizeForm(page.detailForm) !== normalizeForm(row.form)) {
    addIssue(issues, id, 'detail_form_mismatch', { ...context, actual: page.detailForm });
  }
  if (normalize(page.detailFullName) !== normalize(row.fullName)) {
    addIssue(issues, id, 'detail_full_name_mismatch', { ...context, actual: page.detailFullName });
  }
  if (normalizePokemonType(page.detailPokemonType) !== normalizePokemonType(row.pokemonType)) {
    addIssue(issues, id, 'detail_pokemon_type_mismatch', { ...context, actual: page.detailPokemonType });
  }
  const expectedTypes = (row.types ?? []).map(normalize).sort();
  const actualTypes = page.detailTypes.map(normalize).sort();
  if (JSON.stringify(actualTypes) !== JSON.stringify(expectedTypes)) {
    addIssue(issues, id, 'types_mismatch', { ...context, expected: expectedTypes, actual: actualTypes });
  }

  const expected = expectedMoves(row);
  const actualFast = page.fastMoves.map(normalizeMove);
  const actualCharged = page.chargedMoves.map(normalizeMove);
  for (const move of expected.fast) {
    if (!actualFast.includes(move)) addIssue(issues, id, 'fast_move_missing', { ...context, move, actual: actualFast });
  }
  for (const move of expected.charged) {
    if (!actualCharged.includes(move)) {
      addIssue(issues, id, 'charged_move_missing', { ...context, move, actual: actualCharged });
    }
  }
  if (!button.active) addIssue(issues, id, 'clicked_form_not_active', { ...context, button });
  const nodeKeys = new Set(page.evolutionNodes.map((node) => node.key));
  for (const edge of page.evolutionEdges) {
    if (!nodeKeys.has(edge.source) || !nodeKeys.has(edge.target)) {
      addIssue(issues, id, 'evolution_edge_endpoint_missing', { ...context, edge });
    }
  }
  for (const node of page.evolutionNodes.filter((item) => item.stage > 0)) {
    if (!page.evolutionEdges.some((edge) => edge.target === node.key && edge.targetForm === node.form)) {
      addIssue(issues, id, 'evolution_node_missing_incoming_edge', { ...context, node });
    }
  }
};

const main = async () => {
  const startedAt = new Date().toISOString();
  const issues = [];
  const browserErrors = [];
  let auditedIds = 0;
  let auditedForms = 0;
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

  let isInitial = true;
  let previousPage;
  const idsToAudit = requestedIds.size ? [...requestedIds].sort((a, b) => a - b) : [...Array(toId - fromId + 1)].map((_, index) => fromId + index);
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
        const loadingPage = await waitFor(
          readPage,
          (value) => value?.busy,
          `Pokémon #${id} loading state`
        );
        if (loadingPage.id !== previousPage.id) {
          addIssue(issues, id, 'loading_snapshot_id_changed', {
            expected: previousPage.id,
            actual: loadingPage.id,
          });
        }
        if (
          loadingPage.bodyWeight !== previousPage.bodyWeight ||
          loadingPage.bodyHeight !== previousPage.bodyHeight
        ) {
          addIssue(issues, id, 'loading_body_snapshot_changed', {
            expected: { weight: previousPage.bodyWeight, height: previousPage.bodyHeight },
            actual: { weight: loadingPage.bodyWeight, height: loadingPage.bodyHeight },
          });
        }
        page = await waitFor(
          readPage,
          (value) =>
            value?.id === id &&
            !value.busy &&
            value.buttons.length > 0 &&
            value.detailFullName &&
            value.title.includes(`#${id}`),
          `Pokémon #${id}`
        );
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

      if (!page.title.includes(`#${id}`)) addIssue(issues, id, 'title_id_mismatch', { actual: page.title });
      if (/\b(undefined|NaN)\b/.test(page.bodyText)) addIssue(issues, id, 'invalid_text_rendered');

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
          await evaluate(`document.querySelectorAll('.form-container button[data-form]')[${buttonIndex}].click()`);
          page = await waitFor(
            readPage,
            (value) =>
              value?.id === id &&
              !value.busy &&
              value.buttons[buttonIndex]?.active &&
              normalizeForm(value.selectedForm) === normalizeForm(target.form) &&
              normalizePokemonType(value.selectedPokemonType) === normalizePokemonType(target.pokemonType),
            `Pokémon #${id} form ${row.fullName}`
          );
        }
        await delay(50);
        page = await readPage();
        auditedForms += 1;
        validateExpectedRow(issues, id, row, page.buttons[buttonIndex], page);
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
        if (target.active || testedForms.has(targetKey)) continue;
        await evaluate(`document.querySelectorAll('.form-container button[data-form]')[${index}].click()`);
        page = await waitFor(
          readPage,
          (value) =>
            value?.id === id &&
            value.buttons[index]?.active &&
            normalizeForm(value.selectedForm) === normalizeForm(target.form) &&
            normalizePokemonType(value.selectedPokemonType) === normalizePokemonType(target.pokemonType),
          `Pokémon #${id} displayed form ${target.label}`
        );
        await delay(50);
        page = await readPage();
        auditedForms += 1;
        testedForms.add(targetKey);
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
    range: { from: fromId, to: toId, latestPokemonGoId: lastPokemonId },
    summary: {
      expectedIds: idsToAudit.length,
      auditedIds,
      expectedGoForms: [...rowsById.values()].reduce((total, rows) => total + rows.length, 0),
      auditedForms,
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
    await Promise.race([
      new Promise((resolveExit) => browser.chrome.once('exit', resolveExit)),
      delay(2000),
    ]);
  }
  if (browser?.profilePath) {
    try {
      await rm(browser.profilePath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } catch {
      // Chrome may briefly retain files on macOS; the OS will clean this temporary directory.
    }
  }
}

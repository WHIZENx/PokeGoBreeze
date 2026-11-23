#!/usr/bin/env node

// Browser-driven typography audit. It visits every application route and opens
// representative menus, selects, tabs, accordions, and selectable cards so
// portalled and conditional text is included in the computed-style scan.

import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const interactive = process.argv.includes('--interactive');
const baseUrl = (
  process.argv.find((value) => value.startsWith('--base-url='))?.slice('--base-url='.length) ?? 'http://localhost:9000'
).replace(/\/$/, '');
const chromePath = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const routes = [
  '/',
  '/news',
  '/game-master-updates',
  '/type-effective',
  '/weather-boosts',
  '/search-pokemon',
  '/pokemon/9?form=GMAX',
  '/search-moves',
  '/move/266',
  '/search-types',
  '/find-cp-iv',
  '/calculate-stats',
  '/search-battle-stats',
  '/stats-table',
  '/damage-calculate',
  '/raid-battle',
  '/calculate-point',
  '/calculate-catch-chance',
  '/dps-tdo-sheets',
  '/stats-ranking',
  '/pvp',
  '/pvp/rankings/all/1500',
  '/pvp/teams/all/1500',
  '/pvp/battle/1500',
  '/pvp/2500/all/cradily?leagueType=overall',
  '/battle-leagues',
  '/trainer',
  '/stickers',
  '/__typography-audit-not-found__',
];
const viewports = [
  { name: 'desktop', width: 1440, height: 1200 },
  interactive ? { name: 'mobile', width: 375, height: 667 } : { name: 'mobile', width: 390, height: 844 },
];
const routeFilters = process.argv.filter((value) => value.startsWith('--route=')).map((value) => value.slice(8));
const viewportFilter = process.argv.find((value) => value.startsWith('--viewport='))?.slice('--viewport='.length);
const themeFilter = process.argv.find((value) => value.startsWith('--theme='))?.slice('--theme='.length);

if (interactive) {
  const { encodeBattleTimelineSeed } = await import('../../src/pages/PVP/Battle/utils/battle-seed.ts');
  const apiUrl = process.env.API_BASE_URL ?? 'http://localhost:3001';
  const getData = async (path) => {
    const response = await fetch(new URL(path, apiUrl), { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(path + ' returned HTTP ' + response.status);
    return (await response.json()).data;
  };
  const [archive, ...fighters] = await Promise.all([
    getData('/api/v1/game-master-updates?page=1&limit=1'),
    ...['cradily', 'altaria'].map((name) =>
      getData('/api/v1/pvp-pokemon?series=all&cp=1500&type=overall&name=' + name)
    ),
  ]);
  const [player, opponent] = fighters.map(({ id, pokemon, pokemonType, data, fMove, cMovePri }) => ({
    speciesId: data.speciesId,
    id,
    form: pokemon.form ?? '',
    pokemonType,
    fastMoveId: fMove.id,
    primaryMoveId: cMovePri.id,
    secondaryMoveId: 0,
    level: 20,
    atkIv: 0,
    defIv: 0,
    staIv: 0,
    energy: 0,
    block: 0,
    chargeSlot: 1,
    disablePrimary: false,
    disableSecondary: true,
    attackStage: 0,
    defenseStage: 0,
  }));
  const strategy = { shield: 'always', charged: 'selected', voluntarySwitch: 'none', forcedSwitch: 'first' };
  const seed = encodeBattleTimelineSeed({
    battle: {
      league: 1500,
      leagueId: 'DEFAULT_GREAT',
      playerTeam: [player],
      opponentTeam: [opponent],
      playerStrategy: strategy,
      opponentStrategy: strategy,
    },
    randomSeed: 123,
    showTap: false,
    timelineType: 0,
    duration: 1,
    volume: 0,
    progress: 0,
  });
  const patchSlug = archive.patches?.[0]?.slug;
  if (!patchSlug) throw new Error('The API did not return a Game Master patch slug.');
  routes.splice(routes.indexOf('/game-master-updates') + 1, 0, '/game-master-updates/' + encodeURIComponent(patchSlug));
  routes.splice(routes.indexOf('/pvp/battle/1500'), 0, '/pvp/battle');
  routes.splice(routes.indexOf('/pvp/battle/1500') + 1, 0, '/pvp/battle/1500/replay?seed=' + seed);

  const app = await readFile(new URL('../../src/App.tsx', import.meta.url), 'utf8');
  const patterns = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map(([, path]) => path);
  const uncovered = patterns.filter(
    (pattern) =>
      pattern !== '*' &&
      !routes.some((route) => {
        const shape = pattern.split('/');
        const parts = route.split('?')[0].split('/');
        return (
          parts.length === shape.length && shape.every((part, index) => part.startsWith(':') || part === parts[index])
        );
      })
  );
  if (uncovered.length) throw new Error('Missing browser fixtures for ' + uncovered.join(', '));
}

class Client {
  constructor(url) {
    this.url = url;
    this.sequence = 0;
    this.pending = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  send(method, params = {}, sessionId) {
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const profile = await mkdtemp(join(tmpdir(), 'pokebreeze-typography-audit-'));
const chrome = spawn(
  chromePath,
  [
    ...(interactive ? [] : ['--headless=new']),
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,1200',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] }
);

const debuggerUrl = await new Promise((resolve, reject) => {
  let stderr = '';
  const timer = setTimeout(() => reject(new Error('Chrome startup timed out')), 15000);
  chrome.stderr.setEncoding('utf8');
  chrome.stderr.on('data', (chunk) => {
    stderr += chunk;
    const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (!match) return;
    clearTimeout(timer);
    resolve(match[1]);
  });
  chrome.once('exit', (code) => reject(new Error(`Chrome exited with ${code}`)));
});

const client = new Client(debuggerUrl);
await client.connect();
const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await client.send('Target.attachToTarget', { targetId, flatten: true });
await client.send('Page.enable', {}, sessionId);
await client.send('Runtime.enable', {}, sessionId);

const evaluate = async (expression) => {
  const result = await client.send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    sessionId
  );
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};

const waitForApplication = async () => {
  const deadline = Date.now() + 30000;
  let latest;
  while (Date.now() < deadline) {
    latest = await evaluate(`(() => ({
      state: document.readyState,
      app: Boolean(document.querySelector('.app-theme-root')),
      text: document.body?.innerText?.trim().length ?? 0,
      routeContent: [...(document.querySelector('.app-theme-root')?.children ?? [])].some((element) =>
        !element.matches('.MuiAppBar-root, .MuiBackdrop-root') && element.textContent.trim().length > 0
      ),
      spinner: [...document.querySelectorAll('.app-theme-root > .MuiBackdrop-root')].some((element) =>
        getComputedStyle(element).visibility !== 'hidden' && Number(getComputedStyle(element).opacity) > 0
      )
    }))()`);
    if (latest.state !== 'loading' && latest.app && latest.text > 0 && latest.routeContent && !latest.spinner) return;
    await delay(150);
  }
  throw new Error(`Application did not settle: ${JSON.stringify(latest)}`);
};

const waitForInteraction = async () => {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const busy = await evaluate(
      `Boolean(document.querySelector('.MuiBackdrop-root[aria-hidden="false"], [aria-busy="true"]'))`
    );
    if (!busy) return;
    await delay(100);
  }
};

const scanTypography = () =>
  evaluate(`(() => {
    const bodyFamily = getComputedStyle(document.body).fontFamily;
    const expectedBold = getComputedStyle(document.documentElement).getPropertyValue('--font-weight-bold').trim();
    const selector = (element) => {
      if (element.id) return '#' + CSS.escape(element.id);
      const name = element.tagName.toLowerCase();
      const classes = [...element.classList].slice(0, 3).map((value) => '.' + CSS.escape(value)).join('');
      return name + classes;
    };
    const hasOwnText = (element) =>
      [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()) ||
      (element.matches('input, textarea') && Boolean(element.value || element.placeholder)) ||
      element.matches('option');
    const isVisible = (element) => {
      if (element.matches('option')) return !element.disabled;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    const familyFindings = [];
    const emphasisFindings = [];
    let textElements = 0;
    for (const element of document.body.querySelectorAll('*')) {
      if (!hasOwnText(element) || !isVisible(element)) continue;
      if (element.closest('code, pre, [aria-hidden="true"]') || element.matches('script, style, svg, title')) continue;
      textElements += 1;
      const style = getComputedStyle(element);
      const text = (element.value || element.textContent || element.placeholder || '').trim().replace(/\\s+/g, ' ').slice(0, 100);
      if (style.fontFamily !== bodyFamily) {
        familyFindings.push({ selector: selector(element), tag: element.tagName.toLowerCase(), text, expected: bodyFamily, actual: style.fontFamily });
      }
      if (element.matches('b, strong') && style.fontWeight !== expectedBold) {
        emphasisFindings.push({ selector: selector(element), tag: element.tagName.toLowerCase(), text, expected: expectedBold, actual: style.fontWeight });
      }
    }
    return {
      url: location.pathname + location.search,
      bodyFamily,
      textElements,
      familyFindings: familyFindings.slice(0, 100),
      emphasisFindings: emphasisFindings.slice(0, 100)
    };
  })()`);

const collectInteractions = () =>
  evaluate(`(() => {
    document.querySelectorAll('[data-typography-audit-id]').forEach((element) => element.removeAttribute('data-typography-audit-id'));
    const selector = [
      '[aria-haspopup="menu"]',
      '[aria-haspopup="listbox"]',
      '[role="combobox"]',
      '.MuiSelect-select',
      '.MuiAutocomplete-popupIndicator',
      '.MuiAccordionSummary-root',
      '[role="tab"]',
      '.MuiAppBar-root button',
      '.MuiCardActionArea-root',
      ...(${interactive} ? ['button', 'input:not([type=hidden])', 'details > summary', 'a[href^="/"]'] : []),
    ].join(',');
    const signatures = new Set();
    const interactions = [];
    for (const element of document.querySelectorAll(selector)) {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || rect.width < 1 || rect.height < 1 || element.disabled) continue;
      if (${interactive} && (element.closest('.MuiAppBar-root, [aria-hidden="true"]') ||
        element.getAttribute('aria-disabled') === 'true' || element.matches('[download], [target="_blank"]'))) continue;
      const kind = element.matches('.MuiCardActionArea-root')
        ? 'card'
        : element.matches('[role="tab"]')
          ? 'tab'
          : element.matches('.MuiAccordionSummary-root')
            ? 'accordion'
            : 'option-trigger';
      const text = (element.textContent || element.getAttribute('aria-label') || element.getAttribute('title') ||
        element.getAttribute('placeholder') || element.tagName).trim().replace(/\\s+/g, ' ').slice(0, 80);
      const signature = [kind, element.tagName, [...element.classList].slice(0, 2).join('.'), text].join('|');
      if (signatures.has(signature)) continue;
      signatures.add(signature);
      const id = String(interactions.length);
      element.setAttribute('data-typography-audit-id', id);
      interactions.push({ id, kind, text });
      if (interactions.length >= 60) break;
    }
    return interactions;
  })()`);

const dismissSurface = async () => {
  await client.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' }, sessionId);
  await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' }, sessionId);
  await delay(100);
};

const results = [];
let interactionsOpened = 0;
const interactiveFailures = [];
const auditedRoutes = routes.filter((entry) => !routeFilters.length || routeFilters.includes(entry.split('?')[0]));
const auditedViewports = viewports.filter((viewport) => !viewportFilter || viewport.name === viewportFilter);
const auditedThemes = interactive ? ['light', 'dark'].filter((theme) => !themeFilter || theme === themeFilter) : [null];
const exceptionTexts = new Set();
const verifyPageRendered = async (allowNotFound) => {
  const fallback = await evaluate(`(() => {
    const text = document.body.innerText;
    if (text.includes('The application encountered an error.')) {
      return document.querySelector('pre')?.textContent?.split('\\n')[0] ?? 'React application error fallback';
    }
    if (!${allowNotFound} && [...document.querySelectorAll('h1')].some(heading => heading.textContent.trim() === 'Page Not Found')) {
      return 'A registered route rendered the not-found screen';
    }
    return null;
  })()`);
  if (fallback) throw new Error(fallback);
};
client.socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') {
    const { exception, text } = message.params.exceptionDetails;
    exceptionTexts.add((exception?.description ?? text).split('\n')[0]);
  }
});
const clickControl = async (selector) => {
  const locate = `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
    const rect = element.getBoundingClientRect();
    const x = Math.min(innerWidth - 1, Math.max(1, rect.x + rect.width / 2));
    const y = Math.min(innerHeight - 1, Math.max(1, rect.y + rect.height / 2));
    return element.contains(document.elementFromPoint(x, y)) ? { x, y } : null;
  })()`;
  let point;
  for (let attempt = 0; attempt < 4 && !point; attempt++) {
    point = await evaluate(locate);
    if (!point) await delay(100);
  }
  if (!point) return false;
  for (const type of ['mousePressed', 'mouseReleased']) {
    await client.send('Input.dispatchMouseEvent', { type, button: 'left', clickCount: 1, ...point }, sessionId);
  }
  return true;
};
try {
  if (!auditedRoutes.length || !auditedViewports.length || !auditedThemes.length) {
    throw new Error('No browser audit cases matched the filters.');
  }
  for (const { viewport, theme } of auditedViewports.flatMap((viewport) =>
    auditedThemes.map((theme) => ({ viewport, theme }))
  )) {
    await client.send(
      'Emulation.setDeviceMetricsOverride',
      { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: viewport.name === 'mobile' },
      sessionId
    );
    if (theme) {
      await client.send('Page.navigate', { url: baseUrl }, sessionId);
      await waitForApplication();
      if ((await evaluate('document.documentElement.dataset.theme')) !== theme) {
        const selector = `button[aria-label="Switch to ${theme} theme"]`;
        if (!(await clickControl(selector))) throw new Error(`Could not click the ${theme} theme switch`);
        const deadline = Date.now() + 5000;
        while ((await evaluate('document.documentElement.dataset.theme')) !== theme) {
          if (Date.now() >= deadline) throw new Error(`The theme switch did not apply ${theme}`);
          await delay(100);
        }
      }
    }
    for (const route of auditedRoutes) {
      const routeUrl = baseUrl + route;
      if (interactive) {
        const observedRoute = route.split('?')[0];
        const allowNotFound = observedRoute === '/__typography-audit-not-found__';
        const label = `${theme} ${viewport.name} ${observedRoute}`;
        exceptionTexts.clear();
        try {
          await client.send('Page.navigate', { url: routeUrl }, sessionId);
          await waitForApplication();
          if (observedRoute.endsWith('/replay')) {
            const deadline = Date.now() + 15000;
            while (!(await evaluate('!!document.querySelector(\'[aria-label="Battle timeline"]\')'))) {
              if (Date.now() >= deadline) throw new Error('The seeded battle timeline did not render');
              await delay(150);
            }
          }
          await delay(300);
          await verifyPageRendered(allowNotFound);
          const controlsDeadline = Date.now() + 8000;
          while (!(await collectInteractions()).length && Date.now() < controlsDeadline) {
            await delay(200);
          }
          const initial = await evaluate(`({
            path: location.pathname,
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            theme: document.documentElement.dataset.theme
          })`);
          if (initial.path !== observedRoute) throw new Error(`rendered ${initial.path}`);
          if (initial.theme !== theme) throw new Error(`expected ${theme} theme, got ${initial.theme}`);
          const seen = new Set();
          const clicked = [];
          for (let attempt = 0; attempt < 8 && clicked.length < 3; attempt++) {
            const controls = await collectInteractions();
            const next = controls.find((control) => !seen.has(control.kind + control.text));
            if (!next) break;
            seen.add(next.kind + next.text);
            if (!(await clickControl(`[data-typography-audit-id="${next.id}"]`))) {
              await waitForApplication();
              continue;
            }
            clicked.push(next.text);
            interactionsOpened++;
            await delay(180);
            await verifyPageRendered(allowNotFound);
            if ((await evaluate('location.href')) !== routeUrl) break;
            await dismissSurface();
          }
          if (!clicked.length) throw new Error('no page controls clicked (' + [...seen].join(', ') + ')');
          if (exceptionTexts.size) throw new Error([...exceptionTexts].join(' | '));
          if (initial.overflow > 1) {
            const overflowSources = await evaluate(`[...document.querySelectorAll('.app-theme-root *')]
              .filter(element => {
                if (element.getBoundingClientRect().right <= document.documentElement.clientWidth) return false;
                for (let parent = element.parentElement; parent; parent = parent.parentElement) {
                  if (getComputedStyle(parent).overflowX !== 'visible') return false;
                }
                return true;
              })
              .slice(0, 6)
              .map(element => element.tagName + '.' + [...element.classList].slice(0, 3).join('.'))`);
            throw new Error(`page is ${initial.overflow}px wider than the viewport (${overflowSources.join(', ')})`);
          }
          console.log(`PASS ${label} | ${clicked.join(', ')}`);
        } catch (error) {
          interactiveFailures.push({ label, message: error.message });
          console.log(`FAIL ${label} | ${error.message}`);
        }
        continue;
      }
      await client.send('Page.navigate', { url: routeUrl }, sessionId);
      await waitForApplication();
      await delay(250);
      results.push({ viewport: viewport.name, route, interaction: 'page', ...(await scanTypography()) });

      const interactions = await collectInteractions();
      for (const interaction of interactions) {
        const beforeUrl = await evaluate('location.href');
        const clicked = await evaluate(`(() => {
          const element = document.querySelector('[data-typography-audit-id="${interaction.id}"]');
          if (!element) return false;
          element.click();
          return true;
        })()`);
        if (!clicked) continue;
        interactionsOpened += 1;
        await delay(200);
        await waitForInteraction();
        results.push({
          viewport: viewport.name,
          route,
          interaction: `${interaction.kind}: ${interaction.text}`,
          ...(await scanTypography()),
        });
        const afterUrl = await evaluate('location.href');
        if (afterUrl !== beforeUrl) {
          await client.send('Page.navigate', { url: routeUrl }, sessionId);
          await waitForApplication();
          await delay(150);
          await collectInteractions();
        } else {
          await dismissSurface();
        }
      }

      const routeFindings = results
        .filter((result) => result.viewport === viewport.name && result.route === route)
        .reduce((total, result) => total + result.familyFindings.length + result.emphasisFindings.length, 0);
      process.stdout.write(
        `${viewport.name.padEnd(7)} ${route.padEnd(55)} ${String(interactions.length).padStart(2)} interactions, ${routeFindings} findings\n`
      );
    }
  }
} finally {
  chrome.kill('SIGTERM');
  client.socket.close();
  await delay(250);
  await rm(profile, { recursive: true, force: true }).catch(() => undefined);
}

if (interactive) {
  console.log(
    `${auditedRoutes.length} routes × ${auditedViewports.length} viewports × ${auditedThemes.length} themes, ${interactionsOpened} pointer clicks, ${interactiveFailures.length} findings.`
  );
  process.exit(interactiveFailures.length ? 1 : 0);
}

const observedFindings = results.flatMap((result) => [
  ...result.familyFindings.map((finding) => ({
    viewport: result.viewport,
    route: result.route,
    interaction: result.interaction,
    type: 'family',
    ...finding,
  })),
  ...result.emphasisFindings.map((finding) => ({
    viewport: result.viewport,
    route: result.route,
    interaction: result.interaction,
    type: 'weight',
    ...finding,
  })),
]);
const findingGroups = new Map();
for (const finding of observedFindings) {
  const key = [finding.viewport, finding.route, finding.type, finding.selector, finding.expected, finding.actual].join(
    '|'
  );
  const current = findingGroups.get(key) ?? { ...finding, occurrences: 0, interactions: new Set() };
  current.occurrences += 1;
  current.interactions.add(finding.interaction);
  findingGroups.set(key, current);
}
const findings = [...findingGroups.values()].map((finding) => ({
  ...finding,
  interactions: [...finding.interactions].slice(0, 12),
}));
const auditedElements = results.reduce((total, result) => total + result.textElements, 0);
console.log(
  JSON.stringify(
    {
      viewports: viewports.map((viewport) => viewport.name),
      routes: routes.length,
      states: results.length,
      interactionsOpened,
      auditedElements,
      findings: findings.length,
      observedFindings: observedFindings.length,
      details: findings.slice(0, 200),
    },
    null,
    2
  )
);
process.exitCode = findings.length > 0 ? 1 : 0;

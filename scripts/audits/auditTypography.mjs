#!/usr/bin/env node

// Browser-driven typography audit. It visits every application route and opens
// representative menus, selects, tabs, accordions, and selectable cards so
// portalled and conditional text is included in the computed-style scan.

import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const baseUrl = (
  process.argv.find((value) => value.startsWith('--base-url='))?.split('=')[1] ?? 'http://localhost:9000'
).replace(/\/$/, '');
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
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
  { name: 'mobile', width: 390, height: 844 },
];

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
    '--headless=new',
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
      spinner: Boolean(document.querySelector('.MuiBackdrop-root[aria-hidden="false"]'))
    }))()`);
    if (latest.state === 'complete' && latest.app && latest.text > 0 && latest.routeContent && !latest.spinner) return;
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
      const text = (element.value || element.textContent || element.placeholder || '').trim().replace(/\s+/g, ' ').slice(0, 100);
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
      '.MuiCardActionArea-root'
    ].join(',');
    const signatures = new Set();
    const interactions = [];
    for (const element of document.querySelectorAll(selector)) {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || rect.width < 1 || rect.height < 1 || element.disabled) continue;
      const kind = element.matches('.MuiCardActionArea-root')
        ? 'card'
        : element.matches('[role="tab"]')
          ? 'tab'
          : element.matches('.MuiAccordionSummary-root')
            ? 'accordion'
            : 'option-trigger';
      const text = (element.textContent || element.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 80);
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
try {
  for (const viewport of viewports) {
    await client.send(
      'Emulation.setDeviceMetricsOverride',
      { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: viewport.name === 'mobile' },
      sessionId
    );
    for (const route of routes) {
      const routeUrl = baseUrl + route;
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

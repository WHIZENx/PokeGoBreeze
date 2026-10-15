#!/usr/bin/env node

// Audits rendered application routes in both supported themes.

import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const baseUrl = (
  process.argv.find((value) => value.startsWith('--base-url='))?.split('=')[1] ?? 'http://localhost:9000'
).replace(/\/$/, '');
const outputPath = process.argv.find((value) => value.startsWith('--output='))?.split('=')[1];
const toggleOnly = process.argv.includes('--toggle-only');
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
  '/__theme-audit-not-found__',
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

const profile = await mkdtemp(join(tmpdir(), 'pokebreeze-theme-audit-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
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

const waitForPage = async (mode) => {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const ready = await evaluate(`(() => ({
      state: document.readyState,
      theme: document.documentElement.dataset.theme,
      text: document.body?.innerText?.trim().length ?? 0,
      spinner: Boolean(document.querySelector('.MuiBackdrop-root[aria-hidden="false"]'))
    }))()`);
    if (ready.state === 'complete' && ready.theme === mode && ready.text > 0 && !ready.spinner) return;
    await delay(150);
  }
  throw new Error(`Page did not settle in ${mode} mode`);
};

const scan = () =>
  evaluate(`(() => {
    const parse = (value) => {
      const match = value.match(/[\\d.]+/g);
      if (!match || match.length < 3) return null;
      return { r: Number(match[0]), g: Number(match[1]), b: Number(match[2]), a: Number(match[3] ?? 1) };
    };
    const luminance = ({ r, g, b }) => {
      const channel = (value) => {
        value /= 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const contrast = (left, right) => {
      const first = luminance(left);
      const second = luminance(right);
      return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
    };
    const selector = (element) => {
      if (element.id) return '#' + CSS.escape(element.id);
      const name = element.tagName.toLowerCase();
      const classes = [...element.classList].slice(0, 3).map((value) => '.' + CSS.escape(value)).join('');
      return name + classes;
    };
    const composite = (foreground, background) => {
      const alpha = foreground.a + background.a * (1 - foreground.a);
      if (alpha === 0) return { r: 0, g: 0, b: 0, a: 0 };
      const channel = (name) =>
        (foreground[name] * foreground.a + background[name] * background.a * (1 - foreground.a)) / alpha;
      return { r: channel('r'), g: channel('g'), b: channel('b'), a: alpha };
    };
    const background = (element) => {
      const layers = [];
      let current = element;
      while (current) {
        const style = getComputedStyle(current);
        if (style.backgroundImage !== 'none') return null;
        const color = parse(style.backgroundColor);
        if (color?.a > 0) layers.push(color);
        if (color?.a >= 0.999) break;
        current = current.parentElement;
      }
      if (!layers.length) return parse(getComputedStyle(document.body).backgroundColor);
      let result = layers.pop();
      while (layers.length) result = composite(layers.pop(), result);
      return result;
    };
    const findings = [];
    for (const element of document.body.querySelectorAll('*')) {
      const text = [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent.trim())
        .filter(Boolean)
        .join(' ');
      if (!text) continue;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) < 0.5 || rect.width < 1 || rect.height < 1) continue;
      if (element.matches('.MuiRating-visuallyHidden') || (rect.width <= 1 && rect.height <= 1)) continue;
      // These labels are positioned over image elements. A DOM background walk
      // sees the page beneath the image instead of the pixels users see.
      if (element.closest('.error-desc') || element.matches('.combat-center-league-text')) continue;
      // Branded type/ranking chips use an explicit outline or shadow to stay
      // legible over canonical game colors; they are not theme foregrounds.
      if (style.textShadow !== 'none' || style.filter !== 'none') continue;
      if (element.matches(':disabled, [aria-disabled="true"]')) continue;
      const foreground = parse(style.color);
      const bg = background(element);
      if (!foreground || !bg) continue;
      const ratio = contrast(foreground, bg);
      const fontSize = Number.parseFloat(style.fontSize);
      const bold = Number(style.fontWeight) >= 700;
      const threshold = fontSize >= 24 || (bold && fontSize >= 18.66) ? 3 : 4.5;
      if (ratio + 0.01 >= threshold) continue;
      findings.push({
        selector: selector(element),
        text: text.slice(0, 80),
        ratio: Number(ratio.toFixed(2)),
        threshold,
        color: style.color,
        background: 'rgb(' + bg.r + ', ' + bg.g + ', ' + bg.b + ')',
      });
    }
    return {
      title: document.title,
      theme: document.documentElement.dataset.theme,
      bodyColor: getComputedStyle(document.body).color,
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      findings: findings.slice(0, 50),
    };
  })()`);

const results = [];
let toggleResult;
try {
  await client.send('Page.navigate', { url: baseUrl }, sessionId);
  await waitForPage('light');
  toggleResult = await evaluate(`(async () => {
    const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    const toggle = async (expected) => {
      const startedAt = performance.now();
      const button = document.querySelector('button[aria-label^="Switch to"]');
      button?.click();
      await pause(25);
      button?.click();
      for (let index = 0; index < 15 && document.documentElement.dataset.theme !== expected; index += 1) {
        await pause(10);
      }
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const animation = {
        hasSun: Boolean(button?.querySelector('.theme-toggle-sun')),
        hasMoon: Boolean(button?.querySelector('.theme-toggle-moon')),
        lockedDuringTransition: button?.getAttribute('aria-disabled') === 'true',
        running: document.getAnimations({ subtree: true }).length,
        usesViewTransition: typeof document.startViewTransition === 'function',
        sunTransition: button?.querySelector('.theme-toggle-sun')
          ? getComputedStyle(button.querySelector('.theme-toggle-sun')).transitionDuration
          : '',
        moonTransition: button?.querySelector('.theme-toggle-moon')
          ? getComputedStyle(button.querySelector('.theme-toggle-moon')).transitionDuration
          : '',
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches
      };
      const samples = [];
      for (let index = 0; index < 55; index += 1) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const currentButton = document.querySelector('button[aria-label^="Switch to"]');
        const appRoot = document.querySelector('.app-theme-root');
        const appBar = document.querySelector('.MuiAppBar-root');
        samples.push({
          elapsed: performance.now() - startedAt,
          theme: document.documentElement.dataset.theme,
          stored: JSON.parse(localStorage.getItem('theme') ?? 'null'),
          label: currentButton?.getAttribute('aria-label'),
          locked: currentButton?.getAttribute('aria-disabled'),
          bodyBackground: getComputedStyle(document.body).backgroundColor,
          appBackground: appRoot ? getComputedStyle(appRoot).backgroundColor : '',
          appBarBackground: appBar ? getComputedStyle(appBar).backgroundColor : ''
        });
      }
      const firstExpected = samples.findIndex((sample) => sample.theme === expected);
      return {
        expected,
        firstExpectedMs: firstExpected < 0 ? null : samples[firstExpected].elapsed,
        bounced: firstExpected >= 0 && samples.slice(firstExpected).some((sample) => sample.theme !== expected),
        final: samples.at(-1),
        animation,
        samples
      };
    };
    return [await toggle('dark'), await toggle('light')];
  })()`);
  if (!toggleOnly) {
    for (const mode of ['light', 'dark']) {
      await evaluate(`localStorage.setItem('theme', ${JSON.stringify(JSON.stringify(mode))})`);
      for (const route of routes) {
        await client.send('Page.navigate', { url: baseUrl + route }, sessionId);
        await waitForPage(mode);
        await delay(250);
        const result = await scan();
        results.push({ mode, route, ...result });
        process.stdout.write(`${mode.padEnd(5)} ${route.padEnd(55)} ${result.findings.length} contrast findings\n`);
      }
    }
  }
} finally {
  chrome.kill('SIGTERM');
  client.socket.close();
  await delay(250);
  await rm(profile, { recursive: true, force: true }).catch(() => undefined);
}

const failures = results.filter((result) => result.findings.length > 0);
const toggleFailures = (toggleResult ?? []).filter(
  (result) =>
    result.firstExpectedMs === null ||
    result.firstExpectedMs > 100 ||
    result.bounced ||
    !result.animation?.hasSun ||
    !result.animation?.hasMoon ||
    !result.animation?.lockedDuringTransition ||
    (!result.animation?.reducedMotion && result.animation?.running === 0) ||
    result.final?.theme !== result.expected ||
    result.final?.stored !== result.expected
);
const report = { pages: results.length, toggleResult, toggleFailures, failures };
if (outputPath) await writeFile(outputPath, JSON.stringify(report, null, 2));
console.log(
  'Theme toggle audit:',
  JSON.stringify(
    (toggleResult ?? []).map((result) => ({
      expected: result.expected,
      firstExpectedMs: Math.round(result.firstExpectedMs ?? -1),
      bounced: result.bounced,
      animation: result.animation,
      finalTheme: result.final?.theme,
      storedTheme: result.final?.stored,
      colorChanges: result.samples.filter((sample, index, samples) => {
        const previous = samples[index - 1];
        return !previous || sample.bodyBackground !== previous.bodyBackground ||
          sample.appBackground !== previous.appBackground ||
          sample.appBarBackground !== previous.appBarBackground ||
          sample.locked !== previous.locked;
      }),
    }))
  )
);
const groups = new Map();
for (const result of failures) {
  for (const finding of result.findings) {
    const key = [result.mode, finding.selector, finding.color, finding.background].join('|');
    const current = groups.get(key) ?? { mode: result.mode, ...finding, count: 0, routes: new Set() };
    current.count += 1;
    current.routes.add(result.route);
    groups.set(key, current);
  }
}
console.log(
  JSON.stringify(
    [...groups.values()]
      .sort((left, right) => right.count - left.count)
      .slice(0, 80)
      .map((item) => ({ ...item, routes: [...item.routes].slice(0, 8) })),
    null,
    2
  )
);
if (outputPath) console.log(`Report: ${outputPath}`);
process.exitCode = failures.length > 0 || toggleFailures.length > 0 ? 1 : 0;

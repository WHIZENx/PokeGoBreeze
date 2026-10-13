#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDir, '../../..');
const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const argument = process.argv[index];
  if (!argument.startsWith('--')) continue;
  const [key, inlineValue] = argument.slice(2).split('=', 2);
  const next = process.argv[index + 1];
  args.set(key, inlineValue ?? (next && !next.startsWith('--') ? process.argv[++index] : 'true'));
}

const baseUrl = (args.get('base-url') ?? 'http://localhost:9000').replace(/\/$/, '');
const inputPath = resolve(workspaceRoot, args.get('input') ?? 'artifacts/pvp-rankings-audit.json');
const outputPath = resolve(workspaceRoot, args.get('output') ?? 'artifacts/pvp-details-ui-audit.json');
const timeoutMs = Number.parseInt(args.get('timeout') ?? '20000', 10);
const partIndex = Number.parseInt(args.get('part-index') ?? '0', 10);
const partCount = Number.parseInt(args.get('part-count') ?? '1', 10);
const chromePath = args.get('chrome') ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const normalize = (value) => String(value ?? '').trim().replaceAll('-', '_').replaceAll(' ', '_').toUpperCase();
const input = JSON.parse(await readFile(inputPath, 'utf8'));
const requestedSpecies = args.get('species')?.trim().toLowerCase();
const targetLimit = Number.parseInt(args.get('limit') ?? '0', 10);
const selectedTargets = input.pageTargets.filter(
  (target) => !requestedSpecies || String(target.speciesId).toLowerCase() === requestedSpecies
);
const targets = selectedTargets
  .filter((_, index) => index % partCount === partIndex)
  .slice(0, targetLimit > 0 ? targetLimit : undefined);

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
const profilePath = await mkdtemp(join(tmpdir(), 'pokebreeze-pvp-audit-'));
const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--disable-background-networking',
  '--no-first-run',
  '--no-default-browser-check',
  '--remote-debugging-port=0',
  `--user-data-dir=${profilePath}`,
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
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

const client = new CdpClient(debuggerUrl);
await client.connect();
const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await client.send('Target.attachToTarget', { targetId, flatten: true });
await client.send('Page.enable', {}, sessionId);
await client.send('Runtime.enable', {}, sessionId);
const browserErrors = [];
let currentTarget;
client.socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.sessionId !== sessionId || message.method !== 'Runtime.exceptionThrown') return;
  const details = message.params.exceptionDetails;
  const text = details.exception?.description ?? details.text;
  if (details.url?.includes('/@vite/client') && text.includes('WebSocket closed without opened')) return;
  browserErrors.push({ target: currentTarget, text });
});

const evaluate = async (expression) => {
  const result = await client.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
};
const readPage = () => evaluate(`(() => {
  const page = document.querySelector('[data-testid="pvp-pokemon-details-page"]');
  if (!page) return { found: false, title: document.title, text: document.body?.innerText ?? '', href: location.href };
  return {
    found: true,
    busy: page.getAttribute('aria-busy') === 'true',
    requestKey: page.dataset.requestKey ?? '',
    speciesId: page.dataset.sourceSpeciesId ?? '',
    id: Number(page.dataset.pokemonId),
    fullName: page.dataset.pokemonFullName ?? '',
    form: page.dataset.pokemonForm ?? '',
    pokemonType: Number(page.dataset.pokemonType),
    leagueId: page.dataset.leagueId ?? '',
    fastMove: page.dataset.fastMove ?? '',
    primaryMove: page.dataset.primaryMove ?? '',
    secondaryMove: page.dataset.secondaryMove ?? '',
    title: document.title,
    text: document.body?.innerText ?? '',
    href: location.href,
  };
})()`);
const waitForPage = async (target) => {
  const deadline = Date.now() + timeoutMs;
  const requestKey = `${target.cp}:${target.series}:${target.type}:${target.speciesId.replaceAll('_', '-')}`.toLowerCase();
  let last;
  while (Date.now() < deadline) {
    last = await readPage();
    if (
      last.found &&
      !last.busy &&
      last.requestKey === requestKey &&
      normalize(last.speciesId) === normalize(target.speciesId)
    ) return last;
    await delay(75);
  }
  throw new Error(`Timed out; last=${JSON.stringify(last)}`);
};

const issues = [];
let audited = 0;
let initial = true;
try {
  for (const target of targets) {
    currentTarget = target;
    const path = `/pvp/${target.cp}/${target.series}/${target.speciesId.replaceAll('_', '-')}?leagueType=${target.type}`;
    try {
      if (initial) {
        await client.send('Page.navigate', { url: `${baseUrl}${path}` }, sessionId);
        initial = false;
      } else {
        await evaluate(`(() => { history.pushState({}, '', ${JSON.stringify(path)}); window.dispatchEvent(new PopStateEvent('popstate', { state: {} })); })()`);
      }
      const page = await waitForPage(target);
      const checks = [
        ['pokemon_id_mismatch', Number(target.expectedId), page.id],
        ['pokemon_full_name_mismatch', normalize(target.expectedFullName), normalize(page.fullName)],
        ['league_id_mismatch', normalize(target.series), normalize(page.leagueId)],
        ['fast_move_mismatch', normalize(target.expectedFastMove), normalize(page.fastMove)],
        ['primary_move_mismatch', normalize(target.expectedPrimaryMove), normalize(page.primaryMove)],
        ['secondary_move_mismatch', normalize(target.expectedSecondaryMove), normalize(page.secondaryMove)],
      ];
      checks.forEach(([code, expected, actual]) => {
        if (expected !== actual) issues.push({ code, target, expected, actual, page });
      });
      if (/\b(undefined|NaN)\b/.test(page.text)) issues.push({ code: 'invalid_text_rendered', target, page });
      audited += 1;
    } catch (error) {
      issues.push({ code: 'page_audit_failed', target, error: error.message });
      initial = true;
    }
    if (audited % 100 === 0 || audited + issues.filter((issue) => issue.code === 'page_audit_failed').length === targets.length) {
      process.stdout.write(`Part ${partIndex + 1}/${partCount}: audited ${audited}/${targets.length}, ${issues.length} issues\n`);
    }
  }
} finally {
  client.close();
  if (chrome.exitCode === null) {
    const exited = new Promise((resolveExit) => chrome.once('exit', resolveExit));
    chrome.kill('SIGTERM');
    await exited;
  }
  await rm(profilePath, { recursive: true, force: true });
}

const report = {
  generatedAt: new Date().toISOString(),
  sourceReport: inputPath,
  partIndex,
  partCount,
  summary: { expectedPages: targets.length, auditedPages: audited, issues: issues.length, browserErrors: browserErrors.length },
  issues,
  browserErrors,
};
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Report: ${outputPath}`);
process.exit(issues.length || browserErrors.length ? 1 : 0);

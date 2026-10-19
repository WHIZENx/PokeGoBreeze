#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const baseUrl = (
  process.argv.find((value) => value.startsWith('--base-url='))?.split('=', 2)[1] ?? 'http://localhost:9000'
).replace(/\/$/, '');
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const timeoutMs = 20_000;
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const profilePath = await mkdtemp(join(tmpdir(), 'pokebreeze-pvp-navigation-'));
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

let socket;
try {
  const debuggerUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Chrome did not expose a DevTools URL')), timeoutMs);
    let stderr = '';
    chrome.stderr.setEncoding('utf8');
    chrome.stderr.on('data', (chunk) => {
      stderr += chunk;
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
  });
  socket = new WebSocket(debuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let sequence = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });
  const send = (method, params = {}, sessionId) => {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  };
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  await send(
    'Emulation.setDeviceMetricsOverride',
    { width: 1280, height: 600, deviceScaleFactor: 1, mobile: false },
    sessionId
  );
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
    if (result.exceptionDetails)
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result.value;
  };
  const waitFor = async (read, predicate, description) => {
    const deadline = Date.now() + timeoutMs;
    let value;
    while (Date.now() < deadline) {
      value = await read();
      if (predicate(value)) return value;
      await delay(75);
    }
    throw new Error(`Timed out waiting for ${description}; last=${JSON.stringify(value)}`);
  };
  const paths = ['rankings', 'teams', 'battle'];
  const results = [];
  for (const path of paths) {
    await send('Page.navigate', { url: `${baseUrl}/pvp` }, sessionId);
    await waitFor(
      () =>
        evaluate(`document.querySelectorAll('[data-testid="pvp-league-card"][data-pvp-card-path="${path}"]').length`),
      (count) => count > 0,
      `${path} card`
    );
    const before = await evaluate(`(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      scrollTo(0, Math.min(600, max));
      return { scrollY, max };
    })()`);
    if (before.max <= 0 || before.scrollY <= 0) throw new Error(`PvP page is not scrollable for ${path}`);
    await evaluate(`document.querySelector('[data-testid="pvp-league-card"][data-pvp-card-path="${path}"]').click()`);
    const after = await waitFor(
      () => evaluate(`({ pathname: location.pathname, scrollY })`),
      (value) => value.pathname !== '/pvp' && value.scrollY === 0,
      `${path} navigation at scrollY 0`
    );
    results.push({ path, fromScrollY: before.scrollY, pathname: after.pathname, scrollY: after.scrollY });
  }
  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
  process.stdout.write(`Validated ${results.length} PvP card redirects at scrollY 0.\n`);
} finally {
  socket?.close();
  if (!chrome.killed) chrome.kill('SIGTERM');
  await rm(profilePath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}

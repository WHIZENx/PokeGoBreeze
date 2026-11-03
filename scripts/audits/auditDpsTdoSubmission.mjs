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
const profilePath = await mkdtemp(join(tmpdir(), 'pokebreeze-dps-tdo-submission-'));
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
      if (!match) return;
      clearTimeout(timer);
      resolve(match[1]);
    });
  });
  socket = new WebSocket(debuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let sequence = 0;
  const pending = new Map();
  const dpsTdoRequests = [];
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.method === 'Network.requestWillBeSent' && message.params.request.url.includes('/api/v1/dps-tdo')) {
      dpsTdoRequests.push(message.params.request.url);
    }
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
  await send('Network.enable', {}, sessionId);
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    }
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

  await send('Page.navigate', { url: `${baseUrl}/dps-tdo-sheets` }, sessionId);
  await waitFor(
    () => evaluate(`Boolean(document.querySelector('[data-testid="dps-tdo-options-section"]'))`),
    Boolean,
    'DPS/TDO calculation options'
  );
  await waitFor(
    () => Promise.resolve(dpsTdoRequests.length),
    (count) => count > 0,
    'initial DPS/TDO request'
  );
  await delay(500);
  dpsTdoRequests.length = 0;

  const updatedDefense = await evaluate(`(() => {
    const input = document.querySelector('input[name="pokemonDefObj"]');
    if (!input) throw new Error('Fallback Target Defense input not found');
    const nextValue = String(Number(input.value) + 1);
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, nextValue);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return nextValue;
  })()`);
  await delay(700);
  if (dpsTdoRequests.length > 0) {
    throw new Error(`Calculation option edit triggered ${dpsTdoRequests.length} request(s) before Calculate`);
  }

  await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((item) => item.textContent.trim() === 'Calculate');
    if (!button) throw new Error('Calculate button not found');
    button.click();
  })()`);
  await waitFor(
    () => Promise.resolve(dpsTdoRequests.length),
    (count) => count > 0,
    'submitted DPS/TDO request'
  );
  const submittedUrl = new URL(dpsTdoRequests.at(-1));
  if (submittedUrl.searchParams.get('pokemonDefObj') !== updatedDefense) {
    throw new Error('Submitted request did not contain the edited Fallback Target Defense value');
  }

  process.stdout.write(
    `Validated deferred DPS/TDO calculation submission: Fallback Target Defense ${updatedDefense}, ${dpsTdoRequests.length} submitted request.\n`
  );
} finally {
  socket?.close();
  if (!chrome.killed) chrome.kill('SIGTERM');
  await rm(profilePath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}

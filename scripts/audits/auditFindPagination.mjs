#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const baseUrl = process.env.WEB_BASE_URL ?? 'http://localhost:9000';
const profile = await mkdtemp(join(tmpdir(), 'pokebreeze-find-pagination-'));
const chrome = spawn(
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
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
let socket;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
try {
  const debuggerUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Chrome startup timeout')), 20_000);
    let stderr = '';
    chrome.stderr.on('data', (chunk) => {
      stderr += chunk;
      const match = stderr.match(/DevTools listening on (ws:\/\/\S+)/);
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
  const requests = [];
  const errors = [];
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === 'Network.requestWillBeSent' && message.params.request.url.includes('/api/v1/find?')) {
      requests.push(new URL(message.params.request.url));
    }
    if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params.exceptionDetails;
      errors.push({
        message: details.exception?.description ?? details.text,
        url: details.url,
        line: details.lineNumber,
      });
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
    if (result.exceptionDetails)
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result.value;
  };
  const waitFor = async (expression, description) => {
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      if (await evaluate(expression)) return;
      await delay(75);
    }
    throw new Error(`Timeout: ${description}; ${await evaluate('document.body.innerText.slice(-2000)')}`);
  };
  // Only fixed audit table expressions are executable code.
  const tableExpressions = new Map([
    [
      'Pokémon MIN/MAX CP',
      "Array.from(document.querySelectorAll('.rdt-v7-compat')).find(e => e.textContent.includes('Pokémon MIN/MAX CP'))",
    ],
    [
      'Levels/IV for CP:',
      "Array.from(document.querySelectorAll('.rdt-v7-compat')).find(e => e.textContent.includes('Levels/IV for CP:'))",
    ],
    [
      'Levels/IV for CP: 700',
      "Array.from(document.querySelectorAll('.rdt-v7-compat')).find(e => e.textContent.includes('Levels/IV for CP: 700'))",
    ],
    [
      'Levels/CP for IV:',
      "Array.from(document.querySelectorAll('.rdt-v7-compat')).find(e => e.textContent.includes('Levels/CP for IV:'))",
    ],
  ]);
  const table = (name) => {
    const expression = tableExpressions.get(name);
    assert(expression, 'Unknown audit table');
    return expression;
  };
  const ready = (name) =>
    `(() => {const t=${table(name)};return t?.querySelectorAll('.rdt_TableRow').length > 0 && !t.querySelector('[role="progressbar"]')})()`;
  const tableAction = (name, action) =>
    evaluate(`(() => {const t=${table(name)};if(!t)throw Error('Table missing');${action}})()`);
  const setInput = async (selector, value) => {
    const global = await send('Runtime.evaluate', { expression: 'globalThis' }, sessionId);
    const objectId = global.result.objectId;
    try {
      const result = await send(
        'Runtime.callFunctionOn',
        {
          objectId,
          functionDeclaration: `function(selector, value) {
          const input = document.querySelector(selector);
          if (!input) throw Error('Input missing');
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }`,
          arguments: [{ value: selector }, { value }],
          returnByValue: true,
        },
        sessionId
      );
      if (result.exceptionDetails)
        throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    } finally {
      await send('Runtime.releaseObject', { objectId }, sessionId);
    }
  };
  await send('Page.navigate', { url: `${baseUrl}/find-cp-iv` }, sessionId);
  await waitFor(ready('Pokémon MIN/MAX CP'), 'initial MIN/MAX rows');
  await tableAction('Pokémon MIN/MAX CP', `t.querySelector('button[title="Go to next page"]').click()`);
  await waitFor(`Boolean((${table('Pokémon MIN/MAX CP')})?.textContent.includes('11-20'))`, 'MIN/MAX second page');
  await waitFor(ready('Pokémon MIN/MAX CP'), 'MIN/MAX second page loaded');
  assert(requests.some((url) => url.searchParams.get('mode') === 'minmax' && url.searchParams.get('page') === '2'));
  await setInput('input[placeholder="Enter CP"]', '500');
  await evaluate(`document.querySelector('input[placeholder="Enter CP"]').closest('form').requestSubmit()`);
  await waitFor(ready('Levels/IV for CP:'), 'IV results');
  const summaryExpression = `Array.from(document.querySelector('.find-iv-result-table').parentElement.querySelectorAll('p')).filter(e=>!e.closest('.rdt-v7-compat')).map(e=>e.textContent)`;
  const summary = await evaluate(summaryExpression);
  assert(summary.some((text) => text.includes('All of result:')));
  assert(summary.some((text) => text.includes('Average of percent:')));
  await tableAction('Levels/IV for CP:', `t.querySelector('button[title="Go to next page"]').click()`);
  await waitFor(`Boolean((${table('Levels/IV for CP:')})?.textContent.includes('11-20'))`, 'IV second page');
  await waitFor(ready('Levels/IV for CP:'), 'IV second page loaded');
  assert.deepEqual(await evaluate(summaryExpression), summary);
  // Editing an unsubmitted CP must not change the search used by pagination.
  await setInput('input[placeholder="Enter CP"]', '600');
  await tableAction('Levels/IV for CP:', `t.querySelector('button[title="Go to next page"]').click()`);
  await waitFor(`Boolean((${table('Levels/IV for CP:')})?.textContent.includes('21-30'))`, 'IV third page');
  await waitFor(ready('Levels/IV for CP:'), 'IV third page loaded');
  const lastIv = requests.filter((url) => url.searchParams.get('mode') === 'iv').at(-1);
  assert.equal(lastIv.searchParams.get('cp'), '500');
  assert.equal(lastIv.searchParams.get('page'), '3');
  await tableAction('Levels/IV for CP:', `t.querySelector('.rdt_TableCol_Sortable').click()`);
  await waitFor(`Boolean((${table('Levels/IV for CP:')})?.textContent.includes('1-10'))`, 'sort reset to first page');
  await waitFor(ready('Levels/IV for CP:'), 'IV sorting');
  const sortedIv = requests.filter((url) => url.searchParams.get('mode') === 'iv').at(-1);
  assert.equal(sortedIv.searchParams.get('sort'), 'level');
  assert.equal(sortedIv.searchParams.get('page'), '1');
  await tableAction(
    'Levels/IV for CP:',
    `t.querySelector('[role="combobox"]').dispatchEvent(new MouseEvent('mousedown',{bubbles:true,button:0}))`
  );
  await waitFor(`Boolean(document.querySelector('[role="option"][data-value="20"]'))`, 'page size menu');
  await evaluate(`document.querySelector('[role="option"][data-value="20"]').click()`);
  await waitFor(`Boolean((${table('Levels/IV for CP:')})?.textContent.includes('1-20'))`, '20 rows per page');
  await waitFor(ready('Levels/IV for CP:'), '20 IV rows loaded');
  assert.equal(
    requests
      .filter((url) => url.searchParams.get('mode') === 'iv')
      .at(-1)
      .searchParams.get('limit'),
    '20'
  );
  await evaluate(`document.querySelector('#formCP').requestSubmit()`);
  await waitFor(ready('Levels/CP for IV:'), 'CP results');
  const cpSummary = await evaluate(summaryExpression);
  assert(cpSummary.some((text) => text.includes('Average of CP:')));
  assert(cpSummary.filter((text) => text.includes('Average of HP:')).length === 2);
  await tableAction('Levels/CP for IV:', `t.querySelector('button[title="Go to next page"]').click()`);
  await waitFor(`Boolean((${table('Levels/CP for IV:')})?.textContent.includes('11-20'))`, 'CP second page');
  await waitFor(ready('Levels/CP for IV:'), 'CP second page loaded');
  assert.deepEqual(await evaluate(summaryExpression), cpSummary);
  await send(
    'Network.emulateNetworkConditions',
    {
      offline: false,
      latency: 200,
      downloadThroughput: -1,
      uploadThroughput: -1,
    },
    sessionId
  );
  await evaluate(`document.querySelector('input[placeholder="Enter CP"]').closest('form').requestSubmit()`);
  await waitFor(`Boolean((${table('Levels/IV for CP:')})?.querySelector('[role="progressbar"]'))`, 'refresh progress');
  await setInput('input[placeholder="Enter CP"]', '700');
  await evaluate(`document.querySelector('input[placeholder="Enter CP"]').closest('form').requestSubmit()`);
  await waitFor(ready('Levels/IV for CP: 700'), 'latest search after cancellation');
  await delay(500);
  assert(await evaluate(`Boolean(${table('Levels/IV for CP: 700')})`));
  assert(requests.every((url) => url.searchParams.has('page') && url.searchParams.has('limit')));
  assert.deepEqual(errors, []);
  console.log(
    `Find pagination browser regression passed: ${requests.length} requests, all three tables, full-result summaries, and submitted-input snapshot.`
  );
} finally {
  socket?.close();
  chrome.kill('SIGTERM');
  await delay(300);
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}

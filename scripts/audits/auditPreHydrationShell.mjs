#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, ...value] = argument.split('=');
    return [key, value.join('=')];
  })
);
const htmlPath = resolve(args.get('--html') || 'dist/index.html');
const chromePath = args.get('--chrome') || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

class Client {
  constructor(url) {
    this.url = url;
    this.sequence = 0;
    this.pending = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    await new Promise((resolveSocket, rejectSocket) => {
      this.socket.addEventListener('open', resolveSocket, { once: true });
      this.socket.addEventListener('error', rejectSocket, { once: true });
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
    return new Promise((resolveMessage, rejectMessage) => {
      this.pending.set(id, { resolve: resolveMessage, reject: rejectMessage });
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }

  close() {
    this.socket?.close();
  }
}

const profilePath = await mkdtemp(`${tmpdir()}/pokebreeze-pre-hydration-audit-`);
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=0',
    `--user-data-dir=${profilePath}`,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] }
);

let client;
try {
  const debuggerUrl = await new Promise((resolveUrl, rejectUrl) => {
    let stderr = '';
    const timer = setTimeout(() => rejectUrl(new Error('Chrome startup timed out')), 15000);
    chrome.stderr.setEncoding('utf8');
    chrome.stderr.on('data', (chunk) => {
      stderr += chunk;
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (!match) return;
      clearTimeout(timer);
      resolveUrl(match[1]);
    });
    chrome.once('exit', (code) => {
      clearTimeout(timer);
      rejectUrl(new Error(`Chrome exited before startup (code ${code})`));
    });
  });

  client = new Client(debuggerUrl);
  await client.connect();
  const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await client.send('Target.attachToTarget', { targetId, flatten: true });
  await client.send('Page.enable', {}, sessionId);
  await client.send('Runtime.enable', {}, sessionId);
  await client.send('Emulation.setScriptExecutionDisabled', { value: true }, sessionId);

  const findings = [];
  for (const viewport of [
    { name: 'mobile', width: 390, height: 844, mobile: true },
    { name: 'desktop', width: 1440, height: 900, mobile: false },
  ]) {
    await client.send(
      'Emulation.setDeviceMetricsOverride',
      {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1,
        mobile: viewport.mobile,
      },
      sessionId
    );
    await client.send('Page.navigate', { url: pathToFileURL(htmlPath).href }, sessionId);
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 300));
    const result = await client.send(
      'Runtime.evaluate',
      {
        returnByValue: true,
        expression: `(() => {
          const shell = document.querySelector('#seo-content');
          const bar = document.querySelector('.seo-shell-bar');
          const card = document.querySelector('.seo-shell-card');
          const title = card?.querySelector('h1');
          if (!shell || !bar || !card || !title) return { missing: true };
          const rect = card.getBoundingClientRect();
          return {
            missing: false,
            innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            cardLeft: rect.left,
            cardRight: rect.right,
            cardWidth: rect.width,
            cardOverflow: card.scrollWidth > card.clientWidth + 1,
            titleSize: Number.parseFloat(getComputedStyle(title).fontSize),
            barHeight: bar.getBoundingClientRect().height,
            background: getComputedStyle(shell).backgroundColor,
          };
        })()`,
      },
      sessionId
    );
    const layout = result.result.value;
    if (
      layout.missing ||
      layout.documentWidth > viewport.width + 1 ||
      layout.cardLeft < -1 ||
      layout.cardRight > viewport.width + 1 ||
      layout.cardOverflow ||
      layout.titleSize > 20 ||
      layout.barHeight < 48 ||
      layout.background === 'rgba(0, 0, 0, 0)'
    ) {
      findings.push({ viewport: viewport.name, layout });
    }
  }

  if (findings.length) {
    console.error(JSON.stringify(findings, null, 2));
    process.exitCode = 1;
  } else {
    console.log('Pre-hydration shell rendered without overflow in mobile and desktop viewports.');
  }
} finally {
  client?.close();
  if (chrome.exitCode === null) {
    await new Promise((resolveExit) => {
      const timer = setTimeout(resolveExit, 2000);
      chrome.once('exit', () => {
        clearTimeout(timer);
        resolveExit();
      });
      chrome.kill('SIGTERM');
    });
  }
  await rm(profilePath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}

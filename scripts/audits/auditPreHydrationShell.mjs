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
          const brand = document.querySelector('.seo-shell-brand');
          const brandIcon = document.querySelector('.seo-shell-brand-icon');
          const progress = document.querySelector('.seo-shell-progress');
          const title = document.querySelector('#seo-shell-title');
          if (!shell || !bar || !brand || !brandIcon || !progress || !title) return { missing: true };
          const progressRect = progress.getBoundingClientRect();
          const brandRect = brand.getBoundingClientRect();
          const brandIconRect = brandIcon.getBoundingClientRect();
          const brandStyle = getComputedStyle(brand);
          const barStyle = getComputedStyle(bar);
          document.documentElement.setAttribute('data-theme', 'dark');
          const darkBarStyle = getComputedStyle(bar);
          const darkBarBackground = darkBarStyle.backgroundColor;
          const darkBarOverlay = darkBarStyle.backgroundImage;
          document.documentElement.setAttribute('data-theme', 'light');
          return {
            missing: false,
            innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            progressLeft: progressRect.left,
            progressRight: progressRect.right,
            progressHeight: progressRect.height,
            hasBlockingCard: Boolean(document.querySelector('.seo-shell-card, .seo-shell-spinner')),
            titleSize: Number.parseFloat(getComputedStyle(title).fontSize),
            barHeight: bar.getBoundingClientRect().height,
            barBackground: barStyle.backgroundColor,
            darkBarBackground,
            darkBarOverlay,
            brandIconWidth: brandIconRect.width,
            brandIconHeight: brandIconRect.height,
            brandGap: brandRect.left - brandIconRect.right,
            brandFontSize: Number.parseFloat(brandStyle.fontSize),
            brandLineHeight: Number.parseFloat(brandStyle.lineHeight),
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
      layout.progressLeft < -1 ||
      layout.progressRight > viewport.width + 1 ||
      layout.progressHeight > 3 ||
      layout.hasBlockingCard ||
      layout.titleSize > 20 ||
      layout.barHeight !== 56 ||
      layout.barBackground !== 'rgb(7, 94, 184)' ||
      layout.darkBarBackground !== 'rgb(51, 51, 51)' ||
      !layout.darkBarOverlay.includes('rgba(255, 255, 255, 0.09)') ||
      layout.brandIconWidth !== 30 ||
      layout.brandIconHeight !== 30 ||
      layout.brandGap !== 8 ||
      layout.brandFontSize !== 16 ||
      layout.brandLineHeight !== 24 ||
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

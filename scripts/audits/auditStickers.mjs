#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(scriptDir, '../..');
const workspaceRoot = resolve(webRoot, '../..');
const baseUrl = (
  process.argv.find((value) => value.startsWith('--base-url='))?.split('=')[1] ?? 'http://localhost:9000'
).replace(/\/$/, '');
const screenshotPath = process.argv.find((value) => value.startsWith('--screenshot='))?.split('=')[1];
const timeoutMs = 20000;
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const outputPath = resolve(workspaceRoot, 'artifacts/stickers-audit.json');
const source = JSON.parse(await readFile(resolve(workspaceRoot, 'modules/api/data/stickers.json'), 'utf8'));

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

const main = async () => {
  const issues = [];
  const browserErrors = [];
  const profilePath = await mkdtemp(join(tmpdir(), 'pokebreeze-sticker-audit-'));
  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--disable-background-networking',
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1440,1000',
      '--remote-debugging-port=0',
      `--user-data-dir=${profilePath}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );

  let client;
  try {
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
    });
    client = new CdpClient(debuggerUrl);
    await client.connect();
    const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await client.send('Target.attachToTarget', { targetId, flatten: true });
    await client.send('Page.enable', {}, sessionId);
    await client.send('Runtime.enable', {}, sessionId);
    client.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.sessionId !== sessionId || message.method !== 'Runtime.exceptionThrown') return;
      const details = message.params.exceptionDetails;
      const text = details.exception?.description ?? details.text;
      if (details.url?.includes('/@vite/client') && text.includes('WebSocket closed without opened')) return;
      browserErrors.push(text);
    });

    const evaluate = async (expression) => {
      const result = await client.send(
        'Runtime.evaluate',
        { expression, returnByValue: true, awaitPromise: true },
        sessionId
      );
      if (result.exceptionDetails) {
        throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
      }
      return result.result.value;
    };
    const clickElement = async (expression) => {
      const point = await evaluate(`(() => {
        const element = ${expression};
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      })()`);
      if (!point) return false;
      await client.send(
        'Input.dispatchMouseEvent',
        { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 },
        sessionId
      );
      await client.send(
        'Input.dispatchMouseEvent',
        { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 },
        sessionId
      );
      return true;
    };
    const readPage = () =>
      evaluate(`(() => {
        const page = document.querySelector('[data-testid="sticker-page"]');
        if (!page) return null;
        const cards = [...document.querySelectorAll('[data-testid="sticker-card"]')].map((card) => {
          const image = card.querySelector('[data-testid="sticker-image"]');
          return {
            id: card.dataset.stickerId ?? '',
            pokemonId: card.dataset.pokemonId ?? '',
            shop: card.dataset.shop === 'true',
            fallback: image?.dataset.fallback === 'true',
            imageComplete: Boolean(image?.complete && image.naturalWidth > 0),
          };
        });
        return {
          href: location.href,
          total: Number.parseInt(document.querySelector('.sticker-results-heading b')?.textContent ?? '0', 10),
          loading: Boolean(
            document.querySelector('[aria-label="Loading stickers"]') ||
              document.querySelector('[data-testid="sticker-grid"][aria-busy="true"]')
          ),
          cards,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          pokemonSelect: Boolean(document.querySelector('[data-testid="sticker-pokemon-select"]')),
          pokemonOptionCount: Number(
            document.querySelector('[data-testid="sticker-filters"]')?.dataset.pokemonOptionCount ?? 0
          ),
        };
      })()`);
    const waitFor = async (predicate, label) => {
      const deadline = Date.now() + timeoutMs;
      let page;
      while (Date.now() < deadline) {
        page = await readPage();
        if (predicate(page)) return page;
        await delay(100);
      }
      throw new Error(`Timed out waiting for ${label}; last=${JSON.stringify(page)}`);
    };
    const navigate = async (query = '') => {
      await client.send('Page.navigate', { url: `${baseUrl}/stickers${query}` }, sessionId);
      return waitFor((page) => page && !page.loading, `stickers ${query || 'default'}`);
    };
    const addIssue = (code, detail = {}) => issues.push({ code, ...detail });
    const validateRows = (page, expected, label) => {
      if (page.total !== expected.length)
        addIssue('total_mismatch', { label, expected: expected.length, actual: page.total });
      const expectedById = new Map(expected.map((sticker) => [sticker.id, sticker]));
      if (new Set(page.cards.map((card) => card.id)).size !== page.cards.length) {
        addIssue('duplicate_rendered_sticker', { label });
      }
      for (const card of page.cards) {
        const sticker = expectedById.get(card.id);
        if (!sticker) addIssue('unexpected_sticker', { label, card });
        else if (card.shop !== sticker.isShop || card.pokemonId !== String(sticker.pokemonId ?? '')) {
          addIssue('sticker_metadata_mismatch', { label, card, expected: sticker });
        }
      }
    };

    let page = await navigate();
    validateRows(page, source, 'all');
    if (page.cards.length !== Math.min(100, source.length)) {
      addIssue('first_page_size_mismatch', { actual: page.cards.length });
    }
    await waitFor((value) => value?.cards.every((card) => card.imageComplete), 'initial sticker images');
    page = await readPage();
    const fallbackIds = page.cards.filter((card) => card.fallback).map((card) => card.id);
    if (fallbackIds.length)
      addIssue('sticker_image_fallback', { count: fallbackIds.length, ids: fallbackIds.slice(0, 20) });
    if (screenshotPath) {
      const { data } = await client.send('Page.captureScreenshot', { format: 'png' }, sessionId);
      await writeFile(resolve(screenshotPath), Buffer.from(data, 'base64'));
    }

    const target = source
      .filter((sticker) => sticker.isShop && sticker.pokemonId)
      .sort((left, right) => left.pokemonId - right.pokemonId)[0];
    await clickElement(`(() => {
      const select = document.querySelector('[data-testid="sticker-pokemon-select"]');
      return select?.matches('[role="combobox"]') ? select : select?.querySelector('[role="combobox"]');
    })()`);
    const optionDeadline = Date.now() + timeoutMs;
    let pokemonOptionReady = false;
    while (Date.now() < optionDeadline && !pokemonOptionReady) {
      pokemonOptionReady = await evaluate(
        `Boolean(document.querySelector('[role="option"][data-value="${target.pokemonId}"]'))`
      );
      if (!pokemonOptionReady) await delay(100);
    }
    if (!pokemonOptionReady) {
      addIssue('pokemon_filter_option_not_interactive', { pokemonId: target.pokemonId });
    } else {
      await evaluate(
        `document.querySelector('[role="option"][data-value="${target.pokemonId}"]')?.scrollIntoView({ block: 'nearest' })`
      );
      await delay(100);
      await clickElement(`document.querySelector('[role="option"][data-value="${target.pokemonId}"]')`);
      page = await waitFor(
        (value) => value?.href.includes(`pokemon=${target.pokemonId}`) && !value.loading,
        'Pokémon select interaction'
      );
      validateRows(
        page,
        source.filter((sticker) => sticker.pokemonId === target.pokemonId),
        'Pokémon select'
      );
    }

    page = await navigate(`?q=${encodeURIComponent(target.id)}`);
    validateRows(
      page,
      source.filter((sticker) => sticker.id === target.id),
      'id query'
    );

    page = await navigate();
    await evaluate(`document.querySelector('.sticker-shop-filter button[value="1"]').click()`);
    page = await waitFor((value) => value?.href.includes('shop=1') && !value.loading, 'available toggle');
    validateRows(
      page,
      source.filter((sticker) => sticker.isShop),
      'available'
    );
    if (page.cards.some((card) => !card.shop)) addIssue('available_filter_leak');

    await evaluate(`document.querySelector('.sticker-shop-filter button[value="2"]').click()`);
    page = await waitFor((value) => value?.href.includes('shop=2') && !value.loading, 'unavailable toggle');
    validateRows(
      page,
      source.filter((sticker) => !sticker.isShop),
      'unavailable'
    );
    if (page.cards.some((card) => card.shop)) addIssue('unavailable_filter_leak');

    page = await navigate(`?pokemon=${target.pokemonId}`);
    validateRows(
      page,
      source.filter((sticker) => sticker.pokemonId === target.pokemonId),
      'Pokémon'
    );
    if (page.cards.some((card) => card.pokemonId !== String(target.pokemonId))) addIssue('pokemon_filter_leak');

    page = await navigate('?pokemon=-1');
    validateRows(
      page,
      source.filter((sticker) => !sticker.pokemonId),
      'no Pokémon'
    );
    if (page.cards.some((card) => card.pokemonId)) addIssue('no_pokemon_filter_leak');

    page = await navigate();
    let previousCount = 0;
    while (page.cards.length < source.length && page.cards.length > previousCount) {
      previousCount = page.cards.length;
      await evaluate(`document.querySelector('[data-testid="sticker-load-more"]')?.scrollIntoView()`);
      page = await waitFor(
        (value) => value?.cards.length > previousCount || value?.cards.length === source.length,
        'next page'
      );
    }
    if (page.cards.length !== source.length) addIssue('infinite_scroll_incomplete', { actual: page.cards.length });
    page = await waitFor(
      (value) => value?.cards.length === source.length && value.cards.every((card) => card.imageComplete),
      'all sticker images'
    );
    const allFallbackIds = page.cards.filter((card) => card.fallback).map((card) => card.id);
    if (allFallbackIds.length)
      addIssue('sticker_image_fallback', { count: allFallbackIds.length, ids: allFallbackIds.slice(0, 20) });
    validateRows(page, source, 'all pages');
    const expectedOptionCount =
      new Set(source.filter((sticker) => sticker.pokemonId).map((sticker) => sticker.pokemonId)).size + 2;
    if (page.pokemonOptionCount !== expectedOptionCount)
      addIssue('pokemon_options_lost_after_pagination', {
        expectedOptionCount,
        optionCount: page.pokemonOptionCount,
      });

    await client.send(
      'Emulation.setDeviceMetricsOverride',
      { width: 390, height: 844, deviceScaleFactor: 1, mobile: true },
      sessionId
    );
    page = await navigate(`?q=${encodeURIComponent(target.id)}`);
    if (page.overflow) addIssue('mobile_horizontal_overflow');
    validateRows(
      page,
      source.filter((sticker) => sticker.id === target.id),
      'mobile query'
    );

    if (browserErrors.length) addIssue('browser_errors', { browserErrors });
  } finally {
    client?.close();
    if (!chrome.killed) {
      chrome.kill('SIGTERM');
      await Promise.race([new Promise((resolveExit) => chrome.once('exit', resolveExit)), delay(2000)]);
    }
    try {
      await rm(profilePath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } catch {
      // Chrome may briefly retain files on macOS; the OS cleans this temporary directory.
    }
  }

  const summary = {
    stickers: source.length,
    pokemonFilters: new Set(source.filter((sticker) => sticker.pokemonId).map((sticker) => sticker.pokemonId)).size,
    issues: issues.length,
  };
  if (issues.length) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, JSON.stringify({ summary, issues }, null, 2));
    console.error(`Sticker audit failed: ${issues.length} issues. Report: ${outputPath}`);
    process.exitCode = 1;
  } else {
    await rm(outputPath, { force: true });
    console.log(`Sticker audit passed: ${summary.stickers} stickers, ${summary.pokemonFilters} Pokémon filters.`);
  }
};

await main();

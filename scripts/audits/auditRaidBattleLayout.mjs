import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const baseUrl = process.env.WEB_BASE_URL ?? 'http://localhost:9000';
const chromePath = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const headed = process.argv.includes('--headed');
const profile = await mkdtemp(join(tmpdir(), 'pokego-raid-chrome-'));
const chrome = spawn(
  chromePath,
  [
    ...(headed ? [] : ['--headless=new']),
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=0',
    '--user-data-dir=' + profile,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] }
);
let socket;
try {
  const debuggerUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Chrome did not start')), 10000);
    chrome.stderr.on('data', (chunk) => {
      const match = chunk.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
    chrome.on('error', reject);
  });
  socket = new WebSocket(debuggerUrl);
  await once(socket, 'open');
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!Number.isSafeInteger(message?.id)) return;
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    request.resolve(message);
  });
  const send = async (method, params, sessionId) => {
    const requestId = ++id;
    const message = await new Promise((resolve) => {
      pending.set(requestId, { resolve });
      socket.send(JSON.stringify({ id: requestId, method, params, sessionId }));
    });
    assert.equal(message.error, undefined, JSON.stringify(message));
    return message.result;
  };
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const sendToPage = (method, params) => send(method, params, sessionId);
  const evaluate = async (expression) => {
    const result = await sendToPage('Runtime.evaluate', { expression, returnByValue: true });
    assert.equal(result.exceptionDetails, undefined, JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const waitFor = async (expression) => {
    for (let attempt = 0; attempt < 100; attempt++) {
      const result = await evaluate(expression);
      if (result) return result;
      await delay(250);
    }
    throw new Error('Timed out: ' + expression + '\n' + (await evaluate('document.body.innerText.slice(-2800)')));
  };
  const click = async (expression) => {
    const scroll = `(() => {
      const element = ${expression};
      if (!element || element.disabled) return false;
      element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
      return true;
    })()`;
    await waitFor(scroll);
    const point = await waitFor(`(() => {
      const element = ${expression};
      const {x, y, width, height} = element.getBoundingClientRect();
      const point = {x: x + width / 2, y: y + height / 2};
      return element.contains(document.elementFromPoint(point.x, point.y)) && point;
    })()`);
    await sendToPage('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
    await sendToPage('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
  };
  const button = (label) =>
    `[...document.querySelectorAll('button')].find(button => button.textContent.trim() === '${label}')`;
  for (const { width, theme } of [1280, 375, 320].flatMap((width) =>
    ['light', 'dark'].map((theme) => ({ width, theme }))
  )) {
    await sendToPage('Emulation.setDeviceMetricsOverride', {
      width,
      height: 800,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    await sendToPage('Page.navigate', { url: new URL('/raid-battle', baseUrl).href });
    await waitFor(`!!document.querySelector('.theme-toggle')`);
    if ((await evaluate('document.documentElement.dataset.theme')) !== theme) {
      await click(`document.querySelector('button[aria-label="Switch to ${theme} theme"]')`);
      await waitFor(`document.documentElement.dataset.theme === '${theme}'`);
    }
    await click("document.querySelector('.trainer-battle button:has([data-testid=EditIcon])')");
    await click("document.querySelector('[role=dialog] input[type=text]')");
    await sendToPage('Input.insertText', { text: 'mewtwo' });
    await click(
      "[...document.querySelectorAll('[role=dialog] [role=menuitem]')].find(card => /mega y/i.test(card.textContent))"
    );
    await waitFor(`(() => {
      const dialog = document.querySelector('[role=dialog]');
      if (!dialog || !/mega y/i.test(dialog.querySelector('input[type=text]')?.value ?? '')) return false;
      const moves = [...dialog.querySelectorAll('input.MuiSelect-nativeInput')];
      return moves.length === 2 && moves.every(move => move.value);
    })()`);
    await click(button('Save'));
    await click(button('Calculate Raid Estimate'));
    await waitFor("!!document.querySelector('[data-testid=raid-boss-hp] .MuiLinearProgress-root')");
    const rows = await evaluate(`(() => [...document.querySelectorAll('.table-round-battle')].flatMap(table => {
      const track = [...table.querySelectorAll('[data-testid=raid-boss-hp] .MuiLinearProgress-root')].find(item => item.getBoundingClientRect().width > 0);
      if (!track) return [];
      const row = track.closest('tr');
      const summary = row.nextElementSibling;
      const badge = [...row.querySelectorAll('span')].find(item => item.textContent.trim().startsWith('HP:'));
      const caption = row.querySelector('.text-dps');
      const lastSummaryCell = summary.lastElementChild;
      lastSummaryCell.scrollIntoView({ block: 'nearest', inline: 'end', behavior: 'instant' });
      const bounds = row.getBoundingClientRect();
      const scroller = table.parentElement.getBoundingClientRect();
      const lastCellBounds = lastSummaryCell.getBoundingClientRect();
      return [{
        width: table.getBoundingClientRect().width,
        rowHeight: bounds.height,
        overlap: track.getBoundingClientRect().bottom - summary.getBoundingClientRect().top,
        badgeOverlap: badge.getBoundingClientRect().bottom - summary.getBoundingClientRect().top,
        captionOffset: caption.getBoundingClientRect().top - bounds.top,
        hp: badge.textContent.trim(),
        summary: summary.textContent.trim(),
        lastCellVisible: lastCellBounds.left >= scroller.left - 1 && lastCellBounds.right <= scroller.right + 1,
      }];
    }))()`);
    console.log(theme, width + 'px:', JSON.stringify(rows));
    assert.ok(rows.length);
    for (const row of rows) {
      assert.match(row.hp, /^HP: \d+ \/ \d+$/);
      assert.match(row.summary, /Total DPS:.*Total TDO:.*Boss HP Remain:/);
      assert.ok(row.lastCellVisible, 'The rightmost summary cell must remain reachable on narrow screens');
      assert.ok(
        row.overlap <= 0 && row.badgeOverlap <= 0 && row.captionOffset >= 0,
        'Raid summary and DPS must fit their own rows'
      );
    }
  }
} finally {
  socket?.close();
  if (chrome.exitCode === null && chrome.signalCode === null && chrome.pid) {
    const exit = once(chrome, 'exit');
    chrome.kill();
    await exit;
  }
  await rm(profile, { recursive: true, force: true });
}

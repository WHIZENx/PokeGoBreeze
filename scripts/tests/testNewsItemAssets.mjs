#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getItemSpriteAssetName } from '../../src/utils/item-sprite.ts';

const expectedNewsItemAssets = new Map([
  ['ITEM_LUCKY_EGG', 'luckyegg'],
  ['ITEM_XL_RARE_CANDY', 'RareXLCandy_PSD'],
  ['ITEM_FREE_RAID_TICKET', 'Item_1401'],
  ['ITEM_MASTER_BALL', 'masterball_sprite'],
  ['ITEM_INCENSE_ORDINARY', 'Incense_0'],
  ['ITEM_STAR_PIECE', 'starpiece'],
  ['ITEM_INCUBATOR_BASIC', 'EggIncubatorIAP_Empty'],
  ['ITEM_LEADER_MAP', 'Item_Leader_MapCompass'],
  ['ITEM_MOVE_REROLL_OTHER_SPECIAL_ATTACK_A', 'Item_Meteorite'],
  ['ITEM_MP', 'mp_pack'],
  ['ITEM_PAID_RAID_TICKET', 'Item_1402'],
  ['ITEM_INCUBATOR_SUPER', 'EggIncubatorSuper_Empty'],
]);

for (const [itemId, expectedAsset] of expectedNewsItemAssets) {
  assert.equal(getItemSpriteAssetName(itemId), expectedAsset, `${itemId} should resolve to ${expectedAsset}`);
}

assert.equal(
  getItemSpriteAssetName('ITEM_MAX_BOOST'),
  undefined,
  'Max Boost must keep the standard fallback until PokeMiners publishes a verified item asset'
);
assert.equal(getItemSpriteAssetName('ITEM_UNKNOWN'), undefined);

const newsSource = await readFile(new URL('../../src/pages/News/News.tsx', import.meta.url), 'utf8');
assert.match(newsSource, /const NEWS_BATCH_SIZE = 12/);
assert.match(newsSource, /const visibleData = data\.slice\(0, visibleNewsCount\)/);
assert.match(newsSource, /new IntersectionObserver/);
assert.match(newsSource, /data-testid="news-load-more-sentinel"/);
assert.match(newsSource, /\{visibleData\.map\(\(value\) => \(/);
assert.doesNotMatch(newsSource, /\{data\.map\(\(value\) => \(/);
assert.match(
  newsSource,
  /TicketRewardType\.Exp[\s\S]*?APIService\.getItemSprite\('experience'\)/,
  'Experience rewards must use the local PokeMiners XP asset instead of the generic fallback'
);
assert.match(
  newsSource,
  /TicketRewardType\.Exp[\s\S]*?tw-border-blue-900 tw-bg-blue-700/,
  'The transparent white XP glyph must have an opaque, theme-safe badge background and border'
);
for (const imageClass of ['info-background', 'info-banner-img']) {
  assert.match(
    newsSource,
    new RegExp(`className="${imageClass}"[\\s\\S]*?loading="lazy"[\\s\\S]*?decoding="async"`),
    `${imageClass} images must not be loaded and decoded for every ticket before they approach the viewport`
  );
}
assert.match(
  newsSource,
  /alt="Image League"[\s\S]*?loading="lazy"[\s\S]*?decoding="async"/,
  'Ticket title images must use deferred image loading'
);
assert.match(
  newsSource,
  /className="pokemon-sprite-medium tw-w-16"[\s\S]*?loading="lazy"[\s\S]*?decoding="async"/,
  'Expanded ticket reward images must decode asynchronously'
);

console.log(`News item asset regression passed: ${expectedNewsItemAssets.size} verified reward mappings.`);

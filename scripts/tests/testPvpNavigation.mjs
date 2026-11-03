import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [buttonGroup, home, linkToTop, app] = await Promise.all([
  readFile(new URL('../../src/components/Commons/Buttons/ButtonGroupLeague.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Home.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Link/LinkToTop.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/App.tsx', import.meta.url), 'utf8'),
]);

assert.match(buttonGroup, /useNavigateToTop\(\)/);
assert.match(buttonGroup, /navigateToTop\(/);
assert.doesNotMatch(buttonGroup, /useNavigate\(/);
assert.match(buttonGroup, /data-testid="pvp-league-card"/);
for (const path of ['rankings', 'teams', 'battle']) {
  assert.match(home, new RegExp(`path="${path}"`), `PvP ${path} cards must share the scroll-reset navigation`);
}
assert.match(linkToTop, /pendingNavigationScroll = \{[\s\S]*top:/);
assert.match(linkToTop, /behavior:\s*behavior\s*\|\|\s*'instant'/);
assert.match(
  linkToTop,
  /export const flushPendingNavigationScroll = \(\) => \{[\s\S]*window\.scrollTo\(scroll\)/,
  'Scroll reset must be deferred until the destination route has committed.'
);
assert.match(
  app,
  /function RouteReady[\s\S]*useEffect\(\(\) => \{[\s\S]*flushPendingNavigationScroll\(\);[\s\S]*completeProgress/,
  'The committed destination route must flush the pending scroll reset.'
);

console.log('Validated scroll-reset navigation for PvP rankings, teams, and battle cards.');

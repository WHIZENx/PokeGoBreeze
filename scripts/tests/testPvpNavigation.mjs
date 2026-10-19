import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [buttonGroup, home, linkToTop] = await Promise.all([
  readFile(new URL('../../src/components/Commons/Buttons/ButtonGroupLeague.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Home.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Link/LinkToTop.tsx', import.meta.url), 'utf8'),
]);

assert.match(buttonGroup, /useNavigateToTop\(\)/);
assert.match(buttonGroup, /navigateToTop\(/);
assert.doesNotMatch(buttonGroup, /useNavigate\(/);
assert.match(buttonGroup, /data-testid="pvp-league-card"/);
for (const path of ['rankings', 'teams', 'battle']) {
  assert.match(home, new RegExp(`path="${path}"`), `PvP ${path} cards must share the scroll-reset navigation`);
}
assert.match(linkToTop, /window\.scrollTo\(\{[\s\S]*top:/);
assert.match(linkToTop, /behavior:\s*options\?\.behavior\s*\|\|\s*'instant'/);

console.log('Validated scroll-reset navigation for PvP rankings, teams, and battle cards.');

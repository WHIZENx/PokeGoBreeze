import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [buttonGroup, home, linkToTop, app, leagueStyles, ranking, teams, tableLoadingProgress] = await Promise.all([
  readFile(new URL('../../src/components/Commons/Buttons/ButtonGroupLeague.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Home.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Link/LinkToTop.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/App.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Leagues/Leagues.scss', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Ranking/PVP.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Teams/PVP.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Commons/Tables/TableLoadingProgress.tsx', import.meta.url), 'utf8'),
]);

assert.match(buttonGroup, /useNavigateToTop\(\)/);
assert.match(buttonGroup, /navigateToTop\(/);
assert.doesNotMatch(buttonGroup, /useNavigate\(/);
assert.match(buttonGroup, /data-testid="pvp-league-card"/);
assert.match(buttonGroup, /CP \$\{cp\.toLocaleString\(\)\} or lower/);
assert.match(buttonGroup, /No CP limit/);
assert.doesNotMatch(buttonGroup, /CP below/);
assert.match(home, /data-testid="pvp-home-primary-sections"/);
assert.match(home, /xl:tw-grid-cols-2/);
assert.match(home, /value: defaultSelection, label: 'Default'/);
assert.match(home, /value: allSelection, label: 'All'/);
assert.match(home, /selection === allSelection[\s\S]*?return groups/);
assert.match(home, /groups=\{rankLeagueGroups\}/);
assert.match(home, /groups=\{teamLeagueGroups\}/);
assert.match(home, /id: 'pvp-rank-filter'/);
assert.match(home, /id: 'pvp-team-filter'/);
assert.match(buttonGroup, /leagueGroups\.flatMap/);
assert.match(buttonGroup, /<img[\s\S]*?className="tw-mx-auto"[\s\S]*?alt="Image League"/);
assert.match(
  leagueStyles,
  /\.season-league \{[\s\S]*tw-isolate[\s\S]*tw-overflow-x-auto[\s\S]*tw-overflow-y-hidden/,
  'Battle League sticky reward columns must remain inside their horizontal scroll stacking context.'
);
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
assert.match(tableLoadingProgress, /import \{ LinearProgress \} from '@mui\/material'/);
assert.match(
  tableLoadingProgress,
  /className="!tw-absolute tw-inset-x-0 tw-bottom-0"/,
  'The MUI loading indicator must remain attached to the bottom of its sticky table header.'
);
assert.match(ranking, /aria-busy=\{isLoading\}[\s\S]*TableLoadingProgress loading=\{isLoading\}/);
assert.equal(
  teams.match(/<TableLoadingProgress loading=\{isLoading\}/g)?.length,
  2,
  'Both PVP team table sections must display their shared request progress.'
);
assert.equal(
  teams.match(/aria-busy=\{isLoading\}/g)?.length,
  2,
  'Both PVP team table sections must expose their loading state to assistive technology.'
);

console.log('Validated PvP navigation and table loading progress for rankings, teams, and battle cards.');

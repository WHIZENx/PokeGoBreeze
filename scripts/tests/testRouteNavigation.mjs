#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../../src/App.tsx', import.meta.url), 'utf8');
const routesSource = await readFile(new URL('../../src/app-routes.tsx', import.meta.url), 'utf8');
const detailRoutesSource = await readFile(
  new URL('../../src/services/detail-route.service.ts', import.meta.url),
  'utf8'
);
const indexSource = await readFile(new URL('../../src/index.tsx', import.meta.url), 'utf8');
const linkToTopSource = await readFile(new URL('../../src/components/Link/LinkToTop.tsx', import.meta.url), 'utf8');
const pokemonPageSource = await readFile(new URL('../../src/pages/Pokemon/Pokemon.tsx', import.meta.url), 'utf8');
const movePageSource = await readFile(new URL('../../src/pages/Move/Move.tsx', import.meta.url), 'utf8');
const useDataStoreSource = await readFile(new URL('../../src/composables/useDataStore.ts', import.meta.url), 'utf8');
const processedDataRoutes = await readFile(
  new URL('../../src/utils/configs/processed-data-routes.config.ts', import.meta.url),
  'utf8'
);
const drawerSubmenuSource = await readFile(
  new URL('../../src/components/Commons/Collapses/CollapseMui.tsx', import.meta.url),
  'utf8'
);
const counterSource = await readFile(
  new URL('../../src/components/Commons/Tables/Counter/Counter.tsx', import.meta.url),
  'utf8'
);
const noDataRouteBranch = appSource.match(
  /if \(routeDataSections\.length === 0\) \{(?<body>[\s\S]*?)\n\s*return;\n\s*\}/
)?.groups?.body;
const routeDataLoadEffect = appSource.match(
  /useEffect\(\(\) => \{(?<body>[\s\S]*?loadProcessedSections\(routeDataSections\)[\s\S]*?)\n\s*\}, \[(?<dependencies>[^\]]+)\]\);/
);
const failures = [];
const dataRoutes = [...processedDataRoutes.matchAll(/if \(([^{]*)\) \{\s*return \[([^\]]*)\];/g)];
for (const route of ['/stats-table', '/damage-calculate', '/calculate-catch-chance']) {
  if (
    !dataRoutes.some(
      ([, condition, sections]) => condition.includes(`pathname === '${route}'`) && sections.includes("'cpm'")
    )
  ) {
    failures.push(`${route} must load CP multipliers before its first render`);
  }
}
if (
  drawerSubmenuSource.includes('tw-truncate') ||
  !drawerSubmenuSource.includes('<ListItemText primary={subMenu.label} className="tw-whitespace-normal tw-break-words"')
) {
  failures.push('mobile drawer submenu labels must wrap inside their buttons');
}
if (!noDataRouteBranch) {
  failures.push('no-data route branch is missing');
}
if (!routeDataLoadEffect) {
  failures.push('route data loading effect is missing');
} else if (routeDataLoadEffect.groups.dependencies.includes('location')) {
  failures.push('route data reloads when only the location changes within the same data-backed route group');
}
if (
  !/Promise\.all\(\[\s*page,\s*prepareRouteDetails\([\s\S]*?if \(!signal\.aborted\) \{\s*setDisplayRoute/.test(
    appSource
  )
) {
  failures.push('the visible route must wait for its module and navigation details and ignore abandoned navigation');
}
if (!appSource.includes('<Routes location={displayRoute.location}>') || appSource.includes('fallback={null}')) {
  failures.push('cold route modules must not replace the visible page with an empty fallback');
}
if (!appSource.includes('startProgress();') || appSource.includes('<Skeleton')) {
  failures.push('initial navigation must use the shared progress bar');
}
assert.match(
  appSource,
  /useEffect\(\(\) => \{\s*if \(isBootstrapLoaded && previousPath !== undefined && pathname !== previousPath\) \{\s*startProgress\(\);\s*\}\s*\}, \[isBootstrapLoaded, pathname, previousPath\]\);/,
  'The header progress bar must start only when the destination pathname differs from the visible pathname.'
);
for (const [path, endpoint] of [
  ['/pokemon/:id', 'getPokemonBundle'],
  ['/move/:id', 'moveDetailsUrl'],
  ['/pvp/:cp/:serie/:pokemon', 'getPvpPokemon'],
]) {
  const match = detailRoutesSource.indexOf(`matchPath('${path}'`);
  if (match < 0 || !detailRoutesSource.slice(match).split('matchPath(').at(1)?.includes(endpoint)) {
    failures.push(`${path} is missing destination data preparation`);
  }
}
if (!useDataStoreSource.includes('appliedProcessedSectionsRef')) {
  failures.push('processed data sections are not tracked after hydration');
}
if (
  !useDataStoreSource.includes('appliedProcessedSectionsRef.current.has(section)') ||
  !useDataStoreSource.includes('Object.is(appliedProcessedSectionsRef.current.get(section), data)')
) {
  failures.push('cached processed data sections are dispatched to Redux repeatedly');
}
assert.match(routesSource, /<Pokemon routeKey=\{location\.pathname\} preparedDetail=\{details\.pokemon\}/);
assert.match(pokemonPageSource, /<PokemonDetails key=\{routeKey\} tableLayoutRef=\{tableLayoutRef\}/);
assert.match(
  pokemonPageSource,
  /useState<OptionsPokemon>\(\(\) =>\s*getPokemonNavigation\(getPokemonIdByParam\(\)\)/,
  'The remounted Pokémon detail page must render its navigation controls before effects run.'
);
assert.match(routesSource, /<Move key=\{location\.pathname\} preparedDetail=\{details\.move\}/);
for (const battleElement of ['<Battle key={location.pathname} />', '<Battle key={location.pathname} replayMode />']) {
  if (!routesSource.includes(battleElement)) {
    failures.push(`PVP Battle route is missing its state-isolation key: ${battleElement}`);
  }
}
if (!indexSource.includes('<BrowserRouter useTransitions={false}>')) {
  failures.push('browser navigation can be deferred indefinitely by React Router transitions');
}
if (appSource.includes('startTransition') || appSource.includes('useTransition')) {
  failures.push('route rendering can be deferred indefinitely by a transition');
}
if (/const navigateAndReset[\s\S]*?event\.preventDefault\(\)/.test(linkToTopSource)) {
  failures.push('LinkToTop replaces the router Link click with programmatic navigation');
}
if (!linkToTopSource.includes('onClick={navigateAndReset}')) {
  failures.push('LinkToTop does not preserve the router Link click handler');
}
for (const [name, source] of [
  ['Pokémon Detail', pokemonPageSource],
  ['Counter table', counterSource],
]) {
  if (!source.includes('// @refresh reset')) {
    failures.push(`${name} preserves unsafe async state across development hot updates`);
  }
}
for (const [name, source] of [
  ['Pokémon Detail', pokemonPageSource],
  ['Move Detail', movePageSource],
]) {
  if (/setSearchParams\(searchParams\)/.test(source)) {
    failures.push(`${name} mutates and reuses the active URLSearchParams value`);
  }
}

if (failures.length) {
  console.error(`Route navigation regression failed: ${failures.join(', ')}`);
  process.exit(1);
}

console.log('Route navigation regression passed (router links and browser Back commit ready routes synchronously).');

// PvP route controls and pending table states
const [buttonGroup, home, leagueStyles, ranking, teams, tableLoadingProgress] = await Promise.all([
  readFile(new URL('../../src/components/Commons/Buttons/ButtonGroupLeague.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Home.tsx', import.meta.url), 'utf8'),
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
assert.match(linkToTopSource, /pendingNavigationScroll = \{[\s\S]*top:/);
assert.match(linkToTopSource, /behavior:\s*behavior\s*\|\|\s*'instant'/);
assert.match(
  linkToTopSource,
  /export const flushPendingNavigationScroll = \(\) => \{[\s\S]*window\.scrollTo\(scroll\)/,
  'Scroll reset must be deferred until the destination route has committed.'
);
assert.match(
  appSource,
  /function RouteReady[\s\S]*useLayoutEffect\(\(\) => \{[\s\S]*flushPendingNavigationScroll\(\);\s*finishStartupProgress\(\);\s*createProgressHelpers\(dispatch\)\.hideProgress\(\);/,
  'The committed destination route must flush the pending scroll reset and hide header progress immediately.'
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

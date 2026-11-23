#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../../src/App.tsx', import.meta.url), 'utf8');
const indexSource = await readFile(new URL('../../src/index.tsx', import.meta.url), 'utf8');
const linkToTopSource = await readFile(new URL('../../src/components/Link/LinkToTop.tsx', import.meta.url), 'utf8');
const pokemonPageSource = await readFile(new URL('../../src/pages/Pokemon/Pokemon.tsx', import.meta.url), 'utf8');
const movePageSource = await readFile(new URL('../../src/pages/Move/Move.tsx', import.meta.url), 'utf8');
const useDataStoreSource = await readFile(new URL('../../src/composables/useDataStore.ts', import.meta.url), 'utf8');
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
const readyRouteEffect = appSource.match(
  /if \(isBootstrapLoaded && loadedRouteDataKey === routeDataKey\) \{(?<body>[\s\S]*?)\n\s*\}/
)?.groups?.body;

const failures = [];
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
if (!readyRouteEffect?.includes('setDisplayLocation(location);')) {
  failures.push('data-backed routes do not commit the current location directly');
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
if (!appSource.includes("displayLocation.pathname.startsWith('/pokemon/')")) {
  failures.push('Pokémon Detail routes do not isolate local state by species pathname');
}
if (!appSource.includes('<Pokemon key={pokemonRouteKey} />')) {
  failures.push('Pokémon Detail routes reuse async component state across species navigation');
}
if (!appSource.includes("displayLocation.pathname.startsWith('/pvp/battle')")) {
  failures.push('PVP Battle routes do not isolate simulator state by pathname');
}
for (const battleElement of ['<Battle key={battleRouteKey} />', '<Battle key={battleRouteKey} replayMode />']) {
  if (!appSource.includes(battleElement)) {
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

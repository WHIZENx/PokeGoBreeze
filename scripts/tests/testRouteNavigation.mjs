#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../../src/App.tsx', import.meta.url), 'utf8');
const indexSource = await readFile(new URL('../../src/index.tsx', import.meta.url), 'utf8');
const linkToTopSource = await readFile(new URL('../../src/components/Link/LinkToTop.tsx', import.meta.url), 'utf8');
const pokemonPageSource = await readFile(new URL('../../src/pages/Pokemon/Pokemon.tsx', import.meta.url), 'utf8');
const movePageSource = await readFile(new URL('../../src/pages/Move/Move.tsx', import.meta.url), 'utf8');
const noDataRouteBranch = appSource.match(
  /if \(routeDataSections\.length === 0\) \{(?<body>[\s\S]*?)\n\s*return;\n\s*\}/
)?.groups?.body;
const readyRouteEffect = appSource.match(
  /if \(isBootstrapLoaded && loadedRouteDataKey === routeDataKey\) \{(?<body>[\s\S]*?)\n\s*\}/
)?.groups?.body;

const failures = [];
if (!noDataRouteBranch) {
  failures.push('no-data route branch is missing');
} else {
  if (!noDataRouteBranch.includes('setDisplayLocation(location);')) {
    failures.push('no-data routes do not commit the current location directly');
  }
}
if (!readyRouteEffect?.includes('setDisplayLocation(location);')) {
  failures.push('data-backed routes do not commit the current location directly');
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

#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../../src/App.tsx', import.meta.url), 'utf8');
const indexSource = await readFile(new URL('../../src/index.tsx', import.meta.url), 'utf8');
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

if (failures.length) {
  console.error(`Route navigation regression failed: ${failures.join(', ')}`);
  process.exit(1);
}

console.log('Route navigation regression passed (browser Back commits every ready route synchronously).');

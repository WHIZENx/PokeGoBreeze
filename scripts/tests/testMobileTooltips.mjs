import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = new URL('../../', import.meta.url).pathname;
const sourceRoot = join(root, 'src');
const tooltipComponentPath = join(sourceRoot, 'components/Commons/Tooltips/Tooltips.tsx');
const tooltipComponent = readFileSync(tooltipComponentPath, 'utf8');
const battlePage = readFileSync(join(sourceRoot, 'pages/PVP/Battle/Battle.tsx'), 'utf8');
const evolution = readFileSync(join(sourceRoot, 'components/Info/Evolution/Evolution.tsx'), 'utf8');

assert.match(
  tooltipComponent,
  /const openOnClick = props\.openOnClick \?\? true;/,
  'Shared tooltips must support tap-to-open by default on touch devices.'
);
assert.match(
  tooltipComponent,
  /<ClickAwayListener onClickAway=\{close\}>/,
  'Tapped tooltips must close when the user taps outside.'
);
assert.match(tooltipComponent, /setIsPinnedOpen\(\(value\) => !value\)/, 'Repeated taps must toggle a pinned tooltip.');
assert.match(tooltipComponent, /event\.key === 'Escape'/, 'Pinned tooltips must remain dismissible from the keyboard.');
assert.match(
  tooltipComponent,
  /disableTouchListener/,
  'The native long-press listener must be disabled when tap-to-open is active.'
);

for (const label of [
  'CP limit',
  'Team size',
  'Level limit',
  'Duplicate species not allowed',
  'Mega Evolution',
  'Eligible catch time',
  'Allowed types',
  'Allowed Pokémon',
  'Banned Pokémon',
]) {
  assert.match(
    battlePage,
    new RegExp(`<Tooltips title=["']${label}["']>`),
    `Battle rule hint "${label}" must use the mobile-safe shared tooltip.`
  );
}
assert.match(
  evolution,
  /<Tooltips title="Vivillon pattern depends on the Scatterbug encounter">/,
  'The Vivillon evolution hint must open on tap instead of relying on the native title attribute.'
);

const sourceFiles = [];
const collectSourceFiles = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(path);
    } else if (['.ts', '.tsx', '.js', '.jsx'].includes(extname(entry.name))) {
      sourceFiles.push(path);
    }
  }
};
collectSourceFiles(sourceRoot);

const directMuiTooltipImports = sourceFiles
  .filter((path) => path !== tooltipComponentPath)
  .filter((path) =>
    /import\s*\{[^}]*\bTooltip\b[^}]*\}\s*from\s*['"]@mui\/material['"]/.test(readFileSync(path, 'utf8'))
  )
  .map((path) => relative(root, path));

assert.deepEqual(
  directMuiTooltipImports,
  [],
  `All project tooltips must use the shared mobile-safe Tooltips component: ${directMuiTooltipImports.join(', ')}`
);

const tooltipUsageCount = sourceFiles.reduce(
  (count, path) => count + (readFileSync(path, 'utf8').match(/<Tooltips\b/g)?.length ?? 0),
  0
);
assert.ok(tooltipUsageCount > 0, 'Expected the Web project to contain shared tooltip usages.');

console.log(`Mobile tooltip regression passed across ${tooltipUsageCount} shared tooltip usages.`);

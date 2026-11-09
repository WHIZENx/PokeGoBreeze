#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const sourceRoot = join(root, 'src');
const componentPath = join(sourceRoot, 'components/Commons/Tables/CustomDataTable/CustomDataTable.tsx');
const component = await readFile(componentPath, 'utf8');
const pagination = await readFile(
  join(sourceRoot, 'components/Commons/Tables/CustomDataTable/CustomDataTablePagination.tsx'),
  'utf8'
);
const styles = await readFile(join(sourceRoot, 'assets/styles/custom.scss'), 'utf8');
const counterStyles = await readFile(join(sourceRoot, 'components/Commons/Tables/Counter/Counter.scss'), 'utf8');
const counter = await readFile(join(sourceRoot, 'components/Commons/Tables/Counter/Counter.tsx'), 'utf8');
const moveTableStyles = await readFile(join(sourceRoot, 'components/Commons/Tables/Move/MoveTable.scss'), 'utf8');
const pokemonStyles = await readFile(join(sourceRoot, 'pages/Pokemon/Pokemon.scss'), 'utf8');
const sharedSortIcon = await readFile(join(sourceRoot, 'components/Commons/Tables/DataTableSortIcon.tsx'), 'utf8');
const statsRanking = await readFile(join(sourceRoot, 'pages/Sheets/StatsRanking/StatsRanking.tsx'), 'utf8');
const customSortableTables = await Promise.all(
  ['components/Commons/Tables/Move/MoveTable.tsx', 'pages/PVP/Ranking/PVP.tsx', 'pages/PVP/Teams/PVP.tsx'].map((path) =>
    readFile(join(sourceRoot, path), 'utf8')
  )
);

assert.match(component, /className="rdt-v7-compat"/, 'Every data table must use the v8 width compatibility wrapper.');
assert.match(
  component,
  /headerSeparator=\{props\.headerSeparator \?\? false\}/,
  'The v8 header separator must preserve the v7 default unless a table explicitly enables it.'
);
assert.match(
  component,
  /progressSkeleton=\{props\.progressSkeleton \?\? false\}/,
  'The v8 skeleton must not replace the project loading component unless explicitly enabled.'
);
assert.match(
  component,
  /paginationComponent=\{props\.paginationComponent \?\? CustomDataTablePagination\}/,
  'All default data-table pagination controls must use the shared MUI design-system component.'
);
assert.match(
  component,
  /if \(sortColumns\.length === 0 && lastSortedColumnRef\.current\)[\s\S]*setSortReset[\s\S]*props\.onSort\?\.\(sortedColumn, direction/,
  'Shared data tables must restore the active column when v8 attempts to clear sorting.'
);
assert.match(
  component,
  /defaultSortFieldId=\{sortReset\?\.columnId \?\? props\.defaultSortFieldId\}[\s\S]*defaultSortAsc=\{sortReset \? sortReset\.direction === 'asc' : props\.defaultSortAsc\}/,
  'Shared data tables must cycle directly between ascending and descending sorting.'
);
assert.match(pagination, /<TablePagination/, 'Pagination must use MUI instead of the package native select.');
assert.match(
  pagination,
  /className="rdt-mui-pagination tw-border-0 /,
  'The shared data-table footer must not render its own border.'
);
assert.match(
  pagination,
  /paginationComponentOptions\?\.noRowsPerPage\s*\? \[\]/,
  'MUI pagination must preserve tables that intentionally hide the rows-per-page control.'
);
assert.match(
  styles,
  /\.rdt-v7-compat\s*\{[\s\S]*?\.rdt_responsiveWrapper\s*\{[\s\S]*?tw-min-w-0[\s\S]*?tw-max-w-full/,
  'The compatibility wrapper must prevent intrinsic table width from overlapping adjacent columns.'
);
assert.match(
  styles,
  /\.rdt-v7-compat\s*\{[\s\S]*?contain:\s*inline-size;/,
  'Table content must not enlarge its parent grid or table column.'
);
assert.match(
  styles,
  /> div\s*\{[\s\S]*?--rdt-color-bg:\s*var\(--table-primary\) !important;[\s\S]*?--rdt-color-text-primary:\s*var\(--text-primary\) !important;/,
  'The v8 root must propagate application theme tokens to the table title, body, and pagination siblings.'
);
assert.match(
  styles,
  /\.rdt_wrapper,\s*\.rdt_Table\s*\{[\s\S]*?tw-min-w-fit[\s\S]*?tw-max-w-none/,
  'Inner v8 table wrappers must expand to the full column width so horizontal scrolling never exposes an unpainted surface.'
);
assert.match(
  styles,
  /\.rdt_header\s*\{[\s\S]*?color:\s*var\(--text-primary\);[\s\S]*?background-color:\s*var\(--custom-default\);/,
  'The nested v8 title header must retain the production v7 theme surface.'
);
assert.match(
  component,
  /display: 'block',[\s\S]*?minWidth: 0,[\s\S]*?maxWidth: '100%'/,
  'Table wrappers must not participate in intrinsic table sizing.'
);
assert.match(
  counterStyles,
  /\.rdt_TableCol,\s*\.rdt_TableCell\s*\{[\s\S]*?tw-justify-center[\s\S]*?tw-text-center/,
  'Counter headers and cells must retain their centered v7 alignment under the v8 class architecture.'
);
assert.match(
  counter,
  /<span className="tw-whitespace-nowrap tw-font-bold">\s*\{toFloatWithPadding\(row\.ratio/,
  'The primary percentage value in Best Pokémon Counter must use the design-system bold weight.'
);
assert.match(
  counter,
  /data-testid="counter-performance"[\s\S]*tw-whitespace-nowrap tw-font-bold[\s\S]*tw-flex-col[\s\S]*sm:tw-flex-row sm:tw-gap-1/,
  'Counter DPS values must stack their unit on mobile and return to one row at the small breakpoint.'
);
assert.match(
  counter,
  /const isTargetUnreleased = props\.pokemonData\?\.releasedGO === false/,
  'The counter empty state must depend on the selected target release state.'
);
assert.match(
  counter,
  /data-testid="counter-unreleased-empty-state"[\s\S]*SearchOffRoundedIcon[\s\S]*Counter data unavailable[\s\S]*not been released in Pokémon GO yet/,
  'Unreleased forms must explain why counter data cannot be calculated.'
);
assert.match(
  counter,
  /tw-border-\[var\(--divider\)\][\s\S]*tw-bg-\[var\(--background-selected\)\][\s\S]*tw-text-\[var\(--text-primary\)\][\s\S]*tw-text-\[var\(--text-secondary\)\]/,
  'The counter empty state must use theme-aware design-system tokens.'
);
assert.match(
  counterStyles,
  /@media \(width <= 639px\)[\s\S]*\.rdt_TableCol:last-of-type,[\s\S]*\.rdt_TableCell:last-of-type[\s\S]*tw-px-1/,
  'The mobile percentage column must reclaim horizontal space from data-table cell padding.'
);
assert.match(
  moveTableStyles,
  /\.table-moves thead tr \+ tr th \{[\s\S]*top: 35px;[\s\S]*tw-z-2/,
  'Best Moves column headers must remain sticky below the Pokémon navigation stacking layer.'
);
assert.doesNotMatch(
  moveTableStyles,
  /\.table-moves thead tr \+ tr th \{[\s\S]*tw-z-10/,
  'Best Moves column headers must not float above the Pokémon navigation bar.'
);
assert.match(
  pokemonStyles,
  /\.prev-next-block \{[\s\S]*z-index: 3 !important/,
  'The Pokémon navigation bar must retain the higher stacking layer.'
);
assert.match(
  statsRanking,
  /data-tag="allowRowEvents"[\s\S]*PokemonIconType[\s\S]*tw-pointer-events-none[\s\S]*PokemonTableIcon[\s\S]*tw-pointer-events-none/,
  'Stats Ranking Pokémon icons must forward custom-cell clicks to the v8 row selection handler.'
);
assert.match(
  statsRanking,
  /id: ColumnType\.Released,[\s\S]*data-tag="allowRowEvents"[\s\S]*DoneIcon[\s\S]*tw-pointer-events-none[\s\S]*CloseIcon[\s\S]*tw-pointer-events-none/,
  'Stats Ranking release icons must forward custom-cell clicks to the v8 row selection handler.'
);
assert.match(
  statsRanking,
  /id: ColumnType\.Type,[\s\S]*data-tag="allowRowEvents"[\s\S]*IconType[\s\S]*tw-mr-2 tw-pointer-events-none/,
  'Stats Ranking type images must forward custom-cell clicks to the v8 row selection handler.'
);
assert.match(
  statsRanking,
  /<LinkToTop[\s\S]*?to=\{`\/pokemon\/\$\{row\.num\}[\s\S]*?funcOnClick=\{\(event\) => event\.stopPropagation\(\)\}/,
  'Stats Ranking view links must navigate without also selecting the table row.'
);
assert.match(
  sharedSortIcon,
  /<path d="M12 19V5M6 11L12 5L18 11" \/>/,
  'Custom sortable tables must use the native v8 data-table arrow geometry.'
);
assert.match(
  sharedSortIcon,
  /style=\{\{ transform: direction === 'desc' \? 'rotate\(180deg\)' : 'rotate\(0deg\)' \}\}/,
  'The shared sort arrow must update its transform directly when the sort direction changes.'
);
for (const sortableTable of customSortableTables) {
  assert.match(sortableTable, /DataTableSortIcon/, 'Custom sortable tables must share the v8 sort icon.');
  assert.doesNotMatch(
    sortableTable,
    /ArrowDrop(?:Up|Down)Icon|Arrow(?:Upward|Downward)Icon|▲|▼/,
    'Custom sortable tables must not restore legacy sort arrows.'
  );
}

const sourceFiles = [];
const collectSourceFiles = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collectSourceFiles(path);
    else if (['.ts', '.tsx', '.js', '.jsx'].includes(extname(entry.name))) sourceFiles.push(path);
  }
};
await collectSourceFiles(sourceRoot);

const directImports = [];
let sharedTableUsages = 0;
for (const path of sourceFiles) {
  const contents = await readFile(path, 'utf8');
  if (path !== componentPath && /from\s*['"]react-data-table-component['"]/.test(contents)) {
    const importedDefault =
      /import\s+(?!type\b)[A-Za-z_$][\w$]*\s*(?:,|from)\s*['"]react-data-table-component['"]/.test(contents);
    if (importedDefault) directImports.push(relative(root, path));
  }
  sharedTableUsages += contents.match(/<CustomDataTable\b/g)?.length ?? 0;
}

assert.deepEqual(
  directImports,
  [],
  `Pages must use the shared compatibility component instead of rendering DataTable directly: ${directImports.join(', ')}`
);
assert.ok(sharedTableUsages >= 10, 'Expected the shared data table to cover the project table surfaces.');

console.log(`Data table v8 compatibility passed across ${sharedTableUsages} shared table usages.`);

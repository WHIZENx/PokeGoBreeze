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
const sharedSortIcon = await readFile(join(sourceRoot, 'components/Commons/Tables/DataTableSortIcon.tsx'), 'utf8');
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
  /<span className="tw-font-bold">\s*\{toFloatWithPadding\(row\.ratio/,
  'The primary percentage value in Best Pokémon Counter must use the design-system bold weight.'
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

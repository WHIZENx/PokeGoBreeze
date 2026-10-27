#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (path) => readFile(join(root, path), 'utf8');

const [variables, indexStyles, baseStyles, typographyTheme, applicationTheme, tailwind] = await Promise.all([
  read('src/assets/styles/variables.scss'),
  read('src/index.scss'),
  read('src/assets/styles/base.scss'),
  read('src/utils/models/overrides/typography.model.ts'),
  read('src/utils/models/overrides/themes.model.ts'),
  read('tailwind.config.js'),
]);

assert.match(
  variables,
  /--font-family-sans:\s*"Roboto",\s*"Helvetica",\s*"Arial",\s*sans-serif;/,
  'The canonical sans-serif font stack must remain a CSS design token.'
);
assert.match(indexStyles, /font-family:\s*var\(--font-family-sans\);/, 'The document must consume the font token.');
assert.match(
  indexStyles,
  /button,\s*input,\s*optgroup,\s*option,\s*select,\s*textarea\s*{\s*font:\s*inherit;/s,
  'Native controls must inherit the application typography.'
);
assert.match(
  typographyTheme,
  /DESIGN_SYSTEM_FONT_FAMILY\s*=\s*'var\(--font-family-sans\)'/,
  'MUI typography must consume the canonical font token.'
);
for (const variant of [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'button',
  'caption',
  'overline',
]) {
  assert.match(
    typographyTheme,
    new RegExp(`${variant}: variant\\('${variant}',`),
    `MUI ${variant} must use the explicit design-system metrics.`
  );
}
assert.match(
  baseStyles,
  /b,\s*strong\s*{[^}]*font-weight:\s*var\(--font-weight-bold\);/s,
  'Native emphasis tags must use the design-system bold weight.'
);
for (const heading of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
  assert.match(
    baseStyles,
    new RegExp(`\\.${heading}, ${heading} \\{[^}]*--typography-${heading}-font-size`, 's'),
    `Native ${heading} must use the matching MUI typography metrics.`
  );
}
assert.match(
  baseStyles,
  /small\s*{[^}]*--typography-caption-font-size[^}]*--typography-caption-line-height[^}]*--typography-caption-letter-spacing/s,
  'Native small text must use the caption metrics.'
);
assert.match(
  applicationTheme,
  /typography:\s*DesignSystemTypography/,
  'The application theme must use the shared typography configuration.'
);
assert.match(
  tailwind,
  /sans:\s*\['var\(--font-family-sans\)'\]/,
  'Tailwind font-sans must consume the canonical font token.'
);
for (const weight of ['light', 'regular', 'medium', 'bold']) {
  assert.match(
    typographyTheme,
    new RegExp(`fontWeight${weight[0].toUpperCase()}${weight.slice(1)}: 'var\\(--font-weight-${weight}\\)'`),
    `MUI ${weight} weight must consume the canonical token.`
  );
}

const sourceFiles = [];
const collectSourceFiles = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collectSourceFiles(path);
    else if (/\.(?:css|scss|js|jsx|ts|tsx)$/.test(entry.name)) sourceFiles.push(path);
  }
};
await collectSourceFiles(join(root, 'src'));

const localFontDeclarations = [];
for (const path of sourceFiles) {
  const contents = await readFile(path, 'utf8');
  const lines = contents.split('\n');
  lines.forEach((line, index) => {
    if (!/\bfont-family\s*:|\bfontFamily\s*:/.test(line)) return;
    const file = relative(root, path);
    if (
      file === 'src/index.scss' ||
      file === 'src/assets/styles/base.scss' ||
      file === 'src/utils/models/overrides/typography.model.ts'
    )
      return;
    localFontDeclarations.push(`${file}:${index + 1}`);
  });
}

assert.deepEqual(
  localFontDeclarations,
  [],
  `Page and component font families must use the shared design system: ${localFontDeclarations.join(', ')}`
);

console.log(`Typography design system passed (${sourceFiles.length} source files audited).`);

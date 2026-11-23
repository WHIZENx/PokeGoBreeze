#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../..', import.meta.url));
const sourceRoot = join(projectRoot, 'src');
const tailwindConfig = await readFile(join(projectRoot, 'tailwind.config.js'), 'utf8');
const sourceExtensions = new Set(['.css', '.js', '.jsx', '.scss', '.ts', '.tsx']);

const collectSourceFiles = async (directory) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectSourceFiles(path)));
    else if (sourceExtensions.has(extname(entry.name))) files.push(path);
  }
  return files;
};

const sources = await Promise.all(
  (await collectSourceFiles(sourceRoot)).map(async (path) => ({ path, content: await readFile(path, 'utf8') }))
);

// Tailwind classes and tokens
const forbiddenPatterns = [
  [/(?:min|max)-\[[^\]]+\]:tw-/g, 'arbitrary responsive breakpoint'],
  [/tw-(?:border|bg)-\[var\(--divider\)\]/g, 'divider color literal'],
  [/tw-(?:text|bg)-\[var\(--text-(?:primary|secondary|caption)\)\]/g, 'foreground color literal'],
  [/tw-bg-\[var\(--background-(?:paper|selected|table-strip|table-hover)\)\]/g, 'surface color literal'],
  [/tw-bg-\[var\(--custom-table-background\)\]/g, 'custom table color literal'],
  [/tw-z-\[(?:1|4)\]/g, 'layer literal'],
  [/tw-rounded(?:-[lr])?-\[(?:5|10)px\]/g, 'radius literal'],
  [/tw-(?:p[trblxy]?|m[trblxy]?|gap(?:-[xy])?|top|right|bottom|left)-\[(?:3|5|6|10|15|20)px\]/g, 'spacing literal'],
  [/tw-h-\[(?:30|35)px\]/g, 'shared height literal'],
  [/tw-text-\[(?:16|18)px\]/g, 'shared font-size literal'],
  [/tw-max-w-\[300px\]/g, 'compact width literal'],
  [/tw-text-\[10px\]/g, 'micro font-size literal'],
  [
    /tw-(?:w|h|min-w|min-h|max-w|max-h|left)-\[(?:99%|50%|200px|205px|217px|250px|300px|600px|900px|22rem|70vh|190px|150px|130px|62px|18px|13px|49%)\]/g,
    'shared dimension literal',
  ],
];

const findings = [];
for (const source of sources) {
  for (const [pattern, label] of forbiddenPatterns) {
    for (const match of source.content.matchAll(pattern)) {
      const line = source.content.slice(0, match.index).split('\n').length;
      findings.push(`${relative(projectRoot, source.path)}:${line} ${label}: ${match[0]}`);
    }
  }
}

assert.deepEqual(findings, [], `Tailwind design-system regressions found:\n${findings.join('\n')}`);

for (const token of [
  "xs: '420px'",
  "sm: '576px'",
  "sm1: '600px'",
  "md: '768px'",
  "md1: '900px'",
  "lg: '992px'",
  "xl: '1200px'",
  "'2xl': '1400px'",
  "divider: 'var(--divider)'",
  "primary: 'var(--text-primary)'",
  "secondary: 'var(--text-secondary)'",
  "control: '5px'",
  "panel: '10px'",
  "'form-preview': '200px'",
  "'evolution-card': '22rem'",
  "'results-panel': '600px'",
  'var(--typography-micro-font-size)',
]) {
  assert.ok(tailwindConfig.includes(token), `Missing Tailwind design token: ${token}`);
}

console.log(`Tailwind design-system regression passed across ${sources.length} Web source files.`);

// Typography across native elements, MUI, and Tailwind
const read = (path) => readFile(join(projectRoot, path), 'utf8');

const [variables, indexStyles, baseStyles, typographyTheme, applicationTheme] = await Promise.all([
  read('src/assets/styles/variables.scss'),
  read('src/index.scss'),
  read('src/assets/styles/base.scss'),
  read('src/utils/models/overrides/typography.model.ts'),
  read('src/utils/models/overrides/themes.model.ts'),
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
  tailwindConfig,
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

const localFontDeclarations = [];
for (const { path, content } of sources) {
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (!/\bfont-family\s*:|\bfontFamily\s*:/.test(line)) return;
    const file = relative(projectRoot, path);
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

console.log(`Typography design system passed (${sources.length} source files audited).`);

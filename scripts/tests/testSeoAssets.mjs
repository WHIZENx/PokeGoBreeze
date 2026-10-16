#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const webRoot = new URL('../../', import.meta.url);
const indexHtml = await readFile(new URL('index.html', webRoot), 'utf8');
const manifest = JSON.parse(await readFile(new URL('public/manifest.json', webRoot), 'utf8'));

const readPngSize = async (relativePath) => {
  const image = await readFile(new URL(relativePath, webRoot));
  const pngSignature = '89504e470d0a1a0a';
  if (image.subarray(0, 8).toString('hex') !== pngSignature || image.subarray(12, 16).toString() !== 'IHDR') {
    throw new Error(`${relativePath} is not a valid PNG.`);
  }
  return { width: image.readUInt32BE(16), height: image.readUInt32BE(20) };
};

const [openGraphImage, appIcon, appleTouchIcon] = await Promise.all([
  readPngSize('public/og-image.png'),
  readPngSize('public/app-icon.png'),
  readPngSize('public/apple-touch-icon.png'),
]);

const manifestAppIcon = manifest.icons?.find((icon) => icon.src === 'app-icon.png');
const checks = [
  ['Open Graph image is 1200x630', openGraphImage.width === 1200 && openGraphImage.height === 630],
  ['Open Graph metadata declares 1200x630', indexHtml.includes('property="og:image:width" content="1200"') && indexHtml.includes('property="og:image:height" content="630"')],
  ['PWA icon is 512x512', appIcon.width === 512 && appIcon.height === 512],
  ['manifest uses the square PWA icon', manifestAppIcon?.sizes === '512x512' && manifestAppIcon?.type === 'image/png'],
  ['Apple touch icon is 180x180', appleTouchIcon.width === 180 && appleTouchIcon.height === 180],
  ['HTML uses the dedicated Apple touch icon', indexHtml.includes('href="/apple-touch-icon.png"')],
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);
if (failures.length) {
  console.error(`SEO asset audit failed: ${failures.join(', ')}`);
  process.exit(1);
}

console.log(`SEO asset audit passed (${checks.length} checks).`);

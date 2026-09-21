'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const generateSitemaps = require('./generateSitemap');

async function buildSitemaps() {
  try {
    const { files, manifest } = await generateSitemaps();
    const publicPath = path.resolve(__dirname, '../public');
    fs.mkdirSync(publicPath, { recursive: true });
    for (const name of fs.readdirSync(publicPath).filter((name) => /^sitemap(?:-|\.)/.test(name))) {
      fs.rmSync(path.join(publicPath, name));
    }
    for (const [name, contents] of Object.entries(files)) {
      fs.writeFileSync(path.join(publicPath, name), contents);
    }
    console.log(`[seo] Wrote ${Object.keys(files).length} sitemap files for ${manifest.routes.length} dynamic routes.`);
  } catch (error) {
    console.error('[seo] Sitemap build failed:', error.message);
    process.exit(1);
  }
}

buildSitemaps();

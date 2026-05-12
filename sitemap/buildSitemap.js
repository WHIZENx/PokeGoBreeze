'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const generateSitemap = require('./generateSitemap');

async function buildSitemap() {
  try {
    const sitemap = await generateSitemap();
    const publicPath = path.resolve(__dirname, '../public');

    // mkdirSync with recursive: true is idempotent — no existsSync check needed
    fs.mkdirSync(publicPath, { recursive: true });
    fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemap);
  } catch (error) {
    console.error('[sitemap] Build failed:', error.message);
    process.exit(1);
  }
}

buildSitemap();

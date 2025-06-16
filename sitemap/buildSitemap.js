const fs = require('fs');
const path = require('path');
const generateSitemap = require('./generateSitemap');

/**
 * Build and save the sitemap.xml file
 */
async function buildSitemap() {
  try {
    // Generate the sitemap XML
    const sitemap = await generateSitemap();

    const publicPath = path.resolve(__dirname, '../public');

    // Ensure the public directory exists
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }

    // Write the sitemap to the public directory
    fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemap);

    // Success - silent in production
  } catch (error) {
    // Silent fail in production
    process.exit(1);
  }
}

// Run the build process
buildSitemap();

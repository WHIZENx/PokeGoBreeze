#!/usr/bin/env node
/**
 * scripts/withConfig.js
 * Cross-platform replacement for:  bash -c 'source ./config.sh && VITE_CJS_IGNORE_WARNING=true <cmd>'
 *
 * Usage: node scripts/withConfig.js <command> [args...]
 * Example: node scripts/withConfig.js vite
 *          node scripts/withConfig.js npm run _deploy:inner
 *
 * What it does:
 *  1. Reads .env (same logic as config.sh)
 *  2. Fetches all items from Vercel Edge Config
 *  3. Sets REACT_APP_VERSION, REACT_APP_CONFIG, VITE_CJS_IGNORE_WARNING
 *  4. Spawns <command> [args] with the enriched environment
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// ── 1. Load .env ──────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) {
      continue;
    }
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    // Don't override vars already set in the environment (mirrors bash behaviour)
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

// ── 2. Fetch Edge Config ──────────────────────────────────────────────────────
function fetchEdgeConfig(edgeId, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'edge-config.vercel.com',
      path: `/${edgeId}/items`,
      headers: { Authorization: `Bearer ${token}` },
    };
    https
      .get(options, (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Edge Config returned HTTP ${res.statusCode}: ${raw}`));
          }
          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

// ── 3. Main ───────────────────────────────────────────────────────────────────
async function main() {
  loadEnv();

  const edgeId = process.env.VERCEL_EDGE_CONFIG_ID || process.env.REACT_APP_EDGE_ID || '';
  const token = process.env.VERCEL_TOKEN || process.env.REACT_APP_EDGE_READ_TOKEN || '';
  const mode = process.env.APP_DEPLOYMENT_MODE || process.env.REACT_APP_DEPLOYMENT_MODE || 'development';

  if (!edgeId) {
    // eslint-disable-next-line no-console
    console.error('❌ Missing: VERCEL_EDGE_CONFIG_ID or REACT_APP_EDGE_ID');
    process.exit(1);
  }
  if (!token) {
    // eslint-disable-next-line no-console
    console.error('❌ Missing: VERCEL_TOKEN or REACT_APP_EDGE_READ_TOKEN');
    process.exit(1);
  }

  const versionKey = mode === 'production' ? 'version' : mode === 'staging' ? 'version-staging' : 'version-dev';

  // eslint-disable-next-line no-console
  console.log(`🔍 Fetching Edge Config (mode: ${mode})…`);
  const data = await fetchEdgeConfig(edgeId, token);

  const version = !process.env.REACT_APP_VERSION ? data[versionKey] : process.env.REACT_APP_VERSION;
  if (!version) {
    // eslint-disable-next-line no-console
    console.error(`❌ Version key '${versionKey}' not found in Edge Config`);
    process.exit(1);
  }

  const config = Object.fromEntries(Object.entries(data).filter(([k]) => k !== versionKey));

  // Export env vars so the spawned child process inherits them
  process.env.REACT_APP_VERSION = String(version);
  process.env.REACT_APP_CONFIG = JSON.stringify(config);
  process.env.VITE_CJS_IGNORE_WARNING = 'true';

  // eslint-disable-next-line no-console
  console.log(`✅ REACT_APP_VERSION=${version}`);

  // ── 4. Spawn the requested command ──────────────────────────────────────────
  const [cmd, ...args] = process.argv.slice(2);
  if (!cmd) {
    return;
  } // nothing to run – just export vars (shouldn't happen in practice)

  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    env: process.env,
    shell: true, // required on Windows so npm / vite resolve correctly
  });

  process.exit(result.status ?? 0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('❌', err.message);
  process.exit(1);
});

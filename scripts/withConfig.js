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
 *  2. If config.json exists, loads config from it (skips Vercel Edge Config fetch)
 *  3. Otherwise fetches all items from Vercel Edge Config
 *  4. Sets REACT_APP_VERSION, REACT_APP_CONFIG, VITE_CJS_IGNORE_WARNING
 *  5. Spawns <command> [args] with the enriched environment
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

// ── 2. Load local config file (bypasses Edge Config) ─────────────────────────
function loadLocalConfig() {
  const localPath = path.join(process.cwd(), 'config.json');
  if (!fs.existsSync(localPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to parse config.json:', e.message);
    process.exit(1);
  }
}

// ── 3. Fetch Edge Config ──────────────────────────────────────────────────────
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
            return reject(new Error(`Edge Config returned HTTP ${res.statusCode}.`));
          }
          try {
            resolve(JSON.parse(raw));
          } catch {
            reject(new Error('Edge Config returned invalid JSON.'));
          }
        });
      })
      .on('error', (error) => {
        reject(new Error(`Could not connect to Edge Config (${error.code ?? 'network error'}).`));
      });
  });
}

// ── 4. Main ───────────────────────────────────────────────────────────────────
async function main() {
  loadEnv();

  const mode = process.env.APP_DEPLOYMENT_MODE || process.env.REACT_APP_DEPLOYMENT_MODE || 'development';
  const versionKey = mode === 'production' ? 'version' : mode === 'staging' ? 'version-staging' : 'version-dev';

  // ── Local config takes priority over Edge Config ───────────────────────────
  const localData = loadLocalConfig();
  let data;

  if (localData) {
    // eslint-disable-next-line no-console
    console.log('📁 Using config.json (Edge Config fetch skipped)');
    data = localData;
  } else {
    const edgeId = process.env.VERCEL_EDGE_CONFIG_ID || process.env.REACT_APP_EDGE_ID || '';
    const token = process.env.VERCEL_TOKEN || process.env.REACT_APP_EDGE_READ_TOKEN || '';

    const missing = [
      edgeId ? null : 'REACT_APP_EDGE_ID (or VERCEL_EDGE_CONFIG_ID)',
      token ? null : 'REACT_APP_EDGE_READ_TOKEN (or VERCEL_TOKEN)',
    ].filter(Boolean);
    if (missing.length) {
      throw new Error(
        [
          'Web cannot start without config.json or Vercel Edge Config.',
          'For local development, copy config.example.json to config.json in the Web directory (modules/web in the workspace).',
          `To use Edge Config, set ${missing.join(' and ')} in the Web .env file or process environment.`,
        ].join('\n')
      );
    }

    // eslint-disable-next-line no-console
    console.log(`🔍 Fetching Edge Config (mode: ${mode})…`);
    try {
      data = await fetchEdgeConfig(edgeId, token);
    } catch (error) {
      throw new Error(
        `Web cannot start. ${error.message}\nCheck the Edge Config ID, read token, and connection, or create config.json from config.example.json for local development.`
      );
    }
  }

  const version = !process.env.REACT_APP_VERSION ? data[versionKey] : process.env.REACT_APP_VERSION;
  if (!version) {
    // eslint-disable-next-line no-console
    console.error(`❌ Version key '${versionKey}' not found in config`);
    process.exit(1);
  }

  const config = Object.fromEntries(Object.entries(data).filter(([k]) => k !== versionKey && k !== '_comment'));

  // Export env vars so the spawned child process inherits them
  process.env.REACT_APP_VERSION = String(version);
  process.env.REACT_APP_CONFIG = JSON.stringify(config);
  process.env.VITE_CJS_IGNORE_WARNING = 'true';

  // eslint-disable-next-line no-console
  console.log(`✅ REACT_APP_VERSION=${version}`);

  // ── 5. Spawn the requested command ──────────────────────────────────────────
  const viteBuildMode = mode === 'production' ? 'production' : 'development';
  const passedArgs = process.argv.slice(2);
  const [cmd, ...args] = passedArgs.length ? passedArgs : ['npm', 'run', `_deploy:inner:${viteBuildMode}`];
  if (!cmd) {
    return;
  } // nothing to run – just export vars (shouldn't happen in practice)

  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32', // Resolve npm and Vite .cmd shims on Windows.
  });

  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('❌', err.message);
  process.exit(1);
});

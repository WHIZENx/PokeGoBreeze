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
 *  1. Reads workspace and Web environment files
 *  2. If config.json exists, loads config from it (skips Vercel Edge Config fetch)
 *  3. Otherwise fetches Vercel Edge Config
 *  4. Sets REACT_APP_VERSION, REACT_APP_CONFIG, VITE_CJS_IGNORE_WARNING
 *  5. Spawns <command> [args] with the enriched environment
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { readLocalEnv } = require('./local-env.cjs');

// ── 2. Load local config file (bypasses Edge Config) ─────────────────────────
function loadLocalConfig() {
  const localPath = path.join(process.cwd(), 'config.json');
  if (!fs.existsSync(localPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
  } catch {
    // eslint-disable-next-line no-console
    console.error('❌ Could not read config.json as JSON. Check the file contents and permissions.');
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
const deploymentMode = (env) => env.REACT_APP_DEPLOYMENT_MODE || 'development';

async function main() {
  const passedArgs = process.argv.slice(2);
  const modeFlag = passedArgs.indexOf('--mode');
  const explicitMode =
    modeFlag >= 0 ? passedArgs[modeFlag + 1] : passedArgs.find((arg) => arg.startsWith('--mode='))?.slice(7);
  const defaultMode =
    passedArgs[0] === 'vite'
      ? passedArgs[1] === 'build'
        ? 'production'
        : 'development'
      : deploymentMode(readLocalEnv()) === 'production'
        ? 'production'
        : 'development';
  const env = readLocalEnv(explicitMode || defaultMode);

  const mode = deploymentMode(env);
  const versionKey = mode === 'production' ? 'version' : mode === 'staging' ? 'version-staging' : 'version-dev';

  // ── Local config takes priority over Edge Config ───────────────────────────
  const localData = loadLocalConfig();
  let data;

  if (localData) {
    // eslint-disable-next-line no-console
    console.log('📁 Using config.json (Edge Config fetch skipped)');
    data = localData;
  } else {
    const edgeId = env.REACT_APP_EDGE_ID || '';
    const token = env.REACT_APP_EDGE_READ_TOKEN || '';

    const missing = [edgeId ? null : 'REACT_APP_EDGE_ID', token ? null : 'REACT_APP_EDGE_READ_TOKEN'].filter(Boolean);
    if (missing.length) {
      throw new Error(
        [
          'Web cannot start without config.json or Vercel Edge Config.',
          'For local development, copy config.example.json to config.json in the Web directory (modules/web in the workspace).',
          `To use Edge Config, set ${missing.join(' and ')} in the workspace or Web .env file, or process environment.`,
        ].join('\n')
      );
    }

    // eslint-disable-next-line no-console
    console.log('🔍 Fetching Edge Config…');
    try {
      data = await fetchEdgeConfig(edgeId, token);
    } catch (error) {
      throw new Error(
        `Web cannot start. ${error.message}\nCheck the Edge Config ID, read token, and connection, or create config.json from config.example.json for local development.`
      );
    }
  }

  const version = !env.REACT_APP_VERSION ? data[versionKey] : env.REACT_APP_VERSION;
  if (!version) {
    // eslint-disable-next-line no-console
    console.error(`❌ Set REACT_APP_VERSION or include the '${versionKey}' key in Web runtime config.`);
    process.exit(1);
  }

  const config = Object.fromEntries(Object.entries(data).filter(([k]) => k !== versionKey && k !== '_comment'));

  // Export env vars so the spawned child process inherits them
  env.REACT_APP_VERSION = String(version);
  env.REACT_APP_CONFIG = JSON.stringify(config);
  env.VITE_CJS_IGNORE_WARNING = 'true';

  // eslint-disable-next-line no-console
  console.log('✅ Web runtime configuration loaded.');

  // ── 5. Spawn the requested command ──────────────────────────────────────────
  const viteBuildMode = mode === 'production' ? 'production' : 'development';
  const [cmd, ...args] = passedArgs.length ? passedArgs : ['npm', 'run', `_deploy:inner:${viteBuildMode}`];
  if (!cmd) {
    return;
  } // nothing to run – just export vars (shouldn't happen in practice)

  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    env,
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

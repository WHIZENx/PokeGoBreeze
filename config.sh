#!/bin/bash
# config.sh – Loads version + config from config.json (if present) or
# Vercel Edge Config, then exports as env vars.
# Sourced by npm scripts (start, develop, deploy) before vite build.

set -euo pipefail

# ─── Load .env for local runs (CI provides env vars directly) ─────────────────
if [ -f .env ]; then
  while IFS='=' read -r key value || [ -n "$key" ]; do
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    export "$key=$value"
  done < .env
fi

# ─── Resolve Edge Config key by deployment mode ────────────────────────────────
APP_DEPLOYMENT_MODE="${APP_DEPLOYMENT_MODE:-${REACT_APP_DEPLOYMENT_MODE:-development}}"
case "$APP_DEPLOYMENT_MODE" in
  production) VERSION_VAR="version" ;;
  staging)    VERSION_VAR="version-staging" ;;
  *)          VERSION_VAR="version-dev" ;;
esac

# ─── Use config.json when present (skips Edge Config fetch) ──────────────
if [ -f config.json ]; then
  echo "📁 Using config.json (Edge Config fetch skipped)"
  FETCHED_DATA=$(cat config.json)
else
  EDGE_ID="${VERCEL_EDGE_CONFIG_ID:-${REACT_APP_EDGE_ID:-}}"
  EDGE_READ_TOKEN="${VERCEL_TOKEN:-${REACT_APP_EDGE_READ_TOKEN:-}}"

  if [[ -z "$EDGE_ID" ]]; then     echo "❌ Missing: VERCEL_EDGE_CONFIG_ID or REACT_APP_EDGE_ID"; exit 1; fi
  if [[ -z "$EDGE_READ_TOKEN" ]]; then echo "❌ Missing: VERCEL_TOKEN or REACT_APP_EDGE_READ_TOKEN"; exit 1; fi

  echo "🔍 Fetching Edge Config (mode: ${APP_DEPLOYMENT_MODE})…"
  FETCHED_DATA=$(curl -sf "https://edge-config.vercel.com/${EDGE_ID}/items" \
    -H "Authorization: Bearer $EDGE_READ_TOKEN")

  if [[ -z "$FETCHED_DATA" ]]; then
    echo "❌ Edge Config response was empty"
    exit 1
  fi
fi

# ─── Parse JSON: extract version + remaining config ────────────────────────────
# Prefer jq (fast, always available on GitHub Actions / macOS with Homebrew).
# Fall back to python3 for environments without jq.
if command -v jq &>/dev/null; then
  export REACT_APP_VERSION
  export REACT_APP_CONFIG
  REACT_APP_VERSION=$(echo "$FETCHED_DATA" | jq -r ".\"$VERSION_VAR\" // empty")
  REACT_APP_CONFIG=$(echo "$FETCHED_DATA"  | jq -c "del(.\"$VERSION_VAR\", ._comment)")
else
  PARSED=$(DATA="$FETCHED_DATA" python3 - "$VERSION_VAR" <<'PYEOF'
import json, sys, os
data = json.loads(os.environ['DATA'])
key  = sys.argv[1]
print(data.get(key, ''))
cfg  = {k: v for k, v in data.items() if k != key and k != '_comment'}
print(json.dumps(cfg, separators=(',', ':')))
PYEOF
  )
  export REACT_APP_VERSION
  export REACT_APP_CONFIG
  REACT_APP_VERSION=$(echo "$PARSED" | head -1)
  REACT_APP_CONFIG=$(echo "$PARSED"  | tail -1)
fi

if [[ -z "$REACT_APP_VERSION" ]]; then
  echo "❌ Version key '$VERSION_VAR' not found in config"
  exit 1
fi

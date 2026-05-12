#!/bin/bash
# deploy.sh – Updates Vercel Edge Config with the current version and logs to MongoDB.
# Called by GitHub Actions (deploy-vercel job) and can run locally with a populated .env.

set -euo pipefail

# ─── Load .env for local runs (CI provides env vars directly) ─────────────────
if [ -f .env ]; then
  while IFS='=' read -r key value || [ -n "$key" ]; do
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    export "$key=$value"
  done < .env
fi

# ─── Resolve required variables ────────────────────────────────────────────────
# CI injects VERCEL_EDGE_CONFIG_ID / VERCEL_TOKEN; local runs use REACT_APP_* from .env
EDGE_ID="${VERCEL_EDGE_CONFIG_ID:-${REACT_APP_EDGE_ID:-}}"
EDGE_TOKEN="${VERCEL_TOKEN:-${REACT_APP_EDGE_TOKEN:-}}"
APP_DEPLOYMENT_MODE="${APP_DEPLOYMENT_MODE:-${REACT_APP_DEPLOYMENT_MODE:-development}}"
MONGODB_URI="${MONGODB_URI:-}"

if [[ -z "$EDGE_ID" ]]; then  echo "❌ Missing required: VERCEL_EDGE_CONFIG_ID or REACT_APP_EDGE_ID"; exit 1; fi
if [[ -z "$EDGE_TOKEN" ]]; then echo "❌ Missing required: VERCEL_TOKEN or REACT_APP_EDGE_TOKEN"; exit 1; fi

# ─── Build version string ──────────────────────────────────────────────────────
# Format: <last digit of year>.<MMDD>.<HHmm>  e.g. 6.0512.2143
VERSION_TS="$(date +'%Y' | grep -o '.$').$(date +'%m%d.%H%M')"

case "$APP_DEPLOYMENT_MODE" in
  production) VERSION="$VERSION_TS";           VERSION_VAR="version" ;;
  staging)    VERSION="$VERSION_TS-staging";   VERSION_VAR="version-staging" ;;
  *)          VERSION="$VERSION_TS-develop";   VERSION_VAR="version-dev" ;;
esac

# ─── Update Vercel Edge Config ─────────────────────────────────────────────────
HTTP_STATUS=$(curl -s -o /tmp/edge_response.json -w "%{http_code}" \
  -X PATCH "https://api.vercel.com/v1/edge-config/${EDGE_ID}/items" \
  -H "Authorization: Bearer $EDGE_TOKEN" \
  -H "edgeConfigId: $EDGE_ID" \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"operation\":\"update\",\"key\":\"$VERSION_VAR\",\"value\":\"$VERSION\"}]}")

if [[ "$HTTP_STATUS" -ge 200 && "$HTTP_STATUS" -lt 300 ]]; then
  echo "✅ Edge Config updated (HTTP $HTTP_STATUS)"
else
  echo "❌ Edge Config update failed (HTTP $HTTP_STATUS)"
  cat /tmp/edge_response.json
  exit 1
fi

# ─── Log version to MongoDB ────────────────────────────────────────────────────
if [[ -z "$MONGODB_URI" ]]; then
  echo "ℹ️  MongoDB export skipped (MONGODB_URI not set)"
else
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  if mongosh "$MONGODB_URI" --quiet --eval \
    "db.getSiblingDB('main').versions.insertOne({version:'$VERSION',timestamp:'$TIMESTAMP',deployedAt:new Date()})"; then
    echo "✅ MongoDB version logged"
  else
    echo "❌ MongoDB log failed"
    exit 1
  fi
fi

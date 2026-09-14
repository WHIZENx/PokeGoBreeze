#!/bin/sh
set -eu

dependency_hash="$(cat package.json package-lock.json | sha256sum | cut -d ' ' -f1)"
stamp="node_modules/.package-lock.sha256"

if [ ! -f "$stamp" ] || [ "$(cat "$stamp")" != "$dependency_hash" ]; then
  npm ci
  printf '%s\n' "$dependency_hash" > "$stamp"
fi

exec npm run develop -- --host 0.0.0.0

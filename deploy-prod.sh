#!/bin/bash

# Load environment variables from .env file if they aren't already set
if [ -f .env ]; then
  echo "Loading environment variables from .env file"
  # Parse .env file and export variables
  while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip empty lines and comments
    if [[ -z "$key" || "$key" =~ ^# ]]; then
      continue
    fi
    # Remove quotes if present
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    export "$key=$value"
  done < .env
fi

# Set Edge Config variables - use GitHub Actions env vars if available, otherwise use .env values
EDGE_ID=${VERCEL_EDGE_CONFIG_ID:-$REACT_APP_EDGE_ID}
EDGE_TOKEN=${VERCEL_TOKEN:-$REACT_APP_EDGE_TOKEN}

YEAR_DIGIT=$(date +"%Y" | grep -o '.$')
MONTH_DAY=$(date +"%m%d")
HOUR_MINUTE=$(date +"%H%M")

VERSION="$YEAR_DIGIT.$MONTH_DAY.$HOUR_MINUTE"

echo "=== Environment Information ==="
echo "Deploy Time: $(date)"
echo "Current Version: $VERSION"

echo "=== Updating Vercel Edge Config ==="
curl -X 'PATCH' "https://api.vercel.com/v1/edge-config/${EDGE_ID}/items" \
     -H "Authorization: Bearer $EDGE_TOKEN" \
     -H "edgeConfigId: $EDGE_ID" \
     -H 'Content-Type: application/json' \
     -d '{ "items": [ { "operation": "update", "key": "version", "value": "'"$VERSION"'" } ] }'

echo
echo "=== Edge Config Update Complete ==="

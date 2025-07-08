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
NEON_API_URL=${NEON_API_URL:-$NEON_API_URL}
NEON_AUTH_URL=${NEON_AUTH_URL:-$NEON_AUTH_URL}
NEON_PUBLIC_STACK_PROJECT_ID=${NEON_PUBLIC_STACK_PROJECT_ID:-$NEXT_PUBLIC_STACK_PROJECT_ID}
NEON_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=${NEON_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY:-$NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY}
NEON_SECRET_SERVER_KEY=${NEON_SECRET_SERVER_KEY:-$STACK_SECRET_SERVER_KEY}
NEON_REFRESH_TOKEN=${NEON_REFRESH_TOKEN:-$NEON_REFRESH_TOKEN}
NEON_AUTH_USER_ID=${NEON_AUTH_USER_ID:-$NEON_AUTH_USER_ID}
APP_DEPLOYMENT_MODE=${APP_DEPLOYMENT_MODE:-$REACT_APP_DEPLOYMENT_MODE}

YEAR_DIGIT=$(date +"%Y" | grep -o '.$')
MONTH_DAY=$(date +"%m%d")
HOUR_MINUTE=$(date +"%H%M")

if [[ "$APP_DEPLOYMENT_MODE" == "development" ]]; then
  VERSION="$YEAR_DIGIT.$MONTH_DAY.$HOUR_MINUTE-develop"
else
  VERSION="$YEAR_DIGIT.$MONTH_DAY.$HOUR_MINUTE"
fi

echo "=== Environment Information ==="
echo "Deploy Time: $(date)"
echo "Current Version: $VERSION"

echo "=== Exporting version to Neon ==="
NEW_TOKEN_RESPONSE=$(curl -s -X 'POST' "$NEON_AUTH_URL" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Stack-Access-Type: server" \
  -H "X-Stack-Project-Id: $NEON_PUBLIC_STACK_PROJECT_ID" \
  -H "X-Stack-Publishable-Client-Key: $NEON_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY" \
  -H "X-Stack-Secret-Server-Key: $NEON_SECRET_SERVER_KEY" \
  -H "x-stack-refresh-token: $NEON_REFRESH_TOKEN" \
  -d '{"description":"Deploy","expires_at_millis":3600,"is_public":1,"user_id":"'$NEON_AUTH_USER_ID'"}')

NEON_API_KEY=$(echo "$NEW_TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [[ -z "$NEON_API_KEY" ]]; then
  echo "=== Failed to refresh token ==="
  exit 1
fi

NEON_RESPONSE=$(curl -s -w "\n%{http_code}" -X 'POST' "$NEON_API_URL/versions" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -d '{"track":"'"$VERSION"'"}')

NEON_HTTP_STATUS=$(echo "$NEON_RESPONSE" | tail -n1)
NEON_RESPONSE_BODY=$(echo "$NEON_RESPONSE" | sed '$d')

if [[ $NEON_HTTP_STATUS -ge 200 && $NEON_HTTP_STATUS -lt 300 ]]; then
  echo "=== Neon exported version successfully ==="
else
  echo "=== Neon exported version failed ==="
  echo "Error response: $NEON_RESPONSE_BODY"
  exit 1
fi

if [[ "$APP_DEPLOYMENT_MODE" != "development" ]]; then
  echo "=== Updating Vercel Edge Config ==="
  RESPONSE=$(curl -s -w "\n%{http_code}" -X 'PATCH' "https://api.vercel.com/v1/edge-config/${EDGE_ID}/items" \
       -H "Authorization: Bearer $EDGE_TOKEN" \
       -H "edgeConfigId: $EDGE_ID" \
       -H 'Content-Type: application/json' \
       -d '{ "items": [ { "operation": "update", "key": "version", "value": "'"$VERSION"'" } ] }')

  HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
  RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

  if [[ $HTTP_STATUS -ge 200 && $HTTP_STATUS -lt 300 ]]; then
    echo "=== Edge Config Update Complete ==="
  else
    echo "=== Edge Config Update Failed ==="
    echo "Error response: $RESPONSE_BODY"
    exit 1
  fi
else
  echo "=== Skipping Vercel Edge Config Update in development mode ==="
fi

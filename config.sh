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
EDGE_READ_TOKEN=${VERCEL_TOKEN:-$REACT_APP_EDGE_READ_TOKEN}

echo "Fetching version from Vercel Edge Config..."
FETCHED_DATA=$(curl -s "https://edge-config.vercel.com/${EDGE_ID}/items" \
     -H "Authorization: Bearer $EDGE_READ_TOKEN")

if [ $? -eq 0 ] && [ -n "$FETCHED_DATA" ]; then
  DATA=$(echo "$FETCHED_DATA" | sed -e 's/^"//' -e 's/"$//')
  
  VERSION=$(echo "$DATA" | grep -o '"version":"[^"]*"' | sed 's/"version":"//;s/"//')
  export REACT_APP_VERSION="$VERSION"
  echo "Successfully fetched version: $VERSION"

  CONFIG=$(echo "$DATA" | sed -E '
    # Case 1: {"version":"value",...} - version at start
    s/\{[[:space:]]*"version":"[^"]*",[[:space:]]*/\{/g;
    # Case 2: {...,"version":"value"} - version at end
    s/,[[:space:]]*"version":"[^"]*"[[:space:]]*\}/\}/g;
    # Case 3: {...,"version":"value",...} - version in middle
    s/,[[:space:]]*"version":"[^"]*",[[:space:]]*/,/g;
  ')
  export REACT_APP_CONFIG="$CONFIG"
  echo "Successfully exported config"
else
  echo "Error: Failed to fetch version from Vercel Edge Config or response was empty."
  exit 1
fi

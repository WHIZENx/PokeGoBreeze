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
FETCHED_VERSION_DATA=$(curl -s "https://edge-config.vercel.com/${EDGE_ID}/item/version" \
     -H "Authorization: Bearer $EDGE_READ_TOKEN")

if [ $? -eq 0 ] && [ -n "$FETCHED_VERSION_DATA" ]; then
  VERSION_DATA=$(echo "$FETCHED_VERSION_DATA" | sed -e 's/^"//' -e 's/"$//')
  export REACT_APP_VERSION="$VERSION_DATA"
  echo "Successfully fetched version: $REACT_APP_VERSION"
# else
  # echo "Error: Failed to fetch version from Vercel Edge Config or response was empty."
  # exit 1
fi

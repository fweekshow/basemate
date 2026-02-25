#!/usr/bin/env bash
set -euo pipefail

# Basemate Trending — fetch trending communities
API="${BASEMATE_TRENDING_API_URL:-https://devconnectarg-production.up.railway.app}"

echo "=== Trending Basemate Communities ==="
echo ""

RESPONSE=$(curl -sf "${API}/api/trending" 2>&1) || {
  echo "Error fetching trending data from ${API}/api/trending"
  echo "Trying /api/groups/trending..."
  RESPONSE=$(curl -sf "${API}/api/groups/trending" 2>&1) || {
    echo "Error fetching trending data"
    exit 1
  }
}

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

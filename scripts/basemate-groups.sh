#!/usr/bin/env bash
set -euo pipefail

# Basemate Groups — list eligible XMTP groups (groups with Basemate added)
API="${BASEMATE_TRENDING_API_URL:-https://devconnectarg-production.up.railway.app}"

echo "=== Eligible Basemate Groups ==="
echo ""

RESPONSE=$(curl -sf "${API}/api/groups/eligible" 2>&1) || {
  echo "Error fetching groups from ${API}/api/groups/eligible"
  exit 1
}

COUNT=$(echo "$RESPONSE" | jq 'length' 2>/dev/null || echo "0")
echo "Found ${COUNT} eligible groups"
echo ""

echo "$RESPONSE" | jq -r '.[] | "[\(.memberCount // 0) members] \(.name)\n  ID: \(.groupId)\n  \(.description // "No description")\n"' 2>/dev/null || echo "$RESPONSE"

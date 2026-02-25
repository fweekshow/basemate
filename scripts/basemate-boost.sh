#!/usr/bin/env bash
set -euo pipefail

# Basemate Boost — verify a USDC payment to activate paid discovery
# Usage: basemate-boost.sh <groupId> <txHash>

GROUP_ID="${1:?Usage: basemate-boost.sh <groupId> <txHash>}"
TX_HASH="${2:?Transaction hash required}"

API="${BASEMATE_TRENDING_API_URL:-https://devconnectarg-production.up.railway.app}"

echo "=== Verifying Boost Payment ==="
echo "Group:   ${GROUP_ID}"
echo "TX Hash: ${TX_HASH}"
echo ""

RESPONSE=$(curl -sf -X POST "${API}/api/group/boost/verify-tx" \
  -H "Content-Type: application/json" \
  -d "{\"groupId\": \"${GROUP_ID}\", \"txHash\": \"${TX_HASH}\"}" 2>&1)

STATUS=$(echo "$RESPONSE" | jq -r '.success // false' 2>/dev/null)

if [ "$STATUS" = "true" ]; then
  EXPIRES=$(echo "$RESPONSE" | jq -r '.expiresAt // "unknown"' 2>/dev/null)
  echo "✅ Boost activated!"
  echo "   Expires: ${EXPIRES}"
  echo "   Score boost: +50"
else
  ERROR=$(echo "$RESPONSE" | jq -r '.error // .message // "Unknown error"' 2>/dev/null)
  echo "❌ Boost verification failed: ${ERROR}"
  exit 1
fi

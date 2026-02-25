#!/usr/bin/env bash
set -euo pipefail

# Basemate Group Info — get details, tags, boost status, and invite link for a group
# Usage: basemate-group-info.sh <groupId>

GROUP_ID="${1:?Usage: basemate-group-info.sh <groupId>}"

API="${BASEMATE_TRENDING_API_URL:-https://devconnectarg-production.up.railway.app}"

echo "=== Group Info: ${GROUP_ID} ==="
echo ""

# Tags
echo "-- Tags --"
curl -sf "${API}/api/group/${GROUP_ID}/tags" 2>/dev/null | jq '.' 2>/dev/null || echo "(no tags)"
echo ""

# Boost status
echo "-- Boost Status --"
curl -sf "${API}/api/group/${GROUP_ID}/boost" 2>/dev/null | jq '.' 2>/dev/null || echo "(no boost data)"
echo ""

# Invite link
echo "-- Invite Link --"
curl -sf "${API}/api/group/${GROUP_ID}/invite-link" 2>/dev/null | jq '.' 2>/dev/null || echo "(no invite link)"
echo ""

# Deeplink
echo "-- Deeplink --"
echo "cbwallet://messaging/${GROUP_ID}"

#!/usr/bin/env bash
set -euo pipefail

# Basemate Tags — get or set tags for a group
# Usage: basemate-tags.sh <groupId> [tag1,tag2,tag3]
#   No tags = GET, with tags = PUT

GROUP_ID="${1:?Usage: basemate-tags.sh <groupId> [tag1,tag2,...]}"
TAGS="${2:-}"

API="${BASEMATE_TRENDING_API_URL:-https://devconnectarg-production.up.railway.app}"

if [ -z "$TAGS" ]; then
  # GET tags
  echo "=== Tags for ${GROUP_ID} ==="
  curl -sf "${API}/api/group/${GROUP_ID}/tags" | jq '.' 2>/dev/null
else
  # PUT tags
  # Convert comma-separated to JSON array
  JSON_TAGS=$(echo "$TAGS" | tr ',' '\n' | jq -R . | jq -s .)
  
  echo "=== Setting tags for ${GROUP_ID} ==="
  echo "Tags: ${TAGS}"
  echo ""
  
  RESPONSE=$(curl -sf -X PUT "${API}/api/group/${GROUP_ID}/tags" \
    -H "Content-Type: application/json" \
    -d "{\"tags\": ${JSON_TAGS}}" 2>&1)
  
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  echo ""
  echo "✅ Tags updated"
fi

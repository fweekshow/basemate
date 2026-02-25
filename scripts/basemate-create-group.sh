#!/usr/bin/env bash
set -euo pipefail

# Basemate Create Group — create an XMTP group with Basemate auto-added
# Usage: basemate-create-group.sh "<group_name>" ["<description>"] ["<image_url>"]
#
# Creates a production XMTP group visible in Base app.
# Basemate is automatically added as a member + a message is sent to trigger indexing.
# The creator (CLI wallet) becomes super admin.
#
# Returns: conversationId for deeplinks + auction bidding
#
# Requires: xmtp CLI initialized on production (`xmtp init`)

GROUP_NAME="${1:?Usage: basemate-create-group.sh <group_name> [description] [image_url]}"
DESCRIPTION="${2:-}"
IMAGE_URL="${3:-}"

# Basemate bot address — the agent that unlocks discovery
BASEMATE_ADDRESS="${BASEMATE_ADDRESS:-0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f}"

# Additional members to add (comma-separated addresses)
EXTRA_MEMBERS="${EXTRA_MEMBERS:-}"

echo "=== Creating Base App Group ==="
echo "Name: ${GROUP_NAME}"
[ -n "$DESCRIPTION" ] && echo "Description: ${DESCRIPTION}"
[ -n "$IMAGE_URL" ] && echo "Image: ${IMAGE_URL}"
echo ""

# Check for xmtp CLI
if ! command -v xmtp &>/dev/null; then
  echo "Error: xmtp CLI not found. Install: npm i -g @xmtp/cli"
  exit 1
fi

# Build member list (Basemate + any extra members)
MEMBERS=("$BASEMATE_ADDRESS")
if [ -n "$EXTRA_MEMBERS" ]; then
  IFS=',' read -ra EXTRA_ARRAY <<< "$EXTRA_MEMBERS"
  MEMBERS+=("${EXTRA_ARRAY[@]}")
fi

# Build flags
FLAGS=(--name "$GROUP_NAME" --json)
[ -n "$DESCRIPTION" ] && FLAGS+=(--description "$DESCRIPTION")
[ -n "$IMAGE_URL" ] && FLAGS+=(--image-url "$IMAGE_URL")

# Create group with Basemate + extra members
echo ">> Creating group with Basemate..."
CREATE_OUTPUT=$(xmtp conversations create-group "${MEMBERS[@]}" "${FLAGS[@]}" 2>&1 | grep -v "WARN CORE")

# Extract conversation ID from JSON output
GROUP_ID=$(echo "$CREATE_OUTPUT" | jq -r '.id // empty' 2>/dev/null || true)

if [ -z "$GROUP_ID" ]; then
  echo "$CREATE_OUTPUT"
  echo ""
  echo "❌ Could not extract group ID from output."
  exit 1
fi

# Send initial message — REQUIRED to trigger Basemate indexing
echo ">> Sending initial message to trigger Basemate indexing..."
xmtp conversation send-text "$GROUP_ID" "gm 🔗" 2>&1 | grep -v "WARN CORE" > /dev/null

echo ""
echo "✅ Group created and indexed!"
echo "   Name: ${GROUP_NAME}"
echo "   Conversation ID: ${GROUP_ID}"
echo "   Deeplink: cbwallet://messaging/${GROUP_ID}"
echo "   Members: creator (super admin) + Basemate + ${#MEMBERS[@]} total"
echo ""
echo "Next: bid on trending auction with this group"
echo "   basemate-bid.sh <bid_usdc> <max_usdc> \"${GROUP_NAME}\" \"description\" \"cbwallet://messaging/${GROUP_ID}\""

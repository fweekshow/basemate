#!/usr/bin/env bash
set -euo pipefail

# Basemate Send — send a message to an XMTP group
# Usage: basemate-send.sh <conversationId> <message>

CONVERSATION_ID="${1:?Usage: basemate-send.sh <conversationId> <message>}"
MESSAGE="${2:?Message text required}"

if ! command -v xmtp &>/dev/null; then
  echo "Error: xmtp CLI not found. Install: npm i -g @xmtp/cli"
  exit 1
fi

echo ">> Sending to ${CONVERSATION_ID}..."
xmtp conversation send-text "$CONVERSATION_ID" "$MESSAGE" 2>&1 | grep -v "WARN CORE"
echo "✅ Message sent"

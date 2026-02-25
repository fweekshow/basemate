#!/usr/bin/env bash
set -euo pipefail

# Basemate Bid — approve USDC and place a bid via placeBidSimple
# Usage: basemate-bid.sh <bid_usdc> <max_bid_usdc> "<name>" "<description>" "<link>"

BID_AMOUNT="${1:?Usage: basemate-bid.sh <bid_usdc> <max_bid_usdc> <name> <description> <link>}"
MAX_BID="${2:?Max bid required}"
NAME="${3:?Community name required}"
DESCRIPTION="${4:?Description required}"
LINK="${5:?Link required}"

CONTRACT="${BASEMATE_AUCTION_CONTRACT:?Set BASEMATE_AUCTION_CONTRACT}"
PRIVATE_KEY="${BASEMATE_PRIVATE_KEY:?Set BASEMATE_PRIVATE_KEY}"
RPC="${BASEMATE_RPC_URL:-https://mainnet.base.org}"
CHAIN="${BASEMATE_CHAIN:-mainnet}"

# USDC addresses
if [ "$CHAIN" = "testnet" ]; then
  USDC="0x036CbD53842c5426634e7929541eC2318f3dCF7e"
else
  USDC="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
fi

# Convert to 6-decimal raw amounts
BID_RAW=$(echo "${BID_AMOUNT} * 1000000" | bc | cut -d. -f1)
MAX_RAW=$(echo "${MAX_BID} * 1000000" | bc | cut -d. -f1)

echo "=== Placing Basemate Bid ==="
echo "Bid:     ${BID_AMOUNT} USDC (raw: ${BID_RAW})"
echo "Max Bid: ${MAX_BID} USDC (raw: ${MAX_RAW})"
echo "Name:    ${NAME}"
echo "Link:    ${LINK}"
echo "Chain:   ${CHAIN}"
echo ""

# Step 1: Approve USDC spending (approve max_bid amount)
echo ">> Approving ${MAX_BID} USDC for auction contract..."
APPROVE_TX=$(cast send "$USDC" \
  "approve(address,uint256)" \
  "$CONTRACT" "$MAX_RAW" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC" \
  --json 2>&1)

APPROVE_STATUS=$(echo "$APPROVE_TX" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
if [ "$APPROVE_STATUS" = "0x1" ] || [ "$APPROVE_STATUS" = "1" ]; then
  echo "   Approved ✓ (tx: $(echo "$APPROVE_TX" | jq -r '.transactionHash' 2>/dev/null))"
else
  echo "   Approval result: $APPROVE_TX"
fi
echo ""

# Step 2: Place bid via placeBidSimple
echo ">> Placing bid..."
BID_TX=$(cast send "$CONTRACT" \
  "placeBidSimple(uint256,uint256,string,string,string)" \
  "$MAX_RAW" "$BID_RAW" "$NAME" "$DESCRIPTION" "$LINK" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC" \
  --json 2>&1)

BID_STATUS=$(echo "$BID_TX" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
if [ "$BID_STATUS" = "0x1" ] || [ "$BID_STATUS" = "1" ]; then
  echo "   Bid placed ✓"
  echo "   TX: $(echo "$BID_TX" | jq -r '.transactionHash' 2>/dev/null)"
else
  echo "   Bid result: $BID_TX"
  exit 1
fi

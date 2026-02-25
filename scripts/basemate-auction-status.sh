#!/usr/bin/env bash
set -euo pipefail

# Basemate Auction Status — read-only query of current auction state
CONTRACT="${BASEMATE_AUCTION_CONTRACT:?Set BASEMATE_AUCTION_CONTRACT}"
RPC="${BASEMATE_RPC_URL:-https://mainnet.base.org}"

call() { cast call "$CONTRACT" "$1" --rpc-url "$RPC" 2>/dev/null; }
decode() { cast abi-decode "$1" "$2" 2>/dev/null; }

echo "=== Basemate Auction Status ==="
echo ""

# Current auction via getCurrentAuction()
RAW=$(call "getCurrentAuction()(uint256,uint256,uint256,uint256,address,string,string,bool,uint256,bool)")
# Parse the tuple output
AUCTION_ID=$(echo "$RAW" | sed -n '1p')
START_TIME=$(echo "$RAW" | sed -n '2p')
END_TIME=$(echo "$RAW" | sed -n '3p')
HIGHEST_BID_RAW=$(echo "$RAW" | sed -n '4p')
HIGHEST_BIDDER=$(echo "$RAW" | sed -n '5p')
COMMUNITY_NAME=$(echo "$RAW" | sed -n '6p')
COMMUNITY_LINK=$(echo "$RAW" | sed -n '7p')
FINALIZED=$(echo "$RAW" | sed -n '8p')
TOTAL_BIDS=$(echo "$RAW" | sed -n '9p')
PENDING=$(echo "$RAW" | sed -n '10p')

# Convert highest bid from raw (6 decimals) to USDC
HIGHEST_BID=$(echo "scale=6; ${HIGHEST_BID_RAW:-0} / 1000000" | bc 2>/dev/null || echo "0")

# Active status
IS_ACTIVE=$(call "isAuctionActive()(bool)")

# Time remaining
TIME_LEFT_RAW=$(call "getTimeRemaining()(uint256)")
TIME_LEFT=${TIME_LEFT_RAW:-0}
HOURS=$((TIME_LEFT / 3600))
MINS=$(( (TIME_LEFT % 3600) / 60 ))

# Minimum bid
MIN_BID_RAW=$(call "getMinimumBid()(uint256)")
MIN_BID=$(echo "scale=6; ${MIN_BID_RAW:-0} / 1000000" | bc 2>/dev/null || echo "0")

echo "Auction ID:       ${AUCTION_ID}"
echo "Active:           ${IS_ACTIVE}"
echo "Time Remaining:   ${HOURS}h ${MINS}m (${TIME_LEFT}s)"
echo "Highest Bid:      ${HIGHEST_BID} USDC"
echo "Highest Bidder:   ${HIGHEST_BIDDER}"
echo "Minimum Bid:      ${MIN_BID} USDC"
echo "Total Bids:       ${TOTAL_BIDS}"
echo "Finalized:        ${FINALIZED}"
echo "Pending Final:    ${PENDING}"
echo ""
echo "Leading Community: ${COMMUNITY_NAME}"
echo "Community Link:    ${COMMUNITY_LINK}"

# Featured community
echo ""
echo "=== Current Featured Community ==="
FEAT=$(call "getFeaturedCommunity()(address,uint256,string,string,string,uint256,uint256,bool)")
FEAT_WINNER=$(echo "$FEAT" | sed -n '1p')
FEAT_BID_RAW=$(echo "$FEAT" | sed -n '2p')
FEAT_BID=$(echo "scale=6; ${FEAT_BID_RAW:-0} / 1000000" | bc 2>/dev/null || echo "0")
FEAT_NAME=$(echo "$FEAT" | sed -n '3p')
FEAT_DESC=$(echo "$FEAT" | sed -n '4p')
FEAT_LINK=$(echo "$FEAT" | sed -n '5p')
FEAT_ACTIVE=$(echo "$FEAT" | sed -n '8p')

echo "Name:        ${FEAT_NAME}"
echo "Description: ${FEAT_DESC}"
echo "Link:        ${FEAT_LINK}"
echo "Winner:      ${FEAT_WINNER}"
echo "Winning Bid: ${FEAT_BID} USDC"
echo "Active:      ${FEAT_ACTIVE}"

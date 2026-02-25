# Basemate — How to Create a Group & Bid on Trending

This guide is for **any OpenClaw agent (molt agent)** that wants to:
1. Create a discoverable group on Base app
2. Bid on the daily trending auction to get featured

---

## Prerequisites

Before you start, you need:

| Requirement | How to Get It |
|---|---|
| **XMTP CLI** | `npm i -g @xmtp/cli` then `xmtp init --env production` |
| **Foundry (cast)** | `curl -L https://foundry.paradigm.xyz \| bash && foundryup` |
| **USDC on Base** | Fund your wallet with USDC on Base mainnet |
| **A wallet private key** | The same key used for `xmtp init`, or a separate funded wallet |

### Key Addresses

| Entity | Address |
|---|---|
| Basemate bot | `0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f` |
| Auction contract | `0xEec2f9560110e7BDBbd7ad7bfBe31d30891D9EFC` |
| USDC (Base mainnet) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

---

## Step 1: Create a Group with Basemate

Create an XMTP group and add Basemate as a member. This makes the group discoverable on Base app.

```bash
xmtp conversations create-group 0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f \
  --name "Your Community Name" \
  --description "What your community is about" \
  --json
```

**To add more members** (e.g. your own wallet or the group owner):
```bash
xmtp conversations create-group \
  0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f \
  0xYOUR_OTHER_MEMBER_ADDRESS \
  --name "Your Community Name" \
  --description "What your community is about" \
  --json
```

Save the `id` from the output — that's your **conversationId**.

### Important: Send a message to trigger indexing

Basemate only indexes the group once a message is sent. Without this, the group won't appear in discovery.

```bash
xmtp conversation send-text <conversationId> "gm 🔗"
```

### Rules
- **Do NOT put "test" in the group name** — Basemate filters these out
- A message **must** be sent after creation to trigger indexing
- The group needs **5+ members** to become fully discoverable (Basemate will tell you)
- The creator becomes **super admin** of the group

### Deeplink

Your group's Base app deeplink is:
```
cbwallet://messaging/<conversationId>
```

---

## Step 2: Check Auction Status

See the current auction state before bidding.

```bash
export PATH="$HOME/.foundry/bin:$PATH"

CONTRACT=0xEec2f9560110e7BDBbd7ad7bfBe31d30891D9EFC
RPC=https://mainnet.base.org

# Helper to strip cast's scientific notation output
clean() { echo "$1" | awk '{print $1}'; }

AUCTION_ID=$(clean "$(cast call $CONTRACT 'currentAuctionId()(uint256)' --rpc-url $RPC)")
IS_ACTIVE=$(clean "$(cast call $CONTRACT 'isAuctionActive()(bool)' --rpc-url $RPC)")
TIME_LEFT=$(clean "$(cast call $CONTRACT 'getTimeRemaining()(uint256)' --rpc-url $RPC)")
MIN_BID_RAW=$(clean "$(cast call $CONTRACT 'getMinimumBid()(uint256)' --rpc-url $RPC)")

echo "Auction #$AUCTION_ID | Active: $IS_ACTIVE"
echo "Time left: $((TIME_LEFT / 3600))h $(((TIME_LEFT % 3600) / 60))m"
echo "Minimum bid: $(echo "scale=2; $MIN_BID_RAW / 1000000" | bc) USDC"
```

### Auction Rules
- **Daily 24h auctions** ending at midnight Pacific (8 AM UTC)
- New auction starts automatically when the previous one finalizes
- Anyone can trigger finalization after midnight by interacting with the contract
- Winner gets the **Featured Community** slot for 24 hours

---

## Step 3: Place a Bid

Bidding requires two transactions: approve USDC spending, then place the bid.

```bash
export PATH="$HOME/.foundry/bin:$PATH"

PRIVATE_KEY="your_private_key_here"
CONTRACT=0xEec2f9560110e7BDBbd7ad7bfBe31d30891D9EFC
USDC=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
RPC=https://mainnet.base.org

# Your group details
COMMUNITY_NAME="Your Community Name"
COMMUNITY_DESC="What your community is about"
CONVERSATION_ID="your_conversation_id_here"
COMMUNITY_LINK="cbwallet://messaging/$CONVERSATION_ID"

# Bid amounts in USDC raw (6 decimals). 100000 = 0.10 USDC, 1000000 = 1.00 USDC
BID_AMOUNT=100000    # Your bid
MAX_BID=100000       # Max you're willing to pay (proxy bidding)

# Step 3a: Approve USDC spending
echo "Approving USDC..."
cast send $USDC \
  "approve(address,uint256)" $CONTRACT $MAX_BID \
  --private-key $PRIVATE_KEY --rpc-url $RPC

# Step 3b: Place bid
echo "Placing bid..."
cast send $CONTRACT \
  "placeBidSimple(uint256,uint256,string,string,string)" \
  $MAX_BID $BID_AMOUNT "$COMMUNITY_NAME" "$COMMUNITY_DESC" "$COMMUNITY_LINK" \
  --private-key $PRIVATE_KEY --rpc-url $RPC
```

### Bid Amounts (USDC has 6 decimals)

| USDC | Raw Value |
|------|-----------|
| 0.10 | 100000 |
| 0.50 | 500000 |
| 1.00 | 1000000 |
| 5.00 | 5000000 |
| 10.00 | 10000000 |

### Proxy Bidding

`MAX_BID` enables automatic outbidding. If you set `BID_AMOUNT=100000` and `MAX_BID=500000`:
- You start at 0.10 USDC
- If someone outbids you, the contract auto-raises your bid up to 0.50 USDC
- You only pay what's needed to stay in the lead

### Contributing to Someone Else's Bid

Pool funds with another bidder:
```bash
cast send $CONTRACT \
  "contributeToBid(address,uint256)" $LEADER_ADDRESS $AMOUNT \
  --private-key $PRIVATE_KEY --rpc-url $RPC
```

---

## Step 4: Verify Your Bid

Check if you're the current leader:

```bash
clean() { echo "$1" | awk '{print $1}'; }

RAW=$(cast call $CONTRACT \
  "getCurrentAuction()(uint256,uint256,uint256,uint256,address,string,string,bool,uint256,bool)" \
  --rpc-url $RPC)

HIGHEST_BID=$(clean "$(echo "$RAW" | sed -n '4p')")
LEADER=$(echo "$RAW" | sed -n '5p')
NAME=$(echo "$RAW" | sed -n '6p')

echo "Highest bid: $(echo "scale=2; $HIGHEST_BID / 1000000" | bc) USDC"
echo "Leader: $LEADER"
echo "Community: $NAME"
```

---

## Complete One-Shot Flow

If you have the basemate skill scripts installed, the entire flow is:

```bash
cd /path/to/skills/basemate

# Set environment
export BASEMATE_AUCTION_CONTRACT=0xEec2f9560110e7BDBbd7ad7bfBe31d30891D9EFC
export BASEMATE_PRIVATE_KEY=your_private_key
export BASEMATE_RPC_URL=https://mainnet.base.org

# 1. Create group (add extra members via EXTRA_MEMBERS env)
EXTRA_MEMBERS="0xYOUR_ADDRESS" ./scripts/basemate-create-group.sh "My Community" "Description"

# 2. Check auction
./scripts/basemate-auction-status.sh

# 3. Bid (bid_usdc max_usdc "name" "description" "link")
./scripts/basemate-bid.sh 0.10 0.50 "My Community" "Description" "cbwallet://messaging/<conversationId>"
```

---

## How It All Fits Together

```
┌─────────────────┐     ┌──────────────┐     ┌────────────────────┐
│  Your Agent     │     │   Basemate   │     │  Auction Contract  │
│  (OpenClaw)     │     │   (XMTP bot) │     │  (Base mainnet)    │
└────────┬────────┘     └──────┬───────┘     └────────┬───────────┘
         │                     │                      │
         │ 1. Create group     │                      │
         │    + add Basemate   │                      │
         ├────────────────────►│                      │
         │                     │                      │
         │ 2. Send message     │                      │
         ├────────────────────►│                      │
         │                     │ indexes group        │
         │                     │ in database           │
         │                     │                      │
         │ 3. Approve USDC    │                      │
         ├───────────────────────────────────────────►│
         │                     │                      │
         │ 4. Place bid        │                      │
         ├───────────────────────────────────────────►│
         │                     │                      │
         │              Winner gets featured          │
         │              for 24h with deeplink          │
         │              to their group                 │
         └─────────────────────────────────────────────┘
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `Addresses not found` | The address isn't registered on XMTP. They need to have used Base app or any XMTP client at least once. |
| `Failed to verify all installations` | Transient XMTP network issue. Retry after a few seconds. |
| Group not appearing in discovery | Did you send a message after creation? Is "test" in the name? Need 5+ members for full discovery. |
| `BidTooLow` | Your bid is below the minimum. Check `getMinimumBid()`. |
| `AuctionNotActive` | Auction ended. Call `triggerFinalization()` or wait for someone to interact. |
| `InsufficientBalance` | Fund your wallet with more USDC on Base. |
| USDC approval failed | Make sure you're approving the correct contract address and have enough USDC. |

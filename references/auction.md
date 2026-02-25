# Auction — Bid for #1 Trending Slot

The trending auction is a fully onchain smart contract on **Base Mainnet**. The winner's community gets the top trending slot in Base app.

## Contract Details

- **Chain:** Base Mainnet (chain ID 8453)
- **Auction Contract:** `0xEec2f9560110e7BDBbd7ad7bfBe31d30891D9EFC`
- **USDC (Base):** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

## Placing a Bid (Two Steps)

### 1. Approve USDC

```solidity
USDC.approve(0xEec2f9560110e7BDBbd7ad7bfBe31d30891D9EFC, bidAmount)
```

### 2. Place Bid

```solidity
placeBidSimple(
  uint256 bidAmount,      // USDC amount, 6 decimals (e.g. 5000000 = $5)
  uint256 maxAmount,      // same as bidAmount for exact bids
  string communityName,   // must match a group with Basemate in it
  string description,     // community description
  string link             // pass "" — agents should not set invite links
)
```

**Note:** `maxAmount` and `bidAmount` should be the same for exact bids. The `link` parameter is ignored by the leaderboard — it always uses the invite link from the database, so agents should pass `""`.

## Increase an Existing Bid

If you already have a bid in the current auction, add more USDC without re-entering community info:

```solidity
increaseBidSimple(uint256 additionalAmount)
```

Requires USDC approval for the additional amount first.

## Pooled Bidding (Contribute to Someone's Bid)

Multiple wallets can pool USDC behind one bidder:

```solidity
contributeToBid(
  address leader,       // address of the bid you're backing
  uint256 amount        // USDC amount to contribute (6 decimals)
)
```

Requires USDC approval. View contributors:

```solidity
getBidContributors(uint256 auctionId, address bidder)
  → (address[] contributors, uint256[] amounts)
```

## Reading Auction State

| Function | Returns |
|----------|---------|
| `currentAuctionId()` | Current auction number |
| `minimumBidPrice()` | Floor bid in USDC (6 decimals) |
| `bidIncrement()` | Min increment over current highest bid |
| `getAuctionBids(auctionId)` | All bids for a given auction |
| `getBidContributors(auctionId, bidder)` | Contributors + amounts for a pooled bid |
| `getEscrowBalance(bidder)` | Current USDC held in escrow for a bidder |
| `needsFinalization()` | Whether the previous auction needs finalizing |
| `getTimeRemaining()` | Seconds until auction ends |
| `getNextMidnightPacific()` | Timestamp of next auction rotation |
| `getTimeUntilMidnight()` | Seconds until next midnight PT |

## Finding Eligible Groups

Before bidding, query eligible groups to find valid community names:

```
GET https://devconnectarg-production.up.railway.app/api/groups/eligible
```

Returns all groups with Basemate as a member. The `communityName` in your bid should match a group here.

## Minimal ABI

```json
[
  {
    "name": "placeBidSimple",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      {"name": "bidAmount", "type": "uint256"},
      {"name": "maxAmount", "type": "uint256"},
      {"name": "communityName", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "link", "type": "string"}
    ],
    "outputs": []
  },
  {
    "name": "currentAuctionId",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}]
  },
  {
    "name": "minimumBidPrice",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}]
  },
  {
    "name": "bidIncrement",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}]
  },
  {
    "name": "getAuctionBids",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{"name": "auctionId", "type": "uint256"}],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "components": [
          {"name": "bidder", "type": "address"},
          {"name": "amount", "type": "uint256"},
          {"name": "communityName", "type": "string"},
          {"name": "description", "type": "string"},
          {"name": "link", "type": "string"}
        ]
      }
    ]
  },
  {
    "name": "needsFinalization",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"name": "", "type": "bool"}]
  },
  { "name": "increaseBidSimple", "type": "function", "stateMutability": "nonpayable", "inputs": [{"name": "additionalAmount", "type": "uint256"}], "outputs": [] },
  { "name": "contributeToBid", "type": "function", "stateMutability": "nonpayable", "inputs": [{"name": "leader", "type": "address"}, {"name": "amount", "type": "uint256"}], "outputs": [] },
  { "name": "getBidContributors", "type": "function", "stateMutability": "view", "inputs": [{"name": "auctionId", "type": "uint256"}, {"name": "bidder", "type": "address"}], "outputs": [{"name": "contributors", "type": "address[]"}, {"name": "amounts", "type": "uint256[]"}] },
  { "name": "getEscrowBalance", "type": "function", "stateMutability": "view", "inputs": [{"name": "bidder", "type": "address"}], "outputs": [{"type": "uint256"}] },
  { "name": "getTimeRemaining", "type": "function", "stateMutability": "view", "inputs": [], "outputs": [{"type": "uint256"}] },
  { "name": "getNextMidnightPacific", "type": "function", "stateMutability": "view", "inputs": [], "outputs": [{"type": "uint256"}] },
  { "name": "getTimeUntilMidnight", "type": "function", "stateMutability": "view", "inputs": [], "outputs": [{"type": "uint256"}] }
]
```

## Notes

- USDC on Base uses **6 decimals** — $5 = `5000000`, $1 = `1000000`
- No API proxy — agents call the contract directly on Base
- **Pass `""` for the `link` parameter** — the leaderboard ignores it and uses the DB invite link
- The group owner should set the invite link through the app UI

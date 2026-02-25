# Boost — Paid Discovery ($4.99/week)

Boosting a group activates paid discovery for 7 days.

## What Boost Gives You

- **+50 score boost** in the trending algorithm
- **`is_suggestable: true`** — agents recommend it, skip 5-member requirement
- **Top of Discovery feed** for the boost duration

## Agent Boost Flow (Two Steps)

### Step 1: Transfer $4.99 USDC to Treasury

Direct USDC transfer on Base Mainnet:

- **USDC Contract:** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (6 decimals)
- **Treasury Address:** `0xA189D38cf98A153Cfe83F42B82fcd9c3Cc805Fbe`
- **Amount:** `4990000` (= $4.99)

```solidity
USDC.transfer(0xd2d01aef95e4647e0139870a2030bf69a26f15cd, 4990000)
```

Wait for the transaction to confirm.

### Step 2: Verify with the API

```
POST https://devconnectarg-production.up.railway.app/api/group/boost/verify-tx
Content-Type: application/json

{
  "groupId": "<xmtp-group-id>",
  "txHash": "0x..."
}
```

The backend verifies on-chain that:
- The tx succeeded
- It contains a USDC transfer to the treasury
- Amount >= $4.99
- The tx hash hasn't been used before (replay protection)

**Response (200):**

```json
{
  "success": true,
  "groupId": "abc123",
  "groupName": "My Community",
  "expiresAt": "2026-03-02T...",
  "boostScore": 50,
  "payer": "0x...",
  "amountUsdc": 4.99
}
```

## Check Boost Status

```
GET https://devconnectarg-production.up.railway.app/api/group/:groupId/boost
```

Returns `{ paidDiscovery, expiresAt, boostScore }`.

## Boost vs Auction

- **Boost** = $4.99/week, guaranteed algorithmic ranking boost for 7 days
- **Auction** = onchain auction for the #1 trending slot. Competitive. See [auction.md](auction.md)

Both are optional. A group is discoverable just by having Basemate as a member.

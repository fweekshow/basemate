# API Reference

Base URL: `https://devconnectarg-production.up.railway.app`

All endpoints are public, no auth, JSON responses.

## Discovery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | Ranked Discovery feed (boosted first, then 6h-active, then fallback) |
| GET | `/api/groups/eligible` | All groups with Basemate (for bid group lookup) |

## Group-Specific (Read)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/group/:groupId/tags` | Interest tags for a group |
| GET | `/api/group/:groupId/boost` | Boost status (`paidDiscovery`, `expiresAt`, `boostScore`) |
| GET | `/api/group/:groupId/invite-link` | Invite link (read-only for agents) |

## Group Actions (Agent-writable)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/group/:groupId/tags` | Update interest tags `{ "tags": ["DeFi", "Gaming", ...] }` |
| POST | `/api/group/boost/verify-tx` | Activate boost with USDC tx proof `{ "groupId", "txHash" }` |

| POST | `/api/group/add-member` | Add a wallet address to a group `{ "groupId", "userWalletAddress" }` |

> **Invite links:** `PUT /api/group/:groupId/invite-link` exists but is **not for agents**. Only group owners set invite links through the app UI.

## Auction (Onchain)

Not through the API. Direct smart contract calls on Base Mainnet. See [auction.md](auction.md).

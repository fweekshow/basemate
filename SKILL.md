---
name: basemate
description: >
  Integrate with Basemate — the discovery layer for XMTP group chats on Base app.
  Use when: (1) creating an XMTP group and making it discoverable, (2) querying trending or all groups,
  (3) boosting a group for paid discovery, (4) bidding on the trending auction slot via smart contract,
  (5) managing group tags or invite links, (6) recommending groups to users based on interests.
  Triggers on: Base app groups, Basemate, trending communities, group discovery, auction bid, boost group,
  XMTP community, molt agent.
---

# Basemate — Group Discovery for XMTP on Base App

Basemate makes private XMTP groups **discoverable**. Add Basemate to your group → it gets indexed → users find it through trending, search, and quick actions in Base app.

## API

Base URL: `https://devconnectarg-production.up.railway.app`

All endpoints are **public, no auth required, JSON responses**.

## What You Can Do

| Action | Guide |
|--------|-------|
| **Set up your agent** | See [agent-setup.md](references/agent-setup.md) — generate wallet, keys, fund for auctions |
| **Discover groups** | See [discovery.md](references/discovery.md) — query ranked feed, filter by tags |
| **Create a group** | See [create-group.md](references/create-group.md) — XMTP group + Basemate + image + tags |
| **Boost a group** | See [boost.md](references/boost.md) — $4.99/week, transfer USDC + verify tx |
| **Bid on auction** | See [auction.md](references/auction.md) — onchain USDC bid for #1 trending slot |
| **Send content** | See [messaging.md](references/messaging.md) — text, markdown, attachments, deeplinks, miniapps |
| **Inline actions** | See [inline-actions.md](references/inline-actions.md) — interactive button menus (XIP-67) |
| **USDC transfers** | See [transactions.md](references/transactions.md) — in-chat payments via wallet_sendCalls |
| **Reactions** | See [reactions.md](references/reactions.md) — emoji reactions, thinking indicators |
| **Manage groups** | See [group-management.md](references/group-management.md) — update metadata, members, permissions |
| **Resolve domains** | See [domain-resolution.md](references/domain-resolution.md) — ENS, Basenames, Farcaster |
| **DM Basemate** | See [dm-basemate.md](references/dm-basemate.md) — direct message the bot |
| **@Mention handling** | See [mentions.md](references/mentions.md) — only respond when mentioned in groups |
| **User consent** | See [user-consent.md](references/user-consent.md) — spam-free messaging, deployment |
| **Full API reference** | See [api-reference.md](references/api-reference.md) — all endpoints |

## Quick Start (Agent Flow)

1. **Create group** with Basemate as member + set name, description, image (see create-group.md)
2. **Send a message** in the group to trigger Basemate indexing
3. **Set tags** — `PUT /api/group/:groupId/tags` with interest tags for matching
4. **Optional: Boost** — transfer $4.99 USDC to treasury, then `POST /api/group/boost/verify-tx`
5. **Optional: Auction** — approve USDC + call `placeBidSimple` on the auction contract

> **Agents cannot set invite links.** Only group owners set invite links through the Base app UI. When bidding on auctions, pass `""` for the link parameter.

## Recommending Groups to Users

Query `GET /api/groups` for the ranked Discovery feed (boosted first, then active, then fallback). Match group tags against conversation context to recommend relevant communities. Share deeplinks:

```
cbwallet://messaging/<conversationId>
```

## Key Addresses

- **Basemate inbox ID:** `91e5c2e39bcc8f553de3db2ce1a9d78f9f2b0bbc6c182653c086892b8048d647`
- **Basemate wallet:** `0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f`
- **Treasury (for boosts):** `0xA189D38cf98A153Cfe83F42B82fcd9c3Cc805Fbe`
- **Auction contract:** `0xEec2f9560110e7BDBbd7ad7bfBe31d30891D9EFC`
- **USDC (Base):** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

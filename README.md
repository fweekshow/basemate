# 🔗 Basemate

**The discovery layer for XMTP group chats on Base app.**

Basemate makes private XMTP groups **discoverable**. Add Basemate to your group → it gets indexed → users find it through trending, search, and quick actions in Base app.

```bash
npx basemate help
```

---

## Two Parts, One Toolkit

This package has two sides:

### 1. 🏗️ Build — Create & Manage XMTP Groups

Tools for creating and running group chats on Base app. This is the **XMTP messaging layer** — groups, messages, members, permissions.

### 2. 📈 Promote — Grow with Basemate Discovery

Tools for making your groups **findable**. This is the **Basemate layer** — trending feed, tags, paid boost, auction bidding.

---

## 🏗️ Build: XMTP Group Tools

Everything you need to create and manage group chats on Base app.

### Setup

```bash
# Generate your agent's XMTP wallet
npx basemate init

# Or manually
npm install -g @xmtp/cli
xmtp init --env production
```

> **Use `production` env** — groups on `dev` won't appear in Base app.

📖 [Full setup guide →](references/agent-setup.md)

### Create a Group

```bash
npx basemate create-group "My Community" "A group for builders" "https://img.com/avatar.png"
```

This creates an XMTP group, adds Basemate for discovery, and sends an initial message to trigger indexing.

📖 [Group creation guide →](references/create-group.md)

### Messaging

Agents can send rich content in groups — not just plain text:

| Content Type | Description |
|-------------|-------------|
| **Text** | `ctx.sendText("hello")` |
| **Markdown** | Headers, bold, code blocks, lists |
| **Replies** | Quote-reply to specific messages |
| **Attachments** | Images, files via encrypted remote upload |
| **Transactions** | USDC payment requests (wallet_sendCalls) |
| **Transaction Refs** | Share tx hashes as rich messages |
| **Reactions** | Emoji reactions + thinking indicators |
| **Inline Actions** | Interactive button menus (XIP-67) |
| **Deeplinks** | `cbwallet://messaging/<conversationId>` |
| **Miniapps** | Embedded miniapp frames |

📖 [Messaging guide →](references/messaging.md) · [Inline actions →](references/inline-actions.md) · [Transactions →](references/transactions.md) · [Reactions →](references/reactions.md)

### Group Management

| Action | Command |
|--------|---------|
| Update name | `xmtp conversation update-name <id> "New Name"` |
| Update image | `xmtp conversation update-image-url <id> "https://..."` |
| Add members | `xmtp conversation add-members <id> 0xADDRESS` |
| Remove members | `xmtp conversation remove-members <id> 0xADDRESS` |
| Set permissions | Custom policies per action (add/remove/update) |
| Manage admins | Grant/revoke admin and super admin roles |

Max group size: **250 members**. Creator is always **super admin**.

📖 [Group management guide →](references/group-management.md)

### @Mention Handling

Agents should only respond when `@mentioned` in groups — silent otherwise. Always respond in DMs.

📖 [Mentions guide →](references/mentions.md)

### Domain Resolution

Resolve human-readable names to wallet addresses:
- **ENS** — `vitalik.eth` → `0xd8dA...`
- **Basenames** — `name.base.eth` → `0x...`
- **Farcaster** — address → `@username`

📖 [Domain resolution guide →](references/domain-resolution.md)

---

## 📈 Promote: Basemate Discovery Tools

Once your group exists, use Basemate to make it **discoverable** and drive users to it.

### How Discovery Works

1. **Add Basemate** to your group (done automatically by `create-group`)
2. **Send a message** to trigger indexing
3. **Set tags** so users can find your group by interest
4. Your group appears in the **Discovery feed** in Base app
5. **Optional:** Boost or bid on auction for higher visibility

### Discovery Feed

```bash
# See all discoverable groups (ranked: boosted → active → fallback)
npx basemate groups

# See trending communities
npx basemate trending

# Get details on a specific group
npx basemate group-info <groupId>
```

📖 [Discovery guide →](references/discovery.md)

### Tags

Tag your group with interests so users and agents can match on topics:

```bash
# View tags
npx basemate tags <groupId>

# Set tags
npx basemate tags <groupId> defi,trading,base,nft
```

### Boost ($4.99/week)

Pay for guaranteed visibility in the discovery feed:

- **+50 score boost** in the trending algorithm
- **Top of Discovery feed** for 7 days
- **`is_suggestable: true`** — agents recommend it, skips 5-member requirement

**How:** Transfer $4.99 USDC to the treasury on Base → verify with the API.

```bash
# After sending USDC tx
npx basemate boost <groupId> <txHash>
```

📖 [Boost guide →](references/boost.md)

### Auction (Bid for #1 Trending)

Fully onchain smart contract on Base. Winner's community gets the **top trending slot**.

```bash
# Check current auction
npx basemate auction

# Place a bid ($5 USDC, $10 max)
npx basemate bid 5 10 "My Community" "Description" ""
```

Features:
- **Place bids** — `placeBidSimple` with USDC approval
- **Increase bids** — `increaseBidSimple` to add more USDC
- **Pooled bidding** — `contributeToBid` lets multiple wallets back one bid
- **Automatic refunds** when outbid
- **Auctions rotate at midnight PT**

📖 [Auction guide →](references/auction.md)

### DM Basemate

Agents can message Basemate directly for programmatic interaction:

```bash
xmtp send 0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f "Hello Basemate"
```

📖 [DM Basemate guide →](references/dm-basemate.md)

---

## API Reference

Base URL: `https://devconnectarg-production.up.railway.app` — all public, no auth.

### Discovery (Read)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | Ranked discovery feed |
| GET | `/api/groups/eligible` | All groups with Basemate |
| GET | `/api/group/:id/tags` | Interest tags |
| GET | `/api/group/:id/boost` | Boost status |
| GET | `/api/group/:id/invite-link` | Invite link (read-only) |

### Agent Actions (Write)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/group/:id/tags` | Update interest tags |
| POST | `/api/group/boost/verify-tx` | Activate boost with tx proof |
| POST | `/api/group/add-member` | Add wallet address to group |

### Onchain (Direct Contract)

| Function | Description |
|----------|-------------|
| `placeBidSimple` | Place auction bid |
| `increaseBidSimple` | Increase existing bid |
| `contributeToBid` | Pool USDC behind another bid |
| `getAuctionBids` | View all bids |
| `getFeaturedCommunity` | Current auction winner |

📖 [Full API reference →](references/api-reference.md)

---

## Key Addresses

| What | Address |
|------|---------|
| Basemate Wallet | `0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f` |
| Basemate Inbox ID | `91e5c2e39bcc8f553de3db2ce1a9d78f9f2b0bbc6c182653c086892b8048d647` |
| Treasury (Boosts) | `0xA189D38cf98A153Cfe83F42B82fcd9c3Cc805Fbe` |
| Auction Contract | `0xEec2f9560110e7BDBbd7ad7bfBe31d30891D9EFC` |
| USDC (Base) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

---

## Reference Docs

### Build (XMTP Groups)

| Doc | What it covers |
|-----|----------------|
| [agent-setup.md](references/agent-setup.md) | Generate wallet, keys, fund agent |
| [create-group.md](references/create-group.md) | Create XMTP group + Basemate indexing |
| [messaging.md](references/messaging.md) | Text, markdown, replies, attachments, deeplinks, miniapps |
| [inline-actions.md](references/inline-actions.md) | Interactive button menus (XIP-67) |
| [transactions.md](references/transactions.md) | In-chat USDC payments |
| [reactions.md](references/reactions.md) | Emoji reactions, thinking indicators |
| [group-management.md](references/group-management.md) | Metadata, members, permissions, roles |
| [mentions.md](references/mentions.md) | Only respond when @mentioned |
| [domain-resolution.md](references/domain-resolution.md) | ENS, Basenames, Farcaster |
| [user-consent.md](references/user-consent.md) | Spam-free messaging, deployment |

### Promote (Basemate Discovery)

| Doc | What it covers |
|-----|----------------|
| [discovery.md](references/discovery.md) | Browse ranked feed, filter by tags |
| [boost.md](references/boost.md) | $4.99/week paid discovery |
| [auction.md](references/auction.md) | Onchain USDC bidding for #1 trending |
| [dm-basemate.md](references/dm-basemate.md) | Direct message the bot |
| [api-reference.md](references/api-reference.md) | All REST endpoints |

---

## Environment Variables

```bash
# Required
XMTP_WALLET_KEY=0x...              # Agent private key
XMTP_DB_ENCRYPTION_KEY=...         # Database encryption
XMTP_ENV=production                # Must be "production" for Base app

# Optional (for CLI scripts)
BASEMATE_AUCTION_CONTRACT=0xEec... # Auction contract
BASEMATE_PRIVATE_KEY=0x...         # For bid/boost scripts
BASEMATE_RPC_URL=https://...       # Base RPC (default: mainnet.base.org)
```

## OpenClaw Skill

Also available as an [OpenClaw](https://docs.openclaw.ai) agent skill:

```bash
clawhub install basemate
```

## License

MIT

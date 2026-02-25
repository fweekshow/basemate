# 🔗 Basemate

**The discovery layer for XMTP group chats on Base app — now available to any agent.**

Basemate makes private XMTP groups **discoverable**. Add Basemate to your group → it gets indexed → users find it through trending, search, and quick actions in Base app.

This package provides everything an agent needs to create, discover, boost, and bid on XMTP group chats.

## Quick Start

```bash
# Install globally
npm install -g basemate-sdk

# Generate your agent's XMTP wallet
basemate init

# Create a discoverable group
basemate create-group "My Community" "A group for builders" "https://img.com/avatar.png"

# View all docs
basemate docs
```

## What Agents Can Do

| Feature | Description |
|---------|-------------|
| 🔍 **Discover** | Browse ranked feed, filter by tags, find trending communities |
| 🏗️ **Create Groups** | XMTP groups with Basemate auto-added for discovery |
| 💬 **Rich Messaging** | Text, markdown, replies, attachments, deeplinks, miniapps |
| 🔘 **Inline Actions** | Interactive button menus (XIP-67) |
| 💸 **USDC Transfers** | In-chat payments via wallet_sendCalls |
| 😊 **Reactions** | Emoji reactions + thinking indicators |
| ⚙️ **Group Management** | Update metadata, members, permissions, roles |
| 📈 **Boost** | $4.99/week paid discovery — +50 score for 7 days |
| 🏆 **Auction** | Onchain USDC bidding for #1 trending slot |
| 🏷️ **Tags** | Set interest tags for group matching |
| 🔗 **Domain Resolution** | ENS, Basenames, Farcaster lookups |
| 📩 **DM Basemate** | Direct message the bot programmatically |
| @️ **Mentions** | Only respond when @mentioned in groups |

## CLI

```
basemate <command> [options]

SETUP
  init                              Generate XMTP agent wallet + keys

DISCOVERY
  groups                            List all discoverable groups
  trending                          Show trending communities
  group-info <groupId>              Get group details, tags, boost status

GROUP MANAGEMENT
  create-group <name> [desc] [img]  Create group with Basemate
  tags <groupId> [tag1,tag2,...]    Get or set group tags
  send <conversationId> <message>   Send message to a group

MONETIZATION
  boost <groupId> <txHash>          Verify boost payment
  auction                           Show current auction status
  bid <amt> <max> <name> <desc> ""  Place auction bid

REFERENCE
  docs                              Print all skill documentation
```

## SDK (TypeScript)

```typescript
import {
  createGroup,
  addBasemate,
  placeBid,
  getAuctionStatus,
  createAndBid,
  parseUSDC,
  formatUSDC,
} from "basemate-sdk";

// Full flow: create group + bid in one call
const result = await createAndBid(xmtpClient, publicClient, walletClient, {
  groupName: "DeFi Builders",
  description: "Trading alpha on Base",
  bidAmount: "5.0",
  maxBid: "10.0",
  welcomeMessage: "Welcome! 🔗",
}, { chainId: 8453 });
```

## Reference Docs

| Doc | What it covers |
|-----|----------------|
| [agent-setup.md](references/agent-setup.md) | Generate wallet, keys, fund for auctions |
| [discovery.md](references/discovery.md) | Query ranked feed, filter by tags |
| [create-group.md](references/create-group.md) | Create XMTP group + Basemate indexing |
| [messaging.md](references/messaging.md) | Text, markdown, replies, attachments, deeplinks |
| [inline-actions.md](references/inline-actions.md) | Interactive button menus (XIP-67) |
| [transactions.md](references/transactions.md) | In-chat USDC payments |
| [reactions.md](references/reactions.md) | Emoji reactions, thinking indicators |
| [group-management.md](references/group-management.md) | Metadata, members, permissions, roles |
| [boost.md](references/boost.md) | $4.99/week paid discovery |
| [auction.md](references/auction.md) | Onchain USDC bidding for #1 trending |
| [domain-resolution.md](references/domain-resolution.md) | ENS, Basenames, Farcaster |
| [mentions.md](references/mentions.md) | Only respond when @mentioned |
| [dm-basemate.md](references/dm-basemate.md) | Direct message the bot |
| [user-consent.md](references/user-consent.md) | Spam-free messaging, deployment |
| [api-reference.md](references/api-reference.md) | All REST endpoints |

## Key Addresses

| What | Address |
|------|---------|
| Basemate Wallet | `0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f` |
| Basemate Inbox ID | `91e5c2e39bcc8f553de3db2ce1a9d78f9f2b0bbc6c182653c086892b8048d647` |
| Treasury (Boosts) | `0xA189D38cf98A153Cfe83F42B82fcd9c3Cc805Fbe` |
| Auction Contract | `0xEec2f9560110e7BDBbd7ad7bfBe31d30891D9EFC` |
| USDC (Base) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

## API

Base URL: `https://devconnectarg-production.up.railway.app`

All endpoints are public, no auth required.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | Ranked discovery feed |
| GET | `/api/groups/eligible` | All groups with Basemate |
| GET | `/api/group/:id/tags` | Interest tags |
| GET | `/api/group/:id/boost` | Boost status |
| GET | `/api/group/:id/invite-link` | Invite link (read-only) |
| PUT | `/api/group/:id/tags` | Update tags |
| POST | `/api/group/boost/verify-tx` | Activate boost |
| POST | `/api/group/add-member` | Add wallet to group |

## Environment Variables

```bash
XMTP_WALLET_KEY=0x...              # Agent private key
XMTP_DB_ENCRYPTION_KEY=...         # Database encryption
XMTP_ENV=production                # Must be "production" for Base app
BASEMATE_AUCTION_CONTRACT=0xEec... # Auction contract (optional, has default)
BASEMATE_PRIVATE_KEY=0x...         # For CLI bid/boost scripts
BASEMATE_RPC_URL=https://...       # Base RPC (default: mainnet.base.org)
```

## OpenClaw Skill

This package is also an [OpenClaw](https://docs.openclaw.ai) agent skill. Install via [ClawHub](https://clawhub.com):

```bash
clawhub install basemate
```

## License

MIT

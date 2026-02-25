# Agent Setup — Create Your XMTP Agent Wallet

Before an agent can create groups, send messages, or bid on auctions, it needs an XMTP identity. This is the first step.

## Option 1: XMTP CLI (Quickest)

```bash
# Install the CLI
npm install -g @xmtp/cli

# Generate a new wallet + encryption key + .env file
xmtp init

# Or for production (Base app visibility):
xmtp init --env production
```

This creates a `.env` file with:
```bash
XMTP_ENV=production
XMTP_WALLET_KEY=0x...          # Your agent's private key
XMTP_DB_ENCRYPTION_KEY=...     # Database encryption key
# public key is 0x...           # Your agent's wallet address
```

### Use an existing private key

If you already have a wallet:

```bash
xmtp init --private-key 0xYOUR_PRIVATE_KEY --env production
```

## Option 2: Generate Keys Programmatically

For agents that need to generate keys in code (e.g., during deployment):

```typescript
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { randomBytes } from "crypto";

// Generate wallet key
const walletKey = generatePrivateKey();
const account = privateKeyToAccount(walletKey);

// Generate encryption key (32 bytes hex)
const encryptionKey = randomBytes(32).toString("hex");

console.log(`XMTP_WALLET_KEY=${walletKey}`);
console.log(`XMTP_DB_ENCRYPTION_KEY=${encryptionKey}`);
console.log(`# Agent address: ${account.address}`);
```

Or use the gen:keys script pattern:

```bash
# If using the XMTP agent template
npm run gen:keys
```

This generates `WALLET_KEY` and `ENCRYPTION_KEY` and appends them to `.env`.

## Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `XMTP_WALLET_KEY` or `WALLET_KEY` | ✅ | Agent's private key (hex, `0x` prefix) |
| `XMTP_DB_ENCRYPTION_KEY` or `ENCRYPTION_KEY` | ✅ | Database encryption key |
| `XMTP_ENV` | ✅ | `production` for Base app, `dev` for testing |

> **Important:** Use `production` for Base app visibility. Groups created on `dev` won't appear in Base app.

## Option 3: Agent SDK Setup

For building a full XMTP agent (not just CLI usage):

```bash
npm install @xmtp/agent-sdk
```

```typescript
import { createAgent } from "@xmtp/agent-sdk";

const agent = await createAgent({
  walletKey: process.env.XMTP_WALLET_KEY,
  encryptionKey: process.env.XMTP_DB_ENCRYPTION_KEY,
  env: "production",
});

// Agent is now live on XMTP
console.log(`Agent address: ${agent.address}`);
console.log(`Agent inbox ID: ${agent.inboxId}`);
```

## Fund Your Agent (For Auctions & Boosts)

If your agent needs to bid on auctions or boost groups, it needs USDC on Base:

1. Get your agent's wallet address from the `.env` file
2. Send USDC (Base) to that address
3. Send a small amount of ETH (Base) for gas (~0.001 ETH is plenty)

**USDC on Base:** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

## Verify Setup

```bash
# Check your agent's identity
xmtp debug info

# Resolve your address
xmtp debug resolve 0xYOUR_AGENT_ADDRESS

# Test sending a message
xmtp send 0xSOME_ADDRESS "Hello from my agent"
```

## Security

- **Never commit `.env` files** to git
- Store `XMTP_WALLET_KEY` in a secret manager in production
- The private key controls both XMTP identity and any onchain funds
- Back up your key — losing it means losing your agent's identity and groups

## Next Steps

Once your agent is set up:
1. [Create a group](create-group.md) with Basemate for discovery
2. [Set tags](discovery.md) to help users find your group
3. [Bid on the auction](auction.md) for the #1 trending slot
4. [Send rich content](messaging.md) — buttons, transactions, reactions

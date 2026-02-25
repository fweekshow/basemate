# USDC Transfers — In-Chat Payments

Send USDC payment requests and handle transaction confirmations within XMTP group chats using EIP-5792 `wallet_sendCalls`.

## Supported Networks

| Network | Chain ID | USDC Address |
|---------|----------|--------------|
| Base Mainnet | 8453 | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Base Sepolia | 84532 | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

USDC uses **6 decimals** — $1 = `1000000`, $5 = `5000000`.

## Send USDC Transfer Request (SDK)

```typescript
import { validHex } from "@xmtp/agent-sdk";
import { toHex, encodeFunctionData } from "viem";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Encode transfer(to, amount) calldata
const data = encodeFunctionData({
  abi: [{
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  }],
  functionName: "transfer",
  args: [recipientAddress, BigInt(5000000)], // $5 USDC
});

const calls = {
  version: "1.0",
  from: validHex(senderAddress),
  chainId: toHex(8453), // Base mainnet
  calls: [{
    to: USDC_ADDRESS,
    data: validHex(data),
  }],
};

await ctx.conversation.sendWalletSendCalls(calls);
```

The user sees a transaction prompt in Base app and can approve/reject.

## Send via CLI

```bash
xmtp content transaction --group-id <conversationId> --amount 1.0
```

## Check USDC Balance

```typescript
import { createPublicClient, http, formatUnits } from "viem";
import { base } from "viem/chains";

const client = createPublicClient({ chain: base, transport: http() });

const balance = await client.readContract({
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  abi: [{
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  }],
  functionName: "balanceOf",
  args: [walletAddress],
});

console.log(`Balance: ${formatUnits(balance, 6)} USDC`);
```

## Handle Transaction Confirmations

When a user confirms a transaction, the agent receives a `transactionReference` content type:

```typescript
agent.on("message", async (ctx) => {
  if (ctx.message.contentType?.typeId === "transactionReference") {
    const txRef = ctx.message.content;
    console.log(`Transaction confirmed: ${txRef.transactionHash}`);
    await ctx.conversation.sendText("✅ Payment received!");
  }
});
```

## Use Cases for Basemate

- **Boost payments** — collect $4.99 USDC in-chat for group boost
- **Auction contributions** — pool USDC from group members for auction bids
- **Tipping** — let group members tip each other
- **Gated access** — require a payment to join premium groups

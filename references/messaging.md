# Messaging — Content Types in Groups

XMTP supports rich content types beyond plain text. All standard content types are built into the Agent SDK — no extra packages needed.

## Text

```typescript
await ctx.sendText("Hello group!");
```

CLI:
```bash
xmtp conversation send-text <conversationId> "Hello group!"
```

## Markdown

```typescript
const md = `## Welcome
This is **bold** with *italic* and \`code\`.
- Item 1
- Item 2`;

await ctx.conversation.sendMarkdown(md);
```

Supports headers, bold, italic, code blocks, lists, links, tables, blockquotes, horizontal rules.

## Replies (Quote Reply)

Reply to a specific message with context:

```typescript
import { encodeText } from "@xmtp/agent-sdk";

// Simple helper
await ctx.sendTextReply("I agree");

// Full reply object
await ctx.conversation.sendReply({
  content: encodeText("I agree"),
  reference: originalMessageId,
  referenceInboxId: ctx.message.senderInboxId,
});
```

Receiving replies:

```typescript
agent.on("reply", async (ctx) => {
  const reply = ctx.message.content;
  console.log(`Reply: ${reply.content}`);
  if (reply.inReplyTo) {
    console.log(`Original: ${reply.inReplyTo.content}`);
  }
});
```

## Attachments (Images, Files)

Remote attachments for files of any size. Encrypted, uploaded to storage (IPFS/Pinata), reference sent in message.

```typescript
// Send
await ctx.conversation.sendRemoteAttachment({
  url: "https://gateway.pinata.cloud/ipfs/Qm...",
  contentDigest: "...",
  salt: "...",
  nonce: "...",
  secret: "...",
  scheme: "https",
  filename: "image.png",
  contentLength: 12345,
});

// Receive
agent.on("attachment", async (ctx) => {
  // Handle attachment
});
```

Requires a storage provider (Pinata, Filebase, etc.) for the encrypted upload. See [XMTP attachment docs](https://docs.xmtp.org/agents/content-types/attachments).

## Transaction Requests (USDC)

See [transactions.md](transactions.md) for full details. Quick version:

```typescript
import { createERC20TransferCalls } from "@xmtp/agent-sdk";

const calls = createERC20TransferCalls(
  "base-mainnet", fromAddress, toAddress, 1000000 // $1 USDC
);
await ctx.conversation.sendWalletSendCalls(calls);
```

## Transaction References

Share an onchain transaction hash as a rich message:

```typescript
await ctx.conversation.sendTransactionReference({
  namespace: "eip155",
  networkId: 8453, // Base
  reference: "0xabc123...", // tx hash
  metadata: {
    transactionType: "transfer",
    currency: "USDC",
    amount: 5000000,
    decimals: 6,
    fromAddress: "0x...",
    toAddress: "0x...",
  },
});
```

## Deeplinks

```
cbwallet://messaging/<conversationId>
```

CLI:
```bash
xmtp content deeplink --group-id <conversationId>
```

## Miniapps

Embedded miniapp frames in messages:

```bash
xmtp content miniapp --group-id <conversationId>
```

## Group Updates (Stream)

Listen for group metadata changes in real-time:

```typescript
agent.on("group-update", async (ctx) => {
  const update = ctx.message.content;
  // update.metadataFieldChanges — name/description/image changes
  // update.addedInboxes — new members
  // update.initiatedByInboxId — who triggered it
});
```

## Delete Messages

Senders can delete their own messages. Super admins can delete any message.

```typescript
await conversation.removeMessage(messageId);
```

Cannot delete: group membership changes, group update messages.

## Disappearing Messages

Set messages to auto-expire after a duration:

```typescript
// Set 30-minute disappearing messages (super admin / DM participants only)
await group.updateDisappearingMessageSettings({
  disappearStartingAtNs: Date.now() * 1_000_000,
  retentionDurationInNs: 30 * 60 * 1_000_000_000, // 30 min in nanoseconds
});
```

## Event Handlers Summary

```typescript
agent.on("text", async (ctx) => { /* plain text */ });
agent.on("reaction", async (ctx) => { /* emoji reaction */ });
agent.on("reply", async (ctx) => { /* quote reply */ });
agent.on("attachment", async (ctx) => { /* file/image */ });
agent.on("group-update", async (ctx) => { /* metadata change */ });
agent.on("unknownMessage", async (ctx) => { /* unrecognized type */ });
```

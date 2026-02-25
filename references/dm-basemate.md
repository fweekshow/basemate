# DM Basemate — Direct Message the Bot

Agents can DM Basemate directly for programmatic interaction outside of group chats.

## Basemate Addresses

- **Wallet:** `0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f`
- **Inbox ID:** `91e5c2e39bcc8f553de3db2ce1a9d78f9f2b0bbc6c182653c086892b8048d647`

## Send a DM via CLI

```bash
# Create a DM conversation with Basemate
xmtp conversations create-dm 0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f

# Send a message
xmtp send 0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f "Hello Basemate"
```

## Send a DM via SDK

```typescript
// Create or get existing DM conversation
const dm = await client.conversations.newDm(
  "0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f"
);

// Send message
await dm.send("Hello Basemate");

// Listen for responses
await dm.stream(async (message) => {
  console.log(`Basemate: ${message.content}`);
});
```

## Deeplink to DM Basemate

Open a DM with Basemate in Base app:

```
cbwallet://messaging/0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f
```

## What Basemate Responds To

Basemate is primarily a **passive indexer** — it joins groups to index them for discovery. In DMs, Basemate may:

- Confirm group indexing status
- Provide trending community info
- Share quick actions / group recommendations

## Agent-to-Agent Communication

For agent-to-agent flows (e.g., a "molt agent" coordinating with Basemate):

```typescript
// Your agent sends a structured message to Basemate
await dm.send(JSON.stringify({
  action: "check-indexing",
  groupId: "abc123",
}));
```

> **Note:** Basemate's DM responses depend on the current bot implementation. For reliable programmatic access, prefer the REST API endpoints documented in [api-reference.md](api-reference.md).

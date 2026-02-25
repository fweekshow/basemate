# Domain Resolution — ENS, Basenames, Farcaster

Resolve human-readable names to wallet addresses and look up social profiles.

## ENS Resolution

Resolve `.eth` names to addresses:

```typescript
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// Name → Address
const address = await client.getEnsAddress({
  name: normalize("vitalik.eth"),
});
// "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"

// Address → Name (reverse)
const name = await client.getEnsName({
  address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
});
// "vitalik.eth"
```

## Basenames (Base ENS)

Basenames are ENS names on Base (`.base.eth`). Same resolution pattern, but use Base chain:

```typescript
import { base } from "viem/chains";

const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

const address = await baseClient.getEnsAddress({
  name: normalize("myname.base.eth"),
  universalResolverAddress: "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD",
});
```

## Farcaster Lookups

Look up Farcaster profiles by address using the Neynar API:

```typescript
const lookupFarcaster = async (address: string) => {
  const res = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
    { headers: { api_key: process.env.NEYNAR_API_KEY || "NEYNAR_API_DOCS" } }
  );
  const data = await res.json();
  return data[address.toLowerCase()]?.[0];
};

const profile = await lookupFarcaster("0x1234...");
console.log(`Farcaster: @${profile?.username} (FID: ${profile?.fid})`);
```

## Extract Mentions from Messages

Parse `@username` mentions in group chat messages:

```typescript
const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+(?:\.\w+)*)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
};

// "@vitalik.eth sent 5 USDC to @jesse.base.eth"
// → ["vitalik.eth", "jesse.base.eth"]
```

## Resolve in Agent Context

```typescript
import { resolveAddress } from "@xmtp/agent-sdk";

agent.on("message", async (ctx) => {
  const mentions = extractMentions(ctx.message.content);

  for (const mention of mentions) {
    if (mention.endsWith(".eth") || mention.endsWith(".base.eth")) {
      const address = await resolveAddress(mention);
      if (address) {
        console.log(`${mention} → ${address}`);
      }
    }
  }
});
```

## Use Cases for Basemate

- **Resolve group member names** — show Basenames/ENS instead of raw addresses
- **Mention-based invites** — `@name.base.eth` auto-resolves and invites to group
- **Farcaster integration** — show Farcaster profiles for group members
- **Auction bidder lookup** — resolve bidder addresses to human-readable names

# Reactions — Emoji Responses & Thinking Indicators

React to messages with emoji and show processing state with thinking indicators.

## Send a Reaction (SDK)

```typescript
// Simple helper
await ctx.sendReaction("❤️");

// With all fields
import { ReactionAction, ReactionSchema, type Reaction } from "@xmtp/agent-sdk";

const reaction: Reaction = {
  reference: ctx.message.id,
  referenceInboxId: ctx.message.senderInboxId, // Optional: who sent the original
  action: ReactionAction.Added,
  content: "🔥",
  schema: ReactionSchema.Unicode,
};
await ctx.conversation.sendReaction(reaction);
```

## Remove a Reaction

```typescript
await ctx.conversation.sendReaction({
  reference: ctx.message.id,
  action: "removed",
  schema: "unicode",
  content: "🔥",
});
```

## Thinking Indicator Pattern

Show a ⏳ while processing, then replace with ✅ when done:

```typescript
// Show thinking
await ctx.conversation.sendReaction({
  reference: ctx.message.id,
  action: "added",
  schema: "unicode",
  content: "⏳",
});

// Do the work...
const result = await doSomethingExpensive();

// Remove thinking
await ctx.conversation.sendReaction({
  reference: ctx.message.id,
  action: "removed",
  schema: "unicode",
  content: "⏳",
});

// Show done
await ctx.conversation.sendReaction({
  reference: ctx.message.id,
  action: "added",
  schema: "unicode",
  content: "✅",
});
```

## Receive Reactions

```typescript
agent.on("message", async (ctx) => {
  if (ctx.message.contentType?.typeId === "reaction") {
    const reaction = ctx.message.content;
    console.log(`${reaction.content} reaction ${reaction.action} on message ${reaction.reference}`);
  }
});
```

## Common Reactions for Agents

| Emoji | Meaning |
|-------|---------|
| ⏳ | Processing / thinking |
| ✅ | Done / success |
| ❌ | Error / failed |
| 👀 | Acknowledged / looking into it |
| 🔥 | Great / popular |
| 👍 | Confirmed |
| 🎉 | Celebration (bid won, group created) |

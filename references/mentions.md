# Mentions — Only Reply When @Mentioned in Groups

Agents in group chats should only respond when directly mentioned with `@`. This prevents noise and respects the group conversation flow.

## Mention Detection

```typescript
// Configure your agent's mention handles
const MENTION_HANDLES = ["basemate", "basemate.base.eth"];

// Build regex for flexible matching (handles @basemate, @ basemate, etc.)
const createMentionRegex = (handles: string[]): RegExp => {
  const alternatives = handles.map(h => h.trim()).join("|");
  return new RegExp(`(^|\\s)@\\s*(?:${alternatives})\\b`, "i");
};

const mentionRegex = createMentionRegex(MENTION_HANDLES);

// Check if a message mentions the agent
const isMentioned = (text: string): boolean => mentionRegex.test(text);

// Strip the mention from the message to get the actual query
const removeMention = (text: string): string =>
  text.replace(mentionRegex, " ").trim();
```

## Agent Message Handler

```typescript
import { filter } from "@xmtp/agent-sdk";

agent.on("message", async (ctx) => {
  // Skip messages from self
  if (ctx.message.senderInboxId === agent.inboxId) return;

  const text = typeof ctx.message.content === "string" ? ctx.message.content : "";

  // In groups: only respond if mentioned
  const isGroup = ctx.conversation.members && ctx.conversation.members.length > 2;
  if (isGroup && !isMentioned(text)) return;

  // Strip the @mention and process the actual message
  const query = isGroup ? removeMention(text) : text;

  // Handle the query...
  await ctx.sendText(`You asked: ${query}`);
});
```

## DMs vs Groups

| Context | Behavior |
|---------|----------|
| **DM** | Always respond — user messaged you directly |
| **Group** | Only respond when `@mentioned` |

## Environment Variable Pattern

Make mention handles configurable:

```bash
# .env
MENTION_HANDLES=basemate,basemate.base.eth,@basemate
```

```typescript
const handles = (process.env.MENTION_HANDLES || "basemate")
  .split(",")
  .map(h => h.trim());
```

## Notes

- Match is case-insensitive (`@Basemate` = `@basemate`)
- Handles optional space after `@` (`@ basemate` works)
- Supports basename format (`@basemate.base.eth`)
- Always respond to DMs regardless of mention
- Strip the mention before processing so "@ basemate what's trending" becomes "what's trending"

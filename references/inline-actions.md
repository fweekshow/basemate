# Inline Actions — Interactive Buttons in Groups (XIP-67)

Send interactive button menus in XMTP group chats. Users tap buttons instead of typing commands.

## How It Works

1. Agent sends an **actions message** with button options
2. User taps a button in Base app
3. Agent receives an **intent message** with the selected action ID
4. Agent handles the action and responds

## Setup — Action Registry + Middleware

```typescript
import type { AgentMiddleware, MessageContext } from "@xmtp/agent-sdk";
import type { Intent } from "@xmtp/node-sdk";

// Action handler registry
type ActionHandler = (ctx: MessageContext) => Promise<void>;
const actionHandlers = new Map<string, ActionHandler>();

const registerAction = (id: string, handler: ActionHandler) => {
  actionHandlers.set(id, handler);
};

// Middleware to intercept intent messages (button taps)
const inlineActionsMiddleware: AgentMiddleware = async (ctx, next) => {
  if (ctx.message.contentType?.typeId === "intent") {
    const intent = ctx.message.content as Intent;
    const handler = actionHandlers.get(intent.actionId);
    if (handler) await handler(ctx);
    else await ctx.conversation.sendText(`Unknown action: ${intent.actionId}`);
    return;
  }
  await next();
};

// Register middleware
agent.use(inlineActionsMiddleware);
```

## ActionBuilder — Create Button Menus

```typescript
import { ActionStyle } from "@xmtp/node-sdk";

class ActionBuilder {
  private actions: { id: string; label: string; style?: ActionStyle }[] = [];
  constructor(private id: string, private description: string) {}

  static create(id: string, description: string) {
    return new ActionBuilder(id, description);
  }

  add(id: string, label: string, style?: ActionStyle) {
    this.actions.push({ id, label, style });
    return this;
  }

  async send(ctx: MessageContext) {
    await ctx.conversation.sendActions({
      id: this.id,
      description: this.description,
      actions: this.actions,
    });
  }
}
```

## Examples

### Main Menu

```typescript
registerAction("discover", async (ctx) => {
  // Fetch and show trending groups
  const groups = await fetch("https://devconnectarg-production.up.railway.app/api/groups").then(r => r.json());
  await ctx.conversation.sendText(`Top groups:\n${groups.slice(0, 5).map(g => `• ${g.name}`).join("\n")}`);
});

registerAction("my-groups", async (ctx) => {
  await ctx.conversation.sendText("Here are your groups...");
});

// Send menu
await ActionBuilder.create("main-menu", "What would you like to do?")
  .add("discover", "🔍 Discover Groups")
  .add("my-groups", "👥 My Groups")
  .add("auction-status", "🏆 Auction Status")
  .send(ctx);
```

### Confirmation Dialog

```typescript
const sendConfirmation = async (
  ctx: MessageContext,
  message: string,
  onYes: ActionHandler,
  onNo?: ActionHandler
) => {
  const ts = Date.now();
  registerAction(`yes-${ts}`, onYes);
  registerAction(`no-${ts}`, onNo || (async (c) => c.conversation.sendText("Cancelled")));

  await ActionBuilder.create(`confirm-${ts}`, message)
    .add(`yes-${ts}`, "✅ Yes")
    .add(`no-${ts}`, "❌ No", ActionStyle.Danger)
    .send(ctx);
};

// Usage
await sendConfirmation(ctx, "Place a $5 bid on the auction?", async (ctx) => {
  // Execute bid logic
  await ctx.conversation.sendText("Bid placed!");
});
```

### Selection Menu

```typescript
const groups = ["DeFi Builders", "NFT Collectors", "Base Devs"];

const builder = ActionBuilder.create("pick-group", "Which group to boost?");
groups.forEach((name, i) => builder.add(`boost-${i}`, name));
await builder.send(ctx);
```

## Actions Content Type (Official)

The official XMTP Actions content type:

```typescript
import { type Actions, ActionStyle } from "@xmtp/agent-sdk";

const actions: Actions = {
  id: "action-123",
  description: "Would you like to proceed?",
  expiresAt: new Date(Date.now() + 3600000).toISOString(), // Optional: 1h expiry
  actions: [
    { id: "confirm", label: "✅ Confirm", style: "primary" },
    { id: "cancel", label: "❌ Cancel", style: "danger" },
    { id: "info", label: "ℹ️ More Info", style: "secondary", imageUrl: "https://..." },
  ],
};
await ctx.conversation.sendActions(actions);
```

Each action can have: `id`, `label`, `imageUrl` (optional), `style` (`primary` | `secondary` | `danger`), `expiresAt` (optional). Max 10 actions per message.

## Intents (User Responses)

When a user taps a button, an **intent** message is sent:

```typescript
// The intent received when user taps a button
{
  id: "intent-456",
  actionId: "confirm",     // Which button they tapped
  metadata: { ... }        // Optional extra data (max 10KB)
}
```

Handle intents:

```typescript
agent.on("message", async (ctx) => {
  if (ctx.message.contentType?.typeId === "intent") {
    const intent = ctx.message.content;
    const handler = actionHandlers.get(intent.actionId);
    if (handler) await handler(ctx);
  }
});
```

## Notes

- Buttons render natively in Base app
- Each action needs a unique ID
- Use styles: `primary` (default), `secondary`, `danger` (red)
- Register handlers **before** sending the menu
- Max 10 actions per message
- Optional `expiresAt` for time-limited actions

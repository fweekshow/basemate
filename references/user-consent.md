# User Consent — Spam-Free Messaging

XMTP has a built-in consent system that determines whether messages land in a user's inbox or get filtered as spam. Agents must understand this to ensure their messages are seen.

## How It Works

Every identity on XMTP has one of three consent states relative to another identity:

| State | Meaning |
|-------|---------|
| **Unknown** | Not yet decided — message shows in "Requests" |
| **Allowed** | Accepted — messages show in main inbox |
| **Denied** | Blocked — messages are hidden |

## What This Means for Agents

When your agent sends a DM to someone for the first time:
1. The message lands in their **message requests** (unknown state)
2. The user can **Accept** (allowed) or **Block** (denied)
3. Only after accepting do your messages appear in their main inbox

**In groups:** If a user is added to a group, they see the group in requests until they accept it.

## Best Practices for Agents

- **Don't spam.** Users who block you can't be reached again.
- **Provide value first.** Your initial message should clearly explain what the agent does.
- **Label clearly.** Identify yourself as an agent — don't impersonate humans.
- **Groups over DMs.** Users who join a group have implicitly consented to messages in that group.

## Security Best Practices (from XMTP docs)

- **Never expose private keys** — use environment variables
- **Keep messages secure** — don't log plaintext messages, don't share with third parties
- **Label agents clearly** — don't impersonate humans

## Deployment

XMTP agents are tested on **Ubuntu** distributions. Deploy to:
- **Railway** (recommended, easy setup)
- Fly.io, Heroku, Render

Key requirements:
- **Persistent volume** — XMTP needs a local SQLite database
- **Environment variables** — `XMTP_WALLET_KEY`, `XMTP_DB_ENCRYPTION_KEY`, `XMTP_ENV`
- **Node.js 18+**

See [agent-setup.md](agent-setup.md) for full setup details.

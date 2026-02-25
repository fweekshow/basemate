# Group Management — Metadata, Members, Permissions

After creating a group, agents can manage metadata, members, and permissions. The creator is always **super admin**.

## Update Group Metadata

```bash
xmtp conversation update-name <conversationId> "New Name"
xmtp conversation update-description <conversationId> "New description"
xmtp conversation update-image-url <conversationId> "https://example.com/avatar.png"
```

## Members

### Add Members

Max group size: **250 members**.

```bash
xmtp conversation add-members <conversationId> 0xADDRESS1 0xADDRESS2
```

Via SDK:
```typescript
await group.addMembers([inboxId1, inboxId2]);
// or by identity (wallet address)
await group.addMembersByIdentity([identity1, identity2]);
```

### Remove Members

```bash
xmtp conversation remove-members <conversationId> 0xMEMBER_ADDRESS
```

> **Warning:** Don't remove Basemate (`0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f`) — this disables discovery.

### List Members

```bash
xmtp conversation list-members <conversationId>
```

```typescript
await group.sync();
const members = await group.members();
```

### Leave a Group

```typescript
await group.leaveGroup();
await group.sync();
const isActive = await group.isActive(); // false
```

> Super admins **cannot** leave their own group.

## Permissions System

### Member Roles

| Role | Description |
|------|-------------|
| **Member** | Default. Can send messages. |
| **Admin** | Can add/remove members, update metadata (depending on policy). |
| **Super Admin** | The creator. Can do everything including updating permissions. |

### Default Permission Policy (`All_Members`)

| Permission | Default |
|------------|---------|
| Add member | All members |
| Remove member | Admin only |
| Add admin | Super admin only |
| Remove admin | Super admin only |
| Update permissions | Super admin only |
| Update metadata (name, desc, image) | All members |

### Custom Permissions on Group Creation

```typescript
const customPermissions = {
  addMemberPolicy: "admin",        // "allow" | "deny" | "admin" | "super_admin"
  removeMemberPolicy: "admin",
  addAdminPolicy: "super_admin",
  removeAdminPolicy: "super_admin",
  updateGroupNamePolicy: "allow",
  updateGroupDescriptionPolicy: "allow",
  updateGroupImagePolicy: "admin",
};

const group = await client.conversations.newGroupCustomPermissions(
  [memberInboxId1, memberInboxId2],
  customPermissions,
  { name: "My Group", description: "Custom permissions" }
);
```

### Update Permissions (Super Admin Only)

```typescript
await group.updateAddMemberPermission("admin");
await group.updateRemoveMemberPermission("admin");
await group.updateNamePermission("allow");
await group.updateDescriptionPermission("admin");
await group.updateImageUrlPermission("admin");
await group.updateAddAdminPermission("super_admin");
await group.updateRemoveAdminPermission("super_admin");
```

### Permission Options

| Option | Who can act |
|--------|-------------|
| `allow` | All members |
| `deny` | No one |
| `admin` | Admins + super admins |
| `super_admin` | Super admins only |

### Manage Admins

```typescript
// Check roles
const isAdmin = group.isAdmin(inboxId);
const isSuperAdmin = group.isSuperAdmin(inboxId);

// List
const admins = await group.listAdmins();
const superAdmins = await group.listSuperAdmins();

// Grant/revoke
await group.addAdmin(inboxId);
await group.addSuperAdmin(inboxId);
await group.removeAdmin(inboxId);
await group.removeSuperAdmin(inboxId);
```

### Get Group Info

```typescript
// Who created this group?
const creatorInboxId = await group.creatorInboxId();
const isCreator = group.isCreator();

// Who added me?
const addedBy = group.addedByInboxId;

// Current permission policy
const policySet = await group.permissionPolicySet();
console.log("Add member policy:", policySet.addMemberPolicy);
```

## Tags (via Basemate API)

Get:
```bash
curl https://devconnectarg-production.up.railway.app/api/group/<groupId>/tags
```

Set:
```bash
curl -X PUT https://devconnectarg-production.up.railway.app/api/group/<groupId>/tags \
  -H "Content-Type: application/json" \
  -d '{"tags": ["defi", "nft", "gaming"]}'
```

## Sync

```bash
xmtp sync all
xmtp sync conversations
```

## Check Discovery Status

```bash
curl https://devconnectarg-production.up.railway.app/api/groups | \
  jq '.[] | select(.groupId == "<groupId>")'
```

## CLI Permissions

```bash
xmtp permissions info <conversationId>
xmtp permissions list <conversationId>
```

# Create a Discoverable Group

## Step 1: Create XMTP Group with Basemate

Use the XMTP CLI (see `xmtp-cli` skill):

```bash
xmtp conversations create-group 0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f \
  --name "<GROUP_NAME>" --description "<DESCRIPTION>" \
  --image-url "<IMAGE_URL>"
```

Add more members by listing additional addresses:

```bash
xmtp conversations create-group 0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f 0xMEMBER1 0xMEMBER2 \
  --name "<GROUP_NAME>" --description "<DESCRIPTION>" \
  --image-url "<IMAGE_URL>"
```

Save the **id** (conversationId) from the output.

**Image:** Provide a publicly accessible URL (IPFS, Cloudinary, etc.). This is the group avatar shown in Base app.

## Step 2: Send Welcome Message

```bash
xmtp conversation send-text <conversationId> "Welcome to <GROUP_NAME>! 🔗"
```

## Step 3: Wait for Indexing

Basemate indexes the group after it detects a message. Until indexed, the group won't appear in `/api/groups` and tag PUTs won't persist. Flow:

1. Create group → ✅
2. Add Basemate as a member → ✅ (done in step 1 above)
3. Send a message in the group → Basemate sees it and indexes the group
4. Group appears in `/api/groups` → now tag PUTs will stick

## Step 4: Set Tags

After the group is indexed:

```bash
curl -X PUT https://devconnectarg-production.up.railway.app/api/group/<groupId>/tags \
  -H "Content-Type: application/json" \
  -d '{"tags": ["defi", "trading", "base"]}'
```

## Done

The group is now discoverable. Users can join via deeplink:

```
cbwallet://messaging/<conversationId>
```

## Update Group Later

```bash
xmtp conversation update-image-url <conversationId> "<NEW_IMAGE_URL>"
xmtp conversation update-name <conversationId> "<NEW_NAME>"
xmtp conversation update-description <conversationId> "<NEW_DESC>"
```

> **Note:** Agents cannot set invite links. Only group owners can set invite links through the Base app UI.

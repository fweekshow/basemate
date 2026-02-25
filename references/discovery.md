# Discovery — Find Groups

Base URL: `https://devconnectarg-production.up.railway.app`

## Get Discovery Feed

```
GET /api/groups
```

Returns ranked groups: boosted first, then 6h-active, then fallback algorithm. Each group includes name, description, topics, member/message counts, owner wallet, basename, and score.

## Get Eligible Groups (for Auction)

```
GET /api/groups/eligible
```

Returns all groups with Basemate as a member. Use this to find valid communities to bid on in the auction.

## Get Group Tags

```
GET /api/group/:groupId/tags
```

Returns `{ manual: [...], ai: [...] }` — manual tags set by owner/agent, AI-generated tags from group content.

## Set Group Tags

```
PUT /api/group/:groupId/tags
Content-Type: application/json

{"tags": ["DeFi", "Gaming", "NFTs"]}
```

## Get Group Invite Link

```
GET /api/group/:groupId/invite-link
```

Returns the invite link for a group (read-only for agents).

## Check Boost Status

```
GET /api/group/:groupId/boost
```

Returns `{ paidDiscovery, expiresAt, boostScore }`.

## Recommending Groups

1. Fetch the Discovery feed (`GET /api/groups`)
2. Match group tags/topics against user interests or conversation context
3. Share the deeplink: `cbwallet://messaging/<conversationId>`

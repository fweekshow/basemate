/**
 * XMTP Group Management Functions
 * 
 * Functions for creating groups, adding Basemate, and managing members
 */

import type { 
  XMTPClient, 
  CreateGroupParams, 
  GroupCreationResult,
  InviteToGroupParams,
  SendWelcomeParams,
  SDKError 
} from './types.js';
import { BASEMATE, getGroupDeeplink } from './constants.js';

/**
 * Create a new XMTP group with Basemate automatically added
 * 
 * @param client - XMTP client instance
 * @param params - Group creation parameters
 * @returns Promise resolving to group creation result
 * 
 * @example
 * ```typescript
 * const result = await createGroup(xmtpClient, {
 *   name: "My Community",
 *   description: "A place for discussion",
 *   memberInboxIds: ["inbox1", "inbox2"]
 * });
 * console.log(`Created group: ${result.deeplink}`);
 * ```
 */
export async function createGroup(
  client: XMTPClient,
  params: CreateGroupParams
): Promise<GroupCreationResult> {
  try {
    if (!client) {
      throw createSDKError('XMTP_CLIENT_ERROR', 'XMTP client is required');
    }

    const { name, description, imageUrl, memberInboxIds = [] } = params;

    // Step 1: Create the XMTP group with initial members
    // Note: The creating agent is automatically added as a member
    console.log(`🎯 Creating XMTP group "${name}" with ${memberInboxIds.length} initial members`);
    
    const group = await client.conversations.newGroup(memberInboxIds);
    const groupId = group.id;
    
    console.log(`✅ Created XMTP group: ${groupId}`);

    // Step 2: Set the group name
    try {
      await (group as any).updateName(name);
      console.log(`✅ Set group name: "${name}"`);
    } catch (nameError: any) {
      console.warn(`⚠️ Could not set group name: ${nameError.message}`);
      // Continue anyway - the group still works
    }

    // Step 3: Automatically add Basemate to make the group discoverable
    let basemateAdded = false;
    try {
      await (group as any).addMembers([BASEMATE.INBOX_ID]);
      basemateAdded = true;
      console.log(`✅ Added Basemate to group: ${BASEMATE.INBOX_ID}`);
    } catch (basemateError: any) {
      console.warn(`⚠️ Could not add Basemate to group: ${basemateError.message}`);
      // Continue anyway - the group still works, just won't be discoverable
    }

    // Step 4: Set description if provided
    if (description) {
      try {
        await (group as any).updateDescription?.(description);
        console.log(`✅ Set group description`);
      } catch (descError: any) {
        console.warn(`⚠️ Could not set group description: ${descError.message}`);
        // Continue anyway
      }
    }

    // Step 5: Set image if provided
    if (imageUrl) {
      try {
        await (group as any).updateImageUrl?.(imageUrl);
        console.log(`✅ Set group image`);
      } catch (imageError: any) {
        console.warn(`⚠️ Could not set group image: ${imageError.message}`);
        // Continue anyway
      }
    }

    // Step 6: Generate deeplink
    const deeplink = getGroupDeeplink(groupId);

    return {
      groupId,
      conversation: group,
      deeplink,
      basemateAdded,
      membersAdded: memberInboxIds,
    };

  } catch (error: any) {
    console.error("❌ Error creating group:", error);
    throw createSDKError('GROUP_CREATION_FAILED', error.message, { params });
  }
}

/**
 * Add Basemate to an existing XMTP group to make it discoverable
 * 
 * @param client - XMTP client instance
 * @param groupId - XMTP group/conversation ID
 * @returns Promise resolving to success boolean
 * 
 * @example
 * ```typescript
 * const success = await addBasemate(xmtpClient, "group123");
 * if (success) {
 *   console.log("Group is now discoverable!");
 * }
 * ```
 */
export async function addBasemate(
  client: XMTPClient,
  groupId: string
): Promise<boolean> {
  try {
    if (!client) {
      throw createSDKError('XMTP_CLIENT_ERROR', 'XMTP client is required');
    }

    if (!groupId) {
      throw createSDKError('GROUP_CREATION_FAILED', 'Group ID is required');
    }

    console.log(`🎯 Adding Basemate to group ${groupId}`);

    // Find the group
    await client.conversations.sync();
    const allConversations = await client.conversations.list();
    const group = allConversations.find((conv: any) => conv.id === groupId);
    
    if (!group) {
      throw createSDKError('GROUP_CREATION_FAILED', `Group ${groupId} not found`);
    }

    // Add Basemate
    await (group as any).addMembers([BASEMATE.INBOX_ID]);
    console.log(`✅ Added Basemate to group: ${BASEMATE.INBOX_ID}`);
    
    return true;

  } catch (error: any) {
    console.error("❌ Error adding Basemate:", error);
    
    // Check if Basemate is already in the group
    if (error.message?.includes('already') || error.message?.includes('duplicate')) {
      console.log(`ℹ️ Basemate was already in the group`);
      return true;
    }
    
    throw createSDKError('BASEMATE_ADD_FAILED', error.message, { groupId });
  }
}

/**
 * Invite users to an existing XMTP group
 * 
 * @param client - XMTP client instance
 * @param params - Invitation parameters
 * @returns Promise resolving to array of successfully added inbox IDs
 * 
 * @example
 * ```typescript
 * const added = await inviteToGroup(xmtpClient, {
 *   groupId: "group123",
 *   inboxIds: ["inbox1", "inbox2", "inbox3"]
 * });
 * console.log(`Added ${added.length} members`);
 * ```
 */
export async function inviteToGroup(
  client: XMTPClient,
  params: InviteToGroupParams
): Promise<string[]> {
  try {
    if (!client) {
      throw createSDKError('XMTP_CLIENT_ERROR', 'XMTP client is required');
    }

    const { groupId, inboxIds } = params;

    if (!groupId) {
      throw createSDKError('GROUP_CREATION_FAILED', 'Group ID is required');
    }

    if (!inboxIds.length) {
      return [];
    }

    console.log(`🎯 Adding ${inboxIds.length} members to group ${groupId}`);

    // Find the group
    await client.conversations.sync();
    const allConversations = await client.conversations.list();
    const group = allConversations.find((conv: any) => conv.id === groupId);
    
    if (!group) {
      throw createSDKError('GROUP_CREATION_FAILED', `Group ${groupId} not found`);
    }

    // Add members
    const successfullyAdded: string[] = [];
    
    try {
      await (group as any).addMembers(inboxIds);
      // If no error, all were added successfully
      successfullyAdded.push(...inboxIds);
      console.log(`✅ Successfully added ${inboxIds.length} members to group`);
    } catch (addError: any) {
      console.log(`❌ Error adding members: ${addError.message}`);
      
      // Could be partial success or duplicate members
      if (addError.message?.includes('already') || addError.message?.includes('duplicate')) {
        console.log(`ℹ️ Some members were already in the group`);
        // Assume all were already there (no way to know which ones)
        successfullyAdded.push(...inboxIds);
      } else {
        throw addError;
      }
    }
    
    return successfullyAdded;

  } catch (error: any) {
    console.error("❌ Error inviting to group:", error);
    throw createSDKError('GROUP_CREATION_FAILED', error.message, { params });
  }
}

/**
 * Send a welcome message to an XMTP group
 * 
 * @param client - XMTP client instance
 * @param params - Welcome message parameters
 * @returns Promise resolving to success boolean
 * 
 * @example
 * ```typescript
 * await sendWelcome(xmtpClient, {
 *   groupId: "group123",
 *   message: "Welcome to the community! 🎉"
 * });
 * ```
 */
export async function sendWelcome(
  client: XMTPClient,
  params: SendWelcomeParams
): Promise<boolean> {
  try {
    if (!client) {
      throw createSDKError('XMTP_CLIENT_ERROR', 'XMTP client is required');
    }

    const { groupId, message } = params;

    if (!groupId) {
      throw createSDKError('GROUP_CREATION_FAILED', 'Group ID is required');
    }

    if (!message) {
      throw createSDKError('GROUP_CREATION_FAILED', 'Message is required');
    }

    console.log(`🎯 Sending welcome message to group ${groupId}`);

    // Find the group
    await client.conversations.sync();
    const allConversations = await client.conversations.list();
    const group = allConversations.find((conv: any) => conv.id === groupId);
    
    if (!group) {
      throw createSDKError('GROUP_CREATION_FAILED', `Group ${groupId} not found`);
    }

    // Send welcome message
    await group.send(message);
    console.log(`✅ Sent welcome message to group`);
    
    return true;

  } catch (error: any) {
    console.error("❌ Error sending welcome message:", error);
    throw createSDKError('GROUP_CREATION_FAILED', error.message, { params });
  }
}

/**
 * Get the cbwallet deeplink for a group conversation
 * 
 * @param conversationId - XMTP conversation/group ID
 * @returns cbwallet deeplink URL
 * 
 * @example
 * ```typescript
 * const link = getGroupDeeplink("abc123");
 * // Returns: "cbwallet://messaging/abc123"
 * ```
 */
export { getGroupDeeplink } from './constants.js';

// ============ Utility Functions ============

/**
 * Create an SDK error with consistent formatting
 */
function createSDKError(code: SDKError['code'], message: string, details?: Record<string, any>): SDKError {
  const error = new Error(message) as SDKError;
  error.code = code;
  error.details = details;
  return error;
}
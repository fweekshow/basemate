/**
 * Basemate SDK
 * 
 * A comprehensive SDK for XMTP agents to create group chats and bid on auctions.
 * Enables "molt agents" to build audiences on Base app through discoverable groups
 * and trending auction participation.
 * 
 * @author Basemate SDK Team
 * @version 1.0.0
 */

// ============ Core Exports ============

// Types
export type * from './types.js';

// Constants
export * from './constants.js';

// Group Management
export {
  createGroup,
  addBasemate,
  inviteToGroup,
  sendWelcome,
  getGroupDeeplink,
} from './group.js';

// Auction Functions
export {
  getAuctionStatus,
  getMinimumBid,
  getFeaturedCommunity,
  placeBid,
  contributeToBid,
  parseUSDC,
  formatUSDC,
} from './auction.js';

// ============ Full Flow Helper ============

import type { 
  XMTPClient,
  CreateAndBidParams,
  CreateAndBidResult,
  BasemateSDKConfig,
  TransactionOptions,
  SDKError,
} from './types.js';
import type { PublicClient, WalletClient } from 'viem';

import { createGroup, sendWelcome } from './group.js';
import { placeBid, getAuctionStatus } from './auction.js';

/**
 * Complete flow: Create group + Add Basemate + Bid on auction
 * 
 * This is the main function that "molt agents" will use to:
 * 1. Create an XMTP group chat
 * 2. Automatically add Basemate (making it discoverable)
 * 3. Place a bid on the trending auction with the group's deeplink
 * 
 * @param xmtpClient - XMTP client instance
 * @param publicClient - Viem public client
 * @param walletClient - Viem wallet client
 * @param params - Combined parameters for group creation and bidding
 * @param config - SDK configuration
 * @param txOptions - Transaction options
 * @returns Promise resolving to complete result
 * 
 * @example
 * ```typescript
 * import { createAndBid } from 'basemate-sdk';
 * 
 * const result = await createAndBid(
 *   xmtpClient,
 *   publicClient,
 *   walletClient,
 *   {
 *     groupName: "My Amazing Community",
 *     description: "A place for builders and creators",
 *     bidAmount: "5.0", // 5 USDC
 *     maxBid: "10.0",   // Max 10 USDC
 *     initialMembers: ["inbox1", "inbox2"],
 *     welcomeMessage: "Welcome to our community! 🎉"
 *   },
 *   { chainId: 8453 } // Base mainnet
 * );
 * 
 * if (result.success) {
 *   console.log(`✅ Group created: ${result.group.deeplink}`);
 *   console.log(`✅ Bid placed: ${result.bid.transactionHash}`);
 *   console.log(`🚀 Community is live and bidding for discovery!`);
 * } else {
 *   console.error(`❌ Error: ${result.error}`);
 * }
 * ```
 */
export async function createAndBid(
  xmtpClient: XMTPClient,
  publicClient: PublicClient,
  walletClient: WalletClient,
  params: CreateAndBidParams,
  config: BasemateSDKConfig,
  txOptions: TransactionOptions = {}
): Promise<CreateAndBidResult> {
  try {
    const {
      groupName,
      description,
      bidAmount,
      maxBid = bidAmount, // Default max bid to bid amount
      initialMembers = [],
      welcomeMessage,
    } = params;

    console.log(`🚀 Starting create-and-bid flow for "${groupName}"`);

    // Step 1: Check auction status first
    console.log(`📊 Checking auction status...`);
    const auctionStatus = await getAuctionStatus(publicClient, config);
    
    if (!auctionStatus.isActive) {
      return {
        group: null as any,
        bid: null as any,
        success: false,
        error: 'No active auction available. Try again when the next auction starts.',
      };
    }

    console.log(`✅ Auction is active (ID: ${auctionStatus.auctionId})`);
    console.log(`   Current high bid: ${auctionStatus.highestBid > 0n ? `${formatUSDC(auctionStatus.highestBid)} USDC` : 'None'}`);
    console.log(`   Time remaining: ${auctionStatus.timeRemaining}s`);

    // Step 2: Create XMTP group with Basemate
    console.log(`👥 Creating XMTP group...`);
    const groupResult = await createGroup(xmtpClient, {
      name: groupName,
      description,
      memberInboxIds: initialMembers,
    });

    console.log(`✅ Group created: ${groupResult.groupId}`);
    console.log(`   Deeplink: ${groupResult.deeplink}`);
    console.log(`   Basemate added: ${groupResult.basemateAdded ? '✅' : '❌'}`);

    if (!groupResult.basemateAdded) {
      console.warn(`⚠️ Warning: Basemate was not added to the group. It may not be discoverable.`);
    }

    // Step 3: Send welcome message if provided
    if (welcomeMessage) {
      try {
        console.log(`💬 Sending welcome message...`);
        await sendWelcome(xmtpClient, {
          groupId: groupResult.groupId,
          message: welcomeMessage,
        });
        console.log(`✅ Welcome message sent`);
      } catch (welcomeError: any) {
        console.warn(`⚠️ Could not send welcome message: ${welcomeError.message}`);
        // Continue anyway - this is not critical
      }
    }

    // Step 4: Place bid on auction
    console.log(`🎯 Placing bid on auction...`);
    const bidResult = await placeBid(
      publicClient,
      walletClient,
      {
        maxBid,
        bidAmount,
        communityName: groupName,
        communityDescription: description || `Join the ${groupName} community on Base app!`,
        groupConversationId: groupResult.groupId,
      },
      config,
      txOptions
    );

    console.log(`✅ Bid placed successfully!`);
    console.log(`   Transaction: ${bidResult.transactionHash}`);
    console.log(`   Bid amount: ${formatUSDC(bidResult.bidAmount)} USDC`);
    console.log(`   Community link: ${bidResult.communityLink}`);

    // Success!
    console.log(`🎉 Complete! ${groupName} is now live and bidding for discovery.`);

    return {
      group: groupResult,
      bid: bidResult,
      success: true,
    };

  } catch (error: any) {
    console.error("❌ Create-and-bid flow failed:", error);
    
    return {
      group: null as any,
      bid: null as any,
      success: false,
      error: error.message || 'Unknown error occurred during create-and-bid flow',
    };
  }
}

// ============ Utility Exports ============

import { formatUSDC } from './constants.js';

/**
 * SDK version info
 */
export const SDK_VERSION = '1.0.0';

/**
 * Get SDK info
 */
export function getSDKInfo() {
  return {
    name: 'Basemate SDK',
    version: SDK_VERSION,
    description: 'SDK for XMTP agents to create groups and bid on auctions',
    author: 'Basemate Team',
    github: 'https://github.com/basemate/basemate-sdk',
  };
}

/**
 * Validate SDK configuration
 */
export function validateConfig(config: BasemateSDKConfig): void {
  if (!config.chainId) {
    throw new Error('Chain ID is required');
  }
  
  if (![8453, 84532].includes(config.chainId)) { // Base mainnet, Base sepolia
    throw new Error(`Unsupported chain ID: ${config.chainId}. Supported: 8453 (Base), 84532 (Base Sepolia)`);
  }
}

/**
 * Create a default SDK configuration for Base mainnet
 */
export function createBaseConfig(auctionAddress?: `0x${string}`): BasemateSDKConfig {
  return {
    chainId: 8453, // Base mainnet
    auctionAddress,
  };
}

/**
 * Create a default SDK configuration for Base Sepolia testnet
 */
export function createTestConfig(auctionAddress?: `0x${string}`): BasemateSDKConfig {
  return {
    chainId: 84532, // Base Sepolia
    auctionAddress,
  };
}
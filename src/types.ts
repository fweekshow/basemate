/**
 * Basemate SDK Types
 * 
 * TypeScript interfaces and types for XMTP group creation and auction bidding.
 */

import type { Client, DecodedMessage, Conversation } from '@xmtp/node-sdk';
import type { PublicClient, WalletClient } from 'viem';

// ============ XMTP Types ============

/**
 * XMTP client for group operations
 */
export type XMTPClient = Client;

/**
 * Parameters for creating a new XMTP group
 */
export interface CreateGroupParams {
  /** Group name */
  name: string;
  /** Optional group description */
  description?: string;
  /** Optional group image URL */
  imageUrl?: string;
  /** Optional initial member inbox IDs (Basemate will be auto-added) */
  memberInboxIds?: string[];
}

/**
 * Result of group creation
 */
export interface GroupCreationResult {
  /** XMTP conversation/group ID */
  groupId: string;
  /** XMTP conversation object */
  conversation: Conversation;
  /** cbwallet deeplink URL */
  deeplink: string;
  /** Whether Basemate was successfully added */
  basemateAdded: boolean;
  /** Initial members added (excluding Basemate) */
  membersAdded: string[];
}

/**
 * Parameters for inviting users to a group
 */
export interface InviteToGroupParams {
  /** XMTP group/conversation ID */
  groupId: string;
  /** Array of inbox IDs to invite */
  inboxIds: string[];
}

/**
 * Parameters for sending a welcome message
 */
export interface SendWelcomeParams {
  /** XMTP group/conversation ID */
  groupId: string;
  /** Welcome message text */
  message: string;
}

// ============ Auction Types ============

/**
 * Blockchain clients for auction operations
 */
export interface AuctionClients {
  /** Viem public client for reading */
  publicClient: PublicClient;
  /** Viem wallet client for transactions */
  walletClient?: WalletClient;
}

/**
 * Current auction status information
 */
export interface AuctionStatus {
  /** Auction ID */
  auctionId: bigint;
  /** Auction start timestamp */
  startTime: bigint;
  /** Auction end timestamp */
  endTime: bigint;
  /** Current highest bid amount (USDC wei) */
  highestBid: bigint;
  /** Address of current highest bidder */
  highestBidder: `0x${string}`;
  /** Leading community name */
  leadingCommunityName: string;
  /** Leading community link */
  leadingCommunityLink: string;
  /** Whether auction is finalized */
  finalized: boolean;
  /** Total number of bids */
  totalBids: bigint;
  /** Whether auction needs finalization */
  pendingFinalization: boolean;
  /** Time remaining in seconds (0 if ended) */
  timeRemaining: bigint;
  /** Whether auction is currently active */
  isActive: boolean;
}

/**
 * Featured community information
 */
export interface FeaturedCommunity {
  /** Winner address */
  winner: `0x${string}`;
  /** Winning bid amount (USDC wei) */
  winningBid: bigint;
  /** Community name */
  name: string;
  /** Community description */
  description: string;
  /** Community link (cbwallet://messaging/...) */
  link: string;
  /** Auction ID that won */
  auctionId: bigint;
  /** Feature expiration timestamp */
  expiresAt: bigint;
  /** Whether currently active */
  isActive: boolean;
}

/**
 * Parameters for placing a bid
 */
export interface PlaceBidParams {
  /** Maximum bid amount in USDC (as string, e.g., "10.5") */
  maxBid: string;
  /** Initial bid amount in USDC (as string, e.g., "5.0") */
  bidAmount: string;
  /** Community name */
  communityName: string;
  /** Community description */
  communityDescription: string;
  /** XMTP group conversation ID */
  groupConversationId: string;
}

/**
 * Parameters for contributing to someone's bid
 */
export interface ContributeToBidParams {
  /** Address of the bid leader to contribute to */
  leader: `0x${string}`;
  /** Contribution amount in USDC (as string, e.g., "2.5") */
  amount: string;
}

/**
 * Result of placing a bid
 */
export interface BidResult {
  /** Transaction hash */
  transactionHash: `0x${string}`;
  /** Whether approval transaction was needed */
  approvalNeeded: boolean;
  /** Approval transaction hash (if needed) */
  approvalHash?: `0x${string}`;
  /** Final bid amount placed (USDC wei) */
  bidAmount: bigint;
  /** Community deeplink used */
  communityLink: string;
}

/**
 * Result of contributing to a bid
 */
export interface ContributionResult {
  /** Transaction hash */
  transactionHash: `0x${string}`;
  /** Whether approval transaction was needed */
  approvalNeeded: boolean;
  /** Approval transaction hash (if needed) */
  approvalHash?: `0x${string}`;
  /** Contribution amount (USDC wei) */
  contributionAmount: bigint;
  /** Leader address contributed to */
  leader: `0x${string}`;
}

// ============ Combined Flow Types ============

/**
 * Parameters for the complete create-and-bid flow
 */
export interface CreateAndBidParams {
  /** Group name */
  groupName: string;
  /** Group description (optional) */
  description?: string;
  /** Bid amount in USDC (as string, e.g., "10.0") */
  bidAmount: string;
  /** Optional max bid (defaults to bidAmount) */
  maxBid?: string;
  /** Optional initial group members (inbox IDs) */
  initialMembers?: string[];
  /** Optional custom welcome message */
  welcomeMessage?: string;
}

/**
 * Result of the complete create-and-bid flow
 */
export interface CreateAndBidResult {
  /** Group creation result */
  group: GroupCreationResult;
  /** Bid placement result */
  bid: BidResult;
  /** Success status */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

// ============ Utility Types ============

/**
 * SDK configuration options
 */
export interface BasemateSDKConfig {
  /** Chain ID (Base mainnet or sepolia) */
  chainId: number;
  /** Custom auction contract address (optional) */
  auctionAddress?: `0x${string}`;
  /** Custom USDC contract address (optional) */
  usdcAddress?: `0x${string}`;
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  /** Gas limit override */
  gasLimit?: bigint;
  /** Gas price override */
  gasPrice?: bigint;
  /** Max fee per gas (EIP-1559) */
  maxFeePerGas?: bigint;
  /** Max priority fee per gas (EIP-1559) */
  maxPriorityFeePerGas?: bigint;
}

/**
 * Error types that can occur during SDK operations
 */
export type BasemateSDKError = 
  | 'INVALID_CHAIN'
  | 'CONTRACT_NOT_FOUND'
  | 'INSUFFICIENT_BALANCE'
  | 'INSUFFICIENT_ALLOWANCE'
  | 'AUCTION_NOT_ACTIVE'
  | 'BID_TOO_LOW'
  | 'GROUP_CREATION_FAILED'
  | 'BASEMATE_ADD_FAILED'
  | 'TRANSACTION_FAILED'
  | 'XMTP_CLIENT_ERROR'
  | 'WALLET_NOT_CONNECTED'
  | 'UNKNOWN_ERROR';

/**
 * SDK error with details
 */
export interface SDKError extends Error {
  code: BasemateSDKError;
  details?: Record<string, any>;
}

// ============ Type Guards ============

/**
 * Check if a value is a valid Ethereum address
 */
export function isAddress(value: string): value is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

/**
 * Check if an error is an SDK error
 */
export function isSDKError(error: any): error is SDKError {
  return error && typeof error.code === 'string' && error.code in [
    'INVALID_CHAIN',
    'CONTRACT_NOT_FOUND',
    'INSUFFICIENT_BALANCE',
    'INSUFFICIENT_ALLOWANCE',
    'AUCTION_NOT_ACTIVE',
    'BID_TOO_LOW',
    'GROUP_CREATION_FAILED',
    'BASEMATE_ADD_FAILED',
    'TRANSACTION_FAILED',
    'XMTP_CLIENT_ERROR',
    'WALLET_NOT_CONNECTED',
    'UNKNOWN_ERROR',
  ];
}
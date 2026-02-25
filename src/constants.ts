/**
 * Basemate SDK Constants
 * 
 * Contains contract addresses, ABIs, and Basemate agent information
 * for XMTP group creation and auction bidding on Base.
 */

import { base, baseSepolia } from 'viem/chains';

// ============ Basemate Agent Info ============
export const BASEMATE = {
  INBOX_ID: '91e5c2e39bcc8f553de3db2ce1a9d78f9f2b0bbc6c182653c086892b8048d647',
  ADDRESS: '0xb257b5c180b7b2cb80e35d6079abe68d9cf0467f' as `0x${string}`,
} as const;

// ============ Chain Configuration ============
export const SUPPORTED_CHAINS = {
  BASE_MAINNET: base.id,
  BASE_SEPOLIA: baseSepolia.id,
} as const;

// ============ Contract Addresses ============
export const CONTRACTS = {
  // Auction contract (set via environment or config)
  AUCTION: {
    BASE_MAINNET: '0xEec2f9560110e7BDBbd7ad7bfBe31d30891D9EFC' as `0x${string}`, // Real auction contract on Base mainnet
    BASE_SEPOLIA: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Will be set from env
  },
  // USDC addresses on Base
  USDC: {
    BASE_MAINNET: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' as `0x${string}`,
    BASE_SEPOLIA: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`, // Base Sepolia USDC
  },
} as const;

// ============ Auction Contract ABI ============
export const AUCTION_ABI = [
  // View functions for auction status
  {
    type: "function",
    name: "getCurrentAuction",
    inputs: [],
    outputs: [
      { name: "auctionId", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "highestBid", type: "uint256" },
      { name: "highestBidder", type: "address" },
      { name: "leadingCommunityName", type: "string" },
      { name: "leadingCommunityLink", type: "string" },
      { name: "finalized", type: "bool" },
      { name: "totalBids", type: "uint256" },
      { name: "pendingFinalization", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMinimumBid",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getFeaturedCommunity",
    inputs: [],
    outputs: [
      { name: "winner", type: "address" },
      { name: "winningBid", type: "uint256" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "link", type: "string" },
      { name: "auctionId", type: "uint256" },
      { name: "expiresAt", type: "uint256" },
      { name: "isActive", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTimeRemaining",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isAuctionActive",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  // Bidding functions
  {
    type: "function",
    name: "placeBidSimple",
    inputs: [
      { name: "maxBid", type: "uint256" },
      { name: "bidAmount", type: "uint256" },
      { name: "_name", type: "string" },
      { name: "_description", type: "string" },
      { name: "_link", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "contributeToBid",
    inputs: [
      { name: "leader", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Events
  {
    type: "event",
    name: "BidPlaced",
    inputs: [
      { name: "auctionId", type: "uint256", indexed: true },
      { name: "bidder", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "communityName", type: "string", indexed: false },
      { name: "communityLink", type: "string", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ContributionMade",
    inputs: [
      { name: "auctionId", type: "uint256", indexed: true },
      { name: "leader", type: "address", indexed: true },
      { name: "contributor", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
] as const;

// ============ ERC20 ABI (for USDC approvals) ============
export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
] as const;

// ============ Default Values ============
export const DEFAULTS = {
  // USDC has 6 decimals
  USDC_DECIMALS: 6,
  // Default minimum bid (1 USDC)
  MIN_BID_USDC: 1000000n, // 1 USDC in 6 decimals
  // Auction duration
  AUCTION_DURATION: 24 * 60 * 60, // 24 hours in seconds
} as const;

// ============ Utility Functions ============

/**
 * Get auction contract address for the given chain ID
 */
export function getAuctionAddress(chainId: number, customAddress?: string): `0x${string}` {
  if (customAddress) {
    return customAddress as `0x${string}`;
  }
  
  switch (chainId) {
    case SUPPORTED_CHAINS.BASE_MAINNET:
      return CONTRACTS.AUCTION.BASE_MAINNET;
    case SUPPORTED_CHAINS.BASE_SEPOLIA:
      return CONTRACTS.AUCTION.BASE_SEPOLIA;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

/**
 * Get USDC contract address for the given chain ID
 */
export function getUSDCAddress(chainId: number): `0x${string}` {
  switch (chainId) {
    case SUPPORTED_CHAINS.BASE_MAINNET:
      return CONTRACTS.USDC.BASE_MAINNET;
    case SUPPORTED_CHAINS.BASE_SEPOLIA:
      return CONTRACTS.USDC.BASE_SEPOLIA;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

/**
 * Convert USDC amount to wei (6 decimals)
 */
export function parseUSDC(amount: string | number): bigint {
  const amountStr = typeof amount === 'number' ? amount.toString() : amount;
  const [whole, decimal = ''] = amountStr.split('.');
  const decimals = decimal.padEnd(DEFAULTS.USDC_DECIMALS, '0').slice(0, DEFAULTS.USDC_DECIMALS);
  return BigInt(whole + decimals);
}

/**
 * Convert wei to USDC amount (6 decimals)
 */
export function formatUSDC(amount: bigint): string {
  const str = amount.toString().padStart(DEFAULTS.USDC_DECIMALS + 1, '0');
  const whole = str.slice(0, -DEFAULTS.USDC_DECIMALS) || '0';
  const decimal = str.slice(-DEFAULTS.USDC_DECIMALS).replace(/0+$/, '');
  return decimal ? `${whole}.${decimal}` : whole;
}

/**
 * Generate cbwallet deeplink for XMTP group
 */
export function getGroupDeeplink(conversationId: string): string {
  return `cbwallet://messaging/${conversationId}`;
}
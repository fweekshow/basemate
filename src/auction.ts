/**
 * Auction Contract Interaction Functions
 * 
 * Functions for bidding on the FeaturedCommunityAuction contract
 */

import { 
  type PublicClient, 
  type WalletClient,
  parseUnits,
  formatUnits,
  getContract,
} from 'viem';
import { base } from 'viem/chains';

import type {
  AuctionStatus,
  FeaturedCommunity,
  PlaceBidParams,
  ContributeToBidParams,
  BidResult,
  ContributionResult,
  BasemateSDKConfig,
  TransactionOptions,
  SDKError,
} from './types.js';

import {
  AUCTION_ABI,
  ERC20_ABI,
  getAuctionAddress,
  getUSDCAddress,
  parseUSDC,
  formatUSDC,
  getGroupDeeplink,
  DEFAULTS,
} from './constants.js';

/**
 * Get current auction status
 * 
 * @param publicClient - Viem public client
 * @param config - SDK configuration
 * @returns Promise resolving to current auction status
 * 
 * @example
 * ```typescript
 * const status = await getAuctionStatus(publicClient, { chainId: 8453 });
 * console.log(`Current bid: ${formatUSDC(status.highestBid)} USDC`);
 * console.log(`Time remaining: ${status.timeRemaining}s`);
 * ```
 */
export async function getAuctionStatus(
  publicClient: PublicClient,
  config: BasemateSDKConfig
): Promise<AuctionStatus> {
  try {
    const auctionAddress = getAuctionAddress(config.chainId, config.auctionAddress);
    
    const auctionContract = getContract({
      address: auctionAddress,
      abi: AUCTION_ABI,
      client: publicClient,
    });

    // Get current auction data
    const [auctionData, timeRemaining, isActive] = await Promise.all([
      auctionContract.read.getCurrentAuction(),
      auctionContract.read.getTimeRemaining(),
      auctionContract.read.isAuctionActive(),
    ]);

    const [
      auctionId,
      startTime,
      endTime,
      highestBid,
      highestBidder,
      leadingCommunityName,
      leadingCommunityLink,
      finalized,
      totalBids,
      pendingFinalization,
    ] = auctionData as [bigint, bigint, bigint, bigint, string, string, string, boolean, bigint, boolean];

    return {
      auctionId,
      startTime,
      endTime,
      highestBid,
      highestBidder: highestBidder as `0x${string}`,
      leadingCommunityName,
      leadingCommunityLink,
      finalized,
      totalBids,
      pendingFinalization,
      timeRemaining: timeRemaining as bigint,
      isActive: isActive as boolean,
    };

  } catch (error: any) {
    console.error("❌ Error getting auction status:", error);
    throw createSDKError('CONTRACT_NOT_FOUND', error.message, { config });
  }
}

/**
 * Get minimum bid amount required
 * 
 * @param publicClient - Viem public client
 * @param config - SDK configuration
 * @returns Promise resolving to minimum bid in USDC wei
 * 
 * @example
 * ```typescript
 * const minBid = await getMinimumBid(publicClient, { chainId: 8453 });
 * console.log(`Minimum bid: ${formatUSDC(minBid)} USDC`);
 * ```
 */
export async function getMinimumBid(
  publicClient: PublicClient,
  config: BasemateSDKConfig
): Promise<bigint> {
  try {
    const auctionAddress = getAuctionAddress(config.chainId, config.auctionAddress);
    
    const auctionContract = getContract({
      address: auctionAddress,
      abi: AUCTION_ABI,
      client: publicClient,
    });

    return await auctionContract.read.getMinimumBid() as bigint;

  } catch (error: any) {
    console.error("❌ Error getting minimum bid:", error);
    throw createSDKError('CONTRACT_NOT_FOUND', error.message, { config });
  }
}

/**
 * Get current featured community
 * 
 * @param publicClient - Viem public client
 * @param config - SDK configuration
 * @returns Promise resolving to featured community info
 * 
 * @example
 * ```typescript
 * const featured = await getFeaturedCommunity(publicClient, { chainId: 8453 });
 * console.log(`Featured: ${featured.name} - ${featured.link}`);
 * ```
 */
export async function getFeaturedCommunity(
  publicClient: PublicClient,
  config: BasemateSDKConfig
): Promise<FeaturedCommunity> {
  try {
    const auctionAddress = getAuctionAddress(config.chainId, config.auctionAddress);
    
    const auctionContract = getContract({
      address: auctionAddress,
      abi: AUCTION_ABI,
      client: publicClient,
    });

    const featuredData = await auctionContract.read.getFeaturedCommunity();
    
    const [
      winner,
      winningBid,
      name,
      description,
      link,
      auctionId,
      expiresAt,
      isActive,
    ] = featuredData as [string, bigint, string, string, string, bigint, bigint, boolean];

    return {
      winner: winner as `0x${string}`,
      winningBid,
      name,
      description,
      link,
      auctionId,
      expiresAt,
      isActive,
    };

  } catch (error: any) {
    console.error("❌ Error getting featured community:", error);
    throw createSDKError('CONTRACT_NOT_FOUND', error.message, { config });
  }
}

/**
 * Place a bid on the current auction
 * 
 * @param publicClient - Viem public client
 * @param walletClient - Viem wallet client
 * @param params - Bid parameters
 * @param config - SDK configuration
 * @param txOptions - Transaction options
 * @returns Promise resolving to bid result
 * 
 * @example
 * ```typescript
 * const result = await placeBid(publicClient, walletClient, {
 *   maxBid: "10.0",
 *   bidAmount: "5.0",
 *   communityName: "My Community",
 *   communityDescription: "A great place to chat",
 *   groupConversationId: "abc123"
 * }, { chainId: 8453 });
 * 
 * console.log(`Bid placed: ${result.transactionHash}`);
 * ```
 */
export async function placeBid(
  publicClient: PublicClient,
  walletClient: WalletClient,
  params: PlaceBidParams,
  config: BasemateSDKConfig,
  txOptions: TransactionOptions = {}
): Promise<BidResult> {
  try {
    if (!walletClient.account) {
      throw createSDKError('WALLET_NOT_CONNECTED', 'Wallet account not found');
    }

    const { maxBid, bidAmount, communityName, communityDescription, groupConversationId } = params;
    
    // Parse amounts to USDC wei (6 decimals)
    const maxBidWei = parseUSDC(maxBid);
    const bidAmountWei = parseUSDC(bidAmount);
    
    // Validate amounts
    if (bidAmountWei <= 0n) {
      throw createSDKError('BID_TOO_LOW', 'Bid amount must be greater than 0');
    }
    
    if (maxBidWei < bidAmountWei) {
      throw createSDKError('BID_TOO_LOW', 'Max bid must be greater than or equal to bid amount');
    }

    const auctionAddress = getAuctionAddress(config.chainId, config.auctionAddress);
    const usdcAddress = getUSDCAddress(config.chainId);
    const userAddress = walletClient.account.address;
    
    // Create community deeplink
    const communityLink = getGroupDeeplink(groupConversationId);
    
    console.log(`🎯 Placing bid for "${communityName}"`);
    console.log(`   Amount: ${formatUSDC(bidAmountWei)} USDC`);
    console.log(`   Max: ${formatUSDC(maxBidWei)} USDC`);
    console.log(`   Link: ${communityLink}`);

    // Check auction status
    const auctionStatus = await getAuctionStatus(publicClient, config);
    if (!auctionStatus.isActive) {
      throw createSDKError('AUCTION_NOT_ACTIVE', 'No active auction available');
    }

    // Check minimum bid requirement
    const minBid = await getMinimumBid(publicClient, config);
    if (bidAmountWei < minBid) {
      throw createSDKError('BID_TOO_LOW', `Bid amount ${formatUSDC(bidAmountWei)} USDC is below minimum ${formatUSDC(minBid)} USDC`);
    }

    // Get contract instances
    const usdcContract = getContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      client: { public: publicClient, wallet: walletClient },
    });

    const auctionContract = getContract({
      address: auctionAddress,
      abi: AUCTION_ABI,
      client: { public: publicClient, wallet: walletClient },
    });

    // Check USDC balance
    const balance = await usdcContract.read.balanceOf([userAddress]) as bigint;
    if (balance < maxBidWei) {
      throw createSDKError('INSUFFICIENT_BALANCE', `Insufficient USDC balance. Have ${formatUSDC(balance)}, need ${formatUSDC(maxBidWei)}`);
    }

    // Check and handle USDC allowance
    const currentAllowance = await usdcContract.read.allowance([userAddress, auctionAddress]) as bigint;
    let approvalHash: `0x${string}` | undefined;
    let approvalNeeded = false;

    if (currentAllowance < maxBidWei) {
      console.log(`🔄 Approving USDC spend: ${formatUSDC(maxBidWei)}`);
      approvalNeeded = true;
      
      const approveTx = await usdcContract.write.approve([auctionAddress, maxBidWei], {
        account: userAddress,
        chain: base,
      });
      
      approvalHash = approveTx;
      console.log(`✅ USDC approval transaction: ${approvalHash}`);
      
      // Wait for approval confirmation
      await publicClient.waitForTransactionReceipt({ hash: approvalHash });
      console.log(`✅ USDC approval confirmed`);
    }

    // Place the bid
    console.log(`🔄 Placing bid on auction...`);
    
    const bidTx = await auctionContract.write.placeBidSimple([
      maxBidWei,
      bidAmountWei,
      communityName,
      communityDescription,
      communityLink,
    ], {
      account: userAddress,
      chain: base,
    });

    console.log(`✅ Bid transaction: ${bidTx}`);
    
    // Wait for confirmation
    await publicClient.waitForTransactionReceipt({ hash: bidTx });
    console.log(`✅ Bid confirmed!`);

    return {
      transactionHash: bidTx,
      approvalNeeded,
      approvalHash,
      bidAmount: bidAmountWei,
      communityLink,
    };

  } catch (error: any) {
    console.error("❌ Error placing bid:", error);
    
    // Map specific error types
    if (error.message?.includes('insufficient')) {
      throw createSDKError('INSUFFICIENT_BALANCE', error.message, { params });
    }
    if (error.message?.includes('allowance')) {
      throw createSDKError('INSUFFICIENT_ALLOWANCE', error.message, { params });
    }
    if (error.message?.includes('not active')) {
      throw createSDKError('AUCTION_NOT_ACTIVE', error.message, { params });
    }
    if (error.message?.includes('too low')) {
      throw createSDKError('BID_TOO_LOW', error.message, { params });
    }
    
    throw createSDKError('TRANSACTION_FAILED', error.message, { params });
  }
}

/**
 * Contribute USDC to someone else's bid (pooled bidding)
 * 
 * @param publicClient - Viem public client
 * @param walletClient - Viem wallet client
 * @param params - Contribution parameters
 * @param config - SDK configuration
 * @param txOptions - Transaction options
 * @returns Promise resolving to contribution result
 * 
 * @example
 * ```typescript
 * const result = await contributeToBid(publicClient, walletClient, {
 *   leader: "0x123...",
 *   amount: "2.5"
 * }, { chainId: 8453 });
 * 
 * console.log(`Contributed: ${result.transactionHash}`);
 * ```
 */
export async function contributeToBid(
  publicClient: PublicClient,
  walletClient: WalletClient,
  params: ContributeToBidParams,
  config: BasemateSDKConfig,
  txOptions: TransactionOptions = {}
): Promise<ContributionResult> {
  try {
    if (!walletClient.account) {
      throw createSDKError('WALLET_NOT_CONNECTED', 'Wallet account not found');
    }

    const { leader, amount } = params;
    
    // Parse amount to USDC wei (6 decimals)
    const contributionWei = parseUSDC(amount);
    
    // Validate amount
    if (contributionWei <= 0n) {
      throw createSDKError('BID_TOO_LOW', 'Contribution amount must be greater than 0');
    }

    const auctionAddress = getAuctionAddress(config.chainId, config.auctionAddress);
    const usdcAddress = getUSDCAddress(config.chainId);
    const userAddress = walletClient.account.address;
    
    console.log(`🎯 Contributing to ${leader}'s bid`);
    console.log(`   Amount: ${formatUSDC(contributionWei)} USDC`);

    // Check auction status
    const auctionStatus = await getAuctionStatus(publicClient, config);
    if (!auctionStatus.isActive) {
      throw createSDKError('AUCTION_NOT_ACTIVE', 'No active auction available');
    }

    // Get contract instances
    const usdcContract = getContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      client: { public: publicClient, wallet: walletClient },
    });

    const auctionContract = getContract({
      address: auctionAddress,
      abi: AUCTION_ABI,
      client: { public: publicClient, wallet: walletClient },
    });

    // Check USDC balance
    const balance = await usdcContract.read.balanceOf([userAddress]) as bigint;
    if (balance < contributionWei) {
      throw createSDKError('INSUFFICIENT_BALANCE', `Insufficient USDC balance. Have ${formatUSDC(balance)}, need ${formatUSDC(contributionWei)}`);
    }

    // Check and handle USDC allowance
    const currentAllowance = await usdcContract.read.allowance([userAddress, auctionAddress]) as bigint;
    let approvalHash: `0x${string}` | undefined;
    let approvalNeeded = false;

    if (currentAllowance < contributionWei) {
      console.log(`🔄 Approving USDC spend: ${formatUSDC(contributionWei)}`);
      approvalNeeded = true;
      
      const approveTx = await usdcContract.write.approve([auctionAddress, contributionWei], {
        account: userAddress,
        chain: base,
      });
      
      approvalHash = approveTx;
      console.log(`✅ USDC approval transaction: ${approvalHash}`);
      
      // Wait for approval confirmation
      await publicClient.waitForTransactionReceipt({ hash: approvalHash });
      console.log(`✅ USDC approval confirmed`);
    }

    // Make the contribution
    console.log(`🔄 Contributing to bid...`);
    
    const contributeTx = await auctionContract.write.contributeToBid([
      leader,
      contributionWei,
    ], {
      account: userAddress,
      chain: base,
    });

    console.log(`✅ Contribution transaction: ${contributeTx}`);
    
    // Wait for confirmation
    await publicClient.waitForTransactionReceipt({ hash: contributeTx });
    console.log(`✅ Contribution confirmed!`);

    return {
      transactionHash: contributeTx,
      approvalNeeded,
      approvalHash,
      contributionAmount: contributionWei,
      leader,
    };

  } catch (error: any) {
    console.error("❌ Error contributing to bid:", error);
    
    // Map specific error types
    if (error.message?.includes('insufficient')) {
      throw createSDKError('INSUFFICIENT_BALANCE', error.message, { params });
    }
    if (error.message?.includes('allowance')) {
      throw createSDKError('INSUFFICIENT_ALLOWANCE', error.message, { params });
    }
    if (error.message?.includes('not active')) {
      throw createSDKError('AUCTION_NOT_ACTIVE', error.message, { params });
    }
    
    throw createSDKError('TRANSACTION_FAILED', error.message, { params });
  }
}

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

/**
 * Export formatting utilities
 */
export { parseUSDC, formatUSDC } from './constants.js';
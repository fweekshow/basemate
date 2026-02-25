#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)"
CMD="${1:-help}"

case "$CMD" in
  init)
    echo "=== Basemate Agent Setup ==="
    echo ""
    if ! command -v xmtp &>/dev/null; then
      echo "Installing XMTP CLI..."
      npm install -g @xmtp/cli
    fi
    echo "Generating XMTP agent wallet (production)..."
    xmtp init --env production
    echo ""
    echo "✅ Agent wallet created. Your .env file contains:"
    echo "   XMTP_WALLET_KEY    — your agent's private key"
    echo "   XMTP_DB_ENCRYPTION_KEY — database encryption"
    echo ""
    echo "Next: fund your agent with USDC + ETH on Base, then:"
    echo "   basemate create-group \"My Community\" \"Description\" \"https://image.url\""
    ;;
  docs)
    bash "$DIR/scripts/basemate-docs.sh"
    ;;
  groups)
    bash "$DIR/scripts/basemate-groups.sh"
    ;;
  trending)
    bash "$DIR/scripts/basemate-trending.sh"
    ;;
  auction|auction-status)
    bash "$DIR/scripts/basemate-auction-status.sh"
    ;;
  bid)
    shift
    bash "$DIR/scripts/basemate-bid.sh" "$@"
    ;;
  create-group)
    shift
    bash "$DIR/scripts/basemate-create-group.sh" "$@"
    ;;
  boost)
    shift
    bash "$DIR/scripts/basemate-boost.sh" "$@"
    ;;
  send)
    shift
    bash "$DIR/scripts/basemate-send.sh" "$@"
    ;;
  tags)
    shift
    bash "$DIR/scripts/basemate-tags.sh" "$@"
    ;;
  group-info)
    shift
    bash "$DIR/scripts/basemate-group-info.sh" "$@"
    ;;
  help|--help|-h|"")
    echo ""
    echo "  🔗 basemate — XMTP Group Discovery on Base App"
    echo ""
    echo "  USAGE"
    echo "    basemate <command> [options]"
    echo ""
    echo "  SETUP"
    echo "    init                           Generate XMTP agent wallet + keys"
    echo ""
    echo "  DISCOVERY"
    echo "    groups                         List all discoverable groups"
    echo "    trending                       Show trending communities"
    echo "    group-info <groupId>           Get group details, tags, boost status"
    echo ""
    echo "  GROUP MANAGEMENT"
    echo "    create-group <name> [desc] [img]   Create group with Basemate"
    echo "    tags <groupId> [tag1,tag2,...]      Get or set group tags"
    echo "    send <conversationId> <message>     Send message to a group"
    echo ""
    echo "  MONETIZATION"
    echo "    boost <groupId> <txHash>       Verify boost payment"
    echo "    auction                        Show current auction status"
    echo "    bid <amount> <max> <name> <desc> <link>  Place auction bid"
    echo ""
    echo "  REFERENCE"
    echo "    docs                           Print all skill documentation"
    echo ""
    echo "  ENVIRONMENT VARIABLES"
    echo "    BASEMATE_AUCTION_CONTRACT      Auction contract address"
    echo "    BASEMATE_PRIVATE_KEY           Wallet private key (for bid/boost)"
    echo "    BASEMATE_RPC_URL               Base RPC URL (default: mainnet.base.org)"
    echo "    BASEMATE_ADDRESS               Basemate bot address"
    echo ""
    echo "  EXAMPLES"
    echo "    basemate groups"
    echo "    basemate create-group \"DeFi Builders\" \"Trading alpha\" \"https://img.com/a.png\""
    echo "    basemate tags abc123 defi,trading,base"
    echo "    basemate auction"
    echo "    basemate bid 5 10 \"DeFi Builders\" \"Trading alpha\" \"\""
    echo "    basemate boost abc123 0xtxhash..."
    echo ""
    ;;
  *)
    echo "Unknown command: $CMD"
    echo "Run 'basemate help' for usage."
    exit 1
    ;;
esac

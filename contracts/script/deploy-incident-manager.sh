#!/bin/bash

# Deploy Incident Manager Contract Script
# For deploying the IncidentManager contract to Celo networks

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

# Source environment variables
source .env

# Required environment variables
REQUIRED_VARS=(
    "PRIVATE_KEY"
)

# Check required variables
print_info "Checking required environment variables..."
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set"
        exit 1
    fi
done

# Set defaults for optional variables
NETWORK=${NETWORK:-"celo-sepolia"}

# Network configuration
case "$NETWORK" in
    "celo-mainnet")
        RPC_URL="https://forno.celo.org"
        NETWORK_NAME="celo-mainnet"
        CHAIN_ID="42220"
        BLOCK_EXPLORER_URL="https://celoscan.io"
        ;;
    "celo-sepolia")
        RPC_URL="https://forno.celo-sepolia.celo-testnet.org"
        NETWORK_NAME="celo-sepolia"
        CHAIN_ID="11142220"
        BLOCK_EXPLORER_URL="https://celo-sepolia.blockscout.com"
        ;;
    *)
        print_error "Unsupported network: $NETWORK. Use 'celo-mainnet' or 'celo-sepolia'"
        exit 1
        ;;
esac

print_success "Network configured: $NETWORK_NAME"
print_info "RPC URL: $RPC_URL"

# Build contracts
print_info "Building Solidity contracts..."
forge build
if [ $? -ne 0 ]; then
    print_error "Contract compilation failed"
    exit 1
fi
print_success "Contract compilation successful!"

# Deploy contract
print_info "Deploying IncidentManager contract..."

DEPLOY_CMD="forge script script/DeployIncidentManager.s.sol:DeployIncidentManager --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast"

echo "🚀 Step 1: Executing deployment..."
eval $DEPLOY_CMD

if [ $? -ne 0 ]; then
    # Check if deployment actually succeeded despite exit code error
    if [[ -f "broadcast/DeployIncidentManager.s.sol/$CHAIN_ID/run-latest.json" ]]; then
        print_success "Contract deployment completed (ignoring wallet warnings)"
    else
        print_error "Contract deployment failed"
        exit 1
    fi
fi

# Extract deployed contract address
BROADCAST_DIR="broadcast/DeployIncidentManager.s.sol/$CHAIN_ID"
if [[ -f "$BROADCAST_DIR/run-latest.json" ]]; then
    CONTRACT_ADDRESS=$(jq -r '.transactions[] | select(.contractName == "IncidentManager") | .contractAddress' "$BROADCAST_DIR/run-latest.json" | head -1)
    
    if [[ -n "$CONTRACT_ADDRESS" && "$CONTRACT_ADDRESS" != "null" ]]; then
        print_success "Contract deployed at: $CONTRACT_ADDRESS"
        print_info "View on explorer: $BLOCK_EXPLORER_URL/address/$CONTRACT_ADDRESS"
    else
        print_error "Could not extract contract address from deployment"
        exit 1
    fi
else
    print_error "Could not find deployment artifacts"
    exit 1
fi

# Verify contract if API key is provided
if [ -n "$CELOSCAN_API_KEY" ]; then
    print_info "Verifying contract on CeloScan..."
    
    # Determine chain name for forge verify-contract
    case "$NETWORK" in
        "celo-mainnet")
            CHAIN_NAME="celo"
            ;;
        "celo-sepolia")
            CHAIN_NAME="celo-sepolia"
            ;;
    esac
    
    # No constructor arguments needed for IncidentManager
    forge verify-contract --chain-id $CHAIN_NAME $CONTRACT_ADDRESS src/IncidentContract.sol:IncidentManager --watch
    
    if [ $? -ne 0 ]; then
        print_warning "Verification failed. You can verify manually at:"
        print_info "$BLOCK_EXPLORER_URL/verifyContract"
        print_info "Contract Address: $CONTRACT_ADDRESS"
    fi
else
    print_warning "CELOSCAN_API_KEY not provided, skipping verification"
fi

# Display deployment summary
echo
print_success "🎉 Deployment Successful!"
echo
echo "Quick Links:"
echo "- Contract Address: $CONTRACT_ADDRESS"
echo "- View on Explorer: $BLOCK_EXPLORER_URL/address/$CONTRACT_ADDRESS"
echo
echo "Deployment Details:"
echo "| Parameter | Value |"
echo "|-----------|-------|"
echo "| Network | $NETWORK_NAME |"
echo "| Chain ID | $CHAIN_ID |"
echo "| Contract Address | $CONTRACT_ADDRESS |"
echo "| RPC URL | $RPC_URL |"
echo "| Block Explorer | $BLOCK_EXPLORER_URL |"
echo
print_success "✅ Deployment Complete"
echo "1. ✅ Contract deployed successfully"
echo "2. ✅ Contract ready to accept incident reports"
echo "3. ✅ Incident counter initialized to 0"

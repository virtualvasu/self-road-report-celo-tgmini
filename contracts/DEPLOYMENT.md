# Deployment Guide

This guide covers deploying the smart contracts in this repository to Celo networks using Foundry.

## Contracts

1. **ProofOfHuman** - Self Protocol verification integration for human verification
2. **IncidentManager** - Road incident reporting and management system

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Private key with funds on Celo Sepolia testnet or Celo mainnet
- `jq` command-line JSON processor (`sudo apt install jq` on Ubuntu/Debian)

### For Celo Sepolia
You need Foundry version 0.3.0:
```bash
foundryup --install 0.3.0
```

## Setup

1. **Copy environment file:**
```bash
cd contracts
cp .env.example .env
```

2. **Configure `.env` file:**
```bash
# Required: Your deployment private key
PRIVATE_KEY=0xyour_private_key_here

# Network selection
NETWORK=celo-sepolia  # or celo-mainnet

# Optional: For contract verification
CELOSCAN_API_KEY=your_api_key_here

# For ProofOfHuman only
SCOPE_SEED="self-workshop"
IDENTITY_VERIFICATION_HUB_ADDRESS=0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74
```

3. **Install dependencies:**
```bash
forge install
```

4. **Build contracts:**
```bash
forge build
```

## Network Details

### Celo Sepolia Testnet
- Chain ID: `11142220`
- RPC URL: `https://forno.celo-sepolia.celo-testnet.org`
- Explorer: https://celo-sepolia.blockscout.com
- Self Hub: `0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74`

### Celo Mainnet
- Chain ID: `42220`
- RPC URL: `https://forno.celo.org`
- Explorer: https://celoscan.io
- Self Hub: `0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF`

## Deploying Contracts

### Deploy ProofOfHuman

The ProofOfHuman contract integrates with Self Protocol for human verification.

**Using the bash script:**
```bash
cd contracts
./script/deploy-proof-of-human.sh
```

**Using Foundry directly:**
```bash
cd contracts
forge script script/DeployProofOfHuman.s.sol:DeployProofOfHuman \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org \
  --private-key $PRIVATE_KEY \
  --broadcast
```

**Configuration:**
The contract is deployed with these verification requirements:
- Minimum age: 18 years old
- Forbidden countries: United States (USA)
- OFAC screening: Disabled

### Deploy IncidentManager

The IncidentManager contract manages road incident reports.

**Using the bash script:**
```bash
cd contracts
./script/deploy-incident-manager.sh
```

**Using Foundry directly:**
```bash
cd contracts
forge script script/DeployIncidentManager.s.sol:DeployIncidentManager \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org \
  --private-key $PRIVATE_KEY \
  --broadcast
```

## Verifying Contracts

Contract verification happens automatically if `CELOSCAN_API_KEY` is set in `.env`.

**Manual verification for ProofOfHuman:**
```bash
forge verify-contract \
  --chain-id celo-sepolia \
  --constructor-args $(cast abi-encode "constructor(address,string,(uint256,string[],bool))" \
    0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74 \
    "self-workshop" \
    "(18,[\"USA\"],false)") \
  <CONTRACT_ADDRESS> \
  src/ProofOfHuman.sol:ProofOfHuman
```

**Manual verification for IncidentManager:**
```bash
forge verify-contract \
  --chain-id celo-sepolia \
  <CONTRACT_ADDRESS> \
  src/IncidentContract.sol:IncidentManager
```

## Deployment Artifacts

Deployment artifacts are stored in:
```
broadcast/<ScriptName>/<ChainID>/run-latest.json
```

For example:
- `broadcast/DeployProofOfHuman.s.sol/11142220/run-latest.json`
- `broadcast/DeployIncidentManager.s.sol/11142220/run-latest.json`

## Troubleshooting

### "Failed to get EIP-1559 fees"
This is common on Celo and usually doesn't prevent deployment. The scripts handle this gracefully.

### "Contract deployment failed"
- Check that you have sufficient funds in your wallet
- Verify your PRIVATE_KEY is correct and has the `0x` prefix
- Ensure you're using the correct RPC URL for your network

### "Verification failed"
- Make sure CELOSCAN_API_KEY is set correctly
- Constructor arguments must match exactly what was used during deployment
- Wait a few minutes after deployment before verifying

### Foundry version issues on Celo Sepolia
If you see errors like "unsupported chain", install Foundry 0.3.0:
```bash
foundryup --install 0.3.0
```

## Testing Locally

You can test deployments on Anvil (local testnet):

```bash
# Start Anvil
anvil

# In another terminal, deploy using Anvil's default private key
forge script script/DeployIncidentManager.s.sol:DeployIncidentManager \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

## Contract Interaction

After deployment, you can interact with contracts using `cast`:

**IncidentManager:**
```bash
# Report an incident
cast send <CONTRACT_ADDRESS> "reportIncident(string)" "Road blocked due to fallen tree" \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org \
  --private-key $PRIVATE_KEY

# Get incident by ID
cast call <CONTRACT_ADDRESS> "getIncident(uint256)(uint256,string,address,uint256)" 1 \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org
```

**ProofOfHuman:**
```bash
# Check if user is verified
cast call <CONTRACT_ADDRESS> "isUserVerified(address)(bool)" <USER_ADDRESS> \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org

# Get verification config ID
cast call <CONTRACT_ADDRESS> "verificationConfigId()(bytes32)" \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org
```

## Security Notes

⚠️ **Important:**
- Never commit your `.env` file with real private keys
- The `.gitignore` is configured to exclude `.env` files
- Use separate wallets for testing and production
- Always test on testnet before deploying to mainnet

## Additional Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Celo Documentation](https://docs.celo.org/)
- [Self Protocol Documentation](https://docs.self.xyz/)

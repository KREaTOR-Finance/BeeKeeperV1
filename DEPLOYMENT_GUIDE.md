# BeeHive Ecosystem Deployment Guide

This guide provides step-by-step instructions for deploying the BeeHive ecosystem contracts to the Binance Smart Chain (BSC) or any other EVM-compatible blockchain.

## Prerequisites

- Node.js v14+ and npm
- Hardhat
- A wallet with sufficient funds for deployment
- API keys for block explorers (optional, for contract verification)

## Setup

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/beehive.git
cd beehive
npm install
```

2. Configure your deployment secrets:

Create a `scripts/deploy-secrets.js` file with the following structure:

```javascript
module.exports = {
  bscTestnet: {
    deployer: {
      address: "0xYourDeployerAddress",
      privateKey: "0xYourPrivateKey"
    },
    marketingWallet: "0xMarketingWalletAddress",
    stakingRewardsPool: "0xStakingRewardsPoolAddress",
    pancakeswapRouter: "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3" // BSC Testnet PancakeSwap Router
  },
  bscMainnet: {
    deployer: {
      address: "0xYourDeployerAddress",
      privateKey: "0xYourPrivateKey"
    },
    marketingWallet: "0xMarketingWalletAddress",
    stakingRewardsPool: "0xStakingRewardsPoolAddress",
    pancakeswapRouter: "0x10ED43C718714eb63d5aA57B78B54704E256024E" // BSC Mainnet PancakeSwap Router
  }
};
```

3. Create a `.env` file for API keys:

```
BSCSCAN_API_KEY=your_bscscan_api_key
```

## Deployment Process

The BeeHive ecosystem is deployed using a split factory approach to avoid contract size limitations. The deployment process is as follows:

### 1. Compile Contracts

```bash
npx hardhat compile
```

### 2. Deploy to Testnet

```bash
npx hardhat run scripts/deploy.js --network bscTestnet
```

### 3. Deploy to Mainnet

```bash
npx hardhat run scripts/deploy.js --network bscMainnet
```

## Deployment Script Explanation

The `deploy.js` script performs the following steps:

1. **Deploy BeeTokenFactory**
   - Creates a factory contract for token deployment

2. **Deploy Tokens**
   - Uses BeeTokenFactory to deploy BeeToken and HunyToken
   - Stores token addresses for later use

3. **Deploy BeeEcosystemFactory**
   - Creates a factory contract for ecosystem deployment

4. **Deploy Ecosystem Contracts**
   - Uses BeeEcosystemFactory to deploy HiveManager, QueenColony, Marketplace, and EmissionsController
   - Stores contract addresses for later use

5. **Deploy BeeHivesFactory**
   - Creates a factory contract for hives deployment

6. **Deploy Hives Contracts**
   - Uses BeeHivesFactory to deploy BeeHives and BeeStaking
   - Stores contract addresses for later use

7. **Set Up Permissions**
   - Grants minter roles to appropriate contracts
   - Sets up any other required permissions

8. **Save Deployment Information**
   - Saves all contract addresses and deployment details to a JSON file

## Contract Verification

After deployment, you can verify the contracts on BscScan:

```bash
npx hardhat verify --network bscTestnet DEPLOYED_CONTRACT_ADDRESS [CONSTRUCTOR_ARGS]
```

For example, to verify the BeeTokenFactory:

```bash
npx hardhat verify --network bscTestnet 0xYourBeeTokenFactoryAddress
```

## Post-Deployment Steps

After deploying the contracts, you should:

1. **Verify Ownership**
   - Ensure all contracts have the correct owner

2. **Test Basic Functionality**
   - Create a test hive
   - Stake some tokens
   - Verify rewards are being generated

3. **Set Up Frontend**
   - Update your frontend application with the new contract addresses

4. **Monitor Initial Activity**
   - Watch for any unusual behavior or errors
   - Be prepared to respond to issues

## Troubleshooting

### Common Issues

1. **Out of Gas Errors**
   - Increase the gas limit in hardhat.config.js
   - Check for infinite loops or inefficient code

2. **Contract Size Errors**
   - Ensure you're using the split factory approach
   - Optimize your contracts further if needed

3. **Permission Issues**
   - Verify that roles are correctly assigned
   - Check that function calls are made from authorized addresses

### Getting Help

If you encounter issues during deployment, you can:

- Check the Hardhat documentation
- Review the BeeHive contract documentation
- Open an issue on the GitHub repository

## Conclusion

By following this guide, you should be able to successfully deploy the BeeHive ecosystem to the Binance Smart Chain or any other EVM-compatible blockchain. Remember to always test thoroughly on a testnet before deploying to mainnet. 
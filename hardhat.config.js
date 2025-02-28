require("@nomicfoundation/hardhat-toolbox");
const secrets = require("./scripts/deploy-secrets");

// Load environment variables if present
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1
      }
    }
  },
  networks: {
    // BSC Mainnet
    bscMainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      accounts: [secrets.bscMainnet.deployer.privateKey],
      gasPrice: 5000000000 // 5 gwei
    },
    // BSC Testnet
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: [secrets.bscTestnet.deployer.privateKey],
      gasPrice: 10000000000 // 10 gwei
    },
    // Hardhat local network for testing
    hardhat: {
      // Using local network for testing without forking
    }
  },
  etherscan: {
    apiKey: {
      bscMainnet: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || ""
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
}; 
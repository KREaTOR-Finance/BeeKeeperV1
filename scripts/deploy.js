// SPDX-License-Identifier: MIT
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const secrets = require("./deploy-secrets");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get contract factories
  const BeeTokenFactory = await ethers.getContractFactory("BeeTokenFactory");
  const BeeEcosystemFactory = await ethers.getContractFactory("BeeEcosystemFactory");
  const BeeHivesFactory = await ethers.getContractFactory("BeeHivesFactory");

  // Deploy mock contracts for testing (replace with real addresses in production)
  console.log("Deploying mock contracts...");
  const MockUSDC = await ethers.getContractFactory("MockERC20");
  const usdcToken = await MockUSDC.deploy("USD Coin", "USDC", 18);
  await usdcToken.waitForDeployment();
  console.log("MockUSDC deployed to:", await usdcToken.getAddress());

  const MockPancakeRouter = await ethers.getContractFactory("MockPancakeRouter");
  const pancakeRouter = await MockPancakeRouter.deploy();
  await pancakeRouter.waitForDeployment();
  console.log("MockPancakeRouter deployed to:", await pancakeRouter.getAddress());

  // Set up wallets (replace with real addresses in production)
  const marketingWallet = deployer.address;
  const stakingRewardsPool = deployer.address;
  console.log("Marketing Wallet:", marketingWallet);
  console.log("Staking Rewards Pool:", stakingRewardsPool);

  // Step 1: Deploy BeeTokenFactory
  console.log("\nDeploying BeeTokenFactory...");
  const beeTokenFactory = await BeeTokenFactory.deploy();
  await beeTokenFactory.waitForDeployment();
  console.log("BeeTokenFactory deployed to:", await beeTokenFactory.getAddress());

  // Step 2: Deploy tokens using BeeTokenFactory
  console.log("\nDeploying tokens...");
  const deployTokensTx = await beeTokenFactory.deployTokens(
    marketingWallet,
    await pancakeRouter.getAddress()
  );
  await deployTokensTx.wait();
  console.log("Tokens deployed successfully");

  const beeTokenAddress = await beeTokenFactory.beeToken();
  const hunyTokenAddress = await beeTokenFactory.hunyToken();
  console.log("BeeToken deployed to:", beeTokenAddress);
  console.log("HunyToken deployed to:", hunyTokenAddress);

  // Step 3: Deploy BeeEcosystemFactory
  console.log("\nDeploying BeeEcosystemFactory...");
  const beeEcosystemFactory = await BeeEcosystemFactory.deploy();
  await beeEcosystemFactory.waitForDeployment();
  console.log("BeeEcosystemFactory deployed to:", await beeEcosystemFactory.getAddress());

  // Step 4: Deploy ecosystem contracts using BeeEcosystemFactory
  console.log("\nDeploying ecosystem contracts...");
  const deployEcosystemTx = await beeEcosystemFactory.deployEcosystem(
    beeTokenAddress,
    hunyTokenAddress,
    await usdcToken.getAddress(),
    marketingWallet,
    stakingRewardsPool
  );
  await deployEcosystemTx.wait();
  console.log("Ecosystem contracts deployed successfully");

  const hiveManagerAddress = await beeEcosystemFactory.hiveManager();
  const queenColonyAddress = await beeEcosystemFactory.queenColony();
  const marketplaceAddress = await beeEcosystemFactory.marketplace();
  const emissionsControllerAddress = await beeEcosystemFactory.emissionsController();
  console.log("HiveManager deployed to:", hiveManagerAddress);
  console.log("QueenColony deployed to:", queenColonyAddress);
  console.log("Marketplace deployed to:", marketplaceAddress);
  console.log("EmissionsController deployed to:", emissionsControllerAddress);

  // Step 5: Deploy BeeHivesFactory
  console.log("\nDeploying BeeHivesFactory...");
  const beeHivesFactory = await BeeHivesFactory.deploy();
  await beeHivesFactory.waitForDeployment();
  console.log("BeeHivesFactory deployed to:", await beeHivesFactory.getAddress());

  // Step 6: Deploy BeeHives and BeeStaking using BeeHivesFactory
  console.log("\nDeploying BeeHives and BeeStaking...");
  const deployHivesTx = await beeHivesFactory.deployHives(
    beeTokenAddress,
    await usdcToken.getAddress(),
    await pancakeRouter.getAddress(),
    marketingWallet,
    stakingRewardsPool
  );
  await deployHivesTx.wait();
  console.log("BeeHives and BeeStaking deployed successfully");

  const beeHivesAddress = await beeHivesFactory.beeHives();
  const beeStakingAddress = await beeHivesFactory.beeStaking();
  console.log("BeeHives deployed to:", beeHivesAddress);
  console.log("BeeStaking deployed to:", beeStakingAddress);

  // Step 7: Set up permissions
  console.log("\nSetting up permissions...");
  const BeeToken = await ethers.getContractFactory("BeeToken");
  const beeToken = BeeToken.attach(beeTokenAddress);
  const MINTER_ROLE = await beeToken.MINTER_ROLE();

  // Grant minter roles to BeeHives and BeeStaking
  await beeToken.grantRole(MINTER_ROLE, beeHivesAddress);
  await beeToken.grantRole(MINTER_ROLE, beeStakingAddress);
  console.log("Minter roles granted to BeeHives and BeeStaking");

  console.log("\nDeployment complete!");
  console.log("\nContract Addresses Summary:");
  console.log("----------------------------");
  console.log("BeeToken:", beeTokenAddress);
  console.log("HunyToken:", hunyTokenAddress);
  console.log("HiveManager:", hiveManagerAddress);
  console.log("QueenColony:", queenColonyAddress);
  console.log("Marketplace:", marketplaceAddress);
  console.log("EmissionsController:", emissionsControllerAddress);
  console.log("BeeHives:", beeHivesAddress);
  console.log("BeeStaking:", beeStakingAddress);

  // Save deployment information
  const deploymentInfo = {
    network: "bscTestnet",
    timestamp: new Date().toISOString(),
    factories: {
      beeTokenFactory: await beeTokenFactory.getAddress(),
      beeEcosystemFactory: await beeEcosystemFactory.getAddress(),
      beeHivesFactory: await beeHivesFactory.getAddress()
    },
    contracts: {
      beeToken: beeTokenAddress,
      hunyToken: hunyTokenAddress,
      hiveManager: hiveManagerAddress,
      queenColony: queenColonyAddress,
      marketplace: marketplaceAddress,
      emissionsController: emissionsControllerAddress,
      beeHives: beeHivesAddress,
      beeStaking: beeStakingAddress
    }
  };
  
  const deploymentPath = path.join(__dirname, `../deployments/${Date.now()}_bscTestnet.json`);
  fs.mkdirSync(path.join(__dirname, "../deployments"), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment information saved to: ${deploymentPath}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
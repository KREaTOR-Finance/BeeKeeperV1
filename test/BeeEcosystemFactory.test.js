const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BeeEcosystemFactory", function () {
  let beeEcosystemFactory;
  let owner;
  let addr1;
  let addr2;
  let marketingWallet;
  let stakingRewardsPool;
  let mockUSDC;
  let mockBeeToken;
  let mockHunyToken;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, marketingWallet, stakingRewardsPool] = await ethers.getSigners();

    // Deploy mock tokens
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockToken.deploy("Mock USDC", "mUSDC", 6);
    await mockUSDC.waitForDeployment();
    
    mockBeeToken = await MockToken.deploy("Mock BeeToken", "mBEE", 18);
    await mockBeeToken.waitForDeployment();
    
    mockHunyToken = await MockToken.deploy("Mock HunyToken", "mHUNY", 18);
    await mockHunyToken.waitForDeployment();

    // Deploy BeeEcosystemFactory
    const BeeEcosystemFactory = await ethers.getContractFactory("BeeEcosystemFactory");
    beeEcosystemFactory = await BeeEcosystemFactory.deploy();
    await beeEcosystemFactory.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await beeEcosystemFactory.owner()).to.equal(owner.address);
    });

    it("Should initialize with empty contract addresses", async function () {
      expect(await beeEcosystemFactory.hiveManager()).to.equal(ethers.ZeroAddress);
      expect(await beeEcosystemFactory.queenColony()).to.equal(ethers.ZeroAddress);
      expect(await beeEcosystemFactory.marketplace()).to.equal(ethers.ZeroAddress);
      expect(await beeEcosystemFactory.emissionsController()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("deployEcosystem", function () {
    it("Should deploy the ecosystem contracts", async function () {
      await expect(
        beeEcosystemFactory.deployEcosystem(
          await mockBeeToken.getAddress(),
          await mockHunyToken.getAddress(),
          await mockUSDC.getAddress(),
          marketingWallet.address,
          stakingRewardsPool.address
        )
      ).to.emit(beeEcosystemFactory, "EcosystemDeployed");

      // Check that all contracts were deployed
      expect(await beeEcosystemFactory.hiveManager()).to.not.equal(ethers.ZeroAddress);
      expect(await beeEcosystemFactory.queenColony()).to.not.equal(ethers.ZeroAddress);
      expect(await beeEcosystemFactory.marketplace()).to.not.equal(ethers.ZeroAddress);
      expect(await beeEcosystemFactory.emissionsController()).to.not.equal(ethers.ZeroAddress);
    });

    it("Should revert if called by non-owner", async function () {
      await expect(
        beeEcosystemFactory.connect(addr1).deployEcosystem(
          await mockBeeToken.getAddress(),
          await mockHunyToken.getAddress(),
          await mockUSDC.getAddress(),
          marketingWallet.address,
          stakingRewardsPool.address
        )
      ).to.be.reverted;
    });

    it("Should revert if any address is zero", async function () {
      await expect(
        beeEcosystemFactory.deployEcosystem(
          ethers.ZeroAddress,
          await mockHunyToken.getAddress(),
          await mockUSDC.getAddress(),
          marketingWallet.address,
          stakingRewardsPool.address
        )
      ).to.be.revertedWith("Invalid BeeToken address");

      await expect(
        beeEcosystemFactory.deployEcosystem(
          await mockBeeToken.getAddress(),
          ethers.ZeroAddress,
          await mockUSDC.getAddress(),
          marketingWallet.address,
          stakingRewardsPool.address
        )
      ).to.be.revertedWith("Invalid HunyToken address");

      await expect(
        beeEcosystemFactory.deployEcosystem(
          await mockBeeToken.getAddress(),
          await mockHunyToken.getAddress(),
          ethers.ZeroAddress,
          marketingWallet.address,
          stakingRewardsPool.address
        )
      ).to.be.revertedWith("Invalid USDC address");

      await expect(
        beeEcosystemFactory.deployEcosystem(
          await mockBeeToken.getAddress(),
          await mockHunyToken.getAddress(),
          await mockUSDC.getAddress(),
          ethers.ZeroAddress,
          stakingRewardsPool.address
        )
      ).to.be.revertedWith("Invalid marketing wallet address");

      await expect(
        beeEcosystemFactory.deployEcosystem(
          await mockBeeToken.getAddress(),
          await mockHunyToken.getAddress(),
          await mockUSDC.getAddress(),
          marketingWallet.address,
          ethers.ZeroAddress
        )
      ).to.be.revertedWith("Invalid staking rewards pool address");
    });

    it("Should not allow redeployment", async function () {
      // First deployment
      await beeEcosystemFactory.deployEcosystem(
        await mockBeeToken.getAddress(),
        await mockHunyToken.getAddress(),
        await mockUSDC.getAddress(),
        marketingWallet.address,
        stakingRewardsPool.address
      );

      // Second deployment should fail
      await expect(
        beeEcosystemFactory.deployEcosystem(
          await mockBeeToken.getAddress(),
          await mockHunyToken.getAddress(),
          await mockUSDC.getAddress(),
          marketingWallet.address,
          stakingRewardsPool.address
        )
      ).to.be.revertedWith("Ecosystem already deployed");
    });
  });
}); 
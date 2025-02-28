const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BeeHivesFactory", function () {
  let BeeHivesFactory, beeHivesFactory;
  let BeeToken, beeToken;
  let owner, user1, marketingWallet, stakingRewardsPool;
  let usdcToken, pancakeRouter;

  beforeEach(async function () {
    // Get signers
    [owner, user1, marketingWallet, stakingRewardsPool] = await ethers.getSigners();

    // Deploy mock USDC token
    const MockToken = await ethers.getContractFactory("MockERC20");
    usdcToken = await MockToken.deploy("USD Coin", "USDC", 18);
    await usdcToken.waitForDeployment();

    // Deploy mock PancakeSwap router
    const MockPancakeRouter = await ethers.getContractFactory("MockPancakeRouter");
    pancakeRouter = await MockPancakeRouter.deploy();
    await pancakeRouter.waitForDeployment();

    // Deploy BeeToken
    BeeToken = await ethers.getContractFactory("BeeToken");
    beeToken = await BeeToken.deploy(marketingWallet.address, await pancakeRouter.getAddress());
    await beeToken.waitForDeployment();

    // Deploy BeeHivesFactory
    BeeHivesFactory = await ethers.getContractFactory("BeeHivesFactory");
    beeHivesFactory = await BeeHivesFactory.deploy();
    await beeHivesFactory.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await beeHivesFactory.owner()).to.equal(owner.address);
    });

    it("Should initialize with empty contract addresses", async function () {
      expect(await beeHivesFactory.beeHives()).to.equal(ethers.ZeroAddress);
      expect(await beeHivesFactory.beeStaking()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("deployHives", function () {
    it("Should deploy both contracts", async function () {
      await beeHivesFactory.deployHives(
        await beeToken.getAddress(),
        await usdcToken.getAddress(),
        await pancakeRouter.getAddress(),
        marketingWallet.address,
        stakingRewardsPool.address
      );

      expect(await beeHivesFactory.beeHives()).to.not.equal(ethers.ZeroAddress);
      expect(await beeHivesFactory.beeStaking()).to.not.equal(ethers.ZeroAddress);
    });

    it("Should revert if called by non-owner", async function () {
      await expect(
        beeHivesFactory.connect(user1).deployHives(
          await beeToken.getAddress(),
          await usdcToken.getAddress(),
          await pancakeRouter.getAddress(),
          marketingWallet.address,
          stakingRewardsPool.address
        )
      ).to.be.reverted;
    });

    it("Should revert if any address is zero", async function () {
      await expect(
        beeHivesFactory.deployHives(
          ethers.ZeroAddress,
          await usdcToken.getAddress(),
          await pancakeRouter.getAddress(),
          marketingWallet.address,
          stakingRewardsPool.address
        )
      ).to.be.revertedWith("Invalid BeeToken address");
    });

    it("Should not allow redeployment", async function () {
      await beeHivesFactory.deployHives(
        await beeToken.getAddress(),
        await usdcToken.getAddress(),
        await pancakeRouter.getAddress(),
        marketingWallet.address,
        stakingRewardsPool.address
      );

      await expect(
        beeHivesFactory.deployHives(
          await beeToken.getAddress(),
          await usdcToken.getAddress(),
          await pancakeRouter.getAddress(),
          marketingWallet.address,
          stakingRewardsPool.address
        )
      ).to.be.revertedWith("Hives already deployed");
    });
  });
}); 
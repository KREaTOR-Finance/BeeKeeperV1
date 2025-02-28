const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BeeTokenFactory", function () {
  let beeTokenFactory;
  let owner;
  let addr1;
  let addr2;
  let marketingWallet;
  let mockRouter;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, marketingWallet] = await ethers.getSigners();

    // Deploy mock PancakeSwap router
    const MockRouter = await ethers.getContractFactory("MockPancakeRouter");
    mockRouter = await MockRouter.deploy();
    await mockRouter.waitForDeployment();

    // Deploy BeeTokenFactory
    const BeeTokenFactory = await ethers.getContractFactory("BeeTokenFactory");
    beeTokenFactory = await BeeTokenFactory.deploy();
    await beeTokenFactory.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await beeTokenFactory.owner()).to.equal(owner.address);
    });

    it("Should initialize with empty token addresses", async function () {
      expect(await beeTokenFactory.beeToken()).to.equal(ethers.ZeroAddress);
      expect(await beeTokenFactory.hunyToken()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("deployTokens", function () {
    it("Should deploy both tokens", async function () {
      await expect(
        beeTokenFactory.deployTokens(
          marketingWallet.address,
          await mockRouter.getAddress()
        )
      ).to.emit(beeTokenFactory, "TokensDeployed");

      // Check that tokens were deployed
      expect(await beeTokenFactory.beeToken()).to.not.equal(ethers.ZeroAddress);
      expect(await beeTokenFactory.hunyToken()).to.not.equal(ethers.ZeroAddress);
    });

    it("Should revert if called by non-owner", async function () {
      await expect(
        beeTokenFactory.connect(addr1).deployTokens(
          marketingWallet.address,
          await mockRouter.getAddress()
        )
      ).to.be.reverted;
    });

    it("Should revert if any address is zero", async function () {
      await expect(
        beeTokenFactory.deployTokens(
          ethers.ZeroAddress,
          await mockRouter.getAddress()
        )
      ).to.be.revertedWith("Invalid marketing wallet address");

      await expect(
        beeTokenFactory.deployTokens(
          marketingWallet.address,
          ethers.ZeroAddress
        )
      ).to.be.revertedWith("Invalid PancakeSwap router address");
    });

    it("Should not allow redeployment", async function () {
      // First deployment
      await beeTokenFactory.deployTokens(
        marketingWallet.address,
        await mockRouter.getAddress()
      );

      // Second deployment should fail
      await expect(
        beeTokenFactory.deployTokens(
          marketingWallet.address,
          await mockRouter.getAddress()
        )
      ).to.be.revertedWith("Tokens already deployed");
    });
  });
}); 
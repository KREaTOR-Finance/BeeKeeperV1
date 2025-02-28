const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BeeHives Protocol", function () {
  let BeeToken, beeToken;
  let BeeHives, beeHives;
  let BeeStaking, beeStaking;
  let owner, user1, user2, marketingWallet, stakingRewardsPool;
  let pancakeRouter, usdcToken;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, marketingWallet, stakingRewardsPool] = await ethers.getSigners();

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

    // Deploy BeeHives
    BeeHives = await ethers.getContractFactory("BeeHives");
    beeHives = await BeeHives.deploy(
      await beeToken.getAddress(),
      await usdcToken.getAddress(),
      await pancakeRouter.getAddress(),
      marketingWallet.address,
      stakingRewardsPool.address
    );
    await beeHives.waitForDeployment();

    // Deploy BeeStaking
    BeeStaking = await ethers.getContractFactory("BeeStaking");
    beeStaking = await BeeStaking.deploy(await beeToken.getAddress());
    await beeStaking.waitForDeployment();

    // Grant minter role to BeeHives and BeeStaking
    const MINTER_ROLE = await beeToken.MINTER_ROLE();
    await beeToken.grantRole(MINTER_ROLE, await beeHives.getAddress());
    await beeToken.grantRole(MINTER_ROLE, await beeStaking.getAddress());

    // Mint some BEE tokens to users for testing
    await beeToken.mint(owner.address, ethers.parseEther("1000"));
    await beeToken.transfer(user1.address, ethers.parseEther("100"));
    await beeToken.transfer(user2.address, ethers.parseEther("100"));

    // Mint some USDC to users for testing
    await usdcToken.mint(user1.address, ethers.parseEther("1000"));
    await usdcToken.mint(user2.address, ethers.parseEther("1000"));

    // Approve BeeHives to spend tokens
    await beeToken.connect(user1).approve(await beeHives.getAddress(), ethers.parseEther("100"));
    await beeToken.connect(user2).approve(await beeHives.getAddress(), ethers.parseEther("100"));
    await usdcToken.connect(user1).approve(await beeHives.getAddress(), ethers.parseEther("1000"));
    await usdcToken.connect(user2).approve(await beeHives.getAddress(), ethers.parseEther("1000"));
  });

  describe("BeeToken", function () {
    it("Should have correct name and symbol", async function () {
      expect(await beeToken.name()).to.equal("Bee Token");
      expect(await beeToken.symbol()).to.equal("BEE");
    });

    it("Should allow minting by authorized roles", async function () {
      const initialBalance = await beeToken.balanceOf(user1.address);
      await beeHives.connect(user1).createHive();
      
      // Fast forward time to generate emissions
      await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
      await ethers.provider.send("evm_mine");
      
      await beeHives.connect(user1).claimRewards();
      
      const newBalance = await beeToken.balanceOf(user1.address);
      // We spent 10 BEE to create a hive, but should have earned some back
      // The balance should be greater than (initialBalance - 10 BEE)
      const minExpectedBalance = BigInt(initialBalance) - BigInt(ethers.parseEther("10"));
      expect(BigInt(newBalance)).to.be.gt(minExpectedBalance);
    });
  });

  describe("BeeHives", function () {
    it("Should allow populating hives with BEE tokens", async function () {
      await beeHives.connect(user1).createHive();
      const userHives = await beeHives.getHivesByOwner(user1.address);
      expect(userHives.length).to.equal(1);
      expect(await beeHives.totalHives()).to.equal(1);
    });

    it("Should allow buying hives with USDC", async function () {
      await beeHives.connect(user1).createHiveWithUSDC();
      const userHives = await beeHives.getHivesByOwner(user1.address);
      expect(userHives.length).to.equal(1);
      expect(await beeHives.totalHives()).to.equal(1);
    });

    it("Should calculate emissions correctly", async function () {
      await beeHives.connect(user1).createHive();
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
      await ethers.provider.send("evm_mine");
      
      const emissions = await beeHives.getPendingRewards(user1.address);
      expect(emissions).to.equal(ethers.parseEther("1")); // 1 BEE per day per hive
    });

    it("Should allow claiming emissions", async function () {
      await beeHives.connect(user1).createHive();
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
      await ethers.provider.send("evm_mine");
      
      await beeHives.connect(user1).claimRewards();
      expect(await beeToken.balanceOf(user1.address)).to.be.gt(ethers.parseEther("90")); // Started with 100, spent 10 on hive
    });

    it("Should allow compounding emissions", async function () {
      // Populate initial hive
      await beeHives.connect(user1).createHive();
      
      // Fast forward time to generate enough emissions for a new hive
      await ethers.provider.send("evm_increaseTime", [86400 * 10]); // 10 days to get enough for a new hive
      await ethers.provider.send("evm_mine");
      
      // Compound emissions
      await beeHives.connect(user1).compoundRewards();
      
      // Should have 2 hives now
      const userHives = await beeHives.getHivesByOwner(user1.address);
      expect(userHives.length).to.equal(2);
    });
  });

  describe("BeeStaking", function () {
    it("Should allow staking BEE tokens", async function () {
      // Approve BeeStaking to spend tokens
      await beeToken.connect(user1).approve(await beeStaking.getAddress(), ethers.parseEther("50"));
      
      // Stake tokens
      await beeStaking.connect(user1).stake(ethers.parseEther("50"));
      
      const stakeInfo = await beeStaking.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(ethers.parseEther("50"));
    });

    it("Should calculate rewards correctly", async function () {
      // Approve BeeStaking to spend tokens
      await beeToken.connect(user1).approve(await beeStaking.getAddress(), ethers.parseEther("50"));
      
      // Stake tokens
      await beeStaking.connect(user1).stake(ethers.parseEther("50"));
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [86400 * 30]); // 30 days
      await ethers.provider.send("evm_mine");
      
      const pendingRewards = await beeStaking.calculateReward(user1.address);
      expect(pendingRewards).to.be.gt(0);
    });

    it("Should allow claiming rewards", async function () {
      // Approve BeeStaking to spend tokens
      await beeToken.connect(user1).approve(await beeStaking.getAddress(), ethers.parseEther("50"));
      
      // Stake tokens
      await beeStaking.connect(user1).stake(ethers.parseEther("50"));
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [86400 * 30]); // 30 days
      await ethers.provider.send("evm_mine");
      
      const initialBalance = await beeToken.balanceOf(user1.address);
      await beeStaking.connect(user1).claimReward();
      const newBalance = await beeToken.balanceOf(user1.address);
      
      expect(newBalance).to.be.gt(initialBalance);
    });

    it("Should allow unstaking tokens", async function () {
      // Approve BeeStaking to spend tokens
      await beeToken.connect(user1).approve(await beeStaking.getAddress(), ethers.parseEther("50"));
      
      // Stake tokens
      await beeStaking.connect(user1).stake(ethers.parseEther("50"));
      
      // Fast forward time to generate rewards
      await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
      await ethers.provider.send("evm_mine");
      
      // Claim rewards first to avoid reentrancy issues
      await beeStaking.connect(user1).claimReward();
      
      // Wait a bit to avoid any timing issues
      await ethers.provider.send("evm_increaseTime", [60]); // 1 minute
      await ethers.provider.send("evm_mine");
      
      const initialBalance = await beeToken.balanceOf(user1.address);
      
      // Now unstake
      await beeStaking.connect(user1).unstake(ethers.parseEther("25"));
      
      const newBalance = await beeToken.balanceOf(user1.address);
      
      // Should have received 25 BEE tokens back
      const expectedMinBalance = BigInt(initialBalance) + BigInt(ethers.parseEther("25"));
      expect(BigInt(newBalance)).to.be.gte(expectedMinBalance);
      
      const stakeInfo = await beeStaking.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(ethers.parseEther("25"));
    });
  });
}); 
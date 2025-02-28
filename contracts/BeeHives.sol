// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./BeeToken.sol";
import "./IUSDC.sol";
import "./IPancakeRouter.sol";

contract BeeHives is Ownable, ReentrancyGuard {
    // Token references
    address payable public beeToken;
    address public usdcToken;
    address public pancakeRouter;
    
    // Wallets
    address public marketingWallet;
    address public stakingRewardsPool;
    
    // Constants
    uint256 public constant HIVE_COST_BEE = 10 * 10**18; // 10 BEE
    uint256 public constant HIVE_COST_USDC = 20 * 10**18; // 20 USDC (assuming 18 decimals)
    uint256 public constant MAX_HIVES = 1000000; // 1 million max hives
    uint256 public constant DAILY_EMISSION_RATE = 1 * 10**18; // 1 BEE per day per hive
    
    // State variables
    uint256 public totalHives;
    uint256 public nextHiveId = 1;
    mapping(uint256 => Hive) public hives;
    mapping(address => uint256[]) public userHives;
    mapping(address => uint256) public pendingRewards;
    uint256 public lastUpdateTime;
    
    // Structs
    struct Hive {
        uint256 id;
        address owner;
        uint256 creationTime;
        uint256 lastClaimTime;
    }
    
    // Events
    event HiveCreated(uint256 indexed hiveId, address indexed owner, uint256 timestamp);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsCompounded(address indexed user, uint256 amount, uint256 newHiveId);
    
    constructor(
        address _beeToken,
        address _usdcToken,
        address _pancakeRouter,
        address _marketingWallet,
        address _stakingRewardsPool
    ) Ownable() {
        beeToken = payable(_beeToken);
        usdcToken = _usdcToken;
        pancakeRouter = _pancakeRouter;
        marketingWallet = _marketingWallet;
        stakingRewardsPool = _stakingRewardsPool;
        lastUpdateTime = block.timestamp;
    }
    
    // External functions
    
    // Create a hive by spending BEE tokens
    function createHive() external nonReentrant {
        require(totalHives < MAX_HIVES, "Maximum hives reached");
        
        // Transfer BEE tokens from user to marketing wallet
        BeeToken(beeToken).transferFrom(msg.sender, marketingWallet, HIVE_COST_BEE);
        
        // Create new hive
        uint256 hiveId = nextHiveId++;
        hives[hiveId] = Hive({
            id: hiveId,
            owner: msg.sender,
            creationTime: block.timestamp,
            lastClaimTime: block.timestamp
        });
        
        userHives[msg.sender].push(hiveId);
        totalHives++;
        
        emit HiveCreated(hiveId, msg.sender, block.timestamp);
    }
    
    // Create a hive by spending USDC
    function createHiveWithUSDC() external nonReentrant {
        require(totalHives < MAX_HIVES, "Maximum hives reached");
        
        // Transfer USDC from user to contract
        IUSDC(usdcToken).transferFrom(msg.sender, address(this), HIVE_COST_USDC);
        
        // Swap half of USDC for BEE and send to staking rewards
        uint256 halfUSDC = HIVE_COST_USDC / 2;
        IUSDC(usdcToken).approve(pancakeRouter, halfUSDC);
        
        // Swap USDC for BEE
        address[] memory path = new address[](2);
        path[0] = usdcToken;
        path[1] = address(beeToken);
        
        IPancakeRouter(pancakeRouter).swapExactTokensForTokens(
            halfUSDC,
            0, // Accept any amount of BEE
            path,
            stakingRewardsPool,
            block.timestamp + 300 // 5 minutes deadline
        );
        
        // Send remaining USDC to marketing wallet
        IUSDC(usdcToken).transfer(marketingWallet, IUSDC(usdcToken).balanceOf(address(this)));
        
        // Create new hive
        uint256 hiveId = nextHiveId++;
        hives[hiveId] = Hive({
            id: hiveId,
            owner: msg.sender,
            creationTime: block.timestamp,
            lastClaimTime: block.timestamp
        });
        
        userHives[msg.sender].push(hiveId);
        totalHives++;
        
        emit HiveCreated(hiveId, msg.sender, block.timestamp);
    }
    
    // Update pending rewards for a user
    function updateRewards(address user) public {
        uint256[] memory userHiveIds = userHives[user];
        uint256 totalReward = 0;
        
        for (uint256 i = 0; i < userHiveIds.length; i++) {
            Hive storage hive = hives[userHiveIds[i]];
            
            // Calculate time since last claim
            uint256 timePassed = block.timestamp - hive.lastClaimTime;
            
            // Calculate BEE earned (1 BEE per day per hive)
            uint256 beeEarned = (timePassed * DAILY_EMISSION_RATE) / 1 days;
            
            if (beeEarned > 0) {
                totalReward += beeEarned;
                hive.lastClaimTime = block.timestamp;
            }
        }
        
        // Update pending rewards
        if (totalReward > 0) {
            pendingRewards[user] += totalReward;
        }
    }
    
    // Claim pending rewards
    function claimRewards() external nonReentrant {
        updateRewards(msg.sender);
        
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        
        pendingRewards[msg.sender] = 0;
        
        // Mint BEE tokens to user
        BeeToken(beeToken).mint(msg.sender, amount);
        
        emit RewardsClaimed(msg.sender, amount);
    }
    
    // Compound rewards into a new hive
    function compoundRewards() external nonReentrant {
        updateRewards(msg.sender);
        
        uint256 amount = pendingRewards[msg.sender];
        require(amount >= HIVE_COST_BEE, "Not enough rewards to compound");
        
        pendingRewards[msg.sender] = amount - HIVE_COST_BEE;
        
        // Create new hive
        uint256 hiveId = nextHiveId++;
        hives[hiveId] = Hive({
            id: hiveId,
            owner: msg.sender,
            creationTime: block.timestamp,
            lastClaimTime: block.timestamp
        });
        
        userHives[msg.sender].push(hiveId);
        totalHives++;
        
        emit RewardsCompounded(msg.sender, HIVE_COST_BEE, hiveId);
    }
    
    // View functions
    
    // Get all hives owned by a user
    function getHivesByOwner(address owner) external view returns (uint256[] memory) {
        return userHives[owner];
    }
    
    // Get detailed information about a hive
    function getHiveDetails(uint256 hiveId) external view returns (
        uint256 id,
        address owner,
        uint256 creationTime,
        uint256 lastClaimTime,
        uint256 pendingReward
    ) {
        Hive storage hive = hives[hiveId];
        
        // Calculate pending reward for this hive
        uint256 timePassed = block.timestamp - hive.lastClaimTime;
        uint256 beeEarned = (timePassed * DAILY_EMISSION_RATE) / 1 days;
        
        return (
            hive.id,
            hive.owner,
            hive.creationTime,
            hive.lastClaimTime,
            beeEarned
        );
    }
    
    // Get total pending rewards for a user
    function getPendingRewards(address user) external view returns (uint256) {
        uint256 pending = pendingRewards[user];
        uint256[] memory userHiveIds = userHives[user];
        
        for (uint256 i = 0; i < userHiveIds.length; i++) {
            Hive storage hive = hives[userHiveIds[i]];
            
            // Calculate time since last claim
            uint256 timePassed = block.timestamp - hive.lastClaimTime;
            
            // Calculate BEE earned (1 BEE per day per hive)
            uint256 beeEarned = (timePassed * DAILY_EMISSION_RATE) / 1 days;
            
            pending += beeEarned;
        }
        
        return pending;
    }
    
    // Admin functions
    
    // Update marketing wallet
    function setMarketingWallet(address _marketingWallet) external onlyOwner {
        require(_marketingWallet != address(0), "Invalid address");
        marketingWallet = _marketingWallet;
    }
    
    // Update staking rewards pool
    function setStakingRewardsPool(address _stakingRewardsPool) external onlyOwner {
        require(_stakingRewardsPool != address(0), "Invalid address");
        stakingRewardsPool = _stakingRewardsPool;
    }
    
    // Update PancakeSwap router
    function setPancakeRouter(address _pancakeRouter) external onlyOwner {
        require(_pancakeRouter != address(0), "Invalid address");
        pancakeRouter = _pancakeRouter;
    }
} 
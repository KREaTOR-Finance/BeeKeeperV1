// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./BeeToken.sol";

contract HiveManager is Ownable, Pausable, ReentrancyGuard {
    // References to other contracts
    address payable public beeToken;
    
    // Constants
    uint256 public constant MAX_HIVES = 1000000; // 1 million max hives cap
    uint256 public constant MAX_PRODUCTION_RATE = 6; // Maximum bees per day
    uint256 public constant DECAY_RATE = 1; // Bees lost per week
    uint256 public constant DECAY_PERIOD = 7 days; // Time between decay events
    uint256 public constant RESTORE_COST = 8; // Bees needed to restore a hive
    uint256 public constant HIVE_COST = 10; // Bees needed to create a new hive
    
    // State variables
    address public marketingWallet;
    address public stakingRewardsPool;
    uint256 public totalHives;
    uint256 public nextHiveId = 1;
    mapping(uint256 => Hive) public hives; // hiveId => Hive
    mapping(address => uint256[]) public userHives; // user address => array of hive IDs
    mapping(address => uint256) public pendingEmissions; // Unclaimed emissions per user
    
    // Structs
    struct Hive {
        uint256 id;
        address owner;
        uint256 productionRate; // Bees per day (0-6)
        uint256 lastDecayTime; // Timestamp of last decay
        bool isStaked; // Whether hive is staked in Queen Colony
    }
    
    // Events
    event HiveCreated(uint256 indexed hiveId, address indexed owner);
    event HiveDecayed(uint256 indexed hiveId, uint256 newProductionRate);
    event HiveRestored(uint256 indexed hiveId);
    event HiveStaked(uint256 indexed hiveId);
    event HiveUnstaked(uint256 indexed hiveId);
    event EmissionsClaimed(address indexed user, uint256 amount);
    event EmissionsCompounded(address indexed user, uint256 amount);
    event TokensDistributed(uint256 toMarketing, uint256 toStaking);
    
    constructor(
        address _beeToken,
        address _marketingWallet,
        address _stakingRewardsPool
    ) {
        require(_beeToken != address(0), "BeeToken address cannot be zero");
        require(_marketingWallet != address(0), "Marketing wallet cannot be zero");
        require(_stakingRewardsPool != address(0), "Staking rewards pool cannot be zero");
        
        beeToken = payable(_beeToken);
        marketingWallet = _marketingWallet;
        stakingRewardsPool = _stakingRewardsPool;
    }
    
    // External functions
    
    // Create a new hive by spending BEE tokens
    function createHive() external nonReentrant whenNotPaused {
        require(totalHives < MAX_HIVES, "Maximum hives reached");
        
        // Calculate token distribution (50/50 split)
        uint256 totalCost = HIVE_COST * 10**18;
        uint256 marketingShare = totalCost / 2;
        uint256 stakingShare = totalCost - marketingShare; // Use subtraction to avoid rounding issues
        
        // Transfer BEE tokens from user
        BeeToken(beeToken).transferFrom(msg.sender, address(this), totalCost);
        
        // Distribute tokens: 50% to marketing wallet, 50% to staking rewards
        BeeToken(beeToken).transfer(marketingWallet, marketingShare);
        BeeToken(beeToken).transfer(stakingRewardsPool, stakingShare);
        
        emit TokensDistributed(marketingShare, stakingShare);
        
        // Create new hive
        uint256 hiveId = nextHiveId++;
        hives[hiveId] = Hive({
            id: hiveId,
            owner: msg.sender,
            productionRate: MAX_PRODUCTION_RATE,
            lastDecayTime: block.timestamp,
            isStaked: false
        });
        
        userHives[msg.sender].push(hiveId);
        totalHives++;
        
        emit HiveCreated(hiveId, msg.sender);
    }
    
    // Create multiple hives at once
    function createMultipleHives(uint256 count) external nonReentrant whenNotPaused {
        require(totalHives + count <= MAX_HIVES, "Would exceed maximum hives");
        require(count > 0, "Must create at least one hive");
        
        // Calculate token distribution (50/50 split)
        uint256 totalCost = count * HIVE_COST * 10**18;
        uint256 marketingShare = totalCost / 2;
        uint256 stakingShare = totalCost - marketingShare; // Use subtraction to avoid rounding issues
        
        // Transfer BEE tokens from user
        BeeToken(beeToken).transferFrom(msg.sender, address(this), totalCost);
        
        // Distribute tokens: 50% to marketing wallet, 50% to staking rewards
        BeeToken(beeToken).transfer(marketingWallet, marketingShare);
        BeeToken(beeToken).transfer(stakingRewardsPool, stakingShare);
        
        emit TokensDistributed(marketingShare, stakingShare);
        
        // Create new hives
        for (uint256 i = 0; i < count; i++) {
            uint256 hiveId = nextHiveId++;
            hives[hiveId] = Hive({
                id: hiveId,
                owner: msg.sender,
                productionRate: MAX_PRODUCTION_RATE,
                lastDecayTime: block.timestamp,
                isStaked: false
            });
            
            userHives[msg.sender].push(hiveId);
            totalHives++;
            
            emit HiveCreated(hiveId, msg.sender);
        }
    }
    
    // Restore a decaying hive by spending BEE tokens
    function restoreHive(uint256 hiveId) external nonReentrant whenNotPaused {
        Hive storage hive = hives[hiveId];
        require(hive.owner == msg.sender, "Not the hive owner");
        require(hive.productionRate > 0 && hive.productionRate < MAX_PRODUCTION_RATE, "Hive cannot be restored");
        require(!hive.isStaked, "Staked hive cannot be restored");
        
        // Transfer BEE tokens from user to contract
        BeeToken(beeToken).transferFrom(msg.sender, address(this), RESTORE_COST * 10**18);
        
        // Restore hive to full production
        hive.productionRate = MAX_PRODUCTION_RATE;
        hive.lastDecayTime = block.timestamp;
        
        emit HiveRestored(hiveId);
    }
    
    // Process decay for a specific hive
    function processDecay(uint256 hiveId) public {
        Hive storage hive = hives[hiveId];
        
        // Skip if hive is staked or already at 0 production
        if (hive.isStaked || hive.productionRate == 0) {
            return;
        }
        
        // Calculate decay periods passed
        uint256 timePassed = block.timestamp - hive.lastDecayTime;
        uint256 decayPeriods = timePassed / DECAY_PERIOD;
        
        if (decayPeriods > 0) {
            // Update last decay time
            hive.lastDecayTime = hive.lastDecayTime + (decayPeriods * DECAY_PERIOD);
            
            // Calculate new production rate
            uint256 decayAmount = decayPeriods * DECAY_RATE;
            if (decayAmount >= hive.productionRate) {
                hive.productionRate = 0;
            } else {
                hive.productionRate -= decayAmount;
            }
            
            emit HiveDecayed(hiveId, hive.productionRate);
        }
    }
    
    // Process decay for all hives owned by a user
    function processAllDecay() external {
        uint256[] memory userHiveIds = userHives[msg.sender];
        for (uint256 i = 0; i < userHiveIds.length; i++) {
            processDecay(userHiveIds[i]);
        }
    }
    
    // Calculate and update pending emissions for a user
    function updateEmissions(address user) public {
        uint256[] memory userHiveIds = userHives[user];
        uint256 totalEmission = 0;
        
        for (uint256 i = 0; i < userHiveIds.length; i++) {
            uint256 hiveId = userHiveIds[i];
            processDecay(hiveId);
            
            Hive storage hive = hives[hiveId];
            if (hive.productionRate > 0) {
                // Add daily production to total
                totalEmission += hive.productionRate;
            }
        }
        
        // Update pending emissions
        if (totalEmission > 0) {
            pendingEmissions[user] += totalEmission;
        }
    }
    
    // Claim pending emissions
    function claimEmissions() external nonReentrant whenNotPaused {
        updateEmissions(msg.sender);
        
        uint256 amount = pendingEmissions[msg.sender];
        require(amount > 0, "No emissions to claim");
        
        pendingEmissions[msg.sender] = 0;
        
        // Mint BEE tokens to user
        BeeToken(beeToken).mint(msg.sender, amount * 10**18);
        
        emit EmissionsClaimed(msg.sender, amount);
    }
    
    // Compound pending emissions into new hives
    function compoundEmissions() external nonReentrant whenNotPaused {
        updateEmissions(msg.sender);
        
        uint256 amount = pendingEmissions[msg.sender];
        require(amount >= HIVE_COST, "Not enough emissions to compound");
        
        // Calculate how many hives can be created
        uint256 hivesToCreate = amount / HIVE_COST;
        require(totalHives + hivesToCreate <= MAX_HIVES, "Would exceed maximum hives");
        
        // Update pending emissions
        pendingEmissions[msg.sender] = amount % HIVE_COST;
        
        // Create new hives
        for (uint256 i = 0; i < hivesToCreate; i++) {
            uint256 hiveId = nextHiveId++;
            hives[hiveId] = Hive({
                id: hiveId,
                owner: msg.sender,
                productionRate: MAX_PRODUCTION_RATE,
                lastDecayTime: block.timestamp,
                isStaked: false
            });
            
            userHives[msg.sender].push(hiveId);
            totalHives++;
            
            emit HiveCreated(hiveId, msg.sender);
        }
        
        emit EmissionsCompounded(msg.sender, hivesToCreate * HIVE_COST);
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
        uint256 productionRate,
        uint256 lastDecayTime,
        bool isStaked,
        uint256 daysUntilDecay
    ) {
        Hive storage hive = hives[hiveId];
        
        // Calculate days until next decay
        uint256 timeUntilDecay;
        if (hive.isStaked || hive.productionRate == 0) {
            timeUntilDecay = 0; // No decay for staked or dead hives
        } else {
            uint256 nextDecayTime = hive.lastDecayTime + DECAY_PERIOD;
            if (block.timestamp < nextDecayTime) {
                timeUntilDecay = nextDecayTime - block.timestamp;
            } else {
                timeUntilDecay = 0; // Decay is already due
            }
        }
        
        return (
            hive.id,
            hive.owner,
            hive.productionRate,
            hive.lastDecayTime,
            hive.isStaked,
            timeUntilDecay / 1 days
        );
    }
    
    // Get total pending emissions for a user
    function getPendingEmissions(address user) external view returns (uint256) {
        return pendingEmissions[user];
    }
    
    // Admin functions
    
    // Update marketing wallet address
    function setMarketingWallet(address _marketingWallet) external onlyOwner {
        require(_marketingWallet != address(0), "Invalid address");
        marketingWallet = _marketingWallet;
    }
    
    // Update staking rewards pool address
    function setStakingRewardsPool(address _stakingRewardsPool) external onlyOwner {
        require(_stakingRewardsPool != address(0), "Invalid address");
        stakingRewardsPool = _stakingRewardsPool;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Mark a hive as staked (called by QueenColony contract)
    function setHiveStaked(uint256 hiveId, bool staked) external {
        // This would need proper access control in production
        // For now, anyone can call it for demonstration
        Hive storage hive = hives[hiveId];
        require(hive.productionRate > 0, "Dead hives cannot be staked");
        
        hive.isStaked = staked;
        
        if (staked) {
            emit HiveStaked(hiveId);
        } else {
            emit HiveUnstaked(hiveId);
        }
    }
} 
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./HiveManager.sol";
import "./HunyToken.sol";

contract QueenColony is Ownable, Pausable, ReentrancyGuard {
    // References to other contracts
    address public hiveManager;
    address public hunyToken;
    
    // Constants
    uint256 public constant HUNY_PER_HIVE_PER_DAY = 1; // HUNY tokens earned per staked hive per day
    
    // Structs
    struct StakedHive {
        uint256 hiveId;
        uint256 stakedTime;
        uint256 lastRewardTime;
    }
    
    // State variables
    mapping(address => StakedHive[]) public stakedHives; // User address => array of staked hives
    mapping(uint256 => uint256) public hiveStakeIndex; // HiveId => index in stakedHives array
    mapping(address => uint256) public pendingHunyRewards; // User address => pending HUNY rewards
    
    // Events
    event HiveStaked(address indexed user, uint256 indexed hiveId);
    event HiveUnstaked(address indexed user, uint256 indexed hiveId);
    event RewardsClaimed(address indexed user, uint256 amount);
    
    constructor(address _hiveManager, address _hunyToken) {
        require(_hiveManager != address(0), "HiveManager address cannot be zero");
        require(_hunyToken != address(0), "HunyToken address cannot be zero");
        
        hiveManager = _hiveManager;
        hunyToken = _hunyToken;
    }
    
    // External functions
    
    // Stake a hive in the Queen Colony
    function stakeHive(uint256 hiveId) external nonReentrant whenNotPaused {
        // Get hive details
        (uint256 id, address owner, uint256 productionRate, , bool isStaked, ) = HiveManager(hiveManager).getHiveDetails(hiveId);
        
        require(owner == msg.sender, "Not the hive owner");
        require(!isStaked, "Hive already staked");
        require(productionRate > 0, "Dead hives cannot be staked");
        
        // Mark hive as staked in HiveManager
        HiveManager(hiveManager).setHiveStaked(hiveId, true);
        
        // Add to staked hives
        stakedHives[msg.sender].push(StakedHive({
            hiveId: hiveId,
            stakedTime: block.timestamp,
            lastRewardTime: block.timestamp
        }));
        
        // Store index for quick lookup
        hiveStakeIndex[hiveId] = stakedHives[msg.sender].length - 1;
        
        emit HiveStaked(msg.sender, hiveId);
    }
    
    // Unstake a hive from the Queen Colony
    function unstakeHive(uint256 hiveId) external nonReentrant {
        // Get hive details
        (uint256 id, address owner, , , bool isStaked, ) = HiveManager(hiveManager).getHiveDetails(hiveId);
        
        require(owner == msg.sender, "Not the hive owner");
        require(isStaked, "Hive not staked");
        
        // Update rewards before unstaking
        updateRewards(msg.sender);
        
        // Mark hive as unstaked in HiveManager
        HiveManager(hiveManager).setHiveStaked(hiveId, false);
        
        // Remove from staked hives
        uint256 index = hiveStakeIndex[hiveId];
        uint256 lastIndex = stakedHives[msg.sender].length - 1;
        
        if (index != lastIndex) {
            // Move the last element to the position of the element to delete
            stakedHives[msg.sender][index] = stakedHives[msg.sender][lastIndex];
            // Update the index for the moved element
            hiveStakeIndex[stakedHives[msg.sender][index].hiveId] = index;
        }
        
        // Remove the last element
        stakedHives[msg.sender].pop();
        
        emit HiveUnstaked(msg.sender, hiveId);
    }
    
    // Calculate and update pending HUNY rewards for a user
    function updateRewards(address user) public {
        StakedHive[] storage userStakedHives = stakedHives[user];
        uint256 totalReward = 0;
        
        for (uint256 i = 0; i < userStakedHives.length; i++) {
            StakedHive storage stakedHive = userStakedHives[i];
            
            // Calculate time since last reward
            uint256 timePassed = block.timestamp - stakedHive.lastRewardTime;
            
            // Calculate HUNY earned (1 HUNY per day per hive)
            uint256 hunyEarned = (timePassed * HUNY_PER_HIVE_PER_DAY) / 1 days;
            
            if (hunyEarned > 0) {
                totalReward += hunyEarned;
                stakedHive.lastRewardTime = block.timestamp;
            }
        }
        
        // Update pending rewards
        if (totalReward > 0) {
            pendingHunyRewards[user] += totalReward;
        }
    }
    
    // Claim pending HUNY rewards
    function claimRewards() external nonReentrant whenNotPaused {
        updateRewards(msg.sender);
        
        uint256 amount = pendingHunyRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        
        pendingHunyRewards[msg.sender] = 0;
        
        // Mint HUNY tokens to user
        HunyToken(hunyToken).mint(msg.sender, amount * 10**18);
        
        emit RewardsClaimed(msg.sender, amount);
    }
    
    // View functions
    
    // Get all staked hives for a user
    function getStakedHives(address user) external view returns (StakedHive[] memory) {
        return stakedHives[user];
    }
    
    // Get pending HUNY rewards for a user
    function getPendingRewards(address user) external view returns (uint256) {
        uint256 pendingRewards = pendingHunyRewards[user];
        StakedHive[] storage userStakedHives = stakedHives[user];
        
        for (uint256 i = 0; i < userStakedHives.length; i++) {
            StakedHive storage stakedHive = userStakedHives[i];
            
            // Calculate time since last reward
            uint256 timePassed = block.timestamp - stakedHive.lastRewardTime;
            
            // Calculate HUNY earned (1 HUNY per day per hive)
            uint256 hunyEarned = (timePassed * HUNY_PER_HIVE_PER_DAY) / 1 days;
            
            pendingRewards += hunyEarned;
        }
        
        return pendingRewards;
    }
    
    // Admin functions
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
} 
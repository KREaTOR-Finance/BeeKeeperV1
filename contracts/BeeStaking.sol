// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./BeeToken.sol";

contract BeeStaking is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    
    // Token reference
    address payable public beeToken;
    
    // Constants
    uint256 public constant APR = 36; // 36% annual percentage rate
    uint256 public constant SECONDS_IN_YEAR = 365 days;
    uint256 public constant MINIMUM_STAKE = 10 * 10**18; // 10 BEE minimum stake
    
    // Staking data
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
    }
    
    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    
    // Events
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    
    constructor(address _beeToken) Ownable() {
        beeToken = payable(_beeToken);
    }
    
    // Stake BEE tokens
    function stake(uint256 _amount) external nonReentrant {
        require(_amount >= MINIMUM_STAKE, "Stake amount too small");
        
        StakeInfo storage userStake = stakes[msg.sender];
        
        // If user already has a stake, claim rewards first
        if (userStake.amount > 0) {
            claimReward();
        }
        
        // Transfer BEE tokens from user to contract
        BeeToken(beeToken).transferFrom(msg.sender, address(this), _amount);
        
        // Update stake info
        if (userStake.amount == 0) {
            // New stake
            userStake.startTime = block.timestamp;
            userStake.lastClaimTime = block.timestamp;
        }
        
        userStake.amount = userStake.amount.add(_amount);
        totalStaked = totalStaked.add(_amount);
        
        emit Staked(msg.sender, _amount);
    }
    
    // Unstake BEE tokens
    function unstake(uint256 _amount) external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount >= _amount, "Insufficient staked amount");
        
        // Calculate and mint rewards directly instead of calling claimReward()
        uint256 reward = calculateReward(msg.sender);
        if (reward > 0) {
            // Update last claim time
            userStake.lastClaimTime = block.timestamp;
            
            // Mint reward tokens to user
            BeeToken(beeToken).mint(msg.sender, reward);
            
            emit RewardClaimed(msg.sender, reward);
        }
        
        // Update stake info
        userStake.amount = userStake.amount.sub(_amount);
        totalStaked = totalStaked.sub(_amount);
        
        // Transfer BEE tokens back to user
        BeeToken(beeToken).transfer(msg.sender, _amount);
        
        emit Unstaked(msg.sender, _amount);
    }
    
    // Claim staking rewards
    function claimReward() public nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake found");
        
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No rewards available");
        
        // Update last claim time
        userStake.lastClaimTime = block.timestamp;
        
        // Mint reward tokens to user
        BeeToken(beeToken).mint(msg.sender, reward);
        
        emit RewardClaimed(msg.sender, reward);
    }
    
    // Calculate staking reward
    function calculateReward(address _user) public view returns (uint256) {
        StakeInfo storage userStake = stakes[_user];
        if (userStake.amount == 0) {
            return 0;
        }
        
        uint256 timeStaked = block.timestamp.sub(userStake.lastClaimTime);
        uint256 yearlyReward = userStake.amount.mul(APR).div(100);
        uint256 reward = yearlyReward.mul(timeStaked).div(SECONDS_IN_YEAR);
        
        return reward;
    }
    
    // Get user stake info
    function getStakeInfo(address _user) external view returns (
        uint256 amount,
        uint256 startTime,
        uint256 lastClaimTime,
        uint256 pendingReward
    ) {
        StakeInfo storage userStake = stakes[_user];
        return (
            userStake.amount,
            userStake.startTime,
            userStake.lastClaimTime,
            calculateReward(_user)
        );
    }
} 
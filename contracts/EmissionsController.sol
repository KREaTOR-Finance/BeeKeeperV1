// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./BeeToken.sol";
import "./HunyToken.sol";

contract EmissionsController is Ownable, Pausable {
    // References to other contracts
    address payable public beeToken;
    address public hunyToken;
    
    // State variables
    uint256 public beeEmissionRate = 6; // BEE tokens per hive per day
    uint256 public hunyEmissionRate = 1; // HUNY tokens per staked hive per day
    
    // Events
    event BeeEmissionRateUpdated(uint256 oldRate, uint256 newRate);
    event HunyEmissionRateUpdated(uint256 oldRate, uint256 newRate);
    
    constructor(address _beeToken, address _hunyToken) {
        require(_beeToken != address(0), "BeeToken address cannot be zero");
        require(_hunyToken != address(0), "HunyToken address cannot be zero");
        
        beeToken = payable(_beeToken);
        hunyToken = _hunyToken;
    }
    
    // Admin functions
    
    // Update BEE emission rate
    function updateBeeEmissionRate(uint256 newRate) external onlyOwner {
        uint256 oldRate = beeEmissionRate;
        beeEmissionRate = newRate;
        
        // Update rate in BeeToken contract
        BeeToken(beeToken).setEmissionRate(newRate);
        
        emit BeeEmissionRateUpdated(oldRate, newRate);
    }
    
    // Update HUNY emission rate
    function updateHunyEmissionRate(uint256 newRate) external onlyOwner {
        uint256 oldRate = hunyEmissionRate;
        hunyEmissionRate = newRate;
        
        // Update rate in HunyToken contract
        HunyToken(hunyToken).setEmissionRate(newRate);
        
        emit HunyEmissionRateUpdated(oldRate, newRate);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
} 
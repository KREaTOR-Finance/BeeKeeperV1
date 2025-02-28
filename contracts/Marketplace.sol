// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./HiveManager.sol";

contract Marketplace is Ownable, Pausable, ReentrancyGuard {
    // References to other contracts
    address public hiveManager;
    address public usdcToken;
    
    // Constants
    uint256 public hivePrice = 20 * 10**18; // 20 USDC (assuming 18 decimals)
    uint256 public bulkDiscountPercent = 4; // 4% discount for bulk purchases
    
    // Events
    event HivePurchased(address indexed buyer, uint256 quantity, uint256 totalPrice);
    event PriceUpdated(uint256 newPrice);
    event DiscountUpdated(uint256 newDiscount);
    
    constructor(address _hiveManager, address _usdcToken) {
        require(_hiveManager != address(0), "HiveManager address cannot be zero");
        require(_usdcToken != address(0), "USDC token address cannot be zero");
        
        hiveManager = _hiveManager;
        usdcToken = _usdcToken;
    }
    
    // External functions
    
    // Buy hives with USDC
    function buyHives(uint256 quantity) external nonReentrant whenNotPaused {
        require(quantity > 0, "Must buy at least one hive");
        
        // Calculate price with bulk discount for 5+ hives
        uint256 totalPrice;
        if (quantity >= 5) {
            uint256 discountedPrice = hivePrice * (100 - bulkDiscountPercent) / 100;
            totalPrice = quantity * discountedPrice;
        } else {
            totalPrice = quantity * hivePrice;
        }
        
        // Transfer USDC from buyer to contract
        require(IERC20(usdcToken).transferFrom(msg.sender, address(this), totalPrice), "USDC transfer failed");
        
        // Create hives for the buyer
        for (uint256 i = 0; i < quantity; i++) {
            // Call the HiveManager to create hives
            HiveManager(hiveManager).createHive();
        }
        
        emit HivePurchased(msg.sender, quantity, totalPrice);
    }
    
    // Admin functions
    
    // Update the price of a hive
    function updateHivePrice(uint256 newPrice) external onlyOwner {
        hivePrice = newPrice;
        emit PriceUpdated(newPrice);
    }
    
    // Update the bulk discount percentage
    function updateBulkDiscount(uint256 newDiscount) external onlyOwner {
        require(newDiscount <= 20, "Discount too high"); // Max 20% discount
        bulkDiscountPercent = newDiscount;
        emit DiscountUpdated(newDiscount);
    }
    
    // Withdraw USDC from the contract
    function withdrawUSDC(uint256 amount) external onlyOwner {
        require(IERC20(usdcToken).transfer(owner(), amount), "USDC transfer failed");
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
} 
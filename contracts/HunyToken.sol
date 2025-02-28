// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract HunyToken is ERC20, ERC20Burnable, ERC20Capped, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    // Events
    event EmissionRateChanged(uint256 oldRate, uint256 newRate);
    
    // State variables
    uint256 public emissionRate; // Tokens emitted per staked hive per day
    
    // Constants
    uint256 public constant INITIAL_SUPPLY = 1_000_000; // 1 million initial supply
    uint256 public constant MAX_SUPPLY = 1_000_000_000_000; // 1 trillion max supply
    
    constructor(address marketingWallet) 
        ERC20("Huny Token", "HUNY") 
        ERC20Capped(MAX_SUPPLY * 10**18) // Set max cap to 1 trillion
    {
        require(marketingWallet != address(0), "Marketing wallet cannot be zero address");
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(BURNER_ROLE, msg.sender);
        
        // Mint 1 million HUNY to marketing wallet
        _mint(marketingWallet, INITIAL_SUPPLY * 10**18);
    }
    
    // Override required by Solidity due to multiple inheritance
    function _mint(address account, uint256 amount) internal override(ERC20, ERC20Capped) {
        super._mint(account, amount);
    }
    
    // Functions
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
    
    function burnFrom(address account, uint256 amount) public override onlyRole(BURNER_ROLE) {
        _burn(account, amount);
    }
    
    function setEmissionRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 oldRate = emissionRate;
        emissionRate = newRate;
        emit EmissionRateChanged(oldRate, newRate);
    }
} 
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";

contract BeeToken is ERC20, ERC20Burnable, ERC20Capped, AccessControl {
    using SafeMath for uint256;
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant EXCLUDED_ROLE = keccak256("EXCLUDED_ROLE"); // Excluded from fees
    
    // Events
    event EmissionRateChanged(uint256 oldRate, uint256 newRate);
    event SellFeeUpdated(uint256 newFee);
    event MarketingWalletUpdated(address newWallet);
    event SwapAndLiquifyEnabled(bool enabled);
    event SwapAndLiquify(uint256 tokensSwapped, uint256 bnbReceived);
    
    // State variables
    uint256 public emissionRate; // Tokens emitted per hive per day
    uint256 public sellFee = 500; // 5% sell fee (in basis points, 10000 = 100%)
    address public marketingWallet;
    
    // PancakeSwap variables
    IUniswapV2Router02 public immutable uniswapV2Router;
    address public immutable uniswapV2Pair;
    bool public swapAndLiquifyEnabled = true;
    uint256 public minTokensBeforeSwap = 100000 * 10**18; // 100,000 tokens
    bool private swapping;
    
    // Constants
    uint256 public constant INITIAL_SUPPLY = 1_000_000; // 1 million initial supply
    uint256 public constant MAX_SUPPLY = 1_000_000_000_000_000; // 1 quadrillion max supply
    uint256 public constant BASIS_POINTS = 10000; // For fee calculations
    
    constructor(address _marketingWallet, address _router) 
        ERC20("Bee Token", "BEE") 
        ERC20Capped(MAX_SUPPLY * 10**18) // Set max cap to 1 quadrillion
    {
        require(_marketingWallet != address(0), "Marketing wallet cannot be zero address");
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(BURNER_ROLE, msg.sender);
        _setupRole(EXCLUDED_ROLE, msg.sender);
        _setupRole(EXCLUDED_ROLE, _marketingWallet);
        
        marketingWallet = _marketingWallet;
        
        // Mint initial supply to deployer
        _mint(msg.sender, INITIAL_SUPPLY * 10**18); // Mint 1 million tokens initially
        
        // Mint additional 1 million to marketing wallet
        _mint(_marketingWallet, INITIAL_SUPPLY * 10**18); // Mint 1 million tokens to marketing
        
        // Setup PancakeSwap
        IUniswapV2Router02 _uniswapV2Router = IUniswapV2Router02(_router);
        uniswapV2Router = _uniswapV2Router;
        
        // Create a PancakeSwap pair for this token
        uniswapV2Pair = IUniswapV2Factory(_uniswapV2Router.factory())
            .createPair(address(this), _uniswapV2Router.WETH());
            
        // Exclude the pair from fees
        _setupRole(EXCLUDED_ROLE, uniswapV2Pair);
    }
    
    // Override required by Solidity due to multiple inheritance
    function _mint(address account, uint256 amount) internal override(ERC20, ERC20Capped) {
        super._mint(account, amount);
    }
    
    // Override transfer function to implement fees
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {
        // Don't apply fees when swapping to avoid loops
        if (swapping) {
            super._transfer(sender, recipient, amount);
            return;
        }
        
        // Check if we should swap tokens for BNB
        uint256 contractTokenBalance = balanceOf(address(this));
        bool canSwap = contractTokenBalance >= minTokensBeforeSwap;
        
        if (
            canSwap &&
            !swapping &&
            sender != uniswapV2Pair &&
            swapAndLiquifyEnabled &&
            sender != marketingWallet &&
            recipient != marketingWallet
        ) {
            swapping = true;
            
            // Swap tokens for BNB and send to marketing wallet
            swapTokensForBnb(contractTokenBalance, marketingWallet);
            
            swapping = false;
        }
        
        // Check if sender or recipient is excluded from fees
        bool takeFee = !(hasRole(EXCLUDED_ROLE, sender) || hasRole(EXCLUDED_ROLE, recipient));
        
        // Only take fee on sells (transfers to the pair)
        if (takeFee && recipient == uniswapV2Pair) {
            uint256 feeAmount = amount.mul(sellFee).div(BASIS_POINTS);
            
            // Transfer fee to contract for later swap to BNB
            if (feeAmount > 0) {
                super._transfer(sender, address(this), feeAmount);
                amount = amount.sub(feeAmount);
            }
        }
        
        // Transfer remaining amount
        super._transfer(sender, recipient, amount);
    }
    
    // Swap tokens for BNB and send to recipient
    function swapTokensForBnb(uint256 tokenAmount, address recipient) private {
        // Generate the PancakeSwap pair path of token -> wbnb
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = uniswapV2Router.WETH();

        // Approve router to spend tokens
        _approve(address(this), address(uniswapV2Router), tokenAmount);

        // Make the swap
        uniswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokenAmount,
            0, // Accept any amount of BNB
            path,
            recipient, // Send BNB directly to marketing wallet
            block.timestamp
        );
        
        emit SwapAndLiquify(tokenAmount, address(this).balance);
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
    
    function setSellFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFee <= 1000, "Fee cannot exceed 10%"); // Max 10% fee
        sellFee = newFee;
        emit SellFeeUpdated(newFee);
    }
    
    function setMarketingWallet(address newWallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newWallet != address(0), "Marketing wallet cannot be zero address");
        
        // Remove old wallet from exclusion
        revokeRole(EXCLUDED_ROLE, marketingWallet);
        
        // Set new wallet
        marketingWallet = newWallet;
        
        // Add new wallet to exclusion
        grantRole(EXCLUDED_ROLE, newWallet);
        
        emit MarketingWalletUpdated(newWallet);
    }
    
    function setSwapAndLiquifyEnabled(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        swapAndLiquifyEnabled = enabled;
        emit SwapAndLiquifyEnabled(enabled);
    }
    
    function setMinTokensBeforeSwap(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        minTokensBeforeSwap = amount;
    }
    
    // Allow the contract to receive BNB
    receive() external payable {}
} 
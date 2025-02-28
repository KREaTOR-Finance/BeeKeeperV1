// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./BeeToken.sol";
import "./HunyToken.sol";

/**
 * @title BeeTokenFactory
 * @dev Factory contract for deploying BeeToken and HunyToken
 */
contract BeeTokenFactory is Ownable {
    // Deployed contract addresses
    address public beeToken;
    address public hunyToken;

    // Event emitted when tokens are deployed
    event TokensDeployed(
        address indexed beeToken,
        address indexed hunyToken
    );

    /**
     * @dev Deploy BeeToken and HunyToken
     * @param marketingWallet Address of the marketing wallet
     * @param pancakeswapRouter Address of the PancakeSwap router
     */
    function deployTokens(
        address marketingWallet,
        address pancakeswapRouter
    ) external onlyOwner {
        // Check if tokens are already deployed
        require(beeToken == address(0), "Tokens already deployed");
        
        // Check for valid addresses
        require(marketingWallet != address(0), "Invalid marketing wallet address");
        require(pancakeswapRouter != address(0), "Invalid PancakeSwap router address");

        // Deploy BeeToken
        BeeToken newBeeToken = new BeeToken(
            marketingWallet,
            pancakeswapRouter
        );
        beeToken = address(newBeeToken);

        // Deploy HunyToken
        HunyToken newHunyToken = new HunyToken(
            marketingWallet
        );
        hunyToken = address(newHunyToken);

        // Emit event
        emit TokensDeployed(beeToken, hunyToken);
    }
} 
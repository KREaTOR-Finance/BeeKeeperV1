// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./BeeHives.sol";
import "./BeeStaking.sol";
import "./BeeToken.sol";

/**
 * @title BeeHivesFactory
 * @dev Factory contract for deploying BeeHives and BeeStaking contracts
 */
contract BeeHivesFactory is Ownable {
    // Deployed contract addresses
    address public beeHives;
    address public beeStaking;

    // Event emitted when contracts are deployed
    event HivesDeployed(
        address indexed beeHives,
        address indexed beeStaking
    );

    /**
     * @dev Deploy BeeHives and BeeStaking contracts
     * @param beeToken Address of the BeeToken contract
     * @param usdcToken Address of the USDC token contract
     * @param pancakeRouter Address of the PancakeSwap router
     * @param marketingWallet Address of the marketing wallet
     * @param stakingRewardsPool Address of the staking rewards pool
     */
    function deployHives(
        address beeToken,
        address usdcToken,
        address pancakeRouter,
        address marketingWallet,
        address stakingRewardsPool
    ) external onlyOwner {
        // Check if contracts are already deployed
        require(beeHives == address(0), "Hives already deployed");
        
        // Check for valid addresses
        require(beeToken != address(0), "Invalid BeeToken address");
        require(usdcToken != address(0), "Invalid USDC address");
        require(pancakeRouter != address(0), "Invalid PancakeSwap router address");
        require(marketingWallet != address(0), "Invalid marketing wallet address");
        require(stakingRewardsPool != address(0), "Invalid staking rewards pool address");

        // Deploy BeeHives
        BeeHives newBeeHives = new BeeHives(
            beeToken,
            usdcToken,
            pancakeRouter,
            marketingWallet,
            stakingRewardsPool
        );
        beeHives = address(newBeeHives);

        // Deploy BeeStaking
        BeeStaking newBeeStaking = new BeeStaking(
            beeToken
        );
        beeStaking = address(newBeeStaking);

        // Note: You'll need to grant minter roles to these contracts after deployment
        // BeeToken(beeToken).grantRole(BeeToken(beeToken).MINTER_ROLE(), beeHives);
        // BeeToken(beeToken).grantRole(BeeToken(beeToken).MINTER_ROLE(), beeStaking);

        // Emit event
        emit HivesDeployed(
            beeHives,
            beeStaking
        );
    }
} 
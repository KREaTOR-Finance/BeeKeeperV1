// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./HiveManager.sol";
import "./QueenColony.sol";
import "./Marketplace.sol";
import "./EmissionsController.sol";

/**
 * @title BeeEcosystemFactory
 * @dev Factory contract for deploying the BeeHive ecosystem contracts
 */
contract BeeEcosystemFactory is Ownable {
    // Deployed contract addresses
    address public hiveManager;
    address public queenColony;
    address public marketplace;
    address public emissionsController;

    // Event emitted when ecosystem is deployed
    event EcosystemDeployed(
        address indexed hiveManager,
        address indexed queenColony,
        address indexed marketplace,
        address emissionsController
    );

    /**
     * @dev Deploy the BeeHive ecosystem contracts
     * @param beeToken Address of the BeeToken contract
     * @param hunyToken Address of the HunyToken contract
     * @param usdcToken Address of the USDC token contract
     * @param marketingWallet Address of the marketing wallet
     * @param stakingRewardsPool Address of the staking rewards pool
     */
    function deployEcosystem(
        address beeToken,
        address hunyToken,
        address usdcToken,
        address marketingWallet,
        address stakingRewardsPool
    ) external onlyOwner {
        // Check if ecosystem is already deployed
        require(hiveManager == address(0), "Ecosystem already deployed");
        
        // Check for valid addresses
        require(beeToken != address(0), "Invalid BeeToken address");
        require(hunyToken != address(0), "Invalid HunyToken address");
        require(usdcToken != address(0), "Invalid USDC address");
        require(marketingWallet != address(0), "Invalid marketing wallet address");
        require(stakingRewardsPool != address(0), "Invalid staking rewards pool address");

        // Deploy HiveManager
        HiveManager newHiveManager = new HiveManager(
            beeToken,
            marketingWallet,
            stakingRewardsPool
        );
        hiveManager = address(newHiveManager);

        // Deploy QueenColony
        QueenColony newQueenColony = new QueenColony(
            hiveManager,
            hunyToken
        );
        queenColony = address(newQueenColony);

        // Deploy Marketplace
        Marketplace newMarketplace = new Marketplace(
            hiveManager,
            usdcToken
        );
        marketplace = address(newMarketplace);

        // Deploy EmissionsController
        EmissionsController newEmissionsController = new EmissionsController(
            beeToken,
            hunyToken
        );
        emissionsController = address(newEmissionsController);

        // Set up permissions
        // Grant minting roles to contracts that need them
        // Note: This assumes BeeToken and HunyToken have grantRole functions
        // You'll need to call these separately after deployment

        // Emit event
        emit EcosystemDeployed(
            hiveManager,
            queenColony,
            marketplace,
            emissionsController
        );
    }
} 
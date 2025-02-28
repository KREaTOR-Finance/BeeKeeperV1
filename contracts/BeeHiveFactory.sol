// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./BeeToken.sol";
import "./HunyToken.sol";
import "./HiveManager.sol";
import "./QueenColony.sol";
import "./Marketplace.sol";
import "./EmissionsController.sol";

contract BeeHiveFactory is Ownable {
    // Deployed contract addresses
    address public beeToken;
    address public hunyToken;
    address public hiveManager;
    address public queenColony;
    address public marketplace;
    address public emissionsController;
    address public marketingWallet;
    address public stakingRewardsPool;
    
    // Event for deployment completion
    event EcosystemDeployed(
        address beeToken,
        address hunyToken,
        address hiveManager,
        address queenColony,
        address marketplace,
        address emissionsController,
        address marketingWallet,
        address stakingRewardsPool
    );
    
    // Deploy the entire ecosystem
    function deployEcosystem(
        address usdcToken,
        address _marketingWallet,
        address _stakingRewardsPool,
        address _router // PancakeSwap router
    ) external onlyOwner {
        // Check if ecosystem is already deployed
        require(beeToken == address(0), "Ecosystem already deployed");
        
        require(_marketingWallet != address(0), "Invalid marketing wallet address");
        require(_stakingRewardsPool != address(0), "Invalid staking rewards pool address");
        require(_router != address(0), "Invalid PancakeSwap router address");
        require(usdcToken != address(0), "Invalid USDC address");
        
        marketingWallet = _marketingWallet;
        stakingRewardsPool = _stakingRewardsPool;
        
        // Deploy tokens with fixed supply limits and initial mints to marketing
        BeeToken _beeToken = new BeeToken(_marketingWallet, _router);
        HunyToken _hunyToken = new HunyToken(_marketingWallet);
        
        // Store addresses
        beeToken = address(_beeToken);
        hunyToken = address(_hunyToken);
        
        // Deploy core contracts
        HiveManager _hiveManager = new HiveManager(
            address(_beeToken),
            _marketingWallet,
            _stakingRewardsPool
        );
        hiveManager = address(_hiveManager);
        
        QueenColony _queenColony = new QueenColony(
            address(_hiveManager),
            address(_hunyToken)
        );
        queenColony = address(_queenColony);
        
        Marketplace _marketplace = new Marketplace(
            address(_hiveManager),
            usdcToken
        );
        marketplace = address(_marketplace);
        
        EmissionsController _emissionsController = new EmissionsController(
            address(_beeToken),
            address(_hunyToken)
        );
        emissionsController = address(_emissionsController);
        
        // Setup permissions
        _beeToken.grantRole(_beeToken.MINTER_ROLE(), address(_hiveManager));
        _hunyToken.grantRole(_hunyToken.MINTER_ROLE(), address(_queenColony));
        
        // Emit deployment event
        emit EcosystemDeployed(
            address(_beeToken),
            address(_hunyToken),
            address(_hiveManager),
            address(_queenColony),
            address(_marketplace),
            address(_emissionsController),
            _marketingWallet,
            _stakingRewardsPool
        );
    }
} 
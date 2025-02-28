// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockPancakeRouter
 * @dev A mock implementation of PancakeSwap router for testing purposes
 */
contract MockPancakeRouter {
    address public factory;
    address public WETH;

    event SwapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] path,
        address to,
        uint256 deadline
    );

    event SwapExactETHForTokens(
        uint256 amountOutMin,
        address[] path,
        address to,
        uint256 deadline
    );

    event SwapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] path,
        address to,
        uint256 deadline
    );

    event AddLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    );

    constructor() {
        factory = address(this);
        WETH = address(this);
    }

    // Mock factory function
    function createPair(address tokenA, address tokenB) external pure returns (address) {
        // Just return a deterministic address based on the token addresses
        return address(uint160(uint256(keccak256(abi.encodePacked(tokenA, tokenB)))));
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        // Mock implementation - just emit event
        emit SwapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline);
        
        // Transfer tokens if real tokens are provided
        if (path.length >= 2) {
            try IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn) {
                // Success
            } catch {
                // Ignore failures in tests
            }
        }
        
        // Return mock amounts
        amounts = new uint256[](path.length);
        for (uint256 i = 0; i < path.length; i++) {
            amounts[i] = amountIn;
        }
        return amounts;
    }

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts) {
        // Mock implementation - just emit event
        emit SwapExactETHForTokens(amountOutMin, path, to, deadline);
        
        // Return mock amounts
        amounts = new uint256[](path.length);
        for (uint256 i = 0; i < path.length; i++) {
            amounts[i] = msg.value;
        }
        return amounts;
    }

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        // Mock implementation - just emit event
        emit SwapExactTokensForETH(amountIn, amountOutMin, path, to, deadline);
        
        // Transfer tokens if real tokens are provided
        if (path.length >= 1) {
            try IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn) {
                // Success
            } catch {
                // Ignore failures in tests
            }
        }
        
        // Return mock amounts
        amounts = new uint256[](path.length);
        for (uint256 i = 0; i < path.length; i++) {
            amounts[i] = amountIn;
        }
        return amounts;
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        // Mock implementation - just emit event
        emit AddLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            to,
            deadline
        );
        
        // Return mock values
        return (amountADesired, amountBDesired, amountADesired + amountBDesired);
    }

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        pure
        returns (uint256[] memory amounts)
    {
        // Mock implementation - return same amount for all tokens in path
        amounts = new uint256[](path.length);
        for (uint256 i = 0; i < path.length; i++) {
            amounts[i] = amountIn;
        }
        return amounts;
    }

    // Function to receive ETH
    receive() external payable {}
} 
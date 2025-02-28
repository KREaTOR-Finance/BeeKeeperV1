// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockERC20
 * @dev A simple ERC20 token for testing purposes
 */
contract MockERC20 is ERC20, Ownable {
    uint8 private _decimals;

    /**
     * @dev Constructor that gives the msg.sender an initial supply of tokens
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @param decimalsValue The number of decimals for the token
     */
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimalsValue
    ) ERC20(name, symbol) Ownable() {
        _decimals = decimalsValue;
        _mint(msg.sender, 1000000 * 10**decimalsValue);
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mints tokens to the specified address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burns tokens from the specified address
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     */
    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }
} 
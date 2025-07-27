// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QSTToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Startup Quest Token", "QST") Ownable(initialOwner) {}

    /**
     * @dev Mints QST tokens to a specific address (only owner)
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burns tokens from the caller's balance
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Burns tokens from a specific address (only owner)
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) public onlyOwner {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
    }
} 
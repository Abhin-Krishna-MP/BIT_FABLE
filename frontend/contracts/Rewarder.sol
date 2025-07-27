// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Rewarder is Ownable {
    uint256 public constant REWARD_AMOUNT = 0.1 ether; // Increased from 0.01 to 0.1 ETH
    
    event RewardSent(address indexed recipient, uint256 amount, bool success);
    event ContractFunded(address indexed funder, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount);
    
    constructor(address initialOwner) Ownable(initialOwner) {
        emit ContractFunded(initialOwner, 0);
    }
    
    // Function to send reward to a user with return value
    function sendReward(address payable recipient) public onlyOwner returns (bool success) {
        require(recipient != address(0), "Invalid recipient address");
        require(address(this).balance >= REWARD_AMOUNT, "Insufficient contract balance");
        
        // Store recipient balance before transfer
        uint256 recipientBalanceBefore = recipient.balance;
        
        // Use low-level call for ETH transfer
        (bool transferSuccess, ) = recipient.call{value: REWARD_AMOUNT}("");
        
        // Verify the transfer actually happened
        uint256 recipientBalanceAfter = recipient.balance;
        bool balanceIncreased = recipientBalanceAfter > recipientBalanceBefore;
        
        if (transferSuccess && balanceIncreased) {
            emit RewardSent(recipient, REWARD_AMOUNT, true);
            return true;
        } else {
            emit RewardSent(recipient, REWARD_AMOUNT, false);
            return false;
        }
    }
    
    // Alternative function that reverts on failure (for backward compatibility)
    function sendRewardRevert(address payable recipient) public onlyOwner {
        require(recipient != address(0), "Invalid recipient address");
        require(address(this).balance >= REWARD_AMOUNT, "Insufficient contract balance");
        
        (bool success, ) = recipient.call{value: REWARD_AMOUNT}("");
        require(success, "ETH transfer failed");
        
        emit RewardSent(recipient, REWARD_AMOUNT, true);
    }
    
    // Function to fund the contract (owner can send ETH)
    function fundContract() public payable onlyOwner {
        require(msg.value > 0, "Must send ETH to fund contract");
        emit ContractFunded(msg.sender, msg.value);
    }
    
    // Function to withdraw excess ETH (owner only)
    function withdrawExcess() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        address payable ownerAddress = payable(owner());
        (bool success, ) = ownerAddress.call{value: balance}("");
        require(success, "ETH withdrawal failed");
        
        emit Withdrawal(ownerAddress, balance);
    }
    
    // Function to get contract balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    // Function to check if contract can send a reward
    function canSendReward() public view returns (bool) {
        return address(this).balance >= REWARD_AMOUNT;
    }
    
    // Function to get reward amount
    function getRewardAmount() public pure returns (uint256) {
        return REWARD_AMOUNT;
    }
    
    // Fallback function to receive ETH
    receive() external payable {
        emit ContractFunded(msg.sender, msg.value);
    }
} 
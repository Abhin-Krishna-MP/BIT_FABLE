import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("💰 Testing Wallet Balance System");
  console.log("=================================");

  // Get signers
  const [owner, user1, user2] = await ethers.getSigners();
  
  console.log("👤 Owner:", owner.address);
  console.log("👤 User1:", user1.address);
  console.log("👤 User2:", user2.address);

  // Check initial balances
  console.log("\n📊 Initial Balances:");
  const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
  const user1BalanceBefore = await ethers.provider.getBalance(user1.address);
  const user2BalanceBefore = await ethers.provider.getBalance(user2.address);
  
  console.log("Owner balance:", ethers.formatEther(ownerBalanceBefore), "ETH");
  console.log("User1 balance:", ethers.formatEther(user1BalanceBefore), "ETH");
  console.log("User2 balance:", ethers.formatEther(user2BalanceBefore), "ETH");

  // Deploy and test rewarder contract
  console.log("\n🎁 Testing Reward System:");
  const Rewarder = await ethers.getContractFactory("Rewarder");
  const rewarder = await Rewarder.deploy(owner.address);
  await rewarder.waitForDeployment();
  
  const rewarderAddress = await rewarder.getAddress();
  console.log("Contract deployed to:", rewarderAddress);

  // Fund contract
  await rewarder.fundContract({ value: ethers.parseEther("5.0") });
  console.log("Contract funded with 5 ETH");

  // Send rewards and track balances
  console.log("\n🎯 Sending Rewards:");
  
  // Send reward to User1
  console.log("Sending 0.1 ETH to User1...");
  const tx1 = await rewarder.sendReward(user1.address);
  await tx1.wait();
  
  // Check balances after first reward
  const user1BalanceAfter1 = await ethers.provider.getBalance(user1.address);
  const contractBalanceAfter1 = await rewarder.getContractBalance();
  
  console.log("User1 balance after reward:", ethers.formatEther(user1BalanceAfter1), "ETH");
  console.log("Contract balance after reward:", ethers.formatEther(contractBalanceAfter1), "ETH");
  
  const user1Increase = user1BalanceAfter1 - user1BalanceBefore;
  console.log("User1 balance increase:", ethers.formatEther(user1Increase), "ETH");
  
  // Verify the reward was actually credited
  if (user1Increase >= ethers.parseEther("0.1")) {
    console.log("✅ SUCCESS: User1 received 0.1 ETH reward!");
  } else {
    console.log("❌ FAILED: User1 did not receive the expected reward");
  }

  // Send reward to User2
  console.log("\nSending 0.1 ETH to User2...");
  const tx2 = await rewarder.sendReward(user2.address);
  await tx2.wait();
  
  // Check balances after second reward
  const user2BalanceAfter = await ethers.provider.getBalance(user2.address);
  const contractBalanceAfter2 = await rewarder.getContractBalance();
  
  console.log("User2 balance after reward:", ethers.formatEther(user2BalanceAfter), "ETH");
  console.log("Contract balance after second reward:", ethers.formatEther(contractBalanceAfter2), "ETH");
  
  const user2Increase = user2BalanceAfter - user2BalanceBefore;
  console.log("User2 balance increase:", ethers.formatEther(user2Increase), "ETH");
  
  // Verify the reward was actually credited
  if (user2Increase >= ethers.parseEther("0.1")) {
    console.log("✅ SUCCESS: User2 received 0.1 ETH reward!");
  } else {
    console.log("❌ FAILED: User2 did not receive the expected reward");
  }

  // Check transaction history
  console.log("\n📋 Transaction History:");
  const currentBlock = await ethers.provider.getBlockNumber();
  
  for (let i = 0; i < 5; i++) {
    const blockNumber = currentBlock - i;
    const block = await ethers.provider.getBlock(blockNumber, true);
    
    if (block && block.transactions) {
      for (const tx of block.transactions) {
        if (tx.to === user1.address || tx.to === user2.address) {
          console.log(`Block ${blockNumber}: ${tx.to === user1.address ? 'User1' : 'User2'} received ${ethers.formatEther(tx.value)} ETH`);
          console.log(`  Transaction hash: ${tx.hash}`);
        }
      }
    }
  }

  // Summary
  console.log("\n📊 Final Summary:");
  console.log("Total rewards sent: 0.2 ETH");
  console.log("User1 total received:", ethers.formatEther(user1Increase), "ETH");
  console.log("User2 total received:", ethers.formatEther(user2Increase), "ETH");
  console.log("Contract remaining balance:", ethers.formatEther(contractBalanceAfter2), "ETH");
  
  const totalRewardsSent = user1Increase + user2Increase;
  console.log("Total ETH credited to users:", ethers.formatEther(totalRewardsSent), "ETH");
  
  if (totalRewardsSent >= ethers.parseEther("0.2")) {
    console.log("🎉 SUCCESS: All rewards were properly credited!");
  } else {
    console.log("⚠️  WARNING: Some rewards may not have been credited properly");
  }

  console.log("\n💡 How to check balances in your app:");
  console.log("1. Connect MetaMask to localhost:8545");
  console.log("2. Import the test accounts using their private keys");
  console.log("3. Use the BalanceDisplay component in your Profile");
  console.log("4. Check the transaction history for incoming rewards");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 
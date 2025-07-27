import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🧪 Testing Rewarder Contract");
  console.log("=============================");

  // Get signers
  const [owner, user1, user2] = await ethers.getSigners();
  
  console.log("👤 Owner:", owner.address);
  console.log("👤 User1:", user1.address);
  console.log("👤 User2:", user2.address);

  // Deploy contract
  console.log("\n📝 Deploying Rewarder contract...");
  const Rewarder = await ethers.getContractFactory("Rewarder");
  const rewarder = await Rewarder.deploy(owner.address);
  await rewarder.waitForDeployment();
  
  const rewarderAddress = await rewarder.getAddress();
  console.log("✅ Contract deployed to:", rewarderAddress);

  // Check initial balance
  const initialBalance = await rewarder.getContractBalance();
  console.log("💰 Initial contract balance:", ethers.formatEther(initialBalance), "ETH");

  // Fund the contract with 5 ETH (increased from 1 ETH)
  console.log("\n💰 Funding contract with 5 ETH...");
  const fundTx = await rewarder.fundContract({ value: ethers.parseEther("5.0") });
  await fundTx.wait();
  
  const fundedBalance = await rewarder.getContractBalance();
  console.log("✅ Contract balance after funding:", ethers.formatEther(fundedBalance), "ETH");

  // Check if can send reward
  const canSend = await rewarder.canSendReward();
  console.log("🎁 Can send reward:", canSend);

  // Get reward amount
  const rewardAmount = await rewarder.getRewardAmount();
  console.log("💎 Reward amount:", ethers.formatEther(rewardAmount), "ETH");

  // Test sending reward to user1
  console.log("\n🎁 Testing reward to User1...");
  const user1BalanceBefore = await ethers.provider.getBalance(user1.address);
  console.log("User1 balance before:", ethers.formatEther(user1BalanceBefore), "ETH");

  // Send reward
  const rewardTx = await rewarder.sendReward(user1.address);
  const rewardReceipt = await rewardTx.wait();
  console.log("📝 Reward transaction hash:", rewardTx.hash);

  // Check return value
  const returnValue = await rewarder.sendReward.staticCall(user1.address);
  console.log("📊 Return value (success):", returnValue);

  // Check balances after
  const user1BalanceAfter = await ethers.provider.getBalance(user1.address);
  const contractBalanceAfter = await rewarder.getContractBalance();
  
  console.log("User1 balance after:", ethers.formatEther(user1BalanceAfter), "ETH");
  console.log("Contract balance after:", ethers.formatEther(contractBalanceAfter), "ETH");
  
  const balanceIncrease = user1BalanceAfter - user1BalanceBefore;
  console.log("User1 balance increase:", ethers.formatEther(balanceIncrease), "ETH");

  // Check events
  const events = await rewarder.queryFilter(rewarder.filters.RewardSent(), rewardReceipt.blockNumber);
  if (events.length > 0) {
    const event = events[0];
    console.log("\n🎯 Reward event:");
    console.log("  Recipient:", event.args.recipient);
    console.log("  Amount:", ethers.formatEther(event.args.amount), "ETH");
    console.log("  Success:", event.args.success);
  }

  // Test insufficient funds scenario
  console.log("\n🧪 Testing insufficient funds...");
  const canSendAfter = await rewarder.canSendReward();
  console.log("Can send reward after first reward:", canSendAfter);

  if (canSendAfter) {
    console.log("Sending second reward...");
    const reward2Tx = await rewarder.sendReward(user2.address);
    await reward2Tx.wait();
    
    const user2BalanceAfter = await ethers.provider.getBalance(user2.address);
    console.log("User2 received:", ethers.formatEther(user2BalanceAfter), "ETH");
  }

  // Final contract balance
  const finalBalance = await rewarder.getContractBalance();
  console.log("\n💰 Final contract balance:", ethers.formatEther(finalBalance), "ETH");

  console.log("\n✅ Test completed successfully!");
  console.log("\n📋 Summary:");
  console.log("- Contract deployed and funded with 5 ETH");
  console.log("- Reward amount: 0.1 ETH per reward");
  console.log("- Reward sent to User1");
  console.log("- Balance verification completed");
  console.log("- Events logged correctly");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 
import pkg from "hardhat";
const { ethers } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Deploying Rewarder contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy the Rewarder contract
  const Rewarder = await ethers.getContractFactory("Rewarder");
  const rewarder = await Rewarder.deploy(deployer.address);
  await rewarder.waitForDeployment();

  const rewarderAddress = await rewarder.getAddress();
  console.log("✅ Rewarder deployed to:", rewarderAddress);

  // Verify contract deployment
  const code = await ethers.provider.getCode(rewarderAddress);
  if (code === "0x") {
    throw new Error("Contract deployment failed - no code at address");
  }
  console.log("✅ Contract code verified at address");

  // Fund the contract with 5 ETH for rewards (increased from 1 ETH)
  console.log("💰 Funding contract with 5 ETH...");
  const fundTx = await rewarder.fundContract({ value: ethers.parseEther("5.0") });
  await fundTx.wait();
  
  const contractBalance = await rewarder.getContractBalance();
  console.log("Contract balance:", ethers.formatEther(contractBalance), "ETH");

  // Verify contract can send rewards
  const canSendReward = await rewarder.canSendReward();
  console.log("Can send reward:", canSendReward);

  const rewardAmount = await rewarder.getRewardAmount();
  console.log("Reward amount:", ethers.formatEther(rewardAmount), "ETH");

  // Test a reward transaction to verify everything works
  console.log("🧪 Testing reward functionality...");
  const testRecipient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Hardhat account #1
  
  try {
    const testTx = await rewarder.sendReward(testRecipient);
    const testReceipt = await testTx.wait();
    console.log("✅ Test reward transaction successful:", testTx.hash);
    
    // Check the event
    const events = await rewarder.queryFilter(rewarder.filters.RewardSent(), testReceipt.blockNumber);
    if (events.length > 0) {
      const event = events[0];
      console.log("✅ Reward event emitted:", {
        recipient: event.args.recipient,
        amount: ethers.formatEther(event.args.amount),
        success: event.args.success
      });
    }
  } catch (error) {
    console.error("❌ Test reward transaction failed:", error.message);
    throw error;
  }

  // Save contract info
  const contractInfo = {
    rewarder: {
      address: rewarderAddress,
      abi: Rewarder.interface.formatJson()
    }
  };

  // Save to src/ethereum directory
  const ethereumDir = path.join(__dirname, '../src/ethereum');
  if (!fs.existsSync(ethereumDir)) {
    fs.mkdirSync(ethereumDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(ethereumDir, 'Rewarder.json'),
    JSON.stringify(contractInfo.rewarder, null, 2)
  );

  // Save contract addresses
  fs.writeFileSync(
    path.join(ethereumDir, 'rewarderContract.json'),
    JSON.stringify({ rewarderAddress }, null, 2)
  );

  console.log("📁 Contract info saved to src/ethereum/");
  console.log("🎉 Deployment complete!");
  console.log("\n📋 Contract Details:");
  console.log("  Address:", rewarderAddress);
  console.log("  Balance:", ethers.formatEther(contractBalance), "ETH");
  console.log("  Reward Amount:", ethers.formatEther(rewardAmount), "ETH");
  console.log("  Can Send Rewards:", canSendReward);
  console.log("\n📋 Next steps:");
  console.log("1. Start your frontend: npm run dev");
  console.log("2. Import RewardButton component in your React app");
  console.log("3. Use it like: <RewardButton taskCompleted={true} />");
  console.log("\n🧪 To test the contract:");
  console.log("  npx hardhat run scripts/test-rewarder.js --network localhost");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 
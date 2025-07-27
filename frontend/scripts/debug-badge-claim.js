import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🔍 Debugging Badge Claiming Issue");
  console.log("==================================");

  // Get signers
  const [owner, user1] = await ethers.getSigners();
  
  console.log("👤 User1:", user1.address);

  // Get the deployed badge contract
  const badgeContractAddress = "0x67d269191c92Caf3cD7723F116c85e6E9bf55933";
  const AchievementBadge = await ethers.getContractFactory("AchievementBadge");
  const badgeContract = AchievementBadge.attach(badgeContractAddress);

  console.log("📋 Badge contract address:", badgeContractAddress);

  // Test 1: Check if user can claim badge
  console.log("\n🧪 Test 1: Check Claim Eligibility");
  try {
    const canClaim = await badgeContract.canClaimBadge(user1.address, 1);
    console.log("User1 can claim badge 1:", canClaim);
  } catch (error) {
    console.error("❌ Error checking claim eligibility:", error.message);
  }

  // Test 2: Check if user already has badge
  console.log("\n🧪 Test 2: Check if User Has Badge");
  try {
    const hasBadge = await badgeContract.hasBadge(user1.address, 1);
    console.log("User1 has badge 1:", hasBadge);
  } catch (error) {
    console.error("❌ Error checking if user has badge:", error.message);
  }

  // Test 3: Try to claim badge
  console.log("\n🧪 Test 3: Attempt Badge Claim");
  try {
    console.log("User1 attempting to claim badge 1...");
    const tx = await badgeContract.connect(user1).claimBadge(1);
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("Status:", receipt.status === 1 ? "Success" : "Failed");
    
    // Check if user now has the badge
    const hasBadgeAfter = await badgeContract.hasBadge(user1.address, 1);
    console.log("User1 has badge 1 after claim:", hasBadgeAfter);
    
  } catch (error) {
    console.error("❌ Error claiming badge:", error.message);
    console.error("Error details:", error);
  }

  // Test 4: Check contract balance and owner
  console.log("\n🧪 Test 4: Contract Info");
  try {
    const contractOwner = await badgeContract.owner();
    console.log("Contract owner:", contractOwner);
    console.log("Current signer:", owner.address);
    console.log("Owner matches current signer:", contractOwner === owner.address);
  } catch (error) {
    console.error("❌ Error getting contract info:", error.message);
  }

  console.log("\n🔍 Debugging complete!");
  console.log("\n💡 If the claim worked, the issue might be in the frontend.");
  console.log("💡 If the claim failed, check the error message above.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Debug failed:", error);
    process.exit(1);
  }); 
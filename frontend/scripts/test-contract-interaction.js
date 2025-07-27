import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🔍 Testing Contract Interaction");
  console.log("================================");

  // Get signers
  const [owner, user1] = await ethers.getSigners();
  
  console.log("👤 Owner:", owner.address);
  console.log("👤 User1:", user1.address);

  // Get the deployed badge contract
  const badgeContractAddress = "0x67d269191c92Caf3cD7723F116c85e6E9bf55933";
  const AchievementBadge = await ethers.getContractFactory("AchievementBadge");
  const badgeContract = AchievementBadge.attach(badgeContractAddress);

  console.log("📋 Badge contract address:", badgeContractAddress);

  // Test 1: Check if user can claim badge 2 (different badge)
  console.log("\n🧪 Test 1: Check Claim Eligibility for Badge 2");
  try {
    const canClaim = await badgeContract.canClaimBadge(user1.address, 2);
    console.log("User1 can claim badge 2:", canClaim);
  } catch (error) {
    console.error("❌ Error checking claim eligibility:", error.message);
  }

  // Test 2: Check if user already has badge 2
  console.log("\n🧪 Test 2: Check if User Has Badge 2");
  try {
    const hasBadge = await badgeContract.hasBadge(user1.address, 2);
    console.log("User1 has badge 2:", hasBadge);
  } catch (error) {
    console.error("❌ Error checking if user has badge:", error.message);
  }

  // Test 3: Try to claim badge 2
  console.log("\n🧪 Test 3: Attempt Badge 2 Claim");
  try {
    console.log("User1 attempting to claim badge 2...");
    const tx = await badgeContract.connect(user1).claimBadge(2);
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("Status:", receipt.status === 1 ? "Success" : "Failed");
    
    // Check if user now has the badge
    const hasBadgeAfter = await badgeContract.hasBadge(user1.address, 2);
    console.log("User1 has badge 2 after claim:", hasBadgeAfter);
    
  } catch (error) {
    console.error("❌ Error claiming badge:", error.message);
  }

  // Test 4: Get all user badges
  console.log("\n🧪 Test 4: Get All User Badges");
  try {
    const userBadges = await badgeContract.getUserBadges(user1.address);
    console.log("User1 badges:", userBadges.map(id => Number(id)));
  } catch (error) {
    console.error("❌ Error getting user badges:", error.message);
  }

  console.log("\n🎉 Contract interaction test completed!");
  console.log("\n💡 If this test worked, the issue is in the frontend.");
  console.log("💡 If this test failed, the issue is with the contract.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 
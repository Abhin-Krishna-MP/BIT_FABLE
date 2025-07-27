import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🏆 Testing Badge Claiming System");
  console.log("=================================");

  // Get signers
  const [owner, user1, user2] = await ethers.getSigners();
  
  console.log("👤 Owner:", owner.address);
  console.log("👤 User1:", user1.address);
  console.log("👤 User2:", user2.address);

  // Get the deployed badge contract
  const badgeContractAddress = "0x67d269191c92Caf3cD7723F116c85e6E9bf55933"; // Update with actual address
  const AchievementBadge = await ethers.getContractFactory("AchievementBadge");
  const badgeContract = AchievementBadge.attach(badgeContractAddress);

  console.log("📋 Badge contract address:", badgeContractAddress);

  // Test 1: Check if badge types exist
  console.log("\n🧪 Test 1: Checking Badge Types");
  try {
    const badgeType1 = await badgeContract.getBadgeType(1);
    console.log("✅ Badge type 1:", badgeType1.name);
    console.log("   Description:", badgeType1.description);
    
    const badgeType2 = await badgeContract.getBadgeType(2);
    console.log("✅ Badge type 2:", badgeType2.name);
  } catch (error) {
    console.error("❌ Error getting badge types:", error.message);
  }

  // Test 2: Check if users can claim badges
  console.log("\n🧪 Test 2: Checking Claim Eligibility");
  try {
    const user1CanClaim = await badgeContract.canClaimBadge(user1.address, 1);
    const user2CanClaim = await badgeContract.canClaimBadge(user2.address, 1);
    
    console.log("User1 can claim badge 1:", user1CanClaim);
    console.log("User2 can claim badge 1:", user2CanClaim);
  } catch (error) {
    console.error("❌ Error checking claim eligibility:", error.message);
  }

  // Test 3: User1 claims a badge
  console.log("\n🧪 Test 3: User1 Claims Badge");
  try {
    console.log("User1 claiming badge type 1...");
    const tx = await badgeContract.connect(user1).claimBadge(1);
    const receipt = await tx.wait();
    
    console.log("✅ Badge claimed successfully!");
    console.log("Transaction hash:", receipt.hash);
    
    // Check if user1 now has the badge
    const hasBadge = await badgeContract.hasBadge(user1.address, 1);
    console.log("User1 has badge 1:", hasBadge);
    
    // Check if user1 can claim again (should be false)
    const canClaimAgain = await badgeContract.canClaimBadge(user1.address, 1);
    console.log("User1 can claim badge 1 again:", canClaimAgain);
    
  } catch (error) {
    console.error("❌ Error claiming badge:", error.message);
  }

  // Test 4: User2 claims a different badge
  console.log("\n🧪 Test 4: User2 Claims Different Badge");
  try {
    console.log("User2 claiming badge type 2...");
    const tx = await badgeContract.connect(user2).claimBadge(2);
    const receipt = await tx.wait();
    
    console.log("✅ Badge claimed successfully!");
    console.log("Transaction hash:", receipt.hash);
    
    // Check if user2 now has the badge
    const hasBadge = await badgeContract.hasBadge(user2.address, 2);
    console.log("User2 has badge 2:", hasBadge);
    
  } catch (error) {
    console.error("❌ Error claiming badge:", error.message);
  }

  // Test 5: Get user badges
  console.log("\n🧪 Test 5: Getting User Badges");
  try {
    const user1Badges = await badgeContract.getUserBadges(user1.address);
    const user2Badges = await badgeContract.getUserBadges(user2.address);
    
    console.log("User1 badges:", user1Badges.map(id => Number(id)));
    console.log("User2 badges:", user2Badges.map(id => Number(id)));
    
  } catch (error) {
    console.error("❌ Error getting user badges:", error.message);
  }

  // Test 6: Try to claim same badge again (should fail)
  console.log("\n🧪 Test 6: Trying to Claim Same Badge Again");
  try {
    console.log("User1 trying to claim badge 1 again...");
    const tx = await badgeContract.connect(user1).claimBadge(1);
    await tx.wait();
    console.log("❌ This should have failed!");
  } catch (error) {
    console.log("✅ Correctly prevented double-claiming:", error.message);
  }

  console.log("\n🎉 Badge claiming tests completed!");
  console.log("\n💡 Next steps:");
  console.log("1. Test badge claiming in your React app");
  console.log("2. Check that the MetaMask RPC error is resolved");
  console.log("3. Verify badges appear in user profiles");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 
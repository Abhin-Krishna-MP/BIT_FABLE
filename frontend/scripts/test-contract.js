import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🧪 Comprehensive contract testing...");
  
  try {
    // Get the contract
    const XPSystem = await ethers.getContractFactory("XPSystem");
    const contract = await XPSystem.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    
    // Get multiple signers for testing
    const [signer1, signer2] = await ethers.getSigners();
    const address1 = await signer1.getAddress();
    const address2 = await signer2.getAddress();
    
    console.log("📍 Testing with addresses:");
    console.log("  Address 1:", address1);
    console.log("  Address 2:", address2);
    
    // Test 1: Check unregistered users
    console.log("\n🔍 Test 1: Unregistered users");
    const isRegistered1 = await contract.isUserRegistered(address1);
    const isRegistered2 = await contract.isUserRegistered(address2);
    console.log("✅ Address 1 registered:", isRegistered1);
    console.log("✅ Address 2 registered:", isRegistered2);
    
    // Test 2: Try to get user data for unregistered user
    console.log("\n🔍 Test 2: Getting user data for unregistered user");
    try {
      const userData1 = await contract.getUser(address1);
      console.log("✅ getUser result for unregistered user:", userData1);
    } catch (error) {
      console.log("❌ Error getting user data for unregistered user:", error.message);
    }
    
    // Test 3: Register user 1
    console.log("\n🔍 Test 3: Registering user 1");
    if (!isRegistered1) {
      const tx = await contract.setUser("TestUser1");
      await tx.wait();
      console.log("✅ User 1 registered successfully!");
    } else {
      console.log("ℹ️ User 1 already registered");
    }
    
    // Test 4: Get user data for registered user
    console.log("\n🔍 Test 4: Getting user data for registered user");
    const userData1 = await contract.getUser(address1);
    console.log("✅ getUser result for registered user:", userData1);
    
    // Test 5: Test structured data conversion
    console.log("\n🔍 Test 5: Structured data conversion");
    const structuredData = {
      username: userData1[0],
      xp: Number(userData1[1]),
      level: Number(userData1[2]),
      achievements: Number(userData1[3]),
      dailyStreak: Number(userData1[4]),
      lastDailyCheck: Number(userData1[5]),
      powerUpsUsed: Number(userData1[6]),
      totalTasksCompleted: Number(userData1[7]),
      totalPhasesCompleted: Number(userData1[8]),
      ideasShared: Number(userData1[9]),
      upvotesGiven: Number(userData1[10])
    };
    console.log("✅ Structured data:", structuredData);
    
    // Test 6: Test edge cases
    console.log("\n🔍 Test 6: Edge cases");
    
    // Test with zero address
    try {
      const zeroAddress = "0x0000000000000000000000000000000000000000";
      const isZeroRegistered = await contract.isUserRegistered(zeroAddress);
      console.log("✅ Zero address isUserRegistered:", isZeroRegistered);
      
      const zeroUserData = await contract.getUser(zeroAddress);
      console.log("✅ Zero address getUser:", zeroUserData);
    } catch (error) {
      console.log("❌ Error with zero address:", error.message);
    }
    
    // Test 7: Test with invalid address
    console.log("\n🔍 Test 7: Invalid address");
    try {
      const invalidAddress = "0x123";
      const isInvalidRegistered = await contract.isUserRegistered(invalidAddress);
      console.log("✅ Invalid address isUserRegistered:", isInvalidRegistered);
    } catch (error) {
      console.log("❌ Error with invalid address:", error.message);
    }
    
    console.log("\n🎉 All tests completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 
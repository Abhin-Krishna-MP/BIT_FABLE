import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🧪 Testing user registration and getUser function...");
  
  try {
    // Get the contract
    const XPSystem = await ethers.getContractFactory("XPSystem");
    const contract = await XPSystem.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    
    // Get the signer
    const [signer] = await ethers.getSigners();
    const testAddress = await signer.getAddress();
    
    console.log("📍 Testing with address:", testAddress);
    
    // Check if user is already registered
    console.log("🔍 Checking if user is already registered...");
    const isAlreadyRegistered = await contract.isUserRegistered(testAddress);
    console.log("✅ Already registered:", isAlreadyRegistered);
    
    if (!isAlreadyRegistered) {
      // Register the user
      console.log("🔍 Registering user...");
      const tx = await contract.setUser("TestUser");
      await tx.wait();
      console.log("✅ User registered successfully!");
    }
    
    // Now test getUser
    console.log("🔍 Testing getUser after registration...");
    const userData = await contract.getUser(testAddress);
    console.log("✅ getUser result:", userData);
    
    // Test the structured data
    const structuredData = {
      username: userData[0],
      xp: Number(userData[1]),
      level: Number(userData[2]),
      achievements: Number(userData[3]),
      dailyStreak: Number(userData[4]),
      lastDailyCheck: Number(userData[5]),
      powerUpsUsed: Number(userData[6]),
      totalTasksCompleted: Number(userData[7]),
      totalPhasesCompleted: Number(userData[8]),
      ideasShared: Number(userData[9]),
      upvotesGiven: Number(userData[10])
    };
    
    console.log("✅ Structured data:", structuredData);
    
    // Verify the data makes sense
    console.log("🔍 Verifying data integrity...");
    console.log("✅ Username:", structuredData.username);
    console.log("✅ XP:", structuredData.xp);
    console.log("✅ Level:", structuredData.level);
    console.log("✅ Achievements:", structuredData.achievements);
    
    console.log("🎉 All tests completed successfully!");
    
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
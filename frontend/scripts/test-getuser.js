import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🧪 Testing getUser function...");
  
  try {
    // Get the contract
    const XPSystem = await ethers.getContractFactory("XPSystem");
    const contract = await XPSystem.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    
    // Test with a known address (first Hardhat account)
    const [signer] = await ethers.getSigners();
    const testAddress = await signer.getAddress();
    
    console.log("📍 Testing with address:", testAddress);
    
    // Test isUserRegistered
    console.log("🔍 Testing isUserRegistered...");
    const isRegistered = await contract.isUserRegistered(testAddress);
    console.log("✅ isUserRegistered result:", isRegistered);
    
    if (isRegistered) {
      // Test getUser
      console.log("🔍 Testing getUser...");
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
    } else {
      console.log("ℹ️ User is not registered yet");
    }
    
    // Test with zero address
    console.log("🔍 Testing with zero address...");
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const isZeroRegistered = await contract.isUserRegistered(zeroAddress);
    console.log("✅ Zero address isUserRegistered:", isZeroRegistered);
    
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
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
import pkg from "hardhat";
const { ethers, network } = pkg;

async function main() {
  console.log("🚀 Starting XPSystem contract deployment...");

  // Get the contract factory
  const XPSystem = await ethers.getContractFactory("XPSystem");
  console.log("📋 Contract factory created");

  // Deploy the contract
  console.log("⏳ Deploying XPSystem contract...");
  const xpSystem = await XPSystem.deploy();
  
  // Wait for deployment to finish
  await xpSystem.waitForDeployment();
  
  // Get the deployed contract address
  const contractAddress = await xpSystem.getAddress();
  
  console.log("✅ XPSystem deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 Network:", network.name);
  
  // Verify the deployment by calling a view function
  try {
    const isRegistered = await xpSystem.isUserRegistered("0x0000000000000000000000000000000000000000");
    console.log("✅ Contract verification successful - isUserRegistered function works");
  } catch (error) {
    console.log("⚠️  Contract verification failed:", error.message);
  }
  
  console.log("\n📝 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Copy the ABI from artifacts/contracts/XPSystem.sol/XPSystem.json");
  console.log("3. Update your frontend with the contract address and ABI");
  console.log("4. Start your React app and test the integration!");
  
  return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
}); 
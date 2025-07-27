import pkg from "hardhat";
const { ethers } = pkg;
import fs from 'fs';
import path from 'path';

async function main() {
  console.log("🚀 Starting XPSystem contract redeployment...");

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
  
  // Verify the deployment by calling a view function
  try {
    const isRegistered = await xpSystem.isUserRegistered("0x0000000000000000000000000000000000000000");
    console.log("✅ Contract verification successful - isUserRegistered function works");
  } catch (error) {
    console.log("⚠️  Contract verification failed:", error.message);
  }
  
  // Update the contract address in xpContract.js
  const xpContractPath = path.join(process.cwd(), 'src', 'ethereum', 'xpContract.js');
  let xpContractContent = fs.readFileSync(xpContractPath, 'utf8');
  
  // Replace the contract address
  const oldAddressRegex = /const CONTRACT_ADDRESS = '0x[a-fA-F0-9]{40}';/;
  const newAddressLine = `const CONTRACT_ADDRESS = '${contractAddress}';`;
  
  if (oldAddressRegex.test(xpContractContent)) {
    xpContractContent = xpContractContent.replace(oldAddressRegex, newAddressLine);
    fs.writeFileSync(xpContractPath, xpContractContent);
    console.log("✅ Updated contract address in xpContract.js");
  } else {
    console.log("⚠️  Could not find contract address in xpContract.js");
  }
  
  // Copy the latest ABI
  const artifactsPath = path.join(process.cwd(), 'artifacts', 'contracts', 'XPSystem.sol', 'XPSystem.json');
  const abiPath = path.join(process.cwd(), 'src', 'ethereum', 'XPSystem.json');
  
  if (fs.existsSync(artifactsPath)) {
    fs.copyFileSync(artifactsPath, abiPath);
    console.log("✅ Updated ABI from artifacts");
  } else {
    console.log("⚠️  Could not find artifacts file");
  }
  
  console.log("\n📝 Redeployment completed!");
  console.log("📍 New contract address:", contractAddress);
  console.log("🔄 Frontend code has been updated automatically");
  console.log("🚀 You can now test the integration!");
  
  return contractAddress;
}

main().catch((error) => {
  console.error("❌ Redeployment failed:", error);
  process.exitCode = 1;
}); 
import pkg from "hardhat";
const { ethers } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Starting XPSystem contract redeployment...");
  
  // Deploy the contract
  const XPSystem = await ethers.getContractFactory("XPSystem");
  console.log("📋 Contract factory created");
  
  console.log("⏳ Deploying XPSystem contract...");
  const xpSystem = await XPSystem.deploy();
  await xpSystem.waitForDeployment();
  
  const contractAddress = await xpSystem.getAddress();
  console.log("✅ XPSystem deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 Network: localhost");
  
  // Verify the contract works
  try {
    const testAddress = "0x0000000000000000000000000000000000000000";
    const isRegistered = await xpSystem.isUserRegistered(testAddress);
    console.log("✅ Contract verification successful - isUserRegistered function works");
  } catch (error) {
    console.log("⚠️ Contract verification failed:", error.message);
  }
  
  // Update the contract address in xpContract.js
  const xpContractPath = path.join(__dirname, '../src/ethereum/xpContract.js');
  let xpContractContent = fs.readFileSync(xpContractPath, 'utf8');
  
  // Update the contract address
  const addressRegex = /const CONTRACT_ADDRESS = '([^']+)';/;
  xpContractContent = xpContractContent.replace(addressRegex, `const CONTRACT_ADDRESS = '${contractAddress}';`);
  
  fs.writeFileSync(xpContractPath, xpContractContent);
  console.log("✅ Updated contract address in xpContract.js");
  
  // Copy the ABI from artifacts to src/ethereum
  const artifactPath = path.join(__dirname, '../artifacts/contracts/XPSystem.sol/XPSystem.json');
  const targetPath = path.join(__dirname, '../src/ethereum/XPSystem.json');
  
  if (fs.existsSync(artifactPath)) {
    fs.copyFileSync(artifactPath, targetPath);
    console.log("✅ Copied latest ABI to src/ethereum/XPSystem.json");
  } else {
    console.log("⚠️ ABI file not found at:", artifactPath);
  }
  
  console.log("\n📝 Next steps:");
  console.log("1. The contract address has been updated automatically");
  console.log("2. The ABI has been copied to the frontend");
  console.log("3. Start your React app and test the integration!");
  console.log("4. Make sure MetaMask is connected to localhost:8545");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 
import pkg from "hardhat";
const { ethers } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Starting AchievementBadge contract deployment...");
  
  // Deploy the contract
  const AchievementBadge = await ethers.getContractFactory("AchievementBadge");
  console.log("📋 Contract factory created");
  
  console.log("⏳ Deploying AchievementBadge contract...");
  const achievementBadge = await AchievementBadge.deploy();
  await achievementBadge.waitForDeployment();
  
  const contractAddress = await achievementBadge.getAddress();
  console.log("✅ AchievementBadge deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 Network: localhost");
  
  // Add badge types
  console.log("🔍 Adding badge types...");
  
  // Badge Type 1: Pitch Master
  await achievementBadge.addBadgeType(
    1,
    "Pitch Master",
    "Awarded for completing the Pitch & Scale phase.",
    "https://ipfs.io/ipfs/QmSamplePitchMasterBadge"
  );
  console.log("✅ Added Pitch Master badge");
  
  // Badge Type 2: MVP Builder
  await achievementBadge.addBadgeType(
    2,
    "MVP Builder",
    "Awarded for completing the MVP Development phase.",
    "https://ipfs.io/ipfs/QmSampleMVPBuilderBadge"
  );
  console.log("✅ Added MVP Builder badge");
  
  // Badge Type 3: Market Explorer
  await achievementBadge.addBadgeType(
    3,
    "Market Explorer",
    "Awarded for completing the Market Research phase.",
    "https://ipfs.io/ipfs/QmSampleMarketExplorerBadge"
  );
  console.log("✅ Added Market Explorer badge");
  
  // Badge Type 4: Level 5 Achiever
  await achievementBadge.addBadgeType(
    4,
    "Level 5 Achiever",
    "Awarded for reaching level 5 in the game.",
    "https://ipfs.io/ipfs/QmSampleLevel5Badge"
  );
  console.log("✅ Added Level 5 Achiever badge");
  
  // Badge Type 5: Social Butterfly
  await achievementBadge.addBadgeType(
    5,
    "Social Butterfly",
    "Awarded for sharing 5 ideas with the community.",
    "https://ipfs.io/ipfs/QmSampleSocialButterflyBadge"
  );
  console.log("✅ Added Social Butterfly badge");
  
  // Save contract address to a file for frontend use
  const contractInfo = {
    address: contractAddress,
    network: "localhost",
    deployedAt: new Date().toISOString()
  };
  
  const contractInfoPath = path.join(__dirname, '../src/ethereum/badgeContract.json');
  fs.writeFileSync(contractInfoPath, JSON.stringify(contractInfo, null, 2));
  console.log("✅ Saved contract info to src/ethereum/badgeContract.json");
  
  // Copy the ABI from artifacts to src/ethereum
  const artifactPath = path.join(__dirname, '../artifacts/contracts/AchievementBadge.sol/AchievementBadge.json');
  const targetPath = path.join(__dirname, '../src/ethereum/AchievementBadge.json');
  
  if (fs.existsSync(artifactPath)) {
    fs.copyFileSync(artifactPath, targetPath);
    console.log("✅ Copied ABI to src/ethereum/AchievementBadge.json");
  } else {
    console.log("⚠️ ABI file not found at:", artifactPath);
  }
  
  console.log("\n📝 Next steps:");
  console.log("1. The AchievementBadge contract has been deployed");
  console.log("2. 5 badge types have been added");
  console.log("3. Contract info and ABI have been saved");
  console.log("4. You can now integrate the badge system into your frontend!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 
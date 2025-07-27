import pkg from "hardhat";
const { ethers } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🏆 Starting AchievementBadge contract deployment...");
  
  // Get the contract factory
  const AchievementBadge = await ethers.getContractFactory("AchievementBadge");
  console.log("📋 Contract factory created");
  
  // Deploy the contract
  console.log("⏳ Deploying AchievementBadge contract...");
  const badgeContract = await AchievementBadge.deploy();
  await badgeContract.waitForDeployment();
  
  const badgeContractAddress = await badgeContract.getAddress();
  console.log("✅ AchievementBadge deployed successfully!");
  console.log("📍 Contract address:", badgeContractAddress);
  console.log("🔗 Network: localhost");
  
  // Add some initial badge types
  console.log("🎯 Adding initial badge types...");
  
  const badgeTypes = [
    {
      id: 1,
      name: "Pitch Master",
      description: "Awarded for completing the Pitch & Scale phase.",
      imageURI: "https://ipfs.io/ipfs/QmSampleBadge1"
    },
    {
      id: 2,
      name: "Ideation Expert",
      description: "Awarded for completing the Ideation phase.",
      imageURI: "https://ipfs.io/ipfs/QmSampleBadge2"
    },
    {
      id: 3,
      name: "Validation Pro",
      description: "Awarded for completing the Validation phase.",
      imageURI: "https://ipfs.io/ipfs/QmSampleBadge3"
    },
    {
      id: 4,
      name: "MVP Builder",
      description: "Awarded for completing the MVP phase.",
      imageURI: "https://ipfs.io/ipfs/QmSampleBadge4"
    },
    {
      id: 5,
      name: "Launch Champion",
      description: "Awarded for completing the Launch phase.",
      imageURI: "https://ipfs.io/ipfs/QmSampleBadge5"
    },
    {
      id: 6,
      name: "Feedback Guru",
      description: "Awarded for completing the Feedback & Iterate phase.",
      imageURI: "https://ipfs.io/ipfs/QmSampleBadge6"
    },
    {
      id: 7,
      name: "Monetization Master",
      description: "Awarded for completing the Monetization phase.",
      imageURI: "https://ipfs.io/ipfs/QmSampleBadge7"
    }
  ];
  
  for (const badgeType of badgeTypes) {
    try {
      const tx = await badgeContract.addBadgeType(
        badgeType.id,
        badgeType.name,
        badgeType.description,
        badgeType.imageURI
      );
      await tx.wait();
      console.log(`✅ Added badge type: ${badgeType.name}`);
    } catch (error) {
      console.error(`❌ Failed to add badge type ${badgeType.name}:`, error.message);
    }
  }
  
  // Save contract info
  const contractInfo = {
    address: badgeContractAddress,
    network: "localhost",
    deployedAt: new Date().toISOString()
  };
  
  const contractInfoPath = path.join(__dirname, '../src/ethereum/badgeContract.json');
  fs.writeFileSync(contractInfoPath, JSON.stringify(contractInfo, null, 2));
  console.log("✅ Saved contract info to src/ethereum/badgeContract.json");
  
  // Copy ABI
  const artifactPath = path.join(__dirname, '../artifacts/contracts/AchievementBadge.sol/AchievementBadge.json');
  const abiPath = path.join(__dirname, '../src/ethereum/AchievementBadge.json');
  
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    fs.writeFileSync(abiPath, JSON.stringify(artifact, null, 2));
    console.log("✅ Copied ABI to src/ethereum/AchievementBadge.json");
  }
  
  // Test the contract
  console.log("🧪 Testing contract functionality...");
  
  try {
    // Test getting badge type
    const badgeType = await badgeContract.getBadgeType(1);
    console.log("✅ Badge type 1 retrieved:", badgeType.name);
    
    // Test canClaimBadge function
    const [owner] = await ethers.getSigners();
    const canClaim = await badgeContract.canClaimBadge(owner.address, 1);
    console.log("✅ Can claim badge test:", canClaim);
    
    console.log("🎉 Contract deployment and testing completed successfully!");
  } catch (error) {
    console.error("❌ Contract testing failed:", error.message);
  }
  
  console.log("\n📝 Next steps:");
  console.log("1. The badge contract address has been updated automatically");
  console.log("2. The ABI has been copied to the frontend");
  console.log("3. Initial badge types have been added");
  console.log("4. Start your React app and test badge claiming!");
  console.log("5. Make sure MetaMask is connected to localhost:8545");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 
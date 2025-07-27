import { ethers } from "hardhat";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Deploying Startup Quest contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy QST Token
  console.log("\n🪙 Deploying QST Token...");
  const QSTToken = await ethers.getContractFactory("QSTToken");
  const qstToken = await QSTToken.deploy(deployer.address);
  await qstToken.waitForDeployment();
  const qstTokenAddress = await qstToken.getAddress();
  console.log("✅ QST Token deployed to:", qstTokenAddress);

  // Deploy IdeaVoting contract
  console.log("\n🗳️ Deploying IdeaVoting contract...");
  const IdeaVoting = await ethers.getContractFactory("IdeaVoting");
  const ideaVoting = await IdeaVoting.deploy(qstTokenAddress);
  await ideaVoting.waitForDeployment();
  const ideaVotingAddress = await ideaVoting.getAddress();
  console.log("✅ IdeaVoting deployed to:", ideaVotingAddress);

  // Mint some initial QST tokens to the deployer for testing
  console.log("\n🎁 Minting initial QST tokens to deployer...");
  const initialTokens = ethers.parseEther("1000"); // 1000 QST tokens
  await qstToken.mint(deployer.address, initialTokens);
  console.log("✅ Minted", ethers.formatEther(initialTokens), "QST tokens to deployer");

  // Save contract addresses to JSON files
  const contractInfo = {
    qstToken: {
      address: qstTokenAddress,
      network: "localhost",
      deployedAt: new Date().toISOString()
    },
    ideaVoting: {
      address: ideaVotingAddress,
      network: "localhost",
      deployedAt: new Date().toISOString()
    }
  };

  // Save to src/ethereum directory
  const ethereumDir = path.join(__dirname, '../src/ethereum');
  if (!fs.existsSync(ethereumDir)) {
    fs.mkdirSync(ethereumDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(ethereumDir, 'votingContracts.json'),
    JSON.stringify(contractInfo, null, 2)
  );

  // Copy ABIs
  const artifactsDir = path.join(__dirname, '../artifacts/contracts');
  
  // Copy QSTToken ABI
  const qstTokenArtifact = JSON.parse(
    fs.readFileSync(path.join(artifactsDir, 'QSTToken.sol/QSTToken.json'), 'utf8')
  );
  fs.writeFileSync(
    path.join(ethereumDir, 'QSTToken.json'),
    JSON.stringify({ abi: qstTokenArtifact.abi }, null, 2)
  );

  // Copy IdeaVoting ABI
  const ideaVotingArtifact = JSON.parse(
    fs.readFileSync(path.join(artifactsDir, 'IdeaVoting.sol/IdeaVoting.json'), 'utf8')
  );
  fs.writeFileSync(
    path.join(ethereumDir, 'IdeaVoting.json'),
    JSON.stringify({ abi: ideaVotingArtifact.abi }, null, 2)
  );

  console.log("\n📁 Contract addresses and ABIs saved to src/ethereum/");
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Summary:");
  console.log("   QST Token:", qstTokenAddress);
  console.log("   IdeaVoting:", ideaVotingAddress);
  console.log("   Network: localhost (Hardhat)");
  console.log("   Deployer:", deployer.address);
  console.log("   Initial QST Balance:", ethers.formatEther(initialTokens), "QST");

  console.log("\n🔧 Next steps:");
  console.log("   1. Start Hardhat node: npx hardhat node");
  console.log("   2. Import deployer account to MetaMask");
  console.log("   3. Add localhost network to MetaMask (127.0.0.1:8545)");
  console.log("   4. Start the frontend: npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 
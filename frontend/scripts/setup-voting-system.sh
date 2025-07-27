#!/bin/bash

echo "🚀 Setting up Startup Quest Voting System..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Install dependencies if not already installed
echo "📦 Installing dependencies..."
npm install

# Check if Hardhat is installed
if ! command -v npx hardhat &> /dev/null; then
    echo "❌ Error: Hardhat not found. Please install it first: npm install --save-dev hardhat"
    exit 1
fi

# Compile contracts
echo "🔨 Compiling smart contracts..."
npx hardhat compile

# Check if compilation was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Contract compilation failed"
    exit 1
fi

# Deploy contracts
echo "🚀 Deploying contracts..."
node scripts/deploy-voting.js

# Check if deployment was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Contract deployment failed"
    exit 1
fi

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🔧 Next steps:"
echo "   1. Start Hardhat node: npx hardhat node"
echo "   2. Import deployer account to MetaMask"
echo "   3. Add localhost network to MetaMask (127.0.0.1:8545)"
echo "   4. Start the frontend: npm run dev"
echo "   5. Navigate to /voting to test the voting system"
echo ""
echo "📋 Contract addresses saved to src/ethereum/votingContracts.json"
echo "📋 ABIs saved to src/ethereum/QSTToken.json and src/ethereum/IdeaVoting.json"
echo ""
echo "🎉 Happy voting!" 
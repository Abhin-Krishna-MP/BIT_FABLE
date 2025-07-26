#!/bin/bash

# Startup Quest - Ethereum Integration Setup Script
# This script automates the setup process for the Ethereum integration

echo "🚀 Starting Startup Quest Ethereum Integration Setup..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Compile smart contracts
echo "🔨 Compiling smart contracts..."
npx hardhat compile
if [ $? -eq 0 ]; then
    echo "✅ Smart contracts compiled successfully"
else
    echo "❌ Failed to compile smart contracts"
    exit 1
fi

# Create ethereum directory if it doesn't exist
mkdir -p src/ethereum

# Copy ABI file
echo "📋 Copying contract ABI..."
if [ -f "artifacts/contracts/XPSystem.sol/XPSystem.json" ]; then
    cp artifacts/contracts/XPSystem.sol/XPSystem.json src/ethereum/XPSystem.json
    echo "✅ Contract ABI copied to src/ethereum/XPSystem.json"
else
    echo "❌ Contract ABI not found. Make sure compilation was successful."
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Start the local Ethereum network:"
echo "   npx hardhat node"
echo ""
echo "2. In a new terminal, deploy the contract:"
echo "   npx hardhat run scripts/deploy.js --network localhost"
echo ""
echo "3. Copy the deployed contract address and update it in:"
echo "   src/ethereum/xpContract.js"
echo ""
echo "4. Start the development server:"
echo "   npm run dev"
echo ""
echo "5. Configure MetaMask:"
echo "   - Add network: http://127.0.0.1:8545, Chain ID: 1337"
echo "   - Import a test account from the Hardhat node output"
echo ""
echo "🔗 For detailed instructions, see README.md" 
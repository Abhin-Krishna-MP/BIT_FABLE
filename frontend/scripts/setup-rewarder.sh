#!/bin/bash

echo "🚀 Setting up ETH Reward System for Startup Quest Hackathon"
echo "=========================================================="

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Check if Hardhat is installed
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js and npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Compiling contracts..."
npx hardhat compile

echo "🚀 Starting Hardhat node in background..."
npx hardhat node > hardhat-node.log 2>&1 &
HARDHAT_PID=$!

echo "⏳ Waiting for Hardhat node to start..."
sleep 5

echo "📝 Deploying Rewarder contract..."
npx hardhat run scripts/deploy-rewarder.js --network localhost

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start your frontend: npm run dev"
echo "2. Import RewardButton component in your React app"
echo "3. Use it like: <RewardButton taskCompleted={true} />"
echo ""
echo "🔗 Contract files saved to:"
echo "   - src/ethereum/Rewarder.json (ABI)"
echo "   - src/ethereum/rewarderContract.json (Address)"
echo ""
echo "💡 Usage example:"
echo "   import RewardButton from './components/RewardButton';"
echo "   <RewardButton taskCompleted={true} onRewardClaimed={(result) => console.log('Reward sent!', result)} />"
echo ""
echo "🛑 To stop Hardhat node later: kill $HARDHAT_PID" 
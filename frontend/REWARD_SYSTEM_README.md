# 🎁 ETH Reward System for Startup Quest

A simple smart contract system that rewards users with **0.1 ETH** when they complete tasks in your gamified app.

## 🚀 Quick Setup (2 minutes)

### 1. Deploy the Contract
```bash
# Run the automated setup script
./scripts/setup-rewarder.sh
```

### 2. Add to Your React App
```jsx
import RewardButton from './components/RewardButton';

// In your component
<RewardButton 
  taskCompleted={true} 
  onRewardClaimed={(result) => console.log('Reward sent!', result)} 
/>
```

## 📁 Files Created

- `contracts/Rewarder.sol` - Smart contract that sends ETH rewards
- `scripts/deploy-rewarder.js` - Deployment script
- `src/hooks/useRewarder.js` - React hook for contract interaction
- `src/components/RewardButton.jsx` - Ready-to-use reward button component
- `src/ethereum/Rewarder.json` - Contract ABI (auto-generated)
- `src/ethereum/rewarderContract.json` - Contract address (auto-generated)

## 🔧 Manual Setup

If the automated script doesn't work:

### 1. Compile Contracts
```bash
npx hardhat compile
```

### 2. Start Hardhat Node
```bash
npx hardhat node
```

### 3. Deploy Contract
```bash
npx hardhat run scripts/deploy-rewarder.js --network localhost
```

### 4. Start Frontend
```bash
npm run dev
```

## 💡 How It Works

1. **Contract Owner**: Only the deployer can call `sendReward()`
2. **Reward Amount**: Fixed at **0.1 ETH** per reward (increased from 0.01 ETH)
3. **Funding**: Contract is funded with **5 ETH** during deployment (increased from 1 ETH)
4. **Security**: Only owner can send rewards and withdraw excess funds

## 🎯 Usage Examples

### Basic Usage
```jsx
<RewardButton taskCompleted={true} />
```

### With Callback
```jsx
<RewardButton 
  taskCompleted={true}
  onRewardClaimed={(result) => {
    console.log('Transaction hash:', result.hash);
    // Update UI, show success message, etc.
  }}
/>
```

### Conditional Rewards
```jsx
<RewardButton 
  taskCompleted={userCompletedTask} 
/>
```

## 🔍 Contract Functions

### For Users
- `sendReward(address recipient)` - Send 0.1 ETH to recipient (owner only)

### For Contract Owner
- `fundContract()` - Add ETH to contract balance
- `withdrawExcess()` - Withdraw excess ETH from contract
- `getContractBalance()` - Check contract's ETH balance

## 🛡️ Security Features

- ✅ Only owner can send rewards
- ✅ Only owner can fund/withdraw from contract
- ✅ Proper ETH transfer validation
- ✅ Event emission for transparency

## 🚨 Important Notes

1. **MetaMask Required**: Users need MetaMask installed and connected
2. **Local Network**: Contract runs on Hardhat localhost (chain ID 31337)
3. **Owner Only**: Only the deployer can send rewards
4. **ETH Required**: Contract needs ETH balance to send rewards
5. **Increased Rewards**: Now sends 0.1 ETH per reward (10x increase!)

## 🔧 Troubleshooting

### "MetaMask not found"
- Install MetaMask browser extension
- Connect to localhost:8545 network

### "Insufficient contract balance"
- Fund the contract using `fundContract()` function
- Check balance with `getContractBalance()`

### "Transaction failed"
- Ensure user has MetaMask connected
- Check if Hardhat node is running
- Verify contract is deployed correctly

## 🎉 Hackathon Ready!

This system is designed for quick integration:
- ✅ **10x Higher Rewards** - 0.1 ETH per reward
- ✅ Minimal code
- ✅ Real ETH rewards
- ✅ Ready-to-use components
- ✅ Automated setup
- ✅ Error handling included

Perfect for demonstrating blockchain integration in your hackathon project! 
# 🚀 Quick Start Guide - Ethereum Integration

Get your Startup Quest Ethereum integration running in 5 minutes!

## ⚡ Super Quick Setup

### 1. Run Setup Script
```bash
cd frontend
./setup-ethereum.sh
```

### 2. Start Local Blockchain
```bash
# In a new terminal
npx hardhat node
```

### 3. Deploy Contract
```bash
# In another terminal
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Update Contract Address
Copy the deployed address and update `src/ethereum/xpContract.js`:
```javascript
const CONTRACT_ADDRESS = 'YOUR_ADDRESS_HERE';
```

### 5. Start App
```bash
npm run dev
```

## 🔗 MetaMask Setup (2 minutes)

1. **Add Network**:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency: `ETH`

2. **Import Account**:
   - Copy any private key from Hardhat node output
   - Import in MetaMask

## 🎮 Test It!

1. Open `http://localhost:5173`
2. Go to Profile section
3. Click "Connect Wallet"
4. Set username and earn XP!

## 🚨 Common Issues

- **"No provider"**: Make sure MetaMask is installed
- **"Failed to connect"**: Check Hardhat node is running
- **"Contract not found"**: Verify contract address is correct

## 📞 Need Help?

- Check the full README.md
- Look at browser console for errors
- Ensure all terminals are running

**Happy hacking! 🎉** 
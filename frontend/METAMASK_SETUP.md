# 🔗 MetaMask Setup Guide

## Quick Setup for Hardhat Network

### Step 1: Add Hardhat Network to MetaMask

1. **Open MetaMask** in your browser
2. **Click the network dropdown** (usually shows "Ethereum Mainnet")
3. **Click "Add network"** → **"Add network manually"**
4. **Fill in these exact details**:
   - **Network Name**: `Hardhat Local`
   - **New RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `ETH`
   - **Block Explorer URL**: (leave empty)

### Step 2: Import Test Account

1. **In MetaMask**, click the account icon → **"Import account"**
2. **Copy one of these private keys** (from the Hardhat node output):
   ```
   Account #0: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   Account #1: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   Account #2: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
   ```
3. **Paste the private key** and click **"Import"**

### Step 3: Switch to Hardhat Network

1. **Select "Hardhat Local"** from the network dropdown
2. **Verify you're connected** - you should see the network name change

### Step 4: Test the Connection

1. **Open your app**: `http://localhost:5175/`
2. **Go to Profile section**
3. **Click "Connect Wallet"**
4. **Approve the connection** in MetaMask

## ✅ Verification Steps

### Check Network Connection
```javascript
// In browser console
window.ethereum.request({ method: 'eth_chainId' })
// Should return "0x539" (1337 in hex)
```

### Check Account Connection
```javascript
// In browser console
window.ethereum.request({ method: 'eth_accounts' })
// Should return array with your imported account
```

## 🚨 Common Issues

### "Wrong Network" Error
- Make sure you're on "Hardhat Local" network
- Chain ID should be 1337

### "No Accounts Found"
- Import one of the test accounts using the private keys above
- Make sure the account is selected in MetaMask

### "Failed to Connect"
- Refresh the page after switching networks
- Try disconnecting and reconnecting MetaMask

## 📋 Quick Checklist

- [ ] Hardhat node running (`npx hardhat node`)
- [ ] MetaMask installed and unlocked
- [ ] Hardhat network added (Chain ID: 1337)
- [ ] Test account imported
- [ ] Connected to Hardhat network
- [ ] App refreshed after network switch

## 🎯 Success Indicators

When everything is working correctly:
- ✅ MetaMask shows "Hardhat Local" network
- ✅ You have an account with 10,000 ETH
- ✅ "Connect Wallet" button works in your app
- ✅ No more "Failed to load on-chain data" errors
- ✅ You can set username and earn XP 
# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### ❌ "Failed to load on-chain data"

**Cause**: MetaMask not configured for Hardhat network or not connected

**Solution**:
1. **Add Hardhat Network to MetaMask**:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

2. **Import Test Account**:
   - Copy private key from Hardhat node output
   - Import in MetaMask

3. **Switch to Hardhat Network**:
   - Select "Hardhat Local" in MetaMask network dropdown

### ❌ "No Ethereum provider found"

**Cause**: MetaMask not installed or not unlocked

**Solution**:
1. Install MetaMask browser extension
2. Unlock MetaMask
3. Refresh the page

### ❌ "Contract not found"

**Cause**: Wrong network or contract not deployed

**Solution**:
1. Ensure you're on Hardhat network (Chain ID: 31337)
2. Verify Hardhat node is running: `npx hardhat node`
3. Deploy contract: `npx hardhat run scripts/deploy.js --network hardhat`

### ❌ "Transaction failed"

**Cause**: Insufficient gas or wrong network

**Solution**:
1. Check you're on Hardhat network
2. Ensure account has ETH (Hardhat accounts come pre-funded)
3. Try increasing gas limit in MetaMask

### ❌ "Failed to connect wallet"

**Cause**: MetaMask connection issues

**Solution**:
1. Refresh the page
2. Disconnect and reconnect MetaMask
3. Check browser console for errors

## 🔍 Debug Steps

### 1. Check Network Configuration
```javascript
// In browser console
window.ethereum.request({ method: 'eth_chainId' })
// Should return "0x7a69" (31337 in hex)
```

### 2. Check Account Connection
```javascript
// In browser console
window.ethereum.request({ method: 'eth_accounts' })
// Should return array of connected accounts
```

### 3. Check Contract Address
```javascript
// In browser console
import { getContract } from './src/ethereum/xpContract.js'
const contract = await getContract()
console.log(contract.target) // Should show contract address
```

## 🚀 Quick Fix Checklist

- [ ] Hardhat node running (`npx hardhat node`)
- [ ] MetaMask installed and unlocked
- [ ] Hardhat network added to MetaMask
- [ ] Test account imported
- [ ] Connected to Hardhat network
- [ ] Contract deployed and address updated
- [ ] Browser refreshed

## 📞 Still Having Issues?

1. Check browser console for errors
2. Verify all terminals are running
3. Try disconnecting/reconnecting MetaMask
4. Clear browser cache and refresh
5. Check the full README.md for detailed setup 
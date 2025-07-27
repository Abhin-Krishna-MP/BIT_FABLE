# 🐛 ETH Reward System Debug Guide

## 🚨 Common Issues & Solutions

### Issue 1: "Gas consumed but ETH never appears in recipient wallet"

**Symptoms:**
- Transaction succeeds (gas consumed)
- No ETH appears in recipient wallet
- No error message

**Root Causes & Solutions:**

#### 1. **Contract has insufficient funds**
```bash
# Check contract balance
npx hardhat console --network localhost
> const Rewarder = await ethers.getContractFactory("Rewarder")
> const rewarder = await Rewarder.attach("CONTRACT_ADDRESS")
> await rewarder.getContractBalance()
```

**Fix:** Fund the contract
```bash
> await rewarder.fundContract({ value: ethers.parseEther("5.0") })
```

#### 2. **Recipient address is incorrect**
- Ensure the recipient address is a valid Ethereum address
- Check for typos in the address
- Verify the address is not a contract that can't receive ETH

#### 3. **Network mismatch**
- Ensure MetaMask is connected to the correct network (localhost:8545)
- Check chain ID is 31337 (Hardhat localhost)

### Issue 2: "Transaction fails with 'ETH transfer failed'"

**Symptoms:**
- Transaction reverts
- Error message: "ETH transfer failed"

**Solutions:**

#### 1. **Use the improved contract**
The updated contract includes:
- Balance verification before and after transfer
- Return values to indicate success/failure
- Better error handling

#### 2. **Check recipient contract**
If recipient is a contract, ensure it has a `receive()` or `fallback()` function.

### Issue 3: "Contract not found at address"

**Symptoms:**
- Error: "Contract not found"
- ABI mismatch errors

**Solutions:**

#### 1. **Redeploy the contract**
```bash
npx hardhat run scripts/deploy-rewarder.js --network localhost
```

#### 2. **Update frontend files**
Ensure `src/ethereum/Rewarder.json` and `src/ethereum/rewarderContract.json` are updated.

### Issue 4: "MetaMask connection issues"

**Symptoms:**
- Can't connect wallet
- Wrong network
- Transaction rejected

**Solutions:**

#### 1. **Add Hardhat network to MetaMask**
- Network Name: Hardhat Local
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency Symbol: ETH

#### 2. **Import Hardhat accounts**
Use private keys from Hardhat node output to import accounts.

## 🔧 Debugging Tools

### 1. **Contract Testing Script**
```bash
npx hardhat run scripts/test-rewarder.js --network localhost
```

This script will:
- Deploy contract
- Fund it with 5 ETH
- Send test rewards (0.1 ETH each)
- Verify balances
- Check events

### 2. **Hardhat Console**
```bash
npx hardhat console --network localhost
```

Useful commands:
```javascript
// Get accounts
const [owner, user1, user2] = await ethers.getSigners()

// Deploy contract
const Rewarder = await ethers.getContractFactory("Rewarder")
const rewarder = await Rewarder.deploy(owner.address)

// Check balances
await rewarder.getContractBalance()
await ethers.provider.getBalance(user1.address)

// Send reward (0.1 ETH)
await rewarder.sendReward(user1.address)

// Check events
const events = await rewarder.queryFilter(rewarder.filters.RewardSent())
```

### 3. **Frontend Debugging**
Add console logs to track the process:

```javascript
// In useRewarder.js
console.log('Contract address:', rewarderContractInfo.rewarderAddress)
console.log('User address:', userAddress)
console.log('Contract balance:', await contract.getContractBalance())
console.log('Can send reward:', await contract.canSendReward())
console.log('Reward amount:', await contract.getRewardAmount()) // Should be 0.1 ETH
```

## 🧪 Testing Checklist

### Before Testing:
- [ ] Hardhat node is running (`npx hardhat node`)
- [ ] Contract is deployed and funded with 5 ETH
- [ ] MetaMask is connected to localhost:8545
- [ ] Frontend is using correct contract address

### During Testing:
- [ ] Check contract balance before sending reward
- [ ] Verify recipient address is correct
- [ ] Monitor transaction in MetaMask
- [ ] Check recipient balance after transaction (should increase by 0.1 ETH)
- [ ] Verify events are emitted

### After Testing:
- [ ] Confirm 0.1 ETH appears in recipient wallet
- [ ] Check contract balance decreased by 0.1 ETH
- [ ] Verify success event was emitted
- [ ] Test with insufficient funds scenario

## 🛠️ Quick Fixes

### 1. **Reset Everything**
```bash
# Stop Hardhat node
# Clear cache
rm -rf cache artifacts

# Restart Hardhat node
npx hardhat node

# Redeploy contract
npx hardhat run scripts/deploy-rewarder.js --network localhost

# Restart frontend
npm run dev
```

### 2. **Check Contract State**
```javascript
// In browser console
const contract = new ethers.Contract(address, abi, signer)
await contract.getContractBalance()
await contract.canSendReward()
await contract.getRewardAmount() // Should return 0.1 ETH
```

### 3. **Test Simple Transfer**
```javascript
// Test direct ETH transfer
const tx = await signer.sendTransaction({
  to: recipientAddress,
  value: ethers.parseEther("0.1") // Updated to 0.1 ETH
})
```

## 📊 Monitoring & Logs

### Contract Events to Monitor:
- `RewardSent(address recipient, uint256 amount, bool success)`
- `ContractFunded(address funder, uint256 amount)`
- `Withdrawal(address recipient, uint256 amount)`

### Key Metrics:
- Contract balance before/after reward
- Recipient balance before/after reward (should increase by 0.1 ETH)
- Transaction gas used
- Event emission success

## 🎯 Success Indicators

✅ **Contract working correctly when:**
- Transaction succeeds without reverting
- Recipient balance increases by exactly **0.1 ETH**
- Contract balance decreases by exactly **0.1 ETH**
- `RewardSent` event is emitted with `success: true`
- Return value is `true`

## 🚨 Emergency Fixes

### If nothing works:
1. **Use simple transfer instead:**
```javascript
const tx = await signer.sendTransaction({
  to: userAddress,
  value: ethers.parseEther("0.1") // Updated to 0.1 ETH
})
```

2. **Check Hardhat node logs:**
```bash
tail -f hardhat-node.log
```

3. **Verify network connection:**
```javascript
await ethers.provider.getNetwork()
```

## 💰 Reward Amount Summary

- **Previous Reward**: 0.01 ETH
- **New Reward**: **0.1 ETH** (10x increase!)
- **Contract Funding**: 5 ETH (supports 50 rewards)
- **Minimum Funding**: 0.1 ETH per reward

This debugging guide should help you identify and fix any issues with the ETH reward system! 
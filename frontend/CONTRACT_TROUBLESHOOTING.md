# Contract Troubleshooting Guide

## Common Issues and Solutions

### 1. "could not decode result data (value="0x")" Error

**Problem**: The frontend is trying to call a contract function but getting an empty response.

**Cause**: The contract is not deployed or the contract address is incorrect.

**Solution**:
1. Make sure the hardhat node is running: `npx hardhat node`
2. Redeploy the contract: `npx hardhat run scripts/redeploy.js --network localhost`
3. The redeploy script will automatically update the contract address in the frontend

### 2. "WARNING: Calling an account which is not a contract" Error

**Problem**: The blockchain is saying the address doesn't contain a contract.

**Cause**: The contract was never deployed or was overwritten.

**Solution**:
1. Stop the hardhat node (Ctrl+C)
2. Start it again: `npx hardhat node`
3. Redeploy the contract: `npx hardhat run scripts/redeploy.js --network localhost`

### 3. MetaMask Connection Issues

**Problem**: MetaMask can't connect to the local blockchain.

**Solution**:
1. Make sure hardhat node is running on `http://127.0.0.1:8545`
2. Add the network to MetaMask:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`
3. Import one of the test accounts using the private keys shown in the hardhat node output

### 4. Contract Functions Not Working

**Problem**: Contract functions are failing or returning unexpected results.

**Solution**:
1. Check if the contract is deployed: `npx hardhat run scripts/test-contract.js --network localhost`
2. Verify the ABI is up to date: `cp artifacts/contracts/XPSystem.sol/XPSystem.json src/ethereum/XPSystem.json`
3. Make sure the contract address in `xpContract.js` matches the deployed contract

## Quick Fix Commands

```bash
# Start hardhat node
npx hardhat node

# Redeploy contract and update frontend
npx hardhat run scripts/redeploy.js --network localhost

# Test contract functions
npx hardhat run scripts/test-contract.js --network localhost

# Update ABI manually
cp artifacts/contracts/XPSystem.sol/XPSystem.json src/ethereum/XPSystem.json
```

## Development Workflow

1. **Start Development**:
   ```bash
   # Terminal 1: Start hardhat node
   npx hardhat node
   
   # Terminal 2: Start frontend
   npm run dev
   ```

2. **After Contract Changes**:
   ```bash
   # Redeploy and update frontend automatically
   npx hardhat run scripts/redeploy.js --network localhost
   ```

3. **Testing**:
   ```bash
   # Test contract functions
   npx hardhat run scripts/test-contract.js --network localhost
   ```

## Current Contract Address

The contract is currently deployed at: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`

**Note**: This address changes every time you restart the hardhat node and redeploy the contract. 
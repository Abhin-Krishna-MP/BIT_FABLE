# 💰 Balance Check Guide - Verify ETH Rewards

## 🎯 **How to Check if ETH Rewards Were Credited**

### **1. 🧪 Automated Testing (Recommended)**
```bash
# Test the entire balance system
npx hardhat run scripts/test-balance.js --network localhost
```

This will:
- ✅ Check initial balances
- ✅ Send test rewards
- ✅ Verify balance increases
- ✅ Show transaction history
- ✅ Confirm rewards were credited

### **2. 📱 Frontend Balance Display**

The Profile page now includes a **BalanceDisplay** component that shows:

- **💰 Current ETH Balance**: Real-time wallet balance
- **🎁 Reward Amount**: How much ETH you'll receive per reward (0.1 ETH)
- **📊 Contract Status**: Whether the contract can send rewards
- **📋 Transaction History**: Recent incoming/outgoing transactions
- **🔄 Refresh Button**: Update balance and transaction data

### **3. 🔧 Manual Balance Checking**

#### **Using Hardhat Console:**
```bash
npx hardhat console --network localhost
```

```javascript
// Get account balances
const [owner, user1, user2] = await ethers.getSigners()

// Check specific address balance
const balance = await ethers.provider.getBalance(user1.address)
console.log("Balance:", ethers.formatEther(balance), "ETH")

// Check contract balance
const Rewarder = await ethers.getContractFactory("Rewarder")
const rewarder = await Rewarder.attach("CONTRACT_ADDRESS")
const contractBalance = await rewarder.getContractBalance()
console.log("Contract balance:", ethers.formatEther(contractBalance), "ETH")
```

#### **Using MetaMask:**
1. Connect MetaMask to `localhost:8545`
2. Import test accounts using private keys from Hardhat output
3. Check balance in MetaMask wallet
4. View transaction history in MetaMask

### **4. 📊 What to Look For**

#### **✅ Successful Reward Credit:**
- **Balance Increase**: Your wallet balance increases by exactly **0.1 ETH**
- **Transaction Hash**: A new transaction appears in your history
- **Contract Balance Decrease**: Contract balance decreases by 0.1 ETH
- **Event Emission**: `RewardSent` event with `success: true`

#### **❌ Failed Reward Credit:**
- **No Balance Change**: Wallet balance remains the same
- **Transaction Fails**: Transaction reverts or fails
- **Error Messages**: "Insufficient contract balance" or "ETH transfer failed"

### **5. 🔍 Debugging Steps**

#### **If Balance Doesn't Increase:**

1. **Check Contract Balance:**
   ```javascript
   const contractBalance = await rewarder.getContractBalance()
   console.log("Contract has:", ethers.formatEther(contractBalance), "ETH")
   ```

2. **Check Transaction Receipt:**
   ```javascript
   const receipt = await tx.wait()
   console.log("Transaction status:", receipt.status)
   ```

3. **Check Events:**
   ```javascript
   const events = await rewarder.queryFilter(rewarder.filters.RewardSent())
   console.log("Reward events:", events)
   ```

4. **Verify Recipient Address:**
   ```javascript
   console.log("Recipient address:", recipientAddress)
   console.log("Is valid address:", ethers.isAddress(recipientAddress))
   ```

### **6. 📈 Balance Tracking Features**

The new balance system includes:

#### **Real-time Balance Updates:**
- Automatic balance refresh when wallet connects
- Manual refresh button
- Balance updates after transactions

#### **Transaction History:**
- Last 10 blocks of transactions
- Incoming vs outgoing transactions
- Transaction amounts and timestamps
- Block numbers and transaction hashes

#### **Contract Status Monitoring:**
- Contract balance display
- Reward availability status
- Funding requirements

### **7. 🎮 Using the Balance System**

#### **In Your React App:**
```jsx
import BalanceDisplay from './components/BalanceDisplay';

// In your Profile component
<BalanceDisplay />
```

#### **Features Available:**
- **Connect Wallet**: Connect MetaMask to view balance
- **Refresh Data**: Update balance and transaction history
- **View Transactions**: See recent incoming/outgoing ETH
- **Contract Status**: Check if rewards are available

### **8. 🚨 Common Issues & Solutions**

#### **"Balance not updating"**
- Click the refresh button
- Check if MetaMask is connected to correct network
- Verify transaction was successful

#### **"No transactions showing"**
- Transactions only show from last 10 blocks
- Check if you're on the correct network
- Verify the address is correct

#### **"Contract balance is 0"**
- Fund the contract using `fundContract()` function
- Check if contract was deployed correctly
- Verify contract address

### **9. 📋 Verification Checklist**

Before claiming rewards:
- [ ] MetaMask connected to localhost:8545
- [ ] Contract has sufficient balance (≥ 0.1 ETH)
- [ ] You're the contract owner (for sending rewards)
- [ ] Recipient address is valid

After claiming rewards:
- [ ] Balance increased by 0.1 ETH
- [ ] Transaction appears in history
- [ ] Contract balance decreased
- [ ] Success event was emitted

### **10. 🎉 Success Indicators**

✅ **Reward Successfully Credited When:**
- Wallet balance increases by exactly **0.1 ETH**
- Transaction hash is generated
- `RewardSent` event shows `success: true`
- Contract balance decreases by 0.1 ETH
- Transaction appears in MetaMask history

This balance system ensures you can always verify that your ETH rewards were properly credited! 🎁💰 
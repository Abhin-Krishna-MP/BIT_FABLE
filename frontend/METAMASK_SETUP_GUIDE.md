# 🔧 MetaMask Setup Guide - Fix RPC Error

## 🚨 **Current Issue**
You're getting this error:
```
MetaMask - RPC Error: Internal JSON-RPC error.
```

## ✅ **Solution: Proper MetaMask Setup**

### **Step 1: Add Localhost Network to MetaMask**

1. **Open MetaMask**
2. **Click the network dropdown** (top of MetaMask, shows current network)
3. **Click "Add Network"**
4. **Click "Add Network Manually"**
5. **Fill in these details:**
   - **Network Name:** `Localhost 8545`
   - **New RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
   - **Block Explorer URL:** (leave empty)
6. **Click "Save"**

### **Step 2: Switch to Localhost Network**

1. **Click the network dropdown** again
2. **Select "Localhost 8545"**
3. **MetaMask should now show:**
   - Network: Localhost 8545
   - Chain ID: 31337
   - Your account should have 10,000 ETH

### **Step 3: Import Hardhat Account (Optional)**

If you want to use the same account as the contract owner:

1. **Open MetaMask**
2. **Click the account icon** (top right)
3. **Click "Import Account"**
4. **Enter private key:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
5. **This is the Hardhat account #0** with 10,000 ETH

### **Step 4: Test Connection**

1. **Try sending 0.1 ETH** to another account
2. **If this works**, MetaMask is properly connected
3. **If this fails**, check the network settings

## 🔍 **Troubleshooting Steps**

### **If Still Getting RPC Error:**

1. **Check Network Settings:**
   - MetaMask should show "Localhost 8545"
   - Chain ID should be 31337
   - RPC URL should be http://127.0.0.1:8545

2. **Restart MetaMask:**
   - Close MetaMask completely
   - Reopen MetaMask
   - Switch to Localhost 8545 network

3. **Clear Browser Cache:**
   - Press Ctrl+Shift+R (hard refresh)
   - Or clear cache completely

4. **Check Hardhat Node:**
   ```bash
   # Make sure Hardhat node is running
   curl -X POST -H "Content-Type: application/json" \
   --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
   http://localhost:8545
   ```

### **If MetaMask Won't Connect:**

1. **Try different RPC URL:**
   - Use `http://localhost:8545` instead of `http://127.0.0.1:8545`
   - Or try `http://0.0.0.0:8545`

2. **Check Firewall:**
   - Make sure port 8545 is not blocked
   - Try disabling firewall temporarily

3. **Restart Hardhat Node:**
   ```bash
   # Stop current node (Ctrl+C)
   # Start new node
   npx hardhat node
   ```

## 🎯 **Alternative Solutions**

### **Option 1: Use Different Browser**
1. **Try Chrome, Firefox, or Edge**
2. **Install MetaMask fresh**
3. **Add localhost network**

### **Option 2: Use Incognito Mode**
1. **Open browser in incognito/private mode**
2. **Install MetaMask**
3. **Add localhost network**

### **Option 3: Reset MetaMask**
1. **Settings → Advanced → Reset Account**
2. **Re-add localhost network**
3. **Import accounts again**

## 📱 **Expected Behavior After Setup**

✅ **MetaMask should show:**
- Network: Localhost 8545
- Chain ID: 31337
- Account balance: 10,000 ETH
- No RPC errors

✅ **When claiming badges:**
- MetaMask popup appears
- Transaction confirms successfully
- No RPC errors in console

## 🚀 **Quick Test**

After setup, try this:

1. **Open your React app** (should be running on http://localhost:5173)
2. **Connect MetaMask** (should work without errors)
3. **Complete a phase** in your app
4. **Try claiming a badge**
5. **MetaMask popup should appear**

## 🎉 **Success Indicators**

✅ **Setup is correct when:**
- MetaMask shows "Localhost 8545"
- No RPC errors in console
- Simple transactions work
- Badge claiming works

---

**💡 The contract is working perfectly! The issue is just MetaMask configuration. Follow these steps and your badge claiming should work!** 🏆 
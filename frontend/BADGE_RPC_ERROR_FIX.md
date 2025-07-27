# 🔧 Fix MetaMask RPC Error for Badge Claiming

## 🚨 **Current Issue**
You're getting a MetaMask RPC error when trying to claim badges:
```
MetaMask - RPC Error: Internal JSON-RPC error.
```

## ✅ **Solution Steps**

### **Step 1: Refresh Your Browser**
The frontend might be using cached contract data. Try:
1. **Hard refresh** your browser (Ctrl+F5 or Cmd+Shift+R)
2. **Clear browser cache** for localhost
3. **Restart your React app** if running

### **Step 2: Check MetaMask Connection**
1. **Open MetaMask**
2. **Ensure you're connected to localhost:8545**
3. **Check if you're on the correct account**
4. **Try switching accounts** and switching back

### **Step 3: Verify Contract Deployment**
The badge contract is deployed at: `0x67d269191c92Caf3cD7723F116c85e6E9bf55933`

### **Step 4: Test Badge Claiming**
1. **Complete a phase** in your app
2. **Try claiming the badge** again
3. **Check browser console** for specific error messages

## 🔍 **Debugging Steps**

### **If Still Getting RPC Error:**

1. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Look for specific error messages
   - Check if there are network errors

2. **Verify Hardhat Node:**
   ```bash
   # Make sure Hardhat node is running
   npx hardhat node
   ```

3. **Check Contract Status:**
   ```bash
   # Test if contract is accessible
   curl -X POST -H "Content-Type: application/json" \
   --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x67d269191c92Caf3cD7723F116c85e6E9bf55933", "latest"],"id":1}' \
   http://localhost:8545
   ```

## 🎯 **Alternative Solutions**

### **Option 1: Use Local Storage Only**
The badge system has a local storage fallback. Even if blockchain claiming fails, badges will be saved locally:

1. **Check your Profile page** - badges might be saved locally
2. **Look for the AuthStatus component** - shows backend connection
3. **Badges are preserved** even without blockchain interaction

### **Option 2: Manual Contract Interaction**
If the frontend is having issues, you can claim badges manually:

1. **Open MetaMask**
2. **Go to "Send" tab**
3. **Enter contract address:** `0x67d269191c92Caf3cD7723F116c85e6E9bf55933`
4. **Add function data** for `claimBadge(1)` (for badge type 1)

### **Option 3: Reset and Retry**
1. **Clear browser cache completely**
2. **Restart Hardhat node**
3. **Redeploy contracts**
4. **Try again**

## 📱 **What Should Work**

### **✅ Expected Behavior:**
- Click "Claim Badge" → MetaMask popup appears
- Confirm transaction → Badge is minted
- Badge appears in your profile
- No RPC errors

### **✅ Fallback Behavior:**
- If blockchain fails → Badge saved locally
- Check Profile page → Badge still appears
- No data loss

## 🚀 **Quick Fix Checklist**

- [ ] **Refresh browser** (Ctrl+F5)
- [ ] **Check MetaMask** connection to localhost:8545
- [ ] **Verify Hardhat node** is running
- [ ] **Try claiming badge** again
- [ ] **Check Profile page** for locally saved badges
- [ ] **Look at browser console** for specific errors

## 🎉 **Success Indicators**

✅ **Badge claiming works when:**
- MetaMask popup appears
- Transaction confirms successfully
- Badge appears in profile
- No RPC errors in console

✅ **Local fallback works when:**
- Badge appears in profile even if blockchain fails
- AuthStatus shows "Backend Unavailable"
- No data loss occurs

---

**💡 The badge system is designed to work even if blockchain interaction fails. Check your Profile page - your achievements might already be saved locally!** 🏆 
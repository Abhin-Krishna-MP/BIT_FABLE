# Startup Quest - Gamified Ethereum Integration

A React-based gamified startup journey application with Ethereum smart contract integration for storing user progress on-chain.

## 🚀 Features

- **Gamified Progression**: XP, levels, badges, and phase-based learning
- **Ethereum Integration**: User data stored on-chain via smart contracts
- **MetaMask Support**: Seamless wallet connection and transaction signing
- **Real-time Updates**: Live synchronization between frontend and blockchain
- **Responsive Design**: Modern UI with gamified elements

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Blockchain**: Ethereum (Hardhat local network)
- **Smart Contracts**: Solidity ^0.8.24
- **Web3**: ethers.js v6
- **Styling**: CSS with gamified design system

## 📋 Prerequisites

- Node.js (v18 or higher)
- MetaMask browser extension
- Git

## 🏗️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (Hardhat and ethers are already included)
npm install
```

### 2. Start Local Ethereum Network

```bash
# Start Hardhat local network (in a new terminal)
npx hardhat node
```

This will start a local Ethereum network on `http://127.0.0.1:8545` with 20 pre-funded accounts.

### 3. Deploy Smart Contract

```bash
# Deploy XPSystem contract to local network
npx hardhat run scripts/deploy.js --network localhost
```

**Important**: Copy the deployed contract address from the output. You'll need to update it in `src/ethereum/xpContract.js`.

### 4. Update Contract Address

After deployment, update the contract address in `src/ethereum/xpContract.js`:

```javascript
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE';
```

### 5. Copy Contract ABI

Copy the generated ABI from `artifacts/contracts/XPSystem.sol/XPSystem.json` to `src/ethereum/XPSystem.json`:

```bash
cp artifacts/contracts/XPSystem.sol/XPSystem.json src/ethereum/XPSystem.json
```

### 6. Start Development Server

```bash
# Start React development server
npm run dev
```

## 🔗 MetaMask Configuration

### 1. Add Local Network to MetaMask

1. Open MetaMask
2. Click the network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add network" → "Add network manually"
4. Fill in the details:
   - **Network Name**: Hardhat Local
   - **New RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `ETH`
   - **Block Explorer URL**: (leave empty)

### 2. Import Test Account

1. In MetaMask, click the account icon → "Import account"
2. Copy a private key from the Hardhat node output
3. Paste and import the account

## 🎮 Usage

### 1. Connect Wallet

1. Open the application in your browser
2. Navigate to the Profile section
3. Click "Connect Wallet" to connect MetaMask
4. Approve the connection in MetaMask

### 2. Set Username

1. After connecting, click the edit icon next to your username
2. Enter a new username and click "Update Username"
3. Confirm the transaction in MetaMask

### 3. Earn XP

1. Use the test buttons in the Profile section to add XP
2. Complete phases and tasks in the main application
3. All XP updates are stored on-chain

### 4. View On-Chain Data

- Your username, XP, and level are stored on the Ethereum blockchain
- Data persists across sessions and is publicly verifiable
- Use the "Refresh Data" button to sync with the latest blockchain state

## 📁 Project Structure

```
frontend/
├── contracts/
│   └── XPSystem.sol          # Smart contract for user data
├── scripts/
│   └── deploy.js             # Contract deployment script
├── src/
│   ├── ethereum/
│   │   ├── xpContract.js     # Web3 integration layer
│   │   └── XPSystem.json     # Contract ABI
│   ├── components/
│   │   ├── Profile.jsx       # Updated with Ethereum integration
│   │   └── ...               # Other components
│   └── ...
├── hardhat.config.cjs        # Hardhat configuration
└── package.json
```

## 🔧 Development Commands

```bash
# Compile smart contracts
npx hardhat compile

# Run local Ethereum node
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Run tests (if any)
npx hardhat test

# Start React dev server
npm run dev

# Build for production
npm run build
```

## 🧪 Testing the Integration

### 1. Basic Functionality

- Connect MetaMask wallet
- Set/update username
- Add XP using test buttons
- Verify data persistence across page refreshes

### 2. Advanced Testing

- Switch MetaMask accounts to test different users
- Disconnect/reconnect wallet
- Test error handling (wrong network, insufficient gas, etc.)

### 3. Contract Verification

Check that the contract is working correctly:

```javascript
// In browser console
import { getMyUser, isUserRegistered } from './src/ethereum/xpContract.js'

// Check if current user is registered
await isUserRegistered('YOUR_ADDRESS')

// Get user data
await getMyUser()
```

## 🚨 Troubleshooting

### Common Issues

1. **"No Ethereum provider found"**
   - Ensure MetaMask is installed and unlocked
   - Check that you're on the correct network (Hardhat Local)

2. **"Failed to connect wallet"**
   - Make sure Hardhat node is running
   - Verify MetaMask is connected to localhost:8545

3. **"Contract not found"**
   - Verify contract address in `xpContract.js`
   - Ensure contract was deployed successfully
   - Check that ABI file exists

4. **"Transaction failed"**
   - Ensure account has sufficient ETH for gas
   - Check Hardhat node is running
   - Verify network configuration

### Debug Commands

```bash
# Check if Hardhat node is running
curl http://127.0.0.1:8545

# View contract deployment logs
npx hardhat run scripts/deploy.js --network localhost --verbose

# Check contract bytecode
npx hardhat verify --network localhost CONTRACT_ADDRESS
```

## 🔒 Security Notes

- This is a development/hackathon setup
- Private keys are exposed in Hardhat node output
- Never use real ETH on local networks
- For production, use proper key management and mainnet/testnet

## 🚀 Next Steps

- Add more complex smart contract features
- Implement token-based rewards
- Add social features (following, achievements)
- Deploy to testnet/mainnet
- Add contract verification
- Implement proper error handling and loading states

## 📄 License

MIT License - feel free to use this for your hackathon projects!

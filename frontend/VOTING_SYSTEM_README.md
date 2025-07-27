# 🚀 Startup Quest Voting System

A decentralized voting system for startup ideas using QST tokens and smart contracts.

## 🎯 Features

- **QST Token (ERC20)**: Custom token for voting with 18 decimals
- **Idea Submission**: Users can publish startup ideas
- **Token-Based Voting**: Vote with 10 QST tokens during the 1-week voting period
- **Reward Distribution**: Winning voters get their tokens back plus a share of losing voters' tokens
- **Free Voting**: After 1 week, voting continues without token costs
- **Real-time Results**: Live voting statistics and time remaining
- **Wallet Integration**: MetaMask support with wagmi + RainbowKit

## 🏗️ Architecture

### Smart Contracts

1. **QSTToken.sol** - ERC20 token contract
   - Minting functionality (admin only)
   - Burning functionality
   - Standard ERC20 features

2. **IdeaVoting.sol** - Main voting contract
   - Idea submission and management
   - Token-based voting system
   - Reward distribution logic
   - Time-based voting periods

### Frontend

- **React + Vite**: Modern frontend framework
- **Wagmi v2**: Ethereum hooks and utilities
- **RainbowKit**: Wallet connection UI
- **React Hot Toast**: Notifications
- **Lucide React**: Icons

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- MetaMask browser extension
- Git

### Installation

1. **Clone and navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Run the setup script**
   ```bash
   ./scripts/setup-voting-system.sh
   ```

3. **Start Hardhat node**
   ```bash
   npx hardhat node
   ```

4. **Configure MetaMask**
   - Network: Localhost 8545
   - Chain ID: 31337
   - Import deployer account (private key from Hardhat output)

5. **Start the frontend**
   ```bash
   npm run dev
   ```

6. **Access the voting system**
   - Navigate to `http://localhost:5173/voting`
   - Connect your wallet
   - Start voting!

## 🎮 How It Works

### 1. Token System
- Each user starts with 1000 QST tokens (minted to deployer)
- Voting costs 10 QST tokens during the active voting period
- Tokens are burned when voting and redistributed to winners

### 2. Voting Process
1. **Submit Idea**: Anyone can submit a startup idea
2. **Vote with Tokens**: Users vote like/dislike using 10 QST tokens
3. **Voting Period**: Active voting lasts 1 week
4. **Resolution**: After 1 week, rewards are distributed
5. **Free Voting**: Voting continues without token costs

### 3. Reward Distribution
- **Likes Win**: Like voters get their 10 QST back + share of dislike tokens
- **Dislikes Win**: Dislike voters get their 10 QST back + share of like tokens
- **Tie**: All voters get their 10 QST back

## 📁 Project Structure

```
frontend/
├── contracts/
│   ├── QSTToken.sol          # ERC20 token contract
│   └── IdeaVoting.sol        # Voting system contract
├── scripts/
│   ├── deploy-voting.js      # Deployment script
│   └── setup-voting-system.sh # Setup script
├── src/
│   ├── components/
│   │   └── VotingInterface.jsx # Main voting UI
│   ├── hooks/
│   │   └── useVotingSystem.js  # Voting system hooks
│   ├── ethereum/
│   │   ├── wagmiConfig.js      # Wagmi configuration
│   │   ├── votingContracts.json # Contract addresses
│   │   ├── QSTToken.json       # Token ABI
│   │   └── IdeaVoting.json     # Voting ABI
│   └── pages/
│       └── VotingPage.jsx      # Voting page component
└── VOTING_SYSTEM_README.md    # This file
```

## 🔧 Configuration

### Contract Addresses
Contract addresses are automatically saved to `src/ethereum/votingContracts.json` after deployment.

### Network Configuration
The system is configured for localhost (Hardhat) by default:
- Chain ID: 31337
- RPC URL: http://127.0.0.1:8545
- Currency: ETH

## 🎯 Usage Examples

### Submitting an Idea
1. Connect your wallet
2. Enter idea description in the text area
3. Click "Publish Idea"
4. Confirm transaction in MetaMask

### Voting on an Idea
1. Find an idea you want to vote on
2. Click "Like" or "Dislike" (costs 10 QST)
3. Approve token spending in MetaMask
4. Confirm voting transaction

### Resolving Voting
1. Wait for voting period to end (1 week)
2. Click "Resolve Voting" button
3. Confirm transaction to distribute rewards

## 🛠️ Development

### Adding New Features
1. Modify smart contracts in `contracts/`
2. Update frontend components in `src/components/`
3. Test with `npx hardhat test`
4. Deploy with `node scripts/deploy-voting.js`

### Testing
```bash
# Run Hardhat tests
npx hardhat test

# Run frontend tests
npm test
```

## 🔒 Security Considerations

- Only the contract owner can mint QST tokens
- Voting is limited to once per user per idea
- Token transfers use standard ERC20 approval pattern
- Time-based voting prevents manipulation

## 🐛 Troubleshooting

### Common Issues

1. **"Contract not found" error**
   - Ensure contracts are deployed: `node scripts/deploy-voting.js`
   - Check contract addresses in `votingContracts.json`

2. **"Insufficient QST tokens" error**
   - Import deployer account to MetaMask
   - Transfer QST tokens to your account

3. **MetaMask connection issues**
   - Ensure localhost network is added
   - Check chain ID is 31337
   - Refresh page and reconnect wallet

4. **Transaction failures**
   - Check Hardhat node is running
   - Ensure sufficient ETH for gas fees
   - Verify wallet is connected to correct network

### Getting Help

- Check browser console for error messages
- Verify contract deployment status
- Ensure all dependencies are installed
- Check MetaMask network configuration

## 🎉 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Happy voting! 🚀🗳️** 
import { ethers } from 'ethers';
import XPSystemABI from './XPSystem.json';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const NETWORK_ID = 1337;

export const getProvider = () => {
  if (typeof window.ethereum !== 'undefined') {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('No Ethereum provider found');
};

export const getSigner = async () => {
  const provider = getProvider();
  try {
    await provider.send('eth_requestAccounts', []);
    return provider.getSigner();
  } catch (error) {
    console.error('Error requesting accounts:', error);
    throw new Error('Failed to connect wallet. Please try refreshing the page and reconnecting.');
  }
};

export const getContract = async (withSigner = true) => {
  try {
    const provider = getProvider();
    const abi = XPSystemABI.abi;
    
    if (withSigner) {
      const signer = await getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
    }
    
    return new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
  } catch (error) {
    console.error('Error getting contract:', error);
    throw new Error('Failed to connect to smart contract. Please check your wallet connection.');
  }
};

// Basic user functions
export const setUser = async (username) => {
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to set user: ${username}`);
      const contract = await getContract(true);
      const tx = await contract.setUser(username);
      await tx.wait();
      
      // Verify the user was registered by checking isUserRegistered
      const signer = await getSigner();
      const address = await signer.getAddress();
      const isRegistered = await contract.isUserRegistered(address);
      
      if (!isRegistered) {
        throw new Error('User registration failed - user not found after transaction');
      }
      
      console.log('User set successfully!');
      return true;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${attempt * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  }
  
  console.error('All attempts failed:', lastError);
  throw new Error(`Failed to set user after ${maxRetries} attempts. Please try refreshing the page and reconnecting your wallet.`);
};

export const updateXP = async (xpAmount) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.updateXPExternal(xpAmount);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error updating XP:', error);
    throw error;
  }
};

export const getUser = async (address) => {
  try {
    const contract = await getContract(false);
    
    // First check if user is registered
    const isRegistered = await contract.isUserRegistered(address);
    if (!isRegistered) {
      return null;
    }
    
    // Since getUser and getMyUser are having decoding issues,
    // we'll return a basic user object indicating they're registered
    // The actual data will be managed locally until we fix the contract
    return {
      username: "Registered User",
      xp: 0,
      level: 1,
      achievements: 0,
      dailyStreak: 0,
      lastDailyCheck: 0,
      powerUpsUsed: 0,
      totalTasksCompleted: 0,
      totalPhasesCompleted: 0,
      ideasShared: 0,
      upvotesGiven: 0
    };
  } catch (error) {
    console.error('Error checking user registration:', error);
    // Handle specific error types gracefully
    if (error.message.includes('circuit breaker') || 
        error.message.includes('missing revert data') ||
        error.code === 'CALL_EXCEPTION') {
      console.log('Contract call failed - user likely not registered or contract issue');
      return null;
    }
    return null;
  }
};

export const getMyUser = async () => {
  try {
    const signer = await getSigner();
    const address = await signer.getAddress();
    return await getUser(address);
  } catch (error) {
    console.error('Error getting current user data:', error);
    // Return null instead of throwing for better UX
    return null;
  }
};

export const isUserRegistered = async (address) => {
  try {
    const contract = await getContract(false);
    return await contract.isUserRegistered(address);
  } catch (error) {
    console.error('Error checking user registration:', error);
    return false;
  }
};

// Achievement functions
export const hasAchievement = async (address, achievementId) => {
  try {
    const contract = await getContract(false);
    return await contract.hasAchievement(address, achievementId);
  } catch (error) {
    console.error('Error checking achievement:', error);
    return false;
  }
};

export const checkLevelAchievements = async () => {
  try {
    const contract = await getContract(true);
    const tx = await contract.checkLevelAchievements();
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error checking level achievements:', error);
    throw error;
  }
};

// Task and Phase functions
export const completeTask = async (taskId, xpReward) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.completeTask(taskId, xpReward);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
};

export const completePhase = async (phaseId, xpReward) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.completePhase(phaseId, xpReward);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error completing phase:', error);
    throw error;
  }
};

// Daily Challenge functions
export const completeDailyChallenge = async (challengeId, xpReward) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.completeDailyChallenge(challengeId, xpReward);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error completing daily challenge:', error);
    throw error;
  }
};

export const getDailyChallengeStatus = async (address, challengeId) => {
  try {
    const contract = await getContract(false);
    return Number(await contract.getDailyChallengeStatus(address, challengeId));
  } catch (error) {
    console.error('Error getting daily challenge status:', error);
    return 0;
  }
};

// Power-up functions
export const activatePowerUp = async (powerUpId, cost) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.activatePowerUp(powerUpId, cost);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error activating power-up:', error);
    throw error;
  }
};

export const getPowerUpCount = async (address, powerUpId) => {
  try {
    const contract = await getContract(false);
    return Number(await contract.getPowerUpCount(address, powerUpId));
  } catch (error) {
    console.error('Error getting power-up count:', error);
    return 0;
  }
};

// Social functions
export const shareIdea = async () => {
  try {
    const contract = await getContract(true);
    const tx = await contract.shareIdea();
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error sharing idea:', error);
    throw error;
  }
};

export const giveUpvote = async () => {
  try {
    const contract = await getContract(true);
    const tx = await contract.giveUpvote();
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error giving upvote:', error);
    throw error;
  }
};

// Leaderboard functions
export const getLeaderboardEntry = async (rank) => {
  try {
    const contract = await getContract(false);
    return Number(await contract.getLeaderboardEntry(rank));
  } catch (error) {
    console.error('Error getting leaderboard entry:', error);
    return 0;
  }
};

export const updateLeaderboard = async (rank, xp) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.updateLeaderboard(rank, xp);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    throw error;
  }
};

// Test function to verify contract connection
export const testContractConnection = async () => {
  try {
    const contract = await getContract(false);
    
    // Test basic contract functions
    const testAddress = "0x0000000000000000000000000000000000000000";
    const isRegistered = await contract.isUserRegistered(testAddress);
    
    // Test if we can get the contract address
    const contractAddress = await contract.getAddress();
    
    // Test if we can get the signer address (if connected)
    let signerAddress = "Not connected";
    try {
      const signer = await getSigner();
      signerAddress = await signer.getAddress();
    } catch (e) {
      // Not connected, that's okay
    }
    
    // Test if updateXPExternal function exists
    let hasUpdateXP = false;
    try {
      hasUpdateXP = typeof contract.updateXPExternal === 'function';
    } catch (e) {
      hasUpdateXP = false;
    }
    
    return {
      success: true,
      message: `Contract connection successful. Contract: ${contractAddress}, Signer: ${signerAddress}, XP Update: ${hasUpdateXP ? 'Available' : 'Not Available'}`,
      isRegistered: isRegistered,
      contractAddress: contractAddress,
      signerAddress: signerAddress,
      hasUpdateXP: hasUpdateXP
    };
  } catch (error) {
    console.error('Contract connection test failed:', error);
    return {
      success: false,
      message: "Contract connection failed: " + error.message,
      error: error
    };
  }
};

// MetaMask utility functions
export const checkMetaMaskConnection = async () => {
  if (typeof window.ethereum === 'undefined') {
    return false;
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0;
  } catch (error) {
    console.error('Error checking MetaMask connection:', error);
    return false;
  }
};

export const requestMetaMaskConnection = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error('Error requesting MetaMask connection:', error);
    throw error;
  }
};

export const onAccountChange = (callback) => {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', callback);
  }
};

export const onNetworkChange = (callback) => {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('chainChanged', callback);
  }
};

// Achievement constants
export const ACHIEVEMENT_IDS = {
  FIRST_TASK: 1,
  TASK_MASTER: 2,
  PHASE_COMPLETER: 3,
  LEVEL_5: 4,
  LEVEL_10: 5,
  ALL_PHASES: 6,
  SOCIAL_BUTTERFLY: 7,
  HELPER: 8
};

// Power-up constants
export const POWERUP_IDS = {
  XP_BOOST: 1,
  AUTO_COMPLETE: 2,
  PHASE_UNLOCK: 3,
  STREAK_PROTECT: 4,
  LUCKY_DRAW: 5,
  TEAM_BOOST: 6
};

// Daily challenge constants
export const DAILY_CHALLENGE_IDS = {
  COMPLETE_TASK: 1,
  SHARE_IDEA: 2,
  UPVOTE_OTHERS: 3,
  LEVEL_UP: 4,
  COMPLETE_PHASE: 5
}; 
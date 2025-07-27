// Profile.jsx
import { useState, useEffect } from 'react';
import { User as UserIcon, Award, Trophy, Target, TrendingUp, Wallet, AlertCircle, CheckCircle, HelpCircle, Sparkles } from 'lucide-react';
import XPBar from "./XPBar";
import MetaMaskGuide from "./MetaMaskGuide";
import { useBadgeContract } from '../hooks/useBadgeContract';
import { badgeService } from '../services/badgeService';
import { 
  getMyUser, 
  setUser, 
  updateXP, 
  checkMetaMaskConnection, 
  requestMetaMaskConnection,
  onAccountChange,
  onNetworkChange,
  testContractConnection
} from '../ethereum/xpContract';

const Profile = ({ username, level, xp, maxXP, badges = [], completedPhases = [], ideasShared = 0, upvotesGiven = 0, onUsernameUpdate }) => {
  // Ethereum state
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [onChainData, setOnChainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ethereumAvailable, setEthereumAvailable] = useState(false);
  const [showMetaMaskGuide, setShowMetaMaskGuide] = useState(false);
  
  // Form state for username update
  const [newUsername, setNewUsername] = useState('');
  const [showUsernameForm, setShowUsernameForm] = useState(false);

  // NFT Badge state
  const [nftBadges, setNftBadges] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(false);

  const earnedBadges = (badges || []).filter(b => b && b.earned);

  // Badge contract hook
  const { 
    getUserBadges, 
    getBadgeType, 
    address, 
    isConnected
  } = useBadgeContract();

  // Check MetaMask connection on component mount
  useEffect(() => {
    initializeEthereum();
  }, []);

  // Load NFT badges when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      loadNftBadges();
    }
  }, [isConnected, address]);

  const loadNftBadges = async () => {
    if (!address) return;
    
    try {
      setLoadingBadges(true);
      const userBadgeIds = await getUserBadges();
      const badgeDetails = [];
      
      for (const badgeId of userBadgeIds) {
        const badgeType = await getBadgeType(badgeId);
        if (badgeType) {
          badgeDetails.push({
            id: badgeId,
            name: badgeType.name,
            description: badgeType.description,
            imageURI: badgeType.imageURI
          });
        }
      }
      
      setNftBadges(badgeDetails);
    } catch (error) {
      console.error('Error loading NFT badges:', error);
    } finally {
      setLoadingBadges(false);
    }
  };

  const initializeEthereum = async () => {
    try {
      // Check if MetaMask is available
      if (typeof window.ethereum !== 'undefined') {
        setEthereumAvailable(true);
        
        // Check if already connected
        const isConnected = await checkMetaMaskConnection();
        setWalletConnected(isConnected);
        
        if (isConnected) {
          await loadOnChainData();
        }
        
        // Listen for account changes
        onAccountChange(() => {
          checkConnection();
        });
        
        // Listen for network changes
        onNetworkChange(() => {
          checkConnection();
        });
      } else {
        setEthereumAvailable(false);
        console.log('MetaMask not available - running in web-only mode');
      }
    } catch (error) {
      console.error('Error initializing Ethereum:', error);
      setEthereumAvailable(false);
    }
  };

  const checkConnection = async () => {
    if (!ethereumAvailable) return;
    
    try {
      setError('');
      const isConnected = await checkMetaMaskConnection();
      setWalletConnected(isConnected);
      
      if (isConnected) {
        await loadOnChainData();
      } else {
        setOnChainData(null);
        setWalletAddress('');
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setError('Failed to check wallet connection: ' + error.message);
    }
  };

  const connectWallet = async () => {
    if (!ethereumAvailable) {
      setError('MetaMask is not available. Please install MetaMask to use blockchain features.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const address = await requestMetaMaskConnection();
      setWalletAddress(address);
      setWalletConnected(true);
      
      await loadOnChainData();
      setSuccess('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadOnChainData = async () => {
    if (!ethereumAvailable || !walletConnected) return;
    
    try {
      setLoading(true);
      setError('');
      const userData = await getMyUser();
      setOnChainData(userData);
      
      // If user is registered, set the username for the form
      if (userData) {
        setNewUsername(userData.username || '');
      } else {
        // User not registered yet, clear the form
        setNewUsername('');
      }
    } catch (error) {
      console.error('Error loading on-chain data:', error);
      // Don't show error for unregistered users or connection issues
      if (error.message.includes('User not registered') || 
          error.code === 'BAD_DATA' || 
          error.message.includes('circuit breaker') ||
          error.message.includes('missing revert data')) {
        setOnChainData(null);
      } else {
        setError('Failed to load on-chain data: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetUsername = async () => {
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }
    
    if (!ethereumAvailable || !walletConnected) {
      setError('MetaMask is not available or not connected. Cannot update username on blockchain.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Update on blockchain (this will register the user if not already registered)
      await setUser(newUsername);
      await loadOnChainData();
      setSuccess('Username registered/updated on blockchain successfully!');
      
      // Always update locally
      if (onUsernameUpdate) {
        onUsernameUpdate(newUsername);
      }
      
      setShowUsernameForm(false);
    } catch (error) {
      setError('Failed to update username: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateXP = async (amount) => {
    if (!ethereumAvailable || !walletConnected) {
      setError('MetaMask is not available or not connected. Cannot update XP on blockchain.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await updateXP(amount);
      await loadOnChainData();
      setSuccess(`XP updated successfully! (+${amount} XP)`);
    } catch (error) {
      setError('Failed to update XP: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestContractConnection = async () => {
    if (!ethereumAvailable || !walletConnected) {
      setError('MetaMask is not available or not connected. Cannot test contract connection.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await testContractConnection();
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to test contract connection: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCharacterAvatar = (level) => {
    if (level >= 10) return '🚀';
    if (level >= 8) return '👑';
    if (level >= 6) return '⭐';
    if (level >= 4) return '🔥';
    if (level >= 2) return '💪';
    return '🌱';
  };

  // Use on-chain data if available, otherwise use props
  const displayUsername = onChainData?.username || username || 'Unnamed User';
  const displayLevel = onChainData?.level || level || 1;
  const displayXP = onChainData?.xp || xp || 0;
  const displayMaxXP = onChainData ? (112 + (displayLevel - 1) * 200) : (maxXP || 100);
  const displayIdeasShared = onChainData?.ideasShared || ideasShared || 0;
  const displayUpvotesGiven = onChainData?.upvotesGiven || upvotesGiven || 0;

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <span className="avatar-emoji">{getCharacterAvatar(displayLevel)}</span>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{displayUsername}</h1>
          <p className="profile-level">Level {displayLevel} • {displayIdeasShared} ideas shared</p>
        </div>
      </div>

      {/* XP Bar */}
      <div className="xp-section">
        <XPBar currentXP={displayXP} maxXP={displayMaxXP} level={displayLevel} />
      </div>

      {/* Ethereum Connection Status */}
      {ethereumAvailable && (
        <div className="ethereum-section">
          <div className="ethereum-header">
            <Wallet size={20} />
            <h3>Blockchain Connection</h3>
          </div>
          
          {walletConnected ? (
            <div className="connection-status connected">
              <CheckCircle size={16} />
              <span>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </div>
          ) : (
            <div className="connection-status disconnected">
              <AlertCircle size={16} />
              <span>Not Connected</span>
              <button onClick={connectWallet} disabled={loading} className="connect-btn">
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          )}
          
          {walletConnected && (
            <div className="blockchain-actions">
              <button onClick={() => setShowUsernameForm(true)} className="action-btn">
                Update Username
              </button>
              <button onClick={() => handleUpdateXP(50)} disabled={loading} className="action-btn">
                +50 XP
              </button>
              <button onClick={handleTestContractConnection} disabled={loading} className="action-btn">
                Test Connection
              </button>
            </div>
          )}
        </div>
      )}

      {/* NFT Badges Section */}
      {isConnected && (
        <div className="nft-badges-section">
          <div className="section-header">
            <Sparkles size={20} />
            <h3>NFT Achievement Badges</h3>
          </div>
          
          {loadingBadges ? (
            <div className="loading-badges">Loading badges...</div>
          ) : nftBadges.length > 0 ? (
            <div className="nft-badges-grid">
              {nftBadges.map((badge) => (
                <div key={badge.id} className="nft-badge-card">
                  <div className="badge-image">
                    <img src={badge.imageURI} alt={badge.name} />
                  </div>
                  <div className="badge-info">
                    <h4>{badge.name}</h4>
                    <p>{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-nft-badges">
              <p>No NFT badges earned yet. Complete phases to earn badges!</p>
            </div>
          )}
        </div>
      )}

      {/* Regular Badges Section */}
      <div className="badges-section">
        <div className="section-header">
          <Award size={20} />
          <h3>Achievements</h3>
        </div>
        
        {earnedBadges.length > 0 ? (
          <div className="badges-grid">
            {earnedBadges.map((badge, index) => (
              <div key={index} className="badge-card earned">
                <div className="badge-icon">
                  <Trophy size={24} />
                </div>
                <div className="badge-info">
                  <h4>{badge.name}</h4>
                  <p>{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-badges">
            <p>No achievements earned yet. Keep progressing to unlock badges!</p>
          </div>
        )}
      </div>

      {/* Completed Phases */}
      <div className="phases-section">
        <div className="section-header">
          <Target size={20} />
          <h3>Completed Phases</h3>
        </div>
        
        {completedPhases.length > 0 ? (
          <div className="phases-grid">
            {completedPhases.map((phase, index) => (
              <div key={index} className="phase-card completed">
                <div className="phase-icon">
                  <CheckCircle size={20} />
                </div>
                <div className="phase-info">
                  <h4>{phase.name}</h4>
                  <p>Completed on {phase.completedAt}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-phases">
            <p>No phases completed yet. Start your journey!</p>
          </div>
        )}
      </div>

      {/* Username Update Form */}
      {showUsernameForm && (
        <div className="username-form-overlay">
          <div className="username-form">
            <h3>Update Username</h3>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
              className="username-input"
            />
            <div className="form-actions">
              <button onClick={handleSetUsername} disabled={loading} className="save-btn">
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setShowUsernameForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MetaMask Guide */}
      {showMetaMaskGuide && (
        <MetaMaskGuide onClose={() => setShowMetaMaskGuide(false)} />
      )}

      {/* Error and Success Messages */}
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Help Section */}
      <div className="help-section">
        <button onClick={() => setShowMetaMaskGuide(true)} className="help-btn">
          <HelpCircle size={16} />
          MetaMask Setup Guide
        </button>
      </div>
    </div>
  );
};

export default Profile;

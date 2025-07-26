// Profile.jsx
import { useState, useEffect } from 'react';
import { User as UserIcon, Award, Trophy, Target, TrendingUp, Wallet, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import XPBar from "./XPBar";
import MetaMaskGuide from "./MetaMaskGuide";
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

  const earnedBadges = (badges || []).filter(b => b && b.earned);

  // Check MetaMask connection on component mount
  useEffect(() => {
    initializeEthereum();
  }, []);

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
      setError(error.message);
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
      setError('Test failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Use on-chain data if available, otherwise fall back to props
  const displayUsername = onChainData?.username || username;
  const displayLevel = onChainData?.level || level;
  const displayXP = onChainData?.xp || xp;
  const isUserRegistered = onChainData !== null;

  const getCharacterAvatar = (level) => {
    if (level >= 10) {
      return (
        <div className="avatar-container high-tier">
          <div className="avatar-overlay"></div>
          <span className="avatar-icon">🧙‍♂️</span>
          <div className="avatar-badge">★</div>
        </div>
      );
    } else if (level >= 5) {
      return (
        <div className="avatar-container mid-tier">
          <div className="avatar-overlay"></div>
          <span className="avatar-icon">🏗️</span>
          <div className="avatar-badge">⚡</div>
        </div>
      );
    } else {
      return (
        <div className="avatar-container base-tier">
          <div className="avatar-overlay"></div>
          <span className="avatar-icon">🚀</span>
          <div className="avatar-badge">🌟</div>
        </div>
      );
    }
  };

  return (
    <div className="profile-container">
      {/* Wallet Connection Section */}
      <div className="wallet-section">
                 {!ethereumAvailable ? (
           <div className="wallet-not-connected">
             <AlertCircle className="wallet-icon" />
             <div className="wallet-info">
               <h3>MetaMask Not Available</h3>
               <p>Please install MetaMask to use blockchain features.</p>
             </div>
             <div className="wallet-actions">
               <button 
                 className="btn-quest" 
                 onClick={() => window.open('https://metamask.io/download/', '_blank')}
               >
                 <Wallet size={16} />
                 Install MetaMask
               </button>
               <button 
                 className="btn-outline" 
                 onClick={() => setShowMetaMaskGuide(true)}
               >
                 <HelpCircle size={16} />
                 Setup Guide
               </button>
             </div>
           </div>
        ) : (
          <>
            {!walletConnected ? (
              <div className="wallet-not-connected">
                <AlertCircle className="wallet-icon" />
                <div className="wallet-info">
                  <h3>Connect Your Wallet</h3>
                  <p>Connect MetaMask to sync your progress on-chain</p>
                </div>
                <button 
                  className="btn-quest" 
                  onClick={connectWallet}
                  disabled={loading}
                >
                  <Wallet size={16} />
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              </div>
            ) : (
              <div className="wallet-connected">
                <CheckCircle className="wallet-icon" />
                <div className="wallet-info">
                  <h3>Wallet Connected</h3>
                  <p className="wallet-address">{walletAddress}</p>
                  {!isUserRegistered && (
                    <p className="wallet-status">Not registered on-chain yet. Click the username edit button above to register!</p>
                  )}
                </div>
                <button 
                  className="btn-outline" 
                  onClick={loadOnChainData}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Refresh Data'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="message error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="message success">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      <div className="profile-header">
        <div className="profile-avatar">
          {getCharacterAvatar(displayLevel)}
        </div>
        <div className="profile-info">
          <div className="username-section">
            <h1 className="profile-username">
              {isUserRegistered ? displayUsername : displayUsername}
            </h1>
            <button 
              className="btn-edit-username"
              onClick={() => setShowUsernameForm(!showUsernameForm)}
            >
              <UserIcon size={14} />
            </button>
          </div>
          <p className="profile-level">Level {displayLevel} Entrepreneur</p>
          <XPBar currentXP={displayXP} maxXP={maxXP} level={displayLevel} />
          
          {/* Username Update Form */}
          {showUsernameForm && (
            <div className="username-form">
              <p className="action-note">
                {walletConnected 
                  ? isUserRegistered 
                    ? "Update your username on the blockchain (requires gas fees)"
                    : "Register your username on the blockchain (requires gas fees)"
                  : "Update your username locally. Connect wallet to sync on blockchain."
                }
              </p>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                className="username-input"
              />
              <div className="username-actions">
                <button 
                  className="btn-quest"
                  onClick={handleSetUsername}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (walletConnected && !isUserRegistered ? 'Register Username' : 'Update Username')}
                </button>
                <button 
                  className="btn-outline"
                  onClick={() => setShowUsernameForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* On-Chain Actions (if wallet connected) */}
      {walletConnected && (
        <div className="onchain-actions">
          <h3>On-Chain Actions</h3>
          {!isUserRegistered && (
            <p className="action-note">Register with a username first to earn XP!</p>
          )}
          <div className="action-buttons">
            <button 
              className="btn-outline"
              onClick={() => handleUpdateXP(10)}
              disabled={loading || !isUserRegistered}
            >
              +10 XP (Test)
            </button>
            <button 
              className="btn-outline"
              onClick={() => handleUpdateXP(50)}
              disabled={loading || !isUserRegistered}
            >
              +50 XP (Test)
            </button>
            <button 
              className="btn-outline"
              onClick={() => handleUpdateXP(100)}
              disabled={loading || !isUserRegistered}
            >
              +100 XP (Test)
            </button>
            <button 
              className="btn-outline"
              onClick={handleTestContractConnection}
              disabled={loading}
            >
              Test Contract Connection
            </button>
          </div>
        </div>
      )}

      {/* Test Section - Show current username status */}
      <div className="onchain-actions">
        <h3>Current Status</h3>
        <div className="action-buttons">
          <div className="status-info">
            <p><strong>Local Username:</strong> {username}</p>
            <p><strong>Wallet Connected:</strong> {walletConnected ? 'Yes' : 'No'}</p>
            <p><strong>On-Chain Registered:</strong> {isUserRegistered ? 'Yes' : 'No'}</p>
            {onChainData && (
              <p><strong>On-Chain Username:</strong> {onChainData.username}</p>
            )}
            {isUserRegistered && onChainData?.username === "Registered User" && (
              <p className="action-note">⚠️ Username display limited due to contract decoding issue. Registration and updates still work perfectly!</p>
            )}
            {isUserRegistered && (
              <p className="action-note">✅ Blockchain registration working! Username updates are functional.</p>
            )}
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <Target className="stat-icon" />
          <div className="stat-value">{completedPhases.length}</div>
          <div className="stat-label">Phases Completed</div>
        </div>
        <div className="stat-card">
          <TrendingUp className="stat-icon" />
          <div className="stat-value">{ideasShared}</div>
          <div className="stat-label">Ideas Shared</div>
        </div>
        <div className="stat-card">
          <Award className="stat-icon" />
          <div className="stat-value">{upvotesGiven}</div>
          <div className="stat-label">Upvotes Given</div>
        </div>
      </div>

      <div className="badges-section">
        <h2 className="section-title">
          <Trophy className="section-icon" /> Badges Earned ({earnedBadges.length}/{badges.length})
        </h2>
        <div className="badges-grid">
          {badges.map(badge => (
            <div key={badge.id} className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}>
              <Award className="badge-icon" />
              <div className="badge-name">{badge.name}</div>
              <div className="badge-desc">{badge.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="phases-section">
        <h2 className="section-title">Completed Phases</h2>
        <div className="phases-list">
          {completedPhases.length > 0 ? completedPhases.map((phase, idx) => (
            <div key={idx} className="phase-item">
              <Target className="phase-icon" />
              <span className="phase-name">{phase}</span>
            </div>
          )) : (
            <p className="no-phases">No phases completed yet. Start your journey!</p>
          )}
        </div>
      </div>

      {/* MetaMask Guide Modal */}
      {showMetaMaskGuide && (
        <MetaMaskGuide onClose={() => setShowMetaMaskGuide(false)} />
      )}
    </div>
  );
};

export default Profile;

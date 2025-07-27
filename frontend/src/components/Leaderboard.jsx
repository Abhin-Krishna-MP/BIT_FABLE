import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, TrendingUp, Users, Crown, Wallet, RefreshCw } from 'lucide-react';
import { 
  getMyUser, 
  updateLeaderboard,
  getLeaderboardEntry,
  checkMetaMaskConnection,
  requestMetaMaskConnection,
  onAccountChange,
  onNetworkChange
} from '../ethereum/xpContract';

const Leaderboard = ({ userProgress, userStats, phases }) => {
  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem("startupQuestLeaderboard");
    return saved ? JSON.parse(saved) : generateMockLeaderboard();
  });

  const [userRank, setUserRank] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [onChainData, setOnChainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [syncing, setSyncing] = useState(false);

  function generateMockLeaderboard() {
    const mockUsers = [
      { id: 'user-1', username: 'Sarah Chen', level: 8, xp: 2450, completedPhases: 5, streak: 12, avatar: '👩‍💼' },
      { id: 'user-2', username: 'Alex Rodriguez', level: 7, xp: 2100, completedPhases: 4, streak: 8, avatar: '👨‍💻' },
      { id: 'user-3', username: 'Emma Wilson', level: 6, xp: 1800, completedPhases: 4, streak: 15, avatar: '👩‍🎨' },
      { id: 'user-4', username: 'David Kim', level: 6, xp: 1750, completedPhases: 3, streak: 6, avatar: '👨‍🔬' },
      { id: 'user-5', username: 'Lisa Thompson', level: 5, xp: 1400, completedPhases: 3, streak: 9, avatar: '👩‍🏫' },
      { id: 'user-6', username: 'Mike Johnson', level: 5, xp: 1350, completedPhases: 2, streak: 4, avatar: '👨‍💼' },
      { id: 'user-7', username: 'Anna Davis', level: 4, xp: 1100, completedPhases: 2, streak: 7, avatar: '👩‍⚕️' },
      { id: 'user-8', username: 'Tom Brown', level: 4, xp: 1050, completedPhases: 2, streak: 3, avatar: '👨‍🎓' },
      { id: 'user-9', username: 'Rachel Green', level: 3, xp: 800, completedPhases: 1, streak: 5, avatar: '👩‍🌾' },
      { id: 'user-10', username: 'Chris Lee', level: 3, xp: 750, completedPhases: 1, streak: 2, avatar: '👨‍🎤' }
    ];

    // Add current user to leaderboard
    const currentUser = {
      id: 'current-user',
      username: userStats?.username || 'You',
      level: userProgress?.userLevel || 1,
      xp: userProgress?.userXP || 0,
      completedPhases: phases?.filter(p => p.status === 'completed').length || 0,
      streak: 0, // Will be updated from localStorage
      avatar: '🚀',
      isCurrentUser: true
    };

    return [...mockUsers, currentUser].sort((a, b) => b.xp - a.xp);
  }

  // Check wallet connection on mount
  useEffect(() => {
    checkConnection();
    onAccountChange(checkConnection);
    onNetworkChange(checkConnection);
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await checkMetaMaskConnection();
      setWalletConnected(connected);
      if (connected) {
        await loadOnChainData();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setWalletConnected(false);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');
      await requestMetaMaskConnection();
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
    try {
      const userData = await getMyUser();
      setOnChainData(userData);
    } catch (error) {
      console.error('Error loading on-chain data:', error);
      setOnChainData(null);
    }
  };

  const syncLeaderboardWithBlockchain = async () => {
    if (!walletConnected || !onChainData) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setSyncing(true);
      setError('');
      
      // Update current user's rank on blockchain
      const currentRank = leaderboard.findIndex(user => user.isCurrentUser) + 1;
      await updateLeaderboard(currentRank, userProgress.userXP);
      
      // Refresh leaderboard data
      await loadOnChainData();
      setSuccess('Leaderboard synced with blockchain!');
    } catch (error) {
      console.error('Error syncing leaderboard with blockchain:', error);
      setError('Failed to sync leaderboard: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  // Update leaderboard with current user data
  useEffect(() => {
    const updatedLeaderboard = leaderboard.map(user => {
      if (user.isCurrentUser) {
        return {
          ...user,
          username: userStats.username || 'You',
          level: userProgress.userLevel,
          xp: userProgress.userXP,
          completedPhases: phases.filter(p => p.status === 'completed').length,
          streak: walletConnected && onChainData ? onChainData.dailyStreak : 0
        };
      }
      return user;
    }).sort((a, b) => b.xp - a.xp);

    setLeaderboard(updatedLeaderboard);
    
    // Find user rank
    const rank = updatedLeaderboard.findIndex(user => user.isCurrentUser) + 1;
    setUserRank(rank);
  }, [userProgress, userStats, phases, walletConnected, onChainData]);

  // Save leaderboard to localStorage
  useEffect(() => {
    localStorage.setItem("startupQuestLeaderboard", JSON.stringify(leaderboard));
  }, [leaderboard]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="rank-icon gold" />;
      case 2: return <Medal className="rank-icon silver" />;
      case 3: return <Medal className="rank-icon bronze" />;
      default: return <span className="rank-number">{rank}</span>;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1: return 'rank-1';
      case 2: return 'rank-2';
      case 3: return 'rank-3';
      default: return '';
    }
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2 className="section-title">
          <Trophy className="section-icon" /> Leaderboard
        </h2>
        <div className="user-rank-info">
          <span className="rank-label">Your Rank:</span>
          <span className="rank-value">#{userRank}</span>
        </div>
      </div>

      {/* Wallet Connection Section */}
      <div className="wallet-section">
        {!walletConnected ? (
          <div className="wallet-not-connected">
            <Wallet className="wallet-icon" />
            <div className="wallet-info">
              <h3>Connect Wallet for Blockchain Leaderboard</h3>
              <p>Connect your wallet to sync your rank with the blockchain and compete globally!</p>
              <button 
                className="btn-primary" 
                onClick={connectWallet}
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        ) : (
          <div className="wallet-connected">
            <Wallet className="wallet-icon" />
            <div className="wallet-info">
              <h3>Wallet Connected</h3>
              <p className="wallet-address">
                {onChainData?.address ? `${onChainData.address.slice(0, 6)}...${onChainData.address.slice(-4)}` : 'Loading...'}
              </p>
              <p>Blockchain leaderboard synced!</p>
              <button 
                className="btn-secondary" 
                onClick={syncLeaderboardWithBlockchain}
                disabled={syncing}
              >
                <RefreshCw size={14} className={syncing ? 'spinning' : ''} />
                {syncing ? 'Syncing...' : 'Sync Rank'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="message error">
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="message success">
          <p>{success}</p>
        </div>
      )}

      <div className="leaderboard-stats">
        <div className="stat-card">
          <Users className="stat-icon" />
          <div className="stat-value">{leaderboard.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <TrendingUp className="stat-icon" />
          <div className="stat-value">{Math.max(...leaderboard.map(u => u.xp || 0))}</div>
          <div className="stat-label">Highest XP</div>
        </div>
        <div className="stat-card">
          <Star className="stat-icon" />
          <div className="stat-value">{Math.max(...leaderboard.map(u => u.level || 0))}</div>
          <div className="stat-label">Highest Level</div>
        </div>
      </div>

      <div className="leaderboard-list">
        {leaderboard.map((user, index) => {
          const rank = index + 1;
          const isCurrentUser = user.isCurrentUser;
          
          return (
            <div key={user.id} className={`leaderboard-item ${getRankClass(rank)} ${isCurrentUser ? 'current-user' : ''}`}>
              <div className="rank-section">
                {getRankIcon(rank)}
              </div>
              
              <div className="user-section">
                <div className="user-avatar">
                  <span className="avatar-emoji">{user.avatar}</span>
                </div>
                <div className="user-info">
                  <div className="user-name">
                    {user.username}
                    {isCurrentUser && <span className="current-user-badge">You</span>}
                  </div>
                  <div className="user-level">Level {user.level}</div>
                </div>
              </div>
              
              <div className="stats-section">
                <div className="stat-item">
                  <span className="stat-label">XP</span>
                  <span className="stat-value">{(user.xp || 0).toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Phases</span>
                  <span className="stat-value">{user.completedPhases}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Streak</span>
                  <span className="stat-value">{user.streak} days</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {userRank > 10 && (
        <div className="user-position">
          <div className="position-card">
            <div className="position-rank">#{userRank}</div>
            <div className="position-info">
              <div className="position-name">{userStats?.username || 'You'}</div>
              <div className="position-stats">
                Level {userProgress?.userLevel || 1} • {userProgress?.userXP || 0} XP • {phases?.filter(p => p.status === 'completed').length || 0} phases
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="leaderboard-info">
        <div className="info-item">
          <Trophy size={14} />
          <span>Leaderboard updates in real-time based on XP earned</span>
        </div>
        <div className="info-item">
          <Star size={14} />
          <span>Top 3 users get special recognition</span>
        </div>
        {walletConnected && (
          <div className="info-item">
            <Wallet size={14} />
            <span>Your rank is synced with the blockchain</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 
import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Target, Users, TrendingUp, Award, Gift, Wallet } from 'lucide-react';
import { 
  getMyUser, 
  hasAchievement, 
  checkLevelAchievements,
  ACHIEVEMENT_IDS,
  checkMetaMaskConnection,
  requestMetaMaskConnection,
  onAccountChange,
  onNetworkChange
} from '../ethereum/xpContract';

const Achievements = ({ userProgress, userStats, phases, badges }) => {
  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem("startupQuestAchievements");
    return saved ? JSON.parse(saved) : [
      {
        id: 'first-task',
        name: 'First Steps',
        description: 'Complete your first task',
        icon: '🎯',
        xpReward: 50,
        earned: false,
        progress: 0,
        maxProgress: 1,
        blockchainId: ACHIEVEMENT_IDS.FIRST_TASK
      },
      {
        id: 'task-master',
        name: 'Task Master',
        description: 'Complete 10 tasks',
        icon: '⚡',
        xpReward: 100,
        earned: false,
        progress: 0,
        maxProgress: 10,
        blockchainId: ACHIEVEMENT_IDS.TASK_MASTER
      },
      {
        id: 'phase-completer',
        name: 'Phase Completer',
        description: 'Complete your first phase',
        icon: '🏆',
        xpReward: 200,
        earned: false,
        progress: 0,
        maxProgress: 1,
        blockchainId: ACHIEVEMENT_IDS.PHASE_COMPLETER
      },
      {
        id: 'speed-runner',
        name: 'Speed Runner',
        description: 'Complete 3 tasks in one day',
        icon: '🚀',
        xpReward: 150,
        earned: false,
        progress: 0,
        maxProgress: 3
      },
      {
        id: 'social-butterfly',
        name: 'Social Butterfly',
        description: 'Share 5 ideas in the community',
        icon: '🦋',
        xpReward: 75,
        earned: false,
        progress: 0,
        maxProgress: 5,
        blockchainId: ACHIEVEMENT_IDS.SOCIAL_BUTTERFLY
      },
      {
        id: 'helper',
        name: 'Community Helper',
        description: 'Give 20 upvotes to others',
        icon: '🤝',
        xpReward: 80,
        earned: false,
        progress: 0,
        maxProgress: 20,
        blockchainId: ACHIEVEMENT_IDS.HELPER
      },
      {
        id: 'level-5',
        name: 'Mid-Level Entrepreneur',
        description: 'Reach level 5',
        icon: '⭐',
        xpReward: 300,
        earned: false,
        progress: 0,
        maxProgress: 5,
        blockchainId: ACHIEVEMENT_IDS.LEVEL_5
      },
      {
        id: 'level-10',
        name: 'Master Entrepreneur',
        description: 'Reach level 10',
        icon: '👑',
        xpReward: 500,
        earned: false,
        progress: 0,
        maxProgress: 10,
        blockchainId: ACHIEVEMENT_IDS.LEVEL_10
      },
      {
        id: 'all-phases',
        name: 'Startup Champion',
        description: 'Complete all phases',
        icon: '🏅',
        xpReward: 1000,
        earned: false,
        progress: 0,
        maxProgress: phases.length,
        blockchainId: ACHIEVEMENT_IDS.ALL_PHASES
      },
      {
        id: 'perfect-day',
        name: 'Perfect Day',
        description: 'Complete all daily challenges',
        icon: '🌟',
        xpReward: 200,
        earned: false,
        progress: 0,
        maxProgress: 1
      }
    ];
  });

  const [walletConnected, setWalletConnected] = useState(false);
  const [onChainData, setOnChainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  // Calculate achievement progress and sync with blockchain
  useEffect(() => {
    const totalTasks = phases.reduce((sum, phase) => sum + phase.completedTasks.length, 0);
    const completedPhases = phases.filter(phase => phase.status === 'completed').length;
    
    setAchievements(prev => prev.map(achievement => {
      let progress = 0;
      
      switch (achievement.id) {
        case 'first-task':
          progress = totalTasks >= 1 ? 1 : 0;
          break;
        case 'task-master':
          progress = Math.min(totalTasks, 10);
          break;
        case 'phase-completer':
          progress = completedPhases >= 1 ? 1 : 0;
          break;
        case 'level-5':
          progress = Math.min(userProgress.userLevel, 5);
          break;
        case 'level-10':
          progress = Math.min(userProgress.userLevel, 10);
          break;
        case 'all-phases':
          progress = completedPhases;
          break;
        case 'social-butterfly':
          progress = Math.min(userStats.ideasShared, 5);
          break;
        case 'helper':
          progress = Math.min(userStats.upvotesGiven, 20);
          break;
        default:
          progress = achievement.progress;
      }
      
      const earned = progress >= achievement.maxProgress;
      return { ...achievement, progress, earned };
    }));
  }, [userProgress, userStats, phases]);

  // Sync achievements with blockchain
  useEffect(() => {
    if (walletConnected && onChainData) {
      syncAchievementsWithBlockchain();
    }
  }, [walletConnected, onChainData, achievements]);

  const syncAchievementsWithBlockchain = async () => {
    try {
      const updatedAchievements = await Promise.all(
        achievements.map(async (achievement) => {
          if (achievement.blockchainId) {
            const onChainEarned = await hasAchievement(onChainData.address, achievement.blockchainId);
            return { ...achievement, onChainEarned };
          }
          return achievement;
        })
      );
      setAchievements(updatedAchievements);
    } catch (error) {
      console.error('Error syncing achievements with blockchain:', error);
    }
  };

  const checkLevelAchievementsOnChain = async () => {
    if (!walletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await checkLevelAchievements();
      await loadOnChainData();
      setSuccess('Level achievements checked on blockchain!');
    } catch (error) {
      console.error('Error checking level achievements:', error);
      setError('Failed to check level achievements: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Save achievements to localStorage
  useEffect(() => {
    localStorage.setItem("startupQuestAchievements", JSON.stringify(achievements));
  }, [achievements]);

  const earnedAchievements = achievements.filter(a => a.earned);
  const totalXP = earnedAchievements.reduce((sum, a) => sum + a.xpReward, 0);

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h2 className="section-title">
          <Trophy className="section-icon" /> Achievements
        </h2>
        <div className="achievements-stats">
          <div className="stat-item">
            <span className="stat-value">{earnedAchievements.length}</span>
            <span className="stat-label">Earned</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{achievements.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">+{totalXP}</span>
            <span className="stat-label">XP Earned</span>
          </div>
        </div>
      </div>

      {/* Wallet Connection Section */}
      <div className="wallet-section">
        {!walletConnected ? (
          <div className="wallet-not-connected">
            <Wallet className="wallet-icon" />
            <div className="wallet-info">
              <h3>Connect Wallet for Blockchain Achievements</h3>
              <p>Connect your wallet to sync achievements with the blockchain and earn on-chain rewards!</p>
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
              <p>Blockchain achievements synced!</p>
              <button 
                className="btn-secondary" 
                onClick={checkLevelAchievementsOnChain}
                disabled={loading}
              >
                {loading ? 'Checking...' : 'Check Level Achievements'}
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

      <div className="achievements-grid">
        {achievements.map(achievement => (
          <div key={achievement.id} className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}>
            <div className="achievement-icon">
              <span className="achievement-emoji">{achievement.icon}</span>
              {achievement.earned && (
                <div className="achievement-badge">
                  <Star size={12} />
                </div>
              )}
              {achievement.blockchainId && walletConnected && (
                <div className={`blockchain-indicator ${achievement.onChainEarned ? 'synced' : 'pending'}`}>
                  <span className="blockchain-dot"></span>
                </div>
              )}
            </div>
            <div className="achievement-content">
              <h3 className="achievement-name">{achievement.name}</h3>
              <p className="achievement-description">{achievement.description}</p>
              <div className="achievement-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
              <div className="achievement-reward">
                <Zap size={14} />
                +{achievement.xpReward} XP
              </div>
              {achievement.blockchainId && (
                <div className="blockchain-info">
                  <span className="blockchain-label">
                    {achievement.onChainEarned ? '✅ Synced' : '⏳ Pending'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {earnedAchievements.length === 0 && (
        <div className="empty-achievements">
          <Trophy size={48} />
          <h3>No Achievements Yet</h3>
          <p>Complete tasks and phases to earn your first achievements!</p>
          {!walletConnected && (
            <p className="blockchain-note">
              Connect your wallet to sync achievements with the blockchain!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Achievements; 
import { useState, useEffect } from 'react';
import { Calendar, Flame, Target, Zap, CheckCircle, Clock, Wallet } from 'lucide-react';
import { 
  getMyUser, 
  completeDailyChallenge,
  getDailyChallengeStatus,
  DAILY_CHALLENGE_IDS,
  checkMetaMaskConnection,
  requestMetaMaskConnection,
  onAccountChange,
  onNetworkChange
} from '../ethereum/xpContract';

const DailyChallenges = ({ userProgress, userStats, phases, onCompleteChallenge }) => {
  const [dailyChallenges, setDailyChallenges] = useState(() => {
    const saved = localStorage.getItem("startupQuestDailyChallenges");
    const today = new Date().toDateString();
    
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today) {
        return data.challenges;
      }
    }
    
    // Generate new daily challenges
    return generateDailyChallenges();
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("startupQuestStreak");
    return saved ? JSON.parse(saved) : { days: 0, lastCompleted: null };
  });

  const [completedToday, setCompletedToday] = useState(() => {
    const saved = localStorage.getItem("startupQuestDailyCompleted");
    const today = new Date().toDateString();
    
    if (saved) {
      const data = JSON.parse(saved);
      return data.date === today ? data.completed : [];
    }
    return [];
  });

  const [walletConnected, setWalletConnected] = useState(false);
  const [onChainData, setOnChainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function generateDailyChallenges() {
    const challenges = [
      {
        id: 'complete-task',
        name: 'Complete a Task',
        description: 'Complete any task in any phase',
        icon: '🎯',
        xpReward: 25,
        type: 'task',
        blockchainId: DAILY_CHALLENGE_IDS.COMPLETE_TASK
      },
      {
        id: 'share-idea',
        name: 'Share an Idea',
        description: 'Share an idea in the community',
        icon: '💡',
        xpReward: 30,
        type: 'social',
        blockchainId: DAILY_CHALLENGE_IDS.SHARE_IDEA
      },
      {
        id: 'upvote-others',
        name: 'Support Others',
        description: 'Give 3 upvotes to community ideas',
        icon: '👍',
        xpReward: 20,
        type: 'social',
        blockchainId: DAILY_CHALLENGE_IDS.UPVOTE_OTHERS
      },
      {
        id: 'level-up',
        name: 'Level Up',
        description: 'Gain a level (if possible)',
        icon: '⭐',
        xpReward: 50,
        type: 'progress',
        blockchainId: DAILY_CHALLENGE_IDS.LEVEL_UP
      },
      {
        id: 'complete-phase',
        name: 'Phase Completion',
        description: 'Complete a phase (if available)',
        icon: '🏆',
        xpReward: 100,
        type: 'milestone',
        blockchainId: DAILY_CHALLENGE_IDS.COMPLETE_PHASE
      }
    ];

    // Randomly select 3 challenges
    const shuffled = challenges.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
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
      await syncChallengesWithBlockchain();
    } catch (error) {
      console.error('Error loading on-chain data:', error);
      setOnChainData(null);
    }
  };

  const syncChallengesWithBlockchain = async () => {
    if (!walletConnected || !onChainData) return;

    try {
      const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
      const updatedChallenges = await Promise.all(
        dailyChallenges.map(async (challenge) => {
          if (challenge.blockchainId) {
            const onChainStatus = await getDailyChallengeStatus(onChainData.address, challenge.blockchainId);
            const onChainCompleted = onChainStatus === today;
            return { ...challenge, onChainCompleted };
          }
          return challenge;
        })
      );
      setDailyChallenges(updatedChallenges);
    } catch (error) {
      console.error('Error syncing challenges with blockchain:', error);
    }
  };

  // Save daily challenges
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem("startupQuestDailyChallenges", JSON.stringify({
      date: today,
      challenges: dailyChallenges
    }));
  }, [dailyChallenges]);

  // Save streak
  useEffect(() => {
    localStorage.setItem("startupQuestStreak", JSON.stringify(streak));
  }, [streak]);

  // Save completed challenges
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem("startupQuestDailyCompleted", JSON.stringify({
      date: today,
      completed: completedToday
    }));
  }, [completedToday]);

  // Check challenge completion
  useEffect(() => {
    const totalTasks = phases.reduce((sum, phase) => sum + phase.completedTasks.length, 0);
    const completedPhases = phases.filter(phase => phase.status === 'completed').length;
    
    dailyChallenges.forEach(challenge => {
      if (completedToday.includes(challenge.id)) return;
      
      let completed = false;
      
      switch (challenge.id) {
        case 'complete-task':
          completed = totalTasks > 0;
          break;
        case 'share-idea':
          completed = userStats.ideasShared > 0;
          break;
        case 'upvote-others':
          completed = userStats.upvotesGiven >= 3;
          break;
        case 'level-up':
          completed = userProgress.userLevel > 1;
          break;
        case 'complete-phase':
          completed = completedPhases > 0;
          break;
      }
      
      if (completed) {
        handleChallengeComplete(challenge);
      }
    });
  }, [phases, userStats, userProgress, dailyChallenges, completedToday]);

  const handleChallengeComplete = async (challenge) => {
    if (completedToday.includes(challenge.id)) return;
    
    setCompletedToday(prev => [...prev, challenge.id]);
    
    // Update streak
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (streak.lastCompleted === yesterday || streak.lastCompleted === today) {
      setStreak(prev => ({
        days: prev.lastCompleted === today ? prev.days : prev.days + 1,
        lastCompleted: today
      }));
    } else {
      setStreak({ days: 1, lastCompleted: today });
    }
    
    // Award XP locally
    if (onCompleteChallenge) {
      onCompleteChallenge(challenge.xpReward);
    }

    // Complete challenge on blockchain if wallet is connected
    if (walletConnected && challenge.blockchainId) {
      try {
        await completeDailyChallenge(challenge.blockchainId, challenge.xpReward);
        setSuccess(`Challenge "${challenge.name}" completed on blockchain!`);
        await loadOnChainData(); // Refresh on-chain data
      } catch (error) {
        console.error('Error completing challenge on blockchain:', error);
        setError('Failed to complete challenge on blockchain: ' + error.message);
      }
    }
  };

  const completedCount = completedToday.length;
  const totalChallenges = dailyChallenges.length;
  const allCompleted = completedCount === totalChallenges;

  return (
    <div className="daily-challenges-container">
      <div className="daily-header">
        <div className="daily-title">
          <Calendar className="daily-icon" />
          <h2>Daily Challenges</h2>
        </div>
        <div className="streak-info">
          <Flame className="streak-icon" />
          <span className="streak-count">
            {walletConnected && onChainData ? onChainData.dailyStreak : streak.days} day streak
          </span>
        </div>
      </div>

      {/* Wallet Connection Section */}
      <div className="wallet-section">
        {!walletConnected ? (
          <div className="wallet-not-connected">
            <Wallet className="wallet-icon" />
            <div className="wallet-info">
              <h3>Connect Wallet for Blockchain Challenges</h3>
              <p>Connect your wallet to sync daily challenges with the blockchain and earn on-chain rewards!</p>
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
              <p>Blockchain challenges synced!</p>
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

      <div className="daily-progress">
        <div className="progress-info">
          <span className="progress-text">{completedCount}/{totalChallenges} completed</span>
          {allCompleted && (
            <div className="daily-complete-badge">
              <CheckCircle size={16} />
              All Complete!
            </div>
          )}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(completedCount / totalChallenges) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="challenges-list">
        {dailyChallenges.map(challenge => {
          const isCompleted = completedToday.includes(challenge.id);
          
          return (
            <div key={challenge.id} className={`challenge-card ${isCompleted ? 'completed' : ''}`}>
              <div className="challenge-icon">
                <span className="challenge-emoji">{challenge.icon}</span>
                {isCompleted && (
                  <div className="completion-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
                {challenge.blockchainId && walletConnected && (
                  <div className={`blockchain-indicator ${challenge.onChainCompleted ? 'synced' : 'pending'}`}>
                    <span className="blockchain-dot"></span>
                  </div>
                )}
              </div>
              <div className="challenge-content">
                <h3 className="challenge-name">{challenge.name}</h3>
                <p className="challenge-description">{challenge.description}</p>
                <div className="challenge-reward">
                  <Zap size={14} />
                  +{challenge.xpReward} XP
                </div>
                {challenge.blockchainId && (
                  <div className="blockchain-info">
                    <span className="blockchain-label">
                      {challenge.onChainCompleted ? '✅ Synced' : '⏳ Pending'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {allCompleted && (
        <div className="daily-complete-message">
          <div className="complete-icon">🎉</div>
          <h3>Daily Challenges Complete!</h3>
          <p>Great job! Come back tomorrow for new challenges.</p>
          <div className="streak-bonus">
            <Flame className="streak-bonus-icon" />
            <span>
              Streak Bonus: +{Math.min((walletConnected && onChainData ? onChainData.dailyStreak : streak.days) * 10, 100)} XP
            </span>
          </div>
          {walletConnected && (
            <p className="blockchain-note">
              ✅ All challenges synced with blockchain!
            </p>
          )}
        </div>
      )}

      <div className="daily-reset-info">
        <Clock size={14} />
        <span>Challenges reset daily at midnight</span>
        {walletConnected && (
          <span className="blockchain-note"> • Blockchain synced</span>
        )}
      </div>
    </div>
  );
};

export default DailyChallenges; 
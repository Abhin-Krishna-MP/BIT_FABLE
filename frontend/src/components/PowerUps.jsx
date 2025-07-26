import { useState, useEffect } from 'react';
import { Zap, Star, Target, Users, Clock, Gift, Sparkles, Wallet } from 'lucide-react';
import { 
  getMyUser, 
  activatePowerUp,
  getPowerUpCount,
  POWERUP_IDS,
  checkMetaMaskConnection,
  requestMetaMaskConnection,
  onAccountChange,
  onNetworkChange
} from '../ethereum/xpContract';

const PowerUps = ({ userProgress, onActivatePowerUp }) => {
  const [powerUps, setPowerUps] = useState(() => {
    const saved = localStorage.getItem("startupQuestPowerUps");
    return saved ? JSON.parse(saved) : [
      {
        id: 'xp-boost',
        name: 'XP Boost',
        description: 'Double XP for the next 3 tasks',
        icon: '⚡',
        cost: 100,
        duration: 3,
        active: false,
        remainingUses: 0,
        type: 'boost',
        blockchainId: POWERUP_IDS.XP_BOOST
      },
      {
        id: 'auto-complete',
        name: 'Auto Complete',
        description: 'Automatically complete one task',
        icon: '🎯',
        cost: 200,
        duration: 1,
        active: false,
        remainingUses: 0,
        type: 'instant',
        blockchainId: POWERUP_IDS.AUTO_COMPLETE
      },
      {
        id: 'phase-unlock',
        name: 'Phase Unlock',
        description: 'Unlock the next phase early',
        icon: '🔓',
        cost: 500,
        duration: 1,
        active: false,
        remainingUses: 0,
        type: 'instant',
        blockchainId: POWERUP_IDS.PHASE_UNLOCK
      },
      {
        id: 'streak-protect',
        name: 'Streak Protection',
        description: 'Protect your streak for 1 day',
        icon: '🛡️',
        cost: 150,
        duration: 1,
        active: false,
        remainingUses: 0,
        type: 'protection',
        blockchainId: POWERUP_IDS.STREAK_PROTECT
      },
      {
        id: 'lucky-draw',
        name: 'Lucky Draw',
        description: 'Random XP bonus (50-200 XP)',
        icon: '🎲',
        cost: 75,
        duration: 1,
        active: false,
        remainingUses: 0,
        type: 'gamble',
        blockchainId: POWERUP_IDS.LUCKY_DRAW
      },
      {
        id: 'team-boost',
        name: 'Team Boost',
        description: 'Share XP boost with friends',
        icon: '👥',
        cost: 300,
        duration: 5,
        active: false,
        remainingUses: 0,
        type: 'social',
        blockchainId: POWERUP_IDS.TEAM_BOOST
      }
    ];
  });

  const [availableXP, setAvailableXP] = useState(userProgress.userXP);
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
      await syncPowerUpsWithBlockchain();
    } catch (error) {
      console.error('Error loading on-chain data:', error);
      setOnChainData(null);
    }
  };

  const syncPowerUpsWithBlockchain = async () => {
    if (!walletConnected || !onChainData) return;

    try {
      const updatedPowerUps = await Promise.all(
        powerUps.map(async (powerUp) => {
          if (powerUp.blockchainId) {
            const onChainCount = await getPowerUpCount(onChainData.address, powerUp.blockchainId);
            return { ...powerUp, onChainCount: Number(onChainCount) };
          }
          return powerUp;
        })
      );
      setPowerUps(updatedPowerUps);
    } catch (error) {
      console.error('Error syncing power-ups with blockchain:', error);
    }
  };

  // Update available XP when userProgress changes
  useEffect(() => {
    setAvailableXP(userProgress.userXP);
  }, [userProgress.userXP]);

  // Save power-ups to localStorage
  useEffect(() => {
    localStorage.setItem("startupQuestPowerUps", JSON.stringify(powerUps));
  }, [powerUps]);

  const activatePowerUp = async (powerUp) => {
    if (availableXP < powerUp.cost) {
      setError('Not enough XP to activate this power-up!');
      return;
    }

    if (powerUp.type === 'gamble') {
      const bonus = Math.floor(Math.random() * 151) + 50; // 50-200 XP
      setSuccess(`🎲 Lucky Draw! You won ${bonus} XP!`);
      if (onActivatePowerUp) {
        onActivatePowerUp(bonus - powerUp.cost); // Net gain
      }
    } else {
      setPowerUps(prev => prev.map(p => 
        p.id === powerUp.id 
          ? { ...p, active: true, remainingUses: p.duration }
          : p
      ));
      
      if (onActivatePowerUp) {
        onActivatePowerUp(-powerUp.cost); // Cost
      }
    }

    // Activate power-up on blockchain if wallet is connected
    if (walletConnected && powerUp.blockchainId) {
      try {
        await activatePowerUp(powerUp.blockchainId, powerUp.cost);
        setSuccess(`Power-up "${powerUp.name}" activated on blockchain!`);
        await loadOnChainData(); // Refresh on-chain data
      } catch (error) {
        console.error('Error activating power-up on blockchain:', error);
        setError('Failed to activate power-up on blockchain: ' + error.message);
      }
    }
  };

  const usePowerUp = (powerUp) => {
    if (powerUp.remainingUses <= 0) return;
    
    setPowerUps(prev => prev.map(p => 
      p.id === powerUp.id 
        ? { ...p, remainingUses: p.remainingUses - 1, active: p.remainingUses > 1 }
        : p
    ));
    
    // Handle power-up effects
    switch (powerUp.id) {
      case 'xp-boost':
        setSuccess('⚡ XP Boost activated! Next 3 tasks will give double XP!');
        break;
      case 'auto-complete':
        setSuccess('🎯 Auto Complete used! Choose a task to complete automatically.');
        break;
      case 'phase-unlock':
        setSuccess('🔓 Phase Unlock used! The next phase is now available.');
        break;
      case 'streak-protect':
        setSuccess('🛡️ Streak Protection activated! Your streak is safe for today.');
        break;
      case 'team-boost':
        setSuccess('👥 Team Boost activated! Share the XP boost with your friends!');
        break;
    }
  };

  const activePowerUps = powerUps.filter(p => p.active);
  const availablePowerUps = powerUps.filter(p => !p.active);

  return (
    <div className="powerups-container">
      <div className="powerups-header">
        <h2 className="section-title">
          <Zap className="section-icon" /> Power-ups
        </h2>
        <div className="xp-balance">
          <Star size={16} />
          <span>{availableXP} XP Available</span>
        </div>
      </div>

      {/* Wallet Connection Section */}
      <div className="wallet-section">
        {!walletConnected ? (
          <div className="wallet-not-connected">
            <Wallet className="wallet-icon" />
            <div className="wallet-info">
              <h3>Connect Wallet for Blockchain Power-ups</h3>
              <p>Connect your wallet to sync power-ups with the blockchain and track usage on-chain!</p>
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
              <p>Blockchain power-ups synced!</p>
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

      {/* Active Power-ups */}
      {activePowerUps.length > 0 && (
        <div className="active-powerups">
          <h3>Active Power-ups</h3>
          <div className="active-powerups-grid">
            {activePowerUps.map(powerUp => (
              <div key={powerUp.id} className="active-powerup-card">
                <div className="powerup-icon">
                  <span className="powerup-emoji">{powerUp.icon}</span>
                  <div className="powerup-badge">
                    <Sparkles size={12} />
                  </div>
                  {powerUp.blockchainId && walletConnected && (
                    <div className="blockchain-indicator synced">
                      <span className="blockchain-dot"></span>
                    </div>
                  )}
                </div>
                <div className="powerup-content">
                  <h4 className="powerup-name">{powerUp.name}</h4>
                  <p className="powerup-description">{powerUp.description}</p>
                  <div className="powerup-uses">
                    <Clock size={12} />
                    <span>{powerUp.remainingUses} uses remaining</span>
                  </div>
                  <button 
                    className="btn-use-powerup"
                    onClick={() => usePowerUp(powerUp)}
                    disabled={powerUp.remainingUses <= 0}
                  >
                    Use Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Power-ups */}
      <div className="available-powerups">
        <h3>Available Power-ups</h3>
        <div className="powerups-grid">
          {availablePowerUps.map(powerUp => (
            <div key={powerUp.id} className="powerup-card">
              <div className="powerup-icon">
                <span className="powerup-emoji">{powerUp.icon}</span>
                {powerUp.blockchainId && walletConnected && (
                  <div className="blockchain-indicator">
                    <span className="blockchain-dot"></span>
                  </div>
                )}
              </div>
              <div className="powerup-content">
                <h4 className="powerup-name">{powerUp.name}</h4>
                <p className="powerup-description">{powerUp.description}</p>
                <div className="powerup-cost">
                  <Star size={14} />
                  <span>{powerUp.cost} XP</span>
                </div>
                {powerUp.blockchainId && walletConnected && (
                  <div className="blockchain-info">
                    <span className="blockchain-label">
                      Used {powerUp.onChainCount || 0} times on-chain
                    </span>
                  </div>
                )}
                <button 
                  className={`btn-activate-powerup ${availableXP >= powerUp.cost ? 'affordable' : 'expensive'}`}
                  onClick={() => activatePowerUp(powerUp)}
                  disabled={availableXP < powerUp.cost}
                >
                  {powerUp.type === 'gamble' ? 'Try Luck' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {availablePowerUps.length === 0 && activePowerUps.length === 0 && (
        <div className="empty-powerups">
          <Zap size={48} />
          <h3>No Power-ups Available</h3>
          <p>Earn more XP to unlock powerful abilities!</p>
          {!walletConnected && (
            <p className="blockchain-note">
              Connect your wallet to track power-up usage on the blockchain!
            </p>
          )}
        </div>
      )}

      <div className="powerups-info">
        <div className="info-item">
          <Gift size={14} />
          <span>Power-ups provide temporary bonuses and special abilities</span>
        </div>
        <div className="info-item">
          <Clock size={14} />
          <span>Some power-ups have limited uses and duration</span>
        </div>
        {walletConnected && (
          <div className="info-item">
            <Wallet size={14} />
            <span>All power-up usage is tracked on the blockchain</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PowerUps; 
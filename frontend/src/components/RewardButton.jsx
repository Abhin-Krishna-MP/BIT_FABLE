import React, { useState } from 'react';
import { useRewarder } from '../hooks/useRewarder';
import { Gift, Wallet, AlertCircle, CheckCircle, DollarSign, RefreshCw } from 'lucide-react';

const RewardButton = ({ taskCompleted = false, onRewardClaimed }) => {
  const { 
    isConnected, 
    userAddress, 
    loading, 
    error, 
    contractBalance,
    canSendReward,
    connectWallet, 
    sendReward,
    fundContract,
    updateContractState
  } = useRewarder();
  
  const [rewardSent, setRewardSent] = useState(false);
  const [fundingAmount, setFundingAmount] = useState('5.0'); // Increased default funding amount
  const [showFunding, setShowFunding] = useState(false);

  const handleClaimReward = async () => {
    try {
      if (!isConnected) {
        await connectWallet();
        return;
      }

      if (!taskCompleted) {
        alert('Complete a task first to claim your reward!');
        return;
      }

      if (!canSendReward) {
        alert('Contract has insufficient funds. Please fund the contract first.');
        setShowFunding(true);
        return;
      }

      const result = await sendReward();
      
      if (result.success) {
        setRewardSent(true);
        if (onRewardClaimed) {
          onRewardClaimed(result);
        }
        
        // Reset after 5 seconds
        setTimeout(() => setRewardSent(false), 5000);
      }
    } catch (err) {
      console.error('Failed to claim reward:', err);
      alert('Failed to claim reward: ' + err.message);
    }
  };

  const handleFundContract = async () => {
    try {
      const amount = parseFloat(fundingAmount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      await fundContract(amount);
      setShowFunding(false);
      alert(`Contract funded with ${amount} ETH!`);
    } catch (err) {
      console.error('Failed to fund contract:', err);
      alert('Failed to fund contract: ' + err.message);
    }
  };

  const getButtonText = () => {
    if (rewardSent) return 'Reward Sent! 🎉';
    if (loading) return 'Processing...';
    if (!isConnected) return 'Connect Wallet';
    if (!taskCompleted) return 'Complete Task First';
    if (!canSendReward) return 'Fund Contract First';
    return 'Claim 0.1 ETH Reward'; // Updated from 0.01 to 0.1 ETH
  };

  const getButtonIcon = () => {
    if (rewardSent) return <CheckCircle size={20} />;
    if (loading) return <div className="animate-spin">⏳</div>;
    if (!isConnected) return <Wallet size={20} />;
    if (!canSendReward) return <DollarSign size={20} />;
    return <Gift size={20} />;
  };

  const isButtonDisabled = () => {
    return loading || rewardSent;
  };

  return (
    <div className="reward-button-container">
      {/* Contract Status */}
      <div className="contract-status">
        <div className="status-item">
          <span className="status-label">Contract Balance:</span>
          <span className={`status-value ${canSendReward ? 'success' : 'warning'}`}>
            {contractBalance} ETH
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Can Send Reward:</span>
          <span className={`status-value ${canSendReward ? 'success' : 'error'}`}>
            {canSendReward ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Reward Amount:</span>
          <span className="status-value success">
            0.1 ETH
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* User Address Display */}
      {isConnected && userAddress && (
        <div className="user-address">
          <Wallet size={16} />
          <span>{userAddress.slice(0, 6)}...{userAddress.slice(-4)}</span>
        </div>
      )}

      {/* Funding Section */}
      {showFunding && (
        <div className="funding-section">
          <h4>Fund Contract</h4>
          <div className="funding-input">
            <input
              type="number"
              value={fundingAmount}
              onChange={(e) => setFundingAmount(e.target.value)}
              placeholder="Amount in ETH"
              min="0.1"
              step="0.1"
            />
            <button 
              onClick={handleFundContract}
              disabled={loading}
              className="fund-button"
            >
              {loading ? 'Funding...' : 'Fund Contract'}
            </button>
          </div>
          <button 
            onClick={() => setShowFunding(false)}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Main Reward Button */}
      <button
        onClick={handleClaimReward}
        disabled={isButtonDisabled()}
        className={`reward-button ${rewardSent ? 'success' : ''} ${loading ? 'loading' : ''}`}
      >
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </button>

      {/* Refresh Button */}
      <button
        onClick={updateContractState}
        disabled={loading}
        className="refresh-button"
      >
        <RefreshCw size={16} />
        <span>Refresh Status</span>
      </button>

      {/* Success Message */}
      {rewardSent && (
        <div className="success-message">
          <CheckCircle size={16} />
          <span>0.1 ETH sent to your wallet!</span> {/* Updated from 0.01 to 0.1 ETH */}
        </div>
      )}

      <style>{`
        .reward-button-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          max-width: 400px;
          margin: 20px auto;
        }

        .contract-status {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .status-label {
          font-weight: 500;
          color: #64748b;
        }

        .status-value {
          font-weight: 600;
          font-family: monospace;
        }

        .status-value.success {
          color: #059669;
        }

        .status-value.warning {
          color: #d97706;
        }

        .status-value.error {
          color: #dc2626;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          font-size: 14px;
        }

        .user-address {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          color: #0369a1;
          font-size: 14px;
          font-family: monospace;
        }

        .funding-section {
          padding: 12px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
        }

        .funding-section h4 {
          margin: 0 0 8px 0;
          color: #059669;
          font-size: 14px;
        }

        .funding-input {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .funding-input input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .fund-button {
          padding: 8px 16px;
          background: #059669;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
        }

        .fund-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-button {
          padding: 4px 12px;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }

        .reward-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 48px;
        }

        .reward-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .reward-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .reward-button.success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .reward-button.loading {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        }

        .refresh-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh-button:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .refresh-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          color: #059669;
          font-size: 14px;
          font-weight: 500;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RewardButton; 
import React, { useState } from 'react';
import { useWalletBalance } from '../hooks/useWalletBalance';
import { useRewarder } from '../hooks/useRewarder';
import { Wallet, RefreshCw, TrendingUp, TrendingDown, Clock, ExternalLink, Gift, AlertCircle } from 'lucide-react';

const BalanceDisplay = () => {
  const { 
    balance, 
    transactions, 
    loading, 
    error, 
    address, 
    connectWallet, 
    refreshData 
  } = useWalletBalance();

  const { 
    contractBalance, 
    canSendReward, 
    getRewardAmount 
  } = useRewarder();

  const [showTransactions, setShowTransactions] = useState(false);
  const [rewardAmount, setRewardAmount] = useState('0.1');

  // Get reward amount on component mount
  React.useEffect(() => {
    const fetchRewardAmount = async () => {
      try {
        const amount = await getRewardAmount();
        setRewardAmount(amount);
      } catch (err) {
        console.error('Failed to get reward amount:', err);
        // Set default reward amount if contract is not available
        setRewardAmount('0.1');
      }
    };
    fetchRewardAmount();
  }, [getRewardAmount]);

  const formatAddress = (addr) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const getTransactionIcon = (type) => {
    return type === 'received' ? 
      <TrendingUp size={16} className="text-green-500" /> : 
      <TrendingDown size={16} className="text-red-500" />;
  };

  const getTransactionColor = (type) => {
    return type === 'received' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="balance-display">
      {/* Wallet Connection Status */}
      {!address ? (
        <div className="wallet-not-connected">
          <AlertCircle size={20} />
          <span>Wallet not connected</span>
          <button 
            onClick={connectWallet}
            disabled={loading}
            className="connect-button"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <>
          {/* Balance Overview */}
          <div className="balance-overview">
            <div className="balance-header">
              <Wallet size={20} />
              <h3>Wallet Balance</h3>
              <button 
                onClick={refreshData}
                disabled={loading}
                className="refresh-button"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            
            <div className="balance-details">
              <div className="balance-item">
                <span className="label">Address:</span>
                <span className="value address">{formatAddress(address)}</span>
              </div>
              
              <div className="balance-item">
                <span className="label">ETH Balance:</span>
                <span className="value balance">{parseFloat(balance).toFixed(4)} ETH</span>
              </div>
              
              <div className="balance-item">
                <span className="label">Reward Amount:</span>
                <span className="value reward">
                  <Gift size={16} />
                  {rewardAmount} ETH
                </span>
              </div>
            </div>
          </div>

          {/* Contract Status */}
          <div className="contract-status">
            <div className="status-header">
              <h4>Reward Contract Status</h4>
            </div>
            
            <div className="status-details">
              <div className="status-item">
                <span className="label">Contract Balance:</span>
                <span className={`value ${canSendReward ? 'success' : 'warning'}`}>
                  {contractBalance} ETH
                </span>
              </div>
              
              <div className="status-item">
                <span className="label">Can Send Rewards:</span>
                <span className={`value ${canSendReward ? 'success' : 'error'}`}>
                  {canSendReward ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="transaction-history">
            <div className="history-header">
              <h4>Recent Transactions</h4>
              <button 
                onClick={() => setShowTransactions(!showTransactions)}
                className="toggle-button"
              >
                {showTransactions ? 'Hide' : 'Show'} History
              </button>
            </div>
            
            {showTransactions && (
              <div className="transactions-list">
                {transactions.length === 0 ? (
                  <div className="no-transactions">
                    <Clock size={20} />
                    <span>No recent transactions</span>
                  </div>
                ) : (
                  transactions.map((tx, index) => (
                    <div key={index} className="transaction-item">
                      <div className="transaction-icon">
                        {getTransactionIcon(tx.type)}
                      </div>
                      
                      <div className="transaction-details">
                        <div className="transaction-amount">
                          <span className={`amount ${getTransactionColor(tx.type)}`}>
                            {tx.type === 'received' ? '+' : '-'}{tx.value} ETH
                          </span>
                          <span className="transaction-type">
                            {tx.type === 'received' ? 'Received' : 'Sent'}
                          </span>
                        </div>
                        
                        <div className="transaction-meta">
                          <span className="timestamp">{formatTimestamp(tx.timestamp)}</span>
                          <span className="block">Block #{tx.blockNumber}</span>
                        </div>
                        
                        <div className="transaction-addresses">
                          <span className="from">From: {formatAddress(tx.from)}</span>
                          <span className="to">To: {formatAddress(tx.to)}</span>
                        </div>
                      </div>
                      
                      <div className="transaction-hash">
                        <a 
                          href={`https://localhost:8545/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hash-link"
                        >
                          <ExternalLink size={14} />
                          {tx.hash.slice(0, 8)}...
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <style>{`
        .balance-display {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin: 20px 0;
        }

        .wallet-not-connected {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          color: #92400e;
        }

        .connect-button {
          padding: 8px 16px;
          background: #f59e0b;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .connect-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .balance-overview {
          margin-bottom: 20px;
        }

        .balance-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .balance-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .refresh-button {
          padding: 6px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          margin-left: auto;
        }

        .refresh-button:hover {
          background: #e5e7eb;
        }

        .balance-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .balance-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .balance-item:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: 500;
          color: #6b7280;
        }

        .value {
          font-weight: 600;
          font-family: monospace;
        }

        .value.address {
          color: #3b82f6;
        }

        .value.balance {
          color: #059669;
          font-size: 18px;
        }

        .value.reward {
          color: #7c3aed;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .contract-status {
          margin-bottom: 20px;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .status-header h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }

        .status-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .value.success {
          color: #059669;
        }

        .value.warning {
          color: #d97706;
        }

        .value.error {
          color: #dc2626;
        }

        .transaction-history {
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .history-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }

        .toggle-button {
          padding: 6px 12px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .toggle-button:hover {
          background: #e5e7eb;
        }

        .transactions-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .no-transactions {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 20px;
          color: #6b7280;
          text-align: center;
          justify-content: center;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin-bottom: 8px;
          background: #f9fafb;
        }

        .transaction-icon {
          flex-shrink: 0;
        }

        .transaction-details {
          flex: 1;
          min-width: 0;
        }

        .transaction-amount {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .amount {
          font-weight: 600;
          font-size: 16px;
        }

        .transaction-type {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .transaction-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .transaction-addresses {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 12px;
          color: #6b7280;
        }

        .transaction-hash {
          flex-shrink: 0;
        }

        .hash-link {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #3b82f6;
          text-decoration: none;
          font-size: 12px;
        }

        .hash-link:hover {
          text-decoration: underline;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          margin-top: 16px;
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

export default BalanceDisplay; 
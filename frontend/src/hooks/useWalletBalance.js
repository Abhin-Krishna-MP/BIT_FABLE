import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useWalletBalance = () => {
  const [balance, setBalance] = useState('0');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);

  // Initialize provider
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      
      // Check if already connected
      checkConnection();
    }
  }, []);

  const checkConnection = async () => {
    try {
      if (!provider) return;
      
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setAddress(accounts[0].address);
        await loadBalance();
        await loadTransactionHistory();
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  const loadBalance = async () => {
    try {
      if (!provider || !address) return;
      
      setLoading(true);
      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      setBalance(formattedBalance);
    } catch (err) {
      setError('Failed to load balance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionHistory = async () => {
    try {
      if (!provider || !address) return;
      
      // Get recent transactions (last 10 blocks)
      const currentBlock = await provider.getBlockNumber();
      const transactions = [];
      
      // Check last 10 blocks for transactions involving this address
      for (let i = 0; i < 10; i++) {
        const blockNumber = currentBlock - i;
        const block = await provider.getBlock(blockNumber, true);
        
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (tx.to === address || tx.from === address) {
              transactions.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: ethers.formatEther(tx.value),
                blockNumber: blockNumber,
                timestamp: block.timestamp,
                type: tx.to === address ? 'received' : 'sent'
              });
            }
          }
        }
      }
      
      setTransactions(transactions);
    } catch (err) {
      console.error('Error loading transaction history:', err);
    }
  };

  const connectWallet = async () => {
    try {
      if (!provider) return;
      
      setLoading(true);
      const accounts = await provider.send('eth_requestAccounts', []);
      setAddress(accounts[0]);
      
      await loadBalance();
      await loadTransactionHistory();
    } catch (err) {
      setError('Failed to connect wallet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadBalance();
    await loadTransactionHistory();
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          loadBalance();
          loadTransactionHistory();
        } else {
          setAddress(null);
          setBalance('0');
          setTransactions([]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return {
    balance,
    transactions,
    loading,
    error,
    address,
    connectWallet,
    refreshData,
    loadBalance,
    loadTransactionHistory
  };
}; 
import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const MetaMaskTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Not connected');
  const [error, setError] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);

  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('Connected');
      checkNetwork();
    } else {
      setConnectionStatus('Not connected');
      setNetworkInfo(null);
    }
  }, [isConnected]);

  const checkNetwork = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        });

        setNetworkInfo({
          chainId: parseInt(chainId, 16),
          account: accounts[0],
          balance: parseInt(balance, 16) / 1e18
        });
      }
    } catch (err) {
      setError('Error checking network: ' + err.message);
    }
  };

  const testTransaction = async () => {
    try {
      setError(null);
      
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        // Try a simple transaction
        const tx = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: accounts[0],
            to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Hardhat account #1
            value: '0x16345785d8a0000' // 0.1 ETH
          }]
        });
        
        setConnectionStatus('Transaction sent: ' + tx);
      }
    } catch (err) {
      setError('Transaction failed: ' + err.message);
    }
  };

  const testContractCall = async () => {
    try {
      setError(null);
      
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        // Test calling the badge contract
        const result = await window.ethereum.request({
          method: 'eth_call',
          params: [{
            to: '0x67d269191c92Caf3cD7723F116c85e6E9bf55933',
            data: '0x37c245fe0000000000000000000000000000000000000000000000000000000000000001'
          }, 'latest']
        });
        
        setConnectionStatus('Contract call successful: ' + result);
      }
    } catch (err) {
      setError('Contract call failed: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>🔧 MetaMask Connection Test</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <ConnectButton />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> {connectionStatus}
      </div>
      
      {address && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Address:</strong> {address}
        </div>
      )}
      
      {networkInfo && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Chain ID:</strong> {networkInfo.chainId} (should be 31337)<br/>
          <strong>Balance:</strong> {networkInfo.balance} ETH<br/>
          <strong>Account:</strong> {networkInfo.account}
        </div>
      )}
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={checkNetwork}
          style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Check Network
        </button>
        
        <button 
          onClick={testTransaction}
          style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Test Transaction
        </button>
        
        <button 
          onClick={testContractCall}
          style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' }}
        >
          Test Contract Call
        </button>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <strong>Instructions:</strong><br/>
        1. Connect MetaMask using the button above<br/>
        2. Make sure you're on "Localhost 8545" network<br/>
        3. Click "Check Network" to verify connection<br/>
        4. Try "Test Transaction" to see if basic transactions work<br/>
        5. Try "Test Contract Call" to test badge contract interaction
      </div>
    </div>
  );
};

export default MetaMaskTest; 
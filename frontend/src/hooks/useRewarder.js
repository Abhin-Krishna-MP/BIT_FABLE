import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RewarderABI from '../ethereum/Rewarder.json';
import rewarderContractInfo from '../ethereum/rewarderContract.json';

export const useRewarder = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contractBalance, setContractBalance] = useState('0');
  const [canSendReward, setCanSendReward] = useState(false);

  // Initialize provider and signer
  useEffect(() => {
    const initProvider = async () => {
      try {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);

          // Check if already connected
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            setSigner(signer);
            setUserAddress(accounts[0].address);
            setIsConnected(true);
          }
        } else {
          setError('MetaMask not found. Please install MetaMask.');
        }
      } catch (err) {
        setError('Failed to initialize provider: ' + err.message);
      }
    };

    initProvider();
  }, []);

  // Initialize contract when signer is available
  useEffect(() => {
    if (signer && rewarderContractInfo.rewarderAddress) {
      const contract = new ethers.Contract(
        rewarderContractInfo.rewarderAddress,
        RewarderABI.abi,
        signer
      );
      setContract(contract);
    }
  }, [signer]);

  // Update contract state when contract is available
  useEffect(() => {
    if (contract) {
      updateContractState();
    }
  }, [contract]);

  const updateContractState = async () => {
    try {
      const [balance, canSend] = await Promise.all([
        contract.getContractBalance(),
        contract.canSendReward()
      ]);
      
      setContractBalance(ethers.formatEther(balance));
      setCanSendReward(canSend);
    } catch (err) {
      console.error('Failed to update contract state:', err);
    }
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!provider) {
        throw new Error('Provider not initialized');
      }

      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      
      setSigner(signer);
      setUserAddress(accounts[0]);
      setIsConnected(true);
      
      console.log('✅ Connected to MetaMask:', accounts[0]);
    } catch (err) {
      setError('Failed to connect wallet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Send reward to user with improved error handling
  const sendReward = async (recipientAddress = null) => {
    try {
      setLoading(true);
      setError(null);

      if (!contract) {
        throw new Error('Contract not initialized');
      }

      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      const targetAddress = recipientAddress || userAddress;
      if (!targetAddress) {
        throw new Error('No recipient address provided');
      }

      // Check if contract can send reward
      const canSend = await contract.canSendReward();
      if (!canSend) {
        throw new Error('Contract has insufficient funds to send reward');
      }

      console.log('🎁 Sending reward to:', targetAddress);

      // Call the sendReward function with return value
      const tx = await contract.sendReward(targetAddress);
      console.log('📝 Transaction hash:', tx.hash);

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('✅ Transaction mined:', receipt);

      // Get the return value from the transaction
      const returnValue = await contract.sendReward.staticCall(targetAddress);
      console.log('📊 Return value (success):', returnValue);

      // Update contract state
      await updateContractState();

      // Listen for the RewardSent event
      const filter = contract.filters.RewardSent(targetAddress);
      const events = await contract.queryFilter(filter, receipt.blockNumber, receipt.blockNumber);
      
      if (events.length > 0) {
        const event = events[0];
        const success = event.args.success;
        console.log('🎯 Reward event:', {
          recipient: event.args.recipient,
          amount: ethers.formatEther(event.args.amount),
          success: success
        });

        if (!success) {
          throw new Error('ETH transfer failed - recipient did not receive funds');
        }
      }

      return {
        success: true,
        hash: tx.hash,
        receipt,
        returnValue
      };

    } catch (err) {
      const errorMsg = 'Failed to send reward: ' + err.message;
      setError(errorMsg);
      console.error(errorMsg, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fund the contract
  const fundContract = async (amountInEth) => {
    try {
      setLoading(true);
      setError(null);

      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const amountInWei = ethers.parseEther(amountInEth.toString());
      console.log('💰 Funding contract with:', amountInEth, 'ETH');

      const tx = await contract.fundContract({ value: amountInWei });
      const receipt = await tx.wait();

      await updateContractState();

      return {
        success: true,
        hash: tx.hash,
        receipt
      };

    } catch (err) {
      const errorMsg = 'Failed to fund contract: ' + err.message;
      setError(errorMsg);
      console.error(errorMsg, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get contract balance
  const getContractBalance = async () => {
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const balance = await contract.getContractBalance();
      const formattedBalance = ethers.formatEther(balance);
      setContractBalance(formattedBalance);
      return formattedBalance;
    } catch (err) {
      console.error('Failed to get contract balance:', err);
      return '0';
    }
  };

  // Get reward amount
  const getRewardAmount = async () => {
    try {
      if (!contract) {
        // Return default reward amount when contract is not initialized
        return '0.1';
      }

      const amount = await contract.getRewardAmount();
      return ethers.formatEther(amount);
    } catch (err) {
      console.error('Failed to get reward amount:', err);
      return '0.1';
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
        } else {
          setUserAddress(null);
          setIsConnected(false);
          setSigner(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return {
    // State
    isConnected,
    userAddress,
    loading,
    error,
    contractBalance,
    canSendReward,
    
    // Functions
    connectWallet,
    sendReward,
    fundContract,
    getContractBalance,
    getRewardAmount,
    updateContractState,
    
    // Contract info
    contractAddress: rewarderContractInfo.rewarderAddress,
    contract
  };
}; 
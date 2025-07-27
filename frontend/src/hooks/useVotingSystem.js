import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { parseEther, formatEther } from 'viem';
import QSTTokenABI from '../ethereum/QSTToken.json';
import IdeaVotingABI from '../ethereum/IdeaVoting.json';
import votingContractsInfo from '../ethereum/votingContracts.json';

export const useVotingSystem = () => {
  const [ideas, setIdeas] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { address, isConnected } = useAccount();

  // Contract addresses
  const qstTokenAddress = votingContractsInfo?.qstToken?.address;
  const ideaVotingAddress = votingContractsInfo?.ideaVoting?.address;

  // Read contract hooks
  const { data: qstBalance, isLoading: balanceLoading } = useReadContract({
    address: qstTokenAddress,
    abi: QSTTokenABI.abi,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address && !!qstTokenAddress,
    },
  });

  const { data: allIdeasData, isLoading: ideasLoading } = useReadContract({
    address: ideaVotingAddress,
    abi: IdeaVotingABI.abi,
    functionName: 'getAllIdeas',
    query: {
      enabled: !!ideaVotingAddress,
    },
  });

  // Write contract hooks
  const { writeContract: writeQST, isPending: qstPending } = useWriteContract();
  const { writeContract: writeVoting, isPending: votingPending } = useWriteContract();

  // Load ideas and user votes
  useEffect(() => {
    if (allIdeasData && address) {
      setIdeas(allIdeasData);
      // Note: We'll handle user votes differently since we can't use readContract directly
      // For now, we'll set empty votes and handle this in the UI
      setUserVotes({});
    }
  }, [allIdeasData, address]);

  // Publish a new idea
  const publishIdea = async (description) => {
    if (!ideaVotingAddress || !description.trim()) {
      throw new Error('Invalid idea description');
    }

    try {
      setLoading(true);
      setError(null);
      
      await writeVoting({
        address: ideaVotingAddress,
        abi: IdeaVotingABI.abi,
        functionName: 'publishIdea',
        args: [description],
      });
      
      // Refresh ideas after publishing
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      setError('Failed to publish idea: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Vote on an idea
  const voteOnIdea = async (ideaId, isLike) => {
    if (!ideaVotingAddress || !ideaId) {
      throw new Error('Invalid idea ID');
    }

    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll skip the voting period check since we can't use readContract directly
      // In a production app, you'd want to handle this properly
      
      // Approve QST tokens first (assuming voting period is active)
      const voteCost = parseEther('10'); // 10 QST
      await writeQST({
        address: qstTokenAddress,
        abi: QSTTokenABI.abi,
        functionName: 'approve',
        args: [ideaVotingAddress, voteCost],
      });
      
      // Cast the vote
      await writeVoting({
        address: ideaVotingAddress,
        abi: IdeaVotingABI.abi,
        functionName: 'vote',
        args: [ideaId, isLike],
      });
      
      // Refresh data after voting
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      setError('Failed to vote: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Resolve voting for an idea
  const resolveVoting = async (ideaId) => {
    if (!ideaVotingAddress || !ideaId) {
      throw new Error('Invalid idea ID');
    }

    try {
      setLoading(true);
      setError(null);
      
      await writeVoting({
        address: ideaVotingAddress,
        abi: IdeaVotingABI.abi,
        functionName: 'resolveVoting',
        args: [ideaId],
      });
      
      // Refresh data after resolving
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      setError('Failed to resolve voting: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get voting time remaining - simplified for now
  const getVotingTimeRemaining = async (ideaId) => {
    // For now, return a placeholder since we can't use readContract directly
    // In a production app, you'd want to implement this properly
    return 0;
  };

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return 'Voting ended';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return {
    // Data
    ideas,
    userVotes,
    qstBalance: qstBalance ? formatEther(qstBalance) : '0',
    
    // Loading states
    loading: loading || qstPending || votingPending || balanceLoading || ideasLoading,
    error,
    
    // Functions
    publishIdea,
    voteOnIdea,
    resolveVoting,
    getVotingTimeRemaining,
    formatTimeRemaining,
    
    // Contract addresses
    qstTokenAddress,
    ideaVotingAddress,
    
    // Connection state
    isConnected,
    address
  };
}; 
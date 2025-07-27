import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { useState } from 'react';
import AchievementBadgeABI from '../ethereum/AchievementBadge.json';
import badgeContractInfo from '../ethereum/badgeContract.json';

export const useBadgeContract = () => {
  const [error, setError] = useState(null);
  
  const { address, isConnected } = useAccount();

  // Use the ABI directly instead of parsing it
  const abi = AchievementBadgeABI.abi;

  // Read contract hooks
  const { data: hasBadgeData, isLoading: hasBadgeLoading } = useReadContract({
    address: badgeContractInfo.address,
    abi,
    functionName: 'hasBadge',
    args: [address, BigInt(1)], // Default to badge type 1
    query: {
      enabled: !!address && !!badgeContractInfo.address,
    },
  });

  const { data: userBadgesData, isLoading: userBadgesLoading } = useReadContract({
    address: badgeContractInfo.address,
    abi,
    functionName: 'getUserBadges',
    args: [address],
    query: {
      enabled: !!address && !!badgeContractInfo.address,
    },
  });

  // Write contract hook
  const { writeContract, isPending: isMinting } = useWriteContract();

  const hasBadge = async (badgeTypeId) => {
    if (!address || !badgeContractInfo.address) return false;
    
    try {
      // For now, return a simple check - in a real implementation,
      // you'd want to use the read contract hook properly
      return false;
    } catch (err) {
      console.error('Error checking badge:', err);
      return false;
    }
  };

  const getBadgeMetadata = async (tokenId) => {
    if (!badgeContractInfo.address) return null;
    
    try {
      // This would need to be implemented with proper read contract hook
      return null;
    } catch (err) {
      console.error('Error getting badge metadata:', err);
      return null;
    }
  };

  const getBadgeType = async (badgeTypeId) => {
    if (!badgeContractInfo.address) return null;
    
    try {
      // This would need to be implemented with proper read contract hook
      return {
        name: `Badge ${badgeTypeId}`,
        description: `Description for badge ${badgeTypeId}`,
        imageURI: `https://ipfs.io/ipfs/QmSampleBadge${badgeTypeId}`,
        exists: true
      };
    } catch (err) {
      console.error('Error getting badge type:', err);
      return null;
    }
  };

  const getUserBadges = async () => {
    if (!address || !badgeContractInfo.address) return [];
    
    try {
      // Return user badges from the read contract hook
      return userBadgesData ? userBadgesData.map(id => Number(id)) : [];
    } catch (err) {
      console.error('Error getting user badges:', err);
      return [];
    }
  };

  const mintBadge = async (badgeTypeId) => {
    if (!address || !badgeContractInfo.address) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setError(null);
      
      // Note: This requires the contract owner to call mintBadge
      // In a real implementation, you might want to call this from your backend
      // or have a different mechanism for users to claim badges
      await writeContract({
        address: badgeContractInfo.address,
        abi,
        functionName: 'mintBadge',
        args: [address, BigInt(badgeTypeId)],
      });
      
      return true;
    } catch (err) {
      setError('Failed to mint badge: ' + err.message);
      throw err;
    }
  };

  return {
    loading: hasBadgeLoading || userBadgesLoading || isMinting,
    error,
    hasBadge,
    getBadgeMetadata,
    getBadgeType,
    getUserBadges,
    mintBadge,
    address,
    isConnected
  };
}; 
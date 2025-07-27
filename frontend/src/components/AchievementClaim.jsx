import React, { useState, useEffect } from 'react';
import { useBadgeContract } from '../hooks/useBadgeContract';
import { badgeService } from '../services/badgeService';
import toast from 'react-hot-toast';

const AchievementClaim = ({ phaseId, phaseName, user }) => {
  const [showClaim, setShowClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  
  const { 
    hasBadge, 
    getBadgeType, 
    mintBadge, 
    address, 
    isConnected,
    loading: contractLoading 
  } = useBadgeContract();

  // Define which phases should trigger badges
  const badgeTriggers = {
    1: { badgeTypeId: 3, name: "Market Explorer" }, // Market Research
    2: { badgeTypeId: 2, name: "MVP Builder" },     // MVP Development
    3: { badgeTypeId: 1, name: "Pitch Master" }     // Pitch & Scale
  };

  useEffect(() => {
    const checkBadgeStatus = async () => {
      if (!isConnected || !address || !badgeTriggers[phaseId]) return;
      
      try {
        const badgeTypeId = badgeTriggers[phaseId].badgeTypeId;
        const userHasBadge = await hasBadge(badgeTypeId);
        setHasClaimed(userHasBadge);
        
        // Show claim option if user completed the phase but hasn't claimed the badge
        if (!userHasBadge && phaseId === 3) { // For now, only show for Pitch & Scale
          setShowClaim(true);
        }
      } catch (error) {
        console.error('Error checking badge status:', error);
      }
    };

    checkBadgeStatus();
  }, [phaseId, address, isConnected, hasBadge]);

  const handleClaimBadge = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet to claim badges');
      return;
    }

    const badgeInfo = badgeTriggers[phaseId];
    if (!badgeInfo) {
      toast.error('No badge available for this phase');
      return;
    }

    setClaiming(true);
    
    try {
      // Get badge type info
      const badgeType = await getBadgeType(badgeInfo.badgeTypeId);
      if (!badgeType) {
        throw new Error('Badge type not found');
      }

      // Mint the badge
      const txHash = await mintBadge(badgeInfo.badgeTypeId);
      
      // Save badge info to backend or local storage
      await badgeService.createBadge({
        user: user?.id || 'anonymous',
        wallet_address: address,
        badge_type: badgeInfo.badgeTypeId,
        badge_name: badgeType.name,
        badge_description: badgeType.description,
        transaction_hash: txHash,
        status: 'minted',
        phase_completed: phaseId
      });

      setHasClaimed(true);
      setShowClaim(false);
      
      toast.success(`🎉 ${badgeType.name} badge claimed successfully!`);
      
    } catch (error) {
      console.error('Error claiming badge:', error);
      toast.error('Failed to claim badge: ' + error.message);
    } finally {
      setClaiming(false);
    }
  };

  if (contractLoading) {
    return <div className="achievement-loading">Loading badge status...</div>;
  }

  if (hasClaimed) {
    return (
      <div className="achievement-claimed">
        <div className="achievement-badge">
          <span className="badge-icon">🏆</span>
          <div className="badge-info">
            <h4>Achievement Unlocked!</h4>
            <p>You've earned the {badgeTriggers[phaseId]?.name || 'Achievement'} badge</p>
          </div>
        </div>
      </div>
    );
  }

  if (!showClaim || !badgeTriggers[phaseId]) {
    return null;
  }

  return (
    <div className="achievement-claim-container">
      <div className="achievement-claim-card">
        <div className="achievement-header">
          <span className="achievement-icon">🎯</span>
          <h3>Achievement Unlocked!</h3>
        </div>
        
        <div className="achievement-content">
          <p>Congratulations! You've completed the <strong>{phaseName}</strong> phase.</p>
          <p>Claim your <strong>{badgeTriggers[phaseId].name}</strong> NFT badge to commemorate this achievement!</p>
        </div>
        
        <div className="achievement-actions">
          <button 
            className="claim-button"
            onClick={handleClaimBadge}
            disabled={claiming || !isConnected}
          >
            {claiming ? 'Claiming...' : 'Claim NFT Badge'}
          </button>
          
          {!isConnected && (
            <p className="wallet-notice">
              Connect your wallet to claim this badge
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementClaim; 
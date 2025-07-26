import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Target, Users, TrendingUp, Award, Gift, PartyPopper, X } from 'lucide-react';

const MilestoneCelebrations = ({ userProgress, userStats, phases, onClose }) => {
  const [celebrations, setCelebrations] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentCelebration, setCurrentCelebration] = useState(null);

  useEffect(() => {
    checkMilestones();
  }, [userProgress, userStats, phases]);

  const checkMilestones = () => {
    const newCelebrations = [];
    const totalTasks = phases.reduce((sum, phase) => sum + phase.completedTasks.length, 0);
    const completedPhases = phases.filter(phase => phase.status === 'completed').length;
    const { userLevel, userXP } = userProgress;

    // Level milestones
    if (userLevel >= 5 && !celebrations.some(c => c.id === 'level-5')) {
      newCelebrations.push({
        id: 'level-5',
        type: 'level',
        title: 'Level 5 Reached! 🎉',
        message: 'You\'re becoming a seasoned entrepreneur!',
        icon: '⭐',
        reward: 'Unlocked new power-ups!',
        animation: 'level-up'
      });
    }

    if (userLevel >= 10 && !celebrations.some(c => c.id === 'level-10')) {
      newCelebrations.push({
        id: 'level-10',
        type: 'level',
        title: 'Master Entrepreneur! 👑',
        message: 'You\'ve reached the pinnacle of startup mastery!',
        icon: '👑',
        reward: 'All features unlocked!',
        animation: 'crown'
      });
    }

    // Task milestones
    if (totalTasks >= 10 && !celebrations.some(c => c.id === 'tasks-10')) {
      newCelebrations.push({
        id: 'tasks-10',
        type: 'task',
        title: 'Task Master! ⚡',
        message: 'You\'ve completed 10 tasks!',
        icon: '⚡',
        reward: '+100 XP Bonus!',
        animation: 'lightning'
      });
    }

    if (totalTasks >= 25 && !celebrations.some(c => c.id === 'tasks-25')) {
      newCelebrations.push({
        id: 'tasks-25',
        type: 'task',
        title: 'Task Champion! 🏆',
        message: '25 tasks completed! You\'re unstoppable!',
        icon: '🏆',
        reward: '+250 XP Bonus!',
        animation: 'trophy'
      });
    }

    // Phase milestones
    if (completedPhases >= 3 && !celebrations.some(c => c.id === 'phases-3')) {
      newCelebrations.push({
        id: 'phases-3',
        type: 'phase',
        title: 'Phase Pioneer! 🚀',
        message: 'You\'ve completed 3 phases!',
        icon: '🚀',
        reward: 'Special badge unlocked!',
        animation: 'rocket'
      });
    }

    if (completedPhases >= 7 && !celebrations.some(c => c.id === 'phases-all')) {
      newCelebrations.push({
        id: 'phases-all',
        type: 'phase',
        title: 'Startup Champion! 🏅',
        message: 'All phases completed! You\'re a true startup champion!',
        icon: '🏅',
        reward: 'Legendary status achieved!',
        animation: 'champion'
      });
    }

    // XP milestones
    if (userXP >= 500 && !celebrations.some(c => c.id === 'xp-500')) {
      newCelebrations.push({
        id: 'xp-500',
        type: 'xp',
        title: 'XP Collector! 💎',
        message: 'You\'ve earned 500 XP!',
        icon: '💎',
        reward: 'Rare power-up unlocked!',
        animation: 'gem'
      });
    }

    if (userXP >= 1000 && !celebrations.some(c => c.id === 'xp-1000')) {
      newCelebrations.push({
        id: 'xp-1000',
        type: 'xp',
        title: 'XP Master! 🌟',
        message: '1000 XP achieved! You\'re legendary!',
        icon: '🌟',
        reward: 'All achievements unlocked!',
        animation: 'star'
      });
    }

    // Social milestones
    if (userStats.ideasShared >= 5 && !celebrations.some(c => c.id === 'ideas-5')) {
      newCelebrations.push({
        id: 'ideas-5',
        type: 'social',
        title: 'Community Contributor! 🦋',
        message: 'You\'ve shared 5 ideas with the community!',
        icon: '🦋',
        reward: 'Social butterfly badge!',
        animation: 'butterfly'
      });
    }

    if (userStats.upvotesGiven >= 20 && !celebrations.some(c => c.id === 'upvotes-20')) {
      newCelebrations.push({
        id: 'upvotes-20',
        type: 'social',
        title: 'Supportive Member! 🤝',
        message: 'You\'ve given 20 upvotes! You\'re a great community member!',
        icon: '🤝',
        reward: 'Community helper badge!',
        animation: 'handshake'
      });
    }

    // Add new celebrations to the list
    if (newCelebrations.length > 0) {
      setCelebrations(prev => [...prev, ...newCelebrations]);
      showNextCelebration(newCelebrations[0]);
    }
  };

  const showNextCelebration = (celebration) => {
    setCurrentCelebration(celebration);
    setShowCelebration(true);
  };

  const handleClose = () => {
    setShowCelebration(false);
    setCurrentCelebration(null);
    if (onClose) onClose();
  };

  const handleNext = () => {
    const currentIndex = celebrations.findIndex(c => c.id === currentCelebration.id);
    const nextCelebration = celebrations[currentIndex + 1];
    
    if (nextCelebration) {
      showNextCelebration(nextCelebration);
    } else {
      handleClose();
    }
  };

  if (!showCelebration || !currentCelebration) return null;

  return (
    <div className="milestone-celebration-overlay">
      <div className="milestone-celebration-modal">
        {/* Close Button */}
        <button className="milestone-close-btn" onClick={handleClose}>
          <X size={20} />
        </button>
        
        <div className={`celebration-content ${currentCelebration.animation}`}>
          <div className="celebration-header">
            <div className="celebration-icon">
              <span className="celebration-emoji">{currentCelebration.icon}</span>
            </div>
            <h2 className="celebration-title">{currentCelebration.title}</h2>
          </div>
          
          <div className="celebration-body">
            <p className="celebration-message">{currentCelebration.message}</p>
            <div className="celebration-reward">
              <Gift className="reward-icon" />
              <span>{currentCelebration.reward}</span>
            </div>
          </div>

          <div className="celebration-actions">
            {celebrations.length > 1 && celebrations.findIndex(c => c.id === currentCelebration.id) < celebrations.length - 1 ? (
              <button className="btn-celebration-next" onClick={handleNext}>
                Next Celebration
              </button>
            ) : (
              <button className="btn-celebration-close" onClick={handleClose}>
                Awesome!
              </button>
            )}
          </div>
        </div>

        {/* Confetti Animation */}
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MilestoneCelebrations; 
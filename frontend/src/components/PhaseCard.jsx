import { CheckCircle, Lock, Play, Star, Target, Zap } from "lucide-react";

const PhaseCard = ({ title, description, status, progress, xpReward, onComplete, canMarkComplete, isCurrent, isPrevious }) => {
  const getCardClass = () => {
    switch (status) {
      case 'locked':
        return 'phase-card phase-card-locked';
      case 'completed':
        return 'phase-card phase-card-completed';
      default:
        return 'phase-card phase-card-unlocked';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'locked':
        return <Lock className="phase-icon-muted" />;
      case 'completed':
        return <CheckCircle className="phase-icon-completed" />;
      default:
        return <Play className="phase-icon-active" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'locked':
        return <span className="status-badge locked">Locked</span>;
      case 'completed':
        return <span className="status-badge completed">Completed</span>;
      default:
        return <span className="status-badge active">Active</span>;
    }
  };

  return (
    <div className={getCardClass()}>
      {/* Header Section */}
      <div className="phase-card-header">
        <div className="phase-header-left">
          <div className="phase-icon-wrapper">
            {getIcon()}
            <div className="phase-icon-glow"></div>
          </div>
          <div className="phase-content">
            <div className="phase-title-row">
              <h3 className="phase-title">{title}</h3>
              {getStatusBadge()}
            </div>
            <p className="phase-description">{description}</p>
          </div>
        </div>
        <div className="phase-rewards">
          <div className="xp-reward-badge">
            <Star size={16} className="xp-icon" />
            <span className="xp-amount">{xpReward}</span>
            <span className="xp-label">XP</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {status !== 'locked' && (
        <div className="phase-progress-section">
          <div className="progress-header">
            <div className="progress-info">
              <Target size={16} className="progress-icon" />
              <span className="progress-label">Progress</span>
              <span className="progress-percentage">{progress}%</span>
            </div>
            <div className="progress-visual">
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="progress-glow"></div>
                  </div>
                </div>
                <div className="progress-marker" style={{ left: `${progress}%` }}>
                  <Zap size={12} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {status === 'unlocked' && (
            <div className="phase-actions">
              <button 
                onClick={onComplete}
                className="btn-complete"
                disabled={!canMarkComplete}
              >
                <CheckCircle size={18} />
                <span>Mark Complete</span>
                {canMarkComplete && <div className="btn-glow"></div>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Visual Enhancements */}
      <div className="phase-card-decoration">
        <div className="corner-accent top-left"></div>
        <div className="corner-accent top-right"></div>
        <div className="corner-accent bottom-left"></div>
        <div className="corner-accent bottom-right"></div>
      </div>
    </div>
  );
};

export default PhaseCard;

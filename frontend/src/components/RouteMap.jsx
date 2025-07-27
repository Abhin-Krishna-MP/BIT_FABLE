import { useState } from "react";
import { CheckCircle, Lock, Play, Star, ArrowRight, Sparkles, Target } from "lucide-react";
import PhaseCard from "./PhaseCard";

const RouteMap = ({ phases, onPhaseComplete, onPhaseClick }) => {
  const [hoveredPhase, setHoveredPhase] = useState(null);

  // Find the current phase (first unlocked and not completed)
  const currentPhaseIndex = phases.findIndex(p => p.status === 'unlocked');
  
  // Helper functions
  const isPhaseLocked = (idx) => idx > currentPhaseIndex;
  const isPhaseCurrent = (idx) => idx === currentPhaseIndex;
  const isPhasePrevious = (idx) => idx < currentPhaseIndex;
  const isPhaseCompleted = (idx) => phases[idx].status === 'completed';

  const getPhaseStatus = (idx) => {
    if (isPhaseLocked(idx)) return 'locked';
    if (isPhaseCompleted(idx)) return 'completed';
    if (isPhaseCurrent(idx)) return 'unlocked';
    return 'completed'; // previous phases are completed
  };

  const getConnectionClass = (idx) => {
    if (idx === 0) return 'no-connection';
    if (isPhaseCompleted(idx - 1)) return 'connection-completed';
    if (isPhaseCurrent(idx - 1)) return 'connection-current';
    return 'connection-locked';
  };

  return (
    <div className="route-map-container">
      <div className="route-map-header">
        <h2>Your Startup Journey</h2>
        <p>Complete phases to unlock new challenges and earn XP</p>
      </div>

      <div className="route-map">
        {phases.map((phase, idx) => (
          <div key={phase.id} className="route-node-container">
            {/* Connection line to previous phase */}
            {idx > 0 && (
              <div className={`connection-line ${getConnectionClass(idx)}`}>
                <div className="connection-fill"></div>
                {isPhaseCompleted(idx - 1) && (
                  <div className="connection-sparkle">
                    <Sparkles size={12} />
                  </div>
                )}
              </div>
            )}

            {/* Phase Node */}
            <div 
              className={`route-node ${getPhaseStatus(idx)} ${isPhaseCurrent(idx) ? 'current' : ''}`}
              onMouseEnter={() => setHoveredPhase(idx)}
              onMouseLeave={() => setHoveredPhase(null)}
              onClick={() => {
                if (getPhaseStatus(idx) !== 'locked' && onPhaseClick) {
                  onPhaseClick(phase);
                }
              }}
            >
              {/* Phase Number Badge */}
              <div className="phase-number-badge">
                {idx + 1}
              </div>

              {/* Phase Icon */}
              <div className="phase-icon-container">
                {getPhaseStatus(idx) === 'locked' && <Lock className="phase-icon" />}
                {getPhaseStatus(idx) === 'completed' && <CheckCircle className="phase-icon completed" />}
                {getPhaseStatus(idx) === 'unlocked' && <Play className="phase-icon unlocked" />}
              </div>

              {/* XP Reward */}
              <div className="phase-xp-badge">
                <Star size={12} />
                <span>{phase.xpReward}</span>
              </div>

              {/* Progress Ring */}
              <div className="progress-ring">
                <svg className="progress-ring-svg" width="60" height="60">
                  <circle
                    className="progress-ring-background"
                    stroke="var(--muted)"
                    strokeWidth="4"
                    fill="transparent"
                    r="26"
                    cx="30"
                    cy="30"
                  />
                  <circle
                    className="progress-ring-fill"
                    stroke="var(--primary)"
                    strokeWidth="4"
                    fill="transparent"
                    r="26"
                    cx="30"
                    cy="30"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - phase.progress / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Hover Tooltip */}
              {hoveredPhase === idx && (
                <div className="phase-tooltip">
                  <h4>{phase.title}</h4>
                  <p>{phase.description}</p>
                  <div className="tooltip-progress">
                    <span>Progress: {phase.progress}%</span>
                  </div>
                  {getPhaseStatus(idx) === 'unlocked' && (
                    <button 
                      className="tooltip-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onPhaseClick) onPhaseClick(phase);
                      }}
                    >
                      <Target size={14} />
                      Start Phase
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Phase Info Card (shown on larger screens) */}
            <div className="phase-info-card">
              <h4 className="phase-title">{phase.title}</h4>
              <p className="phase-description">{phase.description}</p>
              <div className="phase-stats">
                <span className="phase-tasks">{phase.tasks?.length || 0} tasks</span>
                <span className="phase-progress">{phase.progress}% complete</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Journey Progress Indicator */}
      <div className="journey-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
                          style={{ width: `${(phases?.filter(p => p.status === 'completed').length || 0) / (phases?.length || 1) * 100}%` }}
          ></div>
        </div>
        <div className="progress-stats">
                      <span>{phases?.filter(p => p.status === 'completed').length || 0} of {phases?.length || 0} phases completed</span>
        </div>
      </div>
    </div>
  );
};

export default RouteMap; 
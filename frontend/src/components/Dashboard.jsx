import { useState } from "react";
import XPBar from "./XPBar";
import PhaseCard from "./PhaseCard";
import RPGCharacter from "./RPGCharacter";
import { Sparkles, Target, Zap } from "lucide-react";

const Dashboard = ({ userLevel, userXP, maxXP, phases, onPhaseComplete }) => {
  const [celebratePhase, setCelebratePhase] = useState(null);

  const handlePhaseComplete = (phaseId) => {
    onPhaseComplete(phaseId);
    setCelebratePhase(phaseId);
    setTimeout(() => setCelebratePhase(null), 3000);
  };

  const completedCount = phases.filter(p => p.status === 'completed').length;
  const unlockedCount = phases.filter(p => p.status === 'unlocked').length;

  // Find the current phase (first unlocked and not completed)
  const currentPhaseIndex = phases.findIndex(p => p.status === 'unlocked');

  // Helper to determine if a phase is lockable
  const isPhaseLocked = (idx) => idx > currentPhaseIndex;
  const isPhaseCurrent = (idx) => idx === currentPhaseIndex;
  const isPhasePrevious = (idx) => idx < currentPhaseIndex;

  // Helper to determine if all tasks are complete for a phase (simulate for now)
  // In a real app, you would pass this info from parent or global state
  const arePhaseTasksComplete = (phase) => phase.progress === 100;

  return (
    <div className="dashboard-container">
      {/* Celebration Animation */}
      {celebratePhase && (
        <div className="celebration-overlay">
          <div className="celebration-box">
            <div className="celebration-text">
              <Sparkles className="icon" />
              Phase Completed! +{phases.find(p => p.id === celebratePhase)?.xpReward} XP
              <Sparkles className="icon" />
            </div>
          </div>
        </div>
      )}

      {/* RPG Character */}
      <RPGCharacter 
        userLevel={userLevel} 
        userXP={userXP}
        onColorChange={(colors) => {
          // Save character colors to localStorage
          localStorage.setItem('rpgCharacterColors', JSON.stringify(colors));
        }}
      />

      {/* XP Bar */}
      <XPBar currentXP={userXP} maxXP={maxXP} level={userLevel} />

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <Target className="icon" />
          <h3 className="stat-value">{completedCount}</h3>
          <p className="stat-label">Phases Completed</p>
        </div>
        <div className="stat-card">
          <Zap className="icon" />
          <h3 className="stat-value">{unlockedCount}</h3>
          <p className="stat-label">Active Phases</p>
        </div>
        <div className="stat-card">
          <Sparkles className="icon" />
          <h3 className="stat-value">{userXP}</h3>
          <p className="stat-label">Total XP</p>
        </div>
      </div>

      {/* Startup Journey Header */}
      <div className="journey-header">
        <h1>Your Startup Journey</h1>
        <p>Complete phases to unlock new challenges and earn XP</p>
      </div>

      {/* Phase Cards */}
      <div className="phases-grid">
        {phases.map((phase, idx) => (
          <PhaseCard
            key={phase.id}
            title={phase.title}
            description={phase.description}
            status={isPhaseLocked(idx) ? 'locked' : phase.status}
            progress={phase.progress}
            xpReward={phase.xpReward}
            onComplete={() => {
              if (isPhaseCurrent(idx) && arePhaseTasksComplete(phase)) {
                handlePhaseComplete(phase.id);
              }
            }}
            canMarkComplete={isPhaseCurrent(idx) && arePhaseTasksComplete(phase)}
            isCurrent={isPhaseCurrent(idx)}
            isPrevious={isPhasePrevious(idx)}
          />
        ))}
      </div>

      {/* Motivational Section */}
      <div className="motivation-box">
        <h2>Ready to Build Something Amazing?</h2>
        <p>
          Every successful startup begins with a single step. Choose your next phase and
          continue your entrepreneurial journey.
        </p>
        <div className="btn-row">
          <button className="btn-quest">Start Next Phase</button>
          <button className="btn-outline">View All Phases</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState } from "react";
import XPBar from "./XPBar";
import RouteMap from "./RouteMap";
import RPGCharacter from "./RPGCharacter";
import { Sparkles, Target, Zap } from "lucide-react";

const Dashboard = ({ userLevel, userXP, maxXP, phases, onPhaseComplete, onPhaseClick }) => {
  const [celebratePhase, setCelebratePhase] = useState(null);

  const handlePhaseComplete = (phaseId) => {
    onPhaseComplete(phaseId);
    setCelebratePhase(phaseId);
    setTimeout(() => setCelebratePhase(null), 3000);
  };

  const handlePhaseClick = (phase) => {
    if (onPhaseClick) {
      onPhaseClick(phase);
    }
  };

  const completedCount = phases?.filter(p => p.status === 'completed').length || 0;
  const unlockedCount = phases?.filter(p => p.status === 'unlocked').length || 0;

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

      {/* Route Map */}
      <RouteMap 
        phases={phases}
        onPhaseComplete={handlePhaseComplete}
        onPhaseClick={handlePhaseClick}
      />

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

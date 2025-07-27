// Navigation.jsx
import { Home, Target, Rocket, DollarSign, MessageSquare, User as UserIcon, Compass, Bot, TrendingUp, Users, Clock, Lock, Trophy, Zap, Calendar, Crown, LogOut, Vote } from "lucide-react";

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'voting', label: 'Voting', icon: Vote },
  { id: 'ideation', label: 'Ideation', icon: Clock },
  { id: 'validation', label: 'Validation', icon: Target },
  { id: 'mvp', label: 'MVP', icon: Rocket },
  { id: 'launch', label: 'Launch', icon: TrendingUp },
  { id: 'feedback', label: 'Feedback & Iterate', icon: MessageSquare },
  { id: 'monetization', label: 'Monetization', icon: DollarSign },
  { id: 'scale', label: 'Pitch & Scale', icon: Users },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'daily', label: 'Daily', icon: Calendar },
  { id: 'powerups', label: 'Power-ups', icon: Zap },
  { id: 'leaderboard', label: 'Leaderboard', icon: Crown },
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'explore', label: 'Explore', icon: Compass }
];

const phaseTabIds = ['ideation', 'validation', 'mvp', 'launch', 'feedback', 'monetization', 'scale'];

const Navigation = ({ activeTab, onTabChange, phases = [], currentPhaseIndex = 0, userLevel, userXP, onLogout }) => {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <div className="nav-logo">
          <span className="logo-icon">🚀</span>
          <h2>StartupQuest</h2>
        </div>
        <div className="nav-user-info">
          <div className="user-level">
            <span className="level-badge">Level {userLevel}</span>
          </div>
          <div className="user-xp">
            <span className="xp-badge">⭐ {userXP} XP</span>
          </div>
        </div>
      </div>

      <div className="nav-items">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isPhaseTab = phaseTabIds.includes(id);
          let isLocked = false;
          if (isPhaseTab) {
            const idx = phaseTabIds.indexOf(id);
            isLocked = idx > currentPhaseIndex;
          }
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => {
                if (!isLocked) onTabChange(id);
              }}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              disabled={isLocked}
              style={isLocked ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{label}</span>
              {isLocked && <Lock className="nav-lock-icon" size={14} style={{ marginLeft: 4 }} />}
            </button>
          );
        })}
      </div>

      <div className="nav-footer">
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;

import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Dashboard from "../components/Dashboard";
import PhaseContent from "../components/PhaseContent";
import Profile from "../components/Profile";
import FriendsCollabChat from "../components/FriendsCollabChat";
import Explore from "../components/Explore";
import Chatbot from "../components/Chatbot";
import Achievements from "../components/Achievements";
import DailyChallenges from "../components/DailyChallenges";
import PowerUps from "../components/PowerUps";
import Leaderboard from "../components/Leaderboard";
import MilestoneCelebrations from "../components/MilestoneCelebrations";
import { mockPhases, mockBadges, mockUser, mockFriends } from "../mockData";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userProgress, setUserProgress] = useState(() => {
    const saved = localStorage.getItem("startupQuestUserProgress");
    return saved ? JSON.parse(saved) : { userLevel: 1, userXP: 0, maxXP: 112 };
  });
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Load from localStorage or mockData
  const [phases, setPhases] = useState(() => {
    const saved = localStorage.getItem("startupQuestPhases");
    return saved ? JSON.parse(saved) : mockPhases;
  });
  const [badges, setBadges] = useState(() => {
    const saved = localStorage.getItem("startupQuestBadges");
    return saved ? JSON.parse(saved) : mockBadges;
  });
  const [userStats, setUserStats] = useState(() => {
    const saved = localStorage.getItem("startupQuestUser");
    return saved ? JSON.parse(saved) : mockUser;
  });

  // Handle username update
  const handleUsernameUpdate = (newUsername) => {
    setUserStats(prev => ({
      ...prev,
      username: newUsername
    }));
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("startupQuestPhases", JSON.stringify(phases));
  }, [phases]);
  useEffect(() => {
    localStorage.setItem("startupQuestBadges", JSON.stringify(badges));
  }, [badges]);
  useEffect(() => {
    localStorage.setItem("startupQuestUser", JSON.stringify(userStats));
  }, [userStats]);
  useEffect(() => {
    localStorage.setItem("startupQuestUserProgress", JSON.stringify(userProgress));
  }, [userProgress]);

  // Handle marking a task as complete for a phase
  const handleTaskComplete = (phaseId, taskIdx) => {
    setPhases(prevPhases => {
      let awardedXP = 0;
      const newPhases = prevPhases.map(phase => {
        if (phase.id !== phaseId) return phase;
        const alreadyCompleted = phase.completedTasks.includes(taskIdx);
        const completedTasks = alreadyCompleted
          ? phase.completedTasks
          : [...phase.completedTasks, taskIdx];
        const progress = Math.round((completedTasks.length / phase.tasks.length) * 100);
        // Only award XP if not already completed
        if (!alreadyCompleted && phase.tasks[taskIdx]) {
          awardedXP = phase.tasks[taskIdx].xpReward || 0;
        }
        return { ...phase, completedTasks, progress };
      });
      // Award XP after updating phase state
      if (awardedXP > 0) {
        setUserProgress(prev => {
          let { userXP, userLevel, maxXP } = prev;
          let totalXP = userXP + awardedXP;
          let newLevel = userLevel;
          let newMaxXP = maxXP;
          while (totalXP >= newMaxXP && newLevel < 10) {
            totalXP -= newMaxXP;
            newLevel += 1;
            newMaxXP += 200;
          }
          return { userXP: totalXP, userLevel: newLevel, maxXP: newMaxXP };
        });
      }
      return newPhases;
    });
  };

  // Handle marking a phase as complete
  const handlePhaseComplete = (phaseId) => {
    setPhases(prevPhases => {
      let awardedXP = 0;
      let completedPhaseTitle = null;
      const idx = prevPhases.findIndex(p => p.id === phaseId);
      const newPhases = prevPhases.map((phase, i) => {
        if (phase.id === phaseId) {
          awardedXP = phase.xpReward || 0;
          completedPhaseTitle = phase.title;
          return { ...phase, status: "completed", progress: 100 };
        }
        // Unlock the next phase (only one phase at a time)
        if (i === idx + 1 && phase.status === "locked") {
          return { ...phase, status: "unlocked" };
        }
        return phase;
      });
      // Award XP after updating phase state
      if (awardedXP > 0) {
        setUserProgress(prev => {
          let { userXP, userLevel, maxXP } = prev;
          let totalXP = userXP + awardedXP;
          let newLevel = userLevel;
          let newMaxXP = maxXP;
          while (totalXP >= newMaxXP && newLevel < 10) {
            totalXP -= newMaxXP;
            newLevel += 1;
            newMaxXP += 200;
          }
          return { userXP: totalXP, userLevel: newLevel, maxXP: newMaxXP };
        });
      }
      // Update userStats and badges
      if (completedPhaseTitle) {
        setUserStats(prev => ({
          ...prev,
          completedPhases: [...prev.completedPhases.filter(id => id !== phaseId), completedPhaseTitle]
        }));
        setBadges(prevBadges => prevBadges.map(badge => {
          if (badge.id === "first-steps" && userStats.completedPhases.length === 0) return { ...badge, earned: true };
          if (badge.id === "validator" && phaseId === "validation") return { ...badge, earned: true };
          if (badge.id === "builder" && phaseId === "mvp") return { ...badge, earned: true };
          return badge;
        }));
      }
      return newPhases;
    });
  };

  const handleUpvote = (ideaId) => {
    setUserStats(prev => {
      const newUpvotes = prev.upvotesGiven + 1;
      if (newUpvotes >= 10) {
        setBadges(prevBadges => prevBadges.map(b => b.id === "supporter" ? { ...b, earned: true } : b));
      }
      return { ...prev, upvotesGiven: newUpvotes };
    });
  };

  // Handle daily challenge completion
  const handleDailyChallengeComplete = (xpReward) => {
    setUserProgress(prev => {
      let { userXP, userLevel, maxXP } = prev;
      let totalXP = userXP + xpReward;
      let newLevel = userLevel;
      let newMaxXP = maxXP;
      while (totalXP >= newMaxXP && newLevel < 10) {
        totalXP -= newMaxXP;
        newLevel += 1;
        newMaxXP += 200;
      }
      return { userXP: totalXP, userLevel: newLevel, maxXP: newMaxXP };
    });
  };

  // Handle power-up activation
  const handlePowerUpActivation = (xpChange) => {
    setUserProgress(prev => {
      let { userXP, userLevel, maxXP } = prev;
      let totalXP = userXP + xpChange;
      let newLevel = userLevel;
      let newMaxXP = maxXP;
      
      // Handle level changes
      while (totalXP >= newMaxXP && newLevel < 10) {
        totalXP -= newMaxXP;
        newLevel += 1;
        newMaxXP += 200;
      }
      
      // Ensure XP doesn't go negative
      if (totalXP < 0) totalXP = 0;
      
      return { userXP: totalXP, userLevel: newLevel, maxXP: newMaxXP };
    });
  };

  const renderTabContent = () => {
    const { userLevel, userXP, maxXP } = userProgress;
    switch (activeTab) {
      case "dashboard":
        return <Dashboard
          userLevel={userLevel}
          userXP={userXP}
          maxXP={maxXP}
          phases={phases}
          onPhaseComplete={handlePhaseComplete}
        />;
      case "ideation":
      case "validation":
      case "mvp":
      case "launch":
      case "monetization":
      case "feedback":
      case "scale": {
        // Always get the latest phase object from phases state
        const currentPhase = phases.find(p => p.id === activeTab);
        if (!currentPhase) return null;
        return <PhaseContent phase={activeTab} phaseData={currentPhase} onMarkPhaseComplete={handlePhaseComplete} onTaskComplete={handleTaskComplete} />;
      }
      case "achievements":
        return <Achievements 
          userProgress={userProgress}
          userStats={userStats}
          phases={phases}
          badges={badges}
        />;
      case "daily":
        return <DailyChallenges 
          userProgress={userProgress}
          userStats={userStats}
          phases={phases}
          onCompleteChallenge={handleDailyChallengeComplete}
        />;
      case "powerups":
        return <PowerUps 
          userProgress={userProgress}
          onActivatePowerUp={handlePowerUpActivation}
        />;
      case "leaderboard":
        return <Leaderboard 
          userProgress={userProgress}
          userStats={userStats}
          phases={phases}
        />;
      case "profile":
        return <Profile
          {...userStats}
          level={userLevel}
          xp={userXP}
          maxXP={maxXP}
          badges={badges}
          onUsernameUpdate={handleUsernameUpdate}
        />;
      case "friends":
        return <FriendsCollabChat user={userStats} friends={mockFriends} />;
      case "chatbot":
        // The tab is for legacy, but the floating button is the main entry point
        return null;
      case "explore":
        return <Explore onUpvote={handleUpvote} />;
      default:
        return (
          <div className="tab-box">
            <h1>Coming Soon</h1>
            <p>This section is under development.</p>
          </div>
        );
    }
  };

  // Find the current phase (first unlocked)
  const currentPhaseIndex = phases.findIndex(p => p.status === 'unlocked');

  return (
    <div className="app">
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        phases={phases}
        currentPhaseIndex={currentPhaseIndex}
      />
      <main>{renderTabContent()}</main>
      {/* FriendsCollabChat is rendered as a tab, not a floating button */}
      {/* Floating Chatbot button and modal */}
      <Chatbot isOpen={isChatbotOpen} onToggle={() => setIsChatbotOpen(open => !open)} />
      
      {/* Milestone Celebrations */}
      <MilestoneCelebrations 
        userProgress={userProgress}
        userStats={userStats}
        phases={phases}
      />
    </div>
  );
};

export default Index;
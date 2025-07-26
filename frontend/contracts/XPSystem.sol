// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract XPSystem {
    struct User {
        string username;
        uint256 xp;
        uint256 level;
        uint256 achievements;
        uint256 dailyStreak;
        uint256 lastDailyCheck;
        uint256 powerUpsUsed;
        uint256 totalTasksCompleted;
        uint256 totalPhasesCompleted;
        uint256 ideasShared;
        uint256 upvotesGiven;
    }

    mapping(address => User) public users;
    mapping(address => mapping(uint256 => bool)) public achievements;
    mapping(address => mapping(uint256 => uint256)) public dailyChallenges;
    mapping(address => mapping(uint256 => uint256)) public powerUps;
    mapping(uint256 => uint256) public leaderboard;

    event UserRegistered(address indexed user, string username);
    event XPUpdated(address indexed user, uint256 oldXP, uint256 newXP, uint256 oldLevel, uint256 newLevel);
    event LevelUp(address indexed user, uint256 newLevel);
    event AchievementUnlocked(address indexed user, uint256 achievementId);
    event DailyChallengeCompleted(address indexed user, uint256 challengeId, uint256 xpReward);
    event PowerUpActivated(address indexed user, uint256 powerUpId);
    event TaskCompleted(address indexed user, uint256 taskId, uint256 xpReward);
    event PhaseCompleted(address indexed user, uint256 phaseId, uint256 xpReward);

    // Achievement IDs
    uint256 public constant ACHIEVEMENT_FIRST_TASK = 1;
    uint256 public constant ACHIEVEMENT_TASK_MASTER = 2;
    uint256 public constant ACHIEVEMENT_PHASE_COMPLETER = 3;
    uint256 public constant ACHIEVEMENT_LEVEL_5 = 4;
    uint256 public constant ACHIEVEMENT_LEVEL_10 = 5;
    uint256 public constant ACHIEVEMENT_ALL_PHASES = 6;
    uint256 public constant ACHIEVEMENT_SOCIAL_BUTTERFLY = 7;
    uint256 public constant ACHIEVEMENT_HELPER = 8;

    // Power-up IDs
    uint256 public constant POWERUP_XP_BOOST = 1;
    uint256 public constant POWERUP_AUTO_COMPLETE = 2;
    uint256 public constant POWERUP_PHASE_UNLOCK = 3;
    uint256 public constant POWERUP_STREAK_PROTECT = 4;
    uint256 public constant POWERUP_LUCKY_DRAW = 5;
    uint256 public constant POWERUP_TEAM_BOOST = 6;

    function setUser(string calldata _username) external {
        require(bytes(_username).length > 0, "Username cannot be empty");
        
        User storage user = users[msg.sender];
        bool isNewUser = bytes(user.username).length == 0;
        
        user.username = _username;
        
        if (isNewUser) {
            user.xp = 0;
            user.level = 1;
            user.achievements = 0;
            user.dailyStreak = 0;
            user.lastDailyCheck = 0;
            user.powerUpsUsed = 0;
            user.totalTasksCompleted = 0;
            user.totalPhasesCompleted = 0;
            user.ideasShared = 0;
            user.upvotesGiven = 0;
        }
        
        emit UserRegistered(msg.sender, _username);
    }

    function updateXP(uint256 _xpAmount) internal {
        require(bytes(users[msg.sender].username).length > 0, "User not registered");
        
        User storage user = users[msg.sender];
        uint256 oldXP = user.xp;
        uint256 oldLevel = user.level;
        
        user.xp += _xpAmount;
        
        // Auto-level up (100 XP per level, max level 10)
        uint256 newLevel = user.level;
        uint256 maxXP = 112 + (user.level - 1) * 200;
        
        while (user.xp >= maxXP && newLevel < 10) {
            user.xp -= maxXP;
            newLevel++;
            maxXP += 200;
        }
        
        if (newLevel > user.level) {
            user.level = newLevel;
            emit LevelUp(msg.sender, newLevel);
        }
        
        emit XPUpdated(msg.sender, oldXP, user.xp, oldLevel, user.level);
    }

    function updateXPExternal(uint256 _xpAmount) external {
        updateXP(_xpAmount);
    }

    function completeTask(uint256 _taskId, uint256 _xpReward) external {
        require(bytes(users[msg.sender].username).length > 0, "User not registered");
        
        User storage user = users[msg.sender];
        user.totalTasksCompleted++;
        
        // Check for task-related achievements
        if (user.totalTasksCompleted == 1 && !achievements[msg.sender][ACHIEVEMENT_FIRST_TASK]) {
            unlockAchievement(ACHIEVEMENT_FIRST_TASK);
        }
        
        if (user.totalTasksCompleted >= 10 && !achievements[msg.sender][ACHIEVEMENT_TASK_MASTER]) {
            unlockAchievement(ACHIEVEMENT_TASK_MASTER);
        }
        
        updateXP(_xpReward);
        emit TaskCompleted(msg.sender, _taskId, _xpReward);
    }

    function completePhase(uint256 _phaseId, uint256 _xpReward) external {
        require(bytes(users[msg.sender].username).length > 0, "User not registered");
        
        User storage user = users[msg.sender];
        user.totalPhasesCompleted++;
        
        // Check for phase-related achievements
        if (user.totalPhasesCompleted == 1 && !achievements[msg.sender][ACHIEVEMENT_PHASE_COMPLETER]) {
            unlockAchievement(ACHIEVEMENT_PHASE_COMPLETER);
        }
        
        if (user.totalPhasesCompleted >= 7 && !achievements[msg.sender][ACHIEVEMENT_ALL_PHASES]) {
            unlockAchievement(ACHIEVEMENT_ALL_PHASES);
        }
        
        updateXP(_xpReward);
        emit PhaseCompleted(msg.sender, _phaseId, _xpReward);
    }

    function unlockAchievement(uint256 _achievementId) internal {
        require(!achievements[msg.sender][_achievementId], "Achievement already unlocked");
        
        achievements[msg.sender][_achievementId] = true;
        users[msg.sender].achievements++;
        
        emit AchievementUnlocked(msg.sender, _achievementId);
    }

    function completeDailyChallenge(uint256 _challengeId, uint256 _xpReward) external {
        require(bytes(users[msg.sender].username).length > 0, "User not registered");
        
        User storage user = users[msg.sender];
        uint256 today = block.timestamp / 1 days;
        
        // Check if user already completed this challenge today
        require(dailyChallenges[msg.sender][_challengeId] != today, "Challenge already completed today");
        
        dailyChallenges[msg.sender][_challengeId] = today;
        
        // Update streak
        if (user.lastDailyCheck == today - 1 || user.lastDailyCheck == today) {
            user.dailyStreak++;
        } else {
            user.dailyStreak = 1;
        }
        user.lastDailyCheck = today;
        
        updateXP(_xpReward);
        emit DailyChallengeCompleted(msg.sender, _challengeId, _xpReward);
    }

    function activatePowerUp(uint256 _powerUpId, uint256 _cost) external {
        require(bytes(users[msg.sender].username).length > 0, "User not registered");
        require(users[msg.sender].xp >= _cost, "Insufficient XP");
        
        User storage user = users[msg.sender];
        user.powerUpsUsed++;
        user.xp -= _cost;
        
        powerUps[msg.sender][_powerUpId]++;
        
        emit PowerUpActivated(msg.sender, _powerUpId);
    }

    function shareIdea() external {
        require(bytes(users[msg.sender].username).length > 0, "User not registered");
        
        User storage user = users[msg.sender];
        user.ideasShared++;
        
        // Check for social achievements
        if (user.ideasShared >= 5 && !achievements[msg.sender][ACHIEVEMENT_SOCIAL_BUTTERFLY]) {
            unlockAchievement(ACHIEVEMENT_SOCIAL_BUTTERFLY);
        }
    }

    function giveUpvote() external {
        require(bytes(users[msg.sender].username).length > 0, "User not registered");
        
        User storage user = users[msg.sender];
        user.upvotesGiven++;
        
        // Check for helper achievements
        if (user.upvotesGiven >= 20 && !achievements[msg.sender][ACHIEVEMENT_HELPER]) {
            unlockAchievement(ACHIEVEMENT_HELPER);
        }
    }

    function checkLevelAchievements() external {
        require(bytes(users[msg.sender].username).length > 0, "User not registered");
        
        User storage user = users[msg.sender];
        
        if (user.level >= 5 && !achievements[msg.sender][ACHIEVEMENT_LEVEL_5]) {
            unlockAchievement(ACHIEVEMENT_LEVEL_5);
        }
        
        if (user.level >= 10 && !achievements[msg.sender][ACHIEVEMENT_LEVEL_10]) {
            unlockAchievement(ACHIEVEMENT_LEVEL_10);
        }
    }

    function getUser(address userAddress) public view returns (
        string memory username,
        uint256 xp,
        uint256 level,
        uint256 achievements,
        uint256 dailyStreak,
        uint256 lastDailyCheck,
        uint256 powerUpsUsed,
        uint256 totalTasksCompleted,
        uint256 totalPhasesCompleted,
        uint256 ideasShared,
        uint256 upvotesGiven
    ) {
        User storage userData = users[userAddress];
        return (
            userData.username,
            userData.xp,
            userData.level,
            userData.achievements,
            userData.dailyStreak,
            userData.lastDailyCheck,
            userData.powerUpsUsed,
            userData.totalTasksCompleted,
            userData.totalPhasesCompleted,
            userData.ideasShared,
            userData.upvotesGiven
        );
    }

    function getMyUser() external view returns (
        string memory username,
        uint256 xp,
        uint256 level,
        uint256 achievements,
        uint256 dailyStreak,
        uint256 lastDailyCheck,
        uint256 powerUpsUsed,
        uint256 totalTasksCompleted,
        uint256 totalPhasesCompleted,
        uint256 ideasShared,
        uint256 upvotesGiven
    ) {
        return getUser(msg.sender);
    }

    function isUserRegistered(address user) external view returns (bool) {
        return bytes(users[user].username).length > 0;
    }

    function hasAchievement(address user, uint256 achievementId) external view returns (bool) {
        return achievements[user][achievementId];
    }

    function getDailyChallengeStatus(address user, uint256 challengeId) external view returns (uint256) {
        return dailyChallenges[user][challengeId];
    }

    function getPowerUpCount(address user, uint256 powerUpId) external view returns (uint256) {
        return powerUps[user][powerUpId];
    }

    function getLeaderboardEntry(uint256 rank) external view returns (uint256) {
        return leaderboard[rank];
    }

    function updateLeaderboard(uint256 rank, uint256 xp) external {
        leaderboard[rank] = xp;
    }
} 
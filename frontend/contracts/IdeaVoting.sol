// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./QSTToken.sol";

contract IdeaVoting is Ownable {
    QSTToken public qstToken;
    
    uint256 public constant VOTE_COST = 10 * 10**18; // 10 QST tokens
    uint256 public constant VOTING_PERIOD = 7 days; // 1 week
    
    struct Idea {
        uint256 id;
        address creator;
        string description;
        uint256 timestamp;
        uint256 likeVotes;
        uint256 dislikeVotes;
        uint256 totalLikeTokens;
        uint256 totalDislikeTokens;
        bool isActive;
        bool isResolved;
    }
    
    struct Vote {
        bool hasVoted;
        bool isLike;
        uint256 timestamp;
    }
    
    mapping(uint256 => Idea) public ideas;
    mapping(uint256 => mapping(address => Vote)) public votes; // ideaId => user => vote
    mapping(uint256 => address[]) public likeVoters; // ideaId => array of like voters
    mapping(uint256 => address[]) public dislikeVoters; // ideaId => array of dislike voters
    
    uint256 public nextIdeaId = 1;
    
    event IdeaPublished(uint256 indexed ideaId, address indexed creator, string description);
    event VoteCast(uint256 indexed ideaId, address indexed voter, bool isLike);
    event VotingResolved(uint256 indexed ideaId, bool likesWin, uint256 totalRewards);
    event RewardsDistributed(uint256 indexed ideaId, address indexed voter, uint256 amount);
    
    constructor(address _qstToken) Ownable(msg.sender) {
        qstToken = QSTToken(_qstToken);
    }
    
    /**
     * @dev Publish a new idea
     * @param description The idea description
     */
    function publishIdea(string memory description) public {
        require(bytes(description).length > 0, "Description cannot be empty");
        
        uint256 ideaId = nextIdeaId++;
        
        ideas[ideaId] = Idea({
            id: ideaId,
            creator: msg.sender,
            description: description,
            timestamp: block.timestamp,
            likeVotes: 0,
            dislikeVotes: 0,
            totalLikeTokens: 0,
            totalDislikeTokens: 0,
            isActive: true,
            isResolved: false
        });
        
        emit IdeaPublished(ideaId, msg.sender, description);
    }
    
    /**
     * @dev Vote on an idea (like or dislike)
     * @param ideaId The ID of the idea to vote on
     * @param isLike True for like, false for dislike
     */
    function vote(uint256 ideaId, bool isLike) public {
        require(ideaId > 0 && ideaId < nextIdeaId, "Invalid idea ID");
        require(ideas[ideaId].isActive, "Idea is not active");
        require(!votes[ideaId][msg.sender].hasVoted, "Already voted on this idea");
        
        // Check if voting period is still active
        bool isVotingPeriodActive = block.timestamp < ideas[ideaId].timestamp + VOTING_PERIOD;
        
        if (isVotingPeriodActive) {
            // During voting period, require QST tokens
            require(qstToken.balanceOf(msg.sender) >= VOTE_COST, "Insufficient QST tokens");
            require(qstToken.transferFrom(msg.sender, address(this), VOTE_COST), "Token transfer failed");
            
            // Update idea totals
            if (isLike) {
                ideas[ideaId].likeVotes++;
                ideas[ideaId].totalLikeTokens += VOTE_COST;
                likeVoters[ideaId].push(msg.sender);
            } else {
                ideas[ideaId].dislikeVotes++;
                ideas[ideaId].totalDislikeTokens += VOTE_COST;
                dislikeVoters[ideaId].push(msg.sender);
            }
        } else {
            // After voting period, free voting
            if (isLike) {
                ideas[ideaId].likeVotes++;
            } else {
                ideas[ideaId].dislikeVotes++;
            }
        }
        
        // Record the vote
        votes[ideaId][msg.sender] = Vote({
            hasVoted: true,
            isLike: isLike,
            timestamp: block.timestamp
        });
        
        emit VoteCast(ideaId, msg.sender, isLike);
        
        // Check if voting period just ended and resolve if needed
        if (isVotingPeriodActive && block.timestamp >= ideas[ideaId].timestamp + VOTING_PERIOD) {
            resolveVoting(ideaId);
        }
    }
    
    /**
     * @dev Resolve voting for an idea after the voting period ends
     * @param ideaId The ID of the idea to resolve
     */
    function resolveVoting(uint256 ideaId) public {
        require(ideaId > 0 && ideaId < nextIdeaId, "Invalid idea ID");
        require(ideas[ideaId].isActive, "Idea is not active");
        require(!ideas[ideaId].isResolved, "Voting already resolved");
        require(block.timestamp >= ideas[ideaId].timestamp + VOTING_PERIOD, "Voting period not ended");
        
        ideas[ideaId].isResolved = true;
        
        uint256 totalRewards = ideas[ideaId].totalLikeTokens + ideas[ideaId].totalDislikeTokens;
        
        if (ideas[ideaId].likeVotes > ideas[ideaId].dislikeVotes) {
            // Likes win - distribute rewards to like voters
            distributeRewards(ideaId, true, totalRewards);
            emit VotingResolved(ideaId, true, totalRewards);
        } else if (ideas[ideaId].dislikeVotes > ideas[ideaId].likeVotes) {
            // Dislikes win - distribute rewards to dislike voters
            distributeRewards(ideaId, false, totalRewards);
            emit VotingResolved(ideaId, false, totalRewards);
        } else {
            // Tie - return tokens to all voters
            returnTokensToVoters(ideaId);
            emit VotingResolved(ideaId, false, 0);
        }
    }
    
    /**
     * @dev Distribute rewards to winning voters
     * @param ideaId The idea ID
     * @param likesWin True if likes won, false if dislikes won
     * @param totalRewards Total rewards to distribute
     */
    function distributeRewards(uint256 ideaId, bool likesWin, uint256 totalRewards) internal {
        address[] memory winningVoters = likesWin ? likeVoters[ideaId] : dislikeVoters[ideaId];
        uint256 voterCount = winningVoters.length;
        
        if (voterCount == 0) return;
        
        uint256 rewardPerVoter = totalRewards / voterCount;
        
        for (uint256 i = 0; i < voterCount; i++) {
            address voter = winningVoters[i];
            qstToken.transfer(voter, VOTE_COST + rewardPerVoter);
            emit RewardsDistributed(ideaId, voter, VOTE_COST + rewardPerVoter);
        }
    }
    
    /**
     * @dev Return tokens to all voters in case of a tie
     * @param ideaId The idea ID
     */
    function returnTokensToVoters(uint256 ideaId) internal {
        // Return to like voters
        address[] memory likeVoterList = likeVoters[ideaId];
        for (uint256 i = 0; i < likeVoterList.length; i++) {
            qstToken.transfer(likeVoterList[i], VOTE_COST);
            emit RewardsDistributed(ideaId, likeVoterList[i], VOTE_COST);
        }
        
        // Return to dislike voters
        address[] memory dislikeVoterList = dislikeVoters[ideaId];
        for (uint256 i = 0; i < dislikeVoterList.length; i++) {
            qstToken.transfer(dislikeVoterList[i], VOTE_COST);
            emit RewardsDistributed(ideaId, dislikeVoterList[i], VOTE_COST);
        }
    }
    
    /**
     * @dev Get idea details
     * @param ideaId The idea ID
     * @return Idea details
     */
    function getIdea(uint256 ideaId) public view returns (Idea memory) {
        require(ideaId > 0 && ideaId < nextIdeaId, "Invalid idea ID");
        return ideas[ideaId];
    }
    
    /**
     * @dev Get all ideas
     * @return Array of all ideas
     */
    function getAllIdeas() public view returns (Idea[] memory) {
        Idea[] memory allIdeas = new Idea[](nextIdeaId - 1);
        for (uint256 i = 1; i < nextIdeaId; i++) {
            allIdeas[i - 1] = ideas[i];
        }
        return allIdeas;
    }
    
    /**
     * @dev Get user's vote on an idea
     * @param ideaId The idea ID
     * @param user The user address
     * @return Vote details
     */
    function getUserVote(uint256 ideaId, address user) public view returns (Vote memory) {
        return votes[ideaId][user];
    }
    
    /**
     * @dev Check if voting period is active for an idea
     * @param ideaId The idea ID
     * @return True if voting period is active
     */
    function isVotingPeriodActive(uint256 ideaId) public view returns (bool) {
        require(ideaId > 0 && ideaId < nextIdeaId, "Invalid idea ID");
        return block.timestamp < ideas[ideaId].timestamp + VOTING_PERIOD;
    }
    
    /**
     * @dev Get time remaining in voting period
     * @param ideaId The idea ID
     * @return Time remaining in seconds
     */
    function getVotingTimeRemaining(uint256 ideaId) public view returns (uint256) {
        require(ideaId > 0 && ideaId < nextIdeaId, "Invalid idea ID");
        uint256 endTime = ideas[ideaId].timestamp + VOTING_PERIOD;
        if (block.timestamp >= endTime) return 0;
        return endTime - block.timestamp;
    }
} 
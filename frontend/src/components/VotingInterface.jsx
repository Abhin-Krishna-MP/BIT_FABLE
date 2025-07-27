import React, { useState, useEffect } from 'react';
import { useVotingSystem } from '../hooks/useVotingSystem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ThumbsUp, ThumbsDown, Clock, Users, Award, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatEther } from 'viem';

const VotingInterface = () => {
  const {
    ideas,
    userVotes,
    qstBalance,
    loading,
    error,
    publishIdea,
    voteOnIdea,
    resolveVoting,
    getVotingTimeRemaining,
    formatTimeRemaining,
    isConnected,
    address
  } = useVotingSystem();

  const [newIdea, setNewIdea] = useState('');
  const [timeRemaining, setTimeRemaining] = useState({});

  // Update time remaining for all ideas
  useEffect(() => {
    const updateTimes = async () => {
      const times = {};
      for (const idea of ideas) {
        times[idea.id] = await getVotingTimeRemaining(idea.id);
      }
      setTimeRemaining(times);
    };

    if (ideas.length > 0) {
      updateTimes();
      const interval = setInterval(updateTimes, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [ideas, getVotingTimeRemaining]);

  const handlePublishIdea = async (e) => {
    e.preventDefault();
    if (!newIdea.trim()) {
      toast.error('Please enter an idea description');
      return;
    }

    try {
      await publishIdea(newIdea);
      toast.success('Idea published successfully!');
      setNewIdea('');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleVote = async (ideaId, isLike) => {
    try {
      await voteOnIdea(ideaId, isLike);
      toast.success(`Vote cast successfully!`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleResolveVoting = async (ideaId) => {
    try {
      await resolveVoting(ideaId);
      toast.success('Voting resolved successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getUserVoteStatus = (ideaId) => {
    const vote = userVotes[ideaId];
    if (!vote || !vote.hasVoted) return null;
    return vote.isLike ? 'like' : 'dislike';
  };

  const canVote = (idea) => {
    if (!isConnected) return false;
    const voteStatus = getUserVoteStatus(idea.id);
    return !voteStatus && idea.isActive;
  };

  const canResolve = (idea) => {
    return isConnected && idea.isActive && !idea.isResolved && timeRemaining[idea.id] === 0;
  };

  return (
    <div className="voting-interface">
      <div className="voting-header">
        <h1>🚀 Startup Quest Voting</h1>
        <p>Submit ideas and vote with QST tokens to shape the future!</p>
        
        <div className="wallet-section">
          <ConnectButton />
          {isConnected && (
            <div className="wallet-info">
              <div className="address">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <div className="balance">
                <span className="token-icon">🪙</span>
                {parseFloat(qstBalance).toFixed(2)} QST
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Publish New Idea */}
      <div className="publish-section">
        <h2>💡 Submit Your Idea</h2>
        <form onSubmit={handlePublishIdea} className="idea-form">
          <textarea
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            placeholder="Describe your startup idea..."
            rows={4}
            disabled={!isConnected || loading}
          />
          <button 
            type="submit" 
            disabled={!isConnected || loading || !newIdea.trim()}
            className="btn-publish"
          >
            <Plus size={16} />
            {loading ? 'Publishing...' : 'Publish Idea'}
          </button>
        </form>
      </div>

      {/* Ideas List */}
      <div className="ideas-section">
        <h2>🗳️ All Ideas</h2>
        
        {ideas.length === 0 ? (
          <div className="no-ideas">
            <p>No ideas published yet. Be the first to submit one!</p>
          </div>
        ) : (
          <div className="ideas-grid">
            {ideas.map((idea) => (
              <div key={idea.id} className="idea-card">
                <div className="idea-header">
                  <div className="idea-id">#{idea.id}</div>
                  <div className="idea-status">
                    {idea.isResolved ? (
                      <span className="status resolved">Resolved</span>
                    ) : timeRemaining[idea.id] > 0 ? (
                      <span className="status active">Active</span>
                    ) : (
                      <span className="status ended">Voting Ended</span>
                    )}
                  </div>
                </div>

                <div className="idea-content">
                  <p className="idea-description">{idea.description}</p>
                  <div className="idea-meta">
                    <span className="creator">
                      By: {idea.creator?.slice(0, 6)}...{idea.creator?.slice(-4)}
                    </span>
                    <span className="timestamp">
                      {new Date(Number(idea.timestamp) * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="voting-stats">
                  <div className="stat">
                    <ThumbsUp size={16} />
                    <span>{idea.likeVotes} Likes</span>
                  </div>
                  <div className="stat">
                    <ThumbsDown size={16} />
                    <span>{idea.dislikeVotes} Dislikes</span>
                  </div>
                  {timeRemaining[idea.id] > 0 && (
                    <div className="stat">
                      <Clock size={16} />
                      <span>{formatTimeRemaining(timeRemaining[idea.id])}</span>
                    </div>
                  )}
                </div>

                {idea.isActive && !idea.isResolved && (
                  <div className="voting-actions">
                    {canVote(idea) ? (
                      <>
                        <button
                          onClick={() => handleVote(idea.id, true)}
                          disabled={loading}
                          className="btn-vote btn-like"
                        >
                          <ThumbsUp size={16} />
                          Like (10 QST)
                        </button>
                        <button
                          onClick={() => handleVote(idea.id, false)}
                          disabled={loading}
                          className="btn-vote btn-dislike"
                        >
                          <ThumbsDown size={16} />
                          Dislike (10 QST)
                        </button>
                      </>
                    ) : (
                      <div className="vote-status">
                        {getUserVoteStatus(idea.id) === 'like' && (
                          <span className="voted like">✓ You liked this</span>
                        )}
                        {getUserVoteStatus(idea.id) === 'dislike' && (
                          <span className="voted dislike">✓ You disliked this</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {canResolve(idea) && (
                  <button
                    onClick={() => handleResolveVoting(idea.id)}
                    disabled={loading}
                    className="btn-resolve"
                  >
                    <Award size={16} />
                    Resolve Voting
                  </button>
                )}

                {idea.isResolved && (
                  <div className="resolution">
                    <h4>🏆 Voting Results</h4>
                    {idea.likeVotes > idea.dislikeVotes ? (
                      <p className="winner like">Likes won! 🎉</p>
                    ) : idea.dislikeVotes > idea.likeVotes ? (
                      <p className="winner dislike">Dislikes won! 🎉</p>
                    ) : (
                      <p className="winner tie">It's a tie! 🤝</p>
                    )}
                    <p>Total rewards distributed: {parseFloat(formatEther(idea.totalLikeTokens + idea.totalDislikeTokens)).toFixed(2)} QST</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="instructions">
        <h3>📖 How It Works</h3>
        <div className="instructions-grid">
          <div className="instruction">
            <h4>1. Submit Ideas</h4>
            <p>Anyone can submit a startup idea for voting.</p>
          </div>
          <div className="instruction">
            <h4>2. Vote with QST</h4>
            <p>Vote like/dislike using 10 QST tokens during the 1-week voting period.</p>
          </div>
          <div className="instruction">
            <h4>3. Win Rewards</h4>
            <p>Winning voters get their tokens back plus a share of the losing side's tokens.</p>
          </div>
          <div className="instruction">
            <h4>4. Free Voting</h4>
            <p>After 1 week, voting continues without token costs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingInterface; 
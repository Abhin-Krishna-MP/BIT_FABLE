// PhaseContent.jsx
import { useState } from "react";
import { CheckCircle, Clock, Target, Users, DollarSign, MessageSquare, TrendingUp, Send, BookOpen, Lightbulb, Trophy, ArrowRight } from "lucide-react";
import AchievementClaim from "./AchievementClaim";

const PhaseContent = ({ phase, phaseData, onMarkPhaseComplete, onTaskComplete, user }) => {
  const [taskInputs, setTaskInputs] = useState({});
  const [selectedTypes, setSelectedTypes] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(null);

  const handleTaskSubmit = (taskIdx, taskName, content) => {
    if (typeof onTaskComplete === 'function') {
      onTaskComplete(phase, taskIdx);
    }
    setTaskInputs(prev => ({ ...prev, [taskIdx]: '' }));
    setShowSuccessMessage(`Task "${taskName}" saved successfully!`);
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  // Use phaseData for all content
  const phaseIcons = {
    ideation: Clock,
    validation: Target,
    mvp: Target,
    launch: TrendingUp,
    feedback: MessageSquare,
    monetization: DollarSign,
    scale: Users
  };
  const Icon = phaseIcons[phase] || Clock;
  const content = {
    title: phaseData?.title || '',
    description: phaseData?.description || '',
    tasks: phaseData?.tasks || [],
    tips: phaseData?.tips || []
  };

  // Determine if all tasks are completed for this phase
  const completedTasks = phaseData?.completedTasks || [];
  const allTasksCompleted = content.tasks.length > 0 && completedTasks.length === content.tasks.length;
  // Only enable the button if progress is 100%
  const canMarkComplete = allTasksCompleted && phaseData && phaseData.progress === 100;

  // Map phase names to IDs for badge system
  const phaseIdMap = {
    'ideation': 1,
    'validation': 2,
    'mvp': 2,
    'launch': 3,
    'feedback': 3,
    'monetization': 3,
    'scale': 3
  };

  const currentPhaseId = phaseIdMap[phase];

  return (
    <div className="phasecontent-container">
      {/* Enhanced Header */}
      <div className="phasecontent-header">
        <div className="phasecontent-icon-wrapper">
          <div className="phasecontent-icon">
            <Icon size={32} />
          </div>
          <div className="icon-background"></div>
        </div>
        <div className="phasecontent-content">
          <div className="phasecontent-title-section">
            <h1 className="phasecontent-title">{content.title}</h1>
            <div className="phase-badge">
              <Trophy size={16} />
              <span>Phase {phaseIdMap[phase] || 1}</span>
            </div>
          </div>
          <p className="phasecontent-description">{content.description}</p>
          <div className="phase-stats">
            <div className="stat-item">
              <Target size={16} />
              <span>{content.tasks?.length || 0} Tasks</span>
            </div>
            <div className="stat-item">
              <CheckCircle size={16} />
              <span>{completedTasks.length} Completed</span>
            </div>
            <div className="stat-item">
              <BookOpen size={16} />
              <span>{content.tips?.length || 0} Resources</span>
            </div>
          </div>
        </div>
      </div>

      {showSuccessMessage && (
        <div className="success-message">
          <CheckCircle size={20} />
          <span>{showSuccessMessage}</span>
        </div>
      )}

      {/* Achievement Claim Component */}
      {currentPhaseId && (
        <AchievementClaim 
          phaseId={currentPhaseId} 
          phaseName={content.title} 
          user={user}
        />
      )}

      {/* Enhanced Tasks Section */}
      <div className="tasks-section">
        <div className="section-header">
          <div className="section-icon">
            <Target size={24} />
          </div>
          <div className="section-content">
            <h2>Phase Tasks</h2>
            <p>Complete these tasks to progress through this phase</p>
          </div>
        </div>
        
        <div className="tasks-grid">
          {content.tasks.map((task, idx) => {
            const taskName = typeof task === 'string' ? task : task.name;
            const submissionType = typeof task === 'string' ? 'form' : task.submissionType;
            const submissionOptions = task.submissionOptions || [submissionType];
            const isSubmitted = completedTasks.includes(idx);
            const inputValue = taskInputs[idx] || '';
            const pdfFile = taskInputs[`pdf-${idx}`] || null;
            const selectedType = selectedTypes[idx] || submissionType;
            const handleTypeChange = (type) => setSelectedTypes(prev => ({ ...prev, [idx]: type }));
            
            const renderSubmission = () => {
              if (selectedType === 'form') {
                return (
                  <div className="task-submission">
                    <textarea
                      value={inputValue}
                      onChange={e => setTaskInputs(prev => ({ ...prev, [idx]: e.target.value }))}
                      disabled={isSubmitted}
                      className="task-input"
                      placeholder={`Enter your submission for: ${taskName}`}
                    />
                    <button
                      onClick={() => handleTaskSubmit(idx, taskName, inputValue)}
                      disabled={!inputValue.trim() || isSubmitted}
                      className="btn-submit"
                    >
                      <Send size={16} />
                      <span>{isSubmitted ? 'Completed' : 'Submit Task'}</span>
                    </button>
                  </div>
                );
              } else {
                return (
                  <div className="task-submission">
                    <input
                      type="file"
                      disabled={isSubmitted}
                      onChange={e => {
                        const file = e.target.files[0];
                        setTaskInputs(prev => ({ ...prev, [`pdf-${idx}`]: file }));
                      }}
                      className="task-input"
                      accept=".pdf,.doc,.docx"
                    />
                    <button
                      onClick={() => handleTaskSubmit(idx, taskName, pdfFile)}
                      disabled={!pdfFile || isSubmitted}
                      className="btn-submit"
                    >
                      <Send size={16} />
                      <span>{isSubmitted ? 'Completed' : 'Submit Task'}</span>
                    </button>
                  </div>
                );
              }
            };

            return (
              <div key={idx} className={`task-card ${isSubmitted ? 'completed' : ''}`}>
                <div className="task-header">
                  <div className="task-info">
                    <div className="task-number">{idx + 1}</div>
                    <div className="task-content">
                      <h3 className="task-title">{taskName}</h3>
                      <div className="task-status">
                        {isSubmitted ? (
                          <span className="status-completed">
                            <CheckCircle size={16} />
                            Completed
                          </span>
                        ) : (
                          <span className="status-pending">
                            <Clock size={16} />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {submissionOptions.length > 1 && (
                    <div className="submission-type-selector">
                      {submissionOptions.map(type => (
                        <button
                          key={type}
                          onClick={() => handleTypeChange(type)}
                          className={`type-btn ${selectedType === type ? 'active' : ''}`}
                        >
                          {type === 'form' ? 'Text' : 'File'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {!isSubmitted && renderSubmission()}
                <div className="task-decoration">
                  <div className="task-accent"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Tips Section */}
      {content.tips && content.tips.length > 0 && (
        <div className="tips-section">
          <div className="section-header">
            <div className="section-icon">
              <Lightbulb size={24} />
            </div>
            <div className="section-content">
              <h2>Tips & Resources</h2>
              <p>Helpful resources to guide you through this phase</p>
            </div>
          </div>
          
          <div className="tips-grid">
            {content.tips.map((tip, idx) => (
              <div key={idx} className="tip-card">
                <div className="tip-header">
                  <h4 className="tip-title">{tip.title}</h4>
                  <div className="tip-icon">
                    <BookOpen size={16} />
                  </div>
                </div>
                <p className="tip-content">{tip.content}</p>
                {tip.link && (
                  <a href={tip.link} target="_blank" rel="noopener noreferrer" className="tip-link">
                    <span>Learn More</span>
                    <ArrowRight size={16} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Complete Phase Button */}
      {canMarkComplete && (
        <div className="complete-phase-section">
          <div className="completion-celebration">
            <div className="celebration-icon">
              <Trophy size={24} />
            </div>
            <div className="celebration-content">
              <h3>Phase Complete!</h3>
              <p>All tasks completed. Ready to move to the next phase?</p>
            </div>
          </div>
          <button
            onClick={() => onMarkPhaseComplete(phase)}
            className="complete-phase-btn"
          >
            <CheckCircle size={20} />
            <span>Mark Phase Complete</span>
            <div className="btn-glow"></div>
          </button>
        </div>
      )}
    </div>
  );
};

export default PhaseContent;

// PhaseContent.jsx
import { useState } from "react";
import { CheckCircle, Clock, Target, Users, DollarSign, MessageSquare, TrendingUp, Send } from "lucide-react";
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
      {/* Header */}
      <div className="phasecontent-header">
        <div className="phasecontent-icon">
          <Icon size={32} />
        </div>
        <div>
          <h1 className="phasecontent-title">{content.title}</h1>
          <p className="phasecontent-description">{content.description}</p>
        </div>
      </div>

      {showSuccessMessage && (
        <div className="success-message">{showSuccessMessage}</div>
      )}

      {/* Achievement Claim Component */}
      {currentPhaseId && (
        <AchievementClaim 
          phaseId={currentPhaseId} 
          phaseName={content.title} 
          user={user}
        />
      )}

      {/* Tasks */}
      <div className="tasks-section">
        <h2>Phase Tasks</h2>
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
                <>
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
                    <Send size={16} /> {isSubmitted ? 'Completed' : 'Submit Task'}
                  </button>
                </>
              );
            } else {
              return (
                <>
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
                    <Send size={16} /> {isSubmitted ? 'Completed' : 'Submit Task'}
                  </button>
                </>
              );
            }
          };

          return (
            <div key={idx} className={`task-item ${isSubmitted ? 'completed' : ''}`}>
              <div className="task-header">
                <div className="task-info">
                  <h3>{taskName}</h3>
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
                {isSubmitted && <CheckCircle className="task-complete-icon" />}
              </div>
              {!isSubmitted && renderSubmission()}
            </div>
          );
        })}
      </div>

      {/* Tips Section */}
      {content.tips && content.tips.length > 0 && (
        <div className="tips-section">
          <h2>Tips & Resources</h2>
          <div className="tips-grid">
            {content.tips.map((tip, idx) => (
              <div key={idx} className="tip-card">
                <h4>{tip.title}</h4>
                <p>{tip.content}</p>
                {tip.link && (
                  <a href={tip.link} target="_blank" rel="noopener noreferrer" className="tip-link">
                    Learn More →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Phase Button */}
      {canMarkComplete && (
        <div className="complete-phase-section">
          <button
            onClick={() => onMarkPhaseComplete(phase)}
            className="complete-phase-btn"
          >
            <CheckCircle size={20} />
            Mark Phase Complete
          </button>
        </div>
      )}
    </div>
  );
};

export default PhaseContent;

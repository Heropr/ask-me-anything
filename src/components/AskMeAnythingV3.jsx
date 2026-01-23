import { useState, useRef, useEffect } from 'react';
import './AskMeAnythingV3.css';

// Sample dentist data
const dentists = [
  { id: 1, name: "Dr. Sarah Chen", specialty: "General", distance: "0.8 mi", rating: 4.9, nextSlot: "Today 2:00 PM", address: "123 Main St, Austin TX" },
  { id: 2, name: "Dr. Michael Rodriguez", specialty: "General", distance: "1.2 mi", rating: 4.7, nextSlot: "Today 4:30 PM", address: "456 Oak Ave, Austin TX" },
  { id: 3, name: "Dr. Emily Watson", specialty: "General", distance: "2.1 mi", rating: 4.8, nextSlot: "Tomorrow 9:00 AM", address: "789 Elm Blvd, Austin TX" },
];

// Message types
const MSG_TEXT = 'text';
const MSG_CHOICE = 'choice';
const MSG_DENTISTS = 'dentists';
const MSG_PROGRESS = 'progress';
const MSG_CONFIRMATION = 'confirmation';
const MSG_FORM = 'form';

function AskMeAnythingV3() {
  const [messages, setMessages] = useState([]);
  const [isAgentWorking, setIsAgentWorking] = useState(false);
  const [workflowState, setWorkflowState] = useState({ step: 'initial' });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message) => {
    setMessages(prev => [...prev, { ...message, id: Date.now() }]);
  };

  const updateLastMessage = (updates) => {
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], ...updates };
      return newMessages;
    });
  };

  const simulateAgentWork = async (steps, onComplete) => {
    setIsAgentWorking(true);

    addMessage({
      type: MSG_PROGRESS,
      from: 'agent',
      steps: steps.map((s, i) => ({ ...s, status: i === 0 ? 'working' : 'pending' }))
    });

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.type === MSG_PROGRESS) {
          lastMsg.steps = lastMsg.steps.map((s, idx) => ({
            ...s,
            status: idx < i + 1 ? 'done' : idx === i + 1 ? 'working' : 'pending'
          }));
        }
        return newMessages;
      });
    }

    setIsAgentWorking(false);
    onComplete?.();
  };

  const handleInitialQuestion = (question) => {
    addMessage({ type: MSG_TEXT, from: 'user', text: question });

    if (question.toLowerCase().includes('dentist') || question.toLowerCase().includes('appointment')) {
      setTimeout(() => {
        addMessage({ type: MSG_TEXT, from: 'agent', text: "I can help you book an appointment. First, let me understand what you need:" });
        setTimeout(() => {
          addMessage({
            type: MSG_CHOICE,
            from: 'agent',
            prompt: "What brings you in?",
            choices: [
              { id: 'routine', label: 'Routine cleaning', icon: '🦷' },
              { id: 'pain', label: 'Pain or discomfort', icon: '😣' },
              { id: 'procedure', label: 'Specific procedure', icon: '📋' },
            ]
          });
          setWorkflowState({ step: 'visit-type' });
        }, 300);
      }, 500);
    } else if (question.toLowerCase().includes('claim')) {
      setTimeout(() => {
        addMessage({ type: MSG_TEXT, from: 'agent', text: "I can help you file a claim. Do you have your receipt ready?" });
        setTimeout(() => {
          addMessage({
            type: MSG_CHOICE,
            from: 'agent',
            prompt: "How would you like to submit?",
            choices: [
              { id: 'photo', label: 'Take a photo', icon: '📷' },
              { id: 'upload', label: 'Upload file', icon: '📄' },
              { id: 'manual', label: 'Enter manually', icon: '✏️' },
            ]
          });
          setWorkflowState({ step: 'claim-method' });
        }, 300);
      }, 500);
    } else if (question.toLowerCase().includes('family') || question.toLowerCase().includes('add')) {
      setTimeout(() => {
        addMessage({ type: MSG_TEXT, from: 'agent', text: "I can add a family member to your plan right now." });
        setTimeout(() => {
          addMessage({
            type: MSG_FORM,
            from: 'agent',
            prompt: "Who would you like to add?",
            fields: [
              { id: 'name', label: 'Full name', type: 'text', placeholder: 'e.g. Jane Doe' },
              { id: 'relationship', label: 'Relationship', type: 'select', options: ['Spouse', 'Child', 'Domestic Partner'] },
              { id: 'dob', label: 'Date of birth', type: 'text', placeholder: 'MM/DD/YYYY' },
            ]
          });
          setWorkflowState({ step: 'add-family' });
        }, 300);
      }, 500);
    } else {
      setTimeout(() => {
        addMessage({ type: MSG_TEXT, from: 'agent', text: "I can help with appointments, claims, or adding family members. What would you like to do?" });
        setTimeout(() => {
          addMessage({
            type: MSG_CHOICE,
            from: 'agent',
            prompt: "Quick actions",
            choices: [
              { id: 'book', label: 'Book appointment', icon: '📅' },
              { id: 'claim', label: 'File a claim', icon: '📝' },
              { id: 'family', label: 'Add family member', icon: '👨‍👩‍👧' },
            ]
          });
          setWorkflowState({ step: 'initial-choice' });
        }, 300);
      }, 500);
    }
  };

  const handleChoice = (choice) => {
    addMessage({ type: MSG_TEXT, from: 'user', text: choice.label });

    if (workflowState.step === 'initial-choice') {
      if (choice.id === 'book') {
        handleInitialQuestion('I need to see a dentist');
      } else if (choice.id === 'claim') {
        handleInitialQuestion('I need to file a claim');
      } else if (choice.id === 'family') {
        handleInitialQuestion('I want to add a family member');
      }
      return;
    }

    if (workflowState.step === 'visit-type') {
      const urgencyMap = {
        'routine': 'routine',
        'pain': 'urgent',
        'procedure': 'planned'
      };
      setWorkflowState({ step: 'finding-dentists', visitType: choice.id, urgency: urgencyMap[choice.id] });

      setTimeout(() => {
        if (choice.id === 'pain') {
          addMessage({
            type: MSG_CHOICE,
            from: 'agent',
            prompt: "How severe is the pain?",
            choices: [
              { id: 'mild', label: 'Mild discomfort', icon: '😐' },
              { id: 'moderate', label: 'Significant pain', icon: '😟' },
              { id: 'severe', label: "Can't eat or sleep", icon: '😫' },
            ]
          });
          setWorkflowState(prev => ({ ...prev, step: 'pain-severity' }));
        } else {
          findDentists(choice.id === 'routine' ? 'routine' : 'planned');
        }
      }, 300);
    } else if (workflowState.step === 'pain-severity') {
      findDentists('urgent');
    }
  };

  const findDentists = (urgency) => {
    addMessage({ type: MSG_TEXT, from: 'agent', text: urgency === 'urgent'
      ? "Let me find dentists who can see you as soon as possible..."
      : "Finding available dentists near you..."
    });

    setTimeout(() => {
      addMessage({
        type: MSG_DENTISTS,
        from: 'agent',
        dentists: urgency === 'urgent' ? dentists.slice(0, 2) : dentists,
        prompt: "Here's who can see you:"
      });
      setWorkflowState(prev => ({ ...prev, step: 'select-dentist' }));
    }, 800);
  };

  const handleSelectDentist = (dentist) => {
    addMessage({ type: MSG_TEXT, from: 'user', text: `Book with ${dentist.name}` });
    setWorkflowState(prev => ({ ...prev, step: 'booking', selectedDentist: dentist }));

    simulateAgentWork(
      [
        { label: 'Checking your coverage...', detail: 'Verifying benefits' },
        { label: 'Confirming availability...', detail: `Contacting ${dentist.name}'s office` },
        { label: 'Reserving your slot...', detail: dentist.nextSlot },
      ],
      () => {
        setTimeout(() => {
          addMessage({
            type: MSG_CONFIRMATION,
            from: 'agent',
            title: "Appointment Confirmed! ✓",
            dentist: dentist,
            details: [
              { label: 'When', value: dentist.nextSlot },
              { label: 'Where', value: dentist.address },
              { label: 'Your cost', value: '$0 (covered by Smirk)' },
            ],
            actions: [
              { id: 'calendar', label: 'Add to calendar', icon: '📅' },
              { id: 'directions', label: 'Get directions', icon: '🗺️' },
              { id: 'reminder', label: 'Text me reminder', icon: '💬' },
            ]
          });
          setWorkflowState({ step: 'complete' });
        }, 300);
      }
    );
  };

  const handleFormSubmit = (formData) => {
    addMessage({ type: MSG_TEXT, from: 'user', text: `Add ${formData.name} as ${formData.relationship}` });

    simulateAgentWork(
      [
        { label: 'Validating information...', detail: 'Checking eligibility' },
        { label: 'Adding to your plan...', detail: formData.name },
        { label: 'Generating member card...', detail: 'Creating digital ID' },
      ],
      () => {
        setTimeout(() => {
          addMessage({
            type: MSG_CONFIRMATION,
            from: 'agent',
            title: "Family Member Added! ✓",
            details: [
              { label: 'Name', value: formData.name },
              { label: 'Relationship', value: formData.relationship },
              { label: 'Coverage starts', value: 'Immediately' },
              { label: 'Member ID', value: 'SMK-' + Math.random().toString(36).substr(2, 8).toUpperCase() },
            ],
            actions: [
              { id: 'card', label: 'View their card', icon: '💳' },
              { id: 'dentist', label: 'Find them a dentist', icon: '🦷' },
            ]
          });
          setWorkflowState({ step: 'complete' });
        }, 300);
      }
    );
  };

  const handleConfirmationAction = (action) => {
    addMessage({ type: MSG_TEXT, from: 'user', text: action.label });

    if (action.id === 'reminder') {
      setTimeout(() => {
        addMessage({ type: MSG_TEXT, from: 'agent', text: "Done! I'll text you a reminder 2 hours before your appointment. 📱" });
      }, 500);
    } else if (action.id === 'calendar') {
      setTimeout(() => {
        addMessage({ type: MSG_TEXT, from: 'agent', text: "Added to your calendar! You should see the invite now. 📅" });
      }, 500);
    } else if (action.id === 'directions') {
      setTimeout(() => {
        addMessage({ type: MSG_TEXT, from: 'agent', text: "Opening maps with directions to the office... 🗺️" });
      }, 500);
    } else if (action.id === 'dentist') {
      handleInitialQuestion('Find a dentist');
    }
  };

  const handleRestart = () => {
    setMessages([]);
    setWorkflowState({ step: 'initial' });
    setIsAgentWorking(false);
  };

  const initialQuestions = [
    "I need to see a dentist",
    "I have a toothache",
    "File a claim",
    "Add my spouse to my plan",
  ];

  return (
    <div className="v3-page">
      <div className="v3-header">
        <h1 className="v3-title">Smirk <em>Agent</em></h1>
        <p className="v3-subtitle">I can help you book appointments, file claims, and manage your plan</p>
      </div>

      <div className="v3-container">
        <div className="v3-messages">
          {messages.length === 0 && (
            <div className="v3-initial">
              <p className="v3-initial-prompt">What can I help you with?</p>
              <div className="v3-initial-chips">
                {initialQuestions.map((q, i) => (
                  <button key={i} className="v3-chip" onClick={() => handleInitialQuestion(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`v3-message v3-message-${msg.from}`}>
              {msg.type === MSG_TEXT && (
                <div className="v3-text">{msg.text}</div>
              )}

              {msg.type === MSG_CHOICE && (
                <div className="v3-card v3-choice-card">
                  <div className="v3-card-prompt">{msg.prompt}</div>
                  <div className="v3-choices">
                    {msg.choices.map((choice) => (
                      <button
                        key={choice.id}
                        className="v3-choice-btn"
                        onClick={() => handleChoice(choice)}
                        disabled={isAgentWorking}
                      >
                        <span className="v3-choice-icon">{choice.icon}</span>
                        <span className="v3-choice-label">{choice.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {msg.type === MSG_DENTISTS && (
                <div className="v3-card v3-dentists-card">
                  <div className="v3-card-prompt">{msg.prompt}</div>
                  <div className="v3-dentists">
                    {msg.dentists.map((dentist) => (
                      <div key={dentist.id} className="v3-dentist">
                        <div className="v3-dentist-info">
                          <div className="v3-dentist-name">{dentist.name}</div>
                          <div className="v3-dentist-meta">
                            <span>⭐ {dentist.rating}</span>
                            <span>•</span>
                            <span>{dentist.distance}</span>
                          </div>
                          <div className="v3-dentist-slot">{dentist.nextSlot}</div>
                        </div>
                        <button
                          className="v3-book-btn"
                          onClick={() => handleSelectDentist(dentist)}
                          disabled={isAgentWorking}
                        >
                          Book
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {msg.type === MSG_PROGRESS && (
                <div className="v3-card v3-progress-card">
                  <div className="v3-progress-steps">
                    {msg.steps.map((step, i) => (
                      <div key={i} className={`v3-progress-step v3-progress-${step.status}`}>
                        <div className="v3-progress-indicator">
                          {step.status === 'done' && '✓'}
                          {step.status === 'working' && <span className="v3-spinner" />}
                          {step.status === 'pending' && '○'}
                        </div>
                        <div className="v3-progress-content">
                          <div className="v3-progress-label">{step.label}</div>
                          <div className="v3-progress-detail">{step.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {msg.type === MSG_CONFIRMATION && (
                <div className="v3-card v3-confirmation-card">
                  <div className="v3-confirmation-title">{msg.title}</div>
                  {msg.dentist && (
                    <div className="v3-confirmation-dentist">{msg.dentist.name}</div>
                  )}
                  <div className="v3-confirmation-details">
                    {msg.details.map((detail, i) => (
                      <div key={i} className="v3-confirmation-row">
                        <span className="v3-confirmation-label">{detail.label}</span>
                        <span className="v3-confirmation-value">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="v3-confirmation-actions">
                    {msg.actions.map((action) => (
                      <button
                        key={action.id}
                        className="v3-action-btn"
                        onClick={() => handleConfirmationAction(action)}
                      >
                        <span>{action.icon}</span>
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {msg.type === MSG_FORM && (
                <FormCard
                  prompt={msg.prompt}
                  fields={msg.fields}
                  onSubmit={handleFormSubmit}
                  disabled={isAgentWorking}
                />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {messages.length > 0 && (
          <button className="v3-restart" onClick={handleRestart}>
            ↺ Start over
          </button>
        )}
      </div>
    </div>
  );
}

// Separate form component to manage its own state
function FormCard({ prompt, fields, onSubmit, disabled }) {
  const [formData, setFormData] = useState({});

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = () => {
    if (Object.keys(formData).length >= fields.length) {
      onSubmit(formData);
    }
  };

  const isComplete = fields.every(f => formData[f.id]);

  return (
    <div className="v3-card v3-form-card">
      <div className="v3-card-prompt">{prompt}</div>
      <div className="v3-form-fields">
        {fields.map((field) => (
          <div key={field.id} className="v3-form-field">
            <label className="v3-form-label">{field.label}</label>
            {field.type === 'select' ? (
              <select
                className="v3-form-select"
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={disabled}
              >
                <option value="">Select...</option>
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                className="v3-form-input"
                type="text"
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={disabled}
              />
            )}
          </div>
        ))}
      </div>
      <button
        className="v3-form-submit"
        onClick={handleSubmit}
        disabled={disabled || !isComplete}
      >
        Add to my plan
      </button>
    </div>
  );
}

export default AskMeAnythingV3;

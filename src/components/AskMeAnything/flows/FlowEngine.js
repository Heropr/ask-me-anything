/**
 * FlowEngine - Central controller for all flow operations
 *
 * Manages flow state, handles navigation, supports dynamic transitions,
 * and fires events for UI updates.
 */

import FlowRepository from './FlowRepository';

// =============================================================================
// EVENT EMITTER (Simple implementation for React integration)
// =============================================================================

/**
 * Creates a simple event emitter for flow engine events
 * @returns {Object} Event emitter with on, off, emit methods
 */
function createEventEmitter() {
  const listeners = new Map();

  return {
    /**
     * Subscribe to an event
     * @param {import('./types').FlowEventType} event
     * @param {import('./types').FlowEventHandler} handler
     * @returns {function} Unsubscribe function
     */
    on(event, handler) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event).add(handler);
      return () => this.off(event, handler);
    },

    /**
     * Unsubscribe from an event
     * @param {import('./types').FlowEventType} event
     * @param {import('./types').FlowEventHandler} handler
     */
    off(event, handler) {
      if (listeners.has(event)) {
        listeners.get(event).delete(handler);
      }
    },

    /**
     * Emit an event
     * @param {import('./types').FlowEventType} event
     * @param {import('./types').FlowEvent} payload
     */
    emit(event, payload) {
      if (listeners.has(event)) {
        listeners.get(event).forEach((handler) => handler(payload));
      }
    },

    /**
     * Clear all listeners
     */
    clear() {
      listeners.clear();
    },
  };
}

// =============================================================================
// FLOW ENGINE FACTORY
// =============================================================================

/**
 * Creates a new FlowEngine instance
 * @param {Object} [options]
 * @param {import('./FlowRepository').default} [options.repository] - Data repository
 * @returns {import('./types').FlowEngine & { events: ReturnType<typeof createEventEmitter> }}
 */
function createFlowEngine(options = {}) {
  const repository = options.repository || FlowRepository;
  const events = createEventEmitter();

  // -------------------------------------------------------------------------
  // Internal State
  // -------------------------------------------------------------------------

  /** @type {import('./types').FlowState | null} */
  let state = null;

  /** @type {Set<string>} */
  const completedFlows = new Set();

  /** @type {import('./types').ConversationEntry[]} */
  let conversationHistory = [];

  // Agent processing state
  let processingSteps = [];
  let processingStepIndex = 0;
  let processingTimer = null;
  let processingCallback = null;

  // -------------------------------------------------------------------------
  // Internal Helpers
  // -------------------------------------------------------------------------

  /**
   * Get current flow definition
   * @returns {import('./types').FlowDefinition | null}
   */
  function getCurrentFlow() {
    if (!state) return null;
    return repository.getFlow(state.flowId);
  }

  /**
   * Get current step definition
   * @returns {import('./types').FlowStep | null}
   */
  function getCurrentStep() {
    const flow = getCurrentFlow();
    if (!flow || !state) return null;
    return flow.steps[state.currentStep] || null;
  }

  /**
   * Resolve next step ID (handles both string and function-based transitions)
   * @param {import('./types').FlowStep} step
   * @param {import('./types').Choice} [choice]
   * @returns {string | null}
   */
  function resolveNextStep(step, choice) {
    if (!step.nextStep) {
      return step.isTerminal ? null : null;
    }

    if (typeof step.nextStep === 'function') {
      return step.nextStep(choice, state);
    }

    return step.nextStep;
  }

  /**
   * Update state and emit change event
   * @param {Partial<import('./types').FlowState>} updates
   */
  function updateState(updates) {
    if (!state) return;

    const previousStep = state.currentStep;
    state = { ...state, ...updates };

    if (updates.currentStep && updates.currentStep !== previousStep) {
      events.emit('stepChanged', {
        type: 'stepChanged',
        state: { ...state },
        previousStep,
      });
    }
  }

  /**
   * Add entry to conversation history
   * @param {import('./types').ConversationEntry} entry
   */
  function addEntry(entry) {
    const entryWithId = { ...entry, id: Date.now() };
    conversationHistory.push(entryWithId);
    events.emit('entryAdded', {
      type: 'entryAdded',
      entry: entryWithId,
      state: state ? { ...state } : null,
    });
    return entryWithId;
  }

  /**
   * Build conversation entry from current step
   * @returns {import('./types').ConversationEntry | null}
   */
  function buildStepEntry() {
    const step = getCurrentStep();
    if (!step) return null;

    const entry = {
      type: 'task-card',
      cardType: step.cardType,
      prompt: step.prompt,
    };

    // Add card-specific properties
    if (step.cardType === 'choices' && step.choices) {
      entry.choices = step.choices;
    }

    if (step.cardType === 'dentists') {
      const urgentOnly = state?.data?.severity === "Can't eat or sleep";
      entry.dentists = repository.getDentistsSync({ urgentOnly });
      entry.prompt = step.prompt || "Here's who can see you:";
    }

    if (step.cardType === 'form' && step.fields) {
      entry.fields = step.fields;
    }

    if (step.cardType === 'progress' && step.agentSteps) {
      entry.steps = step.agentSteps.map((s, i) => ({
        ...s,
        status: i === 0 ? 'working' : 'pending',
      }));
    }

    if (step.cardType === 'confirmation') {
      entry.title = step.title;
      entry.subtitle = step.subtitle;
      entry.details = step.details;
      entry.actions = step.actions;
      entry.nextSteps = step.nextSteps;
    }

    return entry;
  }

  // -------------------------------------------------------------------------
  // Flow Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Start a flow by ID
   * @param {string} flowId
   */
  function startFlow(flowId) {
    const flow = repository.getFlow(flowId);
    if (!flow) {
      console.error(`FlowEngine: Flow "${flowId}" not found`);
      return;
    }

    // Check guard if present
    if (flow.canStart && !flow.canStart(state)) {
      console.warn(`FlowEngine: Cannot start flow "${flowId}" - guard returned false`);
      return;
    }

    // Initialize state
    state = {
      flowId,
      currentStep: flow.initialStep,
      data: {},
      stepHistory: [],
      isComplete: false,
      isProcessing: false,
    };

    events.emit('flowStarted', {
      type: 'flowStarted',
      flowId,
      state: { ...state },
    });

    // Add initial step entry
    const entry = buildStepEntry();
    if (entry) {
      addEntry(entry);
    }
  }

  /**
   * Mark current flow as complete
   */
  function completeFlow() {
    if (!state) return;

    const flowId = state.flowId;
    completedFlows.add(flowId);
    updateState({ isComplete: true });

    events.emit('flowCompleted', {
      type: 'flowCompleted',
      flowId,
      state: { ...state },
    });
  }

  /**
   * Cancel and exit current flow
   */
  function cancelFlow() {
    if (!state) return;

    const flowId = state.flowId;

    // Clear any running processing
    if (processingTimer) {
      clearInterval(processingTimer);
      processingTimer = null;
    }

    state = null;

    events.emit('flowCancelled', {
      type: 'flowCancelled',
      flowId,
    });
  }

  /**
   * Check if back navigation is possible
   * @returns {boolean}
   */
  function canGoBack() {
    return state !== null && state.stepHistory.length > 0;
  }

  /**
   * Navigate to previous step
   */
  function goBack() {
    if (!canGoBack()) return;

    const previousStep = state.stepHistory[state.stepHistory.length - 1];
    const newHistory = state.stepHistory.slice(0, -1);

    updateState({
      currentStep: previousStep,
      stepHistory: newHistory,
    });

    const entry = buildStepEntry();
    if (entry) {
      addEntry(entry);
    }
  }

  // -------------------------------------------------------------------------
  // User Interactions
  // -------------------------------------------------------------------------

  /**
   * Handle a choice selection
   * @param {import('./types').Choice} choice
   */
  function handleChoice(choice) {
    if (!state || state.isProcessing) return;

    const step = getCurrentStep();
    if (!step) return;

    // Store choice in data
    const dataKey = step.id || 'choice';
    const dataUpdates = {
      [dataKey]: choice.label,
      [`${dataKey}Id`]: choice.id,
    };

    // Update history and data
    updateState({
      data: { ...state.data, ...dataUpdates },
      stepHistory: [...state.stepHistory, state.currentStep],
    });

    // Resolve next step
    const nextStepId = resolveNextStep(step, choice);

    if (nextStepId) {
      // Move to next step
      updateState({ currentStep: nextStepId });

      const nextStep = getCurrentStep();

      // Check if next step requires processing
      if (nextStep?.requiresProcessing && nextStep.agentSteps) {
        runAgentSteps(nextStep.agentSteps, () => {
          // After processing, move to the step after this one
          const afterProcessingStep = resolveNextStep(nextStep);
          if (afterProcessingStep) {
            updateState({ currentStep: afterProcessingStep });
            const entry = buildStepEntry();
            if (entry) addEntry(entry);
          }
        });
      } else {
        const entry = buildStepEntry();
        if (entry) addEntry(entry);
      }
    } else if (step.isTerminal) {
      completeFlow();
    }
  }

  /**
   * Handle form submission
   * @param {Object} formData
   */
  function handleFormSubmit(formData) {
    if (!state || state.isProcessing) return;

    const step = getCurrentStep();
    if (!step) return;

    // Store form data
    updateState({
      data: { ...state.data, ...formData },
      stepHistory: [...state.stepHistory, state.currentStep],
    });

    // Resolve next step
    const nextStepId = resolveNextStep(step);

    if (nextStepId) {
      updateState({ currentStep: nextStepId });

      const nextStep = getCurrentStep();

      // Check if next step requires processing
      if (nextStep?.requiresProcessing && nextStep.agentSteps) {
        runAgentSteps(nextStep.agentSteps, () => {
          const afterProcessingStep = resolveNextStep(nextStep);
          if (afterProcessingStep) {
            updateState({ currentStep: afterProcessingStep });
            const entry = buildStepEntry();
            if (entry) addEntry(entry);
          }
        });
      } else {
        const entry = buildStepEntry();
        if (entry) addEntry(entry);
      }
    }
  }

  /**
   * Handle entity selection (e.g., dentist)
   * @param {Object} entity
   */
  function handleEntitySelect(entity) {
    if (!state || state.isProcessing) return;

    const step = getCurrentStep();
    if (!step) return;

    // Store selected entity
    updateState({
      selectedEntity: entity,
      data: { ...state.data, selectedEntity: entity },
      stepHistory: [...state.stepHistory, state.currentStep],
    });

    // Resolve next step
    const nextStepId = resolveNextStep(step);

    if (nextStepId) {
      updateState({ currentStep: nextStepId });

      const nextStep = getCurrentStep();

      // Check if next step requires processing (common for booking confirmation)
      if (nextStep?.requiresProcessing && nextStep.agentSteps) {
        // Inject entity-specific details into agent steps if needed
        const stepsWithEntity = nextStep.agentSteps.map((s) => {
          if (s.detail && s.detail.includes('{entity}')) {
            return { ...s, detail: s.detail.replace('{entity}', entity.name || entity.id) };
          }
          return s;
        });

        runAgentSteps(stepsWithEntity, () => {
          const afterProcessingStep = resolveNextStep(nextStep);
          if (afterProcessingStep) {
            updateState({ currentStep: afterProcessingStep });
            const entry = buildStepEntry();
            if (entry) addEntry(entry);
          } else {
            // Build confirmation with entity data
            const entry = buildConfirmationEntry(entity);
            if (entry) addEntry(entry);
            completeFlow();
          }
        });
      } else {
        const entry = buildStepEntry();
        if (entry) addEntry(entry);
      }
    }
  }

  /**
   * Build confirmation entry with entity data
   * @param {Object} entity
   * @returns {import('./types').ConversationEntry}
   */
  function buildConfirmationEntry(entity) {
    const step = getCurrentStep();
    const flow = getCurrentFlow();

    if (!step || step.cardType !== 'confirmation') return null;

    // Replace placeholders in details with actual entity data
    const details = (step.details || []).map((d) => {
      let value = d.value;
      if (value.includes('{entity.')) {
        const match = value.match(/\{entity\.(\w+)\}/);
        if (match) {
          value = entity[match[1]] || value;
        }
      }
      return { ...d, value };
    });

    return {
      type: 'task-card',
      cardType: 'confirmation',
      title: step.title,
      subtitle: entity.name || step.subtitle,
      details,
      actions: step.actions,
      nextSteps: step.nextSteps || flow?.unlockedActions,
    };
  }

  /**
   * Handle confirmation card action
   * @param {import('./types').CardAction} action
   */
  function handleAction(action) {
    // Actions typically trigger side effects or start new flows
    // This is delegated to the UI layer for now
    events.emit('actionTriggered', {
      type: 'actionTriggered',
      action,
      state: state ? { ...state } : null,
    });
  }

  // -------------------------------------------------------------------------
  // Agent Processing
  // -------------------------------------------------------------------------

  /**
   * Run agent processing steps with animated progress
   * @param {import('./types').AgentStep[]} steps
   * @param {function} onDone
   */
  function runAgentSteps(steps, onDone) {
    if (!state) return;

    updateState({ isProcessing: true });
    processingSteps = steps;
    processingStepIndex = 0;
    processingCallback = onDone;

    // Emit processing started
    events.emit('processingStarted', {
      type: 'processingStarted',
      state: { ...state },
    });

    // Add progress card entry
    const progressEntry = {
      type: 'task-card',
      cardType: 'progress',
      steps: steps.map((s, i) => ({
        ...s,
        status: i === 0 ? 'working' : 'pending',
      })),
    };
    const addedEntry = addEntry(progressEntry);

    // Animate through steps
    processingTimer = setInterval(() => {
      processingStepIndex++;

      if (processingStepIndex >= processingSteps.length) {
        // All steps complete
        clearInterval(processingTimer);
        processingTimer = null;

        // Update final progress entry
        const entryIndex = conversationHistory.findIndex((e) => e.id === addedEntry.id);
        if (entryIndex !== -1) {
          conversationHistory[entryIndex] = {
            ...conversationHistory[entryIndex],
            steps: processingSteps.map((s) => ({ ...s, status: 'done' })),
          };
        }

        updateState({ isProcessing: false });

        events.emit('processingCompleted', {
          type: 'processingCompleted',
          state: { ...state },
        });

        // Call completion callback after short delay
        setTimeout(() => {
          if (processingCallback) {
            processingCallback();
            processingCallback = null;
          }
        }, 400);
      } else {
        // Update progress entry with current step
        const entryIndex = conversationHistory.findIndex((e) => e.id === addedEntry.id);
        if (entryIndex !== -1) {
          conversationHistory[entryIndex] = {
            ...conversationHistory[entryIndex],
            steps: processingSteps.map((s, i) => ({
              ...s,
              status: i < processingStepIndex ? 'done' : i === processingStepIndex ? 'working' : 'pending',
            })),
          };
          // Emit update for UI refresh
          events.emit('entryUpdated', {
            type: 'entryUpdated',
            entry: conversationHistory[entryIndex],
          });
        }
      }
    }, 900);
  }

  /**
   * Check if agent is currently processing
   * @returns {boolean}
   */
  function isProcessing() {
    return state?.isProcessing || false;
  }

  // -------------------------------------------------------------------------
  // State Access
  // -------------------------------------------------------------------------

  /**
   * Get current flow state
   * @returns {import('./types').FlowState | null}
   */
  function getState() {
    return state ? { ...state } : null;
  }

  /**
   * Get current card to render
   * @returns {import('./types').ConversationEntry | null}
   */
  function getCurrentCard() {
    if (conversationHistory.length === 0) return null;
    return conversationHistory[conversationHistory.length - 1];
  }

  /**
   * Get full conversation history
   * @returns {import('./types').ConversationEntry[]}
   */
  function getConversationHistory() {
    return [...conversationHistory];
  }

  /**
   * Check if a flow is active
   * @returns {boolean}
   */
  function isFlowActive() {
    return state !== null && !state.isComplete;
  }

  // -------------------------------------------------------------------------
  // Sidebar/Questions
  // -------------------------------------------------------------------------

  /**
   * Get contextual questions for current state
   * @returns {string[]}
   */
  function getContextualQuestions() {
    if (!state) return [];

    const flow = getCurrentFlow();
    if (!flow) return [];

    // Check step-specific questions first
    if (flow.stepQuestions?.[state.currentStep]) {
      return flow.stepQuestions[state.currentStep];
    }

    // Fall back to flow-level contextual questions
    return flow.contextualQuestions || [];
  }

  /**
   * Get actions unlocked by completed flows
   * @returns {import('./types').NextStep[]}
   */
  function getUnlockedActions() {
    return repository.getAllUnlockedActions(Array.from(completedFlows));
  }

  /**
   * Get set of completed flow IDs
   * @returns {string[]}
   */
  function getCompletedFlows() {
    return Array.from(completedFlows);
  }

  /**
   * Mark a flow as completed (for restoring state)
   * @param {string} flowId
   */
  function markFlowCompleted(flowId) {
    completedFlows.add(flowId);
  }

  // -------------------------------------------------------------------------
  // Conversation Management
  // -------------------------------------------------------------------------

  /**
   * Add a Q&A entry to conversation
   * @param {string | null} question
   * @param {string} answer
   * @param {boolean} [isTaskClarification]
   */
  function addQAEntry(question, answer, isTaskClarification = false) {
    return addEntry({
      type: 'qa',
      question,
      answer,
      isTaskClarification,
    });
  }

  /**
   * Clear conversation history
   */
  function clearConversation() {
    conversationHistory = [];
    state = null;
    if (processingTimer) {
      clearInterval(processingTimer);
      processingTimer = null;
    }
  }

  /**
   * Truncate conversation to a specific index
   * @param {number} index
   */
  function truncateConversation(index) {
    conversationHistory = conversationHistory.slice(0, index + 1);
  }

  // -------------------------------------------------------------------------
  // Return Public Interface
  // -------------------------------------------------------------------------

  return {
    // Event emitter
    events,

    // Flow lifecycle
    startFlow,
    completeFlow,
    cancelFlow,
    canGoBack,
    goBack,

    // User interactions
    handleChoice,
    handleFormSubmit,
    handleEntitySelect,
    handleAction,

    // State access
    getState,
    getCurrentFlow,
    getCurrentStep,
    getCurrentCard,
    getConversationHistory,
    isFlowActive,

    // Sidebar/questions
    getContextualQuestions,
    getUnlockedActions,
    getCompletedFlows,
    markFlowCompleted,

    // Agent processing
    runAgentSteps,
    isProcessing,

    // Conversation management
    addQAEntry,
    clearConversation,
    truncateConversation,

    // Repository access
    repository,
  };
}

export default createFlowEngine;
export { createFlowEngine, createEventEmitter };

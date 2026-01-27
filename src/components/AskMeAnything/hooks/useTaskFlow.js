/**
 * useTaskFlow - React hook that wraps the FlowEngine
 *
 * Provides a clean React API for flow management with automatic
 * re-renders on state changes.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import createFlowEngine from '../flows/FlowEngine';
import FlowRepository from '../flows/FlowRepository';

// Import and register flows
import { registerBookingFlow } from '../flows/bookingFlow';

// Register all flows on module load
registerBookingFlow();

/**
 * Hook for managing task flows in React components
 *
 * @param {Object} [options]
 * @param {function} [options.onFlowStart] - Callback when flow starts
 * @param {function} [options.onFlowComplete] - Callback when flow completes
 * @param {function} [options.onStepChange] - Callback when step changes
 * @param {function} [options.onEntryAdded] - Callback when entry is added
 *
 * @returns {Object} Flow state and handlers
 */
function useTaskFlow(options = {}) {
  const { onFlowStart, onFlowComplete, onStepChange, onEntryAdded } = options;

  // Create engine instance using lazy initialization (stable across renders)
  // Using useState with initializer function is the recommended pattern
  // for creating singleton instances that should persist across renders
  const [engine] = useState(() => createFlowEngine({ repository: FlowRepository }));

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  // Flow state that triggers re-renders
  const [flowState, setFlowState] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedFlows, setCompletedFlows] = useState([]);

  // Track active entry index for UI
  const [activeEntryIndex, setActiveEntryIndex] = useState(0);

  // -------------------------------------------------------------------------
  // Event Subscriptions
  // -------------------------------------------------------------------------

  useEffect(() => {
    const unsubscribers = [];

    // Flow started
    unsubscribers.push(
      engine.events.on('flowStarted', (event) => {
        setFlowState(event.state);
        onFlowStart?.(event);
      })
    );

    // Flow completed
    unsubscribers.push(
      engine.events.on('flowCompleted', (event) => {
        setFlowState(event.state);
        setCompletedFlows((prev) =>
          prev.includes(event.flowId) ? prev : [...prev, event.flowId]
        );
        onFlowComplete?.(event);
      })
    );

    // Flow cancelled
    unsubscribers.push(
      engine.events.on('flowCancelled', () => {
        setFlowState(null);
      })
    );

    // Step changed
    unsubscribers.push(
      engine.events.on('stepChanged', (event) => {
        setFlowState(event.state);
        onStepChange?.(event);
      })
    );

    // Entry added
    unsubscribers.push(
      engine.events.on('entryAdded', (event) => {
        setConversationHistory(engine.getConversationHistory());
        setActiveEntryIndex(engine.getConversationHistory().length - 1);
        onEntryAdded?.(event);
      })
    );

    // Entry updated (for progress animation)
    unsubscribers.push(
      engine.events.on('entryUpdated', () => {
        setConversationHistory([...engine.getConversationHistory()]);
      })
    );

    // Processing started
    unsubscribers.push(
      engine.events.on('processingStarted', () => {
        setIsProcessing(true);
      })
    );

    // Processing completed
    unsubscribers.push(
      engine.events.on('processingCompleted', () => {
        setIsProcessing(false);
      })
    );

    // Cleanup
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [engine, onFlowStart, onFlowComplete, onStepChange, onEntryAdded]);

  // -------------------------------------------------------------------------
  // Flow Handlers
  // -------------------------------------------------------------------------

  /**
   * Start a task flow
   */
  const startFlow = useCallback(
    (flowId) => {
      engine.startFlow(flowId);
    },
    [engine]
  );

  /**
   * Handle choice selection in choices card
   */
  const handleChoice = useCallback(
    (choice) => {
      engine.handleChoice(choice);
    },
    [engine]
  );

  /**
   * Handle form submission in form card
   */
  const handleFormSubmit = useCallback(
    (formData) => {
      engine.handleFormSubmit(formData);
    },
    [engine]
  );

  /**
   * Handle entity selection (e.g., booking a dentist)
   */
  const handleEntitySelect = useCallback(
    (entity) => {
      engine.handleEntitySelect(entity);
    },
    [engine]
  );

  /**
   * Handle action button click in confirmation card
   */
  const handleAction = useCallback(
    (action) => {
      engine.handleAction(action);
    },
    [engine]
  );

  /**
   * Go back to previous step
   */
  const goBack = useCallback(() => {
    engine.goBack();
  }, [engine]);

  /**
   * Cancel current flow
   */
  const cancelFlow = useCallback(() => {
    engine.cancelFlow();
  }, [engine]);

  // -------------------------------------------------------------------------
  // Conversation Handlers
  // -------------------------------------------------------------------------

  /**
   * Add a Q&A entry (for explore mode questions during task)
   */
  const addQAEntry = useCallback(
    (question, answer, isTaskClarification = false) => {
      engine.addQAEntry(question, answer, isTaskClarification);
    },
    [engine]
  );

  /**
   * Clear all conversation history and reset
   */
  const clearConversation = useCallback(() => {
    engine.clearConversation();
    setConversationHistory([]);
    setFlowState(null);
    setActiveEntryIndex(0);
  }, [engine]);

  /**
   * Truncate conversation to index (for clicking on past entries)
   */
  const truncateToEntry = useCallback(
    (index) => {
      engine.truncateConversation(index);
      setConversationHistory(engine.getConversationHistory());
      setActiveEntryIndex(index);
    },
    [engine]
  );

  /**
   * Set active entry index (for scrolling/focus)
   */
  const setActiveEntry = useCallback((index) => {
    setActiveEntryIndex(index);
  }, []);

  // -------------------------------------------------------------------------
  // Sidebar/Questions
  // -------------------------------------------------------------------------

  /**
   * Get contextual questions for current step
   */
  const getContextualQuestions = useCallback(() => {
    if (!flowState) return [];
    return engine.getContextualQuestions();
  }, [engine, flowState]);

  /**
   * Get step questions from repository directly
   */
  const getTaskQuestions = useCallback(
    (stepId) => {
      if (!flowState) return [];
      return FlowRepository.getTaskQuestions(flowState.flowId, stepId);
    },
    [flowState]
  );

  /**
   * Get unlocked actions from completed flows
   */
  const getUnlockedActions = useCallback(() => {
    return engine.getUnlockedActions();
  }, [engine]);

  // -------------------------------------------------------------------------
  // Computed Values
  // -------------------------------------------------------------------------

  /**
   * Current flow definition (if active)
   */
  const currentFlow = useMemo(() => {
    if (!flowState) return null;
    return engine.getCurrentFlow();
  }, [engine, flowState]);

  /**
   * Current step definition (if active)
   */
  const currentStep = useMemo(() => {
    if (!flowState) return null;
    return engine.getCurrentStep();
  }, [engine, flowState]);

  /**
   * Whether a flow is currently active
   */
  const isFlowActive = flowState !== null && !flowState?.isComplete;

  /**
   * Whether back navigation is possible
   */
  const canGoBack = flowState?.stepHistory?.length > 0;

  /**
   * Current step's contextual questions
   */
  const contextualQuestions = useMemo(() => {
    if (!flowState) return [];
    return getContextualQuestions();
  }, [flowState, getContextualQuestions]);

  /**
   * All unlocked actions from completed flows
   */
  const unlockedActions = useMemo(() => {
    return getUnlockedActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedFlows, getUnlockedActions]);

  // -------------------------------------------------------------------------
  // Return Hook API
  // -------------------------------------------------------------------------

  return {
    // State
    flowState,
    conversationHistory,
    isProcessing,
    completedFlows,
    activeEntryIndex,

    // Computed
    currentFlow,
    currentStep,
    isFlowActive,
    canGoBack,
    contextualQuestions,
    unlockedActions,

    // Flow handlers
    startFlow,
    handleChoice,
    handleFormSubmit,
    handleEntitySelect,
    handleAction,
    goBack,
    cancelFlow,

    // Conversation handlers
    addQAEntry,
    clearConversation,
    truncateToEntry,
    setActiveEntry,

    // Utilities
    getContextualQuestions,
    getTaskQuestions,
    getUnlockedActions,

    // Direct engine access (for advanced use cases)
    engine,
    repository: FlowRepository,
  };
}

export default useTaskFlow;
export { useTaskFlow };

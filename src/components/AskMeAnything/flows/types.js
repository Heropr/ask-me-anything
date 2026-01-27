/**
 * Flow Engine Type Definitions
 *
 * This file defines the contracts/interfaces for the flow engine architecture.
 * The flow engine powers all conversation flows (booking, claim, family, etc.)
 * and provides a consistent pattern for adding new flows.
 *
 * NOTE: This is a prototype using JSDoc for type documentation.
 * Types are descriptive only - no runtime enforcement.
 */

// =============================================================================
// CARD TYPES - The visual building blocks of flows
// =============================================================================

/**
 * Card types that can be rendered in the conversation.
 * Each type has a corresponding renderer in TaskCard component.
 *
 * @typedef {'choices' | 'dentists' | 'form' | 'progress' | 'confirmation' | 'qa'} CardType
 */

/**
 * A choice option displayed in a choices card.
 *
 * @typedef {Object} Choice
 * @property {string} id - Unique identifier for the choice
 * @property {string} label - Display text for the choice
 * @property {string} [icon] - Emoji or icon to display
 */

/**
 * A form field definition for form cards.
 *
 * @typedef {Object} FormField
 * @property {string} id - Field identifier (used as key in form data)
 * @property {string} label - Display label
 * @property {'text' | 'select' | 'date'} [type='text'] - Field type
 * @property {string} [placeholder] - Placeholder text for text inputs
 * @property {string[]} [options] - Options for select fields
 * @property {boolean} [required=true] - Whether field is required
 */

/**
 * An action button displayed on confirmation cards.
 *
 * @typedef {Object} CardAction
 * @property {string} id - Action identifier
 * @property {string} label - Button text
 */

/**
 * A detail row displayed in confirmation cards.
 *
 * @typedef {Object} ConfirmationDetail
 * @property {string} label - Detail label (left side)
 * @property {string} value - Detail value (right side)
 */

/**
 * A step in the agent progress card.
 *
 * @typedef {Object} AgentStep
 * @property {string} label - Main text for the step
 * @property {string} detail - Secondary detail text
 * @property {'pending' | 'working' | 'done'} [status='pending'] - Current status
 */

/**
 * A suggested next step shown on confirmation cards.
 *
 * @typedef {Object} NextStep
 * @property {string} text - Display text
 * @property {boolean} isTask - Whether this triggers a task flow
 */

// =============================================================================
// FLOW STEP - A single step in a flow
// =============================================================================

/**
 * Defines a single step within a flow.
 * Each step renders a specific card type and defines possible transitions.
 *
 * @typedef {Object} FlowStep
 * @property {string} id - Unique step identifier (e.g., 'reason', 'severity', 'dentists')
 * @property {CardType} cardType - Type of card to render
 * @property {string} [prompt] - Question/prompt text displayed to user
 *
 * Card-specific properties (include based on cardType):
 * @property {Choice[]} [choices] - For cardType 'choices'
 * @property {FormField[]} [fields] - For cardType 'form'
 * @property {AgentStep[]} [agentSteps] - For cardType 'progress'
 * @property {string} [title] - For cardType 'confirmation'
 * @property {string} [subtitle] - For cardType 'confirmation'
 * @property {ConfirmationDetail[]} [details] - For cardType 'confirmation'
 * @property {CardAction[]} [actions] - For cardType 'confirmation'
 * @property {NextStep[]} [nextSteps] - Suggested follow-ups for confirmation cards
 *
 * Data fetching (for dynamic steps):
 * @property {string} [dataKey] - Key to fetch data from repository (e.g., 'dentists')
 * @property {function(FlowState): Object} [dataFilter] - Filter/transform fetched data
 *
 * Transition logic:
 * @property {string | function(Choice, FlowState): string} [nextStep] - Next step ID or resolver
 * @property {boolean} [isTerminal=false] - If true, this is the final step
 * @property {boolean} [requiresProcessing=false] - If true, show progress card before this step
 */

/**
 * Example FlowStep for a choices card:
 *
 * @example
 * const reasonStep = {
 *   id: 'reason',
 *   cardType: 'choices',
 *   prompt: 'What brings you in today?',
 *   choices: [
 *     { id: 'routine', label: 'Routine cleaning', icon: '...' },
 *     { id: 'pain', label: 'Pain or discomfort', icon: '...' },
 *     { id: 'procedure', label: 'Specific procedure', icon: '...' },
 *   ],
 *   nextStep: (choice, state) => choice.id === 'pain' ? 'severity' : 'dentists',
 * };
 */

// =============================================================================
// FLOW DEFINITION - A complete flow
// =============================================================================

/**
 * Defines a complete flow with all its steps and metadata.
 *
 * @typedef {Object} FlowDefinition
 * @property {string} id - Unique flow identifier (e.g., 'booking', 'claim', 'family')
 * @property {string} displayName - Human-readable name shown in UI (e.g., 'Book an appointment')
 * @property {string} [icon] - Icon identifier for the flow
 * @property {string} initialStep - ID of the first step to render
 * @property {Object.<string, FlowStep>} steps - Map of step ID to FlowStep
 * @property {string[]} [contextualQuestions] - Questions to show in sidebar during this flow
 * @property {Object.<string, string[]>} [stepQuestions] - Questions per step (step ID -> questions)
 * @property {NextStep[]} [unlockedActions] - Actions unlocked after flow completion
 * @property {function(FlowState): boolean} [canStart] - Guard function for starting flow
 */

/**
 * Example FlowDefinition:
 *
 * @example
 * const bookingFlow = {
 *   id: 'booking',
 *   displayName: 'Book an appointment',
 *   icon: 'calendar',
 *   initialStep: 'reason',
 *   steps: {
 *     reason: { ... },
 *     severity: { ... },
 *     dentists: { ... },
 *     confirm: { ... },
 *   },
 *   stepQuestions: {
 *     reason: ['What counts as a dental emergency?', ...],
 *     dentists: ['How do I know they are in-network?', ...],
 *   },
 *   unlockedActions: [
 *     { text: 'Reschedule appointment', isTask: true },
 *     { text: 'Cancel appointment', isTask: true },
 *   ],
 * };
 */

// =============================================================================
// FLOW STATE - Runtime state of an active flow
// =============================================================================

/**
 * Runtime state tracking for an active flow instance.
 *
 * @typedef {Object} FlowState
 * @property {string} flowId - ID of the active flow definition
 * @property {string} currentStep - ID of the current step
 * @property {Object.<string, any>} data - Accumulated data from user interactions
 * @property {string[]} stepHistory - Ordered list of visited step IDs (for back navigation)
 * @property {boolean} isComplete - Whether the flow has reached a terminal step
 * @property {boolean} isProcessing - Whether an agent task is currently running
 * @property {Object} [selectedEntity] - Entity selected during flow (e.g., dentist)
 */

/**
 * Example FlowState during a booking flow:
 *
 * @example
 * const state = {
 *   flowId: 'booking',
 *   currentStep: 'dentists',
 *   data: {
 *     reason: 'Routine cleaning',
 *   },
 *   stepHistory: ['reason'],
 *   isComplete: false,
 *   isProcessing: false,
 * };
 */

// =============================================================================
// CONVERSATION ENTRY - Items in the conversation history
// =============================================================================

/**
 * A single entry in the conversation history.
 * Can be either a Q&A exchange or a task card.
 *
 * @typedef {Object} ConversationEntry
 * @property {number} id - Unique entry ID (typically timestamp)
 * @property {'qa' | 'task-card'} type - Entry type
 *
 * For type 'qa':
 * @property {string} [question] - The question asked (null for system messages)
 * @property {string} answer - The response text
 * @property {boolean} [isTaskClarification] - If true, asked during a task flow
 *
 * For type 'task-card':
 * @property {CardType} cardType - Type of card to render
 * @property {string} [prompt] - Card prompt text
 * @property {Choice[]} [choices] - For choices cards
 * @property {Object[]} [dentists] - For dentists cards
 * @property {FormField[]} [fields] - For form cards
 * @property {AgentStep[]} [steps] - For progress cards
 * @property {string} [title] - For confirmation cards
 * @property {string} [subtitle] - For confirmation cards
 * @property {ConfirmationDetail[]} [details] - For confirmation cards
 * @property {CardAction[]} [actions] - For confirmation cards
 * @property {NextStep[]} [nextSteps] - For confirmation cards
 */

// =============================================================================
// FLOW ENGINE INTERFACE - Methods exposed by the engine
// =============================================================================

/**
 * The Flow Engine interface - central controller for all flow operations.
 *
 * @typedef {Object} FlowEngine
 *
 * Flow lifecycle:
 * @property {function(string): void} startFlow - Start a flow by ID
 * @property {function(): void} completeFlow - Mark current flow as complete
 * @property {function(): void} cancelFlow - Cancel and exit current flow
 * @property {function(): boolean} canGoBack - Check if back navigation is possible
 * @property {function(): void} goBack - Navigate to previous step
 *
 * User interactions:
 * @property {function(Choice): void} handleChoice - Process a choice selection
 * @property {function(Object): void} handleFormSubmit - Process form submission
 * @property {function(Object): void} handleEntitySelect - Process entity selection (e.g., dentist)
 * @property {function(CardAction): void} handleAction - Process confirmation card action
 *
 * State access:
 * @property {function(): FlowState | null} getState - Get current flow state
 * @property {function(): FlowDefinition | null} getCurrentFlow - Get current flow definition
 * @property {function(): FlowStep | null} getCurrentStep - Get current step definition
 * @property {function(): ConversationEntry | null} getCurrentCard - Get card to render
 * @property {function(): boolean} isFlowActive - Check if a flow is in progress
 *
 * Sidebar/questions:
 * @property {function(): string[]} getContextualQuestions - Get sidebar questions for current state
 * @property {function(): NextStep[]} getUnlockedActions - Get actions unlocked by completed flows
 *
 * Agent/processing:
 * @property {function(AgentStep[], function(): void): void} runAgentSteps - Execute agent processing
 * @property {function(): boolean} isProcessing - Check if agent is working
 */

/**
 * Example usage of FlowEngine:
 *
 * @example
 * // Starting a flow
 * engine.startFlow('booking');
 *
 * // Handling user choice
 * engine.handleChoice({ id: 'routine', label: 'Routine cleaning' });
 *
 * // Getting current card to render
 * const card = engine.getCurrentCard();
 * // -> { type: 'task-card', cardType: 'dentists', ... }
 *
 * // Checking sidebar questions
 * const questions = engine.getContextualQuestions();
 * // -> ['How do I know they are in-network?', ...]
 */

// =============================================================================
// FLOW REPOSITORY INTERFACE - Data access abstraction
// =============================================================================

/**
 * Repository interface for data access.
 * Abstracts data fetching so flows work with local data now, API later.
 *
 * @typedef {Object} FlowRepository
 *
 * Flow definitions:
 * @property {function(string): FlowDefinition | null} getFlow - Get flow definition by ID
 * @property {function(): FlowDefinition[]} getAllFlows - Get all registered flows
 * @property {function(FlowDefinition): void} registerFlow - Register a new flow
 *
 * Domain data:
 * @property {function(Object): Promise<Dentist[]>} getDentists - Fetch dentists (with filters)
 * @property {function(): Object.<string, string>} getExploreAnswers - Get Q&A answer map
 * @property {function(string): string[]} getExploreQuestions - Get questions for topic
 * @property {function(string, string): string[]} getTaskQuestions - Get questions for flow/step
 *
 * User data (for future API integration):
 * @property {function(): Promise<Object>} getUserProfile - Get current user profile
 * @property {function(): Promise<Object[]>} getUserAppointments - Get user's appointments
 * @property {function(): Promise<Object[]>} getUserClaims - Get user's claims
 * @property {function(): Promise<Object[]>} getUserFamily - Get user's family members
 */

/**
 * Dentist entity returned by repository.
 *
 * @typedef {Object} Dentist
 * @property {number} id - Unique dentist ID
 * @property {string} name - Full name (e.g., 'Dr. Sarah Chen')
 * @property {string} distance - Distance from user (e.g., '0.8 mi')
 * @property {number} rating - Rating out of 5 (e.g., 4.9)
 * @property {string} nextSlot - Next available slot (e.g., 'Today 2:00 PM')
 * @property {string} address - Full address
 */

// =============================================================================
// TRANSITION HELPERS - Utility types for flow transitions
// =============================================================================

/**
 * Result of a transition computation.
 * Used by the engine to determine what happens after user interaction.
 *
 * @typedef {Object} TransitionResult
 * @property {string | null} nextStep - ID of next step (null if terminal)
 * @property {Object} [dataUpdates] - Data to merge into flow state
 * @property {boolean} [requiresProcessing] - Whether to show progress card
 * @property {AgentStep[]} [agentSteps] - Steps to run if processing required
 * @property {ConversationEntry} [entryToAdd] - Entry to add to conversation
 */

/**
 * Context passed to transition functions.
 *
 * @typedef {Object} TransitionContext
 * @property {FlowState} state - Current flow state
 * @property {FlowDefinition} flow - Current flow definition
 * @property {FlowStep} step - Current step definition
 * @property {FlowRepository} repository - Data access
 */

// =============================================================================
// EVENT TYPES - For flow engine events/callbacks
// =============================================================================

/**
 * Events emitted by the flow engine.
 * Components can subscribe to these for UI updates.
 *
 * @typedef {'flowStarted' | 'flowCompleted' | 'flowCancelled' | 'stepChanged' | 'processingStarted' | 'processingCompleted' | 'entryAdded'} FlowEventType
 */

/**
 * Event payload for flow engine events.
 *
 * @typedef {Object} FlowEvent
 * @property {FlowEventType} type - Event type
 * @property {FlowState} [state] - Current state (if applicable)
 * @property {ConversationEntry} [entry] - Entry added (for entryAdded)
 * @property {string} [flowId] - Flow ID (for start/complete/cancel)
 * @property {string} [previousStep] - Previous step (for stepChanged)
 */

/**
 * Callback for flow engine events.
 *
 * @callback FlowEventHandler
 * @param {FlowEvent} event - The event payload
 */

// =============================================================================
// EXPLORE MODE TYPES - For non-task Q&A interactions
// =============================================================================

/**
 * A question item that can appear in the sidebar or chips.
 *
 * @typedef {Object} QuestionItem
 * @property {string} text - Question text
 * @property {boolean} isTask - Whether this triggers a task flow
 * @property {boolean} [isStable] - For animation: item existed in previous list
 * @property {boolean} [isNew] - For animation: item is new to the list
 */

/**
 * Topic categories for explore mode questions.
 *
 * @typedef {'initial' | 'coverage' | 'cost'} ExploreTopic
 */

// =============================================================================
// EXPORTS (for documentation purposes - these are type-only)
// =============================================================================

/**
 * All exported types for use in other modules.
 * Import with: import { FlowStep, FlowDefinition, ... } from './types';
 *
 * Note: Since this is JSDoc-only (no TypeScript), these exports are
 * documentation-only. The types serve as contracts for implementation.
 */
export const Types = {
  // This export exists only for documentation.
  // In practice, these types are used via JSDoc comments throughout the codebase.
};

export default Types;

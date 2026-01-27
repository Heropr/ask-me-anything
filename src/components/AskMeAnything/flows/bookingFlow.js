/**
 * Booking Flow Definition
 *
 * Proof-of-concept flow for booking dental appointments.
 * Demonstrates:
 * - Multi-step wizard with choices
 * - Dynamic transitions based on user input
 * - Entity selection (dentist)
 * - Agent processing with progress steps
 * - Confirmation with unlocked actions
 */

import FlowRepository from './FlowRepository';

/**
 * @type {import('./types').FlowDefinition}
 */
const bookingFlow = {
  id: 'booking',
  displayName: 'Book an appointment',
  icon: 'calendar',
  initialStep: 'reason',

  // Step questions for sidebar - maps step ID to contextual questions
  stepQuestions: {
    reason: [
      "What counts as a dental emergency?",
      "Can I see a specialist directly?",
      "What's covered in a routine visit?",
    ],
    severity: [
      "Should I go to urgent care instead?",
      "Is emergency care covered?",
      "How quickly can I be seen?",
    ],
    dentists: [
      "How do I know they're in-network?",
      "Can I see ratings and reviews?",
      "What if I want a different time?",
    ],
    confirm: [
      "Can I reschedule if needed?",
      "What should I bring?",
      "How early should I arrive?",
    ],
  },

  // Actions unlocked after completing this flow
  unlockedActions: [
    { text: "Reschedule appointment", isTask: true },
    { text: "Cancel appointment", isTask: true },
  ],

  // Step definitions
  steps: {
    // -------------------------------------------------------------------------
    // Step 1: Reason for visit
    // -------------------------------------------------------------------------
    reason: {
      id: 'reason',
      cardType: 'choices',
      prompt: "What brings you in today?",
      choices: [
        { id: 'routine', label: 'Routine cleaning', icon: '...' },
        { id: 'pain', label: 'Pain or discomfort', icon: '...' },
        { id: 'procedure', label: 'Specific procedure', icon: '...' },
      ],
      // Dynamic transition: pain goes to severity, others go to dentists
      nextStep: (choice) => {
        if (choice.id === 'pain') {
          return 'severity';
        }
        return 'dentists';
      },
    },

    // -------------------------------------------------------------------------
    // Step 2: Severity (only if pain selected)
    // -------------------------------------------------------------------------
    severity: {
      id: 'severity',
      cardType: 'choices',
      prompt: "How severe is the pain?",
      choices: [
        { id: 'mild', label: 'Mild discomfort', icon: '...' },
        { id: 'moderate', label: 'Significant pain', icon: '...' },
        { id: 'severe', label: "Can't eat or sleep", icon: '...' },
      ],
      nextStep: 'dentistsIntro',
    },

    // -------------------------------------------------------------------------
    // Step 2b: Intro message before dentists (for pain path)
    // -------------------------------------------------------------------------
    dentistsIntro: {
      id: 'dentistsIntro',
      cardType: 'qa',
      // Dynamic content based on severity
      getContent: (state) => {
        const isUrgent = state.data.severityId === 'severe';
        return {
          question: null,
          answer: isUrgent
            ? "Finding who can see you right away..."
            : "Finding dentists near you...",
        };
      },
      nextStep: 'dentists',
      // Auto-advance after brief delay (handled by engine)
      autoAdvance: true,
      autoAdvanceDelay: 500,
    },

    // -------------------------------------------------------------------------
    // Step 3: Select a dentist
    // -------------------------------------------------------------------------
    dentists: {
      id: 'dentists',
      cardType: 'dentists',
      prompt: "Here's who can see you:",
      // Data is fetched from repository
      dataKey: 'dentists',
      // Filter based on severity
      dataFilter: (state) => ({
        urgentOnly: state.data.severityId === 'severe',
      }),
      nextStep: 'processing',
    },

    // -------------------------------------------------------------------------
    // Step 4: Processing (agent work)
    // -------------------------------------------------------------------------
    processing: {
      id: 'processing',
      cardType: 'progress',
      requiresProcessing: true,
      agentSteps: [
        { label: 'Checking coverage...', detail: 'Verifying benefits' },
        { label: 'Confirming slot...', detail: '{entity.nextSlot}' },
        { label: 'Reserving...', detail: '{entity.name}' },
      ],
      nextStep: 'done',
    },

    // -------------------------------------------------------------------------
    // Step 5: Confirmation (terminal)
    // -------------------------------------------------------------------------
    done: {
      id: 'done',
      cardType: 'confirmation',
      isTerminal: true,
      title: "Appointment Confirmed",
      // subtitle comes from selected entity (dentist name)
      details: [
        { label: 'When', value: '{entity.nextSlot}' },
        { label: 'Where', value: '{entity.address}' },
        { label: 'Cost', value: '$0 (covered)' },
      ],
      actions: [
        { id: 'calendar', label: 'Add to calendar' },
        { id: 'reminder', label: 'Text reminder' },
      ],
      nextSteps: [
        { text: "What should I bring?", isTask: false },
        { text: "What's covered in a routine visit?", isTask: false },
      ],
    },
  },
};

/**
 * Register the booking flow with the repository
 */
function registerBookingFlow() {
  FlowRepository.registerFlow(bookingFlow);
}

export default bookingFlow;
export { bookingFlow, registerBookingFlow };

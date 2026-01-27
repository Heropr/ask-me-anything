/**
 * Cancel Flow Definition
 *
 * Unlocked action flow for cancelling a booked appointment.
 * Only available after completing a booking flow.
 * Demonstrates:
 * - Unlocked action pattern
 * - Yes/No confirmation
 * - Conditional processing based on user choice
 * - Different terminal states
 */

import FlowRepository from './FlowRepository';

/**
 * @type {import('./types').FlowDefinition}
 */
const cancelFlow = {
  id: 'cancel',
  displayName: 'Cancel appointment',
  icon: 'x-circle',
  initialStep: 'confirm',

  // Guard: Only allow if booking was completed
  canStart: (state) => {
    // In practice, check completedFlows includes 'booking'
    return true;
  },

  // Step questions for sidebar - maps step ID to contextual questions
  stepQuestions: {
    confirm: [
      "Will I be charged?",
      "Can I rebook later?",
    ],
    processing: [
      "Will I get a confirmation?",
      "How do I rebook?",
    ],
    done: [
      "How do I rebook?",
      "What's the cancellation policy?",
    ],
    kept: [
      "Can I reschedule instead?",
      "What should I bring?",
    ],
  },

  // No unlocked actions - this is itself an unlocked action
  unlockedActions: [],

  // Step definitions
  steps: {
    // -------------------------------------------------------------------------
    // Step 1: Confirm cancellation
    // -------------------------------------------------------------------------
    confirm: {
      id: 'confirm',
      cardType: 'choices',
      prompt: "Are you sure you want to cancel your appointment?",
      choices: [
        { id: 'yes', label: 'Yes, cancel it', icon: '...' },
        { id: 'no', label: 'No, keep it', icon: '...' },
      ],
      // Dynamic transition: yes goes to processing, no goes to kept
      nextStep: (choice) => {
        if (choice.id === 'yes') {
          return 'processing';
        }
        return 'kept';
      },
    },

    // -------------------------------------------------------------------------
    // Step 2: Processing (agent work) - only if cancelling
    // -------------------------------------------------------------------------
    processing: {
      id: 'processing',
      cardType: 'progress',
      requiresProcessing: true,
      agentSteps: [
        { label: 'Cancelling appointment...', detail: 'Dr. Michael Rodriguez' },
        { label: 'Updating records...', detail: 'Removing from schedule' },
        { label: 'Sending notification...', detail: 'Confirmation email' },
      ],
      nextStep: 'done',
    },

    // -------------------------------------------------------------------------
    // Step 3a: Cancellation confirmed (terminal)
    // -------------------------------------------------------------------------
    done: {
      id: 'done',
      cardType: 'confirmation',
      isTerminal: true,
      title: "Appointment Cancelled",
      details: [
        { label: 'Dentist', value: 'Dr. Michael Rodriguez' },
        { label: 'Status', value: 'Cancelled' },
        { label: 'Fee', value: '$0 (no charge)' },
      ],
      actions: [
        { id: 'rebook', label: 'Book new appointment' },
      ],
    },

    // -------------------------------------------------------------------------
    // Step 3b: Appointment kept (terminal)
    // -------------------------------------------------------------------------
    kept: {
      id: 'kept',
      cardType: 'confirmation',
      isTerminal: true,
      title: "Appointment Kept",
      subtitle: "Dr. Michael Rodriguez",
      details: [
        { label: 'When', value: 'Today 4:30 PM' },
        { label: 'Where', value: '456 Oak Ave, Austin TX' },
      ],
      actions: [
        { id: 'details', label: 'View details' },
      ],
    },
  },
};

/**
 * Register the cancel flow with the repository
 */
function registerCancelFlow() {
  FlowRepository.registerFlow(cancelFlow);
}

export default cancelFlow;
export { cancelFlow, registerCancelFlow };

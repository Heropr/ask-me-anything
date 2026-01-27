/**
 * Reschedule Flow Definition
 *
 * Unlocked action flow for rescheduling a booked appointment.
 * Only available after completing a booking flow.
 * Demonstrates:
 * - Unlocked action pattern
 * - Time selection choices
 * - Agent processing for schedule updates
 */

import FlowRepository from './FlowRepository';

/**
 * @type {import('./types').FlowDefinition}
 */
const rescheduleFlow = {
  id: 'reschedule',
  displayName: 'Reschedule appointment',
  icon: 'calendar',
  initialStep: 'confirm',

  // Guard: Only allow if booking was completed
  canStart: (state) => {
    // In practice, check completedFlows includes 'booking'
    return true;
  },

  // Step questions for sidebar - maps step ID to contextual questions
  stepQuestions: {
    confirm: [
      "Can I reschedule again?",
      "What's the cancellation policy?",
    ],
    processing: [
      "Will I get a confirmation?",
      "Can I change the dentist too?",
    ],
    done: [
      "Can I reschedule again?",
      "What should I bring?",
    ],
  },

  // No unlocked actions - this is itself an unlocked action
  unlockedActions: [],

  // Step definitions
  steps: {
    // -------------------------------------------------------------------------
    // Step 1: Choose new time
    // -------------------------------------------------------------------------
    confirm: {
      id: 'confirm',
      cardType: 'choices',
      prompt: "When would you like to reschedule to?",
      choices: [
        { id: 'tomorrow', label: 'Tomorrow morning', icon: '...' },
        { id: 'thisWeek', label: 'Later this week', icon: '...' },
        { id: 'nextWeek', label: 'Next week', icon: '...' },
      ],
      nextStep: 'processing',
    },

    // -------------------------------------------------------------------------
    // Step 2: Processing (agent work)
    // -------------------------------------------------------------------------
    processing: {
      id: 'processing',
      cardType: 'progress',
      requiresProcessing: true,
      agentSteps: [
        { label: 'Checking availability...', detail: '{choice.label}' },
        { label: 'Updating appointment...', detail: 'Dr. Michael Rodriguez' },
        { label: 'Sending confirmation...', detail: 'Email & SMS' },
      ],
      nextStep: 'done',
    },

    // -------------------------------------------------------------------------
    // Step 3: Confirmation (terminal)
    // -------------------------------------------------------------------------
    done: {
      id: 'done',
      cardType: 'confirmation',
      isTerminal: true,
      title: "Appointment Rescheduled",
      subtitle: "Dr. Michael Rodriguez",
      // Dynamic values based on choice
      getDetails: (state) => {
        const choiceId = state.data.confirmId;
        const newTime = choiceId === 'tomorrow'
          ? 'Tomorrow 9:00 AM'
          : choiceId === 'thisWeek'
            ? 'Friday 2:00 PM'
            : 'Monday 10:30 AM';
        return [
          { label: 'New time', value: newTime },
          { label: 'Location', value: '456 Oak Ave, Austin TX' },
          { label: 'Cost', value: '$0 (covered)' },
        ];
      },
      details: [
        { label: 'New time', value: '{newTime}' },
        { label: 'Location', value: '456 Oak Ave, Austin TX' },
        { label: 'Cost', value: '$0 (covered)' },
      ],
      actions: [
        { id: 'calendar', label: 'Update calendar' },
        { id: 'reminder', label: 'Text reminder' },
      ],
    },
  },
};

/**
 * Register the reschedule flow with the repository
 */
function registerRescheduleFlow() {
  FlowRepository.registerFlow(rescheduleFlow);
}

export default rescheduleFlow;
export { rescheduleFlow, registerRescheduleFlow };

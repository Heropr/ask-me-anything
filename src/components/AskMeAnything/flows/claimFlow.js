/**
 * Claim Flow Definition
 *
 * Flow for submitting dental insurance claims.
 * Demonstrates:
 * - Simple choice selection (photo vs upload)
 * - Agent processing with progress steps
 * - Confirmation with claim details and status
 */

import FlowRepository from './FlowRepository';

/**
 * @type {import('./types').FlowDefinition}
 */
const claimFlow = {
  id: 'claim',
  displayName: 'File a claim',
  icon: 'receipt',
  initialStep: 'method',

  // Step questions for sidebar - maps step ID to contextual questions
  stepQuestions: {
    method: [
      "What info do I need from my receipt?",
      "How long do I have to submit?",
      "What file formats work?",
    ],
    processing: [
      "How long until I hear back?",
      "How do I check claim status?",
      "What if it's denied?",
    ],
    done: [
      "How long until I hear back?",
      "How do I check claim status?",
      "What if it's denied?",
    ],
  },

  // Actions unlocked after completing this flow
  unlockedActions: [
    { text: "Check claim status", isTask: true },
  ],

  // Step definitions
  steps: {
    // -------------------------------------------------------------------------
    // Step 1: Choose submission method
    // -------------------------------------------------------------------------
    method: {
      id: 'method',
      cardType: 'choices',
      prompt: "How would you like to submit your claim?",
      choices: [
        { id: 'photo', label: 'Take a photo', icon: '...' },
        { id: 'upload', label: 'Upload file', icon: '...' },
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
        { label: 'Processing receipt...', detail: 'Reading document' },
        { label: 'Extracting info...', detail: 'Provider, date, amount' },
        { label: 'Submitting...', detail: 'To Smirk claims' },
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
      title: "Claim Submitted",
      details: [
        { label: 'Claim ID', value: 'CLM-{random}' },
        { label: 'Amount', value: '$185.00' },
        { label: 'Status', value: 'Processing (5-7 days)' },
      ],
      actions: [
        { id: 'track', label: 'Track status' },
        { id: 'another', label: 'File another' },
      ],
      nextSteps: [
        { text: "What if it's denied?", isTask: false },
        { text: "Book an appointment", isTask: true },
      ],
    },
  },
};

/**
 * Register the claim flow with the repository
 */
function registerClaimFlow() {
  FlowRepository.registerFlow(claimFlow);
}

export default claimFlow;
export { claimFlow, registerClaimFlow };

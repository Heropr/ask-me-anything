/**
 * Family Flow Definition
 *
 * Flow for adding family members to the dental plan.
 * Demonstrates:
 * - Form input with multiple field types
 * - Agent processing with validation steps
 * - Confirmation with member details
 */

import FlowRepository from './FlowRepository';

/**
 * @type {import('./types').FlowDefinition}
 */
const familyFlow = {
  id: 'family',
  displayName: 'Add a family member',
  icon: 'users',
  initialStep: 'form',

  // Step questions for sidebar - maps step ID to contextual questions
  stepQuestions: {
    form: [
      "Who counts as a dependent?",
      "What's the age limit for children?",
      "How much does it cost to add someone?",
    ],
    processing: [
      "How long until they're covered?",
      "Do they get their own card?",
      "Do they have the same benefits?",
    ],
    done: [
      "How long until they're covered?",
      "Do they get their own card?",
      "Do they have the same benefits?",
    ],
  },

  // Actions unlocked after completing this flow
  unlockedActions: [
    { text: "View family member's card", isTask: true },
    { text: "Remove family member", isTask: true },
  ],

  // Step definitions
  steps: {
    // -------------------------------------------------------------------------
    // Step 1: Form input for family member details
    // -------------------------------------------------------------------------
    form: {
      id: 'form',
      cardType: 'form',
      prompt: "Who would you like to add to your plan?",
      fields: [
        { id: 'name', label: 'Full name', placeholder: 'Jane Doe' },
        { id: 'relationship', label: 'Relationship', type: 'select', options: ['Spouse', 'Child', 'Domestic Partner'] },
        { id: 'dob', label: 'Date of birth', placeholder: 'MM/DD/YYYY' },
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
        { label: 'Validating...', detail: 'Checking eligibility' },
        { label: 'Adding to plan...', detail: '{formData.name}' },
        { label: 'Creating card...', detail: 'Member ID' },
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
      title: "Family Member Added",
      details: [
        { label: 'Name', value: '{formData.name}' },
        { label: 'Relationship', value: '{formData.relationship}' },
        { label: 'Coverage starts', value: 'Immediately' },
        { label: 'Member ID', value: 'SMK-{random}' },
      ],
      actions: [
        { id: 'card', label: 'View their card' },
      ],
      nextSteps: [
        { text: "Book an appointment", isTask: true },
        { text: "Do they have the same benefits?", isTask: false },
      ],
    },
  },
};

/**
 * Register the family flow with the repository
 */
function registerFamilyFlow() {
  FlowRepository.registerFlow(familyFlow);
}

export default familyFlow;
export { familyFlow, registerFamilyFlow };

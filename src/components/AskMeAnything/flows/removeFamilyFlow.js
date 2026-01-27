/**
 * Remove Family Flow Definition
 *
 * Unlocked action flow for removing a family member from the plan.
 * Only available after completing a family flow.
 * Demonstrates:
 * - Unlocked action pattern
 * - Entity selection (which family member)
 * - Agent processing for plan updates
 * - Confirmation with refund information
 */

import FlowRepository from './FlowRepository';

/**
 * @type {import('./types').FlowDefinition}
 */
const removeFamilyFlow = {
  id: 'removeFamily',
  displayName: 'Remove family member',
  icon: 'user-minus',
  initialStep: 'confirm',

  // Guard: Only allow if family was completed
  canStart: (state) => {
    // In practice, check completedFlows includes 'family'
    return true;
  },

  // Step questions for sidebar - maps step ID to contextual questions
  stepQuestions: {
    confirm: [
      "Will they lose coverage immediately?",
      "Is there a prorated refund?",
    ],
    processing: [
      "When does coverage end?",
      "Will I get a confirmation?",
    ],
    done: [
      "Can I add them back later?",
      "How is the refund processed?",
    ],
  },

  // No unlocked actions - this is itself an unlocked action
  unlockedActions: [],

  // Step definitions
  steps: {
    // -------------------------------------------------------------------------
    // Step 1: Choose which family member to remove
    // -------------------------------------------------------------------------
    confirm: {
      id: 'confirm',
      cardType: 'choices',
      prompt: "Which family member would you like to remove?",
      // In practice, these would be populated from repository.getUserFamily()
      choices: [
        { id: 'jane', label: 'Jane Doe (Spouse)', icon: '...' },
        { id: 'tom', label: 'Tom Doe (Child)', icon: '...' },
      ],
      // Data key for fetching family members dynamically
      dataKey: 'familyMembers',
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
        { label: 'Removing from plan...', detail: '{choice.label}' },
        { label: 'Updating coverage...', detail: 'Adjusting benefits' },
        { label: 'Processing refund...', detail: 'Prorated amount' },
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
      title: "Family Member Removed",
      // Dynamic details based on selected member
      getDetails: (state) => {
        const memberLabel = state.data.confirm || 'Family member';
        const memberName = memberLabel.split(' (')[0];
        return [
          { label: 'Member', value: memberName },
          { label: 'Coverage ends', value: 'End of billing cycle' },
          { label: 'Refund', value: '$12.50 (prorated)' },
        ];
      },
      details: [
        { label: 'Member', value: '{memberName}' },
        { label: 'Coverage ends', value: 'End of billing cycle' },
        { label: 'Refund', value: '$12.50 (prorated)' },
      ],
      actions: [
        { id: 'addAnother', label: 'Add another member' },
      ],
    },
  },
};

/**
 * Register the remove family flow with the repository
 */
function registerRemoveFamilyFlow() {
  FlowRepository.registerFlow(removeFamilyFlow);
}

export default removeFamilyFlow;
export { removeFamilyFlow, registerRemoveFamilyFlow };

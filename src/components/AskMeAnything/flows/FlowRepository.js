/**
 * FlowRepository - Local data repository for flow engine
 *
 * Abstracts data fetching so flows work with local data now, API later.
 * Contains all hardcoded data extracted from AskMeAnythingV4.jsx.
 */

// =============================================================================
// DOMAIN DATA - Dentists, Questions, Answers
// =============================================================================

const dentists = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    distance: "0.8 mi",
    rating: 4.9,
    nextSlot: "Today 2:00 PM",
    address: "123 Main St, Austin TX",
  },
  {
    id: 2,
    name: "Dr. Michael Rodriguez",
    distance: "1.2 mi",
    rating: 4.7,
    nextSlot: "Today 4:30 PM",
    address: "456 Oak Ave, Austin TX",
  },
  {
    id: 3,
    name: "Dr. Emily Watson",
    distance: "2.1 mi",
    rating: 4.8,
    nextSlot: "Tomorrow 9:00 AM",
    address: "789 Elm Blvd, Austin TX",
  },
];

// Explore mode questions - mix of informational and tasks
const exploreQuestions = {
  initial: [
    { text: "What does Smirk cover?", isTask: false },
    { text: "How much does Smirk cost?", isTask: false },
    { text: "Book an appointment", isTask: true },
    { text: "Does Smirk cover braces?", isTask: false },
    { text: "File a claim", isTask: true },
    { text: "Can I add my family?", isTask: true },
    { text: "What's the deductible?", isTask: false },
    { text: "How do I use my card?", isTask: false },
  ],
  coverage: [
    { text: "What preventive care is covered?", isTask: false },
    { text: "Are crowns and root canals covered?", isTask: false },
    { text: "Does Smirk cover braces?", isTask: false },
    { text: "Book an appointment", isTask: true },
    { text: "Are there waiting periods?", isTask: false },
    { text: "What's my annual maximum?", isTask: false },
    { text: "Is emergency care covered?", isTask: false },
    { text: "File a claim", isTask: true },
  ],
  cost: [
    { text: "What's the monthly premium?", isTask: false },
    { text: "How much for a family plan?", isTask: false },
    { text: "What's my deductible?", isTask: false },
    { text: "Book an appointment", isTask: true },
    { text: "Are there copays?", isTask: false },
    { text: "What does a cleaning cost me?", isTask: false },
    { text: "How much for a crown?", isTask: false },
    { text: "Add a family member", isTask: true },
  ],
};

// Task mode contextual questions - sparse, focused on current step
const taskQuestions = {
  booking: {
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
  claim: {
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
  },
  family: {
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
  },
  reschedule: {
    confirm: [
      "Can I reschedule again?",
      "What's the cancellation policy?",
    ],
  },
  cancel: {
    confirm: [
      "Will I be charged?",
      "Can I rebook later?",
    ],
  },
  removeFamily: {
    confirm: [
      "Will they lose coverage immediately?",
      "Is there a prorated refund?",
    ],
  },
};

// Actions that unlock after completing tasks
const unlockedActions = {
  booking: [
    { text: "Reschedule appointment", isTask: true },
    { text: "Cancel appointment", isTask: true },
  ],
  claim: [
    { text: "Check claim status", isTask: true },
  ],
  family: [
    { text: "View family member's card", isTask: true },
    { text: "Remove family member", isTask: true },
  ],
};

// Explore Q&A answers
const exploreAnswers = {
  "What does Smirk cover?": "Smirk covers preventive care at 100%, basic procedures at 80%, and major work at 50-60%. This includes cleanings, fillings, crowns, root canals, and more.",
  "How much does Smirk cost?": "Plans start at $19.99/month for individuals and $39.99/month for families. Your exact price depends on coverage level.",
  "Are there dentists near me?": "Smirk partners with over 10,000 dentists across Texas. Enter your ZIP in the member portal to find in-network providers.",
  "How do I make a claim?": "For in-network visits, claims are filed automatically. For out-of-network, submit your receipt through the portal or app.",
  "Does Smirk cover braces?": "Yes! Up to $2,500 in lifetime orthodontic benefits for both children and adults, covering braces and clear aligners.",
  "Can I add my family?": "You can add your spouse and dependent children at any time. Family members get the same coverage and network access.",
  "What's the deductible?": "Individual deductibles start at $50/year, family at $150/year. Preventive care is not subject to the deductible.",
  "How do I use my card?": "Present your member card at any in-network dentist. They'll verify coverage and bill Smirk directly.",
  "What preventive care is covered?": "Two cleanings per year, annual X-rays, and one exam—all at 100% with no waiting period.",
  "Are crowns and root canals covered?": "Yes, major procedures are covered at 50-60% after your deductible, with a 6-month waiting period.",
  "What's not covered?": "Cosmetic procedures like whitening aren't covered. Implants may be partially covered if medically necessary.",
  "Are there waiting periods?": "No wait for preventive care. 30 days for basic procedures, 6 months for major work.",
  "What's my annual maximum?": "Most plans have a $1,500-$2,500 annual maximum per person. Unused benefits don't roll over.",
  "Is emergency care covered?": "Yes, emergency care is covered 24/7 with no waiting period, even out-of-network.",
  "What about cosmetic procedures?": "Basic cosmetic procedures aren't covered. Veneers and implants may be partially covered if medically necessary.",
  "What's the monthly premium?": "Individual plans start at $19.99/month. Enhanced coverage is $29.99/month with lower deductibles.",
  "How much for a family plan?": "Family plans start at $39.99/month, covering you, spouse, and children up to age 26.",
  "What's the out-of-pocket max?": "Your annual out-of-pocket maximum is $1,500 per person.",
  "Are there copays?": "Preventive visits have no copay. Other services have copays based on your plan and procedure type.",
  "Is there an annual discount?": "Yes! Save 10% by switching to annual billing instead of monthly.",
  "What does a cleaning cost me?": "Cleanings are covered at 100% for preventive visits—$0 out of pocket at in-network dentists.",
  "How much for a crown?": "Crowns are covered at 50-60% after deductible. You'd typically pay $300-$500 out of pocket.",
};

// Task clarification answers
const taskClarificationAnswers = {
  "What counts as a dental emergency?": "Severe pain, swelling, knocked-out teeth, or broken teeth that cause pain are dental emergencies.",
  "Should I go to urgent care instead?": "For dental issues, a dentist is usually better equipped. But if you have severe swelling affecting breathing, go to the ER.",
  "How do I know they're in-network?": "All dentists shown here are in-network. You can also verify any dentist in your member portal.",
  "Can I reschedule if needed?": "Yes, you can reschedule up to 24 hours before your appointment at no charge.",
  "What info do I need from my receipt?": "Provider name, date of service, procedure codes, and amount paid. A clear photo usually captures all of this.",
  "Who counts as a dependent?": "Spouse, domestic partner, and children up to age 26 (or any age if disabled).",
};

// =============================================================================
// FLOW DEFINITIONS REGISTRY
// =============================================================================

/** @type {Map<string, import('./types').FlowDefinition>} */
const flowRegistry = new Map();

// =============================================================================
// REPOSITORY INTERFACE
// =============================================================================

/**
 * FlowRepository implementation
 * @type {import('./types').FlowRepository}
 */
const FlowRepository = {
  // -------------------------------------------------------------------------
  // Flow Definitions
  // -------------------------------------------------------------------------

  /**
   * Get a flow definition by ID
   * @param {string} flowId
   * @returns {import('./types').FlowDefinition | null}
   */
  getFlow(flowId) {
    return flowRegistry.get(flowId) || null;
  },

  /**
   * Get all registered flows
   * @returns {import('./types').FlowDefinition[]}
   */
  getAllFlows() {
    return Array.from(flowRegistry.values());
  },

  /**
   * Register a new flow definition
   * @param {import('./types').FlowDefinition} flow
   */
  registerFlow(flow) {
    flowRegistry.set(flow.id, flow);
  },

  // -------------------------------------------------------------------------
  // Domain Data - Dentists
  // -------------------------------------------------------------------------

  /**
   * Get dentists list with optional filters
   * @param {Object} [filters]
   * @param {boolean} [filters.urgentOnly] - Only return dentists with immediate availability
   * @returns {Promise<import('./types').Dentist[]>}
   */
  async getDentists(filters = {}) {
    // Simulate async for future API compatibility
    await new Promise((resolve) => setTimeout(resolve, 0));

    if (filters.urgentOnly) {
      return dentists.slice(0, 2);
    }
    return dentists;
  },

  /**
   * Synchronous version for immediate access
   * @param {Object} [filters]
   * @returns {import('./types').Dentist[]}
   */
  getDentistsSync(filters = {}) {
    if (filters.urgentOnly) {
      return dentists.slice(0, 2);
    }
    return dentists;
  },

  // -------------------------------------------------------------------------
  // Domain Data - Questions
  // -------------------------------------------------------------------------

  /**
   * Get explore questions for a topic
   * @param {import('./types').ExploreTopic} topic
   * @returns {import('./types').QuestionItem[]}
   */
  getExploreQuestions(topic = 'initial') {
    return exploreQuestions[topic] || exploreQuestions.initial;
  },

  /**
   * Get all explore answers
   * @returns {Object.<string, string>}
   */
  getExploreAnswers() {
    return exploreAnswers;
  },

  /**
   * Get answer for an explore question
   * @param {string} question
   * @returns {string}
   */
  getExploreAnswer(question) {
    return exploreAnswers[question] || "I can help you with that. What specific information do you need?";
  },

  /**
   * Get questions for a specific task step
   * @param {string} flowId
   * @param {string} stepId
   * @returns {string[]}
   */
  getTaskQuestions(flowId, stepId) {
    return taskQuestions[flowId]?.[stepId] || [];
  },

  /**
   * Get answer for a task clarification question
   * @param {string} question
   * @returns {string}
   */
  getTaskClarificationAnswer(question) {
    return taskClarificationAnswers[question] ||
      "That's a great question. The short answer is yes - Smirk is designed to be flexible. Want me to explain more?";
  },

  // -------------------------------------------------------------------------
  // Domain Data - Unlocked Actions
  // -------------------------------------------------------------------------

  /**
   * Get unlocked actions for a completed flow
   * @param {string} flowId
   * @returns {import('./types').NextStep[]}
   */
  getUnlockedActions(flowId) {
    return unlockedActions[flowId] || [];
  },

  /**
   * Get all unlocked actions for multiple completed flows
   * @param {string[]} completedFlowIds
   * @returns {import('./types').NextStep[]}
   */
  getAllUnlockedActions(completedFlowIds) {
    return completedFlowIds.flatMap((flowId) => unlockedActions[flowId] || []);
  },

  // -------------------------------------------------------------------------
  // User Data (stubs for future API integration)
  // -------------------------------------------------------------------------

  /**
   * Get current user profile
   * @returns {Promise<Object>}
   */
  async getUserProfile() {
    return {
      id: 'user-1',
      name: 'John Doe',
      memberId: 'SMK-123456',
    };
  },

  /**
   * Get user's appointments
   * @returns {Promise<Object[]>}
   */
  async getUserAppointments() {
    return [
      {
        id: 'apt-1',
        dentist: dentists[1],
        time: 'Today 4:30 PM',
        status: 'confirmed',
      },
    ];
  },

  /**
   * Get user's claims
   * @returns {Promise<Object[]>}
   */
  async getUserClaims() {
    return [];
  },

  /**
   * Get user's family members
   * @returns {Promise<Object[]>}
   */
  async getUserFamily() {
    return [
      { id: 'fam-1', name: 'Jane Doe', relationship: 'Spouse', memberId: 'SMK-7X92KL' },
      { id: 'fam-2', name: 'Tom Doe', relationship: 'Child', memberId: 'SMK-8Y93LM' },
    ];
  },
};

export default FlowRepository;

// Also export individual data accessors for direct use
export {
  dentists,
  exploreQuestions,
  taskQuestions,
  unlockedActions,
  exploreAnswers,
  taskClarificationAnswers,
};

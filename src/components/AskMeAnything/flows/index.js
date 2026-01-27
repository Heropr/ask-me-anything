/**
 * Flow Engine Module Exports
 *
 * Central export point for all flow-related functionality.
 */

// Core engine
export { default as createFlowEngine, createEventEmitter } from './FlowEngine';

// Repository
export { default as FlowRepository } from './FlowRepository';
export {
  dentists,
  exploreQuestions,
  taskQuestions,
  unlockedActions,
  exploreAnswers,
  taskClarificationAnswers,
} from './FlowRepository';

// Flow definitions - Primary flows
export { bookingFlow, registerBookingFlow } from './bookingFlow';
export { claimFlow, registerClaimFlow } from './claimFlow';
export { familyFlow, registerFamilyFlow } from './familyFlow';

// Flow definitions - Unlocked action flows
export { rescheduleFlow, registerRescheduleFlow } from './rescheduleFlow';
export { cancelFlow, registerCancelFlow } from './cancelFlow';
export { removeFamilyFlow, registerRemoveFamilyFlow } from './removeFamilyFlow';

// Types (for documentation)
export { Types } from './types';

/**
 * Register all flows with the repository.
 * Call this once at app initialization.
 */
export function registerAllFlows() {
  // Import and register each flow
  const { registerBookingFlow } = require('./bookingFlow');
  const { registerClaimFlow } = require('./claimFlow');
  const { registerFamilyFlow } = require('./familyFlow');
  const { registerRescheduleFlow } = require('./rescheduleFlow');
  const { registerCancelFlow } = require('./cancelFlow');
  const { registerRemoveFamilyFlow } = require('./removeFamilyFlow');

  registerBookingFlow();
  registerClaimFlow();
  registerFamilyFlow();
  registerRescheduleFlow();
  registerCancelFlow();
  registerRemoveFamilyFlow();
}

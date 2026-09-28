export const REVEAL_AFTER_MISSES = 3;

/**
 * Keep vocabulary reveal rules in one place so target/prompt text in every
 * renderer uses the same retry behaviour. Answer values use their own
 * representation contract from idle state; this rule is only for target/prompt
 * text and never hides a selectable answer. The counter belongs to the current
 * challenge and is owned by App.jsx; this module deliberately has no storage or
 * React state.
 */
export function getChallengeRevealState(wrongAttempts = 0) {
  const safeWrongAttempts = Math.max(0, Number(wrongAttempts) || 0);

  return {
    wrongAttempts: safeWrongAttempts,
    shouldReveal: safeWrongAttempts >= REVEAL_AFTER_MISSES,
    remainingMisses: Math.max(REVEAL_AFTER_MISSES - safeWrongAttempts, 0),
  };
}

export function shouldRevealVocabulary(wrongAttempts = 0) {
  return getChallengeRevealState(wrongAttempts).shouldReveal;
}

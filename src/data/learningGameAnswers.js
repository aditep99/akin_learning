const ANSWER_KINDS = {
  choice: "choice",
  value: "value",
  memoryPair: "memory-pair",
  sortItem: "sort-item",
  sequenceLetter: "sequence-letter",
};

const MODE_ANSWER_KINDS = {
  "word-fishing": ANSWER_KINDS.choice,
  "zombie-word-munch": ANSWER_KINDS.choice,
  "number-blaster": ANSWER_KINDS.value,
  "shape-shield": ANSWER_KINDS.value,
  "memory-match": ANSWER_KINDS.memoryPair,
  "pattern-pop": ANSWER_KINDS.choice,
  "treasure-sort": ANSWER_KINDS.sortItem,
  "sound-safari": ANSWER_KINDS.choice,
  "word-rocket": ANSWER_KINDS.sequenceLetter,
  "sound-bubble-pop": ANSWER_KINDS.choice,
  "monster-delivery": ANSWER_KINDS.choice,
  "echo-memory": ANSWER_KINDS.memoryPair,
};

export { ANSWER_KINDS };

export function getLearningGameAnswerKind(challenge) {
  return challenge?.answerKind || MODE_ANSWER_KINDS[challenge?.mode] || null;
}

function createInvalidResult(challenge, suffix = "invalid") {
  return {
    correct: false,
    complete: false,
    feedbackId: `${challenge?.id || "learning-game"}-${suffix}`,
  };
}

function validateChoice(challenge, action) {
  const choiceId = action?.choiceId;
  const correct = Boolean(choiceId) && choiceId === challenge.correctChoiceId;

  return {
    correct,
    complete: correct,
    feedbackId: choiceId || `${challenge.id}-choice-missing`,
  };
}

function validateValue(challenge, action) {
  const value = action?.value;
  const expected = challenge.correctAnswer ?? challenge.targetShape;
  const correct = value === expected;

  return {
    correct,
    complete: correct,
    feedbackId: `${challenge.id}-${String(value ?? "missing")}`,
  };
}

function validateMemoryPair(challenge, action, state) {
  const firstPairId = action?.firstPairId;
  const secondPairId = action?.secondPairId;
  const hasPairIds = Boolean(firstPairId) && Boolean(secondPairId);
  const knownPairIds = new Set(
    Array.isArray(challenge.pairs)
      ? challenge.pairs.map((pair) => pair.id)
      : [],
  );
  const correct =
    hasPairIds &&
    firstPairId === secondPairId &&
    knownPairIds.has(firstPairId);
  const matchedPairIds = new Set(state?.matchedPairIds || []);

  if (correct) {
    matchedPairIds.add(firstPairId);
  }

  return {
    correct,
    complete:
      correct &&
      Array.isArray(challenge.pairs) &&
      matchedPairIds.size >= challenge.pairs.length,
    feedbackId: `${challenge.id}-memory-${
      action?.firstCardId || "first"
    }-${action?.secondCardId || "second"}`,
  };
}

function validateSortItem(challenge, action, state) {
  const item = challenge.items?.find((entry) => entry.id === action?.itemId);
  const correct = Boolean(item) && item.basketId === action?.basketId;
  const placedItemIds = new Set(state?.placedItemIds || []);

  if (correct) {
    placedItemIds.add(item.id);
  }

  return {
    correct,
    complete:
      correct &&
      Array.isArray(challenge.items) &&
      placedItemIds.size >= challenge.items.length,
    feedbackId: `${challenge.id}-sort-${action?.itemId || "missing"}-${
      action?.basketId || "missing"
    }`,
  };
}

function validateSequenceLetter(challenge, action, state) {
  const target = String(challenge.targetWord?.word || challenge.targetWord || "")
    .toUpperCase();
  const builtLetters = Array.isArray(state?.builtLetters)
    ? state.builtLetters
    : [];
  const expectedLetter = target[builtLetters.length];
  const letter = String(action?.letter || "").toUpperCase();
  const correct = Boolean(expectedLetter) && letter === expectedLetter;
  const nextLength = builtLetters.length + (correct ? 1 : 0);

  return {
    correct,
    complete: correct && nextLength >= target.length,
    feedbackId: `${challenge.id}-letter-${action?.index ?? action?.letter ?? "missing"}`,
  };
}

export function validateLearningGameAnswer(challenge, action = {}, state = {}) {
  if (!challenge) {
    return createInvalidResult(challenge);
  }

  const answerKind = getLearningGameAnswerKind(challenge);

  switch (answerKind) {
    case ANSWER_KINDS.choice:
      return validateChoice(challenge, action);
    case ANSWER_KINDS.value:
      return validateValue(challenge, action);
    case ANSWER_KINDS.memoryPair:
      return validateMemoryPair(challenge, action, state);
    case ANSWER_KINDS.sortItem:
      return validateSortItem(challenge, action, state);
    case ANSWER_KINDS.sequenceLetter:
      return validateSequenceLetter(challenge, action, state);
    default:
      return createInvalidResult(challenge);
  }
}

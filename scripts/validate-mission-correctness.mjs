import { readFile } from "node:fs/promises";
import { createServer } from "vite";
import { reviewedSemanticCases } from "./fixtures/mission-semantic-cases.mjs";

const SEEDS_PER_LEVEL_OR_MODE = 256;
const GENERATED_SUBJECT_IDS = new Set(["math", "math-lessons", "math-genius"]);
const SPELLING_MODES = new Set([
  "spelling-order",
  "token-bank-limited",
  "missing-letter",
  "sound-to-word-choice",
  "tricky-word-pick",
  "learn-write-speak",
  "write-from-memory",
  "word-repair",
  "spelling-sprint",
]);
const CHOICE_MODES = new Set([
  "picture-pick",
  "sound-pick",
  "word-to-picture",
  "odd-one-out",
  "vocab-choice",
]);
const SHAPES = new Set(["circle", "triangle", "square", "rectangle", "oval", "diamond"]);
const RETIRED_MODES = new Set(["first-letter-pick", "letter-ninja"]);

const findings = [];
const stats = {
  authoredChallenges: 0,
  reviewedSemanticCases: reviewedSemanticCases.length,
  randomizedStandardSessions: 0,
  randomizedLearningSessions: 0,
  mathQuestSessions: 0,
  mathLessonSessions: 0,
  mathGeniusSessions: 0,
  arcadeChallenges: 0,
  generatedChallenges: 0,
  boundaryFixtures: 0,
};

function addFinding(context, reason) {
  findings.push({
    subject: context.subject || "unknown",
    level: context.level || "unknown",
    challengeId: context.challengeId || "unknown",
    reason,
    ...(context.seed === undefined ? {} : { seed: context.seed }),
  });
}

function expect(condition, context, reason) {
  if (!condition) {
    addFinding(context, reason);
    return false;
  }

  return true;
}

function validateSurfaceInheritance(surfaceModule, subjectId, level, challenge = null, trackId = "", seed) {
  const surface = surfaceModule.getSurfaceDefinition(
    subjectId,
    level?.levelNumber || level?.lessonNumber,
    { trackId },
  );

  if (!surface) {
    return;
  }

  const context = {
    subject: subjectId,
    level: trackId ? `${trackId}/${level.id}` : level.id,
    challengeId: challenge?.id || "surface-contract",
    ...(seed === undefined ? {} : { seed }),
  };

  expect(level.surfaceId === surface.surfaceId, context, "level surfaceId drifted from canonical roster");
  expect(level.surfaceKind === surface.kind, context, "level surfaceKind drifted from canonical roster");
  expect(level.surfaceVariant === surface.surfaceVariant, context, "level surfaceVariant drifted from canonical roster");

  if (challenge) {
    expect(challenge.surfaceId === surface.surfaceId, context, "challenge surfaceId was not inherited from its level");
    expect(challenge.surfaceKind === surface.kind, context, "challenge surfaceKind was not inherited from its level");
    expect(challenge.surfaceVariant === surface.surfaceVariant, context, "challenge surfaceVariant was not inherited from its level");
  }
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function sorted(values = []) {
  return [...values].map(String).sort();
}

function sameMembers(left = [], right = []) {
  const a = sorted(left);
  const b = sorted(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function hasUniqueValues(values = []) {
  return new Set(values.map((value) => String(value))).size === values.length;
}

function countOccurrences(values, target) {
  return values.filter((value) => value === target).length;
}

function createRng(seed = 1) {
  let value = seed >>> 0;

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function hashSeed(value) {
  let hash = 2166136261;

  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function withSeed(seed, callback) {
  const originalRandom = Math.random;
  Math.random = createRng(seed);

  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
}

function exerciseContext(subject, level, challenge, seed) {
  return {
    subject,
    level,
    challengeId: challenge?.id || "missing-id",
    seed,
  };
}

function validateChoiceList(challenge, context) {
  const choices = Array.isArray(challenge.choices) ? challenge.choices : [];
  const ids = choices.map((choice) => choice?.id);

  expect(choices.length >= 2, context, "answer choices are missing or incomplete");
  expect(ids.every(hasText), context, "every answer choice must have a stable ID");
  expect(hasUniqueValues(ids), context, "answer choice IDs must be unique");
  expect(hasText(challenge.correctChoiceId), context, "correctChoiceId is missing");
  expect(
    countOccurrences(ids, challenge.correctChoiceId) === 1,
    context,
    "correctChoiceId must identify exactly one visible choice",
  );

  const correctChoice = choices.find((choice) => choice?.id === challenge.correctChoiceId);
  if (challenge.randomizableTarget && correctChoice) {
    if (hasText(challenge.promptWord)) {
      expect(
        challenge.promptWord === correctChoice.word,
        context,
        "promptWord does not match the correct randomized choice",
      );
    }

    if (hasText(challenge.listenText)) {
      expect(
        challenge.listenText === correctChoice.word,
        context,
        "listenText does not match the correct randomized choice",
      );
    }
  }
}

function validateSortChallenge(challenge, context) {
  const baskets = Array.isArray(challenge.baskets) ? challenge.baskets : [];
  const items = Array.isArray(challenge.items) ? challenge.items : [];
  const basketIds = baskets.map((basket) => basket?.id);
  const itemIds = items.map((item) => item?.id);

  expect(baskets.length === 2, context, "sort mission must have exactly two baskets");
  expect(basketIds.every(hasText), context, "every basket must have an ID");
  expect(hasUniqueValues(basketIds), context, "basket IDs must be unique");
  expect(baskets.every((basket) => hasText(basket?.label)), context, "every basket must have a visible label");
  expect(items.length >= 2, context, "sort mission has too few items");
  expect(itemIds.every(hasText), context, "every sort item must have an ID");
  expect(hasUniqueValues(itemIds), context, "sort item IDs must be unique");
  expect(
    items.every((item) => basketIds.includes(item?.basketId)),
    context,
    "a sort item points to an unknown basket",
  );
  expect(
    basketIds.every((basketId) => items.some((item) => item.basketId === basketId)),
    context,
    "each basket must have at least one expected member",
  );
}

function validateHotspotChallenge(challenge, context) {
  const hotspots = Array.isArray(challenge.hotspots) ? challenge.hotspots : [];
  const ids = hotspots.map((hotspot) => hotspot?.id);

  expect(hotspots.length >= 2, context, "hotspot mission has too few target locations");
  expect(ids.every(hasText), context, "every hotspot must have an accessible ID");
  expect(hasUniqueValues(ids), context, "hotspot IDs must be unique");
  expect(
    hotspots.every(
      (hotspot) =>
        Number.isFinite(hotspot?.x) &&
        hotspot.x >= 0 &&
        hotspot.x <= 100 &&
        Number.isFinite(hotspot?.y) &&
        hotspot.y >= 0 &&
        hotspot.y <= 100,
    ),
    context,
    "hotspot coordinates must stay inside the 0-100 percent body map",
  );
  expect(
    countOccurrences(ids, challenge.targetHotspotId) === 1,
    context,
    "targetHotspotId must identify exactly one location",
  );
}

function tokenValues(tokens = []) {
  return tokens.map((token) => (token && typeof token === "object" ? token.value : token));
}

function validateSpellingChallenge(challenge, context) {
  const targetTokens = Array.isArray(challenge.targetTokens) ? challenge.targetTokens : [];
  const shuffledTokens = Array.isArray(challenge.shuffledTokens) ? challenge.shuffledTokens : [];

  expect(hasText(challenge.word), context, "spelling target word is missing");
  expect(targetTokens.length > 0, context, "spelling target tokens are missing");
  expect(targetTokens.join("") === challenge.word, context, "target tokens do not reconstruct the displayed word");

  if (["spelling-order", "token-bank-limited", "learn-write-speak"].includes(challenge.mode)) {
    expect(
      sameMembers(tokenValues(shuffledTokens), targetTokens),
      context,
      "shuffled tokens do not contain the same token multiset as the target word",
    );
    expect(
      hasUniqueValues(shuffledTokens.map((token) => token?.id)),
      context,
      "shuffled spelling token IDs must be unique",
    );
  }

  if (challenge.mode === "token-bank-limited") {
    const bankTokens = Array.isArray(challenge.bankTokens) ? challenge.bankTokens : [];
    expect(bankTokens.length >= targetTokens.length, context, "limited token bank is incomplete");
    expect(hasUniqueValues(bankTokens.map((token) => token?.id)), context, "limited token bank IDs must be unique");
    expect(
      targetTokens.every((token) => bankTokens.some((entry) => entry?.value === token)),
      context,
      "limited token bank must contain every target token",
    );
  }

  if (challenge.mode === "missing-letter") {
    const patternTokens = Array.isArray(challenge.patternTokens) ? challenge.patternTokens : [];
    const restored = patternTokens.map((token, index) =>
      index === challenge.missingIndex ? challenge.correctAnswer : token,
    );
    expect(patternTokens.length === targetTokens.length, context, "missing-letter pattern length does not match the word");
    expect(patternTokens.filter((token) => token === null).length === 1, context, "missing-letter mission must have exactly one blank");
    expect(restored.join("") === challenge.word, context, "missing-letter answer does not reconstruct the target word");
    expect(countOccurrences(tokenValues(challenge.choices || []), challenge.correctAnswer) === 1, context, "missing-letter answer must appear exactly once");
  }

  if (["sound-to-word-choice", "tricky-word-pick"].includes(challenge.mode)) {
    expect(
      countOccurrences(tokenValues(challenge.choices || []), challenge.correctAnswer) === 1,
      context,
      "word-choice spelling answer must appear exactly once",
    );
  }

  if (["write-from-memory", "spelling-sprint"].includes(challenge.mode)) {
    expect(challenge.answerPolicy === "exact-word", context, "text spelling challenge must use exact-word validation");
    expect(hasText(challenge.promptText), context, "text spelling challenge prompt is missing");
  }

  if (challenge.mode === "word-repair") {
    const patternTokens = Array.isArray(challenge.patternTokens) ? challenge.patternTokens : [];
    const restored = patternTokens.map((token, index) =>
      index === challenge.repairIndex ? challenge.correctAnswer : token,
    );
    expect(patternTokens.length === targetTokens.length, context, "word-repair pattern length does not match the word");
    expect(patternTokens.filter((token) => token === null).length === 1, context, "word-repair must expose exactly one repair slot");
    expect(restored.join("") === challenge.word, context, "word-repair answer does not reconstruct the target word");
    expect(countOccurrences(tokenValues(challenge.choices || []), challenge.correctAnswer) === 1, context, "word-repair answer must appear exactly once");
  }
}

function validateStandardChallenge(challenge, context) {
  expect(hasText(challenge?.id), context, "challenge ID is missing");
  expect(hasText(challenge?.mode || challenge?.type), context, "challenge mode is missing");
  expect(!RETIRED_MODES.has(challenge?.mode), context, "retired first-letter challenge mode must not be authored");

  if (CHOICE_MODES.has(challenge?.mode)) {
    validateChoiceList(challenge, context);
  } else if (challenge?.mode === "sort-two-baskets") {
    validateSortChallenge(challenge, context);
  } else if (challenge?.mode === "hotspot-place") {
    validateHotspotChallenge(challenge, context);
  } else if (SPELLING_MODES.has(challenge?.mode)) {
    validateSpellingChallenge(challenge, context);
  }
}

function validateReviewedSemanticManifest(library) {
  const authored = [];

  for (const subject of library) {
    for (const level of subject.levels || []) {
      for (const challenge of level.exercises || []) {
        if (["odd-one-out", "sort-two-baskets"].includes(challenge.mode)) {
          authored.push({ subject, level, challenge });
        }
      }
    }
  }

  const authoredById = new Map(authored.map((entry) => [entry.challenge.id, entry]));
  const manifestById = new Map();

  for (const semanticCase of reviewedSemanticCases) {
    const context = exerciseContext(
      semanticCase.subjectId,
      "reviewed-manifest",
      { id: semanticCase.challengeId },
    );

    expect(!manifestById.has(semanticCase.challengeId), context, "reviewed semantic manifest contains a duplicate challenge ID");
    manifestById.set(semanticCase.challengeId, semanticCase);

    const entry = authoredById.get(semanticCase.challengeId);
    if (!expect(Boolean(entry), context, "reviewed semantic case is stale because the authored challenge is missing")) {
      continue;
    }

    expect(entry.subject.id === semanticCase.subjectId, context, "reviewed semantic case points to the wrong subject");
    expect(entry.challenge.mode === semanticCase.mode, context, "reviewed semantic case mode differs from authored content");
    expect(hasText(semanticCase.rule), context, "reviewed semantic case must explain its classification rule");
    expect(hasText(entry.challenge.promptText), context, "reviewed semantic mission must have an explicit prompt");

    if (semanticCase.mode === "odd-one-out") {
      expect(
        sameMembers(entry.challenge.groupWords?.map((word) => word.id), semanticCase.groupIds),
        context,
        "odd-one-out group differs from the reviewed expected members",
      );
      expect(
        entry.challenge.correctChoiceId === semanticCase.correctChoiceId,
        context,
        "odd-one-out correct answer differs from the reviewed expected answer",
      );
      continue;
    }

    const expectedBasketIds = Object.keys(semanticCase.baskets || {});
    expect(
      sameMembers(entry.challenge.baskets?.map((basket) => basket.id), expectedBasketIds),
      context,
      "sort basket IDs differ from the reviewed semantic case",
    );

    for (const [basketId, expectedMembers] of Object.entries(semanticCase.baskets || {})) {
      const actualMembers = (entry.challenge.items || [])
        .filter((item) => item.basketId === basketId)
        .map((item) => item.id);
      expect(
        sameMembers(actualMembers, expectedMembers),
        context,
        `basket ${basketId} differs from the reviewed expected members`,
      );
    }
  }

  for (const { subject, level, challenge } of authored) {
    const context = exerciseContext(subject.id, level.id, challenge);
    expect(
      manifestById.has(challenge.id),
      context,
      "authored category mission is not registered in the reviewed semantic manifest",
    );
  }

  expect(
    authored.length === reviewedSemanticCases.length,
    { subject: "content", level: "reviewed-manifest", challengeId: "manifest-coverage" },
    `reviewed manifest count ${reviewedSemanticCases.length} does not match authored category mission count ${authored.length}`,
  );
}

function applyOperator(left, operator, right) {
  if (operator === "+") return left + right;
  if (operator === "-") return left - right;
  return Number.NaN;
}

function validateMathQuestChallenge(challenge, context, mathModule) {
  const normalized = mathModule.normalizeMathSceneChallenge(challenge);
  const sceneAnimals = Array.isArray(normalized?.sceneAnimals) ? normalized.sceneAnimals : [];
  const sceneIds = sceneAnimals.map((animal) => animal?.id);
  const answerChoices = Array.isArray(normalized?.answerChoices) ? normalized.answerChoices : [];
  const expectedAnswer = applyOperator(normalized?.leftCount, normalized?.operator, normalized?.rightCount);

  expect(["+", "-"].includes(normalized?.operator), context, "Math Quest operator must be + or -");
  expect(expectedAnswer === normalized?.answer, context, "Math Quest answer does not match its equation");
  expect(answerChoices.length === 4, context, "Math Quest must expose four answer choices");
  expect(hasUniqueValues(answerChoices), context, "Math Quest answer choices must be unique");
  expect(countOccurrences(answerChoices, normalized?.answer) === 1, context, "Math Quest correct answer must appear exactly once");
  expect(sceneAnimals.length > 0, context, "Math Quest scene has no animals");
  expect(sceneIds.every(hasText), context, "every Math Quest scene animal must have an instance ID");
  expect(hasUniqueValues(sceneIds), context, "Math Quest scene animal instance IDs must be unique");
  expect(sceneAnimals.every((animal) => hasText(animal?.wordId)), context, "every Math Quest scene animal must have a category wordId");
  expect(
    sameMembers(normalized?.sceneMeta?.focusIds, sceneIds),
    context,
    "Math Quest focusIds must reference every normalized instance ID exactly once",
  );

  if (normalized?.operator === "+") {
    const leftCount = sceneAnimals.filter((animal) => animal.wordId === normalized.leftAnimal?.id).length;
    const rightCount = sceneAnimals.filter((animal) => animal.wordId === normalized.rightAnimal?.id).length;
    expect(leftCount === normalized.leftCount, context, "addition scene does not contain the stated first group count");
    expect(rightCount === normalized.rightCount, context, "addition scene does not contain the stated second group count");
    expect((normalized.sceneMeta?.removedIds || []).length === 0, context, "addition scene must not mark removed animals");
    return;
  }

  const removedIds = normalized?.sceneMeta?.removedIds || [];
  const removedIdSet = new Set(removedIds);
  expect(sceneAnimals.length === normalized.leftCount, context, "subtraction scene must show the full start group");
  expect(removedIds.length === normalized.rightCount, context, "subtraction removed count does not match the right operand");
  expect(hasUniqueValues(removedIds), context, "subtraction removedIds must be unique");
  expect(removedIds.every((id) => sceneIds.includes(id)), context, "subtraction removedIds must reference visible instance IDs");
  expect(
    sceneAnimals.filter((animal) => removedIdSet.has(animal.id)).every((animal) => animal.wordId === normalized.rightAnimal?.id),
    context,
    "subtraction marks an animal outside the take-away category",
  );
  expect(
    sceneAnimals.filter((animal) => !removedIdSet.has(animal.id)).length === normalized.answer,
    context,
    "visible animals left after removal do not match the final answer",
  );
}

function validateChoiceContains(challenge, expected, context) {
  const choices = Array.isArray(challenge.choices) ? challenge.choices : [];
  expect(choices.length >= 2, context, "math lesson choices are incomplete");
  expect(hasUniqueValues(choices), context, "math lesson choices must be unique");
  expect(countOccurrences(choices, expected) === 1, context, "math lesson correct answer must appear exactly once");
}

function validateSceneOperand(operand, context, side) {
  expect(Number.isFinite(operand?.value), context, `${side} comparison operand has no numeric value`);
  if (operand?.type === "scene") {
    expect(Array.isArray(operand.items), context, `${side} comparison scene is missing items`);
    expect(operand.items?.length === operand.value, context, `${side} comparison scene count differs from its value`);
  }
}

function validateMathLessonChallenge(challenge, context) {
  const expectedEquation = () => applyOperator(challenge.leftValue, challenge.operator, challenge.rightValue);

  switch (challenge.mode) {
    case "count-select":
      expect(challenge.sceneItems?.length === challenge.correctAnswer, context, "count-select answer differs from the picture count");
      validateChoiceContains(challenge, challenge.correctAnswer, context);
      break;
    case "number-to-scene": {
      const choices = Array.isArray(challenge.choices) ? challenge.choices : [];
      const ids = choices.map((choice) => choice?.id);
      expect(choices.length === 4, context, "number-to-scene must have four picture groups");
      expect(hasUniqueValues(ids), context, "number-to-scene choice IDs must be unique");
      expect(hasUniqueValues(choices.map((choice) => choice?.value)), context, "number-to-scene picture counts must be unique");
      expect(choices.every((choice) => choice?.items?.length === choice?.value), context, "a number-to-scene picture count differs from its value");
      const matching = choices.filter((choice) => choice?.value === challenge.displayValue);
      expect(matching.length === 1, context, "number-to-scene must have exactly one group matching the displayed number");
      expect(matching[0]?.id === challenge.correctAnswer, context, "number-to-scene correct ID does not point to the matching group");
      break;
    }
    case "number-sequence": {
      const sequence = Array.isArray(challenge.sequence) ? challenge.sequence : [];
      const missingIndex = sequence.findIndex((value) => value === null);
      const known = sequence
        .map((value, index) => ({ value, index }))
        .filter((entry) => Number.isFinite(entry.value));
      const difference = known.length >= 2
        ? (known[1].value - known[0].value) / (known[1].index - known[0].index)
        : Number.NaN;
      const expected = known.length > 0
        ? known[0].value + difference * (missingIndex - known[0].index)
        : Number.NaN;
      expect(sequence.length === 4 && sequence.filter((value) => value === null).length === 1, context, "number sequence must contain one blank in four positions");
      expect([1, -1].includes(difference), context, "number sequence must move in steps of one");
      expect(expected === challenge.correctAnswer, context, "number sequence answer does not fill the sequence");
      validateChoiceContains(challenge, challenge.correctAnswer, context);
      break;
    }
    case "before-after-choice": {
      const expected = challenge.direction === "before"
        ? challenge.referenceValue - 1
        : challenge.referenceValue + 1;
      expect(expected === challenge.correctAnswer, context, "before/after answer is incorrect");
      validateChoiceContains(challenge, challenge.correctAnswer, context);
      break;
    }
    case "number-order-pick": {
      const expected = challenge.orderGoal === "smallest"
        ? Math.min(...challenge.choices)
        : Math.max(...challenge.choices);
      expect(expected === challenge.correctAnswer, context, "smallest/biggest answer is incorrect");
      validateChoiceContains(challenge, challenge.correctAnswer, context);
      break;
    }
    case "parity-pick": {
      const expected = challenge.displayValue % 2 === 0 ? "Even" : "Odd";
      expect(expected === challenge.correctAnswer, context, "even/odd answer is incorrect");
      if (challenge.displayMode === "scene") {
        expect(challenge.sceneItems?.length === challenge.displayValue, context, "parity picture count differs from the displayed value");
      }
      validateChoiceContains(challenge, challenge.correctAnswer, context);
      break;
    }
    case "parity-target-pick": {
      const expectedParity = challenge.correctAnswer % 2 === 0 ? "Even" : "Odd";
      expect(expectedParity === challenge.targetParity, context, "parity target answer has the wrong parity");
      expect(
        challenge.choices.filter((value) => (value % 2 === 0 ? "Even" : "Odd") === challenge.targetParity).length === 1,
        context,
        "parity target mission must have exactly one matching number",
      );
      validateChoiceContains(challenge, challenge.correctAnswer, context);
      break;
    }
    case "parity-true-false": {
      const actual = challenge.displayValue % 2 === 0 ? "Even" : "Odd";
      const expected = actual === challenge.shownParity ? "True" : "False";
      expect(expected === challenge.correctAnswer, context, "parity true/false answer is incorrect");
      validateChoiceContains(challenge, challenge.correctAnswer, context);
      break;
    }
    case "compare-pick": {
      validateSceneOperand(challenge.compareLeft, context, "left");
      validateSceneOperand(challenge.compareRight, context, "right");
      const left = challenge.compareLeft?.value;
      const right = challenge.compareRight?.value;
      const expected = left > right ? ">" : left < right ? "<" : "=";
      expect(expected === challenge.correctAnswer, context, "comparison sign is incorrect");
      validateChoiceContains(challenge, challenge.correctAnswer, context);
      break;
    }
    case "equation-choice":
    case "equation-input":
      expect(expectedEquation() === challenge.correctAnswer, context, `${challenge.mode} answer does not match the equation`);
      if (challenge.mode === "equation-choice") validateChoiceContains(challenge, challenge.correctAnswer, context);
      break;
    case "scene-equation-choice":
      expect(challenge.leftItems?.length === challenge.leftValue, context, "left picture group differs from the left operand");
      expect(challenge.rightItems?.length === challenge.rightValue, context, "right picture group differs from the right operand");
      expect(expectedEquation() === challenge.correctAnswer, context, "scene equation answer is incorrect");
      validateChoiceContains(challenge, challenge.correctAnswer, context);
      break;
    case "true-false-equation": {
      const expected = expectedEquation() === challenge.shownAnswer ? "True" : "False";
      expect(expected === challenge.correctAnswer, context, "equation true/false answer is incorrect");
      validateChoiceContains(challenge, challenge.correctAnswer, context);
      break;
    }
    case "missing-part": {
      let expected;
      if (challenge.missingSide === "left") {
        expected = challenge.operator === "+"
          ? challenge.resultValue - challenge.rightValue
          : challenge.resultValue + challenge.rightValue;
      } else {
        expected = challenge.operator === "+"
          ? challenge.resultValue - challenge.leftValue
          : challenge.leftValue - challenge.resultValue;
      }
      expect(expected === challenge.correctAnswer, context, "missing-part answer does not complete the equation");
      validateChoiceContains(challenge, challenge.correctAnswer, context);
      break;
    }
    case "choose-operator": {
      const validOperators = challenge.choices.filter(
        (operator) => applyOperator(challenge.leftValue, operator, challenge.rightValue) === challenge.resultValue,
      );
      expect(validOperators.length === 1, context, "choose-operator mission is ambiguous or has no valid operator");
      expect(validOperators[0] === challenge.correctAnswer, context, "choose-operator correct answer is incorrect");
      validateChoiceContains(challenge, challenge.correctAnswer, context);
      break;
    }
    case "place-value-choice": {
      const expected = challenge.placeTarget === "tens"
        ? Math.floor(challenge.displayValue / 10)
        : challenge.displayValue % 10;
      expect(expected === challenge.correctAnswer, context, "place-value answer is incorrect");
      validateChoiceContains(challenge, challenge.correctAnswer, context);
      break;
    }
    case "shape-pick":
      expect(SHAPES.has(challenge.shapeGoal), context, "shape mission has an unsupported shape");
      expect(challenge.correctAnswer === challenge.shapeGoal, context, "shape answer does not match the requested shape");
      validateChoiceContains(challenge, challenge.correctAnswer, context);
      break;
    default:
      addFinding(context, `unsupported Math Lessons mode: ${challenge.mode}`);
  }
}

function validateMathGeniusChallenge(challenge, context) {
  switch (challenge.mode) {
    case "column-equation-input":
      expect(
        applyOperator(challenge.leftValue, challenge.operator, challenge.rightValue) === challenge.correctAnswer,
        context,
        "column equation answer is incorrect",
      );
      break;
    case "story-number-input": {
      let expected = Number.NaN;
      if (challenge.storyKind === "daily-total") {
        expected = (challenge.dailyValues || []).reduce((total, value) => total + value, 0);
      } else if (["addition", "subtraction"].includes(challenge.storyKind)) {
        expected = applyOperator(challenge.leftValue, challenge.operator, challenge.rightValue);
      }
      expect(expected === challenge.correctAnswer, context, "story number answer does not match the story values");
      break;
    }
    case "story-operator-input": {
      const validOperators = ["+", "-"].filter(
        (operator) => applyOperator(challenge.leftValue, operator, challenge.rightValue) === challenge.resultValue,
      );
      expect(validOperators.length === 1, context, "story operator mission is ambiguous or unsolvable");
      expect(validOperators[0] === challenge.correctAnswer, context, "story operator answer is incorrect");
      break;
    }
    case "story-chain-input": {
      const [startValue, firstValue, secondValue] = challenge.values || [];
      const [firstOperator, secondOperator] = challenge.correctOperators || [];
      const middle = applyOperator(startValue, firstOperator, firstValue);
      const expected = applyOperator(middle, secondOperator, secondValue);
      expect(expected === challenge.correctAnswer, context, "story chain answer is incorrect");
      expect([firstOperator, secondOperator].every((operator) => ["+", "-"].includes(operator)), context, "story chain contains an unsupported operator");
      break;
    }
    default:
      addFinding(context, `unsupported Math Genius mode: ${challenge.mode}`);
  }
}

function validateLearningChallenge(challenge, context, answerModule) {
  expect(hasText(challenge?.id), context, "learning game challenge ID is missing");
  expect(hasText(challenge?.mode), context, "learning game mode is missing");
  expect(!RETIRED_MODES.has(challenge?.mode), context, "retired learning-game mode must not be authored");

  if (challenge.answerKind === "choice") {
    const ids = (challenge.choices || []).map((choice) => choice?.id);
    expect(hasUniqueValues(ids), context, "learning game choice IDs must be unique");
    expect(countOccurrences(ids, challenge.correctChoiceId) === 1, context, "learning game correct choice must appear exactly once");
    if (challenge.targetWord?.id) {
      expect(challenge.targetWord.id === challenge.correctChoiceId, context, "learning game target word and correct choice differ");
    }
    if (challenge.mode === "sound-bubble-pop") {
      expect(challenge.promptWord === challenge.targetWord?.word, context, "Sound Bubble Pop prompt does not match its target word");
      expect(
        (challenge.choices || []).every((choice) => hasText(choice?.word)),
        context,
        "Sound Bubble Pop choices must expose visible vocabulary words",
      );
    }
    if (challenge.mode === "pattern-pop") {
      const sequence = challenge.sequence || [];
      const expected = sequence.length >= 2 ? sequence[sequence.length - 2]?.id : null;
      expect(expected === challenge.correctChoiceId, context, "pattern answer does not continue the visible AB pattern");
    }
    expect(
      answerModule.validateLearningGameAnswer(challenge, { choiceId: challenge.correctChoiceId }).correct,
      context,
      "shared learning-game validator rejects the declared correct choice",
    );
    return;
  }

  if (challenge.answerKind === "value") {
    expect(countOccurrences(challenge.choices || [], challenge.correctAnswer ?? challenge.targetShape) === 1, context, "learning game value answer must appear exactly once");
    if (challenge.mode === "number-blaster") {
      expect(applyOperator(challenge.leftValue, challenge.operator, challenge.rightValue) === challenge.correctAnswer, context, "Number Blaster answer is incorrect");
    } else if (challenge.mode === "shape-shield") {
      expect(challenge.targetShape === challenge.correctAnswer, context, "Shape Shield answer differs from the target shape");
    }
    expect(
      answerModule.validateLearningGameAnswer(challenge, { value: challenge.correctAnswer ?? challenge.targetShape }).correct,
      context,
      "shared learning-game validator rejects the declared correct value",
    );
    return;
  }

  if (challenge.answerKind === "memory-pair") {
    const pairIds = (challenge.pairs || []).map((pair) => pair?.id);
    expect(pairIds.length >= 2, context, "memory game needs at least two pairs");
    expect(hasUniqueValues(pairIds), context, "memory pair IDs must be unique");
    for (const pairId of pairIds) {
      expect(
        answerModule.validateLearningGameAnswer(challenge, { firstPairId: pairId, secondPairId: pairId }, {}).correct,
        context,
        `shared memory validator rejects pair ${pairId}`,
      );
    }
    return;
  }

  if (challenge.answerKind === "sort-item") {
    validateSortChallenge(challenge, context);
    for (const item of challenge.items || []) {
      expect(
        answerModule.validateLearningGameAnswer(challenge, { itemId: item.id, basketId: item.basketId }, {}).correct,
        context,
        `shared sort validator rejects ${item.id} in ${item.basketId}`,
      );
    }
    return;
  }

  if (challenge.answerKind === "sequence-letter") {
    const targetLetters = Array.from(challenge.targetWord?.word || "").map((letter) => letter.toUpperCase());
    const availableLetters = (challenge.letters || []).map((letter) => String(letter).toUpperCase());
    for (const letter of new Set(targetLetters)) {
      expect(
        countOccurrences(availableLetters, letter) >= countOccurrences(targetLetters, letter),
        context,
        `word rocket is missing required letter ${letter}`,
      );
    }
    return;
  }

  addFinding(context, `unsupported learning-game answer kind: ${challenge.answerKind}`);
}

function validateBoundaryFixtures(content, mathModule, migrationModule) {
  const legacy = {
    id: "legacy-math-6-minus-3",
    operator: "-",
    leftAnimal: { id: "cat", word: "Cat" },
    rightAnimal: { id: "cat", word: "Cat" },
    leftCount: 6,
    rightCount: 3,
    answer: 3,
    answerChoices: [0, 12, 8, 3],
    sceneAnimals: Array.from({ length: 6 }, () => ({ id: "cat", word: "Cat" })),
    sceneMeta: {
      mode: "remove",
      removedIds: ["cat-4", "cat-5", "cat-6"],
      focusIds: ["cat", "cat", "cat", "cat", "cat", "cat"],
    },
  };
  const context = exerciseContext("math", "legacy-activeMission", legacy, "fixture");
  validateMathQuestChallenge(legacy, context, mathModule);
  const normalized = mathModule.normalizeMathSceneChallenge(legacy);
  expect(
    sameMembers(normalized.sceneMeta.removedIds, ["cat-4", "cat-5", "cat-6"]),
    context,
    "legacy duplicate-ID repair must deterministically mark the final rightCount animals",
  );
  stats.boundaryFixtures += 1;

  const allChallenges = content.defaultLibrary.flatMap((subject) =>
    (subject.levels || []).flatMap((level) => level.exercises || []),
  );
  const thaiCat = allChallenges.find((challenge) => challenge.id === "thai-ex-l1-5");
  const thaiDog = allChallenges.find((challenge) => challenge.id === "thai-spelling-l2-6");
  expect(
    thaiCat?.word === "แมว" && thaiCat.mode === "spelling-order" && thaiCat.targetTokens.join("") === "แมว",
    exerciseContext("thai-exercises", "level-1", thaiCat || { id: "thai-ex-l1-5" }, "fixture"),
    "Thai Exercises Level 1 must use full-word spelling order",
  );
  expect(
    thaiDog?.word === "หมา" && thaiDog.mode === "token-bank-limited" && thaiDog.targetTokens.join("") === "หมา",
    exerciseContext("thai-spelling", "level-2", thaiDog || { id: "thai-spelling-l2-6" }, "fixture"),
    "Thai Spelling Level 2 must use the token-bank spelling interaction",
  );
  stats.boundaryFixtures += 2;

  const legacyFirstLetter = {
    id: "legacy-thai-first-letter",
    type: "first-letter-pick",
    mode: "first-letter-pick",
    word: "แมว",
    language: "th",
    targetTokens: ["แ", "ม", "ว"],
    correctAnswer: "แ",
    answerPolicy: "first-written-token",
    choices: [{ id: "legacy-first-choice", value: "แ" }],
  };
  const migratedSpelling = migrationModule.migrateLegacyChallenge(legacyFirstLetter);
  expect(
    migratedSpelling.status === "migrated" &&
      migratedSpelling.challenge.mode === "spelling-order" &&
      migratedSpelling.challenge.targetTokens.join("") === "แมว" &&
      sameMembers(
        migratedSpelling.challenge.shuffledTokens.map((token) => token.value),
        ["แ", "ม", "ว"],
      ) &&
      !Array.isArray(migratedSpelling.challenge.choices),
    exerciseContext("thai-exercises", "legacy-first-letter", legacyFirstLetter, "fixture"),
    "legacy first-letter challenge must migrate to full-word spelling order",
  );

  const legacyLetterNinja = {
    id: "legacy-letter-ninja",
    type: "learning-game",
    mode: "letter-ninja",
    answerKind: "value",
    targetWord: { id: "elephant", word: "elephant", emoji: "🐘" },
    choices: ["A", "E", "L", "T"],
    correctAnswer: "E",
  };
  const migratedLearningGame = migrationModule.migrateLegacyChallenge(
    legacyLetterNinja,
    {
      wordPool: [
        legacyLetterNinja.targetWord,
        { id: "apple", word: "apple", emoji: "🍎" },
        { id: "orange", word: "orange", emoji: "🍊" },
        { id: "tiger", word: "tiger", emoji: "🐯" },
      ],
    },
  );
  expect(
    migratedLearningGame.status === "migrated" &&
      migratedLearningGame.challenge.mode === "sound-bubble-pop" &&
      migratedLearningGame.challenge.answerKind === "choice" &&
      migratedLearningGame.challenge.correctChoiceId === "elephant" &&
      migratedLearningGame.challenge.choices.every((choice) => typeof choice.word === "string"),
    exerciseContext("learning-games", "legacy-letter-ninja", legacyLetterNinja, "fixture"),
    "legacy Letter Ninja challenge must migrate to Sound Bubble Pop choices",
  );
  stats.boundaryFixtures += 2;

  for (const [id, left, operator, right, expected] of [
    ["zero-addition", 0, "+", 0, 0],
    ["two-digit-boundary", 89, "+", 10, 99],
    ["zero-result-subtraction", 99, "-", 99, 0],
  ]) {
    expect(
      applyOperator(left, operator, right) === expected,
      { subject: "math", level: "boundary-fixtures", challengeId: id, seed: "fixture" },
      "independent arithmetic boundary fixture failed",
    );
    stats.boundaryFixtures += 1;
  }
}

async function validateSourceContracts() {
  const mathScreen = await readFile(new URL("../src/screens/MathGameplayScreen.jsx", import.meta.url), "utf8");
  const spellingScreen = await readFile(new URL("../src/screens/SpellingGameplayScreen.jsx", import.meta.url), "utf8");
  const learningScreen = await readFile(new URL("../src/screens/LearningGameScreen.jsx", import.meta.url), "utf8");
  const migrationSource = await readFile(new URL("../src/data/challengeMigrations.js", import.meta.url), "utf8");
  const mathData = await readFile(new URL("../src/data/subjects/math.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/index.css", import.meta.url), "utf8");
  const surfaceSource = await readFile(new URL("../src/data/missionSurfaces.js", import.meta.url), "utf8");
  const context = { subject: "math", level: "source-contract", challengeId: "MathGameplayScreen" };

  for (const marker of [
    "normalizeMathSceneChallenge(currentChallenge)",
    "handleCheckCounts",
    "Check counts",
    "disabled={!countsVerified}",
    "marked to take away",
  ]) {
    expect(mathScreen.includes(marker), context, `Math Quest UI source contract is missing: ${marker}`);
  }

  for (const marker of ["surfaceId", "surfaceKind", "surfaceVariant", "getSurfaceDefinition", "surfaceRosters"]) {
    expect(surfaceSource.includes(marker), context, `Mission surface source contract is missing: ${marker}`);
  }

  for (const marker of ["wordId: animalId", "normalizeMathSceneChallenge", "removedIds"]) {
    expect(mathData.includes(marker), context, `Math Quest data source contract is missing: ${marker}`);
  }

  for (const marker of [
    ".math-scene-board__remove-badge",
    ".math-target-card--invalid",
    ".math-target-card--verified",
    ".math-answer-card:disabled",
    ".screen-shell--gameplay.screen-shell--math-quest",
    "overflow-y: auto",
    ".game-card--math-quest .game-card__audio-action",
    "position: static",
  ]) {
    expect(css.includes(marker), context, `Math Quest CSS source contract is missing: ${marker}`);
  }

  for (const marker of [
    "เลือกตัวอักษรตัวแรก",
    "เลือกตัวอักษรตัวแรกที่เขียน",
    "Pick the first written letter.",
    "Tap the first written character.",
  ]) {
    expect(
      !spellingScreen.includes(marker),
      { subject: "thai-spelling", level: "source-contract", challengeId: "SpellingGameplayScreen" },
      `Retired first-written-character UI is still present: ${marker}`,
    );
  }

  for (const marker of [
    "function WordRepairBoard",
    "function TextEntryBoard",
    "spelling-sprint",
    "bankTokens",
  ]) {
    expect(
      spellingScreen.includes(marker),
      { subject: "spelling", level: "source-contract", challengeId: "SpellingGameplayScreen" },
      `Spelling surface renderer contract is missing: ${marker}`,
    );
  }

  for (const marker of ["SoundBubblePopGame", '"sound-bubble-pop"']) {
    expect(
      learningScreen.includes(marker),
      { subject: "learning-games", level: "source-contract", challengeId: "LearningGameScreen" },
      `Sound Bubble Pop renderer contract is missing: ${marker}`,
    );
  }

  for (const marker of ["LetterNinjaGame", '"letter-ninja"']) {
    expect(
      !learningScreen.includes(marker),
      { subject: "learning-games", level: "source-contract", challengeId: "LearningGameScreen" },
      `Retired Letter Ninja renderer contract is still present: ${marker}`,
    );
  }

  for (const marker of [
    "migrateFirstLetterChallenge",
    "migrateLetterNinjaChallenge",
    "first-letter-pick-to-spelling-order",
    "letter-ninja-to-sound-bubble-pop",
    "normalizeChallengeSurface",
  ]) {
    expect(
      migrationSource.includes(marker),
      { subject: "learning-games", level: "source-contract", challengeId: "challengeMigrations" },
      `Legacy challenge migration contract is missing: ${marker}`,
    );
  }
}

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "error",
});

try {
  const content = await server.ssrLoadModule("/src/data/contentLibrary.js");
  const randomizer = await server.ssrLoadModule("/src/data/challengeRandomizer.js");
  const migrationModule = await server.ssrLoadModule("/src/data/challengeMigrations.js");
  const historyModule = await server.ssrLoadModule("/src/data/challengeHistory.js");
  const mathModule = await server.ssrLoadModule("/src/data/subjects/math.js");
  const surfaceModule = await server.ssrLoadModule("/src/data/missionSurfaces.js");
  const mathLessons = await server.ssrLoadModule("/src/data/subjects/mathLessons.js");
  const mathGenius = await server.ssrLoadModule("/src/data/subjects/mathGenius.js");
  const arcade = await server.ssrLoadModule("/src/data/arcadeChallenges.js");
  const answerModule = await server.ssrLoadModule("/src/data/learningGameAnswers.js");

  await validateSourceContracts();
  validateReviewedSemanticManifest(content.defaultLibrary);
  validateBoundaryFixtures(content, mathModule, migrationModule);

  for (const subject of content.defaultLibrary) {
    for (const level of content.buildSubjectLevels(subject)) {
      validateSurfaceInheritance(surfaceModule, subject.id, level, null, level.trackId || "");
      for (const challenge of level.exercises || []) {
        validateSurfaceInheritance(surfaceModule, subject.id, level, challenge, level.trackId || "");
        const context = exerciseContext(subject.id, level.id, challenge, "authored");
        if (subject.id === "learning-games") {
          validateLearningChallenge(challenge, context, answerModule);
        } else if (!GENERATED_SUBJECT_IDS.has(subject.id)) {
          validateStandardChallenge(challenge, context);
        }
        stats.authoredChallenges += 1;
      }
    }
  }

  for (const subject of content.defaultLibrary) {
    if (GENERATED_SUBJECT_IDS.has(subject.id)) continue;

    for (const level of content.buildSubjectLevels(subject)) {
      for (let seed = 1; seed <= SEEDS_PER_LEVEL_OR_MODE; seed += 1) {
        const seededValue = hashSeed(`${subject.id}:${level.id}:${seed}`);
        try {
          const session = randomizer.createChallengeSession({
            subjectId: subject.id,
            levelConfig: level,
            library: content.defaultLibrary,
            history: historyModule.createEmptyChallengeHistory(),
            rng: createRng(seededValue),
            sessionId: `correctness-${seed}`,
          });
          expect(
            Array.isArray(session?.exercises) && session.exercises.length > 0,
            { subject: subject.id, level: level.id, challengeId: "generated-session", seed },
            "seeded session did not generate exercises",
          );
          for (const challenge of session?.exercises || []) {
            validateSurfaceInheritance(surfaceModule, subject.id, level, challenge, level.trackId || "", seed);
            const context = exerciseContext(subject.id, level.id, challenge, seed);
            if (subject.id === "learning-games") {
              validateLearningChallenge(challenge, context, answerModule);
            } else {
              validateStandardChallenge(challenge, context);
            }
            stats.generatedChallenges += 1;
          }
          if (subject.id === "learning-games") stats.randomizedLearningSessions += 1;
          else stats.randomizedStandardSessions += 1;
        } catch (error) {
          addFinding(
            { subject: subject.id, level: level.id, challengeId: "generated-session", seed },
            `generation threw: ${error.message}`,
          );
        }
      }
    }
  }

  const mathSubject = content.defaultLibrary.find((subject) => subject.id === "math");
  for (const level of content.buildSubjectLevels(mathSubject)) {
    for (let seed = 1; seed <= SEEDS_PER_LEVEL_OR_MODE; seed += 1) {
      try {
        const session = withSeed(hashSeed(`math:${level.id}:${seed}`), () =>
          mathModule.generateMathLevelSession(level),
        );
        for (const challenge of session?.exercises || []) {
          validateSurfaceInheritance(surfaceModule, "math", level, challenge, "", seed);
          validateMathQuestChallenge(challenge, exerciseContext("math", level.id, challenge, seed), mathModule);
          stats.generatedChallenges += 1;
        }
        stats.mathQuestSessions += 1;
      } catch (error) {
        addFinding(
          { subject: "math", level: level.id, challengeId: "generated-session", seed },
          `generation threw: ${error.message}`,
        );
      }
    }
  }

  const mathLessonSubject = content.defaultLibrary.find((subject) => subject.id === "math-lessons");
  for (const level of content.buildSubjectLevels(mathLessonSubject)) {
    for (let seed = 1; seed <= SEEDS_PER_LEVEL_OR_MODE; seed += 1) {
      try {
        const session = withSeed(hashSeed(`math-lessons:${level.id}:${seed}`), () =>
          mathLessons.generateMathLessonSession(level),
        );
        for (const challenge of session?.exercises || []) {
          validateSurfaceInheritance(surfaceModule, "math-lessons", level, challenge, "", seed);
          validateMathLessonChallenge(challenge, exerciseContext("math-lessons", level.id, challenge, seed));
          stats.generatedChallenges += 1;
        }
        stats.mathLessonSessions += 1;
      } catch (error) {
        addFinding(
          { subject: "math-lessons", level: level.id, challengeId: "generated-session", seed },
          `generation threw: ${error.message}`,
        );
      }
    }
  }

  for (const track of mathGenius.mathGeniusTracks) {
    for (const level of track.levels) {
      for (let seed = 1; seed <= SEEDS_PER_LEVEL_OR_MODE; seed += 1) {
        try {
          const session = withSeed(hashSeed(`math-genius:${track.id}:${level.id}:${seed}`), () =>
            mathGenius.generateMathGeniusSession(track.id, level),
          );
        for (const challenge of session?.exercises || []) {
          validateSurfaceInheritance(surfaceModule, "math-genius", level, challenge, track.id, seed);
            validateMathGeniusChallenge(challenge, exerciseContext("math-genius", `${track.id}/${level.id}`, challenge, seed));
            stats.generatedChallenges += 1;
          }
          stats.mathGeniusSessions += 1;
        } catch (error) {
          addFinding(
            { subject: "math-genius", level: `${track.id}/${level.id}`, challengeId: "generated-session", seed },
            `generation threw: ${error.message}`,
          );
        }
      }
    }
  }

  const arcadeModes = arcade.getArcadeModeCatalog();
  const wordPool = arcade.getArcadeWordPool(content.defaultLibrary);
  for (const mode of arcadeModes) {
    for (const difficulty of [1, 2, 3]) {
      for (let seed = 1; seed <= SEEDS_PER_LEVEL_OR_MODE; seed += 1) {
        try {
          const challenge = withSeed(hashSeed(`arcade:${mode.id}:${difficulty}:${seed}`), () =>
            arcade.createArcadeChallenge({
              wordPool,
              preferredModeIds: [mode.id],
              difficulty,
            }),
          );
          validateLearningChallenge(
            challenge,
            exerciseContext("arcade", `${mode.id}/difficulty-${difficulty}`, challenge, seed),
            answerModule,
          );
          stats.arcadeChallenges += 1;
          stats.generatedChallenges += 1;
        } catch (error) {
          addFinding(
            { subject: "arcade", level: `${mode.id}/difficulty-${difficulty}`, challengeId: "generated-challenge", seed },
            `generation threw: ${error.message}`,
          );
        }
      }
    }
  }
} catch (error) {
  addFinding(
    { subject: "project", level: "validator", challengeId: "uncaught-error" },
    error.stack || error.message,
  );
} finally {
  await server.close();
}

const result = {
  status: findings.length === 0 ? "ok" : "failed",
  seedsPerLevelOrMode: SEEDS_PER_LEVEL_OR_MODE,
  stats,
  findings,
  reviewBoundary: "Automated logical, content, and clarity audit; not a formal curriculum certification.",
};

console.log(JSON.stringify(result, null, 2));

if (findings.length > 0) {
  process.exitCode = 1;
}

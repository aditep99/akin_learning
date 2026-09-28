import {
  appendChallengeHistory,
  getChallengeHistoryEntries,
  normalizeChallengeHistory,
} from "./challengeHistory.js";
import {
  migrateLegacyChallenge,
  normalizeChallengeSurface,
} from "./challengeMigrations.js";
import { learningGamesSubject } from "./subjects/learningGames.js";

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
  "vocab-choice",
  "odd-one-out",
  "missing-letter",
  "sound-to-word-choice",
  "tricky-word-pick",
]);

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

let runtimeSequence = 0;

function getRuntimeId(prefix = "challenge") {
  runtimeSequence += 1;
  return `${prefix}-${Date.now()}-${runtimeSequence}`;
}

export function shuffle(items, rng = Math.random) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [
      nextItems[swapIndex],
      nextItems[index],
    ];
  }

  return nextItems;
}

export function randomInt(min, max, rng = Math.random) {
  if (max <= min) {
    return min;
  }

  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickOne(items, rng = Math.random) {
  return items.length > 0 ? items[randomInt(0, items.length - 1, rng)] : null;
}

function uniqueById(items) {
  const seen = new Set();

  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function uniqueValues(items) {
  return [...new Set(items.filter((item) => item !== undefined && item !== null))];
}

function clampChoiceCount(value, fallback = 4) {
  return Math.max(3, Number(value) || fallback);
}

function getSubjectWords(subject) {
  if (Array.isArray(subject?.words) && subject.words.length > 0) {
    return subject.words;
  }

  return (subject?.levels || []).flatMap((level) => [
    ...(level.words || []),
    ...(level.reviewWords || []),
  ]);
}

function getLibraryWordIndex(library = []) {
  const words = library.flatMap(getSubjectWords);
  const fallbackWords = getSubjectWords(learningGamesSubject);
  const index = new Map();

  [...words, ...fallbackWords].forEach((word) => {
    if (word?.id && !index.has(word.id)) {
      index.set(word.id, word);
    }
  });

  return index;
}

export function getLevelWordPool(levelConfig, library = [], subjectId = "") {
  const index = getLibraryWordIndex(library);
  const subject = library.find((item) => item.id === subjectId);
  const scopedWords = [
    ...(levelConfig?.randomPool || []),
    ...(levelConfig?.randomPoolIds || [])
      .map((id) => (typeof id === "string" ? index.get(id) : id))
      .filter(Boolean),
    ...(levelConfig?.reviewWords || []),
    ...(levelConfig?.words || []),
  ];
  const sourceWords =
    scopedWords.length >= 3
      ? scopedWords
      : [...scopedWords, ...getSubjectWords(subject)];

  return uniqueById(
    sourceWords
      .map((word) => (typeof word === "string" ? index.get(word) : word))
      .filter((word) => word?.id && word?.word),
  );
}

function getMode(challenge) {
  return challenge?.mode || challenge?.type || "unknown";
}

export function getChallengeTargetId(challenge) {
  return (
    challenge?.targetWord?.id ||
    challenge?.reviewWord?.id ||
    challenge?.correctChoiceId ||
    (typeof challenge?.targetWord === "string" ? challenge.targetWord : "") ||
    (typeof challenge?.promptWord === "string" ? challenge.promptWord : "") ||
    (typeof challenge?.word === "string" ? challenge.word : "") ||
    (typeof challenge?.targetShape === "string" ? challenge.targetShape : "") ||
    ""
  );
}

function normalizeChoiceValue(choice) {
  if (choice && typeof choice === "object") {
    return choice.id || choice.value || choice.word || "";
  }

  return choice;
}

function getChoiceKey(choice) {
  return String(normalizeChoiceValue(choice) ?? "");
}

export function getCorrectAnswerIndex(challenge) {
  if (Number.isInteger(challenge?.correctSlot)) {
    return challenge.correctSlot;
  }

  const choices = Array.isArray(challenge?.choices)
    ? challenge.choices
    : Array.isArray(challenge?.answerChoices)
      ? challenge.answerChoices
      : [];

  if (choices.length === 0) {
    return null;
  }

  if (challenge?.correctChoiceId) {
    const index = choices.findIndex(
      (choice) => choice?.id === challenge.correctChoiceId,
    );

    if (index >= 0) {
      return index;
    }
  }

  const expected = challenge?.correctAnswer ?? challenge?.targetShape;

  if (expected !== undefined) {
    const index = choices.findIndex((choice) => {
      const value = choice?.value ?? choice;
      return value === expected;
    });

    return index >= 0 ? index : null;
  }

  return null;
}

function stableJson(value) {
  return JSON.stringify(value, (_, nestedValue) => {
    if (!nestedValue || typeof nestedValue !== "object" || Array.isArray(nestedValue)) {
      return nestedValue;
    }

    return Object.keys(nestedValue)
      .sort()
      .reduce((result, key) => {
        result[key] = nestedValue[key];
        return result;
      }, {});
  });
}

export function getChallengeSignature(challenge) {
  if (!challenge) {
    return "unknown";
  }

  const mode = getMode(challenge);

  if (typeof challenge.signature === "string" && challenge.signature) {
    return `${mode}:${challenge.signature}`;
  }

  if (Array.isArray(challenge.pairs)) {
    return `${mode}:pairs:${challenge.pairs
      .map((pair) => pair?.id || pair?.word || "")
      .sort()
      .join(",")}`;
  }

  if (Array.isArray(challenge.items)) {
    return `${mode}:items:${challenge.items
      .map((item) => `${item?.id || item?.word || ""}:${item?.basketId || ""}`)
      .sort()
      .join(",")}`;
  }

  if (Array.isArray(challenge.letters)) {
    return `${mode}:letters:${String(
      challenge.targetWord?.word || challenge.targetWord || "",
    ).toUpperCase()}:${challenge.letters
      .map((letter) => String(letter).toUpperCase())
      .sort()
      .join("")}`;
  }

  if (Array.isArray(challenge.choices)) {
    return `${mode}:choice:${String(
      challenge.correctChoiceId || challenge.correctAnswer || challenge.targetShape || "",
    )}:${challenge.choices.map(getChoiceKey).sort().join(",")}`;
  }

  if (Array.isArray(challenge.answerChoices)) {
    return `${mode}:answers:${String(
      challenge.correctAnswer ?? challenge.answer ?? "",
    )}:${challenge.answerChoices.map(getChoiceKey).sort().join(",")}`;
  }

  const relevantFields = {
    mode,
    operator: challenge.operator,
    leftValue: challenge.leftValue,
    rightValue: challenge.rightValue,
    leftCount: challenge.leftCount,
    rightCount: challenge.rightCount,
    correctAnswer: challenge.correctAnswer,
    targetShape: challenge.targetShape,
    word: challenge.word,
    promptWord: challenge.promptWord,
  };

  return `${mode}:${stableJson(relevantFields)}`;
}

export function createChallengeHistoryEntry(challenge) {
  return {
    signature: getChallengeSignature(challenge),
    targetId: getChallengeTargetId(challenge),
    correctIndex: getCorrectAnswerIndex(challenge),
    createdAt: Date.now(),
  };
}

export function getChallengeScopeKey(subjectId, levelId, mode = "session") {
  return `${subjectId || "unknown"}:${levelId || "unknown"}:${mode || "session"}`;
}

function isRecentTarget(targetId, entries) {
  if (!targetId) {
    return false;
  }

  return entries
    .slice(-4)
    .some((entry) => entry.targetId && entry.targetId === targetId);
}

export function isChallengeAllowed(challenge, history, scopeKey) {
  const normalizedHistory = normalizeChallengeHistory(history);
  const entries = getChallengeHistoryEntries(normalizedHistory, scopeKey);
  const signature = getChallengeSignature(challenge);
  const targetId = getChallengeTargetId(challenge);

  if (entries.some((entry) => entry.signature === signature)) {
    return false;
  }

  return !isRecentTarget(targetId, entries);
}

function hasSessionConflict(exercises, history, scopeKey) {
  const seenSignatures = new Set();

  return exercises.some((exercise) => {
    const signature = getChallengeSignature(exercise);

    if (seenSignatures.has(signature) || !isChallengeAllowed(exercise, history, scopeKey)) {
      return true;
    }

    seenSignatures.add(signature);
    return false;
  });
}

export function createHistoryAwareChallenge({
  create,
  history,
  scopeKey,
  attempts = 20,
}) {
  let fallback = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const candidate = create();

    if (!candidate) {
      continue;
    }

    fallback = candidate;

    if (isChallengeAllowed(candidate, history, scopeKey)) {
      return candidate;
    }
  }

  return fallback;
}

export function createHistoryAwareSession({
  create,
  history,
  scopeKey,
  validate,
  attempts = 16,
}) {
  let fallback = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const candidate = create();

    if (!candidate) {
      continue;
    }

    fallback = candidate;

    if (
      (!validate || validate(candidate)) &&
      Array.isArray(candidate.exercises) &&
      !hasSessionConflict(candidate.exercises, history, scopeKey)
    ) {
      return candidate;
    }
  }

  return fallback;
}

function getRecentCorrectIndex(history, scopeKey) {
  const entries = getChallengeHistoryEntries(
    normalizeChallengeHistory(history),
    scopeKey,
  );
  const entry = [...entries]
    .reverse()
    .find((item) => Number.isInteger(item.correctIndex));

  return entry?.correctIndex ?? null;
}

function shuffleChoicesWithConstraint(
  choices,
  challenge,
  history,
  scopeKey,
  rng,
) {
  const previousIndex = getRecentCorrectIndex(history, scopeKey);
  let nextChoices = shuffle(choices, rng);

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidateIndex = getCorrectAnswerIndex({
      ...challenge,
      choices: nextChoices,
    });

    if (
      previousIndex === null ||
      nextChoices.length < 2 ||
      candidateIndex !== previousIndex
    ) {
      return nextChoices;
    }

    nextChoices = shuffle(choices, rng);
  }

  return nextChoices;
}

function buildWordChoices(
  target,
  wordPool,
  requestedCount,
  fallbackChoices,
  history,
  scopeKey,
  rng,
) {
  const count = clampChoiceCount(requestedCount, 4);
  const pool = uniqueById([
    target,
    ...wordPool,
    ...(fallbackChoices || []),
  ]);
  const distractors = shuffle(
    pool.filter((word) => word.id !== target.id),
    rng,
  ).slice(0, Math.max(count - 1, 2));
  const choices = [target, ...distractors];

  if (choices.length < 3) {
    return shuffleChoicesWithConstraint(
      fallbackChoices?.length >= 3 ? fallbackChoices : choices,
      { correctChoiceId: target.id },
      history,
      scopeKey,
      rng,
    );
  }

  return shuffleChoicesWithConstraint(
    choices,
    { correctChoiceId: target.id },
    history,
    scopeKey,
    rng,
  );
}

function getTargetCandidates(wordPool, history, scopeKey) {
  const entries = getChallengeHistoryEntries(
    normalizeChallengeHistory(history),
    scopeKey,
  );
  const recentTargetIds = new Set(
    entries.slice(-4).map((entry) => entry.targetId).filter(Boolean),
  );
  const available = wordPool.filter((word) => !recentTargetIds.has(word.id));

  return available.length > 0 ? available : wordPool;
}

function chooseTarget(wordPool, history, scopeKey, rng) {
  return pickOne(getTargetCandidates(wordPool, history, scopeKey), rng);
}

function getLearningGamePool(levelConfig, library) {
  const levelPool = getLevelWordPool(levelConfig, library, "learning-games");

  if (levelPool.length >= 3) {
    return levelPool;
  }

  return uniqueById([
    ...levelPool,
    ...getSubjectWords(learningGamesSubject),
  ]);
}

function createRuntimeChallenge(base, sessionId, index = 0) {
  return {
    ...base,
    id: `${base.id || base.mode || "challenge"}-runtime-${sessionId}-${index}`,
    sourceChallengeId: base.id || "",
  };
}

function createNumberChoices(answer, count, rng) {
  const values = new Set([answer]);
  const spread = Math.max(2, Math.min(5, Math.ceil(Math.abs(answer) / 3)));

  while (values.size < count) {
    const offset = randomInt(-spread, spread, rng);
    const candidate = Math.max(0, answer + offset);

    if (candidate !== answer) {
      values.add(candidate);
    }
  }

  return shuffle([...values], rng);
}

function createRocketLetters(target, rng) {
  const targetLetters = String(target.word || "").toUpperCase().split("");
  const distractorCount = targetLetters.length > 6 ? 1 : 2;
  const distractors = shuffle(
    ALPHABET.filter((letter) => !targetLetters.includes(letter)),
    rng,
  ).slice(0, distractorCount);

  return shuffle([...targetLetters, ...distractors], rng);
}

function createLearningGameChoiceChallenge(
  base,
  target,
  wordPool,
  history,
  scopeKey,
  rng,
  sessionId,
) {
  const next = createRuntimeChallenge(base, sessionId);
  const choices = buildWordChoices(
    target,
    wordPool,
    base.choices?.length || 4,
    base.choices,
    history,
    scopeKey,
    rng,
  );

  return {
    ...next,
    type: "learning-game",
    answerKind: "choice",
    targetWord: target,
    promptWord: target.word,
    phonics: target.phonics || target.pronunciation?.guide || "",
    audio: {
      word: target.word,
      phonics: target.phonics || target.pronunciation?.guide || "",
    },
    choices,
    correctChoiceId: target.id,
  };
}

function createLearningGameChallengeVariant({
  base,
  levelConfig,
  wordPool,
  history,
  scopeKey,
  rng,
  sessionId,
}) {
  const mode = base.mode;

  if (
    [
      "word-fishing",
      "zombie-word-munch",
      "sound-safari",
      "sound-bubble-pop",
      "monster-delivery",
    ].includes(mode)
  ) {
    const target = chooseTarget(wordPool, history, scopeKey, rng) || base.targetWord || base.reviewWord;
    return createLearningGameChoiceChallenge(
      base,
      target,
      wordPool,
      history,
      scopeKey,
      rng,
      sessionId,
    );
  }

  if (mode === "number-blaster") {
    const leftValue = randomInt(1, 8, rng);
    const rightValue = randomInt(1, 8, rng);
    const correctAnswer = leftValue + rightValue;
    const choices = createNumberChoices(
      correctAnswer,
      Math.max(4, base.choices?.length || 4),
      rng,
    );
    const next = createRuntimeChallenge(base, sessionId);

    return {
      ...next,
      type: "learning-game",
      answerKind: "value",
      leftValue,
      rightValue,
      operator: "+",
      choices: shuffleChoicesWithConstraint(
        choices,
        { correctAnswer },
        history,
        scopeKey,
        rng,
      ),
      correctAnswer,
    };
  }

  if (mode === "shape-shield") {
    const shapePool = uniqueValues([
      ...(base.choices || []),
      "circle",
      "square",
      "triangle",
      "diamond",
      "rectangle",
      "oval",
    ]);
    const targetShape = pickOne(shapePool, rng) || base.targetShape || "circle";
    const choices = shuffleChoicesWithConstraint(
      [targetShape, ...shuffle(shapePool.filter((shape) => shape !== targetShape), rng).slice(0, 3)],
      { targetShape },
      history,
      scopeKey,
      rng,
    );
    const next = createRuntimeChallenge(base, sessionId);

    return {
      ...next,
      type: "learning-game",
      answerKind: "value",
      targetShape,
      choices,
      correctAnswer: targetShape,
    };
  }

  if (mode === "memory-match") {
    const pairCount = Math.max(2, Math.min(base.pairs?.length || 3, wordPool.length));
    const target = chooseTarget(wordPool, history, scopeKey, rng);
    const pairs = [
      target,
      ...shuffle(wordPool.filter((word) => word.id !== target?.id), rng),
    ]
      .filter(Boolean)
      .slice(0, pairCount);
    const next = createRuntimeChallenge(base, sessionId);

    return {
      ...next,
      type: "learning-game",
      answerKind: "memory-pair",
      pairs: shuffle(pairs, rng),
      targetWord: pairs[0] || base.targetWord,
    };
  }

  if (mode === "pattern-pop") {
    const patternWords = shuffle(wordPool, rng).slice(0, 2);
    const first = patternWords[0] || base.sequence?.[0] || base.choices?.[0];
    const second = patternWords[1] || base.sequence?.[1] || base.choices?.[1];
    const distractor =
      shuffle(
        wordPool.filter((word) => word.id !== first?.id && word.id !== second?.id),
        rng,
      )[0] || base.choices?.find((choice) => choice.id !== first?.id && choice.id !== second?.id);
    const choices = shuffleChoicesWithConstraint(
      [first, second, distractor].filter(Boolean),
      { correctChoiceId: first?.id },
      history,
      scopeKey,
      rng,
    );
    const next = createRuntimeChallenge(base, sessionId);

    return {
      ...next,
      type: "learning-game",
      answerKind: "choice",
      sequence: [first, second, first, second].filter(Boolean),
      choices,
      correctChoiceId: first?.id,
      targetWord: first,
    };
  }

  if (mode === "treasure-sort") {
    const groups = new Map();

    (base.items || []).forEach((item) => {
      if (!groups.has(item.basketId)) {
        groups.set(item.basketId, []);
      }
      groups.get(item.basketId).push(item);
    });

    const items = [...groups.entries()].flatMap(([basketId, group]) => {
      const count = group.length > 2 && rng() > 0.45 ? group.length - 1 : group.length;
      return shuffle(group, rng)
        .slice(0, Math.max(2, count))
        .map((item) => ({ ...item, basketId }));
    });
    const next = createRuntimeChallenge(base, sessionId);

    return {
      ...next,
      type: "learning-game",
      answerKind: "sort-item",
      baskets: shuffle(base.baskets || [], rng),
      items: shuffle(items, rng),
    };
  }

  if (mode === "word-rocket") {
    const target = chooseTarget(wordPool, history, scopeKey, rng) || base.targetWord;
    const next = createRuntimeChallenge(base, sessionId);

    return {
      ...next,
      type: "learning-game",
      answerKind: "sequence-letter",
      targetWord: target,
      letters: createRocketLetters(target, rng),
    };
  }

  return createRuntimeChallenge(base, sessionId);
}

function createLearningGameSession({
  subjectId,
  levelConfig,
  library,
  history,
  rng,
  sessionId,
}) {
  const wordPool = getLearningGamePool(levelConfig, library);
  const baseMigration = migrateLegacyChallenge(levelConfig.exercises?.[0], {
    wordPool,
  });
  const surfaceMigration = normalizeChallengeSurface(baseMigration.challenge, {
    levelConfig,
    subjectId,
    trackId: levelConfig.trackId || "",
  });
  const base = surfaceMigration.status === "error"
    ? null
    : surfaceMigration.challenge;
  const scopeKey = getChallengeScopeKey(subjectId, levelConfig.id, "session");

  if (!base) {
    return {
      id: `learning-game-session-${sessionId}`,
      sourceLevelId: levelConfig.id,
      scopeKey,
      exercises: [],
    };
  }

  let fallback = null;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const challenge = createLearningGameChallengeVariant({
      base,
      levelConfig,
      wordPool,
      history,
      scopeKey,
      rng,
      sessionId: `${sessionId}-${attempt}`,
    });

    fallback = challenge;

    if (isChallengeAllowed(challenge, history, scopeKey)) {
      return {
        id: `learning-game-session-${sessionId}`,
        sourceLevelId: levelConfig.id,
        scopeKey,
        exercises: [challenge],
      };
    }
  }

  return {
    id: `learning-game-session-${sessionId}`,
    sourceLevelId: levelConfig.id,
    scopeKey,
    exercises: fallback ? [fallback] : [],
  };
}

function createWordChoiceFromLevel(
  base,
  wordPool,
  history,
  scopeKey,
  rng,
  sessionId,
) {
  const authoredChoices = Array.isArray(base.choices) && base.choices.length >= 3
    ? uniqueById(base.choices)
    : [];
  const targetPool = authoredChoices.length >= 3 ? authoredChoices : wordPool;
  const choicePool = authoredChoices.length >= 3 ? authoredChoices : wordPool;
  const target = chooseTarget(targetPool, history, scopeKey, rng) || base.reviewWord;

  if (!target) {
    return createRuntimeChallenge(base, sessionId);
  }

  const next = createRuntimeChallenge(base, sessionId);
  const choices = buildWordChoices(
    target,
    choicePool,
    base.choices?.length || 4,
    base.choices,
    history,
    scopeKey,
    rng,
  );

  return {
    ...next,
    correctChoiceId: target.id,
    promptWord: target.word,
    promptTranslation: target.translation,
    listenText: target.word,
    reviewWord: target,
    choices,
    ...(base.mode === "picture-pick"
      ? { promptText: `Find ${target.word}.` }
      : {}),
    ...(base.mode === "word-to-picture"
      ? { promptText: `Match the word ${target.word}.` }
      : {}),
  };
}

function randomizeVocabularyExercise(
  exercise,
  wordPool,
  history,
  scopeKey,
  rng,
  sessionId,
  index,
) {
  const next = createRuntimeChallenge(exercise, sessionId, index);

  if (
    CHOICE_MODES.has(exercise.mode) &&
    exercise.randomizableTarget !== false &&
    Array.isArray(exercise.choices)
  ) {
    return createWordChoiceFromLevel(
      { ...exercise, id: next.id },
      wordPool,
      history,
      scopeKey,
      rng,
      sessionId,
    );
  }

  if (Array.isArray(exercise.choices)) {
    return {
      ...next,
      choices: shuffleChoicesWithConstraint(
        [...exercise.choices],
        exercise,
        history,
        scopeKey,
        rng,
      ),
    };
  }

  if (Array.isArray(exercise.items)) {
    return {
      ...next,
      baskets: Array.isArray(exercise.baskets)
        ? shuffle(exercise.baskets, rng)
        : exercise.baskets,
      items: shuffle(exercise.items, rng),
    };
  }

  if (Array.isArray(exercise.hotspots)) {
    return {
      ...next,
      hotspots: shuffle(exercise.hotspots, rng),
    };
  }

  return next;
}

// Final Test questions are authored assessments. Their answer keys and IDs
// must survive session creation and mission rehydration; only presentation
// order is safe to randomize.
function randomizeFinalTestExercise(exercise, sessionId, index, rng) {
  const next = {
    ...exercise,
    id: exercise.id || `final-test-${sessionId}-${index}`,
    sourceChallengeId: exercise.id || "",
  };

  if (Array.isArray(exercise.choices)) {
    next.choices = shuffle(exercise.choices, rng);
  }

  if (Array.isArray(exercise.pairs)) {
    next.pairs = shuffle(exercise.pairs, rng);
    next.matchOptions = shuffle(
      next.pairs.map((pair) => pair.right),
      rng,
    );
  }

  if (Array.isArray(exercise.tokens)) {
    next.tokens = shuffle(exercise.tokens, rng);
  }

  return next;
}

function randomizeSpellingExercise(exercise, sessionId, index, rng) {
  const next = createRuntimeChallenge(exercise, sessionId, index);

  if (Array.isArray(exercise.targetTokens)) {
    const targetTokens = [...exercise.targetTokens];
    next.targetTokens = targetTokens;
    const targetEntries = targetTokens.map((value, tokenIndex) => ({
      id: `${next.id}-token-${tokenIndex + 1}`,
      value,
    }));
    next.shuffledTokens = shuffle(targetEntries, rng);

    if (Array.isArray(exercise.bankTokens)) {
      const bankTokens = exercise.bankTokens.map((token, tokenIndex) => ({
      ...token,
      id: `${next.id}-${token.id?.includes("distractor") ? "distractor" : "token"}-${tokenIndex + 1}`,
      }));
      next.bankTokens = shuffle(bankTokens, rng);
    }
  }

  if (Array.isArray(exercise.patternTokens)) {
    next.patternTokens = [...exercise.patternTokens];
  }

  if (Array.isArray(exercise.choices)) {
    next.choices = shuffle(
      exercise.choices.map((choice, choiceIndex) => ({
        ...choice,
        id: `${next.id}-choice-${choiceIndex + 1}`,
      })),
      rng,
    );
  }

  return next;
}

function isSpellingLevel(levelConfig, subjectId) {
  return (
    ["english-spelling", "thai-spelling", "thai-exercises"].includes(subjectId) ||
    (levelConfig?.exercises || []).some((exercise) => SPELLING_MODES.has(exercise.mode))
  );
}

function createGenericWordExercise(word, wordPool, sessionId, index, history, scopeKey, rng) {
  const id = `vocab-${sessionId}-${index}`;
  const choices = buildWordChoices(
    word,
    wordPool,
    4,
    wordPool,
    history,
    scopeKey,
    rng,
  );

  return {
    id,
    type: "vocab-play",
    mode: "vocab-choice",
    randomizableTarget: true,
    correctChoiceId: word.id,
    promptWord: word.word,
    promptTranslation: word.translation,
    choices,
    reviewWord: word,
  };
}

function createGenericSession({
  subjectId,
  levelConfig,
  library,
  history,
  rng,
  sessionId,
}) {
  const scopeKey = getChallengeScopeKey(subjectId, levelConfig.id, "session");
  const wordPool = getLevelWordPool(levelConfig, library, subjectId);
  const isFinalTest = subjectId === "final-test";
  const templates = Array.isArray(levelConfig.exercises) && levelConfig.exercises.length > 0
    ? isFinalTest
      ? [...levelConfig.exercises]
      : shuffle(levelConfig.exercises, rng)
    : shuffle(levelConfig.words || wordPool, rng).map((word, index) =>
        createGenericWordExercise(word, wordPool, sessionId, index, history, scopeKey, rng),
      );
  let sessionHistory = history;
  const exercises = [];

  templates.forEach((exercise, index) => {
    const migration = migrateLegacyChallenge(exercise, { wordPool });
    const surfaceMigration = normalizeChallengeSurface(migration.challenge, {
      levelConfig,
      subjectId,
      trackId: levelConfig.trackId || "",
    });
    const normalizedExercise = surfaceMigration.status === "error"
      ? null
      : surfaceMigration.challenge;

    if (!normalizedExercise) {
      return;
    }

    const nextExercise =
      normalizedExercise.type === "final-test" ||
      subjectId === "final-test"
        ? randomizeFinalTestExercise(normalizedExercise, sessionId, index, rng)
        : normalizedExercise.mode === "spelling-order" ||
          SPELLING_MODES.has(normalizedExercise.mode)
        ? randomizeSpellingExercise(normalizedExercise, sessionId, index, rng)
        : randomizeVocabularyExercise(
            normalizedExercise,
            wordPool,
            sessionHistory,
            scopeKey,
            rng,
            sessionId,
            index,
          );

    exercises.push(nextExercise);
    sessionHistory = appendChallengeHistory(sessionHistory, scopeKey, [
      createChallengeHistoryEntry(nextExercise),
    ]);
  });

  return {
    id: `level-session-${sessionId}`,
    sourceLevelId: levelConfig.id,
    scopeKey,
    exercises,
  };
}

export function createChallengeSession({
  subjectId,
  levelConfig,
  library = [],
  history,
  rng = Math.random,
  sessionId = getRuntimeId("session"),
} = {}) {
  if (!levelConfig) {
    return null;
  }

  if (subjectId === "learning-games") {
    return createLearningGameSession({
      subjectId,
      levelConfig,
      library,
      history,
      rng,
      sessionId,
    });
  }

  const session = createGenericSession({
    subjectId,
    levelConfig,
    library,
    history,
    rng,
    sessionId,
  });

  return session;
}

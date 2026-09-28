function shuffle(items) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [
      nextItems[swapIndex],
      nextItems[index],
    ];
  }

  return nextItems;
}

function tokenizeWord(word, language) {
  if (language === "th") {
    // Thai spelling activities in this app are character-based, not grapheme-cluster based.
    // This keeps full-word spelling and missing-character challenges aligned with visible letters.
    return Array.from(word);
  }

  return Array.from(word);
}

function shuffleTokenIds(id, targetTokens) {
  return shuffle(
    targetTokens.map((token, index) => ({
      id: `${id}-token-${index + 1}`,
      value: token,
    })),
  );
}

function createTokenEntries(id, values, suffix = "token") {
  return values.map((value, index) => ({
    id: `${id}-${suffix}-${index + 1}`,
    value,
  }));
}

function getLimitedDistractors(targetTokens, language) {
  const candidates = language === "th"
    ? Array.from("กขคงจชดตถทนบปผฝพฟมยรลวสหอฮ")
    : Array.from("abcdefghijklmnopqrstuvwxyz");
  const targetSet = new Set(targetTokens);
  const needed = Math.min(2, Math.max(1, Math.floor(targetTokens.length / 2)));

  return candidates
    .filter((value) => !targetSet.has(value))
    .slice(0, needed);
}

function createLimitedTokenBank(id, targetTokens, language) {
  const targetEntries = createTokenEntries(id, targetTokens);
  const distractors = createTokenEntries(
    id,
    getLimitedDistractors(targetTokens, language),
    "distractor",
  );

  return [...targetEntries, ...distractors];
}

export function createSpellingWord({
  id,
  word,
  translation,
  image,
  emoji,
  phonics = "",
  pronunciation = {},
  language,
  ...extra
}) {
  const targetTokens = tokenizeWord(word, language);
  const shuffledTokens = shuffleTokenIds(id, targetTokens);

  return {
    id,
    type: "spelling-order",
    mode: "spelling-order",
    word,
    translation,
    image,
    emoji,
    phonics,
    pronunciation,
    language,
    targetTokens,
    shuffledTokens,
    ...extra,
  };
}

export function createSpellingOrderChallenge(id, wordData, mode = "spelling-order") {
  const targetTokens = [...wordData.targetTokens];
  const bankTokens = mode === "token-bank-limited"
    ? createLimitedTokenBank(id, targetTokens, wordData.language)
    : createTokenEntries(id, targetTokens);

  return {
    ...wordData,
    id,
    type: mode,
    mode,
    targetTokens,
    shuffledTokens: shuffleTokenIds(id, targetTokens),
    ...(mode === "token-bank-limited"
      ? { bankTokens: shuffle(bankTokens) }
      : {}),
    reviewWord: wordData,
  };
}

export function createMissingLetterChallenge(id, wordData, missingIndex, choices) {
  const correctLetter = wordData.targetTokens[missingIndex];
  const normalizedChoices = choices.includes(correctLetter)
    ? choices
    : [correctLetter, ...choices.slice(0, Math.max(choices.length - 1, 0))];

  return {
    ...wordData,
    id,
    type: "missing-letter",
    mode: "missing-letter",
    promptText: "Pick the missing letter.",
    missingIndex,
    patternTokens: wordData.targetTokens.map((token, index) =>
      index === missingIndex ? null : token,
    ),
    correctAnswer: correctLetter,
    choices: shuffle(
      normalizedChoices.map((choice) => ({ id: `${id}-${choice}`, value: choice })),
    ),
    reviewWord: wordData,
  };
}

export function createWordChoiceChallenge(
  id,
  mode,
  wordData,
  choices,
  promptText,
) {
  return {
    ...wordData,
    id,
    type: mode,
    mode,
    promptText,
    correctAnswer: wordData.word,
    choices: shuffle(
      choices.map((choice, index) => ({
        id: `${id}-choice-${index + 1}`,
        value: choice,
      })),
    ),
    reviewWord: wordData,
  };
}

export function createWriteFromMemoryChallenge(id, wordData, options = {}) {
  const targetTokens = [...wordData.targetTokens];

  return {
    ...wordData,
    id,
    type: "write-from-memory",
    mode: "write-from-memory",
    promptText: options.promptText || "Look, listen, then write the whole word.",
    answerPolicy: "exact-word",
    targetTokens,
    shuffledTokens: createTokenEntries(id, targetTokens),
    reviewWord: wordData,
  };
}

export function createWordRepairChallenge(id, wordData, options = {}) {
  const targetTokens = [...wordData.targetTokens];
  const repairIndex = Math.min(
    Math.max(0, Number.isInteger(options.repairIndex) ? options.repairIndex : 1),
    Math.max(0, targetTokens.length - 1),
  );
  const correctAnswer = targetTokens[repairIndex];
  const defaultChoices = wordData.language === "th"
    ? ["ก", "น", "ม", "ร", "ล", "ส"]
    : ["a", "e", "i", "o", "u", "r", "t", "n"];
  const choiceValues = [
    correctAnswer,
    ...(options.choices || defaultChoices),
  ].filter((value, index, values) => value && values.indexOf(value) === index);

  return {
    ...wordData,
    id,
    type: "word-repair",
    mode: "word-repair",
    promptText: options.promptText || "Repair the missing part of the word.",
    repairIndex,
    patternTokens: targetTokens.map((token, index) =>
      index === repairIndex ? null : token,
    ),
    correctAnswer,
    choices: shuffle(
      choiceValues.slice(0, 4).map((value, index) => ({
        id: `${id}-repair-choice-${index + 1}`,
        value,
      })),
    ),
    targetTokens,
    shuffledTokens: createTokenEntries(id, targetTokens),
    reviewWord: wordData,
  };
}

export function createSpellingSprintChallenge(
  id,
  wordData,
  sprintRound,
  sprintTotal,
  options = {},
) {
  const targetTokens = [...wordData.targetTokens];

  return {
    ...wordData,
    id,
    type: "spelling-sprint",
    mode: "spelling-sprint",
    promptText: options.promptText || "Write the word before the next round.",
    answerPolicy: "exact-word",
    sprintRound,
    sprintTotal,
    targetTokens,
    shuffledTokens: createTokenEntries(id, targetTokens),
    reviewWord: wordData,
  };
}

export function createSpellingLevel(subjectId, levelNumber, words, options = {}) {
  const exercises = options.exercises || words;

  return {
    id: `${subjectId}-level-${levelNumber}`,
    levelNumber,
    label: `Level ${levelNumber}`,
    mode: options.mode || "spelling-order",
    themeLabel: options.themeLabel || `Level ${levelNumber}`,
    difficultyStage: options.difficultyStage || levelNumber,
    supportProfile: options.supportProfile || "",
    surfaceId: options.surfaceId,
    surfaceKind: options.surfaceKind,
    surfaceVariant: options.surfaceVariant,
    words,
    exercises,
    wordCount: exercises.length,
    reviewWords: options.reviewWords || words,
    mapCaption: options.mapCaption || options.themeLabel || `${exercises.length} words`,
  };
}

export function flattenLevelWords(levels) {
  return levels.flatMap((level) => level.words);
}

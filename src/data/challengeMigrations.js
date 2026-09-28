import {
  createMissingLetterChallenge,
  createSpellingOrderChallenge,
  createSpellingSprintChallenge,
  createWordChoiceChallenge,
  createWordRepairChallenge,
  createWriteFromMemoryChallenge,
} from "./subjects/spellingShared.js";
import { getSurfaceDefinition } from "./missionSurfaces.js";
import { getFinalTestPhotoAsset } from "./finalTest/finalTestPhotoAssets.js";

const LEGACY_CHALLENGE_MODES = new Set([
  "first-letter-pick",
  "letter-ninja",
]);

const SPELLING_LEGACY_KEYS = new Set([
  "answerPolicy",
  "choices",
  "correctAnswer",
  "promptText",
  "type",
  "mode",
]);

const LEARNING_GAME_LEGACY_KEYS = new Set([
  "choices",
  "correctAnswer",
  "type",
  "mode",
]);

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

function omitKeys(value, keys) {
  return Object.fromEntries(
    Object.entries(value || {}).filter(([key]) => !keys.has(key)),
  );
}

function hashSeed(value) {
  let hash = 2166136261;

  for (const character of String(value || "")) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function stableItemKey(item) {
  if (item === null || item === undefined) {
    return "";
  }

  if (typeof item !== "object") {
    return String(item);
  }

  return String(
    item.id ??
      item.value ??
      item.word ??
      item.label ??
      item.token ??
      JSON.stringify(item),
  );
}

function deterministicShuffle(items, seed) {
  // Factories may use runtime shuffle helpers before a legacy session reaches
  // this boundary. Sort by stable content first so the same payload always
  // receives the same canonical order during migration/resume.
  const nextItems = [...items].sort((left, right) => {
    const leftKey = stableItemKey(left);
    const rightKey = stableItemKey(right);

    if (leftKey < rightKey) return -1;
    if (leftKey > rightKey) return 1;
    return 0;
  });
  let state = hashSeed(seed);

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [nextItems[index], nextItems[swapIndex]] = [
      nextItems[swapIndex],
      nextItems[index],
    ];
  }

  return nextItems;
}

function getWordText(challenge) {
  if (typeof challenge?.word === "string" && challenge.word) {
    return challenge.word;
  }

  if (typeof challenge?.targetWord === "string" && challenge.targetWord) {
    return challenge.targetWord;
  }

  if (typeof challenge?.targetWord?.word === "string") {
    return challenge.targetWord.word;
  }

  if (typeof challenge?.reviewWord?.word === "string") {
    return challenge.reviewWord.word;
  }

  return "";
}

function getTargetWord(challenge, wordPool = []) {
  if (challenge?.targetWord && typeof challenge.targetWord === "object") {
    const canonicalTarget = wordPool.find(
      (word) => word?.id && word.id === challenge.targetWord.id,
    );

    return canonicalTarget || challenge.targetWord;
  }

  if (challenge?.reviewWord && typeof challenge.reviewWord === "object") {
    const canonicalTarget = wordPool.find(
      (word) => word?.id && word.id === challenge.reviewWord.id,
    );

    return canonicalTarget || challenge.reviewWord;
  }

  if (typeof challenge?.targetWord === "string" && challenge.targetWord) {
    const canonicalTarget = wordPool.find(
      (word) => word?.id === challenge.targetWord || word?.word === challenge.targetWord,
    );

    if (canonicalTarget) {
      return canonicalTarget;
    }

    return {
      id: challenge.targetWord,
      word: challenge.targetWord,
    };
  }

  return null;
}

function tokenizeLegacyWord(challenge) {
  if (Array.isArray(challenge?.targetTokens) && challenge.targetTokens.length) {
    return [...challenge.targetTokens];
  }

  return Array.from(getWordText(challenge));
}

function uniqueWords(words) {
  const seen = new Set();

  return words.filter((word) => {
    if (!word?.id || !word?.word || seen.has(word.id)) {
      return false;
    }

    seen.add(word.id);
    return true;
  });
}

function createTokenBank(challenge, targetTokens) {
  return deterministicShuffle(
    targetTokens.map((value, index) => ({
      id: `${challenge.id || "legacy-spelling"}-token-${index + 1}`,
      value,
    })),
    `${challenge.id || "legacy-spelling"}:tokens`,
  );
}

function migrateFirstLetterChallenge(challenge) {
  const targetTokens = tokenizeLegacyWord(challenge);

  if (!challenge?.id || targetTokens.length === 0) {
    return {
      status: "error",
      challenge: null,
      reason: "Legacy first-letter challenge has no stable word tokens.",
    };
  }

  const base = omitKeys(challenge, SPELLING_LEGACY_KEYS);

  return {
    status: "migrated",
    challenge: {
      ...base,
      id: challenge.id,
      type: "spelling-order",
      mode: "spelling-order",
      targetTokens,
      shuffledTokens: createTokenBank(challenge, targetTokens),
      reviewWord: challenge.reviewWord || base,
      legacyMigration: "first-letter-pick-to-spelling-order",
    },
  };
}

function migrateLetterNinjaChallenge(challenge, wordPool) {
  const targetWord = getTargetWord(challenge, wordPool);
  const choices = deterministicShuffle(
    uniqueWords([targetWord, ...(Array.isArray(wordPool) ? wordPool : [])]).slice(
      0,
      4,
    ),
    `${challenge.id || "legacy-learning-game"}:choices`,
  );

  if (!challenge?.id || !targetWord?.id || !targetWord?.word || choices.length < 3) {
    return {
      status: "error",
      challenge: null,
      reason: "Legacy Letter Ninja challenge cannot build three valid word choices.",
    };
  }

  const base = omitKeys(challenge, LEARNING_GAME_LEGACY_KEYS);

  return {
    status: "migrated",
    challenge: {
      ...base,
      id: challenge.id,
      type: "learning-game",
      mode: "sound-bubble-pop",
      answerKind: "choice",
      title: "Sound Bubble Pop",
      instruction: "Listen carefully. Pop the bubble with the matching word.",
      skillLabel: "Listening + picture recognition",
      skillId: "listening-vocabulary",
      targetWord,
      reviewWord: targetWord,
      promptWord: targetWord.word,
      phonics: targetWord.phonics || targetWord.pronunciation?.guide || "",
      audio: {
        word: targetWord.word,
        phonics: targetWord.phonics || targetWord.pronunciation?.guide || "",
      },
      choices,
      correctChoiceId: targetWord.id,
      legacyMigration: "letter-ninja-to-sound-bubble-pop",
    },
  };
}

export function migrateLegacyChallenge(challenge, { wordPool = [] } = {}) {
  const mode = challenge?.mode || challenge?.type;

  if (mode === "first-letter-pick") {
    return migrateFirstLetterChallenge(challenge);
  }

  if (mode === "letter-ninja") {
    return migrateLetterNinjaChallenge(challenge, wordPool);
  }

  return {
    status: "unchanged",
    challenge,
  };
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

export function getMigrationWordPool(levelConfig, library = [], subjectId = "") {
  const subject = library.find((item) => item.id === subjectId);
  const index = new Map(
    getSubjectWords(subject).map((word) => [word.id, word]),
  );
  const configuredWords = [
    ...(levelConfig?.randomPool || [])
      .map((word) => (typeof word === "string" ? index.get(word) : word))
      .filter(Boolean),
    ...(levelConfig?.randomPoolIds || [])
      .map((id) => (typeof id === "string" ? index.get(id) : id))
      .filter(Boolean),
    ...(levelConfig?.reviewWords || []),
    ...(levelConfig?.words || []),
  ];

  return uniqueWords(configuredWords);
}

function getCanonicalLevelConfig(activity, library) {
  const subject = library.find((item) => item.id === activity?.subjectId);
  const levelId = activity?.levelConfig?.id;

  return (
    subject?.levels?.find((level) => level.id === levelId) ||
    activity?.levelConfig ||
    null
  );
}

function getCanonicalExercise(levelConfig, challenge) {
  const sourceId = challenge?.sourceChallengeId || challenge?.id || "";
  const exercises = Array.isArray(levelConfig?.exercises)
    ? levelConfig.exercises
    : [];

  return exercises.find((exercise) =>
    exercise?.id === sourceId ||
    sourceId.startsWith(`${exercise?.id || ""}-runtime-`),
  ) || null;
}

function refreshScienceWordVisual(word, wordIndex) {
  if (!word || typeof word !== "object" || !word.id) {
    return { changed: false, word };
  }

  const canonicalWord = wordIndex.get(word.id);
  if (!canonicalWord?.image) {
    return { changed: false, word };
  }

  const nextWord = {
    ...word,
    image: canonicalWord.image,
    ...(canonicalWord.sciencePhotoAssetId
      ? { sciencePhotoAssetId: canonicalWord.sciencePhotoAssetId }
      : {}),
  };

  return {
    changed:
      nextWord.image !== word.image ||
      nextWord.sciencePhotoAssetId !== word.sciencePhotoAssetId,
    word: nextWord,
  };
}

function refreshScienceWordList(words, wordIndex) {
  if (!Array.isArray(words)) {
    return { changed: false, words };
  }

  let changed = false;
  const nextWords = words.map((word) => {
    const result = refreshScienceWordVisual(word, wordIndex);
    changed = changed || result.changed;
    return result.word;
  });

  return { changed, words: nextWords };
}

/**
 * Replace stale embedded Science photos in a saved challenge with the current
 * local registry values. Only visual fields are refreshed: challenge IDs,
 * choice order, basket assignments, prompts, and answer semantics remain
 * exactly as the learner left them.
 */
export function refreshScienceChallengeVisuals(
  challenge,
  { library = [], subjectId = "" } = {},
) {
  if (!challenge || subjectId !== "science-exercises") {
    return { status: "unchanged", challenge };
  }

  const subject = library.find((item) => item?.id === subjectId);
  const wordIndex = new Map(
    getSubjectWords(subject)
      .filter((word) => word?.id)
      .map((word) => [word.id, word]),
  );

  if (wordIndex.size === 0) {
    return { status: "unchanged", challenge };
  }

  let changed = false;
  const nextChallenge = { ...challenge };

  for (const key of ["choices", "items", "groupWords"]) {
    const result = refreshScienceWordList(challenge[key], wordIndex);
    if (result.changed) {
      changed = true;
      nextChallenge[key] = result.words;
    }
  }

  for (const key of ["oddWord", "reviewWord", "targetWord"]) {
    const result = refreshScienceWordVisual(challenge[key], wordIndex);
    if (result.changed) {
      changed = true;
      nextChallenge[key] = result.word;
    }
  }

  return {
    status: changed ? "migrated" : "unchanged",
    challenge: nextChallenge,
  };
}

/**
 * Rehydrate only the visual URL for a saved Final Test challenge. Stable
 * question IDs, option order and answer keys remain untouched so a resume
 * never changes what the learner is answering.
 */
export function refreshFinalTestChallengeVisuals(
  challenge,
  { subjectId = "" } = {},
) {
  if (!challenge || subjectId !== "final-test") {
    return { status: "unchanged", challenge };
  }

  let changed = false;
  const refresh = (value) => {
    if (Array.isArray(value)) {
      return value.map(refresh);
    }

    if (!value || typeof value !== "object") {
      return value;
    }

    const next = Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, refresh(item)]),
    );
    const assetId = value.photoAssetId;
    const asset = assetId ? getFinalTestPhotoAsset(assetId) : null;

    if (asset && next.image !== asset.src) {
      next.image = asset.src;
      changed = true;
    }

    return next;
  };

  const refreshed = refresh(challenge);
  return {
    status: changed ? "migrated" : "unchanged",
    challenge: refreshed,
  };
}

function getSpellingWordData(challenge, canonicalExercise) {
  const source = canonicalExercise || challenge;
  const wordData = source?.reviewWord || source;
  const word = wordData?.word || challenge?.word || "";

  if (!word || !Array.isArray(wordData?.targetTokens || challenge?.targetTokens)) {
    return null;
  }

  return {
    ...wordData,
    ...challenge,
    id: wordData.id || challenge.id,
    word,
    targetTokens: [...(wordData.targetTokens || challenge.targetTokens)],
    reviewWord: wordData.reviewWord || wordData,
  };
}

function getChoiceValues(challenge) {
  return Array.isArray(challenge?.choices)
    ? challenge.choices
        .map((choice) => (typeof choice === "string" ? choice : choice?.value))
        .filter((value) => typeof value === "string" && value)
    : [];
}

function isUsableSpellingChallenge(challenge, mode) {
  const targetTokens = Array.isArray(challenge?.targetTokens)
    ? challenge.targetTokens
    : [];

  if (targetTokens.length === 0) {
    return false;
  }

  if (["spelling-order", "learn-write-speak"].includes(mode)) {
    return Array.isArray(challenge?.shuffledTokens) &&
      challenge.shuffledTokens.length >= targetTokens.length;
  }

  if (mode === "token-bank-limited") {
    return Array.isArray(challenge?.bankTokens) &&
      challenge.bankTokens.length >= targetTokens.length + 1;
  }

  if (["missing-letter", "word-repair"].includes(mode)) {
    return Array.isArray(challenge?.patternTokens) &&
      challenge.patternTokens.some((token) => token === null) &&
      getChoiceValues(challenge).length >= 3 &&
      typeof challenge.correctAnswer === "string" &&
      challenge.correctAnswer.length > 0;
  }

  if (["sound-to-word-choice", "tricky-word-pick"].includes(mode)) {
    const choices = getChoiceValues(challenge);
    return choices.length >= 3 &&
      choices.includes(challenge.correctAnswer || challenge.word);
  }

  if (["write-from-memory", "spelling-sprint"].includes(mode)) {
    return challenge.answerPolicy === "exact-word";
  }

  return false;
}

function buildCanonicalSpellingChallenge(challenge, canonicalExercise, levelConfig) {
  const mode = levelConfig?.canonicalMode || levelConfig?.mode;
  const wordData = getSpellingWordData(challenge, canonicalExercise);

  if (!wordData || !SPELLING_MODES.has(mode)) {
    return null;
  }

  const canonical = canonicalExercise || challenge;
  let rebuilt = canonical;

  switch (mode) {
    case "spelling-order":
    case "token-bank-limited":
    case "learn-write-speak":
      rebuilt = createSpellingOrderChallenge(wordData.id, wordData, mode);
      break;
    case "missing-letter":
      rebuilt = isUsableSpellingChallenge(canonicalExercise, mode)
        ? canonicalExercise
        : createMissingLetterChallenge(
            wordData.id,
            wordData,
            Math.min(1, Math.max(0, wordData.targetTokens.length - 1)),
            wordData.targetTokens.slice(0, 4),
          );
      break;
    case "sound-to-word-choice":
    case "tricky-word-pick":
      {
        const sourceChoices = getChoiceValues(canonicalExercise || challenge);
        const uniqueChoices = sourceChoices.filter(
          (value, index, values) => values.indexOf(value) === index,
        );

        if (uniqueChoices.length < 3 || !uniqueChoices.includes(wordData.word)) {
          return null;
        }

        rebuilt = createWordChoiceChallenge(
          wordData.id,
          mode,
          wordData,
          uniqueChoices,
          canonicalExercise?.promptText ||
            (mode === "sound-to-word-choice"
              ? "Listen and choose the right word."
              : "Look carefully and choose the right word."),
        );
      }
      break;
    case "write-from-memory":
      rebuilt = createWriteFromMemoryChallenge(wordData.id, wordData);
      break;
    case "word-repair":
      rebuilt = createWordRepairChallenge(wordData.id, wordData);
      break;
    case "spelling-sprint":
      rebuilt = createSpellingSprintChallenge(
        wordData.id,
        wordData,
        canonicalExercise?.sprintRound || 1,
        canonicalExercise?.sprintTotal || levelConfig?.wordCount || 1,
      );
      break;
    default:
      return null;
  }

  if (Array.isArray(rebuilt.shuffledTokens)) {
    rebuilt = {
      ...rebuilt,
      shuffledTokens: deterministicShuffle(
        rebuilt.shuffledTokens,
        `${challenge.id || wordData.id}:shuffled-tokens`,
      ),
    };
  }

  if (Array.isArray(rebuilt.bankTokens)) {
    rebuilt = {
      ...rebuilt,
      bankTokens: deterministicShuffle(
        rebuilt.bankTokens,
        `${challenge.id || wordData.id}:bank-tokens`,
      ),
    };
  }

  if (Array.isArray(rebuilt.choices)) {
    rebuilt = {
      ...rebuilt,
      choices: deterministicShuffle(
        rebuilt.choices,
        `${challenge.id || wordData.id}:choices`,
      ),
    };
  }

  return {
    ...rebuilt,
    id: challenge.id || rebuilt.id,
    ...(challenge.sourceChallengeId
      ? { sourceChallengeId: challenge.sourceChallengeId }
      : { sourceChallengeId: rebuilt.id }),
    ...(challenge.legacyMigration
      ? { legacyMigration: challenge.legacyMigration }
      : {}),
  };
}

export function normalizeChallengeSurface(
  challenge,
  { levelConfig = null, subjectId = "", trackId = "" } = {},
) {
  if (!challenge || !levelConfig) {
    return { status: "unchanged", challenge };
  }

  const surface = getSurfaceDefinition(subjectId, levelConfig.levelNumber, {
    trackId,
  });
  const canonicalMode = levelConfig.canonicalMode || levelConfig.mode || surface?.mode;
  const isSpelling = SPELLING_MODES.has(challenge.mode) || SPELLING_MODES.has(canonicalMode);
  let nextChallenge = challenge;
  let changed = false;

  if (
    isSpelling &&
    canonicalMode &&
    (challenge.mode !== canonicalMode || !isUsableSpellingChallenge(challenge, canonicalMode))
  ) {
    nextChallenge = buildCanonicalSpellingChallenge(
      challenge,
      getCanonicalExercise(levelConfig, challenge),
      levelConfig,
    );

    if (!nextChallenge) {
      return {
        status: "error",
        challenge: null,
        reason: "Spelling session cannot be rebuilt from the canonical level surface.",
      };
    }

    changed = true;
  }

  if (surface) {
    const decorated = {
      ...nextChallenge,
      surfaceId: surface.surfaceId,
      surfaceKind: surface.kind,
      surfaceVariant: surface.surfaceVariant,
      rendererKey: surface.rendererKey,
      answerRepresentation: surface.answerRepresentation,
    };
    changed = changed ||
      decorated.surfaceId !== challenge.surfaceId ||
      decorated.surfaceVariant !== challenge.surfaceVariant;
    nextChallenge = decorated;
  }

  return {
    status: changed ? "migrated" : "unchanged",
    challenge: nextChallenge,
  };
}

export function migrateActiveMission(activeMission, { library = [] } = {}) {
  if (!activeMission?.activities?.length) {
    return {
      status: "unchanged",
      mission: activeMission,
    };
  }

  let migrated = false;
  const activities = [];

  for (const activity of activeMission.activities) {
    const levelConfig = getCanonicalLevelConfig(activity, library);
    const wordPool = getMigrationWordPool(
      levelConfig,
      library,
      activity?.subjectId,
    );
    const result = migrateLegacyChallenge(activity.challenge, { wordPool });

    if (result.status === "error") {
      return result;
    }

    const normalized = normalizeChallengeSurface(
      result.challenge,
      {
        levelConfig,
        subjectId: activity?.subjectId || "",
        trackId: activity?.trackId || "",
      },
    );

    if (normalized.status === "error") {
      return normalized;
    }

    const scienceVisualRefresh = refreshScienceChallengeVisuals(normalized.challenge, {
      library,
      subjectId: activity?.subjectId || "",
    });
    const visualRefresh = refreshFinalTestChallengeVisuals(
      scienceVisualRefresh.challenge,
      { subjectId: activity?.subjectId || "" },
    );
    const challengeMigrated =
      result.status === "migrated" ||
      normalized.status === "migrated" ||
      scienceVisualRefresh.status === "migrated" ||
      visualRefresh.status === "migrated";

    if (challengeMigrated) {
      migrated = true;
    }

    activities.push({
      ...activity,
      ...(challengeMigrated ? { challenge: visualRefresh.challenge } : {}),
      ...(challengeMigrated && levelConfig
        ? { levelConfig }
        : {}),
    });
  }

  if (!migrated) {
    return {
      status: "unchanged",
      mission: activeMission,
    };
  }

  return {
    status: "migrated",
    mission: {
      ...activeMission,
      activities,
    },
  };
}

export function isLegacyChallengeMode(mode) {
  return LEGACY_CHALLENGE_MODES.has(mode);
}

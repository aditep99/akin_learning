import { learningGamesSubject } from "./subjects/learningGames.js";

export const ARCADE_STORAGE_KEYS = {
  bestScore: "akinlearning.arcade.best-score.v1",
  favorites: "akinlearning.arcade.favorites.v1",
  collection: "akinlearning.arcade.collection.v1",
};

const ARCADE_MODE_CATALOG = [
  {
    id: "word-fishing",
    label: "Word Fishing",
    description: "Catch the word that matches the picture.",
    skillId: "vocabulary-reading",
    buddyId: "boat-bubble",
  },
  {
    id: "zombie-word-munch",
    label: "Zombie Word Munch",
    description: "Feed the friendly monster the right word.",
    skillId: "vocabulary-recognition",
    buddyId: "soldier-sprout",
  },
  {
    id: "memory-match",
    label: "Monster Memory",
    description: "Remember the picture and word pairs.",
    skillId: "vocabulary-memory",
    buddyId: "boat-bubble",
  },
  {
    id: "treasure-sort",
    label: "Treasure Sort",
    description: "Sort the learning treasures into the right chests.",
    skillId: "vocabulary-categories",
    buddyId: "pirate-pearl",
  },
  {
    id: "sound-safari",
    label: "Sound Safari",
    description: "Listen carefully and find the matching picture.",
    skillId: "listening-vocabulary",
    buddyId: "music-mimi",
  },
  {
    id: "word-rocket",
    label: "Word Rocket",
    description: "Build the word and launch the rocket.",
    skillId: "spelling-letter-order",
    buddyId: "rocket-rio",
  },
  {
    id: "sound-bubble-pop",
    label: "Sound Bubble Pop",
    description: "Pop the picture you hear before it floats away.",
    skillId: "listening-vocabulary",
    buddyId: "cloud-coco",
  },
  {
    id: "monster-delivery",
    label: "Monster Delivery",
    description: "Deliver the word to the matching monster.",
    skillId: "vocabulary-reading",
    buddyId: "train-toot",
  },
  {
    id: "echo-memory",
    label: "Echo Memory",
    description: "Match each sound with its picture.",
    skillId: "listening-memory",
    buddyId: "music-mimi",
  },
];

const ARCADE_MODE_IDS = new Set(ARCADE_MODE_CATALOG.map((mode) => mode.id));
const SOURCE_SUBJECTS = new Set([
  "animals",
  "fruits-vegetables",
  "school-things",
]);

let challengeSequence = 0;

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

function clampDifficulty(value) {
  return Math.min(Math.max(Number(value) || 1, 1), 3);
}

function createChallengeId(mode) {
  challengeSequence += 1;
  return `arcade-${mode}-${Date.now()}-${challengeSequence}`;
}

function getSubjectWords(subject) {
  const directWords = Array.isArray(subject?.words) ? subject.words : [];

  if (directWords.length > 0) {
    return directWords;
  }

  return (subject?.levels || []).flatMap((level) => [
    ...(level.words || []),
    ...(level.reviewWords || []),
  ]);
}

function enrichWord(word, sourceSubjectId) {
  if (!word?.id || !word?.word) {
    return null;
  }

  return {
    ...word,
    arcadeCategory:
      sourceSubjectId === "animals"
        ? "animals"
        : sourceSubjectId === "school-things"
          ? "school"
          : "food",
  };
}

function uniqueWords(words) {
  const seen = new Set();

  return words.filter((word) => {
    if (!word?.id || seen.has(word.id)) {
      return false;
    }

    seen.add(word.id);
    return true;
  });
}

export function getArcadeModeCatalog() {
  return ARCADE_MODE_CATALOG.map((mode) => ({ ...mode }));
}

export function getArcadeWordPool(library = []) {
  const loadedWords = library.flatMap((subject) => {
    if (!SOURCE_SUBJECTS.has(subject?.id)) {
      return [];
    }

    return getSubjectWords(subject)
      .map((word) => enrichWord(word, subject.id))
      .filter(Boolean);
  });

  const fallbackWords = getSubjectWords(learningGamesSubject)
    .map((word) => {
      const sourceSubjectId = [
        "cat",
        "dog",
        "lion",
        "tiger",
        "elephant",
      ].includes(word.id)
        ? "animals"
        : ["book", "pencil", "ruler", "chair"].includes(word.id)
          ? "school-things"
          : "fruits-vegetables";

      return enrichWord(word, sourceSubjectId);
    })
    .filter(Boolean);

  const words = uniqueWords([...loadedWords, ...fallbackWords]);

  return words.length >= 4 ? words : uniqueWords(fallbackWords);
}

function pickTarget(wordPool, recentWordIds = []) {
  const recent = new Set(recentWordIds.slice(-4));
  const available = wordPool.filter((word) => !recent.has(word.id));
  const candidates = available.length > 0 ? available : wordPool;

  return candidates[Math.floor(Math.random() * candidates.length)] || null;
}

function pickMode(preferredModeIds, recentModes = []) {
  const preferred = Array.isArray(preferredModeIds)
    ? preferredModeIds.filter((id) => ARCADE_MODE_IDS.has(id))
    : [];
  const allowedIds = preferred.length
    ? preferred
    : ARCADE_MODE_CATALOG.map((mode) => mode.id);
  const recent = recentModes.slice(-2);
  const availableIds = allowedIds.filter((id) => !recent.includes(id));
  const candidates = availableIds.length > 0 ? availableIds : allowedIds;
  const modeId = candidates[Math.floor(Math.random() * candidates.length)];

  return (
    ARCADE_MODE_CATALOG.find((mode) => mode.id === modeId) ||
    ARCADE_MODE_CATALOG[0]
  );
}

function pickChoices(target, wordPool, difficulty, countOverride = null) {
  const count = countOverride || (difficulty >= 2 ? 4 : 3);
  const distractors = shuffle(
    wordPool.filter((word) => word.id !== target.id),
  ).slice(0, Math.max(count - 1, 1));

  return shuffle([target, ...distractors]);
}

function createChoiceChallenge({ mode, target, choices, difficulty, title, instruction }) {
  return {
    id: createChallengeId(mode.id),
    type: "learning-game",
    mode: mode.id,
    answerKind: "choice",
    title,
    instruction,
    skillLabel: mode.skillId,
    skillId: mode.skillId,
    difficulty,
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

function createMemoryPairs(target, wordPool, difficulty) {
  const pairCount = difficulty >= 3 ? 3 : 2;
  const extras = shuffle(wordPool.filter((word) => word.id !== target.id));

  return [target, ...extras].slice(0, pairCount);
}

function createSortChallenge(target, wordPool, difficulty, mode) {
  const animals = wordPool.filter((word) => word.arcadeCategory === "animals");
  const school = wordPool.filter((word) => word.arcadeCategory === "school");
  const fallback = shuffle(wordPool.filter((word) => word.id !== target.id));
  const animalItems = (animals.length >= 2 ? shuffle(animals) : fallback).slice(
    0,
    difficulty >= 3 ? 3 : 2,
  );
  const schoolItems = (school.length >= 2 ? shuffle(school) : fallback).slice(
    0,
    difficulty >= 3 ? 3 : 2,
  );
  const items = [
    ...animalItems.map((word) => ({ ...word, basketId: "animals" })),
    ...schoolItems.map((word) => ({ ...word, basketId: "school" })),
  ];

  return {
    id: createChallengeId(mode.id),
    type: "learning-game",
    mode: mode.id,
    answerKind: "sort-item",
    title: mode.label,
    instruction: mode.description,
    skillLabel: mode.skillId,
    skillId: mode.skillId,
    difficulty,
    targetWord: target,
    choices: [],
    correctChoiceId: null,
    baskets: [
      { id: "animals", label: "Animals", emoji: "🐾" },
      { id: "school", label: "School", emoji: "🎒" },
    ],
    items,
  };
}

function createRocketLetters(target) {
  const targetLetters = target.word.toUpperCase().split("");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const distractors = shuffle(
    alphabet.filter((letter) => !targetLetters.includes(letter)),
  ).slice(0, targetLetters.length > 6 ? 1 : 2);

  return shuffle([...targetLetters, ...distractors]);
}

export function createArcadeChallenge({
  wordPool = [],
  difficulty = 1,
  recentWordIds = [],
  recentModes = [],
  preferredModeIds = [],
} = {}) {
  const safePool = wordPool.length >= 4 ? wordPool : getArcadeWordPool();
  const safeDifficulty = clampDifficulty(difficulty);
  const mode = pickMode(preferredModeIds, recentModes);
  const target = pickTarget(safePool, recentWordIds);

  if (!target) {
    return null;
  }

  if (mode.id === "memory-match") {
    const pairs = createMemoryPairs(target, safePool, safeDifficulty);

    return {
      id: createChallengeId(mode.id),
      type: "learning-game",
      mode: mode.id,
      answerKind: "memory-pair",
      title: mode.label,
      instruction: mode.description,
      skillLabel: mode.skillId,
      skillId: mode.skillId,
      difficulty: safeDifficulty,
      targetWord: target,
      pairs,
    };
  }

  if (mode.id === "treasure-sort") {
    return createSortChallenge(target, safePool, safeDifficulty, mode);
  }

  if (mode.id === "word-rocket") {
    return {
      ...createChoiceChallenge({
        mode,
        target,
        choices: [],
        difficulty: safeDifficulty,
        title: mode.label,
        instruction: mode.description,
      }),
      answerKind: "sequence-letter",
      letters: createRocketLetters(target),
    };
  }

  const choices = pickChoices(target, safePool, safeDifficulty);

  if (mode.id === "sound-safari") {
    return createChoiceChallenge({
      mode,
      target,
      choices,
      difficulty: safeDifficulty,
      title: mode.label,
      instruction: mode.description,
    });
  }

  if (mode.id === "sound-bubble-pop") {
    return {
      ...createChoiceChallenge({
        mode,
        target,
        choices,
        difficulty: safeDifficulty,
        title: mode.label,
        instruction: mode.description,
      }),
      promptWord: target.word,
    };
  }

  if (mode.id === "monster-delivery") {
    return createChoiceChallenge({
      mode,
      target,
      choices,
      difficulty: safeDifficulty,
      title: mode.label,
      instruction: mode.description,
    });
  }

  if (mode.id === "echo-memory") {
    const pairs = createMemoryPairs(target, safePool, safeDifficulty);

    return {
      id: createChallengeId(mode.id),
      type: "learning-game",
      mode: mode.id,
      answerKind: "memory-pair",
      title: mode.label,
      instruction: mode.description,
      skillLabel: mode.skillId,
      skillId: mode.skillId,
      difficulty: safeDifficulty,
      targetWord: target,
      pairs,
    };
  }

  return createChoiceChallenge({
    mode,
    target,
    choices,
    difficulty: safeDifficulty,
    title: mode.label,
    instruction: mode.description,
  });
}

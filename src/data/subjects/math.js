import catPhoto from "../../assets/animals/photo/cat-photo.png";
import cowPhoto from "../../assets/animals/photo/cow-photo.png";
import pigPhoto from "../../assets/animals/photo/pig-photo.png";
import rabbitPhoto from "../../assets/animals/photo/rabbit-photo.png";
import sheepPhoto from "../../assets/animals/photo/sheep-photo.png";
import { getSurfaceDefinition } from "../missionSurfaces.js";

const mathWords = [
  {
    id: "count",
    word: "Count",
    emoji: "123",
    phonics: "เคานท์",
    pronunciation: { guide: "count", ipa: "/kaʊnt/" },
    translation: "นับ",
  },
  {
    id: "add",
    word: "Add",
    emoji: "+",
    phonics: "แอด",
    pronunciation: { guide: "add", ipa: "/æd/" },
    translation: "บวก",
  },
  {
    id: "subtract",
    word: "Subtract",
    emoji: "-",
    phonics: "ซับแทรกท์",
    pronunciation: { guide: "sub·tract", ipa: "/səbˈtrækt/" },
    translation: "ลบ",
  },
  {
    id: "total",
    word: "Total",
    emoji: "=",
    phonics: "โทเทิล",
    pronunciation: { guide: "to·tal", ipa: "/ˈtoʊ.təl/" },
    translation: "ทั้งหมด",
  },
  {
    id: "equal",
    word: "Equal",
    emoji: "=",
    phonics: "อีควอล",
    pronunciation: { guide: "e·qual", ipa: "/ˈiː.kwəl/" },
    translation: "เท่ากับ",
  },
  {
    id: "one",
    word: "One",
    emoji: "1",
    phonics: "วัน",
    pronunciation: { guide: "one", ipa: "/wʌn/" },
    translation: "หนึ่ง",
  },
  {
    id: "two",
    word: "Two",
    emoji: "2",
    phonics: "ทู",
    pronunciation: { guide: "two", ipa: "/tuː/" },
    translation: "สอง",
  },
  {
    id: "three",
    word: "Three",
    emoji: "3",
    phonics: "ทรี",
    pronunciation: { guide: "three", ipa: "/θriː/" },
    translation: "สาม",
  },
  {
    id: "four",
    word: "Four",
    emoji: "4",
    phonics: "โฟร์",
    pronunciation: { guide: "four", ipa: "/fɔːr/" },
    translation: "สี่",
  },
  {
    id: "five",
    word: "Five",
    emoji: "5",
    phonics: "ไฟฟ์",
    pronunciation: { guide: "five", ipa: "/faɪv/" },
    translation: "ห้า",
  },
  {
    id: "six",
    word: "Six",
    emoji: "6",
    phonics: "ซิกซ์",
    pronunciation: { guide: "six", ipa: "/sɪks/" },
    translation: "หก",
  },
];

const animalCards = {
  cat: { id: "cat", word: "Cat", translation: "แมว", image: catPhoto },
  cow: { id: "cow", word: "Cow", translation: "วัว", image: cowPhoto },
  pig: { id: "pig", word: "Pig", translation: "หมู", image: pigPhoto },
  rabbit: { id: "rabbit", word: "Rabbit", translation: "กระต่าย", image: rabbitPhoto },
  sheep: { id: "sheep", word: "Sheep", translation: "แกะ", image: sheepPhoto },
};

const animalIds = Object.keys(animalCards);

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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne(items) {
  return items[randomInt(0, items.length - 1)];
}

function pickDifferentAnimal(excludedAnimalId, pool) {
  const nextPool = pool.filter((animalId) => animalId !== excludedAnimalId);
  return pickOne(nextPool.length > 0 ? nextPool : pool);
}

function buildOperatorSequence({ exerciseCount, operatorPool, subtractionCount = 0 }) {
  const operators = Array.from({ length: exerciseCount }, (_, index) => {
    if (!operatorPool.includes("-")) {
      return "+";
    }

    return index < subtractionCount ? "-" : "+";
  });

  return shuffle(operators);
}

function buildCorrectSlots(exerciseCount) {
  const basePattern = [0, 1, 2, 3];
  const slots = [];

  while (slots.length < exerciseCount) {
    slots.push(...shuffle(basePattern));
  }

  return slots.slice(0, exerciseCount);
}

function buildAnswerChoices({
  answer,
  correctSlot,
  previousAnswer,
  maxValue,
}) {
  const lowCandidates = [];
  const highCandidates = [];

  for (let value = 0; value <= maxValue; value += 1) {
    if (value === answer || value === previousAnswer) {
      continue;
    }

    if (value < answer) {
      lowCandidates.push(value);
    } else if (value > answer) {
      highCandidates.push(value);
    }
  }

  const distractors = [];

  if (lowCandidates.length > 0) {
    distractors.push(pickOne(lowCandidates));
  }

  if (highCandidates.length > 0) {
    distractors.push(pickOne(highCandidates));
  }

  const mixedPool = shuffle([...lowCandidates, ...highCandidates]);

  for (const value of mixedPool) {
    if (!distractors.includes(value)) {
      distractors.push(value);
    }

    if (distractors.length === 3) {
      break;
    }
  }

  while (distractors.length < 3) {
    const fallback = randomInt(0, maxValue);
    if (fallback !== answer && fallback !== previousAnswer && !distractors.includes(fallback)) {
      distractors.push(fallback);
    }
  }

  const choices = [];
  let distractorIndex = 0;

  for (let index = 0; index < 4; index += 1) {
    if (index === correctSlot) {
      choices.push(answer);
    } else {
      choices.push(distractors[distractorIndex]);
      distractorIndex += 1;
    }
  }

  return choices;
}

function buildSceneAnimals(sceneCounts, removedAnimalId, removedCount) {
  const animals = [];
  const removedIds = [];
  const focusIds = [];

  Object.entries(sceneCounts).forEach(([animalId, count]) => {
    for (let index = 0; index < count; index += 1) {
      const id = `${animalId}-${index + 1}`;
      animals.push({
        ...animalCards[animalId],
        id,
        wordId: animalId,
      });

      focusIds.push(id);

      if (animalId === removedAnimalId && index >= count - removedCount) {
        removedIds.push(id);
      }
    }
  });

  return {
    animals: shuffle(animals),
    removedIds,
    focusIds,
  };
}

function getSceneAnimalWordId(animal = {}) {
  if (animal.wordId && animalCards[animal.wordId]) {
    return animal.wordId;
  }

  if (animal.id && animalCards[animal.id]) {
    return animal.id;
  }

  const instanceMatch = String(animal.id || "").match(/^(.*)-\d+$/);
  if (instanceMatch?.[1] && animalCards[instanceMatch[1]]) {
    return instanceMatch[1];
  }

  const matchingCard = Object.values(animalCards).find(
    (card) => card.word === animal.word,
  );

  return matchingCard?.id || String(animal.id || "animal");
}

export function normalizeMathSceneChallenge(challenge) {
  if (!challenge || !Array.isArray(challenge.sceneAnimals)) {
    return challenge;
  }

  const originalIds = challenge.sceneAnimals.map((animal) => animal?.id);
  const hasUsableInstanceIds =
    originalIds.every((id) => typeof id === "string" && id.length > 0) &&
    new Set(originalIds).size === originalIds.length;
  const occurrences = new Map();
  const sceneAnimals = challenge.sceneAnimals.map((animal) => {
    const wordId = getSceneAnimalWordId(animal);
    const occurrence = (occurrences.get(wordId) || 0) + 1;
    occurrences.set(wordId, occurrence);

    return {
      ...animal,
      id: hasUsableInstanceIds ? animal.id : `${wordId}-${occurrence}`,
      wordId,
    };
  });
  const sceneIds = new Set(sceneAnimals.map((animal) => animal.id));
  const requestedRemovedIds = challenge.sceneMeta?.removedIds ?? [];
  const hasUsableRemovedIds =
    challenge.operator !== "-" ||
    (requestedRemovedIds.length === challenge.rightCount &&
      requestedRemovedIds.every((id) => sceneIds.has(id)));
  const removedIds = hasUsableRemovedIds
    ? [...requestedRemovedIds]
    : sceneAnimals
        .filter(
          (animal) =>
            animal.wordId ===
            (challenge.rightAnimal?.id || challenge.leftAnimal?.id),
        )
        .slice(-Math.max(0, challenge.rightCount || 0))
        .map((animal) => animal.id);

  return {
    ...challenge,
    sceneAnimals,
    sceneMeta: {
      ...challenge.sceneMeta,
      mode:
        challenge.sceneMeta?.mode ||
        (challenge.operator === "-" ? "remove" : "combine"),
      removedIds,
      focusIds: sceneAnimals.map((animal) => animal.id),
    },
  };
}

function buildAdditionExercise({
  id,
  levelConfig,
  previousAnswer,
  correctSlot,
}) {
  const maxValue = levelConfig.answerRange.max;
  const additionRange = levelConfig.additionCountRange || levelConfig.countRange;
  const leftAnimalId = pickOne(levelConfig.animalPool);
  const rightAnimalId = pickDifferentAnimal(leftAnimalId, levelConfig.animalPool);
  const answerMin = Math.max(2, levelConfig.answerRange.min);
  const answer = randomInt(answerMin, maxValue);
  const leftMin = Math.max(additionRange.min, answer - additionRange.max);
  const leftMax = Math.min(additionRange.max, answer - additionRange.min);

  if (leftMin > leftMax) {
    return null;
  }

  const leftCount = randomInt(leftMin, leftMax);
  const rightCount = answer - leftCount;
  const distractorIds = shuffle(
    levelConfig.animalPool.filter(
      (animalId) => animalId !== leftAnimalId && animalId !== rightAnimalId,
    ),
  ).slice(0, 2);
  const sceneCounts = {
    [leftAnimalId]: leftCount,
    [rightAnimalId]: rightCount,
  };

    distractorIds.forEach((animalId) => {
      sceneCounts[animalId] = randomInt(
      Math.max(1, additionRange.min),
      Math.min(3, additionRange.max),
    );
  });

  const scene = buildSceneAnimals(sceneCounts, "", 0);

  return {
    id,
    type: "math-count",
    operator: "+",
    leftAnimal: animalCards[leftAnimalId],
    rightAnimal: animalCards[rightAnimalId],
    leftCount,
    rightCount,
    answer,
    answerChoices: buildAnswerChoices({
      answer,
      correctSlot,
      previousAnswer,
      maxValue,
    }),
    sceneAnimals: scene.animals,
    sceneMeta: {
      mode: "combine",
      removedIds: [],
      focusIds: scene.focusIds,
    },
  };
}

function buildSubtractionExercise({
  id,
  levelConfig,
  previousAnswer,
  correctSlot,
}) {
  const maxValue = levelConfig.answerRange.max;
  const subtractionRange = levelConfig.subtractionCountRange || levelConfig.countRange;
  const animalId = pickOne(levelConfig.animalPool);
  const leftCount = randomInt(
    Math.max(subtractionRange.min + 1, 3),
    subtractionRange.max,
  );
  const rightCount = randomInt(1, Math.min(leftCount - 1, levelConfig.subtractionMax ?? leftCount - 1));
  const answer = leftCount - rightCount;

  if (answer < levelConfig.answerRange.min || answer > maxValue) {
    return null;
  }

  const sceneCounts = { [animalId]: leftCount };
  const scene = buildSceneAnimals(sceneCounts, animalId, rightCount);

  return {
    id,
    type: "math-count",
    operator: "-",
    leftAnimal: animalCards[animalId],
    rightAnimal: animalCards[animalId],
    leftCount,
    rightCount,
    answer,
    answerChoices: buildAnswerChoices({
      answer,
      correctSlot,
      previousAnswer,
      maxValue,
    }),
    sceneAnimals: scene.animals,
    sceneMeta: {
      mode: "remove",
      removedIds: scene.removedIds,
      focusIds: scene.focusIds,
    },
  };
}

function buildMathExercise({
  id,
  levelConfig,
  operator,
  previousAnswer,
  correctSlot,
  previousSignature,
}) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const exercise =
      operator === "-"
        ? buildSubtractionExercise({ id, levelConfig, previousAnswer, correctSlot })
        : buildAdditionExercise({ id, levelConfig, previousAnswer, correctSlot });

    if (!exercise) {
      continue;
    }

    const signature = [
      exercise.operator,
      exercise.leftAnimal.id,
      exercise.rightAnimal.id,
      exercise.leftCount,
      exercise.rightCount,
      exercise.answer,
    ].join(":");

    if (exercise.answer === previousAnswer) {
      continue;
    }

    if (signature === previousSignature) {
      continue;
    }

    return exercise;
  }

  return operator === "-"
    ? buildSubtractionExercise({ id, levelConfig, previousAnswer: null, correctSlot })
    : buildAdditionExercise({ id, levelConfig, previousAnswer: null, correctSlot });
}

function createMathLevelConfig(
  levelNumber,
  reviewWordIds,
  {
    exerciseCount,
    operatorPool,
    subtractionCount = 0,
    countRange,
    answerRange,
    subtractionMax,
    additionCountRange,
    subtractionCountRange,
    animalPool = animalIds,
  },
) {
  return {
    id: `math-level-${levelNumber}`,
    levelNumber,
    label: `Level ${levelNumber}`,
    mode: "math-count",
    wordCount: exerciseCount,
    exerciseCount,
    operatorPool,
    subtractionCount,
    countRange,
    answerRange,
    subtractionMax,
    additionCountRange,
    subtractionCountRange,
    animalPool,
    reviewWords: mathWords.filter((word) => reviewWordIds.includes(word.id)),
  };
}

const mathLevels = [
  createMathLevelConfig(1, ["count", "one", "two", "three"], {
    exerciseCount: 5,
    operatorPool: ["+"],
    countRange: { min: 1, max: 3 },
    additionCountRange: { min: 1, max: 3 },
    answerRange: { min: 2, max: 6 },
  }),
  createMathLevelConfig(2, ["add", "total", "two", "four"], {
    exerciseCount: 5,
    operatorPool: ["+"],
    countRange: { min: 4, max: 7 },
    additionCountRange: { min: 4, max: 7 },
    answerRange: { min: 8, max: 14 },
  }),
  createMathLevelConfig(3, ["count", "add", "subtract", "five"], {
    exerciseCount: 5,
    operatorPool: ["+", "-"],
    subtractionCount: 1,
    countRange: { min: 4, max: 9 },
    additionCountRange: { min: 8, max: 9 },
    subtractionCountRange: { min: 4, max: 9 },
    answerRange: { min: 1, max: 18 },
    subtractionMax: 5,
  }),
  createMathLevelConfig(4, ["total", "equal", "subtract", "six"], {
    exerciseCount: 5,
    operatorPool: ["+", "-"],
    subtractionCount: 2,
    countRange: { min: 10, max: 12 },
    additionCountRange: { min: 10, max: 12 },
    subtractionCountRange: { min: 10, max: 12 },
    answerRange: { min: 1, max: 24 },
    subtractionMax: 7,
  }),
  createMathLevelConfig(5, ["count", "add", "subtract", "equal"], {
    exerciseCount: 5,
    operatorPool: ["+", "-"],
    subtractionCount: 2,
    countRange: { min: 13, max: 14 },
    additionCountRange: { min: 13, max: 14 },
    subtractionCountRange: { min: 13, max: 14 },
    answerRange: { min: 0, max: 28 },
    subtractionMax: 9,
  }),
];

export function generateMathLevelSession(levelConfig) {
  const operatorSequence = buildOperatorSequence(levelConfig);
  const correctSlots = buildCorrectSlots(levelConfig.exerciseCount);
  const exercises = [];
  let previousAnswer = null;
  let previousSignature = "";

  operatorSequence.forEach((operator, index) => {
    const exercise = buildMathExercise({
      id: `${levelConfig.id}-round-${index + 1}`,
      levelConfig,
      operator,
      previousAnswer,
      correctSlot: correctSlots[index],
      previousSignature,
    });

    const surface = getSurfaceDefinition("math", levelConfig.levelNumber);
    exercises.push({
      ...exercise,
      surfaceId: levelConfig.surfaceId || surface?.surfaceId,
      surfaceKind: levelConfig.surfaceKind || surface?.kind,
      surfaceVariant: levelConfig.surfaceVariant || surface?.surfaceVariant,
      rendererKey: levelConfig.rendererKey || surface?.rendererKey,
      answerRepresentation:
        levelConfig.answerRepresentation || surface?.answerRepresentation,
    });
    previousAnswer = exercise.answer;
    previousSignature = [
      exercise.operator,
      exercise.leftAnimal.id,
      exercise.rightAnimal.id,
      exercise.leftCount,
      exercise.rightCount,
      exercise.answer,
    ].join(":");
  });

  return {
    id: `${levelConfig.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    exercises,
  };
}

export const mathSubject = {
  id: "math",
  name: "Math",
  category: "basic",
  icon: "🔢",
  description: "Count animals and solve addition or subtraction.",
  words: mathWords,
  levels: mathLevels,
};

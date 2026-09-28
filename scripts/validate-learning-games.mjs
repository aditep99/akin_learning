import { createServer } from "vite";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function getChoiceWrongAnswer(challenge) {
  return challenge.choices?.find(
    (choice) => choice.id !== challenge.correctChoiceId,
  );
}

function validateChoiceChallenge(challenge, validate, label) {
  assert(
    Array.isArray(challenge.choices) && challenge.choices.length >= 3,
    `${label} needs at least three choices.`,
  );
  assert(
    challenge.choices.filter(
      (choice) => choice.id === challenge.correctChoiceId,
    ).length === 1,
    `${label} must have exactly one correct choice.`,
  );

  const wrongChoice = getChoiceWrongAnswer(challenge);
  const wrongResult = validate(challenge, {
    type: "choice",
    choiceId: wrongChoice.id,
  });
  assert(!wrongResult.correct && !wrongResult.complete, `${label} accepted a wrong choice.`);

  const correctResult = validate(challenge, {
    type: "choice",
    choiceId: challenge.correctChoiceId,
  });
  assert(correctResult.correct && correctResult.complete, `${label} rejected its correct choice.`);
}

function validateValueChallenge(challenge, validate, label) {
  const expected = challenge.correctAnswer ?? challenge.targetShape;
  const wrongValue = challenge.choices?.find((choice) => choice !== expected);

  assert(wrongValue !== undefined, `${label} needs a wrong answer to test.`);

  const wrongResult = validate(challenge, {
    type: "value",
    value: wrongValue,
  });
  assert(!wrongResult.correct && !wrongResult.complete, `${label} accepted a wrong value.`);

  const correctResult = validate(challenge, {
    type: "value",
    value: expected,
  });
  assert(correctResult.correct && correctResult.complete, `${label} rejected its correct value.`);
}

function validateMemoryChallenge(challenge, validate, label) {
  assert(
    Array.isArray(challenge.pairs) && challenge.pairs.length >= 2,
    `${label} needs at least two pairs.`,
  );

  const wrongResult = validate(
    challenge,
    {
      type: "memory-pair",
      firstCardId: `${challenge.pairs[0].id}-picture`,
      secondCardId: `${challenge.pairs[1].id}-word`,
      firstPairId: challenge.pairs[0].id,
      secondPairId: challenge.pairs[1].id,
    },
    { matchedPairIds: [] },
  );
  assert(!wrongResult.correct && !wrongResult.complete, `${label} accepted a wrong pair.`);

  let matchedPairIds = [];

  for (let index = 0; index < challenge.pairs.length; index += 1) {
    const pair = challenge.pairs[index];
    const result = validate(
      challenge,
      {
        type: "memory-pair",
        firstCardId: `${pair.id}-picture`,
        secondCardId: `${pair.id}-word`,
        firstPairId: pair.id,
        secondPairId: pair.id,
      },
      { matchedPairIds },
    );

    assert(result.correct, `${label} rejected pair ${pair.id}.`);
    assert(
      result.complete === (index === challenge.pairs.length - 1),
      `${label} completed at the wrong pair.`,
    );
    matchedPairIds = [...matchedPairIds, pair.id];
  }
}

function validateSortChallenge(challenge, validate, label) {
  assert(
    Array.isArray(challenge.baskets) && challenge.baskets.length >= 2,
    `${label} needs at least two baskets.`,
  );
  assert(
    Array.isArray(challenge.items) && challenge.items.length >= 4,
    `${label} needs at least four items.`,
  );

  const firstItem = challenge.items[0];
  const wrongBasket = challenge.baskets.find(
    (basket) => basket.id !== firstItem.basketId,
  );
  const wrongResult = validate(
    challenge,
    {
      type: "sort-item",
      itemId: firstItem.id,
      basketId: wrongBasket.id,
    },
    { placedItemIds: [] },
  );
  assert(!wrongResult.correct && !wrongResult.complete, `${label} accepted a wrong basket.`);

  let placedItemIds = [];

  for (let index = 0; index < challenge.items.length; index += 1) {
    const item = challenge.items[index];
    const result = validate(
      challenge,
      {
        type: "sort-item",
        itemId: item.id,
        basketId: item.basketId,
      },
      { placedItemIds },
    );

    assert(result.correct, `${label} rejected item ${item.id}.`);
    assert(
      result.complete === (index === challenge.items.length - 1),
      `${label} completed before all items were sorted.`,
    );
    placedItemIds = [...placedItemIds, item.id];
  }
}

function validateSequenceChallenge(challenge, validate, label) {
  const target = String(challenge.targetWord?.word || "").toUpperCase();
  const letters = Array.isArray(challenge.letters) ? challenge.letters : [];

  assert(target.length > 0, `${label} has no target word.`);
  assert(letters.length >= target.length, `${label} has too few letters.`);

  const wrongLetterIndex = letters.findIndex(
    (letter) => String(letter).toUpperCase() !== target[0],
  );
  assert(wrongLetterIndex >= 0, `${label} needs a wrong letter to test.`);

  const wrongResult = validate(
    challenge,
    {
      type: "sequence-letter",
      letter: letters[wrongLetterIndex],
      index: wrongLetterIndex,
    },
    { builtLetters: [] },
  );
  assert(!wrongResult.correct && !wrongResult.complete, `${label} accepted a wrong letter.`);

  let builtLetters = [];
  const usedIndexes = new Set();

  for (let index = 0; index < target.length; index += 1) {
    const letterIndex = letters.findIndex(
      (letter, candidateIndex) =>
        !usedIndexes.has(candidateIndex) &&
        String(letter).toUpperCase() === target[index],
    );
    assert(letterIndex >= 0, `${label} is missing letter ${target[index]}.`);

    const result = validate(
      challenge,
      {
        type: "sequence-letter",
        letter: letters[letterIndex],
        index: letterIndex,
      },
      { builtLetters },
    );
    assert(result.correct, `${label} rejected letter ${target[index]}.`);
    assert(
      result.complete === (index === target.length - 1),
      `${label} completed at the wrong letter.`,
    );

    usedIndexes.add(letterIndex);
    builtLetters = [...builtLetters, letters[letterIndex]];
  }
}

function validateChallenge(challenge, validate, label) {
  assert(challenge?.id && challenge?.mode, `${label} has no challenge identity.`);
  assert(challenge.answerKind, `${label} has no answer kind.`);

  switch (challenge.answerKind) {
    case "choice":
      validateChoiceChallenge(challenge, validate, label);
      break;
    case "value":
      validateValueChallenge(challenge, validate, label);
      break;
    case "memory-pair":
      validateMemoryChallenge(challenge, validate, label);
      break;
    case "sort-item":
      validateSortChallenge(challenge, validate, label);
      break;
    case "sequence-letter":
      validateSequenceChallenge(challenge, validate, label);
      break;
    default:
      throw new Error(`${label} has an unsupported answer kind: ${challenge.answerKind}`);
  }
}

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});

try {
  const contentModule = await server.ssrLoadModule("/src/data/contentLibrary.js");
  const surfacesModule = await server.ssrLoadModule("/src/data/missionSurfaces.js");
  const arcadeModule = await server.ssrLoadModule("/src/data/arcadeChallenges.js");
  const answerModule = await server.ssrLoadModule("/src/data/learningGameAnswers.js");
  const learningGamesSubject = contentModule.defaultLibrary.find(
    (subject) => subject.id === "learning-games",
  );
  const validate = answerModule.validateLearningGameAnswer;

  assert(learningGamesSubject?.levels?.length === 10, "Learning Games must keep all ten levels.");
  const replacementLevel = learningGamesSubject.levels.find(
    (level) => level.levelNumber === 4,
  );
  assert(replacementLevel?.exercises?.[0]?.mode === "sound-bubble-pop", "Learning Games level 4 must be Sound Bubble Pop.");
  assert(
    !learningGamesSubject.levels.some((level) =>
      (level.exercises || []).some((challenge) =>
        ["first-letter-pick", "letter-ninja"].includes(challenge.mode),
      ),
    ),
    "Learning Games must not author a retired first-letter mode.",
  );

  let learningGameExercises = 0;
  for (const level of learningGamesSubject.levels) {
    const surface = surfacesModule.getSurfaceDefinition("learning-games", level.levelNumber);
    assert(level.surfaceId === surface?.surfaceId, `${level.id} is missing its canonical surfaceId.`);
    assert(level.surfaceKind === surface?.kind, `${level.id} is missing its canonical surfaceKind.`);
    assert(level.surfaceVariant === surface?.surfaceVariant, `${level.id} is missing its canonical surfaceVariant.`);
    assert(level.exercises?.length > 0, `${level.id} has no exercise.`);

    for (const [exerciseIndex, challenge] of level.exercises.entries()) {
      learningGameExercises += 1;
      assert(challenge.surfaceId === level.surfaceId, `${level.id} challenge surface drifted.`);
      validateChallenge(
        challenge,
        validate,
        `Learning Games level ${level.levelNumber} exercise ${exerciseIndex + 1}`,
      );
    }
  }

  const modes = arcadeModule.getArcadeModeCatalog();
  const wordPool = arcadeModule.getArcadeWordPool(contentModule.defaultLibrary);
  assert(modes.length === 9, "Arcade must expose nine game modes.");
  assert(wordPool.length >= 4, "Arcade needs at least four vocabulary words.");

  for (const mode of modes) {
    for (const difficulty of [1, 2, 3]) {
      const challenge = arcadeModule.createArcadeChallenge({
        wordPool,
        preferredModeIds: [mode.id],
        difficulty,
      });

      assert(challenge?.mode === mode.id, `${mode.id} did not generate at difficulty ${difficulty}.`);
      validateChallenge(
        challenge,
        validate,
        `Arcade ${mode.id} difficulty ${difficulty}`,
      );
    }
  }

  console.log(
    JSON.stringify(
      {
        learningGameLevels: learningGamesSubject.levels.length,
        learningGameExercises,
        arcadeModes: modes.length,
        arcadeDifficulties: 3,
        status: "ok",
      },
      null,
      2,
    ),
  );
} finally {
  await server.close();
}

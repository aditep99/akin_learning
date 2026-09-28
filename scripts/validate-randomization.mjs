import { createServer } from "vite";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function createRng(seed = 1) {
  let value = seed >>> 0;

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function getWrongChoice(challenge) {
  return challenge.choices?.find(
    (choice) => choice.id !== challenge.correctChoiceId,
  );
}

function validateLearningChallenge(challenge, validate, label) {
  assert(challenge?.id && challenge.mode, `${label} has no identity.`);
  assert(challenge.answerKind, `${label} has no answer kind.`);

  if (challenge.answerKind === "choice") {
    assert(challenge.choices?.length >= 3, `${label} needs three choices.`);
    assert(
      challenge.choices.filter(
        (choice) => choice.id === challenge.correctChoiceId,
      ).length === 1,
      `${label} must have one correct choice.`,
    );
    const wrongChoice = getWrongChoice(challenge);
    assert(wrongChoice, `${label} has no wrong choice.`);
    assert(
      !validate(challenge, {
        type: "choice",
        choiceId: wrongChoice.id,
      }).correct,
      `${label} accepted a wrong choice.`,
    );
    assert(
      validate(challenge, {
        type: "choice",
        choiceId: challenge.correctChoiceId,
      }).complete,
      `${label} rejected its correct choice.`,
    );
    return;
  }

  if (challenge.answerKind === "value") {
    const expected = challenge.correctAnswer ?? challenge.targetShape;
    const wrongValue = challenge.choices?.find((choice) => choice !== expected);
    assert(challenge.choices?.length >= 3, `${label} needs value choices.`);
    assert(wrongValue !== undefined, `${label} has no wrong value.`);
    assert(
      !validate(challenge, { type: "value", value: wrongValue }).correct,
      `${label} accepted a wrong value.`,
    );
    assert(
      validate(challenge, { type: "value", value: expected }).complete,
      `${label} rejected its correct value.`,
    );
    return;
  }

  if (challenge.answerKind === "memory-pair") {
    assert(challenge.pairs?.length >= 2, `${label} needs two pairs.`);
    if (challenge.pairs.length > 1) {
      const wrongResult = validate(
        challenge,
        {
          type: "memory-pair",
          firstPairId: challenge.pairs[0].id,
          secondPairId: challenge.pairs[1].id,
        },
        { matchedPairIds: [] },
      );
      assert(!wrongResult.correct, `${label} accepted a wrong pair.`);
    }

    let matchedPairIds = [];
    challenge.pairs.forEach((pair, index) => {
      const result = validate(
        challenge,
        {
          type: "memory-pair",
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
    });
    return;
  }

  if (challenge.answerKind === "sort-item") {
    assert(challenge.baskets?.length >= 2, `${label} needs two baskets.`);
    assert(challenge.items?.length >= 4, `${label} needs four items.`);
    const wrongBasket = challenge.baskets.find(
      (basket) => basket.id !== challenge.items[0].basketId,
    );
    assert(wrongBasket, `${label} has no wrong basket.`);
    assert(
      !validate(
        challenge,
        {
          type: "sort-item",
          itemId: challenge.items[0].id,
          basketId: wrongBasket.id,
        },
        { placedItemIds: [] },
      ).correct,
      `${label} accepted a wrong basket.`,
    );

    let placedItemIds = [];
    challenge.items.forEach((item, index) => {
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
        `${label} completed before all items.`,
      );
      placedItemIds = [...placedItemIds, item.id];
    });
    return;
  }

  if (challenge.answerKind === "sequence-letter") {
    const target = String(challenge.targetWord?.word || "").toUpperCase();
    assert(target && challenge.letters?.length >= target.length, `${label} has invalid letters.`);
    let builtLetters = [];
    const usedIndexes = new Set();
    const wrongIndex = challenge.letters.findIndex(
      (letter) => String(letter).toUpperCase() !== target[0],
    );

    assert(wrongIndex >= 0, `${label} has no wrong letter.`);
    assert(
      !validate(
        challenge,
        { type: "sequence-letter", letter: challenge.letters[wrongIndex], index: wrongIndex },
        { builtLetters },
      ).correct,
      `${label} accepted a wrong letter.`,
    );

    for (let index = 0; index < target.length; index += 1) {
      const letterIndex = challenge.letters.findIndex(
        (letter, candidateIndex) =>
          !usedIndexes.has(candidateIndex) &&
          String(letter).toUpperCase() === target[index],
      );
      assert(letterIndex >= 0, `${label} is missing ${target[index]}.`);
      const result = validate(
        challenge,
        {
          type: "sequence-letter",
          letter: challenge.letters[letterIndex],
          index: letterIndex,
        },
        { builtLetters },
      );
      assert(result.correct, `${label} rejected ${target[index]}.`);
      assert(
        result.complete === (index === target.length - 1),
        `${label} completed at the wrong letter.`,
      );
      usedIndexes.add(letterIndex);
      builtLetters = [...builtLetters, challenge.letters[letterIndex]];
    }
  }
}

function validateGenericChallenge(challenge, label) {
  assert(challenge?.id && challenge.mode, `${label} has no identity.`);

  if (Array.isArray(challenge.choices) && challenge.correctChoiceId) {
    assert(challenge.choices.length >= 3, `${label} needs three choices.`);
    assert(
      challenge.choices.filter(
        (choice) => choice.id === challenge.correctChoiceId,
      ).length === 1,
      `${label} must have one correct choice.`,
    );
  }

  if (challenge.mode === "sort-two-baskets") {
    assert(challenge.baskets?.length >= 2, `${label} needs baskets.`);
    assert(challenge.items?.length >= 4, `${label} needs items.`);
    challenge.items.forEach((item) => {
      assert(
        challenge.baskets.some((basket) => basket.id === item.basketId),
        `${label} has an item without a basket.`,
      );
    });
  }

  if (challenge.mode === "hotspot-place") {
    assert(
      challenge.hotspots?.some((hotspot) => hotspot.id === challenge.targetHotspotId),
      `${label} has no target hotspot.`,
    );
  }

  if (challenge.targetTokens) {
    assert(
      challenge.shuffledTokens?.length === challenge.targetTokens.length,
      `${label} has invalid spelling tokens.`,
    );
  }

  if (challenge.correctAnswer !== undefined && Array.isArray(challenge.choices)) {
    assert(
      challenge.choices.filter((choice) => (choice.value ?? choice) === challenge.correctAnswer).length === 1,
      `${label} must have one spelling answer.`,
    );
  }
}

function getLevelScope(subjectId, level) {
  return `${subjectId}:${level.id}:session`;
}

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});

try {
  const contentModule = await server.ssrLoadModule("/src/data/contentLibrary.js");
  const randomModule = await server.ssrLoadModule("/src/data/challengeRandomizer.js");
  const historyModule = await server.ssrLoadModule("/src/data/challengeHistory.js");
  const arcadeModule = await server.ssrLoadModule("/src/data/arcadeChallenges.js");
  const answerModule = await server.ssrLoadModule("/src/data/learningGameAnswers.js");
  const mathModule = await server.ssrLoadModule("/src/data/subjects/math.js");
  const mathLessonsModule = await server.ssrLoadModule("/src/data/subjects/mathLessons.js");
  const mathGeniusModule = await server.ssrLoadModule("/src/data/subjects/mathGenius.js");
  const library = contentModule.defaultLibrary;
  const validate = answerModule.validateLearningGameAnswer;
  let history = historyModule.createEmptyChallengeHistory();
  let randomizedSessions = 0;
  let randomizedChallenges = 0;

  const learningGames = library.find((subject) => subject.id === "learning-games");
  assert(learningGames?.levels?.length === 10, "Learning Games must keep ten levels.");

  for (const level of learningGames.levels) {
    const scopeKey = getLevelScope("learning-games", level);
    let previousSignature = "";

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const session = randomModule.createChallengeSession({
        subjectId: "learning-games",
        levelConfig: level,
        library,
        history,
        rng: createRng(1000 + level.levelNumber * 100 + attempt),
      });
      const challenge = session?.exercises?.[0];
      assert(challenge, `${level.id} did not generate a challenge.`);
      validateLearningChallenge(challenge, validate, `${level.id} attempt ${attempt + 1}`);
      const signature = randomModule.getChallengeSignature(challenge);
      assert(signature, `${level.id} has no signature.`);
      if (attempt < 2) {
        assert(signature !== previousSignature, `${level.id} repeated immediately.`);
      }
      previousSignature = signature;
      history = historyModule.appendChallengeHistory(history, scopeKey, [
        randomModule.createChallengeHistoryEntry(challenge),
      ]);
      randomizedChallenges += 1;
    }
    randomizedSessions += 20;
  }

  const modes = arcadeModule.getArcadeModeCatalog();
  const wordPool = arcadeModule.getArcadeWordPool(library);
  const arcadeScope = "arcade:endless:session";
  assert(modes.length === 9, "Arcade must keep nine modes.");
  assert(wordPool.length >= 4, "Arcade needs a vocabulary pool.");

  for (const mode of modes) {
    const challenge = randomModule.createHistoryAwareChallenge({
      history,
      scopeKey: arcadeScope,
      create: () =>
        arcadeModule.createArcadeChallenge({
          wordPool,
          preferredModeIds: [mode.id],
          difficulty: 2,
        }),
    });
    assert(challenge?.mode === mode.id, `${mode.id} did not generate.`);
    validateLearningChallenge(challenge, validate, `Arcade ${mode.id}`);
    history = historyModule.appendChallengeHistory(history, arcadeScope, [
      randomModule.createChallengeHistoryEntry(challenge),
    ]);
    randomizedChallenges += 1;
  }

  const skipMathSubjects = new Set(["math", "math-lessons", "math-genius"]);
  for (const subject of library) {
    if (skipMathSubjects.has(subject.id)) {
      continue;
    }

    for (const level of contentModule.buildSubjectLevels(subject)) {
      const session = randomModule.createChallengeSession({
        subjectId: subject.id,
        levelConfig: level,
        library,
        history,
        rng: createRng(level.levelNumber + subject.id.length),
      });
      assert(session?.exercises?.length > 0, `${subject.id}/${level.id} has no session.`);
      session.exercises.forEach((challenge, index) => {
        validateGenericChallenge(challenge, `${subject.id}/${level.id}/${index + 1}`);
        randomizedChallenges += 1;
      });
      randomizedSessions += 1;
    }
  }

  const mathSubject = library.find((subject) => subject.id === "math");
  for (const level of contentModule.buildSubjectLevels(mathSubject)) {
    const session = randomModule.createHistoryAwareSession({
      history,
      scopeKey: getLevelScope("math", level),
      create: () => mathModule.generateMathLevelSession(level),
    });
    assert(session?.exercises?.length === level.exerciseCount, `${level.id} math session invalid.`);
    session.exercises.forEach((exercise) => assert(exercise.answerChoices?.length >= 4, `${level.id} has too few math choices.`));
    randomizedSessions += 1;
  }

  const mathLessons = library.find((subject) => subject.id === "math-lessons");
  for (const level of contentModule.buildSubjectLevels(mathLessons)) {
    const session = mathLessonsModule.generateMathLessonSession(level);
    assert(session?.exercises?.length === level.exerciseCount, `${level.id} math lesson session invalid.`);
    assert(session.exercises.every((exercise) => mathLessonsModule.isValidMathLessonChallenge(exercise)), `${level.id} has invalid math lesson exercise.`);
    randomizedSessions += 1;
  }

  for (const track of mathGeniusModule.mathGeniusTracks) {
    for (const level of track.levels) {
      const session = mathGeniusModule.generateMathGeniusSession(track.id, level);
      assert(session?.exercises?.length === level.exerciseCount, `${track.id}/${level.id} math genius session invalid.`);
      assert(session.exercises.every((exercise) => mathGeniusModule.isValidMathGeniusChallenge(exercise)), `${track.id}/${level.id} has invalid genius exercise.`);
      randomizedSessions += 1;
    }
  }

  const storage = {
    value: "",
    getItem() {
      return this.value;
    },
    setItem(_key, nextValue) {
      this.value = nextValue;
    },
  };
  historyModule.writeChallengeHistory(history, storage);
  const restoredHistory = historyModule.readChallengeHistory(storage);
  assert(
    JSON.stringify(restoredHistory) === JSON.stringify(historyModule.normalizeChallengeHistory(history)),
    "Challenge history did not survive storage round-trip.",
  );
  storage.value = "not-json";
  assert(historyModule.readChallengeHistory(storage).version === 1, "Malformed history did not recover.");

  const fallbackSession = randomModule.createChallengeSession({
    subjectId: "learning-games",
    levelConfig: learningGames.levels[0],
    library: [],
    rng: createRng(77),
  });
  assert(fallbackSession?.exercises?.[0]?.choices?.length >= 3, "Local fallback pool is too small.");

  console.log(
    JSON.stringify(
      {
        learningGameLevels: learningGames.levels.length,
        arcadeModes: modes.length,
        randomizedSessions,
        randomizedChallenges,
        status: "ok",
      },
      null,
      2,
    ),
  );
} finally {
  await server.close();
}


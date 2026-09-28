import { readFile } from "node:fs/promises";
import { createServer } from "vite";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getRendererSource(source, rendererName) {
  const startMarker = `function ${rendererName}`;
  const start = source.indexOf(startMarker);
  assert(start >= 0, `Renderer source is missing ${rendererName}.`);

  const nextRenderer = source.indexOf("\nfunction ", start + startMarker.length);
  return source.slice(start, nextRenderer >= 0 ? nextRenderer : source.length);
}

function assertVisibleAnswerLabel(source, rendererName, valueExpression) {
  const rendererSource = getRendererSource(source, rendererName);
  const valueMarker = escapeRegExp(`value={${valueExpression}}`);
  const visibleLabelPattern = new RegExp(
    `<VocabularyLabel[\\s\\S]*?${valueMarker}[\\s\\S]*?showValue`,
  );

  assert(
    visibleLabelPattern.test(rendererSource),
    `${rendererName} must render ${valueExpression} with showValue on its answer label.`,
  );
}

function createRng(seed = 1) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function validateChoiceChallenge(challenge, validate, label) {
  assert(Array.isArray(challenge.choices) && challenge.choices.length >= 3, `${label} needs 3 choices.`);
  const correctChoices = challenge.choices.filter(
    (choice) => choice.id === challenge.correctChoiceId,
  );
  assert(correctChoices.length === 1, `${label} must have one correct choice.`);
  const wrongChoice = challenge.choices.find(
    (choice) => choice.id !== challenge.correctChoiceId,
  );
  assert(
    !validate(challenge, { type: "choice", choiceId: wrongChoice.id }).correct,
    `${label} accepted a wrong choice.`,
  );
  assert(
    validate(challenge, { type: "choice", choiceId: challenge.correctChoiceId }).complete,
    `${label} rejected its correct choice.`,
  );
}

function validateLearningChallenge(challenge, validate, label) {
  assert(challenge?.id && challenge.mode, `${label} has no challenge identity.`);

  if (challenge.answerKind === "choice") {
    validateChoiceChallenge(challenge, validate, label);
    return;
  }

  if (challenge.answerKind === "value") {
    assert(Array.isArray(challenge.choices) && challenge.choices.length >= 3, `${label} needs value choices.`);
    const expected = challenge.correctAnswer ?? challenge.targetShape;
    const wrongValue = challenge.choices.find((value) => value !== expected);
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
    assert(challenge.pairs?.length >= 2, `${label} needs memory pairs.`);
    const wrong = validate(
      challenge,
      {
        type: "memory-pair",
        firstPairId: challenge.pairs[0].id,
        secondPairId: challenge.pairs[1].id,
      },
      { matchedPairIds: [] },
    );
    assert(!wrong.correct && !wrong.complete, `${label} accepted a wrong pair.`);

    let matchedPairIds = [];
    challenge.pairs.forEach((pair, index) => {
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
      assert(result.complete === (index === challenge.pairs.length - 1), `${label} completed early.`);
      matchedPairIds = [...matchedPairIds, pair.id];
    });
    return;
  }

  if (challenge.answerKind === "sort-item") {
    assert(challenge.baskets?.length >= 2, `${label} needs baskets.`);
    assert(challenge.items?.length >= 4, `${label} needs items.`);
    const wrongBasket = challenge.baskets.find(
      (basket) => basket.id !== challenge.items[0].basketId,
    );
    assert(
      !validate(
        challenge,
        { type: "sort-item", itemId: challenge.items[0].id, basketId: wrongBasket.id },
        { placedItemIds: [] },
      ).correct,
      `${label} accepted a wrong basket.`,
    );
    let placedItemIds = [];
    challenge.items.forEach((item, index) => {
      const result = validate(
        challenge,
        { type: "sort-item", itemId: item.id, basketId: item.basketId },
        { placedItemIds },
      );
      assert(result.correct, `${label} rejected item ${item.id}.`);
      assert(result.complete === (index === challenge.items.length - 1), `${label} completed early.`);
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
          !usedIndexes.has(candidateIndex) && String(letter).toUpperCase() === target[index],
      );
      assert(letterIndex >= 0, `${label} is missing ${target[index]}.`);
      const result = validate(
        challenge,
        { type: "sequence-letter", letter: challenge.letters[letterIndex], index: letterIndex },
        { builtLetters },
      );
      assert(result.correct, `${label} rejected ${target[index]}.`);
      assert(result.complete === (index === target.length - 1), `${label} completed early.`);
      usedIndexes.add(letterIndex);
      builtLetters = [...builtLetters, challenge.letters[letterIndex]];
    }
    return;
  }

  throw new Error(`${label} has unsupported answer kind: ${challenge.answerKind}`);
}

function validateGenericChallenge(challenge, label) {
  assert(challenge?.id && challenge.mode, `${label} has no challenge identity.`);
  if (challenge.choices && challenge.correctChoiceId) {
    assert(challenge.choices.length >= 3, `${label} needs 3 choices.`);
    assert(
      challenge.choices.filter((choice) => choice.id === challenge.correctChoiceId).length === 1,
      `${label} has an invalid correct choice.`,
    );
  }
  if (challenge.mode === "sort-two-baskets") {
    assert(challenge.baskets?.length >= 2 && challenge.items?.length >= 4, `${label} sort data is incomplete.`);
    challenge.items.forEach((item) =>
      assert(challenge.baskets.some((basket) => basket.id === item.basketId), `${label} has an orphan item.`),
    );
  }
  if (challenge.mode === "hotspot-place") {
    assert(challenge.bodyImage, `${label} has no body image.`);
    assert(challenge.hotspots?.length >= 3, `${label} needs at least three hotspots.`);
    assert(
      challenge.hotspots.filter((hotspot) => hotspot.id === challenge.targetHotspotId).length === 1,
      `${label} must have exactly one hotspot answer.`,
    );
    challenge.hotspots.forEach((hotspot) => {
      assert(
        Number.isFinite(hotspot.x) && hotspot.x >= 0 && hotspot.x <= 100,
        `${label}/${hotspot.id} has an invalid horizontal hotspot position.`,
      );
      assert(
        Number.isFinite(hotspot.y) && hotspot.y >= 0 && hotspot.y <= 100,
        `${label}/${hotspot.id} has an invalid vertical hotspot position.`,
      );
    });
  }
  if (challenge.targetTokens) {
    assert(challenge.shuffledTokens?.length === challenge.targetTokens.length, `${label} has invalid spelling tokens.`);
  }
}

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});

try {
  const content = await server.ssrLoadModule("/src/data/contentLibrary.js");
  const surfaces = await server.ssrLoadModule("/src/data/missionSurfaces.js");
  const randomizer = await server.ssrLoadModule("/src/data/challengeRandomizer.js");
  const historyModule = await server.ssrLoadModule("/src/data/challengeHistory.js");
  const arcade = await server.ssrLoadModule("/src/data/arcadeChallenges.js");
  const answers = await server.ssrLoadModule("/src/data/learningGameAnswers.js");
  const reveal = await server.ssrLoadModule("/src/data/challengeReveal.js");
  const math = await server.ssrLoadModule("/src/data/subjects/math.js");
  const mathLessons = await server.ssrLoadModule("/src/data/subjects/mathLessons.js");
  const mathGenius = await server.ssrLoadModule("/src/data/subjects/mathGenius.js");
  const learningScreenSource = await readFile(new URL("../src/screens/LearningGameScreen.jsx", import.meta.url), "utf8");
  const vocabularyAnswerSource = await readFile(new URL("../src/components/VocabularyAnswer.jsx", import.meta.url), "utf8");
  const gameplayScreenSource = await readFile(new URL("../src/screens/GameplayScreen.jsx", import.meta.url), "utf8");
  const spellingScreenSource = await readFile(new URL("../src/screens/SpellingGameplayScreen.jsx", import.meta.url), "utf8");
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const cssSource = await readFile(new URL("../src/index.css", import.meta.url), "utf8");

  const learningGames = content.defaultLibrary.find((subject) => subject.id === "learning-games");
  assert(learningGames?.levels?.length === 10, "Learning Games must keep 10 levels.");
  for (const [levelNumber, expectedMode] of [
    [1, "learn-write-speak"],
    [2, "token-bank-limited"],
    [3, "missing-letter"],
    [4, "sound-to-word-choice"],
    [5, "tricky-word-pick"],
    [6, "write-from-memory"],
    [7, "word-repair"],
    [8, "spelling-sprint"],
  ]) {
    const definition = surfaces.getSurfaceDefinition("english-spelling", levelNumber);
    assert(definition?.mode === expectedMode, `English Spelling level ${levelNumber} surface roster drifted.`);
  }
  for (const marker of [
    "function WordRepairBoard",
    "function TextEntryBoard",
    "spelling-sprint",
    "bankTokens",
  ]) {
    assert(spellingScreenSource.includes(marker), `Spelling renderer is missing ${marker}.`);
  }
  let learningExercises = 0;
  for (const level of learningGames.levels) {
    for (const [index, challenge] of level.exercises.entries()) {
      validateLearningChallenge(challenge, answers.validateLearningGameAnswer, `Learning Games ${level.id}/${index + 1}`);
      learningExercises += 1;
    }
  }

  const modes = arcade.getArcadeModeCatalog();
  const wordPool = arcade.getArcadeWordPool(content.defaultLibrary);
  assert(modes.length === 9, "Arcade must keep 9 modes.");
  for (const mode of modes) {
    for (const difficulty of [1, 2, 3]) {
      const challenge = arcade.createArcadeChallenge({ wordPool, preferredModeIds: [mode.id], difficulty });
      validateLearningChallenge(challenge, answers.validateLearningGameAnswer, `Arcade ${mode.id}/${difficulty}`);
    }
  }

  let history = historyModule.createEmptyChallengeHistory();
  let subjectLevels = 0;
  let randomizedSessions = 0;
  for (const subject of content.defaultLibrary) {
    if (["math", "math-lessons", "math-genius"].includes(subject.id)) {
      continue;
    }
    for (const level of content.buildSubjectLevels(subject)) {
      const session = randomizer.createChallengeSession({
        subjectId: subject.id,
        levelConfig: level,
        library: content.defaultLibrary,
        history,
        rng: createRng(subject.id.length * 100 + level.levelNumber),
      });
      assert(session?.exercises?.length > 0, `${subject.id}/${level.id} generated no challenge.`);
      session.exercises.forEach((challenge, index) => validateGenericChallenge(challenge, `${subject.id}/${level.id}/${index + 1}`));
      history = historyModule.appendChallengeHistory(history, `${subject.id}:${level.id}:session`, [
        randomizer.createChallengeHistoryEntry(session.exercises[0]),
      ]);
      subjectLevels += 1;
      randomizedSessions += 1;
    }
  }

  const mathSubject = content.defaultLibrary.find((subject) => subject.id === "math");
  for (const level of content.buildSubjectLevels(mathSubject)) {
    const session = math.generateMathLevelSession(level);
    assert(session?.exercises?.length === level.exerciseCount, `Math ${level.id} has an invalid session.`);
    session.exercises.forEach((exercise) => {
      assert(exercise.answerChoices?.length >= 4, `Math ${level.id} needs four answers.`);
      assert(exercise.answerChoices.includes(exercise.answer), `Math ${level.id} has no correct answer.`);
    });
  }

  const mathLessonSubject = content.defaultLibrary.find((subject) => subject.id === "math-lessons");
  for (const level of content.buildSubjectLevels(mathLessonSubject)) {
    const session = mathLessons.generateMathLessonSession(level);
    assert(session?.exercises?.length === level.exerciseCount, `Math Lessons ${level.id} has an invalid session.`);
    assert(session.exercises.every(mathLessons.isValidMathLessonChallenge), `Math Lessons ${level.id} has an invalid exercise.`);
  }

  for (const track of mathGenius.mathGeniusTracks) {
    for (const level of track.levels) {
      const session = mathGenius.generateMathGeniusSession(track.id, level);
      assert(session?.exercises?.length === level.exerciseCount, `Math Genius ${track.id}/${level.id} has an invalid session.`);
      assert(session.exercises.every(mathGenius.isValidMathGeniusChallenge), `Math Genius ${track.id}/${level.id} has an invalid exercise.`);
    }
  }

  const baseChallenge = { id: "integrity-challenge", mode: "choice", targetWord: { id: "cat", word: "cat" } };
  const identity = randomizer.getChallengeSignature(baseChallenge);
  assert(identity, "Challenge signature is unavailable.");
  assert(!reveal.getChallengeRevealState(0).shouldReveal, "Vocabulary revealed before a miss.");
  assert(!reveal.getChallengeRevealState(2).shouldReveal, "Vocabulary revealed after only two misses.");
  assert(reveal.getChallengeRevealState(3).shouldReveal, "Vocabulary did not reveal after three misses.");
  assert(reveal.getChallengeRevealState(3).remainingMisses === 0, "Reveal miss count is incorrect.");
  assert(randomizer.getChallengeSignature(baseChallenge) === identity, "Wrong attempts changed challenge identity.");

  const storage = {
    value: "not-json",
    getItem() {
      return this.value;
    },
    setItem(_key, value) {
      this.value = value;
    },
  };
  assert(historyModule.readChallengeHistory(storage).version === 1, "Malformed localStorage did not recover.");
  const closedStorage = {
    getItem() {
      throw new Error("storage closed");
    },
    setItem() {
      throw new Error("storage closed");
    },
  };
  assert(historyModule.readChallengeHistory(closedStorage).version === 1, "Closed localStorage did not recover.");

  for (const mode of [
    "word-fishing", "zombie-word-munch", "pattern-pop", "treasure-sort",
    "sound-bubble-pop", "monster-delivery", "sound-safari", "word-rocket", "memory-match", "echo-memory",
  ]) {
    assert(learningScreenSource.includes(`"${mode}"`), `Renderer is missing ${mode}.`);
  }
  assert(!learningScreenSource.includes("LetterNinjaGame"), "Retired Letter Ninja renderer is still present.");
  assert(!learningScreenSource.includes('"letter-ninja"'), "Retired Letter Ninja mode is still wired into the renderer.");

  for (const mode of [
    "spelling-order",
    "token-bank-limited",
    "missing-letter",
    "sound-to-word-choice",
    "tricky-word-pick",
    "learn-write-speak",
    "write-from-memory",
    "word-repair",
    "spelling-sprint",
  ]) {
    assert(appSource.includes(`"${mode}"`), `App routing is missing spelling mode ${mode}.`);
  }

  assert(
    vocabularyAnswerSource.includes("showValue = false") &&
      vocabularyAnswerSource.includes("reveal || showValue") &&
      vocabularyAnswerSource.includes("learning-vocabulary-label"),
    "VocabularyLabel must support an explicit visible answer value.",
  );

  const visibleAnswerRenderers = [
    ["WordFishingGame", "choice.word"],
    ["ZombieWordMunchGame", "choice.word"],
    ["PatternPopGame", "choice.word"],
    ["TreasureSortGame", "item.word"],
    ["SoundSafariGame", "choice.word"],
    ["SoundBubblePopGame", "choice.word"],
    ["MonsterDeliveryGame", "choice.word"],
  ];
  for (const [rendererName, valueExpression] of visibleAnswerRenderers) {
    assertVisibleAnswerLabel(learningScreenSource, rendererName, valueExpression);
  }

  for (const rendererName of ["WordFishingGame"]) {
    const rendererSource = getRendererSource(learningScreenSource, rendererName);
    assert(
      rendererSource.includes("reveal={revealVocabulary}"),
      `${rendererName} must preserve target/prompt reveal behaviour.`,
    );
  }

  for (const rendererName of [
    "MemoryMatchGame",
    "WordRocketGame",
    "EchoMemoryGame",
  ]) {
    assert(
      !getRendererSource(learningScreenSource, rendererName).includes("showValue"),
      `${rendererName} must preserve its specialized answer modality.`,
    );
  }

  for (const mode of [
    "picture-pick", "sound-pick", "word-to-picture", "odd-one-out", "vocab-choice",
    "sort-two-baskets", "hotspot-place",
  ]) {
    assert(gameplayScreenSource.includes(`"${mode}"`), `Gameplay renderer is missing ${mode}.`);
  }
  assert(
    gameplayScreenSource.includes("hotspot-stage__frame") &&
      gameplayScreenSource.includes("activity-board--${currentChallenge.mode}"),
    "Gameplay board layout hooks are missing.",
  );
  assert(appSource.includes('"gameplay"') && appSource.includes('"arcade"') && appSource.includes('"today-mission"'), "Persistent activity navigation is missing.");
  assert(appSource.includes("pendingNavigationItem") && appSource.includes("NavigationLeaveDialog"), "Leave guard is missing.");
  assert(
    cssSource.includes("prefers-reduced-motion") &&
      cssSource.includes("navigation-leave-dialog") &&
      cssSource.includes("Gameplay fit contract") &&
      cssSource.includes("overflow-x: clip") &&
      cssSource.includes(".activity-board--hotspot-place"),
    "Accessibility or gameplay layout guards are missing.",
  );

  console.log(JSON.stringify({
    learningGameLevels: learningGames.levels.length,
    learningExercises,
    arcadeModes: modes.length,
    subjectLevels,
    randomizedSessions,
    mathTracks: mathGenius.mathGeniusTracks.length,
    visibleAnswerRenderers: visibleAnswerRenderers.length,
    revealAfterMisses: reveal.REVEAL_AFTER_MISSES,
    status: "ok",
  }, null, 2));
} finally {
  await server.close();
}

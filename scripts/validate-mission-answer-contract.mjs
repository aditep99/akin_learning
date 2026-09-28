import { readFile } from "node:fs/promises";
import { createServer } from "vite";

const COLOR_TOKENS = new Set([
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "brown",
  "black",
  "white",
]);

const GENERIC_WORD_CHOICE_MODES = new Set([
  "picture-pick",
  "sound-pick",
  "word-to-picture",
  "odd-one-out",
  "vocab-choice",
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

const LEARNING_SUBJECT_IDS = new Set(["learning-games"]);
const GENERATED_SUBJECT_IDS = new Set(["math", "math-lessons", "math-genius"]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[mission-answers] ${message}`);
  }
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function assertValue(value, label) {
  assert(hasValue(value), `${label} must expose a visible value.`);
}

function assertVisualFallback(word, label) {
  assert(
    hasValue(word?.image) || hasValue(word?.emoji) || hasValue(word?.word),
    `${label} has no image, emoji, or word fallback.`,
  );
}

function assertWordRecord(word, label, stats) {
  assert(word && typeof word === "object", `${label} must be an object.`);
  assertValue(word.id, `${label}.id`);
  assertValue(word.word, `${label}.word`);
  assertVisualFallback(word, label);

  const answerVisual = word.answerVisual;
  if (answerVisual !== undefined) {
    assert(answerVisual?.kind === "color", `${label} has an unsupported answerVisual kind.`);
    assert(
      COLOR_TOKENS.has(answerVisual.token),
      `${label} has an invalid color token: ${answerVisual.token}.`,
    );
    stats.colorChoices += 1;
    stats.colorTokens.add(answerVisual.token);
  }

  if (String(word.id).startsWith("color-")) {
    assert(
      answerVisual?.kind === "color" && COLOR_TOKENS.has(answerVisual.token),
      `${label} is a color choice without a valid answerVisual token.`,
    );
  }

  stats.wordValues += 1;
}

function assertTokenList(tokens, label) {
  assert(Array.isArray(tokens) && tokens.length > 0, `${label} must contain tokens.`);
  tokens.forEach((token, index) => assertValue(token, `${label}[${index}]`));
}

function assertShuffledTokens(tokens, label) {
  assert(Array.isArray(tokens) && tokens.length > 0, `${label} must contain tokens.`);
  tokens.forEach((token, index) => {
    assert(token && typeof token === "object", `${label}[${index}] must be an object.`);
    assertValue(token.id, `${label}[${index}].id`);
    assertValue(token.value, `${label}[${index}].value`);
  });
}

function validateSpellingChallenge(challenge, label, stats) {
  assertValue(challenge.word, `${label}.word`);
  assertWordRecord({ ...challenge, id: challenge.id, word: challenge.word }, `${label}.word`, stats);
  assertTokenList(challenge.targetTokens, `${label}.targetTokens`);
  assertShuffledTokens(challenge.shuffledTokens, `${label}.shuffledTokens`);

  if (Array.isArray(challenge.choices)) {
    assert(challenge.choices.length >= 3, `${label}.choices needs at least three values.`);
    challenge.choices.forEach((choice, index) => {
      if (choice && typeof choice === "object") {
        assertValue(choice.id, `${label}.choices[${index}].id`);
        assertValue(choice.value, `${label}.choices[${index}].value`);
      } else {
        assertValue(choice, `${label}.choices[${index}]`);
      }
    });
  }

  if (challenge.mode === "token-bank-limited") {
    assert(Array.isArray(challenge.bankTokens) && challenge.bankTokens.length >= challenge.targetTokens.length, `${label}.bankTokens is incomplete.`);
    const bankIds = challenge.bankTokens.map((token) => token?.id);
    assert(new Set(bankIds).size === bankIds.length, `${label}.bankTokens IDs must be unique.`);
    challenge.targetTokens.forEach((token) => {
      assert(challenge.bankTokens.some((entry) => entry?.value === token), `${label}.bankTokens is missing target token ${token}.`);
    });
  }

  if (["write-from-memory", "spelling-sprint"].includes(challenge.mode)) {
    assert(challenge.answerPolicy === "exact-word", `${label} must use exact-word input.`);
  }

  if (challenge.mode === "word-repair") {
    assert(Array.isArray(challenge.patternTokens), `${label}.patternTokens is missing.`);
    assert(challenge.patternTokens.filter((token) => token === null).length === 1, `${label} must have one repair slot.`);
    const restored = challenge.patternTokens.map((token, index) => index === challenge.repairIndex ? challenge.correctAnswer : token);
    assert(restored.join("") === challenge.word, `${label}.word-repair does not reconstruct the target.`);
  }
}

function validateGenericChallenge(challenge, label, stats) {
  assert(challenge?.id && (challenge.mode || challenge.type), `${label} has no challenge identity.`);
  const mode = challenge.mode || challenge.type;
  assert(!["first-letter-pick", "letter-ninja"].includes(mode), `${label} uses a retired first-letter mode.`);

  if (GENERIC_WORD_CHOICE_MODES.has(mode)) {
    assert(Array.isArray(challenge.choices) && challenge.choices.length >= 3, `${label}.choices is incomplete.`);
    challenge.choices.forEach((choice, index) => {
      assertWordRecord(choice, `${label}.choices[${index}]`, stats);
    });
    return;
  }

  if (mode === "sort-two-baskets") {
    assert(Array.isArray(challenge.baskets) && challenge.baskets.length >= 2, `${label}.baskets is incomplete.`);
    assert(Array.isArray(challenge.items) && challenge.items.length >= 4, `${label}.items is incomplete.`);
    challenge.baskets.forEach((basket, index) => {
      assertValue(basket.id, `${label}.baskets[${index}].id`);
      assertValue(basket.label, `${label}.baskets[${index}].label`);
    });
    challenge.items.forEach((item, index) => {
      assertWordRecord(item, `${label}.items[${index}]`, stats);
      assert(
        challenge.baskets.some((basket) => basket.id === item.basketId),
        `${label}.items[${index}] points to an unknown basket.`,
      );
    });
    return;
  }

  if (mode === "hotspot-place") {
    assertValue(challenge.bodyImage, `${label}.bodyImage`);
    assert(Array.isArray(challenge.hotspots) && challenge.hotspots.length >= 3, `${label}.hotspots is incomplete.`);
    challenge.hotspots.forEach((hotspot, index) => {
      assertValue(hotspot.id, `${label}.hotspots[${index}].id`);
      assertWordRecord(hotspot.word, `${label}.hotspots[${index}].word`, stats);
      assert(Number.isFinite(hotspot.x) && hotspot.x >= 0 && hotspot.x <= 100, `${label}.hotspots[${index}].x is invalid.`);
      assert(Number.isFinite(hotspot.y) && hotspot.y >= 0 && hotspot.y <= 100, `${label}.hotspots[${index}].y is invalid.`);
    });
    assert(
      challenge.hotspots.some((hotspot) => hotspot.id === challenge.targetHotspotId),
      `${label}.targetHotspotId is missing.`,
    );
    return;
  }

  if (SPELLING_MODES.has(mode)) {
    validateSpellingChallenge(challenge, label, stats);
    return;
  }

  if (Array.isArray(challenge.choices)) {
    challenge.choices.forEach((choice, index) => assertValue(choice?.value ?? choice, `${label}.choices[${index}]`));
  }
}

function validateLearningChallenge(challenge, label, stats) {
  assert(challenge?.id && challenge.mode, `${label} has no challenge identity.`);
  assert(!["first-letter-pick", "letter-ninja"].includes(challenge.mode), `${label} uses a retired first-letter mode.`);
  if (challenge.targetWord) {
    assertWordRecord(challenge.targetWord, `${label}.targetWord`, stats);
  }

  switch (challenge.answerKind) {
    case "choice":
      assert(Array.isArray(challenge.choices) && challenge.choices.length >= 3, `${label}.choices is incomplete.`);
      challenge.choices.forEach((choice, index) => assertWordRecord(choice, `${label}.choices[${index}]`, stats));
      return;
    case "value":
      assert(Array.isArray(challenge.choices) && challenge.choices.length >= 2, `${label}.choices is incomplete.`);
      challenge.choices.forEach((choice, index) => assertValue(choice, `${label}.choices[${index}]`));
      assertValue(challenge.correctAnswer ?? challenge.targetShape, `${label}.correctAnswer`);
      return;
    case "memory-pair":
      assert(Array.isArray(challenge.pairs) && challenge.pairs.length >= 2, `${label}.pairs is incomplete.`);
      challenge.pairs.forEach((pair, index) => assertWordRecord(pair, `${label}.pairs[${index}]`, stats));
      return;
    case "sort-item":
      assert(Array.isArray(challenge.baskets) && challenge.baskets.length >= 2, `${label}.baskets is incomplete.`);
      assert(Array.isArray(challenge.items) && challenge.items.length >= 4, `${label}.items is incomplete.`);
      challenge.baskets.forEach((basket, index) => {
        assertValue(basket.id, `${label}.baskets[${index}].id`);
        assertValue(basket.label, `${label}.baskets[${index}].label`);
      });
      challenge.items.forEach((item, index) => {
        assertWordRecord(item, `${label}.items[${index}]`, stats);
        assert(challenge.baskets.some((basket) => basket.id === item.basketId), `${label}.items[${index}] has no basket.`);
      });
      return;
    case "sequence-letter":
      assertWordRecord(challenge.targetWord, `${label}.targetWord`, stats);
      assert(Array.isArray(challenge.letters) && challenge.letters.length >= 2, `${label}.letters is incomplete.`);
      challenge.letters.forEach((letter, index) => {
        assert(typeof letter === "string" && letter.length > 0, `${label}.letters[${index}] must expose a letter token.`);
      });
      return;
    default:
      throw new Error(`[mission-answers] ${label} has unsupported answerKind: ${challenge.answerKind}`);
  }
}

function validateSceneItems(items, label, stats, { allowEmpty = false } = {}) {
  if (!Array.isArray(items)) {
    return;
  }

  items.forEach((item, index) => assertWordRecord(item, `${label}[${index}]`, stats));
}

function validateMathSession(session, label, stats) {
  assert(Array.isArray(session?.exercises) && session.exercises.length > 0, `${label} has no exercises.`);
  session.exercises.forEach((exercise, index) => {
    const exerciseLabel = `${label}/${index + 1}`;
    assert(Array.isArray(exercise.answerChoices) && exercise.answerChoices.length >= 3, `${exerciseLabel}.answerChoices is incomplete.`);
    exercise.answerChoices.forEach((choice, choiceIndex) => assertValue(choice, `${exerciseLabel}.answerChoices[${choiceIndex}]`));
    assert(exercise.answerChoices.includes(exercise.answer), `${exerciseLabel} has no visible correct answer value.`);
    validateSceneItems(exercise.sceneAnimals, `${exerciseLabel}.sceneAnimals`, stats);
  });
}

function validateMathLessonSession(session, label, mathLessons, stats) {
  assert(Array.isArray(session?.exercises) && session.exercises.length > 0, `${label} has no exercises.`);
  assert(session.exercises.every(mathLessons.isValidMathLessonChallenge), `${label} has an invalid exercise.`);
  session.exercises.forEach((exercise, index) => {
    const exerciseLabel = `${label}/${index + 1}`;
    assertValue(exercise.correctAnswer, `${exerciseLabel}.correctAnswer`);
    if (Array.isArray(exercise.choices)) {
      assert(exercise.choices.length >= 2, `${exerciseLabel}.choices is incomplete.`);
      exercise.choices.forEach((choice, choiceIndex) => {
        if (choice && typeof choice === "object") {
          assertValue(choice.id, `${exerciseLabel}.choices[${choiceIndex}].id`);
          assert(Number.isFinite(choice.value), `${exerciseLabel}.choices[${choiceIndex}].value is invalid.`);
          assertValue(choice.label, `${exerciseLabel}.choices[${choiceIndex}].label`);
          validateSceneItems(choice.items, `${exerciseLabel}.choices[${choiceIndex}].items`, stats, {
            allowEmpty: choice.value === 0,
          });
        } else {
          assertValue(choice, `${exerciseLabel}.choices[${choiceIndex}]`);
        }
      });
    }
    validateSceneItems(exercise.sceneItems, `${exerciseLabel}.sceneItems`, stats);
    validateSceneItems(exercise.leftItems, `${exerciseLabel}.leftItems`, stats);
    validateSceneItems(exercise.rightItems, `${exerciseLabel}.rightItems`, stats);
  });
}

function validateMathGeniusSession(session, label) {
  assert(Array.isArray(session?.exercises) && session.exercises.length > 0, `${label} has no exercises.`);
  session.exercises.forEach((exercise, index) => {
    const exerciseLabel = `${label}/${index + 1}`;
    assertValue(exercise.mode, `${exerciseLabel}.mode`);
    assertValue(exercise.correctAnswer, `${exerciseLabel}.correctAnswer`);
    if (Array.isArray(exercise.values)) {
      exercise.values.forEach((value, valueIndex) => assertValue(value, `${exerciseLabel}.values[${valueIndex}]`));
    }
    if (Array.isArray(exercise.dailyValues)) {
      exercise.dailyValues.forEach((value, valueIndex) => assertValue(value, `${exerciseLabel}.dailyValues[${valueIndex}]`));
    }
    if (exercise.operator !== undefined) {
      assert(["+", "-"].includes(exercise.operator), `${exerciseLabel}.operator is invalid.`);
    }
  });
}

function createRng(seed = 1) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function getRendererSource(source, rendererName) {
  const startMarker = `function ${rendererName}`;
  const start = source.indexOf(startMarker);
  assert(start >= 0, `Renderer source is missing ${rendererName}.`);
  const nextRenderer = source.indexOf("\nfunction ", start + startMarker.length);
  return source.slice(start, nextRenderer >= 0 ? nextRenderer : source.length);
}

function assertSource(source, marker, label) {
  assert(source.includes(marker), `${label} is missing source contract: ${marker}`);
}

function validateRendererContracts(sources) {
  const { gameplay, learning, spelling, math, mathGenius, mathLessons, css, vocabulary } = sources;

  assertSource(vocabulary, "imageFailed", "VocabularyAnswer fallback state");
  assertSource(vocabulary, "answerVisual?.kind === \"color\"", "VocabularyAnswer color branch");
  assertSource(vocabulary, "vocabulary-visual--fallback", "VocabularyAnswer text fallback");

  assertSource(gameplay, "VocabularyVisual", "Gameplay shared visual");
  assertSource(gameplay, "<VocabularyLabel value={choice.word} showValue", "Gameplay visible choice label");
  assertSource(gameplay, "className=\"sort-item__visual\"", "Gameplay sort visual");
  assertSource(gameplay, "aria-label={`Select ${hotspot.word.word}`}", "Gameplay hotspot label");
  assert(!gameplay.includes("getWordImage"), "Gameplay must not own a broken-image-only answer renderer.");

  assertSource(learning, "VocabularyVisual", "Learning Games shared visual");
  assertSource(learning, "showValue", "Learning Games visible answer labels");
  for (const [renderer, valueExpression] of [
    ["WordFishingGame", "value={choice.word}"],
    ["ZombieWordMunchGame", "value={choice.word}"],
    ["PatternPopGame", "value={choice.word}"],
    ["TreasureSortGame", "value={item.word}"],
    ["SoundSafariGame", "value={choice.word}"],
    ["SoundBubblePopGame", "value={choice.word}"],
    ["MonsterDeliveryGame", "value={choice.word}"],
  ]) {
    assertSource(getRendererSource(learning, renderer), valueExpression, `${renderer} visible value`);
  }
  for (const renderer of ["MemoryMatchGame", "WordRocketGame", "EchoMemoryGame"]) {
    assert(!getRendererSource(learning, renderer).includes("showValue"), `${renderer} must preserve its specialized hidden/value interaction.`);
  }
  assert(!learning.includes("LetterNinjaGame"), "Learning Games must not render Letter Ninja.");
  assert(!learning.includes('"letter-ninja"'), "Learning Games must not wire the retired Letter Ninja mode.");
  assert(!learning.includes("getWordImage"), "Learning Games must use the shared visual fallback.");

  assertSource(spelling, "VocabularyVisual", "Spelling shared visual");
  assertSource(spelling, "{choice.value}", "Spelling visible token value");
  for (const marker of ["function WordRepairBoard", "function TextEntryBoard", "spelling-sprint", "bankTokens"]) {
    assertSource(spelling, marker, `Spelling surface renderer ${marker}`);
  }
  assertSource(math, "math-answer-card__number", "Math visible answer value");
  assertSource(math, "aria-label={`Answer ${choice}${", "Math answer label");
  assertSource(math, "VocabularyVisual", "Math scene visual fallback");
  assertSource(mathGenius, "aria-label={`Choose operator ${operator}`}", "Math Genius operator label");
  assertSource(mathGenius, "aria-label={`Enter digit ${digit}`}", "Math Genius keypad label");
  assertSource(mathLessons, "VocabularyVisual", "Math Lessons scene visual fallback");
  assertSource(mathLessons, "math-lesson-choice", "Math Lessons visible choice surface");
  assertSource(mathLessons, "Picture group ${choiceIndex + 1}", "Math Lessons count-scene accessible description");

  for (const marker of [
    "--color-answer-red",
    "--color-answer-orange",
    "--color-answer-yellow",
    "--color-answer-green",
    "--color-answer-blue",
    "--color-answer-purple",
    "--color-answer-pink",
    "--color-answer-brown",
    "--color-answer-black",
    "--color-answer-white",
  ]) {
    assertSource(css, marker, `CSS answer token ${marker}`);
  }
}

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});

try {
  const content = await server.ssrLoadModule("/src/data/contentLibrary.js");
  const randomizer = await server.ssrLoadModule("/src/data/challengeRandomizer.js");
  const historyModule = await server.ssrLoadModule("/src/data/challengeHistory.js");
  const arcade = await server.ssrLoadModule("/src/data/arcadeChallenges.js");
  const math = await server.ssrLoadModule("/src/data/subjects/math.js");
  const mathLessons = await server.ssrLoadModule("/src/data/subjects/mathLessons.js");
  const mathGenius = await server.ssrLoadModule("/src/data/subjects/mathGenius.js");
  const sources = {
    vocabulary: await readFile(new URL("../src/components/VocabularyAnswer.jsx", import.meta.url), "utf8"),
    gameplay: await readFile(new URL("../src/screens/GameplayScreen.jsx", import.meta.url), "utf8"),
    learning: await readFile(new URL("../src/screens/LearningGameScreen.jsx", import.meta.url), "utf8"),
    spelling: await readFile(new URL("../src/screens/SpellingGameplayScreen.jsx", import.meta.url), "utf8"),
    math: await readFile(new URL("../src/screens/MathGameplayScreen.jsx", import.meta.url), "utf8"),
    mathGenius: await readFile(new URL("../src/screens/MathGeniusGameplayScreen.jsx", import.meta.url), "utf8"),
    mathLessons: await readFile(new URL("../src/screens/MathLessonGameplayScreen.jsx", import.meta.url), "utf8"),
    css: await readFile(new URL("../src/index.css", import.meta.url), "utf8"),
  };
  validateRendererContracts(sources);

  const stats = {
    wordValues: 0,
    colorChoices: 0,
    colorTokens: new Set(),
    standardChallenges: 0,
    randomizedSessions: 0,
    learningExercises: 0,
    arcadeChallenges: 0,
    mathExercises: 0,
    mathLessonExercises: 0,
    mathGeniusExercises: 0,
  };

  let colorWordIds = new Set();
  let history = historyModule.createEmptyChallengeHistory();

  for (const subject of content.defaultLibrary) {
    if (LEARNING_SUBJECT_IDS.has(subject.id) || GENERATED_SUBJECT_IDS.has(subject.id)) {
      continue;
    }

    for (const level of content.buildSubjectLevels(subject)) {
      for (const [index, challenge] of (level.exercises || []).entries()) {
        validateGenericChallenge(challenge, `${subject.id}/${level.id}/${index + 1}`, stats);
        stats.standardChallenges += 1;
      }

      const session = randomizer.createChallengeSession({
        subjectId: subject.id,
        levelConfig: level,
        library: content.defaultLibrary,
        history,
        rng: createRng(subject.id.length * 100 + level.levelNumber),
      });
      assert(session?.exercises?.length > 0, `${subject.id}/${level.id} generated no challenge.`);
      session.exercises.forEach((challenge, index) => {
        validateGenericChallenge(challenge, `${subject.id}/${level.id}/generated-${index + 1}`, stats);
      });
      stats.randomizedSessions += 1;
      history = historyModule.appendChallengeHistory(history, `${subject.id}:${level.id}:mission-answers`, [
        randomizer.createChallengeHistoryEntry(session.exercises[0]),
      ]);
    }
  }

  const learningGames = content.defaultLibrary.find((subject) => subject.id === "learning-games");
  assert(learningGames?.levels?.length === 10, "Learning Games must keep 10 levels.");
  for (const level of learningGames.levels) {
    for (const [index, challenge] of level.exercises.entries()) {
      validateLearningChallenge(challenge, `learning-games/${level.id}/${index + 1}`, stats);
      stats.learningExercises += 1;
    }
  }

  const wordPool = arcade.getArcadeWordPool(content.defaultLibrary);
  const arcadeModes = arcade.getArcadeModeCatalog();
  assert(arcadeModes.length === 9, "Arcade must keep 9 modes.");
  for (const mode of arcadeModes) {
    for (const difficulty of [1, 2, 3]) {
      const challenge = arcade.createArcadeChallenge({
        wordPool,
        preferredModeIds: [mode.id],
        difficulty,
      });
      validateLearningChallenge(challenge, `arcade/${mode.id}/difficulty-${difficulty}`, stats);
      stats.arcadeChallenges += 1;
    }
  }

  const mathSubject = content.defaultLibrary.find((subject) => subject.id === "math");
  for (const level of content.buildSubjectLevels(mathSubject)) {
    const session = math.generateMathLevelSession(level);
    validateMathSession(session, `math/${level.id}`, stats);
    stats.mathExercises += session.exercises.length;
  }

  const mathLessonSubject = content.defaultLibrary.find((subject) => subject.id === "math-lessons");
  for (const level of content.buildSubjectLevels(mathLessonSubject)) {
    const session = mathLessons.generateMathLessonSession(level);
    validateMathLessonSession(session, `math-lessons/${level.id}`, mathLessons, stats);
    stats.mathLessonExercises += session.exercises.length;
  }

  for (const track of mathGenius.mathGeniusTracks) {
    for (const level of track.levels) {
      const session = mathGenius.generateMathGeniusSession(track.id, level);
      validateMathGeniusSession(session, `math-genius/${track.id}/${level.id}`);
      stats.mathGeniusExercises += session.exercises.length;
    }
  }

  for (const level of learningGames.levels) {
    for (const challenge of level.exercises) {
      for (const choice of challenge.choices || []) {
        if (choice && typeof choice === "object" && String(choice.id).startsWith("color-")) {
          colorWordIds.add(choice.id);
        }
      }
    }
  }
  const englishExercises = content.defaultLibrary.find((subject) => subject.id === "english-exercises");
  for (const level of englishExercises.levels || []) {
    for (const challenge of level.exercises || []) {
      for (const choice of challenge.choices || []) {
        if (choice && typeof choice === "object" && String(choice.id).startsWith("color-")) {
          colorWordIds.add(choice.id);
        }
      }
    }
  }
  assert(colorWordIds.size === 10, `Expected all 10 color choices, found ${colorWordIds.size}.`);
  assert(stats.colorTokens.size === 10, `Expected all 10 color tokens, found ${stats.colorTokens.size}.`);

  console.log(JSON.stringify({
    ...stats,
    colorTokens: [...stats.colorTokens].sort(),
    colorChoiceIds: [...colorWordIds].sort(),
    arcadeModes: arcadeModes.length,
    status: "ok",
  }, null, 2));
} finally {
  await server.close();
}

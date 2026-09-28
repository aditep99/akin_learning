import { createServer } from "vite";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const arcadeModule = await server.ssrLoadModule("/src/data/arcadeChallenges.js");
  const contentModule = await server.ssrLoadModule("/src/data/contentLibrary.js");
  const modes = arcadeModule.getArcadeModeCatalog();
  const wordPool = arcadeModule.getArcadeWordPool(contentModule.defaultLibrary);
  const learningGamesSubject = contentModule.defaultLibrary.find(
    (subject) => subject.id === "learning-games",
  );

  assert(modes.length === 9, "Arcade must expose nine game modes.");
  assert(
    learningGamesSubject?.levels?.length === 10,
    "The original ten Learning Games missions must remain available.",
  );
  assert(wordPool.length >= 4, "Arcade needs at least four vocabulary words.");
  assert(
    arcadeModule.getArcadeWordPool([]).length >= 4,
    "Arcade fallback word pool is too small.",
  );

  const choiceModes = new Set([
    "word-fishing",
    "zombie-word-munch",
    "sound-safari",
    "sound-bubble-pop",
    "monster-delivery",
  ]);

  for (const mode of modes) {
    const challenge = arcadeModule.createArcadeChallenge({
      wordPool,
      preferredModeIds: [mode.id],
      difficulty: 2,
    });

    assert(challenge?.mode === mode.id, `${mode.id} did not generate.`);
    assert(challenge.id && challenge.type === "learning-game", `${mode.id} has no challenge identity.`);

    if (choiceModes.has(mode.id)) {
      assert(challenge.choices.length >= 3, `${mode.id} needs at least three choices.`);
      assert(
        challenge.choices.filter((choice) => choice.id === challenge.correctChoiceId).length === 1,
        `${mode.id} must have one correct choice.`,
      );
    }

    if (mode.id === "memory-match" || mode.id === "echo-memory") {
      assert(challenge.pairs.length >= 2, `${mode.id} needs at least two pairs.`);
    }

    if (mode.id === "treasure-sort") {
      assert(challenge.items.length >= 4, "Treasure Sort needs four items.");
      assert(challenge.baskets.length === 2, "Treasure Sort needs two baskets.");
    }

    if (mode.id === "word-rocket") {
      assert(challenge.letters.length >= challenge.targetWord.word.length, "Word Rocket is missing letters.");
    }
  }

  let stats = {
    difficulty: 1,
    recentWordIds: [],
    recentModes: [],
  };
  const generatedModes = new Set();

  for (let index = 0; index < 20; index += 1) {
    const challenge = arcadeModule.createArcadeChallenge({
      wordPool,
      difficulty: stats.difficulty,
      recentWordIds: stats.recentWordIds,
      recentModes: stats.recentModes,
    });

    assert(challenge, `Arcade round ${index + 1} did not generate.`);
    assert(
      !stats.recentWordIds.includes(challenge.targetWord?.id),
      `Arcade repeated a word too soon on round ${index + 1}.`,
    );
    assert(
      stats.recentModes.length < 2 ||
        !(
          stats.recentModes[0] === stats.recentModes[1] &&
          stats.recentModes[1] === challenge.mode
        ),
      `Arcade repeated a mode three times on round ${index + 1}.`,
    );

    generatedModes.add(challenge.mode);
    stats = {
      difficulty: index === 2 ? 2 : stats.difficulty,
      recentWordIds: [
        ...stats.recentWordIds,
        challenge.targetWord?.id,
      ].slice(-4),
      recentModes: [...stats.recentModes, challenge.mode].slice(-2),
    };
  }

  assert(generatedModes.size >= 3, "Arcade rotation is not varied enough.");

  console.log(
    JSON.stringify(
      {
        modes: modes.length,
        wordPool: wordPool.length,
        simulatedRounds: 20,
        rotatedModes: generatedModes.size,
        status: "ok",
      },
      null,
      2,
    ),
  );
} finally {
  await server.close();
}

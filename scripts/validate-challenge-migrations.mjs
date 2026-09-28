import { createServer } from "vite";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function stable(value) {
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

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "error",
});

try {
  const migration = await server.ssrLoadModule("/src/data/challengeMigrations.js");
  const content = await server.ssrLoadModule("/src/data/contentLibrary.js");
  const library = content.defaultLibrary;
  const learningGames = library.find((subject) => subject.id === "learning-games");
  const wordPool = migration.getMigrationWordPool(
    learningGames.levels.find((level) => level.levelNumber === 4),
    library,
    "learning-games",
  );

  const legacyFirstLetter = {
    id: "legacy-first-letter-contract",
    type: "first-letter-pick",
    mode: "first-letter-pick",
    word: "แมว",
    targetTokens: ["แ", "ม", "ว"],
    choices: [{ id: "first", value: "แ" }],
    correctAnswer: "แ",
  };
  const firstA = migration.migrateLegacyChallenge(legacyFirstLetter);
  const firstB = migration.migrateLegacyChallenge(legacyFirstLetter);
  assert(firstA.status === "migrated", "first-letter legacy payload did not migrate");
  assert(firstA.challenge.mode === "spelling-order", "first-letter migration did not select spelling-order");
  assert(firstA.challenge.targetTokens.join("") === "แมว", "first-letter migration changed the target word");
  assert(stable(firstA) === stable(firstB), "first-letter migration is not deterministic");
  assert(!firstA.challenge.choices, "first-letter migration retained a choice surface");

  const legacyLetterNinja = {
    id: "legacy-letter-ninja-contract",
    type: "learning-game",
    mode: "letter-ninja",
    targetWord: { id: "elephant", word: "elephant", emoji: "🐘" },
    choices: ["A", "E", "L", "T"],
  };
  const ninjaA = migration.migrateLegacyChallenge(legacyLetterNinja, { wordPool });
  const ninjaB = migration.migrateLegacyChallenge(legacyLetterNinja, { wordPool });
  assert(ninjaA.status === "migrated", "Letter Ninja legacy payload did not migrate");
  assert(ninjaA.challenge.mode === "sound-bubble-pop", "Letter Ninja migration did not select Sound Bubble Pop");
  assert(ninjaA.challenge.correctChoiceId === "elephant", "Sound Bubble Pop migration lost its target choice");
  assert(ninjaA.challenge.choices.length >= 3, "Sound Bubble Pop migration needs at least three choices");
  assert(ninjaA.challenge.choices.every((choice) => choice?.word), "Sound Bubble Pop choices need visible words");
  assert(stable(ninjaA) === stable(ninjaB), "Letter Ninja migration is not deterministic");

  const legacyStringTarget = {
    ...legacyLetterNinja,
    id: "legacy-letter-ninja-string-target",
    targetWord: "elephant",
  };
  const stringTargetMigration = migration.migrateLegacyChallenge(
    legacyStringTarget,
    { wordPool },
  );
  assert(
    stringTargetMigration.challenge?.targetWord?.id === "elephant" &&
      stringTargetMigration.challenge?.targetWord?.word?.toLowerCase() === "elephant" &&
      stringTargetMigration.challenge?.correctChoiceId === "elephant",
    "Letter Ninja string target did not resolve to the canonical word",
  );

  const legacyMission = {
    id: "legacy-active-mission-contract",
    activeActivityIndex: 1,
    diagnosticState: { complete: true },
    progressState: { stars: 4 },
    rewardState: { coins: 8 },
    activities: [
      {
        id: "legacy-activity-1",
        subjectId: "learning-games",
        levelConfig: { id: "learning-games-level-4", mode: "letter-ninja" },
        challenge: legacyLetterNinja,
      },
    ],
  };
  const restored = migration.migrateActiveMission(legacyMission, { library });
  const restoredActivity = restored.mission?.activities?.[0];
  assert(restored.status === "migrated", "legacy active mission did not migrate");
  assert(restoredActivity.challenge.mode === "sound-bubble-pop", "active mission kept the retired mode");
  assert(
    restoredActivity.levelConfig.id === "learning-games-level-4" &&
      restoredActivity.levelConfig.exercises?.[0]?.mode === "sound-bubble-pop",
    "active mission levelConfig was not refreshed",
  );
  assert(restored.mission.activeActivityIndex === 1, "active activity index was not preserved");
  assert(stable(restored.mission.diagnosticState) === stable(legacyMission.diagnosticState), "diagnostic state was not preserved");
  assert(stable(restored.mission.progressState) === stable(legacyMission.progressState), "progress state was not preserved");
  assert(stable(restored.mission.rewardState) === stable(legacyMission.rewardState), "reward state was not preserved");

  const thaiTokenLevel = library
    .find((subject) => subject.id === "thai-exercises")
    ?.levels?.find((level) => level.levelNumber === 2);
  const legacySpelling = migration.normalizeChallengeSurface(
    {
      id: "legacy-spelling-surface-contract",
      mode: "spelling-order",
      word: "แมว",
      targetTokens: ["แ", "ม", "ว"],
    },
    {
      levelConfig: thaiTokenLevel,
      subjectId: "thai-exercises",
    },
  );
  assert(legacySpelling.status === "migrated", "legacy spelling surface was not reconciled");
  assert(legacySpelling.challenge.mode === "token-bank-limited", "legacy spelling did not receive the canonical token-bank surface");
  assert(legacySpelling.challenge.surfaceId === thaiTokenLevel.surfaceId, "legacy spelling lost the canonical surface ID");
  assert(stable(legacySpelling) === stable(migration.normalizeChallengeSurface(
    {
      id: "legacy-spelling-surface-contract",
      mode: "spelling-order",
      word: "แมว",
      targetTokens: ["แ", "ม", "ว"],
    },
    {
      levelConfig: thaiTokenLevel,
      subjectId: "thai-exercises",
    },
    )), "legacy spelling surface reconciliation is not deterministic");

  const thaiSoundLevel = library
    .find((subject) => subject.id === "thai-exercises")
    ?.levels?.find((level) => level.levelNumber === 4);
  const incompleteSpelling = migration.normalizeChallengeSurface(
    {
      id: "legacy-incomplete-spelling-contract",
      mode: "sound-to-word-choice",
      word: "แมว",
      targetTokens: ["แ", "ม", "ว"],
    },
    {
      levelConfig: thaiSoundLevel,
      subjectId: "thai-exercises",
    },
  );
  assert(
    incompleteSpelling.status === "error" && !incompleteSpelling.challenge,
    "incomplete spelling payload did not enter recovery state",
  );

  const scienceSubject = library.find((subject) => subject.id === "science-exercises");
  const scienceLevel = scienceSubject?.levels?.find((level) => level.levelNumber === 5);
  const scienceSourceChallenge = scienceLevel?.exercises?.[0];
  assert(scienceSourceChallenge?.choices?.length >= 3, "Science Plant Parts fixture is incomplete");
  const staleScienceChoices = scienceSourceChallenge.choices.map((choice) => {
    const staleChoice = { ...choice, image: `/stale/${choice.id}.jpg` };
    delete staleChoice.sciencePhotoAssetId;
    return staleChoice;
  });
  const staleScienceChallenge = {
    ...scienceSourceChallenge,
    choices: staleScienceChoices,
    reviewWord: {
      ...scienceSourceChallenge.reviewWord,
      image: "/stale/review.jpg",
    },
  };
  const scienceMission = {
    id: "science-photo-resume-contract",
    activeActivityIndex: 0,
    progressState: { stars: 2, xp: 14 },
    activities: [
      {
        id: "science-photo-activity",
        subjectId: "science-exercises",
        levelConfig: { id: scienceLevel.id },
        challenge: staleScienceChallenge,
      },
    ],
  };
  const scienceRestored = migration.migrateActiveMission(scienceMission, { library });
  const scienceRestoredChallenge = scienceRestored.mission?.activities?.[0]?.challenge;
  assert(scienceRestored.status === "migrated", "Science active mission did not refresh stale visuals");
  assert(
    scienceRestoredChallenge.choices.map((choice) => choice.id).join(",") ===
      staleScienceChallenge.choices.map((choice) => choice.id).join(","),
    "Science visual refresh changed choice order or IDs",
  );
  assert(
    scienceRestoredChallenge.choices.every((choice) => choice.image && !choice.image.startsWith("/stale/")),
    "Science visual refresh kept a stale choice image",
  );
  assert(
    scienceRestoredChallenge.choices.every((choice) => choice.sciencePhotoAssetId),
    "Science visual refresh did not restore registry markers",
  );
  assert(
    scienceRestoredChallenge.correctChoiceId === staleScienceChallenge.correctChoiceId &&
      scienceRestoredChallenge.promptText === staleScienceChallenge.promptText &&
      scienceRestored.mission.activeActivityIndex === scienceMission.activeActivityIndex &&
      stable(scienceRestored.mission.progressState) === stable(scienceMission.progressState),
    "Science visual refresh changed saved semantic or progress state",
  );

  console.log(JSON.stringify({
    status: "passed",
    checks: [
      "first-letter-pick -> spelling-order",
      "letter-ninja -> sound-bubble-pop",
      "legacy spelling -> canonical token-bank surface",
      "active mission levelConfig refresh and state preservation",
      "deterministic token and choice order",
      "incomplete spelling -> recovery state",
      "Science active mission photo rehydration preserves semantic state",
    ],
  }, null, 2));
} finally {
  await server.close();
}

import { createServer } from "vite";

const SEEDS_PER_LEVEL = 256;
const RETIRED_MODES = new Set(["first-letter-pick", "letter-ninja"]);
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

const stats = {
  scopes: 0,
  levels: 0,
  authoredChallenges: 0,
  generatedChallenges: 0,
  generatedSessions: 0,
  todayMissionCandidates: 0,
  arcadeChallenges: 0,
  reviewReuse: 0,
};

const findings = [];
const reviewReuse = [];

function finding(reason, details = {}) {
  findings.push({ reason, ...details });
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

function normalizedText(value) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").toLocaleLowerCase()
    : value ?? null;
}

function getWordValue(value) {
  if (typeof value === "string") {
    return normalizedText(value);
  }

  if (!value || typeof value !== "object") {
    return value ?? null;
  }

  return {
    word: normalizedText(value.word || value.value || value.name || ""),
    translation: normalizedText(value.translation || ""),
    answerVisual: value.answerVisual?.kind === "color"
      ? { kind: "color", token: normalizedText(value.answerVisual.token) }
      : null,
  };
}

function getChoiceValue(choice) {
  if (!choice || typeof choice !== "object") {
    return getWordValue(choice);
  }

  return {
    word: getWordValue(choice.word || choice.value || choice.label || choice),
    translation: normalizedText(choice.translation || ""),
    answerVisual: choice.answerVisual?.kind === "color"
      ? { kind: "color", token: normalizedText(choice.answerVisual.token) }
      : null,
  };
}

function sortStable(items) {
  return [...(items || [])].sort((left, right) =>
    stable(left).localeCompare(stable(right)),
  );
}

function getTargetValue(challenge) {
  return getWordValue(
    challenge?.promptWord ||
      challenge?.word ||
      challenge?.targetWord ||
      challenge?.reviewWord ||
      challenge?.oddWord ||
      challenge?.correctWord ||
      "",
  );
}

function getTargetKey(challenge) {
  const target = getTargetValue(challenge);

  if (target && typeof target === "object") {
    return target.word || "";
  }

  return target || "";
}

function challengeSignature(challenge) {
  if (!challenge) {
    return "null";
  }

  const correctChoice = Array.isArray(challenge.choices)
    ? challenge.choices.find((choice) => choice?.id === challenge.correctChoiceId)
    : null;
  const basketLabels = new Map(
    (challenge.baskets || []).map((basket) => [
      basket?.id,
      normalizedText(basket?.label || basket?.id || ""),
    ]),
  );
  const items = Array.isArray(challenge.items)
    ? sortStable(
        challenge.items.map((item) => ({
          word: getWordValue(item),
          basket: basketLabels.get(item?.basketId) || normalizedText(item?.basketId || ""),
        })),
      )
    : null;
  const hotspots = Array.isArray(challenge.hotspots)
    ? sortStable(
        challenge.hotspots.map((hotspot) => ({
          word: getWordValue(hotspot?.word),
          x: hotspot?.x,
          y: hotspot?.y,
        })),
      )
    : null;

  return stable({
    mode: normalizedText(challenge.mode),
    type: normalizedText(challenge.type),
    prompt: normalizedText(
      challenge.promptText || challenge.instruction || challenge.title || "",
    ),
    target: getTargetValue(challenge),
    correctAnswer: challenge.correctAnswer ?? null,
    correctChoice: getChoiceValue(correctChoice),
    choices: Array.isArray(challenge.choices)
      ? sortStable(challenge.choices.map(getChoiceValue))
      : null,
    answerChoices: Array.isArray(challenge.answerChoices)
      ? sortStable(challenge.answerChoices.map(getChoiceValue))
      : null,
    targetTokens: Array.isArray(challenge.targetTokens)
      ? challenge.targetTokens.map(normalizedText)
      : null,
    shuffledTokens: Array.isArray(challenge.shuffledTokens)
      ? sortStable(challenge.shuffledTokens.map((token) => normalizedText(token?.value || token)))
      : null,
    bankTokens: Array.isArray(challenge.bankTokens)
      ? sortStable(challenge.bankTokens.map((token) => normalizedText(token?.value || token)))
      : null,
    patternTokens: Array.isArray(challenge.patternTokens)
      ? challenge.patternTokens.map((token) => token === null ? null : normalizedText(token))
      : null,
    groupWords: Array.isArray(challenge.groupWords)
      ? sortStable(challenge.groupWords.map(getWordValue))
      : null,
    oddWord: getWordValue(challenge.oddWord),
    baskets: Array.isArray(challenge.baskets)
      ? sortStable(
          challenge.baskets.map((basket) => ({
            label: normalizedText(basket?.label || basket?.id || ""),
          })),
        )
      : null,
    items,
    hotspots,
    targetHotspotId: normalizedText(challenge.targetHotspotId || ""),
    operator: challenge.operator ?? null,
    leftValue: challenge.leftValue ?? challenge.leftOperand ?? null,
    rightValue: challenge.rightValue ?? challenge.rightOperand ?? null,
    leftCount: challenge.leftCount ?? null,
    rightCount: challenge.rightCount ?? null,
    leftAnimal: getWordValue(challenge.leftAnimal),
    rightAnimal: getWordValue(challenge.rightAnimal),
    sceneAnimals: Array.isArray(challenge.sceneAnimals)
      ? sortStable(
          challenge.sceneAnimals.map((animal) => ({
            word: normalizedText(animal?.wordId || animal?.word || ""),
            removed: Array.isArray(challenge.sceneMeta?.removedIds)
              ? challenge.sceneMeta.removedIds.includes(animal?.id)
              : false,
          })),
        )
      : null,
    values: Array.isArray(challenge.values) ? challenge.values : null,
    correctOperators: Array.isArray(challenge.correctOperators)
      ? challenge.correctOperators
      : null,
    answer: challenge.answer ?? null,
    signature: normalizedText(challenge.signature || ""),
    difficulty: challenge.difficulty ?? null,
  });
}

function hashSeed(value) {
  let hash = 2166136261;

  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededRng(seed) {
  let state = hashSeed(seed) || 1;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function withSeed(seed, callback) {
  const originalRandom = Math.random;
  Math.random = seededRng(seed);

  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
}

function scopeLabel(subjectId, trackId = "") {
  return trackId ? `${subjectId}:${trackId}` : subjectId;
}

function addContext(scope, level, challenge, reason, extra = {}) {
  finding(reason, {
    subject: scope.subjectId,
    track: scope.trackId || "default",
    level: level?.levelNumber || level?.id || "unknown",
    surfaceId: level?.surfaceId || challenge?.surfaceId || null,
    challengeId: challenge?.id || null,
    ...extra,
  });
}

function checkSurfaceMetadata(scope, level, surface) {
  stats.levels += 1;

  if (!surface) {
    addContext(scope, level, null, "level has no canonical surface definition");
    return;
  }

  for (const field of ["surfaceId", "surfaceKind", "surfaceVariant"]) {
    if (level?.[field] !== surface[field === "surfaceKind" ? "kind" : field]) {
      addContext(scope, level, null, `level ${field} does not match canonical surface`, {
        expected: surface[field === "surfaceKind" ? "kind" : field],
        actual: level?.[field] || null,
      });
    }
  }

  if (surface.mode && level?.canonicalMode !== surface.mode) {
    addContext(scope, level, null, "level canonicalMode does not match spelling roster", {
      expected: surface.mode,
      actual: level?.canonicalMode || null,
    });
  }

  for (const challenge of level?.exercises || []) {
    stats.authoredChallenges += 1;

    for (const field of ["surfaceId", "surfaceKind", "surfaceVariant"]) {
      const expected = field === "surfaceKind" ? surface.kind : surface[field];

      if (challenge?.[field] !== expected) {
        addContext(scope, level, challenge, `challenge ${field} does not inherit level surface`, {
          expected,
          actual: challenge?.[field] || null,
        });
      }
    }

    if (RETIRED_MODES.has(challenge?.mode)) {
      addContext(scope, level, challenge, "retired mode remains in authored mission");
    }

    if (surface.mode && challenge?.mode !== surface.mode) {
      addContext(scope, level, challenge, "challenge mode does not match spelling roster", {
        expected: surface.mode,
        actual: challenge?.mode || null,
      });
    }
  }
}

function checkAuthoredUniqueness(scope, levels) {
  const signatures = new Map();
  const targetOwners = new Map();

  for (const level of levels) {
    for (const challenge of level?.exercises || []) {
      const signature = challengeSignature(challenge);
      const previous = signatures.get(signature);

      if (previous && previous.levelNumber !== level.levelNumber) {
        addContext(scope, level, challenge, "exact challenge signature repeats across levels", {
          previousLevel: previous.levelNumber,
          previousChallengeId: previous.challengeId,
          signature,
        });
      } else if (!previous) {
        signatures.set(signature, {
          levelNumber: level.levelNumber,
          challengeId: challenge.id,
        });
      }

      const targetKey = getTargetKey(challenge);
      if (targetKey) {
        const previousTarget = targetOwners.get(targetKey);

        if (previousTarget && previousTarget.levelNumber !== level.levelNumber) {
          stats.reviewReuse += 1;
          reviewReuse.push({
            subject: scope.subjectId,
            track: scope.trackId || "default",
            word: targetKey,
            previousLevel: previousTarget.levelNumber,
            level: level.levelNumber,
            previousChallengeId: previousTarget.challengeId,
            challengeId: challenge.id,
            note: "Target reuse is allowed when the exact gameplay signature differs.",
          });
        } else if (!previousTarget) {
          targetOwners.set(targetKey, {
            levelNumber: level.levelNumber,
            challengeId: challenge.id,
          });
        }
      }
    }
  }
}

function validateGeneratedScope({
  scope,
  levels,
  contentLibrary,
  randomizer,
  math,
  mathLessons,
  mathGenius,
  subject,
}) {
  const generatedSignatures = new Map();

  for (const level of levels) {
    const surfaceId = level.surfaceId;

    for (let seed = 0; seed < SEEDS_PER_LEVEL; seed += 1) {
      const seedKey = `${scopeLabel(scope.subjectId, scope.trackId)}:${level.levelNumber}:${seed}`;
      let session;

      if (scope.subjectId === "math") {
        session = withSeed(seedKey, () => math.generateMathLevelSession(level));
      } else if (scope.subjectId === "math-lessons") {
        session = withSeed(seedKey, () => mathLessons.generateMathLessonSession(level));
      } else if (scope.subjectId === "math-genius") {
        session = withSeed(seedKey, () =>
          mathGenius.generateMathGeniusSession(scope.trackId, level),
        );
      } else {
        session = randomizer.createChallengeSession({
          subjectId: subject.id,
          levelConfig: level,
          library: contentLibrary,
          history: [],
          rng: seededRng(seedKey),
          sessionId: `surface-${hashSeed(seedKey)}`,
        });
      }

      stats.generatedSessions += 1;

      for (const challenge of session?.exercises || []) {
        stats.generatedChallenges += 1;

        if (!challenge.surfaceId || challenge.surfaceId !== surfaceId) {
          addContext(scope, level, challenge, "generated challenge surface drift", {
            expected: surfaceId,
            actual: challenge.surfaceId || null,
            seed,
          });
        }

        if (RETIRED_MODES.has(challenge.mode)) {
          addContext(scope, level, challenge, "retired mode generated in active session", { seed });
        }

        const signature = challengeSignature(challenge);
        const previous = generatedSignatures.get(signature);

        if (previous && previous.levelNumber !== level.levelNumber) {
          addContext(scope, level, challenge, "exact generated challenge signature repeats across levels", {
            previousLevel: previous.levelNumber,
            previousChallengeId: previous.challengeId,
            seed,
            signature,
          });
        } else if (!previous) {
          generatedSignatures.set(signature, {
            levelNumber: level.levelNumber,
            challengeId: challenge.id,
          });
        }
      }
    }
  }
}

function validateMigrationFixtures(migration, library) {
  const learningGames = library.find((subject) => subject.id === "learning-games");
  const wordPool = migration.getMigrationWordPool(
    learningGames?.levels?.[3],
    library,
    "learning-games",
  );
  const oldFirstLetter = migration.migrateLegacyChallenge({
    id: "surface-contract-first-letter",
    type: "first-letter-pick",
    mode: "first-letter-pick",
    word: "แมว",
    targetTokens: ["แ", "ม", "ว"],
  });
  const oldLetterNinja = migration.migrateLegacyChallenge(
    {
      id: "surface-contract-letter-ninja",
      type: "learning-game",
      mode: "letter-ninja",
      targetWord: { id: "elephant", word: "elephant", emoji: "🐘" },
    },
    { wordPool },
  );

  if (oldFirstLetter.challenge?.mode !== "spelling-order") {
    finding("legacy first-letter migration does not resolve to spelling-order", {
      subject: "migration",
      challengeId: oldFirstLetter.challenge?.id || null,
    });
  }

  if (oldLetterNinja.challenge?.mode !== "sound-bubble-pop") {
    finding("legacy Letter Ninja migration does not resolve to Sound Bubble Pop", {
      subject: "migration",
      challengeId: oldLetterNinja.challenge?.id || null,
    });
  }

  const thaiLevel = library
    .find((subject) => subject.id === "thai-exercises")
    ?.levels?.[1];
  const normalized = migration.normalizeChallengeSurface(
    {
      id: "surface-contract-old-spelling",
      mode: "spelling-order",
      word: "แมว",
      targetTokens: ["แ", "ม", "ว"],
    },
    {
      levelConfig: thaiLevel,
      subjectId: "thai-exercises",
    },
  );

  if (normalized.challenge?.mode !== "token-bank-limited") {
    finding("legacy spelling session does not reconcile to the canonical level surface", {
      subject: "thai-exercises",
      level: thaiLevel?.levelNumber || 2,
      challengeId: normalized.challenge?.id || null,
    });
  }
}

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "error",
});

try {
  const content = await server.ssrLoadModule("/src/data/contentLibrary.js");
  const surfaces = await server.ssrLoadModule("/src/data/missionSurfaces.js");
  const randomizer = await server.ssrLoadModule("/src/data/challengeRandomizer.js");
  const migration = await server.ssrLoadModule("/src/data/challengeMigrations.js");
  const math = await server.ssrLoadModule("/src/data/subjects/math.js");
  const mathLessons = await server.ssrLoadModule("/src/data/subjects/mathLessons.js");
  const mathGenius = await server.ssrLoadModule("/src/data/subjects/mathGenius.js");
  const arcade = await server.ssrLoadModule("/src/data/arcadeChallenges.js");
  const today = await server.ssrLoadModule("/src/data/todayMissionPlanner.js");
  const library = content.defaultLibrary;

  const subjectScopes = [];
  for (const subject of library) {
    if (Array.isArray(subject.tracks) && subject.tracks.length > 0) {
      for (const track of subject.tracks) {
        subjectScopes.push({
          subject,
          subjectId: subject.id,
          trackId: track.id,
          levels: track.levels || [],
        });
      }
    } else {
      subjectScopes.push({
        subject,
        subjectId: subject.id,
        trackId: "",
        levels: subject.levels || [],
      });
    }
  }

  for (const scope of subjectScopes) {
    stats.scopes += 1;
    const surfaceRoster = surfaces.getSurfaceRoster(scope.subjectId, scope.trackId);
    const seenSurfaceIds = new Map();

    if (surfaceRoster.length !== scope.levels.length) {
      finding("surface roster length does not match resolved level count", {
        subject: scope.subjectId,
        track: scope.trackId || "default",
        expected: scope.levels.length,
        actual: surfaceRoster.length,
      });
    }

    for (const level of scope.levels) {
      const surface = surfaces.getSurfaceDefinition(scope.subjectId, level.levelNumber, {
        trackId: scope.trackId,
      });

      checkSurfaceMetadata(scope, level, surface);

      if (seenSurfaceIds.has(level.surfaceId)) {
        addContext(scope, level, null, "surfaceId repeats across levels in the same subject or track", {
          previousLevel: seenSurfaceIds.get(level.surfaceId),
        });
      } else if (level.surfaceId) {
        seenSurfaceIds.set(level.surfaceId, level.levelNumber);
      }
    }

    checkAuthoredUniqueness(scope, scope.levels);
    validateGeneratedScope({
      scope,
      levels: scope.levels,
      contentLibrary: library,
      randomizer,
      math,
      mathLessons,
      mathGenius,
      subject: scope.subject,
    });
  }

  const allText = JSON.stringify(library);
  for (const retiredMode of RETIRED_MODES) {
    if (allText.includes(retiredMode)) {
      finding("retired mode remains in active content library", {
        subject: "project",
        mode: retiredMode,
      });
    }
  }

  const arcadeModes = arcade.getArcadeModeCatalog();
  const arcadeIds = new Set();
  const arcadeWords = arcade.getArcadeWordPool(library);

  for (const mode of arcadeModes) {
    if (arcadeIds.has(mode.id)) {
      finding("Arcade surface ID repeats", { subject: "arcade", surfaceId: `arcade:${mode.id}` });
    }
    arcadeIds.add(mode.id);

    for (let difficulty = 1; difficulty <= 3; difficulty += 1) {
      for (let seed = 0; seed < SEEDS_PER_LEVEL; seed += 1) {
        const challenge = withSeed(`arcade:${mode.id}:${difficulty}:${seed}`, () =>
          arcade.createArcadeChallenge({
            difficulty,
            wordPool: arcadeWords,
            preferredModeIds: [mode.id],
          }),
        );
        stats.arcadeChallenges += 1;

        if (!challenge || challenge.mode !== mode.id) {
          finding("Arcade generated challenge does not inherit its mode surface", {
            subject: "arcade",
            surfaceId: `arcade:${mode.id}`,
            challengeId: challenge?.id || null,
            difficulty,
            seed,
          });
        }
      }
    }
  }

  const todayMission = today.buildTodayMission({
    library,
    profile: { id: "surface-contract" },
    learningState: { mastery: {} },
    challengeHistory: [],
    rng: seededRng("today-mission-surface-contract"),
  });
  stats.todayMissionCandidates = todayMission.activities.length;

  for (const activity of todayMission.activities) {
    if (!activity.levelConfig?.surfaceId || activity.template?.surfaceId !== activity.levelConfig.surfaceId) {
      finding("Today Mission candidate does not carry the canonical level surface", {
        subject: activity.subjectId,
        track: activity.trackId || "default",
        level: activity.levelNumber,
        surfaceId: activity.levelConfig?.surfaceId || null,
        challengeId: activity.template?.id || null,
      });
    }
  }

  validateMigrationFixtures(migration, library);

  const status = findings.length > 0 ? "failed" : "ok";
  console.log(JSON.stringify({
    status,
    seedsPerLevelOrTrack: SEEDS_PER_LEVEL,
    stats,
    findings,
    reviewReuse,
    reviewBoundary: "Automated duplicate and surface audit; repeated targets are reported separately and curriculum certification still requires expert review.",
  }, null, 2));

  if (findings.length > 0) {
    process.exitCode = 1;
  }
} finally {
  await server.close();
}

import { createServer } from "vite";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

function createRng(seed = 7) {
  let value = seed >>> 0;

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});

try {
  const profileModule = await server.ssrLoadModule("/src/data/learningProfile.js");
  const masteryModule = await server.ssrLoadModule("/src/data/masteryEngine.js");
  const hintModule = await server.ssrLoadModule("/src/data/learningHints.js");
  const plannerModule = await server.ssrLoadModule("/src/data/todayMissionPlanner.js");
  const contentModule = await server.ssrLoadModule("/src/data/contentLibrary.js");
  const randomModule = await server.ssrLoadModule("/src/data/challengeRandomizer.js");
  const mathModule = await server.ssrLoadModule("/src/data/subjects/math.js");
  const lessonModule = await server.ssrLoadModule("/src/data/subjects/mathLessons.js");
  const geniusModule = await server.ssrLoadModule("/src/data/subjects/mathGenius.js");

  const storage = createMemoryStorage();
  const profile = profileModule.loadLearningProfile(storage);
  let state = profileModule.loadLearningState(storage);

  assert(profile.id === "local-child", "default child profile id is incorrect.");
  assert(profile.name === "Akin", "default child profile name is incorrect.");
  assert(state.diagnostic.total === 10, "diagnostic must contain ten questions.");

  profileModule.saveLearningProfile(profile, storage);
  profileModule.saveLearningState(state, storage);
  assert(profileModule.loadLearningProfile(storage).name === "Akin", "profile did not survive refresh.");
  assert(profileModule.loadLearningState(storage).diagnostic.total === 10, "state did not survive refresh.");

  const gate = await profileModule.createParentGate("1234");
  profileModule.saveParentGate(gate, storage);
  assert(await profileModule.verifyParentPin("1234", profileModule.loadParentGate(storage)), "parent PIN did not unlock.");
  assert(!(await profileModule.verifyParentPin("0000", profileModule.loadParentGate(storage))), "wrong parent PIN unlocked.");

  const malformedStorage = createMemoryStorage({
    [profileModule.LEARNING_PROFILE_STORAGE_KEY]: "{bad json",
    [profileModule.LEARNING_STATE_STORAGE_KEY]: "[]",
  });
  assert(profileModule.loadLearningProfile(malformedStorage).id === "local-child", "malformed profile was not recovered.");
  assert(profileModule.loadLearningState(malformedStorage).version === 1, "malformed state was not recovered.");

  const library = contentModule.defaultLibrary;
  const diagnostic = plannerModule.buildTodayMission({
    diagnostic: true,
    library,
    learningState: state,
    profile,
    rng: createRng(11),
  });
  assert(diagnostic.activities.length === 10, "diagnostic must create ten activities.");

  const mission = plannerModule.buildTodayMission({
    diagnostic: false,
    library,
    learningState: state,
    profile,
    rng: createRng(21),
  });
  assert(mission.activities.length >= 3 && mission.activities.length <= 5, "Today Mission must contain 3–5 activities.");
  mission.activities.forEach((activity) => {
    assert(activity.subjectId && activity.levelId && activity.skillId, "mission activity is missing skill metadata.");
    assert(activity.levelConfig, "mission activity is missing level config.");
  });

  const subjectIdsWithContent = library.filter((subject) => {
    if (subject.id === "math-genius") return subject.tracks?.length > 0;
    return (subject.levels?.length || subject.words?.length) > 0;
  });
  subjectIdsWithContent.forEach((subject) => {
    const subjectMission = plannerModule.buildTodayMission({
      diagnostic: false,
      library: [subject],
      learningState: state,
      profile,
      rng: createRng(subject.id.length),
    });
    assert(subjectMission.activities.length > 0, `${subject.id} could not create a mission.`);
  });

  const firstActivity = mission.activities[0];
  const challenge = firstActivity.template || {
    id: firstActivity.id,
    mode: firstActivity.mode,
    targetWord: { word: "monster" },
  };
  const skillId = masteryModule.getSkillId({
    subjectId: firstActivity.subjectId,
    levelId: firstActivity.levelId,
    challenge,
    levelConfig: firstActivity.levelConfig,
  });
  state = masteryModule.recordLearningAttempt(state, {
    subjectId: firstActivity.subjectId,
    levelId: firstActivity.levelId,
    skillId,
    challenge,
    correct: false,
    attemptNumber: 1,
  });
  assert(state.mastery[skillId].score === 0, "a first wrong answer should not create a negative mastery score.");
  const afterWrong = state.mastery[skillId];
  state = masteryModule.recordLearningAttempt(state, {
    subjectId: firstActivity.subjectId,
    levelId: firstActivity.levelId,
    skillId,
    challenge,
    correct: true,
    attemptNumber: 2,
  });
  assert(state.mastery[skillId].score > afterWrong.score, "correct retry should increase mastery.");
  assert(masteryModule.getDifficultyForScore(0) === 1, "low mastery difficulty is incorrect.");
  assert(masteryModule.getDifficultyForScore(50) === 2, "learning difficulty is incorrect.");
  assert(masteryModule.getDifficultyForScore(80) === 3, "ready difficulty is incorrect.");

  const hintedState = masteryModule.recordLearningAttempt(state, {
    subjectId: firstActivity.subjectId,
    levelId: firstActivity.levelId,
    skillId,
    challenge,
    correct: true,
    attemptNumber: 1,
    hintLevel: 2,
  });
  assert(hintedState.mastery[skillId].hintUses === 1, "hint use was not recorded.");
  assert(hintModule.getLearningHint(challenge, { wrongAttempts: 1 }).level === 2, "hint level did not adapt to wrong attempts.");

  const resetState = masteryModule.resetAdaptiveProgress({
    ...hintedState,
    subjectProgress: { animals: { completedLevels: 2, currentLevel: 3 } },
    stars: 19,
    coins: 44,
  });
  assert(Object.keys(resetState.mastery).length === 0, "reset did not clear mastery.");
  assert(resetState.subjectProgress.animals.completedLevels === 2, "reset changed map progress.");
  assert(resetState.stars === 19 && resetState.coins === 44, "reset changed arcade rewards.");

  const generatedMath = mathModule.generateMathLevelSession(contentModule.defaultLibrary.find((item) => item.id === "math").levels[0]);
  assert(generatedMath.exercises.length > 0, "math session generator failed during adaptive validation.");
  const generatedLessons = lessonModule.generateMathLessonSession(contentModule.defaultLibrary.find((item) => item.id === "math-lessons").levels[0]);
  assert(generatedLessons.exercises.length > 0, "math lessons generator failed during adaptive validation.");
  const generatedGenius = geniusModule.generateMathGeniusSession("column", geniusModule.mathGeniusTracks[0].levels[0]);
  assert(generatedGenius.exercises.length > 0, "math genius generator failed during adaptive validation.");
  const genericSession = randomModule.createChallengeSession({
    subjectId: firstActivity.subjectId,
    levelConfig: firstActivity.levelConfig,
    library,
    history: [],
    rng: createRng(31),
  });
  assert(genericSession?.exercises?.length > 0, "generic challenge session failed during adaptive validation.");

  console.log(`Adaptive learning validation passed: ${subjectIdsWithContent.length} subjects, diagnostic ${diagnostic.activities.length}, mission ${mission.activities.length}.`);
} finally {
  await server.close();
}

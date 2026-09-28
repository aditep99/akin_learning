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
  const mathModule = await server.ssrLoadModule("/src/data/subjects/mathLessons.js");
  const scienceModule = await server.ssrLoadModule(
    "/src/data/subjects/scienceExercises.js",
  );
  const englishModule = await server.ssrLoadModule(
    "/src/data/subjects/englishExercises.js",
  );
  const englishSpellingModule = await server.ssrLoadModule(
    "/src/data/subjects/englishSpelling.js",
  );
  const finalTestModule = await server.ssrLoadModule(
    "/src/data/finalTest/finalTestExercises.js",
  );
  const finalTestPhotoModule = await server.ssrLoadModule(
    "/src/data/finalTest/finalTestPhotoAssets.js",
  );

  const mathSubject = mathModule.mathLessonsSubject;
  const scienceSubject = scienceModule.scienceExercisesSubject;
  const englishSubject = englishModule.englishExercisesSubject;
  const englishSpellingSubject =
    englishSpellingModule.englishSpellingSubject;
  const finalTestSubject = finalTestModule.finalTestSubject;
  const finalTestFormatCounts = finalTestModule.FINAL_TEST_FORMAT_COUNTS;
  const finalTestPhotoAssets = finalTestPhotoModule.finalTestPhotoAssetsById;

  const placeValueLevel = mathSubject.levels.find(
    (level) => level.title === "Place Value",
  );
  const geometryLevel = mathSubject.levels.find(
    (level) => level.title === "Geometry Shapes",
  );
  const plantLevel = scienceSubject.levels.find(
    (level) => level.themeLabel === "Parts of a Plant",
  );
  const sensesLevel = scienceSubject.levels.find(
    (level) => level.themeLabel === "Five Senses",
  );
  const englishThemes = new Set(
    englishSubject.levels.map((level) => level.themeLabel),
  );

  assert(placeValueLevel, "Place Value lesson is missing.");
  assert(geometryLevel, "Geometry Shapes lesson is missing.");
  assert(plantLevel, "Parts of a Plant level is missing.");
  assert(sensesLevel, "Five Senses level is missing.");
  assert(englishThemes.has("Pronoun Heroes"), "Pronoun level is missing.");
  assert(englishThemes.has("Plural Power"), "Plural level is missing.");
  assert(englishThemes.has("Position Quest"), "Preposition level is missing.");

  assert(
    finalTestSubject.levels.length === 4,
    "Final Test must contain four unit levels.",
  );
  assert(
    finalTestSubject.levels.every((level) => level.exercises.length === 40),
    "Every Final Test unit must contain 40 questions.",
  );
  for (const level of finalTestSubject.levels) {
    const formatCounts = level.exercises.reduce((counts, exercise) => {
      counts[exercise.format] = (counts[exercise.format] || 0) + 1;
      return counts;
    }, {});
    assert(
      Object.entries(finalTestFormatCounts).every(
        ([format, count]) => formatCounts[format] === count,
      ),
      `${level.title} has an incorrect Final Test format mix.`,
    );
  }
  const finalTestPictureQuestions = finalTestSubject.levels
    .flatMap((level) => level.exercises)
    .filter((exercise) => exercise.format === "picture-choice");
  assert(
    finalTestPictureQuestions.every((exercise) =>
      exercise.choices.every(
        (choice) =>
          typeof choice.photoAssetId === "string" &&
          Boolean(finalTestPhotoAssets[choice.photoAssetId]),
      ),
    ),
    "Every Final Test picture choice must reference a registered local photo.",
  );

  for (const level of [placeValueLevel, geometryLevel]) {
    const session = mathModule.generateMathLessonSession(level);
    assert(session.exercises.length === 50, `${level.title} must generate 50 exercises.`);
    assert(
      session.exercises.every(mathModule.isValidMathLessonChallenge),
      `${level.title} generated an invalid exercise.`,
    );
  }

  assert(
    plantLevel.exercises.every((exercise) =>
      exercise.choices.every((choice) => Boolean(choice.image)),
    ),
    "Every plant-parts choice must have an image.",
  );

  for (const theme of ["Pronoun Heroes", "Plural Power", "Position Quest"]) {
    const level = englishSubject.levels.find(
      (candidate) => candidate.themeLabel === theme,
    );
    assert(
      level.exercises.every((exercise) =>
        exercise.choices.every((choice) => Boolean(choice.image)),
      ),
      `${theme} must use an image for every choice.`,
    );
  }

  const spellingExercises = englishSpellingSubject.levels.flatMap(
    (level) => level.exercises,
  );
  assert(spellingExercises.length > 0, "English Spelling has no exercises.");
  assert(
    spellingExercises.every(
      (exercise) =>
        Array.isArray(exercise.learningFlow) &&
        exercise.learningFlow.join("-") === "learn-write-speak" &&
        typeof exercise.speakSentence === "string" &&
        exercise.speakSentence.length > exercise.word.length,
    ),
    "Every English spelling exercise must include learn-write-speak data.",
  );

  console.log(
    JSON.stringify(
      {
        mathLessons: mathSubject.levels.length,
        scienceLevels: scienceSubject.levels.length,
        englishLevels: englishSubject.levels.length,
        communicationWords: spellingExercises.length,
        finalTestUnits: finalTestSubject.levels.length,
        finalTestQuestions: finalTestSubject.levels.reduce(
          (total, level) => total + level.exercises.length,
          0,
        ),
        generatedMathExercises: {
          placeValue: 50,
          geometry: 50,
        },
        status: "ok",
      },
      null,
      2,
    ),
  );
} finally {
  await server.close();
}

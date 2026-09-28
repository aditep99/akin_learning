import { readFile } from "node:fs/promises";
import { createServer } from "vite";

const SHAPES = [
  "circle",
  "square",
  "triangle",
  "diamond",
  "rectangle",
  "oval",
];

const SHAPE_SET = new Set(SHAPES);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function createRng(seed) {
  let value = seed >>> 0;

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function validateShapeQuestion(challenge, label) {
  const target = challenge.targetShape ?? challenge.shapeGoal;
  const choices = challenge.choices || [];
  const correctAnswer = challenge.correctAnswer ?? target;

  assert(SHAPE_SET.has(target), `${label} has an unknown target shape: ${target}.`);
  assert(choices.length >= 3, `${label} needs at least three choices.`);
  assert(
    new Set(choices).size === choices.length,
    `${label} has duplicate shape choices.`,
  );
  assert(
    choices.every((choice) => SHAPE_SET.has(choice)),
    `${label} has an unknown shape choice.`,
  );
  assert(
    choices.filter((choice) => choice === correctAnswer).length === 1,
    `${label} must have exactly one correct shape.`,
  );
}

function getCssBlock(css, className) {
  const escapedClassName = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(
    new RegExp(`\\.${escapedClassName}\\s*\\{([^}]*)\\}`, "m"),
  );

  return match?.[1] || "";
}

function assertCssGeometry(css, selectorPrefix) {
  const circle = getCssBlock(css, `${selectorPrefix}--circle`);
  const square = getCssBlock(css, `${selectorPrefix}--square`);
  const triangle = getCssBlock(css, `${selectorPrefix}--triangle`);
  const diamond = getCssBlock(css, `${selectorPrefix}--diamond`);
  const rectangle = getCssBlock(css, `${selectorPrefix}--rectangle`);
  const oval = getCssBlock(css, `${selectorPrefix}--oval`);

  assert(circle.includes("border-radius: 50%"), `${selectorPrefix} circle is not round.`);
  assert(square.includes("border-radius"), `${selectorPrefix} square renderer is missing.`);
  assert(
    triangle.includes("clip-path") || triangle.includes("border-left"),
    `${selectorPrefix} triangle renderer is missing.`,
  );
  assert(diamond.includes("rotate(45deg)"), `${selectorPrefix} diamond is not rotated.`);

  const rectangleWidth = Number(rectangle.match(/width:\s*(\d+)px/)?.[1] || 0);
  const rectangleHeight = Number(rectangle.match(/height:\s*(\d+)px/)?.[1] || 0);
  assert(
    rectangleWidth > rectangleHeight,
    `${selectorPrefix} rectangle must be wider than it is tall.`,
  );

  const ovalWidth = Number(oval.match(/width:\s*(\d+)px/)?.[1] || 0);
  const ovalHeight = Number(oval.match(/height:\s*(\d+)px/)?.[1] || 0);
  assert(ovalWidth > ovalHeight, `${selectorPrefix} oval must be wider than it is tall.`);
  assert(oval.includes("border-radius: 50%"), `${selectorPrefix} oval is not fully rounded.`);
}

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});

try {
  const contentModule = await server.ssrLoadModule("/src/data/contentLibrary.js");
  const randomizerModule = await server.ssrLoadModule(
    "/src/data/challengeRandomizer.js",
  );
  const historyModule = await server.ssrLoadModule(
    "/src/data/challengeHistory.js",
  );
  const mathModule = await server.ssrLoadModule("/src/data/subjects/mathLessons.js");
  const library = contentModule.defaultLibrary;
  const history = historyModule.createEmptyChallengeHistory();
  const learningGames = library.find((subject) => subject.id === "learning-games");

  assert(learningGames?.levels?.length === 10, "Learning Games must have 10 levels.");

  let learningGameQuestions = 0;
  let shapeShieldQuestions = 0;
  const learningTargets = new Set();
  const learningChoices = new Set();

  for (const level of learningGames.levels) {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const session = randomizerModule.createChallengeSession({
        subjectId: "learning-games",
        levelConfig: level,
        library,
        history,
        rng: createRng(17 + level.levelNumber * 100000 + attempt * 1000003),
      });
      const challenge = session?.exercises?.[0];

      assert(challenge, `${level.id} did not generate a question.`);
      learningGameQuestions += 1;

      if (challenge.mode === "shape-shield") {
        shapeShieldQuestions += 1;
        validateShapeQuestion(challenge, `${level.id} question ${attempt + 1}`);
        learningTargets.add(challenge.targetShape);
        challenge.choices.forEach((choice) => learningChoices.add(choice));
      }
    }
  }

  const shapeLevel = learningGames.levels.find(
    (level) => level.exercises?.[0]?.mode === "shape-shield",
  );
  const shapeHistory = historyModule.createEmptyChallengeHistory();

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const session = randomizerModule.createChallengeSession({
      subjectId: "learning-games",
      levelConfig: shapeLevel,
      library,
      history: shapeHistory,
      rng: createRng(31 + attempt * 1000003),
    });
    const challenge = session?.exercises?.[0];

    validateShapeQuestion(challenge, `Shape Shield coverage question ${attempt + 1}`);
    learningTargets.add(challenge.targetShape);
    challenge.choices.forEach((choice) => learningChoices.add(choice));
  }

  assert(
    SHAPES.every((shape) => learningTargets.has(shape)),
    "Shape Shield did not generate every shape as a target.",
  );
  assert(
    SHAPES.every((shape) => learningChoices.has(shape)),
    "Shape Shield did not generate every shape as a choice.",
  );

  const originalRandom = Math.random;
  Math.random = createRng(20260813);

  let mathLessonQuestions = 0;
  let geometryQuestions = 0;
  const mathTargets = new Set();
  const mathChoices = new Set();

  try {
    for (const level of mathModule.mathLessonsSubject.levels) {
      for (let sessionIndex = 0; sessionIndex < 10; sessionIndex += 1) {
        const session = mathModule.generateMathLessonSession(level);

        assert(
          session?.exercises?.length === level.exerciseCount,
          `${level.title} generated the wrong question count.`,
        );

        session.exercises.forEach((challenge, questionIndex) => {
          mathLessonQuestions += 1;
          assert(
            mathModule.isValidMathLessonChallenge(challenge),
            `${level.title} question ${questionIndex + 1} is invalid.`,
          );

          if (challenge.mode === "shape-pick") {
            geometryQuestions += 1;
            validateShapeQuestion(challenge, `${level.title} question ${questionIndex + 1}`);
            mathTargets.add(challenge.shapeGoal);
            challenge.choices.forEach((choice) => mathChoices.add(choice));
          }
        });
      }
    }
  } finally {
    Math.random = originalRandom;
  }

  assert(
    SHAPES.every((shape) => mathTargets.has(shape)),
    "Math Geometry did not generate every shape as a target.",
  );
  assert(
    SHAPES.every((shape) => mathChoices.has(shape)),
    "Math Geometry did not generate every shape as a choice.",
  );

  const css = await readFile("src/index.css", "utf8");
  assertCssGeometry(css, "shape-shield__shape");
  assertCssGeometry(css, "geometry-shape");
  assert(
    /\.shape-shield__shape--rectangle,\s*\.shape-shield__shape--oval\s*\{[^}]*width:\s*88px[^}]*height:\s*52px/s.test(
      css,
    ),
    "Responsive Rectangle/Oval dimensions are missing.",
  );

  console.log(
    JSON.stringify(
      {
        learningGameLevels: learningGames.levels.length,
        learningGameQuestions,
        shapeShieldQuestions,
        learningShapeTargets: [...learningTargets].sort(),
        learningShapeChoices: [...learningChoices].sort(),
        mathLessonLevels: mathModule.mathLessonsSubject.levels.length,
        mathLessonQuestions,
        geometryQuestions,
        mathShapeTargets: [...mathTargets].sort(),
        mathShapeChoices: [...mathChoices].sort(),
        status: "ok",
      },
      null,
      2,
    ),
  );
} finally {
  await server.close();
}

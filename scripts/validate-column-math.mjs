import {
  deriveColumnSteps,
  generateMathGeniusSession,
  isValidMathGeniusChallenge,
  mathGeniusTracks,
} from "../src/data/subjects/mathGenius.js";

const SEEDS = 256;
const columnTrack = mathGeniusTracks.find((track) => track.id === "column");
const findings = [];

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function withSeed(seed, callback) {
  const originalRandom = Math.random;
  Math.random = seededRandom(seed);
  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
}

function expect(condition, message, details = {}) {
  if (!condition) {
    findings.push({ reason: message, ...details });
  }
}

function pairKey(challenge) {
  return `${challenge.operator}:${challenge.leftValue}:${challenge.rightValue}`;
}

function validateChallenge(challenge, levelNumber, seed, index) {
  const context = { level: levelNumber, seed, question: index + 1, challengeId: challenge?.id };
  expect(Boolean(challenge), "challenge is missing", context);
  if (!challenge) return;

  const steps = deriveColumnSteps(challenge);
  expect(isValidMathGeniusChallenge(challenge), "challenge failed the Math Genius validator", context);
  expect(challenge.answer >= 0 && challenge.answer <= 99, "new answer is outside 0–99", context);
  expect(challenge.correctAnswer === challenge.answer, "correctAnswer does not match answer", context);
  expect(challenge.regrouping === steps.regrouping, "regrouping does not match the operands", context);
  expect(challenge.columnSteps?.answer?.ones === steps.answer.ones, "answer ones metadata drifted", context);
  expect(challenge.columnSteps?.answer?.tens === steps.answer.tens, "answer tens metadata drifted", context);
  expect(challenge.columnSteps?.carry?.onesToTens === steps.carry.onesToTens, "carry metadata drifted", context);
  expect(challenge.columnSteps?.borrow?.adjustedTens === steps.borrow?.adjustedTens, "borrow tens metadata drifted", context);
  expect(challenge.columnSteps?.borrow?.adjustedOnes === steps.borrow?.adjustedOnes, "borrow ones metadata drifted", context);
  expect(
    JSON.stringify(challenge.inputSequence) === JSON.stringify(steps.inputSequence),
    "input sequence metadata drifted",
    context,
  );

  if (levelNumber === 1) {
    const expectedRegrouping = index < 5 ? "none" : "carry";
    expect(challenge.regrouping === expectedRegrouping, "Level 1 carry split is incorrect", context);
    expect(challenge.rightValue >= 1 && challenge.rightValue <= 9, "Level 1 right operand is not one digit", context);
  }

  if ([2, 4].includes(levelNumber)) {
    expect(challenge.regrouping === "carry", "addition level must carry", context);
    expect(challenge.operator === "+", "carry level must use addition", context);
  }

  if (levelNumber === 2) {
    expect(challenge.leftValue >= 15 && challenge.leftValue <= 39, "Level 2 left operand is outside 15–39", context);
    expect(challenge.rightValue >= 10, "Level 2 right operand must be two digit", context);
  }

  if (levelNumber === 3) {
    expect(challenge.operator === "-" && challenge.regrouping === "borrow", "Level 3 must borrow on subtraction", context);
    expect(challenge.leftValue >= 21 && challenge.leftValue <= 59, "Level 3 left operand is outside 21–59", context);
  }

  if (levelNumber === 4) {
    expect(challenge.leftValue >= 40 && challenge.leftValue <= 59, "Level 4 left operand is outside 40–59", context);
  }

  if (levelNumber === 5) {
    const expectedOperator = index % 2 === 0 ? "-" : "+";
    const expectedRegrouping = index % 2 === 0 ? "borrow" : "carry";
    expect(challenge.operator === expectedOperator, "Level 5 operator split is incorrect", context);
    expect(challenge.regrouping === expectedRegrouping, "Level 5 regrouping split is incorrect", context);
    expect(challenge.leftValue >= (challenge.operator === "-" ? 60 : 60), "Level 5 left operand is too small", context);
    expect(challenge.operator === "+" ? challenge.leftValue <= 79 : challenge.leftValue <= 99, "Level 5 left operand is too large", context);
  }
}

const crossLevelPairs = new Map();
for (const level of columnTrack.levels) {
  for (let seed = 0; seed < SEEDS; seed += 1) {
    const session = withSeed(level.levelNumber * SEEDS + seed, () =>
      generateMathGeniusSession("column", level),
    );
    expect(session.exercises.length === 10, "level must generate exactly ten exercises", {
      level: level.levelNumber,
      seed,
    });

    const sessionPairs = new Set();
    session.exercises.forEach((challenge, index) => {
      validateChallenge(challenge, level.levelNumber, seed, index);
      const key = pairKey(challenge);
      expect(!sessionPairs.has(key), "operand pair repeats within a session", {
        level: level.levelNumber,
        seed,
        question: index + 1,
      });
      sessionPairs.add(key);
      const previousLevel = crossLevelPairs.get(key);
      expect(previousLevel === undefined || previousLevel === level.levelNumber, "operand pair repeats across levels", {
        level: level.levelNumber,
        seed,
        previousLevel,
        pair: key,
      });
      crossLevelPairs.set(key, level.levelNumber);
    });
  }
}

const examples = [
  {
    name: "27 + 15 = 42",
    challenge: { leftValue: 27, rightValue: 15, operator: "+", correctAnswer: 42 },
    check: (steps) => steps.regrouping === "carry" && steps.carry.onesToTens === 1 && steps.answer.ones === 2 && steps.answer.tens === 4,
  },
  {
    name: "52 − 18 = 34",
    challenge: { leftValue: 52, rightValue: 18, operator: "-", correctAnswer: 34 },
    check: (steps) => steps.borrow?.adjustedTens === 4 && steps.borrow?.adjustedOnes === 12 && steps.answer.ones === 4 && steps.answer.tens === 3,
  },
  {
    name: "40 − 17 = 23",
    challenge: { leftValue: 40, rightValue: 17, operator: "-", correctAnswer: 23 },
    check: (steps) => steps.borrow?.adjustedTens === 3 && steps.borrow?.adjustedOnes === 10 && steps.answer.ones === 3 && steps.answer.tens === 2,
  },
  {
    name: "21 − 18 = 3",
    challenge: { leftValue: 21, rightValue: 18, operator: "-", correctAnswer: 3 },
    check: (steps) => steps.answer.ones === 3 && steps.answer.tens === 0,
  },
  {
    name: "26 + 14 = 40",
    challenge: { leftValue: 26, rightValue: 14, operator: "+", correctAnswer: 40 },
    check: (steps) => steps.regrouping === "carry" && steps.answer.ones === 0 && steps.answer.tens === 4,
  },
  {
    name: "legacy 91 + 9 = 100",
    challenge: { leftValue: 91, rightValue: 9, operator: "+", correctAnswer: 100 },
    check: (steps) => steps.answer.hundreds === 1 && steps.inputSequence.at(-1) === "answerHundreds",
  },
];

examples.forEach(({ name, challenge, check }) => {
  expect(check(deriveColumnSteps(challenge)), `example failed: ${name}`, { example: name });
});

if (findings.length > 0) {
  console.error(JSON.stringify({ ok: false, findings }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, seedsPerLevel: SEEDS, levels: columnTrack.levels.length, examples: examples.length }));
}

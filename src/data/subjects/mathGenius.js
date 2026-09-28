import { getSurfaceDefinition } from "../missionSurfaces.js";

const EXERCISES_PER_LEVEL = 10;

const storyThemes = [
  {
    id: "hungry-worm",
    characterName: "Wiggle the Hungry Worm",
    buddyId: "",
    sceneKind: "worm",
    item: "leaf",
    itemPlural: "leaves",
    itemEmoji: "🍃",
  },
  {
    id: "captain-bubble",
    characterName: "Captain Bubble",
    buddyId: "boat-bubble",
    sceneKind: "monster",
    item: "supply box",
    itemPlural: "supply boxes",
    itemEmoji: "📦",
  },
  {
    id: "sergeant-sprout",
    characterName: "Sergeant Sprout",
    buddyId: "soldier-sprout",
    sceneKind: "monster",
    item: "badge",
    itemPlural: "badges",
    itemEmoji: "⭐",
  },
  {
    id: "rocket-rio",
    characterName: "Rocket Rio",
    buddyId: "rocket-rio",
    sceneKind: "monster",
    item: "energy star",
    itemPlural: "energy stars",
    itemEmoji: "⚡",
  },
  {
    id: "robot-beep",
    characterName: "Robot Beep",
    buddyId: "robot-beep",
    sceneKind: "monster",
    item: "gear",
    itemPlural: "gears",
    itemEmoji: "⚙️",
  },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne(items) {
  return items[randomInt(0, items.length - 1)];
}

function columnPairKey(values) {
  return `${values.operator}:${values.leftValue}:${values.rightValue}`;
}

function pickColumnPair(candidates, usedPairs = new Set()) {
  const available = candidates.filter(
    (candidate) => !usedPairs.has(columnPairKey(candidate)),
  );
  const pool = available.length > 0 ? available : candidates;
  const selected = pickOne(pool);
  usedPairs.add(columnPairKey(selected));
  return selected;
}

function getColumnDigits(value) {
  const numericValue = Math.max(0, Number(value) || 0);

  return {
    hundreds: Math.floor(numericValue / 100),
    tens: Math.floor(numericValue / 10) % 10,
    ones: numericValue % 10,
  };
}

/**
 * Derive the paper-and-pencil steps from the operands. This also lets the
 * renderer recover older saved challenges that do not contain step metadata.
 */
export function deriveColumnSteps(challenge) {
  const leftValue = Number(challenge?.leftValue) || 0;
  const rightValue = Number(challenge?.rightValue) || 0;
  const operator = challenge?.operator === "-" ? "-" : "+";
  const answer =
    Number.isFinite(Number(challenge?.correctAnswer))
      ? Number(challenge.correctAnswer)
      : operator === "+"
        ? leftValue + rightValue
        : leftValue - rightValue;
  const left = getColumnDigits(leftValue);
  const right = getColumnDigits(rightValue);
  const answerDigits = getColumnDigits(answer);
  const onesTotal = left.ones + right.ones;
  const carryOnesToTens = operator === "+" ? Math.floor(onesTotal / 10) : 0;
  const tensTotal = left.tens + right.tens + carryOnesToTens;
  const carryTensToHundreds = operator === "+" ? Math.floor(tensTotal / 10) : 0;
  const needsBorrow = operator === "-" && left.ones < right.ones;
  const borrow = needsBorrow
    ? {
        originalTens: left.tens,
        originalOnes: left.ones,
        adjustedTens: left.tens - 1,
        adjustedOnes: left.ones + 10,
      }
    : null;

  const inputSequence = [];
  if (borrow) {
    inputSequence.push("borrowTens", "borrowOnes");
  }
  inputSequence.push("answerOnes");
  if (carryOnesToTens > 0) {
    inputSequence.push("carryOnes");
  }
  inputSequence.push("answerTens");
  if (carryTensToHundreds > 0) {
    inputSequence.push("carryTens");
  }
  if (answerDigits.hundreds > 0) {
    inputSequence.push("answerHundreds");
  }

  return {
    left,
    right,
    answer: answerDigits,
    answerValue: answer,
    regrouping: borrow ? "borrow" : carryOnesToTens > 0 ? "carry" : "none",
    carry: {
      onesToTens: carryOnesToTens,
      tensToHundreds: carryTensToHundreds,
    },
    borrow,
    inputSequence,
  };
}

function buildBaseChallenge({
  id,
  levelNumber,
  mode,
  prompt,
  promptTh,
  signature,
  title,
  trackId,
}) {
  return {
    id,
    type: "math-genius",
    mode,
    trackId,
    levelNumber,
    title,
    prompt,
    promptTh,
    signature,
  };
}

function buildNoCarryAdditionLevelOne(usedPairs) {
  const candidates = [];

  for (let leftValue = 10; leftValue <= 89; leftValue += 1) {
    for (let rightValue = 1; rightValue <= 9; rightValue += 1) {
      if (leftValue % 10 + rightValue < 10) {
        candidates.push({
          leftValue,
          rightValue,
          operator: "+",
          answer: leftValue + rightValue,
          regrouping: "none",
        });
      }
    }
  }

  return pickColumnPair(candidates, usedPairs);
}

function buildCarryAdditionOneDigit(usedPairs) {
  const candidates = [];

  for (let leftValue = 10; leftValue <= 89; leftValue += 1) {
    for (let rightValue = 1; rightValue <= 9; rightValue += 1) {
      if (leftValue % 10 + rightValue >= 10 && leftValue + rightValue <= 99) {
        candidates.push({
          leftValue,
          rightValue,
          operator: "+",
          answer: leftValue + rightValue,
          regrouping: "carry",
        });
      }
    }
  }

  return pickColumnPair(candidates, usedPairs);
}

function buildCarryAddition(minLeft, maxLeft, usedPairs) {
  const candidates = [];

  for (let leftValue = minLeft; leftValue <= maxLeft; leftValue += 1) {
    for (let rightValue = 10; rightValue <= 99 - leftValue; rightValue += 1) {
      if (leftValue % 10 + rightValue % 10 >= 10) {
        candidates.push({
          leftValue,
          rightValue,
          operator: "+",
          answer: leftValue + rightValue,
          regrouping: "carry",
        });
      }
    }
  }

  return pickColumnPair(candidates, usedPairs);
}

function buildBorrowSubtraction(minLeft, maxLeft, usedPairs) {
  const candidates = [];

  for (let leftValue = minLeft; leftValue <= maxLeft; leftValue += 1) {
    for (let rightValue = 11; rightValue < leftValue; rightValue += 1) {
      if (leftValue % 10 < rightValue % 10) {
        candidates.push({
          leftValue,
          rightValue,
          operator: "-",
          answer: leftValue - rightValue,
          regrouping: "borrow",
        });
      }
    }
  }

  return pickColumnPair(candidates, usedPairs);
}

function buildColumnValues(levelNumber, questionIndex, usedPairs) {
  switch (levelNumber) {
    case 1:
      return questionIndex < 5
        ? buildNoCarryAdditionLevelOne(usedPairs)
        : buildCarryAdditionOneDigit(usedPairs);
    case 2:
      return buildCarryAddition(15, 39, usedPairs);
    case 3:
      return buildBorrowSubtraction(21, 59, usedPairs);
    case 4:
      return buildCarryAddition(40, 59, usedPairs);
    case 5:
    default:
      return questionIndex % 2 === 0
        ? buildBorrowSubtraction(60, 99, usedPairs)
        : buildCarryAddition(60, 79, usedPairs);
  }
}

function buildColumnChallenge(levelConfig, questionIndex, usedPairs) {
  const values = buildColumnValues(
    levelConfig.levelNumber,
    questionIndex,
    usedPairs,
  );
  const columnSteps = deriveColumnSteps({
    ...values,
    correctAnswer: values.answer,
  });
  const isAddition = values.operator === "+";
  const hasRegrouping = columnSteps.regrouping !== "none";
  const prompt = isAddition
    ? `Set up ${values.leftValue} + ${values.rightValue}. Fill the ones first${hasRegrouping ? ", record the carry, then tens." : ", then tens."}`
    : `Set up ${values.leftValue} − ${values.rightValue}. ${hasRegrouping ? "Borrow first, then " : ""}fill the ones answer before tens.`;
  const promptTh = isAddition
    ? `ตั้งบวก ${values.leftValue} กับ ${values.rightValue} เติมหลักหน่วยก่อน${hasRegrouping ? " ใส่ตัวทด แล้ว" : " แล้ว"} เติมหลักสิบ`
    : `ตั้งลบ ${values.leftValue} ด้วย ${values.rightValue} ${hasRegrouping ? "ยืมจากหลักสิบก่อน แล้ว" : "แล้ว"}เติมคำตอบหลักหน่วยก่อนหลักสิบ`;

  return {
    ...buildBaseChallenge({
      id: `${levelConfig.id}-q-${questionIndex + 1}`,
      levelNumber: levelConfig.levelNumber,
      mode: "column-equation-input",
      prompt,
      promptTh,
      signature: `column:${levelConfig.levelNumber}:${values.operator}:${values.leftValue}:${values.rightValue}:${values.regrouping}`,
      title: isAddition ? "Solve on paper · Addition" : "Solve on paper · Subtraction",
      trackId: "column",
    }),
    ...values,
    correctAnswer: values.answer,
    inputMaxLength: String(values.answer).length,
    columnSteps,
    answerDigits: columnSteps.answer,
    carryValue: columnSteps.carry.onesToTens,
    carryTensValue: columnSteps.carry.tensToHundreds,
    borrowedTens: columnSteps.borrow?.adjustedTens ?? null,
    borrowedOnes: columnSteps.borrow?.adjustedOnes ?? null,
    inputSequence: columnSteps.inputSequence,
  };
}

function getTheme(levelNumber, questionIndex) {
  if (levelNumber === 1) {
    return storyThemes[0];
  }

  return storyThemes[(questionIndex + levelNumber - 1) % storyThemes.length];
}

function pluralize(theme, amount) {
  return amount === 1 ? theme.item : theme.itemPlural;
}

function buildDailyStory(levelConfig, questionIndex, theme) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  let dailyValues = [];
  let answer = 0;

  do {
    dailyValues = days.map(() => randomInt(1, 5));
    answer = dailyValues.reduce((total, value) => total + value, 0);
  } while (answer > 20);

  const storyLines = days.map(
    (day, index) =>
      `On ${day}, ${theme.characterName} collected ${dailyValues[index]} ${pluralize(
        theme,
        dailyValues[index],
      )}.`,
  );

  return {
    ...buildBaseChallenge({
      id: `${levelConfig.id}-q-${questionIndex + 1}`,
      levelNumber: levelConfig.levelNumber,
      mode: "story-number-input",
      prompt: `${storyLines.join(" ")} How many ${theme.itemPlural} altogether?`,
      promptTh: `รวมจำนวน${theme.itemPlural}ของทั้ง 5 วัน แล้วพิมพ์คำตอบ`,
      signature: `daily:${dailyValues.join("-")}`,
      title: "Find the five-day total",
      trackId: "story",
    }),
    storyKind: "daily-total",
    theme,
    storyLines,
    dailyValues,
    correctAnswer: answer,
    inputMaxLength: String(answer).length,
  };
}

function buildAdditionStory(levelConfig, questionIndex, theme) {
  const leftValue = randomInt(3, 24);
  const rightValue = randomInt(2, Math.min(20, 50 - leftValue));
  const answer = leftValue + rightValue;
  const storyLines = [
    `${theme.characterName} had ${leftValue} ${pluralize(theme, leftValue)}.`,
    `${theme.characterName} found ${rightValue} more ${pluralize(theme, rightValue)}.`,
  ];

  return {
    ...buildBaseChallenge({
      id: `${levelConfig.id}-q-${questionIndex + 1}`,
      levelNumber: levelConfig.levelNumber,
      mode: "story-number-input",
      prompt: `${storyLines.join(" ")} How many ${theme.itemPlural} are there now?`,
      promptTh: `มี ${leftValue} แล้วเพิ่มอีก ${rightValue} รวมเป็นเท่าไร`,
      signature: `story-add:${theme.id}:${leftValue}:${rightValue}`,
      title: "Add the two groups",
      trackId: "story",
    }),
    storyKind: "addition",
    theme,
    storyLines,
    leftValue,
    rightValue,
    operator: "+",
    correctAnswer: answer,
    inputMaxLength: String(answer).length,
  };
}

function buildSubtractionStory(levelConfig, questionIndex, theme) {
  const leftValue = randomInt(12, 50);
  const rightValue = randomInt(2, leftValue - 1);
  const answer = leftValue - rightValue;
  const storyLines = [
    `${theme.characterName} had ${leftValue} ${pluralize(theme, leftValue)}.`,
    `${theme.characterName} used ${rightValue} ${pluralize(theme, rightValue)}.`,
  ];

  return {
    ...buildBaseChallenge({
      id: `${levelConfig.id}-q-${questionIndex + 1}`,
      levelNumber: levelConfig.levelNumber,
      mode: "story-number-input",
      prompt: `${storyLines.join(" ")} How many ${theme.itemPlural} are left?`,
      promptTh: `มี ${leftValue} ใช้ไป ${rightValue} เหลือเท่าไร`,
      signature: `story-subtract:${theme.id}:${leftValue}:${rightValue}`,
      title: "Find what is left",
      trackId: "story",
    }),
    storyKind: "subtraction",
    theme,
    storyLines,
    leftValue,
    rightValue,
    operator: "-",
    correctAnswer: answer,
    inputMaxLength: String(answer).length,
  };
}

function buildOperatorStory(levelConfig, questionIndex, theme) {
  const operator = questionIndex % 2 === 0 ? "+" : "-";
  const leftValue =
    operator === "+" ? randomInt(5, 35) : randomInt(15, 50);
  const rightValue =
    operator === "+"
      ? randomInt(2, Math.min(20, 80 - leftValue))
      : randomInt(2, leftValue - 1);
  const resultValue =
    operator === "+" ? leftValue + rightValue : leftValue - rightValue;
  const action = operator === "+" ? "received more" : "gave away";
  const actionTh = operator === "+" ? "ได้รับเพิ่ม" : "นำออกไป";
  const storyLines = [
    `${theme.characterName} started with ${leftValue} ${pluralize(theme, leftValue)}.`,
    `${theme.characterName} ${action} ${rightValue} ${pluralize(theme, rightValue)}.`,
  ];

  return {
    ...buildBaseChallenge({
      id: `${levelConfig.id}-q-${questionIndex + 1}`,
      levelNumber: levelConfig.levelNumber,
      mode: "story-operator-input",
      prompt: `${storyLines.join(" ")} Type the correct operation sign.`,
      promptTh: `เริ่มด้วย ${leftValue} แล้ว${actionTh} ${rightValue} พิมพ์เครื่องหมายที่ถูกต้อง`,
      signature: `story-operator:${theme.id}:${operator}:${leftValue}:${rightValue}`,
      title: "Complete the equation",
      trackId: "story",
    }),
    storyKind: "operator",
    theme,
    storyLines,
    leftValue,
    rightValue,
    resultValue,
    correctAnswer: operator,
    inputMaxLength: 1,
  };
}

function buildChainStory(levelConfig, questionIndex, theme) {
  const startValue = randomInt(12, 35);
  const firstOperator = questionIndex % 2 === 0 ? "+" : "-";
  const firstValue =
    firstOperator === "+"
      ? randomInt(3, 18)
      : randomInt(2, startValue - 1);
  const middleValue =
    firstOperator === "+"
      ? startValue + firstValue
      : startValue - firstValue;
  const secondOperator = firstOperator === "+" ? "-" : "+";
  const secondValue =
    secondOperator === "+"
      ? randomInt(2, Math.min(18, 100 - middleValue))
      : randomInt(1, Math.max(1, middleValue - 1));
  const answer =
    secondOperator === "+"
      ? middleValue + secondValue
      : middleValue - secondValue;
  const firstAction = firstOperator === "+" ? "collected" : "used";
  const secondAction = secondOperator === "+" ? "found" : "shared";
  const storyLines = [
    `${theme.characterName} started with ${startValue} ${pluralize(theme, startValue)}.`,
    `Then ${theme.characterName} ${firstAction} ${firstValue} ${pluralize(theme, firstValue)}.`,
    `Finally, ${theme.characterName} ${secondAction} ${secondValue} ${pluralize(theme, secondValue)}.`,
  ];

  return {
    ...buildBaseChallenge({
      id: `${levelConfig.id}-q-${questionIndex + 1}`,
      levelNumber: levelConfig.levelNumber,
      mode: "story-chain-input",
      prompt: `${storyLines.join(" ")} Type both signs and the final answer.`,
      promptTh: `พิมพ์เครื่องหมายทั้งสองช่อง แล้วหาคำตอบสุดท้าย`,
      signature: `story-chain:${theme.id}:${startValue}:${firstOperator}:${firstValue}:${secondOperator}:${secondValue}`,
      title: "Build the story equation",
      trackId: "story",
    }),
    storyKind: "chain",
    theme,
    storyLines,
    values: [startValue, firstValue, secondValue],
    correctOperators: [firstOperator, secondOperator],
    correctAnswer: answer,
    inputMaxLength: String(answer).length,
  };
}

function buildStoryChallenge(levelConfig, questionIndex) {
  const theme = getTheme(levelConfig.levelNumber, questionIndex);

  switch (levelConfig.levelNumber) {
    case 1:
      return buildDailyStory(levelConfig, questionIndex, theme);
    case 2:
      return buildAdditionStory(levelConfig, questionIndex, theme);
    case 3:
      return buildSubtractionStory(levelConfig, questionIndex, theme);
    case 4:
      return buildOperatorStory(levelConfig, questionIndex, theme);
    case 5:
    default:
      return buildChainStory(levelConfig, questionIndex, theme);
  }
}

function createLevel(trackId, levelNumber, title, themeLabel, description) {
  const surface = getSurfaceDefinition("math-genius", levelNumber, { trackId });

  return {
    id: `math-genius-${trackId}-level-${levelNumber}`,
    trackId,
    levelNumber,
    label: `Level ${levelNumber}`,
    title,
    themeLabel,
    description,
    mode: "math-genius",
    surfaceId: surface?.surfaceId,
    surfaceKind: surface?.kind,
    surfaceVariant: surface?.surfaceVariant,
    rendererKey: surface?.rendererKey,
    answerRepresentation: surface?.answerRepresentation,
    exerciseCount: EXERCISES_PER_LEVEL,
    wordCount: EXERCISES_PER_LEVEL,
    mapCaption: "10 problems",
  };
}

const columnLevels = [
  createLevel("column", 1, "Ones First", "Ones First · Mixed Add", "Add a one-digit number, mixing no-carry and carry practice."),
  createLevel("column", 2, "Two-Digit Carry", "Carry Every Time", "Add two-digit numbers and record the carry from the ones."),
  createLevel("column", 3, "Borrow from Tens", "Borrow Every Time", "Subtract two-digit numbers and show the tens-to-ones borrow."),
  createLevel("column", 4, "Carry to Tens", "Carry Every Time", "Add larger two-digit numbers and record the carry."),
  createLevel("column", 5, "Borrow + Carry Review", "Mixed Regrouping", "Switch between borrowing subtraction and carrying addition."),
];

const storyLevels = [
  createLevel("story", 1, "Hungry Worm Week", "Daily Totals", "Add the leaves collected across five days."),
  createLevel("story", 2, "More Supplies", "Addition Stories", "Read a short story and add two groups."),
  createLevel("story", 3, "What Is Left?", "Subtraction Stories", "Read a short story and find what remains."),
  createLevel("story", 4, "Choose the Sign", "Operation Stories", "Type the operation sign that matches the story."),
  createLevel("story", 5, "Story Master", "Equation Chains", "Complete two operation signs and the final total."),
];

export const mathGeniusTracks = [
  {
    id: "column",
    name: "Column Math",
    description: "Solve on paper: fill the ones first, then carry or borrow before tens.",
    descriptionTh: "ตั้งเหมือนบนกระดาษ ใส่หลักหน่วยก่อน แล้วทดหรือยืมก่อนหลักสิบ",
    buddyId: "soldier-sprout",
    accent: "blue",
    levels: columnLevels,
  },
  {
    id: "story",
    name: "Story Math",
    description: "Read playful stories and build the matching equation.",
    descriptionTh: "อ่านโจทย์เรื่องราว แล้วสร้างสมการให้ถูกต้อง",
    buddyId: "boat-bubble",
    accent: "green",
    levels: storyLevels,
  },
];

export function getMathGeniusTrack(trackId) {
  return (
    mathGeniusTracks.find((track) => track.id === trackId) ||
    mathGeniusTracks[0]
  );
}

export function isValidMathGeniusChallenge(challenge) {
  if (
    !challenge ||
    challenge.type !== "math-genius" ||
    !challenge.mode ||
    !challenge.signature
  ) {
    return false;
  }

  if (challenge.mode === "column-equation-input") {
    const expected =
      challenge.operator === "+"
        ? challenge.leftValue + challenge.rightValue
        : challenge.leftValue - challenge.rightValue;
    const steps = deriveColumnSteps({
      ...challenge,
      correctAnswer: challenge.correctAnswer,
    });
    const declaredRegrouping = challenge.regrouping || steps.regrouping;
    const hasMatchingRegrouping = declaredRegrouping === steps.regrouping;
    const metadata = challenge.columnSteps;
    const matchesWhenPresent = (actual, expectedValue) =>
      actual === undefined || actual === expectedValue;
    const hasMatchingMetadata =
      !metadata ||
      (matchesWhenPresent(metadata.regrouping, steps.regrouping) &&
        matchesWhenPresent(metadata.answer?.ones, steps.answer.ones) &&
        matchesWhenPresent(metadata.answer?.tens, steps.answer.tens) &&
        matchesWhenPresent(metadata.answer?.hundreds, steps.answer.hundreds) &&
        matchesWhenPresent(
          metadata.carry?.onesToTens,
          steps.carry.onesToTens,
        ) &&
        matchesWhenPresent(
          metadata.carry?.tensToHundreds,
          steps.carry.tensToHundreds,
        ) &&
        matchesWhenPresent(
          metadata.borrow?.originalTens,
          steps.borrow?.originalTens,
        ) &&
        matchesWhenPresent(
          metadata.borrow?.originalOnes,
          steps.borrow?.originalOnes,
        ) &&
        matchesWhenPresent(
          metadata.borrow?.adjustedTens,
          steps.borrow?.adjustedTens,
        ) &&
        matchesWhenPresent(
          metadata.borrow?.adjustedOnes,
          steps.borrow?.adjustedOnes,
        ) &&
        matchesWhenPresent(
          metadata.inputSequence === undefined
            ? undefined
            : JSON.stringify(metadata.inputSequence),
          JSON.stringify(steps.inputSequence),
        ));

    return (
      ["+", "-"].includes(challenge.operator) &&
      expected === challenge.correctAnswer &&
      expected >= 0 &&
      expected <= 100 &&
      hasMatchingRegrouping &&
      hasMatchingMetadata
    );
  }

  if (challenge.mode === "story-operator-input") {
    return (
      ["+", "-"].includes(challenge.correctAnswer) &&
      Number.isFinite(challenge.resultValue)
    );
  }

  if (challenge.mode === "story-chain-input") {
    const [leftValue, firstValue, secondValue] = challenge.values;
    const [firstOperator, secondOperator] = challenge.correctOperators;
    const middleValue =
      firstOperator === "+"
        ? leftValue + firstValue
        : leftValue - firstValue;
    const expected =
      secondOperator === "+"
        ? middleValue + secondValue
        : middleValue - secondValue;

    return (
      expected === challenge.correctAnswer &&
      expected >= 0 &&
      expected <= 100
    );
  }

  return (
    challenge.mode === "story-number-input" &&
    Number.isFinite(challenge.correctAnswer) &&
    challenge.correctAnswer >= 0 &&
    challenge.correctAnswer <= 100
  );
}

export function generateMathGeniusSession(trackId, levelConfig) {
  const exercises = [];
  const signatures = new Set();
  const usedColumnPairs = new Set();
  let attempts = 0;

  while (
    exercises.length < EXERCISES_PER_LEVEL &&
    attempts < EXERCISES_PER_LEVEL * 80
  ) {
    const questionIndex = exercises.length;
    const challenge =
      trackId === "story"
        ? buildStoryChallenge(levelConfig, questionIndex)
        : buildColumnChallenge(levelConfig, questionIndex, usedColumnPairs);

    attempts += 1;

    if (
      signatures.has(challenge.signature) ||
      !isValidMathGeniusChallenge(challenge)
    ) {
      continue;
    }

    signatures.add(challenge.signature);
    const surface = getSurfaceDefinition("math-genius", levelConfig.levelNumber, {
      trackId,
    });
    exercises.push({
      ...challenge,
      surfaceId: levelConfig.surfaceId || surface?.surfaceId,
      surfaceKind: levelConfig.surfaceKind || surface?.kind,
      surfaceVariant: levelConfig.surfaceVariant || surface?.surfaceVariant,
      rendererKey: levelConfig.rendererKey || surface?.rendererKey,
      answerRepresentation:
        levelConfig.answerRepresentation || surface?.answerRepresentation,
    });
  }

  return {
    id: `math-genius-${trackId}-${levelConfig.levelNumber}-${Date.now()}`,
    trackId,
    levelNumber: levelConfig.levelNumber,
    exerciseCount: EXERCISES_PER_LEVEL,
    exercises,
  };
}

export const mathGeniusSubject = {
  id: "math-genius",
  name: "Math Genius",
  category: "exercise",
  icon: "🧠",
  description: "Workbook-style column math and playful story problems.",
  contentMode: "math-genius",
  tracks: mathGeniusTracks,
  levels: mathGeniusTracks.flatMap((track) => track.levels),
  words: [],
};

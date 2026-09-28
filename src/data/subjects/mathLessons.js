import { animalsSubject } from "./animals.js";
import { fruitsVegetablesSubject } from "./fruitsVegetables.js";
import { schoolThingsSubject } from "./schoolThings.js";
import { getSurfaceDefinition } from "../missionSurfaces.js";

function createReviewWord(id, word, emoji, translation) {
  return {
    id: `math-lessons-${id}`,
    word,
    emoji,
    phonics: word.toLowerCase(),
    pronunciation: { guide: word.toLowerCase(), ipa: "" },
    translation,
  };
}

const mathLessonWords = [
  createReviewWord("zero", "Zero", "0", "ศูนย์"),
  createReviewWord("one", "One", "1", "หนึ่ง"),
  createReviewWord("two", "Two", "2", "สอง"),
  createReviewWord("three", "Three", "3", "สาม"),
  createReviewWord("four", "Four", "4", "สี่"),
  createReviewWord("five", "Five", "5", "ห้า"),
  createReviewWord("six", "Six", "6", "หก"),
  createReviewWord("seven", "Seven", "7", "เจ็ด"),
  createReviewWord("eight", "Eight", "8", "แปด"),
  createReviewWord("nine", "Nine", "9", "เก้า"),
  createReviewWord("ten", "Ten", "10", "สิบ"),
  createReviewWord("even", "Even", "2", "เลขคู่"),
  createReviewWord("odd", "Odd", "1", "เลขคี่"),
  createReviewWord("greater-than", "Greater Than", ">", "มากกว่า"),
  createReviewWord("less-than", "Less Than", "<", "น้อยกว่า"),
  createReviewWord("equal", "Equal", "=", "เท่ากับ"),
  createReviewWord("add", "Add", "+", "บวก"),
  createReviewWord("subtract", "Subtract", "-", "ลบ"),
  createReviewWord("before", "Before", "←", "ก่อนหน้า"),
  createReviewWord("after", "After", "→", "ถัดไป"),
  createReviewWord("biggest", "Biggest", "⬆", "มากที่สุด"),
  createReviewWord("smallest", "Smallest", "⬇", "น้อยที่สุด"),
  createReviewWord("true", "True", "✓", "ถูก"),
  createReviewWord("false", "False", "✗", "ผิด"),
  createReviewWord("tens", "Tens", "10", "หลักสิบ"),
  createReviewWord("ones", "Ones", "1", "หลักหน่วย"),
  createReviewWord("circle", "Circle", "○", "วงกลม"),
  createReviewWord("triangle", "Triangle", "△", "สามเหลี่ยม"),
  createReviewWord("square", "Square", "□", "สี่เหลี่ยมจัตุรัส"),
  createReviewWord("rectangle", "Rectangle", "▭", "สี่เหลี่ยมผืนผ้า"),
  createReviewWord("oval", "Oval", "⬭", "วงรี"),
  createReviewWord("diamond", "Diamond", "◇", "สี่เหลี่ยมข้าวหลามตัด"),
];

function getReviewWords(ids) {
  return mathLessonWords.filter((word) => ids.includes(word.id.replace("math-lessons-", "")));
}

function buildSourceLookup(subject) {
  return new Map(subject.words.map((word) => [word.id, word]));
}

function toVisualItem(sourceWord, poolId) {
  return {
    id: `${poolId}-${sourceWord.id}`,
    word: sourceWord.word,
    translation: sourceWord.translation || "",
    image: sourceWord.image,
    poolId,
  };
}

function buildVisualPool(subject, ids, poolId) {
  const lookup = buildSourceLookup(subject);

  return ids
    .map((id) => lookup.get(id))
    .filter(Boolean)
    .map((word) => toVisualItem(word, poolId));
}

const animalsPool = buildVisualPool(
  animalsSubject,
  ["cat", "dog", "cow", "pig", "rabbit", "sheep", "duck", "fish", "bird", "elephant"],
  "animals",
);

const fruitsPool = buildVisualPool(
  fruitsVegetablesSubject,
  ["apple", "banana", "orange", "grape", "mango", "carrot", "tomato", "corn", "broccoli", "watermelon"],
  "fruits",
);

const schoolPool = buildVisualPool(
  schoolThingsSubject,
  ["book", "pen", "pencil", "bag", "chair", "desk", "ruler", "notebook", "scissors", "crayon"],
  "school",
);

const visualPools = {
  animals: animalsPool,
  fruits: fruitsPool,
  school: schoolPool,
  mixed: [...animalsPool, ...fruitsPool, ...schoolPool],
};

function shuffle(items) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }

  return nextItems;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne(items) {
  return items[randomInt(0, items.length - 1)];
}

function pickWeightedMode(modePool) {
  const totalWeight = modePool.reduce((sum, item) => sum + (item.weight ?? 1), 0);
  let cursor = Math.random() * totalWeight;

  for (const item of modePool) {
    cursor -= item.weight ?? 1;

    if (cursor <= 0) {
      return item.mode;
    }
  }

  return modePool[modePool.length - 1].mode;
}

function buildNumberChoices(correctAnswer, minValue, maxValue, size = 4) {
  const pool = [];

  for (let value = minValue; value <= maxValue; value += 1) {
    if (value !== correctAnswer) {
      pool.push(value);
    }
  }

  const distractors = shuffle(pool).slice(0, Math.max(size - 1, 0));
  return shuffle([correctAnswer, ...distractors]);
}

function hasUniqueChoices(choices = []) {
  return new Set(choices.map((choice) => String(choice))).size === choices.length;
}

function getVisualPool(setBlueprint = {}) {
  const poolKeys = Array.isArray(setBlueprint.visualPoolKeys)
    ? setBlueprint.visualPoolKeys
    : [setBlueprint.visualPoolKey || "mixed"];
  const resolvedPool = poolKeys.flatMap((key) => visualPools[key] || []);

  return resolvedPool.length > 0 ? resolvedPool : visualPools.mixed;
}

function pickVisualItem(setBlueprint = {}) {
  return pickOne(getVisualPool(setBlueprint));
}

function buildSceneItems(count, visualItem) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${visualItem.id}-${index + 1}`,
    image: visualItem.image,
    word: visualItem.word,
    translation: visualItem.translation,
  }));
}

function sequenceFromVariant(numberRange, variant = "middle") {
  const maxStart = Math.max(numberRange.min, numberRange.max - 3);
  const ascendingStart = randomInt(numberRange.min, maxStart);
  const ascending = [
    ascendingStart,
    ascendingStart + 1,
    ascendingStart + 2,
    ascendingStart + 3,
  ];

  if (variant === "backward") {
    const descendingStart = randomInt(numberRange.min + 3, numberRange.max);
    return [
      descendingStart,
      descendingStart - 1,
      descendingStart - 2,
      descendingStart - 3,
    ];
  }

  return ascending;
}

function pickComparisonPair(numberRange, relation) {
  if (relation === "=") {
    const value = randomInt(numberRange.min, numberRange.max);
    return { leftValue: value, rightValue: value };
  }

  let leftValue = randomInt(numberRange.min, numberRange.max);
  let rightValue = randomInt(numberRange.min, numberRange.max);

  while (
    (relation === ">" && leftValue <= rightValue) ||
    (relation === "<" && leftValue >= rightValue)
  ) {
    leftValue = randomInt(numberRange.min, numberRange.max);
    rightValue = randomInt(numberRange.min, numberRange.max);
  }

  return { leftValue, rightValue };
}

function buildCompareOperand(value, preferredType, sceneMax, setBlueprint) {
  if (preferredType === "scene" && value <= sceneMax) {
    const visualItem = pickVisualItem(setBlueprint);

    return {
      type: "scene",
      value,
      label: visualItem.word,
      items: buildSceneItems(value, visualItem),
    };
  }

  return {
    type: "number",
    value,
  };
}

function buildEquationValues(config, operator) {
  const { numberRange, answerRange, operandMin = 0, operandMax = numberRange.max } =
    config.generatorRules;

  if (config.generatorRules.fullTwoDigit) {
    if (operator === "+") {
      const leftValue = randomInt(10, 89);
      const rightValue = randomInt(10, 99 - leftValue);

      return {
        leftValue,
        rightValue,
        answer: leftValue + rightValue,
      };
    }

    const leftValue = randomInt(20, 99);
    const rightValue = randomInt(10, leftValue);

    return {
      leftValue,
      rightValue,
      answer: leftValue - rightValue,
    };
  }

  if (operator === "+") {
    const leftValue = randomInt(
      Math.max(numberRange.min, operandMin),
      Math.min(operandMax, answerRange.max),
    );
    const maxRight = Math.min(operandMax, answerRange.max - leftValue);
    const rightValue = randomInt(Math.max(operandMin, 0), Math.max(maxRight, 0));

    return {
      leftValue,
      rightValue,
      answer: leftValue + rightValue,
    };
  }

  const leftValue = randomInt(
    Math.max(numberRange.min, operandMin),
    Math.min(operandMax, answerRange.max),
  );
  const rightValue = randomInt(0, leftValue);

  return {
    leftValue,
    rightValue,
    answer: leftValue - rightValue,
  };
}

export function isValidMathLessonChallenge(challenge) {
  if (!challenge || challenge.type !== "math-lesson" || !challenge.mode) {
    return false;
  }

  switch (challenge.mode) {
    case "count-select":
      return (
        Array.isArray(challenge.sceneItems) &&
        challenge.sceneItems.length > 0 &&
        Array.isArray(challenge.choices) &&
        challenge.choices.length === 4 &&
        hasUniqueChoices(challenge.choices) &&
        challenge.choices.includes(challenge.correctAnswer)
      );

    case "number-to-scene":
      return (
        Number.isFinite(challenge.displayValue) &&
        Array.isArray(challenge.choices) &&
        challenge.choices.length === 4 &&
        challenge.choices.every(
          (choice) =>
            choice &&
            typeof choice.id === "string" &&
            Number.isFinite(choice.value) &&
            Array.isArray(choice.items),
        ) &&
        challenge.choices.some((choice) => choice.id === challenge.correctAnswer)
      );

    case "number-sequence": {
      const blankCount = Array.isArray(challenge.sequence)
        ? challenge.sequence.filter((value) => value === null).length
        : 0;

      return (
        Array.isArray(challenge.sequence) &&
        challenge.sequence.length === 4 &&
        blankCount === 1 &&
        Array.isArray(challenge.choices) &&
        challenge.choices.length === 4 &&
        hasUniqueChoices(challenge.choices) &&
        challenge.choices.includes(challenge.correctAnswer)
      );
    }

    case "before-after-choice":
      return (
        Number.isFinite(challenge.referenceValue) &&
        ["before", "after"].includes(challenge.direction) &&
        Array.isArray(challenge.choices) &&
        challenge.choices.length === 4 &&
        hasUniqueChoices(challenge.choices) &&
        challenge.choices.includes(challenge.correctAnswer)
      );

    case "number-order-pick":
      return (
        ["smallest", "biggest"].includes(challenge.orderGoal) &&
        Array.isArray(challenge.choices) &&
        challenge.choices.length === 4 &&
        hasUniqueChoices(challenge.choices) &&
        challenge.choices.includes(challenge.correctAnswer)
      );

    case "parity-pick":
      return (
        ["Even", "Odd"].includes(challenge.correctAnswer) &&
        Array.isArray(challenge.choices) &&
        challenge.choices.length === 2 &&
        hasUniqueChoices(challenge.choices) &&
        challenge.choices.includes(challenge.correctAnswer)
      );

    case "parity-target-pick":
      return (
        ["Even", "Odd"].includes(challenge.targetParity) &&
        Array.isArray(challenge.choices) &&
        challenge.choices.length === 4 &&
        hasUniqueChoices(challenge.choices) &&
        challenge.choices.includes(challenge.correctAnswer)
      );

    case "parity-true-false":
      return (
        Number.isFinite(challenge.displayValue) &&
        ["Even", "Odd"].includes(challenge.shownParity) &&
        Array.isArray(challenge.choices) &&
        challenge.choices.length === 2 &&
        hasUniqueChoices(challenge.choices) &&
        challenge.choices.includes(challenge.correctAnswer)
      );

    case "compare-pick":
      return (
        [">", "<", "="].includes(challenge.correctAnswer) &&
        Array.isArray(challenge.choices) &&
        challenge.choices.length === 3 &&
        hasUniqueChoices(challenge.choices) &&
        challenge.choices.includes(challenge.correctAnswer) &&
        challenge.compareLeft &&
        challenge.compareRight
      );

    case "equation-choice":
      return (
        ["+", "-"].includes(challenge.operator) &&
        Number.isFinite(challenge.leftValue) &&
        Number.isFinite(challenge.rightValue) &&
        Array.isArray(challenge.choices) &&
        challenge.choices.length === 4 &&
        hasUniqueChoices(challenge.choices) &&
        challenge.choices.includes(challenge.correctAnswer)
      );

    case "scene-equation-choice":
      return (
        ["+", "-"].includes(challenge.operator) &&
        Array.isArray(challenge.leftItems) &&
        challenge.leftItems.length > 0 &&
        Array.isArray(challenge.rightItems) &&
        challenge.rightItems.length > 0 &&
        Array.isArray(challenge.choices) &&
        challenge.choices.length === 4 &&
        hasUniqueChoices(challenge.choices) &&
        challenge.choices.includes(challenge.correctAnswer)
      );

    case "equation-input":
      return (
        ["+", "-"].includes(challenge.operator) &&
        Number.isFinite(challenge.leftValue) &&
        Number.isFinite(challenge.rightValue) &&
        Number.isFinite(challenge.correctAnswer) &&
        Number.isInteger(challenge.inputMaxLength) &&
        challenge.inputMaxLength >= String(challenge.correctAnswer).length
      );

    case "true-false-equation":
      return (
        ["+", "-"].includes(challenge.operator) &&
        Number.isFinite(challenge.leftValue) &&
        Number.isFinite(challenge.rightValue) &&
        Number.isFinite(challenge.shownAnswer) &&
        Array.isArray(challenge.choices) &&
        challenge.choices.length === 2 &&
        hasUniqueChoices(challenge.choices) &&
        challenge.choices.includes(challenge.correctAnswer)
      );

    case "missing-part":
      return (
        ["+", "-"].includes(challenge.operator) &&
        Number.isFinite(challenge.resultValue) &&
        ["left", "right"].includes(challenge.missingSide) &&
        Array.isArray(challenge.choices) &&
        challenge.choices.length === 4 &&
        hasUniqueChoices(challenge.choices) &&
        challenge.choices.includes(challenge.correctAnswer)
      );

    case "choose-operator":
      return (
        Number.isFinite(challenge.leftValue) &&
        Number.isFinite(challenge.rightValue) &&
        Number.isFinite(challenge.resultValue) &&
        Array.isArray(challenge.choices) &&
        challenge.choices.includes(challenge.correctAnswer)
      );

    case "place-value-choice":
      return (
        Number.isInteger(challenge.displayValue) &&
        challenge.displayValue >= 10 &&
        ["tens", "ones"].includes(challenge.placeTarget) &&
        Array.isArray(challenge.choices) &&
        challenge.choices.length === 4 &&
        hasUniqueChoices(challenge.choices) &&
        challenge.choices.includes(challenge.correctAnswer)
      );

    case "shape-pick":
      return (
        typeof challenge.shapeGoal === "string" &&
        Array.isArray(challenge.choices) &&
        challenge.choices.length === 4 &&
        hasUniqueChoices(challenge.choices) &&
        challenge.choices.includes(challenge.correctAnswer)
      );

    default:
      return false;
  }
}

function buildCountSelectChallenge(config, id, setBlueprint = {}) {
  const countMax = Math.min(
    config.generatorRules.countSceneMax ?? config.generatorRules.numberRange.max,
    config.generatorRules.numberRange.max,
  );
  const count = randomInt(config.generatorRules.numberRange.min, countMax);
  const visualItem = pickVisualItem(setBlueprint);

  return {
    id,
    type: "math-lesson",
    mode: "count-select",
    prompt: "Count the pictures. Choose the correct number.",
    promptTh: "นับรูปภาพ แล้วเลือกตัวเลขที่ถูกต้อง",
    title: "Count and choose",
    sceneItems: buildSceneItems(count, visualItem),
    sceneLabel: visualItem.word,
    choices: buildNumberChoices(
      count,
      config.generatorRules.numberRange.min,
      config.generatorRules.numberRange.max,
    ),
    correctAnswer: count,
    signature: `count:${count}:${visualItem.id}`,
  };
}

function buildNumberToSceneChallenge(config, id, setBlueprint = {}) {
  const countMax = Math.min(
    config.generatorRules.countSceneMax ?? config.generatorRules.numberRange.max,
    config.generatorRules.numberRange.max,
  );
  const correctCount = randomInt(
    config.generatorRules.numberRange.min,
    countMax,
  );
  const numberChoices = buildNumberChoices(
    correctCount,
    config.generatorRules.numberRange.min,
    countMax,
  );

  const choices = numberChoices.map((count, index) => {
    const visualItem = pickVisualItem(setBlueprint);

    return {
      id: `${id}-scene-${index + 1}`,
      value: count,
      label: visualItem.word,
      items: buildSceneItems(count, visualItem),
    };
  });

  const correctChoice = choices.find((choice) => choice.value === correctCount);

  return {
    id,
    type: "math-lesson",
    mode: "number-to-scene",
    prompt: "Look at the number. Tap the matching picture group.",
    promptTh: "ดูตัวเลขแล้วแตะกลุ่มรูปที่ตรงกัน",
    title: "Match number to picture",
    displayValue: correctCount,
    choices,
    correctAnswer: correctChoice?.id || "",
    signature: `number-to-scene:${correctCount}:${choices.map((choice) => choice.value).join("-")}`,
  };
}

function buildNumberSequenceChallenge(config, id, setBlueprint = {}) {
  const variants = setBlueprint.sequenceVariants || ["middle", "first", "last", "backward"];
  const variant = pickOne(variants);
  const values = sequenceFromVariant(config.generatorRules.numberRange, variant);
  const missingIndexMap = {
    middle: 1,
    first: 0,
    last: 3,
    backward: 2,
  };
  const missingIndex = missingIndexMap[variant] ?? 1;
  const correctAnswer = values[missingIndex];
  const sequence = values.map((value, index) => (index === missingIndex ? null : value));

  return {
    id,
    type: "math-lesson",
    mode: "number-sequence",
    prompt: variant === "backward"
      ? "Fill the missing number in the backward line."
      : "Fill the missing number in the number line.",
    promptTh: "เติมตัวเลขที่หายไป",
    title: variant === "backward" ? "Count backward" : "Find the missing number",
    sequence,
    choices: buildNumberChoices(
      correctAnswer,
      config.generatorRules.numberRange.min,
      config.generatorRules.numberRange.max,
    ),
    correctAnswer,
    signature: `sequence:${variant}:${values.join("-")}`,
  };
}

function buildBeforeAfterChallenge(config, id) {
  const { numberRange } = config.generatorRules;
  const direction = Math.random() < 0.5 ? "before" : "after";
  const minReference = direction === "before" ? numberRange.min + 1 : numberRange.min;
  const maxReference = direction === "after" ? numberRange.max - 1 : numberRange.max;
  const referenceValue = randomInt(minReference, maxReference);
  const correctAnswer = direction === "before" ? referenceValue - 1 : referenceValue + 1;
  const choiceMin = Math.max(numberRange.min, correctAnswer - 3);
  const choiceMax = Math.min(numberRange.max, correctAnswer + 3);

  return {
    id,
    type: "math-lesson",
    mode: "before-after-choice",
    prompt: direction === "before" ? "Which number comes before?" : "Which number comes after?",
    promptTh: direction === "before" ? "ตัวเลขไหนอยู่ก่อนหน้า" : "ตัวเลขไหนอยู่ถัดไป",
    title: direction === "before" ? "Find the number before" : "Find the number after",
    direction,
    referenceValue,
    choices: buildNumberChoices(correctAnswer, choiceMin, choiceMax),
    correctAnswer,
    signature: `before-after:${direction}:${referenceValue}`,
  };
}

function buildNumberOrderChallenge(config, id) {
  const { numberRange } = config.generatorRules;
  const orderGoal = Math.random() < 0.5 ? "smallest" : "biggest";
  const values = shuffle(
    Array.from(
      new Set(
        Array.from({ length: 8 }, () => randomInt(numberRange.min, numberRange.max)),
      ),
    ),
  ).slice(0, 4);

  while (values.length < 4) {
    const nextValue = randomInt(numberRange.min, numberRange.max);
    if (!values.includes(nextValue)) {
      values.push(nextValue);
    }
  }

  const correctAnswer =
    orderGoal === "smallest" ? Math.min(...values) : Math.max(...values);

  return {
    id,
    type: "math-lesson",
    mode: "number-order-pick",
    prompt: orderGoal === "smallest" ? "Tap the smallest number." : "Tap the biggest number.",
    promptTh: orderGoal === "smallest" ? "แตะตัวเลขที่น้อยที่สุด" : "แตะตัวเลขที่มากที่สุด",
    title: orderGoal === "smallest" ? "Find the smallest number" : "Find the biggest number",
    orderGoal,
    choices: shuffle(values),
    correctAnswer,
    signature: `number-order:${orderGoal}:${values.slice().sort((a, b) => a - b).join("-")}`,
  };
}

function buildParityChallenge(config, id, setBlueprint = {}) {
  const value = randomInt(
    config.generatorRules.numberRange.min,
    config.generatorRules.numberRange.max,
  );
  const sceneModes = setBlueprint.displayModes || ["scene", "number"];
  const preferredDisplay = pickOne(sceneModes);
  const useScene = preferredDisplay === "scene" && value <= (config.generatorRules.sceneMax ?? 10);
  const visualItem = pickVisualItem(setBlueprint);
  const correctAnswer = value % 2 === 0 ? "Even" : "Odd";

  return {
    id,
    type: "math-lesson",
    mode: "parity-pick",
    prompt: useScene ? "Count the pictures. Is the number even or odd?" : "Is this number even or odd?",
    promptTh: useScene ? "นับรูปแล้วเลือกเลขคู่หรือเลขคี่" : "เลือกเลขคู่หรือเลขคี่",
    title: "Even or odd",
    displayValue: value,
    displayMode: useScene ? "scene" : "number",
    sceneItems: useScene ? buildSceneItems(value, visualItem) : [],
    sceneLabel: visualItem.word,
    choices: ["Even", "Odd"],
    correctAnswer,
    signature: `parity:${value}:${correctAnswer}:${useScene ? visualItem.id : "number"}`,
  };
}

function buildParityTargetChallenge(config, id) {
  const { numberRange } = config.generatorRules;
  const targetParity = Math.random() < 0.5 ? "Even" : "Odd";
  const matchingNumbers = [];
  const nonMatchingNumbers = [];

  for (let value = numberRange.min; value <= numberRange.max; value += 1) {
    const parity = value % 2 === 0 ? "Even" : "Odd";
    if (parity === targetParity) {
      matchingNumbers.push(value);
    } else {
      nonMatchingNumbers.push(value);
    }
  }

  const correctAnswer = pickOne(matchingNumbers);
  const distractors = shuffle(nonMatchingNumbers).slice(0, 3);

  return {
    id,
    type: "math-lesson",
    mode: "parity-target-pick",
    prompt: targetParity === "Even" ? "Tap the even number." : "Tap the odd number.",
    promptTh: targetParity === "Even" ? "แตะเลขคู่" : "แตะเลขคี่",
    title: targetParity === "Even" ? "Find an even number" : "Find an odd number",
    targetParity,
    choices: shuffle([correctAnswer, ...distractors]),
    correctAnswer,
    signature: `parity-target:${targetParity}:${correctAnswer}:${distractors.join("-")}`,
  };
}

function buildParityTrueFalseChallenge(config, id) {
  const value = randomInt(
    config.generatorRules.numberRange.min,
    config.generatorRules.numberRange.max,
  );
  const actualParity = value % 2 === 0 ? "Even" : "Odd";
  const shownParity = Math.random() < 0.5 ? actualParity : actualParity === "Even" ? "Odd" : "Even";

  return {
    id,
    type: "math-lesson",
    mode: "parity-true-false",
    prompt: "Is the parity sentence true or false?",
    promptTh: "ประโยคนี้ถูกหรือผิด",
    title: "True or false",
    displayValue: value,
    shownParity,
    choices: ["True", "False"],
    correctAnswer: shownParity === actualParity ? "True" : "False",
    signature: `parity-true-false:${value}:${shownParity}`,
  };
}

function buildCompareChallenge(config, id, setBlueprint = {}) {
  const { numberRange, sceneMax = 10, allowSceneCompare = true } = config.generatorRules;
  const relation = pickOne(["<", ">", "=", "<", ">"]);
  const { leftValue, rightValue } = pickComparisonPair(numberRange, relation);
  const displayPatterns = allowSceneCompare
    ? setBlueprint.comparePatterns || ["number-number", "scene-number", "scene-scene"]
    : ["number-number"];
  const displayPattern = pickOne(displayPatterns);
  const correctAnswer =
    leftValue > rightValue ? ">" : leftValue < rightValue ? "<" : "=";

  return {
    id,
    type: "math-lesson",
    mode: "compare-pick",
    prompt: "Compare the two sides. Choose the correct sign.",
    promptTh: "เปรียบเทียบสองฝั่งแล้วเลือกเครื่องหมาย",
    title: "Compare the numbers",
    compareLeft: buildCompareOperand(
      leftValue,
      displayPattern.startsWith("scene") ? "scene" : "number",
      sceneMax,
      setBlueprint,
    ),
    compareRight: buildCompareOperand(
      rightValue,
      displayPattern.endsWith("scene") ? "scene" : "number",
      sceneMax,
      setBlueprint,
    ),
    choices: [">", "<", "="],
    correctAnswer,
    signature: `compare:${leftValue}:${rightValue}:${displayPattern}`,
  };
}

function buildEquationChoiceChallenge(config, id) {
  const operator = pickOne(config.generatorRules.operatorPool);
  const { leftValue, rightValue, answer } = buildEquationValues(config, operator);

  return {
    id,
    type: "math-lesson",
    mode: "equation-choice",
    prompt: operator === "+" ? "Solve the addition." : "Solve the subtraction.",
    promptTh: operator === "+" ? "หาคำตอบของการบวก" : "หาคำตอบของการลบ",
    title: operator === "+" ? "Add the numbers" : "Take away the numbers",
    leftValue,
    rightValue,
    operator,
    choices: buildNumberChoices(
      answer,
      config.generatorRules.answerRange.min,
      config.generatorRules.answerRange.max,
    ),
    correctAnswer: answer,
    signature: `equation-choice:${operator}:${leftValue}:${rightValue}:${answer}`,
  };
}

function buildSceneEquationChoiceChallenge(config, id, setBlueprint = {}) {
  const operator = pickOne(config.generatorRules.operatorPool);
  const visualItem = pickVisualItem(setBlueprint);
  const { leftValue, rightValue, answer } = buildEquationValues(config, operator);
  const displayLeft = operator === "+" ? leftValue : leftValue;
  const displayRight = operator === "+" ? rightValue : rightValue;

  return {
    id,
    type: "math-lesson",
    mode: "scene-equation-choice",
    prompt: operator === "+"
      ? "Count both picture groups. Choose the total."
      : "Count the start group and the group to take away. Choose what is left.",
    promptTh: operator === "+"
      ? "นับทั้งสองกลุ่มแล้วเลือกผลรวม"
      : "นับกลุ่มเริ่มต้นและกลุ่มที่เอาออก แล้วเลือกคำตอบที่เหลือ",
    title: operator === "+" ? "Add picture groups" : "Take away picture groups",
    operator,
    leftValue,
    rightValue,
    leftLabel: visualItem.word,
    rightLabel: operator === "+" ? visualItem.word : `${visualItem.word} to take away`,
    leftItems: buildSceneItems(displayLeft, visualItem),
    rightItems: buildSceneItems(displayRight, visualItem),
    choices: buildNumberChoices(
      answer,
      config.generatorRules.answerRange.min,
      config.generatorRules.answerRange.max,
    ),
    correctAnswer: answer,
    signature: `scene-equation:${operator}:${visualItem.id}:${leftValue}:${rightValue}:${answer}`,
  };
}

function buildEquationInputChallenge(config, id) {
  const operator = pickOne(config.generatorRules.operatorPool);
  const { leftValue, rightValue, answer } = buildEquationValues(config, operator);

  return {
    id,
    type: "math-lesson",
    mode: "equation-input",
    prompt: operator === "+" ? "Type the answer for the addition." : "Type the answer for the subtraction.",
    promptTh: operator === "+" ? "พิมพ์คำตอบของการบวก" : "พิมพ์คำตอบของการลบ",
    title: operator === "+" ? "Type the total" : "Type what is left",
    leftValue,
    rightValue,
    operator,
    correctAnswer: answer,
    inputMaxLength: Math.max(String(answer).length, 1),
    signature: `equation-input:${operator}:${leftValue}:${rightValue}:${answer}`,
  };
}

function buildTrueFalseEquationChallenge(config, id) {
  const operator = pickOne(config.generatorRules.operatorPool);
  const { leftValue, rightValue, answer } = buildEquationValues(config, operator);
  const showCorrect = Math.random() < 0.5;
  let shownAnswer = answer;

  if (!showCorrect) {
    const distractors = buildNumberChoices(
      answer,
      config.generatorRules.answerRange.min,
      config.generatorRules.answerRange.max,
      4,
    ).filter((value) => value !== answer);
    shownAnswer = distractors[0] ?? answer + 1;
  }

  return {
    id,
    type: "math-lesson",
    mode: "true-false-equation",
    prompt: "Is this equation true or false?",
    promptTh: "สมการนี้ถูกหรือผิด",
    title: "True or false",
    leftValue,
    rightValue,
    shownAnswer,
    operator,
    choices: ["True", "False"],
    correctAnswer: showCorrect ? "True" : "False",
    signature: `true-false:${operator}:${leftValue}:${rightValue}:${shownAnswer}`,
  };
}

function buildMissingPartChallenge(config, id) {
  const operator = pickOne(config.generatorRules.operatorPool);
  const { leftValue, rightValue, answer } = buildEquationValues(config, operator);
  const hideLeft = Math.random() < 0.5;
  const correctAnswer = hideLeft ? leftValue : rightValue;
  const maxValue = Math.max(
    config.generatorRules.answerRange.max,
    config.generatorRules.numberRange.max,
  );

  return {
    id,
    type: "math-lesson",
    mode: "missing-part",
    prompt: operator === "+"
      ? "Which number is missing in the addition?"
      : "Which number is missing in the subtraction?",
    promptTh: operator === "+"
      ? "ตัวเลขใดหายไปในการบวก"
      : "ตัวเลขใดหายไปในการลบ",
    title: "Find the missing part",
    leftValue: hideLeft ? null : leftValue,
    rightValue: hideLeft ? rightValue : null,
    resultValue: answer,
    operator,
    missingSide: hideLeft ? "left" : "right",
    choices: buildNumberChoices(
      correctAnswer,
      config.generatorRules.numberRange.min,
      maxValue,
    ),
    correctAnswer,
    signature: `missing-part:${operator}:${leftValue}:${rightValue}:${answer}:${hideLeft ? "left" : "right"}`,
  };
}

function buildChooseOperatorChallenge(config, id) {
  const operators = config.generatorRules.operatorPool.includes("-") ? ["+", "-"] : ["+"];
  const correctOperator = pickOne(operators);
  const { leftValue, rightValue, answer } = buildEquationValues(
    { ...config, generatorRules: { ...config.generatorRules, operatorPool: [correctOperator] } },
    correctOperator,
  );

  return {
    id,
    type: "math-lesson",
    mode: "choose-operator",
    prompt: "Choose the correct sign.",
    promptTh: "เลือกเครื่องหมายที่ถูกต้อง",
    title: "Choose the sign",
    leftValue,
    rightValue,
    resultValue: answer,
    choices: ["+", "-"],
    correctAnswer: correctOperator,
    signature: `choose-operator:${leftValue}:${rightValue}:${answer}:${correctOperator}`,
  };
}

function buildPlaceValueChallenge(config, id, setBlueprint = {}) {
  const displayValue = randomInt(10, 99);
  const placeTargets = setBlueprint.placeTargets || ["tens", "ones"];
  const placeTarget = pickOne(placeTargets);
  const correctAnswer =
    placeTarget === "tens"
      ? Math.floor(displayValue / 10)
      : displayValue % 10;

  return {
    id,
    type: "math-lesson",
    mode: "place-value-choice",
    prompt: `How many ${placeTarget} are in ${displayValue}?`,
    promptTh:
      placeTarget === "tens"
        ? `${displayValue} มีหลักสิบเท่าไร`
        : `${displayValue} มีหลักหน่วยเท่าไร`,
    title: "Place Value",
    displayValue,
    placeTarget,
    tensDigit: Math.floor(displayValue / 10),
    onesDigit: displayValue % 10,
    choices: buildNumberChoices(correctAnswer, 0, 9),
    correctAnswer,
    signature: `place-value:${displayValue}:${placeTarget}`,
  };
}

const shapeNames = ["circle", "triangle", "square", "rectangle", "oval", "diamond"];

function buildShapeChallenge(config, id, setBlueprint = {}) {
  const availableShapes = setBlueprint.shapePool || shapeNames;
  const shapeGoal = pickOne(availableShapes);
  const distractors = shuffle(shapeNames.filter((shape) => shape !== shapeGoal)).slice(0, 3);
  const choices = shuffle([shapeGoal, ...distractors]);

  return {
    id,
    type: "math-lesson",
    mode: "shape-pick",
    prompt: `Tap the ${shapeGoal}.`,
    promptTh: `เลือกรูป ${shapeGoal}`,
    title: "Geometry Shapes",
    shapeGoal,
    choices,
    correctAnswer: shapeGoal,
    signature: `shape-pick:${shapeGoal}:${choices.join("-")}`,
  };
}

const modeBuilders = {
  "count-select": buildCountSelectChallenge,
  "number-to-scene": buildNumberToSceneChallenge,
  "number-sequence": buildNumberSequenceChallenge,
  "before-after-choice": buildBeforeAfterChallenge,
  "number-order-pick": buildNumberOrderChallenge,
  "parity-pick": buildParityChallenge,
  "parity-target-pick": buildParityTargetChallenge,
  "parity-true-false": buildParityTrueFalseChallenge,
  "compare-pick": buildCompareChallenge,
  "equation-choice": buildEquationChoiceChallenge,
  "scene-equation-choice": buildSceneEquationChoiceChallenge,
  "equation-input": buildEquationInputChallenge,
  "true-false-equation": buildTrueFalseEquationChallenge,
  "missing-part": buildMissingPartChallenge,
  "choose-operator": buildChooseOperatorChallenge,
  "place-value-choice": buildPlaceValueChallenge,
  "shape-pick": buildShapeChallenge,
};

function createLessonConfig(
  lessonNumber,
  title,
  description,
  reviewWordIds,
  setBlueprints,
  generatorRules,
) {
  return {
    id: `math-lessons-lesson-${lessonNumber}`,
    levelNumber: lessonNumber,
    lessonNumber,
    label: `Lesson ${lessonNumber}`,
    title,
    description,
    mode: "math-lesson",
    exerciseCount: 50,
    setSize: 10,
    wordCount: 50,
    mapCaption: "5 sets",
    setBlueprints,
    modePool: setBlueprints.flatMap((set) => set.allowedModes.map((mode) => ({ mode, weight: 1 }))),
    generatorRules,
    reviewWords: getReviewWords(reviewWordIds),
  };
}

const mathLessonLevels = [
  createLessonConfig(
    1,
    "Number 0-5",
    "Count, match, and spot numbers from 0 to 5.",
    ["zero", "one", "two", "three", "four", "five", "before", "after", "biggest", "smallest"],
    [
      { setNumber: 1, themeLabel: "Count Pictures", allowedModes: ["count-select"], visualPoolKeys: ["fruits", "school"] },
      { setNumber: 2, themeLabel: "Before / After", allowedModes: ["before-after-choice"] },
      { setNumber: 3, themeLabel: "Picture Match", allowedModes: ["number-to-scene"], visualPoolKeys: ["school", "animals"] },
      { setNumber: 4, themeLabel: "Big or Small", allowedModes: ["number-order-pick"] },
      { setNumber: 5, themeLabel: "Mixed Review", allowedModes: ["count-select", "before-after-choice", "number-to-scene", "number-order-pick"], visualPoolKeys: ["animals", "fruits", "school"] },
    ],
    {
      numberRange: { min: 0, max: 5 },
      countSceneMax: 5,
    },
  ),
  createLessonConfig(
    2,
    "Number 6-10",
    "Practice numbers from 6 to 10 with different picture sets.",
    ["six", "seven", "eight", "nine", "ten", "before", "after", "biggest", "smallest"],
    [
      { setNumber: 1, themeLabel: "Count Groups", allowedModes: ["count-select"], visualPoolKeys: ["animals", "fruits"] },
      { setNumber: 2, themeLabel: "Before / After", allowedModes: ["before-after-choice"] },
      { setNumber: 3, themeLabel: "Match the Number", allowedModes: ["number-to-scene"], visualPoolKeys: ["school", "fruits"] },
      { setNumber: 4, themeLabel: "Big or Small", allowedModes: ["number-order-pick"] },
      { setNumber: 5, themeLabel: "Mixed Review", allowedModes: ["count-select", "before-after-choice", "number-to-scene", "number-order-pick"], visualPoolKeys: ["animals", "fruits", "school"] },
    ],
    {
      numberRange: { min: 6, max: 10 },
      countSceneMax: 10,
    },
  ),
  createLessonConfig(
    3,
    "Even and Odd",
    "See even and odd numbers in scenes, numbers, and quick checks.",
    ["even", "odd", "two", "four", "six", "eight", "ten", "true", "false"],
    [
      { setNumber: 1, themeLabel: "Count Even / Odd", allowedModes: ["parity-pick"], visualPoolKeys: ["fruits", "school"], displayModes: ["scene"] },
      { setNumber: 2, themeLabel: "Pick Even / Odd", allowedModes: ["parity-pick"], displayModes: ["number"] },
      { setNumber: 3, themeLabel: "Find the Right Parity", allowedModes: ["parity-target-pick"] },
      { setNumber: 4, themeLabel: "True or False", allowedModes: ["parity-true-false"] },
      { setNumber: 5, themeLabel: "Mixed Review", allowedModes: ["parity-pick", "parity-target-pick", "parity-true-false"], visualPoolKeys: ["animals", "fruits", "school"] },
    ],
    {
      numberRange: { min: 0, max: 10 },
      sceneMax: 10,
    },
  ),
  createLessonConfig(
    4,
    "Compare 2 Numbers",
    "Use >, < and = with pictures and numbers.",
    ["greater-than", "less-than", "equal", "biggest", "smallest"],
    [
      { setNumber: 1, themeLabel: "Compare Scenes", allowedModes: ["compare-pick"], visualPoolKeys: ["animals", "fruits"], comparePatterns: ["scene-scene"] },
      { setNumber: 2, themeLabel: "Compare Numbers", allowedModes: ["compare-pick"], comparePatterns: ["number-number"] },
      { setNumber: 3, themeLabel: "Scene vs Number", allowedModes: ["compare-pick"], visualPoolKeys: ["school", "fruits"], comparePatterns: ["scene-number"] },
      { setNumber: 4, themeLabel: "Compare Numbers", allowedModes: ["compare-pick"], comparePatterns: ["number-number"] },
      { setNumber: 5, themeLabel: "Mixed Review", allowedModes: ["compare-pick"], visualPoolKeys: ["animals", "fruits", "school"], comparePatterns: ["scene-scene", "scene-number", "number-number"] },
    ],
    {
      numberRange: { min: 0, max: 10 },
      sceneMax: 10,
      allowSceneCompare: true,
    },
  ),
  createLessonConfig(
    5,
    "Addition to 9",
    "Build sums with picture groups and number equations.",
    ["add", "equal", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "true", "false"],
    [
      { setNumber: 1, themeLabel: "Add Picture Groups", allowedModes: ["scene-equation-choice"], visualPoolKeys: ["fruits", "school"] },
      { setNumber: 2, themeLabel: "Solve the Sum", allowedModes: ["equation-choice", "equation-input"] },
      { setNumber: 3, themeLabel: "Find the Missing Part", allowedModes: ["missing-part"] },
      { setNumber: 4, themeLabel: "True or False", allowedModes: ["true-false-equation"] },
      { setNumber: 5, themeLabel: "Mixed Review", allowedModes: ["scene-equation-choice", "equation-choice", "equation-input", "missing-part", "true-false-equation"], visualPoolKeys: ["animals", "fruits", "school"] },
    ],
    {
      operatorPool: ["+"],
      numberRange: { min: 0, max: 9 },
      answerRange: { min: 0, max: 9 },
      operandMin: 0,
      operandMax: 9,
    },
  ),
  createLessonConfig(
    6,
    "Subtraction to 9",
    "Take away from picture groups and solve subtraction facts.",
    ["subtract", "equal", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "true", "false"],
    [
      { setNumber: 1, themeLabel: "Take Away Groups", allowedModes: ["scene-equation-choice"], visualPoolKeys: ["school", "fruits"] },
      { setNumber: 2, themeLabel: "Solve the Difference", allowedModes: ["equation-choice", "equation-input"] },
      { setNumber: 3, themeLabel: "Find the Missing Part", allowedModes: ["missing-part"] },
      { setNumber: 4, themeLabel: "True or False", allowedModes: ["true-false-equation"] },
      { setNumber: 5, themeLabel: "Mixed Review", allowedModes: ["scene-equation-choice", "equation-choice", "equation-input", "missing-part", "true-false-equation"], visualPoolKeys: ["animals", "fruits", "school"] },
    ],
    {
      operatorPool: ["-"],
      numberRange: { min: 0, max: 9 },
      answerRange: { min: 0, max: 9 },
      operandMin: 0,
      operandMax: 9,
    },
  ),
  createLessonConfig(
    7,
    "Number 11-50",
    "Practice larger numbers with count, order, and comparison tasks.",
    ["ten", "before", "after", "greater-than", "less-than", "equal", "biggest", "smallest"],
    [
      { setNumber: 1, themeLabel: "Count Big Groups", allowedModes: ["count-select"], visualPoolKeys: ["school", "fruits"] },
      { setNumber: 2, themeLabel: "Before / After", allowedModes: ["before-after-choice", "number-sequence"], sequenceVariants: ["middle", "last", "backward"] },
      { setNumber: 3, themeLabel: "Order Numbers", allowedModes: ["number-order-pick"] },
      { setNumber: 4, themeLabel: "Compare Numbers", allowedModes: ["compare-pick"], comparePatterns: ["number-number"] },
      { setNumber: 5, themeLabel: "Mixed Review", allowedModes: ["count-select", "before-after-choice", "number-sequence", "number-order-pick", "compare-pick"], visualPoolKeys: ["animals", "fruits", "school"], comparePatterns: ["number-number"] },
    ],
    {
      numberRange: { min: 11, max: 50 },
      countSceneMax: 20,
      sceneMax: 20,
      allowSceneCompare: false,
    },
  ),
  createLessonConfig(
    8,
    "2-Digit Add and Subtract",
    "Solve full two-digit equations in mixed ways.",
    ["add", "subtract", "equal", "greater-than", "less-than", "true", "false"],
    [
      { setNumber: 1, themeLabel: "Choose the Answer", allowedModes: ["equation-choice"] },
      { setNumber: 2, themeLabel: "Type the Answer", allowedModes: ["equation-input"] },
      { setNumber: 3, themeLabel: "Find the Missing Part", allowedModes: ["missing-part"] },
      { setNumber: 4, themeLabel: "Choose the Sign", allowedModes: ["choose-operator", "true-false-equation"] },
      { setNumber: 5, themeLabel: "Mixed Review", allowedModes: ["equation-choice", "equation-input", "missing-part", "choose-operator", "true-false-equation"] },
    ],
    {
      operatorPool: ["+", "-"],
      numberRange: { min: 10, max: 99 },
      answerRange: { min: 0, max: 99 },
      fullTwoDigit: true,
    },
  ),
  createLessonConfig(
    9,
    "Place Value",
    "Build two-digit numbers with tens and ones.",
    ["tens", "ones", "ten", "one"],
    [
      { setNumber: 1, themeLabel: "Count the Tens", allowedModes: ["place-value-choice"], placeTargets: ["tens"] },
      { setNumber: 2, themeLabel: "Count the Ones", allowedModes: ["place-value-choice"], placeTargets: ["ones"] },
      { setNumber: 3, themeLabel: "Tens and Ones", allowedModes: ["place-value-choice"], placeTargets: ["tens", "ones"] },
      { setNumber: 4, themeLabel: "Place Value Sprint", allowedModes: ["place-value-choice"], placeTargets: ["tens", "ones"] },
      { setNumber: 5, themeLabel: "Place Value Review", allowedModes: ["place-value-choice"], placeTargets: ["tens", "ones"] },
    ],
    {
      numberRange: { min: 10, max: 99 },
    },
  ),
  createLessonConfig(
    10,
    "Geometry Shapes",
    "Recognize circles, triangles, squares, rectangles, ovals, and diamonds.",
    ["circle", "triangle", "square", "rectangle", "oval", "diamond"],
    [
      { setNumber: 1, themeLabel: "Round Shapes", allowedModes: ["shape-pick"], shapePool: ["circle", "oval"] },
      { setNumber: 2, themeLabel: "Corners and Sides", allowedModes: ["shape-pick"], shapePool: ["triangle", "square"] },
      { setNumber: 3, themeLabel: "Four-Sided Shapes", allowedModes: ["shape-pick"], shapePool: ["square", "rectangle", "diamond"] },
      { setNumber: 4, themeLabel: "Shape Hunt", allowedModes: ["shape-pick"], shapePool: shapeNames },
      { setNumber: 5, themeLabel: "Geometry Review", allowedModes: ["shape-pick"], shapePool: shapeNames },
    ],
    {
      numberRange: { min: 0, max: 9 },
    },
  ),
];

export function generateMathLessonSession(levelConfig) {
  const exercises = [];
  let previousAnswerKey = "";
  let previousSignature = "";
  const setBlueprints = levelConfig.setBlueprints || [];

  setBlueprints.forEach((setBlueprint, setIndex) => {
    for (let questionIndex = 0; questionIndex < levelConfig.setSize; questionIndex += 1) {
      let nextExercise = null;

      for (let attempt = 0; attempt < 80; attempt += 1) {
        const modePool = setBlueprint.allowedModes.map((mode) => ({ mode, weight: 1 }));
        const mode = pickWeightedMode(modePool);
        const builder = modeBuilders[mode];
        const exercise = builder(
          levelConfig,
          `${levelConfig.id}-set-${setIndex + 1}-question-${questionIndex + 1}`,
          setBlueprint,
        );
        const answerKey = `${exercise.mode}:${String(exercise.correctAnswer)}`;

        if (!isValidMathLessonChallenge(exercise)) {
          continue;
        }

        if (exercise.signature === previousSignature) {
          continue;
        }

        if (answerKey === previousAnswerKey) {
          continue;
        }

        nextExercise = {
          ...exercise,
          setNumber: setBlueprint.setNumber,
          setThemeLabel: setBlueprint.themeLabel,
        };
        previousAnswerKey = answerKey;
        previousSignature = exercise.signature;
        break;
      }

      if (!nextExercise) {
        const fallbackMode = pickWeightedMode(levelConfig.modePool);
        const fallbackExercise = modeBuilders[fallbackMode](
          levelConfig,
          `${levelConfig.id}-set-${setIndex + 1}-fallback-${questionIndex + 1}`,
          setBlueprint,
        );

        if (!isValidMathLessonChallenge(fallbackExercise)) {
          continue;
        }

        nextExercise = {
          ...fallbackExercise,
          setNumber: setBlueprint.setNumber,
          setThemeLabel: setBlueprint.themeLabel,
        };
        previousAnswerKey = `${nextExercise.mode}:${String(nextExercise.correctAnswer)}`;
        previousSignature = nextExercise.signature;
      }

      exercises.push(nextExercise);
    }
  });

  for (let index = 0; index < exercises.length; index += 1) {
    if (isValidMathLessonChallenge(exercises[index])) {
      continue;
    }

    const fallbackTheme = exercises[index]?.setThemeLabel || "";
    const fallbackSetNumber = exercises[index]?.setNumber || 1;

    for (let attempt = 0; attempt < 40; attempt += 1) {
      const repairMode = pickWeightedMode(levelConfig.modePool);
      const repairedExercise = modeBuilders[repairMode](
        levelConfig,
        `${levelConfig.id}-repair-${index + 1}-${attempt + 1}`,
        levelConfig.setBlueprints[fallbackSetNumber - 1] || {},
      );

      if (isValidMathLessonChallenge(repairedExercise)) {
        exercises[index] = {
          ...repairedExercise,
          setThemeLabel: fallbackTheme,
          setNumber: fallbackSetNumber,
        };
        break;
      }
    }
  }

  const surface = getSurfaceDefinition("math-lessons", levelConfig.levelNumber);
  const surfacedExercises = exercises.map((exercise) => ({
    ...exercise,
    surfaceId: levelConfig.surfaceId || surface?.surfaceId,
    surfaceKind: levelConfig.surfaceKind || surface?.kind,
    surfaceVariant: levelConfig.surfaceVariant || surface?.surfaceVariant,
    rendererKey: levelConfig.rendererKey || surface?.rendererKey,
    answerRepresentation:
      levelConfig.answerRepresentation || surface?.answerRepresentation,
  }));

  return {
    id: `${levelConfig.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    exerciseCount: levelConfig.exerciseCount,
    setSize: levelConfig.setSize,
    exercises: surfacedExercises,
  };
}

export const mathLessonsSubject = {
  id: "math-lessons",
  name: "Math Exercises",
  category: "exercise",
  icon: "📘",
  description: "EP Grade 1 practice with addition, place value, geometry, and number skills.",
  words: mathLessonWords,
  levels: mathLessonLevels,
};

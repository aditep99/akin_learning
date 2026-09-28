import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { AudioReplayButton } from "../components/AudioReplayButton";
import { MonsterCharacter } from "../components/MonsterCharacter";
import { ScreenShell } from "../components/ScreenShell";
import { VocabularyVisual } from "../components/VocabularyAnswer";
import { getMathExerciseTheme } from "../data/mathExerciseThemes";
import { useNarration } from "../hooks/useNarration";
import { buildBilingualNarration } from "../utils/narrationScript";

function appendDigit(currentValue, digit, maxLength) {
  if (currentValue.length >= maxLength) {
    return currentValue;
  }

  if (currentValue === "0") {
    return String(digit);
  }

  return `${currentValue}${digit}`;
}

const modeHintMap = {
  "count-select": {
    en: "Point to each picture once while you count.",
    th: "ชี้รูปทีละรูปแล้วนับช้า ๆ",
  },
  "number-to-scene": {
    en: "Match the number with a group of the same size.",
    th: "จับคู่ตัวเลขกับกลุ่มรูปที่มีจำนวนเท่ากัน",
  },
  "number-sequence": {
    en: "Follow the arrow one number at a time.",
    th: "ไล่ตามลูกศรทีละหนึ่งจำนวน",
  },
  "before-after-choice": {
    en: "Before moves back one step. After moves forward one step.",
    th: "ก่อนหน้าให้ถอยหนึ่งขั้น หลังจากให้เดินหน้าหนึ่งขั้น",
  },
  "number-order-pick": {
    en: "Compare the first digit, then look at the next digit.",
    th: "เทียบหลักแรกก่อน แล้วจึงดูหลักถัดไป",
  },
  "parity-pick": {
    en: "Make pairs. A number left alone means odd.",
    th: "จับเป็นคู่ ถ้าเหลือหนึ่งตัวคือจำนวนคี่",
  },
  "parity-target-pick": {
    en: "Even numbers make complete pairs. Odd numbers leave one.",
    th: "เลขคู่จับคู่ได้ครบ เลขคี่จะเหลือหนึ่ง",
  },
  "parity-true-false": {
    en: "Try pairing the number before choosing true or false.",
    th: "ลองจับคู่จำนวนก่อนเลือกจริงหรือเท็จ",
  },
  "compare-pick": {
    en: "The wide mouth opens toward the bigger number.",
    th: "ปากกว้างหันไปทางจำนวนที่มากกว่า",
  },
  "scene-equation-choice": {
    en: "Count both groups, then join or take away.",
    th: "นับทั้งสองกลุ่ม แล้วรวมกันหรือนำออก",
  },
  "equation-choice": {
    en: "Start with the first number and follow the sign.",
    th: "เริ่มจากจำนวนแรก แล้วทำตามเครื่องหมาย",
  },
  "equation-input": {
    en: "Work out the answer, then type every digit.",
    th: "คิดคำตอบก่อน แล้วพิมพ์ตัวเลขให้ครบ",
  },
  "true-false-equation": {
    en: "Solve the left side and compare it with the answer shown.",
    th: "คำนวณด้านซ้าย แล้วเทียบกับคำตอบที่แสดง",
  },
  "missing-part": {
    en: "Ask what number completes the equation.",
    th: "หาจำนวนที่ทำให้สมการสมบูรณ์",
  },
  "choose-operator": {
    en: "Choose plus to join and minus to take away.",
    th: "เลือกบวกเมื่อต้องรวม และเลือกลบเมื่อต้องนำออก",
  },
  "place-value-choice": {
    en: "Tens are bundles of ten. Ones are single blocks.",
    th: "หลักสิบคือมัดละสิบ หลักหน่วยคือบล็อกเดี่ยว",
  },
  "shape-pick": {
    en: "Look at the sides, corners, and curved edges.",
    th: "สังเกตด้าน มุม และเส้นโค้ง",
  },
};

function getModeHint(mode) {
  return (
    modeHintMap[mode] || {
      en: "Look carefully and try one more time.",
      th: "มองให้ดีแล้วลองอีกครั้ง",
    }
  );
}

function MonsterNumberCard({ buddyId, label, value }) {
  return (
    <div className="math-monster-number">
      <MonsterCharacter
        buddyId={buddyId}
        className="math-monster-number__buddy"
        decorative
      />
      <span className="math-monster-number__card" aria-label={`${label} ${value}`}>
        <small>{label}</small>
        <strong>{value ?? "?"}</strong>
      </span>
    </div>
  );
}

function SceneBoard({ items = [], label = "", variant = "" }) {
  return (
    <div
      className={`math-lesson-scene-board ${
        variant ? `math-lesson-scene-board--${variant}` : ""
      }`.trim()}
    >
      <div className="math-lesson-scene-board__header">
        <strong>{label ? `${label} group` : "Count carefully"}</strong>
        <span>Look carefully and choose the best answer.</span>
      </div>
      <div
        className={`math-lesson-scene-board__grid math-lesson-scene-board__grid--count-${items.length}`}
      >
        {items.map((item, index) => (
          <motion.div
            key={`${item.id}-${index}`}
            className="math-lesson-scene-board__item"
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.22 }}
          >
            <VocabularyVisual
              word={item}
              className="math-lesson-scene-board__image"
              decorative
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PromptValueBoard({ label, value, accentText, className = "" }) {
  return (
    <div
      className={`math-lesson-value-board math-lesson-value-board--prompt ${className}`.trim()}
    >
      <small>{label}</small>
      <strong>{value}</strong>
      {accentText ? <span>{accentText}</span> : null}
    </div>
  );
}

function SceneChoiceBoard({ choices = [] }) {
  return (
    <div className="math-lesson-scene-choice-content">
      {choices.map((choice) => (
        <div
          key={choice.id}
          className={`math-lesson-scene-choice-card ${
            choice.value === 0 ? "math-lesson-scene-choice-card--empty" : ""
          }`}
        >
          <div
            className={`math-lesson-scene-choice-card__grid ${
              choice.value === 0 ? "math-lesson-scene-choice-card__grid--empty" : ""
            } math-lesson-scene-choice-card__grid--count-${choice.items.length}`.trim()}
          >
            {choice.value === 0 ? (
              <span className="math-lesson-scene-choice-card__empty-mark">0</span>
            ) : (
              choice.items.map((item, index) => (
                <span
                  key={`${choice.id}-${item.id}-${index}`}
                  className="math-lesson-scene-choice-card__thumb"
                >
                  <VocabularyVisual
                    word={item}
                    className="math-lesson-scene-choice-card__image"
                    decorative
                  />
                </span>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function DualSceneEquationBoard({
  leftItems = [],
  rightItems = [],
  leftLabel = "",
  rightLabel = "",
  operator = "+",
}) {
  return (
    <div className="math-lesson-dual-scene">
      <div className="math-lesson-dual-scene__card">
        <strong>{leftLabel || "Group 1"}</strong>
        <div className="math-lesson-dual-scene__grid">
          {leftItems.map((item, index) => (
            <span
              key={`left-${item.id}-${index}`}
              className="math-lesson-dual-scene__thumb"
            >
              <VocabularyVisual
                word={item}
                className="math-lesson-dual-scene__image"
                decorative
              />
            </span>
          ))}
        </div>
      </div>

      <div className="math-lesson-dual-scene__operator">{operator}</div>

      <div className="math-lesson-dual-scene__card">
        <strong>{rightLabel || "Group 2"}</strong>
        <div className="math-lesson-dual-scene__grid">
          {rightItems.map((item, index) => (
            <span
              key={`right-${item.id}-${index}`}
              className="math-lesson-dual-scene__thumb"
            >
              <VocabularyVisual
                word={item}
                className="math-lesson-dual-scene__image"
                decorative
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SequenceBoard({ sequence }) {
  return (
    <div className="math-lesson-sequence-board">
      {sequence.map((value, index) => (
        <div
          key={`sequence-${index}`}
          className={`math-lesson-sequence-board__slot ${
            value === null ? "math-lesson-sequence-board__slot--blank" : ""
          }`}
        >
          {value === null ? "?" : value}
        </div>
      ))}
    </div>
  );
}

function CompareOperandCard({ operand }) {
  if (operand.type === "scene") {
    return (
      <div className="math-lesson-compare-card math-lesson-compare-card--scene">
        <strong>{operand.value}</strong>
        <div className="math-lesson-compare-card__scene">
          {operand.items.map((item, index) => (
            <span
              key={`${item.id}-${index}`}
              className="math-lesson-compare-card__thumb"
            >
              <VocabularyVisual
                word={item}
                className="math-lesson-compare-card__image"
                decorative
              />
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="math-lesson-compare-card">
      <span className="math-lesson-compare-card__tag">Number</span>
      <strong>{operand.value}</strong>
    </div>
  );
}

function EquationBoard({ buddyIds, leftValue, operator, rightValue }) {
  return (
    <div className="math-lesson-equation-board math-lesson-equation-board--monsters">
      <MonsterNumberCard
        buddyId={buddyIds[0]}
        label="First number"
        value={leftValue}
      />
      <div className="math-lesson-equation-board__operator">{operator}</div>
      <MonsterNumberCard
        buddyId={buddyIds[1]}
        label="Second number"
        value={rightValue}
      />
      <div className="math-lesson-equation-board__operator math-lesson-equation-board__operator--equals">
        =
      </div>
      <div className="math-lesson-equation-board__answer">?</div>
    </div>
  );
}

function EquationDecisionBoard({
  buddyIds,
  leftValue,
  operator,
  rightValue,
  shownAnswer,
}) {
  return (
    <div className="math-lesson-equation-board math-lesson-equation-board--monsters">
      <MonsterNumberCard
        buddyId={buddyIds[0]}
        label="First number"
        value={leftValue}
      />
      <div className="math-lesson-equation-board__operator">{operator}</div>
      <MonsterNumberCard
        buddyId={buddyIds[1]}
        label="Second number"
        value={rightValue}
      />
      <div className="math-lesson-equation-board__operator math-lesson-equation-board__operator--equals">
        =
      </div>
      <div className="math-lesson-equation-board__answer">{shownAnswer}</div>
    </div>
  );
}

function MissingPartBoard({
  buddyIds,
  leftValue,
  rightValue,
  resultValue,
  operator,
}) {
  return (
    <div className="math-lesson-equation-board math-lesson-equation-board--monsters">
      <MonsterNumberCard
        buddyId={buddyIds[0]}
        label="First number"
        value={leftValue}
      />
      <div className="math-lesson-equation-board__operator">{operator}</div>
      <MonsterNumberCard
        buddyId={buddyIds[1]}
        label="Second number"
        value={rightValue}
      />
      <div className="math-lesson-equation-board__operator math-lesson-equation-board__operator--equals">
        =
      </div>
      <div className="math-lesson-equation-board__answer">{resultValue}</div>
    </div>
  );
}

function PlaceValueBoard({ displayValue, tensDigit, onesDigit, placeTarget }) {
  return (
    <div className="place-value-board">
      <div className="place-value-board__number">{displayValue}</div>
      <div className="place-value-board__groups">
        <div
          className={`place-value-board__group ${
            placeTarget === "tens" ? "place-value-board__group--active" : ""
          }`}
        >
          <strong>Tens</strong>
          <div className="place-value-board__blocks place-value-board__blocks--tens">
            {Array.from({ length: tensDigit }).map((_, index) => (
              <span key={`ten-${index + 1}`} />
            ))}
          </div>
          <small>{tensDigit} tens</small>
        </div>
        <div
          className={`place-value-board__group ${
            placeTarget === "ones" ? "place-value-board__group--active" : ""
          }`}
        >
          <strong>Ones</strong>
          <div className="place-value-board__blocks place-value-board__blocks--ones">
            {Array.from({ length: onesDigit }).map((_, index) => (
              <span key={`one-${index + 1}`} />
            ))}
          </div>
          <small>{onesDigit} ones</small>
        </div>
      </div>
    </div>
  );
}

function ShapeIcon({ shape }) {
  return (
    <span className="geometry-choice__visual" aria-hidden="true">
      <span className={`geometry-shape geometry-shape--${shape}`} />
    </span>
  );
}

export function MathLessonGameplayScreen({
  currentChallenge,
  failedChoiceId,
  lessonLabel,
  level,
  levelThemeLabel,
  onBack,
  onCorrectChoice,
  onPress,
  onWrongChoice,
  setSize,
  stepIndex,
  totalSteps,
}) {
  const narration = useMemo(() => {
    return buildBilingualNarration(
      currentChallenge.prompt,
      currentChallenge.promptTh,
    );
  }, [currentChallenge.prompt, currentChallenge.promptTh]);

  const narrationControl = useNarration(narration);

  const [typedAnswer, setTypedAnswer] = useState("");
  const [inputError, setInputError] = useState("");
  const [wrongAttemptCount, setWrongAttemptCount] = useState(0);
  const [isCelebrating, setIsCelebrating] = useState(false);

  useEffect(() => {
    setTypedAnswer("");
    setInputError("");
    setWrongAttemptCount(0);
    setIsCelebrating(false);
  }, [currentChallenge.id]);

  const currentSet = Math.ceil(stepIndex / setSize);
  const totalSets = Math.ceil(totalSteps / setSize);
  const questionInSet = ((stepIndex - 1) % setSize) + 1;
  const isInputMode = currentChallenge.mode === "equation-input";
  const setThemeLabel = currentChallenge.setThemeLabel || levelThemeLabel || "Math Exercises";
  const adventureTheme = getMathExerciseTheme(
    currentChallenge.setNumber || currentSet,
  );
  const currentHint = getModeHint(currentChallenge.mode);
  const showHint = wrongAttemptCount >= 2;

  const handleCorrect = () => {
    setIsCelebrating(true);
    onCorrectChoice();
  };

  const handleWrong = (choiceId) => {
    setWrongAttemptCount((value) => value + 1);
    onWrongChoice(choiceId);
  };

  const handleChoice = (choice) => {
    onPress();
    const choiceId = `${currentChallenge.id}-${choice}`;

    if (choice === currentChallenge.correctAnswer) {
      handleCorrect();
      return;
    }

    handleWrong(choiceId);
  };

  const handleDigitPress = (digit) => {
    onPress();
    setInputError("");
    const nextValue = appendDigit(
      typedAnswer,
      digit,
      currentChallenge.inputMaxLength ?? 2,
    );
    setTypedAnswer(nextValue);

    if (nextValue.length < (currentChallenge.inputMaxLength ?? 2)) {
      return;
    }

    if (Number(nextValue) === currentChallenge.correctAnswer) {
      handleCorrect();
      return;
    }

    setInputError("Try again / ลองอีกครั้ง");
    handleWrong("math-lesson-input");
  };

  const handleDelete = () => {
    onPress();
    setInputError("");
    setTypedAnswer((currentValue) => currentValue.slice(0, -1));
  };

  const handleClear = () => {
    onPress();
    setInputError("");
    setTypedAnswer("");
  };

  const handleListen = () => {
    onPress();
    narrationControl.replay();
  };

  const renderStage = () => {
    switch (currentChallenge.mode) {
      case "count-select":
        return (
          <>
            <SceneBoard
              items={currentChallenge.sceneItems}
              label={currentChallenge.sceneLabel}
            />
            <div className="math-lesson-choices">
              {currentChallenge.choices.map((choice) => {
                const choiceId = `${currentChallenge.id}-${choice}`;
                const isWrong = failedChoiceId === choiceId;

                return (
                  <motion.button
                    key={choiceId}
                    type="button"
                    className="math-lesson-choice"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={isWrong ? { duration: 0.3 } : undefined}
                    onClick={() => handleChoice(choice)}
                  >
                    {choice}
                  </motion.button>
                );
              })}
            </div>
          </>
        );

      case "number-to-scene":
        return (
          <>
            <PromptValueBoard
              className="math-lesson-value-board--scene-prompt"
              label="Find this number"
              value={currentChallenge.displayValue}
              accentText="Tap the matching picture group."
            />
            <div className="math-lesson-scene-choice-grid">
              {currentChallenge.choices.map((choice, choiceIndex) => {
                const choiceId = `${currentChallenge.id}-${choice.id}`;
                const isWrong = failedChoiceId === choiceId;

                return (
                  <motion.button
                    key={choice.id}
                    type="button"
                    className="math-lesson-scene-choice-button"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={isWrong ? { duration: 0.3 } : undefined}
                    aria-label={`Picture group ${choiceIndex + 1}: ${choice.value} ${choice.label || "items"}`}
                    onClick={() => {
                      onPress();

                      if (choice.id === currentChallenge.correctAnswer) {
                        handleCorrect();
                        return;
                      }

                      handleWrong(choiceId);
                    }}
                  >
                    <SceneChoiceBoard choices={[choice]} />
                  </motion.button>
                );
              })}
            </div>
          </>
        );

      case "number-sequence":
        return (
          <>
            <SequenceBoard sequence={currentChallenge.sequence} />
            <div className="math-lesson-choices">
              {currentChallenge.choices.map((choice) => {
                const choiceId = `${currentChallenge.id}-${choice}`;
                const isWrong = failedChoiceId === choiceId;

                return (
                  <motion.button
                    key={choiceId}
                    type="button"
                    className="math-lesson-choice"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={isWrong ? { duration: 0.3 } : undefined}
                    onClick={() => handleChoice(choice)}
                  >
                    {choice}
                  </motion.button>
                );
              })}
            </div>
          </>
        );

      case "before-after-choice":
        return (
          <>
            <PromptValueBoard
              label={currentChallenge.direction === "before" ? "Number before" : "Number after"}
              value={currentChallenge.referenceValue}
              accentText={currentChallenge.direction === "before" ? "Think one step back." : "Think one step forward."}
            />
            <div className="math-lesson-choices">
              {currentChallenge.choices.map((choice) => {
                const choiceId = `${currentChallenge.id}-${choice}`;
                const isWrong = failedChoiceId === choiceId;

                return (
                  <motion.button
                    key={choiceId}
                    type="button"
                    className="math-lesson-choice"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={isWrong ? { duration: 0.3 } : undefined}
                    onClick={() => handleChoice(choice)}
                  >
                    {choice}
                  </motion.button>
                );
              })}
            </div>
          </>
        );

      case "number-order-pick":
        return (
          <>
            <PromptValueBoard
              label={currentChallenge.orderGoal === "smallest" ? "Find the smallest number" : "Find the biggest number"}
              value={currentChallenge.orderGoal === "smallest" ? "MIN" : "MAX"}
              accentText="Look at all four choices."
            />
            <div className="math-lesson-choices">
              {currentChallenge.choices.map((choice) => {
                const choiceId = `${currentChallenge.id}-${choice}`;
                const isWrong = failedChoiceId === choiceId;

                return (
                  <motion.button
                    key={choiceId}
                    type="button"
                    className="math-lesson-choice"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={isWrong ? { duration: 0.3 } : undefined}
                    onClick={() => handleChoice(choice)}
                  >
                    {choice}
                  </motion.button>
                );
              })}
            </div>
          </>
        );

      case "parity-pick":
        return (
          <>
            {currentChallenge.displayMode === "scene" ? (
              <SceneBoard
                items={currentChallenge.sceneItems}
                label={currentChallenge.sceneLabel}
                variant="parity"
              />
            ) : (
              <div className="math-lesson-value-board">
                <strong>{currentChallenge.displayValue}</strong>
              </div>
            )}
            <div className="math-lesson-choices math-lesson-choices--wide">
              {currentChallenge.choices.map((choice) => {
                const choiceId = `${currentChallenge.id}-${choice}`;
                const isWrong = failedChoiceId === choiceId;

                return (
                  <motion.button
                    key={choiceId}
                    type="button"
                    className="math-lesson-choice math-lesson-choice--word"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={isWrong ? { duration: 0.3 } : undefined}
                    onClick={() => handleChoice(choice)}
                  >
                    {choice}
                  </motion.button>
                );
              })}
            </div>
          </>
        );

      case "parity-target-pick":
        return (
          <>
            <PromptValueBoard
              label={currentChallenge.targetParity === "Even" ? "Tap an even number" : "Tap an odd number"}
              value={currentChallenge.targetParity}
              accentText="Only one choice fits."
            />
            <div className="math-lesson-choices">
              {currentChallenge.choices.map((choice) => {
                const choiceId = `${currentChallenge.id}-${choice}`;
                const isWrong = failedChoiceId === choiceId;

                return (
                  <motion.button
                    key={choiceId}
                    type="button"
                    className="math-lesson-choice"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={isWrong ? { duration: 0.3 } : undefined}
                    onClick={() => handleChoice(choice)}
                  >
                    {choice}
                  </motion.button>
                );
              })}
            </div>
          </>
        );

      case "parity-true-false":
        return (
          <>
            <PromptValueBoard
              label={`${currentChallenge.displayValue} is ${currentChallenge.shownParity.toLowerCase()}`}
              value={currentChallenge.displayValue}
              accentText="Is the sentence true or false?"
            />
            <div className="math-lesson-choices math-lesson-choices--wide">
              {currentChallenge.choices.map((choice) => {
                const choiceId = `${currentChallenge.id}-${choice}`;
                const isWrong = failedChoiceId === choiceId;

                return (
                  <motion.button
                    key={choiceId}
                    type="button"
                    className="math-lesson-choice math-lesson-choice--word"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={isWrong ? { duration: 0.3 } : undefined}
                    onClick={() => handleChoice(choice)}
                  >
                    {choice}
                  </motion.button>
                );
              })}
            </div>
          </>
        );

      case "compare-pick":
        return (
          <>
            <div className="math-lesson-compare-stage">
              <CompareOperandCard operand={currentChallenge.compareLeft} />
              <div className="math-lesson-compare-stage__middle">?</div>
              <CompareOperandCard operand={currentChallenge.compareRight} />
            </div>
            <div className="math-lesson-choices math-lesson-choices--compare">
              {currentChallenge.choices.map((choice) => {
                const choiceId = `${currentChallenge.id}-${choice}`;
                const isWrong = failedChoiceId === choiceId;

                return (
                  <motion.button
                    key={choiceId}
                    type="button"
                    className="math-lesson-choice math-lesson-choice--sign"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={isWrong ? { duration: 0.3 } : undefined}
                    onClick={() => handleChoice(choice)}
                  >
                    {choice}
                  </motion.button>
                );
              })}
            </div>
          </>
        );

      case "scene-equation-choice":
        return (
          <>
            <DualSceneEquationBoard
              leftItems={currentChallenge.leftItems}
              rightItems={currentChallenge.rightItems}
              leftLabel={currentChallenge.leftLabel}
              rightLabel={currentChallenge.rightLabel}
              operator={currentChallenge.operator}
            />
            <div className="math-lesson-choices">
              {currentChallenge.choices.map((choice) => {
                const choiceId = `${currentChallenge.id}-${choice}`;
                const isWrong = failedChoiceId === choiceId;

                return (
                  <motion.button
                    key={choiceId}
                    type="button"
                    className="math-lesson-choice"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={isWrong ? { duration: 0.3 } : undefined}
                    onClick={() => handleChoice(choice)}
                  >
                    {choice}
                  </motion.button>
                );
              })}
            </div>
          </>
        );

      case "equation-choice":
        return (
          <>
            <EquationBoard
              buddyIds={adventureTheme.buddyIds}
              leftValue={currentChallenge.leftValue}
              operator={currentChallenge.operator}
              rightValue={currentChallenge.rightValue}
            />
            <div className="math-lesson-choices">
              {currentChallenge.choices.map((choice) => {
                const choiceId = `${currentChallenge.id}-${choice}`;
                const isWrong = failedChoiceId === choiceId;

                return (
                  <motion.button
                    key={choiceId}
                    type="button"
                    className="math-lesson-choice"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={isWrong ? { duration: 0.3 } : undefined}
                    onClick={() => handleChoice(choice)}
                  >
                    {choice}
                  </motion.button>
                );
              })}
            </div>
          </>
        );

      case "true-false-equation":
        return (
          <>
            <EquationDecisionBoard
              buddyIds={adventureTheme.buddyIds}
              leftValue={currentChallenge.leftValue}
              operator={currentChallenge.operator}
              rightValue={currentChallenge.rightValue}
              shownAnswer={currentChallenge.shownAnswer}
            />
            <div className="math-lesson-choices math-lesson-choices--wide">
              {currentChallenge.choices.map((choice) => {
                const choiceId = `${currentChallenge.id}-${choice}`;
                const isWrong = failedChoiceId === choiceId;

                return (
                  <motion.button
                    key={choiceId}
                    type="button"
                    className="math-lesson-choice math-lesson-choice--word"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={isWrong ? { duration: 0.3 } : undefined}
                    onClick={() => handleChoice(choice)}
                  >
                    {choice}
                  </motion.button>
                );
              })}
            </div>
          </>
        );

      case "missing-part":
        return (
          <>
            <MissingPartBoard
              buddyIds={adventureTheme.buddyIds}
              leftValue={currentChallenge.leftValue}
              rightValue={currentChallenge.rightValue}
              resultValue={currentChallenge.resultValue}
              operator={currentChallenge.operator}
            />
            <div className="math-lesson-choices">
              {currentChallenge.choices.map((choice) => {
                const choiceId = `${currentChallenge.id}-${choice}`;
                const isWrong = failedChoiceId === choiceId;

                return (
                  <motion.button
                    key={choiceId}
                    type="button"
                    className="math-lesson-choice"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={isWrong ? { duration: 0.3 } : undefined}
                    onClick={() => handleChoice(choice)}
                  >
                    {choice}
                  </motion.button>
                );
              })}
            </div>
          </>
        );

      case "choose-operator":
        return (
          <>
            <MissingPartBoard
              buddyIds={adventureTheme.buddyIds}
              leftValue={currentChallenge.leftValue}
              rightValue={currentChallenge.rightValue}
              resultValue={currentChallenge.resultValue}
              operator={"?"}
            />
            <div className="math-lesson-choices math-lesson-choices--compare">
              {currentChallenge.choices.map((choice) => {
                const choiceId = `${currentChallenge.id}-${choice}`;
                const isWrong = failedChoiceId === choiceId;

                return (
                  <motion.button
                    key={choiceId}
                    type="button"
                    className="math-lesson-choice math-lesson-choice--sign"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={isWrong ? { duration: 0.3 } : undefined}
                    onClick={() => handleChoice(choice)}
                  >
                    {choice}
                  </motion.button>
                );
              })}
            </div>
          </>
        );

      case "equation-input":
        return (
          <>
            <EquationBoard
              buddyIds={adventureTheme.buddyIds}
              leftValue={currentChallenge.leftValue}
              operator={currentChallenge.operator}
              rightValue={currentChallenge.rightValue}
            />
            <div className="math-lesson-input-panel">
              <div className="math-lesson-answer-box">
                <small>Type answer</small>
                <strong>{typedAnswer || "?"}</strong>
                <span>{inputError || "Use the number pad below."}</span>
              </div>
              <div className="math-lesson-keypad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    className="math-lesson-keypad__key"
                    onClick={() => handleDigitPress(digit)}
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  className="math-lesson-keypad__key math-lesson-keypad__key--delete"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="math-lesson-keypad__key math-lesson-keypad__key--clear"
                  onClick={handleClear}
                >
                  Clear
                </button>
              </div>
            </div>
          </>
        );

      case "place-value-choice":
        return (
          <>
            <PlaceValueBoard
              displayValue={currentChallenge.displayValue}
              tensDigit={currentChallenge.tensDigit}
              onesDigit={currentChallenge.onesDigit}
              placeTarget={currentChallenge.placeTarget}
            />
            <div className="math-lesson-choices">
              {currentChallenge.choices.map((choice) => {
                const choiceId = `${currentChallenge.id}-${choice}`;
                const isWrong = failedChoiceId === choiceId;

                return (
                  <motion.button
                    key={choiceId}
                    type="button"
                    className="math-lesson-choice"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={isWrong ? { duration: 0.3 } : undefined}
                    onClick={() => handleChoice(choice)}
                  >
                    {choice}
                  </motion.button>
                );
              })}
            </div>
          </>
        );

      case "shape-pick":
        return (
          <div className="geometry-choice-grid">
            {currentChallenge.choices.map((choice) => {
              const choiceId = `${currentChallenge.id}-${choice}`;
              const isWrong = failedChoiceId === choiceId;

              return (
                <motion.button
                  key={choiceId}
                  type="button"
                  className="geometry-choice"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.97 }}
                  animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                  transition={isWrong ? { duration: 0.3 } : undefined}
                  onClick={() => handleChoice(choice)}
                >
                  <ShapeIcon shape={choice} />
                  <strong>{choice}</strong>
                </motion.button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ScreenShell
      className={`screen-shell--gameplay screen-shell--math-lessons screen-shell--math-theme-${adventureTheme.id}`}
      variant="FocusSessionShell"
    >
      <section
        className={`game-card game-card--math-lessons game-card--math-lesson-stage game-card--math-theme-${adventureTheme.id}`}
      >
        <div className="game-card__prompt game-card__prompt--math-lessons">
          <p className="eyebrow">
            {adventureTheme.label} • {setThemeLabel}
          </p>
          <h2>{currentChallenge.title}</h2>
          <p className="game-card__subject-note">{currentChallenge.prompt}</p>
          <p className="game-card__subject-note game-card__subject-note--thai">
            {currentChallenge.promptTh}
          </p>
          <AudioReplayButton
            available={narrationControl.isAvailable}
            className="game-card__audio-action"
            isSpeaking={narrationControl.isSpeaking}
            label="ฟังคำสั่งอีกครั้ง"
            onReplay={handleListen}
          />
        </div>

        <div className="math-lesson-progress">
          <div className="math-lesson-progress__pill">
            <strong>Set {currentSet}/{totalSets}</strong>
            <span>{`${adventureTheme.sceneLabel} • Q ${questionInSet}/${setSize}`}</span>
          </div>
          <div className="math-lesson-progress__bar">
            <span style={{ width: `${(stepIndex / totalSteps) * 100}%` }} />
          </div>
        </div>

        <div className="activity-board activity-board--mathlessons">
          <div className={`math-adventure-world math-adventure-world--${adventureTheme.id}`}>
            <div className="math-adventure-world__scenery" aria-hidden="true">
              <span className="math-adventure-world__orb math-adventure-world__orb--one" />
              <span className="math-adventure-world__orb math-adventure-world__orb--two" />
              <span className="math-adventure-world__trail" />
            </div>

            <div className="math-adventure-world__cast" aria-hidden="true">
              <motion.div
                className="math-adventure-world__buddy math-adventure-world__buddy--left"
                animate={{ y: [0, -7, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY }}
              >
                <MonsterCharacter buddyId={adventureTheme.buddyIds[0]} decorative />
              </motion.div>
              <span className="math-adventure-world__mission">
                <small>MISSION</small>
                <strong>{adventureTheme.sceneLabel}</strong>
              </span>
              <motion.div
                className="math-adventure-world__buddy math-adventure-world__buddy--right"
                animate={{ y: [0, -5, 0], rotate: [2, -2, 2] }}
                transition={{
                  duration: 3.6,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 0.4,
                }}
              >
                <MonsterCharacter buddyId={adventureTheme.buddyIds[1]} decorative />
              </motion.div>
            </div>

            <div
              className={`math-lesson-stage math-adventure-layout math-adventure-layout--${currentChallenge.mode} ${
                isInputMode ? "math-lesson-stage--input" : ""
              } ${showHint ? "math-adventure-layout--hint" : ""}`}
            >
              {renderStage()}
            </div>

            <AnimatePresence>
              {wrongAttemptCount > 0 && !isCelebrating ? (
                <motion.div
                  key={`wrong-${wrongAttemptCount}`}
                  className={`math-adventure-feedback ${
                    showHint ? "math-adventure-feedback--hint" : ""
                  }`}
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  aria-live="polite"
                >
                  <span aria-hidden="true">{showHint ? "💡" : "↩"}</span>
                  <div>
                    <strong>{showHint ? currentHint.en : "Try again!"}</strong>
                    <small>{showHint ? currentHint.th : "ลองอีกครั้งนะ"}</small>
                  </div>
                </motion.div>
              ) : null}

              {isCelebrating ? (
                <motion.div
                  key="correct"
                  className="math-adventure-celebration"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  aria-live="polite"
                >
                  <motion.span
                    animate={{ rotate: [-8, 8, 0], scale: [0.8, 1.2, 1] }}
                  >
                    👑
                  </motion.span>
                  <strong>Brilliant!</strong>
                  <small>เก่งมาก!</small>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </ScreenShell>
  );
}

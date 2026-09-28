import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { AudioReplayButton } from "../components/AudioReplayButton";
import { MonsterCharacter } from "../components/MonsterCharacter";
import { deriveColumnSteps } from "../data/subjects/mathGenius.js";
import { ScreenShell } from "../components/ScreenShell";
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

const COLUMN_FIELD_LABELS = {
  borrowTens: { th: "หลักสิบหลังยืม", en: "Tens after borrowing" },
  borrowOnes: { th: "หลักหน่วยหลังยืม", en: "Ones after borrowing" },
  answerOnes: { th: "คำตอบหลักหน่วย", en: "Answer ones" },
  carryOnes: { th: "ตัวทดไปหลักสิบ", en: "Carry to tens" },
  answerTens: { th: "คำตอบหลักสิบ", en: "Answer tens" },
  carryTens: { th: "ตัวทดไปหลักร้อย", en: "Carry to hundreds" },
  answerHundreds: { th: "คำตอบหลักร้อย", en: "Answer hundreds" },
};

function getColumnInputFields(steps) {
  const fields = [];

  if (steps.borrow) {
    fields.push(
      { id: "borrowTens", maxLength: 1, expected: steps.borrow.adjustedTens },
      { id: "borrowOnes", maxLength: 2, expected: steps.borrow.adjustedOnes },
    );
  }

  fields.push({ id: "answerOnes", maxLength: 1, expected: steps.answer.ones });

  if (steps.carry.onesToTens > 0) {
    fields.push({ id: "carryOnes", maxLength: 1, expected: steps.carry.onesToTens });
  }

  fields.push({ id: "answerTens", maxLength: 1, expected: steps.answer.tens });

  if (steps.carry.tensToHundreds > 0) {
    fields.push({ id: "carryTens", maxLength: 1, expected: steps.carry.tensToHundreds });
  }

  if (steps.answer.hundreds > 0) {
    fields.push({
      id: "answerHundreds",
      maxLength: 1,
      expected: steps.answer.hundreds,
    });
  }

  return fields.map((field) => ({
    ...field,
    labelTh: COLUMN_FIELD_LABELS[field.id].th,
    labelEn: COLUMN_FIELD_LABELS[field.id].en,
  }));
}

function getColumnDisplay(fields, inputValues) {
  return fields
    .map((field) => inputValues[field.id] || "□")
    .join("  ");
}

function placeValueDigit(digits, place) {
  return digits[place] ?? 0;
}

function ColumnInputSlot({ field, value, active, inputRef, onSelect }) {
  return (
    <button
      type="button"
      className={`genius-column-workbook__input-slot${active ? " is-active" : ""}`}
      aria-label={`${field.labelTh} · ${field.labelEn}`}
      aria-current={active ? "step" : undefined}
      ref={inputRef}
      onClick={() => onSelect(field.id)}
    >
      {value || <span aria-hidden="true">□</span>}
    </button>
  );
}

function ColumnEquationBoard({
  activeField,
  columnFieldRefs,
  leftValue,
  inputValues,
  operator,
  onSelectField,
  rightValue,
  steps,
}) {
  const fields = getColumnInputFields(steps);
  const digitColumns = steps.answer.hundreds > 0
    ? ["hundreds", "tens", "ones"]
    : ["tens", "ones"];
  const gridStyle = { "--column-count": digitColumns.length };
  const carryFieldForColumn = {
    tens: steps.carry.onesToTens > 0 ? "carryOnes" : null,
    hundreds: steps.carry.tensToHundreds > 0 ? "carryTens" : null,
  };
  const borrowFieldForColumn = {
    tens: steps.borrow ? "borrowTens" : null,
    ones: steps.borrow ? "borrowOnes" : null,
  };
  const getField = (id) => fields.find((field) => field.id === id);

  return (
    <div className="genius-column-workbook">
      <div className="genius-column-workbook__horizontal" aria-hidden="true">
        <span>{leftValue}</span>
        <b>{operator}</b>
        <span>{rightValue}</span>
        <b>=</b>
        <strong>?</strong>
      </div>

      <div className="genius-column-workbook__paper">
        <div
          className="genius-column-workbook__labels"
          style={gridStyle}
        >
          <span aria-hidden="true" />
          {digitColumns.map((column) => (
            <span key={column}>
              <strong>
                {column === "hundreds"
                  ? "หลักร้อย"
                  : column === "tens"
                    ? "หลักสิบ"
                    : "หลักหน่วย"}
              </strong>
              <small>
                {column === "hundreds"
                  ? "Hundreds"
                  : column === "tens"
                    ? "Tens"
                    : "Ones"}
              </small>
            </span>
          ))}
        </div>

        {steps.carry.onesToTens > 0 || steps.carry.tensToHundreds > 0 ? (
          <div
            className="genius-column-workbook__regroup-row"
            style={gridStyle}
          >
            <span>
              <strong>ทด</strong>
              <small>Carry</small>
            </span>
            {digitColumns.map((column) => {
              const fieldId = carryFieldForColumn[column];
              const field = fieldId ? getField(fieldId) : null;
              return field ? (
                <ColumnInputSlot
                  key={column}
                  field={field}
                  value={inputValues[field.id]}
                  active={activeField === field.id}
                  inputRef={(node) => {
                    columnFieldRefs.current[field.id] = node;
                  }}
                  onSelect={onSelectField}
                />
              ) : (
                <span key={column} aria-hidden="true" />
              );
            })}
          </div>
        ) : null}

        <div className="genius-column-workbook__row" style={gridStyle}>
          <span
            className={
              steps.borrow ? "genius-column-workbook__borrow-label" : undefined
            }
          >
            {steps.borrow ? (
              <>
                <strong>ยืม</strong>
                <small>Borrow</small>
              </>
            ) : null}
          </span>
          {digitColumns.map((column) => {
            const fieldId = borrowFieldForColumn[column];
            const field = fieldId ? getField(fieldId) : null;
            const originalDigit = placeValueDigit(steps.left, column);
            return field ? (
              <span
                key={column}
                className="genius-column-workbook__borrow-cell"
              >
                <s aria-label={`Original ${column} ${originalDigit}`}>
                  {originalDigit}
                </s>
                <ColumnInputSlot
                  field={field}
                  value={inputValues[field.id]}
                  active={activeField === field.id}
                  inputRef={(node) => {
                    columnFieldRefs.current[field.id] = node;
                  }}
                  onSelect={onSelectField}
                />
              </span>
            ) : (
              <span key={column}>{originalDigit}</span>
            );
          })}
        </div>

        <div
          className="genius-column-workbook__row genius-column-workbook__row--second"
          style={gridStyle}
        >
          <b>{operator}</b>
          {digitColumns.map((column) => (
            <span key={column}>{placeValueDigit(steps.right, column)}</span>
          ))}
        </div>
        <div className="genius-column-workbook__line" />
        <div className="genius-column-workbook__answer" style={gridStyle}>
          <span aria-hidden="true" />
          {digitColumns.map((column) => {
            const fieldId = `answer${column[0].toUpperCase()}${column.slice(1)}`;
            const field = getField(fieldId);
            return field ? (
              <ColumnInputSlot
                key={column}
                field={field}
                value={inputValues[field.id]}
                active={activeField === field.id}
                inputRef={(node) => {
                  columnFieldRefs.current[field.id] = node;
                }}
                onSelect={onSelectField}
              />
            ) : (
              <span key={column} aria-hidden="true" />
            );
          })}
        </div>
      </div>

      <span className={`genius-column-workbook__tip is-${steps.regrouping}`}>
        {steps.borrow
          ? "1) ปรับค่าหลังยืม  2) คำตอบหลักหน่วย  3) หลักสิบ · Borrow, then ones → tens"
          : steps.carry.onesToTens > 0
            ? "1) คำตอบหลักหน่วย  2) ตัวทด  3) หลักสิบ · Ones → carry → tens"
            : "1) คำตอบหลักหน่วย  2) หลักสิบ · Ones → tens"}
      </span>
    </div>
  );
}

function HungryWormArt() {
  return (
    <div className="genius-worm" aria-label="Wiggle the Hungry Worm">
      <span className="genius-worm__antenna genius-worm__antenna--left" />
      <span className="genius-worm__antenna genius-worm__antenna--right" />
      <span className="genius-worm__head">
        <i />
        <i />
        <b />
      </span>
      <span className="genius-worm__body genius-worm__body--one" />
      <span className="genius-worm__body genius-worm__body--two" />
      <span className="genius-worm__body genius-worm__body--three" />
      <span className="genius-worm__body genius-worm__body--four" />
    </div>
  );
}

function StoryCharacter({ theme }) {
  if (theme.sceneKind === "worm") {
    return <HungryWormArt />;
  }

  return (
    <MonsterCharacter
      buddyId={theme.buddyId}
      className="genius-story-character__monster"
      title={theme.characterName}
    />
  );
}

function DailyStoryBoard({ challenge }) {
  const days = ["MON", "TUE", "WED", "THU", "FRI"];

  return (
    <div className="genius-daily-story">
      <div className="genius-story-character">
        <StoryCharacter theme={challenge.theme} />
      </div>
      <div className="genius-daily-story__days">
        {days.map((day, index) => (
          <div key={day} className="genius-day-card">
            <small>{day}</small>
            <span>{challenge.theme.itemEmoji}</span>
            <strong>{challenge.dailyValues[index]}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function StandardStoryBoard({ challenge }) {
  return (
    <div className="genius-standard-story">
      <div className="genius-story-character">
        <StoryCharacter theme={challenge.theme} />
      </div>
      <div className="genius-standard-story__copy">
        {challenge.storyLines.map((line, index) => (
          <p key={`${challenge.id}-line-${index + 1}`}>
            <span>{challenge.theme.itemEmoji}</span>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function StoryEquationBoard({
  challenge,
  operatorAnswers,
  setActiveOperatorIndex,
  typedAnswer,
}) {
  if (challenge.mode === "story-operator-input") {
    return (
      <div className="genius-story-equation">
        <strong>{challenge.leftValue}</strong>
        <button
          type="button"
          className="genius-story-equation__slot is-active"
          onClick={() => setActiveOperatorIndex(0)}
        >
          {operatorAnswers[0] || "?"}
        </button>
        <strong>{challenge.rightValue}</strong>
        <b>=</b>
        <strong>{challenge.resultValue}</strong>
      </div>
    );
  }

  if (challenge.mode === "story-chain-input") {
    return (
      <div className="genius-story-equation genius-story-equation--chain">
        <strong>{challenge.values[0]}</strong>
        <button
          type="button"
          className="genius-story-equation__slot"
          onClick={() => setActiveOperatorIndex(0)}
        >
          {operatorAnswers[0] || "?"}
        </button>
        <strong>{challenge.values[1]}</strong>
        <button
          type="button"
          className="genius-story-equation__slot"
          onClick={() => setActiveOperatorIndex(1)}
        >
          {operatorAnswers[1] || "?"}
        </button>
        <strong>{challenge.values[2]}</strong>
        <b>=</b>
        <span className="genius-story-equation__answer">{typedAnswer || "?"}</span>
      </div>
    );
  }

  if (Number.isFinite(challenge.leftValue)) {
    return (
      <div className="genius-story-equation">
        <strong>{challenge.leftValue}</strong>
        <b>{challenge.operator}</b>
        <strong>{challenge.rightValue}</strong>
        <b>=</b>
        <span className="genius-story-equation__answer">{typedAnswer || "?"}</span>
      </div>
    );
  }

  return (
    <div className="genius-story-equation genius-story-equation--total">
      <span>Total</span>
      <b>=</b>
      <span className="genius-story-equation__answer">{typedAnswer || "?"}</span>
    </div>
  );
}

export function MathGeniusGameplayScreen({
  currentChallenge,
  failedChoiceId,
  level,
  levelThemeLabel,
  onBack,
  onCorrectChoice,
  onPress,
  onWrongChoice,
  stepIndex,
  totalSteps,
  track,
}) {
  const [typedAnswer, setTypedAnswer] = useState("");
  const [operatorAnswers, setOperatorAnswers] = useState(["", ""]);
  const [columnInputs, setColumnInputs] = useState({});
  const [activeColumnField, setActiveColumnField] = useState("");
  const [activeOperatorIndex, setActiveOperatorIndex] = useState(0);
  const [inputError, setInputError] = useState("");
  const [shakeAttempt, setShakeAttempt] = useState(0);
  const columnFieldRefs = useRef({});
  const reduceMotion = useReducedMotion();

  const narration = useMemo(
    () =>
      buildBilingualNarration(
        currentChallenge.prompt,
        currentChallenge.promptTh,
      ),
    [currentChallenge.prompt, currentChallenge.promptTh],
  );
  const narrationControl = useNarration(narration);

  const isStory = currentChallenge.trackId === "story";
  const columnSteps = useMemo(
    () => (isStory ? null : deriveColumnSteps(currentChallenge)),
    [currentChallenge, isStory],
  );
  const columnFields = useMemo(
    () => (columnSteps ? getColumnInputFields(columnSteps) : []),
    [columnSteps],
  );
  const progressLabel =
    levelThemeLabel ||
    track?.levels?.[Math.max(0, Number(level || 1) - 1)]?.themeLabel ||
    track?.name ||
    (isStory ? "Story Math" : "Column Math");

  const focusColumnField = (fieldId) => {
    setActiveColumnField(fieldId);
    const focus = () => columnFieldRefs.current[fieldId]?.focus();
    focus();
    if (typeof window !== "undefined" && window.requestAnimationFrame) {
      window.requestAnimationFrame(focus);
    }
  };

  useEffect(() => {
    setTypedAnswer("");
    setOperatorAnswers(["", ""]);
    setColumnInputs({});
    setActiveColumnField("");
    setActiveOperatorIndex(0);
    setInputError("");
    setShakeAttempt(0);
  }, [currentChallenge.id]);

  useEffect(() => {
    if (isStory || columnFields.length === 0) {
      return;
    }

    setActiveColumnField((currentField) =>
      columnFields.some((field) => field.id === currentField)
        ? currentField
        : columnFields[0].id,
    );
  }, [columnFields, isStory]);

  useEffect(() => {
    if (!isStory && activeColumnField) {
      columnFieldRefs.current[activeColumnField]?.focus();
    }
  }, [activeColumnField, failedChoiceId, inputError, isStory]);

  const needsOperators = ["story-operator-input", "story-chain-input"].includes(
    currentChallenge.mode,
  );
  const needsNumber = currentChallenge.mode !== "story-operator-input";

  const advanceColumnField = (fieldId) => {
    const currentIndex = columnFields.findIndex((field) => field.id === fieldId);
    const nextField = columnFields[currentIndex + 1];
    if (nextField) {
      setActiveColumnField(nextField.id);
    }
  };

  const handleColumnDigit = (digit) => {
    const field = columnFields.find((item) => item.id === activeColumnField);
    if (!field) {
      return;
    }

    onPress();
    setInputError("");
    const currentValue = String(columnInputs[field.id] ?? "");
    const nextValue =
      currentValue.length >= field.maxLength
        ? String(digit)
        : appendDigit(currentValue, digit, field.maxLength);
    setColumnInputs((values) => ({ ...values, [field.id]: nextValue }));

    if (nextValue.length >= field.maxLength) {
      advanceColumnField(field.id);
    }
  };

  const handleColumnDelete = () => {
    const field = columnFields.find((item) => item.id === activeColumnField);
    if (!field) {
      return;
    }

    onPress();
    setInputError("");
    setColumnInputs((values) => ({ ...values, [field.id]: "" }));
  };

  const handleDigit = (digit) => {
    onPress();
    setInputError("");
    setTypedAnswer((value) =>
      appendDigit(value, digit, currentChallenge.inputMaxLength ?? 3),
    );
  };

  const handleOperator = (operator) => {
    onPress();
    setInputError("");
    setOperatorAnswers((currentValue) => {
      const nextValue = [...currentValue];
      nextValue[activeOperatorIndex] = operator;
      return nextValue;
    });

    if (
      currentChallenge.mode === "story-chain-input" &&
      activeOperatorIndex === 0
    ) {
      setActiveOperatorIndex(1);
    }
  };

  const handleDelete = () => {
    if (!isStory) {
      handleColumnDelete();
      return;
    }

    onPress();
    setInputError("");

    if (typedAnswer) {
      setTypedAnswer((value) => value.slice(0, -1));
      return;
    }

    setOperatorAnswers((currentValue) => {
      const nextValue = [...currentValue];
      nextValue[activeOperatorIndex] = "";
      return nextValue;
    });
  };

  const handleClear = () => {
    onPress();
    setInputError("");
    setTypedAnswer("");
    setOperatorAnswers(["", ""]);
    setColumnInputs({});
    if (columnFields[0]) {
      focusColumnField(columnFields[0].id);
    } else {
      setActiveColumnField("");
    }
    setActiveOperatorIndex(0);
  };

  const handleColumnCheck = () => {
    onPress();
    const firstMissing = columnFields.find(
      (field) => !String(columnInputs[field.id] ?? "").length,
    );
    if (firstMissing) {
      setInputError(
        `กรอก${firstMissing.labelTh}ก่อน · Fill ${firstMissing.labelEn} first`,
      );
      focusColumnField(firstMissing.id);
      return;
    }

    const firstIncorrect = columnFields.find(
      (field) => String(columnInputs[field.id]) !== String(field.expected),
    );
    if (firstIncorrect) {
      setInputError(
        `ลองแก้${firstIncorrect.labelTh} · Check ${firstIncorrect.labelEn}`,
      );
      focusColumnField(firstIncorrect.id);
      setShakeAttempt((value) => value + 1);
      onWrongChoice(`math-genius-column-${shakeAttempt + 1}`);
      return;
    }

    setInputError("");
    onCorrectChoice();
  };

  const handleStoryCheck = () => {
    onPress();
    const numberIsCorrect =
      !needsNumber || Number(typedAnswer) === currentChallenge.correctAnswer;
    const operatorsAreCorrect =
      !needsOperators ||
      (currentChallenge.mode === "story-operator-input"
        ? operatorAnswers[0] === currentChallenge.correctAnswer
        : currentChallenge.correctOperators.every(
            (operator, index) => operatorAnswers[index] === operator,
          ));

    if (numberIsCorrect && operatorsAreCorrect) {
      onCorrectChoice();
      return;
    }

    setInputError("ลองอีกครั้ง • Try again");
    setShakeAttempt((value) => value + 1);
    onWrongChoice(`math-genius-answer-${shakeAttempt + 1}`);
  };

  const handleCheck = () => {
    if (isStory) {
      handleStoryCheck();
      return;
    }

    handleColumnCheck();
  };

  const handleKeyDown = (event) => {
    if (isStory || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      handleColumnDigit(Number(event.key));
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      handleColumnDelete();
      return;
    }

    if (event.key === "Enter" && event.target?.tagName !== "BUTTON") {
      event.preventDefault();
      handleColumnCheck();
    }
  };

  return (
    <ScreenShell
      className="screen-shell--gameplay screen-shell--math-genius"
      variant="FocusSessionShell"
    >
      <section
        className={`genius-game genius-game--${currentChallenge.trackId}`}
        onKeyDown={handleKeyDown}
      >
        <header className="genius-game__header">
          <button
            type="button"
            className="genius-game__exit"
            onClick={() => {
              onPress();
              onBack();
            }}
          >
            ← Map
          </button>

          <div className="genius-game__heading">
            <span>
              {track?.name || (isStory ? "Story Math" : "Column Math")} · Level {level}
            </span>
            <h2>{currentChallenge.title}</h2>
            <p>{currentChallenge.promptTh}</p>
          </div>

          <AudioReplayButton
            available={narrationControl.isAvailable}
            isSpeaking={narrationControl.isSpeaking}
            label="ฟังโจทย์อีกครั้ง"
            onReplay={() => {
              onPress();
              narrationControl.replay();
            }}
          />
        </header>

        <div className="genius-game__progress">
          <div>
            <strong>{progressLabel}</strong>
            <span>Problem {stepIndex}/{totalSteps}</span>
          </div>
          <i>
            <span style={{ width: `${(stepIndex / totalSteps) * 100}%` }} />
          </i>
        </div>

        <motion.div
          key={`${currentChallenge.id}-${shakeAttempt}-${failedChoiceId}`}
          className="genius-game__workspace"
          animate={
            inputError && !reduceMotion
              ? { x: [0, -9, 9, -6, 6, 0] }
              : { opacity: 1, x: 0 }
          }
          transition={{ duration: reduceMotion ? 0 : 0.32 }}
        >
          <div className="genius-game__problem">
            {isStory ? (
              <>
                {currentChallenge.storyKind === "daily-total" ? (
                  <DailyStoryBoard challenge={currentChallenge} />
                ) : (
                  <StandardStoryBoard challenge={currentChallenge} />
                )}
                <StoryEquationBoard
                  challenge={currentChallenge}
                  operatorAnswers={operatorAnswers}
                  setActiveOperatorIndex={setActiveOperatorIndex}
                  typedAnswer={typedAnswer}
                />
              </>
            ) : (
              <ColumnEquationBoard
                activeField={activeColumnField}
                columnFieldRefs={columnFieldRefs}
                leftValue={currentChallenge.leftValue}
                inputValues={columnInputs}
                operator={currentChallenge.operator}
                onSelectField={setActiveColumnField}
                rightValue={currentChallenge.rightValue}
                steps={columnSteps}
              />
            )}
          </div>

          <aside className="genius-input-panel">
            <div className="genius-input-panel__display">
              <small>
                {isStory ? "Your answer" : "หลักหน่วยก่อน · Ones first"}
              </small>
              <strong>
                {isStory
                  ? `${needsOperators ? operatorAnswers.filter(Boolean).join(" ") || "Sign" : ""}${needsOperators && needsNumber ? " · " : ""}${needsNumber ? typedAnswer || "?" : ""}`
                  : getColumnDisplay(columnFields, columnInputs)}
              </strong>
              <span
                role={inputError ? "alert" : "status"}
                aria-live="polite"
              >
                {inputError ||
                  (isStory
                    ? "Use the keypad, then press Check."
                    : "แตะช่องบนกระดาษเพื่อแก้ไข · Tap a slot to edit")}
              </span>
            </div>

            {needsOperators ? (
              <div className="genius-operator-pad">
                {["+", "-"].map((operator) => (
                  <button
                    key={operator}
                    type="button"
                    aria-label={`Choose operator ${operator}`}
                    onClick={() => handleOperator(operator)}
                  >
                    {operator}
                  </button>
                ))}
              </div>
            ) : null}

            {needsNumber ? (
              <div className="genius-number-pad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    aria-label={`Enter digit ${digit}`}
                    onClick={() =>
                      isStory ? handleDigit(digit) : handleColumnDigit(digit)
                    }
                  >
                    {digit}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="genius-input-panel__tools">
              <button type="button" onClick={handleDelete}>
                Delete
              </button>
              <button type="button" onClick={handleClear}>
                Clear
              </button>
              <button
                type="button"
                className="genius-input-panel__check"
                onClick={handleCheck}
              >
                Check
              </button>
            </div>
          </aside>
        </motion.div>
      </section>
    </ScreenShell>
  );
}

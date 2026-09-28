import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { AudioReplayButton } from "../components/AudioReplayButton";
import { HandGuide } from "../components/HandGuide";
import { ScreenShell } from "../components/ScreenShell";
import {
  VocabularyMeta,
  VocabularyVisual,
} from "../components/VocabularyAnswer";
import { normalizeMathSceneChallenge } from "../data/subjects/math";
import { useNarration } from "../hooks/useNarration";
import { buildEnglishInstructionSequence } from "../utils/narrationScript";

function WorkbookScene({ animals, sceneMeta, operator }) {
  const removedIds = new Set(sceneMeta?.removedIds ?? []);
  const isSubtraction = operator === "-";

  return (
    <div
      className={`math-scene-board ${isSubtraction ? "math-scene-board--remove" : ""}`}
      role="group"
      aria-label={
        isSubtraction
          ? "Count every animal. Animals marked with a minus are taken away."
          : "Count only the two animal groups named below."
      }
    >
      <div className="math-scene-board__header">
        <strong>
          {isSubtraction ? "Count and take away" : "Count the named animals"}
        </strong>
        <span>
          {isSubtraction
            ? "Count all first, then count the animals marked with a minus."
            : "Other animals may be helpers. Count only the two groups named below."}
        </span>
      </div>

      <div className="math-scene-board__grid" role="list" aria-label="Animals to count">
        {animals.map((animal, index) => {
          const isRemoved = removedIds.has(animal.id);
          const categoryKey = animal.wordId || animal.word;
          const categoryIndex = animals
            .slice(0, index + 1)
            .filter((item) => (item.wordId || item.word) === categoryKey).length;

          return (
            <motion.div
              key={animal.id}
              className={`math-scene-board__sprite ${
                isRemoved ? "math-scene-board__sprite--removed" : ""
              }`}
              role="listitem"
              aria-label={`${animal.word} ${categoryIndex}${
                isRemoved ? ", marked to take away" : ""
              }`}
              initial={{ opacity: 0, y: 10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.08, duration: 0.28 }}
            >
              <VocabularyVisual
                word={animal}
                className="math-scene-board__sprite-image"
                decorative
              />
              {isRemoved ? (
                <span className="math-scene-board__remove-badge" aria-hidden="true">
                  −
                </span>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function appendDigit(currentValue, digit) {
  if (currentValue.length >= 2) {
    return currentValue;
  }

  if (currentValue === "0") {
    return String(digit);
  }

  return `${currentValue}${digit}`;
}

function focusOnNextFrame(ref) {
  window.requestAnimationFrame(() => ref.current?.focus());
}

export function MathGameplayScreen({
  currentChallenge,
  failedChoiceId,
  level,
  onBack,
  onCorrectChoice,
  onPress,
  onWrongChoice,
  stepIndex,
  totalSteps,
}) {
  const challenge = useMemo(
    () => normalizeMathSceneChallenge(currentChallenge),
    [currentChallenge],
  );
  const isSubtraction = challenge.operator === "-";
  const countFieldLabels = isSubtraction
    ? { left: "Start group", right: "Take away" }
    : { left: "First group", right: "Second group" };
  const narrationScript = useMemo(
    () =>
      buildEnglishInstructionSequence(
        isSubtraction
          ? [
              "Look at the pictures.",
              `Count all the ${challenge.leftAnimal.word}.`,
              `Count the ${challenge.rightAnimal.word} marked with a minus.`,
              "Check both counts, then choose how many are left.",
            ]
          : [
              "Look at the pictures.",
              `Count only the ${challenge.leftAnimal.word}.`,
              `Count only the ${challenge.rightAnimal.word}.`,
              "Check both counts, then choose the total.",
            ],
      ),
    [challenge.leftAnimal.word, challenge.rightAnimal.word, isSubtraction],
  );
  const narration = useNarration(narrationScript);
  const leftCountRef = useRef(null);
  const rightCountRef = useRef(null);
  const firstAnswerRef = useRef(null);
  const [selectedCountField, setSelectedCountField] = useState("left");
  const [typedCounts, setTypedCounts] = useState({ left: "", right: "" });
  const [countError, setCountError] = useState("");
  const [invalidCountField, setInvalidCountField] = useState("");
  const [countsVerified, setCountsVerified] = useState(false);

  const answerChoices = challenge.answerChoices ?? [];
  const countsReady = typedCounts.left !== "" && typedCounts.right !== "";
  const countsAreCorrect =
    Number(typedCounts.left) === challenge.leftCount &&
    Number(typedCounts.right) === challenge.rightCount;
  const countStatusMessage = countError
    ? countError
    : countsVerified
      ? isSubtraction
        ? "Counts correct. Choose how many are left."
        : "Counts correct. Choose the total."
      : countsReady
        ? "Press Check counts before choosing an answer."
        : isSubtraction
          ? "Enter the start group and the animals marked to take away."
          : "Enter the first group and the second group.";
  const equationLeft = countsVerified ? challenge.leftCount : "?";
  const equationRight = countsVerified ? challenge.rightCount : "?";
  const keypadLabel = `Number pad for ${countFieldLabels[
    selectedCountField
  ].toLowerCase()}`;

  useEffect(() => {
    setSelectedCountField("left");
    setTypedCounts({ left: "", right: "" });
    setCountError("");
    setInvalidCountField("");
    setCountsVerified(false);
  }, [challenge.id]);

  const resetCountVerification = () => {
    setCountError("");
    setInvalidCountField("");
    setCountsVerified(false);
  };

  const selectCountField = (field) => {
    onPress();
    setSelectedCountField(field);
    setCountError("");
    setInvalidCountField("");
  };

  const handleDigitPress = (digit) => {
    onPress();
    resetCountVerification();
    setTypedCounts((currentValue) => ({
      ...currentValue,
      [selectedCountField]: appendDigit(currentValue[selectedCountField], digit),
    }));
  };

  const handleDelete = () => {
    onPress();
    resetCountVerification();
    setTypedCounts((currentValue) => ({
      ...currentValue,
      [selectedCountField]: currentValue[selectedCountField].slice(0, -1),
    }));
  };

  const handleClearAll = () => {
    onPress();
    resetCountVerification();
    setTypedCounts({ left: "", right: "" });
    setSelectedCountField("left");
    focusOnNextFrame(leftCountRef);
  };

  const handleCheckCounts = () => {
    onPress();
    setCountsVerified(false);

    const firstMissingField =
      typedCounts.left === "" ? "left" : typedCounts.right === "" ? "right" : "";

    if (firstMissingField) {
      setInvalidCountField(firstMissingField);
      setSelectedCountField(firstMissingField);
      setCountError(
        `Enter the ${countFieldLabels[firstMissingField].toLowerCase()} count first.`,
      );
      focusOnNextFrame(
        firstMissingField === "left" ? leftCountRef : rightCountRef,
      );
      return;
    }

    if (!countsAreCorrect) {
      const firstIncorrectField =
        Number(typedCounts.left) !== challenge.leftCount ? "left" : "right";
      setInvalidCountField(firstIncorrectField);
      setSelectedCountField(firstIncorrectField);
      setCountError(
        `Count the ${countFieldLabels[firstIncorrectField].toLowerCase()} again.`,
      );
      onWrongChoice("math-counts");
      focusOnNextFrame(
        firstIncorrectField === "left" ? leftCountRef : rightCountRef,
      );
      return;
    }

    setCountError("");
    setInvalidCountField("");
    setCountsVerified(true);
    focusOnNextFrame(firstAnswerRef);
  };

  const handleListen = () => {
    onPress();
    narration.replay();
  };

  const handleAnswerChoice = (choiceId, choice) => {
    if (!countsVerified) {
      return;
    }

    onPress();

    if (choice === challenge.answer) {
      onCorrectChoice();
      return;
    }

    onWrongChoice(choiceId);
  };

  const renderCountCard = (field, animal, extraClassName = "") => {
    const isSelected = selectedCountField === field;
    const isInvalid = invalidCountField === field;
    const countValue = typedCounts[field];

    return (
      <button
        ref={field === "left" ? leftCountRef : rightCountRef}
        type="button"
        className={`math-target-card ${extraClassName} ${
          isSelected ? "math-target-card--active" : ""
        } ${isInvalid ? "math-target-card--invalid" : ""} ${
          countsVerified ? "math-target-card--verified" : ""
        } math-workbook-row__${field}`.trim()}
        aria-pressed={isSelected}
        aria-invalid={isInvalid || undefined}
        aria-describedby="math-count-status"
        aria-label={`${countFieldLabels[field]}: ${animal.word}. Current count ${
          countValue || "not entered"
        }.`}
        onClick={() => selectCountField(field)}
      >
        <div className="math-target-card__media">
          <VocabularyVisual
            word={animal}
            className="math-target-card__image math-target-card__image--animal"
            decorative
          />
          <div className="math-target-card__copy">
            <small className="math-target-card__eyebrow">
              {countFieldLabels[field]}
            </small>
            <strong>{animal.word}</strong>
            <VocabularyMeta word={animal} className="math-target-card__details" />
          </div>
        </div>
        <div
          className={`math-count-input ${
            isSubtraction && field === "right" ? "math-count-input--remove" : ""
          }`}
        >
          <small>{countsVerified ? "Checked" : "Type number"}</small>
          <div className="math-count-input__badge" aria-hidden="true">
            {countsVerified ? "✓" : "123"}
          </div>
          <span>{countValue || "?"}</span>
        </div>
      </button>
    );
  };

  return (
    <ScreenShell
      className="screen-shell--gameplay screen-shell--math-quest"
      variant="FocusSessionShell"
    >
      <section className="game-card game-card--math game-card--math-quest">
        <div className="game-card__prompt game-card__prompt--math">
          <p className="eyebrow">
            {isSubtraction ? "Count and Subtract" : "Count and Add"}
          </p>
          <h2>{isSubtraction ? "How many are left?" : "How many animals?"}</h2>
          <p className="game-card__subject-note">
            {isSubtraction
              ? "Count all, count the marked animals to take away, then check both counts."
              : "Count only the two named animals, then check both counts."}
          </p>
          <AudioReplayButton
            available={narration.isAvailable}
            className="game-card__audio-action"
            isSpeaking={narration.isSpeaking}
            label="ฟังโจทย์คณิตอีกครั้ง"
            onReplay={handleListen}
          />
          <p className="game-card__level-note">{`Level ${level} · Challenge ${stepIndex}/${totalSteps}`}</p>
        </div>

        <div
          className="activity-board activity-board--mathquest activity-board--tgs"
          aria-label="Task, groups, and solution"
        >
          <div className="math-tgs-zone math-tgs-zone--task" data-tgs-step="1 · Task">
            <WorkbookScene
              animals={challenge.sceneAnimals}
              operator={challenge.operator}
              sceneMeta={challenge.sceneMeta}
            />
          </div>

          <div
            className="math-workbook-row math-tgs-zone math-tgs-zone--groups"
            data-tgs-step="2 · Groups"
          >
            {renderCountCard("left", challenge.leftAnimal)}

            <div
              className={`math-stage__operator math-workbook-row__plus ${
                isSubtraction ? "math-stage__operator--minus" : ""
              }`}
              aria-hidden="true"
            >
              <span>{challenge.operator}</span>
            </div>

            {renderCountCard(
              "right",
              challenge.rightAnimal,
              "math-target-card--blue",
            )}

            <div className="math-answer-cluster math-workbook-row__answer">
              <div
                className="math-stage__operator math-stage__operator--equals math-workbook-row__equals"
                aria-hidden="true"
              >
                <span>=</span>
              </div>
              <div className="math-stage__answer-cloud" aria-label="Answer not chosen">
                <span>?</span>
              </div>
            </div>
          </div>

          <div className="math-count-panel">
            <div className="math-count-panel__header">
              <strong>{`Enter the ${countFieldLabels[selectedCountField].toLowerCase()}`}</strong>
              <span
                id="math-count-status"
                className={countError ? "math-count-panel__status--error" : ""}
                role={countError ? "alert" : "status"}
                aria-live="polite"
              >
                {countStatusMessage}
              </span>
            </div>

            <div
              className={`math-equation-readout ${
                countsVerified ? "math-equation-readout--verified" : ""
              }`}
              aria-label={
                countsVerified
                  ? `Verified equation ${equationLeft} ${challenge.operator} ${equationRight} equals unknown`
                  : `Equation not checked: unknown ${challenge.operator} unknown equals unknown`
              }
            >
              <span>{equationLeft}</span>
              <strong aria-hidden="true">{challenge.operator}</strong>
              <span>{equationRight}</span>
              <strong aria-hidden="true">=</strong>
              <span>?</span>
            </div>

            <div
              className={`math-count-panel__tag ${
                isSubtraction && selectedCountField === "right"
                  ? "math-count-panel__tag--remove"
                  : ""
              }`}
            >
              {keypadLabel}
            </div>

            <div className="math-keypad" aria-label={keypadLabel} role="group">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  className="math-keypad__key"
                  aria-label={`Enter digit ${digit} for ${countFieldLabels[
                    selectedCountField
                  ].toLowerCase()}`}
                  onClick={() => handleDigitPress(digit)}
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                className="math-keypad__key math-keypad__key--delete"
                aria-label={`Delete the last digit from ${countFieldLabels[
                  selectedCountField
                ].toLowerCase()}`}
                onClick={handleDelete}
              >
                Delete
              </button>
              <button
                type="button"
                className="math-keypad__key math-keypad__key--clear"
                aria-label="Clear both counts"
                onClick={handleClearAll}
              >
                Clear
              </button>
            </div>

            <button
              type="button"
              className="math-check-counts-button"
              disabled={countsVerified}
              aria-describedby="math-count-status"
              onClick={countsVerified ? undefined : handleCheckCounts}
            >
              <span aria-hidden="true">{countsVerified ? "✓" : "123"}</span>
              {countsVerified ? "Counts correct" : "Check counts"}
            </button>
          </div>

          <div
            className="math-answer-grid math-tgs-zone math-tgs-zone--solution"
            data-tgs-step="3 · Solution"
            aria-label={
              countsVerified
                ? "Choose the final answer"
                : "Final answers are available after both counts are checked"
            }
          >
            {answerChoices.map((choice, index) => {
              const choiceId = `math-answer-${choice}`;
              const isWrong = failedChoiceId === choiceId;

              return (
                <motion.button
                  ref={index === 0 ? firstAnswerRef : undefined}
                  key={choiceId}
                  type="button"
                  disabled={!countsVerified}
                  className={`math-answer-card ${
                    countsVerified ? "" : "math-answer-card--locked"
                  }`}
                  whileHover={countsVerified ? { y: -5 } : undefined}
                  whileTap={countsVerified ? { scale: 0.96 } : undefined}
                  animate={isWrong ? { x: [0, -12, 12, -8, 8, 0] } : undefined}
                  transition={isWrong ? { duration: 0.35 } : undefined}
                  aria-label={`Answer ${choice}${
                    countsVerified ? "" : ", locked until counts are checked"
                  }`}
                  aria-describedby="math-count-status"
                  onClick={
                    countsVerified
                      ? () => handleAnswerChoice(choiceId, choice)
                      : undefined
                  }
                >
                  <span className="math-answer-card__number">{choice}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <HandGuide />
      </section>
    </ScreenShell>
  );
}

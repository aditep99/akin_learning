import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import monsterMint from "../assets/characters/buddy-monster-mint.svg";
import monsterPlum from "../assets/characters/buddy-monster-plum.svg";
import monsterSun from "../assets/characters/buddy-monster-sun.svg";
import { AudioReplayButton } from "../components/AudioReplayButton";
import { HandGuide } from "../components/HandGuide";
import { ScreenShell } from "../components/ScreenShell";
import {
  VocabularyLabel,
  VocabularyMeta,
  VocabularyVisual,
} from "../components/VocabularyAnswer";
import { getChallengeRevealState } from "../data/challengeReveal";
import { speakWordWithPhonics, useNarration } from "../hooks/useNarration";
import { isAnimalPhotoWord } from "../utils/wordImage";

function getPromptMessage(challenge) {
  switch (challenge.mode) {
    case "sound-pick":
      return "Listen and tap the correct picture.";
    case "odd-one-out":
      return challenge.promptText || "Which one does not belong?";
    case "sort-two-baskets":
      return challenge.promptText || "Sort the pictures into the right groups.";
    case "hotspot-place":
      return `Find ${challenge.promptWord}.`;
    default:
      return `Find ${challenge.promptWord || challenge.word}.`;
  }
}

function hiddenPromptMessage(challenge) {
  switch (challenge.mode) {
    case "sound-pick":
      return "Listen and find the picture.";
    case "odd-one-out":
      return "Look carefully and find the odd one out.";
    case "sort-two-baskets":
      return "Sort the pictures into the right groups.";
    case "hotspot-place":
      return "Find the correct body part.";
    default:
      return "Look at the pictures and choose.";
  }
}

function getChoiceObjective(challenge) {
  switch (challenge.surfaceVariant) {
    case "pronoun-scene":
      return "Complete the sentence with the right pronoun!";
    case "singular-plural-scene":
      return "Choose one or many to match the picture!";
    case "spatial-scene":
      return "Choose the position that completes the sentence!";
    default:
      break;
  }

  switch (challenge.mode) {
    case "sound-pick":
      return "Listen and choose the matching picture!";
    case "word-to-picture":
      return "Match the word to its picture!";
    case "odd-one-out":
      return "Choose the picture that does not belong!";
    case "vocab-choice":
      return "Choose the best answer!";
    default:
      return "Choose the correct picture!";
  }
}

function getMissionTheme(challenge, levelThemeLabel) {
  const themeText = `${levelThemeLabel || ""} ${challenge.subjectName || ""}`.toLowerCase();

  if (themeText.includes("vegetable") || themeText.includes("fruit")) {
    return "garden";
  }

  if (themeText.includes("animal")) {
    return "safari";
  }

  if (themeText.includes("school") || themeText.includes("thing")) {
    return "town";
  }

  return "sky";
}

function ChoiceCard({
  choice,
  index,
  isWrong,
  onSelect,
  subjectId = "",
  surfaceVariant = "",
}) {
  const isAnimalPhoto = isAnimalPhotoWord(choice);
  const isSciencePhoto = subjectId === "science-exercises";
  const slotLabel = String.fromCharCode(65 + index);
  const variantClass = surfaceVariant.replace(/[^a-z0-9-]/gi, "-");
  const variantCue =
    surfaceVariant === "pronoun-scene"
      ? "pronoun"
      : surfaceVariant === "singular-plural-scene"
        ? choice.word?.endsWith("s")
          ? "more than one"
          : "one"
        : surfaceVariant === "spatial-scene"
          ? "position word"
          : "answer";

  return (
    <motion.button
      key={choice.id}
      type="button"
      className={`choice-card ${variantClass ? `choice-card--${variantClass}` : ""} ${
        isSciencePhoto ? "choice-card--science-photo" : ""
      }`.trim()}
      aria-label={`Option ${slotLabel}: ${choice.word}, ${variantCue}`}
      data-surface-variant={surfaceVariant || undefined}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      animate={isWrong ? { x: [0, -12, 12, -8, 8, 0] } : { x: 0 }}
      transition={isWrong ? { duration: 0.35 } : { duration: 0.18 }}
      onClick={onSelect}
    >
      <span className="choice-card__slot">{slotLabel}</span>
      <span className="choice-card__shine" aria-hidden="true" />
      <div
        className={`choice-card__media choice-card__art ${
          isAnimalPhoto
            ? "choice-card__media--portrait choice-card__art--animal"
            : ""
        }`}
      >
        <VocabularyVisual
          word={choice}
          className="choice-card__visual"
          imageClassName={`choice-card__image ${
            isAnimalPhoto ? "choice-card__image--animal" : ""
          }`}
        />
      </div>
      <div className="choice-card__answer-meta">
        <VocabularyLabel value={choice.word} showValue className="choice-card__word" />
        <VocabularyMeta word={choice} className="choice-card__details" />
      </div>
      {surfaceVariant === "pronoun-scene" ? (
        <span className="choice-card__surface-cue">Pronoun</span>
      ) : null}
      {surfaceVariant === "singular-plural-scene" ? (
        <span className="choice-card__surface-cue">
          {choice.word?.endsWith("s") ? "Many" : "One"}
        </span>
      ) : null}
      {surfaceVariant === "spatial-scene" ? (
        <span className="choice-card__surface-cue">Position</span>
      ) : null}
    </motion.button>
  );
}

function SortBoard({
  challenge,
  failedChoiceId,
  onCorrectChoice,
  onPress,
  subjectId = "",
  onWrongChoice,
}) {
  const [selectedBasketId, setSelectedBasketId] = useState(challenge.baskets[0]?.id || "");
  const [placedItems, setPlacedItems] = useState({});

  useEffect(() => {
    setSelectedBasketId(challenge.baskets[0]?.id || "");
    setPlacedItems({});
  }, [challenge.id, challenge.baskets]);

  useEffect(() => {
    if (
      challenge.items.length > 0 &&
      Object.keys(placedItems).length === challenge.items.length
    ) {
      onCorrectChoice();
    }
  }, [challenge.items.length, onCorrectChoice, placedItems]);

  const handlePlace = (item) => {
    if (placedItems[item.id]) {
      return;
    }

    onPress();

    if (selectedBasketId !== item.basketId) {
      onWrongChoice(`${challenge.id}-sort`);
      return;
    }

    setPlacedItems((currentValue) => ({
      ...currentValue,
      [item.id]: item.basketId,
    }));
  };

  return (
    <div className="sort-stage">
      <div className="sort-stage__baskets">
        {challenge.baskets.map((basket) => (
          <button
            key={basket.id}
            type="button"
            className={`sort-basket ${
              selectedBasketId === basket.id ? "sort-basket--active" : ""
            }`}
            onClick={() => {
              onPress();
              setSelectedBasketId(basket.id);
            }}
          >
            <strong>{basket.label}</strong>
            <span>
              {
                challenge.items.filter((item) => placedItems[item.id] === basket.id)
                  .length
              }{" "}
              sorted
            </span>
          </button>
        ))}
      </div>

      <div className="sort-stage__items">
        {challenge.items.map((item) => {
          if (placedItems[item.id]) {
            return null;
          }

          return (
            <button
              key={item.id}
              type="button"
              className={`sort-item ${
                failedChoiceId === `${challenge.id}-sort` ? "sort-item--wrong" : ""
              } ${subjectId === "science-exercises" ? "sort-item--science-photo" : ""}`.trim()}
              aria-label={`Sort ${item.word} into ${selectedBasketId}`}
              onClick={() => handlePlace(item)}
            >
              <VocabularyVisual
                word={item}
                className="sort-item__visual"
                imageClassName="sort-item__image"
              />
              <strong>{item.word}</strong>
              <VocabularyMeta word={item} className="sort-item__details" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HotspotBoard({
  challenge,
  failedChoiceId,
  onCorrectChoice,
  onPress,
  onWrongChoice,
}) {
  return (
    <div className="hotspot-stage" data-game-layout="hotspot">
      <div className="hotspot-stage__frame">
        <div className="hotspot-stage__figure">
          <img src={challenge.bodyImage} alt="A child body figure" className="hotspot-stage__image" />
          {challenge.hotspots.map((hotspot) => (
            <button
              key={hotspot.id}
              type="button"
              aria-label={`Select ${hotspot.word.word}`}
              className={`hotspot-dot ${
                failedChoiceId === `${challenge.id}-hotspot-${hotspot.id}`
                  ? "hotspot-dot--wrong"
                  : ""
              }`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              onClick={() => {
                onPress();

                if (hotspot.id === challenge.targetHotspotId) {
                  onCorrectChoice();
                  return;
                }

                onWrongChoice(`${challenge.id}-hotspot-${hotspot.id}`);
              }}
            >
              <span />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GameplayScreen({
  currentChallenge,
  level,
  levelThemeLabel,
  subjectId = "",
  failedChoiceId,
  onBack,
  onCorrectChoice,
  onWrongChoice,
  onPress,
  stepIndex,
  totalSteps,
  wrongAttempts = 0,
}) {
  const { remainingMisses, shouldReveal } = getChallengeRevealState(wrongAttempts);
  const promptVocabulary = {
    ...currentChallenge,
    ...(currentChallenge.reviewWord || {}),
    translation:
      currentChallenge.reviewWord?.translation || currentChallenge.translation,
    pronunciation:
      currentChallenge.reviewWord?.pronunciation || currentChallenge.pronunciation,
  };
  const promptMessage = getPromptMessage(currentChallenge);
  const promptWord = currentChallenge.promptWord || currentChallenge.word;
  const surfaceVariant = currentChallenge.surfaceVariant || "";
  const showPromptWord = currentChallenge.showPromptWord !== false;
  const eyebrow = levelThemeLabel || currentChallenge.eyebrow || "Find";
  const isChoiceMode = [
    "picture-pick",
    "sound-pick",
    "word-to-picture",
    "odd-one-out",
    "vocab-choice",
  ].includes(currentChallenge.mode);
  const usesFullStageLayout = isChoiceMode || ["sort-two-baskets", "hotspot-place"].includes(
    currentChallenge.mode,
  );
  const revealVocabulary = shouldReveal;
  const hintTriesLeft = remainingMisses;
  const missionTheme = getMissionTheme(currentChallenge, levelThemeLabel);
  const missionBuddy =
    missionTheme === "garden"
      ? monsterMint
      : missionTheme === "safari"
        ? monsterSun
        : monsterPlum;
  const gameCardClassName = `game-card game-card--${currentChallenge.mode} ${
    usesFullStageLayout ? "game-card--full-stage" : ""
  } ${
    isChoiceMode
      ? `game-card--choices game-card--mission-board game-card--choice-stage mission-theme--${missionTheme}`
      : ""
  }`.trim();
  const activityBoardClassName = `activity-board activity-board--${currentChallenge.mode} ${
    usesFullStageLayout ? "activity-board--full-stage" : ""
  } ${isChoiceMode ? "activity-board--choices" : ""}`.trim();
  const titleText = currentChallenge.promptText || (
    currentChallenge.mode === "sound-pick" ||
    currentChallenge.mode === "odd-one-out" ||
    currentChallenge.mode === "sort-two-baskets" ||
    currentChallenge.mode === "hotspot-place"
      ? promptMessage
      : promptWord
        ? `Find ${promptWord}`
        : promptMessage
  );
  const surfaceVariantClass = surfaceVariant.replace(/[^a-z0-9-]/gi, "-");
  const hiddenTitleText = hiddenPromptMessage(currentChallenge);

  const promptNarration = useNarration(promptMessage, { autoPlay: false });

  useEffect(() => {
    if (!promptWord) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      speakWordWithPhonics(
        promptWord,
        currentChallenge.reviewWord?.phonics || currentChallenge.phonics,
      );
    }, currentChallenge.mode === "sound-pick" ? 450 : 900);

    return () => window.clearTimeout(timeoutId);
  }, [
    currentChallenge.mode,
    currentChallenge.phonics,
    currentChallenge.reviewWord?.phonics,
    promptWord,
  ]);

  const handleListen = () => {
    if (!promptWord) {
      return;
    }

    onPress();
    speakWordWithPhonics(
      promptWord,
      currentChallenge.reviewWord?.phonics || currentChallenge.phonics,
    );
  };

  const handleChoice = (choice) => {
    onPress();
    const choiceId = choice.id;
    const correctId = currentChallenge.correctChoiceId || currentChallenge.id;

    if (choiceId === correctId) {
      onCorrectChoice(choice);
      return;
    }

    onWrongChoice(choiceId);
  };

  const handleGameplayWrongChoice = (choiceId) => {
    onWrongChoice(choiceId);
  };

  return (
    <ScreenShell
      className={`screen-shell--gameplay ${
        usesFullStageLayout ? "screen-shell--full-stage" : ""
      }`.trim()}
      variant="FocusSessionShell"
    >
      <section className={gameCardClassName} data-game-mode={currentChallenge.mode}>
        {isChoiceMode ? (
          <div className="mission-board__scenery" aria-hidden="true">
            <span className="mission-board__cloud mission-board__cloud--one" />
            <span className="mission-board__cloud mission-board__cloud--two" />
            <span className="mission-board__star mission-board__star--one">★</span>
            <span className="mission-board__star mission-board__star--two">✦</span>
          </div>
        ) : null}
        {isChoiceMode ? (
          <header className="choice-stage__header">
            <div className="choice-stage__mission">
              <p className="eyebrow">Mission Brief · {eyebrow}</p>
              <h2>
                {showPromptWord
                  ? revealVocabulary
                    ? titleText
                    : hiddenTitleText
                  : promptMessage}
              </h2>
              <div className="choice-stage__status" aria-label="Mission status">
                <span>Level {level}</span>
                <span>{currentChallenge.mode}</span>
                <span>{totalSteps - stepIndex + 1} left</span>
              </div>
            </div>

            <div className="choice-stage__coach">
              <img src={missionBuddy} alt="Mission buddy" />
              <div className="choice-stage__coach-copy">
                <strong>
                  {revealVocabulary ? "Word help unlocked!" : "Look, listen, choose."}
                </strong>
                {revealVocabulary ? (
                  <VocabularyMeta
                    word={promptVocabulary}
                    className="choice-stage__coach-meta"
                  />
                ) : (
                  <span>
                    {hintTriesLeft > 0
                      ? `Hint opens after ${hintTriesLeft} more miss${
                          hintTriesLeft === 1 ? "" : "es"
                        }.`
                      : "Your word hint is ready."}
                  </span>
                )}
              </div>
              <AudioReplayButton
                available={Boolean(promptWord) && promptNarration.isAvailable}
                isSpeaking={promptNarration.isSpeaking}
                label="ฟังคำศัพท์อีกครั้ง"
                onReplay={handleListen}
              />
            </div>
          </header>
        ) : null}

        {!isChoiceMode ? (
          <>
        <div className="game-card__prompt">
          <p className="eyebrow">Mission Brief · {eyebrow}</p>
          <h2>
            {showPromptWord
              ? revealVocabulary
                ? titleText
                : hiddenTitleText
              : promptMessage}
          </h2>
          <p className="game-card__subject-note">
            {currentChallenge.subjectIcon} {currentChallenge.subjectName}
          </p>
          {revealVocabulary ? (
            <VocabularyMeta
              word={promptVocabulary}
              className="game-card__pronunciation-inline"
            />
          ) : null}
          <AudioReplayButton
            available={Boolean(promptWord) && promptNarration.isAvailable}
            className="game-card__audio-action"
            isSpeaking={promptNarration.isSpeaking}
            label="ฟังคำศัพท์อีกครั้ง"
            onReplay={handleListen}
          />
          <p className="game-card__level-note">{`Level ${level} · Word ${stepIndex}/${totalSteps}`}</p>
        </div>
          </>
        ) : null}

        <div
          className={`${activityBoardClassName} ${
            isChoiceMode ? "choice-stage__answers" : ""
          }`.trim()}
        >
          {isChoiceMode ? (
            <>
              <div className="choice-mission-banner">
                <div>
                  <span>Mission Objective</span>
                  <strong>{getChoiceObjective(currentChallenge)}</strong>
                </div>
                <div className="choice-mission-banner__energy" aria-label="Mission energy">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
        <div
          className={`choice-grid ${
            surfaceVariantClass ? `choice-grid--${surfaceVariantClass}` : ""
          }`.trim()}
          data-surface-variant={surfaceVariant || undefined}
        >
                {currentChallenge.choices.map((choice, index) => (
                  <ChoiceCard
                    key={choice.id}
                    choice={choice}
                    index={index}
                    isWrong={
                      failedChoiceId === choice.id ||
                      failedChoiceId === `${currentChallenge.id}-choice`
                    }
                    subjectId={subjectId}
                    surfaceVariant={surfaceVariant}
                    onSelect={() => handleChoice(choice)}
                  />
                ))}
              </div>
            </>
          ) : null}

          {currentChallenge.mode === "sort-two-baskets" ? (
            <SortBoard
              challenge={currentChallenge}
              failedChoiceId={failedChoiceId}
              onCorrectChoice={onCorrectChoice}
              onPress={onPress}
              subjectId={subjectId}
              onWrongChoice={handleGameplayWrongChoice}
            />
          ) : null}

          {currentChallenge.mode === "hotspot-place" ? (
            <HotspotBoard
              challenge={currentChallenge}
              failedChoiceId={failedChoiceId}
              onCorrectChoice={onCorrectChoice}
              onPress={onPress}
              onWrongChoice={handleGameplayWrongChoice}
            />
          ) : null}
        </div>

        <HandGuide />
      </section>
    </ScreenShell>
  );
}

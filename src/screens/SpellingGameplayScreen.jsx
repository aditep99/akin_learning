import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import monsterMint from "../assets/characters/buddy-monster-mint.svg";
import monsterPlum from "../assets/characters/buddy-monster-plum.svg";
import monsterSun from "../assets/characters/buddy-monster-sun.svg";
import { AudioReplayButton } from "../components/AudioReplayButton";
import { HandGuide } from "../components/HandGuide";
import { ScreenShell } from "../components/ScreenShell";
import {
  VocabularyMeta,
  VocabularyVisual,
} from "../components/VocabularyAnswer";
import { getChallengeRevealState } from "../data/challengeReveal";
import { speakPhrase, speakWordWithPhonics } from "../hooks/useNarration";

function speakChallenge(challenge) {
  if (challenge.language === "th") {
    speakPhrase(challenge.word, "th-TH", 0.76, 1);
    return;
  }

  speakWordWithPhonics(challenge.word, challenge.phonics);
}

function choiceLabelForMode(mode, isThai) {
  switch (mode) {
    case "missing-letter":
      return "Fill the missing letter.";
    case "sound-to-word-choice":
      return "Listen, then choose the word.";
    case "tricky-word-pick":
      return "Look carefully and choose the right word.";
    case "token-bank-limited":
      return "Use the limited letter bank.";
    case "write-from-memory":
      return "Write the word from memory.";
    case "word-repair":
      return "Repair the damaged word.";
    case "spelling-sprint":
      return "Complete each spelling round.";
    case "learn-write-speak":
      return "Learn it, write it, then say it.";
    default:
      return "Tap or drag the letters to spell the word.";
  }
}

function hiddenPromptForMode(mode, isThai) {
  switch (mode) {
    case "missing-letter":
      return "Pick the missing letter.";
    case "sound-to-word-choice":
      return "Listen and choose the right word.";
    case "tricky-word-pick":
      return "Look carefully and choose the right word.";
    case "token-bank-limited":
      return isThai ? "Build the Thai word." : "Build the English word.";
    case "write-from-memory":
      return isThai ? "Write the Thai word from memory." : "Write the English word from memory.";
    case "word-repair":
      return isThai ? "Repair the Thai word." : "Repair the English word.";
    case "spelling-sprint":
      return isThai ? "Ready for the spelling sprint?" : "Ready for the spelling sprint?";
    default:
      return isThai ? "Spell the Thai word." : "Spell the English word.";
  }
}

const spellingThemeRoster = {
  sun: {
    image: monsterSun,
    name: "Sunny",
    accentClass: "spelling-theme--sun",
    burst: "Speed round",
  },
  mint: {
    image: monsterMint,
    name: "Mimo",
    accentClass: "spelling-theme--mint",
    burst: "Garden clue",
  },
  plum: {
    image: monsterPlum,
    name: "Puff",
    accentClass: "spelling-theme--plum",
    burst: "Puzzle helper",
  },
};

function getSpellingTheme(challenge) {
  return (
    spellingThemeRoster[challenge.themeKey] || {
      image: monsterSun,
      name: "Akin Buddy",
      accentClass: "spelling-theme--sun",
      burst: "Play mission",
    }
  );
}

function TokenBoard({
  currentChallenge,
  failedChoiceId,
  onCorrectChoice,
  onPress,
  onWrongChoice,
}) {
  const [placedTokenIds, setPlacedTokenIds] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const bankTokens = currentChallenge.bankTokens || currentChallenge.shuffledTokens;

  const tokenMap = useMemo(
    () =>
      new Map(bankTokens.map((token) => [token.id, token])),
    [bankTokens],
  );
  const placedTokens = placedTokenIds.map((tokenId) => tokenMap.get(tokenId));
  const availableTokens = bankTokens.filter(
    (token) => !placedTokenIds.includes(token.id),
  );
  const allSlotsFilled =
    placedTokenIds.length === currentChallenge.targetTokens.length;

  useEffect(() => {
    setPlacedTokenIds([]);
    setIsChecking(false);
  }, [currentChallenge.id]);

  useEffect(() => {
    if (!allSlotsFilled || isChecking) {
      return undefined;
    }

    setIsChecking(true);
    onCorrectChoice();
    return undefined;
  }, [allSlotsFilled, isChecking, onCorrectChoice]);

  const canPlaceToken = (tokenId) => {
    const token = tokenMap.get(tokenId);
    const nextTargetToken =
      currentChallenge.targetTokens[placedTokenIds.length];

    return token?.value === nextTargetToken;
  };

  const handleAddToken = (tokenId) => {
    if (placedTokenIds.includes(tokenId) || allSlotsFilled || isChecking) {
      return;
    }

    onPress();

    if (!canPlaceToken(tokenId)) {
      onWrongChoice(currentChallenge.mode);
      return;
    }

    setPlacedTokenIds((currentValue) => [...currentValue, tokenId]);
  };

  const handleRemoveTokenAt = (slotIndex) => {
    if (!placedTokenIds[slotIndex] || isChecking) {
      return;
    }

    onPress();
    setPlacedTokenIds((currentValue) =>
      currentValue.filter((_, index) => index !== slotIndex),
    );
  };

  const handleDropOnSlot = (slotIndex, tokenId) => {
    if (
      !tokenId ||
      placedTokenIds.includes(tokenId) ||
      slotIndex !== placedTokenIds.length ||
      isChecking
    ) {
      return;
    }

    onPress();

    if (!canPlaceToken(tokenId)) {
      onWrongChoice(currentChallenge.mode);
      return;
    }

    setPlacedTokenIds((currentValue) => [...currentValue, tokenId]);
  };

  return (
    <>
      <div className="spelling-slot-row">
        {currentChallenge.targetTokens.map((_, slotIndex) => {
          const token = placedTokens[slotIndex];

          return (
            <button
              key={`${currentChallenge.id}-slot-${slotIndex + 1}`}
              type="button"
              className={`spelling-slot ${token ? "spelling-slot--filled" : ""}`}
              onClick={() => handleRemoveTokenAt(slotIndex)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleDropOnSlot(
                  slotIndex,
                  event.dataTransfer.getData("text/plain"),
                );
              }}
            >
              <span>{token?.value || ""}</span>
            </button>
          );
        })}
      </div>

      <div className="spelling-token-bank">
        {availableTokens.map((token) => (
          <motion.button
            key={token.id}
            type="button"
            draggable={!isChecking}
            className="spelling-tile"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddToken(token.id)}
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", token.id);
            }}
          >
            {token.value}
          </motion.button>
        ))}
      </div>
      {failedChoiceId === currentChallenge.mode ? (
        <div className="spelling-inline-error">
          {currentChallenge.mode === "token-bank-limited"
            ? "That tile is not next. Try another bank tile."
            : "Try the next correct letter."}
        </div>
      ) : null}
    </>
  );
}

function ChoiceBoard({
  currentChallenge,
  failedChoiceId,
  onPress,
  onCorrectChoice,
  onWrongChoice,
}) {
  const handleChoice = (value) => {
    onPress();

    if (value === currentChallenge.correctAnswer) {
      onCorrectChoice();
      return;
    }

    onWrongChoice(`${currentChallenge.id}-choice`);
  };

  if (currentChallenge.mode === "missing-letter") {
    return (
      <>
        <div className="spelling-slot-row spelling-slot-row--pattern">
          {currentChallenge.patternTokens.map((token, index) => (
            <div
              key={`${currentChallenge.id}-pattern-${index + 1}`}
              className={`spelling-slot ${
                token ? "spelling-slot--filled" : "spelling-slot--blank"
              }`}
            >
              <span>{token || "?"}</span>
            </div>
          ))}
        </div>
        <div className="spelling-choice-grid">
          {currentChallenge.choices.map((choice) => (
            <motion.button
              key={choice.id}
              type="button"
              className="spelling-choice-card spelling-choice-card--letter"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              animate={
                failedChoiceId === `${currentChallenge.id}-choice`
                  ? { x: [0, -8, 8, -4, 4, 0] }
                  : undefined
              }
              transition={{ duration: 0.3 }}
              onClick={() => handleChoice(choice.value)}
              aria-label={`Choose letter ${choice.value}`}
            >
              {choice.value}
            </motion.button>
          ))}
        </div>
      </>
    );
  }

  return (
    <div
      className={`spelling-choice-grid spelling-choice-grid--${currentChallenge.mode}`}
    >
      {currentChallenge.choices.map((choice) => (
        <motion.button
          key={choice.id}
          type="button"
          className="spelling-choice-card spelling-choice-card--word"
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.95 }}
          animate={
            failedChoiceId === `${currentChallenge.id}-choice`
              ? { x: [0, -8, 8, -4, 4, 0] }
              : undefined
          }
          transition={{ duration: 0.3 }}
          onClick={() => handleChoice(choice.value)}
          aria-label={`Choose word ${choice.value}`}
        >
          <span className="spelling-choice-card__value">{choice.value}</span>
          {currentChallenge.mode === "sound-to-word-choice" ? (
            <span className="spelling-choice-card__hint">Listen for this word</span>
          ) : null}
          {currentChallenge.mode === "tricky-word-pick" ? (
            <span className="spelling-choice-card__hint">Check every letter</span>
          ) : null}
        </motion.button>
      ))}
    </div>
  );
}

function WordRepairBoard({
  currentChallenge,
  failedChoiceId,
  onPress,
  onCorrectChoice,
  onWrongChoice,
}) {
  const choiceId = `${currentChallenge.id}-repair-choice`;

  const handleChoice = (value) => {
    onPress();

    if (value === currentChallenge.correctAnswer) {
      onCorrectChoice();
      return;
    }

    onWrongChoice(choiceId);
  };

  return (
    <div className="spelling-repair-board">
      <div className="spelling-repair-board__label">Repair the missing part</div>
      <div className="spelling-slot-row spelling-slot-row--repair" aria-label="Damaged word pattern">
        {currentChallenge.patternTokens.map((token, index) => (
          <div
            key={`${currentChallenge.id}-repair-${index + 1}`}
            className={`spelling-slot ${token ? "spelling-slot--filled" : "spelling-slot--blank spelling-slot--repair-target"}`}
          >
            <span>{token || "?"}</span>
          </div>
        ))}
      </div>
      <div className="spelling-choice-grid spelling-choice-grid--repair">
        {currentChallenge.choices.map((choice) => (
          <motion.button
            key={choice.id}
            type="button"
            className="spelling-choice-card spelling-choice-card--letter"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            animate={
              failedChoiceId === choiceId
                ? { x: [0, -8, 8, -4, 4, 0] }
                : undefined
            }
            transition={{ duration: 0.3 }}
            onClick={() => handleChoice(choice.value)}
            aria-label={`Repair with ${choice.value}`}
          >
            {choice.value}
          </motion.button>
        ))}
      </div>
      {failedChoiceId === choiceId ? (
        <div className="spelling-inline-error">Try a different repair tile.</div>
      ) : null}
    </div>
  );
}

function TextEntryBoard({
  currentChallenge,
  failedChoiceId,
  onPress,
  onCorrectChoice,
  onWrongChoice,
  variant = "memory",
}) {
  const [typedWord, setTypedWord] = useState("");
  const errorId = currentChallenge.mode;

  useEffect(() => {
    setTypedWord("");
  }, [currentChallenge.id]);

  const checkWord = () => {
    onPress();

    if (
      typedWord.trim().toLocaleLowerCase() ===
      currentChallenge.word.trim().toLocaleLowerCase()
    ) {
      onCorrectChoice();
      return;
    }

    onWrongChoice(errorId);
  };

  return (
    <div className={`spelling-text-entry spelling-text-entry--${variant}`}>
      {variant === "sprint" ? (
        <div className="spelling-sprint-rail" aria-label={`Spelling round ${currentChallenge.sprintRound || 1} of ${currentChallenge.sprintTotal || 1}`}>
          <span>Round {currentChallenge.sprintRound || 1}</span>
          <span>{currentChallenge.sprintTotal || 1} words</span>
        </div>
      ) : null}
      <div className="spelling-text-entry__prompt">
        <span>{variant === "sprint" ? "Write and launch the word" : "Write the whole word"}</span>
        <strong>{currentChallenge.translation}</strong>
        <small>{currentChallenge.word.length} letters</small>
      </div>
      <input
        type="text"
        value={typedWord}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className={`spelling-text-entry__input ${failedChoiceId === errorId ? "spelling-text-entry__input--wrong" : ""}`}
        aria-label={variant === "sprint" ? "Type the spelling sprint word" : "Type the word from memory"}
        aria-invalid={failedChoiceId === errorId}
        placeholder={variant === "sprint" ? "Type to launch" : "Type here"}
        onChange={(event) => setTypedWord(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && typedWord.trim()) {
            checkWord();
          }
        }}
      />
      <button
        type="button"
        className="communication-primary-button"
        disabled={!typedWord.trim()}
        onClick={checkWord}
      >
        {variant === "sprint" ? "Launch word" : "Check word"}
      </button>
      {failedChoiceId === errorId ? (
        <p className="communication-writing-error">Try again and check every letter.</p>
      ) : null}
    </div>
  );
}

function SpellingSprintBoard(props) {
  return <TextEntryBoard {...props} variant="sprint" />;
}

function EnglishLearnBoard({
  currentChallenge,
  onPress,
  onStartWriting,
}) {
  return (
    <div className="communication-step communication-step--learn">
      <span className="communication-step__badge">1 · Learn</span>
      <div className="communication-learn-card">
        <div className="communication-learn-card__art">
          <VocabularyVisual
            word={currentChallenge}
            className="communication-learn-card__image"
          />
        </div>
        <div className="communication-learn-card__copy">
          <small>Look · Listen · Say</small>
          <strong>{currentChallenge.word}</strong>
          <VocabularyMeta
            word={currentChallenge}
            className="communication-learn-card__details"
          />
        </div>
      </div>
      <div className="communication-step__actions">
        <button
          type="button"
          className="communication-primary-button"
          onClick={() => {
            onPress();
            onStartWriting();
          }}
        >
          Write from memory
        </button>
      </div>
    </div>
  );
}

function EnglishWritingBoard({
  currentChallenge,
  failedChoiceId,
  onPress,
  onCorrect,
  onWrongChoice,
}) {
  const [typedWord, setTypedWord] = useState("");

  useEffect(() => {
    setTypedWord("");
  }, [currentChallenge.id]);

  const checkWord = () => {
    onPress();

    if (
      typedWord.trim().toLowerCase() ===
      currentChallenge.word.trim().toLowerCase()
    ) {
      onCorrect();
      return;
    }

    onWrongChoice("english-writing");
  };

  return (
    <div className="communication-step communication-step--write">
      <span className="communication-step__badge">2 · Write</span>
      <div className="communication-writing-card">
        <div className="communication-writing-card__picture">
          <VocabularyVisual
            word={currentChallenge}
            className="communication-writing-card__image"
            decorative
          />
        </div>
        <div className="communication-writing-card__prompt">
          <small>Type the whole word</small>
          <strong>{currentChallenge.translation}</strong>
          <span>{currentChallenge.word.length} letters</span>
        </div>
      </div>
      <input
        type="text"
        value={typedWord}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className={`communication-writing-input ${
          failedChoiceId === "english-writing"
            ? "communication-writing-input--wrong"
            : ""
        }`}
        aria-label="Type the English word"
        placeholder="Type here"
        onChange={(event) => setTypedWord(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && typedWord.trim()) {
            checkWord();
          }
        }}
      />
      <div className="communication-step__actions">
        <button
          type="button"
          className="communication-primary-button"
          disabled={!typedWord.trim()}
          onClick={checkWord}
        >
          Check word
        </button>
      </div>
      {failedChoiceId === "english-writing" ? (
        <p className="communication-writing-error">
          Try again. Listen slowly and type every letter.
        </p>
      ) : null}
    </div>
  );
}

function EnglishSpeakingBoard({
  currentChallenge,
  onFinish,
  onPress,
}) {
  const sentence =
    currentChallenge.speakSentence || `This is ${currentChallenge.word}.`;

  return (
    <div className="communication-step communication-step--speak">
      <span className="communication-step__badge">3 · Speak</span>
      <div className="communication-speech-card">
        <span className="communication-speech-card__icon">💬</span>
        <small>Say it to your teacher or friend</small>
        <strong>{sentence}</strong>
        <span>ฟัง แล้วพูดตามให้ชัดเจน</span>
      </div>
      <div className="communication-step__actions">
        <AudioReplayButton
          label="ฟังประโยคอีกครั้ง"
          onReplay={() => {
            onPress();
            speakPhrase(sentence, "en-US", 0.82, 1.02);
          }}
        />
        <button
          type="button"
          className="communication-primary-button communication-primary-button--speak"
          onClick={() => {
            onPress();
            onFinish();
          }}
        >
          I said it!
        </button>
      </div>
    </div>
  );
}

export function SpellingGameplayScreen({
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
  wrongAttempts = 0,
}) {
  const [learningStep, setLearningStep] = useState("learn");
  const isThai = currentChallenge.language === "th";
  const eyebrow = levelThemeLabel || "Spelling";
  const collectionLabel = currentChallenge.collectionLabel || "Word Quest";
  const boardText = choiceLabelForMode(currentChallenge.mode, isThai);
  const theme = getSpellingTheme(currentChallenge);
  const isTokenMode =
    currentChallenge.mode === "spelling-order" ||
    currentChallenge.mode === "token-bank-limited";
  const isCommunicationFlow = currentChallenge.mode === "learn-write-speak";
  const isWordRepair = currentChallenge.mode === "word-repair";
  const isTextEntry =
    currentChallenge.mode === "write-from-memory" ||
    currentChallenge.mode === "spelling-sprint";
  const { remainingMisses, shouldReveal } = getChallengeRevealState(wrongAttempts);
  const revealVocabulary =
    shouldReveal || (isCommunicationFlow && learningStep !== "write");
  const promptTitle = revealVocabulary
    ? currentChallenge.promptText ||
      (isThai ? `Build ${currentChallenge.word}` : `Spell ${currentChallenge.word}`)
    : hiddenPromptForMode(currentChallenge.mode, isThai);
  const heroWord = revealVocabulary
    ? currentChallenge.word
    : isThai
      ? "คำซ่อน"
      : "Hidden word";
  const hintTriesLeft = remainingMisses;

  useEffect(() => {
    speakChallenge(currentChallenge);
  }, [currentChallenge]);

  useEffect(() => {
    setLearningStep(
      currentChallenge.mode === "learn-write-speak" ? "learn" : "write",
    );
  }, [currentChallenge.id]);

  const handleSpellingWrongChoice = (choiceId) => {
    onWrongChoice(choiceId);
  };

  const handleWrittenCorrectly = () => {
    if (isCommunicationFlow) {
      setLearningStep("speak");
      speakPhrase(
        currentChallenge.speakSentence || `This is ${currentChallenge.word}.`,
        "en-US",
        0.82,
        1.02,
      );
      return;
    }

    onCorrectChoice();
  };

  return (
    <ScreenShell
      className="screen-shell--gameplay screen-shell--spelling"
      variant="FocusSessionShell"
    >
      <section
        className={`game-card game-card--spelling game-card--spelling-stage ${theme.accentClass}`.trim()}
      >
        <div className="game-card__prompt game-card__prompt--spelling">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{promptTitle}</h2>
          <p className="game-card__subject-note game-card__subject-note--spelling">
            <span>{collectionLabel}</span>
            {revealVocabulary ? (
              <VocabularyMeta word={currentChallenge} />
            ) : (
              <span className="learning-vocabulary-placeholder">Listen first</span>
            )}
          </p>
          <p className="game-card__level-note">{`Level ${level} · Word ${stepIndex}/${totalSteps}`}</p>
        </div>

        <div
          className={`activity-board activity-board--spelling ${theme.accentClass}`.trim()}
        >
          <div className="spelling-stage">
            <div className="spelling-stage__hero">
              <motion.div
                className={`spelling-hero-card ${theme.accentClass}`.trim()}
                animate={failedChoiceId ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                transition={{ duration: 0.36 }}
              >
                <div className="spelling-hero-card__topline">
                  <div className="spelling-hero-card__badge">
                    {isThai ? "Thai word" : "English word"}
                  </div>
                  <div className="spelling-hero-card__spark">{theme.burst}</div>
                </div>

                <div className="spelling-hero-card__image-wrap">
                  <VocabularyVisual
                    word={currentChallenge}
                    className="spelling-hero-card__image"
                  />
                </div>

                <strong
                  className={revealVocabulary ? "" : "spelling-hero-card__word--hidden"}
                >
                  {heroWord}
                </strong>
                {revealVocabulary ? (
                  <VocabularyMeta
                    word={currentChallenge}
                    className="spelling-hero-card__details"
                  />
                ) : (
                  <span className="learning-vocabulary-placeholder">Keep listening</span>
                )}

                <div
                  className={`spelling-hero-card__sound ${
                    revealVocabulary ? "" : "spelling-hero-card__sound--hint"
                  }`.trim()}
                >
                  {revealVocabulary ? (
                    <>
                      <b>Listen again</b>
                      <small>Hear the word clearly.</small>
                    </>
                  ) : (
                    <>
                      <b>Think first</b>
                      <small>
                        {hintTriesLeft > 0
                          ? `Word opens after ${hintTriesLeft} more miss${
                              hintTriesLeft === 1 ? "" : "es"
                            }.`
                          : "Word help is ready."}
                      </small>
                    </>
                  )}
                </div>

                <div className="spelling-hero-card__actions">
                  <AudioReplayButton
                    label="ฟังคำศัพท์อีกครั้ง"
                    onReplay={() => {
                      onPress();
                      speakChallenge(currentChallenge);
                    }}
                  />
                </div>
              </motion.div>
            </div>

            <div className="spelling-stage__board">
              <div className={`spelling-board__panel ${theme.accentClass}`.trim()}>
                <div className="spelling-board__header">
                  <strong>{eyebrow}</strong>
                  <span>{boardText}</span>
                </div>

                {isCommunicationFlow && learningStep === "learn" ? (
                  <EnglishLearnBoard
                    currentChallenge={currentChallenge}
                    onPress={onPress}
                    onStartWriting={() => setLearningStep("write")}
                  />
                ) : null}

                {isCommunicationFlow && learningStep === "write" ? (
                  <EnglishWritingBoard
                    currentChallenge={currentChallenge}
                    failedChoiceId={failedChoiceId}
                    onCorrect={handleWrittenCorrectly}
                    onPress={onPress}
                    onWrongChoice={handleSpellingWrongChoice}
                  />
                ) : null}

                {isCommunicationFlow && learningStep === "speak" ? (
                  <EnglishSpeakingBoard
                    currentChallenge={currentChallenge}
                    onFinish={onCorrectChoice}
                    onPress={onPress}
                  />
                ) : null}

                {!isCommunicationFlow && isTokenMode ? (
                  <TokenBoard
                    currentChallenge={currentChallenge}
                    failedChoiceId={failedChoiceId}
                    onCorrectChoice={handleWrittenCorrectly}
                    onPress={onPress}
                    onWrongChoice={handleSpellingWrongChoice}
                  />
                ) : null}

                {!isCommunicationFlow && isWordRepair ? (
                  <WordRepairBoard
                    currentChallenge={currentChallenge}
                    failedChoiceId={failedChoiceId}
                    onCorrectChoice={handleWrittenCorrectly}
                    onPress={onPress}
                    onWrongChoice={handleSpellingWrongChoice}
                  />
                ) : null}

                {!isCommunicationFlow && isTextEntry ? (
                  currentChallenge.mode === "spelling-sprint" ? (
                    <SpellingSprintBoard
                      currentChallenge={currentChallenge}
                      failedChoiceId={failedChoiceId}
                      onCorrectChoice={handleWrittenCorrectly}
                      onPress={onPress}
                      onWrongChoice={handleSpellingWrongChoice}
                    />
                  ) : (
                    <TextEntryBoard
                      currentChallenge={currentChallenge}
                      failedChoiceId={failedChoiceId}
                      onCorrectChoice={handleWrittenCorrectly}
                      onPress={onPress}
                      onWrongChoice={handleSpellingWrongChoice}
                    />
                  )
                ) : null}

                {!isCommunicationFlow && !isTokenMode && !isWordRepair && !isTextEntry ? (
                  <ChoiceBoard
                    currentChallenge={currentChallenge}
                    failedChoiceId={failedChoiceId}
                    onCorrectChoice={handleWrittenCorrectly}
                    onPress={onPress}
                    onWrongChoice={handleSpellingWrongChoice}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <HandGuide />
      </section>
    </ScreenShell>
  );
}

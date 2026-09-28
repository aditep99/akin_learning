import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { AudioReplayButton } from "../components/AudioReplayButton";
import { MonsterCharacter } from "../components/MonsterCharacter";
import { ScreenShell } from "../components/ScreenShell";
import {
  VocabularyMeta,
  VocabularyLabel,
  VocabularyVisual,
} from "../components/VocabularyAnswer";
import { getChallengeRevealState } from "../data/challengeReveal";
import { validateLearningGameAnswer } from "../data/learningGameAnswers";
import { speakWordWithPhonics, useNarration } from "../hooks/useNarration";

const gameBuddies = {
  "word-fishing": "boat-bubble",
  "zombie-word-munch": "soldier-sprout",
  "number-blaster": "robot-beep",
  "shape-shield": "knight-kip",
  "memory-match": "boat-bubble",
  "pattern-pop": "soldier-sprout",
  "treasure-sort": "pirate-pearl",
  "sound-safari": "music-mimi",
  "word-rocket": "rocket-rio",
  "sound-bubble-pop": "cloud-coco",
  "monster-delivery": "train-toot",
  "echo-memory": "music-mimi",
};

function shuffle(items) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [
      nextItems[swapIndex],
      nextItems[index],
    ];
  }

  return nextItems;
}

function WordPicture({ word, className = "" }) {
  return (
    <VocabularyVisual
      word={word}
      className={className}
      imageClassName={className}
    />
  );
}

function WordFishingGame({
  challenge,
  failedChoiceId,
  revealVocabulary,
  onCorrectChoice,
  onPress,
  onWrongChoice,
}) {
  const [caughtId, setCaughtId] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      speakWordWithPhonics(
        challenge.targetWord.word,
        challenge.targetWord.phonics,
      );
    }, 420);

    return () => window.clearTimeout(timeoutId);
  }, [
    challenge.id,
    challenge.targetWord.phonics,
    challenge.targetWord.word,
  ]);

  const catchFish = (choice) => {
    onPress();
    const result = validateLearningGameAnswer(challenge, {
      type: "choice",
      choiceId: choice.id,
    });

    if (!result.correct) {
      onWrongChoice(result.feedbackId);
      return;
    }

    setCaughtId(choice.id);
    window.setTimeout(onCorrectChoice, 620);
  };

  return (
    <div className="word-fishing-game">
      <div className="word-fishing-game__mission">
        <span className="word-fishing-game__hook" aria-hidden="true">
          〰
        </span>
        <div className="word-fishing-game__target">
          <small>Catch this word</small>
          <WordPicture
            word={challenge.targetWord}
            className="word-fishing-game__target-image"
          />
          <VocabularyLabel
            value={challenge.targetWord.word}
            reveal={revealVocabulary}
            placeholder="Listen and choose"
          />
          {revealVocabulary ? (
            <VocabularyMeta
              word={challenge.targetWord}
              className="word-fishing-game__target-details"
            />
          ) : null}
          <AudioReplayButton
            label={`Listen to ${challenge.targetWord.word}`}
            onReplay={() => {
              onPress();
              speakWordWithPhonics(
                challenge.targetWord.word,
                challenge.targetWord.phonics,
              );
            }}
          />
        </div>
      </div>

      <div className="word-fishing-game__pond">
        <span className="word-fishing-game__wave" aria-hidden="true" />
        {challenge.choices.map((choice, index) => (
          <motion.button
            key={choice.id}
            type="button"
            className={`word-fish word-fish--${index + 1} ${
              failedChoiceId === choice.id ? "is-wrong" : ""
            } ${caughtId === choice.id ? "is-caught" : ""}`}
            onClick={() => catchFish(choice)}
            aria-label={`Picture choice ${index + 1}: ${choice.word}`}
            animate={
              caughtId === choice.id
                ? { y: -170, rotate: -8, scale: 1.08 }
                : { y: [0, -7, 0], x: [0, index % 2 ? 5 : -5, 0] }
            }
            transition={
              caughtId === choice.id
                ? { duration: 0.55 }
                : {
                    duration: 2.1 + index * 0.2,
                    repeat: Number.POSITIVE_INFINITY,
                  }
            }
          >
            <span className="word-fish__tail" aria-hidden="true" />
            <VocabularyLabel
              value={choice.word}
              showValue
              placeholder={`Picture ${index + 1}`}
            />
            <VocabularyMeta word={choice} className="word-fish__details" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function ZombieWordMunchGame({
  challenge,
  failedChoiceId,
  onCorrectChoice,
  onPress,
  onWrongChoice,
}) {
  const [munchingId, setMunchingId] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      speakWordWithPhonics(
        challenge.targetWord.word,
        challenge.targetWord.phonics,
      );
    }, 420);

    return () => window.clearTimeout(timeoutId);
  }, [
    challenge.id,
    challenge.targetWord.phonics,
    challenge.targetWord.word,
  ]);

  const feedZombie = (choice) => {
    onPress();
    const result = validateLearningGameAnswer(challenge, {
      type: "choice",
      choiceId: choice.id,
    });

    if (!result.correct) {
      onWrongChoice(result.feedbackId);
      return;
    }

    setMunchingId(choice.id);
    window.setTimeout(onCorrectChoice, 650);
  };

  return (
    <div className="zombie-word-game">
      <div className="zombie-word-game__stage">
        <motion.div
          className="friendly-zombie"
          animate={
            munchingId
              ? { scale: [1, 1.08, 0.98, 1.05], rotate: [0, -3, 3, 0] }
              : { y: [0, -6, 0] }
          }
          transition={
            munchingId
              ? { duration: 0.55 }
              : { duration: 2, repeat: Number.POSITIVE_INFINITY }
          }
          aria-label="Friendly vocabulary zombie"
        >
          <span className="friendly-zombie__hair">▰▰▰</span>
          <span className="friendly-zombie__eyes">● &nbsp; ◉</span>
          <span className="friendly-zombie__mouth">
            {munchingId ? "YUM!" : "WORD?"}
          </span>
        </motion.div>

        <div className="zombie-word-game__target">
          <small>Feed the matching word</small>
          <WordPicture
            word={challenge.targetWord}
            className="zombie-word-game__image"
          />
          <AudioReplayButton
            label={`Listen to ${challenge.targetWord.word}`}
            onReplay={() => {
              onPress();
              speakWordWithPhonics(
                challenge.targetWord.word,
                challenge.targetWord.phonics,
              );
            }}
          />
        </div>
      </div>

      <div className="zombie-word-game__food">
        {challenge.choices.map((choice) => (
          <motion.button
            key={choice.id}
            type="button"
            className={`zombie-word-snack ${
              failedChoiceId === choice.id ? "is-wrong" : ""
            } ${munchingId === choice.id ? "is-munched" : ""}`}
            onClick={() => feedZombie(choice)}
            aria-label={`Word choice: ${choice.word}`}
            whileHover={{ y: -5, rotate: -1 }}
            whileTap={{ scale: 0.96 }}
          >
            <span aria-hidden="true">🧠</span>
            <VocabularyLabel
              value={choice.word}
              showValue
              placeholder="Feed a picture"
            />
            <VocabularyMeta word={choice} className="zombie-word-snack__details" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function NumberBlasterGame({
  challenge,
  failedChoiceId,
  onCorrectChoice,
  onPress,
  onWrongChoice,
}) {
  const [hitAnswer, setHitAnswer] = useState(null);
  const narration = useMemo(
    () =>
      `${challenge.leftValue} plus ${challenge.rightValue}. Shoot the correct answer.`,
    [challenge.leftValue, challenge.rightValue],
  );
  const narrationControl = useNarration(narration);

  const shoot = (choice) => {
    onPress();
    const result = validateLearningGameAnswer(challenge, {
      type: "value",
      value: choice,
    });

    if (!result.correct) {
      onWrongChoice(result.feedbackId);
      return;
    }

    setHitAnswer(choice);
    window.setTimeout(onCorrectChoice, 620);
  };

  return (
    <div className="number-blaster-game">
      <div className="number-blaster-game__sky">
        <div className="number-blaster-game__equation">
          <small>Solve and shoot</small>
          <strong>
            {challenge.leftValue} {challenge.operator} {challenge.rightValue} = ?
          </strong>
          <AudioReplayButton
            available={narrationControl.isAvailable}
            isSpeaking={narrationControl.isSpeaking}
            label="Listen to the addition again"
            onReplay={() => {
              onPress();
              narrationControl.replay();
            }}
          />
        </div>

        <div className="number-blaster-game__targets">
          {challenge.choices.map((choice, index) => {
            const choiceId = `${challenge.id}-${choice}`;

            return (
              <motion.button
                key={choiceId}
                type="button"
                className={`number-target number-target--${index + 1} ${
                  failedChoiceId === choiceId ? "is-wrong" : ""
                } ${hitAnswer === choice ? "is-hit" : ""}`}
                onClick={() => shoot(choice)}
                animate={
                  hitAnswer === choice
                    ? { scale: [1, 1.35, 0], rotate: [0, 8, -16] }
                    : { y: [0, -8, 0] }
                }
                transition={
                  hitAnswer === choice
                    ? { duration: 0.5 }
                    : {
                        duration: 1.8 + index * 0.2,
                        repeat: Number.POSITIVE_INFINITY,
                      }
                }
              >
                {choice}
              </motion.button>
            );
          })}
        </div>

        <div className="number-blaster-game__cannon" aria-hidden="true">
          <span className={hitAnswer !== null ? "is-firing" : ""}>▲</span>
          <strong>BLASTER</strong>
        </div>
      </div>
    </div>
  );
}

function ShapeShieldGame({
  challenge,
  failedChoiceId,
  onCorrectChoice,
  onPress,
  onWrongChoice,
}) {
  const [raisedShape, setRaisedShape] = useState("");
  const narration = useMemo(
    () => `Find the ${challenge.targetShape} shield.`,
    [challenge.targetShape],
  );
  const narrationControl = useNarration(narration);

  const raiseShield = (shape) => {
    onPress();
    const result = validateLearningGameAnswer(challenge, {
      type: "value",
      value: shape,
    });

    if (!result.correct) {
      onWrongChoice(result.feedbackId);
      return;
    }

    setRaisedShape(shape);
    window.setTimeout(onCorrectChoice, 600);
  };

  return (
    <div className="shape-shield-game">
      <div className="shape-shield-game__meteor" aria-hidden="true">
        <span>☄</span>
        <strong>Find: {challenge.targetShape}</strong>
        <AudioReplayButton
          available={narrationControl.isAvailable}
          isSpeaking={narrationControl.isSpeaking}
          label="Listen to the shape again"
          onReplay={() => {
            onPress();
            narrationControl.replay();
          }}
        />
      </div>

      <div className="shape-shield-game__choices">
        {challenge.choices.map((shape, index) => {
          const choiceId = `${challenge.id}-${shape}`;

          return (
            <motion.button
              key={choiceId}
              type="button"
              className={`shape-shield shape-shield--${index + 1} ${
                failedChoiceId === choiceId ? "is-wrong" : ""
              } ${raisedShape === shape ? "is-raised" : ""}`}
              onClick={() => raiseShield(shape)}
              animate={
                raisedShape === shape
                  ? { y: -28, scale: 1.12, rotate: [0, -3, 3, 0] }
                  : undefined
              }
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.96 }}
            >
              <span
                className={`shape-shield__shape shape-shield__shape--${shape}`}
                aria-hidden="true"
              />
              <strong>{shape}</strong>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function MemoryMatchGame({
  challenge,
  onCorrectChoice,
  onPress,
  onWrongChoice,
}) {
  const cards = useMemo(
    () =>
      shuffle(
        challenge.pairs.flatMap((word) => [
          {
            id: `${word.id}-picture`,
            pairId: word.id,
            kind: "picture",
            word,
          },
          {
            id: `${word.id}-word`,
            pairId: word.id,
            kind: "word",
            word,
          },
        ]),
      ),
    [challenge.id, challenge.pairs],
  );
  const [openIds, setOpenIds] = useState([]);
  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  const [wrongCardIds, setWrongCardIds] = useState([]);
  const [memoryFeedback, setMemoryFeedback] = useState("");
  const wrongTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (wrongTimerRef.current) {
        window.clearTimeout(wrongTimerRef.current);
      }
    },
    [],
  );

  const selectCard = (card) => {
    if (
      isBusy ||
      openIds.includes(card.id) ||
      matchedPairIds.includes(card.pairId)
    ) {
      return;
    }

    onPress();
    const nextOpenIds = [...openIds, card.id];
    setOpenIds(nextOpenIds);

    if (nextOpenIds.length < 2) {
      return;
    }

    const firstCard = cards.find((item) => item.id === nextOpenIds[0]);
    const result = validateLearningGameAnswer(
      challenge,
      {
        type: "memory-pair",
        firstCardId: firstCard?.id,
        secondCardId: card.id,
        firstPairId: firstCard?.pairId,
        secondPairId: card.pairId,
      },
      { matchedPairIds },
    );

    if (result.correct) {
      const nextMatchedPairIds = [...matchedPairIds, card.pairId];
      setMatchedPairIds(nextMatchedPairIds);
      setOpenIds([]);

      if (result.complete) {
        window.setTimeout(onCorrectChoice, 520);
      }
      return;
    }

    setIsBusy(true);
    setWrongCardIds([firstCard?.id, card.id].filter(Boolean));
    setMemoryFeedback("ยังไม่ใช่คู่นี้ • ลองใหม่");
    onWrongChoice(result.feedbackId);
    if (wrongTimerRef.current) {
      window.clearTimeout(wrongTimerRef.current);
    }
    wrongTimerRef.current = window.setTimeout(() => {
      setOpenIds([]);
      setWrongCardIds([]);
      setMemoryFeedback("");
      setIsBusy(false);
      wrongTimerRef.current = null;
    }, 800);
  };

  return (
    <div className="memory-game">
      <p className="memory-game__feedback" role="status" aria-live="polite">
        {memoryFeedback}
      </p>
      <div className="memory-game-grid">
        {cards.map((card) => {
          const isOpen =
            openIds.includes(card.id) || matchedPairIds.includes(card.pairId);
          const isMatched = matchedPairIds.includes(card.pairId);
          const isWrong = wrongCardIds.includes(card.id);

          return (
            <motion.button
              key={card.id}
              type="button"
              className={`memory-card ${isOpen ? "is-open" : ""} ${
                isMatched ? "is-matched" : ""
              } ${isWrong ? "is-wrong" : ""}`}
              onClick={() => selectCard(card)}
              whileHover={isOpen ? undefined : { y: -4, rotate: -1 }}
              whileTap={{ scale: 0.97 }}
              aria-label={
                isOpen
                  ? card.kind === "picture"
                    ? `${card.word.word} picture`
                    : card.word.word
                  : "Hidden memory card"
              }
            >
              <span className="memory-card__back">?</span>
              <span className="memory-card__front">
                {card.kind === "picture" ? (
                  <WordPicture word={card.word} className="memory-card__image" />
                ) : (
                  <>
                    <strong>{card.word.word}</strong>
                    <VocabularyMeta word={card.word} />
                  </>
                )}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function PatternPopGame({
  challenge,
  failedChoiceId,
  onCorrectChoice,
  onPress,
  onWrongChoice,
}) {
  const choose = (choice) => {
    onPress();
    const result = validateLearningGameAnswer(challenge, {
      type: "choice",
      choiceId: choice.id,
    });

    if (result.correct) {
      onCorrectChoice();
      return;
    }

    onWrongChoice(result.feedbackId);
  };

  return (
    <div className="pattern-game">
      <div className="pattern-game__sequence" aria-label="Picture pattern">
        {challenge.sequence.map((word, index) => (
          <motion.div
            key={`${word.id}-${index}`}
            className="pattern-tile"
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.08 }}
          >
            <WordPicture word={word} className="pattern-tile__image" />
          </motion.div>
        ))}
        <div className="pattern-tile pattern-tile--mystery">?</div>
      </div>

      <div className="learning-choice-row">
        {challenge.choices.map((choice, index) => (
          <motion.button
            key={choice.id}
            type="button"
            className={`learning-choice ${
              failedChoiceId === choice.id ? "is-wrong" : ""
            }`}
            onClick={() => choose(choice)}
            aria-label={`Picture choice ${index + 1}: ${choice.word}`}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
          >
            <WordPicture word={choice} className="learning-choice__image" />
            <VocabularyLabel
              value={choice.word}
              showValue
              placeholder={`Picture ${index + 1}`}
            />
            <VocabularyMeta word={choice} className="learning-choice__details" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function TreasureSortGame({
  challenge,
  onCorrectChoice,
  onPress,
  onWrongChoice,
}) {
  const [selectedBasketId, setSelectedBasketId] = useState(
    challenge.baskets[0]?.id || "",
  );
  const [placedItemIds, setPlacedItemIds] = useState([]);
  const [wrongItemId, setWrongItemId] = useState("");
  const [wrongBasketId, setWrongBasketId] = useState("");
  const [sortFeedback, setSortFeedback] = useState("");
  const wrongTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (wrongTimerRef.current) {
        window.clearTimeout(wrongTimerRef.current);
      }
    },
    [],
  );

  const placeItem = (item) => {
    if (placedItemIds.includes(item.id)) {
      return;
    }

    onPress();
    const result = validateLearningGameAnswer(
      challenge,
      {
        type: "sort-item",
        itemId: item.id,
        basketId: selectedBasketId,
      },
      { placedItemIds },
    );

    if (!result.correct) {
      setWrongItemId(item.id);
      setWrongBasketId(selectedBasketId);
      setSortFeedback("ยังไม่ใช่หีบนี้ • ลองเลือกใหม่");
      onWrongChoice(result.feedbackId);
      if (wrongTimerRef.current) {
        window.clearTimeout(wrongTimerRef.current);
      }
      wrongTimerRef.current = window.setTimeout(() => {
        setWrongItemId("");
        setWrongBasketId("");
        setSortFeedback("");
        wrongTimerRef.current = null;
      }, 800);
      return;
    }

    const nextPlacedItemIds = [...placedItemIds, item.id];
    setPlacedItemIds(nextPlacedItemIds);
    setWrongItemId("");
    setWrongBasketId("");
    setSortFeedback("");

    if (result.complete) {
      window.setTimeout(onCorrectChoice, 460);
    }
  };

  return (
    <div className="treasure-sort-game">
      <div className="treasure-sort-game__baskets-area">
        <p className="treasure-sort-game__feedback" role="status" aria-live="polite">
          {sortFeedback}
        </p>
        <div className="treasure-sort-game__baskets">
          {challenge.baskets.map((basket) => (
            <button
              key={basket.id}
              type="button"
              className={`treasure-basket ${
                selectedBasketId === basket.id ? "is-active" : ""
              } ${wrongBasketId === basket.id ? "is-wrong" : ""}`}
              aria-pressed={selectedBasketId === basket.id}
              onClick={() => {
                onPress();
                setSelectedBasketId(basket.id);
                setWrongBasketId("");
                setSortFeedback("");
              }}
            >
              <span>{basket.emoji}</span>
              <strong>{basket.label}</strong>
              <small>
                {
                  challenge.items.filter(
                    (item) =>
                      item.basketId === basket.id &&
                      placedItemIds.includes(item.id),
                  ).length
                }
                /{challenge.items.filter((item) => item.basketId === basket.id).length}
              </small>
            </button>
          ))}
        </div>
      </div>

      <div className="treasure-sort-game__items">
        {challenge.items.map((item, index) => (
          <motion.button
            key={item.id}
            type="button"
            className={`treasure-item ${
              placedItemIds.includes(item.id) ? "is-placed" : ""
            } ${wrongItemId === item.id ? "is-wrong" : ""}`}
            aria-label={`Treasure ${index + 1}: ${item.word}`}
            onClick={() => placeItem(item)}
            whileHover={placedItemIds.includes(item.id) ? undefined : { y: -4 }}
            whileTap={{ scale: 0.97 }}
          >
            <WordPicture word={item} className="treasure-item__image" />
            <VocabularyLabel
              value={item.word}
              showValue
              placeholder={`Treasure ${index + 1}`}
            />
            <VocabularyMeta word={item} className="treasure-item__details" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function SoundSafariGame({
  challenge,
  failedChoiceId,
  onCorrectChoice,
  onPress,
  onWrongChoice,
}) {
  const narration = useNarration(challenge.promptWord, { autoPlay: false });

  const replay = () => {
    onPress();
    speakWordWithPhonics(challenge.promptWord, challenge.phonics);
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      speakWordWithPhonics(challenge.promptWord, challenge.phonics);
    }, 420);

    return () => window.clearTimeout(timeoutId);
  }, [challenge.id, challenge.phonics, challenge.promptWord]);

  const choose = (choice) => {
    onPress();
    const result = validateLearningGameAnswer(challenge, {
      type: "choice",
      choiceId: choice.id,
    });

    if (result.correct) {
      onCorrectChoice();
      return;
    }

    onWrongChoice(result.feedbackId);
  };

  return (
    <div className="sound-safari-game">
      <div className="sound-safari-game__listen">
        <span className="sound-safari-game__rings" aria-hidden="true" />
        <AudioReplayButton
          available={narration.isAvailable}
          isSpeaking={narration.isSpeaking}
          label="Listen to the word again"
          onReplay={replay}
        />
        <strong>Tap to listen again</strong>
      </div>

      <div className="learning-choice-row learning-choice-row--four">
        {challenge.choices.map((choice) => (
          <motion.button
            key={choice.id}
            type="button"
            className={`learning-choice ${
              failedChoiceId === choice.id ? "is-wrong" : ""
            }`}
            onClick={() => choose(choice)}
            aria-label={`Picture choice: ${choice.word}`}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
          >
            <WordPicture word={choice} className="learning-choice__image" />
            <VocabularyLabel value={choice.word} showValue />
            <VocabularyMeta word={choice} className="learning-choice__details" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function WordRocketGame({
  challenge,
  onCorrectChoice,
  onPress,
  onWrongChoice,
}) {
  const target = challenge.targetWord.word.toUpperCase();
  const [builtLetters, setBuiltLetters] = useState([]);
  const [usedIndexes, setUsedIndexes] = useState([]);
  const [wrongIndex, setWrongIndex] = useState(-1);

  const chooseLetter = (letter, index) => {
    if (usedIndexes.includes(index)) {
      return;
    }

    onPress();
    const result = validateLearningGameAnswer(
      challenge,
      {
        type: "sequence-letter",
        letter,
        index,
      },
      { builtLetters },
    );

    if (!result.correct) {
      setWrongIndex(index);
      onWrongChoice(result.feedbackId);
      window.setTimeout(() => setWrongIndex(-1), 380);
      return;
    }

    const nextBuiltLetters = [...builtLetters, letter];
    setBuiltLetters(nextBuiltLetters);
    setUsedIndexes((currentValue) => [...currentValue, index]);

    if (nextBuiltLetters.length === target.length) {
      window.setTimeout(onCorrectChoice, 520);
    }
  };

  return (
    <div className="word-rocket-game">
      <div className="word-rocket-game__target">
        <WordPicture
          word={challenge.targetWord}
          className="word-rocket-game__image"
        />
        <div className="word-rocket-game__slots" aria-label="Word slots">
          {target.split("").map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className={builtLetters[index] ? "is-filled" : ""}
            >
              {builtLetters[index] || ""}
            </span>
          ))}
        </div>
        <motion.div
          className="word-rocket-game__rocket"
          animate={{ y: builtLetters.length === target.length ? -90 : [0, -5, 0] }}
          transition={
            builtLetters.length === target.length
              ? { duration: 0.55 }
              : { duration: 1.8, repeat: Number.POSITIVE_INFINITY }
          }
        >
          🚀
        </motion.div>
      </div>

      <div className="word-rocket-game__letters">
        {challenge.letters.map((letter, index) => (
          <motion.button
            key={`${letter}-${index}`}
            type="button"
            aria-label={`Letter ${letter === " " ? "Space" : letter}`}
            className={`${usedIndexes.includes(index) ? "is-used" : ""} ${
              wrongIndex === index ? "is-wrong" : ""
            }`}
            onClick={() => chooseLetter(letter, index)}
            whileHover={usedIndexes.includes(index) ? undefined : { y: -4 }}
            whileTap={{ scale: 0.96 }}
          >
            {letter === " " ? "Space" : letter}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function SoundBubblePopGame({
  challenge,
  failedChoiceId,
  onCorrectChoice,
  onPress,
  onWrongChoice,
}) {
  const [poppedId, setPoppedId] = useState("");
  const narration = useNarration(challenge.promptWord, { autoPlay: false });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      speakWordWithPhonics(challenge.promptWord, challenge.phonics);
    }, 420);

    return () => window.clearTimeout(timeoutId);
  }, [challenge.id, challenge.phonics, challenge.promptWord]);

  const replay = () => {
    onPress();
    speakWordWithPhonics(challenge.promptWord, challenge.phonics);
  };

  const popBubble = (choice) => {
    onPress();
    const result = validateLearningGameAnswer(challenge, {
      type: "choice",
      choiceId: choice.id,
    });

    if (!result.correct) {
      onWrongChoice(result.feedbackId);
      return;
    }

    setPoppedId(choice.id);
    window.setTimeout(onCorrectChoice, 560);
  };

  return (
    <div className="sound-bubble-game">
      <div className="sound-bubble-game__listen">
        <span className="sound-bubble-game__rings" aria-hidden="true" />
        <AudioReplayButton
          available={narration.isAvailable}
          isSpeaking={narration.isSpeaking}
          label="Listen to the word again"
          onReplay={replay}
        />
        <strong>Listen, then pop!</strong>
        <small>
          {narration.isAvailable
            ? "The bubbles are waiting."
            : `Audio is unavailable. Find ${challenge.promptWord}.`}
        </small>
      </div>

      <div className="sound-bubble-game__bubbles">
        {challenge.choices.map((choice, index) => (
          <motion.button
            key={choice.id}
            type="button"
            className={`sound-bubble-choice sound-bubble-choice--${index + 1} ${
              failedChoiceId === choice.id ? "is-wrong" : ""
            } ${poppedId === choice.id ? "is-popped" : ""}`}
            onClick={() => popBubble(choice)}
            aria-label={`Bubble ${index + 1}: ${choice.word}`}
            animate={
              poppedId === choice.id
                ? { scale: [1, 1.2, 0], opacity: [1, 1, 0] }
                : { y: [0, -8, 0], rotate: [-2, 2, -2] }
            }
            transition={
              poppedId === choice.id
                ? { duration: 0.48 }
                : {
                    duration: 2.4 + index * 0.16,
                    repeat: Number.POSITIVE_INFINITY,
                  }
            }
          >
            <WordPicture word={choice} className="sound-bubble-choice__image" />
            <VocabularyLabel
              value={choice.word}
              showValue
              placeholder={`Bubble ${index + 1}`}
            />
            <VocabularyMeta
              word={choice}
              className="sound-bubble-choice__details"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function MonsterDeliveryGame({
  challenge,
  failedChoiceId,
  onCorrectChoice,
  onPress,
  onWrongChoice,
}) {
  const [deliveredId, setDeliveredId] = useState("");
  const [isDropActive, setIsDropActive] = useState(false);
  const narration = useNarration(challenge.targetWord.word, { autoPlay: false });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      speakWordWithPhonics(
        challenge.targetWord.word,
        challenge.targetWord.phonics,
      );
    }, 420);

    return () => window.clearTimeout(timeoutId);
  }, [challenge.id, challenge.targetWord.phonics, challenge.targetWord.word]);

  const replay = () => {
    onPress();
    speakWordWithPhonics(
      challenge.targetWord.word,
      challenge.targetWord.phonics,
    );
  };

  const deliver = (choice) => {
    onPress();
    const result = validateLearningGameAnswer(challenge, {
      type: "choice",
      choiceId: choice.id,
    });

    if (!result.correct) {
      onWrongChoice(result.feedbackId);
      return;
    }

    setDeliveredId(choice.id);
    window.setTimeout(onCorrectChoice, 620);
  };

  const dropChoice = (event) => {
    event.preventDefault();
    setIsDropActive(false);
    const choiceId = event.dataTransfer.getData("text/plain");
    const choice = challenge.choices.find((item) => item.id === choiceId);

    if (choice) {
      deliver(choice);
    }
  };

  return (
    <div className="monster-delivery-game">
      <div
        className={`monster-delivery-game__drop-zone ${isDropActive ? "is-active" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDropActive(true);
        }}
        onDragLeave={() => setIsDropActive(false)}
        onDrop={dropChoice}
      >
        <MonsterCharacter buddyId="train-toot" title="Train Toot" />
        <WordPicture
          word={challenge.targetWord}
          className="monster-delivery-game__target-image"
        />
        <strong>Deliver the matching word</strong>
        <AudioReplayButton
          available={narration.isAvailable}
          isSpeaking={narration.isSpeaking}
          label={`Listen to ${challenge.targetWord.word}`}
          onReplay={replay}
        />
      </div>

      <div className="monster-delivery-game__words">
        {challenge.choices.map((choice) => (
          <motion.button
            key={choice.id}
            type="button"
            draggable
            className={`monster-delivery-word ${
              failedChoiceId === choice.id ? "is-wrong" : ""
            } ${deliveredId === choice.id ? "is-delivered" : ""}`}
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", choice.id);
              setIsDropActive(true);
            }}
            onDragEnd={() => setIsDropActive(false)}
            onClick={() => deliver(choice)}
            aria-label={`Delivery choice: ${choice.word}`}
            whileHover={{ y: -5, rotate: -1 }}
            whileTap={{ scale: 0.96 }}
          >
            <span aria-hidden="true">📦</span>
            <VocabularyLabel
              value={choice.word}
              showValue
              placeholder="Deliver a picture"
            />
            <VocabularyMeta
              word={choice}
              className="monster-delivery-word__details"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function EchoMemoryGame({
  challenge,
  onCorrectChoice,
  onPress,
  onWrongChoice,
}) {
  const cards = useMemo(
    () =>
      shuffle(
        challenge.pairs.flatMap((word) => [
          {
            id: `${word.id}-picture`,
            pairId: word.id,
            kind: "picture",
            word,
          },
          {
            id: `${word.id}-sound`,
            pairId: word.id,
            kind: "sound",
            word,
          },
        ]),
      ),
    [challenge.id, challenge.pairs],
  );
  const [openIds, setOpenIds] = useState([]);
  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  const [wrongCardIds, setWrongCardIds] = useState([]);
  const [memoryFeedback, setMemoryFeedback] = useState("");
  const wrongTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (wrongTimerRef.current) {
        window.clearTimeout(wrongTimerRef.current);
      }
    },
    [],
  );

  const selectCard = (card) => {
    if (
      isBusy ||
      openIds.includes(card.id) ||
      matchedPairIds.includes(card.pairId)
    ) {
      return;
    }

    onPress();
    if (card.kind === "sound") {
      speakWordWithPhonics(card.word.word, card.word.phonics);
    }

    const nextOpenIds = [...openIds, card.id];
    setOpenIds(nextOpenIds);

    if (nextOpenIds.length < 2) {
      return;
    }

    const firstCard = cards.find((item) => item.id === nextOpenIds[0]);
    const result = validateLearningGameAnswer(
      challenge,
      {
        type: "memory-pair",
        firstCardId: firstCard?.id,
        secondCardId: card.id,
        firstPairId: firstCard?.pairId,
        secondPairId: card.pairId,
      },
      { matchedPairIds },
    );

    if (result.correct) {
      const nextMatchedPairIds = [...matchedPairIds, card.pairId];
      setMatchedPairIds(nextMatchedPairIds);
      setOpenIds([]);

      if (result.complete) {
        window.setTimeout(onCorrectChoice, 560);
      }
      return;
    }

    setIsBusy(true);
    setWrongCardIds([firstCard?.id, card.id].filter(Boolean));
    setMemoryFeedback("ยังไม่ใช่คู่นี้ • ลองใหม่");
    onWrongChoice(result.feedbackId);
    if (wrongTimerRef.current) {
      window.clearTimeout(wrongTimerRef.current);
    }
    wrongTimerRef.current = window.setTimeout(() => {
      setOpenIds([]);
      setWrongCardIds([]);
      setMemoryFeedback("");
      setIsBusy(false);
      wrongTimerRef.current = null;
    }, 850);
  };

  return (
    <div className="echo-memory-game">
      <div className="echo-memory-game__hint">
        <span aria-hidden="true">♫</span>
        <strong>Find the sound pair</strong>
        <small>Tap a sound card to hear it.</small>
      </div>
      <div className="echo-memory-game__grid-area">
        <p className="memory-game__feedback" role="status" aria-live="polite">
          {memoryFeedback}
        </p>
        <div className="memory-game-grid echo-memory-game__grid">
          {cards.map((card) => {
          const isOpen =
            openIds.includes(card.id) || matchedPairIds.includes(card.pairId);
          const isMatched = matchedPairIds.includes(card.pairId);
          const isWrong = wrongCardIds.includes(card.id);

            return (
              <motion.button
              key={card.id}
              type="button"
              className={`memory-card echo-memory-card ${isOpen ? "is-open" : ""} ${
                isMatched ? "is-matched" : ""
              } ${isWrong ? "is-wrong" : ""}`}
              onClick={() => selectCard(card)}
              whileHover={isOpen ? undefined : { y: -4, rotate: -1 }}
              whileTap={{ scale: 0.97 }}
              aria-label={
                isOpen
                  ? card.kind === "picture"
                    ? `${card.word.word} picture`
                    : `Sound ${card.word.word}`
                  : "Hidden echo memory card"
              }
            >
              <span className="memory-card__back">?</span>
              <span className="memory-card__front">
                {card.kind === "picture" ? (
                  <WordPicture word={card.word} className="memory-card__image" />
                ) : (
                  <>
                    <strong>♫</strong>
                    <small>{card.word.word}</small>
                  </>
                )}
              </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function LearningGameScreen({
  currentChallenge,
  failedChoiceId,
  level,
  levelThemeLabel,
  onCorrectChoice,
  onKeyboardChoice,
  onPress,
  onWrongChoice,
  arcadeRound = 0,
  isArcade = false,
  wrongAttempts = 0,
}) {
  const buddyId = gameBuddies[currentChallenge.mode] || "boat-bubble";
  const { shouldReveal } = getChallengeRevealState(wrongAttempts);

  useEffect(() => {
    if (!isArcade) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        const word = currentChallenge.promptWord || currentChallenge.targetWord?.word;

        if (word) {
          speakWordWithPhonics(
            word,
            currentChallenge.phonics || currentChallenge.targetWord?.phonics,
          );
        }
        return;
      }

      const choiceIndex = Number(event.key) - 1;
      if (choiceIndex < 0 || choiceIndex > 3) {
        return;
      }

      const choice = currentChallenge.choices?.[choiceIndex];
      if (choice && typeof onKeyboardChoice === "function") {
        event.preventDefault();
        onKeyboardChoice(choice);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentChallenge, isArcade, onKeyboardChoice]);

  return (
    <ScreenShell
      className={`screen-shell--gameplay screen-shell--learning-games ${
        isArcade ? "screen-shell--arcade" : ""
      }`}
      variant="FocusSessionShell"
    >
      <section
        className={`learning-game-card learning-game-card--${currentChallenge.mode} ${
          isArcade ? "learning-game-card--arcade" : ""
        }`}
      >
        <div className="learning-game-card__scenery" aria-hidden="true">
          <span>✦</span>
          <span>★</span>
          <span>✦</span>
        </div>

        <header className="learning-game-card__header">
          <div className="learning-game-card__copy">
            <p className="eyebrow">Game {level} • {levelThemeLabel}</p>
            <h2>{currentChallenge.title}</h2>
            <p>{currentChallenge.instruction}</p>
            <span className="learning-game-card__skill">
              ⚡ {currentChallenge.skillLabel}
            </span>
          </div>

          <motion.div
            className="learning-game-card__buddy"
            animate={{ y: [0, -7, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 2.7, repeat: Number.POSITIVE_INFINITY }}
          >
            <MonsterCharacter buddyId={buddyId} title="Game buddy" />
            <span>Let's play!</span>
          </motion.div>
        </header>

        <div className="learning-game-board">
          {currentChallenge.mode === "word-fishing" ? (
            <WordFishingGame
              challenge={currentChallenge}
              failedChoiceId={failedChoiceId}
              revealVocabulary={shouldReveal}
              onCorrectChoice={onCorrectChoice}
              onPress={onPress}
              onWrongChoice={onWrongChoice}
            />
          ) : null}

          {currentChallenge.mode === "zombie-word-munch" ? (
            <ZombieWordMunchGame
              challenge={currentChallenge}
              failedChoiceId={failedChoiceId}
              onCorrectChoice={onCorrectChoice}
              onPress={onPress}
              onWrongChoice={onWrongChoice}
            />
          ) : null}

          {currentChallenge.mode === "number-blaster" ? (
            <NumberBlasterGame
              challenge={currentChallenge}
              failedChoiceId={failedChoiceId}
              onCorrectChoice={onCorrectChoice}
              onPress={onPress}
              onWrongChoice={onWrongChoice}
            />
          ) : null}

          {currentChallenge.mode === "shape-shield" ? (
            <ShapeShieldGame
              challenge={currentChallenge}
              failedChoiceId={failedChoiceId}
              onCorrectChoice={onCorrectChoice}
              onPress={onPress}
              onWrongChoice={onWrongChoice}
            />
          ) : null}

          {currentChallenge.mode === "memory-match" ? (
            <MemoryMatchGame
              challenge={currentChallenge}
              onCorrectChoice={onCorrectChoice}
              onPress={onPress}
              onWrongChoice={onWrongChoice}
            />
          ) : null}

          {currentChallenge.mode === "pattern-pop" ? (
            <PatternPopGame
              challenge={currentChallenge}
              failedChoiceId={failedChoiceId}
              onCorrectChoice={onCorrectChoice}
              onPress={onPress}
              onWrongChoice={onWrongChoice}
            />
          ) : null}

          {currentChallenge.mode === "treasure-sort" ? (
            <TreasureSortGame
              challenge={currentChallenge}
              onCorrectChoice={onCorrectChoice}
              onPress={onPress}
              onWrongChoice={onWrongChoice}
            />
          ) : null}

          {currentChallenge.mode === "sound-safari" ? (
            <SoundSafariGame
              challenge={currentChallenge}
              failedChoiceId={failedChoiceId}
              onCorrectChoice={onCorrectChoice}
              onPress={onPress}
              onWrongChoice={onWrongChoice}
            />
          ) : null}

          {currentChallenge.mode === "word-rocket" ? (
            <WordRocketGame
              challenge={currentChallenge}
              onCorrectChoice={onCorrectChoice}
              onPress={onPress}
              onWrongChoice={onWrongChoice}
            />
          ) : null}

          {currentChallenge.mode === "sound-bubble-pop" ? (
            <SoundBubblePopGame
              challenge={currentChallenge}
              failedChoiceId={failedChoiceId}
              onCorrectChoice={onCorrectChoice}
              onPress={onPress}
              onWrongChoice={onWrongChoice}
            />
          ) : null}

          {currentChallenge.mode === "monster-delivery" ? (
            <MonsterDeliveryGame
              challenge={currentChallenge}
              failedChoiceId={failedChoiceId}
              onCorrectChoice={onCorrectChoice}
              onPress={onPress}
              onWrongChoice={onWrongChoice}
            />
          ) : null}

          {currentChallenge.mode === "echo-memory" ? (
            <EchoMemoryGame
              challenge={currentChallenge}
              onCorrectChoice={onCorrectChoice}
              onPress={onPress}
              onWrongChoice={onWrongChoice}
            />
          ) : null}
        </div>
      </section>
    </ScreenShell>
  );
}

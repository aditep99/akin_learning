import { useEffect, useMemo, useRef, useState } from "react";
import { ActionButton } from "../components/ActionButton";
import { ScreenShell } from "../components/ScreenShell";
import { getExamPhotoAsset as getFinalTestPhotoAsset } from "../data/finalTest/examPhotoAssets";

export function PhotoVisual({ assetId, alt = "", onFailure }) {
  const asset = getFinalTestPhotoAsset(assetId);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [assetId]);

  if (!asset || failed) {
    return (
      <span className="final-test-photo final-test-photo--fallback" role="img" aria-label={alt}>
        📷
      </span>
    );
  }

  return (
    <span className="final-test-photo">
      <img src={asset.src} alt={alt || asset.alt} onError={() => { setFailed(true); onFailure?.(); }} draggable="false" />
    </span>
  );
}

function getVisibleText(value) {
  if (value && typeof value === "object") {
    return value.label || value.value || value.word || "";
  }
  return String(value || "");
}

export function ChoiceOption({ choice, index, selected, onSelect, showPhoto = true, autoFocus = false, buttonRef, revealLabels = true, disabled = false }) {
  const label = getVisibleText(choice);
  const [photoFailed, setPhotoFailed] = useState(false);
  useEffect(() => setPhotoFailed(false), [choice.id, choice.photoAssetId]);
  const labelsVisible = revealLabels || photoFailed || !getFinalTestPhotoAsset(choice.photoAssetId);
  return (
    <button
      type="button"
      className={`final-test-choice ${selected ? "is-selected" : ""}`.trim()}
      disabled={disabled}
      aria-label={`${String.fromCharCode(65 + index)}: ${label}`}
      aria-pressed={selected}
      autoFocus={autoFocus}
      ref={buttonRef}
      onClick={() => onSelect(choice)}
    >
      <span className="final-test-choice__letter" aria-hidden="true">
        {String.fromCharCode(65 + index)}
      </span>
      {showPhoto && choice?.photoAssetId ? (
        <PhotoVisual assetId={choice.photoAssetId} alt={label} onFailure={() => setPhotoFailed(true)} />
      ) : null}
      <span className="final-test-choice__selection" aria-hidden="true">{selected ? "✓" : ""}</span>
      <span className="final-test-choice__caption" style={{ visibility: labelsVisible ? "visible" : "hidden" }} aria-hidden={!labelsVisible}>
        <span className="final-test-choice__label">{label}</span>
        {choice?.translation ? <small>{choice.translation}</small> : null}
      </span>
    </button>
  );
}

function CheckBar({ onCheck, onClear, disabled = false, message = "" }) {
  return (
    <div className="final-test-checkbar">
      <ActionButton color="green" className="final-test-checkbar__check" onClick={onCheck} disabled={disabled}>
        Check answer
      </ActionButton>
      <ActionButton color="blue" onClick={onClear} disabled={disabled}>
        Clear
      </ActionButton>
      {message ? <p className="final-test-inline-message" role="status">{message}</p> : null}
    </div>
  );
}

function PictureChoiceBoard({ challenge, onSubmit, onPress, locked, focusRef, revealLabels }) {
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    setSelectedId("");
  }, [challenge.id]);

  return (
    <div className="final-test-board final-test-board--picture">
      <div className="final-test-photo-grid">
        {challenge.choices.map((choice, index) => (
          <div key={choice.id}>
            <ChoiceOption
              choice={choice}
              index={index}
              selected={choice.id === selectedId}
              autoFocus={index === 0}
              revealLabels={revealLabels}
              disabled={locked}
              buttonRef={choice.id === selectedId || (selectedId === "" && index === 0) ? focusRef : undefined}
              onSelect={(next) => {
                onPress();
                setSelectedId(next.id);
              }}
            />
          </div>
        ))}
      </div>
      <CheckBar
        disabled={locked}
        onCheck={() => onSubmit(selectedId, Boolean(selectedId))}
        onClear={() => {
          setSelectedId("");
          focusRef?.current?.focus();
        }}
      />
    </div>
  );
}

function MatchingBoard({ challenge, onSubmit, onPress, locked, focusRef, wrongAttempts = 0 }) {
  const [matches, setMatches] = useState({});
  const [activeLeft, setActiveLeft] = useState("");
  const [message, setMessage] = useState("");
  const firstLeftRef = useRef(null);
  const leftButtonRefs = useRef(new Map());

  useEffect(() => {
    setMatches({});
    setActiveLeft("");
    setMessage("");
    leftButtonRefs.current.clear();
    firstLeftRef.current?.focus();
  }, [challenge.id]);

  useEffect(() => {
    if (wrongAttempts <= 0) return;
    const firstIncorrect = challenge.pairs.find(
      (pair) => matches[pair.left.id] !== challenge.answerMap?.[pair.left.id],
    );
    const target =
      leftButtonRefs.current.get(firstIncorrect?.left.id) || firstLeftRef.current;
    if (focusRef) focusRef.current = target;
  }, [challenge, focusRef, matches, wrongAttempts]);

  const rightOptions = useMemo(
    () => challenge.matchOptions || challenge.pairs.map((pair) => pair.right),
    [challenge.matchOptions, challenge.pairs],
  );
  const usedRights = new Set(Object.values(matches));
  const firstUnmatchedIndex = challenge.pairs.findIndex(
    (pair) => !matches[pair.left.id],
  );

  const chooseRight = (right) => {
    onPress();
    if (!activeLeft) {
      setMessage("Choose a word first, then choose its match.");
      return;
    }
    setMatches((current) => ({ ...current, [activeLeft]: right.id }));
    setActiveLeft("");
    setMessage("");
  };

  const complete = Object.keys(matches).length === challenge.pairs.length;
  const answer = Object.fromEntries(Object.entries(matches));

  return (
    <div className="final-test-board final-test-board--matching">
      <div className="final-test-matching-grid">
        <div className="final-test-matching-column">
          <h3>Words</h3>
          {challenge.pairs.map((pair, index) => (
            <button
              key={pair.left.id}
              ref={(node) => {
                if (index === 0) firstLeftRef.current = node;
                if (node) leftButtonRefs.current.set(pair.left.id, node);
                else leftButtonRefs.current.delete(pair.left.id);
                if (focusRef && (index === firstUnmatchedIndex || (firstUnmatchedIndex < 0 && index === 0))) {
                  focusRef.current = node;
                }
              }}
              type="button"
              className={`final-test-match-item ${activeLeft === pair.left.id ? "is-selected" : ""} ${matches[pair.left.id] ? "is-matched" : ""}`.trim()}
              aria-pressed={activeLeft === pair.left.id}
              onClick={() => {
                onPress();
                setActiveLeft(pair.left.id);
                setMessage("");
              }}
            >
              {getVisibleText(pair.left)}
              {matches[pair.left.id] ? <span aria-hidden="true">✓</span> : null}
            </button>
          ))}
        </div>
        <div className="final-test-matching-column">
          <h3>Matches</h3>
          {rightOptions.map((right) => (
            <button
              key={right.id}
              type="button"
              className={`final-test-match-item ${usedRights.has(right.id) ? "is-matched" : ""}`.trim()}
              onClick={() => chooseRight(right)}
            >
              {getVisibleText(right)}
              {usedRights.has(right.id) ? <span aria-hidden="true">✓</span> : null}
            </button>
          ))}
        </div>
      </div>
      <CheckBar
        disabled={locked}
        message={message}
        onCheck={() => onSubmit(answer, complete)}
        onClear={() => {
          setMatches({});
          setActiveLeft("");
          setMessage("");
          firstLeftRef.current?.focus();
        }}
      />
    </div>
  );
}

function FillBlankBoard({ challenge, onSubmit, onPress, locked, focusRef }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    setValue("");
    inputRef.current?.focus();
  }, [challenge.id]);

  useEffect(() => {
    if (focusRef) focusRef.current = inputRef.current;
  });

  return (
    <div className="final-test-board final-test-board--fill">
      <div className="final-test-fill-card">
        <p className="final-test-sentence">{challenge.sentence}</p>
        {challenge.sentenceTh ? <p className="final-test-sentence-th">{challenge.sentenceTh}</p> : null}
        <label className="final-test-answer-label" htmlFor={`${challenge.id}-input`}>Type the missing word</label>
        <input
          ref={inputRef}
          id={`${challenge.id}-input`}
          className="final-test-text-input"
          value={value}
          autoComplete="off"
          inputMode="text"
          spellCheck="false"
          disabled={locked}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSubmit(value, Boolean(value.trim()));
            }
          }}
          onFocus={onPress}
          aria-describedby={challenge.sentenceTh ? `${challenge.id}-help` : undefined}
        />
        {challenge.sentenceTh ? <span id={`${challenge.id}-help`} className="final-test-help">{challenge.sentenceTh}</span> : null}
      </div>
      <CheckBar
        disabled={locked}
        onCheck={() => onSubmit(value, Boolean(value.trim()))}
        onClear={() => {
          setValue("");
          inputRef.current?.focus();
        }}
      />
    </div>
  );
}

function SentenceOrderBoard({ challenge, onSubmit, onPress, locked, focusRef }) {
  const [selected, setSelected] = useState([]);
  const [available, setAvailable] = useState(challenge.tokens);

  useEffect(() => {
    setSelected([]);
    setAvailable(challenge.tokens);
  }, [challenge.id, challenge.tokens]);

  const addToken = (token) => {
    onPress();
    setSelected((current) => [...current, token]);
    setAvailable((current) => current.filter((item) => item.id !== token.id));
  };

  const removeToken = (token) => {
    onPress();
    setSelected((current) => current.filter((item) => item.id !== token.id));
    setAvailable((current) => [...current, token]);
  };

  const moveToken = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= selected.length) return;
    setSelected((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const complete = selected.length === challenge.tokens.length;
  return (
    <div className="final-test-board final-test-board--order">
      <div className="final-test-order-card">
        <h3>Your sentence</h3>
        <div className="final-test-order-selected" aria-live="polite">
          {selected.length ? selected.map((token, index) => (
            <span className="final-test-order-token final-test-order-token--selected" key={token.id}>
              <button
                ref={focusRef && index === 0 ? focusRef : undefined}
                type="button"
                onClick={() => removeToken(token)}
                disabled={locked}
              >
                {token.value}
              </button>
              <span className="final-test-order-arrows">
                <button type="button" aria-label="Move token left" onClick={() => moveToken(index, -1)} disabled={locked || index === 0}>←</button>
                <button type="button" aria-label="Move token right" onClick={() => moveToken(index, 1)} disabled={locked || index === selected.length - 1}>→</button>
              </span>
            </span>
          )) : <span className="final-test-order-empty">Tap the words below.</span>}
        </div>
      </div>
      <div className="final-test-order-bank" aria-label="Word bank">
        {available.map((token) => (
          <button
            key={token.id}
            ref={focusRef && selected.length === 0 && available[0]?.id === token.id ? focusRef : undefined}
            type="button"
            className="final-test-order-token"
            onClick={() => addToken(token)}
            disabled={locked}
          >
            {token.value}
          </button>
        ))}
      </div>
      <CheckBar
        disabled={locked}
        onCheck={() => onSubmit(selected.map((token) => token.id), complete)}
        onClear={() => {
          setSelected([]);
          setAvailable(challenge.tokens);
          focusRef?.current?.focus();
        }}
      />
    </div>
  );
}

function TextChoiceBoard({ challenge, onSubmit, onPress, locked, className = "", focusRef }) {
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => setSelectedId(""), [challenge.id]);

  return (
    <div className={`final-test-board final-test-board--choices ${className}`.trim()}>
      <div className="final-test-text-choice-grid">
        {challenge.choices.map((choice, index) => (
          <ChoiceOption
            key={choice.id}
            choice={choice}
            index={index}
            selected={choice.id === selectedId}
            buttonRef={choice.id === selectedId || (selectedId === "" && index === 0) ? focusRef : undefined}
            showPhoto={false}
            onSelect={(next) => {
              onPress();
              setSelectedId(next.id);
            }}
          />
        ))}
      </div>
      <CheckBar
        disabled={locked}
        onCheck={() => onSubmit(selectedId, Boolean(selectedId))}
        onClear={() => {
          setSelectedId("");
          focusRef?.current?.focus();
        }}
      />
    </div>
  );
}

function FinalTestBoard({ challenge, onSubmit, onPress, locked, focusRef, wrongAttempts = 0 }) {
  if (challenge.format === "picture-choice") {
    return <PictureChoiceBoard challenge={challenge} onSubmit={onSubmit} onPress={onPress} locked={locked} focusRef={focusRef} revealLabels={wrongAttempts >= 3} />;
  }
  if (challenge.format === "matching") {
    return <MatchingBoard challenge={challenge} onSubmit={onSubmit} onPress={onPress} locked={locked} focusRef={focusRef} wrongAttempts={wrongAttempts} />;
  }
  if (challenge.format === "fill-blank") {
    return <FillBlankBoard challenge={challenge} onSubmit={onSubmit} onPress={onPress} locked={locked} focusRef={focusRef} />;
  }
  if (challenge.format === "sentence-order") {
    return <SentenceOrderBoard challenge={challenge} onSubmit={onSubmit} onPress={onPress} locked={locked} focusRef={focusRef} />;
  }
  return <TextChoiceBoard challenge={challenge} onSubmit={onSubmit} onPress={onPress} locked={locked} focusRef={focusRef} className={challenge.format === "reading" ? "final-test-board--reading" : "final-test-board--applied"} />;
}

function isCorrectAnswer(challenge, answer) {
  if (challenge.format === "picture-choice" || challenge.format === "reading" || challenge.format === "applied") {
    return answer === challenge.correctChoiceId;
  }
  if (challenge.format === "fill-blank") {
    const normalized = String(answer || "").trim().toLowerCase().replace(/[.!?,]/g, "");
    return challenge.acceptedAnswers.some((expected) => normalized === String(expected).trim().toLowerCase().replace(/[.!?,]/g, ""));
  }
  if (challenge.format === "sentence-order") {
    return Array.isArray(answer) && answer.length === challenge.correctTokenIds.length && answer.every((tokenId, index) => tokenId === challenge.correctTokenIds[index]);
  }
  if (challenge.format === "matching") {
    return Object.entries(answer || {}).every(([leftId, rightId]) => challenge.answerMap[leftId] === rightId) && Object.keys(answer || {}).length === challenge.pairs.length;
  }
  return false;
}

export function FinalTestGameplayScreen({
  activity,
  currentChallenge,
  failedChoiceId,
  level,
  levelThemeLabel,
  wrongAttempts = 0,
  onBack,
  onCorrectChoice,
  onFinalTestAnswer,
  onPress,
  onWrongChoice,
  presentation = "level",
  stepIndex,
  totalSteps,
}) {
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState("");
  const answerFocusRef = useRef(null);

  useEffect(() => {
    setLocked(false);
    setMessage("");
  }, [currentChallenge?.id]);

  useEffect(() => {
    if (wrongAttempts > 0 && currentChallenge) {
      requestAnimationFrame(() => answerFocusRef.current?.focus());
    }
  }, [wrongAttempts, currentChallenge?.id]);

  if (!currentChallenge) return null;

  const questionNumber = currentChallenge.finalTestQuestionNumber || stepIndex;
  const displayQuestionNumber = presentation === "today" ? stepIndex : questionNumber;
  const unitLabel = activity?.levelConfig?.label || levelThemeLabel || `Unit ${level}`;
  const prompt = currentChallenge.prompt?.en || currentChallenge.promptText || "Choose the best answer.";
  const helper = currentChallenge.prompt?.th || "ลองอ่านคำถามแล้วเลือกคำตอบที่ดีที่สุด";
  const photoId = currentChallenge.photoAssetId;
  const isPicture = currentChallenge.format === "picture-choice";
  const revealClues = !isPicture || wrongAttempts >= 3;

  const submit = (answer, complete) => {
    if (locked) return;
    if (!complete) {
      setMessage("Complete this step before checking.");
      return;
    }
    const correct = isCorrectAnswer(currentChallenge, answer);
    const firstAttempt = wrongAttempts === 0;
    onFinalTestAnswer?.({
      challengeId: currentChallenge.id,
      levelId: activity?.levelId || currentChallenge.levelId,
      correct,
      answer,
      firstAttempt,
      presentation,
    });
    setMessage(correct ? "Great work!" : "Look again and try once more.");
    if (correct) {
      setLocked(true);
      onCorrectChoice(answer);
      return;
    }
    onWrongChoice(`${currentChallenge.id}-final`);
  };

  return (
    <ScreenShell className="screen-shell--gameplay screen-shell--final-test" variant="FocusSessionShell">
      <section className="final-test-shell" data-final-test-format={currentChallenge.format}>
        <header className="final-test-header">
          <div>
            <p className="eyebrow">Final Test · {unitLabel}</p>
            <h1>{prompt}</h1>
            <p className="final-test-prompt-th" style={{ visibility: revealClues ? "visible" : "hidden" }} aria-hidden={!revealClues}>{helper}</p>
          </div>
          <div className="final-test-header__meta">
            <span>Question {displayQuestionNumber} / {totalSteps}</span>
            <span>{currentChallenge.format.replace(/-/g, " ")}</span>
          </div>
        </header>

        {photoId ? (
          <div className="final-test-prompt-photo">
            <PhotoVisual assetId={photoId} alt={getFinalTestPhotoAsset(photoId)?.alt || "Question photo"} />
          </div>
        ) : null}

        {currentChallenge.format === "reading" ? (
          <div className="final-test-reading-passage">
            <p>{currentChallenge.passage}</p>
            {currentChallenge.passageTh ? <small>{currentChallenge.passageTh}</small> : null}
            <strong>{currentChallenge.question || prompt}</strong>
          </div>
        ) : null}

        {isPicture ? <div className="final-test-clue-notice" role="status" aria-live="polite">
          {revealClues ? "Here are some word clues. · ลองใช้คำศัพท์ช่วยเลือกภาพ" : "Look carefully, then choose a picture."}
        </div> : null}
        <FinalTestBoard
          challenge={currentChallenge}
          failedChoiceId={failedChoiceId}
          locked={locked}
          message={message}
          onPress={onPress}
          onSubmit={submit}
          focusRef={answerFocusRef}
          wrongAttempts={wrongAttempts}
        />
        {message ? <p className={`final-test-feedback ${locked ? "is-correct" : "is-retry"}`} role="status">{message}</p> : null}
        <footer className="final-test-footer">
          <button type="button" className="text-button" onClick={onBack}>← Back to map</button>
          <span>{presentation === "today" ? "Today Mission review" : "First-attempt score is saved"}</span>
        </footer>
      </section>
    </ScreenShell>
  );
}

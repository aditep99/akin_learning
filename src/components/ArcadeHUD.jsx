import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getMonsterBuddy } from "../data/characterRoster";
import { MonsterCharacter } from "./MonsterCharacter";

export function ArcadeHUD({
  buddyId = "cloud-coco",
  combo = 0,
  difficulty = 1,
  feedback,
  onConfirmExit,
  rounds = 0,
  score = 0,
}) {
  const [isConfirmingExit, setIsConfirmingExit] = useState(false);
  const buddy = getMonsterBuddy(buddyId);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsConfirmingExit(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="arcade-hud" aria-label="Endless arcade controls">
        <button
          className="arcade-hud__exit"
          type="button"
          onClick={() => setIsConfirmingExit(true)}
        >
          <span aria-hidden="true">×</span>
          <strong>Exit</strong>
        </button>

        <div className="arcade-hud__buddy">
          <motion.div
            animate={{ y: [0, -4, 0], rotate: [-1, 1, -1] }}
            transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY }}
          >
            <MonsterCharacter buddyId={buddy.id} title={`${buddy.name}, ${buddy.role}`} />
          </motion.div>
          <span>{buddy.name}</span>
        </div>

        <div className="arcade-hud__round">
          <strong>Round {rounds + 1}</strong>
          <span>Keys 1–4 choose · Space listens</span>
        </div>

        <div className="arcade-hud__stats" aria-label="Arcade score">
          <span>
            <small>Score</small>
            <strong>{score}</strong>
          </span>
          <span>
            <small>Combo</small>
            <strong>{combo > 1 ? `x${combo}` : "—"}</strong>
          </span>
          <span>
            <small>Level</small>
            <strong>{difficulty}</strong>
          </span>
        </div>
      </header>

      <AnimatePresence>
        {feedback ? (
          <motion.div
            className={`arcade-reaction arcade-reaction--${feedback.type}`}
            initial={{ opacity: 0, scale: 0.78, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -18 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            aria-live="polite"
          >
            <strong>{feedback.title}</strong>
            <span>{feedback.message}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isConfirmingExit ? (
          <motion.div
            className="arcade-exit-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="arcade-exit-title"
          >
            <motion.div
              className="arcade-exit-dialog__card"
              initial={{ scale: 0.88, y: 16 }}
              animate={{ scale: 1, y: 0 }}
            >
              <MonsterCharacter buddyId={buddy.id} title="Arcade buddy" />
              <h2 id="arcade-exit-title">End this run?</h2>
              <p>Your score will be saved in the arcade summary.</p>
              <div className="arcade-exit-dialog__actions">
                <button
                  type="button"
                  onClick={() => setIsConfirmingExit(false)}
                >
                  Keep Playing
                </button>
                <button type="button" onClick={() => onConfirmExit()}>
                  End Run
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

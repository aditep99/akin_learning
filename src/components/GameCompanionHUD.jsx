import { AnimatePresence, motion } from "framer-motion";
import { pickMonsterBuddy } from "../data/characterRoster";
import { MonsterCharacter } from "./MonsterCharacter";

function getBuddy(subjectName, level) {
  return pickMonsterBuddy(
    subjectName || "Akin Mission",
    Math.max(level || 1, 1) - 1,
  );
}

export function GameCompanionHUD({
  feedback,
  hearts,
  level,
  onExit,
  stepIndex,
  streak,
  subjectName,
  totalSteps,
  xp,
}) {
  const safeTotal = Math.max(totalSteps || 1, 1);
  const safeStep = Math.min(Math.max(stepIndex || 1, 1), safeTotal);
  const progress = Math.round((safeStep / safeTotal) * 100);
  const buddy = getBuddy(subjectName, level);

  return (
    <>
      <header className="game-companion-hud" aria-label="Mission command bar">
        <button className="game-companion-hud__exit" onClick={onExit} type="button">
          <span className="game-companion-hud__exit-icon" aria-hidden="true" />
          <strong>Exit</strong>
        </button>

        <div className="game-companion-hud__buddy">
          <motion.div
            className="game-companion-hud__buddy-character"
            animate={{ y: [0, -4, 0], rotate: [-1, 1, -1] }}
            transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY }}
          >
            <MonsterCharacter
              buddyId={buddy.id}
              title={`${buddy.name}, ${buddy.role}`}
            />
          </motion.div>
          <span>Level {level}</span>
        </div>

        <div className="game-companion-hud__mission">
          <div className="game-companion-hud__copy">
            <strong>{subjectName || "Akin Mission"}</strong>
            <span>
              Mission {safeStep} / {safeTotal}
            </span>
          </div>
          <div className="game-companion-hud__track" aria-hidden="true">
            <motion.span
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 150, damping: 22 }}
            />
          </div>
        </div>

        <div className="game-companion-hud__rewards">
          <span className="game-companion-hud__hearts" aria-label={`${hearts} hearts`}>
            {Array.from({ length: 3 }).map((_, index) => (
              <i key={index} className={index < hearts ? "is-active" : ""}>
                ♥
              </i>
            ))}
          </span>
          {xp > 0 ? (
            <span className="game-companion-hud__xp">⚡ {xp} XP</span>
          ) : null}
          {streak > 1 ? (
            <motion.span
              className="game-companion-hud__streak"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
            >
              🔥 x{streak}
            </motion.span>
          ) : null}
        </div>
      </header>

      <AnimatePresence>
        {feedback ? (
          <motion.div
            key={feedback.id}
            className={`game-reaction game-reaction--${feedback.type}`}
            initial={{ opacity: 0, scale: 0.72, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.86, y: -18 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            aria-live="polite"
          >
            <motion.div
              className="game-reaction__buddy"
              animate={
                feedback.type === "correct"
                  ? { rotate: [-8, 8, -5, 5, 0], y: [0, -10, 0] }
                  : { x: [0, -5, 5, -3, 3, 0] }
              }
            >
              <MonsterCharacter buddyId={buddy.id} decorative />
            </motion.div>
            <div>
              <strong>{feedback.title}</strong>
              <span>{feedback.message}</span>
            </div>
            {feedback.type === "correct" ? (
              <span className="game-reaction__sparkles" aria-hidden="true">
                ★ ✦ ★
              </span>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

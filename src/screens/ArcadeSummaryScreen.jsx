import { motion } from "framer-motion";
import { ActionButton } from "../components/ActionButton";
import { MonsterCharacter } from "../components/MonsterCharacter";
import { ScreenShell } from "../components/ScreenShell";
import { TopBar } from "../components/TopBar";

export function ArcadeSummaryScreen({
  bestScore = 0,
  coins,
  isNewBest = false,
  onBack,
  onPlayAgain,
  onPress,
  rounds = 0,
  score = 0,
  stars,
  stickersEarned = 0,
  accuracy = 0,
  bestCombo = 0,
  attempts = 0,
  mistakes = 0,
}) {
  return (
    <ScreenShell className="screen-shell--arcade-summary">
      <TopBar stars={stars} coins={coins} />

      <section className="arcade-summary-card">
        <motion.div
          className="arcade-summary-card__buddy"
          animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        >
          <MonsterCharacter buddyId="rocket-rio" title="Rocket Rio" />
        </motion.div>
        <p className="eyebrow">Run complete</p>
        <h1>{isNewBest ? "New personal best!" : "Great arcade run!"}</h1>
        <p>Every round helped your monster crew learn a little more.</p>

        <div className="arcade-summary-card__score">
          <small>Score</small>
          <strong>{score}</strong>
          <span>Best: {bestScore}</span>
        </div>

        <div className="arcade-summary-card__stats">
          <span>
            <small>Rounds</small>
            <strong>{rounds}</strong>
          </span>
          <span>
            <small>Accuracy</small>
            <strong>{accuracy}%</strong>
          </span>
          <span>
            <small>Attempts</small>
            <strong>{attempts}</strong>
          </span>
          <span>
            <small>Mistakes</small>
            <strong>{mistakes}</strong>
          </span>
          <span>
            <small>Best combo</small>
            <strong>{bestCombo}</strong>
          </span>
          <span>
            <small>New stickers</small>
            <strong>{stickersEarned}</strong>
          </span>
        </div>

        <div className="arcade-summary-card__actions">
          <ActionButton
            color="orange"
            icon="Play"
            onClick={() => {
              onPress();
              onPlayAgain();
            }}
            wide
          >
            Play Again
          </ActionButton>
          <ActionButton
            color="green"
            icon="Map"
            onClick={() => {
              onPress();
              onBack();
            }}
            wide
          >
            Back to Arcade
          </ActionButton>
        </div>
      </section>
    </ScreenShell>
  );
}

import { motion } from "framer-motion";
import { MonsterCharacter } from "../components/MonsterCharacter";
import { ScreenShell } from "../components/ScreenShell";

export function MathGeniusRewardScreen({
  isLastLevel,
  level,
  onMap,
  onNext,
  onPress,
  track,
}) {
  return (
    <ScreenShell className="screen-shell--math-genius-reward">
      <motion.section
        className={`math-genius-reward math-genius-reward--${track.accent}`}
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 170, damping: 17 }}
      >
        <div className="math-genius-reward__sparkles" aria-hidden="true">
          <span>★</span>
          <span>✦</span>
          <span>★</span>
          <span>✦</span>
        </div>

        <MonsterCharacter
          buddyId={track.buddyId}
          className="math-genius-reward__buddy"
          title={`${track.name} celebration buddy`}
        />

        <span className="math-genius-reward__badge">LEVEL COMPLETE</span>
        <h1>Congratulations!</h1>
        <p>ผ่าน {track.name} Level {level} ครบ 10 ข้อแล้ว</p>

        <div className="math-genius-reward__prizes">
          <strong>+1 Star</strong>
          <strong>+10 Coins</strong>
          <strong>+100 XP</strong>
        </div>

        <div className="math-genius-reward__actions">
          <button
            type="button"
            className="math-genius-reward__next"
            onClick={() => {
              onPress();
              onNext();
            }}
          >
            {isLastLevel ? "Choose Track" : "Next Level"}
          </button>
          <button
            type="button"
            className="math-genius-reward__map"
            onClick={() => {
              onPress();
              onMap();
            }}
          >
            Track Map
          </button>
        </div>
      </motion.section>
    </ScreenShell>
  );
}

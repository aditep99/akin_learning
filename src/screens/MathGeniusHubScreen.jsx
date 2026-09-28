import { motion } from "framer-motion";
import { MonsterCharacter } from "../components/MonsterCharacter";
import { ScreenShell } from "../components/ScreenShell";
import { TopBar } from "../components/TopBar";

export function MathGeniusHubScreen({
  coins,
  onBack,
  onPress,
  onSelectTrack,
  stars,
  tracks,
}) {
  return (
    <ScreenShell className="screen-shell--math-genius-hub">
      <TopBar stars={stars} coins={coins} />

      <section className="math-genius-hub__hero">
        <button
          type="button"
          className="math-genius-back"
          onClick={() => {
            onPress();
            onBack();
          }}
        >
          ← Home
        </button>

        <div className="math-genius-hub__copy">
          <span>Math Genius Lab</span>
          <h1>Choose your math mission</h1>
          <p>ฝึกคิดทีละขั้น เล่นให้ครบ 10 ข้อ แล้วปลดล็อกด่านต่อไป</p>
        </div>

        <div className="math-genius-hub__crew" aria-hidden="true">
          <MonsterCharacter buddyId="soldier-sprout" decorative />
          <MonsterCharacter buddyId="boat-bubble" decorative />
        </div>
      </section>

      <section className="math-genius-track-grid" aria-label="Math Genius tracks">
        {tracks.map((track, index) => (
          <motion.button
            key={track.id}
            type="button"
            className={`math-genius-track-card math-genius-track-card--${track.accent}`}
            onClick={() => {
              onPress();
              onSelectTrack(track.id);
            }}
            whileHover={{ y: -8, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="math-genius-track-card__top">
              <span>Mission {index + 1}</span>
              <strong>{track.completedLevels}/5 cleared</strong>
            </div>

            <MonsterCharacter
              buddyId={track.buddyId}
              className="math-genius-track-card__buddy"
              title={`${track.name} learning buddy`}
            />

            <div className="math-genius-track-card__copy">
              <small>{track.id === "column" ? "ตั้งบวก · ตั้งลบ" : "โจทย์เรื่องราว"}</small>
              <h2>{track.name}</h2>
              <p>{track.description}</p>
              <span>{track.descriptionTh}</span>
            </div>

            <div className="math-genius-track-card__path" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, levelIndex) => (
                <i
                  key={`${track.id}-level-${levelIndex + 1}`}
                  className={
                    levelIndex < track.completedLevels
                      ? "is-done"
                      : levelIndex === track.completedLevels
                        ? "is-next"
                        : ""
                  }
                />
              ))}
            </div>

            <div className="math-genius-track-card__play">
              <span>5 levels · 50 problems</span>
              <strong>Start →</strong>
            </div>
          </motion.button>
        ))}
      </section>
    </ScreenShell>
  );
}

import { ActionButton } from "../components/ActionButton";
import { ScreenShell } from "../components/ScreenShell";
import { TopBar } from "../components/TopBar";

export function TodayMissionSummaryScreen({
  activities = [],
  coins = 0,
  diagnostic = false,
  onBack,
  onContinue,
  onPress,
  stars = 0,
  stats = {},
}) {
  const total = stats.total || activities.length || 1;
  const correct = stats.correct || 0;
  const accuracy = Math.round((correct / total) * 100);

  return (
    <ScreenShell className="screen-shell--today-summary" variant="LearningShell">
      <TopBar stars={stars} coins={coins} />
      <section className="today-summary-card">
        <div className="today-summary-card__hero" aria-hidden="true">🌟</div>
        <p className="eyebrow">{diagnostic ? "World Discovery Complete" : "Mission Complete"}</p>
        <h1>{diagnostic ? "Akin found your next path!" : "You helped your monster crew grow!"}</h1>
        <p>
          {diagnostic
            ? "Your first adventure is ready. Akin will use these clues to choose friendly practice for you."
            : "Every try helped your skills become stronger. Come back tomorrow for another short adventure."}
        </p>

        <div className="today-summary-stats">
          {diagnostic ? (
            <>
              <div><strong>10</strong><span>world clues found</span></div>
              <div><strong>Ready</strong><span>Akin's path is prepared</span></div>
              <div><strong>+1</strong><span>star found</span></div>
            </>
          ) : (
            <>
              <div><strong>{correct}/{total}</strong><span>missions cleared</span></div>
              <div><strong>{accuracy}%</strong><span>accuracy</span></div>
              <div><strong>+2</strong><span>stars found</span></div>
            </>
          )}
        </div>

        <div className="today-summary-skills">
          <span>Skills explored</span>
          <div>
            {activities.slice(0, 5).map((activity) => (
              <span key={activity.id}>{activity.subjectName || activity.mode}</span>
            ))}
          </div>
        </div>

        <div className="today-summary-actions">
          <ActionButton
            color="green"
            icon="Play"
            onClick={() => {
              onPress?.();
              onContinue?.();
            }}
          >
            {diagnostic ? "Start Today Mission" : "Continue"}
          </ActionButton>
          <ActionButton
            color="blue"
            icon="Home"
            onClick={() => {
              onPress?.();
              onBack?.();
            }}
          >
            Back to Today
          </ActionButton>
        </div>
      </section>
    </ScreenShell>
  );
}

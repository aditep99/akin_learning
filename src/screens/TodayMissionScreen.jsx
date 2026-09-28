import { ActionButton } from "../components/ActionButton";
import { MonsterCharacter } from "../components/MonsterCharacter";
import akinMascot from "../assets/characters/akin-mascot.png";

export function TodayMissionScreen({
  activity,
  children,
  hint,
  isDiagnostic = false,
  missionIndex = 0,
  onBack,
  onHint,
  onPress,
  totalActivities = 1,
}) {
  return (
    <div className="today-mission-shell">
      <section className="today-mission-context">
        <header className="today-mission-context__header">
          <div className="today-mission-context__title">
            <img src={akinMascot} alt="Akin guide" />
            <div>
              <p className="eyebrow">
                {isDiagnostic ? "World Discovery" : "Today Mission"}
              </p>
              <h1>{isDiagnostic ? "Open Akin's new world" : "A short monster adventure"}</h1>
              <p>
                {isDiagnostic
                  ? "Play naturally. Akin is quietly finding the right path for you."
                  : "Review, discover, and celebrate one small win at a time."}
              </p>
            </div>
          </div>

          <div className="today-mission-context__actions">
            <span className="today-mission-step">
              Mission {missionIndex + 1}/{totalActivities}
            </span>
            <ActionButton
              color="warning"
              icon="Close"
              ariaLabel="Pause and return to Today"
              onClick={() => {
                onPress?.();
                onBack?.();
              }}
            >
              Pause
            </ActionButton>
          </div>
        </header>

        <div className="today-mission-context__focus">
          <div>
            <span>Skill focus</span>
            <strong>{activity?.subjectName || "Monster skills"}</strong>
            <small>
              {activity?.reason === "practice"
                ? "Akin picked a skill to strengthen"
                : activity?.reason === "new-skill"
                  ? "A new skill to explore"
                  : "A confidence-building mission"}
            </small>
          </div>
          <MonsterCharacter
            buddyId="coral"
            title="Akin's mission buddy"
            className="today-mission-context__buddy"
          />
          <button
            type="button"
            className={`today-mission-hint ${hint ? "is-active" : ""}`.trim()}
            onClick={() => {
              onPress?.();
              onHint?.();
            }}
          >
            <span aria-hidden="true">💡</span>
            {hint ? "Try this hint again" : "Monster Hint"}
          </button>
        </div>

        {hint ? (
          <div className="today-mission-hint-card" role="status">
            <strong>{hint.title}</strong>
            <span>{hint.message}</span>
          </div>
        ) : null}
      </section>

      {children}
    </div>
  );
}

import { ActionButton } from "../components/ActionButton";
import { ScreenShell } from "../components/ScreenShell";
import { TopBar } from "../components/TopBar";

export function FinalTestSummaryScreen({
  coins,
  onBack,
  onPress,
  onRetry,
  result,
  stars,
}) {
  if (!result) return null;
  const percentage = Math.round((result.firstAttemptScore / Math.max(result.totalQuestions, 1)) * 100);

  return (
    <ScreenShell className="screen-shell--final-test-summary" variant="LearningShell">
      <TopBar coins={coins} stars={stars} />
      <section className="final-test-summary" aria-labelledby="final-test-summary-title">
        <p className="eyebrow">Final Test complete</p>
        <h1 id="final-test-summary-title">{result.unitLabel} finished!</h1>
        <p className="final-test-summary__intro">Your first-attempt score is saved. You can retry any time to keep learning.</p>
        <div className="final-test-summary__score" aria-label={`${result.firstAttemptScore} of ${result.totalQuestions} correct on the first attempt`}>
          <strong>{percentage}%</strong>
          <span>{result.firstAttemptScore} / {result.totalQuestions} first-attempt correct</span>
        </div>
        <div className="final-test-summary__stats">
          <div><strong>{result.totalAttempts}</strong><span>Total checks</span></div>
          <div><strong>{result.bestFirstAttemptScore}</strong><span>Best first attempt</span></div>
          <div><strong>{result.totalQuestions}</strong><span>Questions in Unit</span></div>
        </div>
        <div className="final-test-summary__actions">
          <ActionButton color="green" icon="Play" onClick={() => { onPress(); onRetry(); }}>Retry Unit</ActionButton>
          <ActionButton color="blue" icon="Map" onClick={() => { onPress(); onBack(); }}>Back to Map</ActionButton>
        </div>
      </section>
    </ScreenShell>
  );
}

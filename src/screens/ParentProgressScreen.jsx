import { useMemo, useState } from "react";
import { ActionButton } from "../components/ActionButton";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ScreenShell } from "../components/ScreenShell";
import { TopBar } from "../components/TopBar";
import { getSkillSummary } from "../data/masteryEngine.js";

function formatDate(timestamp) {
  if (!timestamp) return "Not yet";

  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp));
  } catch {
    return "Recently";
  }
}

export function ParentProgressScreen({
  gate,
  learningProfile,
  learningState,
  onBack,
  onOpenLibrary,
  onPress,
  onReset,
  onSetupPin,
  onVerifyPin,
  cloudProfiles = [],
  cloudSync = { enabled: false, childId: "" },
  cloudSyncNotice = "",
  isCloudSyncConfigured = false,
  onLinkCloudLearner,
  onSelectCloudLearner,
  onToggleCloudSync,
  unlocked = false,
}) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isCloudBusy, setIsCloudBusy] = useState(false);
  const [cloudError, setCloudError] = useState("");
  const summary = useMemo(() => getSkillSummary(learningState), [learningState]);

  const submitPin = async (event) => {
    event?.preventDefault();

    if (!/^\d{4}$/.test(pin)) {
      setError("Please enter a 4-digit PIN.");
      document.getElementById("parent-pin")?.focus();
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      if (!gate) {
        if (pin !== confirmPin) {
          setError("The PINs do not match.");
          document.getElementById("parent-confirm-pin")?.focus();
          return;
        }

        onPress?.();
        const didSave = await onSetupPin?.(pin);
        if (!didSave) setError("PIN could not be saved on this device.");
        return;
      }

      onPress?.();
      const didUnlock = await onVerifyPin?.(pin);
      if (!didUnlock) {
        setError("That PIN is not quite right. Try again.");
      }
    } catch {
      setError(
        gate
          ? "The PIN could not be checked. Try again."
          : "PIN could not be saved on this device.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!unlocked) {
    return (
      <ScreenShell
        className="screen-shell--parent-progress"
        variant="ParentToolShell"
      >
        <form className="parent-gate-card" onSubmit={submitPin} noValidate>
          <span className="parent-gate-card__icon" aria-hidden="true">🔐</span>
          <p className="eyebrow">Parent Corner</p>
          <h1>{gate ? "Enter Parent PIN" : "Create a Parent PIN"}</h1>
          <p>
            {gate
              ? "This report stays on this device. Enter your 4-digit PIN to unlock it."
              : "Set a 4-digit PIN so grown-ups can check progress privately on this device."}
          </p>
          <label>
            <span>{gate ? "PIN" : "New PIN"}</span>
            <input
              id="parent-pin"
              inputMode="numeric"
              maxLength={4}
              aria-describedby={error ? "parent-pin-error" : undefined}
              aria-invalid={Boolean(error && !/^\d{4}$/.test(pin))}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
              type={showPin ? "text" : "password"}
              value={pin}
            />
            <button
              type="button"
              className="parent-password-toggle"
              aria-label={showPin ? "Hide PIN" : "Show PIN"}
              aria-pressed={showPin}
              onClick={() => setShowPin((current) => !current)}
            >
              {showPin ? "Hide" : "Show"}
            </button>
          </label>
          {!gate ? (
            <label>
              <span>Confirm PIN</span>
              <input
                id="parent-confirm-pin"
                inputMode="numeric"
                maxLength={4}
                aria-describedby={error ? "parent-pin-error" : undefined}
                aria-invalid={Boolean(error && !gate && pin !== confirmPin)}
                onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                type={showConfirmPin ? "text" : "password"}
                value={confirmPin}
              />
              <button
                type="button"
                className="parent-password-toggle"
                aria-label={showConfirmPin ? "Hide confirm PIN" : "Show confirm PIN"}
                aria-pressed={showConfirmPin}
                onClick={() => setShowConfirmPin((current) => !current)}
              >
                {showConfirmPin ? "Hide" : "Show"}
              </button>
            </label>
          ) : null}
          {error ? (
            <p id="parent-pin-error" className="parent-gate-card__error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="parent-gate-card__actions">
            <ActionButton
              color="green"
              disabled={isSaving}
              icon="Check"
              type="submit"
            >
              {isSaving ? "Checking..." : gate ? "Unlock Report" : "Save PIN"}
            </ActionButton>
            <ActionButton color="blue" icon="Home" onClick={onBack}>Back</ActionButton>
          </div>
        </form>
      </ScreenShell>
    );
  }

  const totals = learningState?.sessionStats || {};
  const accuracy = totals.totalQuestions
    ? Math.round((totals.totalCorrect / totals.totalQuestions) * 100)
    : 0;
  const totalAttempts = summary.reduce((total, skill) => total + skill.attempts, 0);
  const firstTryCorrect = summary.reduce(
    (total, skill) => total + skill.firstTryCorrect,
    0,
  );
  const totalHints = summary.reduce((total, skill) => total + skill.hintUses, 0);
  const firstTryAccuracy = totalAttempts
    ? Math.round((firstTryCorrect / totalAttempts) * 100)
    : 0;
  const needsPractice = summary.filter((skill) => skill.score < 60);

  const runCloudAction = async (action) => {
    setIsCloudBusy(true);
    setCloudError("");
    try {
      await action();
    } catch (actionError) {
      setCloudError(actionError?.message || "Cloud progress could not be updated.");
    } finally {
      setIsCloudBusy(false);
    }
  };

  return (
    <ScreenShell
      className="screen-shell--parent-progress"
      variant="ParentToolShell"
    >
      <TopBar stars={learningState?.stars || 0} coins={learningState?.coins || 0} />
      <section className="parent-progress-card">
        <header className="parent-progress-card__header">
          <div>
            <p className="eyebrow">Parent Progress</p>
            <h1>{learningProfile?.name || "Akin"}'s Monster Report</h1>
            <p>Local-only learning insights from this device.</p>
          </div>
          <ActionButton color="neutral" icon="Close" onClick={onBack}>Close</ActionButton>
        </header>

        <div className="parent-progress-overview">
          <div><strong>{accuracy}%</strong><span>overall accuracy</span></div>
          <div><strong>{totals.totalQuestions || 0}</strong><span>questions tried</span></div>
          <div><strong>{totals.totalSessions || 0}</strong><span>missions finished</span></div>
          <div><strong>{totals.lastPlayedAt ? formatDate(totals.lastPlayedAt) : "Not yet"}</strong><span>last played</span></div>
        </div>

        <div className="parent-progress-insights">
          <div><strong>{firstTryAccuracy}%</strong><span>first-try accuracy</span></div>
          <div><strong>{totalHints}</strong><span>Monster Hints used</span></div>
          <div><strong>{needsPractice.length}</strong><span>skills to practice</span></div>
          <div><strong>{learningState?.mission?.completed || 0}</strong><span>Today Missions complete</span></div>
        </div>

        <section className="parent-cloud-sync-card" aria-labelledby="cloud-sync-title">
          <div>
            <p className="eyebrow">Optional cloud progress</p>
            <h2 id="cloud-sync-title">Keep this learner’s report across devices</h2>
            <p>
              {isCloudSyncConfigured
                ? "Local play stays available. Turn on sync only when this child is linked to your Parent account."
                : "Supabase is not connected yet, so this report remains local to this device."}
            </p>
          </div>
          {isCloudSyncConfigured ? (
            <div className="parent-cloud-sync-card__controls">
              {cloudProfiles.length > 0 ? (
                <label>
                  <span>Linked learner</span>
                  <select
                    value={cloudSync.childId || ""}
                    onChange={(event) =>
                      runCloudAction(() => onSelectCloudLearner?.(event.target.value))
                    }
                    disabled={isCloudBusy}
                  >
                    <option value="">Choose a learner</option>
                    {cloudProfiles.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.display_name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <div className="parent-cloud-sync-card__actions">
                <ActionButton
                  color="blue"
                  disabled={isCloudBusy}
                  icon="Cloud"
                  onClick={() => runCloudAction(onLinkCloudLearner)}
                >
                  {cloudSync.childId ? "Link / refresh learner" : "Link this learner"}
                </ActionButton>
                {cloudSync.childId ? (
                  <label className="parent-cloud-sync-toggle">
                    <input
                      type="checkbox"
                      checked={Boolean(cloudSync.enabled)}
                      disabled={isCloudBusy}
                      onChange={(event) =>
                        runCloudAction(() => onToggleCloudSync?.(event.target.checked))
                      }
                    />
                    <span>Sync progress</span>
                  </label>
                ) : null}
              </div>
            </div>
          ) : null}
          {cloudError ? <p className="parent-cloud-sync-card__error" role="alert">{cloudError}</p> : null}
          {cloudSyncNotice ? <p className="parent-cloud-sync-card__notice" role="status">{cloudSyncNotice}</p> : null}
        </section>

        <section className="parent-progress-section">
          <div className="parent-progress-section__heading">
            <h2>Skill mastery</h2>
            <span>{summary.length} skills discovered</span>
          </div>
          {summary.length === 0 ? (
            <p className="parent-progress-empty">Start a Today Mission to begin the report.</p>
          ) : (
            <div className="parent-skill-list">
              {summary.map((skill) => (
                <article key={skill.skillId} className="parent-skill-row">
                  <div>
                    <strong>{skill.label || skill.skillId.replaceAll(":", " · ")}</strong>
                    <span>{skill.status} · {skill.attempts} tries · {skill.hintUses} hints</span>
                  </div>
                  <div className="parent-skill-row__score">
                    <strong>{skill.score}</strong>
                    <div><i style={{ width: `${skill.score}%` }} /></div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="parent-progress-recent">
          <strong>Latest activity</strong>
          <span>
            {totals.lastPlayedAt
              ? `Played ${formatDate(totals.lastPlayedAt)}`
              : "No activity recorded yet."}
          </span>
        </section>

        <div className="parent-progress-actions">
          <ActionButton color="orange" icon="Book" onClick={onOpenLibrary}>
            Open Learning Library
          </ActionButton>
          <ActionButton
            color="danger"
            icon="RefreshCw"
            onClick={() => {
              setIsResetDialogOpen(true);
            }}
          >
            Reset Adaptive Path
          </ActionButton>
        </div>
      </section>
      {isResetDialogOpen ? (
        <ConfirmDialog
          cancelLabel="Keep Progress"
          confirmLabel="Reset Adaptive Path"
          description="This clears the local adaptive path and any paused Today Mission on this device. Completed learning records stay in the report."
          id="reset-adaptive-path-dialog"
          onCancel={() => setIsResetDialogOpen(false)}
          onConfirm={() => {
            onReset?.();
            setIsResetDialogOpen(false);
          }}
          title="Reset your adaptive path?"
          tone="danger"
        />
      ) : null}
    </ScreenShell>
  );
}

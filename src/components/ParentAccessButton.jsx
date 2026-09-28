export function ParentAccessButton({ onUnlock }) {
  return (
    <button
      type="button"
      className="parent-access-button"
      aria-label="Open Parent / Teacher tools"
      onClick={onUnlock}
    >
      <span className="parent-access-button__icon" aria-hidden="true">
        ⚙
      </span>
      <span>
        <strong>Parent / Teacher</strong>
        <small>Progress and learning library</small>
      </span>
    </button>
  );
}

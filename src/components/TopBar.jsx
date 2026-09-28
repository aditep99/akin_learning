export function TopBar({ stars, coins }) {
  return (
    <header className="top-bar">
      <div className="top-bar__brand">
        <span className="top-bar__badge">EP</span>
        <div>
          <p className="eyebrow">English Explorer</p>
          <h1>Learning Path</h1>
        </div>
      </div>
      <div className="top-bar__stats" aria-label="Collected rewards">
        <div className="stat-pill">
          <span>⭐</span>
          <strong>{stars}</strong>
        </div>
        <div className="stat-pill">
          <span>🪙</span>
          <strong>{coins}</strong>
        </div>
      </div>
    </header>
  );
}

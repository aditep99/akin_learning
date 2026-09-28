import { ActionButton } from "../components/ActionButton";
import { MonsterCharacter } from "../components/MonsterCharacter";
import { ScreenShell } from "../components/ScreenShell";
import { TopBar } from "../components/TopBar";

export function RewardsScreen({
  bestScore = 0,
  collection = [],
  coins = 0,
  modes = [],
  onBack,
  onPlayArcade,
  onPress,
  stars = 0,
}) {
  return (
    <ScreenShell className="screen-shell--rewards">
      <TopBar stars={stars} coins={coins} />

      <section className="rewards-hero">
        <div>
          <p className="eyebrow">Your Monster Collection</p>
          <h1>My Rewards</h1>
          <p>Every little win helps your crew grow. Keep learning and collect more buddies.</p>
        </div>
        <div className="rewards-hero__buddy" aria-hidden="true">
          <MonsterCharacter buddyId="cloud-coco" decorative />
        </div>
      </section>

      <section className="rewards-stat-grid" aria-label="Reward totals">
        <div className="rewards-stat-card rewards-stat-card--gold">
          <span aria-hidden="true">★</span>
          <strong>{stars}</strong>
          <small>Stars</small>
        </div>
        <div className="rewards-stat-card rewards-stat-card--blue">
          <span aria-hidden="true">●</span>
          <strong>{coins}</strong>
          <small>Coins</small>
        </div>
        <div className="rewards-stat-card rewards-stat-card--violet">
          <span aria-hidden="true">🏆</span>
          <strong>{bestScore}</strong>
          <small>Arcade best</small>
        </div>
        <div className="rewards-stat-card rewards-stat-card--green">
          <span aria-hidden="true">●</span>
          <strong>{collection.length}/{modes.length}</strong>
          <small>Stickers</small>
        </div>
      </section>

      <section className="rewards-collection" aria-labelledby="rewards-collection-title">
        <header className="rewards-section-heading">
          <div>
            <p className="eyebrow">Buddy stickers</p>
            <h2 id="rewards-collection-title">Meet your arcade crew</h2>
          </div>
          <span>{collection.length} collected</span>
        </header>

        <div className="rewards-collection__grid">
          {modes.map((mode) => {
            const collected = collection.includes(mode.id);

            return (
              <article
                key={mode.id}
                className={`rewards-sticker ${collected ? "is-collected" : "is-locked"}`.trim()}
              >
                <div className="rewards-sticker__art">
                  <MonsterCharacter
                    buddyId={mode.buddyId}
                    decorative={!collected}
                    title={`${mode.label} sticker`}
                  />
                  {!collected ? (
                    <span className="rewards-sticker__lock" aria-label="Sticker locked">?</span>
                  ) : null}
                </div>
                <strong>{mode.label}</strong>
                <small>{collected ? "Sticker collected" : "Play to collect"}</small>
              </article>
            );
          })}
        </div>
      </section>

      <div className="rewards-actions">
        <ActionButton
          color="orange"
          icon="Play"
          onClick={() => {
            onPress?.();
            onPlayArcade?.();
          }}
          wide
        >
          Play Arcade
        </ActionButton>
        <ActionButton
          color="blue"
          icon="Home"
          onClick={() => {
            onPress?.();
            onBack?.();
          }}
          wide
        >
          Back to Home
        </ActionButton>
      </div>
    </ScreenShell>
  );
}

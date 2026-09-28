import { ActionButton } from "../components/ActionButton";
import { MonsterCharacter } from "../components/MonsterCharacter";
import { ScreenShell } from "../components/ScreenShell";

export function ArcadeHomeScreen({
  bestScore = 0,
  collection = [],
  favorites = [],
  modes = [],
  onBack,
  onPress,
  onStart,
  onToggleFavorite,
  wordCount = 0,
}) {
  const hasFavorites = favorites.length > 0;

  return (
    <ScreenShell className="screen-shell--arcade-home arcade-simple-shell">
      <section className="arcade-simple-intro" aria-labelledby="arcade-simple-title">
        <div className="arcade-simple-intro__copy">
          <p className="eyebrow">Monster Game Arcade</p>
          <h1 id="arcade-simple-title">Pick a game and start learning.</h1>
          <p>
            Play a quick monster game with pictures, words, and sounds. There is
            no timer, so you can learn at your own pace.
          </p>

          <div className="arcade-simple-intro__actions">
            <ActionButton
              color="orange"
              onClick={() => {
                onPress();
                onStart({ favoriteOnly: false });
              }}
              wide
            >
              Start Arcade
            </ActionButton>
            {hasFavorites ? (
              <button
                type="button"
                className="arcade-simple-secondary"
                onClick={() => {
                  onPress();
                  onStart({ favoriteOnly: true });
                }}
              >
                ★ Play Favorites
              </button>
            ) : null}
          </div>

          <button
            type="button"
            className="arcade-simple-back"
            onClick={() => {
              onPress();
              onBack();
            }}
          >
            ← Back to Mission Map
          </button>
        </div>

        <div className="arcade-simple-intro__buddy">
          <MonsterCharacter buddyId="cloud-coco" title="Cloud Coco, arcade buddy" />
          <span>Let’s play!</span>
        </div>
      </section>

      <section className="arcade-simple-stats" aria-label="Arcade progress">
        <div>
          <span>Best score</span>
          <strong>{bestScore}</strong>
        </div>
        <div>
          <span>Stickers</span>
          <strong>{collection.length}/{modes.length}</strong>
        </div>
        <div>
          <span>Words ready</span>
          <strong>{wordCount}</strong>
        </div>
      </section>

      <section className="arcade-simple-games" aria-labelledby="arcade-simple-games-title">
        <header className="arcade-simple-games__header">
          <div>
            <p className="eyebrow">Choose a game</p>
            <h2 id="arcade-simple-games-title">What should we play?</h2>
            <p>Star a game to find it easily next time.</p>
          </div>
          <span>{favorites.length} starred</span>
        </header>

        <div className="arcade-simple-games__grid">
          {modes.map((mode) => {
            const isFavorite = favorites.includes(mode.id);
            const isCollected = collection.includes(mode.id);
            const startThisGame = () => {
              onPress();
              onStart({ modeId: mode.id });
            };

            return (
              <article
                className={`arcade-simple-game ${isFavorite ? "is-favorite" : ""}`.trim()}
                key={mode.id}
                role="button"
                tabIndex={0}
                aria-label={`Play ${mode.label}`}
                onClick={startThisGame}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) {
                    return;
                  }

                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    startThisGame();
                  }
                }}
              >
                <MonsterCharacter
                  buddyId={mode.buddyId}
                  decorative
                  className="arcade-simple-game__buddy"
                />
                <div className="arcade-simple-game__copy">
                  <strong>{mode.label}</strong>
                  <span>{mode.description}</span>
                  {isCollected ? <small>Sticker collected</small> : null}
                </div>
                <span className="arcade-simple-game__play" aria-hidden="true">
                  Play
                </span>
                <button
                  className="arcade-simple-game__favorite"
                  type="button"
                  aria-label={`${isFavorite ? "Remove" : "Add"} ${mode.label} favorite`}
                  aria-pressed={isFavorite}
                  onClick={(event) => {
                    event.stopPropagation();
                    onPress();
                    onToggleFavorite(mode.id);
                  }}
                >
                  {isFavorite ? "★" : "☆"}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </ScreenShell>
  );
}

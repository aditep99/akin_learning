import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import akinMascot from "../assets/characters/akin-mascot.png";
import { ActionButton } from "../components/ActionButton";
import { LevelNode } from "../components/LevelNode";
import { MonsterCharacter } from "../components/MonsterCharacter";
import { ScreenShell } from "../components/ScreenShell";
import { TopBar } from "../components/TopBar";
import { pickMonsterBuddy } from "../data/characterRoster";

const levelPositions = [
  { left: "8%", top: "64%" },
  { left: "24%", top: "34%" },
  { left: "42%", top: "60%" },
  { left: "61%", top: "27%" },
  { left: "79%", top: "54%" },
];

function getLevelPosition(index, totalLevels) {
  if (totalLevels <= levelPositions.length) {
    return levelPositions[index];
  }

  const left = 8 + (84 / Math.max(totalLevels - 1, 1)) * index;
  const topPattern = [64, 34, 60, 27, 54];

  return {
    left: `${left}%`,
    top: `${topPattern[index % topPattern.length]}%`,
  };
}

export function AdventureMapScreen({
  completedLevels,
  currentLevel,
  levels,
  onBack,
  onOpenArcade,
  onOpenTodayMission,
  onSelectSubject,
  onStartLevel,
  profile,
  selectedSubjectId,
  stars,
  subjects,
  coins,
  focusMissionMap = false,
  onPress,
  learningSummary = [],
  trackLabel = "",
}) {
  const selectedSubject =
    subjects.find((subject) => subject.id === selectedSubjectId) || null;
  const unlockedLevels = Math.min(currentLevel, levels.length);
  const nextGoal = levels.length === 0 ? 1 : Math.min(currentLevel, levels.length);
  const nextLevelData = levels[nextGoal - 1] || null;
  const selectedBuddy = pickMonsterBuddy(
    selectedSubject?.id || "learning-world",
    selectedSubject?.homeOrder || 0,
  );
  const mapBoardRef = useRef(null);

  useEffect(() => {
    if (!focusMissionMap || !mapBoardRef.current) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      )?.matches;

      mapBoardRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
      mapBoardRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [focusMissionMap, selectedSubjectId]);

  return (
    <ScreenShell
      className={`screen-shell--map ${
        focusMissionMap ? "screen-shell--map-focused" : ""
      }`.trim()}
    >
      <TopBar stars={stars} coins={coins} />

      <section className="map-toolbar">
        <div>
          <p className="eyebrow">Mission HQ</p>
          <h2>{profile.label}'s Adventure</h2>
        </div>
        <div className="map-toolbar__actions">
          <ActionButton
            color="red"
            icon="Home"
            onClick={() => {
              onPress();
              onBack();
            }}
          >
            Base
          </ActionButton>
          {selectedSubject?.id === "learning-games" && onOpenArcade ? (
            <ActionButton
              color="orange"
              icon="Play"
              onClick={() => {
                onPress();
                onOpenArcade();
              }}
            >
              Endless Arcade
            </ActionButton>
          ) : null}
        </div>
      </section>

      <section
        className="subject-strip"
        aria-label="Choose a subject"
      >
        {subjects.map((subject) => (
          <button
            key={subject.id}
            aria-pressed={subject.id === selectedSubjectId}
            className={`subject-chip ${
              subject.id === selectedSubjectId ? "subject-chip--active" : ""
            }`}
            onClick={() => {
              onPress();
              onSelectSubject(subject.id);
            }}
            type="button"
          >
            <span className="subject-chip__icon">{subject.icon}</span>
            <span className="subject-chip__copy">
              <strong>{subject.name}</strong>
              <small>
                {subject.totalLevels === 0
                  ? "No words"
                  : `${subject.completedLevels}/${subject.totalLevels} levels`}
              </small>
            </span>
          </button>
        ))}
      </section>

      <section className="map-status-card">
        <div className="map-status-card__main">
          <p className="eyebrow">Current World</p>
          <h3>
            {selectedSubject?.icon || "Book"} {selectedSubject?.name || "No subject"}
            {trackLabel ? ` · ${trackLabel}` : ""}
          </h3>
          {selectedSubject?.description ? <p>{selectedSubject.description}</p> : null}
          <div className="map-status-card__ribbon">
            <span>Unlocked {unlockedLevels}/{levels.length || 0}</span>
            <strong>Mission {nextGoal}</strong>
          </div>
          {nextLevelData?.themeLabel ? (
            <div className="map-status-card__theme">
              <small>Next mission</small>
              <strong>{nextLevelData.themeLabel}</strong>
            </div>
          ) : null}
        </div>

        <div className="map-status-card__meta">
          <span className="map-status-pill">{levels.length} missions</span>
          <span className="map-status-pill">{completedLevels} cleared</span>
          <div className="map-coach-card">
            {!focusMissionMap ? (
              <img src={akinMascot} alt="Akin guide" className="map-coach-card__image" />
            ) : null}
            <div className="map-coach-card__copy">
              <strong>Akin says</strong>
              <span>
                {nextLevelData?.themeLabel
                  ? `Next up: ${nextLevelData.themeLabel}`
                  : "Pick a node and keep your streak going."}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="today-mission-card" aria-label="Today Mission">
        <div className="today-mission-card__copy">
          <span className="eyebrow">Akin's recommendation</span>
          <h3>Today Mission</h3>
          <p>
            {learningSummary.length > 0
              ? `${learningSummary.filter((skill) => skill.score < 60).length} skills are ready for a little practice.`
              : "A short mix of play, practice, and a new discovery."}
          </p>
        </div>
        <div className="today-mission-card__meta">
          <span>3–5 activities</span>
          <span>About 10 minutes</span>
          <ActionButton
            color="green"
            icon="Play"
            onClick={() => {
              onPress();
              onOpenTodayMission?.();
            }}
          >
            Start Today Mission
          </ActionButton>
        </div>
      </section>

      <section
        ref={mapBoardRef}
        className="map-board"
        aria-label="Adventure map"
        tabIndex={-1}
      >
        <div className="map-board__mist map-board__mist--one" aria-hidden="true" />
        <div className="map-board__mist map-board__mist--two" aria-hidden="true" />
        <div className="map-board__spark map-board__spark--one" aria-hidden="true" />
        <div className="map-board__spark map-board__spark--two" aria-hidden="true" />
        <div className="map-board__spark map-board__spark--three" aria-hidden="true" />
        <div className="map-board__cloud map-board__cloud--one" aria-hidden="true" />
        <div className="map-board__cloud map-board__cloud--two" aria-hidden="true" />
        <div className="map-board__trail-badge" aria-hidden="true">
          <span>{selectedSubject?.icon || "Book"}</span>
          <strong>Mission Map</strong>
        </div>
        {!focusMissionMap ? (
          <motion.div
            className="map-board__mission-buddy"
            animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY }}
          >
            <MonsterCharacter
              buddyId={selectedBuddy.id}
              title={`${selectedBuddy.name}, ${selectedSubject?.name || "learning"} buddy`}
            />
          </motion.div>
        ) : null}
        <div className="map-board__marker map-board__marker--start" aria-hidden="true">
          <span>Start</span>
          <small>Start</small>
        </div>
        <div className="map-board__marker map-board__marker--goal" aria-hidden="true">
          <span>Goal</span>
          <small>Goal</small>
        </div>

        <svg
          className="map-board__path"
          viewBox="0 0 1000 420"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="map-board__path-shadow"
            d="M30 300 C160 380, 220 60, 370 160 S640 350, 760 120 S930 210, 970 230"
          />
          <path
            d="M30 300 C160 380, 220 60, 370 160 S640 350, 760 120 S930 210, 970 230"
            pathLength="1"
          />
        </svg>

        {levels.length === 0 ? (
          <div className="map-empty">
            <div className="map-empty__art">{selectedSubject?.icon || "Book"}</div>
            <h3>Coming soon</h3>
            <p>Choose another world while Akin prepares this mission.</p>
            <ActionButton
              color="green"
              icon="Home"
              onClick={() => {
                onPress();
                onBack();
              }}
            >
              Choose World
            </ActionButton>
          </div>
        ) : null}

        {levels.map((levelData, index) => {
          const position = getLevelPosition(index, levels.length);
          const level = index + 1;
          const completed = completedLevels >= level;
          const active = currentLevel === level;
          const locked = level > currentLevel;

          return (
            <LevelNode
              key={levelData.id}
              active={active}
              caption={levelData.mapCaption || `${levelData.wordCount} words`}
              completed={completed}
              left={position.left}
              level={level}
              locked={locked}
              onSelect={() => {
                onPress();
                if (!locked) {
                  onStartLevel(level);
                }
              }}
              themeLabel={levelData.themeLabel}
              top={position.top}
            />
          );
        })}

        {!focusMissionMap ? (
          <>
            <motion.div
              className="map-board__landmark map-board__landmark--forest"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              🌲
            </motion.div>
            <motion.div
              className="map-board__landmark map-board__landmark--castle"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY }}
            >
              🏰
            </motion.div>
          </>
        ) : null}
      </section>
    </ScreenShell>
  );
}

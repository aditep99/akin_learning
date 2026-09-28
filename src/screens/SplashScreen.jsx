import { motion } from "framer-motion";
import { useMemo } from "react";
import akinMascot from "../assets/characters/akin-mascot.png";
import { MonsterCharacter } from "../components/MonsterCharacter";
import { ParentAccessButton } from "../components/ParentAccessButton";
import { ScreenShell } from "../components/ScreenShell";
import { pickMonsterBuddy } from "../data/characterRoster";

const akinProfile = {
  id: "akin",
  emoji: "A",
  label: "Akin",
  image: akinMascot,
};

export const WORLD_GROUPS = [
  {
    id: "learn",
    label: "Learn",
    description: "Build your first word collection.",
    icon: "📚",
  },
  {
    id: "practice",
    label: "Practice",
    description: "Strengthen skills with quick challenges.",
    icon: "✏️",
  },
  {
    id: "math",
    label: "Math",
    description: "Count, solve, and discover patterns.",
    icon: "🔢",
  },
  {
    id: "play",
    label: "Play",
    description: "Learn through monster games.",
    icon: "🎮",
  },
];

const PRACTICE_SUBJECT_IDS = new Set([
  "english-exercises",
  "thai-exercises",
  "science-exercises",
  "english-spelling",
  "thai-spelling",
]);

function getWorldGroup(subject) {
  if (subject?.id === "learning-games") {
    return "play";
  }

  if (["math", "math-genius", "math-lessons"].includes(subject?.id)) {
    return "math";
  }

  if (PRACTICE_SUBJECT_IDS.has(subject?.id) || subject?.category === "exercise") {
    return "practice";
  }

  return "learn";
}

export function getSubjectsForWorldGroup(subjects, groupId = "all") {
  if (groupId === "all") {
    return subjects;
  }

  return subjects.filter((subject) => getWorldGroup(subject) === groupId);
}

function getGroupById(groupId) {
  return WORLD_GROUPS.find((group) => group.id === groupId) || WORLD_GROUPS[0];
}

function getProgressUnit(subject) {
  return subject?.id === "math-lessons" ? "lessons" : "levels";
}

function getBuddy(subject, offset = 0) {
  return pickMonsterBuddy(
    subject?.id || subject?.name || "akin-world",
    (subject?.homeOrder || 0) + offset,
  );
}

function sortSubjects(subjects) {
  return [...subjects].sort((left, right) => {
    const leftOrder = left.homeOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.homeOrder ?? Number.MAX_SAFE_INTEGER;
    return leftOrder === rightOrder
      ? left.name.localeCompare(right.name)
      : leftOrder - rightOrder;
  });
}

function WorldMiniMap({ totalLevels = 0, completedLevels = 0 }) {
  const visibleCount = Math.max(3, Math.min(totalLevels || 3, 6));
  const completedCount = Math.min(completedLevels, visibleCount);

  return (
    <div
      className="mission-world-card__path"
      aria-label={`${completedLevels} levels complete`}
    >
      <span className="mission-world-card__line" aria-hidden="true" />
      {Array.from({ length: visibleCount }).map((_, index) => (
        <span
          key={`mission-node-${index + 1}`}
          className={`mission-world-card__node ${
            index < completedCount ? "is-done" : ""
          } ${index === completedCount ? "is-next" : ""}`.trim()}
        />
      ))}
    </div>
  );
}

function WorldCard({ index, onOpen, onPress, selectedSubjectId, subject }) {
  const buddy = getBuddy(subject);
  const isSelected = subject.id === selectedSubjectId;

  return (
    <motion.button
      type="button"
      className={`mission-world-card mission-world-card--${
        subject.heroAccent || "gold"
      } ${isSelected ? "is-selected" : ""}`.trim()}
      onClick={() => {
        onPress();
        onOpen(subject.id);
      }}
      whileHover={{ y: -7 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="mission-world-card__number">
        World {String(index + 1).padStart(2, "0")}
      </span>
      <MonsterCharacter
        buddyId={buddy.id}
        title={`${buddy.name}, ${subject.name} buddy`}
        className="mission-world-card__buddy"
      />
      <div className="mission-world-card__copy">
        <span>{subject.worldTheme || subject.name}</span>
        <strong>{subject.worldLabel || subject.name}</strong>
        <small>
          {subject.totalLevels} {getProgressUnit(subject)}
        </small>
      </div>
      <WorldMiniMap
        totalLevels={subject.totalLevels}
        completedLevels={subject.completedLevels}
      />
      <span className="mission-world-card__play">Play →</span>
    </motion.button>
  );
}

function FeaturedWorld({
  onOpen,
  onPress,
  selectedSubjectId,
  subject,
}) {
  if (!subject) {
    return null;
  }

  const buddy = getBuddy(subject);
  const hasProgress = subject.completedLevels > 0;

  return (
    <section className="home-featured-world" aria-labelledby="featured-world-title">
      <div className="home-featured-world__art">
        <MonsterCharacter
          buddyId={buddy.id}
          title={`${buddy.name}, ${subject.name} buddy`}
        />
        <span className="home-featured-world__spark" aria-hidden="true">✦</span>
      </div>
      <div className="home-featured-world__content">
        <p className="eyebrow">{hasProgress ? "Continue your adventure" : "Featured world"}</p>
        <h2 id="featured-world-title">
          {subject.worldLabel || subject.name}
        </h2>
        <p>
          {hasProgress
            ? `You are on level ${Math.min(subject.completedLevels + 1, subject.totalLevels)}. Ready for the next step?`
            : "Choose a world and start collecting learning wins."}
        </p>
        <div className="home-featured-world__progress" aria-label={`${subject.completedLevels} of ${subject.totalLevels} levels complete`}>
          <span>
            {subject.completedLevels}/{subject.totalLevels} {getProgressUnit(subject)}
          </span>
          <div className="home-featured-world__progress-track" aria-hidden="true">
            <span style={{ width: `${Math.min(100, (subject.completedLevels / Math.max(subject.totalLevels, 1)) * 100)}%` }} />
          </div>
        </div>
        <button
          type="button"
          className="home-featured-world__cta"
          onClick={() => {
            onPress();
            onOpen(subject.id);
          }}
          aria-label={`${hasProgress ? "Continue" : "Choose"} ${subject.worldLabel || subject.name}`}
        >
          {hasProgress ? "Continue Adventure" : "Choose a World"}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}

export function SplashScreen({
  activeGroup = "all",
  onChangeGroup,
  onOpenParent,
  onOpenTodayMission,
  onOpenWorlds,
  onPress,
  onSelectProfile,
  onSelectSubject,
  selectedSubjectId,
  subjects = [],
  todayEntry = {},
  todayStartError = "",
  view = "worlds",
}) {
  const orderedSubjects = useMemo(() => sortSubjects(subjects), [subjects]);
  const featuredSubject =
    orderedSubjects.find((subject) => subject.id === selectedSubjectId) ||
    orderedSubjects[0] ||
    null;
  const visibleSubjects = useMemo(
    () => getSubjectsForWorldGroup(orderedSubjects, activeGroup),
    [activeGroup, orderedSubjects],
  );
  const selectedGroup = getGroupById(activeGroup);
  const completedLevels = orderedSubjects.reduce(
    (total, subject) => total + (subject.completedLevels || 0),
    0,
  );

  const openWorld = (subjectId) => {
    onSelectSubject(subjectId);
    onSelectProfile(akinProfile, subjectId);
  };

  const handleStart = () => {
    onOpenWorlds?.("all");
  };

  return (
    <ScreenShell
      className="screen-shell--splash home-shell--mission"
      variant="LearningShell"
    >
      {view === "home" ? (
        <>
          <section className="mission-hero mission-hero--compact">
            <div className="mission-hero__copy">
              <span className="mission-hero__eyebrow">Akin Mission World</span>
              <h1>Ready for your next mission?</h1>
              <p>One short mission, one clear next step, and a monster ready to cheer you on.</p>
              <div className="mission-hero__quick-actions">
                <button
                  type="button"
                  className="mission-hero__today mission-hero__today--primary"
                  onClick={() => {
                    onPress();
                    onOpenTodayMission?.();
                  }}
                >
                  <span aria-hidden="true">✦</span>
                  <span>
                    <small>{todayEntry.eyebrow || "Recommended for you"}</small>
                    <strong>{todayEntry.label || "Discover My Path"}</strong>
                    <b>{todayEntry.description || "Find a friendly place to begin."}</b>
                  </span>
                  <strong aria-hidden="true">→</strong>
                </button>
                <button type="button" className="mission-hero__start" onClick={() => { onPress(); handleStart(); }}>
                  <span>Explore Worlds</span>
                  <strong aria-hidden="true">→</strong>
                </button>
              </div>
              {todayStartError ? (
                <div className="mission-hero__error" role="alert">
                  <strong>Today Mission is taking a break.</strong>
                  <span>{todayStartError}</span>
                  <button type="button" onClick={() => onOpenWorlds?.("all")}>
                    Explore Worlds
                  </button>
                </div>
              ) : null}
              <div className="mission-hero__badges">
                {completedLevels > 0 ? <span>✦ {completedLevels} levels cleared</span> : null}
                <span>◈ {orderedSubjects.length} worlds to explore</span>
              </div>
            </div>
            <div className="mission-hero__crew mission-hero__crew--single" aria-label="Akin mission guide">
              <div className="mission-hero__akin">
                <img src={akinMascot} alt="Akin, mission guide" />
                <span>Mission Guide</span>
              </div>
              <MonsterCharacter buddyId={getBuddy(featuredSubject).id} title="Your mission buddy" />
            </div>
          </section>

          <FeaturedWorld
            onOpen={openWorld}
            onPress={onPress}
            selectedSubjectId={selectedSubjectId}
            subject={featuredSubject}
          />

          <section className="home-world-groups" aria-labelledby="world-groups-title">
            <header className="home-section-heading">
              <div>
                <p className="eyebrow">Find your next adventure</p>
                <h2 id="world-groups-title">Choose how you want to learn</h2>
              </div>
              <button type="button" className="text-button" onClick={() => { onPress(); onOpenWorlds?.("all"); }}>
                Explore Worlds <span aria-hidden="true">→</span>
              </button>
            </header>

            <div className="home-world-groups__grid">
              {WORLD_GROUPS.map((group) => {
                const groupSubjects = getSubjectsForWorldGroup(orderedSubjects, group.id);

                return (
                  <article className="home-world-group" key={group.id}>
                    <header className="home-world-group__header">
                      <div>
                        <span className="home-world-group__icon" aria-hidden="true">{group.icon}</span>
                        <div>
                          <h3>{group.label}</h3>
                          <p>{group.description}</p>
                        </div>
                      </div>
                      <button type="button" className="home-world-group__view-all" onClick={() => { onPress(); onOpenWorlds?.(group.id); }}>
                        View All
                      </button>
                    </header>
                    <div className="home-world-group__cards">
                      {groupSubjects.slice(0, 3).map((subject, index) => (
                        <WorldCard
                          key={subject.id}
                          index={index}
                          onOpen={openWorld}
                          onPress={onPress}
                          selectedSubjectId={selectedSubjectId}
                          subject={subject}
                        />
                      ))}
                      {!groupSubjects.length ? <p className="empty-state">More worlds are coming soon.</p> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="world-explorer-hero">
            <div>
              <p className="eyebrow">Your learning map</p>
              <h1>Explore Worlds</h1>
              <p>Choose a world whenever you feel ready. Your progress stays right where you left it.</p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                onPress();
                onOpenTodayMission?.();
              }}
            >
              ✦ Open Today Mission
            </button>
          </section>

          <section className="mission-worlds mission-worlds--explorer" aria-labelledby="explorer-title">
            <header className="mission-worlds__header">
              <div>
                <span>World Select</span>
                <h2 id="explorer-title">Find your next adventure</h2>
              </div>
              <div className="mission-worlds__filters" role="tablist" aria-label="World categories">
                <button
                  type="button"
                  className={activeGroup === "all" ? "is-active" : ""}
                  aria-selected={activeGroup === "all"}
                  role="tab"
                  onClick={() => { onPress(); onChangeGroup?.("all"); }}
                >
                  All
                </button>
                {WORLD_GROUPS.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    className={activeGroup === group.id ? "is-active" : ""}
                    aria-selected={activeGroup === group.id}
                    role="tab"
                    onClick={() => { onPress(); onChangeGroup?.(group.id); }}
                  >
                    {group.label}
                  </button>
                ))}
              </div>
            </header>
            <p className="world-explorer-category-note">{activeGroup === "all" ? "All worlds" : `${selectedGroup.label}: ${selectedGroup.description}`}</p>
            <div className="mission-world-grid">
              {visibleSubjects.map((subject, index) => (
                <WorldCard
                  key={subject.id}
                  index={index}
                  onOpen={openWorld}
                  onPress={onPress}
                  selectedSubjectId={selectedSubjectId}
                  subject={subject}
                />
              ))}
            </div>
          </section>
        </>
      )}

      <footer className="home-parent-entry">
        <ParentAccessButton
          onUnlock={() => {
            onPress();
            onOpenParent();
          }}
        />
      </footer>
    </ScreenShell>
  );
}

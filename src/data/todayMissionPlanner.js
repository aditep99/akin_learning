import { buildSubjectLevels } from "./contentLibrary.js";
import { getDifficultyForScore, getSkillId } from "./masteryEngine.js";

function randomValue(rng) {
  const value = typeof rng === "function" ? rng() : Math.random();
  return Number.isFinite(value) ? Math.min(0.999999, Math.max(0, value)) : Math.random();
}

function shuffle(items, rng) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomValue(rng) * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }

  return nextItems;
}

function getLevelItems(level) {
  if (Array.isArray(level?.exercises) && level.exercises.length > 0) {
    return level.exercises;
  }

  if (Array.isArray(level?.words) && level.words.length > 0) {
    return level.words;
  }

  if (Array.isArray(level?.reviewWords) && level.reviewWords.length > 0) {
    return level.reviewWords;
  }

  return [
    {
      id: `${level?.id || "level"}-surface-placeholder`,
      mode: level?.mode || "activity",
      surfaceId: level?.surfaceId,
      surfaceKind: level?.surfaceKind,
      surfaceVariant: level?.surfaceVariant,
      rendererKey: level?.rendererKey,
      answerRepresentation: level?.answerRepresentation,
    },
  ];
}

function getSubjectEntries(subject) {
  if (subject?.id === "math-genius") {
    return (subject.tracks || []).flatMap((track) =>
      (track.levels || []).map((level) => ({
        subject,
        level,
        trackId: track.id,
        trackLabel: track.name,
      })),
    );
  }

  return buildSubjectLevels(subject).map((level) => ({ subject, level }));
}

function buildCandidates(library, learningState) {
  const candidates = [];

  library.forEach((subject) => {
    getSubjectEntries(subject).forEach(({ level, trackId, trackLabel }) => {
      const levelItems = getLevelItems(level);

      levelItems.forEach((template, exerciseIndex) => {
        const skillId = getSkillId({
          subjectId: subject.id,
          levelId: level.id,
          challenge: template,
          levelConfig: level,
        });
        const mastery = learningState?.mastery?.[skillId];

        candidates.push({
          id: `${subject.id}:${trackId || "default"}:${level.id}:${exerciseIndex}`,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectIcon: subject.icon,
          levelId: level.id,
          levelNumber: level.levelNumber || 1,
          levelConfig: level,
          trackId,
          trackLabel,
          exerciseIndex,
          template,
          mode: template?.mode || level.mode || "vocab-choice",
          skillId,
          difficulty: getDifficultyForScore(mastery?.score || 0),
          masteryScore: mastery?.score || 0,
          dueAt: mastery?.dueAt || null,
        });
      });
    });
  });

  return candidates;
}

function scoreCandidate(candidate, selected, diagnostic) {
  const due = candidate.dueAt && Number(candidate.dueAt) <= Date.now();
  const alreadySelected = selected.some((item) => item.skillId === candidate.skillId);
  const sameSubject = selected.some((item) => item.subjectId === candidate.subjectId);
  let score = candidate.masteryScore < 60 ? 40 : 0;

  if (due) score += 35;
  if (candidate.masteryScore === 0) score += 20;
  if (!sameSubject) score += diagnostic ? 10 : 18;
  if (!alreadySelected) score += 18;
  score += diagnostic ? 12 : 0;

  return score;
}

function pickCandidates(candidates, count, rng, diagnostic) {
  const pool = shuffle(candidates, rng);
  const selected = [];

  while (selected.length < count && pool.length > 0) {
    const ranked = pool
      .map((candidate) => ({
        candidate,
        score: scoreCandidate(candidate, selected, diagnostic),
      }))
      .sort((left, right) => right.score - left.score);
    const topScore = ranked[0]?.score ?? 0;
    const shortlist = ranked.filter((item) => item.score >= topScore - 10);
    const chosen = shortlist[Math.floor(randomValue(rng) * shortlist.length)]?.candidate;

    if (!chosen) break;

    selected.push(chosen);
    pool.splice(pool.findIndex((item) => item.id === chosen.id), 1);
  }

  return selected;
}

export function buildTodayMission({
  library = [],
  profile,
  learningState,
  challengeHistory,
  rng,
  diagnostic = false,
} = {}) {
  const candidates = buildCandidates(library, learningState);
  const desiredCount = diagnostic ? 10 : Math.min(5, Math.max(3, 4));
  const activities = pickCandidates(candidates, desiredCount, rng, diagnostic).map(
    (candidate, index) => ({
      ...candidate,
      index,
      reason: diagnostic
        ? "world-check"
        : candidate.masteryScore < 60
          ? "practice"
          : candidate.masteryScore === 0
            ? "new-skill"
            : index === 0
              ? "review"
              : "confidence",
    }),
  );

  return {
    id: `${profile?.id || "local-child"}-${diagnostic ? "diagnostic" : "today"}-${Date.now()}`,
    type: diagnostic ? "diagnostic" : "today-mission",
    title: diagnostic ? "Open a New Monster World" : "Today Mission",
    instruction: diagnostic
      ? "Play a few quick missions so Akin can find your best path."
      : "A short adventure with a little review, a little discovery, and a confidence win.",
    targetMinutes: 10,
    activities,
    challengeHistorySize: Array.isArray(challengeHistory) ? challengeHistory.length : 0,
  };
}

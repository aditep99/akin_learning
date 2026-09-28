import { createEmptyLearningState } from "./learningProfile.js";

export const MASTERY_STATUS = {
  NEEDS_PRACTICE: "Needs Practice",
  LEARNING: "Learning",
  READY: "Ready",
  MASTERED: "Mastered",
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toTimestamp(value, fallback = Date.now()) {
  return Number.isFinite(value) ? value : fallback;
}

export function getSkillId({ subjectId, levelId, challenge, levelConfig, mode, skillId } = {}) {
  return (
    skillId ||
    challenge?.skillId ||
    levelConfig?.skillId ||
    `${subjectId || "unknown"}:${levelId || "level"}:${challenge?.mode || mode || "activity"}`
  );
}

export function getMasteryStatus(score = 0, streak = 0) {
  if (score >= 90 && streak >= 3) {
    return MASTERY_STATUS.MASTERED;
  }

  if (score >= 80) {
    return MASTERY_STATUS.READY;
  }

  if (score >= 60) {
    return MASTERY_STATUS.LEARNING;
  }

  return MASTERY_STATUS.NEEDS_PRACTICE;
}

export function getDifficultyForScore(score = 0) {
  if (score >= 80) {
    return 3;
  }

  if (score >= 50) {
    return 2;
  }

  return 1;
}

function addDays(timestamp, days) {
  return timestamp + days * 24 * 60 * 60 * 1000;
}

function getReviewDays(streak) {
  if (streak >= 3) {
    return 7;
  }

  if (streak >= 2) {
    return 3;
  }

  return 1;
}

function normalizeSkillRecord(record = {}) {
  const score = clamp(Number(record.score) || 0, 0, 100);
  const streak = Math.max(0, Number(record.streak) || 0);

  return {
    label: typeof record.label === "string" ? record.label : "Monster skill",
    score,
    status: getMasteryStatus(score, streak),
    attempts: Math.max(0, Number(record.attempts) || 0),
    correct: Math.max(0, Number(record.correct) || 0),
    firstTryCorrect: Math.max(0, Number(record.firstTryCorrect) || 0),
    hintUses: Math.max(0, Number(record.hintUses) || 0),
    streak,
    lastPlayedAt: record.lastPlayedAt || null,
    dueAt: record.dueAt || null,
    lastDifficulty: getDifficultyForScore(score),
  };
}

export function recordLearningAttempt(state, event = {}) {
  const baseState = createEmptyLearningState(state);
  const skillId = getSkillId(event);
  const now = toTimestamp(event.now);
  const previous = normalizeSkillRecord(baseState.mastery[skillId]);
  const correct = Boolean(event.correct);
  const attemptNumber = Math.max(1, Number(event.attemptNumber) || 1);
  const hintLevel = Math.max(0, Number(event.hintLevel) || 0);
  const rawReward = correct
    ? attemptNumber === 1
      ? 12
      : 6
    : -8;
  const reward = correct
    ? Math.max(1, rawReward - hintLevel * 2)
    : rawReward;
  const nextScore = clamp(previous.score + reward, 0, 100);
  const nextStreak = correct ? previous.streak + 1 : 0;
  const nextRecord = normalizeSkillRecord({
    ...previous,
    label:
      event.skillLabel ||
      challengeLabel(event.challenge) ||
      event.levelConfig?.themeLabel ||
      skillId,
    score: nextScore,
    attempts: previous.attempts + 1,
    correct: previous.correct + (correct ? 1 : 0),
    firstTryCorrect:
      previous.firstTryCorrect + (correct && attemptNumber === 1 ? 1 : 0),
    hintUses: previous.hintUses + (hintLevel > 0 ? 1 : 0),
    streak: nextStreak,
    lastPlayedAt: now,
    dueAt: correct ? addDays(now, getReviewDays(nextStreak)) : now,
    lastDifficulty: getDifficultyForScore(nextScore),
  });

  const nextState = {
    ...baseState,
    mastery: {
      ...baseState.mastery,
      [skillId]: nextRecord,
    },
    sessionStats: {
      ...baseState.sessionStats,
      totalQuestions: baseState.sessionStats.totalQuestions + 1,
      totalCorrect: baseState.sessionStats.totalCorrect + (correct ? 1 : 0),
      lastPlayedAt: now,
    },
  };

  return nextState;
}

function challengeLabel(challenge) {
  return challenge?.skillLabel || challenge?.title || challenge?.label || "";
}

export function recordLearningSession(state, completed = true, now = Date.now()) {
  const baseState = createEmptyLearningState(state);

  return {
    ...baseState,
    sessionStats: {
      ...baseState.sessionStats,
      totalSessions: baseState.sessionStats.totalSessions + (completed ? 1 : 0),
      lastPlayedAt: now,
    },
  };
}

export function getSkillSummary(state) {
  const mastery = state?.mastery || {};

  return Object.entries(mastery)
    .map(([skillId, record]) => ({ skillId, ...normalizeSkillRecord(record) }))
    .sort((left, right) => left.score - right.score || left.skillId.localeCompare(right.skillId));
}

export function getDueSkills(state, now = Date.now()) {
  return getSkillSummary(state).filter(
    (skill) => skill.dueAt && Number(skill.dueAt) <= now,
  );
}

export function resetAdaptiveProgress(state) {
  const baseState = createEmptyLearningState(state);

  return createEmptyLearningState({
    ...baseState,
    mastery: {},
    diagnostic: { status: "not-started", questionIndex: 0, total: 10 },
    mission: {
      status: "idle",
      index: 0,
      completed: 0,
      lastCompletedAt: null,
    },
    activeMission: null,
  });
}

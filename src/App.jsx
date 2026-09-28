import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { GameCompanionHUD } from "./components/GameCompanionHUD";
import { ArcadeHUD } from "./components/ArcadeHUD";
import { AppNavigation } from "./components/AppNavigation";
import { NavigationLeaveDialog } from "./components/NavigationLeaveDialog";
import {
  buildLevels,
  buildSubjectLevels,
  createSubjectId,
  createWordId,
  defaultLibrary,
} from "./data/contentLibrary";
import {
  ARCADE_STORAGE_KEYS,
  createArcadeChallenge,
  getArcadeModeCatalog,
  getArcadeWordPool,
} from "./data/arcadeChallenges";
import {
  appendChallengeHistory,
  readChallengeHistory,
  writeChallengeHistory,
} from "./data/challengeHistory";
import { getChallengeRevealState } from "./data/challengeReveal";
import {
  createChallengeHistoryEntry,
  createChallengeSession,
  createHistoryAwareChallenge,
  createHistoryAwareSession,
  getChallengeScopeKey,
} from "./data/challengeRandomizer";
import {
  getMigrationWordPool,
  migrateActiveMission,
  migrateLegacyChallenge,
  normalizeChallengeSurface,
} from "./data/challengeMigrations";
import { validateLearningGameAnswer } from "./data/learningGameAnswers";
import {
  createLearningProfile,
  createParentGate,
  loadLearningProfile,
  loadLearningState,
  loadParentGate,
  saveLearningProfile,
  saveLearningState,
  saveParentGate,
  verifyParentPin,
} from "./data/learningProfile";
import {
  getDifficultyForScore,
  getSkillId,
  getSkillSummary,
  recordLearningAttempt,
  recordLearningSession,
  resetAdaptiveProgress,
} from "./data/masteryEngine";
import {
  DEFAULT_CURRICULUM_ID,
  DEFAULT_GRADE_BAND_ID,
} from "./data/contentPayload";
import { getLearningHint } from "./data/learningHints";
import { buildTodayMission } from "./data/todayMissionPlanner";
import { generateMathLevelSession } from "./data/subjects/math";
import {
  generateMathGeniusSession,
  getMathGeniusTrack,
  isValidMathGeniusChallenge,
  mathGeniusTracks,
} from "./data/subjects/mathGenius";
import {
  generateMathLessonSession,
  isValidMathLessonChallenge,
} from "./data/subjects/mathLessons";
import { useAudioFeedback } from "./hooks/useAudioFeedback";
import { isSupabaseConfigured } from "./lib/supabase";
import { AdventureMapScreen } from "./screens/AdventureMapScreen";
import { ArcadeHomeScreen } from "./screens/ArcadeHomeScreen";
import { ArcadeSummaryScreen } from "./screens/ArcadeSummaryScreen";
import { GameplayScreen } from "./screens/GameplayScreen";
import { LearningGameScreen } from "./screens/LearningGameScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
import { MathGameplayScreen } from "./screens/MathGameplayScreen";
import { MathGeniusGameplayScreen } from "./screens/MathGeniusGameplayScreen";
import { MathGeniusHubScreen } from "./screens/MathGeniusHubScreen";
import { MathGeniusRewardScreen } from "./screens/MathGeniusRewardScreen";
import { MathLessonGameplayScreen } from "./screens/MathLessonGameplayScreen";
import { FinalTestGameplayScreen } from "./screens/FinalTestGameplayScreen";
import { FinalTestSummaryScreen } from "./screens/FinalTestSummaryScreen";
import { FinalExamScreen } from "./screens/FinalExamScreen";
import { ParentLoginScreen } from "./screens/ParentLoginScreen";
import { ParentProgressScreen } from "./screens/ParentProgressScreen";
import { RewardsScreen } from "./screens/RewardsScreen";
import { SplashScreen } from "./screens/SplashScreen";
import { SpellingGameplayScreen } from "./screens/SpellingGameplayScreen";
import { TodayMissionChallengeScreen } from "./screens/TodayMissionChallengeScreen";
import { TodayMissionScreen } from "./screens/TodayMissionScreen";
import { TodayMissionSummaryScreen } from "./screens/TodayMissionSummaryScreen";
import {
  getParentProfile,
  getParentSession,
  signInParent,
  signOutParent,
  subscribeToParentAuth,
} from "./services/authService";
import {
  canWriteRemoteContent,
  createSubject,
  createWord,
  deleteWord,
  getCurricula,
  getGradeBands,
  loadLibrary,
  createLevelDraft,
  publishLevelRevision,
  updateWord,
} from "./services/contentService";
import {
  createLearnerProfile,
  flushQueuedAttempts,
  isProgressSyncConfigured,
  listLearnerProfiles,
  readCloudSyncPreference,
  recordCloudAttempt,
  saveCloudLearningSession,
  setLearnerSyncEnabled,
  writeCloudSyncPreference,
} from "./services/progressSyncService";

const spellingModes = new Set([
  "spelling-order",
  "token-bank-limited",
  "missing-letter",
  "sound-to-word-choice",
  "tricky-word-pick",
  "learn-write-speak",
  "write-from-memory",
  "word-repair",
  "spelling-sprint",
]);

const UI_PREFERENCES_STORAGE_KEY = "akinlearning.ui-preferences.v1";
const DEFAULT_HOME_VIEW = "worlds";
const DEFAULT_START_SCREEN = "splash";

function readUiPreferences() {
  const fallback = {
    lastSubjectId: "",
    lastHomeGroup: "all",
    lastSection: DEFAULT_HOME_VIEW,
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const stored = JSON.parse(
      window.localStorage.getItem(UI_PREFERENCES_STORAGE_KEY) || "{}",
    );

    return {
      ...fallback,
      ...(stored && typeof stored === "object" ? stored : {}),
      // A saved preference may come from an older route model. The app entry
      // is intentionally canonical: a fresh mount always starts in Worlds.
      lastSection: DEFAULT_HOME_VIEW,
    };
  } catch {
    return fallback;
  }
}

function shuffleChoices(items) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [
      nextItems[swapIndex],
      nextItems[index],
    ];
  }

  return nextItems;
}

function buildChallenge(levelData, subjectWords, allLevels) {
  if (!levelData) {
    return null;
  }

  const sameSubjectChoices = subjectWords.filter(
    (candidate) => candidate.id !== levelData.id,
  );
  const fallbackChoices = allLevels.filter(
    (candidate) =>
      candidate.id !== levelData.id &&
      candidate.subjectId !== levelData.subjectId,
  );
  const distractors = [...sameSubjectChoices, ...fallbackChoices].slice(0, 2);

  return {
    ...levelData,
    choices: shuffleChoices([levelData, ...distractors]),
  };
}

function getDefaultProgress() {
  return {
    completedLevels: 0,
    currentLevel: 1,
  };
}

function readStoredNumber(key, fallback = 0) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = Number(window.localStorage.getItem(key));
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  } catch {
    return fallback;
  }
}

function readStoredStringArray(key) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeStoredValue(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Arcade remains playable when storage is disabled or full.
  }
}

function createEmptyArcadeStats() {
  return {
    score: 0,
    rounds: 0,
    attempts: 0,
    mistakes: 0,
    correct: 0,
    combo: 0,
    bestCombo: 0,
    difficulty: 1,
    correctStreak: 0,
    wrongStreak: 0,
    recentWordIds: [],
    recentModes: [],
  };
}

function getSubjectLevelCount(library, subjectId) {
  const subject = library.find((item) => item.id === subjectId);

  return buildSubjectLevels(subject).length;
}

function clampSubjectProgress(progress, levelCount) {
  if (levelCount === 0) {
    return getDefaultProgress();
  }

  return {
    completedLevels: Math.min(Math.max(progress.completedLevels, 0), levelCount),
    currentLevel: Math.min(Math.max(progress.currentLevel, 1), levelCount),
  };
}

function getUnlockedLevel(progress, levelCount) {
  if (levelCount === 0) {
    return 1;
  }

  return Math.min(
    levelCount,
    Math.max(progress.currentLevel, progress.completedLevels + 1),
  );
}

function createSafeMathLessonSession(levelConfig, maxAttempts = 5) {
  let nextSession = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidateSession = generateMathLessonSession(levelConfig);
    const allExercisesValid =
      candidateSession.exercises.length === levelConfig.exerciseCount &&
      candidateSession.exercises.every((exercise) =>
        isValidMathLessonChallenge(exercise),
      );

    if (allExercisesValid) {
      return candidateSession;
    }

    nextSession = candidateSession;
  }

  return nextSession;
}

function createSafeMathGeniusSession(trackId, levelConfig, maxAttempts = 5) {
  let nextSession = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidateSession = generateMathGeniusSession(trackId, levelConfig);
    const allExercisesValid =
      candidateSession.exercises.length === levelConfig.exerciseCount &&
      candidateSession.exercises.every((exercise) =>
        isValidMathGeniusChallenge(exercise),
      );

    if (allExercisesValid) {
      return candidateSession;
    }

    nextSession = candidateSession;
  }

  return nextSession;
}

export default function App() {
  const { playCelebration, playOops, playPop, playSuccess } = useAudioFeedback();
  const [screen, setScreen] = useState(DEFAULT_START_SCREEN);
  const [uiPreferences, setUiPreferences] = useState(() => readUiPreferences());
  const [profile, setProfile] = useState(null);
  const [learningProfile, setLearningProfile] = useState(() =>
    loadLearningProfile(),
  );
  const [learningState, setLearningState] = useState(() => loadLearningState());
  const [parentGate, setParentGate] = useState(() => loadParentGate());
  const [parentGateUnlocked, setParentGateUnlocked] = useState(false);
  const [library, setLibrary] = useState(defaultLibrary);
  const [contentSource, setContentSource] = useState("local");
  const [contentReleaseId, setContentReleaseId] = useState(null);
  const [contentWarning, setContentWarning] = useState("");
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);
  const [parentSession, setParentSession] = useState(null);
  const [parentProfile, setParentProfile] = useState(null);
  const [contentScope, setContentScope] = useState({
    curriculumId: DEFAULT_CURRICULUM_ID,
    gradeBandId: DEFAULT_GRADE_BAND_ID,
  });
  const [curricula, setCurricula] = useState([]);
  const [gradeBands, setGradeBands] = useState([]);
  const [cloudProfiles, setCloudProfiles] = useState([]);
  const [cloudSync, setCloudSync] = useState(() => readCloudSyncPreference());
  const [cloudSyncNotice, setCloudSyncNotice] = useState("");
  const cloudSessionIdRef = useRef(
    globalThis.crypto?.randomUUID?.() || `session-${Date.now()}`,
  );
  const cloudSessionRevisionRef = useRef(1);
  const cloudSessionWriteRef = useRef(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    () => readUiPreferences().lastSubjectId || "",
  );
  const [subjectProgress, setSubjectProgress] = useState(() =>
    loadLearningState().subjectProgress || {},
  );
  const [failedChoiceId, setFailedChoiceId] = useState("");
  const [stageWordIndex, setStageWordIndex] = useState(0);
  const [stars, setStars] = useState(() => loadLearningState().stars ?? 12);
  const [coins, setCoins] = useState(() => loadLearningState().coins ?? 35);
  const [mathSessions, setMathSessions] = useState({});
  const [mathLessonSessions, setMathLessonSessions] = useState({});
  const [mathGeniusSessions, setMathGeniusSessions] = useState({});
  const [selectedMathGeniusTrackId, setSelectedMathGeniusTrackId] =
    useState("column");
  const [mathGeniusReward, setMathGeniusReward] = useState(null);
  const [finalTestSessionStats, setFinalTestSessionStats] = useState({
    levelId: "",
    levelNumber: 0,
    totalQuestions: 40,
    firstAttemptCorrect: 0,
    answered: 0,
    totalAttempts: 0,
    attemptedChallengeIds: [],
  });
  const finalTestSessionStatsRef = useRef(finalTestSessionStats);
  const [finalTestSummary, setFinalTestSummary] = useState(null);
  const [levelChallengeSessions, setLevelChallengeSessions] = useState({});
  const [challengeHistory, setChallengeHistory] = useState(() =>
    readChallengeHistory(),
  );
  const challengeHistoryRef = useRef(challengeHistory);
  const [gameStreak, setGameStreak] = useState(0);
  const [gameHearts, setGameHearts] = useState(3);
  const [gameXp, setGameXp] = useState(0);
  const [gameFeedback, setGameFeedback] = useState(null);
  const [isAnswerTransitioning, setIsAnswerTransitioning] = useState(false);
  const [arcadeChallenge, setArcadeChallenge] = useState(null);
  const [arcadeStats, setArcadeStats] = useState(createEmptyArcadeStats);
  const [arcadeFailedAttempts, setArcadeFailedAttempts] = useState(0);
  const [arcadePreferredModeIds, setArcadePreferredModeIds] = useState([]);
  const [arcadeSessionStickerIds, setArcadeSessionStickerIds] = useState([]);
  const [arcadeFavorites, setArcadeFavorites] = useState(() =>
    readStoredStringArray(ARCADE_STORAGE_KEYS.favorites),
  );
  const [arcadeCollection, setArcadeCollection] = useState(() =>
    readStoredStringArray(ARCADE_STORAGE_KEYS.collection),
  );
  const [arcadeBestScore, setArcadeBestScore] = useState(() =>
    readStoredNumber(ARCADE_STORAGE_KEYS.bestScore),
  );
  const [arcadeSummary, setArcadeSummary] = useState(null);
  const [currentWrongAttempts, setCurrentWrongAttempts] = useState(0);
  const [todayMission, setTodayMission] = useState(null);
  const [todayMissionIndex, setTodayMissionIndex] = useState(0);
  const [todayMissionChallenge, setTodayMissionChallenge] = useState(null);
  const [todayMissionStats, setTodayMissionStats] = useState({
    correct: 0,
    total: 0,
    attempts: 0,
  });
  const [todayMissionWrongAttempts, setTodayMissionWrongAttempts] = useState(0);
  const [todayMissionHint, setTodayMissionHint] = useState(null);
  const [todayMissionTransitioning, setTodayMissionTransitioning] = useState(false);
  const [todayMissionStartError, setTodayMissionStartError] = useState("");
  const [isDiagnosticActive, setIsDiagnosticActive] = useState(false);
  const [pendingNavigationItem, setPendingNavigationItem] = useState("");
  const [focusMissionMap, setFocusMissionMap] = useState(false);

  // Worlds is the canonical child landing surface. A saved active mission is
  // resumed only after an explicit Continue Mission action, never by boot or
  // refresh redirect.
  const homeView = DEFAULT_HOME_VIEW;
  const homeGroup = uiPreferences.lastHomeGroup || "all";
  const hasActiveTodayMission = Boolean(
    learningState.activeMission?.activities?.length,
  );
  const todayEntry = hasActiveTodayMission
    ? {
        description: "Pick up exactly where you paused.",
        eyebrow: "Resume your path",
        label: "Continue Mission",
      }
    : learningState.diagnostic?.status === "complete"
      ? {
          description: "Akin has a short practice route ready for you.",
          eyebrow: "Ready for today",
          label: "Play Today’s Mission",
        }
      : {
          description: "A short first adventure helps Akin find your path.",
          eyebrow: "First adventure",
          label: "Discover My Path",
        };

  const prepareActiveMission = (savedMission) => {
    const result = migrateActiveMission(savedMission, { library });

    if (result.status === "error") {
      setTodayMissionStartError(
        "We could not resume that saved activity. Your completed progress is safe; start a new mission to continue.",
      );
      setLearningState((currentValue) => ({
        ...currentValue,
        activeMission: null,
      }));
      return null;
    }

    if (result.status === "migrated") {
      setLearningState((currentValue) => ({
        ...currentValue,
        activeMission: result.mission,
      }));
    }

    return result.mission;
  };

  useEffect(() => {
    const titleByScreen = {
      arcade: "Arcade",
      "arcade-home": "Arcade",
      "arcade-summary": "Arcade Summary",
      "final-test-summary": "Final Test Summary",
      gameplay: "Learning Activity",
      library: "Parent Library",
      map: "Worlds",
      "math-genius-hub": "Math Genius",
      "math-genius-reward": "Math Genius Reward",
      "parent-login": "Parent Library Sign In",
      "parent-progress": "Parent Progress",
      rewards: "Rewards",
      "today-mission": "Today Mission",
      "today-mission-summary": "Mission Summary",
    };
    const title = screen === "splash"
      ? homeView === "worlds" ? "Worlds" : "Today"
      : titleByScreen[screen] || "Today";

    document.title = `${title} — AkinLearning`;
  }, [homeView, screen]);

  useEffect(() => {
    challengeHistoryRef.current = challengeHistory;
    writeChallengeHistory(challengeHistory);
  }, [challengeHistory]);

  useEffect(() => {
    writeStoredValue(UI_PREFERENCES_STORAGE_KEY, JSON.stringify({
      lastSubjectId: uiPreferences.lastSubjectId || "",
      lastHomeGroup: uiPreferences.lastHomeGroup || "all",
      lastSection: DEFAULT_HOME_VIEW,
    }));
  }, [uiPreferences]);

  useEffect(() => {
    if (!selectedSubjectId) {
      return;
    }

    setUiPreferences((currentValue) =>
      currentValue.lastSubjectId === selectedSubjectId
        ? currentValue
        : { ...currentValue, lastSubjectId: selectedSubjectId },
    );
  }, [selectedSubjectId]);

  useEffect(() => {
    saveLearningProfile(learningProfile);
  }, [learningProfile]);

  useEffect(() => {
    saveLearningState({
      ...learningState,
      profileId: learningProfile.id,
      subjectProgress,
      stars,
      coins,
    });
  }, [coins, learningProfile.id, learningState, stars, subjectProgress]);

  useEffect(() => {
    let isMounted = true;

    loadLibrary(contentScope).then((result) => {
      if (!isMounted) {
        return;
      }

      setLibrary(result.library);
      setContentSource(result.source);
      setContentReleaseId(result.releaseId || null);
      setContentWarning(result.warning);
      setIsLibraryLoading(false);
    });

    if (isSupabaseConfigured) {
      Promise.all([getCurricula(), getGradeBands()])
        .then(([nextCurricula, nextGradeBands]) => {
          if (!isMounted) return;
          setCurricula(nextCurricula);
          setGradeBands(nextGradeBands);
        })
        .catch(() => {
          if (isMounted) {
            setCurricula([]);
            setGradeBands([]);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const restoreParentSession = async () => {
      try {
        const session = await getParentSession();

        if (!isMounted || !session) {
          return;
        }

        const nextProfile = await getParentProfile();

        if (
          isMounted &&
          nextProfile &&
          ["admin", "editor"].includes(nextProfile.role)
        ) {
          setParentSession(session);
          setParentProfile(nextProfile);
          const nextCloudProfiles = await listLearnerProfiles();
          setCloudProfiles(nextCloudProfiles);
          if (cloudSync.childId) {
            void flushQueuedAttempts(cloudSync.childId);
          }
        }
      } catch {
        if (isMounted) {
          setParentSession(null);
          setParentProfile(null);
        }
      }
    };

    restoreParentSession();
    const unsubscribe = subscribeToParentAuth((session) => {
      if (!session && isMounted) {
        setParentSession(null);
        setParentProfile(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!gameFeedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setGameFeedback(null);
    }, gameFeedback.type === "wrong" ? 1500 : 900);

    return () => window.clearTimeout(timeoutId);
  }, [gameFeedback]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document
      .querySelector(".app-shell")
      ?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [screen, stageWordIndex]);

  useEffect(() => {
    if (!failedChoiceId) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFailedChoiceId("");
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [failedChoiceId]);

  useEffect(() => {
    if (!library.length) {
      setSelectedSubjectId("");
      return;
    }

    const selectedSubject = library.find(
      (subject) => subject.id === selectedSubjectId,
    );
    const selectedSubjectStillExists = Boolean(selectedSubject);
    const selectedSubjectIsPlayable =
      buildSubjectLevels(selectedSubject).length > 0;
    const playableSubject = library.find(
      (subject) => buildSubjectLevels(subject).length > 0,
    );

    if (
      !selectedSubjectId ||
      !selectedSubjectStillExists ||
      (!selectedSubjectIsPlayable && playableSubject)
    ) {
      const preferredSubject = playableSubject || library[0];
      setSelectedSubjectId(preferredSubject.id);
    }
  }, [library, selectedSubjectId]);

  useEffect(() => {
    setSubjectProgress((currentValue) => {
      let changed = false;
      const nextValue = { ...currentValue };
      const validSubjectIds = new Set();

      library.forEach((subject) => {
        if (subject.id === "math-genius") {
          (subject.tracks || mathGeniusTracks).forEach((track) => {
            validSubjectIds.add(`math-genius:${track.id}`);
          });
          return;
        }

        validSubjectIds.add(subject.id);
      });

      Object.keys(nextValue).forEach((subjectId) => {
        if (!validSubjectIds.has(subjectId)) {
          delete nextValue[subjectId];
          changed = true;
        }
      });

      library.forEach((subject) => {
        if (subject.id === "math-genius") {
          (subject.tracks || mathGeniusTracks).forEach((track) => {
            const progressKey = `math-genius:${track.id}`;
            const currentProgress =
              nextValue[progressKey] || getDefaultProgress();
            const normalizedProgress = clampSubjectProgress(
              currentProgress,
              track.levels.length,
            );

            if (
              !nextValue[progressKey] ||
              normalizedProgress.currentLevel !== currentProgress.currentLevel ||
              normalizedProgress.completedLevels !==
                currentProgress.completedLevels
            ) {
              nextValue[progressKey] = normalizedProgress;
              changed = true;
            }
          });
          return;
        }

        const currentProgress = nextValue[subject.id] || getDefaultProgress();
        const normalizedProgress = clampSubjectProgress(
          currentProgress,
          buildSubjectLevels(subject).length,
        );

        if (
          !nextValue[subject.id] ||
          normalizedProgress.currentLevel !== currentProgress.currentLevel ||
          normalizedProgress.completedLevels !== currentProgress.completedLevels
        ) {
          nextValue[subject.id] = normalizedProgress;
          changed = true;
        }
      });

      return changed ? nextValue : currentValue;
    });
  }, [library]);

  useEffect(() => {
    writeStoredValue(
      ARCADE_STORAGE_KEYS.favorites,
      JSON.stringify(arcadeFavorites),
    );
  }, [arcadeFavorites]);

  useEffect(() => {
    writeStoredValue(
      ARCADE_STORAGE_KEYS.collection,
      JSON.stringify(arcadeCollection),
    );
  }, [arcadeCollection]);

  useEffect(() => {
    writeStoredValue(
      ARCADE_STORAGE_KEYS.bestScore,
      String(arcadeBestScore),
    );
  }, [arcadeBestScore]);

  const selectedSubject = useMemo(
    () => library.find((subject) => subject.id === selectedSubjectId) || null,
    [library, selectedSubjectId],
  );
  const selectedMathGeniusTrack = useMemo(
    () =>
      selectedSubject?.id === "math-genius"
        ? selectedSubject.tracks?.find(
            (track) => track.id === selectedMathGeniusTrackId,
          ) || getMathGeniusTrack(selectedMathGeniusTrackId)
        : getMathGeniusTrack(selectedMathGeniusTrackId),
    [selectedMathGeniusTrackId, selectedSubject],
  );
  const activeProgressKey =
    selectedSubject?.id === "math-genius"
      ? `math-genius:${selectedMathGeniusTrack.id}`
      : selectedSubject?.id || "";
  const allLevels = useMemo(() => buildLevels(library), [library]);
  const selectedLevels = useMemo(
    () =>
      selectedSubject?.id === "math-genius"
        ? selectedMathGeniusTrack.levels
        : buildSubjectLevels(selectedSubject),
    [selectedMathGeniusTrack, selectedSubject],
  );
  const selectedProgress = selectedSubject
    ? subjectProgress[activeProgressKey] || getDefaultProgress()
    : getDefaultProgress();
  const unlockedLevel = getUnlockedLevel(selectedProgress, selectedLevels.length);
  const currentLevelData = selectedLevels[selectedProgress.currentLevel - 1] || null;
  const selectedSubjectWords = useMemo(
    () => {
      const allWords = selectedLevels.flatMap(
        (levelData) => levelData.reviewWords ?? levelData.words ?? [],
      );
      const seenIds = new Set();

      return allWords.filter((word) => {
        if (!word?.id || seenIds.has(word.id)) {
          return false;
        }

        seenIds.add(word.id);
        return true;
      });
    },
    [selectedLevels],
  );
  const previewChallenge = currentLevelData?.exercises?.[stageWordIndex] ?? null;
  const previewMode =
    previewChallenge?.mode ||
    currentLevelData?.mode ||
    (selectedSubject?.id === "math" ? "math-count" : "vocab-choice");
  const isMathMode = previewMode === "math-count";
  const isMathLessonMode = previewMode === "math-lesson";
  const isMathGeniusMode = previewMode === "math-genius";
  const currentMathSessionKey = isMathMode
    ? `${selectedSubjectId}:${selectedProgress.currentLevel}`
    : "";
  const currentMathSession = currentMathSessionKey
    ? mathSessions[currentMathSessionKey] || null
    : null;
  const currentMathLessonSessionKey = isMathLessonMode
    ? `${selectedSubjectId}:${selectedProgress.currentLevel}`
    : "";
  const currentMathLessonSession = currentMathLessonSessionKey
    ? mathLessonSessions[currentMathLessonSessionKey] || null
    : null;
  const currentMathGeniusSessionKey = isMathGeniusMode
    ? `math-genius:${selectedMathGeniusTrack.id}:${selectedProgress.currentLevel}`
    : "";
  const currentMathGeniusSession = currentMathGeniusSessionKey
    ? mathGeniusSessions[currentMathGeniusSessionKey] || null
    : null;
  const currentLevelSessionKey =
    selectedSubject && !isMathMode && !isMathLessonMode && !isMathGeniusMode
      ? `${selectedSubjectId}:${selectedProgress.currentLevel}`
      : "";
  const currentLevelSession = currentLevelSessionKey
    ? levelChallengeSessions[currentLevelSessionKey] || null
    : null;
  const currentLevelWordCount = isMathMode
    ? currentMathSession?.exercises.length ?? currentLevelData?.exerciseCount ?? 0
    : isMathLessonMode
      ? currentMathLessonSession?.exercises.length ?? currentLevelData?.exerciseCount ?? 0
      : isMathGeniusMode
        ? currentMathGeniusSession?.exercises.length ??
          currentLevelData?.exerciseCount ??
          0
      : currentLevelSession?.exercises.length ??
        currentLevelData?.exercises?.length ??
        currentLevelData?.words.length ??
        0;
  const currentChallenge = isMathMode
    ? currentMathSession?.exercises?.[stageWordIndex] ?? null
    : isMathLessonMode
      ? currentMathLessonSession?.exercises?.[stageWordIndex] ?? null
    : isMathGeniusMode
      ? currentMathGeniusSession?.exercises?.[stageWordIndex] ?? null
    : currentLevelSession?.exercises?.[stageWordIndex] ?? null;
  const currentMode =
    currentChallenge?.mode ||
    currentLevelData?.mode ||
    (selectedSubject?.id === "math" ? "math-count" : "vocab-choice");
  const isLearningGameMode =
    selectedSubject?.id === "learning-games" ||
    currentChallenge?.type === "learning-game";
  const isFinalTestMode =
    selectedSubject?.id === "final-test" ||
    currentChallenge?.type === "final-test";
  const isSpellingMode = spellingModes.has(currentMode);
  const learningSummary = useMemo(
    () => getSkillSummary(learningState),
    [learningState],
  );
  const currentTodayActivity =
    todayMission?.activities?.[todayMissionIndex] || null;

  useEffect(() => {
    const mission = learningState.activeMission;
    if (
      !mission?.activities?.length ||
      !cloudSync.enabled ||
      !cloudSync.childId ||
      !isProgressSyncConfigured() ||
      !currentTodayActivity ||
      cloudSessionWriteRef.current
    ) {
      return;
    }

    cloudSessionWriteRef.current = true;
    void saveCloudLearningSession({
      sessionId: cloudSessionIdRef.current,
      childId: cloudSync.childId,
      levelId: currentTodayActivity.levelId || currentTodayActivity.id || "today-mission",
      revision: cloudSessionRevisionRef.current,
      activityIndex: Number(mission.index) || todayMissionIndex,
      releaseId: contentReleaseId,
      state: {
        missionId: mission.id || "today-mission",
        index: Number(mission.index) || todayMissionIndex,
        activityCount: mission.activities.length,
        diagnostic: Boolean(mission.diagnostic),
      },
      status: "active",
    })
      .then((result) => {
        if (result.status === "synced" && result.session?.revision) {
          cloudSessionRevisionRef.current = result.session.revision;
        }
        if (result.status === "conflict") {
          setCloudSyncNotice(
            "This mission changed on another device. Your local progress is still safe.",
          );
        }
      })
      .finally(() => {
        cloudSessionWriteRef.current = false;
      });
  }, [
    cloudSync.childId,
    cloudSync.enabled,
    contentReleaseId,
    currentTodayActivity,
    learningState.activeMission,
    todayMissionIndex,
  ]);

  useEffect(() => {
    if (screen !== "gameplay") {
      return;
    }

    if (
      isMathLessonMode &&
      currentLevelData &&
      (!currentChallenge || !isValidMathLessonChallenge(currentChallenge))
    ) {
      setMathLessonSessions((currentValue) => ({
        ...currentValue,
        [`${selectedSubjectId}:${selectedProgress.currentLevel}`]:
          createSafeMathLessonSession(currentLevelData),
      }));
      return;
    }

    if (
      isMathGeniusMode &&
      currentLevelData &&
      (!currentChallenge || !isValidMathGeniusChallenge(currentChallenge))
    ) {
      setMathGeniusSessions((currentValue) => ({
        ...currentValue,
        [`math-genius:${selectedMathGeniusTrack.id}:${selectedProgress.currentLevel}`]:
          createSafeMathGeniusSession(
            selectedMathGeniusTrack.id,
            currentLevelData,
          ),
      }));
      return;
    }

    if (currentChallenge) {
      return;
    }

    setStageWordIndex(0);
    setFailedChoiceId("");
    setScreen("splash");
  }, [
    currentChallenge,
    currentLevelData,
    isMathGeniusMode,
    isMathLessonMode,
    screen,
    selectedMathGeniusTrack.id,
    selectedProgress.currentLevel,
    selectedSubjectId,
  ]);

  const hasNextLevel =
    selectedSubject && selectedProgress.currentLevel < selectedLevels.length;
  const isLastWordInLevel = stageWordIndex >= Math.max(currentLevelWordCount - 1, 0);
  const subjectSummaries = library.map((subject) => {
    if (subject.id === "math-genius") {
      const tracks = subject.tracks || mathGeniusTracks;
      const completedLevels = tracks.reduce(
        (total, track) =>
          total +
          Math.min(
            subjectProgress[`math-genius:${track.id}`]?.completedLevels || 0,
            track.levels.length,
          ),
        0,
      );
      const totalLevels = tracks.reduce(
        (total, track) => total + track.levels.length,
        0,
      );

      return {
        ...subject,
        completedLevels,
        isSelected: subject.id === selectedSubjectId,
        totalLevels,
        unlockedLevel: 1,
      };
    }

    const progress = subjectProgress[subject.id] || getDefaultProgress();
    const levelCount = buildSubjectLevels(subject).length;

    return {
      ...subject,
      completedLevels: Math.min(progress.completedLevels, levelCount),
      isSelected: subject.id === selectedSubjectId,
      totalLevels: levelCount,
      unlockedLevel: getUnlockedLevel(progress, levelCount),
    };
  });

  const arcadeModes = useMemo(() => getArcadeModeCatalog(), []);
  const arcadeWordPool = useMemo(
    () => getArcadeWordPool(library),
    [library],
  );

  const rememberChallenges = (scopeKey, challenges = []) => {
    const entries = challenges
      .filter(Boolean)
      .map((challenge) => createChallengeHistoryEntry(challenge));

    if (!scopeKey || entries.length === 0) {
      return;
    }

    setChallengeHistory((currentValue) => {
      const nextValue = appendChallengeHistory(
        currentValue,
        scopeKey,
        entries,
      );
      challengeHistoryRef.current = nextValue;
      return nextValue;
    });
  };

  const createTodayActivityChallenge = (activity) => {
    if (!activity?.levelConfig) {
      return null;
    }

    const levelConfig = activity.levelConfig;
    const subjectId = activity.subjectId;
    const levelId = activity.trackId
      ? `${activity.trackId}:${levelConfig.id}`
      : levelConfig.id;
    const scopeKey = getChallengeScopeKey(subjectId, levelId, "today-mission");
    let challenge = null;

    if (subjectId === "math") {
      const session = generateMathLevelSession(levelConfig);
      challenge = session?.exercises?.[activity.exerciseIndex % Math.max(session.exercises.length, 1)];
    } else if (subjectId === "math-lessons") {
      const session = createSafeMathLessonSession(levelConfig);
      challenge = session?.exercises?.[activity.exerciseIndex % Math.max(session.exercises.length, 1)];
    } else if (subjectId === "math-genius") {
      const session = createSafeMathGeniusSession(activity.trackId, levelConfig);
      challenge = session?.exercises?.[activity.exerciseIndex % Math.max(session.exercises.length, 1)];
    } else {
      const session = createChallengeSession({
        subjectId,
        levelConfig,
        library,
        history: challengeHistoryRef.current,
      });
      const exercises = session?.exercises || [];
      challenge =
        exercises.find((item) => item.sourceChallengeId === activity.template?.id) ||
        exercises[activity.exerciseIndex % Math.max(exercises.length, 1)] ||
        activity.template;
    }

    if (!challenge) {
      return null;
    }

    const migration = migrateLegacyChallenge(challenge, {
      wordPool: getMigrationWordPool(levelConfig, library, subjectId),
    });

    if (!migration.challenge) {
      return null;
    }

    const surfaceMigration = normalizeChallengeSurface(migration.challenge, {
      levelConfig,
      subjectId,
      trackId: activity.trackId || "",
    });

    if (!surfaceMigration.challenge || surfaceMigration.status === "error") {
      return null;
    }

    challenge = surfaceMigration.challenge;

    const nextChallenge = {
      ...challenge,
      subjectId,
      levelId,
      skillId: activity.skillId || getSkillId({
        subjectId,
        levelId,
        challenge,
        levelConfig,
      }),
      difficulty: activity.difficulty || getDifficultyForScore(0),
      missionActivityId: activity.id,
      subjectName: activity.subjectName,
      subjectIcon: activity.subjectIcon,
    };

    rememberChallenges(scopeKey, [nextChallenge]);
    return nextChallenge;
  };

  const updateSelectedSubjectProgress = (updater) => {
    if (!selectedSubject) {
      return;
    }

    setSubjectProgress((currentValue) => {
      const currentProgress =
        currentValue[activeProgressKey] || getDefaultProgress();
      const nextProgress = clampSubjectProgress(
        updater(currentProgress),
        selectedSubject.id === "math-genius"
          ? selectedLevels.length
          : getSubjectLevelCount(library, selectedSubject.id),
      );

      return {
        ...currentValue,
        [activeProgressKey]: nextProgress,
      };
    });
  };

  const arcadeHistoryScope = getChallengeScopeKey(
    "arcade",
    "endless",
    "session",
  );

  const getNextArcadeChallenge = (stats, preferredModeIds = []) =>
    createHistoryAwareChallenge({
      history: challengeHistoryRef.current,
      scopeKey: arcadeHistoryScope,
      create: () =>
        createArcadeChallenge({
          wordPool: arcadeWordPool,
          difficulty: stats.difficulty,
          recentWordIds: stats.recentWordIds,
          recentModes: stats.recentModes,
          preferredModeIds,
        }),
    });

  const handleOpenArcade = () => {
    setArcadeSummary(null);
    setScreen("arcade-home");
  };

  const ensureLocalChildProfile = () => {
    setProfile((currentValue) =>
      currentValue || {
        id: "akin",
        emoji: "A",
        label: learningProfile.name,
        image: null,
      },
    );
  };

  const restoreActiveTodayMission = () => {
    const savedMission = learningState.activeMission;

    if (!savedMission?.activities?.length) {
      return false;
    }

    const restoredMission = prepareActiveMission(savedMission);

    if (!restoredMission) {
      return true;
    }

    const restoredIndex = Math.min(
      Math.max(Number(restoredMission.index) || 0, 0),
      restoredMission.activities.length - 1,
    );
    const restoredActivity = restoredMission.activities[restoredIndex];

    if (!restoredActivity?.challenge) {
      return false;
    }

    ensureLocalChildProfile();
    setTodayMission(restoredMission);
    setTodayMissionIndex(restoredIndex);
    setTodayMissionChallenge(restoredActivity.challenge);
    setTodayMissionStats({
      correct: 0,
      total: restoredMission.activities.length,
      attempts: 0,
    });
    setTodayMissionWrongAttempts(0);
    setTodayMissionHint(null);
    setTodayMissionStartError("");
    setIsDiagnosticActive(Boolean(restoredMission.diagnostic));
    setScreen("today-mission");
    return true;
  };

  const handleOpenWorlds = (groupId = "all") => {
    setTodayMissionStartError("");
    setFocusMissionMap(false);
    setUiPreferences((currentValue) => ({
      ...currentValue,
      lastHomeGroup: groupId,
      lastSection: "worlds",
    }));
    setScreen("splash");
  };

  const handleBackToHome = () => {
    setUiPreferences((currentValue) => ({
      ...currentValue,
      lastSection: "worlds",
    }));
    handleHome();
  };

  const handleOpenArcadeFromNavigation = () => {
    ensureLocalChildProfile();
    setUiPreferences((currentValue) => ({
      ...currentValue,
      lastSection: "worlds",
    }));
    handleOpenArcade();
  };

  const handleOpenRewards = () => {
    ensureLocalChildProfile();
    setUiPreferences((currentValue) => ({
      ...currentValue,
      lastSection: "worlds",
    }));
    setScreen("rewards");
  };

  const handleExitTodayMission = () => {
    ensureLocalChildProfile();
    setTodayMissionTransitioning(false);
    setTodayMissionHint(null);
    setUiPreferences((currentValue) => ({
      ...currentValue,
      lastSection: "worlds",
    }));
    setScreen("splash");
  };

  const handleToggleArcadeFavorite = (modeId) => {
    setArcadeFavorites((currentValue) =>
      currentValue.includes(modeId)
        ? currentValue.filter((id) => id !== modeId)
        : [...currentValue, modeId],
    );
  };

  const handleStartArcade = ({ favoriteOnly = false, modeId = "" } = {}) => {
    const nextStats = createEmptyArcadeStats();
    const preferredModeIds = modeId
      ? [modeId]
      : favoriteOnly
        ? arcadeFavorites
        : [];
    const nextChallenge = getNextArcadeChallenge(nextStats, preferredModeIds);

    rememberChallenges(arcadeHistoryScope, [nextChallenge]);
    setArcadeStats(nextStats);
    setArcadePreferredModeIds(preferredModeIds);
    setArcadeSessionStickerIds([]);
    setArcadeChallenge(nextChallenge);
    setArcadeFailedAttempts(0);
    setFailedChoiceId("");
    setGameFeedback(null);
    setScreen("arcade");
  };

  const finishArcadeRound = () => {
    const currentChallengeMode = arcadeChallenge?.mode || "";
    const currentWordId = arcadeChallenge?.targetWord?.id || "";
    const nextCorrectStreak =
      arcadeFailedAttempts === 0 ? arcadeStats.correctStreak + 1 : 0;
    const nextWrongStreak = 0;
    const shouldIncreaseDifficulty = nextCorrectStreak >= 3;
    const nextDifficulty = shouldIncreaseDifficulty
      ? Math.min(3, arcadeStats.difficulty + 1)
      : arcadeStats.difficulty;
    const nextCombo =
      arcadeFailedAttempts === 0 ? arcadeStats.combo + 1 : 1;
    const comboBonusBase = arcadeFailedAttempts === 0 ? arcadeStats.combo : 0;
    const nextScore = arcadeStats.score + 10 + Math.min(comboBonusBase * 2, 8);
    const nextStats = {
      ...arcadeStats,
      score: nextScore,
      rounds: arcadeStats.rounds + 1,
      attempts: arcadeStats.attempts + 1,
      correct: arcadeStats.correct + 1,
      combo: nextCombo,
      bestCombo: Math.max(arcadeStats.bestCombo, nextCombo),
      difficulty: nextDifficulty,
      correctStreak: shouldIncreaseDifficulty ? 0 : nextCorrectStreak,
      wrongStreak: nextWrongStreak,
      recentWordIds: currentWordId
        ? [...arcadeStats.recentWordIds, currentWordId].slice(-4)
        : arcadeStats.recentWordIds,
      recentModes: currentChallengeMode
        ? [...arcadeStats.recentModes, currentChallengeMode].slice(-2)
        : arcadeStats.recentModes,
    };

    setArcadeStats(nextStats);
    setArcadeFailedAttempts(0);
    setFailedChoiceId("");
    setGameFeedback(null);
    const nextChallenge = getNextArcadeChallenge(
      nextStats,
      arcadePreferredModeIds,
    );
    rememberChallenges(arcadeHistoryScope, [nextChallenge]);
    setArcadeChallenge(nextChallenge);
    setIsAnswerTransitioning(false);
  };

  const handleArcadeCorrectChoice = () => {
    if (isAnswerTransitioning || !arcadeChallenge) {
      return;
    }

    setIsAnswerTransitioning(true);
    playSuccess();
    const comboBase = arcadeFailedAttempts === 0 ? arcadeStats.combo : 0;
    setGameXp((value) => value + 10 + Math.min(comboBase, 4) * 2);
    setGameFeedback({
      id: `${Date.now()}-arcade-correct`,
      type: "correct",
      title: comboBase >= 2 ? `${comboBase + 1} in a row!` : "Awesome!",
      message: "+10 XP • Next game",
    });
    if (
      arcadeChallenge.mode &&
      !arcadeCollection.includes(arcadeChallenge.mode)
    ) {
      setArcadeCollection((currentValue) =>
        currentValue.includes(arcadeChallenge.mode)
          ? currentValue
          : [...currentValue, arcadeChallenge.mode],
      );
      setArcadeSessionStickerIds((currentStickers) =>
        currentStickers.includes(arcadeChallenge.mode)
          ? currentStickers
          : [...currentStickers, arcadeChallenge.mode],
      );
    }

    window.setTimeout(finishArcadeRound, 520);
  };

  const handleArcadeWrongChoice = (choiceId) => {
    if (isAnswerTransitioning || !arcadeChallenge) {
      return;
    }

    playOops();
    setGameStreak(0);
    setFailedChoiceId(choiceId);
    const nextAttempts = arcadeFailedAttempts + 1;
    setArcadeFailedAttempts(nextAttempts);

    setArcadeStats((currentValue) => {
      const nextWrongStreak = currentValue.wrongStreak + 1;
      const shouldDecreaseDifficulty = nextWrongStreak >= 2;

      return {
        ...currentValue,
        attempts: currentValue.attempts + 1,
        mistakes: currentValue.mistakes + 1,
        wrongStreak: shouldDecreaseDifficulty ? 0 : nextWrongStreak,
        difficulty: shouldDecreaseDifficulty
          ? Math.max(1, currentValue.difficulty - 1)
          : currentValue.difficulty,
      };
    });

    setGameFeedback({
      id: `${Date.now()}-arcade-${nextAttempts >= 3 ? "reveal" : "wrong"}`,
      type: "wrong",
      title: nextAttempts >= 3 ? "Clue unlocked!" : "Almost!",
      message:
        nextAttempts >= 3
          ? `The word is ${arcadeChallenge.targetWord?.word || "shown"}. Try again!`
          : `Try again. ${3 - nextAttempts} more miss${nextAttempts === 2 ? "" : "es"} opens the clue.`,
    });
  };

  const handleArcadeKeyboardChoice = (choice) => {
    if (!arcadeChallenge || !choice) {
      return;
    }

    const result = validateLearningGameAnswer(arcadeChallenge, {
      type: "choice",
      choiceId: choice.id,
    });

    if (result.correct) {
      handleArcadeCorrectChoice();
      return;
    }

    handleArcadeWrongChoice(result.feedbackId);
  };

  const handleFinishArcade = (destination = "") => {
    const nextDestination = typeof destination === "string" ? destination : "";
    const nextBestScore = Math.max(arcadeBestScore, arcadeStats.score);
    const isNewBest = arcadeStats.score > arcadeBestScore;

    if (isNewBest) {
      setArcadeBestScore(nextBestScore);
    }

    setArcadeSummary({
      ...arcadeStats,
      bestScore: nextBestScore,
      isNewBest,
      accuracy: arcadeStats.attempts
        ? Math.round((arcadeStats.correct / arcadeStats.attempts) * 100)
        : 0,
      stickersEarned: arcadeSessionStickerIds.length,
    });
    setArcadeChallenge(null);
    setArcadeFailedAttempts(0);
    setFailedChoiceId("");
    setGameFeedback(null);
    if (nextDestination) {
      setPendingNavigationItem("");
      navigateToAppItem(nextDestination);
      return;
    }

    setScreen("arcade-summary");
  };

  const handleProfileSelect = (selectedProfile, subjectId = selectedSubjectId) => {
    setProfile(selectedProfile);
    setLearningProfile((currentValue) =>
      createLearningProfile({
        ...currentValue,
        name: selectedProfile?.label || currentValue.name,
        avatarId: selectedProfile?.id || currentValue.avatarId,
      }),
    );
    setFocusMissionMap(true);
    setScreen(subjectId === "math-genius" ? "math-genius-hub" : "map");
  };

  const handleSelectMathGeniusTrack = (trackId) => {
    setSelectedMathGeniusTrackId(trackId);
    setStageWordIndex(0);
    setFocusMissionMap(true);
    setScreen("map");
  };

  const handleMapSubjectSelect = (subjectId) => {
    setSelectedSubjectId(subjectId);
    setStageWordIndex(0);
    setFocusMissionMap(true);

    if (subjectId === "math-genius") {
      setScreen("math-genius-hub");
    }
  };

  const handleStartLevel = (level) => {
    if (!selectedSubject) {
      return;
    }

    const levelConfig = selectedLevels[level - 1];

    if (!levelConfig) {
      return;
    }

    const historyLevelId =
      selectedSubject.id === "math-genius"
        ? `${selectedMathGeniusTrack.id}:${levelConfig.id}`
        : levelConfig.id;
    const levelScopeKey = getChallengeScopeKey(
      selectedSubject.id,
      historyLevelId,
      "session",
    );

    if (selectedSubject.id === "math") {
      const session = createHistoryAwareSession({
        history: challengeHistoryRef.current,
        scopeKey: levelScopeKey,
        create: () => generateMathLevelSession(levelConfig),
      });

      setMathSessions((currentValue) => ({
        ...currentValue,
        [`${selectedSubject.id}:${level}`]: session,
      }));
      rememberChallenges(levelScopeKey, session?.exercises || []);
    }

    if (selectedSubject.id === "math-lessons") {
      const session = createHistoryAwareSession({
        history: challengeHistoryRef.current,
        scopeKey: levelScopeKey,
        create: () => createSafeMathLessonSession(levelConfig),
        validate: (candidate) =>
          candidate?.exercises?.length === levelConfig.exerciseCount &&
          candidate.exercises.every((exercise) =>
            isValidMathLessonChallenge(exercise),
          ),
      });

      setMathLessonSessions((currentValue) => ({
        ...currentValue,
        [`${selectedSubject.id}:${level}`]: session,
      }));
      rememberChallenges(levelScopeKey, session?.exercises || []);
    }

    if (selectedSubject.id === "math-genius") {
      const session = createHistoryAwareSession({
        history: challengeHistoryRef.current,
        scopeKey: levelScopeKey,
        create: () =>
          createSafeMathGeniusSession(
            selectedMathGeniusTrack.id,
            levelConfig,
          ),
        validate: (candidate) =>
          candidate?.exercises?.length === levelConfig.exerciseCount &&
          candidate.exercises.every((exercise) =>
            isValidMathGeniusChallenge(exercise),
          ),
      });

      setMathGeniusSessions((currentValue) => ({
        ...currentValue,
        [`math-genius:${selectedMathGeniusTrack.id}:${level}`]: session,
      }));
      rememberChallenges(levelScopeKey, session?.exercises || []);
    }

    if (
      !["math", "math-lessons", "math-genius"].includes(selectedSubject.id)
    ) {
      const session = createHistoryAwareSession({
        history: challengeHistoryRef.current,
        scopeKey: levelScopeKey,
        create: () =>
          createChallengeSession({
            subjectId: selectedSubject.id,
            levelConfig,
            library,
            history: challengeHistoryRef.current,
          }),
        validate: (candidate) =>
          Array.isArray(candidate?.exercises) && candidate.exercises.length > 0,
      });

      setLevelChallengeSessions((currentValue) => ({
        ...currentValue,
        [`${selectedSubject.id}:${level}`]: session,
      }));
      rememberChallenges(levelScopeKey, session?.exercises || []);
    }

    if (selectedSubject.id === "final-test") {
      const nextFinalTestStats = {
        levelId: levelConfig.id,
        levelNumber: level,
        totalQuestions: levelConfig.exerciseCount || 40,
        firstAttemptCorrect: 0,
        answered: 0,
        totalAttempts: 0,
        attemptedChallengeIds: [],
      };
      finalTestSessionStatsRef.current = nextFinalTestStats;
      setFinalTestSessionStats(nextFinalTestStats);
      setFinalTestSummary(null);
    }

    updateSelectedSubjectProgress((currentValue) => ({
      ...currentValue,
      currentLevel: level,
    }));
    setStageWordIndex(0);
    setFailedChoiceId("");
    setCurrentWrongAttempts(0);
    setGameStreak(0);
    setGameHearts(3);
    setGameFeedback(null);
    setIsAnswerTransitioning(false);
    setScreen("gameplay");
  };

  const recordAdaptiveAttempt = ({
    activity,
    challenge,
    correct,
    attemptNumber = 1,
    hintLevel = 0,
    reward = null,
  }) => {
    if (!challenge && !activity) {
      return;
    }

    const subjectId = activity?.subjectId || challenge?.subjectId || selectedSubject?.id;
    const levelId =
      activity?.levelId ||
      challenge?.levelId ||
      (selectedSubject?.id === "math-genius"
        ? `${selectedMathGeniusTrack.id}:${currentLevelData?.id || selectedProgress.currentLevel}`
        : currentLevelData?.id);
    const skillId = getSkillId({
      subjectId,
      levelId,
      challenge,
      levelConfig: activity?.levelConfig || currentLevelData,
    });

    if (
      cloudSync.enabled &&
      cloudSync.childId &&
      isProgressSyncConfigured()
    ) {
      const clientEventId =
        globalThis.crypto?.randomUUID?.() ||
        `attempt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      void recordCloudAttempt({
        childId: cloudSync.childId,
        clientEventId,
        subjectId,
        levelId,
        challengeId: challenge?.id || activity?.id || null,
        skillId,
        skillLabel:
          challenge?.skillLabel ||
          activity?.levelConfig?.themeLabel ||
          activity?.subjectName ||
          selectedSubject?.name ||
          "Monster skill",
        attemptNumber,
        hintLevel,
        correct,
        releaseId: contentReleaseId,
        metadata: {
          mode: challenge?.mode || activity?.mode || "activity",
          source: "local-first-runtime",
        },
        ...(reward ? { reward } : {}),
      }).then((result) => {
        if (result.status === "queued") {
          setCloudSyncNotice(
            "Cloud sync is waiting for a connection. Your local progress is safe.",
          );
        }
      });
    }

    setLearningState((currentValue) =>
      recordLearningAttempt(currentValue, {
        subjectId,
        levelId,
        skillId,
        challenge,
        levelConfig: activity?.levelConfig || currentLevelData,
        mode: challenge?.mode || activity?.mode,
        skillLabel:
          challenge?.skillLabel ||
          activity?.levelConfig?.themeLabel ||
          activity?.subjectName ||
          selectedSubject?.name,
        correct,
        attemptNumber,
        hintLevel,
        difficulty: challenge?.difficulty || activity?.difficulty,
      }),
    );
  };

  const buildAndStartTodayMission = (diagnostic = false) => {
    const nextPlan = buildTodayMission({
      challengeHistory: challengeHistoryRef.current,
      diagnostic,
      learningState,
      library,
      profile: learningProfile,
    });
    const activities = nextPlan.activities
      .map((activity) => ({
        ...activity,
        challenge: createTodayActivityChallenge(activity),
      }))
      .filter((activity) => activity.challenge);

    if (activities.length === 0) {
      setTodayMissionStartError(
        "There is no playable activity available right now. Choose a world to keep learning.",
      );
      return false;
    }

    setTodayMission({ ...nextPlan, activities });
    setTodayMissionIndex(0);
    setTodayMissionChallenge(activities[0].challenge);
    setTodayMissionStats({
      correct: 0,
      total: activities.length,
      attempts: 0,
    });
    setTodayMissionWrongAttempts(0);
    setTodayMissionHint(null);
    setTodayMissionTransitioning(false);
    setTodayMissionStartError("");
    setIsDiagnosticActive(diagnostic);
    setFailedChoiceId("");
    setGameFeedback(null);
    setScreen("today-mission");
    setLearningState((currentValue) => ({
      ...currentValue,
      activeMission: {
        ...nextPlan,
        activities,
        index: 0,
        diagnostic,
      },
      diagnostic: diagnostic
        ? {
            ...currentValue.diagnostic,
            status: "in-progress",
            questionIndex: 0,
            total: 10,
          }
        : currentValue.diagnostic,
      mission: diagnostic
        ? currentValue.mission
        : {
            ...currentValue.mission,
            status: "in-progress",
            index: 0,
          },
    }));
    return true;
  };

  const handleOpenTodayMission = () => {
    ensureLocalChildProfile();
    setUiPreferences((currentValue) => ({
      ...currentValue,
      lastSection: "worlds",
    }));

    if (restoreActiveTodayMission()) {
      return;
    }

    buildAndStartTodayMission(learningState.diagnostic.status !== "complete");
  };

  const handleTodayHint = () => {
    if (!todayMissionChallenge) {
      return;
    }

    const nextHintLevel = Math.min(3, todayMissionWrongAttempts + 1);
    setTodayMissionHint(
      getLearningHint(todayMissionChallenge, {
        hintLevel: nextHintLevel,
        wrongAttempts: todayMissionWrongAttempts,
      }),
    );
  };

  const handleTodayWrongChoice = (choiceId) => {
    if (todayMissionTransitioning || !todayMissionChallenge) {
      return;
    }

    playOops();
    const nextAttempts = todayMissionWrongAttempts + 1;
    setTodayMissionWrongAttempts(nextAttempts);
    setTodayMissionStats((currentValue) => ({
      ...currentValue,
      attempts: currentValue.attempts + 1,
    }));
    setFailedChoiceId(choiceId);
    setGameFeedback({
      id: `${Date.now()}-today-wrong`,
      type: "wrong",
      title: "Almost!",
      message: "ลองอีกครั้งได้เลย มอนสเตอร์กำลังช่วยสังเกตอยู่",
    });
    recordAdaptiveAttempt({
      activity: currentTodayActivity,
      challenge: todayMissionChallenge,
      correct: false,
      attemptNumber: nextAttempts,
      hintLevel: todayMissionHint?.level || 0,
    });
    setTodayMissionHint(
      getLearningHint(todayMissionChallenge, {
        hintLevel: Math.min(3, nextAttempts),
        wrongAttempts: nextAttempts,
      }),
    );
  };

  const handleTodayCorrectChoice = () => {
    if (todayMissionTransitioning || !todayMissionChallenge) {
      return;
    }

    setTodayMissionTransitioning(true);
    playSuccess();
    const attemptNumber = todayMissionWrongAttempts + 1;
    const nextIndex = todayMissionIndex + 1;
    const willCompleteMission =
      nextIndex >= (todayMission?.activities?.length || 0);
    recordAdaptiveAttempt({
      activity: currentTodayActivity,
      challenge: todayMissionChallenge,
      correct: true,
      attemptNumber,
      hintLevel: todayMissionHint?.level || 0,
      reward: willCompleteMission
        ? {
            sourceType: "today-mission",
            sourceId: todayMission?.id || "today-mission",
            starsDelta: isDiagnosticActive ? 1 : 2,
            coinsDelta: isDiagnosticActive ? 5 : 10,
          }
        : null,
    });
    setTodayMissionStats((currentValue) => ({
      ...currentValue,
      correct: currentValue.correct + 1,
      attempts: currentValue.attempts + 1,
    }));

    if (nextIndex < (todayMission?.activities?.length || 0)) {
      window.setTimeout(() => {
        const nextActivity = todayMission.activities[nextIndex];
        setTodayMissionIndex(nextIndex);
        setTodayMissionChallenge(nextActivity.challenge);
        setTodayMissionWrongAttempts(0);
        setTodayMissionHint(null);
        setFailedChoiceId("");
        setGameFeedback(null);
        setTodayMissionTransitioning(false);
        setLearningState((currentValue) => ({
          ...currentValue,
          diagnostic: isDiagnosticActive
            ? {
                ...currentValue.diagnostic,
                questionIndex: nextIndex,
              }
            : currentValue.diagnostic,
          mission: !isDiagnosticActive
            ? { ...currentValue.mission, index: nextIndex }
            : currentValue.mission,
          activeMission: currentValue.activeMission
            ? { ...currentValue.activeMission, index: nextIndex }
            : null,
        }));
      }, 460);
      return;
    }

    const completedStats = {
      ...todayMissionStats,
      correct: todayMissionStats.correct + 1,
      attempts: todayMissionStats.attempts + 1,
    };
    setLearningState((currentValue) => {
      const nextState = recordLearningSession(currentValue, true);
      return {
        ...nextState,
        diagnostic: isDiagnosticActive
          ? { ...nextState.diagnostic, status: "complete", questionIndex: 10 }
          : nextState.diagnostic,
        mission: !isDiagnosticActive
          ? {
              ...nextState.mission,
              status: "complete",
              completed: nextState.mission.completed + 1,
              lastCompletedAt: Date.now(),
            }
          : nextState.mission,
        activeMission: null,
      };
    });
    setTodayMissionStats(completedStats);
    setStars((value) => value + (isDiagnosticActive ? 1 : 2));
    setCoins((value) => value + (isDiagnosticActive ? 5 : 10));
    playCelebration();
    window.setTimeout(() => {
      setTodayMissionTransitioning(false);
      setFailedChoiceId("");
      setGameFeedback(null);
      setScreen("today-mission-summary");
    }, 650);
  };

  const handleFinalTestAnswer = ({
    challengeId,
    correct,
    firstAttempt,
    presentation = "level",
  } = {}) => {
    // Today Mission uses the same board as Final Test, but its answer and
    // completion accounting belong to the mission session. Keep Unit scores
    // isolated from that review surface.
    if (presentation === "today" || !challengeId) {
      return;
    }

    const current = finalTestSessionStatsRef.current;
    const alreadyAnswered = current.attemptedChallengeIds.includes(challengeId);
    const next = {
      ...current,
      answered: alreadyAnswered ? current.answered : current.answered + 1,
      totalAttempts: current.totalAttempts + 1,
      firstAttemptCorrect:
        alreadyAnswered || !firstAttempt || !correct
          ? current.firstAttemptCorrect
          : current.firstAttemptCorrect + 1,
      attemptedChallengeIds: alreadyAnswered
        ? current.attemptedChallengeIds
        : [...current.attemptedChallengeIds, challengeId],
    };

    finalTestSessionStatsRef.current = next;
    setFinalTestSessionStats(next);
  };

  const handleCorrectChoice = () => {
    if (isAnswerTransitioning) {
      return;
    }

    const nextStreak = gameStreak + 1;
    const xpDelta = 10 + Math.min(nextStreak - 1, 4) * 2;
    recordAdaptiveAttempt({
      challenge: currentChallenge,
      correct: true,
      attemptNumber: currentWrongAttempts + 1,
      reward: {
        sourceType: "level-answer",
        sourceId: currentChallenge?.id || currentLevelData?.id || "level-answer",
        xpDelta,
        starsDelta: isLastWordInLevel ? 1 : 0,
        coinsDelta: isLastWordInLevel ? 10 : 0,
      },
    });
    setIsAnswerTransitioning(true);
    playSuccess();
    setGameStreak(nextStreak);
    setGameXp((value) => value + xpDelta);
    setGameFeedback({
      id: `${Date.now()}-correct`,
      type: "correct",
      title: nextStreak >= 3 ? `${nextStreak} in a row!` : "Awesome!",
      message: nextStreak >= 3 ? "Super combo! Keep going!" : "+10 XP • Next mission",
    });

    if (!isLastWordInLevel) {
      window.setTimeout(() => {
        setStageWordIndex((value) => value + 1);
        setFailedChoiceId("");
        setCurrentWrongAttempts(0);
        setIsAnswerTransitioning(false);
      }, 460);
      return;
    }

    playCelebration();
    setLearningState((currentValue) => recordLearningSession(currentValue, true));
    updateSelectedSubjectProgress((currentValue) => ({
      ...currentValue,
      completedLevels: Math.max(
        currentValue.completedLevels,
        currentValue.currentLevel,
      ),
    }));
    setStars((value) => value + 1);
    setCoins((value) => value + 10);

    if (selectedSubject?.id === "math-genius") {
      setMathGeniusReward({
        level: selectedProgress.currentLevel,
        trackId: selectedMathGeniusTrack.id,
      });
      window.setTimeout(() => {
        setStageWordIndex(0);
        setFailedChoiceId("");
        setCurrentWrongAttempts(0);
        setIsAnswerTransitioning(false);
        setScreen("math-genius-reward");
      }, 850);
      return;
    }

    if (selectedSubject?.id === "final-test") {
      const sessionStats = finalTestSessionStatsRef.current;
      const levelId = sessionStats.levelId || currentLevelData?.id;
      const totalQuestions = sessionStats.totalQuestions || currentLevelWordCount || 40;
      const previousBest = Number(
        learningState.finalTestResults?.[levelId]?.bestFirstAttemptScore || 0,
      );
      const result = {
        levelId,
        levelNumber: selectedProgress.currentLevel,
        unitLabel: currentLevelData?.label || `Unit ${selectedProgress.currentLevel}`,
        firstAttemptScore: sessionStats.firstAttemptCorrect,
        bestFirstAttemptScore: Math.max(previousBest, sessionStats.firstAttemptCorrect),
        totalQuestions,
        totalAttempts: sessionStats.totalAttempts,
        completedAt: Date.now(),
      };

      setLearningState((currentValue) => ({
        ...currentValue,
        finalTestResults: {
          ...(currentValue.finalTestResults || {}),
          [levelId]: {
            latestFirstAttemptScore: result.firstAttemptScore,
            bestFirstAttemptScore: result.bestFirstAttemptScore,
            totalQuestions: result.totalQuestions,
            attempts: result.totalAttempts,
            completedAt: result.completedAt,
          },
        },
      }));
      setFinalTestSummary(result);
      window.setTimeout(() => {
        setStageWordIndex(0);
        setFailedChoiceId("");
        setCurrentWrongAttempts(0);
        setIsAnswerTransitioning(false);
        setScreen("final-test-summary");
      }, 850);
      return;
    }

    window.setTimeout(() => {
      setStageWordIndex(0);
      setFailedChoiceId("");
      setCurrentWrongAttempts(0);

      if (hasNextLevel) {
        handleStartLevel(selectedProgress.currentLevel + 1);
        return;
      }

      setIsAnswerTransitioning(false);
      setScreen("map");
    }, 850);
  };

  const handleWrongChoice = (choiceId) => {
    if (isAnswerTransitioning) {
      return;
    }

    playOops();
    recordAdaptiveAttempt({
      challenge: currentChallenge,
      correct: false,
      attemptNumber: currentWrongAttempts + 1,
    });
    setCurrentWrongAttempts((value) => value + 1);
    setGameStreak(0);
    // Hearts are a friendly HUD decoration in the personalized path; wrong answers
    // never remove them or block progress.
    setGameHearts(3);
    setGameFeedback({
      id: `${Date.now()}-wrong`,
      type: "wrong",
      title: "Almost!",
      message: "Look again — your buddy believes in you.",
    });
    setFailedChoiceId(choiceId);
  };

  const handleMathLessonWrongChoice = (choiceId) => {
    if (isAnswerTransitioning) {
      return;
    }

    playOops();
    recordAdaptiveAttempt({
      challenge: currentChallenge,
      correct: false,
      attemptNumber: currentWrongAttempts + 1,
    });
    setCurrentWrongAttempts((value) => value + 1);
    setGameStreak(0);
    setGameFeedback({
      id: `${Date.now()}-math-lesson-wrong`,
      type: "wrong",
      title: "Try again!",
      message: "ลองอีกครั้งนะ มอนสเตอร์เพื่อนซี้กำลังช่วยใบ้ให้",
    });
    setFailedChoiceId(choiceId);
  };

  const handleBackToMap = () => {
    setStageWordIndex(0);
    setCurrentWrongAttempts(0);
    setFinalTestSummary(null);
    setFocusMissionMap(true);
    setScreen("map");
  };

  const handleRetryFinalTest = () => {
    const levelNumber = finalTestSummary?.levelNumber || selectedProgress.currentLevel;
    setFinalTestSummary(null);
    handleStartLevel(levelNumber);
  };

  const handleMathGeniusRewardNext = () => {
    const completedLevel =
      mathGeniusReward?.level || selectedProgress.currentLevel;

    if (completedLevel < selectedLevels.length) {
      handleStartLevel(completedLevel + 1);
      return;
    }

    setMathGeniusReward(null);
    setScreen("math-genius-hub");
  };

  const handleMathGeniusRewardMap = () => {
    setMathGeniusReward(null);
    setStageWordIndex(0);
    setFocusMissionMap(true);
    setScreen("map");
  };

  const handleHome = () => {
    setStageWordIndex(0);
    setTodayMissionHint(null);
    setParentGateUnlocked(false);
    setFocusMissionMap(false);
    setUiPreferences((currentValue) => ({
      ...currentValue,
      lastSection: "worlds",
    }));
    setScreen("splash");
  };

  const handleOpenParent = () => {
    setParentGateUnlocked(false);
    setScreen("parent-progress");
  };

  const handleSetupParentPin = async (pin) => {
    const nextGate = await createParentGate(pin);
    const didSave = saveParentGate(nextGate);

    if (didSave) {
      setParentGate(nextGate);
      setParentGateUnlocked(true);
    }

    return didSave;
  };

  const handleVerifyParentPin = async (pin) => {
    const didUnlock = await verifyParentPin(pin, parentGate);

    if (didUnlock) {
      setParentGateUnlocked(true);
    }

    return didUnlock;
  };

  const handleResetAdaptivePath = () => {
    setLearningState((currentValue) => resetAdaptiveProgress(currentValue));
    setTodayMission(null);
    setTodayMissionChallenge(null);
    setTodayMissionIndex(0);
    setTodayMissionStats({ correct: 0, total: 0, attempts: 0 });
    setTodayMissionStartError("");
    setIsDiagnosticActive(false);
    setParentGateUnlocked(true);
  };

  const refreshCloudProfiles = async () => {
    if (!isProgressSyncConfigured()) {
      setCloudProfiles([]);
      return [];
    }

    const nextProfiles = await listLearnerProfiles();
    setCloudProfiles(nextProfiles);
    return nextProfiles;
  };

  const handleSelectContentScope = async (nextScope) => {
    setContentScope(nextScope);
    setIsLibraryLoading(true);
    try {
      const result = await loadLibrary(nextScope);
      setLibrary(result.library);
      setContentSource(result.source);
      setContentReleaseId(result.releaseId || null);
      setContentWarning(result.warning);
      if (isSupabaseConfigured) {
        const nextGradeBands = await getGradeBands(nextScope.curriculumId);
        setGradeBands(nextGradeBands);
      }
    } catch (error) {
      setContentWarning(`Could not load this content scope. ${error.message}`);
    } finally {
      setIsLibraryLoading(false);
    }
  };

  const handleLinkCloudLearner = async () => {
    if (!parentProfile || !isProgressSyncConfigured()) {
      throw new Error("Cloud progress is not connected yet.");
    }

    const existing = cloudProfiles.find(
      (item) => item.local_profile_id === learningProfile.id,
    );
    const profile = existing ||
      (await createLearnerProfile({
        displayName: learningProfile.name,
        localProfileId: learningProfile.id,
        locale: learningProfile.locale || "en",
      }));
    const syncedProfile = await setLearnerSyncEnabled(profile.id, true);
    const nextPreference = { enabled: true, childId: syncedProfile.id };
    writeCloudSyncPreference(nextPreference);
    setCloudSync(nextPreference);
    setCloudSyncNotice("Cloud progress is on. Local play will keep working offline.");
    await refreshCloudProfiles();
    await flushQueuedAttempts(syncedProfile.id);
    return syncedProfile;
  };

  const handleSelectCloudLearner = async (childId) => {
    const selected = cloudProfiles.find((item) => item.id === childId);
    if (!selected) return;
    await setLearnerSyncEnabled(selected.id, true);
    const nextPreference = { enabled: true, childId: selected.id };
    writeCloudSyncPreference(nextPreference);
    setCloudSync(nextPreference);
    await flushQueuedAttempts(selected.id);
  };

  const handleToggleCloudSync = async (enabled) => {
    if (!cloudSync.childId) {
      if (enabled) await handleLinkCloudLearner();
      return;
    }

    await setLearnerSyncEnabled(cloudSync.childId, enabled);
    const nextPreference = { ...cloudSync, enabled };
    writeCloudSyncPreference(nextPreference);
    setCloudSync(nextPreference);
    setCloudSyncNotice(
      enabled
        ? "Cloud progress is on."
        : "Cloud progress is paused. New play stays on this device.",
    );
  };

  const handleOpenParentLibrary = () => {
    setScreen(parentSession && parentProfile ? "library" : "parent-login");
  };

  const handleParentLogin = async (email, password) => {
    const result = await signInParent(email, password);
    setParentSession(result.session);
    setParentProfile(result.profile);
    await refreshCloudProfiles();
    setScreen("library");
  };

  const handleParentLogout = async () => {
    await signOutParent();
    setParentSession(null);
    setParentProfile(null);
    setCloudProfiles([]);
    setScreen("splash");
  };

  const assertRemoteWrite = () => {
    if (!canWriteRemoteContent(contentSource) || !parentProfile) {
      throw new Error(
        "Parent Library is read-only until Supabase is connected and loaded.",
      );
    }
  };

  const handleAddSubject = async (subjectData) => {
    assertRemoteWrite();
    const subject = await createSubject({
      id: createSubjectId(subjectData.name),
      name: subjectData.name.trim(),
      category: subjectData.category || "basic",
      icon: subjectData.icon.trim() || "📚",
      description:
        subjectData.description.trim() || "A new learning world.",
      worldLabel: subjectData.worldLabel?.trim() || subjectData.name.trim(),
      worldTheme: subjectData.worldTheme?.trim() || subjectData.name.trim(),
      buddyId: subjectData.buddyId || "sun",
      heroAccent: subjectData.heroAccent || "gold",
      mapPreviewStyle: "trail",
      homeMood: "adventure",
      homeOrder: library.length + 1,
      contentMode: "words",
    });

    setLibrary((currentValue) => [...currentValue, subject]);
    return subject;
  };

  const toWordRecord = (wordData, existingWord = null) => ({
    ...existingWord,
    id: existingWord?.id || createWordId(wordData.word),
    word: wordData.word.trim(),
    emoji: wordData.emoji.trim() || "✨",
    phonics: wordData.phonics.trim(),
    pronunciation: {
      guide: wordData.pronunciationGuide.trim(),
      ipa: wordData.pronunciationIpa.trim(),
    },
    translation: wordData.translation.trim(),
  });

  const handleAddWord = async (subjectId, wordData, imageFile) => {
    assertRemoteWrite();
    const nextWord = await createWord(
      subjectId,
      toWordRecord(wordData),
      imageFile,
    );

    setLibrary((currentValue) =>
      currentValue.map((subject) =>
        subject.id === subjectId
          ? { ...subject, words: [...subject.words, nextWord] }
          : subject,
      ),
    );
    return nextWord;
  };

  const handleUpdateWord = async (
    subjectId,
    existingWord,
    wordData,
    imageFile,
  ) => {
    assertRemoteWrite();
    const nextWord = await updateWord(
      subjectId,
      existingWord.id,
      toWordRecord(wordData, existingWord),
      imageFile,
    );

    setLibrary((currentValue) =>
      currentValue.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              words: subject.words.map((word) =>
                word.id === existingWord.id ? nextWord : word,
              ),
            }
          : subject,
      ),
    );
    return nextWord;
  };

  const handleDeleteWord = async (subjectId, word) => {
    assertRemoteWrite();
    await deleteWord(subjectId, word);

    setLibrary((currentValue) =>
      currentValue.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              words: subject.words.filter((item) => item.id !== word.id),
            }
          : subject,
      ),
    );
  };

  const isActivityScreen = ["gameplay", "arcade", "today-mission"].includes(
    screen,
  );
  const isNavigationVisible = new Set([
    "splash",
    "map",
    "math-genius-hub",
    "math-genius-reward",
    "arcade-home",
    "arcade-summary",
    "final-test-summary",
    "today-mission-summary",
    "rewards",
    "gameplay",
    "arcade",
    "today-mission",
  ]).has(screen);
  const isActivityLayout = isActivityScreen && isNavigationVisible;
  const activeNavigationItem =
    screen === "rewards"
      ? "rewards"
      : ["arcade-home", "arcade-summary", "arcade"].includes(screen)
        ? "arcade"
        : screen === "today-mission"
          ? "today"
          : screen === "splash" && homeView === "worlds"
            ? "worlds"
            : ["map", "math-genius-hub", "math-genius-reward", "gameplay", "final-test-summary"].includes(
                  screen,
                )
              ? "worlds"
              : "today";

  const navigateToAppItem = (itemId) => {
    if (itemId === "today") {
      handleOpenTodayMission();
      return;
    }

    if (itemId === "worlds") {
      handleOpenWorlds("all");
      return;
    }

    if (itemId === "arcade") {
      handleOpenArcadeFromNavigation();
      return;
    }

    if (itemId === "rewards") {
      handleOpenRewards();
    }
  };

  const handleAppNavigation = (itemId) => {
    if (itemId === activeNavigationItem) {
      return;
    }

    if (isActivityScreen) {
      setPendingNavigationItem(itemId);
      return;
    }

    navigateToAppItem(itemId);
  };

  const handleConfirmPendingNavigation = () => {
    const destination = pendingNavigationItem;

    if (!destination) {
      return;
    }

    if (screen === "arcade") {
      handleFinishArcade(destination);
      return;
    }

    setPendingNavigationItem("");
    if (screen === "today-mission") {
      handleExitTodayMission();
    } else {
      handleBackToMap();
    }
    navigateToAppItem(destination);
  };

  return (
    <div
      className={`app-shell ${
        screen === "gameplay" || screen === "arcade" || screen === "today-mission"
          ? "app-shell--gameplay"
          : ""
      } ${isNavigationVisible ? "app-shell--with-navigation" : ""} ${
        isActivityLayout ? "app-shell--activity-layout" : ""
      }`.trim()}
    >
      <div className="app-shell__bg app-shell__bg--top" />
      <div className="app-shell__bg app-shell__bg--bottom" />

      {isNavigationVisible ? (
        <AppNavigation
          activeItem={activeNavigationItem}
          collapsible={isActivityScreen}
          layout={isActivityLayout ? "sidebar" : "top"}
          onNavigate={handleAppNavigation}
          onPress={playPop}
        />
      ) : null}

      <NavigationLeaveDialog
        destination={pendingNavigationItem}
        onCancel={() => setPendingNavigationItem("")}
        onConfirm={handleConfirmPendingNavigation}
      />

      {screen === "gameplay" && currentChallenge ? (
        <GameCompanionHUD
          feedback={gameFeedback}
          hearts={gameHearts}
          level={selectedProgress.currentLevel}
          onExit={() => {
            playPop();
            handleBackToMap();
          }}
          stepIndex={stageWordIndex + 1}
          streak={gameStreak}
          subjectName={
            selectedSubject?.id === "math-genius"
              ? `${selectedSubject.name} · ${selectedMathGeniusTrack.name}`
              : selectedSubject?.name
          }
          totalSteps={currentLevelWordCount}
          xp={gameXp}
        />
      ) : null}

      {screen === "arcade" && arcadeChallenge ? (
        <ArcadeHUD
          buddyId={
            arcadeModes.find((mode) => mode.id === arcadeChallenge.mode)?.buddyId
          }
          combo={arcadeStats.combo}
          difficulty={arcadeStats.difficulty}
          feedback={gameFeedback}
          onConfirmExit={handleFinishArcade}
          rounds={arcadeStats.rounds}
          score={arcadeStats.score}
        />
      ) : null}

      <AnimatePresence mode="wait">
      {screen === "splash" ? (
          <SplashScreen
            key="splash"
            activeGroup={homeGroup}
            onChangeGroup={(groupId) => {
              setUiPreferences((currentValue) => ({
                ...currentValue,
                lastHomeGroup: groupId,
              }));
            }}
            onSelectProfile={handleProfileSelect}
            onPress={playPop}
            onOpenParent={handleOpenParent}
            onOpenTodayMission={handleOpenTodayMission}
            onOpenWorlds={handleOpenWorlds}
            onSelectSubject={setSelectedSubjectId}
            selectedSubjectId={selectedSubjectId}
            subjects={subjectSummaries}
            todayEntry={todayEntry}
            todayStartError={todayMissionStartError}
            view={homeView}
          />
        ) : null}

        {screen === "rewards" ? (
          <RewardsScreen
            key="rewards"
            bestScore={arcadeBestScore}
            collection={arcadeCollection}
            coins={coins}
            modes={arcadeModes}
            onBack={handleBackToHome}
            onPlayArcade={handleOpenArcadeFromNavigation}
            onPress={playPop}
            stars={stars}
          />
        ) : null}

        {screen === "arcade-home" && profile ? (
          <ArcadeHomeScreen
            key="arcade-home"
            bestScore={arcadeBestScore}
            collection={arcadeCollection}
            favorites={arcadeFavorites}
            modes={arcadeModes}
            onBack={() => setScreen("map")}
            onPress={playPop}
            onStart={handleStartArcade}
            onToggleFavorite={handleToggleArcadeFavorite}
            stars={stars}
            coins={coins}
            wordCount={arcadeWordPool.length}
          />
        ) : null}

        {screen === "math-genius-hub" && profile ? (
          <MathGeniusHubScreen
            key="math-genius-hub"
            coins={coins}
            onBack={handleHome}
            onPress={playPop}
            onSelectTrack={handleSelectMathGeniusTrack}
            stars={stars}
            tracks={mathGeniusTracks.map((track) => ({
              ...track,
              completedLevels:
                subjectProgress[`math-genius:${track.id}`]?.completedLevels ||
                0,
            }))}
          />
        ) : null}

        {screen === "map" && profile && selectedSubjectId === "final-test" ? (
          <FinalExamScreen key="final-exam-hub" onBack={handleHome} locale={learningProfile.locale || "en"} avatarId={learningProfile.avatarId} />
        ) : null}

        {screen === "map" && profile && selectedSubjectId !== "final-test" ? (
          <AdventureMapScreen
            key={`map-${selectedSubjectId}-${selectedMathGeniusTrackId}`}
            completedLevels={selectedProgress.completedLevels}
            currentLevel={unlockedLevel}
            levels={selectedLevels}
            onBack={
              selectedSubject?.id === "math-genius"
                ? () => setScreen("math-genius-hub")
                : handleHome
            }
            onOpenArcade={handleOpenArcade}
            onOpenTodayMission={handleOpenTodayMission}
            onSelectSubject={handleMapSubjectSelect}
            onStartLevel={handleStartLevel}
            onPress={playPop}
            profile={profile}
            selectedSubjectId={selectedSubjectId}
            focusMissionMap={focusMissionMap}
            stars={stars}
            subjects={subjectSummaries}
            coins={coins}
            learningSummary={learningSummary}
            trackLabel={
              selectedSubject?.id === "math-genius"
                ? selectedMathGeniusTrack.name
                : ""
            }
          />
        ) : null}

        {screen === "math-genius-reward" && mathGeniusReward ? (
          <MathGeniusRewardScreen
            key={`math-genius-reward-${mathGeniusReward.trackId}-${mathGeniusReward.level}`}
            isLastLevel={mathGeniusReward.level >= selectedLevels.length}
            level={mathGeniusReward.level}
            onMap={handleMathGeniusRewardMap}
            onNext={handleMathGeniusRewardNext}
            onPress={playPop}
            track={getMathGeniusTrack(mathGeniusReward.trackId)}
          />
        ) : null}

        {screen === "arcade-summary" && arcadeSummary ? (
          <ArcadeSummaryScreen
            key={`arcade-summary-${arcadeSummary.score}-${arcadeSummary.rounds}`}
            accuracy={arcadeSummary.accuracy}
            attempts={arcadeSummary.attempts}
            bestCombo={arcadeSummary.bestCombo}
            bestScore={arcadeSummary.bestScore}
            coins={coins}
            isNewBest={arcadeSummary.isNewBest}
            mistakes={arcadeSummary.mistakes}
            onBack={() => setScreen("arcade-home")}
            onPlayAgain={() =>
              arcadePreferredModeIds.length === 1
                ? handleStartArcade({ modeId: arcadePreferredModeIds[0] })
                : handleStartArcade({
                    favoriteOnly: arcadePreferredModeIds.length > 0,
                  })
            }
            onPress={playPop}
            rounds={arcadeSummary.rounds}
            score={arcadeSummary.score}
            stars={stars}
            stickersEarned={arcadeSummary.stickersEarned}
          />
        ) : null}

        {screen === "today-mission-summary" && todayMission ? (
          <TodayMissionSummaryScreen
            key={`today-summary-${todayMission.id}-${todayMissionStats.correct}`}
            activities={todayMission.activities}
            coins={coins}
            diagnostic={isDiagnosticActive}
            onBack={handleExitTodayMission}
            onContinue={() => buildAndStartTodayMission(false)}
            onPress={playPop}
            stars={stars}
            stats={todayMissionStats}
          />
        ) : null}

        {screen === "final-test-summary" && finalTestSummary ? (
          <FinalTestSummaryScreen
            key={`final-test-summary-${finalTestSummary.levelId}-${finalTestSummary.completedAt}`}
            coins={coins}
            onBack={handleBackToMap}
            onPress={playPop}
            onRetry={handleRetryFinalTest}
            result={finalTestSummary}
            stars={stars}
          />
        ) : null}

        {screen === "parent-progress" ? (
          <ParentProgressScreen
            key={`parent-progress-${parentGateUnlocked ? "open" : "locked"}`}
            gate={parentGate}
            learningProfile={learningProfile}
            learningState={{
              ...learningState,
              subjectProgress,
              stars,
              coins,
            }}
            onBack={handleHome}
            onOpenLibrary={handleOpenParentLibrary}
            onPress={playPop}
            onReset={handleResetAdaptivePath}
            onSetupPin={handleSetupParentPin}
            onVerifyPin={handleVerifyParentPin}
            cloudProfiles={cloudProfiles}
            cloudSync={cloudSync}
            cloudSyncNotice={cloudSyncNotice}
            isCloudSyncConfigured={isProgressSyncConfigured() && Boolean(parentProfile)}
            onLinkCloudLearner={handleLinkCloudLearner}
            onSelectCloudLearner={handleSelectCloudLearner}
            onToggleCloudSync={handleToggleCloudSync}
            unlocked={parentGateUnlocked}
          />
        ) : null}

        {screen === "parent-login" ? (
          <ParentLoginScreen
            key="parent-login"
            isConfigured={isSupabaseConfigured}
            onBack={handleHome}
            onLogin={handleParentLogin}
          />
        ) : null}

        {screen === "library" && parentProfile ? (
          <LibraryScreen
            key="library"
            isLoading={isLibraryLoading}
            library={library}
            onAddSubject={handleAddSubject}
            onAddWord={handleAddWord}
            onBack={handleHome}
            onDeleteWord={handleDeleteWord}
            onLogout={handleParentLogout}
            onPress={playPop}
            onUpdateWord={handleUpdateWord}
            contentReleaseId={contentReleaseId}
            contentScope={contentScope}
            curricula={curricula}
            gradeBands={gradeBands}
            onSelectContentScope={handleSelectContentScope}
            source={contentSource}
            warning={contentWarning}
          />
        ) : null}

        {screen === "arcade" && arcadeChallenge ? (
          <LearningGameScreen
            key={`arcade-${arcadeChallenge.id}`}
            arcadeRound={arcadeStats.rounds}
            currentChallenge={arcadeChallenge}
            failedChoiceId={failedChoiceId}
            isArcade
            level={arcadeStats.difficulty}
            levelThemeLabel="Endless Arcade"
            wrongAttempts={arcadeFailedAttempts}
            onCorrectChoice={handleArcadeCorrectChoice}
            onKeyboardChoice={handleArcadeKeyboardChoice}
            onPress={playPop}
            onWrongChoice={handleArcadeWrongChoice}
          />
        ) : null}

        {screen === "today-mission" && todayMissionChallenge ? (
          <TodayMissionScreen
            key={`today-mission-${todayMissionChallenge.id}`}
            activity={currentTodayActivity}
            hint={todayMissionHint}
            isDiagnostic={isDiagnosticActive}
            missionIndex={todayMissionIndex}
            onBack={handleExitTodayMission}
            onHint={handleTodayHint}
            onPress={playPop}
            totalActivities={todayMission?.activities?.length || 1}
          >
            <TodayMissionChallengeScreen
              activity={currentTodayActivity}
              currentChallenge={todayMissionChallenge}
              failedChoiceId={failedChoiceId}
              level={currentTodayActivity?.levelNumber || 1}
              wrongAttempts={todayMissionWrongAttempts}
              onBack={handleExitTodayMission}
              onCorrectChoice={handleTodayCorrectChoice}
              onFinalTestAnswer={handleFinalTestAnswer}
              onPress={playPop}
              onWrongChoice={handleTodayWrongChoice}
              stepIndex={1}
              totalSteps={1}
              track={
                currentTodayActivity?.trackId
                  ? mathGeniusTracks.find(
                      (item) => item.id === currentTodayActivity.trackId,
                    )
                  : null
              }
            />
          </TodayMissionScreen>
        ) : null}

        {screen === "gameplay" && currentChallenge ? (
          isMathMode ? (
            <MathGameplayScreen
              key={`${selectedSubjectId}-${selectedProgress.currentLevel}-${stageWordIndex}`}
              currentChallenge={currentChallenge}
              level={selectedProgress.currentLevel}
              levelThemeLabel={currentLevelData?.themeLabel}
              failedChoiceId={failedChoiceId}
              onBack={handleBackToMap}
              onCorrectChoice={handleCorrectChoice}
              onWrongChoice={handleWrongChoice}
              onPress={playPop}
              stepIndex={stageWordIndex + 1}
              totalSteps={currentLevelWordCount}
            />
          ) : isMathGeniusMode ? (
            <MathGeniusGameplayScreen
              key={`${selectedSubjectId}-${selectedMathGeniusTrack.id}-${selectedProgress.currentLevel}-${stageWordIndex}`}
              currentChallenge={currentChallenge}
              failedChoiceId={failedChoiceId}
              level={selectedProgress.currentLevel}
              levelThemeLabel={currentLevelData?.themeLabel}
              onBack={handleBackToMap}
              onCorrectChoice={handleCorrectChoice}
              onWrongChoice={handleWrongChoice}
              onPress={playPop}
              stepIndex={stageWordIndex + 1}
              totalSteps={currentLevelWordCount}
              track={selectedMathGeniusTrack}
            />
          ) : isMathLessonMode ? (
            <MathLessonGameplayScreen
              key={`${selectedSubjectId}-${selectedProgress.currentLevel}-${stageWordIndex}`}
              currentChallenge={currentChallenge}
              failedChoiceId={failedChoiceId}
              lessonLabel={currentLevelData?.label}
              level={selectedProgress.currentLevel}
              levelThemeLabel={currentLevelData?.themeLabel}
              onBack={handleBackToMap}
              onCorrectChoice={handleCorrectChoice}
              onWrongChoice={handleMathLessonWrongChoice}
              onPress={playPop}
              setSize={currentMathLessonSession?.setSize ?? currentLevelData?.setSize ?? 10}
              stepIndex={stageWordIndex + 1}
              totalSteps={currentLevelWordCount}
            />
          ) : isFinalTestMode ? (
            <FinalTestGameplayScreen
              key={`${selectedSubjectId}-${selectedProgress.currentLevel}-${stageWordIndex}`}
              activity={{
                levelConfig: currentLevelData,
                levelId: currentLevelData?.id,
                levelNumber: selectedProgress.currentLevel,
                subjectId: selectedSubjectId,
                subjectName: selectedSubject?.name,
                subjectIcon: selectedSubject?.icon,
              }}
              currentChallenge={currentChallenge}
              failedChoiceId={failedChoiceId}
              level={selectedProgress.currentLevel}
              levelThemeLabel={currentLevelData?.themeLabel}
              wrongAttempts={currentWrongAttempts}
              onBack={handleBackToMap}
              onCorrectChoice={handleCorrectChoice}
              onFinalTestAnswer={handleFinalTestAnswer}
              onPress={playPop}
              onWrongChoice={handleWrongChoice}
              presentation="level"
              stepIndex={stageWordIndex + 1}
              totalSteps={currentLevelWordCount}
            />
          ) : isLearningGameMode ? (
            <LearningGameScreen
              key={`${selectedSubjectId}-${selectedProgress.currentLevel}-${stageWordIndex}`}
              currentChallenge={currentChallenge}
              failedChoiceId={failedChoiceId}
              level={selectedProgress.currentLevel}
              levelThemeLabel={currentLevelData?.themeLabel}
              wrongAttempts={currentWrongAttempts}
              onCorrectChoice={handleCorrectChoice}
              onPress={playPop}
              onWrongChoice={handleWrongChoice}
            />
          ) : isSpellingMode ? (
            <SpellingGameplayScreen
              key={`${selectedSubjectId}-${selectedProgress.currentLevel}-${stageWordIndex}`}
              currentChallenge={currentChallenge}
              level={selectedProgress.currentLevel}
              levelThemeLabel={currentLevelData?.themeLabel}
              failedChoiceId={failedChoiceId}
              wrongAttempts={currentWrongAttempts}
              onBack={handleBackToMap}
              onCorrectChoice={handleCorrectChoice}
              onWrongChoice={handleWrongChoice}
              onPress={playPop}
              stepIndex={stageWordIndex + 1}
              totalSteps={currentLevelWordCount}
            />
          ) : (
            <GameplayScreen
              key={`${selectedSubjectId}-${selectedProgress.currentLevel}-${stageWordIndex}`}
              currentChallenge={{
                ...currentChallenge,
                subjectId: selectedSubjectId,
                subjectName: selectedSubject?.name ?? currentChallenge.subjectName,
                subjectIcon: selectedSubject?.icon ?? currentChallenge.subjectIcon,
              }}
              subjectId={selectedSubjectId}
              level={selectedProgress.currentLevel}
              levelThemeLabel={currentLevelData?.themeLabel}
              failedChoiceId={failedChoiceId}
              wrongAttempts={currentWrongAttempts}
              onBack={handleBackToMap}
              onCorrectChoice={handleCorrectChoice}
              onWrongChoice={handleWrongChoice}
              onPress={playPop}
              stepIndex={stageWordIndex + 1}
              totalSteps={currentLevelWordCount}
            />
          )
        ) : null}

      </AnimatePresence>

    </div>
  );
}

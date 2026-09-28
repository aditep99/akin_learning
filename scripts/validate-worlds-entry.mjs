import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const appSource = read("src/App.jsx");
const splashSource = read("src/screens/SplashScreen.jsx");
const mapSource = read("src/screens/AdventureMapScreen.jsx");
const vocabularySource = read("src/components/VocabularyAnswer.jsx");
const gameplaySource = read("src/screens/GameplayScreen.jsx");
const spellingSource = read("src/screens/SpellingGameplayScreen.jsx");
const learningGameSource = read("src/screens/LearningGameScreen.jsx");
const mathSource = read("src/screens/MathGameplayScreen.jsx");
const hintSource = read("src/data/learningHints.js");
const cssSource = read("src/index.css");

assert(
  appSource.includes('const DEFAULT_HOME_VIEW = "worlds";') &&
    appSource.includes('const DEFAULT_START_SCREEN = "splash";') &&
    appSource.includes("useState(DEFAULT_START_SCREEN)") &&
    appSource.includes("const homeView = DEFAULT_HOME_VIEW;"),
  "App must keep Worlds as the canonical first-page view.",
);
assert(
  appSource.includes("lastSection: DEFAULT_HOME_VIEW") &&
    appSource.includes("Continue Mission action") &&
    appSource.includes("never by boot") &&
    appSource.includes("const restoreActiveTodayMission = () =>"),
  "App must persist Worlds as the default entry and require an explicit Continue Mission action for resume.",
);
assert(
  !appSource.includes("setScreen(\"today-mission\");\n  }, [learningProfile.name"),
  "App must not redirect a fresh Worlds mount into an active Today Mission.",
);
assert(
  appSource.includes("focusMissionMap") &&
    appSource.includes("focusMissionMap={focusMissionMap}"),
  "App must pass the focused mission-map state to AdventureMapScreen.",
);
assert(
  splashSource.includes("onOpen(subject.id)") &&
    splashSource.includes("onSelectProfile(akinProfile, subjectId)") &&
    splashSource.includes('view = "worlds"'),
  "World cards must use the shared subject-selection route.",
);
assert(
  mapSource.includes("scrollIntoView") &&
    mapSource.includes("mapBoardRef.current?.focus") &&
    mapSource.includes('tabIndex={-1}'),
  "AdventureMapScreen must scroll to and focus the mission map after selection.",
);
assert(
  mapSource.includes('"screen-shell--map-focused"') &&
    mapSource.includes("!focusMissionMap"),
  "Focused mission-map state must remove decorative artwork from the active map surface.",
);
assert(
  vocabularySource.includes("export function VocabularyMeta") &&
    vocabularySource.includes("word?.pronunciation?.ipa"),
  "VocabularyAnswer must own visible meaning and IPA metadata.",
);

for (const [name, source] of [
  ["GameplayScreen", gameplaySource],
  ["SpellingGameplayScreen", spellingSource],
  ["LearningGameScreen", learningGameSource],
  ["MathGameplayScreen", mathSource],
]) {
  assert(
    source.includes("VocabularyMeta"),
    `${name} must use the shared VocabularyMeta renderer.`,
  );
}

assert(
  !gameplaySource.includes("choice-card__phonics") &&
    !spellingSource.includes("communication-learn-card__phonics") &&
    !learningGameSource.includes("<small>{card.word.phonics}</small>") &&
    !gameplaySource.includes("pronunciation.guide") &&
    !spellingSource.includes("pronunciation?.guide"),
  "Learner-facing answer surfaces must not render the Thai phonics line.",
);
assert(
  !hintSource.includes("คำนี้อ่านว่า") && hintSource.includes("IPA"),
  "Visible learner hints must use meaning/IPA instead of the Thai phonics line.",
);
assert(
  cssSource.includes(".vocabulary-meta") &&
    cssSource.includes(".screen-shell--map-focused .map-board:focus") &&
    cssSource.includes("scroll-margin-top"),
  "Shared metadata and focused-map layout styles are missing.",
);

console.log(
  JSON.stringify(
    {
      entrySurface: "worlds",
      mapTransition: "scroll-and-focus",
      visibleVocabularyMetadata: "meaning-and-ipa",
      status: "ok",
    },
    null,
    2,
  ),
);

import { animalsSubject } from "./subjects/animals.js";
import { bodySubject } from "./subjects/body.js";
import { englishExercisesSubject } from "./subjects/englishExercises.js";
import { englishSpellingSubject } from "./subjects/englishSpelling.js";
import { finalTestSubject } from "./finalTest/finalTestExercises.js";
import { fruitsVegetablesSubject } from "./subjects/fruitsVegetables.js";
import { learningGamesSubject } from "./subjects/learningGames.js";
import { mathSubject } from "./subjects/math.js";
import { mathGeniusSubject } from "./subjects/mathGenius.js";
import { mathLessonsSubject } from "./subjects/mathLessons.js";
import { scienceExercisesSubject } from "./subjects/scienceExercises.js";
import { schoolThingsSubject } from "./subjects/schoolThings.js";
import { thaiExercisesSubject } from "./subjects/thaiExercises.js";
import { thaiSpellingSubject } from "./subjects/thaiSpelling.js";
import { decorateSubject } from "./missionSurfaces.js";
import "./subjectLevelOverrides.js";

const HOME_SUBJECT_META = {
  "learning-games": {
    worldLabel: "Monster Game Arcade",
    worldTheme: "Learning Games",
    buddyId: "coral",
    heroAccent: "violet",
    mapPreviewStyle: "stars",
    homeMood: "arcade",
    homeOrder: 0,
  },
  animals: {
    worldLabel: "Animal Safari",
    worldTheme: "Animals",
    buddyId: "sun",
    heroAccent: "gold",
    mapPreviewStyle: "trail",
    homeMood: "adventure",
    homeOrder: 1,
  },
  body: {
    worldLabel: "Body Lab",
    worldTheme: "Body",
    buddyId: "mint",
    heroAccent: "mint",
    mapPreviewStyle: "orbit",
    homeMood: "lab",
    homeOrder: 2,
  },
  "fruits-vegetables": {
    worldLabel: "Veggie Garden",
    worldTheme: "Fruits & Vegetables",
    buddyId: "mint",
    heroAccent: "leaf",
    mapPreviewStyle: "garden",
    homeMood: "garden",
    homeOrder: 3,
  },
  math: {
    worldLabel: "Math Mission",
    worldTheme: "Math Quest",
    buddyId: "plum",
    heroAccent: "blue",
    mapPreviewStyle: "ladder",
    homeMood: "arcade",
    homeOrder: 4,
  },
  "math-genius": {
    worldLabel: "Math Genius Lab",
    worldTheme: "Math Genius",
    buddyId: "soldier-sprout",
    heroAccent: "gold",
    mapPreviewStyle: "steps",
    homeMood: "arcade",
    homeOrder: 5,
  },
  "math-lessons": {
    worldLabel: "Math Academy",
    worldTheme: "Math Exercises",
    buddyId: "sky",
    heroAccent: "blue",
    mapPreviewStyle: "steps",
    homeMood: "lab",
    homeOrder: 9,
  },
  "school-things": {
    worldLabel: "School Town",
    worldTheme: "School & Things",
    buddyId: "coral",
    heroAccent: "orange",
    mapPreviewStyle: "street",
    homeMood: "adventure",
    homeOrder: 6,
  },
  "thai-exercises": {
    worldLabel: "Thai Practice Park",
    worldTheme: "Thai Exercises",
    buddyId: "coral",
    heroAccent: "orange",
    mapPreviewStyle: "trail",
    homeMood: "adventure",
    homeOrder: 10,
  },
  "science-exercises": {
    worldLabel: "Science Explorer",
    worldTheme: "Science Exercises",
    buddyId: "sky",
    heroAccent: "violet",
    mapPreviewStyle: "orbit",
    homeMood: "lab",
    homeOrder: 11,
  },
  "english-exercises": {
    worldLabel: "English Garden",
    worldTheme: "English Exercises",
    buddyId: "coral",
    heroAccent: "orange",
    mapPreviewStyle: "trail",
    homeMood: "adventure",
    homeOrder: 8,
  },
  "final-test": {
    worldLabel: "Final Test",
    worldTheme: "Cambridge World English 1",
    buddyId: "sky",
    heroAccent: "blue",
    mapPreviewStyle: "steps",
    homeMood: "lab",
    homeOrder: 13,
  },
  "thai-spelling": {
    worldLabel: "Thai Spelling Forest",
    worldTheme: "Thai Spelling",
    buddyId: "plum",
    heroAccent: "violet",
    mapPreviewStyle: "steps",
    homeMood: "arcade",
    homeOrder: 12,
  },
  "english-spelling": {
    worldLabel: "Spelling Galaxy",
    worldTheme: "English Spelling",
    buddyId: "sky",
    heroAccent: "violet",
    mapPreviewStyle: "stars",
    homeMood: "space",
    homeOrder: 7,
  },
};

function withHomeMeta(subject) {
  return {
    ...subject,
    ...HOME_SUBJECT_META[subject.id],
  };
}

export const defaultLibrary = [
  learningGamesSubject,
  animalsSubject,
  bodySubject,
  fruitsVegetablesSubject,
  mathSubject,
  mathGeniusSubject,
  mathLessonsSubject,
  schoolThingsSubject,
  thaiExercisesSubject,
  scienceExercisesSubject,
  englishExercisesSubject,
  finalTestSubject,
  thaiSpellingSubject,
  englishSpellingSubject,
].map(withHomeMeta).map(decorateSubject);

const WORDS_PER_LEVEL = 10;

export function buildSubjectLevels(subject) {
  if (subject?.levels?.length) {
    return subject.levels.map((level, index) => ({
      ...level,
      id: level.id || `${subject.id}-level-${index + 1}`,
      levelNumber: level.levelNumber || index + 1,
      label: level.label || `Level ${index + 1}`,
      wordCount:
        level.wordCount ??
        level.exercises?.length ??
        level.words?.length ??
        level.reviewWords?.length ??
        0,
    }));
  }

  const words = subject?.words ?? [];

  if (words.length === 0) {
    return [];
  }

  const levels = [];
  const levelCount = Math.ceil(words.length / WORDS_PER_LEVEL);

  for (let index = 0; index < levelCount; index += 1) {
    const startIndex = index * WORDS_PER_LEVEL;
    const levelWords = words.slice(startIndex, startIndex + WORDS_PER_LEVEL);

    levels.push({
      id: `${subject.id}-level-${index + 1}`,
      levelNumber: index + 1,
      label: `Level ${index + 1}`,
      words: levelWords,
      wordCount: levelWords.length,
    });
  }

  return levels;
}

export function buildLevels(library) {
  return library.flatMap((subject) =>
    subject.words.map((word, index) => ({
      ...word,
      subjectDescription: subject.description,
      subjectIcon: subject.icon,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectWordIndex: index + 1,
    })),
  );
}

export function createSubjectId(name) {
  return `subject-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
}

export function createWordId(word) {
  return `word-${word.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
}

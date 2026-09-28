/**
 * Canonical catalogue for the observable game surface of every mission.
 *
 * `mode` remains the answer/validation implementation. `surfaceId` describes
 * what the learner actually sees and does, so a level cannot evade the
 * curriculum uniqueness contract by changing a label only.
 */

const single = (key, rendererKey, surfaceVariant, answerRepresentation, mode = "") => ({
  key,
  rendererKey,
  surfaceVariant,
  answerRepresentation,
  kind: "single-skill",
  ...(mode ? { mode } : {}),
});

const review = (key, rendererKey = "MixedReviewBoard", surfaceVariant = "mixed-review") => ({
  key,
  rendererKey,
  surfaceVariant,
  answerRepresentation: "mixed-specialized",
  kind: "composite-review",
});

const surfaceRosters = {
  "learning-games": [
    single("word-fishing", "WordFishingGame", "picture-word", "visible-word", "word-fishing"),
    single("zombie-word-munch", "ZombieWordMunchGame", "picture-word", "visible-word", "zombie-word-munch"),
    single("number-blaster", "NumberBlasterGame", "equation-number", "visible-number", "number-blaster"),
    single("sound-bubble-pop", "SoundBubblePopGame", "audio-picture-word", "visible-word", "sound-bubble-pop"),
    single("shape-shield", "ShapeShieldGame", "shape-symbol", "visible-shape", "shape-shield"),
    single("memory-match", "MemoryMatchGame", "hidden-pairs", "hidden-memory", "memory-match"),
    single("pattern-pop", "PatternPopGame", "sequence-choice", "visible-word", "pattern-pop"),
    single("treasure-sort", "TreasureSortGame", "basket-sort", "visible-word", "treasure-sort"),
    single("sound-safari", "SoundSafariGame", "audio-picture", "visible-word", "sound-safari"),
    single("word-rocket", "WordRocketGame", "letter-sequence", "visible-letter", "word-rocket"),
  ],
  animals: [
    single("picture-find", "PicturePickBoard", "picture-word", "visible-word", "picture-pick"),
    single("listen-tap", "SoundPickBoard", "audio-picture", "visible-word", "sound-pick"),
    single("match-compare", "MatchCompareBoard", "word-picture-compare", "visible-word"),
    single("sort-group", "SortGroupBoard", "category-baskets", "visible-word", "sort-two-baskets"),
    review("mixed-review"),
  ],
  body: [
    single("body-picture-find", "PicturePickBoard", "body-part-picture", "visible-word", "picture-pick"),
    single("body-listen-tap", "SoundPickBoard", "body-part-audio", "visible-word", "sound-pick"),
    single("body-match-compare", "MatchCompareBoard", "face-versus-limb", "visible-word"),
    single("body-sort-group", "SortGroupBoard", "body-groups", "visible-word", "sort-two-baskets"),
    single("place-on-body", "BodyHotspotBoard", "body-map", "hotspot-label", "hotspot-place"),
    review("mixed-review"),
  ],
  "fruits-vegetables": [
    single("picture-find", "PicturePickBoard", "food-picture-word", "visible-word", "picture-pick"),
    single("listen-tap", "SoundPickBoard", "food-audio-picture", "visible-word", "sound-pick"),
    single("match-compare", "MatchCompareBoard", "food-word-picture", "visible-word"),
    single("sort-group", "SortGroupBoard", "culinary-baskets", "visible-word", "sort-two-baskets"),
    review("mixed-review"),
  ],
  "school-things": [
    single("picture-find", "PicturePickBoard", "school-picture-word", "visible-word", "picture-pick"),
    single("listen-tap", "SoundPickBoard", "school-audio-picture", "visible-word", "sound-pick"),
    single("match-compare", "MatchCompareBoard", "school-word-picture", "visible-word"),
    single("sort-group", "SortGroupBoard", "school-category-baskets", "visible-word", "sort-two-baskets"),
    review("mixed-review"),
  ],
  "science-exercises": [
    single("sense-match", "ScienceSenseBoard", "sense-function-picture", "visible-word"),
    single("living-things", "LivingThingsBoard", "living-classification", "visible-word"),
    single("living-sort", "LivingSortBoard", "living-nonliving-baskets", "visible-word", "sort-two-baskets"),
    single("animal-homes", "AnimalHomesBoard", "habitat-baskets", "visible-word"),
    single("plant-parts", "PlantPartsBoard", "plant-diagram", "visible-word"),
    review("science-review", "ScienceReviewBoard", "mixed-science-review"),
  ],
  "english-exercises": [
    single("body-picture", "EnglishPictureBoard", "body-picture-word", "visible-word", "picture-pick"),
    single("body-listen", "EnglishListenBoard", "body-audio-picture", "visible-word", "sound-pick"),
    single("school-match", "EnglishMatchBoard", "school-word-picture", "visible-word", "word-to-picture"),
    single("color-grammar", "ColorGrammarBoard", "color-swatch-choice", "visible-color"),
    single("toy-box", "ToyBoxBoard", "toy-collection-choice", "visible-word"),
    single("foods-drinks", "FoodsDrinksBoard", "food-drink-choice", "visible-word"),
    single("greetings-flags", "GreetingsFlagsBoard", "greeting-context-choice", "visible-word"),
    review("workbook-review", "EnglishWorkbookReviewBoard", "english-review"),
    single("pronoun-heroes", "PronounHeroesBoard", "pronoun-scene", "visible-pronoun"),
    single("plural-power", "PluralPowerBoard", "singular-plural-scene", "visible-plural"),
    single("position-quest", "PositionQuestBoard", "spatial-scene", "visible-position"),
  ],
  "final-test": [
    review("unit-1-final-test", "FinalTestBoard", "final-test-unit-1"),
    review("unit-2-final-test", "FinalTestBoard", "final-test-unit-2"),
    review("unit-3-final-test", "FinalTestBoard", "final-test-unit-3"),
    review("unit-4-final-test", "FinalTestBoard", "final-test-unit-4"),
  ],
  "thai-exercises": [
    single("spelling-order", "SpellingOrderBoard", "full-token-order", "visible-token", "spelling-order"),
    single("token-bank", "LimitedTokenBankBoard", "limited-distractor-bank", "visible-token", "token-bank-limited"),
    single("missing-character", "MissingLetterBoard", "single-character-gap", "visible-character", "missing-letter"),
    single("sound-word-choice", "SoundWordChoiceBoard", "audio-first-word-choice", "visible-word", "sound-to-word-choice"),
    single("tricky-word", "TrickyWordBoard", "near-spelling-compare", "visible-word", "tricky-word-pick"),
  ],
  "thai-spelling": [
    single("spelling-order", "SpellingOrderBoard", "full-token-order", "visible-token", "spelling-order"),
    single("token-bank", "LimitedTokenBankBoard", "limited-distractor-bank", "visible-token", "token-bank-limited"),
    single("word-repair", "WordRepairBoard", "damaged-token-repair", "visible-token", "word-repair"),
    single("missing-character", "MissingLetterBoard", "single-character-gap", "visible-character", "missing-letter"),
    single("sound-word-choice", "SoundWordChoiceBoard", "audio-first-word-choice", "visible-word", "sound-to-word-choice"),
    single("tricky-word", "TrickyWordBoard", "near-spelling-compare", "visible-word", "tricky-word-pick"),
  ],
  "english-spelling": [
    single("learn-write-speak", "CommunicationFlowBoard", "learn-write-speak", "meaning-ipa-audio", "learn-write-speak"),
    single("token-bank", "LimitedTokenBankBoard", "limited-distractor-bank", "visible-token", "token-bank-limited"),
    single("missing-letter", "MissingLetterBoard", "single-letter-gap", "visible-letter", "missing-letter"),
    single("sound-word-choice", "SoundWordChoiceBoard", "audio-first-word-choice", "visible-word", "sound-to-word-choice"),
    single("tricky-word", "TrickyWordBoard", "near-spelling-compare", "visible-word", "tricky-word-pick"),
    single("write-from-memory", "WriteFromMemoryBoard", "picture-audio-text-input", "typed-word", "write-from-memory"),
    single("word-repair", "WordRepairBoard", "damaged-token-repair", "visible-token", "word-repair"),
    single("spelling-sprint", "SpellingSprintBoard", "round-rail-text-input", "typed-word", "spelling-sprint"),
  ],
  math: [
    single("count", "MathCountBoard", "single-group-count", "visible-number", "math-count"),
    single("count-more", "MathCountBoard", "larger-group-count", "visible-number", "math-count"),
    single("add", "MathEquationBoard", "addition-groups", "visible-number", "math-count"),
    single("take-away", "MathTakeAwayBoard", "marked-removal-scene", "visible-number", "math-count"),
    review("mixed-math", "MathMixedReviewBoard", "mixed-equation-review"),
  ],
  "math-lessons": [
    single("number-basics", "MathLessonCountBoard", "number-range-0-5", "visible-number"),
    single("number-range-6-10", "MathLessonCountBoard", "number-range-6-10", "visible-number"),
    single("parity", "MathLessonParityBoard", "even-odd-representation", "visible-number"),
    single("comparison", "MathLessonCompareBoard", "comparison-sign", "visible-sign"),
    single("addition", "MathLessonAdditionBoard", "addition-equation", "visible-number"),
    single("subtraction", "MathLessonSubtractionBoard", "subtraction-equation", "visible-number"),
    single("number-range-11-50", "MathLessonCountBoard", "number-range-11-50", "visible-number"),
    single("two-digit-operations", "MathLessonTwoDigitBoard", "two-digit-equation", "visible-number"),
    single("place-value", "MathLessonPlaceValueBoard", "tens-and-ones", "visible-number"),
    single("geometry", "MathLessonShapeBoard", "shape-symbol", "visible-shape"),
  ],
};

const trackSurfaceRosters = {
  "math-genius:column": [
    single("column-add-ones", "ColumnAddOnesBoard", "ones-first-mixed-regrouping", "visible-number"),
    single("column-add-two-digit", "ColumnAddTwoDigitBoard", "two-digit-carry", "visible-number"),
    single("column-subtract", "ColumnSubtractBoard", "borrow-from-tens", "visible-number"),
    single("column-regroup-add", "ColumnRegroupBoard", "carry-to-tens", "visible-number"),
    review("column-mixed", "ColumnMixedReviewBoard", "borrow-and-carry-review"),
  ],
  "math-genius:story": [
    single("story-daily-total", "DailyTotalStoryBoard", "daily-total", "visible-number"),
    single("story-add", "AdditionStoryBoard", "addition-story", "visible-number"),
    single("story-subtract", "SubtractionStoryBoard", "subtraction-story", "visible-number"),
    single("story-operator", "StoryOperatorBoard", "operator-story", "visible-operator"),
    single("story-chain", "StoryChainBoard", "equation-chain", "visible-number"),
  ],
};

function getRosterKey(subjectId, trackId = "") {
  return trackId ? `${subjectId}:${trackId}` : subjectId;
}

export function getSurfaceRoster(subjectId, trackId = "") {
  return trackSurfaceRosters[getRosterKey(subjectId, trackId)] || surfaceRosters[subjectId] || [];
}

export function getSurfaceDefinition(subjectId, levelNumber, { trackId = "" } = {}) {
  const roster = getSurfaceRoster(subjectId, trackId);
  const definition = roster[Math.max(0, Number(levelNumber || 1) - 1)];

  if (!definition) {
    return null;
  }

  return {
    ...definition,
    surfaceId: `${getRosterKey(subjectId, trackId)}:${definition.key}`,
  };
}

export function decorateChallenge(challenge, surface) {
  if (!challenge || !surface) {
    return challenge;
  }

  return {
    ...challenge,
    surfaceId: surface.surfaceId,
    surfaceKind: surface.kind,
    surfaceVariant: surface.surfaceVariant,
    rendererKey: surface.rendererKey,
    answerRepresentation: surface.answerRepresentation,
  };
}

export function decorateLevel(level, subjectId, trackId = "") {
  if (!level) {
    return level;
  }

  const surface = getSurfaceDefinition(subjectId, level.levelNumber, { trackId });
  if (!surface) {
    return level;
  }

  return {
    ...level,
    surfaceId: surface.surfaceId,
    surfaceKind: surface.kind,
    surfaceVariant: surface.surfaceVariant,
    rendererKey: surface.rendererKey,
    answerRepresentation: surface.answerRepresentation,
    ...(surface.mode ? { canonicalMode: surface.mode } : {}),
    exercises: Array.isArray(level.exercises)
      ? level.exercises.map((challenge) => decorateChallenge(challenge, surface))
      : level.exercises,
  };
}

export function decorateSubject(subject) {
  if (!subject) {
    return subject;
  }

  const tracks = Array.isArray(subject.tracks)
    ? subject.tracks.map((track) => ({
        ...track,
        levels: (track.levels || []).map((level) =>
          decorateLevel(level, subject.id, track.id),
        ),
      }))
    : subject.tracks;
  const levels = Array.isArray(tracks)
    ? tracks.flatMap((track) => track.levels || [])
    : (subject.levels || []).map((level) =>
        decorateLevel(level, subject.id, level.trackId || ""),
      );

  return {
    ...subject,
    ...(tracks ? { tracks } : {}),
    levels,
  };
}

export function getSurfaceCatalog() {
  return Object.entries({ ...surfaceRosters, ...trackSurfaceRosters }).flatMap(
    ([scope, roster]) =>
      roster.map((surface) => ({
        ...surface,
        scope,
        surfaceId: `${scope}:${surface.key}`,
      })),
  );
}

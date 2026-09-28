function shuffle(items) {
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

export function createLookup(words) {
  return new Map(words.map((word) => [word.id, word]));
}

export function pickWords(lookup, ids) {
  return ids.map((id) => lookup.get(id)).filter(Boolean);
}

function buildChoiceWords(correctWord, candidateWords, size = 4) {
  const pool = candidateWords.filter((word) => word.id !== correctWord.id);
  const distractors = shuffle(pool).slice(0, Math.max(0, size - 1));

  return shuffle([correctWord, ...distractors]);
}

function createChoiceChallenge(
  id,
  mode,
  correctWord,
  candidateWords,
  {
    promptText,
    promptTh = "",
    eyebrow,
    listenText,
    showPromptWord = true,
    size = 4,
    randomizableTarget = true,
  } = {},
) {
  return {
    id,
    mode,
    type: "vocab-play",
    correctChoiceId: correctWord.id,
    promptWord: correctWord.word,
    promptTranslation: correctWord.translation,
    promptText,
    promptTh,
    eyebrow,
    listenText: listenText || correctWord.word,
    showPromptWord,
    randomizableTarget,
    choices: buildChoiceWords(correctWord, candidateWords, size),
    reviewWord: correctWord,
  };
}

export function createPicturePickChallenge(id, correctWord, candidateWords, options = {}) {
  return createChoiceChallenge(id, "picture-pick", correctWord, candidateWords, {
    promptText: options.promptText || `Find ${correctWord.word}.`,
    promptTh: options.promptTh || "",
    eyebrow: options.eyebrow || "Picture",
    showPromptWord: true,
    ...options,
    randomizableTarget: options.randomizableTarget ?? !options.promptText,
  });
}

export function createSoundPickChallenge(id, correctWord, candidateWords, options = {}) {
  return createChoiceChallenge(id, "sound-pick", correctWord, candidateWords, {
    promptText: options.promptText || "Listen and tap the right picture.",
    promptTh: options.promptTh || "",
    eyebrow: options.eyebrow || "Listen",
    listenText: options.listenText || correctWord.word,
    showPromptWord: false,
    ...options,
    randomizableTarget: options.randomizableTarget ?? !options.promptText,
  });
}

export function createWordToPictureChallenge(id, correctWord, candidateWords, options = {}) {
  return createChoiceChallenge(id, "word-to-picture", correctWord, candidateWords, {
    promptText: options.promptText || `Match the word ${correctWord.word}.`,
    promptTh: options.promptTh || "",
    eyebrow: options.eyebrow || "Match",
    showPromptWord: true,
    ...options,
    randomizableTarget: options.randomizableTarget ?? !options.promptText,
  });
}

export function createOddOneOutChallenge(
  id,
  groupWords,
  oddWord,
  {
    promptText = "Which one does not belong?",
    promptTh = "",
    eyebrow = "Compare",
  } = {},
) {
  return {
    id,
    mode: "odd-one-out",
    type: "vocab-play",
    correctChoiceId: oddWord.id,
    promptText,
    promptTh,
    eyebrow,
    choices: shuffle([...groupWords, oddWord]),
    oddWord,
    groupWords,
    randomizableTarget: false,
    reviewWord: oddWord,
  };
}

export function createSortTwoBasketsChallenge(
  id,
  {
    leftBasket,
    rightBasket,
    leftWords,
    rightWords,
    promptText = "Sort the words into the right groups.",
    promptTh = "",
    eyebrow = "Sort",
  },
) {
  return {
    id,
    mode: "sort-two-baskets",
    type: "vocab-play",
    promptText,
    promptTh,
    eyebrow,
    baskets: [leftBasket, rightBasket],
    items: shuffle([
      ...leftWords.map((word) => ({ ...word, basketId: leftBasket.id })),
      ...rightWords.map((word) => ({ ...word, basketId: rightBasket.id })),
    ]),
    reviewWord: leftWords[0] || rightWords[0] || null,
  };
}

export function createHotspotPlaceChallenge(
  id,
  {
    targetWord,
    hotspotWords,
    hotspotMap,
    promptText = "Tap the correct place on the body.",
    promptTh = "",
    eyebrow = "Place",
    image,
  },
) {
  return {
    id,
    mode: "hotspot-place",
    type: "vocab-play",
    promptText,
    promptTh,
    eyebrow,
    promptWord: targetWord.word,
    promptTranslation: targetWord.translation,
    bodyImage: image,
    targetHotspotId: targetWord.id,
    hotspots: hotspotWords
      .map((word) => {
        const position = hotspotMap[word.id];

        if (!position) {
          return null;
        }

        return {
          id: word.id,
          word,
          x: position.x,
          y: position.y,
        };
      })
      .filter(Boolean),
    reviewWord: targetWord,
  };
}

export function createVocabularyLevel({
  subjectId,
  levelNumber,
  themeLabel,
  difficultyStage,
  supportProfile,
  exercises,
  reviewWords,
  mapCaption,
}) {
  return {
    id: `${subjectId}-level-${levelNumber}`,
    levelNumber,
    label: `Level ${levelNumber}`,
    themeLabel,
    difficultyStage,
    supportProfile,
    exercises,
    reviewWords,
    wordCount: exercises.length,
    mapCaption: mapCaption || themeLabel,
  };
}

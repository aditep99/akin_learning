import { animalsSubject } from "./animals.js";
import { bodySubject } from "./body.js";
import { fruitsVegetablesSubject } from "./fruitsVegetables.js";
import { schoolThingsSubject } from "./schoolThings.js";
import { createVisualWord } from "./exerciseVisuals.js";
import { sciencePhotoAssetsByWordId } from "./sciencePhotoAssets.js";
import {
  createLookup,
  createOddOneOutChallenge,
  createPicturePickChallenge,
  createSortTwoBasketsChallenge,
  createSoundPickChallenge,
  createVocabularyLevel,
  pickWords,
} from "./vocabularyPlay.js";

function collectLevelWords(levels) {
  const seenIds = new Set();

  return levels.flatMap((level) =>
    (level.reviewWords || []).filter((word) => {
      if (!word?.id || seenIds.has(word.id)) {
        return false;
      }

      seenIds.add(word.id);
      return true;
    }),
  );
}

const scienceAnimalWords = animalsSubject.words.map((word) => {
  const photo = sciencePhotoAssetsByWordId[word.id];

  return photo
    ? {
        ...word,
        image: photo.src,
        sciencePhotoAssetId: photo.assetId,
      }
    : word;
});
const animalLookup = createLookup(scienceAnimalWords);
const bodyLookup = createLookup(bodySubject.words);
const fruitLookup = createLookup(fruitsVegetablesSubject.words);
const schoolLookup = createLookup(schoolThingsSubject.words);
const plantPartWords = [
  createVisualWord({
    id: "plant-root",
    word: "Root",
    translation: "ราก",
    phonics: "รูท",
    image: sciencePhotoAssetsByWordId["plant-root"].src,
    sciencePhotoAssetId: sciencePhotoAssetsByWordId["plant-root"].assetId,
    emoji: "🌱",
  }),
  createVisualWord({
    id: "plant-stem",
    word: "Stem",
    translation: "ลำต้น",
    phonics: "สเต็ม",
    image: sciencePhotoAssetsByWordId["plant-stem"].src,
    sciencePhotoAssetId: sciencePhotoAssetsByWordId["plant-stem"].assetId,
    emoji: "🌿",
  }),
  createVisualWord({
    id: "plant-leaf",
    word: "Leaf",
    translation: "ใบ",
    phonics: "ลีฟ",
    image: sciencePhotoAssetsByWordId["plant-leaf"].src,
    sciencePhotoAssetId: sciencePhotoAssetsByWordId["plant-leaf"].assetId,
    emoji: "🍃",
  }),
  createVisualWord({
    id: "plant-flower",
    word: "Flower",
    translation: "ดอก",
    phonics: "ฟลาวเออร์",
    image: sciencePhotoAssetsByWordId["plant-flower"].src,
    sciencePhotoAssetId: sciencePhotoAssetsByWordId["plant-flower"].assetId,
    emoji: "🌸",
  }),
  createVisualWord({
    id: "plant-fruit",
    word: "Fruit",
    translation: "ผล",
    phonics: "ฟรุต",
    image: sciencePhotoAssetsByWordId["plant-fruit"].src,
    sciencePhotoAssetId: sciencePhotoAssetsByWordId["plant-fruit"].assetId,
    emoji: "🍎",
  }),
];
const plantPartLookup = createLookup(plantPartWords);

const scienceExerciseLevels = [
  createVocabularyLevel({
    subjectId: "science-exercises",
    levelNumber: 1,
    themeLabel: "Five Senses",
    difficultyStage: 1,
    supportProfile: "picture + question",
    reviewWords: pickWords(bodyLookup, ["eye", "ear", "nose", "tongue", "skin"]),
    mapCaption: "Five senses",
    exercises: [
      createPicturePickChallenge("science-ex-l1-1", bodyLookup.get("eye"), pickWords(bodyLookup, ["eye", "ear", "mouth", "nose"]), {
        promptText: "Which body part helps you see?",
      }),
      createPicturePickChallenge("science-ex-l1-2", bodyLookup.get("ear"), pickWords(bodyLookup, ["ear", "eye", "nose", "mouth"]), {
        promptText: "Which body part helps you hear?",
      }),
      createPicturePickChallenge("science-ex-l1-3", bodyLookup.get("nose"), pickWords(bodyLookup, ["nose", "mouth", "ear", "eye"]), {
        promptText: "Which body part helps you smell?",
      }),
      createPicturePickChallenge("science-ex-l1-4", bodyLookup.get("tongue"), pickWords(bodyLookup, ["tongue", "mouth", "nose", "ear"]), {
        promptText: "Which body part helps you taste?",
      }),
      createPicturePickChallenge("science-ex-l1-5", bodyLookup.get("skin"), pickWords(bodyLookup, ["skin", "hand", "arm", "leg"]), {
        promptText: "Which body part helps you touch and feel?",
      }),
    ],
  }),
  createVocabularyLevel({
    subjectId: "science-exercises",
    levelNumber: 2,
    themeLabel: "Living Things",
    difficultyStage: 2,
    supportProfile: "picture + sound",
    reviewWords: [
      ...pickWords(animalLookup, ["cat", "dog", "bird", "duck"]),
      ...pickWords(schoolLookup, ["book", "chair", "bag"]),
    ],
    mapCaption: "Living things",
    exercises: [
      createOddOneOutChallenge("science-ex-l2-1", pickWords(animalLookup, ["cat", "dog", "bird"]), schoolLookup.get("book"), {
        promptText: "Which one is not a living thing?",
      }),
      createOddOneOutChallenge("science-ex-l2-2", pickWords(schoolLookup, ["chair", "bag", "book"]), animalLookup.get("dog"), {
        promptText: "Which one is a living thing?",
      }),
      createSoundPickChallenge("science-ex-l2-3", animalLookup.get("bird"), pickWords(animalLookup, ["bird", "fish", "duck", "frog"]), {
        promptText: "Listen and tap the living thing.",
      }),
      createSoundPickChallenge("science-ex-l2-4", animalLookup.get("cat"), [
        animalLookup.get("cat"),
        schoolLookup.get("chair"),
        schoolLookup.get("book"),
        schoolLookup.get("bag"),
      ].filter(Boolean), {
        promptText: "Listen and tap the living thing.",
      }),
    ],
  }),
  createVocabularyLevel({
    subjectId: "science-exercises",
    levelNumber: 3,
    themeLabel: "Sort Living and Non-living",
    difficultyStage: 3,
    supportProfile: "sorting",
    reviewWords: [
      ...pickWords(animalLookup, ["fish", "cow", "rabbit"]),
      ...pickWords(schoolLookup, ["desk", "chair", "book"]),
    ],
    mapCaption: "Sort",
    exercises: [
      createSortTwoBasketsChallenge("science-ex-l3-1", {
        leftBasket: { id: "living", label: "Living" },
        rightBasket: { id: "nonliving", label: "Non-living" },
        leftWords: pickWords(animalLookup, ["fish", "cow", "rabbit"]),
        rightWords: pickWords(schoolLookup, ["desk", "chair", "book"]),
        promptText: "Sort the pictures into living and non-living things.",
      }),
      createSortTwoBasketsChallenge("science-ex-l3-2", {
        leftBasket: { id: "animals", label: "Animals" },
        rightBasket: { id: "foods-from-plants", label: "Foods from plants" },
        leftWords: pickWords(animalLookup, ["cat", "duck", "horse"]),
        rightWords: pickWords(fruitLookup, ["apple", "banana", "broccoli"]),
        promptText: "Sort the pictures into animals and foods that come from plants.",
      }),
    ],
  }),
  createVocabularyLevel({
    subjectId: "science-exercises",
    levelNumber: 4,
    themeLabel: "Animal Homes",
    difficultyStage: 4,
    supportProfile: "grouping",
    reviewWords: pickWords(animalLookup, ["fish", "whale", "dolphin", "lion", "horse", "pig"]),
    mapCaption: "Animal homes",
    exercises: [
      createSortTwoBasketsChallenge("science-ex-l4-1", {
        leftBasket: { id: "water", label: "Usually lives in water" },
        rightBasket: { id: "land", label: "Usually lives on land" },
        leftWords: pickWords(animalLookup, ["fish", "whale", "dolphin"]),
        rightWords: pickWords(animalLookup, ["lion", "horse", "pig"]),
        promptText: "Sort the animals by where they usually live.",
      }),
      createOddOneOutChallenge("science-ex-l4-2", pickWords(animalLookup, ["fish", "whale", "dolphin"]), animalLookup.get("lion"), {
        promptText: "Which animal usually lives on land?",
      }),
      createOddOneOutChallenge("science-ex-l4-3", pickWords(animalLookup, ["lion", "horse", "pig"]), animalLookup.get("fish"), {
        promptText: "Which animal does not belong in the land group?",
      }),
    ],
  }),
  createVocabularyLevel({
    subjectId: "science-exercises",
    levelNumber: 5,
    themeLabel: "Parts of a Plant",
    difficultyStage: 4,
    supportProfile: "plant diagram + picture",
    reviewWords: plantPartWords,
    mapCaption: "Plant parts",
    exercises: [
      createPicturePickChallenge(
        "science-ex-l5-1",
        plantPartLookup.get("plant-root"),
        plantPartWords,
        { promptText: "Which part takes in water from the soil?" },
      ),
      createPicturePickChallenge(
        "science-ex-l5-2",
        plantPartLookup.get("plant-stem"),
        plantPartWords,
        { promptText: "Which part holds the plant upright?" },
      ),
      createPicturePickChallenge(
        "science-ex-l5-3",
        plantPartLookup.get("plant-leaf"),
        plantPartWords,
        { promptText: "Which part uses sunlight to make food?" },
      ),
      createPicturePickChallenge(
        "science-ex-l5-4",
        plantPartLookup.get("plant-flower"),
        plantPartWords,
        { promptText: "Which colorful part can make seeds?" },
      ),
      createPicturePickChallenge(
        "science-ex-l5-5",
        plantPartLookup.get("plant-fruit"),
        plantPartWords,
        { promptText: "Which part protects the seeds?" },
      ),
    ],
  }),
  createVocabularyLevel({
    subjectId: "science-exercises",
    levelNumber: 6,
    themeLabel: "Science Review",
    difficultyStage: 5,
    supportProfile: "mixed support",
    reviewWords: [
      ...pickWords(bodyLookup, ["eye", "hand"]),
      ...pickWords(animalLookup, ["fish", "bird"]),
      ...pickWords(fruitLookup, ["apple", "carrot"]),
    ],
    mapCaption: "Review",
    exercises: [
      createPicturePickChallenge("science-ex-l6-1", bodyLookup.get("hand"), pickWords(bodyLookup, ["hand", "arm", "leg", "foot"]), {
        promptText: "Tap the body part used for holding.",
      }),
      createOddOneOutChallenge("science-ex-l6-2", pickWords(fruitLookup, ["apple", "banana", "carrot"]), schoolLookup.get("chair"), {
        promptText: "Which one is a classroom object?",
      }),
      createSoundPickChallenge("science-ex-l6-3", animalLookup.get("fish"), pickWords(animalLookup, ["fish", "bird", "frog", "duck"]), {
        promptText: "Listen and tap the animal.",
      }),
      createSortTwoBasketsChallenge("science-ex-l6-4", {
        leftBasket: { id: "body", label: "Body" },
        rightBasket: { id: "animal", label: "Animal" },
        leftWords: pickWords(bodyLookup, ["hand", "leg", "ear"]),
        rightWords: pickWords(animalLookup, ["bird", "fish", "cow"]),
        promptText: "Sort the pictures into body parts and animals.",
      }),
    ],
  }),
];

export const scienceExercisesSubject = {
  id: "science-exercises",
  name: "Science Exercises",
  category: "exercise",
  icon: "🔬",
  description: "Five senses, plant parts, living things, sorting, and science review.",
  words: collectLevelWords(scienceExerciseLevels),
  levels: scienceExerciseLevels,
};

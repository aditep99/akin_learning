import bodySummaryFigure from "../assets/characters/akin-body-learning-transparent.png";
import { animalsSubject } from "./subjects/animals.js";
import { bodyHotspotMap } from "./subjects/bodyHotspots.js";
import { bodySubject } from "./subjects/body.js";
import { fruitsVegetablesSubject } from "./subjects/fruitsVegetables.js";
import { mathSubject } from "./subjects/math.js";
import { schoolThingsSubject } from "./subjects/schoolThings.js";
import {
  createLookup,
  createOddOneOutChallenge,
  createPicturePickChallenge,
  createSortTwoBasketsChallenge,
  createSoundPickChallenge,
  createVocabularyLevel,
  createWordToPictureChallenge,
  createHotspotPlaceChallenge,
  pickWords,
} from "./subjects/vocabularyPlay.js";

function applyAnimalsLevels() {
  const lookup = createLookup(animalsSubject.words);

  animalsSubject.icon = "🦁";
  animalsSubject.levels = [
    createVocabularyLevel({
      subjectId: animalsSubject.id,
      levelNumber: 1,
      themeLabel: "Picture Find",
      difficultyStage: 1,
      supportProfile: "picture + word + sound",
      reviewWords: pickWords(lookup, ["cat", "dog", "bird", "fish", "cow", "lion"]),
      mapCaption: "Picture find",
      exercises: [
        createPicturePickChallenge("animals-l1-1", lookup.get("cat"), pickWords(lookup, ["cat", "dog", "bird", "fish"])),
        createPicturePickChallenge("animals-l1-2", lookup.get("dog"), pickWords(lookup, ["dog", "cat", "cow", "pig"])),
        createPicturePickChallenge("animals-l1-3", lookup.get("bird"), pickWords(lookup, ["bird", "duck", "fish", "rabbit"])),
        createPicturePickChallenge("animals-l1-4", lookup.get("fish"), pickWords(lookup, ["fish", "bird", "cow", "cat"])),
        createPicturePickChallenge("animals-l1-5", lookup.get("cow"), pickWords(lookup, ["cow", "sheep", "goat", "horse"])),
        createPicturePickChallenge("animals-l1-6", lookup.get("lion"), pickWords(lookup, ["lion", "tiger", "bear", "monkey"])),
      ],
    }),
    createVocabularyLevel({
      subjectId: animalsSubject.id,
      levelNumber: 2,
      themeLabel: "Listen and Tap",
      difficultyStage: 2,
      supportProfile: "picture + sound",
      reviewWords: pickWords(lookup, ["rabbit", "monkey", "duck", "elephant", "tiger", "bear"]),
      mapCaption: "Listen and tap",
      exercises: [
        createSoundPickChallenge("animals-l2-1", lookup.get("rabbit"), pickWords(lookup, ["rabbit", "cat", "dog", "bird"])),
        createSoundPickChallenge("animals-l2-2", lookup.get("monkey"), pickWords(lookup, ["monkey", "lion", "bear", "fish"])),
        createSoundPickChallenge("animals-l2-3", lookup.get("duck"), pickWords(lookup, ["duck", "bird", "cow", "goat"])),
        createSoundPickChallenge("animals-l2-4", lookup.get("elephant"), pickWords(lookup, ["elephant", "horse", "cow", "pig"])),
        createSoundPickChallenge("animals-l2-5", lookup.get("tiger"), pickWords(lookup, ["tiger", "lion", "bear", "sheep"])),
        createSoundPickChallenge("animals-l2-6", lookup.get("bear"), pickWords(lookup, ["bear", "monkey", "dog", "cat"])),
      ],
    }),
    createVocabularyLevel({
      subjectId: animalsSubject.id,
      levelNumber: 3,
      themeLabel: "Match and Compare",
      difficultyStage: 3,
      supportProfile: "word + picture",
      reviewWords: pickWords(lookup, ["horse", "sheep", "pig", "goat", "hen", "rooster"]),
      mapCaption: "Match and compare",
      exercises: [
        createWordToPictureChallenge("animals-l3-1", lookup.get("horse"), pickWords(lookup, ["horse", "cow", "sheep", "goat"])),
        createWordToPictureChallenge("animals-l3-2", lookup.get("sheep"), pickWords(lookup, ["sheep", "goat", "cow", "pig"])),
        createOddOneOutChallenge("animals-l3-3", pickWords(lookup, ["cow", "sheep", "goat"]), lookup.get("lion"), {
          promptText: "Which animal is not from the farm group?",
        }),
        createWordToPictureChallenge("animals-l3-4", lookup.get("pig"), pickWords(lookup, ["pig", "hen", "rooster", "duck"])),
        createOddOneOutChallenge("animals-l3-5", pickWords(lookup, ["lion", "tiger", "bear"]), lookup.get("cow"), {
          promptText: "Which animal is usually raised on a farm?",
        }),
        createWordToPictureChallenge("animals-l3-6", lookup.get("rooster"), pickWords(lookup, ["rooster", "hen", "duck", "bird"])),
      ],
    }),
    createVocabularyLevel({
      subjectId: animalsSubject.id,
      levelNumber: 4,
      themeLabel: "Sort and Group",
      difficultyStage: 4,
      supportProfile: "picture only",
      reviewWords: pickWords(lookup, ["cow", "goat", "pig", "lion", "tiger", "monkey", "eagle", "parrot", "bat"]),
      mapCaption: "Sort groups",
      exercises: [
        createSortTwoBasketsChallenge("animals-l4-1", {
          leftBasket: { id: "farm", label: "Farm" },
          rightBasket: { id: "wild", label: "Wild" },
          leftWords: pickWords(lookup, ["cow", "goat", "pig"]),
          rightWords: pickWords(lookup, ["lion", "tiger", "monkey"]),
        }),
        createSortTwoBasketsChallenge("animals-l4-2", {
          leftBasket: { id: "can-fly", label: "Can fly" },
          rightBasket: { id: "cannot-fly", label: "Cannot fly" },
          leftWords: pickWords(lookup, ["eagle", "parrot", "bat"]),
          rightWords: pickWords(lookup, ["cat", "rabbit", "sheep"]),
          promptText: "Sort the animals by whether they can usually fly.",
        }),
        createSortTwoBasketsChallenge("animals-l4-3", {
          leftBasket: { id: "usually-larger", label: "Usually larger" },
          rightBasket: { id: "usually-smaller", label: "Usually smaller" },
          leftWords: pickWords(lookup, ["elephant", "horse", "cow"]),
          rightWords: pickWords(lookup, ["cat", "duck", "rabbit"]),
          promptText: "Sort the animals by their usual adult size.",
        }),
      ],
    }),
    createVocabularyLevel({
      subjectId: animalsSubject.id,
      levelNumber: 5,
      themeLabel: "Mixed Challenge",
      difficultyStage: 5,
      supportProfile: "mixed support",
      reviewWords: pickWords(lookup, ["snake", "frog", "elephant", "lion", "pig", "duck"]),
      mapCaption: "Mixed challenge",
      exercises: [
        createSoundPickChallenge("animals-l5-1", lookup.get("snake"), pickWords(lookup, ["snake", "frog", "fish", "bird"])),
        createWordToPictureChallenge("animals-l5-2", lookup.get("frog"), pickWords(lookup, ["frog", "duck", "rabbit", "goat"])),
        createOddOneOutChallenge("animals-l5-3", pickWords(lookup, ["pig", "cow", "goat"]), lookup.get("elephant")),
        createPicturePickChallenge("animals-l5-4", lookup.get("rooster"), pickWords(lookup, ["rooster", "hen", "duck", "bird"])),
        createSortTwoBasketsChallenge("animals-l5-5", {
          leftBasket: { id: "water", label: "Usually lives in water" },
          rightBasket: { id: "land", label: "Usually lives on land" },
          leftWords: pickWords(lookup, ["fish", "whale", "dolphin"]),
          rightWords: pickWords(lookup, ["horse", "pig", "lion"]),
          promptText: "Sort the animals by where they usually live.",
        }),
      ],
    }),
  ];
}

function applyFruitLevels() {
  const lookup = createLookup(fruitsVegetablesSubject.words);

  fruitsVegetablesSubject.levels = [
    createVocabularyLevel({
      subjectId: fruitsVegetablesSubject.id,
      levelNumber: 1,
      themeLabel: "Picture Find",
      difficultyStage: 1,
      supportProfile: "picture + word + sound",
      reviewWords: pickWords(lookup, ["apple", "banana", "orange", "carrot", "tomato", "grape"]),
      mapCaption: "Picture find",
      exercises: [
        createPicturePickChallenge("fruits-l1-1", lookup.get("apple"), pickWords(lookup, ["apple", "banana", "orange", "grape"])),
        createPicturePickChallenge("fruits-l1-2", lookup.get("banana"), pickWords(lookup, ["banana", "apple", "mango", "carrot"])),
        createPicturePickChallenge("fruits-l1-3", lookup.get("orange"), pickWords(lookup, ["orange", "lemon", "apple", "tomato"])),
        createPicturePickChallenge("fruits-l1-4", lookup.get("carrot"), pickWords(lookup, ["carrot", "broccoli", "corn", "tomato"])),
        createPicturePickChallenge("fruits-l1-5", lookup.get("tomato"), pickWords(lookup, ["tomato", "apple", "orange", "corn"])),
        createPicturePickChallenge("fruits-l1-6", lookup.get("grape"), pickWords(lookup, ["grape", "mango", "pear", "peach"])),
      ],
    }),
    createVocabularyLevel({
      subjectId: fruitsVegetablesSubject.id,
      levelNumber: 2,
      themeLabel: "Listen and Tap",
      difficultyStage: 2,
      supportProfile: "picture + sound",
      reviewWords: pickWords(lookup, ["mango", "watermelon", "corn", "broccoli", "pear", "peach"]),
      mapCaption: "Listen and tap",
      exercises: [
        createSoundPickChallenge("fruits-l2-1", lookup.get("mango"), pickWords(lookup, ["mango", "orange", "apple", "grape"])),
        createSoundPickChallenge("fruits-l2-2", lookup.get("watermelon"), pickWords(lookup, ["watermelon", "banana", "corn", "broccoli"])),
        createSoundPickChallenge("fruits-l2-3", lookup.get("corn"), pickWords(lookup, ["corn", "carrot", "tomato", "broccoli"])),
        createSoundPickChallenge("fruits-l2-4", lookup.get("broccoli"), pickWords(lookup, ["broccoli", "cucumber", "corn", "carrot"])),
        createSoundPickChallenge("fruits-l2-5", lookup.get("pear"), pickWords(lookup, ["pear", "peach", "apple", "lemon"])),
        createSoundPickChallenge("fruits-l2-6", lookup.get("peach"), pickWords(lookup, ["peach", "pear", "mango", "banana"])),
      ],
    }),
    createVocabularyLevel({
      subjectId: fruitsVegetablesSubject.id,
      levelNumber: 3,
      themeLabel: "Match and Compare",
      difficultyStage: 3,
      supportProfile: "word + picture",
      reviewWords: pickWords(lookup, ["lemon", "pineapple", "coconut", "strawberry", "blueberry", "cherry"]),
      mapCaption: "Match and compare",
      exercises: [
        createWordToPictureChallenge("fruits-l3-1", lookup.get("lemon"), pickWords(lookup, ["lemon", "orange", "apple", "pear"])),
        createWordToPictureChallenge("fruits-l3-2", lookup.get("pineapple"), pickWords(lookup, ["pineapple", "banana", "corn", "mango"])),
        createOddOneOutChallenge("fruits-l3-3", pickWords(lookup, ["carrot", "broccoli", "cabbage"]), lookup.get("strawberry"), {
          promptText: "In everyday cooking, which one is not a vegetable?",
        }),
        createWordToPictureChallenge("fruits-l3-4", lookup.get("coconut"), pickWords(lookup, ["coconut", "watermelon", "tomato", "orange"])),
        createOddOneOutChallenge("fruits-l3-5", pickWords(lookup, ["strawberry", "blueberry", "cherry"]), lookup.get("broccoli"), {
          promptText: "Which one is not from the fruit group?",
        }),
        createWordToPictureChallenge("fruits-l3-6", lookup.get("blueberry"), pickWords(lookup, ["blueberry", "grape", "cherry", "apple"])),
      ],
    }),
    createVocabularyLevel({
      subjectId: fruitsVegetablesSubject.id,
      levelNumber: 4,
      themeLabel: "Sort and Group",
      difficultyStage: 4,
      supportProfile: "picture only",
      reviewWords: pickWords(lookup, ["apple", "banana", "orange", "carrot", "broccoli", "cabbage"]),
      mapCaption: "Sort groups",
      exercises: [
        createSortTwoBasketsChallenge("fruits-l4-1", {
          leftBasket: { id: "fruit", label: "Fruit" },
          rightBasket: { id: "vegetable", label: "Vegetable" },
          leftWords: pickWords(lookup, ["apple", "banana", "orange"]),
          rightWords: pickWords(lookup, ["carrot", "broccoli", "cabbage"]),
          promptText: "Sort using the everyday cooking groups fruit and vegetable.",
        }),
        createSortTwoBasketsChallenge("fruits-l4-2", {
          leftBasket: { id: "usually-round", label: "Usually round" },
          rightBasket: { id: "usually-long", label: "Usually long" },
          leftWords: pickWords(lookup, ["apple", "orange", "tomato"]),
          rightWords: pickWords(lookup, ["banana", "carrot", "cucumber"]),
          promptText: "Sort the foods by their usual shape.",
        }),
        createSortTwoBasketsChallenge("fruits-l4-3", {
          leftBasket: { id: "fruit", label: "Fruit" },
          rightBasket: { id: "vegetable", label: "Vegetable" },
          leftWords: pickWords(lookup, ["mango", "grape", "peach"]),
          rightWords: pickWords(lookup, ["broccoli", "cabbage", "onion"]),
          promptText: "Sort using the everyday cooking groups fruit and vegetable.",
        }),
      ],
    }),
    createVocabularyLevel({
      subjectId: fruitsVegetablesSubject.id,
      levelNumber: 5,
      themeLabel: "Mixed Challenge",
      difficultyStage: 5,
      supportProfile: "mixed support",
      reviewWords: pickWords(lookup, ["strawberry", "blueberry", "avocado", "cucumber", "coconut", "pineapple"]),
      mapCaption: "Mixed challenge",
      exercises: [
        createSoundPickChallenge("fruits-l5-1", lookup.get("strawberry"), pickWords(lookup, ["strawberry", "blueberry", "cherry", "grape"])),
        createWordToPictureChallenge("fruits-l5-2", lookup.get("avocado"), pickWords(lookup, ["avocado", "cucumber", "broccoli", "pear"])),
        createOddOneOutChallenge("fruits-l5-3", pickWords(lookup, ["apple", "banana", "mango"]), lookup.get("broccoli"), {
          promptText: "Which food is a vegetable rather than a fruit?",
        }),
        createPicturePickChallenge("fruits-l5-4", lookup.get("pineapple"), pickWords(lookup, ["pineapple", "coconut", "lemon", "pear"])),
        createSortTwoBasketsChallenge("fruits-l5-5", {
          leftBasket: { id: "fruit", label: "Fruit" },
          rightBasket: { id: "vegetable", label: "Vegetable" },
          leftWords: pickWords(lookup, ["mango", "peach", "watermelon"]),
          rightWords: pickWords(lookup, ["carrot", "cucumber", "broccoli"]),
        }),
      ],
    }),
  ];
}

function applySchoolLevels() {
  const lookup = createLookup(schoolThingsSubject.words);

  schoolThingsSubject.levels = [
    createVocabularyLevel({
      subjectId: schoolThingsSubject.id,
      levelNumber: 1,
      themeLabel: "Picture Find",
      difficultyStage: 1,
      supportProfile: "picture + word + sound",
      reviewWords: pickWords(lookup, ["book", "pen", "pencil", "bag", "desk", "chair"]),
      mapCaption: "Picture find",
      exercises: [
        createPicturePickChallenge("school-l1-1", lookup.get("book"), pickWords(lookup, ["book", "notebook", "paper", "map"])),
        createPicturePickChallenge("school-l1-2", lookup.get("pen"), pickWords(lookup, ["pen", "pencil", "marker", "ruler"])),
        createPicturePickChallenge("school-l1-3", lookup.get("pencil"), pickWords(lookup, ["pencil", "pen", "crayon", "brush"])),
        createPicturePickChallenge("school-l1-4", lookup.get("bag"), pickWords(lookup, ["bag", "folder", "book", "notebook"])),
        createPicturePickChallenge("school-l1-5", lookup.get("desk"), pickWords(lookup, ["desk", "chair", "board", "map"])),
        createPicturePickChallenge("school-l1-6", lookup.get("chair"), pickWords(lookup, ["chair", "desk", "board", "map"])),
      ],
    }),
    createVocabularyLevel({
      subjectId: schoolThingsSubject.id,
      levelNumber: 2,
      themeLabel: "Listen and Tap",
      difficultyStage: 2,
      supportProfile: "picture + sound",
      reviewWords: pickWords(lookup, ["ruler", "notebook", "scissors", "crayon", "eraser", "sharpener"]),
      mapCaption: "Listen and tap",
      exercises: [
        createSoundPickChallenge("school-l2-1", lookup.get("ruler"), pickWords(lookup, ["ruler", "marker", "pen", "chalk"])),
        createSoundPickChallenge("school-l2-2", lookup.get("notebook"), pickWords(lookup, ["notebook", "book", "folder", "paper"])),
        createSoundPickChallenge("school-l2-3", lookup.get("scissors"), pickWords(lookup, ["scissors", "glue", "brush", "ruler"])),
        createSoundPickChallenge("school-l2-4", lookup.get("crayon"), pickWords(lookup, ["crayon", "marker", "brush", "pencil"])),
        createSoundPickChallenge("school-l2-5", lookup.get("eraser"), pickWords(lookup, ["eraser", "sharpener", "chalk", "glue"])),
        createSoundPickChallenge("school-l2-6", lookup.get("sharpener"), pickWords(lookup, ["sharpener", "eraser", "chalk", "scissors"])),
      ],
    }),
    createVocabularyLevel({
      subjectId: schoolThingsSubject.id,
      levelNumber: 3,
      themeLabel: "Match and Compare",
      difficultyStage: 3,
      supportProfile: "word + picture",
      reviewWords: pickWords(lookup, ["marker", "glue", "paper", "folder", "board", "chalk"]),
      mapCaption: "Match and compare",
      exercises: [
        createWordToPictureChallenge("school-l3-1", lookup.get("marker"), pickWords(lookup, ["marker", "pen", "crayon", "brush"])),
        createWordToPictureChallenge("school-l3-2", lookup.get("glue"), pickWords(lookup, ["glue", "eraser", "sharpener", "chalk"])),
        createOddOneOutChallenge("school-l3-3", pickWords(lookup, ["pen", "pencil", "marker"]), lookup.get("chair"), {
          promptText: "Which one is not a writing tool?",
        }),
        createWordToPictureChallenge("school-l3-4", lookup.get("paper"), pickWords(lookup, ["paper", "folder", "book", "board"])),
        createOddOneOutChallenge("school-l3-5", pickWords(lookup, ["desk", "chair", "board"]), lookup.get("crayon"), {
          promptText: "Which item is used for coloring?",
        }),
        createWordToPictureChallenge("school-l3-6", lookup.get("chalk"), pickWords(lookup, ["chalk", "brush", "marker", "glue"])),
      ],
    }),
    createVocabularyLevel({
      subjectId: schoolThingsSubject.id,
      levelNumber: 4,
      themeLabel: "Sort and Group",
      difficultyStage: 4,
      supportProfile: "picture only",
      reviewWords: pickWords(lookup, ["pen", "pencil", "marker", "desk", "chair", "board"]),
      mapCaption: "Sort groups",
      exercises: [
        createSortTwoBasketsChallenge("school-l4-1", {
          leftBasket: { id: "writing-tools", label: "Writing tools" },
          rightBasket: { id: "large-classroom-items", label: "Large classroom items" },
          leftWords: pickWords(lookup, ["pen", "pencil", "marker"]),
          rightWords: pickWords(lookup, ["desk", "chair", "board"]),
          promptText: "Sort writing tools and large classroom items.",
        }),
        createSortTwoBasketsChallenge("school-l4-2", {
          leftBasket: { id: "paper-items", label: "Paper items" },
          rightBasket: { id: "classroom-tools", label: "Classroom tools" },
          leftWords: pickWords(lookup, ["book", "notebook", "paper"]),
          rightWords: pickWords(lookup, ["scissors", "ruler", "calculator"]),
          promptText: "Sort paper items and classroom tools.",
        }),
        createSortTwoBasketsChallenge("school-l4-3", {
          leftBasket: { id: "art-tools", label: "Art tools" },
          rightBasket: { id: "technology", label: "Technology" },
          leftWords: pickWords(lookup, ["brush", "crayon", "paint"]),
          rightWords: pickWords(lookup, ["calculator", "computer", "tablet"]),
          promptText: "Sort art tools and technology.",
        }),
      ],
    }),
    createVocabularyLevel({
      subjectId: schoolThingsSubject.id,
      levelNumber: 5,
      themeLabel: "Mixed Challenge",
      difficultyStage: 5,
      supportProfile: "mixed support",
      reviewWords: pickWords(lookup, ["map", "folder", "board", "brush", "glue", "marker"]),
      mapCaption: "Mixed challenge",
      exercises: [
        createSoundPickChallenge("school-l5-1", lookup.get("map"), pickWords(lookup, ["map", "board", "book", "paper"])),
        createWordToPictureChallenge("school-l5-2", lookup.get("folder"), pickWords(lookup, ["folder", "bag", "notebook", "book"])),
        createOddOneOutChallenge("school-l5-3", pickWords(lookup, ["book", "notebook", "paper"]), lookup.get("scissors")),
        createPicturePickChallenge("school-l5-4", lookup.get("marker"), pickWords(lookup, ["marker", "pen", "crayon", "brush"])),
        createSortTwoBasketsChallenge("school-l5-5", {
          leftBasket: { id: "paper-items", label: "Paper items" },
          rightBasket: { id: "technology", label: "Technology" },
          leftWords: pickWords(lookup, ["book", "notebook", "paper"]),
          rightWords: pickWords(lookup, ["computer", "tablet", "keyboard"]),
          promptText: "Sort paper items and technology.",
        }),
      ],
    }),
  ];
}

function applyBodyLevels() {
  const lookup = createLookup(bodySubject.words);

  bodySubject.levels = [
    createVocabularyLevel({
      subjectId: bodySubject.id,
      levelNumber: 1,
      themeLabel: "Picture Find",
      difficultyStage: 1,
      supportProfile: "picture + word + sound",
      reviewWords: pickWords(lookup, ["head", "eye", "ear", "mouth", "nose", "hand"]),
      mapCaption: "Picture find",
      exercises: [
        createPicturePickChallenge("body-l1-1", lookup.get("head"), pickWords(lookup, ["head", "eye", "ear", "mouth"])),
        createPicturePickChallenge("body-l1-2", lookup.get("eye"), pickWords(lookup, ["eye", "ear", "nose", "mouth"])),
        createPicturePickChallenge("body-l1-3", lookup.get("ear"), pickWords(lookup, ["ear", "eye", "nose", "mouth"])),
        createPicturePickChallenge("body-l1-4", lookup.get("mouth"), pickWords(lookup, ["mouth", "nose", "ear", "hand"])),
        createPicturePickChallenge("body-l1-5", lookup.get("nose"), pickWords(lookup, ["nose", "mouth", "eye", "hand"])),
        createPicturePickChallenge("body-l1-6", lookup.get("hand"), pickWords(lookup, ["hand", "arm", "leg", "foot"])),
      ],
    }),
    createVocabularyLevel({
      subjectId: bodySubject.id,
      levelNumber: 2,
      themeLabel: "Listen and Tap",
      difficultyStage: 2,
      supportProfile: "picture + sound",
      reviewWords: pickWords(lookup, ["arm", "leg", "foot", "tooth", "hair", "face"]),
      mapCaption: "Listen and tap",
      exercises: [
        createSoundPickChallenge("body-l2-1", lookup.get("arm"), pickWords(lookup, ["arm", "hand", "leg", "foot"])),
        createSoundPickChallenge("body-l2-2", lookup.get("leg"), pickWords(lookup, ["leg", "arm", "foot", "knee"])),
        createSoundPickChallenge("body-l2-3", lookup.get("foot"), pickWords(lookup, ["foot", "toe", "leg", "hand"])),
        createSoundPickChallenge("body-l2-4", lookup.get("tooth"), pickWords(lookup, ["tooth", "mouth", "nose", "ear"])),
        createSoundPickChallenge("body-l2-5", lookup.get("hair"), pickWords(lookup, ["hair", "head", "face", "neck"])),
        createSoundPickChallenge("body-l2-6", lookup.get("face"), pickWords(lookup, ["face", "hair", "eye", "mouth"])),
      ],
    }),
    createVocabularyLevel({
      subjectId: bodySubject.id,
      levelNumber: 3,
      themeLabel: "Match and Compare",
      difficultyStage: 3,
      supportProfile: "word + picture",
      reviewWords: pickWords(lookup, ["neck", "shoulder", "finger", "knee", "toe", "stomach"]),
      mapCaption: "Match and compare",
      exercises: [
        createWordToPictureChallenge("body-l3-1", lookup.get("neck"), pickWords(lookup, ["neck", "head", "shoulder", "arm"])),
        createWordToPictureChallenge("body-l3-2", lookup.get("shoulder"), pickWords(lookup, ["shoulder", "arm", "neck", "hand"])),
        createOddOneOutChallenge("body-l3-3", pickWords(lookup, ["mouth", "eye", "nose"]), lookup.get("foot"), {
          promptText: "Which body part is not on the face?",
        }),
        createWordToPictureChallenge("body-l3-4", lookup.get("finger"), pickWords(lookup, ["finger", "hand", "toe", "leg"])),
        createWordToPictureChallenge("body-l3-5", lookup.get("knee"), pickWords(lookup, ["knee", "toe", "leg", "foot"])),
        createWordToPictureChallenge("body-l3-6", lookup.get("stomach"), pickWords(lookup, ["stomach", "neck", "arm", "shoulder"])),
      ],
    }),
    createVocabularyLevel({
      subjectId: bodySubject.id,
      levelNumber: 4,
      themeLabel: "Sort and Group",
      difficultyStage: 4,
      supportProfile: "picture only",
      reviewWords: pickWords(lookup, ["hair", "eye", "mouth", "arm", "hand", "leg", "foot", "toe"]),
      mapCaption: "Sort groups",
      exercises: [
        createSortTwoBasketsChallenge("body-l4-1", {
          leftBasket: { id: "face-parts", label: "Face parts" },
          rightBasket: { id: "limbs", label: "Limbs" },
          leftWords: pickWords(lookup, ["eye", "nose", "mouth"]),
          rightWords: pickWords(lookup, ["arm", "leg", "hand"]),
          promptText: "Sort face parts and limbs.",
        }),
        createSortTwoBasketsChallenge("body-l4-2", {
          leftBasket: { id: "arm-hand", label: "Arm and hand" },
          rightBasket: { id: "leg-foot", label: "Leg and foot" },
          leftWords: pickWords(lookup, ["arm", "hand", "finger"]),
          rightWords: pickWords(lookup, ["leg", "foot", "toe"]),
          promptText: "Sort the parts into arm-and-hand or leg-and-foot groups.",
        }),
      ],
    }),
    createVocabularyLevel({
      subjectId: bodySubject.id,
      levelNumber: 5,
      themeLabel: "Place on Body",
      difficultyStage: 5,
      supportProfile: "body map + prompt",
      reviewWords: pickWords(lookup, ["head", "eye", "nose", "mouth", "shoulder", "stomach"]),
      mapCaption: "Place on body",
      exercises: [
        createHotspotPlaceChallenge("body-l5-1", {
          targetWord: lookup.get("head"),
          hotspotWords: pickWords(lookup, ["head", "eye", "mouth", "stomach"]),
          hotspotMap: bodyHotspotMap,
          image: bodySummaryFigure,
        }),
        createHotspotPlaceChallenge("body-l5-2", {
          targetWord: lookup.get("eye"),
          hotspotWords: pickWords(lookup, ["eye", "ear", "nose", "mouth"]),
          hotspotMap: bodyHotspotMap,
          image: bodySummaryFigure,
        }),
        createHotspotPlaceChallenge("body-l5-3", {
          targetWord: lookup.get("nose"),
          hotspotWords: pickWords(lookup, ["nose", "mouth", "neck", "stomach"]),
          hotspotMap: bodyHotspotMap,
          image: bodySummaryFigure,
        }),
        createHotspotPlaceChallenge("body-l5-4", {
          targetWord: lookup.get("shoulder"),
          hotspotWords: pickWords(lookup, ["shoulder", "arm", "hand", "neck"]),
          hotspotMap: bodyHotspotMap,
          image: bodySummaryFigure,
        }),
        createHotspotPlaceChallenge("body-l5-5", {
          targetWord: lookup.get("stomach"),
          hotspotWords: pickWords(lookup, ["stomach", "leg", "foot", "arm"]),
          hotspotMap: bodyHotspotMap,
          image: bodySummaryFigure,
        }),
      ],
    }),
    createVocabularyLevel({
      subjectId: bodySubject.id,
      levelNumber: 6,
      themeLabel: "Mixed Challenge",
      difficultyStage: 6,
      supportProfile: "mixed support",
      reviewWords: pickWords(lookup, ["face", "neck", "arm", "hand", "leg", "foot"]),
      mapCaption: "Mixed challenge",
      exercises: [
        createSoundPickChallenge("body-l6-1", lookup.get("face"), pickWords(lookup, ["face", "head", "hair", "mouth"])),
        createWordToPictureChallenge("body-l6-2", lookup.get("neck"), pickWords(lookup, ["neck", "shoulder", "chest", "throat"])),
        createOddOneOutChallenge("body-l6-3", pickWords(lookup, ["arm", "hand", "finger"]), lookup.get("nose")),
        createHotspotPlaceChallenge("body-l6-4", {
          targetWord: lookup.get("foot"),
          hotspotWords: pickWords(lookup, ["foot", "toe", "knee", "hand"]),
          hotspotMap: bodyHotspotMap,
          image: bodySummaryFigure,
        }),
        createSortTwoBasketsChallenge("body-l6-5", {
          leftBasket: { id: "upper-body", label: "Upper body" },
          rightBasket: { id: "lower-body", label: "Lower body" },
          leftWords: pickWords(lookup, ["face", "neck", "shoulder"]),
          rightWords: pickWords(lookup, ["hip", "knee", "foot"]),
          promptText: "Sort the body parts into upper body or lower body.",
        }),
      ],
    }),
  ];
}

function applyMathThemes() {
  const themes = [
    { themeLabel: "Count", mapCaption: "Count" },
    { themeLabel: "Count More", mapCaption: "Count more" },
    { themeLabel: "Add", mapCaption: "Add" },
    { themeLabel: "Take Away", mapCaption: "Take away" },
    { themeLabel: "Mixed Math Mission", mapCaption: "Mixed mission" },
  ];

  mathSubject.levels = mathSubject.levels.map((level, index) => ({
    ...level,
    ...themes[index],
  }));
}

applyAnimalsLevels();
applyFruitLevels();
applySchoolLevels();
applyBodyLevels();
applyMathThemes();

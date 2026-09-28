import { animalsSubject } from "./animals.js";
import { fruitsVegetablesSubject } from "./fruitsVegetables.js";
import { schoolThingsSubject } from "./schoolThings.js";

function findWord(subject, id) {
  const word = subject.words.find((item) => item.id === id);

  if (!word) {
    throw new Error(`Learning Games could not find "${id}".`);
  }

  return word;
}

const cat = findWord(animalsSubject, "cat");
const dog = findWord(animalsSubject, "dog");
const lion = findWord(animalsSubject, "lion");
const tiger = findWord(animalsSubject, "tiger");
const elephant = findWord(animalsSubject, "elephant");
const apple = findWord(fruitsVegetablesSubject, "apple");
const banana = findWord(fruitsVegetablesSubject, "banana");
const carrot = findWord(fruitsVegetablesSubject, "carrot");
const orange = findWord(fruitsVegetablesSubject, "orange");
const book = findWord(schoolThingsSubject, "book");
const pencil = findWord(schoolThingsSubject, "pencil");
const ruler = findWord(schoolThingsSubject, "ruler");
const chair = findWord(schoolThingsSubject, "chair");

const gameWords = [
  cat,
  dog,
  lion,
  tiger,
  elephant,
  apple,
  banana,
  carrot,
  orange,
  book,
  pencil,
  ruler,
  chair,
];

const levels = [
  {
    id: "learning-games-level-1",
    levelNumber: 1,
    label: "Game 1",
    themeLabel: "Word Fishing",
    mapCaption: "Catch a word",
    wordCount: 1,
    randomPoolIds: ["apple", "banana", "carrot", "book", "orange", "pencil"],
    reviewWords: [apple, banana, carrot, book],
    exercises: [
      {
        id: "learning-game-fishing",
        type: "learning-game",
        mode: "word-fishing",
        answerKind: "choice",
        title: "Word Fishing",
        instruction: "Look at the picture. Catch the fish with the correct word.",
        skillLabel: "Vocabulary + reading",
        targetWord: apple,
        choices: [banana, book, apple, carrot],
        correctChoiceId: apple.id,
      },
    ],
  },
  {
    id: "learning-games-level-2",
    levelNumber: 2,
    label: "Game 2",
    themeLabel: "Zombie Word Munch",
    mapCaption: "Feed the zombie",
    wordCount: 1,
    randomPoolIds: ["dog", "lion", "banana", "book", "cat", "tiger"],
    reviewWords: [dog, lion, banana, book],
    exercises: [
      {
        id: "learning-game-zombie",
        type: "learning-game",
        mode: "zombie-word-munch",
        answerKind: "choice",
        title: "Zombie Word Munch",
        instruction: "The friendly zombie is hungry. Feed it the matching word.",
        skillLabel: "Picture + word recognition",
        targetWord: dog,
        choices: [book, lion, dog, banana],
        correctChoiceId: dog.id,
      },
    ],
  },
  {
    id: "learning-games-level-3",
    levelNumber: 3,
    label: "Game 3",
    themeLabel: "Number Blaster",
    mapCaption: "Blast the answer",
    wordCount: 1,
    reviewWords: [],
    exercises: [
      {
        id: "learning-game-number-blaster",
        type: "learning-game",
        mode: "number-blaster",
        answerKind: "value",
        title: "Number Blaster",
        instruction: "Solve the addition. Shoot the correct number.",
        skillLabel: "Addition + quick thinking",
        leftValue: 4,
        rightValue: 3,
        operator: "+",
        choices: [6, 9, 7, 8],
        correctAnswer: 7,
      },
    ],
  },
  {
    id: "learning-games-level-4",
    levelNumber: 4,
    label: "Game 4",
    themeLabel: "Sound Bubble Pop",
    mapCaption: "Pop the sound",
    wordCount: 1,
    randomPoolIds: ["elephant", "apple", "orange", "tiger", "cat", "dog"],
    reviewWords: [elephant],
    exercises: [
      {
        id: "learning-game-sound-bubble",
        type: "learning-game",
        mode: "sound-bubble-pop",
        answerKind: "choice",
        title: "Sound Bubble Pop",
        instruction: "Listen carefully. Pop the bubble with the matching word.",
        skillLabel: "Listening + picture recognition",
        targetWord: elephant,
        promptWord: elephant.word,
        phonics: elephant.phonics,
        correctChoiceId: elephant.id,
        choices: [elephant, apple, orange, tiger],
        reviewWord: elephant,
      },
    ],
  },
  {
    id: "learning-games-level-5",
    levelNumber: 5,
    label: "Game 5",
    themeLabel: "Shape Shield",
    mapCaption: "Raise the shield",
    wordCount: 1,
    reviewWords: [],
    exercises: [
      {
        id: "learning-game-shape-shield",
        type: "learning-game",
        mode: "shape-shield",
        answerKind: "value",
        title: "Shape Shield",
        instruction: "Find the triangle shield before the meteor arrives.",
        skillLabel: "Shapes + observation",
        targetShape: "triangle",
        choices: ["circle", "square", "triangle", "diamond"],
        correctAnswer: "triangle",
      },
    ],
  },
  {
    id: "learning-games-level-6",
    levelNumber: 6,
    label: "Game 6",
    themeLabel: "Monster Memory",
    mapCaption: "Match pairs",
    wordCount: 1,
    randomPoolIds: ["cat", "orange", "chair", "dog", "apple", "book"],
    reviewWords: [cat, orange, chair],
    exercises: [
      {
        id: "learning-game-memory",
        type: "learning-game",
        mode: "memory-match",
        answerKind: "memory-pair",
        title: "Monster Memory",
        instruction: "Match each picture with its English word.",
        skillLabel: "Memory + vocabulary",
        pairs: [cat, orange, chair],
      },
    ],
  },
  {
    id: "learning-games-level-7",
    levelNumber: 7,
    label: "Game 7",
    themeLabel: "Pattern Pop",
    mapCaption: "Find the pattern",
    wordCount: 1,
    randomPoolIds: ["cat", "apple", "book", "dog", "banana", "pencil"],
    reviewWords: [cat, apple, book],
    exercises: [
      {
        id: "learning-game-pattern",
        type: "learning-game",
        mode: "pattern-pop",
        answerKind: "choice",
        title: "Pattern Pop",
        instruction: "What comes next in the picture pattern?",
        skillLabel: "Logic + observation",
        sequence: [cat, apple, cat, apple],
        choices: [cat, apple, book],
        correctChoiceId: cat.id,
      },
    ],
  },
  {
    id: "learning-games-level-8",
    levelNumber: 8,
    label: "Game 8",
    themeLabel: "Treasure Sort",
    mapCaption: "Sort treasures",
    wordCount: 1,
    reviewWords: [dog, lion, elephant, pencil, ruler, book],
    exercises: [
      {
        id: "learning-game-sort",
        type: "learning-game",
        mode: "treasure-sort",
        answerKind: "sort-item",
        title: "Treasure Sort",
        instruction: "Choose a treasure chest, then sort every item.",
        skillLabel: "Categories + vocabulary",
        baskets: [
          { id: "animals", label: "Animals", emoji: "🦁" },
          { id: "school", label: "School", emoji: "🏫" },
        ],
        items: [
          { ...dog, basketId: "animals" },
          { ...lion, basketId: "animals" },
          { ...elephant, basketId: "animals" },
          { ...pencil, basketId: "school" },
          { ...ruler, basketId: "school" },
          { ...book, basketId: "school" },
        ],
      },
    ],
  },
  {
    id: "learning-games-level-9",
    levelNumber: 9,
    label: "Game 9",
    themeLabel: "Sound Safari",
    mapCaption: "Listen and find",
    wordCount: 1,
    randomPoolIds: ["banana", "carrot", "tiger", "pencil", "apple", "lion"],
    reviewWords: [banana, carrot, tiger, pencil],
    exercises: [
      {
        id: "learning-game-sound",
        type: "learning-game",
        mode: "sound-safari",
        answerKind: "choice",
        title: "Sound Safari",
        instruction: "Listen carefully. Tap the matching picture.",
        skillLabel: "Listening + pronunciation",
        promptWord: banana.word,
        phonics: banana.phonics,
        correctChoiceId: banana.id,
        choices: [banana, carrot, tiger, pencil],
        reviewWord: banana,
      },
    ],
  },
  {
    id: "learning-games-level-10",
    levelNumber: 10,
    label: "Game 10",
    themeLabel: "Word Rocket",
    mapCaption: "Build a word",
    wordCount: 1,
    randomPoolIds: ["tiger", "cat", "dog", "lion", "apple", "book"],
    reviewWords: [tiger],
    exercises: [
      {
        id: "learning-game-rocket",
        type: "learning-game",
        mode: "word-rocket",
        answerKind: "sequence-letter",
        title: "Word Rocket",
        instruction: "Tap the letters in order to launch the rocket.",
        skillLabel: "Spelling + letter order",
        targetWord: tiger,
        letters: ["G", "T", "R", "I", "E"],
      },
    ],
  },
];

export const learningGamesSubject = {
  id: "learning-games",
  name: "Learning Games",
  category: "exercise",
  icon: "🎮",
  description: "Relax, play, and learn with ten action-packed mini-games.",
  contentMode: "levels",
  words: gameWords,
  levels,
};

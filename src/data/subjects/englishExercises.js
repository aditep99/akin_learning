import { fruitsVegetablesSubject } from "./fruitsVegetables.js";
import {
  englishExerciseFoodImageOverrides,
  englishExerciseFruitImageOverrides,
  englishExerciseGreetingImageOverrides,
  englishExerciseSchoolImageOverrides,
  englishExerciseToyImageOverrides,
} from "./englishExerciseImageMaps.js";
import { schoolThingsSubject } from "./schoolThings.js";
import {
  createVisualWord,
  makePluralImage,
  makePositionImage,
  makePronounImage,
} from "./exerciseVisuals.js";
import {
  createLookup,
  createOddOneOutChallenge,
  createPicturePickChallenge,
  createSortTwoBasketsChallenge,
  createSoundPickChallenge,
  createVocabularyLevel,
  createWordToPictureChallenge,
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

function applyImageOverrides(words, overrides) {
  return words.map((word) => ({
    ...word,
    image: overrides[word.id] || word.image,
  }));
}

const localExerciseImageOverrides = {
  ...englishExerciseToyImageOverrides,
  ...englishExerciseFoodImageOverrides,
  ...englishExerciseGreetingImageOverrides,
};

function createExerciseWord({
  id,
  word,
  translation,
  phonics,
  emoji,
  image,
  answerVisual,
  pronunciationGuide,
  pronunciationIpa = "",
}) {
  return {
    id,
    word,
    translation,
    phonics,
    emoji,
    image: image || localExerciseImageOverrides[id],
    ...(answerVisual ? { answerVisual } : {}),
    pronunciation: {
      guide: pronunciationGuide || word.toLowerCase(),
      ipa: pronunciationIpa,
    },
  };
}

function buildLocalLookup(words) {
  return new Map(words.map((word) => [word.id, word]));
}

const fruitLookup = createLookup(
  applyImageOverrides(fruitsVegetablesSubject.words, englishExerciseFruitImageOverrides),
);
const schoolLookup = createLookup(
  applyImageOverrides(schoolThingsSubject.words, englishExerciseSchoolImageOverrides),
);

const colorWords = [
  createExerciseWord({
    id: "color-red",
    word: "Red",
    translation: "สีแดง",
    phonics: "เรด",
    emoji: "🔴",
    answerVisual: { kind: "color", token: "red" },
    pronunciationIpa: "/red/",
  }),
  createExerciseWord({
    id: "color-orange",
    word: "Orange",
    translation: "สีส้ม",
    phonics: "ออเรนจ์",
    emoji: "🟠",
    answerVisual: { kind: "color", token: "orange" },
    pronunciationIpa: "/ˈɔːrɪndʒ/",
  }),
  createExerciseWord({
    id: "color-yellow",
    word: "Yellow",
    translation: "สีเหลือง",
    phonics: "เยลโล",
    emoji: "🟡",
    answerVisual: { kind: "color", token: "yellow" },
    pronunciationIpa: "/ˈjeloʊ/",
  }),
  createExerciseWord({
    id: "color-green",
    word: "Green",
    translation: "สีเขียว",
    phonics: "กรีน",
    emoji: "🟢",
    answerVisual: { kind: "color", token: "green" },
    pronunciationIpa: "/ɡriːn/",
  }),
  createExerciseWord({
    id: "color-blue",
    word: "Blue",
    translation: "สีน้ำเงิน",
    phonics: "บลู",
    emoji: "🔵",
    answerVisual: { kind: "color", token: "blue" },
    pronunciationIpa: "/bluː/",
  }),
  createExerciseWord({
    id: "color-purple",
    word: "Purple",
    translation: "สีม่วง",
    phonics: "เพอร์เพิล",
    emoji: "🟣",
    answerVisual: { kind: "color", token: "purple" },
    pronunciationIpa: "/ˈpɜːrpəl/",
  }),
  createExerciseWord({
    id: "color-pink",
    word: "Pink",
    translation: "สีชมพู",
    phonics: "พิงก์",
    emoji: "🩷",
    answerVisual: { kind: "color", token: "pink" },
    pronunciationIpa: "/pɪŋk/",
  }),
  createExerciseWord({
    id: "color-brown",
    word: "Brown",
    translation: "สีน้ำตาล",
    phonics: "บราวน์",
    emoji: "🟤",
    answerVisual: { kind: "color", token: "brown" },
    pronunciationIpa: "/braʊn/",
  }),
  createExerciseWord({
    id: "color-black",
    word: "Black",
    translation: "สีดำ",
    phonics: "แบล็ก",
    emoji: "⚫",
    answerVisual: { kind: "color", token: "black" },
    pronunciationIpa: "/blæk/",
  }),
  createExerciseWord({
    id: "color-white",
    word: "White",
    translation: "สีขาว",
    phonics: "ไวต์",
    emoji: "⚪",
    answerVisual: { kind: "color", token: "white" },
    pronunciationIpa: "/waɪt/",
  }),
];

const toyWords = [
  createExerciseWord({
    id: "toy-teddy-bear",
    word: "Teddy Bear",
    translation: "ตุ๊กตาหมี",
    phonics: "เท็ดดี แบร์",
    emoji: "🧸",
    pronunciationIpa: "/ˈtedi ber/",
  }),
  createExerciseWord({
    id: "toy-blocks",
    word: "Blocks",
    translation: "บล็อกของเล่น",
    phonics: "บล็อกส์",
    emoji: "🧱",
    pronunciationIpa: "/blɑːks/",
  }),
  createExerciseWord({
    id: "toy-puzzle",
    word: "Puzzle",
    translation: "จิ๊กซอว์",
    phonics: "พัซเซิล",
    emoji: "🧩",
    pronunciationIpa: "/ˈpʌzəl/",
  }),
  createExerciseWord({
    id: "toy-bicycle",
    word: "Bicycle",
    translation: "จักรยาน",
    phonics: "ไบซิเคิล",
    emoji: "🚲",
    pronunciationIpa: "/ˈbaɪsɪkəl/",
  }),
  createExerciseWord({
    id: "toy-plane",
    word: "Plane",
    translation: "เครื่องบินของเล่น",
    phonics: "เพลน",
    emoji: "✈️",
    pronunciationIpa: "/pleɪn/",
  }),
  createExerciseWord({
    id: "toy-ball",
    word: "Ball",
    translation: "ลูกบอล",
    phonics: "บอล",
    emoji: "⚽",
    pronunciationIpa: "/bɔːl/",
  }),
  createExerciseWord({
    id: "toy-balloon",
    word: "Balloon",
    translation: "ลูกโป่ง",
    phonics: "บะลูน",
    emoji: "🎈",
    pronunciationIpa: "/bəˈluːn/",
  }),
  createExerciseWord({
    id: "toy-doll",
    word: "Doll",
    translation: "ตุ๊กตา",
    phonics: "ดอล",
    emoji: "🪆",
    pronunciationIpa: "/dɑːl/",
  }),
  createExerciseWord({
    id: "toy-rocket",
    word: "Rocket",
    translation: "จรวดของเล่น",
    phonics: "ร็อกเก็ต",
    emoji: "🚀",
    pronunciationIpa: "/ˈrɑːkɪt/",
  }),
  createExerciseWord({
    id: "toy-rattle",
    word: "Rattle",
    translation: "กระดิ่งเขย่า",
    phonics: "แรทเทิล",
    emoji: "🪇",
    pronunciationIpa: "/ˈrætəl/",
  }),
  createExerciseWord({
    id: "toy-jump-rope",
    word: "Jump Rope",
    translation: "เชือกกระโดด",
    phonics: "จัมพ์ โรป",
    emoji: "🪢",
    pronunciationIpa: "/dʒʌmp roʊp/",
  }),
  createExerciseWord({
    id: "toy-car",
    word: "Car",
    translation: "รถของเล่น",
    phonics: "คาร์",
    emoji: "🚗",
    pronunciationIpa: "/kɑːr/",
  }),
  createExerciseWord({
    id: "toy-robot",
    word: "Robot",
    translation: "หุ่นยนต์",
    phonics: "โรบอท",
    emoji: "🤖",
    pronunciationIpa: "/ˈroʊbɑːt/",
  }),
  createExerciseWord({
    id: "toy-clown",
    word: "Clown",
    translation: "ตัวตลก",
    phonics: "คลาวน์",
    emoji: "🤡",
    pronunciationIpa: "/klaʊn/",
  }),
];

const foodWords = [
  createExerciseWord({
    id: "food-water",
    word: "Water",
    translation: "น้ำ",
    phonics: "วอเทอร์",
    emoji: "💧",
    pronunciationIpa: "/ˈwɔːtər/",
  }),
  createExerciseWord({
    id: "food-sandwich",
    word: "Sandwich",
    translation: "แซนด์วิช",
    phonics: "แซนด์วิช",
    emoji: "🥪",
    pronunciationIpa: "/ˈsænwɪtʃ/",
  }),
  createExerciseWord({
    id: "food-lemonade",
    word: "Lemonade",
    translation: "น้ำมะนาว",
    phonics: "เลมะเนด",
    emoji: "🍋",
    pronunciationIpa: "/ˌleməˈneɪd/",
  }),
  createExerciseWord({
    id: "food-milk",
    word: "Milk",
    translation: "นม",
    phonics: "มิลก์",
    emoji: "🥛",
    pronunciationIpa: "/mɪlk/",
  }),
  createExerciseWord({
    id: "food-bread",
    word: "Bread",
    translation: "ขนมปัง",
    phonics: "เบรด",
    emoji: "🍞",
    pronunciationIpa: "/bred/",
  }),
  createExerciseWord({
    id: "food-burger",
    word: "Burger",
    translation: "เบอร์เกอร์",
    phonics: "เบอร์เกอร์",
    emoji: "🍔",
    pronunciationIpa: "/ˈbɜːrɡər/",
  }),
  createExerciseWord({
    id: "food-soda",
    word: "Soda",
    translation: "น้ำอัดลม",
    phonics: "โซดา",
    emoji: "🥤",
    pronunciationIpa: "/ˈsoʊdə/",
  }),
  createExerciseWord({
    id: "food-noodles",
    word: "Noodles",
    translation: "ก๋วยเตี๋ยว",
    phonics: "นูเดิลส์",
    emoji: "🍜",
    pronunciationIpa: "/ˈnuːdəlz/",
  }),
  createExerciseWord({
    id: "food-fried-chicken",
    word: "Fried Chicken",
    translation: "ไก่ทอด",
    phonics: "ฟรายด์ ชิคเกน",
    emoji: "🍗",
    pronunciationIpa: "/fraɪd ˈtʃɪkɪn/",
  }),
  createExerciseWord({
    id: "food-cake",
    word: "Cake",
    translation: "เค้ก",
    phonics: "เคก",
    emoji: "🍰",
    pronunciationIpa: "/keɪk/",
  }),
  createExerciseWord({
    id: "food-pizza",
    word: "Pizza",
    translation: "พิซซ่า",
    phonics: "พีซซา",
    emoji: "🍕",
    pronunciationIpa: "/ˈpiːtsə/",
  }),
  createExerciseWord({
    id: "food-rice",
    word: "Rice",
    translation: "ข้าว",
    phonics: "ไรซ์",
    emoji: "🍚",
    pronunciationIpa: "/raɪs/",
  }),
  createExerciseWord({
    id: "food-sausages",
    word: "Sausages",
    translation: "ไส้กรอก",
    phonics: "ซอซิจิส",
    emoji: "🌭",
    pronunciationIpa: "/ˈsɔːsɪdʒɪz/",
  }),
  createExerciseWord({
    id: "food-soup",
    word: "Soup",
    translation: "ซุป",
    phonics: "ซูป",
    emoji: "🍲",
    pronunciationIpa: "/suːp/",
  }),
  createExerciseWord({
    id: "food-salad",
    word: "Salad",
    translation: "สลัด",
    phonics: "แซลัด",
    emoji: "🥗",
    pronunciationIpa: "/ˈsæləd/",
  }),
  createExerciseWord({
    id: "food-skewer",
    word: "Skewer",
    translation: "ไม้เสียบอาหาร",
    phonics: "สคิวเออร์",
    emoji: "🍢",
    pronunciationIpa: "/ˈskjuːər/",
  }),
  createExerciseWord({
    id: "food-jam",
    word: "Jam",
    translation: "แยม",
    phonics: "แจม",
    emoji: "🍓",
    pronunciationIpa: "/dʒæm/",
  }),
  createExerciseWord({
    id: "food-juice",
    word: "Juice",
    translation: "น้ำผลไม้",
    phonics: "จูซ",
    emoji: "🧃",
    pronunciationIpa: "/dʒuːs/",
  }),
  createExerciseWord({
    id: "food-fish",
    word: "Fish",
    translation: "ปลา",
    phonics: "ฟิช",
    emoji: "🐟",
    pronunciationIpa: "/fɪʃ/",
  }),
  createExerciseWord({
    id: "food-tea",
    word: "Tea",
    translation: "ชา",
    phonics: "ที",
    emoji: "🍵",
    pronunciationIpa: "/tiː/",
  }),
];

const greetingWords = [
  createExerciseWord({
    id: "greeting-sawasdee",
    word: "Sawasdee",
    translation: "Thailand",
    phonics: "สะ-หวัด-ดี",
    emoji: "🇹🇭",
    pronunciationGuide: "sawasdee",
  }),
  createExerciseWord({
    id: "greeting-mabuhay",
    word: "Mabuhay",
    translation: "Philippines",
    phonics: "มะ-บู-ไฮ",
    emoji: "🇵🇭",
    pronunciationGuide: "mabuhay",
  }),
  createExerciseWord({
    id: "greeting-ni-hao",
    word: "Ni Hao",
    translation: "China",
    phonics: "หนี-ห่าว",
    emoji: "🇨🇳",
    pronunciationGuide: "ni hao",
  }),
  createExerciseWord({
    id: "greeting-hello",
    word: "Hello",
    translation: "USA",
    phonics: "เฮลโล",
    emoji: "🇺🇸",
    pronunciationGuide: "hello",
    pronunciationIpa: "/həˈloʊ/",
  }),
  createExerciseWord({
    id: "greeting-kia-ora",
    word: "Kia Ora",
    translation: "New Zealand",
    phonics: "คี-ออ-รา",
    emoji: "🇳🇿",
    pronunciationGuide: "kia ora",
  }),
];

const colorLookup = buildLocalLookup(colorWords);
const toyLookup = buildLocalLookup(toyWords);
const foodLookup = buildLocalLookup(foodWords);
const greetingLookup = buildLocalLookup(greetingWords);
const pronounWords = [
  createVisualWord({ id: "pronoun-he", word: "He", translation: "เขา (ผู้ชาย)", phonics: "ฮี", image: makePronounImage("he"), emoji: "👦" }),
  createVisualWord({ id: "pronoun-she", word: "She", translation: "เขา (ผู้หญิง)", phonics: "ชี", image: makePronounImage("she"), emoji: "👧" }),
  createVisualWord({ id: "pronoun-it", word: "It", translation: "มัน", phonics: "อิท", image: makePronounImage("it"), emoji: "🐱" }),
  createVisualWord({ id: "pronoun-they", word: "They", translation: "พวกเขา", phonics: "เดย์", image: makePronounImage("they"), emoji: "👫" }),
];
const pluralWords = [
  createVisualWord({ id: "plural-one-apple", word: "Apple", translation: "แอปเปิลหนึ่งผล", image: makePluralImage("🍎", 1), emoji: "🍎" }),
  createVisualWord({ id: "plural-apples", word: "Apples", translation: "แอปเปิลหลายผล", image: makePluralImage("🍎", 3), emoji: "🍎" }),
  createVisualWord({ id: "plural-one-book", word: "Book", translation: "หนังสือหนึ่งเล่ม", image: makePluralImage("📘", 1), emoji: "📘" }),
  createVisualWord({ id: "plural-books", word: "Books", translation: "หนังสือหลายเล่ม", image: makePluralImage("📘", 3), emoji: "📚" }),
  createVisualWord({ id: "plural-one-cat", word: "Cat", translation: "แมวหนึ่งตัว", image: makePluralImage("🐱", 1), emoji: "🐱" }),
  createVisualWord({ id: "plural-cats", word: "Cats", translation: "แมวหลายตัว", image: makePluralImage("🐱", 3), emoji: "🐱" }),
];
const positionWords = [
  createVisualWord({ id: "position-in", word: "In", translation: "ข้างใน", phonics: "อิน", image: makePositionImage("in"), emoji: "📦" }),
  createVisualWord({ id: "position-on", word: "On", translation: "ข้างบน", phonics: "ออน", image: makePositionImage("on"), emoji: "⬆️" }),
  createVisualWord({ id: "position-under", word: "Under", translation: "ข้างใต้", phonics: "อันเดอร์", image: makePositionImage("under"), emoji: "⬇️" }),
  createVisualWord({ id: "position-next-to", word: "Next to", translation: "ข้าง ๆ", phonics: "เน็กซ์ทู", image: makePositionImage("next-to"), emoji: "↔️" }),
];
const pronounLookup = buildLocalLookup(pronounWords);
const pluralLookup = buildLocalLookup(pluralWords);
const positionLookup = buildLocalLookup(positionWords);

const englishExerciseLevels = [
  createVocabularyLevel({
    subjectId: "english-exercises",
    levelNumber: 1,
    themeLabel: "Vegetables Garden",
    difficultyStage: 1,
    supportProfile: "picture + word + sound",
    reviewWords: pickWords(fruitLookup, [
      "cabbage",
      "chili",
      "lettuce",
      "bean",
      "pumpkin",
      "spinach",
    ]),
    mapCaption: "Vegetables",
    exercises: [
      createPicturePickChallenge(
        "english-ex-l1-1",
        fruitLookup.get("cabbage"),
        pickWords(fruitLookup, ["cabbage", "lettuce", "broccoli", "spinach"]),
      ),
      createPicturePickChallenge(
        "english-ex-l1-2",
        fruitLookup.get("chili"),
        pickWords(fruitLookup, ["chili", "carrot", "bean", "corn"]),
      ),
      createPicturePickChallenge(
        "english-ex-l1-3",
        fruitLookup.get("lettuce"),
        pickWords(fruitLookup, ["lettuce", "cabbage", "spinach", "broccoli"]),
      ),
      createPicturePickChallenge(
        "english-ex-l1-4",
        fruitLookup.get("bean"),
        pickWords(fruitLookup, ["bean", "corn", "cucumber", "carrot"]),
      ),
      createPicturePickChallenge(
        "english-ex-l1-5",
        fruitLookup.get("pumpkin"),
        pickWords(fruitLookup, ["pumpkin", "potato", "sweet-potato", "tomato"]),
      ),
      createPicturePickChallenge(
        "english-ex-l1-6",
        fruitLookup.get("spinach"),
        pickWords(fruitLookup, ["spinach", "lettuce", "cabbage", "broccoli"]),
      ),
    ],
  }),
  createVocabularyLevel({
    subjectId: "english-exercises",
    levelNumber: 2,
    themeLabel: "Vegetables Listen",
    difficultyStage: 2,
    supportProfile: "picture + sound",
    reviewWords: pickWords(fruitLookup, [
      "garlic",
      "tomato",
      "potato",
      "onion",
      "cucumber",
      "carrot",
    ]),
    mapCaption: "Listen vegetables",
    exercises: [
      createSoundPickChallenge(
        "english-ex-l2-1",
        fruitLookup.get("garlic"),
        pickWords(fruitLookup, ["garlic", "onion", "potato", "pumpkin"]),
      ),
      createSoundPickChallenge(
        "english-ex-l2-2",
        fruitLookup.get("tomato"),
        pickWords(fruitLookup, ["tomato", "apple", "orange", "pumpkin"]),
      ),
      createSoundPickChallenge(
        "english-ex-l2-3",
        fruitLookup.get("potato"),
        pickWords(fruitLookup, ["potato", "pumpkin", "corn", "carrot"]),
      ),
      createSoundPickChallenge(
        "english-ex-l2-4",
        fruitLookup.get("onion"),
        pickWords(fruitLookup, ["onion", "garlic", "potato", "cabbage"]),
      ),
      createSoundPickChallenge(
        "english-ex-l2-5",
        fruitLookup.get("cucumber"),
        pickWords(fruitLookup, ["cucumber", "bean", "carrot", "corn"]),
      ),
      createSoundPickChallenge(
        "english-ex-l2-6",
        fruitLookup.get("carrot"),
        pickWords(fruitLookup, ["carrot", "corn", "potato", "cucumber"]),
      ),
    ],
  }),
  createVocabularyLevel({
    subjectId: "english-exercises",
    levelNumber: 3,
    themeLabel: "Color Grammar",
    difficultyStage: 2,
    supportProfile: "color + word",
    reviewWords: pickWords(colorLookup, [
      "color-red",
      "color-orange",
      "color-yellow",
      "color-green",
      "color-blue",
      "color-black",
    ]),
    mapCaption: "Colors",
    exercises: [
      createWordToPictureChallenge(
        "english-ex-l3-1",
        colorLookup.get("color-red"),
        pickWords(colorLookup, ["color-red", "color-pink", "color-orange", "color-brown"]),
      ),
      createWordToPictureChallenge(
        "english-ex-l3-2",
        colorLookup.get("color-orange"),
        pickWords(colorLookup, ["color-orange", "color-yellow", "color-red", "color-brown"]),
      ),
      createWordToPictureChallenge(
        "english-ex-l3-3",
        colorLookup.get("color-yellow"),
        pickWords(colorLookup, ["color-yellow", "color-green", "color-white", "color-orange"]),
      ),
      createWordToPictureChallenge(
        "english-ex-l3-4",
        colorLookup.get("color-green"),
        pickWords(colorLookup, ["color-green", "color-blue", "color-brown", "color-black"]),
      ),
      createWordToPictureChallenge(
        "english-ex-l3-5",
        colorLookup.get("color-blue"),
        pickWords(colorLookup, ["color-blue", "color-purple", "color-green", "color-black"]),
      ),
      createWordToPictureChallenge(
        "english-ex-l3-6",
        colorLookup.get("color-black"),
        pickWords(colorLookup, ["color-black", "color-white", "color-brown", "color-blue"]),
      ),
    ],
  }),
  createVocabularyLevel({
    subjectId: "english-exercises",
    levelNumber: 4,
    themeLabel: "Classroom Objects",
    difficultyStage: 3,
    supportProfile: "picture + word + sound",
    reviewWords: pickWords(schoolLookup, [
      "chair",
      "book",
      "backpack",
      "pen",
      "ruler",
      "pencil",
      "clock",
      "notebook",
    ]),
    mapCaption: "Classroom",
    exercises: [
      createPicturePickChallenge(
        "english-ex-l4-1",
        schoolLookup.get("chair"),
        pickWords(schoolLookup, ["chair", "desk", "board", "clock"]),
      ),
      createPicturePickChallenge(
        "english-ex-l4-2",
        schoolLookup.get("book"),
        pickWords(schoolLookup, ["book", "notebook", "folder", "paper"]),
      ),
      createWordToPictureChallenge(
        "english-ex-l4-3",
        schoolLookup.get("backpack"),
        pickWords(schoolLookup, ["backpack", "bag", "folder", "notebook"]),
      ),
      createWordToPictureChallenge(
        "english-ex-l4-4",
        schoolLookup.get("pen"),
        pickWords(schoolLookup, ["pen", "pencil", "marker", "brush"]),
      ),
      createSoundPickChallenge(
        "english-ex-l4-5",
        schoolLookup.get("ruler"),
        pickWords(schoolLookup, ["ruler", "pencil", "pen", "notebook"]),
      ),
      createPicturePickChallenge(
        "english-ex-l4-6",
        schoolLookup.get("clock"),
        pickWords(schoolLookup, ["clock", "chair", "book", "ruler"]),
      ),
    ],
  }),
  createVocabularyLevel({
    subjectId: "english-exercises",
    levelNumber: 5,
    themeLabel: "Toy Box",
    difficultyStage: 3,
    supportProfile: "picture + sound",
    reviewWords: pickWords(toyLookup, [
      "toy-teddy-bear",
      "toy-blocks",
      "toy-puzzle",
      "toy-ball",
      "toy-doll",
      "toy-rocket",
    ]),
    mapCaption: "Toys",
    exercises: [
      createPicturePickChallenge(
        "english-ex-l5-1",
        toyLookup.get("toy-teddy-bear"),
        pickWords(toyLookup, ["toy-teddy-bear", "toy-doll", "toy-robot", "toy-ball"]),
      ),
      createPicturePickChallenge(
        "english-ex-l5-2",
        toyLookup.get("toy-blocks"),
        pickWords(toyLookup, ["toy-blocks", "toy-puzzle", "toy-balloon", "toy-rocket"]),
      ),
      createWordToPictureChallenge(
        "english-ex-l5-3",
        toyLookup.get("toy-puzzle"),
        pickWords(toyLookup, ["toy-puzzle", "toy-blocks", "toy-ball", "toy-car"]),
      ),
      createSoundPickChallenge(
        "english-ex-l5-4",
        toyLookup.get("toy-ball"),
        pickWords(toyLookup, ["toy-ball", "toy-balloon", "toy-car", "toy-plane"]),
      ),
      createWordToPictureChallenge(
        "english-ex-l5-5",
        toyLookup.get("toy-doll"),
        pickWords(toyLookup, ["toy-doll", "toy-teddy-bear", "toy-balloon", "toy-robot"]),
      ),
      createPicturePickChallenge(
        "english-ex-l5-6",
        toyLookup.get("toy-rocket"),
        pickWords(toyLookup, ["toy-rocket", "toy-plane", "toy-car", "toy-bicycle"]),
      ),
    ],
  }),
  createVocabularyLevel({
    subjectId: "english-exercises",
    levelNumber: 6,
    themeLabel: "Foods and Drinks",
    difficultyStage: 4,
    supportProfile: "picture + word + sound",
    reviewWords: pickWords(foodLookup, [
      "food-water",
      "food-sandwich",
      "food-milk",
      "food-bread",
      "food-burger",
      "food-pizza",
    ]),
    mapCaption: "Food",
    exercises: [
      createPicturePickChallenge(
        "english-ex-l6-1",
        foodLookup.get("food-water"),
        pickWords(foodLookup, ["food-water", "food-milk", "food-juice", "food-tea"]),
      ),
      createPicturePickChallenge(
        "english-ex-l6-2",
        foodLookup.get("food-sandwich"),
        pickWords(foodLookup, ["food-sandwich", "food-burger", "food-bread", "food-pizza"]),
      ),
      createSoundPickChallenge(
        "english-ex-l6-3",
        foodLookup.get("food-milk"),
        pickWords(foodLookup, ["food-milk", "food-water", "food-juice", "food-tea"]),
      ),
      createWordToPictureChallenge(
        "english-ex-l6-4",
        foodLookup.get("food-bread"),
        pickWords(foodLookup, ["food-bread", "food-cake", "food-rice", "food-noodles"]),
      ),
      createPicturePickChallenge(
        "english-ex-l6-5",
        foodLookup.get("food-burger"),
        pickWords(foodLookup, ["food-burger", "food-sandwich", "food-pizza", "food-salad"]),
      ),
      createWordToPictureChallenge(
        "english-ex-l6-6",
        foodLookup.get("food-pizza"),
        pickWords(foodLookup, ["food-pizza", "food-cake", "food-bread", "food-soup"]),
      ),
    ],
  }),
  createVocabularyLevel({
    subjectId: "english-exercises",
    levelNumber: 7,
    themeLabel: "Greetings and Flags",
    difficultyStage: 4,
    supportProfile: "sound + picture",
    reviewWords: pickWords(greetingLookup, [
      "greeting-sawasdee",
      "greeting-mabuhay",
      "greeting-ni-hao",
      "greeting-hello",
      "greeting-kia-ora",
    ]),
    mapCaption: "Greetings",
    exercises: [
      createSoundPickChallenge(
        "english-ex-l7-1",
        greetingLookup.get("greeting-sawasdee"),
        pickWords(greetingLookup, [
          "greeting-sawasdee",
          "greeting-mabuhay",
          "greeting-ni-hao",
          "greeting-hello",
        ]),
      ),
      createSoundPickChallenge(
        "english-ex-l7-2",
        greetingLookup.get("greeting-mabuhay"),
        pickWords(greetingLookup, [
          "greeting-mabuhay",
          "greeting-ni-hao",
          "greeting-hello",
          "greeting-kia-ora",
        ]),
      ),
      createWordToPictureChallenge(
        "english-ex-l7-3",
        greetingLookup.get("greeting-ni-hao"),
        pickWords(greetingLookup, [
          "greeting-ni-hao",
          "greeting-sawasdee",
          "greeting-hello",
          "greeting-kia-ora",
        ]),
      ),
      createPicturePickChallenge(
        "english-ex-l7-4",
        greetingLookup.get("greeting-hello"),
        pickWords(greetingLookup, [
          "greeting-hello",
          "greeting-ni-hao",
          "greeting-mabuhay",
          "greeting-sawasdee",
        ]),
      ),
      createWordToPictureChallenge(
        "english-ex-l7-5",
        greetingLookup.get("greeting-kia-ora"),
        pickWords(greetingLookup, [
          "greeting-kia-ora",
          "greeting-hello",
          "greeting-ni-hao",
          "greeting-sawasdee",
        ]),
      ),
    ],
  }),
  createVocabularyLevel({
    subjectId: "english-exercises",
    levelNumber: 8,
    themeLabel: "Workbook Review",
    difficultyStage: 5,
    supportProfile: "mixed support",
    reviewWords: [
      ...pickWords(fruitLookup, ["carrot", "onion"]),
      ...pickWords(schoolLookup, ["glue", "notebook"]),
      ...pickWords(toyLookup, ["toy-robot", "toy-car"]),
      ...pickWords(foodLookup, ["food-juice", "food-soup"]),
    ],
    mapCaption: "Review",
    exercises: [
      createOddOneOutChallenge(
        "english-ex-l8-1",
        pickWords(fruitLookup, ["cabbage", "carrot", "broccoli"]),
        toyLookup.get("toy-car"),
        { promptText: "Which one is not a vegetable?" },
      ),
      createSortTwoBasketsChallenge("english-ex-l8-2", {
        leftBasket: { id: "toy", label: "Toy" },
        rightBasket: { id: "food", label: "Food" },
        leftWords: pickWords(toyLookup, ["toy-robot", "toy-ball", "toy-doll"]),
        rightWords: pickWords(foodLookup, ["food-juice", "food-cake", "food-pizza"]),
        promptText: "Sort the pictures into toys and food.",
      }),
      createSortTwoBasketsChallenge("english-ex-l8-3", {
        leftBasket: { id: "school", label: "School" },
        rightBasket: { id: "vegetable", label: "Vegetable" },
        leftWords: pickWords(schoolLookup, ["glue", "notebook", "ruler"]),
        rightWords: pickWords(fruitLookup, ["onion", "cucumber", "pumpkin"]),
        promptText: "Sort the pictures into school things and vegetables.",
      }),
      createWordToPictureChallenge(
        "english-ex-l8-4",
        schoolLookup.get("glue"),
        pickWords(schoolLookup, ["glue", "eraser", "tape", "sharpener"]),
      ),
      createSoundPickChallenge(
        "english-ex-l8-5",
        foodLookup.get("food-soup"),
        pickWords(foodLookup, ["food-soup", "food-tea", "food-rice", "food-fish"]),
      ),
    ],
  }),
  createVocabularyLevel({
    subjectId: "english-exercises",
    levelNumber: 9,
    themeLabel: "Pronoun Heroes",
    difficultyStage: 3,
    supportProfile: "character picture + sentence",
    reviewWords: pronounWords,
    mapCaption: "Pronouns",
    exercises: [
      createPicturePickChallenge("english-ex-l9-1", pronounLookup.get("pronoun-he"), pronounWords, {
        promptText: "Tom is a boy. ___ is six years old.",
        listenText: "Tom is a boy. He is six years old.",
      }),
      createPicturePickChallenge("english-ex-l9-2", pronounLookup.get("pronoun-she"), pronounWords, {
        promptText: "Mia is a girl. ___ likes to read.",
        listenText: "Mia is a girl. She likes to read.",
      }),
      createPicturePickChallenge("english-ex-l9-3", pronounLookup.get("pronoun-it"), pronounWords, {
        promptText: "The cat is small. ___ is sleeping.",
        listenText: "The cat is small. It is sleeping.",
      }),
      createPicturePickChallenge("english-ex-l9-4", pronounLookup.get("pronoun-they"), pronounWords, {
        promptText: "Tom and Mia are friends. ___ play together.",
        listenText: "Tom and Mia are friends. They play together.",
      }),
    ],
  }),
  createVocabularyLevel({
    subjectId: "english-exercises",
    levelNumber: 10,
    themeLabel: "Plural Power",
    difficultyStage: 3,
    supportProfile: "one or many pictures",
    reviewWords: pluralWords,
    mapCaption: "Plurals",
    exercises: [
      createPicturePickChallenge("english-ex-l10-1", pluralLookup.get("plural-apples"), pluralWords, {
        promptText: "Choose more than one apple.",
        listenText: "Apples. More than one apple.",
      }),
      createPicturePickChallenge("english-ex-l10-2", pluralLookup.get("plural-books"), pluralWords, {
        promptText: "Choose more than one book.",
        listenText: "Books. More than one book.",
      }),
      createPicturePickChallenge("english-ex-l10-3", pluralLookup.get("plural-cats"), pluralWords, {
        promptText: "Choose more than one cat.",
        listenText: "Cats. More than one cat.",
      }),
      createPicturePickChallenge("english-ex-l10-4", pluralLookup.get("plural-one-apple"), pluralWords, {
        promptText: "Choose one apple.",
        listenText: "Apple. One apple.",
      }),
      createPicturePickChallenge("english-ex-l10-5", pluralLookup.get("plural-one-book"), pluralWords, {
        promptText: "Choose one book.",
        listenText: "Book. One book.",
      }),
    ],
  }),
  createVocabularyLevel({
    subjectId: "english-exercises",
    levelNumber: 11,
    themeLabel: "Position Quest",
    difficultyStage: 4,
    supportProfile: "ball + box picture",
    reviewWords: positionWords,
    mapCaption: "Position words",
    exercises: [
      createPicturePickChallenge("english-ex-l11-1", positionLookup.get("position-in"), positionWords, {
        promptText: "The ball is ___ the box.",
        listenText: "The ball is in the box.",
      }),
      createPicturePickChallenge("english-ex-l11-2", positionLookup.get("position-on"), positionWords, {
        promptText: "The ball is ___ the box.",
        listenText: "The ball is on the box.",
      }),
      createPicturePickChallenge("english-ex-l11-3", positionLookup.get("position-under"), positionWords, {
        promptText: "The ball is ___ the box.",
        listenText: "The ball is under the box.",
      }),
      createPicturePickChallenge("english-ex-l11-4", positionLookup.get("position-next-to"), positionWords, {
        promptText: "The ball is ___ the box.",
        listenText: "The ball is next to the box.",
      }),
    ],
  }),
];

export const englishExercisesSubject = {
  id: "english-exercises",
  name: "English Exercises",
  category: "exercise",
  icon: "📒",
  description: "English practice with vocabulary, pronouns, plurals, and position words.",
  words: collectLevelWords(englishExerciseLevels),
  levels: englishExerciseLevels,
};

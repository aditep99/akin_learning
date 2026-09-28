import { animalsSubject } from "./animals.js";
import { fruitsVegetablesSubject } from "./fruitsVegetables.js";
import { schoolThingsSubject } from "./schoolThings.js";
import {
  createSpellingLevel,
  createMissingLetterChallenge,
  createSpellingOrderChallenge,
  createSpellingSprintChallenge,
  createSpellingWord,
  flattenLevelWords,
  createWordChoiceChallenge,
  createWordRepairChallenge,
  createWriteFromMemoryChallenge,
} from "./spellingShared.js";

function buildLookup(subject) {
  return new Map(subject.words.map((word) => [word.id, word]));
}

const animalLookup = buildLookup(animalsSubject);
const fruitLookup = buildLookup(fruitsVegetablesSubject);
const schoolLookup = buildLookup(schoolThingsSubject);

const collectionThemes = {
  days: {
    collection: "days",
    collectionLabel: "Days of Week",
    themeKey: "sun",
    buddyName: "Sunny",
    themeHint: "Weekly word parade",
  },
  months: {
    collection: "months",
    collectionLabel: "Months",
    themeKey: "plum",
    buddyName: "Puff",
    themeHint: "Calendar star trail",
  },
  vegetables: {
    collection: "vegetables",
    collectionLabel: "Vegetables",
    themeKey: "mint",
    buddyName: "Mimo",
    themeHint: "Garden spelling quest",
  },
  animals: {
    collection: "animals",
    collectionLabel: "Animals",
    themeKey: "sun",
    buddyName: "Sunny",
    themeHint: "Safari spelling run",
  },
  school: {
    collection: "school",
    collectionLabel: "School Things",
    themeKey: "plum",
    buddyName: "Puff",
    themeHint: "Classroom tool mission",
  },
  things: {
    collection: "things",
    collectionLabel: "Everyday Things",
    themeKey: "mint",
    buddyName: "Mimo",
    themeHint: "Around-you object hunt",
  },
  mixed: {
    collection: "mixed",
    collectionLabel: "Mixed Challenge",
    themeKey: "sun",
    buddyName: "Akin Team",
    themeHint: "Monster grand finale",
  },
};

function capitalizeWord(word = "") {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function getSpeakingSentence(word, collection) {
  const displayWord = capitalizeWord(word);
  const article = /^[aeiou]/i.test(word) ? "an" : "a";

  switch (collection) {
    case "days":
      return `Today is ${displayWord}.`;
    case "months":
      return `My birthday is in ${displayWord}.`;
    case "vegetables":
      return `I like ${word}.`;
    case "animals":
      return `I see ${article} ${word}.`;
    case "school":
      return `May I borrow ${article} ${word}, please?`;
    case "things":
      return `This is my ${word}.`;
    default:
      return `Can you see the ${word}?`;
  }
}

function withCollection(data, collection) {
  return {
    ...data,
    ...collectionThemes[collection],
    learningFlow: ["learn", "write", "speak"],
    speakSentence: getSpeakingSentence(data.word, collection),
  };
}

function fromSource(sourceWord, collection, overrides = {}) {
  return createSpellingWord(
    withCollection(
      {
        id: `english-spelling-${sourceWord.id}`,
        word: sourceWord.word.toLowerCase(),
        translation: sourceWord.translation,
        image: sourceWord.image,
        emoji: sourceWord.emoji,
        phonics: sourceWord.phonics,
        pronunciation: sourceWord.pronunciation,
        language: "en",
        ...overrides,
      },
      collection,
    ),
  );
}

function fromNewWord(collection, wordData) {
  return createSpellingWord(
    withCollection(
      {
        ...wordData,
        id: `english-spelling-${wordData.id}`,
        language: "en",
      },
      collection,
    ),
  );
}

const spellingWords = {
  monday: fromNewWord("days", {
    id: "monday",
    word: "monday",
    translation: "วันจันทร์",
    emoji: "🌞",
    phonics: "มัน-เดย์",
    pronunciation: { guide: "Monday", ipa: "/ˈmʌn.deɪ/" },
  }),
  tuesday: fromNewWord("days", {
    id: "tuesday",
    word: "tuesday",
    translation: "วันอังคาร",
    emoji: "🚀",
    phonics: "ทิวซ-เดย์",
    pronunciation: { guide: "Tuesday", ipa: "/ˈtuːz.deɪ/" },
  }),
  wednesday: fromNewWord("days", {
    id: "wednesday",
    word: "wednesday",
    translation: "วันพุธ",
    emoji: "⭐",
    phonics: "เวนซ-เดย์",
    pronunciation: { guide: "Wednesday", ipa: "/ˈwenz.deɪ/" },
  }),
  thursday: fromNewWord("days", {
    id: "thursday",
    word: "thursday",
    translation: "วันพฤหัสบดี",
    emoji: "⚡",
    phonics: "เธิร์ซ-เดย์",
    pronunciation: { guide: "Thursday", ipa: "/ˈθɝːz.deɪ/" },
  }),
  friday: fromNewWord("days", {
    id: "friday",
    word: "friday",
    translation: "วันศุกร์",
    emoji: "🎉",
    phonics: "ฟราย-เดย์",
    pronunciation: { guide: "Friday", ipa: "/ˈfraɪ.deɪ/" },
  }),
  saturday: fromNewWord("days", {
    id: "saturday",
    word: "saturday",
    translation: "วันเสาร์",
    emoji: "🌈",
    phonics: "แซท-เทอร์-เดย์",
    pronunciation: { guide: "Saturday", ipa: "/ˈsæt̬.ɚ.deɪ/" },
  }),
  sunday: fromNewWord("days", {
    id: "sunday",
    word: "sunday",
    translation: "วันอาทิตย์",
    emoji: "☀️",
    phonics: "ซัน-เดย์",
    pronunciation: { guide: "Sunday", ipa: "/ˈsʌn.deɪ/" },
  }),
  january: fromNewWord("months", {
    id: "january",
    word: "january",
    translation: "มกราคม",
    emoji: "❄️",
    phonics: "แจน-ยัว-รี",
    pronunciation: { guide: "January", ipa: "/ˈdʒæn.ju.er.i/" },
  }),
  february: fromNewWord("months", {
    id: "february",
    word: "february",
    translation: "กุมภาพันธ์",
    emoji: "💝",
    phonics: "เฟบ-รู-เออ-รี",
    pronunciation: { guide: "February", ipa: "/ˈfeb.ruˌer.i/" },
  }),
  march: fromNewWord("months", {
    id: "march",
    word: "march",
    translation: "มีนาคม",
    emoji: "🌼",
    phonics: "มาร์ช",
    pronunciation: { guide: "March", ipa: "/mɑːrtʃ/" },
  }),
  april: fromNewWord("months", {
    id: "april",
    word: "april",
    translation: "เมษายน",
    emoji: "🌤️",
    phonics: "เอ-พริล",
    pronunciation: { guide: "April", ipa: "/ˈeɪ.prəl/" },
  }),
  may: fromNewWord("months", {
    id: "may",
    word: "may",
    translation: "พฤษภาคม",
    emoji: "🌸",
    phonics: "เมย์",
    pronunciation: { guide: "May", ipa: "/meɪ/" },
  }),
  june: fromNewWord("months", {
    id: "june",
    word: "june",
    translation: "มิถุนายน",
    emoji: "🏖️",
    phonics: "จูน",
    pronunciation: { guide: "June", ipa: "/dʒuːn/" },
  }),
  july: fromNewWord("months", {
    id: "july",
    word: "july",
    translation: "กรกฎาคม",
    emoji: "🎆",
    phonics: "จู-ไล",
    pronunciation: { guide: "July", ipa: "/dʒuˈlaɪ/" },
  }),
  august: fromNewWord("months", {
    id: "august",
    word: "august",
    translation: "สิงหาคม",
    emoji: "🌻",
    phonics: "ออ-กัสท์",
    pronunciation: { guide: "August", ipa: "/ˈɑː.ɡəst/" },
  }),
  september: fromNewWord("months", {
    id: "september",
    word: "september",
    translation: "กันยายน",
    emoji: "🍂",
    phonics: "เซป-เท็ม-เบอร์",
    pronunciation: { guide: "September", ipa: "/sepˈtem.bɚ/" },
  }),
  october: fromNewWord("months", {
    id: "october",
    word: "october",
    translation: "ตุลาคม",
    emoji: "🎃",
    phonics: "ออค-โท-เบอร์",
    pronunciation: { guide: "October", ipa: "/ɑːkˈtoʊ.bɚ/" },
  }),
  november: fromNewWord("months", {
    id: "november",
    word: "november",
    translation: "พฤศจิกายน",
    emoji: "🍁",
    phonics: "โน-เว็ม-เบอร์",
    pronunciation: { guide: "November", ipa: "/noʊˈvem.bɚ/" },
  }),
  december: fromNewWord("months", {
    id: "december",
    word: "december",
    translation: "ธันวาคม",
    emoji: "🎄",
    phonics: "ดิ-เซ็ม-เบอร์",
    pronunciation: { guide: "December", ipa: "/dɪˈsem.bɚ/" },
  }),
  carrot: fromSource(fruitLookup.get("carrot"), "vegetables"),
  tomato: fromSource(fruitLookup.get("tomato"), "vegetables"),
  broccoli: fromSource(fruitLookup.get("broccoli"), "vegetables"),
  cucumber: fromSource(fruitLookup.get("cucumber"), "vegetables"),
  onion: fromSource(fruitLookup.get("onion"), "vegetables"),
  pumpkin: fromSource(fruitLookup.get("pumpkin"), "vegetables"),
  corn: fromSource(fruitLookup.get("corn"), "vegetables"),
  cat: fromSource(animalLookup.get("cat"), "animals"),
  dog: fromSource(animalLookup.get("dog"), "animals"),
  rabbit: fromSource(animalLookup.get("rabbit"), "animals"),
  lion: fromSource(animalLookup.get("lion"), "animals"),
  elephant: fromSource(animalLookup.get("elephant"), "animals"),
  fish: fromSource(animalLookup.get("fish"), "animals"),
  bird: fromSource(animalLookup.get("bird"), "animals"),
  book: fromSource(schoolLookup.get("book"), "school"),
  pencil: fromSource(schoolLookup.get("pencil"), "school"),
  ruler: fromSource(schoolLookup.get("ruler"), "school"),
  notebook: fromSource(schoolLookup.get("notebook"), "school"),
  scissors: fromSource(schoolLookup.get("scissors"), "school"),
  glue: fromSource(schoolLookup.get("glue"), "school"),
  bag: fromSource(schoolLookup.get("bag"), "things"),
  chair: fromSource(schoolLookup.get("chair"), "things"),
  desk: fromSource(schoolLookup.get("desk"), "things"),
  paper: fromSource(schoolLookup.get("paper"), "things"),
  folder: fromSource(schoolLookup.get("folder"), "things"),
  clock: fromSource(schoolLookup.get("clock"), "things"),
  apple: fromSource(fruitLookup.get("apple"), "mixed"),
  banana: fromSource(fruitLookup.get("banana"), "mixed"),
  goat: fromSource(animalLookup.get("goat"), "mixed"),
  map: fromSource(schoolLookup.get("map"), "mixed"),
};

const englishSpellingLevels = [
  createSpellingLevel(
    "english-spelling",
    1,
    [
      spellingWords.monday,
      spellingWords.tuesday,
      spellingWords.wednesday,
      spellingWords.thursday,
      spellingWords.friday,
      spellingWords.saturday,
      spellingWords.sunday,
    ],
    {
      mode: "learn-write-speak",
      themeLabel: "Days of Week",
      supportProfile: "calendar words + full spelling",
      exercises: [
        createSpellingOrderChallenge("english-spelling-l1-1", spellingWords.monday, "learn-write-speak"),
        createSpellingOrderChallenge("english-spelling-l1-2", spellingWords.tuesday, "learn-write-speak"),
        createSpellingOrderChallenge("english-spelling-l1-3", spellingWords.wednesday, "learn-write-speak"),
        createSpellingOrderChallenge("english-spelling-l1-4", spellingWords.thursday, "learn-write-speak"),
        createSpellingOrderChallenge("english-spelling-l1-5", spellingWords.friday, "learn-write-speak"),
        createSpellingOrderChallenge("english-spelling-l1-6", spellingWords.saturday, "learn-write-speak"),
        createSpellingOrderChallenge("english-spelling-l1-7", spellingWords.sunday, "learn-write-speak"),
      ],
      mapCaption: "Week words",
    },
  ),
  createSpellingLevel(
    "english-spelling",
    2,
    [
      spellingWords.january,
      spellingWords.february,
      spellingWords.march,
      spellingWords.april,
      spellingWords.may,
      spellingWords.june,
    ],
    {
      mode: "token-bank-limited",
      themeLabel: "Months Jan-Jun",
      supportProfile: "calendar words + full spelling",
      exercises: [
        createSpellingOrderChallenge("english-spelling-l2-1", spellingWords.january, "token-bank-limited"),
        createSpellingOrderChallenge("english-spelling-l2-2", spellingWords.february, "token-bank-limited"),
        createSpellingOrderChallenge("english-spelling-l2-3", spellingWords.march, "token-bank-limited"),
        createSpellingOrderChallenge("english-spelling-l2-4", spellingWords.april, "token-bank-limited"),
        createSpellingOrderChallenge("english-spelling-l2-5", spellingWords.may, "token-bank-limited"),
        createSpellingOrderChallenge("english-spelling-l2-6", spellingWords.june, "token-bank-limited"),
      ],
      mapCaption: "Month stars 1",
    },
  ),
  createSpellingLevel(
    "english-spelling",
    3,
    [
      spellingWords.july,
      spellingWords.august,
      spellingWords.september,
      spellingWords.october,
      spellingWords.november,
      spellingWords.december,
    ],
    {
      mode: "missing-letter",
      themeLabel: "Months Jul-Dec",
      supportProfile: "calendar words + missing letter",
      exercises: [
        createMissingLetterChallenge("english-spelling-l3-1", spellingWords.july, 1, ["u", "a", "o", "e"]),
        createMissingLetterChallenge("english-spelling-l3-2", spellingWords.august, 1, ["u", "a", "o", "e"]),
        createMissingLetterChallenge("english-spelling-l3-3", spellingWords.september, 2, ["p", "t", "r", "m"]),
        createMissingLetterChallenge("english-spelling-l3-4", spellingWords.october, 1, ["c", "t", "b", "p"]),
        createMissingLetterChallenge("english-spelling-l3-5", spellingWords.november, 2, ["v", "m", "b", "n"]),
        createMissingLetterChallenge("english-spelling-l3-6", spellingWords.december, 2, ["c", "s", "m", "t"]),
      ],
      mapCaption: "Month stars 2",
    },
  ),
  createSpellingLevel(
    "english-spelling",
    4,
    [
      spellingWords.carrot,
      spellingWords.tomato,
      spellingWords.broccoli,
      spellingWords.cucumber,
      spellingWords.onion,
      spellingWords.pumpkin,
    ],
    {
      mode: "sound-to-word-choice",
      themeLabel: "Vegetable Garden",
      supportProfile: "real picture + listening choice",
      exercises: [
        createWordChoiceChallenge("english-spelling-l4-1", "sound-to-word-choice", spellingWords.carrot, ["carrot", "parrot", "carpet", "carat"], "Listen and choose the vegetable."),
        createWordChoiceChallenge("english-spelling-l4-2", "sound-to-word-choice", spellingWords.tomato, ["tomato", "potato", "tomorrow", "tomatos"], "Listen and choose the vegetable."),
        createWordChoiceChallenge("english-spelling-l4-3", "sound-to-word-choice", spellingWords.broccoli, ["broccoli", "brocolli", "brochure", "brokoli"], "Listen and choose the vegetable."),
        createWordChoiceChallenge("english-spelling-l4-4", "sound-to-word-choice", spellingWords.cucumber, ["cucumber", "cucamber", "customer", "cucumer"], "Listen and choose the vegetable."),
        createWordChoiceChallenge("english-spelling-l4-5", "sound-to-word-choice", spellingWords.onion, ["onion", "union", "opinion", "onions"], "Listen and choose the vegetable."),
        createWordChoiceChallenge("english-spelling-l4-6", "sound-to-word-choice", spellingWords.pumpkin, ["pumpkin", "pumkin", "pumpking", "pumping"], "Listen and choose the vegetable."),
      ],
      mapCaption: "Garden spell",
    },
  ),
  createSpellingLevel(
    "english-spelling",
    5,
    [
      spellingWords.cat,
      spellingWords.dog,
      spellingWords.rabbit,
      spellingWords.lion,
      spellingWords.elephant,
      spellingWords.fish,
    ],
    {
      mode: "tricky-word-pick",
      themeLabel: "Animal Safari",
      supportProfile: "near-spelling animal words",
      exercises: [
        createWordChoiceChallenge("english-spelling-l5-1", "tricky-word-pick", spellingWords.cat, ["cat", "cot", "cart", "cap"], "Look carefully and choose the animal word."),
        createWordChoiceChallenge("english-spelling-l5-2", "tricky-word-pick", spellingWords.dog, ["dog", "dig", "dot", "doe"], "Look carefully and choose the animal word."),
        createWordChoiceChallenge("english-spelling-l5-3", "tricky-word-pick", spellingWords.rabbit, ["rabbit", "rabitt", "rabit", "rabbits"], "Look carefully and choose the animal word."),
        createWordChoiceChallenge("english-spelling-l5-4", "tricky-word-pick", spellingWords.lion, ["lion", "lin", "liont", "loin"], "Look carefully and choose the animal word."),
        createWordChoiceChallenge("english-spelling-l5-5", "tricky-word-pick", spellingWords.elephant, ["elephant", "elefant", "elephent", "elevant"], "Look carefully and choose the animal word."),
        createWordChoiceChallenge("english-spelling-l5-6", "tricky-word-pick", spellingWords.fish, ["fish", "fich", "dish", "fis"], "Look carefully and choose the animal word."),
      ],
      mapCaption: "Safari spell",
    },
  ),
  createSpellingLevel(
    "english-spelling",
    6,
    [
      spellingWords.book,
      spellingWords.pencil,
      spellingWords.ruler,
      spellingWords.notebook,
      spellingWords.scissors,
      spellingWords.glue,
    ],
    {
      mode: "write-from-memory",
      themeLabel: "School Tools",
      supportProfile: "real picture + memory writing",
      exercises: [
        createWriteFromMemoryChallenge("english-spelling-l6-1", spellingWords.book),
        createWriteFromMemoryChallenge("english-spelling-l6-2", spellingWords.pencil),
        createWriteFromMemoryChallenge("english-spelling-l6-3", spellingWords.ruler),
        createWriteFromMemoryChallenge("english-spelling-l6-4", spellingWords.notebook),
        createWriteFromMemoryChallenge("english-spelling-l6-5", spellingWords.scissors),
        createWriteFromMemoryChallenge("english-spelling-l6-6", spellingWords.glue),
      ],
      mapCaption: "Class tools",
    },
  ),
  createSpellingLevel(
    "english-spelling",
    7,
    [
      spellingWords.bag,
      spellingWords.chair,
      spellingWords.desk,
      spellingWords.paper,
      spellingWords.folder,
      spellingWords.clock,
    ],
    {
      mode: "word-repair",
      themeLabel: "Everyday Things",
      supportProfile: "object pictures + word repair",
      exercises: [
        createWordRepairChallenge("english-spelling-l7-1", spellingWords.bag, { repairIndex: 1 }),
        createWordRepairChallenge("english-spelling-l7-2", spellingWords.chair, { repairIndex: 2 }),
        createWordRepairChallenge("english-spelling-l7-3", spellingWords.desk, { repairIndex: 1 }),
        createWordRepairChallenge("english-spelling-l7-4", spellingWords.paper, { repairIndex: 1 }),
        createWordRepairChallenge("english-spelling-l7-5", spellingWords.folder, { repairIndex: 2 }),
        createWordRepairChallenge("english-spelling-l7-6", spellingWords.clock, { repairIndex: 2 }),
      ],
      mapCaption: "Object spell",
    },
  ),
  createSpellingLevel(
    "english-spelling",
    8,
    [
      spellingWords.corn,
      spellingWords.bird,
      spellingWords.apple,
      spellingWords.banana,
      spellingWords.goat,
      spellingWords.map,
    ],
    {
      mode: "spelling-sprint",
      themeLabel: "Monster Mix",
      supportProfile: "mixed spelling sprint",
      exercises: [
        createSpellingSprintChallenge("english-spelling-l8-1", withCollection(spellingWords.corn, "mixed"), 1, 6),
        createSpellingSprintChallenge("english-spelling-l8-2", withCollection(spellingWords.bird, "mixed"), 2, 6),
        createSpellingSprintChallenge("english-spelling-l8-3", withCollection(spellingWords.apple, "mixed"), 3, 6),
        createSpellingSprintChallenge("english-spelling-l8-4", withCollection(spellingWords.banana, "mixed"), 4, 6),
        createSpellingSprintChallenge("english-spelling-l8-5", withCollection(spellingWords.goat, "mixed"), 5, 6),
        createSpellingSprintChallenge("english-spelling-l8-6", withCollection(spellingWords.map, "mixed"), 6, 6),
      ],
      reviewWords: [
        spellingWords.corn,
        spellingWords.bird,
        spellingWords.apple,
        spellingWords.banana,
        spellingWords.goat,
        spellingWords.map,
      ],
      mapCaption: "Boss mix",
    },
  ),
];

export const englishSpellingSubject = {
  id: "english-spelling",
  name: "English Spelling",
  category: "exercise",
  icon: "🔤",
  description: "Learn, write, and speak useful English words from every lesson.",
  words: flattenLevelWords(englishSpellingLevels),
  levels: englishSpellingLevels,
};

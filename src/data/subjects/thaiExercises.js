import { animalsSubject } from "./animals.js";
import { bodySubject } from "./body.js";
import { fruitsVegetablesSubject } from "./fruitsVegetables.js";
import { schoolThingsSubject } from "./schoolThings.js";
import {
  createMissingLetterChallenge,
  createSpellingLevel,
  createSpellingOrderChallenge,
  createSpellingWord,
  createWordChoiceChallenge,
  flattenLevelWords,
} from "./spellingShared.js";

function buildLookup(subject) {
  return new Map(subject.words.map((word) => [word.id, word]));
}

function fromSource(id, thaiWord, sourceWord, phonics = thaiWord) {
  return createSpellingWord({
    id: `thai-exercises-${id}`,
    word: thaiWord,
    translation: sourceWord.word,
    image: sourceWord.image,
    emoji: sourceWord.emoji,
    phonics,
    pronunciation: {
      guide: sourceWord.word,
      ipa: sourceWord.pronunciation?.ipa || "",
    },
    language: "th",
  });
}

const animalLookup = buildLookup(animalsSubject);
const bodyLookup = buildLookup(bodySubject);
const fruitLookup = buildLookup(fruitsVegetablesSubject);
const schoolLookup = buildLookup(schoolThingsSubject);

const thaiWords = {
  ta: fromSource("ta", "ตา", bodyLookup.get("eye")),
  hu: fromSource("hu", "หู", bodyLookup.get("ear")),
  pak: fromSource("pak", "ปาก", bodyLookup.get("mouth")),
  mue: fromSource("mue", "มือ", bodyLookup.get("hand")),
  maeo: fromSource("maeo", "แมว", animalLookup.get("cat")),
  pla: fromSource("pla", "ปลา", animalLookup.get("fish")),
  hua: fromSource("hua", "หัว", bodyLookup.get("head")),
  chamuk: fromSource("chamuk", "จมูก", bodyLookup.get("nose")),
  kha: fromSource("kha", "ขา", bodyLookup.get("leg")),
  thao: fromSource("thao", "เท้า", bodyLookup.get("foot")),
  som: fromSource("som", "ส้ม", fruitLookup.get("orange")),
  kluai: fromSource("kluai", "กล้วย", fruitLookup.get("banana")),
  apple: fromSource("apple", "แอปเปิล", fruitLookup.get("apple")),
  grape: fromSource("grape", "องุ่น", fruitLookup.get("grape")),
  nangsue: fromSource("nangsue", "หนังสือ", schoolLookup.get("book")),
  pakka: fromSource("pakka", "ปากกา", schoolLookup.get("pen")),
  dinso: fromSource("dinso", "ดินสอ", schoolLookup.get("pencil")),
  krapao: fromSource("krapao", "กระเป๋า", schoolLookup.get("bag")),
  to: fromSource("to", "โต๊ะ", schoolLookup.get("desk")),
  kaoi: fromSource("kaoi", "เก้าอี้", schoolLookup.get("chair")),
};

const thaiExerciseLevels = [
  createSpellingLevel(
    "thai-exercises",
    1,
    [thaiWords.ta, thaiWords.hu, thaiWords.pak, thaiWords.mue, thaiWords.maeo, thaiWords.pla],
    {
      mode: "spelling-order",
      themeLabel: "เรียงคำ",
      supportProfile: "picture + sound",
      exercises: [
        createSpellingOrderChallenge("thai-ex-l1-1", thaiWords.ta),
        createSpellingOrderChallenge("thai-ex-l1-2", thaiWords.hu),
        createSpellingOrderChallenge("thai-ex-l1-3", thaiWords.pak),
        createSpellingOrderChallenge("thai-ex-l1-4", thaiWords.mue),
        createSpellingOrderChallenge("thai-ex-l1-5", thaiWords.maeo),
        createSpellingOrderChallenge("thai-ex-l1-6", thaiWords.pla),
      ],
      mapCaption: "เรียงคำ",
    },
  ),
  createSpellingLevel(
    "thai-exercises",
    2,
    [thaiWords.hua, thaiWords.chamuk, thaiWords.kha, thaiWords.thao, thaiWords.som, thaiWords.kluai],
    {
      mode: "token-bank-limited",
      themeLabel: "คลังตัวอักษร",
      supportProfile: "picture + sound + token bank",
      exercises: [
        createSpellingOrderChallenge("thai-ex-l2-1", thaiWords.hua, "token-bank-limited"),
        createSpellingOrderChallenge("thai-ex-l2-2", thaiWords.chamuk, "token-bank-limited"),
        createSpellingOrderChallenge("thai-ex-l2-3", thaiWords.kha, "token-bank-limited"),
        createSpellingOrderChallenge("thai-ex-l2-4", thaiWords.thao, "token-bank-limited"),
        createSpellingOrderChallenge("thai-ex-l2-5", thaiWords.som, "token-bank-limited"),
        createSpellingOrderChallenge("thai-ex-l2-6", thaiWords.kluai, "token-bank-limited"),
      ],
      mapCaption: "คลังตัวอักษร",
    },
  ),
  createSpellingLevel(
    "thai-exercises",
    3,
    [thaiWords.apple, thaiWords.grape, thaiWords.nangsue, thaiWords.pakka, thaiWords.dinso, thaiWords.krapao],
    {
      mode: "missing-letter",
      themeLabel: "เติมตัวอักษร",
      supportProfile: "picture + word pattern",
      exercises: [
        createMissingLetterChallenge("thai-ex-l3-1", thaiWords.apple, 2, ["ป", "บ", "ผ", "พ"]),
        createMissingLetterChallenge("thai-ex-l3-2", thaiWords.grape, 1, ["ง", "น", "ม", "ก"]),
        createMissingLetterChallenge("thai-ex-l3-3", thaiWords.nangsue, 3, ["ส", "ษ", "ศ", "ซ"]),
        createMissingLetterChallenge("thai-ex-l3-4", thaiWords.pakka, 2, ["ก", "ค", "ข", "ต"]),
        createMissingLetterChallenge("thai-ex-l3-5", thaiWords.dinso, 1, ["ิ", "ี", "ึ", "ุ"]),
        createMissingLetterChallenge("thai-ex-l3-6", thaiWords.krapao, 4, ["เ", "โ", "แ", "า"]),
      ],
      mapCaption: "เติมคำ",
    },
  ),
  createSpellingLevel(
    "thai-exercises",
    4,
    [thaiWords.to, thaiWords.kaoi, thaiWords.maeo, thaiWords.pla, thaiWords.hua, thaiWords.pak],
    {
      mode: "sound-to-word-choice",
      themeLabel: "ฟังและเลือก",
      supportProfile: "sound + picture",
      exercises: [
        createWordChoiceChallenge("thai-ex-l4-1", "sound-to-word-choice", thaiWords.to, ["โต๊ะ", "โตะ", "โต้ะ", "ต๊ะ"], "ฟังแล้วเลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-ex-l4-2", "sound-to-word-choice", thaiWords.kaoi, ["เก้าอี้", "เกาอี้", "เก๋าอี้", "เก้าอี"], "ฟังแล้วเลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-ex-l4-3", "sound-to-word-choice", thaiWords.maeo, ["แมว", "แมวว", "แม่ว", "เมว"], "ฟังแล้วเลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-ex-l4-4", "sound-to-word-choice", thaiWords.pla, ["ปลา", "ปรา", "พลา", "บลา"], "ฟังแล้วเลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-ex-l4-5", "sound-to-word-choice", thaiWords.hua, ["หัว", "ฮัว", "ห้ว", "หวา"], "ฟังแล้วเลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-ex-l4-6", "sound-to-word-choice", thaiWords.pak, ["ปาก", "ปั๊ก", "ภาค", "ปัก"], "ฟังแล้วเลือกคำที่ถูกต้อง"),
      ],
      mapCaption: "ฟังเลือก",
    },
  ),
  createSpellingLevel(
    "thai-exercises",
    5,
    [thaiWords.som, thaiWords.kluai, thaiWords.nangsue, thaiWords.pakka, thaiWords.dinso, thaiWords.krapao],
    {
      mode: "tricky-word-pick",
      themeLabel: "ดูให้ดี",
      supportProfile: "similar words",
      exercises: [
        createWordChoiceChallenge("thai-ex-l5-1", "tricky-word-pick", thaiWords.som, ["ส้ม", "สม", "ซ้ม", "ส่ม"], "เลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-ex-l5-2", "tricky-word-pick", thaiWords.kluai, ["กล้วย", "ก้วย", "กล้วยย", "กลวย"], "เลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-ex-l5-3", "tricky-word-pick", thaiWords.nangsue, ["หนังสือ", "หน้งสือ", "หนังสื่", "หนังศือ"], "เลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-ex-l5-4", "tricky-word-pick", thaiWords.pakka, ["ปากกา", "ปากคา", "ปากก้า", "ปากา"], "เลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-ex-l5-5", "tricky-word-pick", thaiWords.dinso, ["ดินสอ", "ดินศอ", "ดินซอ", "ดินสออ"], "เลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-ex-l5-6", "tricky-word-pick", thaiWords.krapao, ["กระเป๋า", "กระเปา", "กะเป๋า", "กระเป๋"], "เลือกคำที่ถูกต้อง"),
      ],
      mapCaption: "ทบทวน",
    },
  ),
];

export const thaiExercisesSubject = {
  id: "thai-exercises",
  name: "Thai Exercises",
  category: "exercise",
  icon: "กข",
  description: "อ่านคำ, เรียงคำ, เติมคำ, และเลือกคำภาษาไทยให้ถูกต้อง",
  words: flattenLevelWords(thaiExerciseLevels),
  levels: thaiExerciseLevels,
};

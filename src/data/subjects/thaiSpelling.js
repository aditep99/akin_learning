import { animalsSubject } from "./animals.js";
import { bodySubject } from "./body.js";
import { fruitsVegetablesSubject } from "./fruitsVegetables.js";
import { schoolThingsSubject } from "./schoolThings.js";
import {
  createMissingLetterChallenge,
  createSpellingLevel,
  createSpellingOrderChallenge,
  createSpellingWord,
  createWordRepairChallenge,
  createWordChoiceChallenge,
  flattenLevelWords,
} from "./spellingShared.js";

function buildLookup(subject) {
  return new Map(subject.words.map((word) => [word.id, word]));
}

const animalLookup = buildLookup(animalsSubject);
const bodyLookup = buildLookup(bodySubject);
const fruitLookup = buildLookup(fruitsVegetablesSubject);
const schoolLookup = buildLookup(schoolThingsSubject);

function fromSource(id, thaiWord, sourceWord) {
  return createSpellingWord({
    id: `thai-spelling-${id}`,
    word: thaiWord,
    translation: sourceWord.word,
    image: sourceWord.image,
    emoji: sourceWord.emoji,
    phonics: thaiWord,
    pronunciation: { guide: sourceWord.word, ipa: sourceWord.pronunciation?.ipa || "" },
    language: "th",
  });
}

const thaiWords = {
  ta: fromSource("ta", "ตา", bodyLookup.get("eye")),
  hu: fromSource("hu", "หู", bodyLookup.get("ear")),
  mue: fromSource("mue", "มือ", bodyLookup.get("hand")),
  kha: fromSource("kha", "ขา", bodyLookup.get("leg")),
  maeo: fromSource("maeo", "แมว", animalLookup.get("cat")),
  pla: fromSource("pla", "ปลา", animalLookup.get("fish")),
  hua: fromSource("hua", "หัว", bodyLookup.get("head")),
  pak: fromSource("pak", "ปาก", bodyLookup.get("mouth")),
  chamuk: fromSource("chamuk", "จมูก", bodyLookup.get("nose")),
  thong: fromSource("thong", "ท้อง", bodyLookup.get("stomach")),
  wua: fromSource("wua", "วัว", animalLookup.get("cow")),
  ma: fromSource("ma", "หมา", animalLookup.get("dog")),
  som: fromSource("som", "ส้ม", fruitLookup.get("orange")),
  kluai: fromSource("kluai", "กล้วย", fruitLookup.get("banana")),
  aNgun: fromSource("a-ngun", "องุ่น", fruitLookup.get("grape")),
  mamuang: fromSource("mamuang", "มะม่วง", fruitLookup.get("mango")),
  nangsue: fromSource("nangsue", "หนังสือ", schoolLookup.get("book")),
  pakka: fromSource("pakka", "ปากกา", schoolLookup.get("pen")),
  dinsor: fromSource("dinsor", "ดินสอ", schoolLookup.get("pencil")),
  krapao: fromSource("krapao", "กระเป๋า", schoolLookup.get("bag")),
  to: fromSource("to", "โต๊ะ", schoolLookup.get("desk")),
  kaoi: fromSource("kaoi", "เก้าอี้", schoolLookup.get("chair")),
  singto: fromSource("singto", "สิงโต", animalLookup.get("lion")),
  chang: fromSource("chang", "ช้าง", animalLookup.get("elephant")),
  kratai: fromSource("kratai", "กระต่าย", animalLookup.get("rabbit")),
  kae: fromSource("kae", "แกะ", animalLookup.get("sheep")),
  kai: fromSource("kai", "ไก่", animalLookup.get("hen")),
  ling: fromSource("ling", "ลิง", animalLookup.get("monkey")),
};

const thaiSpellingLevels = [
  createSpellingLevel(
    "thai-spelling",
    1,
    [thaiWords.ta, thaiWords.hu, thaiWords.mue, thaiWords.kha, thaiWords.maeo, thaiWords.pla],
    {
      mode: "spelling-order",
      themeLabel: "Short Thai Words",
      supportProfile: "picture + word",
      exercises: [
        createSpellingOrderChallenge("thai-spelling-l1-1", thaiWords.ta),
        createSpellingOrderChallenge("thai-spelling-l1-2", thaiWords.hu),
        createSpellingOrderChallenge("thai-spelling-l1-3", thaiWords.mue),
        createSpellingOrderChallenge("thai-spelling-l1-4", thaiWords.kha),
        createSpellingOrderChallenge("thai-spelling-l1-5", thaiWords.maeo),
        createSpellingOrderChallenge("thai-spelling-l1-6", thaiWords.pla),
      ],
      mapCaption: "Short words",
    },
  ),
  createSpellingLevel(
    "thai-spelling",
    2,
    [thaiWords.hua, thaiWords.pak, thaiWords.chamuk, thaiWords.thong, thaiWords.wua, thaiWords.ma],
    {
      mode: "token-bank-limited",
      themeLabel: "เรียงคำจากคลังตัวอักษร",
      supportProfile: "picture + sound + token bank",
      exercises: [
        createSpellingOrderChallenge("thai-spelling-l2-1", thaiWords.hua, "token-bank-limited"),
        createSpellingOrderChallenge("thai-spelling-l2-2", thaiWords.pak, "token-bank-limited"),
        createSpellingOrderChallenge("thai-spelling-l2-3", thaiWords.chamuk, "token-bank-limited"),
        createSpellingOrderChallenge("thai-spelling-l2-4", thaiWords.thong, "token-bank-limited"),
        createSpellingOrderChallenge("thai-spelling-l2-5", thaiWords.wua, "token-bank-limited"),
        createSpellingOrderChallenge("thai-spelling-l2-6", thaiWords.ma, "token-bank-limited"),
      ],
      mapCaption: "คลังตัวอักษร",
    },
  ),
  createSpellingLevel(
    "thai-spelling",
    3,
    [thaiWords.som, thaiWords.kluai, thaiWords.aNgun, thaiWords.mamuang, thaiWords.nangsue, thaiWords.pakka],
    {
      mode: "word-repair",
      themeLabel: "Repair the Word",
      supportProfile: "damaged word + repair tiles",
      exercises: [
        createWordRepairChallenge("thai-spelling-l3-1", thaiWords.som, { repairIndex: 1 }),
        createWordRepairChallenge("thai-spelling-l3-2", thaiWords.kluai, { repairIndex: 1 }),
        createWordRepairChallenge("thai-spelling-l3-3", thaiWords.aNgun, { repairIndex: 1 }),
        createWordRepairChallenge("thai-spelling-l3-4", thaiWords.mamuang, { repairIndex: 2 }),
        createWordRepairChallenge("thai-spelling-l3-5", thaiWords.nangsue, { repairIndex: 2 }),
        createWordRepairChallenge("thai-spelling-l3-6", thaiWords.pakka, { repairIndex: 2 }),
      ],
      mapCaption: "ซ่อมคำ",
    },
  ),
  createSpellingLevel(
    "thai-spelling",
    4,
    [thaiWords.dinsor, thaiWords.krapao, thaiWords.to, thaiWords.kaoi, thaiWords.singto, thaiWords.chang],
    {
      mode: "missing-letter",
      themeLabel: "Missing Character",
      supportProfile: "word pattern + picture",
      exercises: [
        createMissingLetterChallenge("thai-spelling-l4-1", thaiWords.dinsor, 2, ["น", "ม", "ด", "ส"]),
        createMissingLetterChallenge("thai-spelling-l4-2", thaiWords.krapao, 3, ["เ", "า", "ะ", "โ"]),
        createMissingLetterChallenge("thai-spelling-l4-3", thaiWords.to, 1, ["๊", "้", "ั", "า"]),
        createMissingLetterChallenge("thai-spelling-l4-4", thaiWords.kaoi, 3, ["า", "้", "เ", "ี"]),
        createMissingLetterChallenge("thai-spelling-l4-5", thaiWords.singto, 2, ["ง", "น", "ม", "ย"]),
        createMissingLetterChallenge("thai-spelling-l4-6", thaiWords.chang, 1, ["้", "า", "ั", "ำ"]),
      ],
      mapCaption: "Fill one character",
    },
  ),
  createSpellingLevel(
    "thai-spelling",
    5,
    [thaiWords.kratai, thaiWords.kae, thaiWords.kai, thaiWords.ling, thaiWords.hua, thaiWords.pak],
    {
      mode: "sound-to-word-choice",
      themeLabel: "Listen and Choose",
      supportProfile: "sound + picture",
      exercises: [
        createWordChoiceChallenge("thai-spelling-l5-1", "sound-to-word-choice", thaiWords.kratai, ["กระต่าย", "กระทาย", "กะต่าย", "กระดาย"], "ฟังแล้วเลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-spelling-l5-2", "sound-to-word-choice", thaiWords.kae, ["แกะ", "แก้", "แกง", "แก"], "ฟังแล้วเลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-spelling-l5-3", "sound-to-word-choice", thaiWords.kai, ["ไก่", "กัย", "ใก่", "ไก"], "ฟังแล้วเลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-spelling-l5-4", "sound-to-word-choice", thaiWords.ling, ["ลิง", "ลิ้ง", "ริง", "ลิน"], "ฟังแล้วเลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-spelling-l5-5", "sound-to-word-choice", thaiWords.hua, ["หัว", "หว่า", "ฮัว", "ห้ว"], "ฟังแล้วเลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-spelling-l5-6", "sound-to-word-choice", thaiWords.pak, ["ปาก", "ปั๊ก", "ภาค", "ปัก"], "ฟังแล้วเลือกคำที่ถูกต้อง"),
      ],
      mapCaption: "Listen and choose",
    },
  ),
  createSpellingLevel(
    "thai-spelling",
    6,
    [thaiWords.maeo, thaiWords.ma, thaiWords.wua, thaiWords.kha, thaiWords.chang, thaiWords.kai],
    {
      mode: "tricky-word-pick",
      themeLabel: "Look Carefully",
      supportProfile: "similar looking words",
      exercises: [
        createWordChoiceChallenge("thai-spelling-l6-1", "tricky-word-pick", thaiWords.maeo, ["แมว", "แมวว", "แมวะ", "แม่ว"], "เลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-spelling-l6-2", "tricky-word-pick", thaiWords.ma, ["หมา", "มหา", "ม้า", "หา"], "เลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-spelling-l6-3", "tricky-word-pick", thaiWords.wua, ["วัว", "ว่ว", "วา", "วั"], "เลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-spelling-l6-4", "tricky-word-pick", thaiWords.kha, ["ขา", "ค่า", "คา", "ข้า"], "เลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-spelling-l6-5", "tricky-word-pick", thaiWords.chang, ["ช้าง", "ชาง", "ชัาง", "ชาน"], "เลือกคำที่ถูกต้อง"),
        createWordChoiceChallenge("thai-spelling-l6-6", "tricky-word-pick", thaiWords.kai, ["ไก่", "ใก่", "ไก", "ไก๊"], "เลือกคำที่ถูกต้อง"),
      ],
      mapCaption: "Tricky choice",
    },
  ),
];

export const thaiSpellingSubject = {
  id: "thai-spelling",
  name: "Thai Spelling",
  category: "exercise",
  icon: "กข",
  description: "Spell Thai words with varied mini-games.",
  words: flattenLevelWords(thaiSpellingLevels),
  levels: thaiSpellingLevels,
};

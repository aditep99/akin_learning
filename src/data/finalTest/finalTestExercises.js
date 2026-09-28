import { getFinalTestPhotoAsset } from "./finalTestPhotoAssets.js";

const PHOTO = {
  book: "class-book",
  pencil: "class-pencil",
  ruler: "class-ruler",
  bag: "class-bag",
  chair: "class-chair",
  crayon: "class-crayon",
  red: "color-red-apple",
  green: "color-green-leaf",
  blue: "color-blue-ball",
  yellow: "color-yellow-balloon",
  family: "family-inupiat",
  ball: "toy-ball",
  blocks: "toy-blocks",
  carToy: "toy-car",
  doll: "toy-doll",
  planeToy: "toy-plane",
  puzzle: "toy-puzzle",
  robot: "toy-robot",
  teddy: "toy-teddy",
  "toy-car": "toy-car",
  car: "transport-car",
  bicycle: "transport-bicycle",
  plane: "transport-plane",
  bus: "transport-bus",
  train: "transport-train",
  boat: "transport-boat",
  duck: "phonics-duck",
  brush: "phonics-brush",
  circle: "shape-circle",
  square: "shape-square",
  rectangle: "shape-rectangle",
  triangle: "shape-triangle",
};

const WORD_TRANSLATIONS = {
  book: "หนังสือ",
  pencil: "ดินสอ",
  ruler: "ไม้บรรทัด",
  bag: "กระเป๋า",
  chair: "เก้าอี้",
  crayon: "สีเทียน",
  red: "สีแดง",
  green: "สีเขียว",
  blue: "สีน้ำเงิน",
  yellow: "สีเหลือง",
  family: "ครอบครัว",
  ball: "ลูกบอล",
  blocks: "บล็อก",
  carToy: "รถของเล่น",
  planeToy: "เครื่องบินของเล่น",
  car: "รถยนต์",
  doll: "ตุ๊กตา",
  plane: "เครื่องบิน",
  puzzle: "จิ๊กซอว์",
  robot: "หุ่นยนต์",
  teddy: "ตุ๊กตาหมี",
  "toy-car": "รถของเล่น",
  bicycle: "จักรยาน",
  bus: "รถบัส",
  train: "รถไฟ",
  boat: "เรือ",
  duck: "เป็ด",
  brush: "แปรง",
  circle: "วงกลม",
  square: "สี่เหลี่ยมจัตุรัส",
  rectangle: "สี่เหลี่ยมผืนผ้า",
  triangle: "สามเหลี่ยม",
};

const WORD_LABELS = {
  carToy: "toy car",
  planeToy: "toy plane",
  "toy-car": "toy car",
};

const PHONICS = {
  book: "bʊk",
  pencil: "ˈpensəl",
  ruler: "ˈruːlər",
  bag: "bæɡ",
  chair: "tʃer",
  crayon: "ˈkreɪən",
  red: "red",
  green: "ɡriːn",
  blue: "bluː",
  yellow: "ˈjeloʊ",
  family: "ˈfæməli",
  ball: "bɔːl",
  blocks: "blɑːks",
  car: "kɑːr",
  doll: "dɑːl",
  plane: "pleɪn",
  puzzle: "ˈpʌzəl",
  robot: "ˈroʊbɑːt",
  teddy: "ˈtedi",
  "toy-car": "tɔɪ kɑːr",
  bicycle: "ˈbaɪsɪkəl",
  bus: "bʌs",
  train: "treɪn",
  boat: "boʊt",
  duck: "dʌk",
  brush: "brʌʃ",
  circle: "ˈsɜːrkəl",
  square: "skwer",
  rectangle: "ˈrektæŋɡəl",
  triangle: "ˈtraɪæŋɡəl",
};

function makeWord(concept, { id = concept, label = WORD_LABELS[concept] || concept } = {}) {
  const assetId = PHOTO[concept];
  const asset = assetId ? getFinalTestPhotoAsset(assetId) : null;
  return {
    id: `final-word-${id}`,
    conceptId: concept,
    word: label,
    translation: WORD_TRANSLATIONS[concept] || label,
    phonics: PHONICS[concept] || label.toLowerCase(),
    pronunciation: { guide: label.toLowerCase(), ipa: `/${PHONICS[concept] || label.toLowerCase()}/` },
    emoji: "📷",
    ...(asset ? { image: asset.src, photoAssetId: asset.assetId } : {}),
  };
}

const words = Object.keys(WORD_TRANSLATIONS).map((concept) => makeWord(concept));

function textOption(label, value = label) {
  return { id: `option-${String(label).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, label, value };
}

function question(format, skillId, prompt, promptTh, data = {}) {
  return {
    type: "final-test",
    format,
    mode: `final-${format}`,
    skillId,
    prompt: { en: prompt, th: promptTh },
    promptText: prompt,
    ...data,
  };
}

function picture(skill, prompt, promptTh, correct, concepts) {
  const choices = concepts.map((concept) => makeWord(concept));
  return question("picture-choice", skill, prompt, promptTh, {
    answerKind: "choice",
    choices,
    correctChoiceId: choices.find(
      (choice) => choice.conceptId === correct || choice.word.toLowerCase() === correct,
    )?.id,
  });
}

function matching(skill, prompt, promptTh, entries) {
  return question("matching", skill, prompt, promptTh, {
    answerKind: "matching",
    pairs: entries.map(([left, right]) => ({
      left: { label: left, value: left },
      right: { label: right, value: right },
    })),
  });
}

function fill(skill, sentence, sentenceTh, answers) {
  return question("fill-blank", skill, sentence, sentenceTh, {
    answerKind: "text",
    sentence,
    sentenceTh,
    acceptedAnswers: answers.map((answer) => String(answer).toLowerCase()),
  });
}

function order(skill, targetSentence, promptTh) {
  return question("sentence-order", skill, "Put the words in order.", promptTh, {
    answerKind: "sentence-order",
    targetSentence,
    tokens: targetSentence.replace(/[.?!]/g, " $&").trim().split(/\s+/),
  });
}

function reading(skill, passage, passageTh, prompt, promptTh, choices, correct) {
  const options = choices.map((choice) => textOption(choice));
  return question("reading", skill, prompt, promptTh, {
    answerKind: "choice",
    passage,
    passageTh,
    choices: options,
    correctChoiceId: options.find((choice) => choice.value === correct)?.id,
  });
}

function applied(skill, prompt, promptTh, choices, correct, photoAssetId = "") {
  const options = choices.map((choice) => textOption(choice));
  return question("applied", skill, prompt, promptTh, {
    answerKind: "choice",
    scenario: prompt,
    scenarioTh: promptTh,
    ...(photoAssetId ? { photoAssetId } : {}),
    choices: options,
    correctChoiceId: options.find((choice) => choice.value === correct)?.id,
  });
}

function finalizeQuestion(raw, unitNumber, sequence) {
  const id = `final-test-u${unitNumber}-q${String(sequence).padStart(2, "0")}`;
  const next = {
    ...raw,
    id,
    signature: id,
    unitId: `unit-${unitNumber}`,
    finalTestQuestionNumber: sequence,
  };

  if (Array.isArray(raw.choices)) {
    const idMap = new Map();
    const choices = raw.choices.map((choice, index) => {
      const oldId = choice.id;
      const nextId = `${id}-choice-${index + 1}`;
      idMap.set(oldId, nextId);
      return { ...choice, id: nextId };
    });
    next.choices = choices;
    next.correctChoiceId = idMap.get(raw.correctChoiceId) || raw.correctChoiceId;
  }

  if (Array.isArray(raw.pairs)) {
    next.pairs = raw.pairs.map((pair, index) => ({
      ...pair,
      id: `${id}-pair-${index + 1}`,
      left: { ...pair.left, id: `${id}-left-${index + 1}` },
      right: { ...pair.right, id: `${id}-right-${index + 1}` },
    }));
    next.answerMap = Object.fromEntries(
      next.pairs.map((pair) => [pair.left.id, pair.right.id]),
    );
  }

  if (Array.isArray(raw.tokens)) {
    next.tokens = raw.tokens.map((token, index) => ({
      id: `${id}-token-${index + 1}`,
      value: token,
    }));
    next.correctTokenIds = next.tokens.map((token) => token.id);
  }

  return next;
}

function buildUnit(unitNumber, questions, themeLabel, description) {
  const exercises = questions.map((item, index) =>
    finalizeQuestion(item, unitNumber, index + 1),
  );
  return {
    id: `final-test-unit-${unitNumber}`,
    levelNumber: unitNumber,
    label: `Unit ${unitNumber}`,
    themeLabel,
    description,
    mode: "final-test",
    exerciseCount: 40,
    wordCount: 40,
    exercises,
    wordRefs: words.map((word) => word.id),
  };
}

const unit1Pictures = [
  picture("u1:school", "Which picture shows a pencil?", "ภาพใดคือดินสอ", "pencil", ["pencil", "book", "ruler", "bag"]),
  picture("u1:school", "Which picture shows a book?", "ภาพใดคือหนังสือ", "book", ["book", "chair", "crayon", "pencil"]),
  picture("u1:colours", "Find the red picture.", "หาภาพสีแดง", "red", ["red", "green", "blue", "yellow"]),
  picture("u1:colours", "Find the blue picture.", "หาภาพสีน้ำเงิน", "blue", ["blue", "red", "green", "yellow"]),
  picture("u1:school", "Which picture shows a school bag?", "ภาพใดคือกระเป๋านักเรียน", "bag", ["bag", "book", "chair", "ruler"]),
  picture("u1:school", "Which picture shows a ruler?", "ภาพใดคือไม้บรรทัด", "ruler", ["ruler", "pencil", "crayon", "book"]),
  picture("u1:colours", "Which picture is green?", "ภาพใดมีสีเขียว", "green", ["green", "red", "yellow", "blue"]),
  picture("u1:school", "Which picture shows a chair?", "ภาพใดคือเก้าอี้", "chair", ["chair", "bag", "book", "crayon"]),
];
const unit1Matching = [
  matching("u1:school", "Match each word to its meaning.", "จับคู่คำศัพท์กับความหมาย", [["book", "หนังสือ"], ["pencil", "ดินสอ"], ["bag", "กระเป๋า"]]),
  matching("u1:colours", "Match each colour.", "จับคู่สี", [["red", "สีแดง"], ["blue", "สีน้ำเงิน"], ["green", "สีเขียว"]]),
  matching("u1:numbers", "Match the number words.", "จับคู่คำบอกจำนวน", [["one", "1"], ["two", "2"], ["three", "3"]]),
  matching("u1:plural", "Match each phrase to its number.", "จับคู่วลีกับจำนวน", [["one book", "1"], ["two books", "2"], ["three pencils", "3"]]),
  matching("u1:adjectives", "Match the opposite adjectives.", "จับคู่คำคุณศัพท์ตรงข้าม", [["big", "small"], ["long", "short"], ["new", "old"]]),
  matching("u1:school", "Match the classroom words.", "จับคู่คำศัพท์ในห้องเรียน", [["ruler", "ไม้บรรทัด"], ["chair", "เก้าอี้"], ["crayon", "สีเทียน"]]),
];
const unit1Fill = [
  fill("u1:plural", "I have one ___. (book/books)", "เลือก book หรือ books ให้ตรงกับ one", ["book"]),
  fill("u1:plural", "I have two ___. (book/books)", "เลือก book หรือ books ให้ตรงกับ two", ["books"]),
  fill("u1:plural", "I see three ___. (pencil/pencils)", "เลือก pencil หรือ pencils ให้ตรงกับ three", ["pencils"]),
  fill("u1:plural", "One box, two ___.", "หนึ่งกล่อง สอง...", ["boxes"]),
  fill("u1:adjectives", "The bag is ___. (large)", "กระเป๋ามีขนาด...", ["big", "large"]),
  fill("u1:adjectives", "The pencil is ___. (not long)", "ดินสอไม่ยาว แต่...", ["short"]),
  fill("u1:colours", "Write the missing colour word: ___. (r _ d)", "เติมชื่อสีแดงให้ครบคำ", ["red"]),
  fill("u1:numbers", "There are ___ books. (3)", "มีหนังสือ...เล่ม", ["three", "3"]),
];
const unit1Order = [
  order("u1:school", "This is a book.", "เรียงประโยค: นี่คือหนังสือ"),
  order("u1:colours", "It is a red bag.", "เรียงประโยค: มันคือกระเป๋าสีแดง"),
  order("u1:numbers", "I have two pencils.", "เรียงประโยค: ฉันมีดินสอสองแท่ง"),
  order("u1:plural", "These are three books.", "เรียงประโยค: เหล่านี้คือหนังสือสามเล่ม"),
  order("u1:adjectives", "The ruler is long.", "เรียงประโยค: ไม้บรรทัดยาว"),
  order("u1:school", "My chair is new.", "เรียงประโยค: เก้าอี้ของฉันใหม่"),
];
const unit1Reading = [
  reading("u1:reading", "Mia has a red bag. She has two blue books.", "มีอากระเป๋าสีแดง เธอมีหนังสือสีน้ำเงินสองเล่ม", "What colour is Mia's bag?", "กระเป๋าของมีอาสีอะไร", ["red", "blue", "green"], "red"),
  reading("u1:reading", "Ben has one pencil and three crayons.", "เบนมีดินสอหนึ่งแท่งและสีเทียนสามแท่ง", "How many crayons does Ben have?", "เบนมีสีเทียนกี่แท่ง", ["one", "two", "three"], "three"),
  reading("u1:reading", "The ruler is long. The pencil is short.", "ไม้บรรทัดยาว ดินสอสั้น", "Which thing is short?", "สิ่งใดสั้น", ["the ruler", "the pencil", "the bag"], "the pencil"),
  reading("u1:reading", "I see a green chair and a yellow book.", "ฉันเห็นเก้าอี้สีเขียวและหนังสือสีเหลือง", "What is green?", "อะไรมีสีเขียว", ["the chair", "the book", "the pencil"], "the chair"),
  reading("u1:reading", "Ava has two bags. One bag is big.", "เอวามีกระเป๋าสองใบ หนึ่งใบใหญ่", "How many bags are there?", "มีกระเป๋ากี่ใบ", ["one", "two", "three"], "two"),
  reading("u1:reading", "This is my new book. It is blue.", "นี่คือหนังสือเล่มใหม่ของฉัน มันสีน้ำเงิน", "What is new?", "อะไรใหม่", ["the book", "the bag", "the ruler"], "the book"),
];
const unit1Applied = [
  applied("u1:applied", "You have 1 book and get 2 more. How many books?", "มีหนังสือ 1 เล่ม ได้เพิ่ม 2 เล่ม รวมกี่เล่ม", ["two", "three", "four"], "three", PHOTO.book),
  applied("u1:applied", "A red pencil is next to a blue book. Which colour is the pencil?", "ดินสอสีแดงอยู่ข้างหนังสือสีน้ำเงิน ดินสอสีอะไร", ["red", "blue", "green"], "red", PHOTO.pencil),
  applied("u1:applied", "Choose the plural word for two chairs.", "เลือกคำพหูพจน์ของเก้าอี้สองตัว", ["chair", "chairs", "chairss"], "chairs", PHOTO.chair),
  applied("u1:applied", "A long ruler and a short pencil are on the desk. Which is long?", "ไม้บรรทัดยาวและดินสอสั้นอยู่บนโต๊ะ อะไรยาว", ["the ruler", "the pencil", "the desk"], "the ruler", PHOTO.ruler),
  applied("u1:applied", "You see 4 yellow crayons. Which number is correct?", "เห็นสีเทียนสีเหลือง 4 แท่ง เลือกจำนวนที่ถูกต้อง", ["three", "four", "five"], "four", PHOTO.crayon),
  applied("u1:applied", "Which sentence describes this green leaf?", "ประโยคใดอธิบายภาพใบไม้สีเขียว", ["It is green.", "It is red.", "It is blue."], "It is green.", PHOTO.green),
];

const unit2Pictures = [
  picture("u2:family", "Which picture shows a family?", "ภาพใดคือครอบครัว", "family", ["family", "book", "ball", "bus"]),
  picture("u2:have-got", "My brother has got a pencil. Choose his thing.", "พี่ชายมีดินสอ เลือกของของเขา", "pencil", ["pencil", "book", "ball", "robot"]),
  picture("u2:possessives", "Mum has got a bag. Which picture shows her bag?", "แม่มีกระเป๋า เลือกกระเป๋า", "bag", ["bag", "boat", "ruler", "doll"]),
  picture("u2:have-got", "Grandpa sits on a chair. Choose what he sits on.", "ปู่นั่งบนเก้าอี้ เลือกสิ่งที่ใช้นั่ง", "chair", ["chair", "book", "plane", "blocks"]),
  picture("u2:possessives", "Dad drives a car. Find his transport.", "พ่อขับรถยนต์ เลือกยานพาหนะของพ่อ", "car", ["car", "train", "boat", "bicycle"]),
  picture("u2:have-got", "My sister reads a book. Choose what she reads.", "พี่สาวอ่านหนังสือ เลือกสิ่งที่เธออ่าน", "book", ["book", "puzzle", "bus", "pencil"]),
  picture("u2:possessives", "We have got a ball. Find our toy.", "พวกเรามีลูกบอล เลือกของเล่นของเรา", "ball", ["ball", "ruler", "train", "chair"]),
  picture("u2:have-got", "My brother has got a toy car, not a boat. Choose his toy.", "น้องชายมีรถของเล่น ไม่ใช่เรือ", "toy-car", ["toy-car", "book", "boat", "ruler"]),
];
const unit2Matching = [
  matching("u2:family", "Match the family words.", "จับคู่คำศัพท์ครอบครัว", [["mum", "แม่"], ["dad", "พ่อ"], ["sister", "พี่สาว/น้องสาว"]]),
  matching("u2:family", "Match more family words.", "จับคู่คำศัพท์ครอบครัว", [["brother", "พี่ชาย/น้องชาย"], ["grandma", "ย่า/ยาย"], ["grandpa", "ปู่/ตา"]]),
  matching("u2:possessives", "Match the possessive adjectives.", "จับคู่คำแสดงความเป็นเจ้าของ", [["I", "my"], ["you", "your"], ["he", "his"]]),
  matching("u2:possessives", "Match the possessive adjectives.", "จับคู่คำแสดงความเป็นเจ้าของ", [["she", "her"], ["we", "our"], ["they", "their"]]),
  matching("u2:have-got", "Match each subject to its have-got form.", "จับคู่ประธานกับรูป have got", [["I", "I have got"], ["She", "She has got"], ["We", "We have got"]]),
  matching("u2:have-got", "Match positive and negative forms.", "จับคู่รูปบอกเล่าและปฏิเสธ", [["I have got", "I haven't got"], ["He has got", "He hasn't got"], ["They have got", "They haven't got"]]),
];
const unit2Fill = [
  fill("u2:have-got", "I ___ got a sister.", "ฉันมีน้องสาว/พี่สาว", ["have"]),
  fill("u2:have-got", "She ___ got a brother.", "เธอมีพี่ชาย/น้องชาย", ["has"]),
  fill("u2:have-got", "Make it negative: I ___ got a baby brother.", "เติมรูปปฏิเสธ: ฉันไม่มีน้องชายตัวเล็ก", ["haven't", "have not"]),
  fill("u2:have-got", "Make it negative: He ___ got a bike.", "เติมรูปปฏิเสธ: เขาไม่มีจักรยาน", ["hasn't", "has not"]),
  fill("u2:possessives", "This is ___ bag. (I)", "นี่คือกระเป๋าของฉัน", ["my"]),
  fill("u2:possessives", "That is ___ book. (she)", "นั่นคือหนังสือของเธอ", ["her"]),
  fill("u2:possessives", "This is ___ toy. (he)", "นี่คือของเล่นของเขา", ["his"]),
  fill("u2:possessives", "That is ___ house. (we)", "นั่นคือบ้านของเรา", ["our"]),
];
const unit2Order = [
  order("u2:have-got", "I have got a sister.", "เรียงประโยค: ฉันมีพี่สาวหรือน้องสาว"),
  order("u2:have-got", "She has got a brother.", "เรียงประโยค: เธอมีพี่ชายหรือน้องชาย"),
  order("u2:possessives", "This is my family.", "เรียงประโยค: นี่คือครอบครัวของฉัน"),
  order("u2:possessives", "That is her bag.", "เรียงประโยค: นั่นคือกระเป๋าของเธอ"),
  order("u2:family", "His dad is kind.", "เรียงประโยค: พ่อของเขาใจดี"),
  order("u2:family", "Our family is happy.", "เรียงประโยค: ครอบครัวของเรามีความสุข"),
];
const unit2Reading = [
  reading("u2:reading", "Lina has got a mum, a dad and a brother.", "ลีนามีแม่ พ่อ และน้องชาย/พี่ชาย", "Who has Lina got?", "ลีนามีใครบ้าง", ["a brother", "a train", "a robot"], "a brother"),
  reading("u2:reading", "Tom has got a blue bike. It is his bike.", "ทอมมีจักรยานสีน้ำเงิน มันคือจักรยานของเขา", "Whose bike is it?", "จักรยานเป็นของใคร", ["Tom's", "Mum's", "the teacher's"], "Tom's"),
  reading("u2:reading", "I have got a sister. Her name is May.", "ฉันมีน้องสาว/พี่สาว ชื่อของเธอคือเมย์", "What is her name?", "เธอชื่ออะไร", ["May", "Mia", "Ben"], "May"),
  reading("u2:reading", "We have got a small family. Our home is happy.", "เรามีครอบครัวเล็ก บ้านของเรามีความสุข", "Whose home is happy?", "บ้านของใครมีความสุข", ["our home", "his home", "their school"], "our home"),
  reading("u2:reading", "Dad has got a red car. His car is fast.", "พ่อมีรถสีแดง รถของเขาเร็ว", "What colour is the car?", "รถสีอะไร", ["red", "blue", "yellow"], "red"),
  reading("u2:reading", "Nok hasn't got a sister. She has got a brother.", "นกไม่มีพี่สาวหรือน้องสาว เธอมีพี่ชายหรือน้องชาย", "What has Nok got?", "นกมีใคร", ["a brother", "a sister", "a baby"], "a brother"),
];
const unit2Applied = [
  applied("u2:applied", "This is a family photo. How many people can you see?", "นี่คือภาพครอบครัว เห็นคนกี่คน", ["two", "three", "four"], "three", PHOTO.family),
  applied("u2:applied", "Mum has a bag. Choose the correct sentence.", "แม่มีกระเป๋า เลือกประโยคที่ถูกต้อง", ["She has got a bag.", "He has got a bag.", "They haven't got a bag."], "She has got a bag.", PHOTO.family),
  applied("u2:applied", "The toy belongs to Ben. Which word shows this?", "ของเล่นเป็นของเบน คำใดแสดงความเป็นเจ้าของ", ["his", "her", "our"], "his", PHOTO.robot),
  applied("u2:applied", "You and your friend both have a sister. Your friend says, 'I have got a sister.' Which reply shows you do too?", "คุณและเพื่อนต่างมีพี่สาวหรือน้องสาว ตอบอย่างไรเพื่อบอกว่าคุณก็มี", ["Me too!", "No family!", "It is blue."], "Me too!", PHOTO.family),
  applied("u2:applied", "Choose the sentence for a family without a baby.", "เลือกประโยคสำหรับครอบครัวที่ไม่มีเด็กเล็ก", ["We haven't got a baby.", "We has got a baby.", "We have got two baby."], "We haven't got a baby.", PHOTO.family),
  applied("u2:applied", "The red car is Dad's. Complete: It is ___ car.", "รถสีแดงเป็นของพ่อ เติมคำให้สมบูรณ์", ["his", "her", "their"], "his", PHOTO.car),
];

const unit3Pictures = [
  picture("u3:toys", "Which picture shows a ball?", "ภาพใดคือลูกบอล", "ball", ["ball", "doll", "robot", "puzzle"]),
  picture("u3:toys", "Find the teddy bear.", "หาตุ๊กตาหมี", "teddy", ["teddy", "blocks", "car", "plane"]),
  picture("u3:toys", "Which picture shows a robot?", "ภาพใดคือหุ่นยนต์", "robot", ["robot", "ball", "doll", "puzzle"]),
  picture("u3:toys", "Find the toy car.", "หารถของเล่น", "carToy", ["carToy", "blocks", "teddy", "planeToy"]),
  picture("u3:toys", "Which picture shows a doll?", "ภาพใดคือตุ๊กตา", "doll", ["doll", "ball", "robot", "puzzle"]),
  picture("u3:toys", "Find the building blocks.", "หาบล็อกตัวต่อ", "blocks", ["blocks", "carToy", "teddy", "ball"]),
  picture("u3:toys", "Which picture shows a puzzle?", "ภาพใดคือจิ๊กซอว์", "puzzle", ["puzzle", "planeToy", "doll", "robot"]),
  picture("u3:toys", "Find the toy plane.", "หาเครื่องบินของเล่น", "planeToy", ["planeToy", "ball", "blocks", "teddy"]),
];
const unit3Matching = [
  matching("u3:toys", "Match each toy to its meaning.", "จับคู่ของเล่นกับความหมาย", [["ball", "ลูกบอล"], ["doll", "ตุ๊กตา"], ["robot", "หุ่นยนต์"]]),
  matching("u3:toys", "Match each toy to its meaning.", "จับคู่ของเล่นกับความหมาย", [["blocks", "บล็อก"], ["puzzle", "จิ๊กซอว์"], ["teddy bear", "ตุ๊กตาหมี"]]),
  matching("u3:prepositions", "Match the position words.", "จับคู่คำบอกตำแหน่ง", [["in", "ข้างใน"], ["on", "บน"], ["under", "ข้างใต้"]]),
  matching("u3:prepositions", "Match the position words.", "จับคู่คำบอกตำแหน่ง", [["next to", "ข้างๆ"], ["behind", "ด้านหลัง"], ["in front of", "ด้านหน้า"]]),
  matching("u3:there-is", "Match the sentences to the number of toys.", "จับคู่ประโยคกับจำนวนของเล่น", [["There is a ball.", "1"], ["There are two dolls.", "2"], ["There are three blocks.", "3"]]),
  matching("u3:phonics", "Match each word to its ending letters.", "จับคู่คำกับตัวอักษรท้ายคำ", [["duck", "ck"], ["brush", "sh"], ["ball", "ll"]]),
];
const unit3Fill = [
  fill("u3:prepositions", "The ball is ___ the box. (inside)", "ลูกบอลอยู่...กล่อง", ["in"]),
  fill("u3:prepositions", "The doll rests on top of the table. It is ___ the table.", "ตุ๊กตาวางบนผิวด้านบนของโต๊ะ", ["on"]),
  fill("u3:prepositions", "The robot is below the chair. It is ___ the chair. (on/under)", "หุ่นยนต์อยู่ใต้เก้าอี้ เลือก on หรือ under", ["under"]),
  fill("u3:there-is", "___ a ball in the box.", "...ลูกบอลหนึ่งลูกในกล่อง", ["There is"]),
  fill("u3:there-is", "___ two dolls on the bed.", "...ตุ๊กตาสองตัวบนเตียง", ["There are"]),
  fill("u3:adjectives", "There are three ___ blocks. (small)", "มีบล็อกขนาดเล็กสามก้อน", ["small"]),
  fill("u3:phonics", "Complete the bird word: du__ (ck/sh).", "เติมคำชื่อนก duck ด้วย ck หรือ sh", ["ck"]),
  fill("u3:phonics", "Complete the cleaning-tool word: bru__ (ck/sh).", "เติมคำชื่ออุปกรณ์ทำความสะอาด brush", ["sh"]),
];
const unit3Order = [
  order("u3:there-is", "There is a ball.", "เรียงประโยค: มีลูกบอลหนึ่งลูก"),
  order("u3:there-is", "There are two dolls.", "เรียงประโยค: มีตุ๊กตาสองตัว"),
  order("u3:prepositions", "The robot is under the chair.", "เรียงประโยค: หุ่นยนต์อยู่ใต้เก้าอี้"),
  order("u3:prepositions", "The ball is in the box.", "เรียงประโยค: ลูกบอลอยู่ในกล่อง"),
  order("u3:adjectives", "I have a small red car.", "เรียงประโยค: ฉันมีรถสีแดงคันเล็ก"),
  order("u3:phonics", "The duck is on the box.", "เรียงประโยค: เป็ดอยู่บนกล่อง"),
];
const unit3Reading = [
  reading("u3:reading", "There is a red ball in the box. There are two dolls on the bed.", "มีลูกบอลสีแดงในกล่อง มีตุ๊กตาสองตัวบนเตียง", "Where is the ball?", "ลูกบอลอยู่ที่ไหน", ["in the box", "on the bed", "under the chair"], "in the box"),
  reading("u3:reading", "A small robot is under the table. A big ball is next to it.", "หุ่นยนต์ตัวเล็กอยู่ใต้โต๊ะ ลูกบอลลูกใหญ่อยู่ข้างๆ", "What is small?", "อะไรเล็ก", ["the robot", "the ball", "the table"], "the robot"),
  reading("u3:reading", "I have three blocks: a red one, a blue one and a green one.", "ฉันมีบล็อกสามก้อน สีแดง น้ำเงิน และเขียว", "How many blocks are there?", "มีบล็อกกี่ก้อน", ["one", "two", "three"], "three"),
  reading("u3:reading", "The teddy bear is on the chair. The puzzle is in the box.", "ตุ๊กตาหมีอยู่บนเก้าอี้ จิ๊กซอว์อยู่ในกล่อง", "Where is the puzzle?", "จิ๊กซอว์อยู่ที่ไหน", ["in the box", "on the chair", "behind the box"], "in the box"),
  reading("u3:reading", "There is a toy plane in front of the book.", "มีเครื่องบินของเล่นอยู่หน้าหนังสือ", "What is in front of the book?", "อะไรอยู่หน้าหนังสือ", ["a toy plane", "a robot", "a doll"], "a toy plane"),
  reading("u3:reading", "The duck has ck. The brush has sh.", "คำว่า duck มี ck และ brush มี sh", "Which word has sh?", "คำใดมีเสียง sh", ["duck", "brush", "ball"], "brush"),
];
const unit3Applied = [
  applied("u3:applied", "Put the ball inside the box. Which word tells the place?", "วางลูกบอลไว้ในกล่อง คำใดบอกตำแหน่ง", ["in", "on", "under"], "in", PHOTO.ball),
  applied("u3:applied", "There are 4 toy cars. Choose the correct sentence.", "มีรถของเล่น 4 คัน เลือกประโยคที่ถูกต้อง", ["There is four cars.", "There are four cars.", "There are one car."], "There are four cars.", PHOTO.carToy),
  applied("u3:applied", "A small blue robot is next to a big red ball. What is blue?", "หุ่นยนต์สีน้ำเงินตัวเล็กอยู่ข้างลูกบอลสีแดงลูกใหญ่ อะไรสีน้ำเงิน", ["the robot", "the ball", "the box"], "the robot", PHOTO.robot),
  applied("u3:applied", "Which toy can you build with?", "ของเล่นใดใช้สร้างสิ่งต่างๆ ได้", ["blocks", "doll", "puzzle"], "blocks", PHOTO.blocks),
  applied("u3:applied", "Choose the word with the ck sound.", "เลือกคำที่มีเสียง ck", ["duck", "brush", "ship"], "duck", PHOTO.duck),
  applied("u3:applied", "Choose the word with the sh sound.", "เลือกคำที่มีเสียง sh", ["ball", "brush", "duck"], "brush", PHOTO.brush),
];

const unit4Pictures = [
  picture("u4:transport", "Which picture shows a bus?", "ภาพใดคือรถบัส", "bus", ["bus", "train", "boat", "car"]),
  picture("u4:transport", "Find the train.", "หารถไฟ", "train", ["train", "bus", "bicycle", "plane"]),
  picture("u4:transport", "Which picture shows a boat?", "ภาพใดคือเรือ", "boat", ["boat", "car", "train", "bicycle"]),
  picture("u4:transport", "Find the bicycle.", "หาจักรยาน", "bicycle", ["bicycle", "bus", "plane", "boat"]),
  picture("u4:shapes", "Which picture is a circle?", "ภาพใดเป็นวงกลม", "circle", ["circle", "square", "rectangle", "triangle"]),
  picture("u4:shapes", "Which picture is a square?", "ภาพใดเป็นสี่เหลี่ยมจัตุรัส", "square", ["square", "circle", "triangle", "rectangle"]),
  picture("u4:shapes", "Which picture is a rectangle?", "ภาพใดเป็นสี่เหลี่ยมผืนผ้า", "rectangle", ["rectangle", "circle", "square", "triangle"]),
  picture("u4:shapes", "Which picture is a triangle?", "ภาพใดเป็นสามเหลี่ยม", "triangle", ["triangle", "circle", "rectangle", "square"]),
];
const unit4Matching = [
  matching("u4:transport", "Match the transport words.", "จับคู่คำศัพท์ยานพาหนะ", [["bus", "รถบัส"], ["train", "รถไฟ"], ["boat", "เรือ"]]),
  matching("u4:transport", "Match the transport words.", "จับคู่คำศัพท์ยานพาหนะ", [["car", "รถยนต์"], ["bicycle", "จักรยาน"], ["plane", "เครื่องบิน"]]),
  matching("u4:shapes", "Match the shapes.", "จับคู่รูปทรง", [["circle", "วงกลม"], ["square", "สี่เหลี่ยมจัตุรัส"], ["triangle", "สามเหลี่ยม"]]),
  matching("u4:jobs", "Match the transport jobs.", "จับคู่อาชีพ", [["bus driver", "ขับรถบัส"], ["pilot", "ขับเครื่องบิน"], ["train driver", "ขับรถไฟ"]]),
  matching("u4:by-on", "Match the travel phrases.", "จับคู่วิธีเดินทาง", [["by bus", "โดยรถบัส"], ["by train", "โดยรถไฟ"], ["on foot", "เดินเท้า"]]),
  matching("u4:phonics", "Match the beginning sounds.", "จับคู่เสียงต้นคำ", [["chair", "ch"], ["three", "th"], ["ship", "sh"]]),
];
const unit4Fill = [
  fill("u4:by-on", "I go to school ___ bus.", "ฉันไปโรงเรียน...รถบัส", ["by"]),
  fill("u4:by-on", "I go to school ___ foot.", "ฉันไปโรงเรียน...เท้า", ["on"]),
  fill("u4:by-on", "We travel ___ train.", "เราเดินทาง...รถไฟ", ["by"]),
  fill("u4:shapes", "A flat round shape with no corners is a ___.", "รูปแบนกลมที่ไม่มีมุมคือรูปอะไร", ["circle"]),
  fill("u4:shapes", "A window has four square corners. It is longer than it is wide. Its outline is a ___.", "หน้าต่างมีมุมฉากสี่มุมและยาวกว่ากว้าง ขอบเป็นรูปอะไร", ["rectangle"]),
  fill("u4:jobs", "A ___ flies a plane.", "...ขับเครื่องบิน", ["pilot"]),
  fill("u4:phonics", "Complete the seat word: __air (ch/th).", "เติมชื่อที่นั่ง chair ด้วย ch หรือ th", ["ch"]),
  fill("u4:phonics", "Complete the number word: __ree (ch/th).", "เติมคำบอกจำนวน three ด้วย ch หรือ th", ["th"]),
];
const unit4Order = [
  order("u4:transport", "I go by bus.", "เรียงประโยค: ฉันเดินทางโดยรถบัส"),
  order("u4:by-on", "We go on foot.", "เรียงประโยค: เราเดินเท้า"),
  order("u4:shapes", "This is a triangle.", "เรียงประโยค: นี่คือสามเหลี่ยม"),
  order("u4:jobs", "The pilot flies a plane.", "เรียงประโยค: นักบินขับเครื่องบิน"),
  order("u4:phonics", "The chair is thin.", "เรียงประโยค: เก้าอี้บาง"),
  order("u4:transport", "The train is long.", "เรียงประโยค: รถไฟยาว"),
];
const unit4Reading = [
  reading("u4:reading", "Nina goes to school by bus. Her friend goes by bicycle.", "นีนาไปโรงเรียนโดยรถบัส เพื่อนของเธอไปโดยจักรยาน", "How does Nina go?", "นีนาเดินทางอย่างไร", ["by bus", "by train", "on foot"], "by bus"),
  reading("u4:reading", "A pilot flies a plane. A driver drives a bus.", "นักบินขับเครื่องบิน คนขับรถขับรถบัส", "Who flies a plane?", "ใครขับเครื่องบิน", ["a pilot", "a driver", "a teacher"], "a pilot"),
  reading("u4:reading", "The sign is a red circle. The window is a rectangle.", "ป้ายเป็นวงกลมสีแดง หน้าต่างเป็นสี่เหลี่ยมผืนผ้า", "What shape is the window?", "หน้าต่างเป็นรูปอะไร", ["a circle", "a square", "a rectangle"], "a rectangle"),
  reading("u4:reading", "We go on foot to the park. It is near our school.", "เราเดินไปสวนสาธารณะ สวนอยู่ใกล้โรงเรียน", "How do we go?", "เราเดินทางอย่างไร", ["by bus", "on foot", "by train"], "on foot"),
  reading("u4:reading", "The train is long. The car is small.", "รถไฟยาว รถยนต์มีขนาดเล็ก", "Which is long?", "อะไรยาว", ["the train", "the car", "the bus"], "the train"),
  reading("u4:reading", "Three chairs are in the room. Think about the first sound in three.", "มีเก้าอี้สามตัวในห้อง คิดถึงเสียงต้นคำ three", "Which sound starts three?", "เสียงใดอยู่ต้นคำ three", ["ch", "th", "sh"], "th"),
];
const unit4Applied = [
  applied("u4:applied", "You travel on water. Which transport do you choose?", "เดินทางบนผิวน้ำ ควรเลือกยานพาหนะใด", ["boat", "bus", "train"], "boat", PHOTO.boat),
  applied("u4:applied", "You ride on two wheels. Which transport is it?", "ขี่พาหนะสองล้อ คืออะไร", ["bicycle", "plane", "boat"], "bicycle", PHOTO.bicycle),
  applied("u4:applied", "A driver is next to a bus. What job does the person do?", "คนขับอยู่ข้างรถบัส บุคคลนี้ทำอาชีพอะไร", ["bus driver", "pilot", "teacher"], "bus driver", PHOTO.bus),
  applied("u4:applied", "Choose the shape with three sides.", "เลือกรูปทรงที่มีสามด้าน", ["circle", "triangle", "square"], "triangle", PHOTO.triangle),
  applied("u4:applied", "Which word starts with ch?", "คำใดขึ้นต้นด้วย ch", ["chair", "three", "ship"], "chair", PHOTO.chair),
  applied("u4:applied", "Which word starts with th?", "คำใดขึ้นต้นด้วย th", ["chair", "three", "ship"], "three"),
];

export const finalTestLevels = [
  buildUnit(1, [...unit1Pictures, ...unit1Matching, ...unit1Fill, ...unit1Order, ...unit1Reading, ...unit1Applied], "Unit 1 · School and Colours", "At School, Colours, Numbers, Singular/Plural and Adjectives"),
  buildUnit(2, [...unit2Pictures, ...unit2Matching, ...unit2Fill, ...unit2Order, ...unit2Reading, ...unit2Applied], "Unit 2 · My Family", "Family, have got/haven't got and Possessive Adjectives"),
  buildUnit(3, [...unit3Pictures, ...unit3Matching, ...unit3Fill, ...unit3Order, ...unit3Reading, ...unit3Applied], "Unit 3 · Toys and Places", "Toys, Prepositions, There is/There are, Adjectives and ck/sh"),
  buildUnit(4, [...unit4Pictures, ...unit4Matching, ...unit4Fill, ...unit4Order, ...unit4Reading, ...unit4Applied], "Unit 4 · Get Up and Go", "Transport, by/on, Shapes, Jobs and ch/th"),
];

export const finalTestSubject = {
  id: "final-test",
  name: "Final Test",
  category: "exercise",
  icon: "📝",
  description: "Cambridge World English 1 review for Primary 1 EP.",
  worldLabel: "Final Test",
  worldTheme: "Cambridge World English 1",
  contentMode: "final-test",
  words,
  levels: finalTestLevels,
};

export const FINAL_TEST_FORMAT_COUNTS = Object.freeze({
  "picture-choice": 8,
  matching: 6,
  "fill-blank": 8,
  "sentence-order": 6,
  reading: 6,
  applied: 6,
});

export function getFinalTestLevel(levelNumber) {
  return finalTestLevels.find((level) => level.levelNumber === Number(levelNumber)) || null;
}

export function getFinalTestChallenge(challengeId) {
  return finalTestLevels
    .flatMap((level) => level.exercises)
    .find((challenge) => challenge.id === challengeId) || null;
}

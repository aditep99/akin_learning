import bearPhoto from "../../assets/animals/photo/bear-photo.png";
import birdPhoto from "../../assets/animals/photo/bird-photo.png";
import catPhoto from "../../assets/animals/photo/cat-photo.png";
import cowPhoto from "../../assets/animals/photo/cow-photo.png";
import dogPhoto from "../../assets/animals/photo/dog-photo.png";
import duckPhoto from "../../assets/animals/photo/duck-photo.png";
import elephantPhoto from "../../assets/animals/photo/elephant-photo.png";
import fishPhoto from "../../assets/animals/photo/fish-photo.png";
import frogPhoto from "../../assets/animals/photo/frog-photo.png";
import goatPhoto from "../../assets/animals/photo/goat-photo.png";
import henPhoto from "../../assets/animals/photo/hen-photo.png";
import horsePhoto from "../../assets/animals/photo/horse-photo.png";
import lionPhoto from "../../assets/animals/photo/lion-photo.png";
import monkeyPhoto from "../../assets/animals/photo/monkey-photo.png";
import pigPhoto from "../../assets/animals/photo/pig-photo.png";
import rabbitPhoto from "../../assets/animals/photo/rabbit-photo.png";
import roosterPhoto from "../../assets/animals/photo/rooster-photo.png";
import sheepPhoto from "../../assets/animals/photo/sheep-photo.png";
import snakePhoto from "../../assets/animals/photo/snake-photo.png";
import tigerPhoto from "../../assets/animals/photo/tiger-photo.png";
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

const animalPhotoOverrides = {
  cat: catPhoto,
  dog: dogPhoto,
  bird: birdPhoto,
  fish: fishPhoto,
  cow: cowPhoto,
  lion: lionPhoto,
  rabbit: rabbitPhoto,
  monkey: monkeyPhoto,
  duck: duckPhoto,
  elephant: elephantPhoto,
  tiger: tigerPhoto,
  bear: bearPhoto,
  horse: horsePhoto,
  sheep: sheepPhoto,
  pig: pigPhoto,
  goat: goatPhoto,
  hen: henPhoto,
  rooster: roosterPhoto,
  frog: frogPhoto,
  snake: snakePhoto,
};

const animalWords = [
  { id: "cat", word: "Cat", emoji: "🐱", phonics: "แคท", pronunciation: { guide: "cat", ipa: "/kæt/" }, translation: "แมว" },
  { id: "dog", word: "Dog", emoji: "🐶", phonics: "ด็อก", pronunciation: { guide: "dog", ipa: "/dɔɡ/" }, translation: "สุนัข, หมา" },
  { id: "bird", word: "Bird", emoji: "🐦", phonics: "เบิร์ด", pronunciation: { guide: "bird", ipa: "/bɝːd/" }, translation: "นก" },
  { id: "fish", word: "Fish", emoji: "🐟", phonics: "ฟิช", pronunciation: { guide: "fish", ipa: "/fɪʃ/" }, translation: "ปลา" },
  { id: "cow", word: "Cow", emoji: "🐄", phonics: "คาว", pronunciation: { guide: "cow", ipa: "/kaʊ/" }, translation: "วัว" },
  { id: "lion", word: "Lion", emoji: "🦁", phonics: "ไลเอิน", pronunciation: { guide: "lion", ipa: "/ˈlaɪən/" }, translation: "สิงโต" },
  { id: "rabbit", word: "Rabbit", emoji: "🐰", phonics: "แรบบิท", pronunciation: { guide: "rabbit", ipa: "/ˈræbɪt/" }, translation: "กระต่าย" },
  { id: "monkey", word: "Monkey", emoji: "🐒", phonics: "มังคี", pronunciation: { guide: "monkey", ipa: "/ˈmʌŋki/" }, translation: "ลิง" },
  { id: "duck", word: "Duck", emoji: "🦆", phonics: "ดัค", pronunciation: { guide: "duck", ipa: "/dʌk/" }, translation: "เป็ด" },
  { id: "elephant", word: "Elephant", emoji: "🐘", phonics: "เอลิแฟนท์", pronunciation: { guide: "el·e·phant", ipa: "/ˈeləfənt/" }, translation: "ช้าง" },
  { id: "tiger", word: "Tiger", emoji: "🐯", phonics: "ไทเกอร์", pronunciation: { guide: "tiger", ipa: "/ˈtaɪɡər/" }, translation: "เสือ" },
  { id: "bear", word: "Bear", emoji: "🐻", phonics: "แบร์", pronunciation: { guide: "bear", ipa: "/ber/" }, translation: "หมี" },
  { id: "horse", word: "Horse", emoji: "🐴", phonics: "ฮอร์ส", pronunciation: { guide: "horse", ipa: "/hɔrs/" }, translation: "ม้า" },
  { id: "sheep", word: "Sheep", emoji: "🐑", phonics: "ชีพ", pronunciation: { guide: "sheep", ipa: "/ʃiːp/" }, translation: "แกะ" },
  { id: "pig", word: "Pig", emoji: "🐷", phonics: "พิก", pronunciation: { guide: "pig", ipa: "/pɪɡ/" }, translation: "หมู" },
  { id: "goat", word: "Goat", emoji: "🐐", phonics: "โกต", pronunciation: { guide: "goat", ipa: "/ɡoʊt/" }, translation: "แพะ" },
  { id: "hen", word: "Hen", emoji: "🐔", phonics: "เฮน", pronunciation: { guide: "hen", ipa: "/hen/" }, translation: "แม่ไก่" },
  { id: "rooster", word: "Rooster", emoji: "🐓", phonics: "รูสเตอร์", pronunciation: { guide: "rooster", ipa: "/ˈruːstər/" }, translation: "ไก่ตัวผู้" },
  { id: "frog", word: "Frog", emoji: "🐸", phonics: "ฟร็อก", pronunciation: { guide: "frog", ipa: "/frɔɡ/" }, translation: "กบ" },
  { id: "snake", word: "Snake", emoji: "🐍", phonics: "สเนก", pronunciation: { guide: "snake", ipa: "/sneɪk/" }, translation: "งู" },
  { id: "turtle", word: "Turtle", emoji: "🐢", phonics: "เทอร์เทิล", translation: "เต่า" },
  { id: "crocodile", word: "Crocodile", emoji: "🐊", phonics: "ครอคโคไดล์", translation: "จระเข้" },
  { id: "giraffe", word: "Giraffe", emoji: "🦒", phonics: "จีแรฟ", translation: "ยีราฟ" },
  { id: "zebra", word: "Zebra", emoji: "🦓", phonics: "ซีบร้า", translation: "ม้าลาย" },
  { id: "hippo", word: "Hippo", emoji: "🦛", phonics: "ฮิปโป", translation: "ฮิปโป" },
  { id: "rhino", word: "Rhino", emoji: "🦏", phonics: "ไรโน", translation: "แรด" },
  { id: "panda", word: "Panda", emoji: "🐼", phonics: "แพนด้า", translation: "หมีแพนด้า" },
  { id: "koala", word: "Koala", emoji: "🐨", phonics: "โคอาลา", translation: "โคอาลา" },
  { id: "fox", word: "Fox", emoji: "🦊", phonics: "ฟ็อกซ์", translation: "สุนัขจิ้งจอก" },
  { id: "wolf", word: "Wolf", emoji: "🐺", phonics: "วูล์ฟ", translation: "หมาป่า" },
  { id: "deer", word: "Deer", emoji: "🦌", phonics: "เดียร์", translation: "กวาง" },
  { id: "camel", word: "Camel", emoji: "🐫", phonics: "แคเมล", translation: "อูฐ" },
  { id: "whale", word: "Whale", emoji: "🐋", phonics: "เวล", translation: "วาฬ" },
  { id: "dolphin", word: "Dolphin", emoji: "🐬", phonics: "ดอลฟิน", translation: "โลมา" },
  { id: "shark", word: "Shark", emoji: "🦈", phonics: "ชาร์ก", translation: "ฉลาม" },
  { id: "octopus", word: "Octopus", emoji: "🐙", phonics: "ออคโทพัส", translation: "ปลาหมึกยักษ์" },
  { id: "crab", word: "Crab", emoji: "🦀", phonics: "แครบ", translation: "ปู" },
  { id: "shrimp", word: "Shrimp", emoji: "🦐", phonics: "ชริมพ์", translation: "กุ้ง" },
  { id: "butterfly", word: "Butterfly", emoji: "🦋", phonics: "บัตเตอร์ฟลาย", translation: "ผีเสื้อ" },
  { id: "bee", word: "Bee", emoji: "🐝", phonics: "บี", translation: "ผึ้ง" },
  { id: "ant", word: "Ant", emoji: "🐜", phonics: "แอนท์", translation: "มด" },
  { id: "spider", word: "Spider", emoji: "🕷️", phonics: "สไปเดอร์", translation: "แมงมุม" },
  { id: "owl", word: "Owl", emoji: "🦉", phonics: "เอาล์", translation: "นกฮูก" },
  { id: "eagle", word: "Eagle", emoji: "🦅", phonics: "อีเกิล", translation: "นกอินทรี" },
  { id: "parrot", word: "Parrot", emoji: "🦜", phonics: "แพร์รอท", translation: "นกแก้ว" },
  { id: "bat", word: "Bat", emoji: "🦇", phonics: "แบท", translation: "ค้างคาว" },
  { id: "mouse", word: "Mouse", emoji: "🐭", phonics: "เมาส์", translation: "หนู" },
  { id: "squirrel", word: "Squirrel", emoji: "🐿️", phonics: "สเควอเริล", translation: "กระรอก" },
  { id: "kangaroo", word: "Kangaroo", emoji: "🦘", phonics: "แคงการู", translation: "จิงโจ้" },
  { id: "seal", word: "Seal", emoji: "🦭", phonics: "ซีล", translation: "แมวน้ำ" },
];

export const animalsSubject = {
  id: "animals",
  name: "Animals",
  category: "basic",
  icon: "🦁",
  description: "Animal words",
  words: animalWords.map((word) => ({
    ...word,
    image: animalPhotoOverrides[word.id] || word.image,
  })),
};

import applePhoto from "../../assets/fruits/photo/apple-photo.png";
import avocadoPhoto from "../../assets/fruits/photo/avocado-photo.png";
import bananaPhoto from "../../assets/fruits/photo/banana-photo.png";
import blueberryPhoto from "../../assets/fruits/photo/blueberry-photo.png";
import broccoliPhoto from "../../assets/fruits/photo/broccoli-photo.png";
import carrotPhoto from "../../assets/fruits/photo/carrot-photo.png";
import cherryPhoto from "../../assets/fruits/photo/cherry-photo.png";
import coconutPhoto from "../../assets/fruits/photo/coconut-photo.png";
import cornPhoto from "../../assets/fruits/photo/corn-photo.png";
import cucumberPhoto from "../../assets/fruits/photo/cucumber-photo.png";
import grapePhoto from "../../assets/fruits/photo/grape-photo.png";
import lemonPhoto from "../../assets/fruits/photo/lemon-photo.png";
import mangoPhoto from "../../assets/fruits/photo/mango-photo.png";
import orangePhoto from "../../assets/fruits/photo/orange-photo.png";
import peachPhoto from "../../assets/fruits/photo/peach-photo.png";
import pearPhoto from "../../assets/fruits/photo/pear-photo.png";
import pineapplePhoto from "../../assets/fruits/photo/pineapple-photo.png";
import strawberryPhoto from "../../assets/fruits/photo/strawberry-photo.png";
import tomatoPhoto from "../../assets/fruits/photo/tomato-photo.png";
import watermelonPhoto from "../../assets/fruits/photo/watermelon-photo.png";

const fruitPhotoOverrides = {
  apple: applePhoto,
  banana: bananaPhoto,
  orange: orangePhoto,
  carrot: carrotPhoto,
  tomato: tomatoPhoto,
  grape: grapePhoto,
  mango: mangoPhoto,
  watermelon: watermelonPhoto,
  corn: cornPhoto,
  broccoli: broccoliPhoto,
  pear: pearPhoto,
  peach: peachPhoto,
  lemon: lemonPhoto,
  pineapple: pineapplePhoto,
  coconut: coconutPhoto,
  strawberry: strawberryPhoto,
  blueberry: blueberryPhoto,
  cherry: cherryPhoto,
  avocado: avocadoPhoto,
  cucumber: cucumberPhoto,
};

const fruitWords = [
  { id: "apple", word: "Apple", emoji: "🍎", phonics: "แอปเปิล", pronunciation: { guide: "apple", ipa: "/ˈæpəl/" }, translation: "แอปเปิ้ล" },
  { id: "banana", word: "Banana", emoji: "🍌", phonics: "บะนานะ", pronunciation: { guide: "banana", ipa: "/bəˈnænə/" }, translation: "กล้วย" },
  { id: "orange", word: "Orange", emoji: "🍊", phonics: "ออเรนจ์", pronunciation: { guide: "orange", ipa: "/ˈɔrɪndʒ/" }, translation: "ส้ม" },
  { id: "carrot", word: "Carrot", emoji: "🥕", phonics: "แคร์รอท", pronunciation: { guide: "carrot", ipa: "/ˈkærət/" }, translation: "แครอท" },
  { id: "tomato", word: "Tomato", emoji: "🍅", phonics: "ทะเมโท", pronunciation: { guide: "tomato", ipa: "/təˈmeɪtoʊ/" }, translation: "มะเขือเทศ" },
  { id: "grape", word: "Grape", emoji: "🍇", phonics: "เกรป", pronunciation: { guide: "grape", ipa: "/ɡreɪp/" }, translation: "องุ่น" },
  { id: "mango", word: "Mango", emoji: "🥭", phonics: "แมงโก", pronunciation: { guide: "mango", ipa: "/ˈmæŋɡoʊ/" }, translation: "มะม่วง" },
  { id: "watermelon", word: "Watermelon", emoji: "🍉", phonics: "วอเทอร์เมลอน", pronunciation: { guide: "watermelon", ipa: "/ˈwɔtərˌmelən/" }, translation: "แตงโม" },
  { id: "corn", word: "Corn", emoji: "🌽", phonics: "คอร์น", pronunciation: { guide: "corn", ipa: "/kɔrn/" }, translation: "ข้าวโพด" },
  { id: "broccoli", word: "Broccoli", emoji: "🥦", phonics: "บรอคโคลี", pronunciation: { guide: "broccoli", ipa: "/ˈbrɑkəli/" }, translation: "บรอกโคลี" },
  { id: "pear", word: "Pear", emoji: "🍐", phonics: "แพร์", translation: "ลูกแพร์" },
  { id: "peach", word: "Peach", emoji: "🍑", phonics: "พีช", translation: "ลูกพีช" },
  { id: "lemon", word: "Lemon", emoji: "🍋", phonics: "เลมอน", translation: "มะนาวเหลือง" },
  { id: "pineapple", word: "Pineapple", emoji: "🍍", phonics: "ไพน์แอปเปิล", translation: "สับปะรด" },
  { id: "coconut", word: "Coconut", emoji: "🥥", phonics: "โคโคนัท", translation: "มะพร้าว" },
  { id: "strawberry", word: "Strawberry", emoji: "🍓", phonics: "สตรอว์เบอร์รี", translation: "สตรอว์เบอร์รี" },
  { id: "blueberry", word: "Blueberry", emoji: "🫐", phonics: "บลูเบอร์รี", translation: "บลูเบอร์รี" },
  { id: "cherry", word: "Cherry", emoji: "🍒", phonics: "เชอร์รี", translation: "เชอร์รี" },
  { id: "avocado", word: "Avocado", emoji: "🥑", phonics: "อะโวคาโด", translation: "อะโวคาโด" },
  { id: "cucumber", word: "Cucumber", emoji: "🥒", phonics: "คิวคัมเบอร์", translation: "แตงกวา" },
  { id: "pumpkin", word: "Pumpkin", emoji: "🎃", phonics: "พัมคิน", translation: "ฟักทอง" },
  { id: "potato", word: "Potato", emoji: "🥔", phonics: "โพเทโท", translation: "มันฝรั่ง" },
  { id: "onion", word: "Onion", emoji: "🧅", phonics: "อันเยิน", translation: "หัวหอม" },
  { id: "garlic", word: "Garlic", emoji: "🧄", phonics: "การ์ลิก", translation: "กระเทียม" },
  { id: "chili", word: "Chili", emoji: "🌶️", phonics: "ชิลลี", translation: "พริก" },
  { id: "lettuce", word: "Lettuce", emoji: "🥬", phonics: "เลททิส", translation: "ผักกาดหอม" },
  { id: "cabbage", word: "Cabbage", emoji: "🥬", phonics: "แคบบิจ", translation: "กะหล่ำปลี" },
  { id: "pea", word: "Pea", emoji: "🫛", phonics: "พี", translation: "ถั่วลันเตา" },
  { id: "bean", word: "Bean", emoji: "🫘", phonics: "บีน", translation: "ถั่ว" },
  { id: "mushroom", word: "Mushroom", emoji: "🍄", phonics: "มัชรูม", translation: "เห็ด" },
  { id: "eggplant", word: "Eggplant", emoji: "🍆", phonics: "เอ็กแพลนต์", translation: "มะเขือยาว" },
  { id: "radish", word: "Radish", emoji: "🥕", phonics: "แรดิช", translation: "หัวไชเท้า" },
  { id: "beet", word: "Beet", emoji: "🍠", phonics: "บีต", translation: "บีตรูต" },
  { id: "spinach", word: "Spinach", emoji: "🥬", phonics: "สปินิช", translation: "ผักโขม" },
  { id: "celery", word: "Celery", emoji: "🥬", phonics: "เซเลอรี", translation: "ขึ้นฉ่าย" },
  { id: "papaya", word: "Papaya", emoji: "🥭", phonics: "พะพายา", translation: "มะละกอ" },
  { id: "guava", word: "Guava", emoji: "🍏", phonics: "กวาวา", translation: "ฝรั่ง" },
  { id: "lychee", word: "Lychee", emoji: "🍒", phonics: "ลิ้นจี่", translation: "ลิ้นจี่" },
  { id: "dragon-fruit", word: "Dragon Fruit", emoji: "🌴", phonics: "ดรากอนฟรุต", translation: "แก้วมังกร" },
  { id: "durian", word: "Durian", emoji: "🥭", phonics: "ดูเรียน", translation: "ทุเรียน" },
  { id: "mangosteen", word: "Mangosteen", emoji: "🍈", phonics: "แมงโกสทีน", translation: "มังคุด" },
  { id: "rambutan", word: "Rambutan", emoji: "🍓", phonics: "แรมบูแทน", translation: "เงาะ" },
  { id: "longan", word: "Longan", emoji: "🍇", phonics: "ลองแกน", translation: "ลำไย" },
  { id: "jackfruit", word: "Jackfruit", emoji: "🍈", phonics: "แจ็กฟรุต", translation: "ขนุน" },
  { id: "kiwi", word: "Kiwi", emoji: "🥝", phonics: "กีวี", translation: "กีวี" },
  { id: "plum", word: "Plum", emoji: "🟣", phonics: "พลัม", translation: "ลูกพลัม" },
  { id: "melon", word: "Melon", emoji: "🍈", phonics: "เมลอน", translation: "เมลอน" },
  { id: "sweet-potato", word: "Sweet Potato", emoji: "🍠", phonics: "สวีตโพเทโท", translation: "มันหวาน" },
  { id: "lime", word: "Lime", emoji: "🍋", phonics: "ไลม์", translation: "มะนาวเขียว" },
  { id: "pea-pod", word: "Pea Pod", emoji: "🫛", phonics: "พีพอด", translation: "ฝักถั่ว" },
  { id: "chinese-kale", word: "Chinese Kale", emoji: "🥬", phonics: "ไชนีส เคล", translation: "คะน้า" },
  { id: "lotus-root", word: "Lotus Root", emoji: "🪷", phonics: "โลตัส รูท", translation: "รากบัว" },
  { id: "squash", word: "Squash", emoji: "🎃", phonics: "สควอช", translation: "ฟัก" },
  { id: "bell-pepper", word: "Bell Pepper", emoji: "🫑", phonics: "เบล เพพเพอร์", translation: "พริกหวาน" },
  { id: "galangal", word: "Galangal", emoji: "🌿", phonics: "กะลังเกิล", translation: "ข่า" },
  { id: "asparagus", word: "Asparagus", emoji: "🌱", phonics: "แอสแพรกัส", translation: "หน่อไม้ฝรั่ง" },
  { id: "cauliflower", word: "Cauliflower", emoji: "🥦", phonics: "คอลิฟลาวเวอร์", translation: "กะหล่ำดอก" },
  { id: "scallion", word: "Scallion", emoji: "🌿", phonics: "สแกลเลียน", translation: "ต้นหอม" },
  { id: "leek", word: "Leek", emoji: "🥬", phonics: "ลีค", translation: "กระเทียมต้น" },
  { id: "chives", word: "Chives", emoji: "🌿", phonics: "ไชฟ์ส", translation: "กุยช่าย" },
  { id: "morning-glory", word: "Morning Glory", emoji: "🌿", phonics: "มอร์นิง กลอรี", translation: "ผักบุ้ง" },
  { id: "watercress", word: "Watercress", emoji: "🥬", phonics: "วอเตอร์เครส", translation: "สลัดน้ำ" },
  { id: "turnip", word: "Turnip", emoji: "🥔", phonics: "เทอร์นิพ", translation: "หัวผักกาด" },
  { id: "okra", word: "Okra", emoji: "🥒", phonics: "โอกรา", translation: "กระเจี๊ยบเขียว" },
  { id: "fennel", word: "Fennel", emoji: "🌿", phonics: "เฟนเนล", translation: "ผักชีล้อม" },
  { id: "sweet-basil", word: "Sweet Basil", emoji: "🌿", phonics: "สวีต เบซิล", translation: "โหระพา" },
  { id: "holy-basil", word: "Holy Basil", emoji: "🌿", phonics: "โฮลี เบซิล", translation: "กะเพรา" },
  { id: "radicchio", word: "Radicchio", emoji: "🥬", phonics: "ราดิคคิโอ", translation: "ผักกาดแดง" },
  { id: "arugula", word: "Arugula", emoji: "🥬", phonics: "อารูกูลา", translation: "ผักร็อกเก็ต" },
  { id: "mint", word: "Mint", emoji: "🌿", phonics: "มินต์", translation: "สะระแหน่" },
  { id: "bok-choy", word: "Bok Choy", emoji: "🥬", phonics: "บ็อกชอย", translation: "ผักกวางตุ้ง" },
  { id: "taro", word: "Taro", emoji: "🍠", phonics: "ทาโร", translation: "เผือก" },
  { id: "cassava", word: "Cassava", emoji: "🥔", phonics: "คาซซาวา", translation: "มันสำปะหลัง" },
  { id: "yam", word: "Yam", emoji: "🍠", phonics: "แยม", translation: "มันเทศ" },
  { id: "shallot", word: "Shallot", emoji: "🧅", phonics: "แชลลอต", translation: "หอมแดง" },
  { id: "bamboo-shoot", word: "Bamboo Shoot", emoji: "🎍", phonics: "แบมบู ชูต", translation: "หน่อไม้" },
  { id: "bitter-melon", word: "Bitter Melon", emoji: "🥒", phonics: "บิตเทอร์ เมลอน", translation: "มะระขี้นก" },
  { id: "black-bean", word: "Black Bean", emoji: "🫘", phonics: "แบล็ก บีน", translation: "ถั่วดำ" },
  { id: "snow-peas", word: "Snow Peas", emoji: "🫛", phonics: "สโนว์ พีส์", translation: "ถั่วลันเตา" },
  { id: "yardlong-bean", word: "Yardlong Bean", emoji: "🫘", phonics: "ยาร์ดลอง บีน", translation: "ถั่วฝักยาว" },
  { id: "chickpeas", word: "Chickpeas", emoji: "🫘", phonics: "ชิกพีส์", translation: "ถั่วชิกพี" },
  { id: "soybean", word: "Soybean", emoji: "🫘", phonics: "ซอยบีน", translation: "ถั่วเหลือง" },
  { id: "edamame", word: "Edamame", emoji: "🫛", phonics: "เอดามาเมะ", translation: "ถั่วแระญี่ปุ่น" },
  { id: "mustard-greens", word: "Mustard Greens", emoji: "🥬", phonics: "มัสตาร์ด กรีนส์", translation: "ผักกาดเขียว" },
  { id: "malabar-spinach", word: "Malabar Spinach", emoji: "🥬", phonics: "มาลาบาร์ สปินิช", translation: "ผักปลัง" },
  { id: "jicama", word: "Jicama", emoji: "🥔", phonics: "ฮิกามา", translation: "มันแกว" },
  { id: "dill", word: "Dill", emoji: "🌿", phonics: "ดิล", translation: "ผักชีลาว" },
  { id: "ginger", word: "Ginger", emoji: "🫚", phonics: "จินเจอร์", translation: "ขิง" },
  { id: "water-mimosa", word: "Water Mimosa", emoji: "🌿", phonics: "วอเตอร์ ไมโมซา", translation: "ผักกระเฉด" },
  { id: "fingerroot", word: "Fingerroot", emoji: "🫚", phonics: "ฟิงเกอร์รูท", translation: "กระชาย" },
  { id: "pea-eggplant", word: "Pea Eggplant", emoji: "🍆", phonics: "พี เอ็กแพลนท์", translation: "มะเขือพวง" },
  { id: "bean-sprouts", word: "Bean Sprouts", emoji: "🌱", phonics: "บีน สเปราต์ส", translation: "ถั่วงอก" },
];

export const fruitsVegetablesSubject = {
  id: "fruits-vegetables",
  name: "Fruits & Vegetables",
  category: "basic",
  icon: "🍎",
  description: "Fruit and vegetable words",
  words: fruitWords.map((word) => ({
    ...word,
    image: fruitPhotoOverrides[word.id] || word.image,
  })),
};

import bagPhoto from "../../assets/school/photo/bag-photo.png";
import boardPhoto from "../../assets/school/photo/board-photo.png";
import bookPhoto from "../../assets/school/photo/book-photo.png";
import brushPhoto from "../../assets/school/photo/brush-photo.png";
import chairPhoto from "../../assets/school/photo/chair-photo.png";
import chalkPhoto from "../../assets/school/photo/chalk-photo.png";
import crayonPhoto from "../../assets/school/photo/crayon-photo.png";
import deskPhoto from "../../assets/school/photo/desk-photo.png";
import eraserPhoto from "../../assets/school/photo/eraser-photo.png";
import folderPhoto from "../../assets/school/photo/folder-photo.png";
import gluePhoto from "../../assets/school/photo/glue-photo.png";
import mapPhoto from "../../assets/school/photo/map-photo.png";
import markerPhoto from "../../assets/school/photo/marker-photo.png";
import notebookPhoto from "../../assets/school/photo/notebook-photo.png";
import paperPhoto from "../../assets/school/photo/paper-photo.png";
import penPhoto from "../../assets/school/photo/pen-photo.png";
import pencilPhoto from "../../assets/school/photo/pencil-photo.png";
import rulerPhoto from "../../assets/school/photo/ruler-photo.png";
import scissorsPhoto from "../../assets/school/photo/scissors-photo.png";
import sharpenerPhoto from "../../assets/school/photo/sharpener-photo.png";

const schoolPhotoOverrides = {
  book: bookPhoto,
  pen: penPhoto,
  pencil: pencilPhoto,
  bag: bagPhoto,
  desk: deskPhoto,
  chair: chairPhoto,
  ruler: rulerPhoto,
  notebook: notebookPhoto,
  scissors: scissorsPhoto,
  crayon: crayonPhoto,
  eraser: eraserPhoto,
  sharpener: sharpenerPhoto,
  marker: markerPhoto,
  glue: gluePhoto,
  paper: paperPhoto,
  folder: folderPhoto,
  board: boardPhoto,
  chalk: chalkPhoto,
  brush: brushPhoto,
  map: mapPhoto,
};

const schoolWords = [
  { id: "book", word: "Book", emoji: "📘", phonics: "บุ๊ค", pronunciation: { guide: "book", ipa: "/bʊk/" }, translation: "หนังสือ" },
  { id: "pen", word: "Pen", emoji: "🖊️", phonics: "เพ็น", pronunciation: { guide: "pen", ipa: "/pen/" }, translation: "ปากกา" },
  { id: "pencil", word: "Pencil", emoji: "✏️", phonics: "เพ็นซิล", pronunciation: { guide: "pencil", ipa: "/ˈpensəl/" }, translation: "ดินสอ" },
  { id: "bag", word: "Bag", emoji: "🎒", phonics: "แบ็ก", pronunciation: { guide: "bag", ipa: "/bæɡ/" }, translation: "กระเป๋า" },
  { id: "desk", word: "Desk", emoji: "🪑", phonics: "เดสก์", pronunciation: { guide: "desk", ipa: "/desk/" }, translation: "โต๊ะเรียน" },
  { id: "chair", word: "Chair", emoji: "🪑", phonics: "แชร์", pronunciation: { guide: "chair", ipa: "/tʃer/" }, translation: "เก้าอี้" },
  { id: "ruler", word: "Ruler", emoji: "📏", phonics: "รูเลอร์", pronunciation: { guide: "ruler", ipa: "/ˈruːlər/" }, translation: "ไม้บรรทัด" },
  { id: "notebook", word: "Notebook", emoji: "📒", phonics: "โน้ตบุ๊ค", pronunciation: { guide: "notebook", ipa: "/ˈnoʊtbʊk/" }, translation: "สมุด" },
  { id: "scissors", word: "Scissors", emoji: "✂️", phonics: "ซิสเซอร์ส", pronunciation: { guide: "scissors", ipa: "/ˈsɪzərz/" }, translation: "กรรไกร" },
  { id: "crayon", word: "Crayon", emoji: "🖍️", phonics: "เครยอน", pronunciation: { guide: "crayon", ipa: "/ˈkreɪən/" }, translation: "สีเทียน" },
  { id: "eraser", word: "Eraser", emoji: "🧽", phonics: "อิเรเซอร์", translation: "ยางลบ" },
  { id: "sharpener", word: "Sharpener", emoji: "✏️", phonics: "ชาร์ปเพอเนอร์", translation: "กบเหลาดินสอ" },
  { id: "marker", word: "Marker", emoji: "🖍️", phonics: "มาร์กเกอร์", translation: "ปากกาเมจิก" },
  { id: "glue", word: "Glue", emoji: "🧴", phonics: "กลู", translation: "กาว" },
  { id: "paper", word: "Paper", emoji: "📄", phonics: "เปเปอร์", translation: "กระดาษ" },
  { id: "folder", word: "Folder", emoji: "📁", phonics: "โฟลเดอร์", translation: "แฟ้ม" },
  { id: "board", word: "Board", emoji: "🧾", phonics: "บอร์ด", translation: "กระดาน" },
  { id: "chalk", word: "Chalk", emoji: "✏️", phonics: "ชอล์ก", translation: "ชอล์ก" },
  { id: "brush", word: "Brush", emoji: "🖌️", phonics: "บรัช", translation: "พู่กัน" },
  { id: "map", word: "Map", emoji: "🗺️", phonics: "แมป", translation: "แผนที่" },
  { id: "clock", word: "Clock", emoji: "🕒", phonics: "คล็อก", translation: "นาฬิกา" },
  { id: "bottle", word: "Bottle", emoji: "🍶", phonics: "บอทเทิล", translation: "ขวดน้ำ" },
  { id: "lunchbox", word: "Lunchbox", emoji: "🍱", phonics: "ลันช์บ็อกซ์", translation: "กล่องข้าว" },
  { id: "calculator", word: "Calculator", emoji: "🧮", phonics: "แคลคิวเลเตอร์", translation: "เครื่องคิดเลข" },
  { id: "computer", word: "Computer", emoji: "💻", phonics: "คอมพิวเตอร์", translation: "คอมพิวเตอร์" },
  { id: "tablet", word: "Tablet", emoji: "📱", phonics: "แท็บเล็ต", translation: "แท็บเล็ต" },
  { id: "keyboard", word: "Keyboard", emoji: "⌨️", phonics: "คีย์บอร์ด", translation: "แป้นพิมพ์" },
  { id: "mouse", word: "Mouse", emoji: "🖱️", phonics: "เมาส์", translation: "เมาส์คอมพิวเตอร์" },
  { id: "speaker", word: "Speaker", emoji: "🔊", phonics: "สปีกเกอร์", translation: "ลำโพง" },
  { id: "headphones", word: "Headphones", emoji: "🎧", phonics: "เฮดโฟน", translation: "หูฟัง" },
  { id: "backpack", word: "Backpack", emoji: "🎒", phonics: "แบ็กแพ็ก", translation: "กระเป๋าสะพายหลัง" },
  { id: "file", word: "File", emoji: "📂", phonics: "ไฟล์", translation: "แฟ้มเอกสาร" },
  { id: "clip", word: "Clip", emoji: "📎", phonics: "คลิป", translation: "คลิปหนีบกระดาษ" },
  { id: "stapler", word: "Stapler", emoji: "🖇️", phonics: "สเตเปลอร์", translation: "ที่เย็บกระดาษ" },
  { id: "tape", word: "Tape", emoji: "📦", phonics: "เทป", translation: "เทปกาว" },
  { id: "paint", word: "Paint", emoji: "🎨", phonics: "เพนต์", translation: "สี" },
  { id: "palette", word: "Palette", emoji: "🎨", phonics: "แพลเลต", translation: "จานสี" },
  { id: "puzzle", word: "Puzzle", emoji: "🧩", phonics: "พัซเซิล", translation: "จิ๊กซอว์" },
  { id: "toy", word: "Toy", emoji: "🧸", phonics: "ทอย", translation: "ของเล่น" },
  { id: "block", word: "Block", emoji: "🧱", phonics: "บล็อก", translation: "บล็อกตัวต่อ" },
  { id: "bell", word: "Bell", emoji: "🔔", phonics: "เบล", translation: "ระฆัง" },
  { id: "uniform", word: "Uniform", emoji: "👕", phonics: "ยูนิฟอร์ม", translation: "ชุดนักเรียน" },
  { id: "shoe", word: "Shoe", emoji: "👟", phonics: "ชู", translation: "รองเท้า" },
  { id: "sock", word: "Sock", emoji: "🧦", phonics: "ซ็อก", translation: "ถุงเท้า" },
  { id: "hat", word: "Hat", emoji: "🧢", phonics: "แฮต", translation: "หมวก" },
  { id: "fan", word: "Fan", emoji: "🪭", phonics: "แฟน", translation: "พัดลม" },
  { id: "lamp", word: "Lamp", emoji: "💡", phonics: "แลมป์", translation: "โคมไฟ" },
  { id: "door", word: "Door", emoji: "🚪", phonics: "ดอร์", translation: "ประตู" },
  { id: "window", word: "Window", emoji: "🪟", phonics: "วินโดว์", translation: "หน้าต่าง" },
  { id: "whiteboard", word: "Whiteboard", emoji: "📋", phonics: "ไวต์บอร์ด", translation: "ไวต์บอร์ด" },
];

export const schoolThingsSubject = {
  id: "school-things",
  name: "School & Things",
  category: "basic",
  icon: "🏫",
  description: "Classroom words",
  words: schoolWords.map((word) => ({
    ...word,
    image: schoolPhotoOverrides[word.id] || word.image,
  })),
};

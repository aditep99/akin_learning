import {applications} from './examApplications.js';
// Each row is a distinct concept with an identifying property and a Thai rationale.
// The application uses short recognition, relationship and application tasks.
const raw = {
plants: `mango tree|a tree that grows mangoes|ต้นมะม่วงให้ผลมะม่วง
banana plant|a plant with bunches of bananas|กล้วยออกผลเป็นเครือ
coconut palm|a palm with coconuts|มะพร้าวเป็นพืชตระกูลปาล์ม
rose plant|a flowering plant often with prickles on its stem|กุหลาบมีดอกและมักมีหนามตามลำต้น
sunflower|a plant with a large flower head like a sun|ทานตะวันมีช่อดอกขนาดใหญ่
rice plant|a grass grown for grains of rice|ข้าวเป็นพืชที่ปลูกเพื่อเก็บเมล็ดข้าว
lotus|a pond plant with large round leaves|บัวเจริญในน้ำและมีใบกลมใหญ่
cactus|a plant often with spines and a thick water-storing stem|กระบองเพชรมักมีหนามและลำต้นอวบน้ำ
fern|a plant with fronds and no flowers|เฟิร์นมีใบเรียกว่าฟรอนด์และไม่มีดอก
moss|a small soft plant often forming a green mat|มอสเป็นพืชเล็กที่มักขึ้นเป็นพรมสีเขียว`,
'plant-homes': `lotus roots|mud at the bottom of a pond|รากบัวอยู่ในโคลนก้นบ่อ
floating duckweed|the surface of still fresh water|แหนลอยบนผิวน้ำจืดที่ค่อนข้างนิ่ง
desert cactus|dry land with little rain|กระบองเพชรทะเลทรายเหมาะกับพื้นที่ฝนน้อย
mangrove tree|muddy shores with salty water|ป่าชายเลนขึ้นบริเวณชายฝั่งดินเลนน้ำเค็มหรือน้ำกร่อย
forest fern|a damp shady forest floor|เฟิร์นป่าหลายชนิดชอบพื้นป่าชื้นร่ม
rock moss|a moist shady rock surface|มอสบนหินมักพบในบริเวณชื้นร่ม
garden grass|soil in a sunny lawn|หญ้าสนามปลูกบนดินที่มีแสง
rice seedlings|a wet rice field|ต้นกล้าข้าวปลูกในนาที่มีน้ำเพียงพอ
tree-growing orchid|the surface of a tree branch|กล้วยไม้อิงอาศัยเกาะบนกิ่งไม้ ไม่ได้กินต้นไม้
water lily|fresh pond water with roots in mud|บัวสายขึ้นในน้ำจืดและมีรากอยู่ในโคลน`,
'plant-parts': `root|the part usually below the soil|รากมักอยู่ใต้ดิน
stem|the main support joining roots and leaves|ลำต้นเชื่อมรากกับใบและพยุงส่วนต่าง ๆ
leaf|a usually flat green part attached to a stem|ใบมักเป็นแผ่นสีเขียวติดกับลำต้น
flower|the part with petals in a flowering plant|ดอกของพืชมีดอกอาจมีกลีบดอก
fruit|the part around the seeds of a mango|ผลมะม่วงหุ้มเมล็ด
seed|the part inside a bean that can grow into a new plant|เมล็ดถั่วสามารถงอกเป็นต้นใหม่
petal|a coloured part around the centre of many flowers|กลีบดอกอยู่รอบส่วนกลางของดอกหลายชนิด
branch|a woody stem growing out from a tree trunk|กิ่งเป็นลำต้นที่แยกจากลำต้นหลัก
trunk|the thick main stem of a tree|ลำต้นใหญ่ของต้นไม้เรียกว่าลำต้นหลัก
bud|a young unopened flower or shoot|ตาอาจเจริญเป็นดอกหรือยอดอ่อน`,
'plant-functions': `roots taking in water|water enters from the soil|รากดูดน้ำจากดิน
roots holding the plant|the plant stays anchored in the ground|รากช่วยยึดต้นพืชกับพื้นดิน
stem support|leaves and flowers are held up|ลำต้นช่วยพยุงใบและดอก
stem transport|water moves from roots toward leaves|ลำต้นลำเลียงน้ำจากรากไปยังใบ
leaf food-making|green leaves use sunlight to make food|ใบสีเขียวใช้แสงในการสร้างอาหาร
fruit protection|seeds are covered by the fruit|ผลช่วยหุ้มและป้องกันเมล็ด
seed growth|a new young plant can begin|เมล็ดที่เหมาะสมสามารถงอกเป็นต้นใหม่
flower seed-making|a flowering plant can form seeds after pollination|ดอกเกี่ยวข้องกับการสร้างเมล็ดหลังผสมเกสร
petals attracting insects|colourful flower parts help visiting insects find flowers|สีของกลีบดอกช่วยดึงดูดแมลงบางชนิด
thick cactus stem|water is stored for dry times|ลำต้นอวบน้ำของกระบองเพชรเก็บน้ำไว้ใช้`,
animals: `cat|a common pet that meows|แมวร้องเหมียว
dog|a common pet that barks|สุนัขเห่า
duck|a bird with a broad bill and webbed feet|เป็ดมีจะงอยปากแบนและเท้ามีพังผืด
chicken|a farm bird whose female is called a hen|ไก่ตัวเมียเรียกว่า hen
cow|a large farm animal whose female can give milk|วัวตัวเมียสามารถให้น้ำนม
elephant|a large land animal with a trunk|ช้างมีงวง
butterfly|an insect with large often colourful wings|ผีเสื้อเป็นแมลงที่มีปีกใหญ่
snail|an animal that carries a spiral shell|หอยทากมีเปลือกขด
earthworm|a long soft animal with no legs living in soil|ไส้เดือนมีลำตัวยาวนิ่ม ไม่มีขา
spider|an animal with eight legs|แมงมุมมีแปดขา`,
'animal-homes': `clownfish|sea water near a sea anemone|ปลาการ์ตูนอาศัยในทะเลใกล้ดอกไม้ทะเล
earthworm|damp soil underground|ไส้เดือนอาศัยในดินชื้น
polar bear|cold Arctic sea-ice regions|หมีขั้วโลกอยู่บริเวณอาร์กติก
camel|dry desert regions|อูฐบางชนิดอาศัยในทะเลทราย
tree squirrel|trees where it can climb and shelter|กระรอกต้นไม้ปีนและหลบพักบนต้นไม้
frog|a moist place near fresh water|กบทั่วไปต้องการความชื้นและมักพบใกล้น้ำจืด
whale|the ocean, coming up to breathe air|วาฬอยู่ในทะเลและขึ้นมาหายใจ
ant colony|a nest with many connected tunnels|มดอยู่ร่วมกันในรังที่มีทางเชื่อม
pond fish|fresh water in a pond|ปลาน้ำจืดในบ่ออยู่ในน้ำจืด
woodpecker|trees with holes used for nesting|นกหัวขวานทำรังในโพรงไม้`,
'animal-parts': `bird wing|a feathered body part used by many birds to fly|ปีกนกมีขนและช่วยนกหลายชนิดบิน
fish fin|a part used to steer in water|ครีบปลาช่วยควบคุมทิศทางในน้ำ
fish gills|parts that take oxygen from water|เหงือกปลารับออกซิเจนจากน้ำ
duck webbed feet|feet with skin between the toes|เท้าเป็ดมีพังผืดระหว่างนิ้ว
elephant trunk|a long nose used to smell and pick things up|งวงเป็นจมูกที่ใช้ดมและหยิบจับ
snail shell|a hard cover protecting a soft body|เปลือกหอยช่วยป้องกันลำตัวนิ่ม
bird beak|a hard mouth part used to pick up food|จะงอยปากช่วยนกหยิบอาหาร
cat whiskers|long sensitive hairs beside the face|หนวดแมวเป็นขนที่ไวต่อการสัมผัส
insect antennae|a pair of feelers on the head|หนวดแมลงอยู่บนหัว
turtle shell|a hard covering joined to a turtle's body|กระดองเต่าเป็นส่วนของร่างกายเต่า`,
movement: `fish swimming|pushing through water using body and fins|ปลาใช้ลำตัวและครีบเคลื่อนที่ในน้ำ
bird flying|moving through air by using wings|นกที่บินได้ใช้ปีกเคลื่อนผ่านอากาศ
snake slithering|moving along the ground without legs|งูเลื้อยโดยไม่มีขา
rabbit hopping|pushing off with strong back legs|กระต่ายใช้ขาหลังช่วยกระโดด
snail gliding|moving slowly on a broad muscular foot|หอยทากใช้ส่วนเท้าที่เป็นกล้ามเนื้อ
horse running|moving quickly on four legs|ม้าวิ่งโดยใช้ขาสี่ขา
monkey climbing|gripping branches with hands and feet|ลิงใช้มือและเท้าจับกิ่งเพื่อปีน
duck paddling|pushing water with webbed feet|เป็ดใช้เท้าพังผืดพุ้ยน้ำ
butterfly fluttering|moving light wings through the air|ผีเสื้อกระพือปีกในอากาศ
earthworm crawling|stretching and shortening a soft body|ไส้เดือนยืดหดลำตัวเพื่อเคลื่อนที่`,
body: `eyes|two organs above the cheeks|ดวงตาอยู่เหนือแก้ม
ears|parts on the sides of the head|หูอยู่ด้านข้างศีรษะ
nose|the part above the mouth with nostrils|จมูกอยู่เหนือปากและมีรูจมูก
tongue|a soft movable part inside the mouth|ลิ้นเป็นส่วนอ่อนที่เคลื่อนไหวได้ในปาก
skin|the outer covering of the body|ผิวหนังหุ้มภายนอกร่างกาย
hands|parts at the ends of the arms|มืออยู่ปลายแขน
feet|parts at the ends of the legs|เท้าอยู่ปลายขา
knees|joints in the middle of the legs|เข่าเป็นข้อต่อที่ช่วยงอขา
elbows|joints that bend the arms|ข้อศอกช่วยงอแขน
neck|the part joining the head to the body|คอเชื่อมศีรษะกับลำตัว`,
'body-uses': `eyes|seeing the words on a page|ตาใช้มองเห็นตัวหนังสือ
ears|hearing a school bell|หูใช้ได้ยินเสียงกระดิ่ง
nose|smelling a flower's scent|จมูกใช้รับกลิ่นดอกไม้
tongue|tasting the sweetness of a ripe banana|ลิ้นรับรสหวาน
skin|feeling a soft cloth against the arm|ผิวหนังรับสัมผัส
hands|holding a pencil to draw|มือใช้จับดินสอ
feet|supporting the body when standing|เท้ารองรับน้ำหนักเวลายืน
knees|bending the legs to sit down|เข่าช่วยงอขาเวลานั่ง
teeth|biting and chewing food|ฟันใช้กัดและเคี้ยวอาหาร
neck|turning the head to look sideways|คอช่วยหันศีรษะ`,
senses: `sight|noticing the colour of a rainbow|การเห็นใช้รับรู้สีรุ้ง
hearing|noticing the sound of a drum|การได้ยินใช้รับรู้เสียงกลอง
smell|noticing the scent of a flower|การดมใช้รับรู้กลิ่นดอกไม้
taste|noticing that a banana is sweet|การรับรสช่วยรู้รสหวาน
touch|noticing that a cloth feels rough|การสัมผัสช่วยรับรู้ความหยาบ
eyes|the sense organs for looking at a picture|ตาเป็นอวัยวะรับการมองเห็น
ears|the sense organs for listening to music|หูเป็นอวัยวะรับการได้ยิน
nose|the sense organ for smelling bread|จมูกเป็นอวัยวะรับกลิ่น
tongue|the sense organ for tasting food|ลิ้นเป็นอวัยวะรับรส
skin|the sense organ covering the body|ผิวหนังเป็นอวัยวะรับสัมผัสทั่วร่างกาย`,
'body-care': `clean hands|washing with soap and water before eating|ล้างมือด้วยสบู่และน้ำก่อนกินอาหาร
clean teeth|brushing teeth gently with a toothbrush|แปรงฟันอย่างนุ่มนวล
safe eyes|keeping sharp objects away from eyes|อย่านำของแหลมใกล้ดวงตา
safe ears|keeping the sound at a comfortable level|หลีกเลี่ยงเสียงดังเกินไป
clean skin|washing dirt off the body|ล้างสิ่งสกปรกออกจากผิวหนัง
clean nails|keeping nails short and clean|ดูแลเล็บให้สั้นและสะอาด
safe feet|wearing suitable shoes outdoors|สวมรองเท้าที่เหมาะสมเมื่อออกนอกบ้าน
clean hair|washing hair when dirty|สระผมเมื่อสกปรก
cough care|covering a cough with a bent elbow|ใช้ข้อพับแขนปิดปากเมื่อไอ
small injury|telling a trusted adult about a cut|บอกผู้ใหญ่ที่ไว้ใจเมื่อมีบาดแผล`,
external: `head|the body part above the neck|ศีรษะอยู่เหนือคอ
shoulder|the place where an arm joins the upper body|หัวไหล่อยู่จุดที่แขนต่อกับลำตัว
arm|the limb between shoulder and hand|แขนอยู่ระหว่างหัวไหล่กับมือ
wrist|the joint between hand and forearm|ข้อมือเชื่อมมือกับแขนท่อนล่าง
finger|one of the digits used for fine hand movements|นิ้วมือช่วยหยิบจับอย่างละเอียด
thumb|the short digit opposite the other fingers|นิ้วหัวแม่มืออยู่ตรงข้ามนิ้วอื่นเวลาหยิบจับ
leg|the limb between hip and foot|ขาอยู่ระหว่างสะโพกกับเท้า
ankle|the joint between leg and foot|ข้อเท้าเชื่อมขากับเท้า
toe|one of the digits at the front of a foot|นิ้วเท้าอยู่ด้านหน้าของเท้า
heel|the back part underneath a foot|ส้นเท้าอยู่ใต้ส่วนหลังของเท้า`,
'health-senses': `seeing a traffic light|using the eyes to notice a light's colour|ตามองเห็นสีของสัญญาณไฟ
hearing a warning bell|using the ears to notice an alert sound|หูได้ยินเสียงเตือน
smelling smoke|using the nose to notice a burning smell|จมูกรับกลิ่นควัน ควรบอกผู้ใหญ่เมื่อพบ
tasting a lemon|using the tongue to notice sourness|ลิ้นรับรสเปรี้ยวของมะนาว
feeling a towel|using the skin to notice softness|ผิวหนังรับรู้ความนุ่มของผ้า
looking|finding which shirt is blue|ใช้การมองหาสีเสื้อ
listening|finding which instrument makes a ringing sound|ใช้การฟังแยกเสียงเครื่องดนตรี
smelling|finding which flower has a scent without touching it|ใช้การดมรับกลิ่นโดยไม่ต้องสัมผัส
tasting|telling sweet from sour in safe food|ใช้การรับรสกับอาหารที่ปลอดภัย
touching|telling smooth from rough on a safe surface|ใช้การสัมผัสแยกเรียบกับหยาบบนพื้นผิวปลอดภัย`,
'health-functions': `fingers|doing up small buttons|นิ้วมือช่วยติดกระดุมเล็ก
thumb|working against fingers to grip a cup|นิ้วหัวแม่มือทำงานร่วมกับนิ้วอื่นเพื่อจับแก้ว
arms|reaching for a book on a low shelf|แขนช่วยเอื้อมหยิบหนังสือ
legs|moving the body when walking|ขาช่วยเดิน
ankles|letting the feet bend while stepping|ข้อเท้าช่วยให้เท้าขยับขณะก้าว
toes|helping with balance and pushing off|นิ้วเท้าช่วยทรงตัวและถีบพื้น
lips|closing the mouth around a drinking straw|ริมฝีปากช่วยปิดรอบหลอดดูด
eyelids|closing over the eyes when blinking|เปลือกตาปิดดวงตาเมื่อกะพริบ
shoulders|helping raise the arms|หัวไหล่ช่วยยกแขน
wrists|letting the hands bend and turn|ข้อมือช่วยให้มือพับและหมุน`,
'health-care': `eye care while reading|using enough light to see the page comfortably|อ่านในแสงที่มองเห็นได้สบาย
ear canal care|keeping pencils and small objects out of ears|ไม่ใส่ดินสอหรือของเล็กในรูหู
nose care|using a clean tissue to wipe the nose|ใช้กระดาษสะอาดเช็ดจมูก
mouth care after eating|removing food left on teeth by brushing|แปรงฟันเพื่อเอาเศษอาหารออก
hand care after the toilet|washing hands with soap and water|ล้างมือด้วยสบู่และน้ำหลังใช้ห้องน้ำ
foot care after getting wet|drying feet and changing wet socks|เช็ดเท้าและเปลี่ยนถุงเท้าที่เปียก
skin care in strong sunshine|using shade and suitable sun protection|หลบแดดและใช้สิ่งป้องกันแดดที่เหมาะสม
nail care|asking an adult for help with safe nail cutting|ขอผู้ใหญ่ช่วยตัดเล็บอย่างปลอดภัย
hair care at school|using a personal comb rather than sharing|ใช้หวีส่วนตัว
care when a body part hurts|telling a trusted adult instead of hiding pain|บอกผู้ใหญ่ที่ไว้ใจเมื่อเจ็บ`,
bonds: `listening|letting a family member finish speaking|ฟังจนคนในครอบครัวพูดจบ
sharing|taking turns with a family game|แบ่งกันเล่นและผลัดกัน
helping|putting your toys away after play|ช่วยเก็บของเล่นหลังเล่น
gratitude|saying thank you for someone's help|ขอบคุณเมื่อได้รับความช่วยเหลือ
apologising|saying sorry after hurting someone|ขอโทษเมื่อทำให้ผู้อื่นเจ็บหรือเสียใจ
kindness|comforting a family member who is sad|ปลอบโยนคนที่เสียใจ
cooperation|working together to set the table|ร่วมมือกันจัดโต๊ะ
respecting space|asking before using another person's things|ขอก่อนใช้ของผู้อื่น
asking for help|telling a trusted adult when worried|ขอความช่วยเหลือเมื่อกังวล
peaceful disagreement|using calm words when opinions differ|ใช้คำพูดสงบเมื่อเห็นต่าง`,
family: `mother|a female parent|แม่คือผู้ปกครองที่เป็นผู้หญิง
father|a male parent|พ่อคือผู้ปกครองที่เป็นผู้ชาย
sister|a girl who shares a parent with you|พี่สาวหรือน้องสาวมีผู้ปกครองร่วมกับเรา
brother|a boy who shares a parent with you|พี่ชายหรือน้องชายมีผู้ปกครองร่วมกับเรา
grandmother|a parent's mother|ย่าหรือยายคือแม่ของพ่อหรือแม่
grandfather|a parent's father|ปู่หรือตาคือพ่อของพ่อหรือแม่
aunt|a parent's sister|ป้าหรือน้าหรืออาผู้หญิงอาจเป็นพี่น้องของพ่อแม่
uncle|a parent's brother|ลุงหรือน้าหรืออาผู้ชายอาจเป็นพี่น้องของพ่อแม่
cousin|an aunt's or uncle's child|ลูกพี่ลูกน้องคือลูกของป้าน้าอาหรือลุง
grandchild|a son or daughter's child|หลานของปู่ย่าตายายคือลูกของลูก`,
strength: `careful listening|following spoken steps without interrupting|การฟังอย่างตั้งใจช่วยทำตามขั้นตอน
patience|waiting calmly for a turn|ความอดทนช่วยรอคอยอย่างสงบ
creativity|thinking of a new design for a paper animal|ความคิดสร้างสรรค์ช่วยออกแบบสิ่งใหม่
persistence|trying a puzzle again after a mistake|ความพยายามคือไม่เลิกเพราะพลาดครั้งเดียว
teamwork|sharing jobs fairly in a group|การทำงานเป็นทีมแบ่งหน้าที่อย่างเป็นธรรม
kindness|helping a classmate who dropped books|ความเมตตาแสดงผ่านการช่วยเหลือ
observation|spotting a small difference between pictures|การสังเกตช่วยพบรายละเอียด
organisation|putting materials in labelled boxes|การจัดระเบียบช่วยเก็บของเป็นที่
honesty|telling the truth about a broken toy|ความซื่อสัตย์คือบอกความจริง
curiosity|asking how a seed grows|ความอยากรู้ทำให้ถามเพื่อเรียนรู้`,
esteem: `a helpful self-message|I cannot do it yet, but I can practise.|พูดกับตนเองอย่างให้กำลังใจและฝึกต่อ
accepting a mistake|I can learn from this wrong answer.|ความผิดพลาดเป็นโอกาสเรียนรู้
recognising progress|I can read more words than last week.|เปรียบเทียบกับพัฒนาการของตนเอง
valuing differences|My friend and I can have different strengths.|แต่ละคนมีจุดแข็งต่างกันได้
receiving a compliment|Thank you. I worked hard on this.|รับคำชมอย่างสุภาพ
asking for support|Please show me the first step.|ขอความช่วยเหลือเป็นทักษะที่ดี
setting a small goal|I will practise one new word today.|เริ่มจากเป้าหมายเล็กที่ทำได้
being fair to yourself|One hard task does not make me bad at everything.|งานยากหนึ่งอย่างไม่ตัดสินคุณค่าทั้งหมด
respecting yourself|My feelings matter, and I can talk about them.|ความรู้สึกของตนเองสำคัญและพูดคุยได้
celebrating effort|I am proud that I kept trying.|ภูมิใจในความพยายามของตนเองได้`,
children: `shared learning|boys and girls can both learn maths|เด็กชายและเด็กหญิงเรียนคณิตศาสตร์ได้
shared feelings|boys and girls can both feel sad|เด็กทุกคนรู้สึกเศร้าได้
shared care|boys and girls both need food and rest|เด็กทุกคนต้องการอาหารและพักผ่อน
individual interests|a favourite toy does not tell you whether someone is a boy or a girl|ของเล่นโปรดไม่ใช้ตัดสินว่าเป็นเด็กชายหรือเด็กหญิง
individual appearance|hair length alone does not tell you whether someone is a boy or a girl|ความยาวผมไม่ใช้ตัดสินเพศ
equal turns|everyone gets a fair turn in a game|ทุกคนควรได้เล่นอย่างเป็นธรรม
privacy|body parts covered by underwear are private|ส่วนที่ชุดชั้นในปิดเป็นส่วนส่วนตัว
respectful language|using the name a child asks you to use|เรียกชื่อที่เจ้าตัวต้องการอย่างสุภาพ
body differences|people's bodies can differ and still deserve respect|ร่างกายต่างกันได้และควรได้รับความเคารพ
personal boundaries|asking before hugging someone|ขออนุญาตก่อนกอดและเคารพคำตอบ`,
dot: `single dot|one small separate mark|จุดเดียวเป็นรอยเล็กแยกเดี่ยว
dot group|several small separate marks together|กลุ่มจุดมีหลายจุดอยู่ร่วมกัน
widely spaced dots|dots with large gaps between them|จุดห่างมีช่องว่างมาก
closely spaced dots|dots with small gaps between them|จุดถี่มีช่องว่างน้อย
large dot|a spot taking up more space than a tiny dot|จุดใหญ่กินพื้นที่มากกว่าจุดเล็ก
tiny dot|a very small spot|จุดจิ๋วเป็นรอยขนาดเล็กมาก
dot row|separate dots arranged in a straight path|แถวจุดเรียงตามแนวตรงแต่ยังแยกกัน
dot ring|separate dots arranged around a centre|วงจุดเรียงรอบจุดกลาง
dot pattern|a dot arrangement that repeats|ลวดลายจุดมีการจัดซ้ำ
dot shading|many dots used to make an area look darker|จุดจำนวนมากช่วยให้บริเวณดูเข้ม`,
line: `straight line|a line with no bend|เส้นตรงไม่มีส่วนโค้ง
curved line|a line that bends smoothly|เส้นโค้งเปลี่ยนทิศอย่างนุ่มนวล
zigzag line|a line with sharp repeated turns|เส้นซิกแซกหักมุมซ้ำ
wavy line|a line with repeated smooth rises and dips|เส้นคลื่นโค้งขึ้นลงซ้ำ
horizontal line|a line going across from left to right|เส้นแนวนอนทอดจากซ้ายไปขวา
vertical line|a line going up and down|เส้นแนวตั้งทอดขึ้นลง
diagonal line|a straight line slanting across the page|เส้นทแยงเอียงผ่านหน้ากระดาษ
thick line|a line with a wide stroke|เส้นหนามีรอยกว้าง
thin line|a line with a narrow stroke|เส้นบางมีรอยแคบ
broken line|short line pieces separated by gaps|เส้นประมีช่วงเส้นสลับช่องว่าง`,
geometric: `circle|a flat round shape with no corners|วงกลมเป็นรูปแบนกลมไม่มีมุม
triangle|a flat closed shape with three straight sides|สามเหลี่ยมมีด้านตรงสามด้าน
square|a flat shape with four equal sides and four square corners|สี่เหลี่ยมจัตุรัสมีด้านเท่ากันและมุมฉากสี่มุม
non-square rectangle|a shape with four square corners and unequal length and width|สี่เหลี่ยมผืนผ้าที่ไม่ใช่จัตุรัสมีความยาวกับกว้างไม่เท่ากัน
oval|a smooth closed shape like a stretched circle|วงรีคล้ายวงกลมที่ยืดออก
semicircle|half of a circle with one straight edge|ครึ่งวงกลมมีขอบตรงหนึ่งด้าน
pentagon|a closed flat shape with five straight sides|ห้าเหลี่ยมมีด้านตรงห้าด้าน
hexagon|a closed flat shape with six straight sides|หกเหลี่ยมมีด้านตรงหกด้าน
side|a straight boundary segment of a polygon|ด้านเป็นส่วนเส้นตรงของขอบรูปหลายเหลี่ยม
corner|a point where two straight sides meet|มุมเกิดบริเวณที่ด้านตรงสองด้านพบกัน`,
organic: `leaf outline|a natural-looking shape based on a leaf|รูปใบไม้ใช้ลักษณะจากธรรมชาติ
cloud outline|an uneven soft shape based on a cloud|รูปเมฆมีขอบนุ่มไม่สม่ำเสมอ
puddle outline|an irregular shape based on water on the ground|แอ่งน้ำมีขอบไม่สม่ำเสมอ
pebble outline|a rounded uneven shape based on a small stone|ก้อนกรวดมีขอบมนไม่เท่ากัน
tree silhouette|an outline showing trunk and spreading branches|เงารูปต้นไม้แสดงลำต้นและกิ่ง
flower outline|a shape based on petals around a centre|รูปดอกไม้อาศัยกลีบรอบกลางดอก
shell outline|a natural outline based on an animal's shell|รูปเปลือกหอยอาศัยรูปร่างตามธรรมชาติ
island outline|an uneven shape based on land surrounded by water|รูปเกาะมีขอบชายฝั่งไม่สม่ำเสมอ
mountain outline|a natural outline with rising peaks|รูปภูเขามีแนวสูงต่ำเป็นยอด
fruit outline|a shape based on the outside of a fruit|รูปผลไม้ใช้เส้นรอบนอกของผล`,
'free-form': `invented blob|a made-up closed shape with an uneven edge|รูปร่างอิสระแบบก้อนเกิดจากจินตนาการ
free drawing|moving a pencil to invent an outline without a shape template|วาดอย่างอิสระโดยไม่ใช้แม่แบบ
closed outline|an outline whose ends meet|เส้นรอบรูปปิดเมื่อปลายมาพบกัน
open outline|an outline with a gap between its ends|เส้นรอบรูปเปิดมีช่องว่างระหว่างปลาย
free cutout|a paper shape cut along an invented path|ตัดกระดาษตามแนวที่คิดขึ้น
uneven edge|a boundary with different bumps and bends|ขอบไม่สม่ำเสมอมีส่วนโค้งและนูนต่างกัน
traced free-form shape|a copy made by following an invented shape's edge|ลากตามขอบรูปร่างอิสระเพื่อทำสำเนา
overlapping shapes|shapes placed partly over one another|รูปซ้อนทับกันบางส่วน
rotated shape|the same shape turned to a different direction|หมุนรูปเปลี่ยนทิศแต่ยังเป็นรูปเดิม
enlarged shape|a bigger version keeping the same outline proportions|ขยายรูปให้ใหญ่โดยรักษาสัดส่วน`,
nature: `leaf veins|branching lines visible on a leaf|เส้นใบเป็นเส้นแตกแขนง
tree bark|the textured outer surface of a tree trunk|เปลือกไม้เป็นผิวด้านนอกลำต้น
shell spiral|a curving pattern winding around a centre on some shells|เปลือกหอยบางชนิดมีลายขด
flower petals|parts often repeated around a flower centre|กลีบดอกมักเรียงรอบกลางดอก
raindrops|small drops of water falling from clouds|เม็ดฝนเป็นหยดน้ำจากเมฆ
river bend|a curve in a flowing river's path|โค้งแม่น้ำเป็นแนวโค้งตามทางน้ำ
mountain ridge|a long raised edge joining high ground|สันเขาเป็นแนวพื้นที่สูง
bird feather|a light covering with fine branching strands|ขนนกมีเส้นละเอียดแตกแขนง
pebble surface|the outside texture of a small stone|ผิวก้อนกรวดอาจใช้สังเกตพื้นผิว
starry sky|many points of light seen at night|ดาวบนท้องฟ้าเห็นเป็นจุดแสงยามคืน`,
natural: `fallen leaf|a plant part that dropped from a tree|ใบไม้ร่วงเป็นสิ่งจากธรรมชาติ
river stone|a rock shaped by natural processes in a river|หินแม่น้ำเกิดและเปลี่ยนตามธรรมชาติ
seashell|a hard covering made by an animal|เปลือกหอยสร้างโดยสัตว์
pine cone|a seed-bearing structure grown by a pine tree|โคนสนเกิดจากต้นสน
bird feather|a covering grown by a bird|ขนนกงอกจากนก
sand|small rock and mineral grains|ทรายประกอบด้วยเม็ดหินและแร่เล็ก
rainwater|water that falls naturally from clouds|น้ำฝนตกจากเมฆ
twig|a small woody piece from a tree|กิ่งไม้เล็กเป็นส่วนจากต้นไม้
clay in the ground|fine earth that can feel sticky when wet|ดินเหนียวในพื้นดินเป็นวัสดุธรรมชาติ
cotton on a plant|soft fibres growing around cotton seeds|เส้นใยฝ้ายเกิดรอบเมล็ดฝ้าย`,
made: `paper sheet|a flat writing material processed by people|กระดาษแปรรูปโดยมนุษย์
glass bottle|a container shaped by people from glass|ขวดแก้วเป็นภาชนะที่มนุษย์ผลิต
plastic ruler|a measuring tool made from plastic|ไม้บรรทัดพลาสติกมนุษย์ผลิต
wooden chair|furniture built by people from wood|เก้าอี้ไม้สร้างจากไม้โดยมนุษย์
brick wall|a structure people build with bricks|กำแพงอิฐสร้างโดยมนุษย์
metal spoon|an eating tool shaped from metal|ช้อนโลหะเป็นเครื่องใช้ที่ผลิตขึ้น
cotton shirt|clothing made by people from cotton fabric|เสื้อฝ้ายตัดเย็บโดยมนุษย์
clay pot|a container shaped and fired by people|หม้อดินปั้นและเผาโดยมนุษย์
toy car|a small vehicle model made for play|รถของเล่นผลิตเพื่อเล่น
paper flower|a flower shape folded or cut from paper|ดอกไม้กระดาษประดิษฐ์จากกระดาษ`,
physical: `thirsty|wanting a drink of water|กระหายน้ำคืออยากดื่มน้ำ
hungry|feeling a need to eat|หิวคือรู้สึกต้องการอาหาร
tired|feeling a need to rest after activity|เหนื่อยคือต้องการพักหลังทำกิจกรรม
sleepy|feeling ready to sleep|ง่วงคือรู้สึกอยากนอน
cold|shivering and wanting a warm layer|หนาวอาจสั่นและอยากเพิ่มเสื้อผ้า
hot|feeling too warm in the sunshine|ร้อนคือรู้สึกอุณหภูมิสูงเกินสบาย
itchy|feeling an urge to scratch the skin|คันคือความรู้สึกอยากเกาผิว
sore|feeling pain in a body part|เจ็บเป็นความรู้สึกทางร่างกาย
full|feeling that enough food has been eaten|อิ่มคือรู้สึกว่ากินพอแล้ว
comfortable|feeling physically at ease in a suitable place|สบายกายเมื่อสภาพแวดล้อมเหมาะสม`,
emotional: `happy|feeling glad about good news|ดีใจเมื่อได้รับข่าวดี
sad|feeling unhappy about losing something loved|เสียใจเมื่อสูญเสียสิ่งที่รัก
angry|feeling upset about being treated unfairly|โกรธเมื่อรู้สึกว่าไม่ได้รับความเป็นธรรม
scared|feeling afraid of something thought dangerous|กลัวเมื่อคิดว่ามีอันตราย
excited|feeling eager about something coming soon|ตื่นเต้นเมื่อรอสิ่งที่อยากทำ
worried|thinking nervously that something may go wrong|กังวลว่าอาจมีเรื่องผิดพลาด
proud|feeling pleased about your own effort|ภูมิใจในความพยายามของตน
lonely|feeling sad because you want company|เหงาเมื่ออยากมีเพื่อนอยู่ด้วย
calm|feeling peaceful and settled|สงบคือจิตใจผ่อนคลาย
surprised|reacting to something unexpected|ประหลาดใจเมื่อพบสิ่งไม่คาดคิด`,
environment: `peaceful scene|a child says a quiet garden makes them feel calm|ใช้คำบอกความรู้สึกของเด็กเป็นหลักฐาน
noisy scene|a child says loud traffic makes them feel bothered|เสียงดังทำให้เด็กในสถานการณ์รำคาญ
welcoming scene|a child says a friendly playground makes them feel included|เด็กบอกว่ารู้สึกเป็นส่วนหนึ่ง
lonely scene|a child says an empty playground makes them miss friends|เด็กบอกคิดถึงเพื่อนจึงสื่อความเหงา
joyful scene|a child says flowers in a park make them feel happy|เด็กระบุว่าดอกไม้ทำให้ดีใจ
worrying scene|a child says litter near animals makes them feel worried|เด็กกังวลเรื่องขยะใกล้สัตว์
surprising scene|a child says a sudden rainbow was unexpected|รุ้งที่ไม่คาดคิดทำให้ประหลาดใจ
uncomfortable scene|a child says a very hot room makes them feel too warm|เด็กบอกว่าห้องร้อนจนไม่สบายกาย
refreshing scene|a child says a cool breeze feels pleasant on their skin|ลมเย็นทำให้เด็กในเรื่องสบายกาย
frightening scene|a child says a sudden thunderclap makes them feel afraid|เด็กระบุว่ากลัวเสียงฟ้าร้อง`,
};

export const knowledgeBanks = Object.fromEntries(Object.entries(raw).map(([key,text])=>[key,text.split('\n').map(line=>{
  const [term,property,th]=line.split('|'); return {term,property,th};
})]));

export function knowledgeItems(topic) {
  const bank=knowledgeBanks[topic.bank];
  if(!bank || bank.length!==10) throw new Error(`Missing ten-concept bank: ${topic.bank}`);
  const optionRows=(index)=>[0,1,3,6].map(offset=>bank[(index+offset)%10]);
  return Array.from({length:40},(_,i)=>{
    const j=i%10, row=bank[j], peers=optionRows(j);
    let prompt,answer,options;
    if(i<10) {
      prompt=`Which matches this description: ${row.property}?`;
      answer=row.term; options=peers.map(r=>r.term);
    } else if(i<20) {
      prompt=`Which description belongs with "${row.term}"?`;
      answer=row.property; options=peers.map(r=>r.property);
    } else if(i<30) {
      const second=bank[(j+2)%10];
      prompt=`Compare "${row.term}" and "${second.term}". Which matches: ${row.property}?`;
      answer=row.term;
      options=[row.term,second.term,'Both','Neither'];
    } else if(i<34) {
      prompt=`A label says "${row.term}", but its note says "${bank[(j+1)%10].property}". Which note corrects the label?`;
      answer=row.property; options=peers.map(r=>r.property);
    } else {
      const [conceptIndex,scenario]=applications[topic.bank][i-34];
      const target=bank[conceptIndex];
      return {prompt:scenario,answer:target.term,options:optionRows(conceptIndex).map(r=>r.term),conceptId:`${topic.bank}:${conceptIndex}`,explanation:{en:`${target.term}: ${target.property}.`,th:target.th}};
    }
    return {prompt,answer,options,conceptId:`${topic.bank}:${j}`,explanation:{en:`${row.term}: ${row.property}.${i>=20&&i<30?` ${bank[(j+2)%10].term}: ${bank[(j+2)%10].property}.`:''}`,th:`${row.th}${i>=20&&i<30?` ${bank[(j+2)%10].th}`:''}`}};
  });
}

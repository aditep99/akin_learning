import {finalTestLevels} from './finalTestExercises.js';
import {examTopics,EXAM_VERSION} from './examTopics.js';
import {mathItems} from './examMath.js';
import {knowledgeItems} from './examKnowledge.js';
import {answerText,correctAnswer} from './examSession.js';
import {plantPhotoId} from './examPhotoAssets';

const matchingEnglish = {
 'หนังสือ':'something with pages to read','ดินสอ':'a tool for writing with graphite','กระเป๋า':'a container for carrying school things',
 'สีแดง':'the colour of a ripe red tomato','สีน้ำเงิน':'the colour of a clear daytime sky','สีเขียว':'the colour of most fresh leaves',
 'ไม้บรรทัด':'a tool for measuring length','เก้าอี้':'a seat with a back','สีเทียน':'a coloured wax drawing stick',
 'แม่':'female parent','พ่อ':'male parent','พี่สาว/น้องสาว':'female sibling','พี่ชาย/น้องชาย':'male sibling','ย่า/ยาย':'grandmother','ปู่/ตา':'grandfather',
 'ลูกบอล':'a round toy for throwing','ตุ๊กตา':'a toy shaped like a person','หุ่นยนต์':'a toy machine shaped like a robot','บล็อก':'small pieces used for building','จิ๊กซอว์':'a picture puzzle made of pieces','ตุ๊กตาหมี':'a soft toy bear',
 'ข้างใน':'inside','บน':'on top of','ข้างใต้':'below','ข้างๆ':'beside','ด้านหลัง':'at the back of','ด้านหน้า':'ahead of',
 'รถบัส':'a large road vehicle for many passengers','รถไฟ':'a vehicle that runs on rails','เรือ':'a vehicle that travels on water','รถยนต์':'a small road vehicle with four wheels','จักรยาน':'a two-wheeled vehicle with pedals','เครื่องบิน':'a vehicle with wings that flies',
 'วงกลม':'a flat round shape with no corners','สี่เหลี่ยมจัตุรัส':'four equal sides and four square corners','สามเหลี่ยม':'a flat shape with three straight sides',
 'ขับรถบัส':'drives a bus','ขับเครื่องบิน':'flies a plane','ขับรถไฟ':'drives a train','โดยรถบัส':'using a bus','โดยรถไฟ':'using a train','เดินเท้า':'walking',
};

const rules = {
 plural:['Use a singular noun with one and a plural noun with two or more.','one ใช้คำนามเอกพจน์ จำนวนตั้งแต่สองใช้รูปพหูพจน์ โดยบางคำเติม -es'],
 possessives:['Choose the possessive adjective that agrees with the owner.','I → my, you → your, he → his, she → her, we → our, they → their'],
 'have-got':['I/you/we/they use have got; he/she uses has got. A negative uses have not or has not.','I/you/we/they ใช้ have got ส่วน he/she ใช้ has got ปฏิเสธด้วย have not หรือ has not'],
 'there-is':['Use There is for one item and There are for more than one.','สิ่งเดียวใช้ There is หลายสิ่งใช้ There are'],
 prepositions:['Use the position described: in, on, under, next to, behind or in front of.','in = ข้างใน, on = บน, under = ใต้, next to = ข้าง, behind = หลัง, in front of = หน้า'],
 'by-on':['Travel by bus/train/car, but on foot.','เดินทางโดยพาหนะใช้ by ส่วนเดินเท้าใช้ on foot'],
 phonics:['Match the letter group to the word and its sound.','ดูตัวอักษรและเสียงในคำ เช่น ck ใน duck, sh ใน brush, ch ใน chair และ th ใน three'],
 shapes:['Use the stated outline and number of sides or corners.','พิจารณารูปแบนและจำนวนด้านหรือมุม วงกลมไม่ใช่ทรงกลม'],
};
export const englishExams=finalTestLevels.map((level,index)=>({
  id:level.id,subject:'English',chapter:`Unit ${index+1}`,title:level.themeLabel,contentVersion:EXAM_VERSION,
  source:{kind:'existing-practice',file:'finalTestExercises.js'},
  exercises:level.exercises.map(original=>{
    const q=original.pairs?{...original,pairs:original.pairs.map(p=>({...p,right:{...p.right,label:matchingEnglish[p.right.label]||p.right.label,value:matchingEnglish[p.right.label]||p.right.value}}))}:original;
    const key=q.skillId.split(':')[1],rule=rules[key];
    const expected=answerText(q,correctAnswer(q));
    return {...q,contentVersion:EXAM_VERSION,subject:'English',explanation:{
      en: `${rule?.[0]||'Use the information in the question.'} Answer: ${expected}.${q.passage?` Evidence: ${q.passage}`:''}`,
      th:`${rule?.[1]||q.prompt.th} คำตอบ: ${expected}${q.passageTh?` จากเรื่อง: ${q.passageTh}`:''}`,
    }};
  }),
}));
export const topicExams=examTopics.map(topic=>({
  ...topic,
  exercises:(topic.subject==='Math'?mathItems(topic):knowledgeItems(topic)).map((item,i)=>{
    if(new Set(item.options).size!==4 || !item.options.includes(item.answer)) throw new Error(`Invalid options ${topic.id} #${i+1}`);
    const id=`${topic.id}-q${String(i+1).padStart(2,'0')}`;
    const distractors=item.options.filter(v=>v!==item.answer);
    const values=[...distractors]; values.splice(i%4,0,item.answer);
    let choices=values.map((value,k)=>({id:`${id}-choice-${k+1}`,label:value,value}));
    let format='applied',prompt=item.prompt,correctChoiceId=choices[i%4].id;
    const shapes=['circle','triangle','square','non-square rectangle'];
    const shapeAssets=['shape-circle','shape-triangle','shape-square','shape-rectangle'];
    if(topic.bank==='geometric'&&i<4) {
      format='picture-choice';
      prompt=`Which picture shows ${shapes[i]==='non-square rectangle'?'a rectangle that is not a square':'a '+shapes[i]}?`;
      choices=shapes.map((label,k)=>({id:`${id}-choice-${k+1}`,label,value:label,photoAssetId:shapeAssets[k]}));
      correctChoiceId=choices[i].id;
    }
    if(topic.bank==='plant-parts'&&i<5) {
      const parts=['root','stem','leaf','flower','fruit'];
      const selected=[parts[i],...parts.filter(p=>p!==parts[i]).slice(0,3)];
      const target=selected.shift();selected.splice(i%4,0,target);
      format='picture-choice';prompt=`Which photo shows the ${parts[i]}?`;
      choices=selected.map((label,k)=>({id:`${id}-choice-${k+1}`,label,value:label,photoAssetId:plantPhotoId(label)}));
      correctChoiceId=choices[i%4].id;
    }
    return {id,type:'final-test',format,answerKind:'choice',subject:topic.subject,topicId:topic.id,
      skillId:topic.id,objective:topic.objective,source:topic.source,contentVersion:EXAM_VERSION,
      difficulty:i<20?'foundation':i<34?'understanding':'application',
      prompt:{en:prompt,th:''},choices,correctChoiceId,explanation:item.explanation,conceptId:item.conceptId};
  }),
}));
// Standalone assessment catalogue: excluded from adaptive mission/reward generation.
// Legacy four English levels remain available to Today Mission and old progress.
export const finalExamCatalog=[...englishExams,...topicExams];

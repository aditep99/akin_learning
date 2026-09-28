const numberWords = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
const ordinals = ['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth'];
const dots = n => n ? '● '.repeat(n).trim() : '(empty group)';
export function mathItems(topic) {
  return Array.from({length:40},(_,i)=>{
    const j=i%10, band=Math.floor(i/10), n=topic.min+j, kind=topic.bank;
    let prompt, answer, options, explanation;
    const ask=(p,a,opts,e)=>{prompt=p;answer=String(a);options=opts?.map(String);explanation=e;};
    if(kind==='number') {
      const value=topic.min===0&&j===9&&band===1?10:topic.min+j;
      if(band===0) ask(`Which number means ${numberWords[value]}?`,value);
      if(band===1) ask(`Which word names ${value}?`,numberWords[value],[0,1,2,3].map(k=>numberWords[topic.min+(value-topic.min+k)%(topic.max-topic.min+1)]));
      if(band===2) ask(`Count the counters: ${dots(value)}`,value);
      if(band===3) ask(`A card says "${numberWords[value]}". Which tray has that many counters?`,dots(value),[0,1,2,3].map(k=>dots(topic.min+(j+k)%(topic.max-topic.min+1))));
      explanation=`${value} is written ${numberWords[value]}; count each counter once.`;
    } else if(kind==='ordinal') {
      const v=j+1;
      if(band===0) ask(`A runner finishes in place ${v}. Which word names the place?`,ordinals[j],[ordinals[j],ordinals[(j+1)%10],ordinals[(j+3)%10],ordinals[(j+5)%10]]);
      if(band===1) ask(`How many runners are before the ${ordinals[j]} runner?`,j);
      if(band===2) ask(`Read from left: ${Array.from({length:10},(_,k)=>String.fromCharCode(65+k)).join(' ')}. Which letter is ${ordinals[j]}?`,String.fromCharCode(65+j),[0,1,3,5].map(k=>String.fromCharCode(65+(j+k)%10)));
      if(band===3) ask(`There are ${j} children ahead of you in a line. What is your place?`,ordinals[j],[ordinals[j],ordinals[(j+2)%10],ordinals[(j+4)%10],ordinals[(j+6)%10]]);
      explanation=`The ${ordinals[j]} position is place ${v}; ${j} positions come before it.`;
    } else if(kind==='place') {
      const value=11+j, tens=Math.floor(value/10), ones=value%10;
      if(band===0) ask(`What is the value of the tens digit in ${value}?`,tens*10);
      if(band===1) ask(`How many ones are left after making groups of ten from ${value}?`,ones);
      if(band===2) ask(`Which shows ${value} correctly?`,`${tens} tens and ${ones} ones`,[`${tens} tens and ${ones} ones`,`${tens} tens and ${ones+1} ones`,`${tens+1} tens and ${ones} ones`,`${tens} tens and ${ones+2} ones`]);
      if(band===3) ask(`A shop packs pencils in bundles of ten. There are ${tens} bundles and ${ones} loose pencils. How many pencils?`,value);
      explanation=`${value} = ${tens*10} + ${ones}: ${tens} tens and ${ones} ones.`;
    } else if(kind==='compare') {
      const a=topic.min+(j===9&&topic.min===11?0:j),b=j===9&&topic.min===11?20:a+1;
      if(band===0) ask(`Which is greater: ${a} or ${b}?`,b,[a,b,'They are equal','Cannot tell']);
      if(band===1) ask(`Which is smaller: ${b} or ${a}?`,a,[b,a,'They are equal','Cannot tell']);
      if(band===2) ask(`Choose the sign: ${a} ___ ${b}.`,'<',['<','>','=','+']);
      if(band===3) ask(`Tray A has ${a} beads. Tray B has ${b} beads. Which statement is true?`,'B has more than A',['B has more than A','A has more than B','Both have the same number','B has fewer than A']);
      explanation=`${b} is greater than ${a}; ${a} < ${b}.`;
    } else if(kind==='count') {
      const a=topic.min+(j===9&&topic.min===11?0:j);
      if(j===9&&topic.min===11){
        if(band===0)ask('Count forward: 18, 19, ___.',20);
        if(band===1)ask('Count backward: 13, 12, ___.',11);
        if(band===2)ask('A path goes 20, 19, 18. Which way does it count?','backward by one',['backward by one','forward by one','forward by two','stays the same']);
        if(band===3)ask('You stand on 18. Move two steps toward 20. Where do you land?',20);
      } else {
      if(band===0) ask(`Count forward by one: ${a}, ___.`,a+1);
      if(band===1) ask(`Count backward by one: ${a+1}, ___.`,a);
      if(band===2) ask(`A number path goes ${a} then ${a+1}. Which way does it count?`,'forward by one',['forward by one','backward by one','forward by two','stays the same']);
      if(band===3) ask(`You stand on ${a+1} on a number path. Move one step toward zero. Where do you land?`,a);
      }
      explanation=j===9&&topic.min===11?'Forward: 18, 19, 20. Backward: 13, 12, 11. Counting backward decreases the number.':`Counting forward adds one; counting backward takes away one. ${a+1} − 1 = ${a}.`;
    } else if(kind==='order') {
      const a=topic.min+Math.min(j,topic.max-topic.min-2),b=a+1,c=a+2;
      const sequences=[[a,b,c],[c,b,a],[b,a,c],[a,c,b]].map(v=>v.join(', '));
      if(band===0) ask(`Put ${c}, ${a}, ${b} in order from smallest to greatest.`,sequences[0],sequences);
      if(band===1) ask(`Put ${a}, ${c}, ${b} in order from greatest to smallest.`,sequences[1],sequences);
      if(band===2) ask(`Which number belongs between ${a} and ${c}?`,b);
      if(band===3) ask(`Shelf labels increase from ${a} to ${c}. Which label goes in the middle?`,b);
      // Ten distinct triples, including a gap of two in the last triple.
      if(j===9 || (j===8&&topic.min===11)) {
        const lo=topic.min,hi=topic.max,mid=lo+(j===8?3:2);
        const seqs=[[lo,mid,hi],[hi,mid,lo],[mid,lo,hi],[lo,hi,mid]].map(v=>v.join(', '));
        if(band<2) ask(`Order ${hi}, ${lo}, ${mid} from ${band===0?'smallest to greatest':'greatest to smallest'}.`,seqs[band],seqs);
        else ask(band===2?`Which of ${hi}, ${lo}, ${mid} is neither smallest nor greatest?`:`Cards ${hi}, ${lo}, ${mid} are sorted from smallest to greatest. Which card is second?`,mid);
      }
      explanation='Compare the numbers, then place them in the direction asked. The middle value is neither the smallest nor the greatest.';
    } else {
      const zero=kind.includes('zero'), sub=kind.includes('subtract') || (kind==='mixed-story' && i%2===1);
      const limit=topic.max;
      const a=zero?j:(kind==='three'?1+j%7:limit===9?j:j+5);
      const b=zero?0:(sub?j%(a+1):Math.min(1+(band+j)%4,limit-a));
      const c=kind==='three'?1+(band%3):0;
      const result=sub?a-b:a+b+c;
      const expr=kind==='three'?`${a} + ${b} + ${c}`:`${a} ${sub?'−':'+'} ${b}`;
      if(band===0) ask(`Work out ${expr}.`,result);
      if(band===1) ask(kind==='three'?`${a} + ___ + ${c} = ${result}.`:`${a} ${sub?'−':'+'} ___ = ${result}.`,b);
      if(band===2) ask(`Which number sentence has the same result as ${expr}?`,`${result} + 0`,[`${result} + 0`,`${result+1} + 0`,`${result+2} + 0`,`${result+3} + 0`]);
      if(band===3) ask(kind==='three'?`Three boxes hold ${a}, ${b} and ${c} blocks. How many blocks altogether?`:`There are ${a} blocks. ${sub?`${b} are taken away`:`${b} more are added`}. How many blocks are there now?`,result);
      if(kind.includes('story') && band<3) {
        const contexts=['birds on a fence','pencils in a pot','shells in a bucket'];
        ask(`There are ${a} ${contexts[band]}. ${sub?`${b} are removed`:`${b} more are added`}. ${band===1?'Which calculation finds the new total?':'How many are there now?'}`,band===1?expr:result,band===1?[expr,`${a} ${sub?'+':'−'} ${b+1}`,`${a+1} + ${b+1}`,`${a+2} + ${b+2}`]:undefined);
      }
      if(kind==='ways-add' && band===0) ask(`Start at ${a}. Count on ${b} steps. Where do you stop?`,result);
      if(kind==='ways-subtract' && band===0) ask(`Start at ${a}. Count back ${b} steps. Where do you stop?`,result);
      explanation=`${expr} = ${result}. ${sub?'Subtract the number removed.':'Add the groups together.'}${zero?' Zero changes nothing.':''}`;
    }
    if(!options) {
      const v=Number(answer); options=[v,...Array.from({length:topic.max+1},(_,k)=>(v+k+1)%(topic.max+1)).filter(x=>x!==v).slice(0,3)].map(String);
    }
    return {prompt,answer,options,explanation:{en:explanation,th:`${explanation}\nวิธีคิด: ${['number','ordinal','place','compare','count','order'].includes(kind)?'ดูจำนวน ตำแหน่ง และทิศทางตามที่โจทย์กำหนด แล้วเปรียบเทียบตัวเลือก':kind.includes('subtract')?'ลบจำนวนที่นำออกจากจำนวนเริ่มต้น':kind==='mixed-story'?'อ่านว่าเพิ่มหรือนำออก แล้วบวกหรือลบตามสถานการณ์':'รวมจำนวนแต่ละกลุ่ม โดยการบวกศูนย์ทำให้จำนวนเท่าเดิม'}`}};
  });
}

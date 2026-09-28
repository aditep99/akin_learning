import {useEffect, useRef, useState} from 'react';
import {ActionButton} from '../components/ActionButton';
import {ScreenShell} from '../components/ScreenShell';
import {ConfirmDialog} from '../components/ConfirmDialog';
import {MonsterCharacter} from '../components/MonsterCharacter';
import {monsterBuddyRoster} from '../data/characterRoster';
import {ChoiceOption, PhotoVisual} from './FinalTestGameplayScreen';
import {useNarration} from '../hooks/useNarration';
import {finalExamCatalog} from '../data/finalTest/finalExamCatalog';
import {EXAM_STORAGE_KEY, readExamStore, newExamSession, submitExam, examAnswerStatus,
  answerText, correctAnswer, choosePracticeQuestions, missedQuestions, isExamAnswerCorrect} from '../data/finalTest/examSession';
import './finalExam.css';

const instructions = {
  matching: 'Read the letter key. Choose one letter beside each word. You can change your answer.',
  'fill-blank': 'Type the missing word. You can clear it and try again.',
  'sentence-order': 'Tap words to build a sentence. Tap a chosen word to remove it.',
  'picture-choice': 'Look at all the pictures. Choose one picture.',
  reading: 'Read the short passage. Choose one answer to the question.',
  applied: 'Read the question. Choose one answer.',
};
const letter = index => String.fromCharCode(65 + index);
const timeLabel = ms => Math.floor(ms/60000)+':'+String(Math.floor(ms/1000)%60).padStart(2,'0');
const text = item => item?.label || item?.word || item?.value || '';

export function ExamAnswerBoard({q, answer, onChange, disabled=false}) {
  if(q.choices) return <div className={q.format==='picture-choice'?'final-test-photo-grid':'final-test-text-choice-grid'}>
    {q.choices.map((choice,index)=><ChoiceOption key={choice.id} choice={{...choice,translation:undefined}} index={index}
      selected={answer===choice.id} disabled={disabled} revealLabels={q.format!=='picture-choice'} onSelect={()=>onChange(choice.id)}/>)}
  </div>;
  if(q.format==='fill-blank') return <label className="exam-input-label">Type the missing word
    <input className="final-test-text-input" value={typeof answer==='string'?answer:''}
      onChange={e=>onChange(e.target.value)} autoComplete="off" spellCheck={false} disabled={disabled}/>
  </label>;
  if(q.format==='matching') {
    const rights=q.matchOptions || [...q.pairs.map(p=>p.right)].sort((a,b)=>a.label.localeCompare(b.label));
    return <div className="exam-matching-board">
      <ul className="exam-letter-key" aria-label="Letter key">{rights.map((right,index)=>
        <li key={right.id}><strong>{letter(index)}</strong><span>{text(right)}</span></li>)}</ul>
      <div className="exam-matches">{q.pairs.map(pair=><fieldset key={pair.left.id} disabled={disabled}>
        <legend>{text(pair.left)}</legend><div className="exam-letter-buttons">{rights.map((right,index)=>
          <ActionButton key={right.id} disabled={disabled} color="blue" ariaPressed={answer?.[pair.left.id]===right.id}
            ariaLabel={text(pair.left)+': '+letter(index)+', '+text(right)}
            onClick={()=>onChange({...answer,[pair.left.id]:right.id})}>
            {letter(index)}{answer?.[pair.left.id]===right.id?' •':''}
          </ActionButton>)}</div>
      </fieldset>)}</div>
    </div>;
  }
  if(q.format==='sentence-order') {
    const selected=Array.isArray(answer)?answer:[];
    const tokens=[...q.tokens].sort((a,b)=>a.value.localeCompare(b.value)||a.id.localeCompare(b.id));
    return <div><p>{instructions['sentence-order']}</p><div className="exam-tokens" aria-label="Your sentence">
      {!selected.length?<span>Tap words below</span>:selected.map(id=><ActionButton key={id} disabled={disabled} color="blue"
        onClick={()=>onChange(selected.filter(v=>v!==id))}>{q.tokens.find(t=>t.id===id)?.value}</ActionButton>)}
    </div><div className="exam-tokens" aria-label="Word bank">{tokens.filter(t=>!selected.includes(t.id)).map(t=>
      <ActionButton key={t.id} disabled={disabled} onClick={()=>onChange([...selected,t.id])}>{t.value}</ActionButton>)}</div></div>;
  }
  return <p role="alert">This question format cannot be opened.</p>;
}

function exampleQuestion(format) {
  if(format==='matching') return {id:'example',format,prompt:{en:'Match the number words.'},pairs:[
    {left:{id:'one',label:'one'},right:{id:'1',label:'1'}},
    {left:{id:'two',label:'two'},right:{id:'2',label:'2'}},
    {left:{id:'three',label:'three'},right:{id:'3',label:'3'}},
  ],matchOptions:[{id:'2',label:'2'},{id:'3',label:'3'},{id:'1',label:'1'}]};
  if(format==='fill-blank') return {id:'example',format,prompt:{en:'Type the word red: ___.'}};
  if(format==='sentence-order') return {id:'example',format,prompt:{en:'Make: I can play.'},
    tokens:['I','can','play','.'].map((value,index)=>({id:String(index),value}))};
  return {id:'example',format:'applied',prompt:{en:'Choose the number two.'},choices:[{id:'1',label:'1'},{id:'2',label:'2'},{id:'3',label:'3'}]};
}
function Tutorial({format,onDone,onExit,tr}) {
  const [answer,setAnswer]=useState();
  const example=exampleQuestion(format);
  return <section className="exam-tutorial"><p className="eyebrow">{tr('Practice example · no score','ตัวอย่างวิธีเล่น · ไม่คิดคะแนน')}</p>
    <h2>{instructions[format]}</h2><p>{example.prompt.en}</p><ExamAnswerBoard q={example} answer={answer} onChange={setAnswer}/>
    <p>{tr('Try the controls, then start your question.','ลองใช้ปุ่ม แล้วเริ่มทำข้อสอบของคุณ')}</p>
    <div className="exam-actions"><ActionButton color="blue" onClick={onExit}>{tr('Back to topics','กลับไปหัวข้อ')}</ActionButton>
    <ActionButton onClick={onDone}>{tr('Ready — start','พร้อมแล้ว เริ่มได้')}</ActionButton></div>
  </section>;
}

export function FinalExamScreen({onBack,locale='en',avatarId}) {
  const tr=(en,th)=>locale==='th'?th:en;
  const [initial]=useState(()=>{
    try{return {store:readExamStore(localStorage),error:false};}
    catch{return {store:{sessions:{},history:[],practiceCounts:{},tutorialFormats:[],settings:{sound:true}},error:true};}
  });
  const [store,setStore]=useState(initial.store);
  const [subject,setSubject]=useState(''),[chapter,setChapter]=useState(''),[activeKey,setActiveKey]=useState('');
  const [dialog,setDialog]=useState(''),[saveError,setSaveError]=useState(false),[conflict,setConflict]=useState(false);
  const [showAll,setShowAll]=useState(false),[feedback,setFeedback]=useState(null),[showExplanation,setShowExplanation]=useState(false);
  const storeRef=useRef(store),heading=useRef(null),running=useRef(false),expectedRaw=useRef(undefined);
  const active=store.sessions[activeKey],question=active?.questions[active.index];
  const isPractice=active?.mode==='practice';
  const tutorial=active?.status==='active'&&!store.tutorialFormats.includes(question?.format);
  const blocked=initial.error||conflict;
  const instructionAudio=useNarration(store.settings.sound&&active?.status==='active'?instructions[question?.format]:'',{autoPlay:false});
  const questionAudio=useNarration(store.settings.sound&&isPractice&&active?.status==='active'?(question?.passage||'')+' '+(question?.prompt.en||''):'',{autoPlay:false});
  const buddyId=store.settings.buddyId||avatarId;

  const update=transform=>{
    const next=transform(storeRef.current);
    storeRef.current=next;
    setStore(next);
  };
  const persist=()=>{
    if(initial.error||conflict)return false;
    try {
      const current=localStorage.getItem(EXAM_STORAGE_KEY);
      if(expectedRaw.current!==undefined&&current!==expectedRaw.current){setConflict(true);return false;}
      const raw=JSON.stringify(storeRef.current);
      localStorage.setItem(EXAM_STORAGE_KEY,raw);
      expectedRaw.current=raw;setSaveError(false);return true;
    } catch {setSaveError(true);return false;}
  };
  useEffect(()=>{
    try{expectedRaw.current=localStorage.getItem(EXAM_STORAGE_KEY);}catch{setSaveError(true);}
    const changed=e=>{if(e.key===EXAM_STORAGE_KEY)setConflict(true);};
    window.addEventListener('storage',changed);
    return()=>window.removeEventListener('storage',changed);
  },[]);
  useEffect(()=>{if(store!==initial.store)persist();},[store]);
  running.current=Boolean(active?.status==='active'&&!tutorial&&!active.pendingBreak&&!dialog&&!blocked);
  useEffect(()=>{
    let last=performance.now();
    const timer=setInterval(()=>{
      const now=performance.now(),elapsed=Math.min(1500,Math.max(0,now-last));last=now;
      if(!running.current||document.hidden||!document.hasFocus())return;
      update(s=>{
        const session=s.sessions[activeKey];
        return session?.status==='active'?{...s,sessions:{...s.sessions,[activeKey]:{...session,elapsedMs:session.elapsedMs+elapsed}}}:s;
      });
    },1000);
    const reset=()=>{last=performance.now();};
    document.addEventListener('visibilitychange',reset);window.addEventListener('focus',reset);
    return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',reset);window.removeEventListener('focus',reset);};
  },[activeKey]);
  useEffect(()=>{heading.current?.focus();setFeedback(null);setShowExplanation(false);},
    [subject,chapter,activeKey,active?.index,active?.status,tutorial,active?.pendingBreak]);

  const edit=changes=>update(s=>({...s,sessions:{...s.sessions,[activeKey]:{...s.sessions[activeKey],...changes}}}));
  const begin=(exam,mode='exam',questions,practiceQueue=[],sourceAttemptId=null)=>{
    const key=mode==='practice'?exam.id+':practice':exam.id;
    const chosen=questions||(mode==='practice'?choosePracticeQuestions(exam,store.practiceCounts[exam.id]):exam.exercises);
    const session=newExamSession(exam,Date.now(),{mode,questions:chosen,practiceQueue,sourceAttemptId});
    update(s=>{
      const old=s.sessions[key],counts={...s.practiceCounts[exam.id]};
      if(mode==='practice'&&!sourceAttemptId)chosen.forEach(q=>{counts[q.id]=(counts[q.id]||0)+1;});
      return {...s,history:old?.status==='submitted'?[...s.history,old]:s.history,
        practiceCounts:{...s.practiceCounts,[exam.id]:counts},sessions:{...s.sessions,[key]:session}};
    });
    setActiveKey(key);setDialog('');setShowAll(false);
  };
  const exit=()=>{if(persist()){setActiveKey('');setShowAll(false);}};
  const answerChanged=answer=>{edit({answers:{...active.answers,[question.id]:answer}});setFeedback(null);setShowExplanation(false);};
  const navigate=index=>{edit({index});setFeedback(null);setShowExplanation(false);};
  const next=()=>{
    const index=active.index+1;
    if(!isPractice&&index%10===0&&index<active.questions.length&&!active.breaksSeen.includes(index))edit({pendingBreak:index});
    else navigate(index);
  };
  const statusLabel=q=>{
    const status=examAnswerStatus(q,active.answers[q.id]);
    return status==='complete'?tr('Answered','ตอบครบ'):status==='partial'?tr('Partly answered','ตอบบางส่วน'):tr('Unanswered','ยังไม่ตอบ');
  };
  const storageStatus=initial.error?<div role="alert"><p>{tr('Saved exam data could not be read. It has been kept unchanged.','อ่านข้อมูลเดิมไม่ได้ ระบบเก็บไว้โดยไม่แก้ไข')}</p>
    <ActionButton onClick={()=>window.location.reload()}>{tr('Reload and retry','รีโหลดแล้วลองใหม่')}</ActionButton></div>
    :conflict?<div role="alert"><p>{tr('Another tab changed the saved copy. Reload to continue with that copy.','อีกแท็บเปลี่ยนข้อมูลที่บันทึกไว้ กรุณารีโหลดเพื่อใช้ข้อมูลล่าสุด')}</p>
    <ActionButton onClick={()=>window.location.reload()}>{tr('Reload saved copy','โหลดข้อมูลที่บันทึก')}</ActionButton></div>
    :saveError?<div role="alert"><p>{tr('Saving failed. Keep this page open. Your current answers are still here.','บันทึกไม่สำเร็จ กรุณาเปิดหน้านี้ไว้ คำตอบปัจจุบันยังอยู่ในหน้านี้')}</p>
    <ActionButton onClick={persist}>{tr('Retry saving','ลองบันทึกใหม่')}</ActionButton></div>
    :<p className="exam-save-status">{tr('Progress is saved on this device','บันทึกความคืบหน้าในอุปกรณ์นี้')}</p>;
  const settings=<details className="exam-settings"><summary>{tr('Sound and study buddy','เสียงและเพื่อนร่วมเรียน')}</summary>
    <ActionButton color="blue" ariaPressed={store.settings.sound} disabled={blocked}
      onClick={()=>update(s=>({...s,settings:{...s.settings,sound:!s.settings.sound}}))}>
      {store.settings.sound?tr('Sound on','เปิดเสียงอยู่'):tr('Sound off','ปิดเสียงอยู่')}</ActionButton>
    <div className="exam-buddy-options">{monsterBuddyRoster.map(buddy=><ActionButton key={buddy.id} disabled={blocked} color="blue"
      ariaPressed={buddyId===buddy.id} onClick={()=>update(s=>({...s,settings:{...s.settings,buddyId:buddy.id}}))}>{buddy.name}</ActionButton>)}</div>
  </details>;

  if(!active){
    const subjects=[...new Set(finalExamCatalog.map(e=>e.subject))];
    const chapters=[...new Set(finalExamCatalog.filter(e=>e.subject===subject).map(e=>e.chapter))];
    const exams=finalExamCatalog.filter(e=>e.subject===subject&&e.chapter===chapter);
    return <ScreenShell className="exam-shell"><header><p className="eyebrow">Primary 1 EP · Practice assessment</p>
      <h1 ref={heading} tabIndex={-1}>Final Test</h1><p>{tr('Exam: 40 questions · Quick practice: 5 · No time limit','สอบ 40 ข้อ · ฝึกสั้น 5 ข้อ · ไม่จำกัดเวลา')}</p>
      <ActionButton color="blue" onClick={()=>chapter?setChapter(''):subject?setSubject(''):onBack()}>{tr('Back','กลับ')}</ActionButton></header>
      {storageStatus}{settings}<h2>{!subject?tr('Choose a subject','เลือกวิชา'):!chapter?subject:subject+' · '+chapter}</h2>
      <div className="exam-catalog">{!subject?subjects.map(s=><ActionButton key={s} onClick={()=>setSubject(s)}>{s}</ActionButton>)
      :!chapter?chapters.map(c=><ActionButton key={c} onClick={()=>setChapter(c)}>{c}</ActionButton>):exams.map(exam=>{
        const saved=store.sessions[exam.id],practice=store.sessions[exam.id+':practice'];
        return <article className="exam-topic" key={exam.id}><h3>{exam.title}</h3><p>40 questions{exam.pages?' · pp. '+exam.pages:''}</p>
          {saved?.result?<p>{tr('Latest exam','ผลสอบล่าสุด')}: {saved.result.correct}/{saved.result.total}</p>:null}
          <div className="exam-topic-actions"><ActionButton disabled={blocked} onClick={()=>saved?setActiveKey(exam.id):begin(exam)}>
            {saved?saved.status==='submitted'?tr('Review exam','ดูผลสอบ'):tr('Resume exam','ทำข้อสอบต่อ'):tr('Start exam','เริ่มสอบ')}</ActionButton>
          <ActionButton disabled={blocked} color="blue" onClick={()=>practice?.status==='active'?setActiveKey(exam.id+':practice'):begin(exam,'practice')}>
            {practice?.status==='active'?tr('Resume practice','ฝึกต่อ'):tr('Practise 5 questions','ฝึกสั้น 5 ข้อ')}</ActionButton></div>
          {saved&&saved.contentVersion!==exam.contentVersion?<p>{tr('Saved attempt uses its original question version.','รอบเดิมใช้ข้อสอบรุ่นที่เริ่มไว้')}</p>:null}
        </article>;
      })}</div>
    </ScreenShell>;
  }

  if(active.status==='submitted'){
    const missed=missedQuestions(active),exam=finalExamCatalog.find(e=>e.id===active.examId);
    const groups=Object.values(active.questions.reduce((all,q)=>{
      const key=q.skillId||q.topicId||active.title;
      const group=all[key]||(all[key]={label:finalExamCatalog.find(e=>e.id===q.topicId)?.title||key.split(':').pop().replace(/-/g,' '),total:0,correct:0});
      group.total++;if(isExamAnswerCorrect(q,active.answers[q.id]))group.correct++;return all;
    },{}));
    const startReview=()=>begin({...exam,contentVersion:active.contentVersion},'practice',missed.slice(0,5),missed.slice(5),active.id);
    return <ScreenShell className="exam-shell"><h1 ref={heading} tabIndex={-1}>{isPractice?tr('Practice complete','ฝึกจบแล้ว'):tr('Exam results','ผลสอบ')} · {active.title}</h1>
      <p className="exam-score">{active.result.correct}/{active.result.total} ({active.result.percent}%)</p>
      <p>{tr('Correct','ถูก')}: {active.result.correct} · {tr('Wrong','ผิด')}: {active.result.wrong} · {tr('Unanswered','เว้น')}: {active.result.blank}</p>
      <p>{tr('Time used','เวลาที่ใช้')}: {timeLabel(active.elapsedMs)}</p>{storageStatus}
      <p>{tr('This result describes this attempt. Every practice is a chance to learn.','ผลนี้บอกสิ่งที่ทำได้ในรอบนี้ ทุกครั้งที่ฝึกคือโอกาสเรียนรู้')}</p>
      <ul>{groups.map(g=><li key={g.label}>{g.label}: {g.correct}/{g.total} — {g.correct===g.total?tr('Well done this round','รอบนี้ทำได้ครบ'):tr('A useful next practice topic','หัวข้อที่น่าลองฝึกต่อ')}</li>)}</ul>
      <div className="exam-actions"><ActionButton color="blue" onClick={exit}>{tr('Back to topics','กลับไปหัวข้อ')}</ActionButton>
        <ActionButton disabled={blocked} onClick={()=>setDialog('restart')}>{isPractice?tr('Another 5 questions','ฝึกอีก 5 ข้อ'):tr('Start exam again','สอบใหม่')}</ActionButton>
        {missed.length>0&&!isPractice?<ActionButton disabled={blocked} color="green" onClick={()=>store.sessions[exam.id+':practice']?.status==='active'?setDialog('replace-practice'):startReview()}>
          {tr('Practise missed questions (up to 5)','ฝึกข้อที่พลาด ครั้งละไม่เกิน 5 ข้อ')}</ActionButton>:null}
        {isPractice&&active.practiceQueue.length>0?<ActionButton disabled={blocked} color="green" onClick={()=>begin({...exam,contentVersion:active.contentVersion},'practice',active.practiceQueue.slice(0,5),active.practiceQueue.slice(5),active.sourceAttemptId)}>
          {tr('Next review questions','ทบทวนข้อถัดไป')}</ActionButton>:null}
      </div>
      {store.history.some(s=>s.examId===active.examId&&s.mode===active.mode)?<details><summary>{tr('Previous attempts','ประวัติรอบก่อน')}</summary>
        {store.history.filter(s=>s.examId===active.examId&&s.mode===active.mode).map(s=><p key={s.id}>{s.completedAt}: {s.result.correct}/{s.result.total}</p>)}</details>:null}
      <div className="exam-review">{active.questions.map((q,i)=><details key={q.id}><summary>{i+1}. {q.prompt.en}</summary>
        {q.passage?<p>{q.passage}</p>:null}<p>{tr('Your answer','คำตอบของคุณ')}: {answerText(q,active.answers[q.id])}</p>
        <p>{tr('Correct answer','เฉลย')}: {answerText(q,correctAnswer(q))}</p><p>{q.explanation?.en}</p><p lang="th">{q.explanation?.th}</p>
      </details>)}</div>
      {dialog==='restart'?<ConfirmDialog title={tr('Start a new attempt?','เริ่มรอบใหม่หรือไม่')} description={tr('This completed result stays in your history.','ผลรอบนี้ยังอยู่ในประวัติ')}
        cancelLabel={tr('Keep result','อยู่หน้าผลสอบ')} confirmLabel={tr('Start','เริ่ม')} onCancel={()=>setDialog('')} onConfirm={()=>begin(exam,isPractice?'practice':'exam')}/>:null}
      {dialog==='replace-practice'?<ConfirmDialog title={tr('Replace unfinished practice?','เปลี่ยนรอบฝึกที่ยังไม่จบหรือไม่')}
        description={tr('The unfinished practice will be replaced. Your exam result stays saved.','รอบฝึกที่ยังไม่จบจะถูกแทนที่ ผลสอบยังคงอยู่')} onCancel={()=>setDialog('')} onConfirm={startReview}/>:null}
    </ScreenShell>;
  }
  if(tutorial)return <ScreenShell className="exam-shell"><h1 ref={heading} tabIndex={-1}>{tr('How to play','วิธีเล่น')}</h1>{storageStatus}
    <Tutorial key={question.format} format={question.format} tr={tr} onExit={exit}
      onDone={()=>update(s=>({...s,tutorialFormats:[...new Set([...s.tutorialFormats,question.format])]}))}/></ScreenShell>;
  if(active.pendingBreak)return <ScreenShell className="exam-shell exam-break"><h1 ref={heading} tabIndex={-1}>
    {tr('You reached question ','มาถึงข้อ ')}{active.pendingBreak}!</h1><MonsterCharacter buddyId={buddyId}/>
    <p>{tr('Stretch, rest your eyes, or continue when ready. The timer is paused.','ยืดตัว พักสายตา หรือทำต่อเมื่อพร้อม ตอนนี้หยุดนับเวลาอยู่')}</p>{storageStatus}
    <div className="exam-actions"><ActionButton color="blue" onClick={exit}>{tr('Save and return','บันทึกและกลับ')}</ActionButton>
    <ActionButton disabled={blocked} onClick={()=>edit({index:active.pendingBreak,breaksSeen:[...active.breaksSeen,active.pendingBreak],pendingBreak:null})}>{tr('Continue','ทำต่อ')}</ActionButton></div>
  </ScreenShell>;

  const completed=active.questions.filter(q=>examAnswerStatus(q,active.answers[q.id])==='complete').length;
  const partial=active.questions.filter(q=>examAnswerStatus(q,active.answers[q.id])==='partial').length;
  const unanswered=active.questions.length-completed-partial,flags=Object.values(active.flagged).filter(Boolean).length;
  return <ScreenShell variant="FocusSessionShell" className="exam-shell"><header>
    <p className="eyebrow">{isPractice?'Practice':'Final Test'} · {active.subject} · {active.title}</p>
    <p>{tr('Question','ข้อ')} {active.index+1}/{active.questions.length} · {tr('Time','เวลา')} {timeLabel(active.elapsedMs)}</p>
    <progress value={completed} max={active.questions.length} aria-label={tr('Questions fully answered','จำนวนข้อที่ตอบครบ')}/>
    <p>{tr('Answered','ตอบครบ')} {completed}/{active.questions.length} · {statusLabel(question)}</p>
    <h1 ref={heading} tabIndex={-1}>{question.prompt.en}</h1>
  </header>{storageStatus}
    <div className="exam-audio-actions"><ActionButton color="blue" disabled={!store.settings.sound||!instructionAudio.isAvailable} onClick={instructionAudio.replay}>{tr('Hear instructions','ฟังวิธีตอบ')}</ActionButton>
      {isPractice?<ActionButton color="blue" disabled={!store.settings.sound||!questionAudio.isAvailable} onClick={questionAudio.replay}>{tr('Hear question','ฟังโจทย์')}</ActionButton>:null}</div>
    {!instructionAudio.isAvailable?<p>{tr('Audio is unavailable or off. Use the written instructions.','เสียงปิดหรือไม่พร้อม ใช้คำแนะนำบนหน้าจอได้')}</p>:null}
    {question.passage?<p className="exam-passage">{question.passage}</p>:null}
    {question.photoAssetId?<PhotoVisual assetId={question.photoAssetId} alt="Illustration accompanying the question"/>:null}
    <ExamAnswerBoard key={question.id} q={question} answer={active.answers[question.id]} disabled={blocked} onChange={answerChanged}/>
    {isPractice?<section className="exam-practice-feedback"><div className="exam-actions">
      <ActionButton disabled={blocked||examAnswerStatus(question,active.answers[question.id])!=='complete'} color="green"
        onClick={()=>setFeedback(isExamAnswerCorrect(question,active.answers[question.id]))}>{tr('Check answer','ตรวจคำตอบ')}</ActionButton>
      <ActionButton color="blue" onClick={()=>setShowExplanation(v=>!v)}>{tr('Show / hide explanation','เปิด / ปิดคำอธิบาย')}</ActionButton></div>
      {feedback!==null?<p role="status">{feedback?tr('That is correct.','คำตอบถูกต้อง'):tr('Try again, see the explanation, or continue.','ลองแก้ ดูคำอธิบาย หรือไปข้อต่อไปได้')}</p>:null}
      {showExplanation?<div><p>{answerText(question,correctAnswer(question))}</p><p>{question.explanation?.en}</p><p lang="th">{question.explanation?.th}</p></div>:null}
    </section>:null}
    <div className="exam-actions"><ActionButton disabled={blocked} color="blue" onClick={()=>{const answers={...active.answers};delete answers[question.id];edit({answers});setFeedback(null);setShowExplanation(false);}}>{tr('Clear answer','ล้างคำตอบ')}</ActionButton>
      <ActionButton disabled={blocked} color="blue" ariaPressed={Boolean(active.flagged[question.id])} onClick={()=>edit({flagged:{...active.flagged,[question.id]:!active.flagged[question.id]}})}>
        {active.flagged[question.id]?tr('Marked: not sure','ทำเครื่องหมาย: ยังไม่แน่ใจ'):tr('Not sure','ยังไม่แน่ใจ')}</ActionButton></div>
    <div className="exam-actions"><ActionButton disabled={active.index===0||blocked} onClick={()=>navigate(active.index-1)}>{tr('Previous','ก่อนหน้า')}</ActionButton>
      <ActionButton disabled={active.index===active.questions.length-1||blocked} onClick={next}>{tr('Next / skip','ถัดไป / ข้าม')}</ActionButton>
      <ActionButton color="blue" ariaPressed={showAll} onClick={()=>setShowAll(v=>!v)}>{showAll?tr('Hide all questions','ซ่อนรายการข้อ'):tr('View all questions','ดูทุกข้อ')}</ActionButton></div>
    {showAll?<nav className="exam-question-nav" aria-label={tr('Question navigation','เลือกข้อ')}>{active.questions.map((q,i)=>
      <ActionButton key={q.id} disabled={blocked} color="blue" ariaPressed={i===active.index}
        ariaLabel={tr('Question ','ข้อ ')+(i+1)+', '+statusLabel(q)+(active.flagged[q.id]?', not sure':'')} onClick={()=>navigate(i)}>
        {i+1} · {statusLabel(q)}{active.flagged[q.id]?' ?':''}
      </ActionButton>)}</nav>:null}
    <div className="exam-actions"><ActionButton color="blue" onClick={exit}>{tr('Save and return','บันทึกและกลับ')}</ActionButton>
      <ActionButton disabled={blocked} onClick={()=>setDialog('submit')}>{isPractice?tr('Finish practice','จบรอบฝึก'):tr('Submit exam','ส่งข้อสอบ')}</ActionButton></div>{settings}
    {dialog==='submit'?<ConfirmDialog title={isPractice?tr('Finish this practice?','จบรอบฝึกหรือไม่'):tr('Submit this exam?','ส่งข้อสอบหรือไม่')}
      description={tr('Unanswered: ','เว้น: ')+unanswered+tr(' · Partly answered: ',' · ตอบบางส่วน: ')+partial+tr(' · Not sure: ',' · ยังไม่แน่ใจ: ')+flags+tr('. One point per fully correct question.',' ได้ข้อละหนึ่งคะแนนเมื่อตอบครบถูกต้อง')}
      cancelLabel={tr('Keep working','กลับไปทำต่อ')} confirmLabel={tr('Submit','ส่ง')} onCancel={()=>setDialog('')}
      onConfirm={()=>{update(s=>({...s,sessions:{...s.sessions,[activeKey]:submitExam(s.sessions[activeKey])}}));setDialog('');}}/>:null}
  </ScreenShell>;
}

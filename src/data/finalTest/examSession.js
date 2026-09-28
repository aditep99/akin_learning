export const EXAM_STORAGE_KEY = 'akin-final-exam-v1';
export function isExamAnswerCorrect(q,answer) {
  if(q.correctChoiceId) return answer===q.correctChoiceId;
  if(q.format==='fill-blank') {
    const normalize=v=>String(v??'').trim().toLowerCase().replace(/[.!?,]/g,'').replace(/[’]/g,"'").replace(/\s+/g,' ');
    return q.acceptedAnswers.some(v=>normalize(v)===normalize(answer));
  }
  if(q.format==='matching') return Boolean(answer && !Array.isArray(answer)) && Object.keys(answer).length===q.pairs.length && q.pairs.every(p=>answer[p.left.id]===q.answerMap[p.left.id]);
  if(q.format==='sentence-order') {
    if(!Array.isArray(answer)||answer.length!==q.tokens.length||new Set(answer).size!==q.tokens.length) return false;
    // Identical token instances may exchange positions without changing the sentence.
    return answer.map(id=>q.tokens.find(t=>t.id===id)?.value).join(' ')===q.correctTokenIds.map(id=>q.tokens.find(t=>t.id===id)?.value).join(' ');
  }
  return false;
}
export function hasExamAnswer(q,a) {
  if(q.format==='matching') return Boolean(a && Object.values(a).some(Boolean));
  return Array.isArray(a)?a.length>0:typeof a==='string'&&a.trim().length>0;
}
export function examAnswerStatus(q,a) {
  if(!hasExamAnswer(q,a)) return 'unanswered';
  if(q.format==='matching') return q.pairs.every(p=>q.pairs.some(r=>r.right.id===a?.[p.left.id]))?'complete':'partial';
  if(q.format==='sentence-order') return Array.isArray(a)&&a.length===q.tokens.length?'complete':'partial';
  return 'complete';
}
const hash=value=>[...value].reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))>>>0,17);
export function prepareExamQuestions(questions) {
  return structuredClone(questions).map(q=>q.format==='matching'?{...q,matchOptions:q.matchOptions||q.pairs.map(p=>p.right).sort((a,b)=>hash(`${q.id}:${a.id}`)-hash(`${q.id}:${b.id}`))}:q);
}
export function newExamSession(exam,now=Date.now(),options={}) {
  const mode=options.mode||'exam';
  return {id:`${exam.id}-${mode}-${now}`,examId:exam.id,contentVersion:exam.contentVersion,questions:prepareExamQuestions(options.questions||exam.exercises),title:exam.title,subject:exam.subject,mode,answers:{},flagged:{},breaksSeen:[],index:0,elapsedMs:0,status:'active',startedAt:new Date(now).toISOString(),practiceQueue:options.practiceQueue||[],sourceAttemptId:options.sourceAttemptId||null};
}
export function choosePracticeQuestions(exam,counts={}) {
  return [...exam.exercises].sort((a,b)=>(counts[a.id]||0)-(counts[b.id]||0)||exam.exercises.indexOf(a)-exam.exercises.indexOf(b)).slice(0,5);
}
export function missedQuestions(session) {
  return session.questions.filter(q=>!isExamAnswerCorrect(q,session.answers[q.id]));
}
export function submitExam(session,now=Date.now()) {
  if(session.status==='submitted') return session;
  const results=session.questions.map(q=>({questionId:q.id,answered:hasExamAnswer(q,session.answers[q.id]),correct:isExamAnswerCorrect(q,session.answers[q.id])}));
  const correct=results.filter(r=>r.correct).length,blank=results.filter(r=>!r.answered).length;
  return {...session,status:'submitted',completedAt:new Date(now).toISOString(),result:{correct,blank,wrong:results.length-correct-blank,total:results.length,percent:Math.round(correct/results.length*100),questions:results}};
}
export function readExamStore(storage) {
  const raw=storage.getItem(EXAM_STORAGE_KEY);
  if(!raw) return {schemaVersion:2,sessions:{},history:[],practiceCounts:{},tutorialFormats:[],settings:{sound:true}};
  const value=JSON.parse(raw);
  if(!value || typeof value.sessions!=='object'||Array.isArray(value.sessions)||!value.sessions) throw new Error('Invalid exam storage');
  const migrate=s=>{
    const mode=s?.mode||'exam', length=s?.questions?.length;
    if(!s || !['exam','practice'].includes(mode)||!Array.isArray(s.questions)||(mode==='exam'?length!==40:length<1||length>5)||!s.questions.every(q=>q?.id&&q?.format&&q?.prompt?.en)||new Set(s.questions.map(q=>q.id)).size!==length||!['active','submitted'].includes(s.status)||!Number.isInteger(s.index)||s.index<0||s.index>=length||!Number.isFinite(s.elapsedMs)||s.elapsedMs<0||!s.answers||typeof s.answers!=='object'||Array.isArray(s.answers)||!s.contentVersion) throw new Error('Invalid saved exam');
    if(s.status==='submitted'&&(!s.result||s.result.total!==length)) throw new Error('Missing exam result');
    // Old matching boards displayed alphabetical options. Preserve that mapping.
    const questions=s.questions.map(q=>q.format==='matching'&&!q.matchOptions?{...q,matchOptions:q.pairs.map(p=>p.right).sort((a,b)=>a.label.localeCompare(b.label))}:q);
    return {...s,questions,mode,flagged:s.flagged||{},breaksSeen:s.breaksSeen||[],practiceQueue:s.practiceQueue||[]};
  };
  const sessions=Object.fromEntries(Object.entries(value.sessions).map(([id,s])=>{
    if(id!==s.examId&&id!==`${s.examId}:practice`)throw new Error('Invalid session key');
    return [id,migrate(s)];
  }));
  if(value.history&&!Array.isArray(value.history))throw new Error('Invalid history');
  return {...value,schemaVersion:2,sessions,history:(value.history||[]).map(migrate),practiceCounts:value.practiceCounts||{},tutorialFormats:value.tutorialFormats||[],settings:{sound:true,...value.settings}};
}
export function answerText(q,answer) {
  if(q.correctChoiceId) return q.choices.find(c=>c.id===answer)?.label || q.choices.find(c=>c.id===answer)?.word || '—';
  if(q.format==='matching') return q.pairs.map(p=>`${p.left.label} → ${q.pairs.find(r=>r.right.id===answer?.[p.left.id])?.right.label||'—'}`).join('; ');
  if(q.format==='sentence-order') return (Array.isArray(answer)?answer:[]).map(id=>q.tokens.find(t=>t.id===id)?.value||'').join(' ')||'—';
  return String(answer||'—');
}
export function correctAnswer(q) {return q.correctChoiceId||q.answerMap||q.correctTokenIds||q.acceptedAnswers?.[0];}

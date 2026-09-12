/* Small shared rituals: no currency rewards, no streaks, and bounded daily history. */
const TOGETHER_MOODS={sun:'☀️ 좋아요',cloud:'☁️ 그저 그래요',rain:'🌧 쉬고 싶어요',spark:'✨ 설레요',hug:'🫶 안아줘요'};
const TOGETHER_PROMPTS=[
  '오늘 고마웠던 작은 일 하나를 서로에게 말해요.',
  '다음에 함께 먹고 싶은 음식 하나씩 골라봐요.',
  '오늘 본 예쁜 장면을 한 문장으로 나눠요.',
  '지금 듣고 싶은 노래를 서로 한 곡씩 추천해요.',
  '다음 데이트에 하고 싶은 작은 일을 하나씩 적어요.',
  '최근 함께 웃었던 순간을 떠올려 이야기해요.',
  '오늘 서로에게 필요한 응원을 한마디씩 건네요.',
  '함께 걷고 싶은 길을 하나씩 골라봐요.',
  '우리의 사진 한 장을 골라 그날 이야기를 나눠요.',
  '상대방에게 궁금한 사소한 질문을 하나씩 해봐요.',
  '함께 쉬는 날의 아침 메뉴를 상상해봐요.',
  '다음에 같이 보고 싶은 영화를 한 편씩 골라요.',
  '오늘 하루를 색깔 하나로 표현하고 이유를 나눠요.',
  '서로의 좋아하는 점을 하나씩 말해요.'
];
const TOGETHER_STAMPS=[[1,'🌱','첫 새싹'],[3,'🌷','작은 꽃다발'],[7,'🧺','소풍 바구니'],[14,'🏡','포근한 집'],[30,'🌳','우리의 나무'],[60,'🌌','별빛 정원']];
let togetherBusy=false,togetherBooted=false;
const togetherDrafts={};
function togetherNow(){return typeof appNow==='function'?appNow():Date.now();}
function togetherDay(now=new Date(togetherNow())){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
function captureTogetherDraft(){const field=$('togetherAnswer');if(field)togetherDrafts[field.dataset.day+':'+field.dataset.slot]=field.value;}
function togetherPrompt(day){return TOGETHER_PROMPTS[Math.abs(Math.floor(Date.parse(day+'T00:00:00Z')/86400000))%TOGETHER_PROMPTS.length];}
function togetherState(state){const raw=state.together||{};return{days:{...(raw.days||{})},total:Math.max(0,Math.floor(Number(raw.total)||0))};}
function togetherEdit(state,day,slot,kind,value){
  if(!/^[12]$/.test(String(slot))||!/^\d{4}-\d{2}-\d{2}$/.test(day)||!['mood','answer'].includes(kind))return{ok:false,message:'입력 내용을 확인해 주세요'};
  if(kind==='mood'&&!Object.hasOwn(TOGETHER_MOODS,value))return{ok:false,message:'마음을 골라주세요'};
  const text=kind==='answer'?String(value||'').trim().slice(0,140):value;
  if(!text)return{ok:false,message:'이야기를 한마디 남겨주세요'};
  const next=togetherState(state),row={...(next.days[day]||{})},person={...(row[slot]||{})};
  if(person[kind]===text)return{ok:false,message:'이미 남겨두었어요'};
  person[kind]=text;row[slot]=person;
  if(!row.completed&&[1,2].every(id=>row[id]?.mood&&row[id]?.answer)){row.completed=true;next.total++;}
  next.days[day]=row;
  next.days=Object.fromEntries(Object.entries(next.days).sort(([a],[b])=>b.localeCompare(a)).slice(0,60));
  state.together=next;
  return{ok:true,message:row.completed?'오늘의 이야기를 함께 모았어요 ♡':'마음을 남겼어요 ♡'};
}
async function saveTogether(kind,value){
  if(togetherBusy)return;
  const slot=who,day=togetherDay();togetherBusy=true;togetherBusyUI();
  try{await changeWorld(state=>togetherEdit(state,day,slot,kind,value));}
  finally{togetherBusy=false;renderTogether();togetherBusyUI();}
}
function togetherBusyUI(){document.querySelectorAll('#togetherPanel [data-together-write]').forEach(el=>el.disabled=togetherBusy);$('togetherPanel')?.setAttribute('aria-busy',String(togetherBusy));}
function togetherJump(target){
  const page=target==='wishes'?1:target==='qa'?4:3;
  go(page,document.querySelectorAll('nav button')[page]);
  if(target==='chalk')openChalkComposer();else if(target==='mail')openPigeonLetters();else if(target==='wishes')showCalendarTab('wishes');
}
function renderTogether(){
  const host=$('togetherPanel');if(!host)return;
  const day=togetherDay(),state=togetherState(LV),row=state.days[day]||{},me=row[who]||{};
  const galleryOpen=host.querySelector('.together-stamps')?.open;
  captureTogetherDraft();
  Object.keys(togetherDrafts).filter(key=>!key.startsWith(day+':')).forEach(key=>delete togetherDrafts[key]);
  const input=$('togetherAnswer'),draft=togetherDrafts[day+':'+who]??null;
  const focused=document.activeElement?.id,selection=focused==='togetherAnswer'?[input.selectionStart,input.selectionEnd]:null;
  const unread=Object.values(LV.mailbox||{}).filter(l=>l&&Number(l.to)===Number(who)&&Number(l.deliveryAt)<=togetherNow()&&!l.openedAt).length;
  host.innerHTML=`<section class="card together-card" aria-labelledby="togetherTitle"><div class="together-heading"><div><small>하루에 작은 이야기 하나</small><h2 id="togetherTitle">오늘도, 우리 둘</h2></div><span class="together-date">${day.slice(5).replace('-',' / ')}</span></div><p class="together-intro">바쁜 날은 쉬어가도 좋아요. 함께 남긴 날만 차곡차곡 모아요.</p><div class="together-people">${[1,2].map(slot=>`<button type="button" data-together-write aria-pressed="${Number(who)===slot}" onclick="setWho(${slot});renderTogether()"><b>${esc(slot===1?S.n1:S.n2)}</b><span>${row[slot]?.mood?esc(TOGETHER_MOODS[row[slot].mood]||'마음 남김'):'오늘의 마음'}${row[slot]?.answer?' · 이야기 ✓':''}</span></button>`).join('')}</div><div class="together-moods" role="group" aria-label="오늘 나의 마음">${Object.entries(TOGETHER_MOODS).map(([id,label])=>`<button id="togetherMood-${id}" type="button" data-together-write aria-pressed="${me.mood===id}" onclick="saveTogether('mood','${id}')">${label}</button>`).join('')}</div><div class="together-mission"><small>오늘의 둘만의 미션</small><h3>${togetherPrompt(day)}</h3><form onsubmit="event.preventDefault();saveTogether('answer',$('togetherAnswer').value)"><label for="togetherAnswer">${esc(Number(who)===1?S.n1:S.n2)}의 한마디</label><div class="together-answer-row"><input id="togetherAnswer" data-together-write data-slot="${who}" data-day="${day}" maxlength="140" required placeholder="짧게 남겨도 좋아요" value="${esc(draft??me.answer??'')}"><button type="submit" data-together-write>${me.answer?'수정':'남기기'}</button></div></form>${[1,2].filter(slot=>row[slot]?.answer).map(slot=>`<p class="together-reply"><b>${esc(slot===1?S.n1:S.n2)}</b> ${esc(row[slot].answer)}</p>`).join('')}<p class="together-status" role="status">${row.completed?'✓ 두 사람의 마음과 이야기가 모였어요.':'각자 마음과 이야기를 남기면 오늘의 기념 도장이 모여요.'}</p></div><details class="together-stamps"><summary>우리의 기념 도장 · 함께 남긴 ${state.total}일</summary><div>${TOGETHER_STAMPS.map(([count,icon,label])=>`<span class="${state.total>=count?'earned':''}"><i aria-hidden="true">${state.total>=count?icon:'◌'}</i><b>${label}</b><small>${count}일${state.total>=count?' · 모았어요':''}</small></span>`).join('')}</div><p>연속으로 접속하지 않아도 돼요. 도장은 기념 장식이며 하트를 쓰거나 받지 않아요.</p></details><div class="together-shortcuts"><button type="button" onclick="togetherJump('chalk')">✎ 칠판에 한마디</button><button type="button" onclick="togetherJump('mail')">✉ 편지${unread?` <b>안 읽은 ${unread}통</b>`:''}</button><button type="button" onclick="togetherJump('qa')">♡ 둘만의 Q&A</button><button type="button" onclick="togetherJump('wishes')">⌁ 다음 데이트 모으기</button></div></section>`;
  if(galleryOpen)host.querySelector('.together-stamps').open=true;
  if(focused&&$(focused)){ $(focused).focus({preventScroll:true});if(selection)$(focused).setSelectionRange(...selection);}
  togetherBusyUI();
}
function bootTogether(){if(togetherBooted)return;togetherBooted=true;renderTogether();setInterval(()=>{if(!document.hidden)renderTogether();},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderTogether();});}

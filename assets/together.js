/* Small shared rituals: permanent question snapshots, no repeats, and no streak penalties. */
const TOGETHER_MOODS={sun:'☀️ 좋아요',cloud:'☁️ 그저 그래요',rain:'🌧 쉬고 싶어요',spark:'✨ 설레요',hug:'🫶 안아줘요'};
const TOGETHER_LEGACY_PROMPTS=[
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
// Keep the original bank immutable: old answers did not store their question text.
const TOGETHER_PROMPTS=[...TOGETHER_LEGACY_PROMPTS,
  '이번 주 나를 가장 편안하게 해준 물건은 무엇이었나요?',
  '상대가 해준 말 중 오래 기억하고 싶은 한마디를 적어요.',
  '요즘 하루 중 가장 좋아하는 시간과 그 이유를 나눠요.',
  '함께 해본 적 없는 취미 하나를 골라 첫날 계획을 세워요.',
  '둘만의 카페를 연다면 이름과 대표 메뉴는 무엇일까요?',
  '지금 창밖에서 들리는 소리 하나를 서로에게 알려줘요.',
  '이번 주 스스로 잘했다고 생각하는 일을 하나씩 칭찬해요.',
  '비 오는 날 실내에서 함께 하고 싶은 활동을 정해요.',
  '상대의 말투나 습관 중 나도 모르게 따라 하게 된 것이 있나요?',
  '우리가 여행 가방에 꼭 넣을 물건을 각자 하나씩 골라요.',
  '아무 계획 없는 두 시간이 생긴다면 함께 무엇을 할까요?',
  '서로에게 하루 동안 빌려주고 싶은 내 능력은 무엇인가요?',
  '우리만 알아듣는 말이나 장난 하나와 생긴 계기를 적어요.',
  '어릴 때 좋아했던 놀이를 하나씩 소개해요.',
  '오늘 처음 알게 된 사소한 사실을 공유해요.',
  '나에게 잘 맞는 휴식은 조용한 시간인가요, 가벼운 활동인가요?',
  '데이트 중 휴대전화를 잠시 내려놓고 하고 싶은 일을 정해요.',
  '서로에게 어울리는 계절과 그 이유를 적어요.',
  '다음 산책에서 함께 찾아보고 싶은 것을 하나씩 골라요.',
  '요즘 궁금하지만 아직 배워보지 못한 것은 무엇인가요?',
  '우리에게 작은 축제를 만들어 준다면 어떤 날을 기념할까요?',
  '집에서 함께 만드는 간단한 간식과 각자의 역할을 정해요.',
  '상대가 바쁜 날 내가 도와줄 수 있는 작은 일을 말해요.',
  '서로의 취향이 달라서 오히려 재미있었던 순간이 있나요?',
  '둘이 보물찾기를 한다면 보물 상자에 무엇을 넣고 싶나요?',
  '오늘 느낀 감정 하나에 재미있는 이름을 붙여봐요.',
  '함께 사는 작은 동물에게 가르쳐주고 싶은 습관은 무엇인가요?',
  '상대에게 보여주고 싶은 동네의 숨은 장소를 소개해요.',
  '주말에 늦잠을 잔 뒤 함께 시작하고 싶은 첫 일은 무엇인가요?',
  '둘만의 라디오를 한다면 오늘 방송 제목은 무엇일까요?',
  '우리의 첫 만남에서 기억나는 작은 디테일을 적어요.',
  '최근 내가 바뀌었다고 느끼는 취향은 무엇인가요?',
  '하루 동안 서로의 일상을 체험한다면 가장 궁금한 순간은 언제인가요?',
  '내가 지쳤을 때 듣고 싶은 말과 피하고 싶은 말투를 알려줘요.',
  '다음 데이트를 실내와 야외 중 어디서 보내고 싶은지 이유를 나눠요.',
  '둘이 함께 완성해보고 싶은 작은 만들기를 골라요.',
  '우리의 추억에 향기를 붙인다면 어떤 향이 떠오르나요?',
  '하늘을 날 수 있다면 함께 가장 먼저 어디로 갈까요?',
  '상대에게 최근 새롭게 발견한 매력을 말해줘요.',
  '함께 기다리는 시간이 생기면 하고 싶은 말놀이를 골라요.',
  '우리가 한 팀으로 잘해냈던 일을 하나 떠올려요.',
  '내가 좋아하는 작은 생활 소리를 하나씩 알려줘요.',
  '다음 계절에 두 사람이 함께 처음 해보고 싶은 일은 무엇인가요?',
  '같은 장면을 각자 찍는다면 어떤 부분을 사진에 담고 싶나요?',
  '약속 시간에 여유가 생겼을 때 내가 보내는 방법을 소개해요.',
  '우리의 하루를 그림 세 칸으로 그린다면 어떤 장면을 넣을까요?',
  '상대가 내게 추천해서 좋아하게 된 것이 있나요?',
  '기분 전환에 도움이 되는 나만의 작은 방법을 알려줘요.',
  '둘이 함께 가상의 서점을 연다면 어떤 코너를 만들까요?',
  '오늘 서로에게 전하고 싶은 소식을 제목 한 줄로 적어요.',
  '한 달 뒤 열어볼 우리에게 짧은 응원을 남겨요.',
  '둘만의 피크닉에 가져갈 놀이 도구를 하나씩 골라요.',
  '길을 잘못 들었는데 오히려 좋았던 경험이 있나요?',
  '요즘 다시 꺼내보고 싶은 책이나 만화는 무엇인가요?',
  '우리의 관계를 식물에 비유하면 무엇이 떠오르나요?',
  '상대가 집중하는 모습 중 좋아하는 장면을 말해줘요.',
  '우리만의 인사 동작을 만든다면 어떤 동작이 좋을까요?',
  '만들어보고 싶은 계절 음료를 골라 이름을 지어봐요.',
  '둘이 하루 동안 작은 가게를 운영한다면 역할을 어떻게 나눌까요?',
  '서로의 하루에 부담 없이 더해주고 싶은 친절을 적어요.',
  '지금의 나에게 필요한 것은 응원, 공감, 해결책 중 무엇인가요?',
  '함께 본 풍경 중 다시 돌아가 잠시 머물고 싶은 곳은 어디인가요?',
  '우리의 사진첩 표지에 쓸 제목을 각자 지어봐요.',
  '낯선 곳에서도 마음이 편해지는 나만의 물건을 소개해요.',
  '이번 주 서로에게 보장해주고 싶은 혼자만의 시간은 어떤 시간인가요?',
  '우리의 일상에 하나 더하고 싶은 작은 의식을 제안해요.',
  '서로의 장점을 합쳐 캐릭터를 만든다면 어떤 능력이 있을까요?',
  '갑자기 비가 와서 계획이 바뀐다면 무엇을 하며 즐길까요?',
  '내가 좋아하는 길거리 간식과 먹는 순서를 알려줘요.',
  '우리의 추억 중 엽서로 만들고 싶은 장면을 고르고 문구를 적어요.',
  '함께 식물을 키운다면 우리가 붙여주고 싶은 이름은 무엇인가요?',
  '지금 눈앞의 평범한 물건 하나에 둘만의 이야기를 만들어봐요.',
  '최근 상대 덕분에 마음이 놓였던 순간이 있나요?',
  '둘이 새로운 게임을 만든다면 승리 조건은 무엇일까요?',
  '다음에 함께 가보고 싶은 전시의 주제를 골라요.',
  '우리가 서로에게 배운 생활의 요령을 하나씩 나눠요.',
  '잠들기 전 함께 보내고 싶은 마지막 10분을 상상해요.',
  '멀리 떨어져 있는 날에도 함께 한다고 느끼는 순간은 언제인가요?',
  '우리의 추억 상자에 지금 넣어두고 싶은 작은 물건은 무엇인가요?',
  '상대에게 오늘 한 가지 선택권을 선물한다면 무엇을 맡기고 싶나요?',
  '앞으로 함께 지켜가고 싶은 대화의 약속을 하나씩 적어요.',
  '오늘의 우리를 미래에 소개하는 한 문장을 써봐요.'
];
const TOGETHER_STAMPS=[[1,'🌱','첫 새싹'],[3,'🌷','작은 꽃다발'],[7,'🧺','소풍 바구니'],[14,'🏡','포근한 집'],[30,'🌳','우리의 나무'],[60,'🌌','별빛 정원']];
let togetherBusy=false,togetherBooted=false,togetherBooting=false,togetherAllocating=false,togetherLoadError='',togetherMissionTimer=null;
let togetherHistoryPage=1,togetherHistoryQuery='',togetherViewDay='';
const togetherDrafts={};
const togetherCustomDrafts={};
function togetherNow(){return typeof appNow==='function'?appNow():Date.now();}
function togetherDay(now=new Date(togetherNow())){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
function togetherQuestionKey(text){return String(text||'').normalize('NFC').toLocaleLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');}
function togetherLegacyPrompt(day){return TOGETHER_LEGACY_PROMPTS[Math.abs(Math.floor(Date.parse(day+'T00:00:00Z')/86400000))%TOGETHER_LEGACY_PROMPTS.length]||'';}
function togetherState(state){
  const raw=state.together||{},days={};
  for(const [day,saved] of Object.entries(raw.days||{})){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!saved||typeof saved!=='object')continue;
    const row={...saved};
    if(!row.question&&!row.exhausted&&[1,2].some(slot=>row[slot]?.answer||row[slot]?.mood)){
      row.question=togetherLegacyPrompt(day);row.promptId='legacy';
    }
    days[day]=row;
  }
  return{...raw,days,total:Math.max(0,Math.floor(Number(raw.total)||0)),version:2};
}
function togetherNextPrompt(state){
  const used=new Set(Object.values(togetherState(state).days).map(row=>togetherQuestionKey(row.question)).filter(Boolean));
  return TOGETHER_PROMPTS.find(question=>!used.has(togetherQuestionKey(question)))||'';
}
function togetherPrompt(day,state=typeof LV==='undefined'?{}:LV){return togetherState(state).days[day]?.question||togetherNextPrompt(state);}
function togetherReserve(state,day){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return{ok:false,message:'날짜를 확인해 주세요'};
  const next=togetherState(state),row={...(next.days[day]||{})};
  if(row.question||row.exhausted){
    state.together=next;return{ok:true};
  }
  row.question=togetherNextPrompt({together:next});
  row.promptId=row.question?'mission-'+(TOGETHER_PROMPTS.indexOf(row.question)+1):'';
  if(!row.question)row.exhausted=true;
  next.days[day]=row;state.together=next;return{ok:true};
}
function captureTogetherDraft(){
  const field=$('togetherAnswer');if(field)togetherDrafts[field.dataset.day+':'+field.dataset.slot]={text:field.value,question:field.dataset.question};
  const custom=$('togetherCustom');if(custom)togetherCustomDrafts[custom.dataset.day]=custom.value;
}
function togetherEdit(state,day,slot,kind,value,expectedQuestion){
  if(!/^[12]$/.test(String(slot))||!/^\d{4}-\d{2}-\d{2}$/.test(day)||!['mood','answer'].includes(kind))return{ok:false,message:'입력 내용을 확인해 주세요'};
  if(kind==='mood'&&!Object.hasOwn(TOGETHER_MOODS,value))return{ok:false,message:'마음을 골라주세요'};
  const text=kind==='answer'?String(value||'').trim().slice(0,140):value;
  if(!text)return{ok:false,message:'이야기를 한마디 남겨주세요'};
  const next=togetherState(state),row={...(next.days[day]||{})},person={...(row[slot]||{})};
  // Direct callers can select and answer atomically; UI callers always send their displayed snapshot.
  if(!row.question&&!row.exhausted){row.question=togetherNextPrompt({together:next});row.promptId='mission-'+(TOGETHER_PROMPTS.indexOf(row.question)+1);}
  if(!row.question)return{ok:false,message:'새 미션을 먼저 적어주세요'};
  if(expectedQuestion!==undefined&&row.question!==expectedQuestion)return{ok:false,message:'미션이 갱신되었어요. 초안을 확인한 뒤 다시 남겨주세요'};
  if(person[kind]===text)return{ok:false,message:'이미 남겨두었어요'};
  person[kind]=text;row[slot]=person;
  if(!row.completed&&[1,2].every(id=>row[id]?.mood&&row[id]?.answer)){row.completed=true;next.total++;}
  next.days[day]=row;state.together=next;
  return{ok:true,message:row.completed?'이날의 이야기를 함께 모았어요 ♡':'마음을 남겼어요 ♡'};
}
function togetherCustomEdit(state,day,value){
  const question=String(value||'').trim().slice(0,140),next=togetherState(state),row={...(next.days[day]||{})};
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!togetherQuestionKey(question))return{ok:false,message:'새로운 미션을 적어주세요'};
  if(row.question||!row.exhausted)return{ok:false,message:'이날의 미션은 이미 정해졌어요'};
  const key=togetherQuestionKey(question);
  if(Object.values(next.days).some(saved=>togetherQuestionKey(saved.question)===key))return{ok:false,message:'이미 나눈 미션이에요. 다른 이야기를 골라주세요'};
  row.question=question;row.promptId='custom';delete row.exhausted;next.days[day]=row;state.together=next;
  return{ok:true,message:'우리만의 새 미션을 만들었어요'};
}
async function ensureTogetherMission(retry=false){
  const day=togetherDay(),row=togetherState(LV).days[day];
  if(togetherAllocating||(!retry&&togetherLoadError===day))return;
  if((row?.question||row?.exhausted)&&LV.together?.version===2)return;
  if(worldBusy){if(!togetherMissionTimer)togetherMissionTimer=setTimeout(()=>{togetherMissionTimer=null;ensureTogetherMission(retry);},250);return;}
  togetherAllocating=true;togetherLoadError='';togetherBusyUI();
  try{
    await changeWorld(state=>togetherReserve(state,day));
    const current=togetherState(LV).days[day];
    if(!current?.question&&!current?.exhausted)togetherLoadError=day;
  }finally{togetherAllocating=false;renderTogether();}
}
async function saveTogether(kind,value){
  if(togetherBusy||togetherAllocating)return;
  const field=$('togetherAnswer');if(!field)return;
  // The input owns its day, question and person even when midnight or another UI update intervenes.
  const slot=field.dataset.slot,day=field.dataset.day,question=field.dataset.question;
  captureTogetherDraft();togetherBusy=true;togetherBusyUI();
  try{
    const ok=await changeWorld(state=>togetherEdit(state,day,slot,kind,value,question));
    if(ok&&kind==='answer'){togetherDrafts[day+':'+slot]={text:String(value).trim().slice(0,140),question};if(day!==togetherDay())togetherViewDay='';}
  }finally{togetherBusy=false;renderTogether();togetherBusyUI();}
}
async function saveTogetherCustom(){
  if(togetherBusy||togetherAllocating)return;
  const field=$('togetherCustom');if(!field)return;
  const day=field.dataset.day,value=field.value;captureTogetherDraft();togetherBusy=true;togetherBusyUI();
  try{await changeWorld(state=>togetherCustomEdit(state,day,value));}
  finally{togetherBusy=false;renderTogether();}
}
function togetherBusyUI(){
  const busy=togetherBusy||togetherAllocating;
  document.querySelectorAll('#togetherPanel [data-together-write]').forEach(el=>el.disabled=busy||el.dataset.togetherConflict==='true');
  $('togetherPanel')?.setAttribute('aria-busy',String(busy));
}
function togetherJump(target){
  const page=target==='wishes'?1:target==='qa'?4:3;
  go(page,document.querySelectorAll('nav button')[page]);
  if(target==='chalk')openChalkComposer();else if(target==='mail')openPigeonLetters();else if(target==='wishes')showCalendarTab('wishes');
}
function togetherHistoryRows(){
  const needle=togetherHistoryQuery.trim().toLocaleLowerCase();
  return Object.entries(togetherState(LV).days).filter(([,row])=>row.question).sort(([a],[b])=>b.localeCompare(a)).filter(([day,row])=>!needle||[day,row.question,row[1]?.answer,row[2]?.answer].join(' ').toLocaleLowerCase().includes(needle));
}
function togetherSearch(value){togetherHistoryQuery=String(value).slice(0,100);togetherHistoryPage=1;renderTogetherHistory();}
function togetherHistoryMove(page){togetherHistoryPage=page;renderTogetherHistory();$('togetherHistoryList')?.focus({preventScroll:true});}
function renderTogetherHistory(){
  const host=$('togetherHistoryList');if(!host)return;
  const rows=togetherHistoryRows(),pages=Math.max(1,Math.ceil(rows.length/10));
  togetherHistoryPage=Math.max(1,Math.min(pages,togetherHistoryPage));
  const view=rows.slice((togetherHistoryPage-1)*10,togetherHistoryPage*10);
  host.innerHTML=`<p class="together-history-count" role="status">${rows.length}일의 미션 · ${togetherHistoryPage} / ${pages} 페이지</p>${view.length?view.map(([day,row])=>`<article class="together-history-entry"><header><time datetime="${day}">${day.replaceAll('-','. ')}</time><span>${row.completed?'함께 완성':row[1]?.answer||row[2]?.answer?'이야기 모으는 중':'아직 답변 전'}</span></header><h4>${esc(row.question)}</h4>${[1,2].map(slot=>`<div class="together-history-answer"><b>${esc(slot===1?S.n1:S.n2)}${row[slot]?.mood?' · '+esc(TOGETHER_MOODS[row[slot].mood]||'마음 남김'):''}</b><p class="${row[slot]?.answer?'':'pending'}">${esc(row[slot]?.answer||'아직 남긴 이야기가 없어요.')}</p></div>`).join('')}</article>`).join(''):`<p class="together-history-empty">${togetherHistoryQuery?'찾는 기록이 없어요. 다른 단어로 찾아보세요.':'미션과 이야기가 이곳에 차곡차곡 모여요.'}</p>`}<div class="together-history-pages" aria-label="미션 기록 페이지"><button type="button" onclick="togetherHistoryMove(${togetherHistoryPage-1})" ${togetherHistoryPage===1?'disabled':''}>← 이전</button><span>${togetherHistoryPage} / ${pages}</span><button type="button" onclick="togetherHistoryMove(${togetherHistoryPage+1})" ${togetherHistoryPage===pages?'disabled':''}>다음 →</button></div>`;
}
function togetherResumeDraft(day,slot){captureTogetherDraft();togetherViewDay=day;who=Number(slot);setWho(who);renderTogether();$('togetherAnswer')?.focus();}
function togetherToday(){captureTogetherDraft();togetherViewDay='';renderTogether();}
function togetherAdoptDraft(){
  const field=$('togetherAnswer');if(!field)return;
  const question=togetherState(LV).days[field.dataset.day]?.question;if(!question)return;
  field.dataset.question=question;captureTogetherDraft();renderTogether();
}
function renderTogether(){
  const host=$('togetherPanel');if(!host)return;
  captureTogetherDraft();
  const today=togetherDay(),day=togetherViewDay||today,state=togetherState(LV),row=state.days[day]||{},me=row[who]||{};
  const galleryOpen=host.querySelector('.together-stamps')?.open,historyOpen=host.querySelector('.together-history')?.open;
  const input=$('togetherAnswer'),draft=togetherDrafts[day+':'+who];
  const customDraft=togetherCustomDrafts[day]||'';
  const focused=document.activeElement?.id,focusField=focused?$(focused):null,selection=focusField&&typeof focusField.selectionStart==='number'?[focusField.selectionStart,focusField.selectionEnd]:null;
  const unread=Object.values(LV.mailbox||{}).filter(l=>l&&Number(l.to)===Number(who)&&Number(l.deliveryAt)<=togetherNow()&&!l.openedAt).length;
  const oldDrafts=Object.entries(togetherDrafts).filter(([key,value])=>key.slice(0,10)!==day&&value.text.trim()&&value.text!==state.days[key.slice(0,10)]?.[key.slice(-1)]?.answer);
  for(const [draftDay,text] of Object.entries(togetherCustomDrafts))if(draftDay!==day&&text.trim()&&state.days[draftDay]?.exhausted)oldDrafts.push([draftDay+':'+who,{text}]);
  const form=row.question?`<form onsubmit="event.preventDefault();saveTogether('answer',$('togetherAnswer').value)"><label for="togetherAnswer">${esc(Number(who)===1?S.n1:S.n2)}의 한마디</label><div class="together-answer-row"><input id="togetherAnswer" data-together-write data-slot="${who}" data-day="${day}" data-question="${esc(draft?.question||row.question)}" maxlength="140" required placeholder="짧게 남겨도 좋아요" value="${esc(draft?.text??me.answer??'')}"><button type="submit" data-together-write data-together-conflict="${!!draft&&draft.question!==row.question}">${me.answer?'수정':'남기기'}</button></div>${draft&&draft.question!==row.question?'<p class="together-draft-notice">저장된 미션이 바뀌어 초안을 보관했어요. 새 질문을 확인한 뒤 이어써 주세요. <button type="button" data-together-write onclick="togetherAdoptDraft()">새 질문에 맞춰 이어쓰기</button></p>':''}</form>`:row.exhausted?`<p class="together-status">준비된 미션을 모두 만났어요. 예전 질문을 반복하지 않고, 이제 우리만의 새 미션을 적을 수 있어요.</p><form onsubmit="event.preventDefault();saveTogetherCustom()"><label for="togetherCustom">새로운 둘만의 미션</label><div class="together-answer-row"><input id="togetherCustom" data-together-write data-day="${day}" maxlength="140" required placeholder="둘이 나누고 싶은 새로운 이야기" value="${esc(customDraft)}"><button type="submit" data-together-write>정하기</button></div></form>`:`<p class="together-status" role="status">${togetherLoadError===day?'미션을 불러오지 못했어요. 연결을 확인해 주세요.':'두 사람에게 같은 미션을 준비하고 있어요.'}</p>${togetherLoadError===day?'<button class="together-retry" type="button" onclick="ensureTogetherMission(true)">다시 불러오기</button>':''}`;
  host.innerHTML=`<section class="card together-card" aria-labelledby="togetherTitle"><div class="together-heading"><div><small>하루에 새로운 이야기 하나</small><h2 id="togetherTitle">오늘도, 우리 둘</h2></div><span class="together-date">${day.slice(5).replace('-',' / ')}</span></div><p class="together-intro">같은 미션은 다시 나오지 않아요. 한 사람의 이야기부터 두 사람의 마음까지 함께 보관해요.</p>${day!==today?`<p class="together-draft-notice">${day}에 쓰던 이야기예요. 이 날짜에 저장해요. <button type="button" onclick="togetherToday()">오늘 미션 보기</button></p>`:''}<div class="together-people">${[1,2].map(slot=>`<button type="button" data-together-write aria-pressed="${Number(who)===slot}" onclick="setWho(${slot});renderTogether()"><b>${esc(slot===1?S.n1:S.n2)}</b><span>${row[slot]?.mood?esc(TOGETHER_MOODS[row[slot].mood]||'마음 남김'):'오늘의 마음'}${row[slot]?.answer?' · 이야기 ✓':''}</span></button>`).join('')}</div>${row.question?`<div class="together-moods" role="group" aria-label="이날 나의 마음">${Object.entries(TOGETHER_MOODS).map(([id,label])=>`<button id="togetherMood-${id}" type="button" data-together-write aria-pressed="${me.mood===id}" onclick="saveTogether('mood','${id}')">${label}</button>`).join('')}</div>`:''}<div class="together-mission"><small>${day===today?'오늘의 둘만의 미션':'이날의 둘만의 미션'}</small>${row.question?`<h3>${esc(row.question)}</h3>`:''}${form}${[1,2].filter(slot=>row[slot]?.answer).map(slot=>`<p class="together-reply"><b>${esc(slot===1?S.n1:S.n2)}</b> ${esc(row[slot].answer)}</p>`).join('')}${row.question?`<p class="together-status" role="status">${row.completed?'✓ 두 사람의 마음과 이야기가 모였어요.':'각자 마음과 이야기를 남기면 이날의 기념 도장이 모여요.'}</p>`:''}</div>${oldDrafts.length?`<div class="together-draft-notice">이전에 쓰던 초안 ${oldDrafts.map(([key])=>`<button type="button" onclick="togetherResumeDraft('${key.slice(0,10)}',${key.slice(-1)})">${key.slice(5,10)} · ${esc(key.endsWith('1')?S.n1:S.n2)} 이어쓰기</button>`).join('')}</div>`:''}<details class="together-history"><summary>우리의 미션 기록 · ${Object.values(state.days).filter(saved=>saved.question).length}일</summary><label for="togetherHistorySearch">질문·답변·날짜로 찾기</label><input id="togetherHistorySearch" type="search" maxlength="100" placeholder="기억나는 단어나 날짜" value="${esc(togetherHistoryQuery)}" oninput="togetherSearch(this.value)"><div id="togetherHistoryList" tabindex="-1"></div></details><details class="together-stamps"><summary>우리의 기념 도장 · 함께 남긴 ${state.total}일</summary><div>${TOGETHER_STAMPS.map(([count,icon,label])=>`<span class="${state.total>=count?'earned':''}"><i aria-hidden="true">${state.total>=count?icon:'◌'}</i><b>${label}</b><small>${count}일${state.total>=count?' · 모았어요':''}</small></span>`).join('')}</div><p>연속으로 접속하지 않아도 돼요. 도장은 기념 장식이며 하트를 쓰거나 받지 않아요.</p></details><div class="together-shortcuts"><button type="button" onclick="togetherJump('chalk')">✎ 칠판에 한마디</button><button type="button" onclick="togetherJump('mail')">✉ 편지${unread?` <b>안 읽은 ${unread}통</b>`:''}</button><button type="button" onclick="togetherJump('qa')">♡ 둘만의 Q&A</button><button type="button" onclick="togetherJump('wishes')">⌁ 다음 데이트 모으기</button></div></section>`;
  if(galleryOpen)host.querySelector('.together-stamps').open=true;
  if(historyOpen)host.querySelector('.together-history').open=true;
  renderTogetherHistory();
  if(focused&&$(focused)){$(focused).focus({preventScroll:true});if(selection)$(focused).setSelectionRange(...selection);}
  togetherBusyUI();
  if(togetherBooted&&!togetherAllocating)ensureTogetherMission();
}
async function bootTogether(){
  if(togetherBooted||togetherBooting)return;togetherBooting=true;
  await ensureTogetherMission();togetherBooted=true;renderTogether();
  setInterval(()=>{if(!document.hidden)renderTogether();},60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderTogether();});
}

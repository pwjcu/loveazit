/* Letters and new Q&A rounds share the living transaction with their costs. */
const COUPLE_HOUR=3600000, QA_INTERVAL=72*COUPLE_HOUR;
const COUPLE_QUESTIONS={
  '작은 일상':['요즘 하루 중 가장 좋아하는 시간은 언제야?','오늘 나와 나누고 싶은 작은 기쁨은?','함께 보내는 평범한 주말에 꼭 넣고 싶은 일은?','내가 곁에 있으면 편안해지는 순간은?','우리의 아침에 더하고 싶은 작은 습관은?','별일 없는 날 내가 해주면 좋은 한 가지는?'],
  '추억':['우리의 만남을 영화 한 장면으로 남긴다면?','둘이 웃었던 순간 중 다시 떠올리고 싶은 기억은?','처음 친해졌다고 느낀 순간은 언제였어?','함께 걸었던 길 중 다시 걷고 싶은 곳은?','우리 사진 한 장에 제목을 붙인다면?','평범했지만 오래 기억에 남는 데이트는?'],
  '취향':['비 오는 날 함께 듣고 싶은 음악은?','둘만의 작은 카페를 연다면 어떤 분위기일까?','함께 맛보고 싶은 새로운 음식은?','나에게 소개하고 싶은 책이나 영화는?','서로 바꾸어 해보고 싶은 취미는?','우리에게 어울리는 계절과 색은 무엇일까?'],
  '데이트':['다음 데이트에서 꼭 함께 해보고 싶은 것은?','한 시간만 만날 수 있다면 무엇을 하고 싶어?','집에서 보내는 특별한 저녁을 만든다면?','산책 중에 잠시 쉬어 가고 싶은 장소는?','계획 없이 떠나는 하루에 챙기고 싶은 것은?','나와 함께 배우고 싶은 작은 기술은?'],
  '고마움':['최근 나에게 고마웠던 작은 행동은?','내가 아직 모를 것 같은 나의 장점은?','서로에게 칭찬 스티커를 준다면 어떤 내용일까?','내가 해준 말 중 힘이 됐던 말은?','오늘 나를 응원하는 한 문장을 써준다면?','내 덕분에 달라진 소소한 습관이 있어?'],
  '마음 돌보기':['지친 날에는 어떤 방식의 위로가 편해?','혼자 쉬는 시간이 필요할 때 어떻게 알려주면 좋을까?','내가 잘 들어주고 있다고 느끼는 순간은?','서운함을 말할 때 듣고 싶은 첫마디는?','대화가 어려울 때 잠깐 쉬자는 우리만의 신호는?','요즘 내가 알아주었으면 하는 마음은?'],
  '함께 자라기':['우리 둘이 올해 해보고 싶은 작은 도전은?','서로에게 배우고 싶은 점 한 가지는?','우리 사이에서 오래 지키고 싶은 약속은?','한 달 동안 함께 연습할 좋은 습관은?','앞으로 더 자주 나누고 싶은 대화는?','서로의 시간을 존중하는 좋은 방법은?'],
  '상상 놀이':['우리 아지트에 비밀의 방이 생긴다면?','둘만의 작은 축제를 만든다면 이름은?','우리 둘이 동화의 주인공이면 어떤 모험을 할까?','하루 동안 동물로 변한다면 같이 무엇을 할까?','우리의 하루를 게임으로 만들면 특별 보상은?','우리에게 편지를 배달하는 비둘기 이름을 지어준다면?'],
  '설렘':['내가 웃을 때 어떤 생각이 들어?','둘만의 새로운 애칭을 만든다면?','데이트 전 나에게 듣고 싶은 말은?','내 목소리에서 좋아하는 부분은?','나를 떠올리게 하는 향이나 풍경은?','다음 만남에 건네고 싶은 다정한 인사는?']
};
const COUPLE_SPECIAL_CATEGORIES={
  '로맨틱한 분위기':['둘만의 로맨틱한 밤에 어울리는 조명과 음악은?','특별한 데이트에서 나의 어떤 옷차림에 설레?','편안한 잠옷이나 집에서 입는 옷 중 서로에게 잘 어울리는 스타일은?','입맞춤하기 좋은 순간을 한 장면으로 그려본다면?'],
  '마음을 표현하기':['더 가까이 있고 싶은 마음을 부담 없이 전하는 말은?','내가 먼저 다가와 주었으면 하는 순간에는 어떻게 알려주면 좋을까?','직접 말하는 애정 표현과 편지 중 어떤 방식이 더 설레?','오늘은 다정하게 안아 달라고 부탁하는 우리만의 표현은?'],
  '편안한 거리':['애정 표현을 잠깐 멈추고 싶을 때 우리만의 신호를 정한다면?','사람들이 있는 곳에서 편안한 애정 표현의 범위는?','오늘은 스킨십보다 대화가 필요하다고 어떻게 알려주면 좋을까?','애정 표현을 거절해도 편안한 사이가 되려면 어떤 말이 필요할까?'],
  '친밀한 순간의 앞뒤':['가까운 시간을 보내기 전에 서로의 기분을 어떻게 살펴주면 좋을까?','친밀한 시간을 보낸 뒤 함께 쉬면서 듣고 싶은 말은?','둘만의 밤을 마친 다음 날 어떤 다정한 연락을 받고 싶어?','가까워진 뒤 부끄럽거나 마음이 복잡할 때 어떤 위로가 편할까?'],
  '솔직하고 조심스러운 대화':['피임에 관한 서로의 생각은 어떤 분위기와 시점에 이야기하면 편할까?','친밀함에 대한 서로의 속도가 다를 때 어떻게 대화를 시작하면 좋을까?','쑥스러운 마음이나 원하는 것을 이야기할 때 내가 어떻게 들어주면 좋을까?','친밀한 주제 중 지금은 이야기하지 않고 남겨두고 싶은 범위를 어떻게 알려줄까?'],
  '둘만의 사생활':['우리의 다정한 사진을 찍거나 공유하기 전에 무엇을 확인해 주면 좋을까?','둘만의 친밀한 이야기를 어디까지 우리 사이에만 간직하고 싶어?','단둘이 쉬는 시간에 휴대전화나 알림은 어떻게 두면 좋을까?','둘만의 여행에서 함께하는 시간과 혼자 쉬는 시간을 어떻게 나누면 편할까?']
};
const COUPLE_SPECIAL=Object.entries(COUPLE_SPECIAL_CATEGORIES).flatMap(([category,questions])=>questions.map(question=>({category,question})));
const COUPLE_FREE=Object.entries(COUPLE_QUESTIONS).flatMap(([category,questions])=>questions.map(question=>({category,question})));
const legacyMutateQA=mutateQA;
let coupleBooted=false,letterSending=false;
const letterDrafts={1:'',2:''};
const coupleNow=()=>typeof appNow==='function'?appNow():Date.now();
const coupleId=()=> 'c'+(typeof crypto.randomUUID==='function'?crypto.randomUUID().replaceAll('-',''):Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join(''));
const coupleEntries=obj=>Object.entries(obj||{}).filter(([,v])=>v&&typeof v==='object').map(([id,v])=>({...v,id}));
function qaAllRecords(state=LV){return [...qaList,...coupleEntries(state.qaRounds)].sort((a,b)=>(Number(b.ts)||0)-(Number(a.ts)||0));}
function qaNextAt(records){return records.reduce((latest,q)=>Math.max(latest,Number(q.ts)||0),0)+QA_INTERVAL;}
function produceCount(state=LV){return Object.keys(FRUITS).reduce((sum,key)=>sum+Math.max(0,Math.floor(Number(state.pantry?.[key])||0)),0);}
function spendProduce(state,amount){
  if(produceCount(state)<amount)return false;
  state.pantry={...state.pantry};
  for(const key of Object.keys(FRUITS)){const used=Math.min(amount,Math.max(0,Math.floor(Number(state.pantry[key])||0)));state.pantry[key]=(Number(state.pantry[key])||0)-used;amount-=used;if(!amount)break;}
  return true;
}
function specialReady(state=LV){return [1,2].every(slot=>state.specialConsent?.[slot]?.adult===true&&state.specialConsent?.[slot]?.optIn===true);}
function coupleDuration(ms){const m=Math.max(1,Math.ceil(ms/60000));return m>=1440?Math.floor(m/1440)+'일 '+Math.floor(m%1440/60)+'시간':m>=60?Math.floor(m/60)+'시간 '+m%60+'분':m+'분';}
function letterDeliveryAt(now,random){return now+COUPLE_HOUR+Math.floor(Math.max(0,Math.min(1,random))*(7*24*COUPLE_HOUR-COUPLE_HOUR));}
function fedDeliveryAt(deliveryAt,now,random){const remaining=deliveryAt-now;if(remaining<=300000)return deliveryAt;return Math.round(now+Math.max(300000,remaining*(1-(.15+.20*Math.max(0,Math.min(1,random))))));}
function openPigeonLetters(){go(3,document.querySelectorAll('nav button')[3]);renderPostOffice();}
function openProduceQna(){go(4,document.querySelectorAll('nav button')[4]);renderQA();}
function renderCouple(){renderPostOffice();renderQA();}
function bootCouple(){
  if(coupleBooted)return;coupleBooted=true;renderCouple();
  setInterval(()=>{if(document.hidden)return;updateLetterClocks();renderQAExtras();},30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderCouple();});
}
function pigeonSvg(){return `<svg class="pigeon" viewBox="0 0 90 66" aria-hidden="true"><ellipse cx="42" cy="39" rx="24" ry="16" fill="#dedbeb"/><path d="M24 34 7 43l19 5" fill="#c5bfda"/><ellipse class="pigeon-wing" cx="39" cy="32" rx="20" ry="9" transform="rotate(-25 39 32)" fill="#f9f7ff"/><circle cx="61" cy="23" r="13" fill="#efecf6"/><path d="m72 23 11 5-12 4" fill="#eab071"/><circle cx="65" cy="20" r="2.4" fill="#574358"/><circle cx="67" cy="29" r="3" fill="#efb9c7"/><path d="m38 52-3 8m13-8 2 8" stroke="#c58c90" stroke-width="3" stroke-linecap="round"/><path d="m35 55 16 0 0 10-16 0z" fill="#fff5db" stroke="#ca9ba4"/><path d="m35 55 8 6 8-6" fill="none" stroke="#ca9ba4"/></svg>`;}
function captureLetterDraft(){const el=$('letterBody');if(el)letterDrafts[el.dataset.slot]=el.value;}
function renderPostOffice(){
  const host=$('postOffice');if(!host)return;
  const field=$('letterBody'),focused=field&&document.activeElement===field,selection=focused?[field.selectionStart,field.selectionEnd]:null;
  captureLetterDraft();
  const list=coupleEntries(LV.mailbox).sort((a,b)=>b.sentAt-a.sentAt),now=coupleNow();
  const pending=list.filter(l=>l.from===who&&l.deliveryAt>now).length;
  host.innerHTML=`<div class="card pigeon-office"><div class="post-hero"><div class="pigeon-route">${pigeonSvg()}<span class="post-cloud">☁</span><span class="post-cloud second">☁</span></div><div><small class="post-kicker">우리의 느린 우체국</small><h2>마음을 싣고, 포르르</h2><p>1시간에서 7일 사이, 비둘기가 편지를 전해요.<br>기다리는 시간까지 둘만의 작은 선물.</p></div></div>
    <div class="who" role="group" aria-label="편지를 쓸 사람">${[1,2].map(s=>`<button type="button" class="${who===s?'on':''}" aria-pressed="${who===s}" onclick="setWho(${s});renderPostOffice()">${esc(s===1?S.n1:S.n2)}</button>`).join('')}</div>
    <form class="letter-compose" onsubmit="event.preventDefault();sendPigeonLetter()"><label for="letterBody">${esc(who===1?S.n2:S.n1)}에게 보낼 봉인 편지</label><textarea id="letterBody" data-slot="${who}" maxlength="1000" placeholder="천천히 도착해도 변하지 않을 마음을 적어주세요." oninput="letterDrafts[this.dataset.slot]=this.value">${esc(letterDrafts[who])}</textarea><div class="letter-compose-foot"><small>보내면 수정할 수 없어요 · 비행 중 ${pending}/3통</small><button type="submit" class="btn sm" ${letterSending||pending>=3?'disabled':''}>${letterSending?'비둘기가 준비 중…':'💌 봉인해서 보내기'}</button></div></form>
    <div class="post-inventory">🌾 우리 수확물 <b>${produceCount()}개</b><span>한 개를 먹이면 남은 비행이 15~35% 짧아져요</span></div><p class="couple-fine">편지당 먹이 3번 · 최소 5분은 더 날아요. 도착할 때까지 봉투가 잠겨 있어요.</p></div>
    <div class="card"><div class="stitle">📮 오가는 편지 <span class="mail-count">${list.length}</span></div><div class="letter-list">${list.map(l=>letterCard(l,now)).join('')||'<div class="post-empty"><span>✉</span><p>우체통이 아직 조용해요.<br>첫 편지를 비둘기에게 맡겨보세요.</p></div>'}</div></div>
    ${notes.length?`<details class="card legacy-notes"><summary>📜 예전 한마디 ${notes.length}개</summary><p class="couple-fine">기존에 나눈 말을 그대로 보관했어요.</p>${[...notes].sort((a,b)=>b.ts-a.ts).map(n=>`<article><small>${esc(n.who===1?S.n1:S.n2)} · ${new Date(n.ts).toLocaleDateString('ko-KR')}</small><p>${esc(n.text)}</p></article>`).join('')}</details>`:''}
    <p class="couple-fine privacy-disclosure">봉인과 이름 선택은 화면에서 내용을 가리는 기능이에요. 로그인이나 암호화로 보호되는 개인 보관함은 아니에요.</p>`;
  if(focused&&$('letterBody')){$('letterBody').focus({preventScroll:true});$('letterBody').setSelectionRange(...selection);}
}
function letterCard(l,now){
  const arrived=now>=l.deliveryAt,recipient=who===l.to,opened=arrived&&recipient&&l.openedAt;
  const fruits=Object.entries(FRUITS).filter(([id])=>Number(LV.pantry?.[id])>=1),canFeed=!arrived&&l.deliveryAt-now>300000&&(l.feeds||0)<3;
  return `<article class="letter-card ${arrived?'arrived':'in-flight'} ${opened?'is-open':''}" data-letter="${l.id}"><div class="letter-symbol" aria-hidden="true">${arrived?(opened?'💌':'✉'):pigeonSvg()}</div><div class="letter-info"><div class="letter-address">${esc(l.from===1?S.n1:S.n2)} <span>→</span> ${esc(l.to===1?S.n1:S.n2)}</div><small class="letter-clock" data-delivery="${l.deliveryAt}">${arrived?(l.openedAt?'마음을 열어보았어요':'도착했어요! 봉투를 열어주세요'):coupleDuration(l.deliveryAt-now)+' 뒤 도착 예정'}</small><small>${new Date(l.sentAt).toLocaleDateString('ko-KR')} 보냄 · 먹이 ${l.feeds||0}/3번</small>
    ${opened?`<p class="letter-paper">${esc(l.body)}</p>`:arrived&&recipient?`<button type="button" class="btn sm envelope-open" onclick="openPigeonLetter('${l.id}')">💌 봉투 열기</button>`:arrived?'<p class="couple-fine">상대방의 우체통에 도착했어요.</p>':'<div class="letter-sealed">♡ 봉인된 마음을 배달하고 있어요</div>'}
    ${canFeed?`<div class="pigeon-feed"><label class="sr-only" for="feed_${l.id}">비둘기 먹이 선택</label><select id="feed_${l.id}" ${fruits.length?'':'disabled'}>${fruits.length?fruits.map(([id,f])=>`<option value="${id}">${f.e} ${f.n} (${LV.pantry[id]}개)</option>`).join(''):'<option>수확물이 없어요</option>'}</select><button type="button" class="btn ghost sm" ${fruits.length?'':'disabled'} onclick="feedPigeon('${l.id}')">먹이 1개 주기</button></div>`:''}</div></article>`;
}
function updateLetterClocks(){
  let arrival=false;document.querySelectorAll('.letter-clock[data-delivery]').forEach(el=>{const left=Number(el.dataset.delivery)-coupleNow();if(left<=0&&el.closest('.in-flight'))arrival=true;else if(left>0)el.textContent=coupleDuration(left)+' 뒤 도착 예정';});
  if(arrival)renderPostOffice();
}
async function sendPigeonLetter(){
  if(letterSending)return;captureLetterDraft();
  const from=who,body=letterDrafts[from].trim().slice(0,1000);if(!body){toast('편지에 마음을 먼저 적어주세요');return;}
  const now=coupleNow(),id=coupleId(),deliveryAt=letterDeliveryAt(now,Math.random());
  letterSending=true;renderPostOffice();
  try{
    const ok=await changeWorld(state=>{
      if(coupleEntries(state.mailbox).filter(l=>l.from===from&&l.deliveryAt>now).length>=3)return worldFail('비행 중인 편지는 한 사람당 3통까지예요');
      state.mailbox={...state.mailbox,[id]:{from,to:from===1?2:1,body,sentAt:now,deliveryAt,initialDeliveryAt:deliveryAt,feeds:0}};
      return {message:'봉인 완료! 비둘기가 마음을 싣고 떠났어요 🕊️'};
    });
    if(ok){if(letterDrafts[from].trim()===body){letterDrafts[from]='';const el=$('letterBody');if(el&&Number(el.dataset.slot)===from)el.value='';}await earnHeart('note',ACT_REWARD).catch(()=>{});}
  }finally{letterSending=false;renderPostOffice();}
}
async function openPigeonLetter(id){
  const slot=who,now=coupleNow();
  await changeWorld(state=>{const l=state.mailbox?.[id];if(!l||l.to!==slot)return worldFail('받는 사람의 이름을 선택해 주세요');if(now<l.deliveryAt)return worldFail('비둘기가 아직 날아오고 있어요');if(!l.openedAt)l.openedAt=now;return{message:'봉투 속 마음이 도착했어요 💌'};});renderPostOffice();
}
async function feedPigeon(id){
  const crop=$('feed_'+id)?.value;if(!FRUITS[crop])return;
  const now=coupleNow(),random=Math.random();
  await changeWorld(state=>{
    const l=state.mailbox?.[id];if(!l||l.deliveryAt-now<=300000)return worldFail('이제 곧 도착해요. 조금만 기다려 주세요');if((l.feeds||0)>=3)return worldFail('이 편지의 비둘기는 먹이를 세 번 먹었어요');
    if(!(Number(state.pantry?.[crop])>=1))return worldFail('선택한 수확물이 없어요');
    state.pantry[crop]-=1;l.deliveryAt=fedDeliveryAt(l.deliveryAt,now,random);l.feeds=(l.feeds||0)+1;
    return{message:'냠냠! 비둘기가 힘을 내서 조금 더 빨리 날아요 🕊️'};
  });renderPostOffice();
}

activeQA=function(){return qaAllRecords().find(q=>!q.revealed&&!q.skipped);};
startQA=async function(payment='free'){
  if(qaStarting)return;
  if(!['free','hearts','produce'].includes(payment))return;
  const now=coupleNow(),all=qaAllRecords(),isSpecial=payment!=='free';
  if(activeQA()){toast('진행 중인 질문을 함께 열거나 건너뛰어 주세요');return;}
  if(all.length&&now<qaNextAt(all)){toast('다음 질문까지 '+coupleDuration(qaNextAt(all)-now)+' 남았어요');return;}
  if(isSpecial&&!specialReady()){toast('두 사람 모두 성인 확인과 특별 질문 동의가 필요해요');return;}
  const pool=isSpecial?COUPLE_SPECIAL:COUPLE_FREE;
  const used=new Set(all.map(q=>q.question)),unused=pool.filter(q=>!used.has(q.question)),available=unused.length?unused:pool;
  const choice=available[Math.floor(Math.random()*available.length)],id=coupleId();
  qaStarting=true;renderQA();
  try{await changeWorld(state=>{
    const records=qaAllRecords(state);
    if(records.some(q=>!q.revealed&&!q.skipped))return worldFail('이미 진행 중인 질문이 있어요');
    if(records.length&&now<qaNextAt(records))return worldFail('새 질문은 이전 질문을 뽑은 뒤 72시간마다 열려요');
    if(isSpecial&&!specialReady(state))return worldFail('두 사람의 성인 확인과 특별 질문 동의를 확인해 주세요');
    if(payment==='hearts'&&!spendWorld(state,12))return worldFail('특별 질문은 12💗가 필요해요');
    if(payment==='produce'&&!spendProduce(state,4))return worldFail('특별 질문은 수확물 4개가 필요해요');
    state.qaRounds={...state.qaRounds,[id]:{...choice,special:isSpecial,payment,ts:now,a1:'',a2:'',consent1:false,consent2:false,revealed:false}};
    return{message:'우리의 새 질문이 도착했어요 💑'};
  });}finally{qaStarting=false;renderQA();}
};
mutateQA=async function(id,mutate){
  if(!Object.prototype.hasOwnProperty.call(LV.qaRounds||{},id))return legacyMutateQA(id,mutate);
  let saved=null;
  const ok=await changeWorld(state=>{const raw=state.qaRounds?.[id];if(!raw)return worldFail('질문을 찾을 수 없어요');const next=mutate({...raw,id});if(!next)return worldFail('질문 상태가 바뀌었어요. 다시 확인해 주세요');if(raw.special&&!next.skipped&&!specialReady(state))return worldFail('두 사람의 특별 질문 동의를 다시 확인해 주세요');const {id:_,...payload}=next;state.qaRounds[id]=payload;saved={...payload,id};return{message:''};});
  return ok?saved:null;
};
submitQAAns=async function(id,slot){
  slot=Number(slot);if(slot!==who){toast('선택된 이름을 다시 확인해 주세요');return;}
  const el=$(`qa_in_${id}_${slot}`),text=el?.value.trim().slice(0,200);if(!text){toast('답변을 먼저 적어주세요');return;}
  const current=qaAllRecords().find(q=>q.id===id);if(!current||current.revealed||current.skipped||current['a'+slot])return;
  if(current.special&&!specialReady()){toast('특별 질문 동의를 확인해 주세요');return;}
  if(!confirm('답변을 잠글까요? 둘이 공개에 동의할 때까지 다시 보거나 수정할 수 없어요.'))return;
  try{
    const now=coupleNow(),saved=await mutateQA(id,q=>{if(q.revealed||q.skipped||q['a'+slot])return null;q['a'+slot]=text;q['consent'+slot]=false;q.updatedAt=now;return q;});
    if(!saved)return;
    delete qaDrafts[qaDraftKey(id,slot)];if(el)el.value='';
    await earnHeart('qa',ACT_REWARD).catch(()=>{});toast('답변을 잠갔어요 🔒');
  }catch(error){console.error('Q&A 저장 실패',error);toast('답변을 저장하지 못했어요. 작성한 내용은 남겨두었어요');}finally{renderQA();}
};
toggleQAConsent=async function(id,slot){
  slot=Number(slot);if(slot!==who)return;
  const current=qaAllRecords().find(q=>q.id===id);if(!current||current.revealed||current.skipped||!current.a1||!current.a2)return;
  if(current.special&&!specialReady()){toast('특별 질문 동의를 확인해 주세요');return;}
  const consent=!qaConsent(current,slot),now=coupleNow();
  try{const saved=await mutateQA(id,q=>{if(q.revealed||q.skipped||!q.a1||!q.a2)return null;q['consent'+slot]=consent;q.updatedAt=now;if(q.consent1===true&&q.consent2===true){q.revealed=true;q.revealedAt=now;}return q;});if(saved)toast(saved.revealed?'두 사람의 답변을 함께 열었어요 💞':consent?'내 공개 동의를 남겼어요':'내 공개 동의를 취소했어요');}
  catch(error){console.error('Q&A 공개 저장 실패',error);toast('동의를 저장하지 못했어요. 다시 눌러주세요');}finally{renderQA();}
};
async function skipCoupleQA(id){
  const q=qaAllRecords().find(q=>q.id===id);if(!q||q.skipped||q.revealed)return;
  if(!confirm('이 질문을 무료로 건너뛸까요? 답변은 공개되지 않으며, 다음 질문은 처음 뽑은 시각에서 72시간 뒤에 열려요.'+(q.special?' 사용한 하트·수확물은 돌아오지 않아요.':'')))return;
  try{const now=coupleNow();await mutateQA(id,next=>{if(next.revealed||next.skipped)return null;next.skipped=true;next.skippedAt=now;next.a1='';next.a2='';next.consent1=false;next.consent2=false;return next;});}
  catch(error){console.error('Q&A 건너뛰기 실패',error);toast('건너뛰기를 저장하지 못했어요');}finally{renderQA();}
}
async function setSpecialConsent(field,value){
  if(!['adult','optIn'].includes(field))return;const slot=who,now=coupleNow();
  await changeWorld(state=>{state.specialConsent={...state.specialConsent};const next={...state.specialConsent[slot],[field]:value===true,updatedAt:now};if(field==='adult'&&!value)next.optIn=false;if(next.optIn&&!next.adult)return worldFail('먼저 성인임을 확인해 주세요');state.specialConsent[slot]=next;return{message:''};});renderQA();
}
renderQA=function(){
  if(!$('qaActive'))return;
  const focused=document.activeElement,focusId=focused?.id?.startsWith('qa_in_')?focused.id:null,selection=focusId?[focused.selectionStart,focused.selectionEnd]:null;
  captureQADrafts();
  const cur=activeQA();renderedQAId=cur?.id||null;
  [1,2].forEach(slot=>{const b=$('qw'+slot);if(!b)return;b.classList.toggle('on',who===slot);b.setAttribute('aria-pressed',String(who===slot));b.setAttribute('aria-label',(slot===1?S.n1:S.n2)+' 선택');const n=b.querySelector('.q-name'),s=b.querySelector('small');if(n)n.textContent=slot===1?S.n1:S.n2;if(s)s.textContent=qaStatus(cur,slot);});
  if(cur){
    const both=!!(cur.a1&&cur.a2),allowed=!cur.special||specialReady();
    $('qaActive').innerHTML=`<div class="qcard"><div class="hint">${cur.special?'🌙':'💌'} ${esc(cur.category||'우리의 이야기')}</div>${allowed?`<div class="q">${esc(cur.question)}</div><div class="qans">${qaAnswerBox(cur,1)}${qaAnswerBox(cur,2)}</div>${both?`<div class="consent-board"><div class="consent-title">🤝 답변을 함께 공개할까요?</div><div class="consent-grid">${[1,2].map(s=>`<div class="consent-status ${qaConsent(cur,s)?'ok':''}">${qaConsent(cur,s)?'✓':'○'} ${esc(s===1?S.n1:S.n2)} ${qaConsent(cur,s)?'동의':'대기'}</div>`).join('')}</div><button type="button" class="btn sm consent-action" onclick="toggleQAConsent('${cur.id}',${who})">${qaConsent(cur,who)?'내 동의 취소':'내 답변 공개에 동의하기'}</button><p class="qa-privacy">둘 다 동의하면 바로 열려요. 다음 질문은 72시간 간격을 지켜요.</p></div>`:'<p class="qa-privacy">제출한 답변은 둘 다 공개에 동의할 때까지 잠겨요.</p>'}`:'<p class="q">특별 질문을 잠시 덮어두었어요.</p><p class="couple-fine">두 사람의 성인 확인과 동의가 있으면 다시 볼 수 있어요.</p>'}<button class="qa-skip" type="button" onclick="skipCoupleQA('${cur.id}')">이 질문 무료로 건너뛰기</button></div>`;
  }else $('qaActive').innerHTML='<div class="qa-rest"><span>☕</span><p>서로의 답을 천천히 음미해요.<br>새로운 대화는 72시간마다 찾아와요.</p></div>';
  const history=qaAllRecords().filter(q=>q.revealed||q.skipped).slice(0,20);
  $('qaHist').innerHTML=history.map(q=>`<div class="qhistitem">${q.skipped?'<b>🍃 편안하게 건너뛴 질문</b><small>답변을 공개하지 않았어요.</small>':q.special&&!specialReady()?'<b>🌙 특별 질문 기록</b><small>두 사람의 특별 질문 동의 후 볼 수 있어요.</small>':`<b>${esc(q.question)}</b><span class="hist-answer"><small>${esc(S.n1)}</small><span>${esc(q.a1)}</span></span><span class="hist-answer"><small>${esc(S.n2)}</small><span>${esc(q.a2)}</span></span>`}</div>`).join('')||'<div class="mut">함께 열어본 답변을 여기 모아둘게요.</div>';
  renderQAExtras();
  if(focusId&&$(focusId)){$(focusId).focus({preventScroll:true});$(focusId).setSelectionRange(...selection);}
};
function renderQAExtras(){
  const all=qaAllRecords(),cur=activeQA(),now=coupleNow(),remaining=all.length?Math.max(0,qaNextAt(all)-now):0,blocked=!!cur||remaining>0||qaStarting;
  const btn=$('qaNewBtn');if(btn){btn.disabled=blocked;btn.textContent=qaStarting?'질문을 가져오는 중…':cur?'진행 중인 질문이 있어요':remaining?'다음 질문까지 '+coupleDuration(remaining):'🎲 일상 질문 뽑기 · 무료';}
  const host=$('qaExtras');if(!host)return;const c=LV.specialConsent?.[who]||{},ready=specialReady();
  const oldDetails=host.querySelector('details'),expanded=oldDetails?.open;
  host.innerHTML=`<div class="qa-rhythm"><span>🗓️ 둘이 하나, 3일에 한 질문</span><small>${remaining?'다음 질문까지 '+coupleDuration(remaining):'새 질문을 만날 수 있어요'} · 공개하거나 건너뛰어도 뽑은 시각부터 72시간</small></div><details class="qa-special" ${expanded?'open':''}><summary><span>🌙 조금 더 가까이</span><small>선택하는 특별 질문</small></summary><p>애정 표현, 편안한 거리, 포옹과 가벼운 입맞춤에 관한 다정한 대화예요. 이전 연애·가족·수입·계좌 정보는 묻지 않아요.</p><div class="special-consent"><strong>${esc(who===1?S.n1:S.n2)}의 선택</strong><label><input type="checkbox" ${c.adult?'checked':''} onchange="setSpecialConsent('adult',this.checked)"> 나는 성인이에요</label><label><input type="checkbox" ${c.optIn?'checked':''} ${c.adult?'':'disabled'} onchange="setSpecialConsent('optIn',this.checked)"> 이 주제의 질문을 함께 받아보고 싶어요</label><small>${[1,2].map(s=>esc(s===1?S.n1:S.n2)+': '+(LV.specialConsent?.[s]?.adult&&LV.specialConsent?.[s]?.optIn?'동의 완료':'선택 대기')).join(' · ')}</small></div><div class="special-prices"><button class="btn sm" type="button" ${blocked||!ready||LV.hearts<12?'disabled':''} onclick="startQA('hearts')">12💗로 질문 뽑기</button><button class="btn ghost sm" type="button" ${blocked||!ready||produceCount()<4?'disabled':''} onclick="startQA('produce')">수확물 4개로 질문 뽑기</button></div><small class="couple-fine">수확물 ${produceCount()}개 보유 · 구매 즉시 차감돼요. 건너뛰기는 무료이며 사용한 재화는 돌아오지 않아요. 일상·특별 질문을 합쳐 72시간에 하나만 뽑아요.</small></details>`;
}

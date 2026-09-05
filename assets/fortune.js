/* Entertainment content. Calendar facts and editorial game scores are separate. */
const FORTUNE_KEY='azit-fortune-v1';
let FT={profiles:{},daily:{}};
let fortuneTab='compat',fortuneWho=1;
const STEMS='甲乙丙丁戊己庚辛壬癸',BRANCHES='子丑寅卯辰巳午未申酉戌亥';
const STEMS_KO='갑을병정무기경신임계',BRANCHES_KO='자축인묘진사오미신유술해';
const ELEMENTS=['목','화','토','금','수'];
const ELEMENT_WORDS=['함께 자라는 마음','따뜻한 표현','편안한 신뢰','분명한 약속','깊이 듣는 대화'];
const BRANCH_ELEMENTS=[4,2,0,0,2,1,1,2,3,3,2,4];
const ANIMALS=['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];
const STAR_SIGNS=[{n:'염소자리',e:'흙'},{n:'물병자리',e:'바람'},{n:'물고기자리',e:'물'},{n:'양자리',e:'불'},{n:'황소자리',e:'흙'},{n:'쌍둥이자리',e:'바람'},{n:'게자리',e:'물'},{n:'사자자리',e:'불'},{n:'처녀자리',e:'흙'},{n:'천칭자리',e:'바람'},{n:'전갈자리',e:'물'},{n:'사수자리',e:'불'}];
const TAROT=[
  ['바보','새로운 시작','익숙한 데이트 길을 살짝 벗어나 보세요. 함께하는 작은 모험이 대화의 시작이 돼요.','속도를 조금 늦추고 둘 다 편안한 선택인지 물어보세요.','별'],
  ['마법사','마음을 행동으로','생각만 했던 작은 배려를 행동으로 옮겨보세요. 구체적인 한마디가 마음에 오래 남아요.','잘해주려는 마음을 다 보여주려 애쓰지 않아도 돼요. 한 가지만 골라보세요.','별'],
  ['여사제','조용히 듣기','답을 서두르지 말고 상대가 말을 마칠 때까지 기다려 보세요. 조용한 관심도 다정한 표현이에요.','추측으로 마음을 읽기보다 지금 기분을 직접 물어보세요.','달'],
  ['여황제','넉넉한 다정함','함께 먹는 한 끼나 포근한 휴식처럼 일상의 감각을 챙겨보세요. 편안한 시간이 선물이 돼요.','돌봄이 한쪽에만 쏠렸다면 오늘은 서로 번갈아 챙겨주세요.','꽃'],
  ['황제','든든한 약속','지킬 수 있는 약속 하나를 정해 보세요. 예측할 수 있는 작은 행동이 신뢰를 쌓아줘요.','내 방식이 정답이라고 단정하기 전에 상대의 방법도 들어보세요.','산'],
  ['교황','우리만의 의식','둘이 좋아하는 일요일 루틴처럼 작은 전통을 만들어 보세요. 반복되는 다정함을 발견하는 날이에요.','남들의 연애 기준보다 우리 둘이 편한 방식을 이야기해 보세요.','별'],
  ['연인','서로를 선택하기','오늘 함께 고르고 싶은 일을 하나 정해 보세요. 마음이 닮은 지점과 다른 지점을 모두 들어보세요.','선택이 다르다면 상대를 설득하기보다 이유를 한 가지씩 나눠보세요.','하트'],
  ['전차','같은 방향','함께 끝낼 수 있는 작은 목표를 잡아보세요. 역할을 나누면 평범한 하루도 팀플레이가 돼요.','앞서가는 사람은 잠깐 멈추고 서로의 속도를 맞춰보세요.','산'],
  ['힘','부드러운 용기','고마웠던 순간이나 서운했던 일을 부드럽게 꺼내보세요. 솔직함과 다정함을 함께 연습해요.','참기만 하는 것이 배려는 아니에요. 내 마음도 차분히 설명해 보세요.','꽃'],
  ['은둔자','혼자만의 여백','각자 쉬는 시간을 가진 뒤 발견한 생각 하나를 나눠보세요. 여백이 대화를 풍성하게 해줘요.','잠깐의 침묵을 마음이 멀어졌다는 뜻으로 해석하지 말아요.','등'],
  ['운명의 수레바퀴','리듬의 변화','계획이 달라지면 가능한 선택을 함께 골라보세요. 뜻밖의 여백을 작은 즐거움으로 채워봐요.','바꿀 수 없는 일정은 내려놓고 지금 할 수 있는 배려를 찾아보세요.','별'],
  ['정의','공평한 대화','오늘의 선택권을 한 번씩 나눠 가져보세요. 사소한 결정에서도 서로 존중받는 느낌을 만들어요.','누가 더 많이 했는지 세기보다 앞으로 어떻게 나눌지 정해보세요.','별'],
  ['매달린 사람','다르게 바라보기','상대의 입장에서 같은 하루를 상상해 보세요. 당연하게 여긴 배려가 새롭게 보일 수 있어요.','결정을 미루고 있다면 필요한 정보가 무엇인지 먼저 적어보세요.','달'],
  ['죽음','비우고 새로 시작','둘에게 불편했던 작은 습관 하나를 바꿔보세요. 이 카드는 실제 죽음이 아닌 마무리와 전환의 상징이에요.','한꺼번에 바꾸려 하지 말고 부담 없는 한 단계부터 시작해요.','꽃'],
  ['절제','편안한 균형','각자 원하는 것에서 한 가지씩 골라 오늘의 계획을 섞어보세요. 적당한 중간 지점을 찾아봐요.','일정이 빽빽하다면 빈 시간을 하나 넣어 두 사람의 호흡을 맞춰요.','물'],
  ['악마','습관 알아차리기','무심코 휴대폰을 보는 습관처럼 대화를 끊는 요소를 잠시 내려놓아 보세요.','억지로 맞춰주고 있었다면 편안한 선을 말로 정해보세요.','달'],
  ['탑','생각을 다시 세우기','당연하다고 생각했던 약속의 의미를 확인해 보세요. 이 카드는 사고 예고가 아닌 관점 변화의 상징이에요.','지금 당장 결론을 내리기보다 감정이 잦아든 뒤 다시 대화해요.','산'],
  ['별','작은 희망','앞으로 같이 하고 싶은 일 하나를 나눠보세요. 당장 이루지 않아도 기대를 함께 품을 수 있어요.','남들과 비교하기보다 우리가 이미 잘하고 있는 점을 하나 찾아요.','별'],
  ['달','마음 확인하기','확신이 서지 않는 감정에는 이름을 붙여보세요. 짐작보다 짧은 질문이 오해를 줄여줘요.','머릿속 이야기를 사실로 단정하지 말고 상대에게 확인해 보세요.','달'],
  ['태양','함께 웃기','웃겼던 사진이나 기억을 하나 공유해 보세요. 밝고 사소한 순간을 함께 즐기는 카드예요.','즐거워야 한다는 부담은 내려놓고 편안한 방식으로 시간을 보내요.','해'],
  ['심판','새롭게 이해하기','예전에 고마웠던 일을 지금의 말로 다시 전해보세요. 서로 달라진 점을 알아보는 시간을 가져요.','지난 실수를 다시 따지기보다 앞으로 바라는 행동을 말해보세요.','별'],
  ['세계','우리의 작은 완성','둘이 해낸 일을 하나 떠올리며 축하해 주세요. 크지 않은 성취도 함께라면 추억이 돼요.','완벽한 결말을 기다리지 말고 지금까지 온 길을 먼저 인정해 주세요.','꽃']
];
const DAILY_MESSAGES=[
  ['마음을 한 칸 가까이','상대가 오늘 가장 기대하는 일을 물어보세요. 답을 기억해 두었다가 저녁에 다시 꺼내면 좋은 대화가 돼요.','오늘의 기대 한 가지 나누기'],
  ['천천히 맞추는 보폭','서로의 하루 속도가 다를 수 있어요. 연락할 수 있는 시간을 미리 알려주면 기다림이 한결 편안해져요.','편한 연락 시간 알려주기'],
  ['평범한 날의 작은 발견','자주 지나던 길에서 좋아하는 장면을 하나 찾아 보내보세요. 서로의 시선을 빌려보는 하루로 만들어봐요.','오늘 본 예쁜 것 한 장'],
  ['고마움을 구체적으로','늘 고마워 대신 어떤 행동이 좋았는지 말해보세요. 작은 배려를 알아봐 주는 말이 힘이 돼요.','고마웠던 행동 하나 말하기'],
  ['함께 쉬어가는 페이지','말이 많이 필요하지 않은 날도 있어요. 나란히 음악을 듣거나 따뜻한 차 한 잔을 나눠보세요.','10분 동안 함께 쉬기'],
  ['새로운 취향을 발견해요','각자 아직 안 먹어본 간식이나 듣고 싶은 노래를 골라보세요. 작은 새로움으로 취향 지도를 넓혀봐요.','서로 고른 노래 바꿔 듣기'],
  ['약속 하나의 힘','막연한 다음에 대신 편한 날짜를 하나 골라보세요. 지킬 수 있는 작은 약속이 기대를 만들어 줘요.','다음 데이트 날짜 정하기'],
  ['대답보다 공감부터','고민을 듣게 되면 조언이 필요한지, 그냥 들어주면 되는지 먼저 물어보세요. 필요한 배려가 달라질 수 있어요.','지금 어떻게 도와주면 좋을까?'],
  ['둘만 아는 웃음','예전 대화나 사진에서 웃겼던 순간을 하나 찾아보세요. 같은 장면을 다르게 기억하는 재미도 있어요.','우리만 아는 추억 꺼내기'],
  ['서로에게 여백 주기','각자 하고 싶은 일에 집중할 시간을 응원해 주세요. 나중에 만나 오늘의 발견을 나누면 더 반가워요.','각자의 시간을 응원하기'],
  ['먼저 건네는 다정함','먼저 안부를 묻거나 좋아하는 간식을 챙겨보세요. 반응을 기대하기보다 표현 자체를 즐겨봐요.','작은 배려 먼저 하기'],
  ['마음의 온도 확인','좋아 보인다는 짐작 대신 오늘 기분을 한 단어로 물어보세요. 서로 다른 온도를 알아차리는 데서 시작해요.','오늘의 기분 한 단어']
];
function koreaDay(d=new Date()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);}
function fortuneNormalize(raw){return{profiles:raw&&raw.profiles&&typeof raw.profiles==='object'?raw.profiles:{},daily:raw&&raw.daily&&typeof raw.daily==='object'?raw.daily:{}};}
function bootFortune(){
  try{FT=fortuneNormalize(JSON.parse(localStorage.getItem(FORTUNE_KEY)||'{}'));}catch{FT=fortuneNormalize(null);}
  renderFortune();
}
function saveFortuneLocal(next){localStorage.setItem(FORTUNE_KEY,JSON.stringify(next));FT=next;renderFortune();}
async function restoreFortune(value){saveFortuneLocal(fortuneNormalize(value));}
window.addEventListener('storage',event=>{if(event.key===FORTUNE_KEY)bootFortune();});
function goFortune(){go(7,document.querySelectorAll('nav button')[7]);renderFortune();}
function switchFortune(tab){if(!['compat','daily','tarot'].includes(tab))return;fortuneTab=tab;renderFortune();}
function fortunePerson(w){fortuneWho=w===2?2:1;renderFortune();}
function profileName(w){return w===1?S.n1:S.n2;}
function normalizePillar(value){
  const s=(value||'').trim().replace(/\s/g,'');
  if(s.length!==2)return'';
  const a=STEMS.indexOf(s[0])>=0?STEMS.indexOf(s[0]):STEMS_KO.indexOf(s[0]);
  const b=BRANCHES.indexOf(s[1])>=0?BRANCHES.indexOf(s[1]):BRANCHES_KO.indexOf(s[1]);
  if(a<0||b<0||a%2!==b%2)return'';
  return STEMS[a]+BRANCHES[b];
}
function birthFacts(p){
  if(!p||!/^\d{4}-\d{2}-\d{2}$/.test(p.birth||'')||typeof KoreanLunarCalendar==='undefined')return null;
  const [y,m,d]=p.birth.split('-').map(Number),cal=new KoreanLunarCalendar();
  const valid=p.calendar==='lunar'?cal.setLunarDate(y,m,d,!!p.leap):cal.setSolarDate(y,m,d);
  if(!valid)return null;
  const solar=cal.getSolarCalendar(),lunar=cal.getLunarCalendar();
  // Reject an impossible leap month even when importing data from an older converter.
  if(p.calendar==='lunar'&&(lunar.year!==y||lunar.month!==m||lunar.day!==d||!!lunar.intercalation!==!!p.leap))return null;
  const solarDate=solar.year+'-'+pad(solar.month)+'-'+pad(solar.day);
  if(solarDate>koreaDay()||solar.year<1900)return null;
  const cuts=[20,19,21,20,21,22,23,23,23,23,22,22];
  const starIndex=(solar.month-1+(solar.day>=cuts[solar.month-1]?1:0))%12;
  const animal=((lunar.year-4)%12+12)%12;
  return{solar,lunar,solarDate,animal,star:STAR_SIGNS[starIndex],starIndex};
}
function hasSaju(p){return !!(p&&p.pillars&&['year','month','day'].every(k=>normalizePillar(p.pillars[k])));}
function sajuElements(p){const counts=[0,0,0,0,0];if(!hasSaju(p))return counts;Object.values(p.pillars).forEach(v=>{const q=normalizePillar(v);if(!q)return;counts[Math.floor(STEMS.indexOf(q[0])/2)]++;counts[BRANCH_ELEMENTS[BRANCHES.indexOf(q[1])]]++;});return counts;}

function profileEditor(w){
  const p=FT.profiles[w]||{},q=p.pillars||{};
  const options=(values,current,empty='선택 안 함')=>`<option value="">${empty}</option>`+values.map(v=>`<option value="${v}" ${v===current?'selected':''}>${v}</option>`).join('');
  const mbti=['ISTJ','ISFJ','INFJ','INTJ','ISTP','ISFP','INFP','INTP','ESTP','ESFP','ENFP','ENTP','ESTJ','ESFJ','ENFJ','ENTJ'];
  openAzitDialog(profileName(w)+'의 운세 프로필',`<form id="fortuneForm" onsubmit="event.preventDefault();saveFortuneProfile(${w})" novalidate>
    <p class="dialog-note">아는 정보부터 입력해 주세요. ${typeof fortuneLink!=='undefined'&&fortuneLink?'연결된 두 기기에 암호화해 공유해요.':'지금은 이 기기에만 저장해요.'} 상대 정보는 동의를 받고 입력해 주세요.</p>
    <div class="form-grid"><div><label for="fpCalendar">생일 기준</label><select id="fpCalendar" onchange="updateBirthInput()"><option value="solar" ${p.calendar!=='lunar'?'selected':''}>양력</option><option value="lunar" ${p.calendar==='lunar'?'selected':''}>음력</option></select></div>
    <div><label for="fpBirth">생년월일</label><input id="fpBirth" type="text" inputmode="numeric" placeholder="1995-06-15" maxlength="10" value="${esc(p.birth||'')}" aria-describedby="fpBirthHelp"></div>
    <div class="wide"><label class="chk"><input type="checkbox" id="fpLeap" ${p.leap?'checked':''} ${p.calendar==='lunar'?'':'disabled'}> 음력 윤달</label><p id="fpBirthHelp" class="dialog-note">1900년부터 입력 가능 · YYYY-MM-DD<br>음력 날짜와 윤달을 확인해 양력으로 변환해요.</p></div>
    <div><label for="fpTime">태어난 시각</label><input id="fpTime" type="time" value="${esc(p.time||'')}" ${p.unknownTime!==false?'disabled':''}></div>
    <div><label for="fpGender">성별</label><select id="fpGender">${options(['여성','남성','직접 분류하지 않음'],p.gender,'선택 안 함')}</select></div>
    <div class="wide"><label class="chk"><input type="checkbox" id="fpUnknown" ${p.unknownTime!==false?'checked':''} onchange="document.getElementById('fpTime').disabled=this.checked;document.getElementById('fpHour').disabled=this.checked"> 태어난 시각을 몰라요</label></div>
    <div><label for="fpMbti">MBTI</label><select id="fpMbti">${options(mbti,p.mbti)}</select></div><div><label for="fpBlood">혈액형</label><select id="fpBlood">${options(['A','B','O','AB'],p.blood)}</select></div></div>
    <details ${hasSaju(p)?'open':''}><summary style="margin-top:16px;min-height:44px;padding-top:10px;cursor:pointer">사주 · 만세력에서 확인한 사주팔자</summary>
      <p class="dialog-note">사용하시는 만세력의 연주·월주·일주·시주를 그대로 입력해 주세요. 예: 갑자 또는 甲子. 절기·출생지·야자시 기준이 달라질 수 있어 생년월일만으로 사주를 추정하지 않아요.</p>
      <div class="pillar-fields">${[['year','연주'],['month','월주'],['day','일주'],['hour','시주']].map(([k,n])=>`<div><label for="fp${k==='hour'?'Hour':k}">${n}</label><input id="fp${k==='hour'?'Hour':k}" maxlength="2" placeholder="${k==='hour'?'선택':'갑자'}" value="${esc(q[k]||'')}" ${k==='hour'&&p.unknownTime!==false?'disabled':''}></div>`).join('')}</div>
      <p class="dialog-note">연·월·일주를 모두 넣으면 사주 궁합이 열려요. 모르는 시주는 제외해요. 성별·시각은 기록용이며 대운·용신·진태양시를 자동 계산하지 않아요.</p>
    </details><div id="fortuneFormError" class="form-error" role="alert"></div><button class="btn form-submit">프로필 저장</button>${FT.profiles[w]?`<button type="button" class="btn ghost form-submit" onclick="deleteFortuneProfile(${w})">이 프로필 지우기</button>`:''}</form>`);
}
function updateBirthInput(){const lunar=$('fpCalendar').value==='lunar';$('fpLeap').disabled=!lunar;if(!lunar)$('fpLeap').checked=false;}
async function saveFortuneProfile(w){
  const p={birth:$('fpBirth').value.trim(),calendar:$('fpCalendar').value,leap:$('fpCalendar').value==='lunar'&&$('fpLeap').checked,time:$('fpUnknown').checked?'':$('fpTime').value,unknownTime:$('fpUnknown').checked,gender:$('fpGender').value,mbti:$('fpMbti').value,blood:$('fpBlood').value,pillars:{}};
  const fail=(message,id)=>{$('fortuneFormError').textContent=message;if(id)$(id).focus();};
  if(p.birth&&!birthFacts(p))return fail('생년월일을 확인해 주세요. YYYY-MM-DD 형식의 실제 날짜와 올바른 윤달만 입력할 수 있어요. 미래의 생일은 입력할 수 없어요.','fpBirth');
  if(!p.unknownTime&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(p.time))return fail('태어난 시각을 입력하거나 ‘몰라요’를 선택해 주세요.','fpTime');
  for(const k of ['year','month','day','hour']){
    const id='fp'+(k==='hour'?'Hour':k),raw=k==='hour'&&p.unknownTime?'':$(id).value.trim();
    if(raw&&!normalizePillar(raw))return fail('사주 기둥은 갑자·乙丑처럼 유효한 간지 두 글자로 입력해 주세요.',id);
    if(raw)p.pillars[k]=normalizePillar(raw);
  }
  if(Object.keys(p.pillars).length&&!hasSaju(p))return fail('사주 해석에는 연주·월주·일주가 모두 필요해요. 아직 모르면 네 칸을 비워 두세요.','fpyear');
  if(!p.birth&&!p.mbti&&!p.blood&&!hasSaju(p))return fail('생일, MBTI, 혈액형 또는 만세력 중 한 가지 이상 입력해 주세요.','fpBirth');
  const button=document.querySelector('#fortuneForm .form-submit');
  try{if(button)button.disabled=true;if(typeof persistFortuneProfile==='function')await persistFortuneProfile(w,p);else{const next=JSON.parse(JSON.stringify(FT));next.profiles[w]=p;saveFortuneLocal(next);}$('azitDialog').close();toast(typeof fortuneLink!=='undefined'&&fortuneLink?'운세 프로필을 둘이 공유했어요 🔐':'운세 프로필을 이 기기에 저장했어요');}catch{if(button)button.disabled=false;fail('저장하지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.');}
}
function deleteFortuneProfile(w){
  openAzitDialog('프로필을 지울까요?',`<p class="dialog-note">${esc(profileName(w))}의 생일·성향·만세력 정보를 ${typeof fortuneLink!=='undefined'&&fortuneLink?'연결된 두 기기에서':'이 기기에서'} 지워요. 오늘 뽑은 타로는 다시 뽑을 수 없도록 그대로 남아요.</p><button class="btn form-submit" onclick="confirmDeleteFortuneProfile(${w},this)">프로필 지우기</button>`);
}
async function confirmDeleteFortuneProfile(w,button){try{if(button)button.disabled=true;if(typeof persistFortuneProfileDelete==='function')await persistFortuneProfileDelete(w);else{const next=JSON.parse(JSON.stringify(FT));delete next.profiles[w];saveFortuneLocal(next);}$('azitDialog').close();toast('프로필을 지웠어요');}catch{if(button)button.disabled=false;toast('지우지 못했어요. 연결을 확인해 주세요');}}

function compatResults(){
  const a=FT.profiles[1]||{},b=FT.profiles[2]||{},fa=birthFacts(a),fb=birthFacts(b),out=[];
  const put=(id,name,score,summary,detail,basis)=>out.push({id,name,score,summary,detail,basis});
  if(/^[EI][SN][TF][JP]$/.test(a.mbti||'')&&/^[EI][SN][TF][JP]$/.test(b.mbti||'')){
    const matches=[0,1,2,3].map(i=>a.mbti[i]===b.mbti[i]),count=matches.filter(Boolean).length;
    const details=[matches[0]?'에너지를 충전하는 선호가 같아요.':'혼자 쉬는 시간과 함께 움직이는 시간을 조율해 보세요.',matches[1]?'정보를 받아들이는 선호가 같아요.':'구체적인 예시와 전체적인 생각을 함께 나눠보세요.',matches[2]?'판단할 때 먼저 보는 기준이 같아요.':'해결책과 공감 중 무엇이 필요한지 먼저 물어보세요.',matches[3]?'일정을 다루는 선호가 같아요.':'계획할 부분과 즉흥적으로 즐길 부분을 나눠보세요.'];
    put('mbti','MBTI',72+count*5,'네 가지 선호 중 '+count+'가지가 같아요.',details.join(' '),'같은 선호마다 +5 · 기본 72. 관계 성공률이나 공식 MBTI 궁합 검사가 아니에요.');
  }else put('mbti','MBTI',null,'두 사람의 MBTI를 입력해 주세요.','','입력한 4가지 선호 비교');
  if(['A','B','O','AB'].includes(a.blood)&&['A','B','O','AB'].includes(b.blood)){
    const key=[a.blood,b.blood].sort().join('/'),n=hashStr('blood:'+key);
    const missions=['오늘 먼저 고마움을 표현할 사람을 정해보세요.','데이트 메뉴를 한 가지씩 골라 함께 나눠보세요.','서로 듣고 싶은 칭찬을 한 가지씩 말해보세요.','함께 쉬고 싶은 장소를 하나씩 골라보세요.'];
    put('blood','혈액형',75+n%20,'오늘의 조합: '+a.blood+'형 × '+b.blood+'형',missions[n%missions.length],'혈액형 조합에 배정한 놀이 점수예요. 혈액형으로 성격이나 실제 궁합을 판단하지 않아요.');
  }else put('blood','혈액형',null,'두 사람의 혈액형을 입력해 주세요.','','성격 진단 없이 즐기는 조합 카드');
  if(hasSaju(a)&&hasSaju(b)){
    const ea=Math.floor(STEMS.indexOf(normalizePillar(a.pillars.day)[0])/2),eb=Math.floor(STEMS.indexOf(normalizePillar(b.pillars.day)[0])/2),distance=(ea-eb+5)%5;
    const relationKey=distance===0?'same':distance===1||distance===4?'supporting':'balancing',relation=relationKey==='same'?'같은 오행':relationKey==='supporting'?'상생 관계':'조절 관계';
    const ca=sajuElements(a),cb=sajuElements(b),shared=ca.filter((v,i)=>v&&cb[i]).length;
    const score=(distance===0?80:distance===1||distance===4?86:72)+shared;
    const counts=p=>sajuElements(p).map((v,i)=>ELEMENTS[i]+v).join(' · ');
    const editorial=(window.fortuneEditorial&&window.fortuneEditorial.sajuRelations&&window.fortuneEditorial.sajuRelations[relationKey])||{};
    const relationCopy=[editorial.summary,editorial.detail,editorial.mission&&'오늘의 대화 · '+editorial.mission].filter(Boolean).join(' ');
    put('saju','사주 궁합',score,ELEMENTS[ea]+' × '+ELEMENTS[eb]+' · '+relation,relationCopy+' '+profileName(1)+': '+counts(a)+' / '+profileName(2)+': '+counts(b),'직접 입력한 일간의 오행 관계 + 공통 오행 수. 겉글자만 집계하며 지장간·용신·대운·합충 전체를 풀이한 정밀 감정은 아니에요.');
  }else put('saju','사주 궁합',null,'만세력의 연·월·일주를 입력하면 열려요.','','입력한 사주팔자의 일간과 오행');
  if(fa&&fb){
    const delta=(fa.animal-fb.animal+12)%12,score=delta===0?85:delta===4||delta===8?92:delta===6?73:82;
    put('zodiac','띠 궁합',score,ANIMALS[fa.animal]+'띠 × '+ANIMALS[fb.animal]+'띠',delta===4||delta===8?'전통적인 삼합 그룹에 속해요. 함께 목표를 정하는 대화를 오늘의 미션으로 삼아보세요.':delta===6?'전통적으로 충이라 부르는 조합이에요. 관계를 단정하는 뜻은 아니며 서로 다른 생활 리듬을 이야기하는 소재로만 즐겨요.':'같거나 다른 동물의 상징을 빌려 서로의 매력을 이야기해 보세요. 닮고 싶은 장점 하나씩을 골라봐요.','한국 음력 설 기준 출생연도. 같은 띠 85·삼합 92·충 73·그 외 82의 자체 놀이 점수. 사주 연주의 입춘 기준과 구분해요.');
    const same=fa.star.e===fb.star.e,compatible=[fa.star.e,fb.star.e].sort().join('/')==='바람/불'||[fa.star.e,fb.star.e].sort().join('/')==='물/흙';
    put('star','별자리',same?90:compatible?87:78,fa.star.n+' × '+fb.star.n,(same?'같은 '+fa.star.e+' 원소의 상징을 공유해요.':fa.star.e+'와 '+fb.star.e+' 원소의 서로 다른 매력을 발견해 봐요.')+' 오늘 각자 가장 편한 데이트 분위기를 말해보세요.','양력 월일의 대중적인 12별자리 구간. 같은 원소 90·불/바람 및 흙/물 87·그 외 78. 경계일의 정확한 태양 위치를 계산한 점성 차트는 아니에요.');
  }else{put('zodiac','띠 궁합',null,'두 사람의 생일을 입력하면 열려요.','','한국 음력 설 기준');put('star','별자리',null,'두 사람의 생일을 입력하면 열려요.','','양력 월일 기준');}
  const da=todayFortune(1).tarot,dbb=todayFortune(2).tarot;
  if(validDraw(da)&&validDraw(dbb)){
    const seed=[da.card,dbb.card].sort((x,y)=>x-y).join(':');
    put('tarot','오늘의 타로',76+hashStr(seed)%21,TAROT[da.card][0]+' × '+TAROT[dbb.card][0],TAROT[da.card][1]+'과 '+TAROT[dbb.card][1]+'을 오늘의 대화 주제로 삼아보세요. 각자 카드에서 와닿았던 말을 한 가지씩 나눠요.','두 사람이 오늘 뽑은 카드 조합에 배정한 놀이 점수예요. 정·역방향은 카드 조언에 반영해요.');
  }else put('tarot','오늘의 타로',null,'각자 오늘의 카드를 뽑으면 열려요.','','하루 한 장 · 한국 시간 자정 갱신');
  return out;
}
function validDraw(d){return !!(d&&Number.isInteger(d.card)&&d.card>=0&&d.card<TAROT.length);}
function todayFortune(w){return(FT.daily[koreaDay()]||{})[w]||{};}
async function persistDaily(w,key,value){
  if(typeof persistFortuneDaily==='function')return persistFortuneDaily(w,key,value);
  // Re-read before a draw, so two tabs on the same device keep the first saved card.
  let latest;try{latest=fortuneNormalize(JSON.parse(localStorage.getItem(FORTUNE_KEY)||'{}'));}catch{latest=FT;}
  const day=koreaDay(),next=JSON.parse(JSON.stringify(latest));next.daily[day]=next.daily[day]||{};next.daily[day][w]=next.daily[day][w]||{};
  if(!next.daily[day][w][key])next.daily[day][w][key]=value;
  Object.keys(next.daily).sort().slice(0,-30).forEach(k=>delete next.daily[k]);
  saveFortuneLocal(next);
}
async function openDaily(kind){if(!['zodiac','star'].includes(kind)||!birthFacts(FT.profiles[fortuneWho]))return;try{await persistDaily(fortuneWho,kind,true);}catch{toast('오늘의 운세를 저장하지 못했어요. 연결을 확인해 주세요');}}
async function drawTarot(slot){
  if(![0,1,2].includes(slot))return;
  const existing=todayFortune(fortuneWho).tarot;if(validDraw(existing)){renderFortune();return;}
  const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);
  const n=bytes[0];
  try{await persistDaily(fortuneWho,'tarot',{card:(n+slot*7)%TAROT.length,reversed:!!(n&128),at:Date.now()});}catch{toast('카드를 저장하지 못했어요. 연결을 확인해 주세요');}
}
function tarotArt(card){
  const motif=TAROT[card][4];
  const shapes={해:'<circle cx="50" cy="52" r="19" fill="#f2cb86"/><path d="M50 22V14M50 82V90M20 52H12M80 52H88M29 31 23 25M71 31 77 25" stroke="#e7bb7b" stroke-width="3"/>',달:'<path d="M62 27A27 27 0 1 0 65 76A23 23 0 0 1 62 27" fill="#e9d5ae"/>',하트:'<path d="M50 80Q10 52 28 36Q41 27 50 40Q60 26 73 37Q88 54 50 80" fill="#dca2b1"/>',꽃:'<path d="M50 99V58M50 81Q27 58 30 79M50 87Q77 61 70 84" stroke="#9bad96" stroke-width="3" fill="none"/><g fill="#d5a6be"><ellipse cx="50" cy="40" rx="9" ry="15"/><ellipse cx="36" cy="54" rx="15" ry="9"/><ellipse cx="64" cy="54" rx="15" ry="9"/><ellipse cx="50" cy="68" rx="9" ry="15"/></g><circle cx="50" cy="54" r="9" fill="#eccf96"/>',산:'<path d="M9 91 39 30 62 68 76 47 96 91Z" fill="#a7a7bc"/><path d="M28 52 39 30 49 49 39 44Z" fill="#eadbcb"/><circle cx="73" cy="25" r="9" fill="#e9c68f"/>',등:'<path d="M50 22V30M39 35Q50 15 61 35" stroke="#e2ca9f" stroke-width="3" fill="none"/><path d="M31 38H69L65 85H35Z" fill="#e0bd8633" stroke="#e4c795" stroke-width="3"/><path d="M50 48 44 65H55Z" fill="#f6ddb0"/>',물:'<path d="M50 25Q15 66 35 80Q50 92 67 78Q82 64 50 25" fill="#a8c7d4"/><path d="M35 62Q28 72 42 77" stroke="#e8e0cf" stroke-width="2" fill="none"/>',별:'<path d="M50 22 57 44 80 50 58 59 50 82 42 60 19 51 42 43Z" fill="#e8c78f"/><circle cx="50" cy="51" r="7" fill="#f7e7b5"/>'};
  return `<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="150" fill="#514166"/><rect x="5" y="5" width="90" height="140" rx="5" fill="none" stroke="#c5ad8a" stroke-width=".6"/><text x="50" y="18" text-anchor="middle" font-size="8" fill="#decba4">${String(card).padStart(2,'0')}</text><g transform="translate(0 12)">${shapes[motif]}</g><path d="M17 120H83" stroke="#af94ad" stroke-width=".8"/><text x="50" y="133" text-anchor="middle" font-size="9" fill="#f3e2c4" font-family="Jua">${TAROT[card][0]}</text><circle cx="18" cy="34" r="1.3" fill="#e5cca4"/><circle cx="83" cy="104" r="1.3" fill="#e5cca4"/></svg>`;
}
function fortunePersonSwitch(){return `<div class="fortune-person-switch" role="group" aria-label="운세를 볼 사람">${[1,2].map(w=>`<button class="${fortuneWho===w?'on':''}" aria-pressed="${fortuneWho===w}" onclick="fortunePerson(${w})">${esc(profileName(w))}</button>`).join('')}</div>`;}
function compatHtml(){
  const results=compatResults(),scored=results.filter(r=>r.score!==null),average=scored.length?Math.round(scored.reduce((a,b)=>a+b.score,0)/scored.length):null;
  return `<section class="fortune-panel"><div class="compat-overview"><div class="score-orb"><b>${average??'—'}</b><small>우리의 케미</small></div><div><div class="kicker">OUR LITTLE CHEMISTRY</div><h3>${scored.length?'다른 매력, 함께하는 우리':'우리 이야기를 채워볼까요?'}</h3><p>${scored.length?'열린 '+scored.length+'개 테마 점수의 평균이에요.':'위에서 각자의 프로필을 입력해 주세요.'}<br>점수보다 서로를 알아가는 대화를 즐겨요.</p></div></div></section>
    <div class="compat-grid">${results.map(r=>`<article class="compat-tile"><div class="tile-top"><span>${r.name}</span><b>${r.score===null?'미입력':r.score+'점'}</b></div><div class="score-track"><i style="width:${r.score??0}%"></i></div><p>${esc(r.summary)}</p>${r.detail?`<details><summary>해석과 점수 기준</summary><p>${esc(r.detail)}</p><div class="source">${esc(r.basis)}</div></details>`:`<button class="btn ghost sm" style="margin-top:9px" onclick="${r.id==='tarot'?"switchFortune('tarot')":'profileEditor(1)'}">${r.id==='tarot'?'카드 뽑으러 가기':'프로필 입력'}</button>`}</article>`).join('')}</div>`;
}
function dailyReading(kind,facts){
  const token=kind==='zodiac'?ANIMALS[facts.animal]+'띠':facts.star.n;
  const messages=window.fortuneEditorial&&Array.isArray(window.fortuneEditorial.dailyMessages)?window.fortuneEditorial.dailyMessages:DAILY_MESSAGES;
  const seed=hashStr(koreaDay()+':'+kind+':'+token),message=messages[seed%messages.length];
  if(!todayFortune(fortuneWho)[kind])return `<button class="daily-seal" onclick="openDaily('${kind}')">${kind==='zodiac'?'✉':'✦'} ${token}의 오늘<span>봉투를 눌러 오늘의 한 페이지를 열어요</span></button>`;
  const scores=[72+seed%25,70+(seed>>>5)%28,74+(seed>>>10)%24];
  return `<section class="fortune-panel"><div class="kicker">${kind==='zodiac'?'ZODIAC LETTER':'STAR LETTER'} · ${esc(token)}</div><h3>${esc(message[0])}</h3><p>${esc(message[1])}</p><div class="daily-luck">${['애정','대화','활력'].map((n,i)=>`<span>${n}<b>${scores[i]}</b></span>`).join('')}</div><div class="lucky-line">오늘의 미션 · ${esc(message[2])}<br>행운의 색 · ${['크림','라벤더','민트','살구','하늘색','로즈'][seed%6]} &nbsp; 숫자 · ${seed%9+1}</div></section>`;
}
function dailyHtml(){
  const p=FT.profiles[fortuneWho],facts=birthFacts(p);
  if(!facts)return fortunePersonSwitch()+`<section class="fortune-panel"><h3>생일을 알려주세요</h3><p>한국 음력으로 띠를, 양력 월일로 별자리를 확인해요. 생일을 입력하면 두 개의 오늘 운세가 열려요.</p><button class="btn form-submit" onclick="profileEditor(${fortuneWho})">${esc(profileName(fortuneWho))}의 생일 입력</button></section>`;
  return fortunePersonSwitch()+`<section class="fortune-panel"><div class="kicker">TODAY'S LITTLE NEWSPAPER</div><h3>${esc(profileName(fortuneWho))}의 오늘</h3><p>${ANIMALS[facts.animal]}띠 · ${facts.star.n}<br>양력 ${facts.solarDate} / 음력 ${facts.lunar.year}.${facts.lunar.month}.${facts.lunar.day}${facts.lunar.intercalation?' (윤달)':''}</p></section>`+dailyReading('zodiac',facts)+dailyReading('star',facts)+`<p class="fortune-footnote">띠·별자리와 오늘 날짜로 고르는 아지트의 짧은 조언이에요. 애정·대화·활력 점수는 재미용이며 실제 사건을 예측하지 않아요.</p>`;
}
function tarotHtml(){
  const draw=todayFortune(fortuneWho).tarot;
  let h=fortunePersonSwitch()+`<section class="fortune-panel"><div class="kicker">ONE CARD, ONE LITTLE MOMENT</div><h3>오늘 마음에 닿는 한 장</h3><p>잠깐 숨을 고르고 카드를 골라보세요.<br>각자 하루 한 장 · 두 장이 모이면 타로 궁합도 열려요.</p>`;
  if(validDraw(draw)){
    const c=TAROT[draw.card];
    h+=`<div class="tarot-reveal" role="status"><div class="tarot-art">${tarotArt(draw.card)}</div><div><div class="tarot-keyword">${draw.reversed?'역방향 · 돌아보기':'정방향 · 실천하기'}</div><h4>${c[0]}</h4><div class="tarot-keyword">${c[1]}</div><p>${draw.reversed?c[3]:c[2]}</p></div></div><p style="margin-top:14px">오늘의 카드를 간직했어요. 다음 카드는 한국 시간 자정 이후에 만나요.</p>`;
  }else h+='<div class="tarot-deck">'+[0,1,2].map(i=>`<button class="tarot-back" onclick="drawTarot(${i})" aria-label="${i+1}번째 타로 카드 뽑기">✦<small>${['첫 느낌','끌리는 마음','작은 용기'][i]}</small></button>`).join('')+'</div>';
  h+='</section>';
  const r=compatResults().find(r=>r.id==='tarot');
  if(r.score!==null)h+=`<section class="fortune-panel"><div class="kicker">TODAY'S PAIR</div><h3>두 장이 만난 오늘 · ${r.score}점</h3><p>${esc(r.summary)}<br>${esc(r.detail)}</p></section>`;
  return h;
}
function renderFortune(){
  if(!$('fortuneView'))return;
  $('fortuneView').innerHTML=`<div class="fortune-hero"><div class="eyebrow">AZIT DAILY CLUB</div><h2>오늘도, 우리답게</h2><p>별빛 한 스푼, 다정함 한 스푼.<br>매일 펼쳐보는 둘만의 작은 운세 신문.</p><span class="fortune-date">${koreaDay().replaceAll('-','.')} · 매일 자정에 새 이야기</span></div>
    ${typeof fortuneSyncCardHtml==='function'?fortuneSyncCardHtml():''}
    <div class="fortune-profiles">${[1,2].map(w=>{const p=FT.profiles[w],f=birthFacts(p);return `<button class="fortune-profile" onclick="profileEditor(${w})"><b>${esc(profileName(w))}</b><span>${p?[p.mbti,p.blood?p.blood+'형':'',f?ANIMALS[f.animal]+'띠':''].filter(Boolean).map(esc).join(' · ')||'만세력 프로필':'아직 비어 있는 프로필'}</span><small>${p?'프로필 수정 ↗':'내 정보 입력하기 +'}</small></button>`;}).join('')}</div>
    <div class="fortune-tabs" role="group" aria-label="운세 메뉴">${[['compat','우리 궁합'],['daily','오늘 운세'],['tarot','타로 한 장']].map(([id,n])=>`<button class="${fortuneTab===id?'on':''}" aria-pressed="${fortuneTab===id}" onclick="switchFortune('${id}')">${n}</button>`).join('')}</div>
    ${fortuneTab==='compat'?compatHtml():fortuneTab==='daily'?dailyHtml():tarotHtml()}
    <div class="fortune-footnote">재미로 읽고 대화로 이어가는 콘텐츠예요. 모든 점수는 아지트가 정한 놀이 지표이며, 관계의 좋고 나쁨이나 미래를 판단하는 기준이 아니에요.<details><summary>정보 기준과 저장 안내</summary><p>생년월일·시각·성별·MBTI·혈액형·만세력은 직접 입력한 값만 사용해요. 입력하지 않은 테마는 점수를 만들지 않아요. 연결 전에는 이 브라우저에 저장되고, 연결 후에는 암호화된 값만 Firebase에서 공유돼요. 설정의 백업 파일에는 프로필이 포함되지만 연결 코드는 포함되지 않아요.</p><p>음양력 변환: <a href="https://github.com/usingsky/korean_lunar_calendar_js" target="_blank" rel="noopener noreferrer">Korean Lunar Calendar</a> · 별자리는 대중적인 월일 구간, 사주는 입력한 만세력의 겉글자 기준이에요. MBTI는 <a href="https://asia.themyersbriggs.com/resources/blog/mbti-personality-type-and-relationships/" target="_blank" rel="noopener noreferrer">선호 차이를 이해하는 대화</a>에만 활용해요. 사주 해석은 기존 분석의 구성을 개인 정보 없이 일반화한 Firebase 편집 콘텐츠를 사용하며, 외부 AI로 정보를 보내지 않아요.</p></details></div>`;
}
let lastFortuneDay=koreaDay();
function checkFortuneDay(){const now=koreaDay();if(now!==lastFortuneDay){lastFortuneDay=now;renderFortune();}}
setInterval(checkFortuneDay,30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkFortuneDay();});

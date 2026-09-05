/* Shared world actions use transactions so a purchase never spends a stale balance. */
let worldBusy=false;
async function changeWorld(edit){
  if(worldBusy){toast('잠깐만요, 저장하고 있어요');return false;}
  worldBusy=true;
  let message='';
  try{
    if(db){
      const tx=await db.ref('living').transaction(raw=>{
        const next=mergeLiving(raw),result=edit(next);
        message=result.message||'';
        if(result.ok===false)return;
        return livingPayload(next);
      },undefined,false);
      if(!tx.committed){if(message)toast(message);return false;}
      LV=mergeLiving(tx.snapshot.val());
    }else{
      const next=mergeLiving(JSON.parse(JSON.stringify(LV))),result=edit(next);
      message=result.message||'';
      if(result.ok===false){if(message)toast(message);return false;}
      await DB.setObj('living',livingPayload(next));LV=next;
    }
    renderHearts();renderLiving();renderCareList();
    if(message)toast(message);
    return true;
  }catch(error){console.error('아지트 저장 실패',error);toast('저장하지 못했어요. 연결을 확인하고 다시 눌러주세요');return false;}
  finally{worldBusy=false;}
}
function spendWorld(state,cost){if(state.hearts<cost)return false;state.hearts-=cost;return true;}
function worldFail(message){return{ok:false,message};}
let worldStill=localStorage.getItem('azit-still')==='1';
function toggleWorldMotion(){worldStill=!worldStill;localStorage.setItem('azit-still',worldStill?'1':'0');renderLiving();}
function worldControls(){return `<div class="world-actions"><button type="button" aria-pressed="${worldStill}" onclick="toggleWorldMotion()">${worldStill?'▶ 움직임 켜기':'Ⅱ 움직임 쉬기'}</button><small>친구를 누르면 반가워해요</small></div>`;}

function openAzitDialog(title,body){
  const d=$('azitDialog');
  if(d.open)d.close();
  d.innerHTML=`<div class="dialog-head"><h2 id="azitDialogTitle">${esc(title)}</h2><button type="button" class="dialog-close" aria-label="닫기" onclick="document.getElementById('azitDialog').close()">×</button></div>${body}`;
  d.showModal();
}

const HUSKY_MAP=[
'...AA.......AA..........',
'..ABAA.....AABA.........',
'..ABAAA...AAABA.........',
'..AAAAAAAAAAAAA.........',
'..AABBAAAAABBAA.........',
'..ABBEBBABBE BAA.........'.replace(' ',''),
'..ABBBBBBBBBBAA.........',
'...BBB N BBBBB...........'.replaceAll(' ',''),
'....BBBBMBBBB...AAA.....',
'.....AAAAAAAAAAAAABA....',
'....AABBBBBBBBBAABAA....',
'....AABBBBBBBBBAAAA.....',
'....AABBBBBBBBBAA.......',
'....AAAAAAAAAAAAA.......',
'.....AAA.....AAA........',
'.....BBB.....BBB........'
];
function petStatus(p){
  if(isSleeping())return'꿈나라에서 달리는 중';
  if(dueCare(p.care))return'밥그릇을 기웃기웃';
  if(p.lastAction&&Date.now()-p.lastAction.at<60000)return{stroke:'손에 얼굴을 부비는 중',play:'신나게 공을 쫓는 중',feed:'배부르게 쉬는 중'}[p.lastAction.kind]||'곁에 머무는 중';
  return(p.place||'room')==='garden'?'풀 냄새를 맡는 중':'포근한 러그에서 쉬는 중';
}
function petSceneG(place){
  let out='';
  LV.pets.filter(p=>(p.place||'room')===place).forEach((p,i)=>{
    const x=place==='room'?[185,249,316][i%3]:[110,212,312][i%3];
    const y=place==='room'?260:164;
    const name=petName(p),sleeping=isSleeping();
    out+=`<g transform="translate(${x},${y})" data-pet-id="${esc(p.id)}"><g class="${sleeping?'pet-snooze':'pet-roam pet-'+i}">
      <g class="clk" role="button" tabindex="0" aria-label="${esc(name)} 쓰다듬기" onclick="interactPet('${p.id}','stroke')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();interactPet('${p.id}','stroke')}">
      <rect x="-8" y="-12" width="68" height="62" rx="12" fill="transparent"/><ellipse cx="24" cy="34" rx="25" ry="6" fill="#3d2937" opacity=".17"/>
      ${petG(p,0,0,p.breed==='husky'?2.25:3,sleeping?'':'pet-idle')}
      ${p.lastAction&&Date.now()-p.lastAction.at<60000&&p.lastAction.kind==='play'?'<g class="pet-ball"><circle cx="58" cy="31" r="6" fill="#e49caa" stroke="#fff0d0" stroke-width="2"/><path d="M54 27Q61 30 56 36" stroke="#fff0d0" stroke-width="1.5" fill="none"/></g>':''}
      ${p.lastAction&&Date.now()-p.lastAction.at<60000&&p.lastAction.kind==='feed'?'<path d="M45 29H65L62 36H48Z" fill="#8cb2c0"/><ellipse cx="55" cy="29" rx="9" ry="3" fill="#ac8059"/>':''}
      <rect x="-5" y="38" width="62" height="15" rx="7" fill="#fff5e9" opacity=".94"/><text x="26" y="49" text-anchor="middle" font-size="10" fill="#6e505c" font-family="Jua">${esc(name.slice(0,8))}</text>
      ${sleeping?'<text class="zz" x="34" y="0" font-size="14" fill="#eee6ff">z Z</text>':dueCare(p.care)?pinG(40,-4,'🍚'):p.lastAction&&Date.now()-p.lastAction.at<60000?'<text class="spark" x="32" y="-4" font-size="15" fill="#ff88ad">♥</text>':''}
      </g></g></g>`;
  });
  return out;
}
function petFamilyHtml(){
  if(!LV.pets.length)return `<div class="garden-guide"><span>🐾</span><span>상점에서 만난 친구가 우리 집에 살아요.<br>쓰다듬고, 이름을 지어주고, 마당에서 함께 놀아요.</span></div>`;
  return '<div class="pet-family">'+LV.pets.map(p=>{
    const affection=Math.min(100,p.affection||0),place=p.place||'room';
    return `<article><header>${petSvg(p.type,p.breed,64)}<div><strong>${esc(petName(p))}</strong><p>${esc(petStatus(p))}</p></div><span class="pet-state">${place==='room'?'거실':'마당'}</span></header>
      <div class="pet-affection" role="meter" aria-label="${esc(petName(p))} 친밀도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${affection}"><i style="width:${affection}%"></i></div>
      <p>친밀도 ${affection} · ${affection>=60?'눈빛만 봐도 통하는 가족':affection>=20?'함께 있는 시간이 좋아요':'천천히 서로 알아가는 중'}</p>
      <div class="pet-actions"><button onclick="interactPet('${p.id}','stroke')">쓰다듬기</button><button onclick="interactPet('${p.id}','feed')">밥주기${dueCare(p.care)?' +5💗':''}</button><button onclick="interactPet('${p.id}','play')">공놀이</button><button onclick="movePet('${p.id}')">${place==='room'?'마당에 보내기':'집에 데려오기'}</button><button onclick="namePet('${p.id}')">이름 짓기</button></div></article>`;
  }).join('')+'</div>';
}
async function interactPet(id,kind){
  if(!['stroke','feed','play'].includes(kind))return;
  const now=Date.now();
  await changeWorld(state=>{
    const p=state.pets.find(p=>p.id===id);if(!p)return worldFail('친구를 찾을 수 없어요');
    let reward=0;
    if(kind==='feed'&&dueCare(p.care)){p.care=scheduleCare(1);state.hearts+=CARE_REWARD;reward=CARE_REWARD;}
    const canBond=!p.lastBond||now-p.lastBond>=60000;
    if(canBond){p.affection=Math.min(100,(p.affection||0)+(kind==='play'?3:2));p.lastBond=now;}
    p.lastAction={kind,at:now};
    return{message:petName(p)+(kind==='stroke'?'가 손에 얼굴을 부벼요 ♥':kind==='play'?'가 공을 물고 돌아왔어요!':reward?'가 맛있게 먹었어요! +5💗':'가 간식을 오물오물 먹어요')};
  });
}
async function movePet(id){
  let destination;
  const ok=await changeWorld(state=>{const p=state.pets.find(p=>p.id===id);if(!p)return worldFail('친구를 찾을 수 없어요');destination=(p.place||'room')==='room'?'garden':'room';p.place=destination;return{message:petName(p)+(destination==='garden'?'가 마당으로 나갔어요':'가 집으로 돌아왔어요')};});
  if(ok)setLoc(destination);
}
function namePet(id){const p=LV.pets.find(p=>p.id===id);if(!p)return;
  openAzitDialog('우리 친구의 이름',`<form onsubmit="event.preventDefault();savePetName('${id}')"><label for="petNickname">애칭 · 최대 8글자</label><input id="petNickname" maxlength="8" value="${esc(p.nickname||'')}" placeholder="${esc(petName(p))}"><button class="btn form-submit">이 이름으로 부르기</button></form>`);
}
async function savePetName(id){const name=$('petNickname').value.trim().slice(0,8);const ok=await changeWorld(state=>{const p=state.pets.find(p=>p.id===id);if(!p)return worldFail('친구를 찾을 수 없어요');p.nickname=name;return{message:'앞으로 '+petName(p)+'라고 부를게요'};});if(ok)$('azitDialog').close();}

const CINEMA_FILMS=[{name:'별빛을 싣고 달리는 밤',kind:'train',tag:'NIGHT EXPRESS'},{name:'바다에 두고 온 여름',kind:'ocean',tag:'SUMMER LETTER'},{name:'너와 나의 작은 우주',kind:'space',tag:'OUR LITTLE UNIVERSE'},{name:'노을빛 산책',kind:'sunset',tag:'GOLDEN HOUR'}];
let cinemaIndex=Math.floor(Date.now()/24000)%CINEMA_FILMS.length;
let cinemaPaused=localStorage.getItem('azit-cinema-paused')==='1';
function cinemaArt(index){
  const f=CINEMA_FILMS[index%CINEMA_FILMS.length];let art='';
  if(f.kind==='train'){
    art=`<rect width="180" height="100" fill="#263453"/><circle cx="143" cy="20" r="12" fill="#ffe3a4"/><path d="M0 65 38 24 75 63 107 40 180 72V100H0" fill="#465575"/><path d="M0 81 29 54 69 78 119 57 180 82V100H0" fill="#293746"/>
      <path d="M0 82H180" stroke="#d0a887" stroke-width="4"/><g class="film-train"><rect x="8" y="65" width="78" height="14" rx="3" fill="#cd8b70"/><rect x="87" y="65" width="33" height="14" rx="3" fill="#dbb090"/>${Array.from({length:9},(_,i)=>`<rect x="${13+i*11}" y="68" width="7" height="5" fill="#ffe8ab"/>`).join('')}<circle cx="25" cy="80" r="3" fill="#191f34"/><circle cx="101" cy="80" r="3" fill="#191f34"/></g>`;
  }else if(f.kind==='ocean'){
    art=`<rect width="180" height="100" fill="#a3d9dd"/><circle cx="141" cy="25" r="15" fill="#fff1c1"/><g class="film-cloud" fill="#fff4df"><ellipse cx="40" cy="24" rx="29" ry="6"/><ellipse cx="96" cy="13" rx="17" ry="4"/></g><path d="M0 49Q55 42 90 50T180 48V100H0" fill="#559da9"/><g class="film-wave"><path d="M0 66Q45 59 90 67T180 64" stroke="#bde3dc" fill="none" stroke-width="3"/><path d="M30 78Q70 72 140 79" stroke="#89c5c5" fill="none" stroke-width="2"/></g><path d="M0 90Q80 67 180 88V100H0" fill="#eacb99"/><path d="M52 77V40L79 65H54M49 72H84L76 80H58Z" fill="#fff1cc"/><path d="M108 90V79M119 90V79" stroke="#574b58" stroke-width="5"/><circle cx="108" cy="77" r="4" fill="#635366"/><circle cx="119" cy="77" r="4" fill="#635366"/>`;
  }else if(f.kind==='space'){
    art=`<rect width="180" height="100" fill="#302748"/><ellipse cx="115" cy="46" rx="30" ry="28" fill="#937ba8"/><ellipse cx="115" cy="46" rx="49" ry="9" fill="none" stroke="#d2b9c6" stroke-width="5" transform="rotate(-24 115 46)"/><circle cx="34" cy="31" r="7" fill="#ecbf9a"/><g class="film-wave"><path d="M50 68Q72 44 87 71L68 80Z" fill="#ede3dd"/><circle cx="68" cy="65" r="8" fill="#8eadc8"/><path d="M62 80 58 91M73 80 78 91" stroke="#e7b2b9" stroke-width="5"/></g>`;
  }else{
    art=`<rect width="180" height="100" fill="#d7938f"/><circle cx="124" cy="36" r="23" fill="#f6c98e"/><g class="film-cloud"><path d="M0 21H70M89 15H149" stroke="#efb4a1" stroke-width="5"/></g><path d="M0 61Q37 24 87 58T180 52V100H0" fill="#846e82"/><path d="M0 77Q53 47 115 78T180 71V100H0" fill="#526572"/><path d="M60 100 87 69 94 69 88 100" fill="#c2a898"/><path d="M88 83V71M99 84V72" stroke="#3f3d51" stroke-width="5"/><circle cx="88" cy="68" r="4" fill="#393c50"/><circle cx="99" cy="69" r="4" fill="#393c50"/><path d="M89 74 97 76" stroke="#3f3d51" stroke-width="3"/>`;
  }
  if(f.kind==='space'||f.kind==='train')art+=Array.from({length:15},(_,i)=>`<circle class="film-star" cx="${(i*37+12)%178}" cy="${(i*13+8)%51}" r="${i%3===0?1.2:.7}" fill="#fff3d4" style="animation-delay:-${i%3}s"/>`).join('');
  return `<svg viewBox="0 0 180 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${art}<rect width="180" height="9" fill="#1e1c29"/><rect y="91" width="180" height="9" fill="#1e1c29"/><text x="90" y="97" text-anchor="middle" fill="#ebd7be" font-size="4" letter-spacing="1.5">${f.tag}</text></svg>`;
}
function cinemaG(){return `<rect x="312" y="30" width="126" height="83" rx="4" fill="#443e4a"/><rect x="316" y="34" width="118" height="75" rx="2" fill="#ead8bd"/>
  <svg x="320" y="38" width="110" height="66" viewBox="0 0 180 100" class="${cinemaPaused?'cinema-paused':''}" data-cinema-frame>${cinemaArt(cinemaIndex)}</svg><rect x="355" y="15" width="24" height="12" rx="4" fill="#f3e6db"/><circle cx="367" cy="24" r="4" fill="#a3d7ee"/><polygon points="367,28 320,40 430,40" fill="#cce6ff" opacity=".19"/><rect x="364" y="8" width="6" height="8" fill="#746578"/>`;}
function cinemaControls(){return `<div class="cinema-controls"><div><strong data-cinema-title>${CINEMA_FILMS[cinemaIndex].name}</strong><small style="display:block">아지트 시네마 · 짧은 애니메이션 4편</small></div><button onclick="nextCinema()" aria-label="다음 영화 풍경">다음 장면</button><button onclick="pauseCinema()" aria-label="시네마 ${cinemaPaused?'재생':'일시정지'}">${cinemaPaused?'▶':'Ⅱ'}</button></div>`;}
function nextCinema(){cinemaIndex=(cinemaIndex+1)%CINEMA_FILMS.length;refreshCinema();}
function pauseCinema(){cinemaPaused=!cinemaPaused;localStorage.setItem('azit-cinema-paused',cinemaPaused?'1':'0');renderLiving();}
function refreshCinema(){document.querySelectorAll('[data-cinema-frame]').forEach(el=>el.innerHTML=cinemaArt(cinemaIndex));document.querySelectorAll('[data-cinema-title]').forEach(el=>el.textContent=CINEMA_FILMS[cinemaIndex].name);}
setInterval(()=>{if(!document.hidden&&!worldStill&&!cinemaPaused&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&$('p6').classList.contains('on')&&locView==='room')nextCinema();},24000);

const FURNITURE={
  petbed:{n:'구름 펫 침대',cost:40,desc:'폭신한 쿠션과 작은 발자국',slot:'pet',kind:'bed'},
  petHouse:{n:'별 지붕 펫 하우스',cost:80,desc:'우리 친구만의 아늑한 집',slot:'pet',kind:'house'},
  aquarium:{n:'반짝 물고기 수조',cost:70,desc:'물방울과 작은 물고기 세 마리',slot:'shelf',kind:'aquarium'},
  record:{n:'빈티지 턴테이블',cost:60,desc:'돌아가는 LP와 레코드 수납장',slot:'shelf',kind:'record'},
  lamp:{n:'튤립 무드등',cost:35,desc:'침대 옆에 머무는 따뜻한 빛',slot:'light',kind:'lamp'},
  arcade:{n:'미니 아케이드',cost:90,desc:'반짝이는 픽셀 게임 화면',slot:'shelf',kind:'arcade'},
  picnic:{n:'체크 피크닉 세트',cost:55,desc:'마당에 펼치는 담요와 도시락',slot:'yard',kind:'picnic'},
  greenhouse:{n:'작은 유리 온실',cost:100,desc:'햇빛이 비치는 마당 속 식물방',slot:'yard',kind:'greenhouse'},
  firefly:{n:'반딧불 랜턴',cost:40,desc:'마당을 밝히는 두 개의 작은 등',slot:'yardLight',kind:'firefly'}
};
Object.assign(THEMES,{
  cafe:{n:'크림 소다 카페',e:'☕',wall:'#efdfc3',blanket:'#649d90',floor:'#ba946c',floorLine:'#a27f59',trim:'#91aca1',rug:'#648e82',rug2:'#d9e7c9'},
  starlight:{n:'별빛 다락방',e:'🌌',wall:'#55516e',blanket:'#7d70b0',floor:'#8c7a84',floorLine:'#6b5b67',trim:'#7e708c',rug:'#9d8dbd',rug2:'#dcd1e8'},
  cottage:{n:'숲속 코티지',e:'🍄',wall:'#dfe4c5',blanket:'#c98162',floor:'#ad845c',floorLine:'#896443',trim:'#8f9d72',rug:'#c39864',rug2:'#eddeb9'},
  ocean:{n:'바닷가 휴일',e:'🐚',wall:'#d7e9ee',blanket:'#619aae',floor:'#c5b492',floorLine:'#ae9678',trim:'#a3c4cb',rug:'#6fabb8',rug2:'#dfefec'}
});
function furnitureArt(kind){
  const base='<ellipse cx="40" cy="53" rx="34" ry="5" fill="#503e4822"/>';
  const art={
    bed:'<ellipse cx="40" cy="43" rx="31" ry="12" fill="#bd91a3"/><ellipse cx="40" cy="39" rx="28" ry="12" fill="#efd5d6"/><ellipse cx="40" cy="39" rx="21" ry="7" fill="#fff0df"/><path d="M19 31Q13 16 27 24M60 31Q69 17 55 23" fill="#dfbbc4"/><circle cx="37" cy="39" r="3" fill="#d9b3b7"/>',
    house:'<path d="M14 24 40 4 66 24V53H14Z" fill="#d3ad80"/><path d="M8 25 40 1 72 25" fill="none" stroke="#8d769e" stroke-width="7"/><path d="M28 53V37Q40 19 52 37V53" fill="#6b5268"/><ellipse cx="40" cy="49" rx="14" ry="4" fill="#e9b3bd"/><text x="40" y="22" text-anchor="middle" font-size="12" fill="#fff0b9">✦</text>',
    aquarium:'<rect x="8" y="12" width="64" height="39" rx="4" fill="#8eafba"/><rect x="12" y="16" width="56" height="29" fill="#b6e0e4"/><path d="M17 45Q26 23 20 31M59 45Q51 25 60 30" stroke="#63978e" stroke-width="3" fill="none"/><g class="film-wave"><path d="M28 25 33 29 28 33 28 25M32 29Q41 20 44 29Q41 37 32 29" fill="#e7a770"/><path d="M43 37 48 40 43 43M47 40Q55 32 57 40Q52 46 47 40" fill="#d5889d"/></g><circle class="film-star" cx="52" cy="22" r="2" fill="#fff"/><rect x="8" y="48" width="64" height="6" fill="#816b71"/>',
    record:'<rect x="10" y="17" width="60" height="36" rx="4" fill="#a77e64"/><rect x="13" y="20" width="54" height="17" rx="3" fill="#e2c5a1"/><ellipse cx="34" cy="28" rx="15" ry="7" fill="#4c4458"/><ellipse cx="34" cy="28" rx="5" ry="3" fill="#cc94a7"/><path d="M60 22 58 30 46 30" stroke="#73536a" stroke-width="2" fill="none"/><path d="M20 43V52M26 41V52M33 43V52M40 41V52" stroke="#ddbcc1" stroke-width="4"/>',
    lamp:'<ellipse cx="40" cy="34" rx="24" ry="24" fill="#ffda8c33"/><path d="M40 48V22" stroke="#759883" stroke-width="4"/><path d="M40 37Q51 23 53 34Q46 40 40 40" fill="#91b794"/><path d="M27 9Q30 32 40 29Q52 29 53 9L45 16 40 7 35 16Z" fill="#e4a4b2"/><ellipse cx="40" cy="50" rx="15" ry="4" fill="#bca37f"/>',
    arcade:'<path d="M23 3H60V32L67 38V54H15V38L23 31Z" fill="#a484ac"/><rect x="27" y="9" width="29" height="21" fill="#36374d"/><g class="film-star" fill="#eac58c"><rect x="33" y="17" width="5" height="5"/><rect x="43" y="19" width="5" height="5"/></g><path d="M23 33H59L63 39H19Z" fill="#d1b0c4"/><circle cx="48" cy="36" r="2" fill="#f0bc97"/><path d="M31 36V31" stroke="#564060" stroke-width="3"/><rect x="29" y="44" width="22" height="5" fill="#665272"/>',
    picnic:'<path d="M12 29H62L76 53H2Z" fill="#f0dcc1"/><path d="M19 29 11 53M38 29 37 53M55 29 65 53M6 44H71M10 35H66" stroke="#cf8a94" stroke-width="4"/><rect x="25" y="26" width="26" height="17" rx="4" fill="#c2996d"/><path d="M30 26Q37 9 46 26" stroke="#916c4f" stroke-width="3" fill="none"/><circle cx="58" cy="43" r="5" fill="#fff0da"/>',
    greenhouse:'<path d="M10 24 39 4 69 24V52H10Z" fill="#b7dddd" fill-opacity=".8" stroke="#719990" stroke-width="3"/><path d="M10 24H69M39 4V52M25 15V51M54 14V51" stroke="#749d95" stroke-width="2"/><path d="M22 44Q12 31 23 31Q31 26 28 39M51 43Q43 27 54 30Q67 29 57 43" fill="#77a67d"/><path d="M18 43H32L30 51H20M47 43H61L59 51H49" fill="#bf9272"/>',
    firefly:'<path d="M18 50V14Q18 5 30 9M52 50V19Q52 9 64 13" stroke="#7e6e7e" stroke-width="3" fill="none"/><g fill="#f7d499"><rect x="24" y="9" width="12" height="17" rx="4"/><rect x="58" y="13" width="12" height="17" rx="4"/></g><g class="film-star" fill="#ffeab9"><circle cx="30" cy="18" r="17" opacity=".2"/><circle cx="64" cy="22" r="17" opacity=".2"/></g>'
  };
  return `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${base}${art[kind]||''}</svg>`;
}
function placedFurnitureG(place){
  let g='';
  Object.values(LV.furniture||{}).forEach(id=>{const f=FURNITURE[id];if(!f)return;const yard=f.slot.startsWith('yard');if(yard!==(place==='garden'))return;
    const pos={pet:[352,259,85,58],shelf:[322,124,76,62],light:[408,139,49,58],yard:[328,91,105,76],yardLight:[100,85,85,65]}[f.slot];
    g+=`<svg x="${pos[0]}" y="${pos[1]}" width="${pos[2]}" height="${pos[3]}" viewBox="0 0 80 60">${furnitureArt(f.kind)}</svg>`;
  });return g;
}
function themeDetailG(){
  let out='';const t=LV.theme;
  if(t==='starlight')for(let i=0;i<14;i++)out+=`<text class="film-star" x="${18+i*33}" y="${38+(i%3)*12}" fill="#ecdaae" font-size="${i%2?6:9}">✦</text>`;
  if(t==='cottage'||t==='mint')out+='<path d="M4 19Q81 62 157 19M320 17Q387 47 475 18" stroke="#64865e" stroke-width="3" fill="none"/>'+Array.from({length:10},(_,i)=>`<ellipse cx="${18+i*45}" cy="${27+(i%3)*6}" rx="4" ry="9" fill="#91b078" transform="rotate(35 ${18+i*45} ${27+(i%3)*6})"/>`).join('');
  if(t==='cafe')out+='<rect x="63" y="34" width="85" height="24" rx="3" fill="#f9f0d8" stroke="#a68361" stroke-width="2"/><text x="105" y="50" text-anchor="middle" font-size="12" fill="#698879" font-family="Jua">AZIT COFFEE</text>';
  if(t==='ocean')out+='<g stroke="#bd9877" stroke-width="3" fill="none"><circle cx="110" cy="49" r="16"/><path d="M99 38 121 60M99 60 121 38"/></g><circle cx="110" cy="49" r="9" fill="#d7e9ee"/>';
  if(t==='lavender'||t==='sunset')out+=`<rect x="72" y="31" width="57" height="29" rx="2" fill="#fff0df"/><circle cx="111" cy="41" r="7" fill="${t==='sunset'?'#e49d6b':'#a392bd'}"/><path d="M76 55 90 38 101 52 111 44 125 57" fill="${t==='sunset'?'#b88679':'#8c8da9'}"/>`;
  return out;
}
function furnitureShopHtml(){return shopSection('shop-furniture','🛋️','소품 편집숍','같은 자리의 소품은 교체돼요 · 보유한 소품은 무료로 다시 배치',Object.entries(FURNITURE).map(([id,f])=>{
  const owned=LV.ownedFurniture.includes(id),active=LV.furniture[f.slot]===id;
  return shopCard(furnitureArt(f.kind),f.n,active?'배치 중 · 보관하기':owned?'보유 · 무료 배치':'💗 '+f.cost,`buyFurniture('${id}')`,false).replace('</span><span class="cost">',`</span><small class="furniture-description">${f.desc}</small><span class="cost">`);
}).join(''));}
async function buyFurniture(id){const f=FURNITURE[id];if(!f)return;await changeWorld(state=>{
  if(state.furniture[f.slot]===id){delete state.furniture[f.slot];return{message:f.n+'를 보관했어요'};}
  if(!state.ownedFurniture.includes(id)){if(!spendWorld(state,f.cost))return worldFail('하트가 부족해요 💔');state.ownedFurniture.push(id);}
  state.furniture[f.slot]=id;return{message:f.n+' 배치 완료! '+(f.slot.startsWith('yard')?'마당':'거실')+'에서 만나보세요'};
});}

function plotPicker(i){
  if(LV.garden.plots[i]!==null)return;
  openAzitDialog((i+1)+'번 밭 · 무엇을 심을까요?',`<p class="dialog-note">씨앗 10💗 · 물주기 4번으로 수확해요.<br>첫 물은 바로 줄 수 있고, 다음 물주기는 4시간 뒤예요.</p><div class="seed-choice">${Object.entries(FRUITS).map(([id,f])=>`<button onclick="plantSeed(${i},'${id}')"><svg viewBox="0 0 60 42">${cropG({type:id,stage:4},30,20)}</svg>${f.n}<small style="display:block">10💗</small></button>`).join('')}</div>`);
}
async function plantSeed(i,type){
  if(!FRUITS[type])return;
  const ok=await changeWorld(state=>{if(!Number.isInteger(i)||i<0||i>=state.garden.plots.length||state.garden.plots[i])return worldFail('이미 작물이 자라는 밭이에요');if(!spendWorld(state,10))return worldFail('씨앗은 10💗가 필요해요');state.garden.plots[i]={type,stage:0,care:[Date.now()],plantedAt:Date.now()};return{message:FRUITS[type].n+' 씨앗을 심었어요. 첫 물을 주세요!'};});
  if(ok)$('azitDialog').close();
}
async function waterPlot(i){await changeWorld(state=>{const p=state.garden.plots[i];if(!p||p.stage>=4)return worldFail('수확할 수 있는 작물인지 확인해 주세요');if(!dueCare(p.care))return worldFail('촉촉한 흙이에요. '+nextCareLabel(p.care));p.stage=(p.stage||0)+1;p.care=p.stage>=4?[]:[Date.now()+4*3600000];p.wateredAt=Date.now();state.hearts+=CARE_REWARD;return{message:p.stage>=4?'다 자랐어요! 눌러서 수확하세요 · +5💗':'물을 주니 한 뼘 자랐어요 · +5💗'};});}
async function collectPlot(i){await changeWorld(state=>{const p=state.garden.plots[i];if(!p||p.stage<4)return worldFail('아직 자라는 중이에요');state.garden.plots[i]=null;state.hearts+=15;state.garden.harvests=(state.garden.harvests||0)+1;return{message:FRUITS[p.type].n+' 수확! +15💗'};});}
function gardenTextureG(H){
  let g='<path d="M0 219H480M0 319H480" stroke="#e5d3a0" stroke-width="13" opacity=".8"/>';
  for(let i=0;i<7;i++)g+=`<ellipse cx="${83+i*47}" cy="${188+(i%2)*8}" rx="13" ry="5" fill="#e8d2a9" stroke="#b7a17b" stroke-width="1"/>`;
  g+='<g transform="translate(435 168)"><path d="M0 0H17L20 18H-3Z" fill="#8fb0b8"/><path d="M17 4Q33 1 28 13L20 16M0 3Q-17 -1 -11 13" stroke="#8fb0b8" fill="none" stroke-width="4"/><path d="M0 -3H17" stroke="#d9e6d6" stroke-width="3"/></g>';
  for(let i=0;i<48;i++){const x=(i*79+17)%476,y=151+(i*47)%Math.max(1,H-156);g+=`<path d="M${x} ${y}l-2 -4m2 4l3 -3" stroke="#648454" stroke-width="1.3" opacity=".45"/>`;}
  for(let i=0;i<12;i++){const x=i%2?466:10,y=234+Math.floor(i/2)*31;g+=`<path d="M${x} ${y+5}v-8" stroke="#748650" stroke-width="2"/><circle cx="${x}" cy="${y-5}" r="4" fill="${['#fff0c6','#e9b2b8','#dbb3d9'][i%3]}"/><circle cx="${x}" cy="${y-5}" r="1.5" fill="#e2b861"/>`;}
  return g;
}
function gardenHillsG(){const winter=seasonOf()==='winter';return `<path d="M0 145Q50 91 113 125T242 129Q337 89 480 133V153H0Z" fill="${isNight()?'#344b56':winter?'#c4d8dc':'#a9b985'}"/><path d="M0 151Q114 108 224 147Q348 109 480 145V158H0Z" fill="${isNight()?'#435a54':winter?'#d9e5e8':'#c0c08a'}"/>`;}
function gardenPlotsG(){
  return LV.garden.plots.map((p,i)=>{
    const x=25+(i%3)*153,y=229+Math.floor(i/3)*94,w=125,h=76,ready=p&&p.stage>=4;
    const f=p?FRUITS[p.type]||FRUITS.tomato:null;
    const action=!p?`plotPicker(${i})`:ready?`collectPlot(${i})`:`waterPlot(${i})`;
    const label=(i+1)+'번 밭 '+(!p?'씨앗 심기':f.n+(ready?' 수확하기':' 물주기'));
    let g=`<g class="clk" role="button" tabindex="0" aria-label="${label}" onclick="${action}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();${action}}">
      <rect x="${x}" y="${y+5}" width="${w}" height="${h}" rx="8" fill="#785135"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${ready?'#e9c37e':'#bf986c'}" stroke="#987046" stroke-width="2"/><rect x="${x+6}" y="${y+6}" width="${w-12}" height="${h-12}" rx="4" fill="${p&&p.wateredAt&&Date.now()-p.wateredAt<3600000?'#765140':'#906448'}"/>`;
    for(let r=0;r<3;r++)g+=`<path d="M${x+12} ${y+17+r*18}h101" stroke="#6f4d38" stroke-width="3" opacity=".6"/>`;
    for(let a=0;a<9;a++)g+=`<circle cx="${x+13+(a*31)%99}" cy="${y+12+(a*13)%46}" r="1" fill="#c39b6a" opacity=".7"/>`;
    if(p){
      g+=`<g class="crop-sway">${cropG(p,x+32,y+30)}${cropG(p,x+65,y+23)}${cropG(p,x+93,y+36)}</g>`;
      g+=`<rect x="${x+8}" y="${y+61}" width="109" height="18" rx="5" fill="${ready?'#fff2c6':'#fff0db'}"/><text x="${x+62}" y="${y+73}" text-anchor="middle" font-family="Jua" font-size="10" fill="#705235">${f.n} · ${ready?'수확!':(p.stage||0)+'/4'}</text>`;
      if(dueCare(p.care)&&!ready)g+=pinG(x+w-16,y+18,'💧');
    }else g+=`<circle cx="${x+62}" cy="${y+31}" r="12" fill="#b99b70"/><path d="M${x+56} ${y+31}h12m-6 -6v12" stroke="#fff3d4" stroke-width="2"/><text x="${x+62}" y="${y+60}" text-anchor="middle" font-family="Jua" font-size="11" fill="#fff1d8">씨앗 고르기</text>`;
    return g+'</g>';
  }).join('');
}

window.render_game_to_text=()=>JSON.stringify({
  coordinateSystem:'SVG origin is top-left; x grows right and y grows down',
  mode:document.querySelector('.page.on')&&document.querySelector('.page.on').id,
  location:locView,
  hearts:LV.hearts||0,
  pets:(LV.pets||[]).map(p=>({id:p.id,name:petName(p),kind:p.type,breed:p.breed,place:p.place,affection:p.affection||0,visible:p.place===locView})),
  garden:{plots:(LV.garden.plots||[]).map((p,index)=>p?{index,crop:p.type,stage:p.stage||0,ready:(p.stage||0)>=4}:null),harvests:LV.garden.harvests||0},
  furniture:Object.values(LV.furniture||{}),
  cinema:{title:CINEMA_FILMS[cinemaIndex].name,index:cinemaIndex,paused:cinemaPaused||worldStill}
});
window.advanceTime=ms=>{if(Number(ms)>=24000&&!cinemaPaused&&!worldStill)cinemaIndex=(cinemaIndex+Math.floor(Number(ms)/24000))%CINEMA_FILMS.length;renderLiving();return window.render_game_to_text();};

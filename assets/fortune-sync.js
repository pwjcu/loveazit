/* Shared fortune data: public editorial copy + end-to-end encrypted couple room. */
const FORTUNE_LINK_KEY='azit-fortune-link-v1';
const FORTUNE_CONTENT_PATH='fortuneContent/v1';
const FORTUNE_ROOM_ROOT='fortuneRooms';
const FORTUNE_EDITORIAL_DEFAULT={
  version:1,
  title:'아지트 운세 편집실',
  updatedAt:'2026-09-05',
  sajuRelations:{
    same:{
      summary:'익숙한 방식으로 공감하기 쉬운 조합이라는 전통 해석이에요.',
      detail:'닮은 반응은 안정감을 주지만, 서로의 다른 취향과 혼자 쉬는 방식도 함께 물어보세요.',
      mission:'오늘 서로 닮았다고 느끼는 점과 의외로 다른 점을 하나씩 말해보기'
    },
    supporting:{
      summary:'한 오행이 다른 오행의 흐름을 돕는 상생의 상징이에요.',
      detail:'누가 늘 돕는 사람으로 굳어지지 않도록, 지금 필요한 도움과 가능한 범위를 구체적으로 나눠보세요.',
      mission:'상대에게 힘이 되었던 행동을 하나씩 구체적으로 알려주기'
    },
    balancing:{
      summary:'상극은 불행의 예고가 아니라 서로 다른 힘을 조절하는 전통 개념이에요.',
      detail:'표현의 속도와 결정 방식이 다를 수 있어요. 결론을 재촉하기 전에 각자 필요한 시간을 정해보세요.',
      mission:'오늘 함께 정할 일 하나를 고르고, 각자 편한 속도를 먼저 말하기'
    }
  },
  dailyMessages:[
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
  ]
};

let fortuneLink=null;
let fortuneSyncStatus='local';
let fortuneSyncMessage='이 기기에만 저장 중';
let fortuneRoomRef=null;
let fortuneRoomHandler=null;
let fortuneRoomRevision=0;
let fortuneConnectPending=false;
let fortuneConnectGeneration=0;
let fortuneReconnectTimer=null;
let fortuneReconnectAttempts=0;
let fortuneResumeHandlersReady=false;
let fortuneLastResumeAt=0;
let fortunePendingInvite=null;
let fortuneContentStatus='내장 콘텐츠 사용 중';
window.fortuneEditorial=FORTUNE_EDITORIAL_DEFAULT;

function validEditorial(value){
  if(!value||value.version!==1||!value.sajuRelations)return false;
  if(!['same','supporting','balancing'].every(k=>value.sajuRelations[k]&&['summary','detail','mission'].every(p=>typeof value.sajuRelations[k][p]==='string')))return false;
  return Array.isArray(value.dailyMessages)&&value.dailyMessages.length>=6&&value.dailyMessages.length<=40&&value.dailyMessages.every(row=>Array.isArray(row)&&row.length===3&&row.every(x=>typeof x==='string'&&x.length>0&&x.length<300));
}

function bytesToBase64Url(bytes){
  let s='';bytes.forEach(b=>s+=String.fromCharCode(b));
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function base64UrlToBytes(text){
  const s=text.replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(s+'='.repeat((4-s.length%4)%4));
  return Uint8Array.from(raw,c=>c.charCodeAt(0));
}
function normalizeFortuneCode(value){
  const compact=String(value||'').trim().replace(/\s/g,'');
  const body=compact.toUpperCase().startsWith('AZIT-')?compact.slice(5):compact;
  if(!/^[A-Za-z0-9_-]{43}$/.test(body))throw new Error('연결 코드를 확인해 주세요.');
  const bytes=base64UrlToBytes(body);
  if(bytes.length!==32)throw new Error('연결 코드를 확인해 주세요.');
  return 'AZIT-'+body;
}
function newFortuneCode(){const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);return 'AZIT-'+bytesToBase64Url(bytes);}
async function fortuneLinkMaterial(code){
  const normalized=normalizeFortuneCode(code),raw=base64UrlToBytes(normalized.slice(5));
  const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',raw));
  const roomId=Array.from(digest,b=>b.toString(16).padStart(2,'0')).join('');
  const key=await crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt']);
  return{code:normalized,roomId,key};
}
async function encryptFortune(value,path,material=fortuneLink){
  if(!material)throw new Error('연결되지 않았어요.');
  const encoder=new TextEncoder(),iv=new Uint8Array(12);crypto.getRandomValues(iv);
  const plain=encoder.encode(JSON.stringify({v:1,value}));
  const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(path)},material.key,plain);
  return{v:1,iv:bytesToBase64Url(iv),data:bytesToBase64Url(new Uint8Array(cipher)),at:Date.now()};
}
async function decryptFortune(payload,path,material=fortuneLink){
  if(!material||!payload||payload.v!==1||typeof payload.iv!=='string'||typeof payload.data!=='string')throw new Error('읽을 수 없는 데이터예요.');
  const encoder=new TextEncoder();
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:base64UrlToBytes(payload.iv),additionalData:encoder.encode(path)},material.key,base64UrlToBytes(payload.data));
  const parsed=JSON.parse(new TextDecoder().decode(plain));
  if(!parsed||parsed.v!==1)throw new Error('지원하지 않는 데이터예요.');
  return parsed.value;
}
function fortuneRoomPath(path,material=fortuneLink){return FORTUNE_ROOM_ROOT+'/'+material.roomId+'/'+path;}

function sharedContactRecord(value){
  if(value===null)return null;
  if(!value||typeof value!=='object'||Array.isArray(value)||(value.v!==undefined&&value.v!==1))throw new Error('연락처 형식을 확인해 주세요.');
  const limits={phone:20,kakao:30,emergency:20},next={v:1};
  for(const [key,limit] of Object.entries(limits)){
    if(typeof value[key]!=='string')throw new Error('연락처 형식을 확인해 주세요.');
    next[key]=value[key].trim().slice(0,limit);
  }
  return next;
}
function sharedContactFromVault(value,slot){
  if(value===null)return null;
  if(value&&value.v===1&&value.contacts&&typeof value.contacts==='object')return sharedContactRecord(value.contacts[slot]);
  return sharedContactRecord(value);
}
function applySyncedValue(next,path,value){
  const parts=path.split('/');
  if(parts[0]==='contacts'&&parts.length===2&&/^[12]$/.test(parts[1])){
    const contact=sharedContactRecord(value);
    if(typeof window.applySharedPrivateContact==='function')window.applySharedPrivateContact(parts[1],contact);
  }
  if(path==='contacts/v1'){
    if(!value||value.v!==1||!value.contacts||typeof value.contacts!=='object')throw new Error('연락처 형식을 확인해 주세요.');
    const contacts={};for(const slot of ['1','2'])contacts[slot]=sharedContactRecord(value.contacts[slot]);
    if(typeof window.applySharedPrivateContact==='function'){
      for(const slot of ['1','2'])window.applySharedPrivateContact(slot,contacts[slot]);
    }else if(typeof window.applySharedPrivateContactVault==='function')window.applySharedPrivateContactVault({v:1,contacts});
  }
  if(parts[0]==='profiles'&&/^[12]$/.test(parts[1])){
    if(value===null)delete next.profiles[parts[1]];else next.profiles[parts[1]]=value;
  }
  if(parts[0]==='daily'&&/^\d{4}-\d{2}-\d{2}$/.test(parts[1])&&/^[12]$/.test(parts[2])&&['zodiac','star','tarot'].includes(parts[3])){
    next.daily[parts[1]]=next.daily[parts[1]]||{};
    next.daily[parts[1]][parts[2]]=next.daily[parts[1]][parts[2]]||{};
    if(value===null)delete next.daily[parts[1]][parts[2]][parts[3]];else next.daily[parts[1]][parts[2]][parts[3]]=value;
  }
}
async function applyFortuneRoom(raw,material=fortuneLink,{replaceLocal=false}={}){
  if(!material)return;
  const revision=++fortuneRoomRevision,next=replaceLocal?{profiles:{},daily:{}}:JSON.parse(JSON.stringify(FT));
  const jobs=[];
  for(const w of ['1','2'])if(raw&&raw.profiles&&raw.profiles[w])jobs.push(['profiles/'+w,raw.profiles[w]]);
  const days=raw&&raw.daily&&typeof raw.daily==='object'?Object.keys(raw.daily).sort().slice(-30):[];
  for(const day of days)for(const w of ['1','2'])for(const key of ['zodiac','star','tarot']){
    const payload=raw.daily[day]&&raw.daily[day][w]&&raw.daily[day][w][key];if(payload)jobs.push(['daily/'+day+'/'+w+'/'+key,payload]);
  }
  const contactEntries=raw&&raw.contacts;
  const hasContactEntries=contactEntries&&['1','2'].some(slot=>contactEntries[slot]!=null);
  for(const slot of ['1','2'])if(contactEntries&&contactEntries[slot]!=null)jobs.push(['contacts/'+slot,contactEntries[slot]]);
  if(!hasContactEntries&&contactEntries&&contactEntries.v1)jobs.push(['contacts/v1',contactEntries.v1]);
  const settled=await Promise.allSettled(jobs.map(async([path,payload])=>[path,await decryptFortune(payload,path,material)]));
  if(revision!==fortuneRoomRevision||material!==fortuneLink)return;
  if(replaceLocal&&typeof window.applySharedPrivateContact==='function')for(const slot of ['1','2'])window.applySharedPrivateContact(slot,null);
  let failed=0;settled.forEach(result=>{if(result.status==='fulfilled'){try{applySyncedValue(next,result.value[0],result.value[1]);}catch{failed++;}}else failed++;});
  saveFortuneLocal(fortuneNormalize(next));
  fortuneSyncStatus=failed?'error':'synced';
  fortuneSyncMessage=failed?'일부 공유 정보를 읽지 못했어요':'자동 공유 중 · 두 기기 실시간 연결';
  renderFortune();
}
async function seedFortuneRoom(raw,material=fortuneLink){
  const updates={},source=fortuneNormalize(FT);
  for(const w of ['1','2'])if(source.profiles[w]&&!(raw&&raw.profiles&&raw.profiles[w])){
    const path='profiles/'+w;updates[path]=await encryptFortune(source.profiles[w],path,material);
  }
  for(const day of Object.keys(source.daily).sort().slice(-30))for(const w of ['1','2'])for(const key of ['zodiac','star','tarot']){
    const value=source.daily[day]&&source.daily[day][w]&&source.daily[day][w][key];
    const exists=raw&&raw.daily&&raw.daily[day]&&raw.daily[day][w]&&raw.daily[day][w][key];
    if(value&&!exists){const path='daily/'+day+'/'+w+'/'+key;updates[path]=await encryptFortune(value,path,material);}
  }
  if(Object.keys(updates).length)await db.ref(FORTUNE_ROOM_ROOT+'/'+material.roomId).update(updates);
  if(typeof window.getPrivateContactVault==='function'){
    const vault=window.getPrivateContactVault();
    if(vault&&vault.v===1&&vault.contacts&&typeof vault.contacts==='object')for(const slot of ['1','2']){
      if(raw&&raw.contacts&&raw.contacts[slot]!=null)continue;
      const contact=sharedContactFromVault(vault,slot);
      if(!contact||!['phone','kakao','emergency'].some(key=>contact[key]))continue;
      const path='contacts/'+slot,candidate=await encryptFortune(contact,path,material);
      await db.ref(fortuneRoomPath(path,material)).transaction(current=>current==null?candidate:undefined,undefined,false);
    }
  }
}
function detachFortuneRoom(){if(fortuneRoomRef&&fortuneRoomHandler)fortuneRoomRef.off('value',fortuneRoomHandler);fortuneRoomRef=null;fortuneRoomHandler=null;}
function savedFortuneConnection(){
  try{
    const raw=localStorage.getItem(FORTUNE_LINK_KEY);
    if(!raw)return{state:'none'};
    const saved=JSON.parse(raw);
    return{state:'saved',code:normalizeFortuneCode(saved&&saved.code)};
  }catch{return{state:'invalid'};}
}
function stopFortuneReconnect(){if(fortuneReconnectTimer!==null){clearTimeout(fortuneReconnectTimer);fortuneReconnectTimer=null;}}
function scheduleFortuneReconnect(){
  if(fortuneReconnectTimer!==null||fortuneReconnectAttempts>=3||savedFortuneConnection().state!=='saved'||typeof setTimeout!=='function')return;
  if(typeof navigator!=='undefined'&&navigator.onLine===false)return;
  const delay=[2000,8000,20000][fortuneReconnectAttempts];
  fortuneReconnectTimer=setTimeout(()=>{fortuneReconnectTimer=null;retryFortuneConnection(true);},delay);
}
async function retryFortuneConnection(automatic=false){
  if(fortuneConnectPending||automatic&&fortuneReconnectAttempts>=3)return;
  const saved=savedFortuneConnection();
  if(saved.state!=='saved'){
    if(!fortuneLink){fortuneSyncStatus=saved.state==='invalid'?'invalid':'local';fortuneSyncMessage=saved.state==='invalid'?'저장된 연결 정보가 손상됐어요 · 연결 관리에서 복구해 주세요':'한 번 연결하면 다음부터 자동으로 공유해요';renderFortune();}
    return;
  }
  if(!automatic){stopFortuneReconnect();fortuneReconnectAttempts=0;}
  else fortuneReconnectAttempts++;
  try{await connectFortuneCode(saved.code,{remember:false});}
  catch{if(fortuneSyncStatus==='offline')scheduleFortuneReconnect();}
}
function bootFortuneReconnect(){
  if(fortuneResumeHandlersReady)return;
  fortuneResumeHandlersReady=true;
  const resume=()=>{
    if(fortuneSyncStatus!=='offline'||typeof document!=='undefined'&&document.hidden||Date.now()-fortuneLastResumeAt<15000)return;
    fortuneLastResumeAt=Date.now();stopFortuneReconnect();fortuneReconnectAttempts=0;
    return retryFortuneConnection(true);
  };
  if(typeof window.addEventListener==='function'){
    window.addEventListener('online',resume);window.addEventListener('pageshow',resume);
    window.addEventListener('offline',()=>{if(fortuneLink||savedFortuneConnection().state==='saved'){fortuneSyncStatus='offline';fortuneSyncMessage='오프라인이에요 · 연결 정보는 보관 중';renderFortune();}});
  }
  if(typeof document!=='undefined'&&typeof document.addEventListener==='function')document.addEventListener('visibilitychange',resume);
}
async function connectFortuneCode(code,{remember=true,announce=false,requireExisting=false,seedLocal=true,replaceLocal=false}={}){
  if(fortuneConnectPending)throw new Error('연결을 확인하고 있어요. 잠시 기다려 주세요.');
  if(!db){fortuneSyncStatus='offline';fortuneSyncMessage='공유 서버 연결을 기다리고 있어요 · 연결 정보는 보관 중';renderFortune();throw new Error('Firebase 연결이 필요해요.');}
  if(!crypto||!crypto.subtle){fortuneSyncStatus='error';fortuneSyncMessage='이 브라우저에서는 암호화 연결을 사용할 수 없어요';renderFortune();throw new Error(fortuneSyncMessage);}
  // Validate before touching the current room; a failed switch must keep it alive.
  const normalized=normalizeFortuneCode(code),generation=++fortuneConnectGeneration;
  const previous=fortuneLink;
  const saved=savedFortuneConnection(),switching=!!(previous&&previous.code!==normalized||saved.state==='saved'&&saved.code!==normalized);
  const previousLocal=JSON.parse(JSON.stringify(FT)),previousContacts=typeof window.getPrivateContactVault==='function'?window.getPrivateContactVault():null;
  fortuneConnectPending=true;
  fortuneSyncStatus='connecting';fortuneSyncMessage='연결 확인 중…';renderFortune();
  let timeout=null,expired=false,remembered=false,applied=false;
  try{
    const material=await fortuneLinkMaterial(normalized);
    const ref=db.ref(FORTUNE_ROOM_ROOT+'/'+material.roomId);
    const assertCurrent=()=>{if(expired||generation!==fortuneConnectGeneration)throw new Error('연결 확인이 취소됐어요.');};
    const prepare=async()=>{
      const snap=await ref.once('value'),raw=snap.val()||{};assertCurrent();
      if(requireExisting&&(!raw.meta||raw.meta.version!==1)){const error=new Error('연결 코드를 찾지 못했어요. 코드를 다시 확인해 주세요.');error.fortuneInvalid=true;throw error;}
      await ref.child('meta').transaction(current=>current||{version:1,createdAt:Date.now(),encryption:'AES-GCM'});assertCurrent();
      if(seedLocal&&!switching)await seedFortuneRoom(raw,material);assertCurrent();
      return raw;
    };
    const raw=await Promise.race([prepare(),new Promise((_,reject)=>{timeout=setTimeout(()=>{expired=true;reject(new Error('연결이 늦어지고 있어요. 저장된 정보로 다시 연결할게요.'));},12000);})]);
    assertCurrent();
    if(remember){localStorage.setItem(FORTUNE_LINK_KEY,JSON.stringify({code:material.code}));remembered=true;}
    fortuneLink=material;applied=true;
    await applyFortuneRoom(raw,material,{replaceLocal:replaceLocal||switching});
    assertCurrent();
    detachFortuneRoom();
    fortuneRoomRef=ref;fortuneRoomHandler=s=>applyFortuneRoom(s.val()||{},material).catch(()=>{if(fortuneLink===material){fortuneSyncStatus='error';fortuneSyncMessage='공유 정보를 읽지 못했어요';renderFortune();}});
    ref.on('value',fortuneRoomHandler,()=>{if(fortuneLink===material){fortuneSyncStatus='offline';fortuneSyncMessage='연결이 끊겼어요 · 연결 정보는 보관 중';renderFortune();scheduleFortuneReconnect();}});
    stopFortuneReconnect();fortuneReconnectAttempts=0;
    if(!['error','offline'].includes(fortuneSyncStatus)){fortuneSyncStatus='synced';fortuneSyncMessage='자동 공유 중 · 다시 코드를 보낼 필요 없어요';}renderFortune();
    if(typeof renderSettingsExtras==='function')renderSettingsExtras();
    if(announce)toast('둘만의 운세가 연결됐어요 🔐');
    return material;
  }catch(error){
    if(generation===fortuneConnectGeneration){
      if(applied){
        fortuneLink=previous;fortuneRoomRevision++;
        try{saveFortuneLocal(previousLocal);}catch{FT=previousLocal;}
        if(previousContacts&&typeof window.applySharedPrivateContactVault==='function')try{window.applySharedPrivateContactVault(previousContacts);}catch{}
      }
      if(remembered)try{if(saved.state==='saved')localStorage.setItem(FORTUNE_LINK_KEY,JSON.stringify({code:saved.code}));else localStorage.removeItem(FORTUNE_LINK_KEY);}catch{}
      const keptPrevious=previous&&previous.code!==normalized&&fortuneLink===previous;
      fortuneSyncStatus=keptPrevious?'synced':error.fortuneInvalid?'invalid':'offline';
      fortuneSyncMessage=keptPrevious?'새 연결에 실패했어요 · 기존 연결은 유지돼요':error.fortuneInvalid?'연결 정보를 확인해 주세요':'연결을 기다리고 있어요 · 저장된 연결 정보는 그대로 보관 중';renderFortune();
    }
    throw error;
  }finally{if(timeout!==null)clearTimeout(timeout);fortuneConnectPending=false;}
}
async function bootFortuneContent(){
  if(!db){fortuneContentStatus='내장 콘텐츠 · 오프라인';return;}
  try{
    const ref=db.ref(FORTUNE_CONTENT_PATH);
    const tx=await ref.transaction(current=>current||FORTUNE_EDITORIAL_DEFAULT);
    const value=tx.snapshot.val();
    if(validEditorial(value)){window.fortuneEditorial=value;fortuneContentStatus='Firebase 편집 콘텐츠 v'+value.version;}
    else fortuneContentStatus='내장 콘텐츠 · DB 형식 확인 필요';
  }catch{fortuneContentStatus='내장 콘텐츠 · DB 연결 재시도 필요';}
  renderFortune();
}
async function bootFortuneServices(){
  bootFortuneReconnect();
  // Editorial loading must not delay restoring a remembered private connection.
  bootFortuneContent();
  const invitation=window.__azitFortuneInvite;delete window.__azitFortuneInvite;
  if(invitation){await receiveFortuneInvitation(invitation);return;}
  await retryFortuneConnection();
}
function fortuneInvitationUrl(code){
  const normalized=normalizeFortuneCode(code);
  return location.origin+location.pathname+'#azit-invite='+encodeURIComponent(normalized);
}
async function receiveFortuneInvitation(code){
  try{fortunePendingInvite=normalizeFortuneCode(code);}catch{fortunePendingInvite=null;await retryFortuneConnection();toast('초대 링크가 올바르지 않아요. 상대에게 다시 받아 주세요.');return;}
  const saved=savedFortuneConnection(),current=fortuneLink?fortuneLink.code:saved.state==='saved'?saved.code:null;
  const localVault=typeof window.getPrivateContactVault==='function'?window.getPrivateContactVault():null;
  const hasLocalData=Object.keys(FT.profiles||{}).length>0||Object.keys(FT.daily||{}).length>0||localVault&&Object.values(localVault.contacts||{}).some(value=>value&&['phone','kakao','emergency'].some(key=>value[key]));
  if(current&&current!==fortunePendingInvite||!current&&hasLocalData){
    await retryFortuneConnection();
    openAzitDialog('운세 공유 공간 바꾸기',`<p class="dialog-note">${current?'이 기기는 이미 다른 운세 공간에 연결되어 있어요.':'이 기기에만 저장된 운세 또는 연락처가 있어요.'} 초대받은 공간으로 바꾸면 이 기기의 운세·연락처 화면이 새 공간의 내용으로 바뀌어요. 기존 정보는 새 공간으로 보내지 않으며, 기기에만 있던 정보는 이 화면에서 사라져요.</p><button class="btn form-submit" onclick="acceptFortuneInvitation(this)">초대받은 공간으로 바꾸기</button><button class="btn ghost form-submit" onclick="cancelFortuneInvitation()">기존 정보 유지</button>`);
    return;
  }
  await acceptFortuneInvitation();
}
function cancelFortuneInvitation(){fortunePendingInvite=null;$('azitDialog').close();}
async function acceptFortuneInvitation(button){
  if(!fortunePendingInvite)return;
  try{
    if(button)button.disabled=true;
    await connectFortuneCode(fortunePendingInvite,{announce:true,requireExisting:true,seedLocal:false,replaceLocal:true});
    fortunePendingInvite=null;if($('azitDialog').open)$('azitDialog').close();
  }catch{
    if(button)button.disabled=false;
    openAzitDialog('초대 연결을 기다리고 있어요','<p class="dialog-note">아직 초대 공간에 연결하지 못했어요. 기존 연결 정보는 그대로 보관하고 있어요. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.</p><button class="btn form-submit" onclick="acceptFortuneInvitation(this)">초대 다시 연결</button><button class="btn ghost form-submit" onclick="cancelFortuneInvitation()">닫기</button>');
  }
}
async function persistFortuneProfile(w,value){
  if(fortuneLink){const path='profiles/'+w;await db.ref(fortuneRoomPath(path)).set(await encryptFortune(value,path));}
  const next=JSON.parse(JSON.stringify(FT));next.profiles[w]=value;saveFortuneLocal(next);
}
async function persistFortuneProfileDelete(w){
  if(fortuneLink){const path='profiles/'+w;await db.ref(fortuneRoomPath(path)).set(await encryptFortune(null,path));}
  const next=JSON.parse(JSON.stringify(FT));delete next.profiles[w];saveFortuneLocal(next);
}
async function persistFortuneDaily(w,key,value){
  const day=koreaDay(),path='daily/'+day+'/'+w+'/'+key;
  let winner=value;
  if(fortuneLink){
    const candidate=await encryptFortune(value,path),ref=db.ref(fortuneRoomPath(path));
    const tx=await ref.transaction(current=>current?undefined:candidate);
    const payload=tx.snapshot&&tx.snapshot.val?tx.snapshot.val():null;
    if(payload)winner=await decryptFortune(payload,path);
    else{const snap=await ref.once('value');if(snap.val())winner=await decryptFortune(snap.val(),path);}
  }
  let latest;try{latest=fortuneNormalize(JSON.parse(localStorage.getItem(FORTUNE_KEY)||'{}'));}catch{latest=FT;}
  const next=JSON.parse(JSON.stringify(latest));next.daily[day]=next.daily[day]||{};next.daily[day][w]=next.daily[day][w]||{};
  if(!next.daily[day][w][key])next.daily[day][w][key]=winner;
  Object.keys(next.daily).sort().slice(0,-30).forEach(k=>delete next.daily[k]);saveFortuneLocal(next);
  return winner;
}
async function persistPrivateContactVault(value,slot){
  if(!fortuneLink)return false;
  slot=String(slot);if(!/^[12]$/.test(slot))throw new Error('저장할 사람을 확인해 주세요.');
  const contact=sharedContactFromVault(value,slot),material=fortuneLink,path='contacts/'+slot;
  const candidate=await encryptFortune(contact,path,material);
  await db.ref(fortuneRoomPath(path,material)).set(candidate);
  return true;
}
function privateVaultIsShared(){return !!fortuneLink;}

function fortuneSyncCardHtml(){
  const connected=!!fortuneLink,failed=['error','offline','invalid'].includes(fortuneSyncStatus),klass=failed?' error':connected?' connected':'';
  return `<section class="fortune-sync${klass}"><div><span class="sync-dot" aria-hidden="true"></span><b>${connected?'둘만의 운세 자동 공유':'둘이 같은 운세 쓰기'}</b><small>${esc(fortuneSyncMessage)}<br>${esc(fortuneContentStatus)}</small></div>${fortuneSyncStatus==='offline'?'<button class="btn ghost sm" onclick="retryFortuneConnection()">다시 연결</button>':''}<button class="btn ghost sm" onclick="openFortuneLinkDialog()">${connected||failed?'연결 관리':'연결하기'}</button></section>`;
}
function openFortuneLinkDialog(showCode=''){
  const connected=!!fortuneLink;
  openAzitDialog('둘만의 운세 자동 공유',`
    <p class="dialog-note">상대가 처음 한 번 초대 링크를 열면 연결돼요. 다음 방문부터는 같은 브라우저에서 자동으로 공유하며, 잠시 인터넷이 끊겨도 연결 정보는 보관해요.</p>
    ${connected?`<div class="sync-state good">● 이 기기는 자동 공유에 연결되어 있어요</div><button class="btn form-submit" onclick="copyFortuneInvitation()">초대 링크 복사</button><label for="fortuneInviteLink">상대에게만 보낼 초대 링크</label><input id="fortuneInviteLink" value="${esc(fortuneInvitationUrl(fortuneLink.code))}" readonly onclick="this.select()"><p class="dialog-note">링크를 가진 사람은 운세와 공유 연락처에 접근할 수 있어요. 상대에게만 보내 주세요. 링크는 다시 사용할 수 있으며, 이 기기 연결 해제로 링크가 만료되지는 않아요.</p><details${showCode?' open':''}><summary>기존 코드로 연결하기</summary><div class="share-code-box"><code id="fortuneShareCode">${esc(fortuneLink.code)}</code><button class="btn ghost sm" onclick="copyFortuneCode()">코드 복사</button></div></details><button class="btn ghost form-submit" onclick="disconnectFortuneCode()">이 기기 연결 해제</button>`:`<button class="btn form-submit" onclick="createFortuneCode(this)">초대 링크 만들기</button><p class="dialog-note">상대에게 받은 초대 링크가 있다면 그 링크를 열어 주세요. 아직 연결하지 않은 정보는 이 기기에만 보관돼요.</p>${savedFortuneConnection().state==='saved'?'<button class="btn ghost form-submit" onclick="retryFortuneConnection()">저장된 연결 다시 연결</button>':''}<details><summary>기존 코드로 연결하기</summary><label for="fortuneCodeInput">상대가 보낸 연결 코드</label><input id="fortuneCodeInput" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="AZIT-…"><div id="fortuneLinkError" class="form-error" role="alert"></div><button class="btn ghost form-submit" onclick="joinFortuneCode(this)">이 코드로 연결</button></details>`}
    <p class="dialog-note">생년월일·만세력·타로·공유 연락처는 브라우저에서 암호화해 저장해요. 초대 링크와 연결 정보는 일반 백업에 포함하지 않아요.</p>`);
}
function revealFortuneCode(){if(fortuneLink)openFortuneLinkDialog(fortuneLink.code);}
async function createFortuneCode(button){
  try{if(button)button.disabled=true;const code=newFortuneCode();await connectFortuneCode(code,{announce:true});openFortuneLinkDialog();}catch(error){if(button)button.disabled=false;toast(error.message||'초대 링크를 만들지 못했어요');}
}
async function copyFortuneInvitation(){
  if(!fortuneLink)return;
  try{await navigator.clipboard.writeText(fortuneInvitationUrl(fortuneLink.code));toast('초대 링크를 복사했어요 · 상대에게 한 번만 보내 주세요');}
  catch{const input=$('fortuneInviteLink');if(input){input.focus();input.select();}toast('초대 링크를 길게 눌러 복사해 주세요');}
}
async function joinFortuneCode(button){
  const input=$('fortuneCodeInput'),error=$('fortuneLinkError');error.textContent='';
  try{if(button)button.disabled=true;await connectFortuneCode(input.value,{announce:true,requireExisting:true});$('azitDialog').close();}catch(e){if(button)button.disabled=false;error.textContent=e.message||'연결하지 못했어요. 다시 시도해 주세요.';input.focus();}
}
async function copyFortuneCode(){
  const code=$('fortuneShareCode');if(!code)return;
  try{await navigator.clipboard.writeText(code.textContent);toast('연결 코드를 복사했어요');}catch{toast('코드를 길게 눌러 복사해 주세요');}
}
function disconnectFortuneCode(){stopFortuneReconnect();fortuneReconnectAttempts=0;fortuneConnectGeneration++;detachFortuneRoom();fortuneLink=null;fortuneRoomRevision++;localStorage.removeItem(FORTUNE_LINK_KEY);fortuneSyncStatus='local';fortuneSyncMessage='이 기기에만 저장 중';$('azitDialog').close();renderFortune();if(typeof renderSettingsExtras==='function')renderSettingsExtras();toast('이 기기의 운세 연결을 해제했어요');}

window.__fortuneSyncTest={normalizeFortuneCode,newFortuneCode,fortuneLinkMaterial,encryptFortune,decryptFortune,validEditorial,defaultEditorial:FORTUNE_EDITORIAL_DEFAULT};

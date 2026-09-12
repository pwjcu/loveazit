/* Optional appearance and private contact settings. */
const PRIVATE_CONTACT_KEY='azit-private-contacts-v1';
const CONTACT_LIMITS={phone:20,kakao:30,emergency:20};
const CHARACTER_COLORS=['#e98fa5','#e7b46b','#86b7a0','#739bc2','#9c87bd','#6e6670'];
const CHARACTER_ACCESSORIES={none:'없음',bow:'리본',cap:'모자',flower:'꽃'};
let privateContacts=readPrivateContacts();
let settingsExtrasDraft=null;
let settingsExtrasRevealed=false;
let settingsExtrasSlot=null;
let settingsExtrasSignature='';
let contactsSaving=false;

function emptyContacts(){return{v:1,contacts:{'1':{phone:'',kakao:'',emergency:''},'2':{phone:'',kakao:'',emergency:''}}};}
function normalizePrivateContacts(value){
  const clean=emptyContacts(),source=value&&value.contacts&&typeof value.contacts==='object'?value.contacts:{};
  for(const slot of ['1','2'])for(const key of Object.keys(CONTACT_LIMITS)){
    clean.contacts[slot][key]=typeof(source[slot]||{})[key]==='string'?(source[slot][key].trim().slice(0,CONTACT_LIMITS[key])):'';
  }
  return clean;
}
function readPrivateContacts(){
  try{return normalizePrivateContacts(JSON.parse(localStorage.getItem(PRIVATE_CONTACT_KEY)||'null'));}catch{return emptyContacts();}
}
function writePrivateContacts(value){privateContacts=normalizePrivateContacts(value);localStorage.setItem(PRIVATE_CONTACT_KEY,JSON.stringify(privateContacts));}
function getPrivateContactVault(){return normalizePrivateContacts(privateContacts);}
function applySharedPrivateContactVault(value){
  const incoming=normalizePrivateContacts(value);
  if(JSON.stringify(incoming)===JSON.stringify(privateContacts))return;
  writePrivateContacts(incoming);renderSettingsExtras();
}
function applySharedPrivateContact(slot,value){
  if(!['1','2'].includes(String(slot)))return;
  const next=getPrivateContactVault();next.contacts[slot]=value||{phone:'',kakao:'',emergency:''};
  writePrivateContacts(next);renderSettingsExtras();
}

function contactDigits(value){return String(value||'').replace(/\D/g,'');}
function validContactPhone(value){const count=contactDigits(value).length;return!value||(/^[0-9+().\s-]+$/.test(value)&&count>=7&&count<=15);}
function validKakaoId(value){return!value||/^[A-Za-z0-9._-]{2,30}$/.test(value);}
function maskedContact(value){
  if(!value)return'입력 안 함';
  if(value.length<=4)return'•'.repeat(value.length);
  const visible=value.slice(-4),hidden=value.slice(0,-4).replace(/./g,'•');
  return hidden+visible;
}
function contactDraftFromDom(){
  const result={};
  for(const key of Object.keys(CONTACT_LIMITS)){const input=$('contact-'+key);result[key]=input?input.value:'';}
  return result;
}
function keepSettingsExtrasDraft(){settingsExtrasDraft=contactDraftFromDom();}
function selectSettingsPerson(slot){setWho(slot);settingsExtrasDraft=null;settingsExtrasRevealed=false;renderSettingsExtras(true);}
function revealPrivateContacts(){settingsExtrasRevealed=!settingsExtrasRevealed;renderSettingsExtras(true);}
function contactActions(key,value){
  if(!value||!settingsExtrasRevealed)return'';
  const copy=`<button type="button" class="settings-copy" onclick="copyPrivateContact('${key}')">복사</button>`;
  if(key==='phone'||key==='emergency'){
    const digits=contactDigits(value);return copy+(digits?`<a class="settings-call" href="tel:${digits}">전화</a>`:'');
  }
  return copy;
}
function characterSetting(){
  const slot=String(who===2?2:1),saved=(LV.characters&&LV.characters[slot])||{};
  return{shirt:CHARACTER_COLORS.includes(saved.shirt)?saved.shirt:(slot==='1'?'#7da7e8':'#ff9ab5'),hair:CHARACTER_COLORS.includes(saved.hair)?saved.hair:(slot==='1'?S.h1:S.h2),accessory:CHARACTER_ACCESSORIES[saved.accessory]?saved.accessory:'none'};
}
function colorChoices(kind,current){return CHARACTER_COLORS.map(color=>`<button type="button" class="look-color${color===current?' on':''}" style="--look-color:${color}" aria-label="${kind==='shirt'?'옷':'머리'} 색 ${color}" aria-pressed="${color===current}" onclick="saveCharacterLook('${kind}','${color}')"></button>`).join('');}
async function saveCharacterLook(kind,value){
  const slot=String(who===2?2:1);
  const defaults=characterSetting();
  if((kind==='shirt'||kind==='hair')&&!CHARACTER_COLORS.includes(value))return;
  if(kind==='accessory'&&!CHARACTER_ACCESSORIES[value])return;
  await changeWorld(state=>{state.characters=state.characters||{};state.characters[slot]={...defaults,...(state.characters[slot]||{}),[kind]:value};return{message:'캐릭터 옷차림을 바꿨어요'};});
  renderSettingsExtras(true);
}
function renderSettingsExtras(force=false){
  const root=$('settingsExtras');if(!root)return;
  const slot=String(who===2?2:1),existing=root.querySelector('.settings-extra');
  if(settingsExtrasSlot!==slot){settingsExtrasDraft=null;settingsExtrasRevealed=false;}
  const signature=JSON.stringify([slot,S.n1,S.n2,LV.characters,privateContacts,!!fortuneLink]);
  if(existing&&!force&&settingsExtrasSlot===slot&&signature===settingsExtrasSignature)return;
  const focus=document.activeElement,focusId=focus?.id?.startsWith('contact-')?focus.id:null,selection=focusId?[focus.selectionStart,focus.selectionEnd]:null;
  settingsExtrasSignature=signature;
  settingsExtrasSlot=slot;
  const stored=privateContacts.contacts[slot],draft=settingsExtrasDraft||stored,look=characterSetting(),name=slot==='1'?S.n1:S.n2;
  root.innerHTML=`<section class="card settings-extra">
    <div class="settings-extra-head"><div><h3>연락처와 캐릭터</h3><p>${esc(name)}의 선택 정보를 설정해요.</p></div><div class="settings-person" role="group" aria-label="설정할 사람"><button type="button" class="${slot==='1'?'on':''}" onclick="selectSettingsPerson(1)">${esc(S.n1)}</button><button type="button" class="${slot==='2'?'on':''}" onclick="selectSettingsPerson(2)">${esc(S.n2)}</button></div></div>
    <div class="settings-subtitle">캐릭터 옷차림</div>
    <div class="look-preview" aria-hidden="true">${typeof charG==='function'?`<svg viewBox="0 0 80 110">${charG(Number(slot),8,12,4)}</svg>`:'🧑'}</div>
    <div class="look-row"><span>옷</span><div class="look-colors">${colorChoices('shirt',look.shirt)}</div></div>
    <div class="look-row"><span>머리</span><div class="look-colors">${colorChoices('hair',look.hair)}</div></div>
    <label class="look-accessory">소품<select onchange="saveCharacterLook('accessory',this.value)">${Object.entries(CHARACTER_ACCESSORIES).map(([value,label])=>`<option value="${value}"${value===look.accessory?' selected':''}>${label}</option>`).join('')}</select></label>
    <div class="settings-subtitle contact-title"><span>선택 연락처</span><button type="button" class="contact-reveal" onclick="revealPrivateContacts()">${settingsExtrasRevealed?'가리기':'보기 · 수정'}</button></div>
    <p class="privacy-note">${fortuneLink?'둘만의 연결로 암호화해 공유해요. 초대 링크를 가진 기기에서 볼 수 있어요.':'지금은 이 브라우저에만 보관해요. 운세에서 초대 링크로 한 번 연결하면 연락처도 암호화해 공유해요.'}</p>
    ${[['phone','전화번호','전화번호'],['kakao','카카오톡 ID','영문·숫자·._-'],['emergency','비상 연락처','전화번호']].map(([key,label,placeholder])=>`<label class="contact-field"><span>${label} <small>선택</small></span><div><input type="text" id="contact-${key}" value="${esc(settingsExtrasRevealed?draft[key]:maskedContact(draft[key]))}" ${settingsExtrasRevealed?'':'readonly'} maxlength="${CONTACT_LIMITS[key]}" ${key==='kakao'?'autocapitalize="off" spellcheck="false"':'inputmode="tel"'} placeholder="${placeholder}" oninput="keepSettingsExtrasDraft()">${contactActions(key,draft[key])}</div></label>`).join('')}
    <div id="contactError" class="contact-error" role="alert"></div>
    <div class="contact-buttons"><button type="button" class="btn ghost sm" ${contactsSaving?'disabled':''} onclick="clearPrivateContacts()">이 사람 연락처 지우기</button><button type="button" class="btn sm" ${contactsSaving?'disabled':''} onclick="savePrivateContacts(this)">${contactsSaving?'저장 중…':'연락처 저장'}</button></div>
  </section>`;
  if(focusId&&$(focusId)&&settingsExtrasRevealed){$(focusId).focus({preventScroll:true});$(focusId).setSelectionRange(...selection);}
}
async function savePrivateContacts(button){
  if(contactsSaving)return;
  if(!settingsExtrasRevealed){settingsExtrasRevealed=true;renderSettingsExtras(true);$('contact-phone').focus();return;}
  const slot=String(who===2?2:1),draft=contactDraftFromDom();
  draft.phone=draft.phone.trim();draft.kakao=draft.kakao.trim();draft.emergency=draft.emergency.trim();
  const error=$('contactError');error.textContent='';
  if(!validContactPhone(draft.phone)){error.textContent='전화번호는 숫자 7~15자리로 입력해 주세요.';$('contact-phone').focus();return;}
  if(!validKakaoId(draft.kakao)){error.textContent='카카오톡 ID는 영문, 숫자, 마침표, 밑줄, 하이픈으로 2~30자까지 입력해 주세요.';$('contact-kakao').focus();return;}
  if(!validContactPhone(draft.emergency)){error.textContent='비상 연락처는 숫자 7~15자리로 입력해 주세요.';$('contact-emergency').focus();return;}
  if(button)button.disabled=true;contactsSaving=true;
  try{
    const next=getPrivateContactVault();next.contacts[slot]=draft;writePrivateContacts(next);
    if(typeof persistPrivateContactVault==='function')await persistPrivateContactVault(next,slot);
    settingsExtrasDraft=null;settingsExtrasRevealed=false;renderSettingsExtras(true);toast('선택 연락처를 안전하게 저장했어요');
  }catch{if($('contactError'))$('contactError').textContent='이 기기에 저장했지만 공유하지 못했어요. 연결을 확인하고 다시 저장해 주세요.';}
  finally{contactsSaving=false;document.querySelectorAll('.contact-buttons button').forEach(b=>b.disabled=false);const save=document.querySelector('.contact-buttons button:last-child');if(save)save.textContent='연락처 저장';}
}
async function clearPrivateContacts(){
  if(contactsSaving)return;contactsSaving=true;
  const slot=String(who===2?2:1),next=getPrivateContactVault();next.contacts[slot]={phone:'',kakao:'',emergency:''};writePrivateContacts(next);
  settingsExtrasDraft=null;settingsExtrasRevealed=false;renderSettingsExtras(true);
  try{if(typeof persistPrivateContactVault==='function')await persistPrivateContactVault(next,slot);toast('이 사람의 연락처를 지웠어요');}catch{toast('이 기기에서는 지웠지만 연결된 기기에 반영하지 못했어요');}
  finally{contactsSaving=false;renderSettingsExtras(true);}
}
async function copyPrivateContact(key){
  const value=settingsExtrasRevealed?$('contact-'+key)?.value.trim():' ';if(!value||!settingsExtrasRevealed)return;
  try{await navigator.clipboard.writeText(value);toast('복사했어요');}catch{toast('길게 눌러 복사해 주세요');}
}
function bootSettingsExtras(){privateContacts=readPrivateContacts();settingsExtrasDraft=null;settingsExtrasRevealed=false;renderSettingsExtras(true);}

window.getPrivateContactVault=getPrivateContactVault;
window.applySharedPrivateContactVault=applySharedPrivateContactVault;
window.applySharedPrivateContact=applySharedPrivateContact;

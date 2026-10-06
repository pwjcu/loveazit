/* Photo edits keep upload metadata; merging is one conflict-checked database write. */
let photoEditState=null;
const PHOTO_EDIT_CAP_LIMIT=5000;
document.body.insertAdjacentHTML('beforeend',`<dialog id="photoEditor" class="photo-editor" aria-labelledby="photoEditTitle">
  <form id="photoEditForm"><fieldset id="photoEditFields">
    <div class="photo-editor-heading"><div><small>OUR MEMORY, CONTINUED</small><h2 id="photoEditTitle">추억 이어 쓰기</h2></div><button type="button" class="btn ghost sm" id="photoEditCancel">닫기</button></div>
    <p class="photo-edit-hint">그날의 메모를 더하고, 흩어진 사진을 한 페이지로 모아요.</p>
    <label for="photoEditDate">추억 날짜</label><input type="date" id="photoEditDate" min="0001-01-01" max="9999-12-31" required>
    <label for="photoEditCaption">이 게시글의 메모</label><textarea id="photoEditCaption" rows="4" maxlength="5000" placeholder="미처 적지 못한 이야기를 남겨주세요"></textarea>
    <div class="photo-edit-section"><b id="photoEditCount"></b><div id="photoEditImages" class="photo-edit-images"></div>
      <button type="button" class="btn ghost sm photo-edit-add" onclick="$('photoEditFiles').click()">사진 추가</button><input id="photoEditFiles" type="file" aria-label="추억에 사진 추가" accept="image/*" multiple hidden><button type="button" class="btn ghost sm" id="photoEditClearFiles" hidden>추가 사진 취소</button>
      <p class="photo-edit-hint">기존 사진 뒤에 추가돼요 · 게시글 하나에 최대 20장</p></div>
    <details class="photo-edit-merge"><summary>예전에 올린 게시글과 합치기</summary>
      <p class="photo-edit-hint">선택한 게시글의 모든 사진과 메모가 이 게시글로 옮겨져요. 원래 게시글은 사라지고, 위에서 고른 날짜에 함께 남아요.</p>
      <label for="photoEditMergeDate">합칠 추억을 찾을 달 · 비우면 전체</label><input type="month" id="photoEditMergeDate">
      <div id="photoEditMerge"></div><div class="photo-edit-pages"><button type="button" class="btn ghost sm" id="photoEditMergePrev">이전</button><span id="photoEditMergePage" aria-live="polite"></span><button type="button" class="btn ghost sm" id="photoEditMergeNext">다음</button></div>
    </details>
    <div id="photoEditMergedNote" hidden><b>함께 보존할 이전 메모</b><p class="photo-edit-hint">원래 날짜와 메모를 수정한 메모 아래에 그대로 붙여 저장해요.</p><div id="photoEditMergedMemo"></div></div>
    <div id="photoEditStatus" role="alert" aria-live="polite"></div>
    <button class="btn" id="photoEditSave" type="submit">수정 저장</button>
  </fieldset></form>
</dialog>`);

function photoRecordValue(post){const {id,...value}=post;return value;}
function photoRecordFingerprint(value){
  if(value===null||typeof value!=='object')return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(photoRecordFingerprint).join(',')+']';
  return '{'+Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>JSON.stringify(k)+':'+photoRecordFingerprint(value[k])).join(',')+'}';
}
function openPhotoEditor(){
  if(photoEditState)return;
  const post=diaryPhotos().find(p=>p.id===activePhotoId);if(!post)return;
  const base=JSON.parse(JSON.stringify(post)),day=photoDiaryDay(base);
  photoEditState={base,posts:JSON.parse(JSON.stringify(diaryPhotos().filter(p=>p.id!==post.id))),selected:new Set(),added:[],page:1,busy:false};
  $('photoEditDate').value=day==='undated'?dayKey():day;
  $('photoEditCaption').value=base.cap||'';$('photoEditMergeDate').value=day==='undated'?'':day.slice(0,7);
  $('photoEditFiles').value='';$('photoEditStatus').textContent='';$('photoEditFields').disabled=false;$('photoEditSave').disabled=false;
  $('photoEditor').querySelector('details').open=false;renderPhotoEditMerge();renderPhotoEditSummary();$('photoEditor').showModal();
}
function photoEditSources(){return photoEditState.posts.filter(p=>photoEditState.selected.has(p.id));}
function photoEditSourceMemo(post){return post.cap?`[${photoDayLabel(photoDiaryDay(post))}의 메모]\n${post.cap}`:'';}
function renderPhotoEditSummary(){
  if(!photoEditState)return;
  const sources=photoEditSources(),images=[...photoImages(photoEditState.base),...sources.flatMap(photoImages),...photoEditState.added];
  $('photoEditCount').textContent=`사진 ${images.length} / ${PHOTO_POST_LIMIT}장${sources.length?` · ${sources.length}개 게시글 합치기`:''}`;
  $('photoEditImages').innerHTML=images.map((src,i)=>`<img src="${esc(src)}" alt="저장할 사진 ${i+1}" loading="lazy">`).join('');
  $('photoEditClearFiles').hidden=!photoEditState.added.length;
  const memo=sources.map(photoEditSourceMemo).filter(Boolean).join('\n\n');
  $('photoEditMergedNote').hidden=!memo;$('photoEditMergedMemo').textContent=memo;
}
function renderPhotoEditMerge(){
  if(!photoEditState)return;
  const month=$('photoEditMergeDate').value,posts=photoEditState.posts.filter(p=>!month||photoDiaryDay(p).startsWith(month+'-'));
  const pages=Math.max(1,Math.ceil(posts.length/10));photoEditState.page=Math.max(1,Math.min(photoEditState.page,pages));
  $('photoEditMerge').innerHTML=posts.slice((photoEditState.page-1)*10,photoEditState.page*10).map(p=>`<label class="photo-merge-option"><input type="checkbox" data-merge-id="${esc(p.id)}" ${photoEditState.selected.has(p.id)?'checked':''}><span>${photoImages(p)[0]?`<img src="${esc(photoImages(p)[0])}" alt="" loading="lazy">`:''}<span><b>${esc(photoDayLabel(photoDiaryDay(p)))} · ${photoImages(p).length}장</b><small>${esc(p.cap||'메모 없는 추억')}</small></span></span></label>`).join('')||'<p class="photo-edit-hint">이 달에 합칠 게시글이 없어요. 다른 달을 고르거나 월을 비워 전체 추억을 찾아보세요.</p>';
  $('photoEditMergePage').textContent=`${photoEditState.page} / ${pages}`;
  $('photoEditMergePrev').disabled=photoEditState.page<=1;$('photoEditMergeNext').disabled=photoEditState.page>=pages;
}
$('photoEditMergeDate').addEventListener('change',()=>{if(photoEditState){photoEditState.page=1;renderPhotoEditMerge();}});
$('photoEditMergePrev').onclick=()=>{photoEditState.page--;renderPhotoEditMerge();};
$('photoEditMergeNext').onclick=()=>{photoEditState.page++;renderPhotoEditMerge();};
$('photoEditMerge').addEventListener('change',e=>{
  const id=e.target.dataset.mergeId;if(!id||!photoEditState)return;
  e.target.checked?photoEditState.selected.add(id):photoEditState.selected.delete(id);renderPhotoEditSummary();
});
$('photoEditClearFiles').onclick=()=>{if(photoEditState){photoEditState.added=[];renderPhotoEditSummary();$('photoEditStatus').textContent='추가로 고른 사진을 취소했어요. 기존 사진은 유지돼요.';}};
function photoEditBusy(busy){
  if(photoEditState)photoEditState.busy=busy;
  $('photoEditFields').disabled=busy;$('photoEditSave').disabled=busy;$('photoEditor').setAttribute('aria-busy',String(busy));
}
$('photoEditFiles').onchange=async e=>{
  if(!photoEditState||photoEditState.busy)return;
  const files=Array.from(e.target.files||[]);if(!files.length)return;
  const total=photoImages(photoEditState.base).length+photoEditSources().flatMap(photoImages).length+photoEditState.added.length+files.length;
  if(total>PHOTO_POST_LIMIT){$('photoEditStatus').textContent='한 게시글에는 최대 20장까지 담을 수 있어요. 합칠 게시글이나 추가 사진 수를 줄여주세요.';e.target.value='';return;}
  if(files.some(f=>!f.type.startsWith('image/')||f.size>25*1024*1024)){$('photoEditStatus').textContent='25MB 이하의 사진 파일을 골라주세요.';e.target.value='';return;}
  photoEditBusy(true);
  try{
    const added=[];
    for(let i=0;i<files.length;i++){
      $('photoEditStatus').textContent=`사진 준비 중 · ${i+1}/${files.length}`;
      let img=await compress(files[i],900,.72);if(img.length>600000)img=await compress(files[i],600,.55);
      if(img.length>600000)throw Error('사진 용량이 커요. 조금 작은 사진으로 다시 골라주세요.');added.push(img);
    }
    photoEditState.added.push(...added);renderPhotoEditSummary();$('photoEditStatus').textContent='사진을 준비했어요. 수정 저장을 누르면 반영돼요.';
  }catch(error){$('photoEditStatus').textContent=error.message||'사진을 준비하지 못했어요. 다시 골라주세요.';}
  finally{e.target.value='';photoEditBusy(false);}
};

async function commitPhotoEdit(base,sources,next){
  const expected=[base,...sources],conflict='다른 기기에서 이 추억이 수정되거나 삭제됐어요. 입력한 메모를 복사해 두고, 편집창을 닫아 최신 내용을 확인한 뒤 다시 수정해 주세요.';
  const matches=(value,post)=>value&&photoRecordFingerprint(value)===photoRecordFingerprint(photoRecordValue(post));
  if(db){
    if(sources.length){
      // SDK transactions cap the entire photos branch at 16 MB. REST conditional
      // writes retain atomicity and conflict checks with the larger REST limit.
      const url=new URL(db.ref('photos').toString().replace(/\/$/,'')+'.json');
      const user=typeof db.app?.auth==='function'?db.app.auth().currentUser:null;
      if(user)url.searchParams.set('auth',await user.getIdToken());
      const request=async(target,options={})=>{
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
        try{return await fetch(target,{...options,cache:'no-store',signal:controller.signal});}finally{clearTimeout(timer);}
      };
      const read=async()=>{
        const response=await request(url,{headers:{'X-Firebase-ETag':'true'}});
        if(!response.ok)throw Error('추억을 불러오지 못했어요. 연결과 접근 권한을 확인하고 다시 시도해 주세요.');
        const etag=response.headers.get('ETag');if(!etag||etag==='*')throw Error('추억의 최신 상태를 확인하지 못해 저장을 멈췄어요. 잠시 후 다시 시도해 주세요.');
        return{current:await response.json(),etag};
      };
      const saved=current=>current&&photoRecordFingerprint(current[base.id])===photoRecordFingerprint(next)&&sources.every(p=>!current[p.id]);
      let committed=false;
      for(let attempt=0;attempt<3;attempt++){
        const {current,etag}=await read();if(saved(current)){committed=true;break;}
        if(!current||!expected.every(p=>matches(current[p.id],p)))throw Error(conflict);
        const result={...current,[base.id]:next};sources.forEach(p=>delete result[p.id]);
        const writeUrl=new URL(url);writeUrl.searchParams.set('print','silent');
        let response;
        try{response=await request(writeUrl,{method:'PUT',headers:{'Content-Type':'application/json','If-Match':etag},body:JSON.stringify(result)});}
        catch{
          // A dropped response may follow a successful write. Verify before a retry.
          try{if(saved((await read()).current)){committed=true;break;}}catch{}
          throw Error('저장 결과를 확인하지 못했어요. 메모를 복사해 두고 편집창을 닫아 반영됐는지 확인해 주세요.');
        }
        if(response.ok){committed=true;break;}
        if(response.status!==412)throw Error('추억을 합치지 못했어요. 연결과 저장 공간을 확인한 뒤 다시 시도해 주세요.');
      }
      if(!committed)throw Error('다른 기기에서도 추억을 정리 중이에요. 잠시 후 다시 저장해 주세요.');
    }else{
      // Warm the cache and compare inside every server retry for a single post.
      const ref=db.ref('photos/'+base.id);await ref.once('value');
      const tx=await ref.transaction(current=>matches(current,base)?next:undefined,undefined,false);
      if(!tx.committed)throw Error(conflict);
    }
    // REST and the realtime listener can finish in either order. Update only
    // unchanged cached records; a newer partner edit must keep its own value.
    photos=photos.filter(p=>!sources.some(source=>source.id===p.id&&matches(photoRecordValue(p),source))).map(p=>p.id===base.id&&matches(photoRecordValue(p),base)?{id:base.id,...next}:p);
  }else{
    const current=JSON.parse(localStorage.getItem('photos')||'[]');
    if(!expected.every(p=>{const found=current.find(row=>row.id===p.id);return found&&matches(photoRecordValue(found),p);} ))throw Error(conflict);
    const sourceIds=new Set(sources.map(p=>p.id));
    const result=current.filter(p=>!sourceIds.has(p.id)).map(p=>p.id===base.id?{id:base.id,...next}:p);
    // A single synchronous write means quota failure leaves all source posts intact.
    localStorage.setItem('photos',JSON.stringify(result));await refreshLocal('photos');
  }
}
async function savePhotoEditor(){
  if(!photoEditState||photoEditState.busy)return;
  const date=$('photoEditDate').value,caption=$('photoEditCaption').value.trim();
  if(!photoDateValid(date)||date<'0001-01-01'){$('photoEditStatus').textContent='추억 날짜를 올바르게 골라주세요.';$('photoEditDate').focus();return;}
  const {base,added}=photoEditState,sources=photoEditSources();
  const images=[...photoImages(base),...sources.flatMap(photoImages),...added];
  if(!images.length||images.length>PHOTO_POST_LIMIT){$('photoEditStatus').textContent='한 게시글에는 사진을 1장부터 최대 20장까지 담을 수 있어요. 합칠 게시글 수를 줄여주세요.';return;}
  const cap=[caption,...sources.map(photoEditSourceMemo)].filter(Boolean).join('\n\n');
  if(cap.length>PHOTO_EDIT_CAP_LIMIT){$('photoEditStatus').textContent='합친 메모가 5,000자를 넘어요. 이전 메모를 보존하려면 합칠 게시글 수를 줄여주세요.';return;}
  const next={...photoRecordValue(base),images,cap,date,memoryDate:date,updatedAt:appNow()};delete next.img;
  if(sources.length){
    const previous=Array.isArray(base.mergedPosts)?base.mergedPosts:base.mergedPosts&&typeof base.mergedPosts==='object'?Object.values(base.mergedPosts):[];
    next.mergedPosts=[...previous,...sources.map(p=>{const {images,img,...metadata}=p;return metadata;})];
  }
  photoEditBusy(true);$('photoEditStatus').textContent='추억을 안전하게 저장하고 있어요…';
  try{
    await commitPhotoEdit(base,sources,next);
    photoMonth=date.slice(0,7);photoSelectedDay=date;photoPage=1;
    const id=base.id;photoEditBusy(false);$('photoEditor').close();renderPhotos();
    const post=diaryPhotos().find(p=>p.id===id);if(post)openPhotoPost(post);
    toast(sources.length?'사진과 이전 메모를 한 추억으로 모았어요':'추억을 수정했어요');
  }catch(error){$('photoEditStatus').textContent=error.message||'저장하지 못했어요. 연결을 확인하고 다시 저장해 주세요.';}
  finally{photoEditBusy(false);}
}
$('photoEditForm').onsubmit=e=>{e.preventDefault();savePhotoEditor();};
$('photoEditCancel').onclick=()=>{if(!photoEditState?.busy)$('photoEditor').close();};
$('photoEditor').addEventListener('cancel',e=>{if(photoEditState?.busy)e.preventDefault();});
$('photoEditor').addEventListener('close',()=>{photoEditState=null;$('photoEditImages').replaceChildren();$('photoEditMerge').replaceChildren();$('photoEditMergedMemo').textContent='';});

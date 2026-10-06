const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('../output/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright');

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Users/pwjcu/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe'});
 const page=await browser.newPage({viewport:{width:390,height:844},timezoneId:'America/Los_Angeles',reducedMotion:'reduce'});
 const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
 const check=(value,label)=>{assert.ok(value,label);checks.push(label)};
 const seed=async rows=>page.evaluate(async posts=>{localStorage.setItem('photos',JSON.stringify(posts));await refreshLocal('photos')},rows);
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('photos')||'[]'));
 const openMemories=()=>page.locator('nav button').filter({hasText:'추억'}).click();
 const openEditor=async id=>{await page.evaluate(id=>{const post=photos.find(p=>p.id===id);photoMonth=photoDiaryDay(post).slice(0,7);photoSelectedDay=photoDiaryDay(post);renderPhotos();openPhotoPost(post);openPhotoEditor()},id);await page.locator('#photoEditor').waitFor({state:'visible'})};
 const cancel=async()=>{if(await page.locator('#photoEditor').isVisible())await page.locator('#photoEditCancel').click();if(await page.locator('#modal').isVisible())await page.locator('#modal button[aria-label="추억 사진 닫기"]').click()};
 const openMerge=async()=>{if(!await page.locator('#photoEditor details').evaluate(el=>el.open))await page.locator('#photoEditor details summary').click()};
 const save=async()=>{await page.locator('#photoEditSave').click();await page.waitForFunction(()=>!document.querySelector('#photoEditSave').disabled)};
 try{
  await page.goto((process.env.TEST_BASE_URL||'http://127.0.0.1:4173')+'/?local-preview=1');
  await page.waitForFunction(()=>typeof openPhotoEditor==='function');
  check(await page.evaluate(()=>db===null),'local-preview isolates every fixture from production Firebase');
  await seed([]);await openMemories();
  check(await page.locator('#photoMemoryDate').getAttribute('type')==='date','upload has a native memory-date picker');
  const images=await page.evaluate(()=>['#d2a383','#659b87','#78629e'].map(color=>{const canvas=document.createElement('canvas');canvas.width=120;canvas.height=90;const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,120,90);return canvas.toDataURL('image/png')}));
  const png={name:'late-memory.png',mimeType:'image/png',buffer:Buffer.from(images[0].split(',')[1],'base64')};
  const actualDay=await page.evaluate(()=>dayKey());
  await page.locator('#photoMemoryDate').fill('2024-02-29');await page.locator('#pcap').fill('늦게 올리는 윤일의 산책');
  await page.locator('#photoGroup').check();await page.locator('#pfile').setInputFiles([png,png]);
  await page.waitForFunction(()=>!photoUploadBusy&&photos.some(p=>p.cap==='늦게 올리는 윤일의 산책'));
  const uploaded=(await read()).find(p=>p.cap==='늦게 올리는 윤일의 산책');
  check(uploaded.memoryDate==='2024-02-29'&&uploaded.date==='2024-02-29','late upload stores the chosen memory date');
  check(uploaded.uploadedDay===actualDay&&Number.isFinite(uploaded.uploadedAt),'late upload keeps the actual upload timestamp and Korean day');
  check(await page.locator('#photoMonthInput').inputValue()==='2024-02','upload navigates to the chosen date, not today');
  check(await page.evaluate(p=>photoDiaryDay(p),uploaded)==='2024-02-29','calendar prioritizes the explicit memory date');
  const legacy=await page.evaluate(()=>[
   photoDiaryDay({uploadedDay:'2026-10-01',date:'2020-01-01',ts:Date.UTC(2021,0,1)}),
   photoDiaryDay({date:'2024-02-29'}),photoDiaryDay({date:'2023-02-29',ts:Date.UTC(2026,8,30,15)}),
  ]);
  assert.deepEqual(legacy,['2026-10-01','2024-02-29','2026-10-01']);checks.push('existing upload-date and legacy timestamp records retain their calendar dates');
  await page.reload();await openMemories();
  check(await page.evaluate(id=>photoDiaryDay(photos.find(p=>p.id===id)),uploaded.id)==='2024-02-29','chosen memory date survives reload');
  const stamp={uploadedAt:1709506800000,uploadedDay:'2024-03-04',ts:1709506800001,customMetadata:{preserved:true}};
  const base={id:'edit-base',images:[images[0]],cap:'처음 메모',memoryDate:'2024-02-29',date:'2024-02-29',...stamp};
  const source={id:'merge-source',images:[images[1],images[2]],cap:'따로 올렸던 소중한 메모',memoryDate:'2024-02-28',date:'2024-02-28',ts:1709107200000};
  const neighbor={id:'same-day',img:images[2],cap:'같은 날 다른 추억',memoryDate:'2024-02-29',date:'2024-02-29',ts:1709193600000};
  await seed([base,source,neighbor]);await openEditor(base.id);
  check(await page.locator('#photoEditDate').inputValue()==='2024-02-29','editor opens with the existing memory date');
  check(await page.locator('#photoEditCaption').getAttribute('maxlength')==='5000','editor allows long combined memos');
  const memo='나중에 기억난 말\n<img src=x onerror=alert(1)>';
  await page.locator('#photoEditDate').fill('2024-03-01');await page.locator('#photoEditCaption').fill(memo);await save();
  await page.locator('#photoEditor').waitFor({state:'hidden'});
  let updated=(await read()).find(p=>p.id===base.id);
  check(updated.memoryDate==='2024-03-01'&&updated.cap===memo,'editing changes memory date and multiline memo');
  check(updated.uploadedAt===stamp.uploadedAt&&updated.uploadedDay===stamp.uploadedDay&&updated.ts===stamp.ts&&updated.customMetadata.preserved,'editing preserves original upload metadata and unknown fields');
  check((await read()).find(p=>p.id===neighbor.id).cap===neighbor.cap,'same-date independent post is not overwritten by an edit');
  await cancel();await page.evaluate(id=>openPhotoPost(photos.find(p=>p.id===id)),base.id);
  check(await page.locator('#mcap').textContent()===memo&&await page.locator('#mcap img').count()===0,'edited memo renders as literal text without executable markup');await cancel();
  await openEditor(base.id);await page.locator('#photoEditFiles').setInputFiles([png]);await page.waitForFunction(()=>!document.querySelector('#photoEditSave').disabled);await save();await page.locator('#photoEditor').waitFor({state:'hidden'});
  updated=(await read()).find(p=>p.id===base.id);check((updated.images||[]).length===2,'additional photo joins the existing post');await cancel();
  await openEditor(base.id);await openMerge();await page.locator('#photoEditMergeDate').fill('2024-02');await page.locator('#photoEditMergeDate').dispatchEvent('change');
  await page.locator('#photoEditMerge [data-merge-id="merge-source"]').check();await save();await page.locator('#photoEditor').waitFor({state:'hidden'});
  const merged=await read();updated=merged.find(p=>p.id===base.id);
  check((updated.images||[]).length===4,'merging combines all original and added images');
  check(updated.cap.includes(memo)&&updated.cap.includes(source.cap)&&updated.cap.includes('2024년 02월 28일'),'merge preserves both memos with source-date context');
  check(!merged.some(p=>p.id===source.id)&&merged.some(p=>p.id===neighbor.id),'merge removes only selected source posts');
  check(updated.memoryDate==='2024-03-01'&&updated.uploadedAt===stamp.uploadedAt,'merge retains the chosen base date and original upload timestamp');await cancel();
  await page.reload();await openMemories();
  check((await read()).find(p=>p.id===base.id).images.length===4&&!(await read()).some(p=>p.id===source.id),'merged post and removal persist after reload');

  const full={...base,images:Array(20).fill(images[0])},extra={...source,images:[images[1]],memoryDate:'2024-02-29'};
  await seed([full,extra]);await openEditor(full.id);await openMerge();await page.locator('#photoEditMergeDate').fill('2024-02');await page.locator('#photoEditMergeDate').dispatchEvent('change');
  const beforeLimit=await read();const extraBox=page.locator('#photoEditMerge [data-merge-id="merge-source"]');
  if(!await extraBox.isDisabled()){await extraBox.check();if(!await page.locator('#photoEditSave').isDisabled())await save()}
  check(await page.locator('#photoEditor').isVisible()&&JSON.stringify(await read())===JSON.stringify(beforeLimit),'more than 20 merged photos cannot alter storage');await cancel();

  await seed([base,source,neighbor]);await openEditor(base.id);const failedDraft='저장 실패해도 다시 쓸 필요 없는 메모';await page.locator('#photoEditCaption').fill(failedDraft);
  await page.evaluate(()=>{window.__photoStorageSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='photos')throw Error('photo-edit-test-save-failure');return window.__photoStorageSet.call(this,key,value)}});
  try{await save();check(await page.locator('#photoEditor').isVisible()&&await page.locator('#photoEditCaption').inputValue()===failedDraft,'failed save retains the open editor and memo draft');check((await read()).find(p=>p.id===base.id).cap===base.cap,'failed save leaves the persisted post unchanged')}
  finally{await page.evaluate(()=>{Storage.prototype.setItem=window.__photoStorageSet;delete window.__photoStorageSet})}
  await save();await page.locator('#photoEditor').waitFor({state:'hidden'});check((await read()).find(p=>p.id===base.id).cap===failedDraft,'retained draft can be saved after failure');await cancel();

  await seed([base,source]);await openEditor(base.id);await openMerge();await page.locator('#photoEditMergeDate').fill('2024-02');await page.locator('#photoEditMergeDate').dispatchEvent('change');await page.locator('#photoEditMerge [data-merge-id="merge-source"]').check();
  await page.locator('#photoEditCaption').fill('합치기 전에 내가 쓰던 말');const concurrentSource={...source,cap:'상대가 먼저 수정한 메모'};await seed([base,concurrentSource]);
  await save();check(await page.locator('#photoEditor').isVisible()&&await page.locator('#photoEditCaption').inputValue()==='합치기 전에 내가 쓰던 말','concurrent source edit aborts merge and retains the draft');
  let concurrentRows=await read();check(concurrentRows.length===2&&concurrentRows.find(p=>p.id===source.id).cap===concurrentSource.cap&&concurrentRows.find(p=>p.id===base.id).cap===base.cap,'conflicted merge neither deletes the changed source nor overwrites the base');await cancel();
  await seed([base,source]);await openEditor(base.id);await page.locator('#photoEditCaption').fill('먼저 열었던 편집창');await seed([{...base,cap:'다른 기기의 새 메모'},source]);await save();
  check(await page.locator('#photoEditor').isVisible()&&(await read()).find(p=>p.id===base.id).cap==='다른 기기의 새 메모','concurrent base edit is protected from a stale editor');await cancel();
  await seed([base,source]);await openEditor(base.id);await openMerge();await page.locator('#photoEditMergeDate').fill('2024-02');await page.locator('#photoEditMergeDate').dispatchEvent('change');await page.locator('#photoEditMerge [data-merge-id="merge-source"]').check();await seed([base]);await save();
  check(await page.locator('#photoEditor').isVisible()&&(await read()).length===1&&(await read())[0].cap===base.cap,'removed source aborts merge instead of resurrecting its deleted photos');await cancel();

  await seed([base,source,neighbor]);await openEditor(base.id);await page.locator('#photoEditCaption').fill('취소할 편집');await page.locator('#photoEditCancel').click();
  check((await read()).find(p=>p.id===base.id).cap===base.cap,'cancel does not persist a changed draft');await cancel();
  fs.mkdirSync('output/playwright',{recursive:true});await page.setViewportSize({width:320,height:740});await openEditor(base.id);
  check(await page.evaluate(()=>{const r=document.querySelector('#photoEditor').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&document.documentElement.scrollWidth<=innerWidth}),'320px photo editor fits the viewport without page overflow');
  await page.screenshot({path:'output/playwright/photo-editing-320.png',animations:'disabled'});await cancel();
  const nav=page.locator('nav button');check((await nav.nth(6).innerText()).includes('운세')&&(await nav.nth(7).innerText()).includes('설정'),'fortune precedes settings in the bottom tabs');
  await nav.nth(6).click();check(await page.locator('#p7').isVisible()&&await nav.nth(6).getAttribute('aria-current')==='page','fortune tab activates the fortune page and correct button');
  await nav.nth(7).click();check(await page.locator('#p4').isVisible()&&await nav.nth(7).getAttribute('aria-current')==='page','settings tab activates the settings page and correct button');
  await page.evaluate(()=>goFortune());check(await page.locator('#p7').isVisible()&&await nav.nth(6).getAttribute('aria-current')==='page','fortune shortcut respects reordered navigation');
  assert.deepEqual(errors,[]);checks.push('no browser JavaScript errors');console.log(JSON.stringify({count:checks.length,checks},null,2));
 }catch(error){fs.mkdirSync('output/playwright',{recursive:true});await page.screenshot({path:'output/playwright/photo-editing-failure.png',fullPage:true}).catch(()=>{});throw error}
 finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});

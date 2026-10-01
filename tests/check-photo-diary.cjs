const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('../output/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright');

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Users/pwjcu/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe'});
 const page=await browser.newPage({viewport:{width:390,height:844},timezoneId:'America/Los_Angeles',reducedMotion:'reduce'});
 const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
 const check=(value,label)=>{assert.ok(value,label);checks.push(label)};
 const open=async()=>page.locator('nav button').filter({hasText:'추억'}).click();
 const seed=async posts=>page.evaluate(async rows=>{localStorage.setItem('photos',JSON.stringify(rows));await refreshLocal('photos')},posts);
 const close=async()=>{if(await page.locator('#modal').isVisible())await page.locator('#modal button[aria-label="추억 사진 닫기"]').click()};
 try{
  await page.goto((process.env.TEST_BASE_URL||'http://127.0.0.1:4173')+'/?local-preview=1');
  check(await page.evaluate(()=>db===null),'local-preview keeps production database untouched');
  check(await page.evaluate(()=>typeof photoDiaryDay==='function'),'photo diary API is present');
  await seed([]);await open();
  check(await page.locator('#photoCalendar').isVisible(),'calendar is the default memory view');
  check(await page.locator('#photoMonthInput').getAttribute('type')==='month','month picker has native month input');
  check(await page.evaluate(()=>{selectPhotoDay('2024-02-15',false);return !document.querySelector('#modal').open}),'empty day does not open a blank photo');
  await page.locator('#photoMonthInput').fill('2024-02');await page.locator('#photoMonthInput').dispatchEvent('change');
  check(await page.locator('[data-photo-day^="2024-02-"]').count()===29,'leap February contains 29 dates');
  const col=await page.evaluate(()=>{const first=document.querySelector('[data-photo-day="2024-02-01"]').getBoundingClientRect(),sun=document.querySelector('[data-photo-day="2024-02-04"]').getBoundingClientRect(),next=document.querySelector('[data-photo-day="2024-02-05"]').getBoundingClientRect();return Math.round((first.left-sun.left)/(next.left-sun.left))});
  check(col===4,'February 1 Thursday appears in the correct Sunday-first column');
  await page.locator('#photoPrevMonth').click();check(await page.locator('#photoMonthInput').inputValue()==='2024-01','previous month navigation');
  await page.locator('#photoPrevMonth').click();check(await page.locator('#photoMonthInput').inputValue()==='2023-12','previous month crosses year');
  await page.locator('#photoNextMonth').click();check(await page.locator('#photoMonthInput').inputValue()==='2024-01','next month crosses year');
  const dayCases=await page.evaluate(()=>[
   photoDiaryDay({uploadedDay:'2026-10-01',date:'2020-01-01',ts:Date.UTC(2021,0,1)}),
   photoDiaryDay({date:'2024-02-29',ts:Date.UTC(2026,0,1)}),
   photoDiaryDay({date:'2023-02-29',ts:Date.UTC(2026,8,30,15,0,0)}),
   photoDiaryDay({ts:Date.UTC(2026,8,30,14,59,59)}),
   photoDiaryDay({date:'not-a-date'}),
  ]);
  assert.deepEqual(dayCases.slice(0,4),['2026-10-01','2024-02-29','2026-10-01','2026-09-30']);checks.push('upload day priority, valid legacy dates, leap validation, and KST midnight');
  check(dayCases[4]==='undated','undated legacy photo has no invented upload date');
  const images=await page.evaluate(()=>['#cc9865','#72a898'].map(color=>{const canvas=document.createElement('canvas');canvas.width=240;canvas.height=180;const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,240,180);ctx.fillStyle='#fff0c8';ctx.fillRect(36,30,168,100);return canvas.toDataURL('image/png')}));
  const rows=Array.from({length:21},(_,i)=>({id:'leap-'+i,img:images[0],cap:'우리의 산책 '+i,date:'2024-02-29',ts:1709193600000+i}));
  rows[20]={...rows[20],images,cap:'<img src=x onerror=alert(1)>'};delete rows[20].img;
  rows.push({id:'previous-day',img:images[1],date:'2024-02-28',cap:'전날의 추억',ts:1709107200000},{id:'undated',img:images[1],cap:'날짜 없는 옛 추억'});
  await seed(rows);await page.evaluate(()=>{setPhotoMonth('2024-02');selectPhotoDay('2024-02-29',false)});
  check(await page.locator('[data-photo-day="2024-02-29"] img').count()>=1,'calendar day contains uploaded photo thumbnail');
  check(await page.locator('#pgrid .photo-tile').count()===20&&/1 \/ 2/.test(await page.locator('#photoPageLabel').innerText()),'selected day contains 20 posts per page');
  check((await page.locator('#photoDayTitle').innerText()).includes('2024년 02월 29일'),'selected day heading reflects active date');
  await page.locator('#photoNextPage').click();check(await page.locator('#pgrid .photo-tile').count()===1&&/2 \/ 2/.test(await page.locator('#photoPageLabel').innerText()),'second page shows only the remaining post');
  await seed(rows.filter(row=>row.id!=='leap-0'));
  check(/1 \/ 1/.test(await page.locator('#photoPageLabel').innerText()),'remote deletion clamps current page');
  await page.locator('[data-photo-day="2024-02-29"]').click();
  check(await page.locator('#modal').isVisible(),'calendar thumbnail opens enlarged photo directly');
  check(await page.locator('#mcap').innerText()==='<img src=x onerror=alert(1)>','photo memo is displayed as literal text');
  check(await page.locator('#mcap img').count()===0,'photo memo cannot create executable markup');
  check((await page.locator('#mdate').innerText()).includes('2024')&&(await page.locator('#mdate').innerText()).includes('29'),'modal displays stored upload date');
  check(await page.locator('#photoSlider').isVisible()&&/1 \/ 2/.test(await page.locator('#photoSlideCount').innerText()),'legacy grouped images remain slides');
  await page.locator('#photoNextSlide').click();check(/2 \/ 2/.test(await page.locator('#photoSlideCount').innerText()),'slide button advances within grouped post');
  await page.keyboard.press('ArrowLeft');check(/1 \/ 2/.test(await page.locator('#photoSlideCount').innerText()),'left arrow selects previous image');
  await page.locator('#mimg').dispatchEvent('touchstart',{touches:[{identifier:0,clientX:250,clientY:200}]});await page.locator('#mimg').dispatchEvent('touchend',{changedTouches:[{identifier:0,clientX:100,clientY:204}]});
  check(/2 \/ 2/.test(await page.locator('#photoSlideCount').innerText()),'horizontal swipe selects next image');
  await page.locator('#photoNextPost').click();check((await page.locator('#mcap').innerText()).startsWith('우리의 산책'),'post navigation opens another post on same date');
  check(!await page.locator('#photoSlider').isVisible(),'single legacy image hides slide controls');
  await page.locator('#photoPrevPost').click();check(await page.locator('#mcap').innerText()==='<img src=x onerror=alert(1)>','previous post returns to grouped memory');
  await close();await page.waitForFunction(()=>document.activeElement?.getAttribute('data-photo-day')==='2024-02-29');checks.push('closing enlarged photo restores calendar focus');
  await page.locator('#photoUndated').click();check((await page.locator('#photoDayTitle').innerText()).includes('날짜 없는')&&await page.locator('#pgrid .photo-tile').count()===1,'undated legacy memory remains reachable');
  await page.locator('#pgrid .photo-tile').click();check(await page.locator('#mcap').innerText()==='날짜 없는 옛 추억','undated legacy memory can be enlarged');await close();
  await page.evaluate(()=>{window.__diaryNow=Date.now;Date.now=()=>Date.UTC(2026,8,30,15,0,0)});
  const png={name:'diary.png',mimeType:'image/png',buffer:Buffer.from(images[0].split(',')[1],'base64')};
  const memoryMemo='한국 자정에 남긴 추억\n'+('함께한 산책과 작은 발견을 오래 기억하고 싶어요. '.repeat(20)).slice(0,486)+'.';
  check(await page.locator('#pcap').evaluate(el=>el.tagName==='TEXTAREA'&&el.maxLength===500),'diary memo accepts multiline entries up to 500 characters');
  await page.locator('#pcap').fill(memoryMemo);await page.locator('#photoGroup').check();await page.locator('#pfile').setInputFiles([png,png]);
  await page.waitForFunction(()=>!photoUploadBusy&&document.querySelector('#photoUploadStatus').textContent.includes('저장했어요'));
  const uploaded=await page.evaluate(cap=>photos.find(p=>p.cap===cap),memoryMemo);
  check(uploaded.uploadedDay==='2026-10-01'&&uploaded.date==='2026-10-01'&&uploaded.uploadedAt===Date.UTC(2026,8,30,15,0,0),'new upload records timestamp and KST day despite different device timezone');
  check(await page.locator('#photoMonthInput').inputValue()==='2026-10'&&await page.locator('#pgrid .photo-count').count()===1,'upload jumps to its calendar day');
  await page.evaluate(()=>{Date.now=window.__diaryNow;delete window.__diaryNow});
  await page.reload();await open();await page.evaluate(()=>{setPhotoMonth('2026-10');selectPhotoDay('2026-10-01',false)});
  check(await page.locator('#pgrid .photo-count').count()===1,'new grouped diary entry survives reload');
  await page.locator('#pgrid .photo-tile').click();check(await page.locator('#mcap').textContent()===memoryMemo,'long multiline memo survives upload and reload');await close();await page.waitForFunction(()=>document.activeElement?.classList.contains('photo-tile'));checks.push('closing a photo opened from a day tile restores tile focus');
  await page.locator('#photoGroup').uncheck();const before=await page.evaluate(()=>photos.length);await page.locator('#pfile').setInputFiles([png,png]);await page.waitForFunction(()=>!photoUploadBusy&&document.querySelector('#photoUploadStatus').textContent.includes('2개의 추억'));
  check(await page.evaluate(()=>photos.length)===before+2,'ungrouped upload preserves independent diary posts');
  const invalidBefore=await page.evaluate(()=>photos.length);await page.locator('#pfile').setInputFiles(Array.from({length:22},(_,i)=>({...png,name:`${i}.png`})));
  check((await page.locator('#photoUploadStatus').innerText()).includes('최대 20장')&&await page.evaluate(()=>photos.length)===invalidBefore,'22 selected files are rejected without writes');
  await page.locator('#pcap').fill('실패해도 남아야 할 메모');await page.evaluate(()=>{window.__diaryAdd=DB.add;DB.add=async()=>{throw Error('diary-test-save-failure')}});
  try{await page.locator('#pfile').setInputFiles([png]);await page.waitForFunction(()=>!photoUploadBusy&&document.querySelector('#photoUploadStatus').textContent.includes('diary-test-save-failure'));check(await page.locator('#pcap').inputValue()==='실패해도 남아야 할 메모'&&!await page.locator('#pfile').isDisabled()&&await page.evaluate(()=>photos.length)===invalidBefore,'failed upload preserves draft, restores input, and adds no post');}finally{await page.evaluate(()=>{DB.add=window.__diaryAdd;delete window.__diaryAdd})}
  await page.locator('#pcap').fill('');await page.evaluate(()=>{setPhotoMonth('2026-10');selectPhotoDay('2026-10-01',false)});
  await page.locator('#pgrid .photo-tile').first().click();const deleteId=await page.evaluate(()=>activePhotoId);page.once('dialog',d=>d.accept());await page.locator('#mdel').click();
  await page.waitForFunction(id=>!photos.some(p=>p.id===id),deleteId);check(!await page.locator('#modal').isVisible(),'deleting a diary post closes its enlarged view');
  await page.evaluate(()=>{setPhotoMonth('2024-02');selectPhotoDay('2024-02-29',false)});
  fs.mkdirSync('output/playwright',{recursive:true});
  for(const width of [320,390,1280]){
   await page.setViewportSize({width,height:900});await page.locator('#photoCalendar').scrollIntoViewIfNeeded();
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px calendar has no page overflow`);
   check(await page.locator('[data-photo-day="2024-02-29"]').isVisible(),`${width}px calendar thumbnail remains visible`);
   await page.screenshot({path:`output/playwright/photo-diary-${width}.png`,fullPage:true,animations:'disabled'});
  }
  await page.setViewportSize({width:320,height:740});await page.locator('[data-photo-day="2024-02-29"]').click();await page.screenshot({path:'output/playwright/photo-diary-modal-320.png',animations:'disabled'});
  check(await page.evaluate(()=>{const box=document.querySelector('#modal').getBoundingClientRect();return box.left>=0&&box.right<=innerWidth&&box.top>=0&&box.bottom<=innerHeight}),'320px enlarged photo fits the visible viewport');await close();
  await page.locator('#photoToday').click();check(await page.evaluate(()=>photoMonth===new Date(Date.now()+9*3600000).toISOString().slice(0,7)),'today button returns to current Korean month');
  assert.deepEqual(errors,[]);checks.push('no browser JavaScript errors');
  console.log(JSON.stringify({count:checks.length,checks},null,2));
 }catch(error){await page.screenshot({path:'output/playwright/photo-diary-failure.png',fullPage:true}).catch(()=>{});throw error}
 finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});

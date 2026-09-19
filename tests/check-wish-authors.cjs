const {chromium}=require('../output/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Users/pwjcu/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe'});
 const page=await browser.newPage({viewport:{width:320,height:740}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const open=async()=>{await page.locator('nav button').filter({hasText:'달력'}).click();await page.locator('#wishesTab').click()};
 try{
  await page.goto((process.env.TEST_BASE_URL||'http://127.0.0.1:4173')+'/?local-preview=1');
  assert.equal(await page.evaluate(()=>db),null);
  await page.evaluate(()=>{localStorage.removeItem('wishes');localStorage.setItem('who','2')});await page.reload();await open();
  assert.equal(await page.locator('#wishAuthor').inputValue(),'2');
  for(const slot of [1,2]){await page.locator('#wishAuthor').selectOption(String(slot));await page.locator('#wishTitle').fill('아이디어 '+slot);await page.locator('#wishNote').fill('원래 메모 '+slot);await page.locator('#wishSave').click();await page.waitForFunction(()=>!wishBusy)}
  await page.reload();await open();
  assert.deepEqual(await page.evaluate(()=>wishes.map(w=>w.who).sort()),[1,2]);
  const first=page.locator('.wish-item').filter({hasText:'아이디어 1'});await first.locator('[data-wish-action=edit]').click();
  assert.equal(await page.locator('#wishAuthor').inputValue(),'1');await page.locator('#wishTitle').fill('수정 아이디어');
  await page.evaluate(()=>{setWho(2);renderAll()});assert.equal(await page.locator('#wishAuthor').inputValue(),'1');
  assert.equal(await page.locator('#wishTitle').inputValue(),'수정 아이디어');await page.locator('#wishSave').click();await page.waitForFunction(()=>!wishBusy);
  assert.deepEqual(await page.evaluate(()=>{const w=wishes.find(w=>w.title==='수정 아이디어');return [w.who,w.note]}),[1,'원래 메모 1']);
  await page.locator('.wish-item').filter({hasText:'수정 아이디어'}).locator('[data-wish-action=edit]').click();await page.locator('#wishAuthor').selectOption('2');await page.locator('#wishSave').click();await page.waitForFunction(()=>!wishBusy);
  assert.equal(await page.evaluate(()=>wishes.find(w=>w.title==='수정 아이디어').who),2);
  await page.locator('#wishAuthor').selectOption('1');await page.locator('#wishTitle').fill('실패 후 재시도');
  await page.evaluate(()=>{window.originalWishAdd=DB.add;DB.add=async()=>{throw Error('test failure')}});await page.locator('#wishSave').click();await page.waitForFunction(()=>!wishBusy);
  assert.match(await page.locator('#wishError').innerText(),/저장하지 못/);assert.equal(await page.locator('#wishAuthor').inputValue(),'1');assert.equal(await page.locator('#wishTitle').inputValue(),'실패 후 재시도');
  await page.evaluate(()=>{DB.add=async(branch,data)=>{await new Promise(resolve=>window.finishWishSave=resolve);return window.originalWishAdd(branch,data)}});
  await page.locator('#wishSave').click();await page.evaluate(()=>{setWho(2);renderAll();window.finishWishSave()});await page.waitForFunction(()=>!wishBusy);
  assert.equal(await page.evaluate(()=>wishes.find(w=>w.title==='실패 후 재시도').who),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);console.log('PASS: two authors, reload, preserved edit author and notes, explicit author change, remote render draft, failure retry, in-flight identity, 320px layout');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

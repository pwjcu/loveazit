const {chromium}=require('../output/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright');
const assert=require('node:assert/strict');
const clone=x=>JSON.parse(JSON.stringify(x));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Users/pwjcu/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe'});
 const page=await browser.newPage({viewport:{width:320,height:740}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=(process.env.TEST_BASE_URL||'http://127.0.0.1:4173')+'/?local-preview=1';
 try{
  await page.goto(url);assert.equal(await page.evaluate(()=>db),null);
  assert.deepEqual(await page.evaluate(()=>{const s=defaultLiving();s.hearts=0;const d=dayKey(),result=[];for(let i=0;i<4;i++)result.push(grantHeart(s,'care',2,d));for(const kind of ['visit','note','photo','qa'])result.push(grantHeart(s,kind,3,d));return {result,hearts:s.hearts,cap:DAILY_HEART_CAP,seed:CROP_SEED_COST}}),{result:[true,true,true,false,true,true,true,false],hearts:15,cap:16,seed:2});
  await page.evaluate(async()=>{LV=defaultLiving();LV.hearts=16;LV.rewardLedger={[dayKey()]:{earned:16,counts:{}}};LV.pantry={tomato:20};await saveLiving();renderAll();openWorldPantry()});
  await page.locator('#produceTrade').click();await page.waitForFunction(()=>!worldBusy);
  assert.deepEqual(await page.evaluate(()=>[LV.hearts,LV.pantry.tomato,produceTradeUsed()]),[22,16,1]);
  await page.reload();await page.evaluate(()=>openWorldPantry());assert.equal(await page.evaluate(()=>produceTradeUsed()),1);
  await page.locator('#produceTrade').click();await page.waitForFunction(()=>!worldBusy);assert.equal(await page.locator('#produceTrade').isDisabled(),true);
  const capped=await page.evaluate(()=>JSON.stringify(LV));await page.evaluate(()=>tradeProduce());assert.equal(await page.evaluate(()=>JSON.stringify(LV)),capped);
  await page.evaluate(()=>{LV.produceTrades={};LV.pantry={tomato:3}});const poor=await page.evaluate(()=>JSON.stringify(LV));await page.evaluate(()=>tradeProduce());assert.equal(await page.evaluate(()=>JSON.stringify(LV)),poor);
  const costs=await page.evaluate(()=>({id:Object.keys(FURNITURE).find(id=>!FURNITURE[id].seasonal),seasonal:Object.values(FURNITURE).filter(f=>f.seasonal).map(furnitureProduceCost)}));assert.deepEqual(costs.seasonal,[12,18,24]);
  await page.evaluate(()=>{LV.pantry={tomato:100};LV.hearts=28;LV.ownedFurniture=[];LV.furniture={};openFurnitureWorkshop()});
  const cost=await page.evaluate(id=>furnitureProduceCost(FURNITURE[id]),costs.id);
  await page.locator(`[data-furniture-id="${costs.id}"]`).click();await page.waitForFunction(()=>!worldBusy);
  assert.deepEqual(await page.evaluate(()=>[LV.hearts,LV.pantry.tomato]),[28,100-cost]);
  const crafted=await page.evaluate(()=>JSON.stringify(LV));await page.evaluate(id=>buyFurniture(id,'produce'),costs.id);assert.equal(await page.evaluate(()=>JSON.stringify(LV)),crafted);
  await page.evaluate(id=>buyFurniture(id),costs.id);await page.evaluate(id=>buyFurniture(id),costs.id);assert.deepEqual(await page.evaluate(()=>[LV.hearts,LV.pantry.tomato]),[28,100-cost]);
  const dates=['2026-11-14T14:59:59Z','2026-11-14T15:00:00Z','2027-01-07T14:59:59Z','2027-01-07T15:00:00Z'];assert.deepEqual(await page.evaluate(dates=>dates.map(christmasShopOpen),dates),[false,true,true,false]);
  await page.evaluate(()=>{serverTimeOffset=new Date('2026-10-01T00:00:00Z').getTime()-Date.now()});const closed=await page.evaluate(()=>JSON.stringify(LV));assert.equal(await page.evaluate(()=>buyFurniture('xmasLights','produce')),false);assert.equal(await page.evaluate(()=>JSON.stringify(LV)),closed);
  await page.evaluate(()=>{serverTimeOffset=new Date('2026-12-01T00:00:00Z').getTime()-Date.now()});assert.equal(await page.evaluate(()=>buyFurniture('xmasLights','produce')),true);
  await page.evaluate(()=>{serverTimeOffset=new Date('2027-03-01T00:00:00Z').getTime()-Date.now()});const wallet=await page.evaluate(()=>[LV.hearts,LV.pantry.tomato]);await page.evaluate(()=>buyFurniture('xmasLights'));await page.evaluate(()=>buyFurniture('xmasLights'));assert.deepEqual(await page.evaluate(()=>[LV.hearts,LV.pantry.tomato]),wallet);assert.equal(await page.evaluate(()=>LV.furniture.light),'xmasLights');
  await page.evaluate(()=>openWorldPantry());assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:'output/playwright/harvest-economy-320.png',fullPage:true});
  let shared={value:await page.evaluate(()=>{const s=defaultLiving();s.hearts=16;s.pantry={tomato:100};s.produceTrades={[dayKey()]:1};s.ownedFurniture=[];s.furniture={};return s}),revision:1};
  const clients=await Promise.all([browser.newPage(),browser.newPage()]);
  for(const client of clients){await client.exposeFunction('__readHarvest',()=>clone(shared));await client.exposeFunction('__casHarvest',(revision,value)=>{if(revision!==shared.revision)return false;shared={value:clone(value),revision:revision+1};return true});await client.goto(url);await client.evaluate(()=>{if(db!==null)throw Error('Not local preview');serverTimeOffset=new Date('2027-03-01T00:00:00Z').getTime()-Date.now();db={ref(path){if(path!=='living')throw Error(path);return{transaction:async edit=>{for(let i=0;i<30;i++){const current=await window.__readHarvest(),next=edit(structuredClone(current.value));if(next===undefined)return{committed:false,snapshot:{val:()=>current.value}};if(await window.__casHarvest(current.revision,next))return{committed:true,snapshot:{val:()=>next}}}throw Error('retry limit')}}}}});}
  const sync=()=>Promise.all(clients.map(client=>client.evaluate(s=>{LV=mergeLiving(s);renderAll()},clone(shared.value))));await sync();
  await Promise.all(clients.map(client=>client.evaluate(()=>tradeProduce())));assert.equal(shared.value.hearts,22);assert.equal(shared.value.pantry.tomato,96);assert.equal(Object.values(shared.value.produceTrades)[0],2);
  await sync();await Promise.all(clients.map(client=>client.evaluate(id=>buyFurniture(id,'produce'),costs.id)));assert.equal(shared.value.pantry.tomato,96-cost);assert.equal(shared.value.ownedFurniture.filter(id=>id===costs.id).length,1);assert.equal(shared.value.hearts,22);
  assert.deepEqual(errors,[]);console.log('PASS harvest economy: UI/reload/shared cap/insufficient rollback/craft/free reapply/Christmas KST boundaries/year-round owned/CAS concurrent trade and craft/320px');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

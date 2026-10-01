/* Local-only checks: never read or write the production database. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {chromium}=require('../output/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright');
const source=fs.readFileSync(require('node:path').join(__dirname,'../assets/together.js'),'utf8');
const context=vm.createContext({Intl,Date,Object,Number,String,Math,Set});vm.runInContext(source,context);
let checks=0;const check=(value,name)=>{assert.ok(value,name);checks++;};
const clone=value=>JSON.parse(JSON.stringify(value));
const questionCount=vm.runInContext('TOGETHER_PROMPTS.length',context);
const legacy={together:{total:2,days:{'2026-09-12':{1:{answer:'예전 그대로',mood:'hug'},2:{answer:'다시 읽기'},completed:true},'2026-09-13':{2:{mood:'sun'}},'2026-10-01':{}}}};
const before=JSON.stringify(legacy);const migrated=context.togetherState(legacy);
check(migrated.days['2026-09-12'].question===context.togetherLegacyPrompt('2026-09-12'),'legacy answers recover the original fourteen-question date mapping');
check(migrated.days['2026-09-13'].question===context.togetherLegacyPrompt('2026-09-13'),'mood-only legacy record also keeps its question');
check(!migrated.days['2026-10-01'].question,'empty new day is not mistaken for a legacy question');
check(JSON.stringify(legacy)===before,'reading old history never mutates the source');
context.togetherReserve(legacy,'2026-10-01');
check(legacy.together.days['2026-09-12'].question===migrated.days['2026-09-12'].question&&legacy.together.version===2,'a transaction persists legacy question snapshots');
check(![migrated.days['2026-09-12'].question,migrated.days['2026-09-13'].question].includes(legacy.together.days['2026-10-01'].question),'new selection excludes questions in legacy records');
const full={};const questions=[];
for(let i=0;i<questionCount;i++){
  const day=new Date(Date.UTC(2027,0,1+i)).toISOString().slice(0,10);
  context.togetherReserve(full,day);questions.push(full.together.days[day].question);
  context.togetherEdit(full,day,1,'answer','이야기 '+i,full.together.days[day].question);
}
check(new Set(questions.map(context.togetherQuestionKey)).size===questionCount,'every catalog question is unique and selected only once');
check(Object.keys(full.together.days).length===questionCount&&full.together.days['2027-01-01'][1].answer==='이야기 0','answers remain after more than sixty days');
const extra='2028-01-01';context.togetherReserve(full,extra);
check(full.together.days[extra].exhausted&&!full.together.days[extra].question,'catalog exhaustion never wraps to an old question');
check(context.togetherCustomEdit(full,extra,questions[0]+' !').ok===false,'custom questions reject punctuation-only duplicates');
check(context.togetherCustomEdit(full,extra,'내일의 작은 모험을 위한 비밀 암호를 정해요.').ok===true,'exhausted catalog accepts a genuinely new custom mission');
check(context.togetherCustomEdit(full,extra,'이미 선택된 질문 교체').ok===false,'custom mission cannot overwrite an existing daily question');
const snapshot=JSON.stringify(full);
check(context.togetherEdit(full,extra,1,'answer','다른 질문에 대한 답','다른 질문').ok===false&&JSON.stringify(full)===snapshot,'mismatched displayed question cannot take an answer');
context.togetherEdit(full,extra,1,'answer','마법의 열쇠',full.together.days[extra].question);
check(full.together.days[extra].question==='내일의 작은 모험을 위한 비밀 암호를 정해요.','answer edits keep the exact question snapshot');

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:/Users/pwjcu/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe'});
  const contexts=await Promise.all([browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),browser.newContext()]);
  const pages=await Promise.all(contexts.map(c=>c.newPage()));let shared={revision:0,value:{}};
  const errors=[];pages.forEach(page=>page.on('pageerror',error=>errors.push(error.message)));
  try{
    await Promise.all(pages.map(async page=>{await page.goto('http://127.0.0.1:4173/?local-preview=1');await page.waitForFunction(()=>togetherBooted&&!worldBusy&&!togetherAllocating);}));
    const page=pages[0];check(await page.evaluate(()=>db===null),'local preview isolates all production data');
    const today=await page.evaluate(()=>togetherDay());
    await page.evaluate(({full,today})=>{LV.together=full.together;togetherReserve(LV,today);renderTogether();},{full,today});
    await page.locator('.together-history summary').click();
    check(await page.locator('.together-history-entry').count()===10,'history displays at most ten days per page');
    await page.locator('.together-history-pages button').last().click();
    check((await page.locator('.together-history-count').innerText()).includes('2 /'),'history next page changes the visible slice');
    await page.locator('#togetherHistorySearch').fill('이야기 0');
    check(await page.locator('.together-history-entry').count()===1&&(await page.locator('.together-history-entry').innerText()).includes('2027. 01. 01'),'answer search finds an older preserved record');
    check((await page.locator('.together-history-entry').innerText()).includes('아직 남긴 이야기가 없어요.'),'single-person answers remain visible with the partner marked pending');
    await page.locator('#togetherHistorySearch').fill('nothing matches here');
    check(await page.locator('.together-history-empty').isVisible(),'search empty state is readable');
    await page.locator('#togetherHistorySearch').fill('이야기 0');
    for(const width of [320,390]){await page.setViewportSize({width,height:844});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+'px history does not overflow');await page.locator('#togetherPanel').screenshot({path:'output/playwright/mission-history-'+width+'.png',animations:'disabled'});}
    check(await page.evaluate(()=>{const backup=prepareBackup(JSON.stringify({living:LV}));return Object.keys(backup.living.together.days).length>60&&backup.living.together.days['2027-01-01'][1].answer==='이야기 0';}),'existing backup includes question snapshots and full history');
    // Midnight submission retains the date and identity belonging to the visible field.
    await page.evaluate(async()=>{
      LV.together={days:{},total:0};window.__originalTogetherNow=appNow;window.__missionTick=Date.parse('2028-04-02T23:59:59+09:00');appNow=()=>window.__missionTick;
      togetherHistoryQuery='';togetherViewDay='';who=1;await ensureTogetherMission();renderTogether();
    });
    await page.locator('#togetherAnswer').fill('자정 전에 쓰던 이야기');
    await page.evaluate(()=>{window.__missionTick+=2000;});
    await page.locator('.together-mission button[type=submit]').click();await page.waitForFunction(()=>!togetherBusy&&!togetherAllocating&&!worldBusy);
    check(await page.evaluate(()=>LV.together.days['2028-04-02'][1].answer==='자정 전에 쓰던 이야기'&&!LV.together.days['2028-04-03']?.[1]?.answer),'midnight submit saves to the displayed old date');
    await page.locator('#togetherAnswer').fill('내일도 이어 쓸 초안');
    await page.evaluate(()=>{window.__missionTick+=86400000;renderTogether();});await page.waitForFunction(()=>!togetherAllocating&&!worldBusy);
    check((await page.locator('.together-draft-notice').innerText()).includes('이어쓰기'),'midnight render preserves an unfinished draft with a resume action');
    await page.locator('.together-draft-notice button').filter({hasText:'이어쓰기'}).click();
    check(await page.locator('#togetherAnswer').inputValue()==='내일도 이어 쓸 초안'&&await page.locator('#togetherAnswer').getAttribute('data-day')==='2028-04-03','resume restores both draft and its original mission day');
    // A failed write keeps the exact draft and enables a safe retry.
    await page.evaluate(()=>{window.__oldMissionSet=DB.setObj;DB.setObj=async()=>{throw Error('expected mission save failure');};});
    await page.locator('.together-mission button[type=submit]').click();await page.waitForFunction(()=>!togetherBusy);
    check(await page.locator('#togetherAnswer').inputValue()==='내일도 이어 쓸 초안'&&await page.locator('.together-mission button[type=submit]').isEnabled(),'failed save preserves the old-day draft and retry button');
    await page.evaluate(()=>{DB.setObj=window.__oldMissionSet;});
    await page.locator('.together-mission button[type=submit]').click();await page.waitForFunction(()=>!togetherBusy&&!worldBusy);
    check(await page.evaluate(()=>LV.together.days['2028-04-03'][1].answer==='내일도 이어 쓸 초안'),'retry saves only to the original day');
    // A snapshot changed by restore must not silently attach an old draft to the new prompt.
    await page.locator('#togetherAnswer').fill('원래 질문에 쓴 초안');
    await page.evaluate(()=>{LV.together.days[togetherDay()].question='복원된 다른 질문';renderTogether();});
    check(await page.locator('#togetherAnswer').inputValue()==='원래 질문에 쓴 초안'&&await page.locator('.together-mission button[type=submit]').isDisabled(),'changed snapshot keeps draft visible and blocks accidental reassignment');
    await page.locator('button').filter({hasText:'새 질문에 맞춰 이어쓰기'}).click();
    check(await page.locator('.together-mission button[type=submit]').isEnabled(),'explicit confirmation lets a user adapt an old draft to a restored question');
    await page.evaluate(()=>{appNow=window.__originalTogetherNow;togetherViewDay='';});
    // Two browser clients execute real transaction callbacks with compare-and-set retries.
    shared.value=await page.evaluate(()=>defaultLiving());
    for(let index=0;index<pages.length;index++){
      const client=pages[index];await client.exposeFunction('__missionRead',async()=>clone(shared));await client.exposeFunction('__missionCas',async(revision,value)=>{if(revision!==shared.revision)return false;shared={revision:revision+1,value:clone(value)};return true;});
      await client.evaluate(index=>{
        togetherBooted=false;LV=defaultLiving();who=index+1;appNow=()=>Date.parse('2029-05-01T12:00:00+09:00');
        db={ref(path){if(path!=='living')throw Error('unexpected path '+path);return{transaction:async edit=>{
          for(let attempt=0;attempt<25;attempt++){
            const current=await window.__missionRead();const next=edit(current.value);
            if(next===undefined)return{committed:false,snapshot:{val:()=>current.value}};
            await new Promise(resolve=>setTimeout(resolve,index?0:8));
            if(await window.__missionCas(current.revision,next))return{committed:true,snapshot:{val:()=>next}};
          }
          throw Error('transaction retry exhausted');
        }}}};
      },index);
    }
    await Promise.all(pages.map(p=>p.evaluate(()=>ensureTogetherMission(true))));
    const selected=await Promise.all(pages.map(p=>p.evaluate(()=>LV.together.days[togetherDay()].question)));
    check(selected[0]===selected[1]&&Object.keys(shared.value.together.days).length===1,'two clients reserve exactly one shared question for the same day');
    await Promise.all(pages.map((p,index)=>p.evaluate(async index=>{renderTogether();$('togetherAnswer').value='둘의 답변 '+index;await saveTogether('answer',$('togetherAnswer').value);},index)));
    check(shared.value.together.days['2029-05-01'][1].answer==='둘의 답변 0'&&shared.value.together.days['2029-05-01'][2].answer==='둘의 답변 1','concurrent answers retain both people');
    await Promise.all(pages.map((p,index)=>p.evaluate(async index=>{window.__dateIndex=index;appNow=()=>Date.parse((index?'2029-05-03':'2029-05-02')+'T12:00:00+09:00');await ensureTogetherMission(true);},index)));
    check(new Set(Object.values(shared.value.together.days).map(row=>row.question)).size===3,'transactions exclude questions selected concurrently on different days');
    check(errors.length===0,'no browser page errors');
    console.log('Mission history: '+checks+' checks passed; '+questionCount+' unique catalog questions.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

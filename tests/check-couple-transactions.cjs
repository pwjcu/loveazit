const {chromium}=require('../output/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright');

const APP='http://127.0.0.1:4173/?local-preview=1';
const EXECUTABLE='C:/Users/pwjcu/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe';
const clone=value=>JSON.parse(JSON.stringify(value));

(async()=>{
  let shared={value:null,revision:0};
  const browser=await chromium.launch({headless:true,executablePath:EXECUTABLE});
  const contexts=await Promise.all([browser.newContext(),browser.newContext()]);
  const pages=await Promise.all(contexts.map(context=>context.newPage()));

  try{
    await Promise.all(pages.map(async(page,index)=>{
      await page.exposeFunction('__coupleRead',async()=>clone(shared));
      await page.exposeFunction('__coupleCas',async(revision,value)=>{
        if(revision!==shared.revision)return false;
        shared={value:clone(value),revision:shared.revision+1};
        return true;
      });
      await page.goto(APP,{waitUntil:'load'});
      await page.evaluate(index=>{
        if(db!==null)throw new Error('transaction test must use local preview');
        window.__installSharedLiving=async value=>{LV=mergeLiving(value);renderAll();};
        let firstReadIsStale=true;
        db={ref(path){
          if(path!=='living')throw new Error('unexpected mock path: '+path);
          return{transaction:async edit=>{
            for(let attempt=0;attempt<20;attempt++){
              const current=await window.__coupleRead();
              const read=firstReadIsStale?{value:current.value,revision:-1}:current;
              firstReadIsStale=false;
              const next=edit(structuredClone(read.value));
              if(next===undefined)return{committed:false,snapshot:{val:()=>structuredClone(current.value)}};
              if(await window.__coupleCas(read.revision,next))return{committed:true,snapshot:{val:()=>structuredClone(next)}};
            }
            throw new Error('mock transaction retry limit');
          }};
        }};
        localStorage.clear();
        document.body.dataset.transactionClient=String(index+1);
      },index);
    }));

    const initial=await pages[0].evaluate(()=>{const state=defaultLiving();state.hearts=20;state.specialConsent={1:{adult:true,optIn:true},2:{adult:true,optIn:true}};return state;});
    shared={value:clone(initial),revision:1};
    const sync=()=>Promise.all(pages.map(page=>page.evaluate(value=>window.__installSharedLiving(value),clone(shared.value))));
    await sync();

    await Promise.all(pages.map(page=>page.evaluate(()=>startQA('hearts'))));
    let rounds=Object.values(shared.value.qaRounds||{});
    if(rounds.length!==1||shared.value.hearts!==8)throw new Error(`simultaneous paid Q&A was not charged exactly once (rounds=${rounds.length}, hearts=${shared.value.hearts})`);

    rounds[0].revealed=true;rounds[0].revealedAt=Date.now();
    shared={value:clone(shared.value),revision:shared.revision+1};
    await sync();
    await Promise.all(pages.map(page=>page.evaluate(()=>startQA('free'))));
    if(Object.keys(shared.value.qaRounds||{}).length!==1||shared.value.hearts!==8)throw new Error('72-hour Q&A gate allowed another round');

    const now=Date.now();
    shared.value.mailbox={pigeon:{from:1,to:2,body:'test',sentAt:now,deliveryAt:now+86400000,initialDeliveryAt:now+86400000,feeds:0}};
    shared.value.pantry={tomato:1};
    shared={value:clone(shared.value),revision:shared.revision+1};
    await sync();
    await Promise.all(pages.map(page=>page.evaluate(()=>{renderPostOffice();return feedPigeon('pigeon');})));
    if(shared.value.pantry.tomato!==0||shared.value.mailbox.pigeon.feeds!==1)throw new Error('simultaneous pigeon feed spent produce more than once');

    shared.value.mailbox={};shared.value.hearts=0;shared.value.dailyEarn={};
    shared={value:clone(shared.value),revision:shared.revision+1};
    await sync();
    await Promise.all(pages.map((page,index)=>page.evaluate(({slot,text})=>{who=slot;renderPostOffice();letterDrafts[slot]=text;$('letterBody').value=text;return sendPigeonLetter();},{slot:index+1,text:index?'두 번째 편지':'첫 번째 편지'})));
    const letters=Object.values(shared.value.mailbox||{});
    const today=await pages[0].evaluate(()=>dayKey());
    if(letters.length!==2||new Set(letters.map(letter=>letter.from)).size!==2)throw new Error(`simultaneous letters were not both retained (count=${letters.length}, senders=${letters.map(letter=>letter.from).join(',')})`);
    if(shared.value.hearts!==2||shared.value.rewardLedger?.[today]?.counts?.note!==1)throw new Error(`letter rewards did not honor the shared daily cap (hearts=${shared.value.hearts}, note=${shared.value.rewardLedger?.[today]?.counts?.note})`);

    const before=clone(shared);
    const rejected=await pages[0].evaluate(()=>changeWorld(state=>{state.hearts=999;return worldFail('expected rollback');}));
    if(rejected!==false||JSON.stringify(shared)!==JSON.stringify(before))throw new Error('rejected transaction changed shared state');

    await sync();
    const reflected=await Promise.all(pages.map(page=>page.evaluate(()=>({mail:Object.keys(LV.mailbox||{}).length,hearts:LV.hearts,note:Object.values(LV.rewardLedger||{})[0]?.counts?.note}))));
    if(reflected.some(state=>state.mail!==2||state.hearts!==2||state.note!==1))throw new Error('latest shared state was not reflected in both clients');

    process.stdout.write('PASS couple transactions: paid Q&A, 72h gate, pigeon feed, letters, rollback, two-client sync\n');
  }finally{
    await Promise.all(contexts.map(context=>context.close()));
    await browser.close();
  }
})().catch(error=>{process.stderr.write('FAIL couple transactions: '+error.message+'\n');process.exitCode=1;});

const assert=require('node:assert/strict');
const {chromium}=require('../output/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright');

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Users/pwjcu/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe'});
 const page=await browser.newPage();
 const errors=[],blocked=[];page.on('pageerror',error=>errors.push(error.message));
 // Fixtures must never reach the production database, even if local-preview regresses.
 await page.route(/https?:\/\/[^/]*(?:firebaseio\.com|firebasedatabase\.app)(?:\/|$)/,route=>{blocked.push(route.request().url());return route.abort()});
 try{
  await page.goto((process.env.TEST_BASE_URL||'http://127.0.0.1:4173')+'/?local-preview=1');
  await page.waitForFunction(()=>typeof commitPhotoEdit==='function'&&typeof bootFortuneServices==='function');
  const result=await page.evaluate(async()=>{
   const checks=[],savedDB=db,savedFetch=window.fetch,savedPhotos=photos;
   const check=(condition,label)=>{if(!condition)throw Error(label);checks.push(label)};
   check(db===null,'local preview starts without a Firebase connection');
   const clone=value=>JSON.parse(JSON.stringify(value));
   const base={id:'base',images:['data:image/png;base64,YQ=='],cap:'원래 메모',date:'2024-02-01',memoryDate:'2024-02-01',uploadedDay:'2026-10-06',uploadedAt:1791241200000,ts:1791241200001,custom:{keep:'원래 자료'}};
   const source={id:'source',img:'data:image/png;base64,Yg==',cap:'이전 메모',date:'2024-01-15',uploadedAt:1705273200000};
   const payload=post=>{const {id,...value}=post;return clone(value)};
   const next={...payload(base),images:[...base.images,source.img],cap:'수정한 메모\n[2024년 01월 15일의 메모]\n이전 메모',date:'2024-02-02',memoryDate:'2024-02-02',updatedAt:1791241209999,mergedPosts:[{id:source.id,cap:source.cap,date:source.date,uploadedAt:source.uploadedAt}]};
   let remote,revision,calls,options,tokenCalls;
   const headers=init=>new Headers(init.headers||{});
   const install=(settings={})=>{
    remote={base:payload(base),source:payload(source),untouched:{img:'data:image/png;base64,Yw==',cap:'그대로 남길 사진',date:'2024-03-01'}};
    photos=toArr(clone(remote));
    revision=1;calls=[];options=settings;tokenCalls=0;
    db={app:{auth:()=>({currentUser:settings.auth?{getIdToken:async()=>{tokenCalls++;return 'photo-test-token'}}:null})},ref:path=>({toString:()=>`https://photo-test.invalid/${path||''}`,once:async()=>({val:()=>clone(remote)}),transaction:()=>{throw Error('A merge must not send the full photo collection through the SDK')}})};
    window.fetch=async(input,init={})=>{
     const url=new URL(String(input));
     if(url.origin!=='https://photo-test.invalid'||url.pathname!=='/photos.json')throw Error('Unexpected network request: '+url.origin+url.pathname);
     const method=(init.method||'GET').toUpperCase(),requestHeaders=headers(init);
     const call={method,url:url.toString(),headers:Object.fromEntries(requestHeaders),cache:init.cache,bytes:typeof init.body==='string'?new TextEncoder().encode(init.body).length:0};calls.push(call);
     if(method==='GET'){
      if(options.readDenied)return new Response('{"error":"Permission denied"}',{status:403});
      return new Response(JSON.stringify(remote),{status:200,headers:options.noEtag?{}:{ETag:`"revision-${revision}"`}});
     }
     if(method!=='PUT')throw Error('Unexpected write method: '+method);
     if(options.beforePut)options.beforePut(call);
     if(options.writeDenied)return new Response('{"error":"Permission denied"}',{status:403});
     if(requestHeaders.get('if-match')!==`"revision-${revision}"`)return new Response(JSON.stringify(remote),{status:412,headers:{ETag:`"revision-${revision}"`}});
     remote=JSON.parse(init.body);revision++;
     if(options.afterPut)options.afterPut();
     if(options.loseResponse){options.loseResponse=false;throw Error('Simulated response loss after commit')}
     return new Response(null,{status:204});
    };
   };
   const attempt=async()=>{try{await commitPhotoEdit(clone(base),[clone(source)],clone(next));return null}catch(error){return error}};
   const puts=()=>calls.filter(call=>call.method==='PUT');
   const gets=()=>calls.filter(call=>call.method==='GET');
   try{
    install();
    for(let i=0;i<35;i++)remote['large-'+i]={img:'data:image/jpeg;base64,'+'A'.repeat(500000),cap:'별도의 추억 '+i,date:'2023-01-01'};
    check(!(await attempt()),'a photo collection larger than 16MB can merge through REST');
    check(puts().length===1&&puts()[0].bytes>16*1024*1024,'large merge uses one conditional REST write beyond the SDK size limit');
    check(gets()[0].headers['x-firebase-etag']==='true'&&gets()[0].cache==='no-store'&&puts()[0].headers['if-match']==='"revision-1"','merge reads a fresh ETag and attaches it to the write');
    check(remote.base.images.length===2&&!remote.source&&remote['large-34'].img.length===500023,'large merge keeps all unrelated photo data');
    check(remote.base.uploadedAt===base.uploadedAt&&remote.base.ts===base.ts&&remote.base.uploadedDay===base.uploadedDay&&remote.base.custom.keep===base.custom.keep&&remote.base.mergedPosts[0].uploadedAt===source.uploadedAt,'merge retains original and source metadata');
    check(photos.find(p=>p.id==='base').cap===next.cap&&!photos.some(p=>p.id==='source')&&photos.some(p=>p.id==='untouched'),'successful REST merge immediately updates only the selected cached posts');

    install({afterPut:()=>{remote.base.cap='저장 직후 상대방이 덧붙인 메모';photos=toArr(clone(remote))}});
    check(!(await attempt())&&photos.find(p=>p.id==='base').cap==='저장 직후 상대방이 덧붙인 메모','an already-delivered newer realtime value is not replaced by the REST completion');

    let raced=false;install({beforePut:()=>{if(!raced){raced=true;remote.arrived={img:'data:image/png;base64,ZA==',cap:'상대방이 새로 올린 사진'};revision++}}});
    check(!(await attempt()),'an unrelated concurrent upload is retried successfully');
    check(puts().length===2&&gets().length===2&&remote.arrived.cap==='상대방이 새로 올린 사진'&&!remote.source,'retry merges the newest collection without dropping a concurrent upload');

    raced=false;install({beforePut:()=>{if(!raced){raced=true;remote.source.cap='상대방이 고친 메모';revision++}}});
    check(Boolean(await attempt()),'a concurrently edited source aborts the merge');
    check(puts().length===1&&remote.source.cap==='상대방이 고친 메모'&&remote.base.cap===base.cap,'source conflict preserves the changed source and original target');

    raced=false;install({beforePut:()=>{if(!raced){raced=true;delete remote.source;revision++}}});
    check(Boolean(await attempt())&&puts().length===1&&!remote.source&&remote.base.cap===base.cap,'a concurrently deleted source is never resurrected');

    raced=false;install({beforePut:()=>{if(!raced){raced=true;remote.base.cap='먼저 저장된 수정';revision++}}});
    check(Boolean(await attempt())&&puts().length===1&&remote.base.cap==='먼저 저장된 수정'&&remote.source.cap===source.cap,'a concurrently changed target is never overwritten');

    install({noEtag:true});check(Boolean(await attempt())&&puts().length===0&&remote.source,'a response without an ETag cannot trigger an unguarded write');
    install({readDenied:true});check(Boolean(await attempt())&&puts().length===0&&remote.source,'read permission failure leaves every source intact');
    install({writeDenied:true});check(Boolean(await attempt())&&puts().length===1&&remote.base.cap===base.cap&&remote.source,'write permission failure leaves every source intact');

    install({beforePut:()=>{remote['arrival-'+revision]={cap:'새 업로드'};revision++}});
    check(Boolean(await attempt())&&puts().length===3&&gets().length===3&&remote.base.cap===base.cap&&remote.source,'persistent unrelated conflicts stop after three conditional writes without modifying selected posts');

    install({loseResponse:true});await attempt();
    check(!(await attempt())&&puts().length===1&&remote.base.cap===next.cap&&!remote.source,'retry after an uncertain committed response recognizes the completed merge without another write');
    install();delete remote.source;remote.base={...clone(next),cap:'완료 후 다시 수정됨'};
    check(Boolean(await attempt())&&puts().length===0&&remote.base.cap==='완료 후 다시 수정됨','missing sources and a different target are not mistaken for a completed retry');

    install({auth:true});check(!(await attempt()),'an existing signed-in user can complete a merge');
    check(tokenCalls>0&&calls.every(call=>new URL(call.url).searchParams.get('auth')==='photo-test-token'||call.headers.authorization==='Bearer photo-test-token'),'REST requests carry the current Firebase user token when present');

    install();let record=payload(base),pathUsed='',transactionCalls=0;
    db={ref:path=>{pathUsed=path;return{once:async()=>({val:()=>clone(record)}),transaction:async(update,onComplete,applyLocally)=>{transactionCalls++;check(applyLocally===false,'ordinary edit suppresses unconfirmed local transaction events');const updated=update(clone(record));if(updated===undefined)return{committed:false};record=updated;return{committed:true,snapshot:{val:()=>clone(record)}}}}}};
    await commitPhotoEdit(clone(base),[],clone(next));
    check(pathUsed==='photos/base'&&transactionCalls===1&&record.cap===next.cap&&calls.length===0,'an ordinary edit uses a single-post SDK transaction without REST');

    record=payload(base);db={ref:()=>({once:async()=>({val:()=>clone(record)}),transaction:async update=>{const first=update(clone(record));if(first===undefined)throw Error('Initial matching snapshot should permit an edit');record={...record,cap:'SDK 재시도 중 상대가 저장'};const retried=update(clone(record));return{committed:retried!==undefined,snapshot:{val:()=>clone(record)}}}})};
    let sdkConflict=false;try{await commitPhotoEdit(clone(base),[],clone(next))}catch{sdkConflict=true}
    check(sdkConflict&&record.cap==='SDK 재시도 중 상대가 저장','SDK transaction retries also protect a concurrently changed post');
    return {count:checks.length,checks};
   }finally{db=savedDB;window.fetch=savedFetch;photos=savedPhotos}
  });
  assert.deepEqual(errors,[],'no browser JavaScript errors');
  assert.deepEqual(blocked,[],'no Firebase database requests were attempted');
  console.log(JSON.stringify(result,null,2));
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});

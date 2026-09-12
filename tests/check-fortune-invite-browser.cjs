/* Full app + two isolated browser contexts. All Firebase requests use this in-memory mock. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'../output/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright');
const root=process.cwd(),remote={},pages=[],errors=[];
const clone=value=>JSON.parse(JSON.stringify(value??null));
const read=key=>key.split('/').filter(Boolean).reduce((node,part)=>node?.[part],remote)??null;
function write(key,value){const parts=key.split('/').filter(Boolean),last=parts.pop();let node=remote;for(const part of parts)node=node[part]??={};node[last]=clone(value);}
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}const ext=path.extname(file);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'})[ext]||'application/octet-stream');res.end(data);});
});
(async()=>{
  let checks=0;const check=(condition,message)=>{assert.ok(condition,message);checks++;};
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||'C:/Users/pwjcu/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe'});
  async function makePage(){
    const context=await browser.newContext({viewport:{width:390,height:844}});
    await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.fulfill({status:200,contentType:route.request().resourceType()==='script'?'text/javascript':'text/css',body:''}));
    await context.exposeBinding('__mockDB',async(_,request)=>{
      if(request.method==='read')return clone(read(request.path));
      write(request.path,request.value);
      setImmediate(()=>{for(const page of pages)if(!page.isClosed())page.evaluate(()=>window.__mockRefresh?.()).catch(()=>{});});
      return clone(read(request.path));
    });
    await context.addInitScript(()=>{
      const listeners=new Map();
      const remote=async(method,path,value)=>{if(window.__mockOffline)throw new Error('mock network unavailable');return window.__mockDB({method,path,value});};
      const ref=(path='')=>({
        child:key=>ref(path+'/'+key),
        once:async()=>{const value=await remote('read',path);return{val:()=>value};},
        set:async value=>remote('write',path,value),
        update:async values=>{for(const[key,value]of Object.entries(values))await remote('write',path+'/'+key,value);},
        transaction:async edit=>{const old=await remote('read',path),value=edit(old);if(value!==undefined)await remote('write',path,value);return{committed:value!==undefined,snapshot:{val:()=>value===undefined?old:value}};},
        on:(_,handler,cancel)=>{listeners.set(handler,{path,cancel});remote('read',path).then(value=>handler({val:()=>value})).catch(error=>cancel?.(error));},
        off:(_,handler)=>listeners.delete(handler)
      });
      window.__mockRefresh=()=>Promise.all([...listeners].map(async([handler,{path,cancel}])=>{try{const value=await remote('read',path);if(listeners.has(handler))handler({val:()=>value});}catch(error){cancel?.(error);}}));
      window.firebase={initializeApp:()=>{},database:()=>({ref})};
    });
    const page=await context.newPage();pages.push(page);page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(15000);return page;
  }
  try{
    const a=await makePage();await a.goto(base+'/');await a.waitForFunction(()=>typeof fortuneSyncStatus!=='undefined'&&coupleBooted);
    await a.evaluate(()=>goFortune());await a.getByRole('button',{name:'연결하기',exact:true}).click();
    await a.getByRole('button',{name:'초대 링크 만들기',exact:true}).click();
    await a.locator('#fortuneInviteLink').waitFor();const invitation=await a.locator('#fortuneInviteLink').inputValue();
    check(new URL(invitation).hash.startsWith('#azit-invite=')&&new URL(invitation).search==='','UI creates a private fragment invite without a query');
    await a.evaluate(async()=>{await persistFortuneProfile(1,{birth:'1995-06-15',calendar:'solar',mbti:'ENFP'});await persistPrivateContactVault({v:1,contacts:{1:{phone:'01011112222',kakao:'',emergency:''},2:{phone:'',kakao:'',emergency:''}}},1);$('azitDialog').close();});
    const b=await makePage();let requestContainedSecret=false;b.on('request',request=>{if(request.url().includes('AZIT-'))requestContainedSecret=true;});
    await b.goto(invitation);await b.waitForFunction(()=>fortuneSyncStatus==='synced'&&FT.profiles[1]?.birth==='1995-06-15');
    check(new URL(b.url()).hash===''&&!requestContainedSecret,'early hook removes fragment and HTTP requests never contain the key');
    check(await b.evaluate(()=>!('__azitFortuneInvite'in window)&&getPrivateContactVault().contacts[1].phone==='01011112222'),'second browser consumes invite and decrypts shared contact');
    check(await b.evaluate(()=>!!localStorage.getItem(FORTUNE_LINK_KEY)),'second browser remembers the connection');
    const cipher=JSON.stringify(remote);
    check(!cipher.includes('1995-06-15')&&!cipher.includes('01011112222')&&!cipher.includes('AZIT-'),'mock Firebase has ciphertext and no private invite secret');
    await b.evaluate(()=>persistFortuneProfile(2,{birth:'1999-08-08',calendar:'solar',mbti:'ISFP'}));
    await a.waitForFunction(()=>FT.profiles[2]?.birth==='1999-08-08');
    check(true,'profile changes synchronize back to the first browser');
    await b.reload();await b.waitForFunction(()=>fortuneSyncStatus==='synced'&&FT.profiles[2]?.birth==='1999-08-08');
    check(new URL(b.url()).hash==='','returning without invite automatically restores the same room');
    await b.evaluate(async()=>{goFortune();window.__rememberedBeforeFailure=localStorage.getItem(FORTUNE_LINK_KEY);window.__mockOffline=true;await retryFortuneConnection();});
    await b.getByRole('button',{name:'다시 연결',exact:true}).waitFor();
    check(await b.evaluate(()=>localStorage.getItem(FORTUNE_LINK_KEY)===window.__rememberedBeforeFailure&&fortuneSyncStatus==='offline'),'network failure preserves key and displays retry UI');
    await b.evaluate(()=>window.__mockOffline=false);await b.getByRole('button',{name:'다시 연결',exact:true}).click();
    await b.waitForFunction(()=>fortuneSyncStatus==='synced');
    check(await b.evaluate(()=>localStorage.getItem(FORTUNE_LINK_KEY)===window.__rememberedBeforeFailure),'retry button reconnects with original saved key');
    await b.screenshot({path:'output/playwright/fortune-invite-connected.png',fullPage:false});
    check(errors.length===0,'integrated browser flow has no JavaScript errors');
    console.log(`fortune-invite-browser: ${checks} checks passed`);
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});

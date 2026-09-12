const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
const source=fs.readFileSync('assets/fortune-sync.js','utf8');
const KEY='azit-fortune-link-v1';
function device(remote={}){
  const storage=new Map(),timers=new Map(),events={},contacts={1:null,2:null},listeners=new Set();
  let nextTimer=0;
  const state={fail:false,dialog:null,reads:0,writes:0,removed:0};
  const read=path=>path.split('/').reduce((value,key)=>value?.[key],remote)??null;
  const write=(path,value)=>{const keys=path.split('/'),key=keys.pop();let target=remote;for(const part of keys)target=target[part]??={};target[key]=value;state.writes++;};
  const ref=path=>({
    once:async()=>{state.reads++;if(state.fail)throw new Error('network unavailable');return{val:()=>read(path)};},
    child:key=>ref(path+'/'+key),
    transaction:async edit=>{if(state.fail)throw new Error('network unavailable');const value=edit(read(path));if(value!==undefined)write(path,value);return{snapshot:{val:()=>read(path)}};},
    update:async values=>{if(state.fail)throw new Error('network unavailable');for(const [key,value]of Object.entries(values))write(path+'/'+key,value);},
    set:async value=>write(path,value),
    on:(_,handler)=>listeners.add(handler),off:(_,handler)=>listeners.delete(handler)
  });
  const sandbox={crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,JSON,Date,
    btoa:value=>Buffer.from(value,'binary').toString('base64'),atob:value=>Buffer.from(value,'base64').toString('binary'),
    setTimeout:(fn,ms)=>{const id=++nextTimer;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),
    location:{origin:'https://example.test',pathname:'/loveazit/',search:'?unrelated=1'},
    navigator:{onLine:true,clipboard:{writeText:async()=>{}}},document:{hidden:false,addEventListener:(name,fn)=>events[name]=fn},
    window:{addEventListener:(name,fn)=>events[name]=fn,applySharedPrivateContact:(slot,value)=>contacts[slot]=value,getPrivateContactVault:()=>JSON.parse(JSON.stringify({v:1,contacts})),applySharedPrivateContactVault:value=>{for(const slot of ['1','2'])contacts[slot]=value.contacts[slot];}},
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>{storage.delete(key);state.removed++;}},
    FT:{profiles:{},daily:{}},fortuneNormalize:value=>value,renderFortune:()=>{},
    saveFortuneLocal:value=>{if(state.failSave){state.failSave=false;throw new Error('local storage unavailable');}sandbox.FT=value;},db:{ref},toast:()=>{},esc:value=>String(value),
    openAzitDialog:(title,html)=>state.dialog={title,html},$:()=>({open:true,close:()=>state.dialog=null})
  };
  vm.createContext(sandbox);vm.runInContext(source,sandbox);
  return{sandbox,storage,timers,events,contacts,listeners,state,run:code=>vm.runInContext(code,sandbox)};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
  let checks=0;
  const check=(value,message)=>{assert.ok(value,message);checks++;};
  const remote={},a=device(remote),api=a.sandbox.window.__fortuneSyncTest,code=api.newFortuneCode();
  a.sandbox.FT.profiles[1]={birth:'1995-06-15',mbti:'ENFP'};
  a.contacts[1]={v:1,phone:'01011112222',kakao:'',emergency:''};
  await a.sandbox.connectFortuneCode(code);
  check(a.storage.has(KEY),'initial successful connection remembers its private key');
  const invite=a.sandbox.fortuneInvitationUrl(code),url=new URL(invite);
  check(url.search===''&&url.hash.startsWith('#azit-invite='),'invite secret is in fragment only and excludes query parameters');
  check(!JSON.stringify(remote).includes(code)&&!JSON.stringify(remote).includes('1995-06-15')&&!JSON.stringify(remote).includes('01011112222'),'remote stores neither invite secret nor private plaintext');

  const b=device(remote);
  b.sandbox.window.__azitFortuneInvite=decodeURIComponent(url.hash.slice(13));
  await b.sandbox.bootFortuneServices();
  check(!('__azitFortuneInvite'in b.sandbox.window),'boot consumes and deletes the temporary invitation');
  check(b.sandbox.FT.profiles[1].birth==='1995-06-15'&&b.contacts[1].phone==='01011112222','opening an invite connects a second isolated device and decrypts shared data');
  check(b.storage.has(KEY)&&b.run('fortuneSyncStatus')==='synced','invite connection is remembered for later automatic visits');
  const remembered=b.storage.get(KEY),oldListeners=b.listeners.size;
  b.state.fail=true;
  await b.sandbox.retryFortuneConnection();
  check(b.storage.get(KEY)===remembered&&b.state.removed===0,'network failure never deletes remembered connection');
  check(b.run('fortuneSyncStatus')==='offline'&&b.listeners.size===oldListeners,'same-room reconnect failure retains listener but shows offline');
  for(let attempt=0;attempt<3;attempt++)await b.sandbox.retryFortuneConnection(true);
  const readLimit=b.state.reads;
  for(let event=0;event<5;event++)await b.sandbox.retryFortuneConnection(true);
  check(b.state.reads===readLimit,'automatic attempts are bounded despite repeated events');
  b.state.fail=false;
  await b.sandbox.retryFortuneConnection();
  check(b.run('fortuneSyncStatus')==='synced'&&b.storage.get(KEY)===remembered,'manual retry recovers without resending any code');
  check(b.timers.size===0,'successful reconnection cancels outstanding timeout and retry timers');
  b.events.offline();b.events.online();await flush();await flush();
  check(b.storage.get(KEY)===remembered,'offline/online resume retains the key');

  const c=device(remote);c.storage.set(KEY,remembered);c.state.fail=true;
  await c.sandbox.bootFortuneServices();
  check(c.storage.get(KEY)===remembered&&c.run('fortuneSyncStatus')==='offline','failed cold boot preserves remembered key and exposes reconnect state');
  for(let attempt=0;attempt<3;attempt++)await c.sandbox.retryFortuneConnection(true);
  c.state.fail=false;await c.events.online();
  check(c.run('fortuneSyncStatus')==='synced','a real online event starts a new bounded retry cycle after earlier attempts were exhausted');
  const invalid=device(remote);invalid.storage.set(KEY,'bad-json');await invalid.sandbox.retryFortuneConnection();
  check(invalid.run('fortuneSyncStatus')==='invalid'&&invalid.state.reads===0&&invalid.state.removed===0,'corrupt saved state is distinct from network failure and is not erased');
  const empty=device(remote);await empty.sandbox.retryFortuneConnection();
  check(empty.run('fortuneSyncStatus')==='local'&&empty.state.reads===0,'first-time device remains local without a saved key');

  const d=device(remote),otherCode=api.newFortuneCode();
  d.sandbox.FT.profiles[2]={birth:'1999-08-08'};d.contacts[2]={v:1,phone:'01099999999',kakao:'',emergency:''};
  await d.sandbox.connectFortuneCode(otherCode);
  const oldKey=d.storage.get(KEY),oldRoom=d.run('fortuneLink.roomId'),beforeInvitation=JSON.stringify(remote);
  await d.sandbox.receiveFortuneInvitation(code);
  check(d.state.dialog?.title==='운세 공유 공간 바꾸기'&&d.storage.get(KEY)===oldKey,'different-room invite asks before switching');
  d.state.fail=true;await d.sandbox.acceptFortuneInvitation();
  check(d.storage.get(KEY)===oldKey&&d.run('fortuneLink.roomId')===oldRoom&&d.listeners.size===1,'failed room switch preserves previous key, active material, and listener');
  d.state.fail=false;d.state.failSave=true;await d.sandbox.acceptFortuneInvitation();
  check(d.storage.get(KEY)===oldKey&&d.run('fortuneLink.roomId')===oldRoom&&d.listeners.size===1&&d.contacts[2].phone==='01099999999','local save failure during a switch restores old connection, contacts, and listener');
  await d.sandbox.acceptFortuneInvitation();
  check(d.run('fortuneLink.roomId')!==oldRoom&&d.sandbox.FT.profiles[1].birth==='1995-06-15'&&!d.sandbox.FT.profiles[2],'confirmed switch replaces the local fortune view');
  check(d.contacts[2]===null&&d.contacts[1].phone==='01011112222','confirmed switch clears old room contacts before applying new contacts');
  check(JSON.stringify(remote)===beforeInvitation,'opening and switching invites never uploads old-room profiles or contacts');

  const local=device(remote);local.sandbox.FT.profiles[2]={birth:'2000-01-01'};
  await local.sandbox.receiveFortuneInvitation(code);
  check(local.state.dialog?.title==='운세 공유 공간 바꾸기'&&!local.storage.has(KEY),'unlinked local information is not silently replaced by opening an invite');
  local.sandbox.cancelFortuneInvitation();
  check(local.sandbox.FT.profiles[2].birth==='2000-01-01','cancelling an invitation preserves local information');
  d.sandbox.disconnectFortuneCode();
  check(!d.storage.has(KEY)&&d.listeners.size===0&&d.timers.size===0,'explicit disconnect removes key and stops connection activity');
  process.stdout.write(`fortune-reconnect: ${checks} checks passed\n`);
})().catch(error=>{console.error(error);process.exitCode=1;});

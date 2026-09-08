const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');

const records=new Map(),applied=[],writes=[];
const sandbox={
  console,crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,JSON,Date,
  btoa:value=>Buffer.from(value,'binary').toString('base64'),
  atob:value=>Buffer.from(value,'base64').toString('binary'),
  window:{applySharedPrivateContact:(slot,value)=>applied.push({slot,value})},
  localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},
  FT:{profiles:{},daily:{}},fortuneNormalize:value=>value,
  saveFortuneLocal:()=>{},renderFortune:()=>{},
  db:{ref:path=>({
    set:async value=>{records.set(path,value);writes.push({method:'set',path});},
    transaction:async edit=>{
      // A retried callback must still preserve an existing contact record.
      edit(records.get(path)??null);
      const value=edit(records.get(path)??null);
      if(value!==undefined){records.set(path,value);writes.push({method:'transaction',path});}
      return{committed:value!==undefined,snapshot:{val:()=>records.get(path)}};
    },
    update:async values=>{
      for(const [key,value] of Object.entries(values))records.set(path+'/'+key,value);
      writes.push({method:'update',path});
    }
  })}
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('assets/fortune-sync.js','utf8'),sandbox,{filename:'fortune-sync.js'});
const emptyVault=()=>({v:1,contacts:{
  1:{phone:'',kakao:'',emergency:''},
  2:{phone:'',kakao:'',emergency:''}
}});

(async()=>{
  let checks=0;
  const check=(condition,message)=>{assert.ok(condition,message);checks++;};
  const api=sandbox.window.__fortuneSyncTest;
  const material=await api.fortuneLinkMaterial(api.newFortuneCode());
  sandbox.testMaterial=material;
  vm.runInContext('fortuneLink=testMaterial',sandbox);
  const base='fortuneRooms/'+material.roomId+'/',path1=base+'contacts/1',path2=base+'contacts/2';

  // Each device has a different populated slot and an empty copy of the other.
  const first=emptyVault(),second=emptyVault();
  first.contacts[1].phone='01011112222';
  second.contacts[2].phone='01033334444';
  await Promise.all([
    sandbox.persistPrivateContactVault(first,1),
    sandbox.persistPrivateContactVault(second,2)
  ]);
  check((await api.decryptFortune(records.get(path1),'contacts/1',material)).phone===first.contacts[1].phone,'concurrent save preserves the first person');
  check((await api.decryptFortune(records.get(path2),'contacts/2',material)).phone===second.contacts[2].phone,'concurrent save preserves the second person');
  const encrypted=JSON.stringify([...records.values()]);
  check(!encrypted.includes(first.contacts[1].phone)&&!encrypted.includes(second.contacts[2].phone),'remote ciphertext contains no plaintext phone numbers');
  let rejected=false;
  try{await api.decryptFortune(records.get(path1),'contacts/2',material);}catch{rejected=true;}
  check(rejected,'contact AAD prevents swapping the two encrypted entries');

  const original1=records.get(path1),original2=records.get(path2),writesBeforeSeed=writes.length;
  sandbox.window.getPrivateContactVault=()=>first;
  await sandbox.seedFortuneRoom({},material);
  check(records.get(path1)===original1,'a stale empty room snapshot does not replace a populated remote record');
  check(records.get(path2)===original2,'an empty local slot does not replace the other remote contact');
  check(writes.length===writesBeforeSeed,'stale and empty seeds perform no remote writes');

  records.delete(path2);
  await sandbox.seedFortuneRoom({},material);
  check(!records.has(path2),'an empty local slot is not seeded even when the remote slot is absent');
  sandbox.window.getPrivateContactVault=()=>second;
  await sandbox.seedFortuneRoom({},material);
  check((await api.decryptFortune(records.get(path2),'contacts/2',material)).phone===second.contacts[2].phone,'a nonempty local contact seeds a missing remote slot');
  check(writes.at(-1).method==='transaction'&&writes.at(-1).path===path2,'contact seeding uses a conditional transaction on the chosen entry');

  await sandbox.persistPrivateContactVault(null,2);
  check(records.get(path2)?.v===1&&typeof records.get(path2)?.data==='string','clear persists an encrypted tombstone');
  check(await api.decryptFortune(records.get(path2),'contacts/2',material)===null,'clear decrypts to null');
  await sandbox.applyFortuneRoom({contacts:{1:records.get(path1),2:records.get(path2)}},material);
  check(applied.some(item=>item.slot==='2'&&item.value===null),'the shared contact hook receives null for the cleared slot');
  check(records.get(path1)===original1,'clearing the second contact leaves the first contact intact');

  const beforeMalformed=applied.length;
  const malformed=await api.encryptFortune({v:1,bogus:'wrong'},'contacts/1',material);
  await sandbox.applyFortuneRoom({contacts:{1:malformed}},material);
  check(applied.length===beforeMalformed,'a malformed decrypted record cannot clear stored contacts');
  const beforeRejectedWrite=writes.length;
  rejected=false;
  try{await sandbox.persistPrivateContactVault({v:1},1);}catch{rejected=true;}
  check(rejected&&writes.length===beforeRejectedWrite,'malformed outgoing records are rejected before writing');
  rejected=false;
  try{await sandbox.persistPrivateContactVault(first,3);}catch{rejected=true;}
  check(rejected&&writes.length===beforeRejectedWrite,'invalid person slots are rejected before writing');
  check(writes.every(item=>item.path===path1||item.path===path2),'contact mutations never replace the whole vault or room');
  process.stdout.write(`private-contacts: ${checks} checks passed\n`);
})().catch(error=>{console.error(error);process.exitCode=1;});

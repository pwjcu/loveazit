const fs=require('fs');
const vm=require('vm');
const {webcrypto}=require('crypto');
const assert=require('assert');

const sandbox={
  console,
  crypto:webcrypto,
  TextEncoder,
  TextDecoder,
  Uint8Array,
  JSON,
  Date,
  btoa:value=>Buffer.from(value,'binary').toString('base64'),
  atob:value=>Buffer.from(value,'base64').toString('binary'),
  window:{},
  localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},
  navigator:{clipboard:{writeText:async()=>{}}}
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('assets/fortune-sync.js','utf8'),sandbox,{filename:'fortune-sync.js'});

(async()=>{
  const api=sandbox.window.__fortuneSyncTest;
  let checks=0;
  const check=(value,message)=>{assert.ok(value,message);checks++;};
  const code=api.newFortuneCode();
  check(/^AZIT-[A-Za-z0-9_-]{43}$/.test(code),'code format');
  check(api.normalizeFortuneCode(code)===code,'code normalization');
  check(api.normalizeFortuneCode('azit-'+code.slice(5))===code,'lowercase prefix accepted');
  const a=await api.fortuneLinkMaterial(code),again=await api.fortuneLinkMaterial(code),b=await api.fortuneLinkMaterial(api.newFortuneCode());
  check(a.roomId===again.roomId,'same code has same room');
  check(a.roomId!==b.roomId,'different code has different room');
  check(/^[a-f0-9]{64}$/.test(a.roomId),'room id is sha-256 hex');
  const profile={birth:'1995-06-15',time:'08:20',mbti:'ENFP',pillars:{year:'甲子',month:'乙丑',day:'丙寅'}};
  const one=await api.encryptFortune(profile,'profiles/1',a),two=await api.encryptFortune(profile,'profiles/1',a);
  check(one.data!==two.data&&one.iv!==two.iv,'fresh iv changes ciphertext');
  check(JSON.stringify(one).indexOf(profile.birth)===-1,'ciphertext hides birth date');
  check(JSON.stringify(await api.decryptFortune(one,'profiles/1',a))===JSON.stringify(profile),'round trip');
  let rejected=false;try{await api.decryptFortune(one,'profiles/2',a);}catch{rejected=true;}
  check(rejected,'aad prevents path swapping');
  rejected=false;try{await api.decryptFortune(one,'profiles/1',b);}catch{rejected=true;}
  check(rejected,'wrong couple code cannot decrypt');
  check(api.validEditorial(api.defaultEditorial),'default editorial validates');
  check(!api.validEditorial({...api.defaultEditorial,dailyMessages:[['<script>']]}),'bad editorial rejected');
  rejected=false;try{api.normalizeFortuneCode('AZIT-not-a-real-code');}catch{rejected=true;}
  check(rejected,'malformed connection code rejected');
  process.stdout.write(`fortune-sync: ${checks} checks passed\n`);
})().catch(error=>{console.error(error);process.exitCode=1;});

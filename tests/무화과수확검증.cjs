const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {test}=require('node:test');
const root=path.resolve(__dirname,'..');
const source=Object.fromEntries(['index.html','assets/world.js','assets/pixel-world.js','assets/couple.js'].map(file=>[file,fs.readFileSync(path.join(root,file),'utf8')]));
const clone=value=>JSON.parse(JSON.stringify(value));

// Execute the application's real actions without a browser or a live Firebase connection.
function declaration(file,name,kind='function'){
  const text=source[file],prefix=kind==='object'?'const '+name+'=':kind==='assignment'?name+'=function':'(?:async )?function '+name+'\\(';
  const found=new RegExp('^'+prefix,'m').exec(text);
  assert.ok(found,'Missing declaration: '+name);
  const start=found.index,lineEnd=text.indexOf('\n',start),first=text.slice(start,lineEnd<0?text.length:lineEnd).trimEnd();
  if(kind==='function'&&first.endsWith('}'))return first;
  const ending=kind==='function'?'\n}':'\n};',end=text.indexOf(ending,start);
  assert.ok(end>=start,'Missing end of declaration: '+name);
  return text.slice(start,end+ending.length);
}
function createWorld(shared){
  let now=Date.parse('2026-10-12T07:00:00Z'),saved=null,serial=0;
  const nodes=new Map();
  const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',open:false,setAttribute(){},removeAttribute(){},close(){this.open=false;}});return nodes.get(id);};
  class Clock extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
  const context=vm.createContext({Date:Clock,console,Intl,$:node,document:{activeElement:null,querySelectorAll:()=>[]},uid:()=> 'fig-test-'+(++serial),esc:value=>String(value??''),nextCareLabel:()=> '다음 물주기',appNow:()=>now,dayKey:()=> '2026-10-12',seasonOf:()=> 'fall',
    toast(){},renderHearts(){},renderLiving(){},renderCareList(){},
    DB:{async setObj(key,value){assert.equal(key,'living');saved=clone(value);}},
    openAzitDialog(title,html){node('azitDialog').innerHTML=html;node('azitDialog').open=true;},
    petSvg:()=>'',flowerSvg:()=>'',seasonItemSvg:()=>'',furnitureShopHtml:()=>'',holidayShopHtml:()=>'',worldIcon:()=>'',
    db:shared?{ref(key){assert.equal(key,'living');return{async transaction(edit){for(let attempt=0;attempt<8;attempt++){const version=shared.version,next=edit(clone(shared.value));if(next===undefined)return{committed:false};await Promise.resolve();if(shared.version!==version)continue;shared.value=clone(next);shared.version++;return{committed:true,snapshot:{val:()=>clone(shared.value)}};}throw Error('Transaction retry limit');}};}}:null});
  const code=['var worldBusy=false;'];
  for(const name of ['FRUITS','SHOP','FLOWERS','DOG_BREEDS','CAT_BREEDS','THEMES','SEASON_META','SEASON_ITEMS'])code.push(declaration('index.html',name,'object'));
  for(const name of ['CROP_SEED_COST','THEME_COST','FLOWER_COST','PET_COST','DAILY_HEART_CAP'])code.push(source['index.html'].match(new RegExp('^const '+name+'=.*;$','m'))[0]);
  code.push('const PRODUCE_TRADE_COST=4,PRODUCE_TRADE_REWARD=6,PRODUCE_TRADE_LIMIT=2;');
  for(const name of ['defaultLiving','normalizePlots','mergeLiving','livingPayload','dueCare','buyItem','careIndoor','harvestIndoor','shopCard','shopSection','renderShop'])code.push(declaration('index.html',name));
  for(const name of ['changeWorld','spendWorld','worldFail','plotPicker','plantSeed','waterPlot','collectPlot','worldProduceTotal','produceTradeUsed','openWorldPantry','tradeProduce'])code.push(declaration('assets/world.js',name));
  for(const name of ['produceCount','spendProduce'])code.push(declaration('assets/couple.js',name));
  code.push(declaration('assets/pixel-world.js','tileGroup'));
  code.push('var cropG,potSvg;',declaration('assets/pixel-world.js','cropG','assignment'),declaration('assets/pixel-world.js','potSvg','assignment'));
  code.push('var LV=defaultLiving();');
  vm.runInContext(code.join('\n'),context);
  return{run:code=>vm.runInContext(code,context),advance:ms=>{now+=ms;},node,saved:()=>saved};
}

test('무화과가 텃밭 씨앗·상점 화분·수확 바구니에 표시된다',()=>{
  const w=createWorld();
  w.run('plotPicker(0)');assert.match(w.node('azitDialog').innerHTML,/plantSeed\(0,'fig'\)/);assert.match(w.node('azitDialog').innerHTML,/무화과/);
  w.run('renderShop()');assert.match(w.node('livingView').innerHTML,/buyItem\('potFig'\)/);assert.match(w.node('livingView').innerHTML,/무화과/);
  w.run('LV.pantry={fig:2};openWorldPantry()');assert.match(w.node('azitDialog').innerHTML,/무화과/);assert.equal(w.run('worldProduceTotal()'),2);
});

test('씨앗 구매부터 4회 물주기·수확·저장까지 기존 작물을 보존한다',async()=>{
  const w=createWorld();w.run('LV.pantry={tomato:3}');
  await w.run("plantSeed(0,'fig')");assert.equal(w.run('LV.hearts'),18);assert.equal(w.run('LV.garden.plots[0].type'),'fig');
  await w.run('collectPlot(0)');assert.equal(w.run('LV.garden.plots[0].stage'),0);
  for(let stage=1;stage<=4;stage++){
    if(stage>1)w.advance(4*3600000);
    await w.run('waterPlot(0)');assert.equal(w.run('LV.garden.plots[0].stage'),stage);
    await w.run('waterPlot(0)');assert.equal(w.run('LV.garden.plots[0].stage'),stage);
  }
  await w.run('collectPlot(0)');await w.run('collectPlot(0)');
  assert.equal(w.run('LV.pantry.fig'),2);assert.equal(w.run('LV.pantry.tomato'),3);assert.equal(w.run('LV.garden.plots[0]'),null);assert.equal(w.run('LV.garden.harvests'),1);assert.equal(w.run('LV.hearts'),18);
  const saved=w.saved();assert.equal(saved.pantry.fig,2);assert.deepEqual(saved.garden.plots[0],{e:1});
  w.run('LV=mergeLiving('+JSON.stringify(saved)+')');assert.equal(w.run('LV.pantry.fig'),2);assert.equal(w.run('LV.garden.plots[0]'),null);
});

test('10하트 무화과 화분은 수확물 1개를 주고 다시 자란다',async()=>{
  const w=createWorld();await w.run("buyItem('potFig')");assert.equal(w.run('LV.hearts'),10);assert.equal(w.run('LV.indoor[0].type'),'fig');
  for(let stage=1;stage<=4;stage++){if(stage>1)w.advance(4*3600000);await w.run('careIndoor(LV.indoor[0].id)');assert.equal(w.run('LV.indoor[0].stage'),stage);}
  await w.run('harvestIndoor(LV.indoor[0].id)');await w.run('harvestIndoor(LV.indoor[0].id)');
  assert.equal(w.run('LV.pantry.fig'),1);assert.equal(w.run('LV.indoor[0].stage'),0);assert.equal(w.run('LV.hearts'),10);
  await w.run('careIndoor(LV.indoor[0].id)');assert.equal(w.run('LV.indoor[0].stage'),0);
  w.advance(4*3600000);await w.run('careIndoor(LV.indoor[0].id)');assert.equal(w.run('LV.indoor[0].stage'),1);
  assert.equal(w.saved().indoor[0].type,'fig');assert.equal(w.saved().pantry.fig,1);
});

test('하트 부족·빈자리 없음·중복 심기는 잔액과 기존 상태를 바꾸지 않는다',async()=>{
  const w=createWorld();w.run('LV.hearts=1');await w.run("plantSeed(0,'fig')");assert.equal(w.run('LV.hearts'),1);assert.equal(w.run('LV.garden.plots[0]'),null);
  w.run('LV.hearts=9');await w.run("buyItem('potFig')");assert.equal(w.run('LV.hearts'),9);assert.equal(w.run('LV.indoor.length'),0);
  w.run('LV.hearts=20;LV.indoor=[{id:"old-1",type:"tomato"},{id:"old-2",type:"peach"}]');await w.run("buyItem('potFig')");assert.equal(w.run('LV.hearts'),20);assert.equal(w.run('LV.indoor.length'),2);
  await w.run("plantSeed(0,'fig')");await w.run("plantSeed(0,'fig')");assert.equal(w.run('LV.hearts'),18);
});

test('수확한 무화과는 교환 및 공용 수확물 비용에 사용할 수 있다',async()=>{
  const w=createWorld();w.run('LV.hearts=10;LV.pantry={fig:4}');await w.run('tradeProduce()');assert.equal(w.run('LV.hearts'),16);assert.equal(w.run('LV.pantry.fig'),0);
  w.run('LV.pantry={fig:4}');assert.equal(w.run('spendProduce(LV,4)'),true);assert.equal(w.run('produceCount()'),0);assert.equal(w.run('spendProduce(LV,1)'),false);
});

test('두 사람이 같은 무화과 밭을 동시에 수확해도 2개만 적립된다',async()=>{
  const seed=createWorld(),value=clone(seed.run('defaultLiving()'));value.garden.plots[0]={type:'fig',stage:4,care:[]};value.pantry={tomato:3};
  const shared={value,version:0},a=createWorld(shared),b=createWorld(shared);
  await Promise.all([a.run('collectPlot(0)'),b.run('collectPlot(0)')]);
  assert.equal(shared.value.pantry.fig,2);assert.equal(shared.value.pantry.tomato,3);assert.equal(shared.value.garden.harvests,1);assert.deepEqual(shared.value.garden.plots[0],{e:1});
});

test('무화과의 5개 성장 단계와 익은 보라색 열매가 구분된다',()=>{
  const w=createWorld(),stages=[];
  for(let stage=0;stage<=4;stage++)stages.push(w.run('cropG({type:"fig",stage:'+stage+'},30,37)'));
  assert.equal(new Set(stages).size,5);for(const svg of stages)assert.doesNotMatch(svg,/undefined|NaN/);
  assert.match(stages[4],/#8c5779/);assert.match(stages[4],/class="spark"/);assert.notEqual(stages[4],w.run('cropG({type:"peach",stage:4},30,37)'));
  for(const type of w.run('Object.keys(FRUITS)'))assert.doesNotMatch(w.run('cropG({type:'+JSON.stringify(type)+',stage:4},30,37)'),/undefined|NaN/);
});

test('변경한 JavaScript와 HTML 안의 스크립트 문법이 유효하다',()=>{
  new vm.Script(source['assets/pixel-world.js']);
  for(const match of source['index.html'].matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
});

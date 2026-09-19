async (page) => {
  const checks=[],errors=[];
  const check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
  page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:4173/?local-preview=1');
  check(await page.evaluate(()=>db===null),'로컬 미리보기 전용 검증');
  await page.getByRole('button',{name:'🏡 룸',exact:true}).click();
  for(const [type,breed,name] of [['dog','cocker','코카스파니엘'],['dog','pomeranian','포메라니안'],['cat','norwegian','노르웨이숲'],['cat','bengal','뱅갈']]){
    await page.evaluate(async()=>{LV=defaultLiving();LV.hearts=200;await saveLiving();setLoc('shop');});
    await page.getByRole('button',{name:name+' 💗 50',exact:true}).click();
    check(await page.evaluate(b=>LV.pets.length===1&&LV.pets[0].breed===b&&LV.hearts===150,breed),name+' 구매 및 차감');
    check(await page.locator('.living-scene [data-pet-id]').count()===1,name+' 거실 표시');
    await page.locator('.pet-family [data-pet-id]').first().getByRole('button',{name:'밥 챙겨주기',exact:true}).click();
    check(await page.evaluate(()=>LV.hearts===152),name+' 케어 보상');
    await page.evaluate(async b=>{const before=LV.hearts;await buyPet(LV.pets[0].type,b);window.varietyDuplicate=LV.pets.length===1&&LV.hearts===before;},breed);
    check(await page.evaluate(()=>window.varietyDuplicate),name+' 중복 구매 방지');
    await page.locator('.pet-family [data-pet-id]').first().getByRole('button',{name:/^마당에 보내기/}).click();
    check(await page.locator('.living-scene [data-pet-id]').count()===1,name+' 마당 이동');
    await page.reload();await page.getByRole('button',{name:'🏡 룸',exact:true}).click();
    check(await page.evaluate(b=>LV.pets[0].breed===b&&LV.pets[0].place==='garden',breed),name+' 재접속 유지');
  }
  await page.evaluate(async()=>{LV=defaultLiving();LV.hearts=200;await saveLiving();setLoc('garden');});
  for(const [type,name] of [['carrot','당근'],['pumpkin','호박'],['corn','옥수수'],['blueberry','블루베리']]){
    const before=await page.evaluate(()=>LV.hearts);
    await page.locator('[data-world-focus="plot-0"]').click();
    await page.locator('.seed-choice button').filter({hasText:name}).click();
    check(await page.evaluate(([t,h])=>LV.garden.plots[0].type===t&&LV.hearts===h-2,[type,before]),name+' 씨앗 2하트');
    for(let stage=1;stage<=4;stage++){
      if(stage>1)await page.evaluate(async()=>{LV.garden.plots[0].care=[Date.now()-1];await saveLiving();});
      await page.locator('[data-world-focus="plot-0"]').click();
      check(await page.evaluate(s=>LV.garden.plots[0].stage===s,stage),name+' 성장 '+stage);
    }
    await page.locator('[data-world-focus="plot-0"]').click();
    check(await page.evaluate(t=>LV.garden.plots[0]===null&&LV.pantry[t]===2,type),name+' 수확물 2개');
  }
  check(await page.evaluate(()=>Object.keys(FRUITS).length===9),'씨앗 9종');
  await page.evaluate(async()=>{
    LV=defaultLiving();LV.hearts=500;await saveLiving();
    await buyPet('dog','cocker');await buyPet('dog','pomeranian');await buyPet('cat','norwegian');
    const before=LV.hearts;await buyPet('cat','bengal');window.varietyLimit=LV.pets.length===3&&LV.hearts===before;
  });
  check(await page.evaluate(()=>window.varietyLimit),'새 품종도 세 마리 제한 및 초과 결제 방지');
  await page.evaluate(async()=>{
    LV.garden.plots=['carrot','pumpkin','corn','blueberry','strawberry','grape'].map(type=>({type,stage:4,care:[]}));
    LV.pets=[{id:'cocker',type:'dog',breed:'cocker',place:'garden',care:[]},{id:'pomeranian',type:'dog',breed:'pomeranian',place:'garden',care:[]},{id:'norwegian',type:'cat',breed:'norwegian',place:'garden',care:[]}];
    isNight=()=>false;worldStill=true;await saveLiving();setLoc('garden');
  });
  for(const width of [320,390,1280]){
    await page.setViewportSize({width,height:900});
    await page.locator('.living-scene').screenshot({path:`output/playwright/variety-garden-${width}.png`,animations:'disabled'});
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+'px 텃밭 가로 넘침 없음');
  }
  await page.setViewportSize({width:390,height:900});
  await page.evaluate(async()=>{
    LV.furniture={light:'xmasLights',shelf:'snowGlobe',yard:'giftBench'};LV.ownedFurniture=Object.values(LV.furniture);
    LV.pets.forEach(p=>p.place='room');await saveLiving();setLoc('room');
  });
  check(await page.evaluate(()=>['xmasLights','snowGlobe'].every(id=>placedFurnitureG('room').includes(furnitureArt(FURNITURE[id].kind)))),'겨울 조명·스노볼 거실 배치');
  await page.locator('.living-scene').screenshot({path:'output/playwright/variety-christmas-room-390.png',animations:'disabled'});
  await page.evaluate(()=>setLoc('garden'));
  check(await page.evaluate(()=>placedFurnitureG('garden').includes(furnitureArt('giftBench'))),'선물 벤치 마당 배치');
  await page.locator('.living-scene').screenshot({path:'output/playwright/variety-christmas-garden-390.png',animations:'disabled'});
  await page.setViewportSize({width:1280,height:900});
  await page.evaluate(()=>{
    const sheet=document.createElement('div');sheet.id='variety-sheet';sheet.style='padding:24px;background:#f5ecd5;color:#5c4c3e;font:16px sans-serif;width:680px';
    sheet.innerHTML='<h2>새 친구들 · 성장 단계 · 겨울 소품</h2>'+[['dog','cocker'],['dog','pomeranian'],['cat','norwegian'],['cat','bengal']].map(([type,breed])=>'<span style="display:inline-block;margin:10px">'+petSvg(type,breed,112)+'<br>'+((type==='dog'?DOG_BREEDS:CAT_BREEDS)[breed].n)+'</span>').join('')+['carrot','pumpkin','corn','blueberry'].map(type=>'<div style="display:flex;align-items:center"><span style="width:80px">'+FRUITS[type].n+'</span>'+[0,1,2,3,4].map(stage=>'<svg width="110" height="100" viewBox="-35 -40 70 65">'+cropG({type,stage},0,0)+'</svg>').join('')+'</div>').join('')+['xmasLights','snowGlobe','giftBench'].map(kind=>'<span style="display:inline-block;width:180px;margin:12px">'+furnitureArt(kind)+'</span>').join('');document.body.append(sheet);
  });
  await page.locator('#variety-sheet').screenshot({path:'output/playwright/variety-art-sheet.png',animations:'disabled'});
  await page.locator('#variety-sheet').evaluate(el=>el.remove());
  check(errors.length===0,'브라우저 오류 없음: '+errors.join(', '));
  return checks;
}

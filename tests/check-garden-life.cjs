/* Run with node tests/check-garden-life.cjs while the local preview serves port 4173. */
const assert=require('node:assert/strict');
const {chromium}=require('../output/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright');
const APP='http://127.0.0.1:4173/?local-preview=1';
const EXECUTABLE='C:/Users/pwjcu/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe';
const clone=value=>JSON.parse(JSON.stringify(value));
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:EXECUTABLE});
  const contexts=await Promise.all([browser.newContext({viewport:{width:320,height:800},reducedMotion:'reduce'}),browser.newContext()]);
  const pages=await Promise.all(contexts.map(context=>context.newPage()));
  const errors=[];pages.forEach(page=>page.on('pageerror',error=>errors.push(error.message)));
  let shared={value:null,revision:0},checks=0;
  const check=(value,name)=>{assert.ok(value,name);checks++;};
  const sync=()=>Promise.all(pages.map(page=>page.evaluate(value=>{LV=mergeLiving(value);renderLiving();},clone(shared.value))));
  try{
    await Promise.all(pages.map(page=>page.goto(APP,{waitUntil:'load'})));
    await Promise.all(pages.map(page=>page.waitForFunction(()=>typeof gardenTreeHtml==='function'&&coupleBooted)));
    check(await pages[0].evaluate(()=>db===null),'production is isolated');
    const local=await pages[0].evaluate(async()=>{
      LV=defaultLiving();LV.hearts=20;LV.pantry={tomato:3,strawberry:1};
      let tick=new Date('2026-09-19T00:00:00+09:00').getTime();
      window.__treeNativeNow=appNow;appNow=()=>tick;
      const results=[];const ok=(condition,name)=>{if(!condition)throw Error(name);results.push(name);};
      setLoc('garden');
      ok(!gardenTree(),'legacy save without tree works');
      await plantGardenTree('apple');
      ok(LV.hearts===12&&gardenTree().growth===0,'plant costs exactly eight hearts');
      await plantGardenTree('pine');
      ok(LV.hearts===12&&gardenTree().species==='apple','active tree cannot be replaced');
      who=1;await careGardenTree();await careGardenTree();
      ok(gardenTree().growth===2,'same person cannot care twice');
      who=2;await careGardenTree();await careGardenTree();
      ok(gardenTree().growth===6,'second person earns one co-op bonus');
      await compostGardenTree();await compostGardenTree();
      ok(gardenTree().growth===8&&produceCount()===0,'compost consumes four mixed produce once');
      ok(gardenTreeStage(gardenTree())===1,'growth threshold changes stage');
      ok(await archiveGardenTree()===false&&gardenTree(),'unfinished tree cannot be archived');
      const saved=JSON.stringify(livingPayload(LV));
      LV=mergeLiving(JSON.parse(saved));
      ok(gardenTree().growth===8&&gardenTree().careDays[1]===dayKey(),'save round trip retains growth and care');
      const backup=prepareBackup(JSON.stringify({living:LV}));
      ok(backup.living.garden.sharedTree.growth===8,'backup retains the shared tree');
      tick+=86400000;who=1;await careGardenTree();
      ok(gardenTree().growth===10,'Korean midnight unlocks next daily care');
      const savedSet=DB.setObj,before=JSON.stringify(LV);
      DB.setObj=async()=>{throw Error('expected tree save failure');};
      who=2;await careGardenTree();
      ok(JSON.stringify(LV)===before&&!worldBusy,'failed local write rolls back and releases lock');
      DB.setObj=savedSet;await careGardenTree();
      ok(gardenTree().growth===14,'retry after failed save succeeds once');
      const growth=gardenTree().growth;await compostGardenTree();
      ok(gardenTree().growth===growth,'insufficient produce cannot award growth');
      gardenTree().careDays[1]='2026-09-21';gardenTree().compostDay='2026-09-21';LV.pantry={tomato:4};who=1;
      await careGardenTree();await compostGardenTree();
      ok(gardenTree().growth===growth&&produceCount()===4&&gardenTree().careDays[1]==='2026-09-21','older-day request never overwrites newer care or compost');
      // Move to the final threshold to check saturation and archive semantics.
      gardenTree().growth=79;gardenTree().careDays={};who=1;await careGardenTree();
      ok(gardenTree().growth===80&&gardenTree().maturedAt===tick,'maturity saturates and records timestamp');
      LV.pantry={tomato:4};await compostGardenTree();
      ok(produceCount()===4,'mature tree cannot spend produce');
      await archiveGardenTree();await archiveGardenTree();
      ok(!gardenTree()&&LV.garden.treeCollection.apple===1,'archive keeps one mature tree without duplicates');
      await plantGardenTree('cherry');
      ok(gardenTree().species==='cherry'&&LV.garden.treeCollection.apple===1,'new sapling preserves mature collection');
      ok(mergeLiving(livingPayload(LV)).garden.treeCollection.apple===1,'collection persists through save serialization');
      ok(new Set(Object.keys(GARDEN_TREES).map(species=>gardenTreeSvg(species))).size===4,'four species have distinct artwork');
      appNow=window.__treeNativeNow;delete window.__treeNativeNow;renderLiving();
      return results;
    });
    checks+=local.length;
    const page=pages[0];
    const captureGarden=async name=>{
      await page.waitForFunction(()=>!$('toast').classList.contains('on'));
      await page.locator('.pixel-garden').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
      await page.locator('.pixel-garden').screenshot({path:`output/playwright/${name}.png`,animations:'disabled'});
    };
    await page.evaluate(()=>{LV.hearts=80;gardenTree().growth=48;gardenTree().careDays={};S.n1='아주 긴 첫 번째 사람 이름';S.n2='두 번째 사람';renderLiving();go(5,document.querySelectorAll('nav button')[5]);setLoc('garden');});
    check(await page.locator('#livingView #gardenTreeCard').count()===0,'tree has no separate card below the garden');
    check(await page.locator('.pixel-garden svg #gardenTreePlot').count()===1,'saved tree occupies one place in the garden SVG');
    await page.locator('#gardenTreePlot').click();
    check(await page.locator('#azitDialog').evaluate(dialog=>dialog.open)&&await page.locator('#azitDialog #gardenTreeCard').count()===1,'garden tree opens its care controls');
    check(await page.locator('#azitDialog .tree-landscape').count()===0,'care controls do not duplicate the garden landscape');
    await page.locator('[data-world-focus="tree-person-2"]').click();
    check(await page.locator('[data-world-focus="tree-person-2"]').getAttribute('aria-pressed')==='true','person chooser is explicit');
    await page.locator('[data-world-focus="tree-care"]').click();
    await page.waitForFunction(()=>!worldBusy);
    check(await page.evaluate(()=>gardenTree().careDays[2]===dayKey()&&!gardenTree().careDays[1]),'UI cares under the selected second name');
    check(await page.evaluate(()=>JSON.parse(window.render_game_to_text()).sharedTree.tree.cared.includes(2)),'text state exposes the visible selected-person care');
    check(await page.locator('[data-world-focus="tree-care"]').isDisabled(),'completed care has disabled action');
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=320),'320px has no horizontal overflow');
    await page.locator('#azitDialog').screenshot({path:'output/playwright/tree-controls-320.png',animations:'disabled'});
    await page.locator('#azitDialog .dialog-close').click();
    check(await page.locator('#gardenTreePlot').evaluate(el=>el===document.activeElement),'closing care returns focus to the tree after its scene rerender');
    for(const key of ['Enter','Space']){
      await page.locator('#gardenTreePlot').focus();await page.keyboard.press(key);
      check(await page.locator('#azitDialog').evaluate(dialog=>dialog.open),key+' opens the garden tree');
      await page.keyboard.press('Escape');
      check(await page.locator('#gardenTreePlot').evaluate(el=>el===document.activeElement),'Escape restores tree focus after '+key);
    }
    await page.evaluate(()=>{LV.garden.sharedTree=null;renderLiving();});
    await captureGarden('tree-in-garden-empty-320');
    await page.locator('#gardenTreePlot').click();
    check(await page.locator('#azitDialog [data-world-focus^="tree-plant-"]').count()===4,'empty garden place offers four saplings');
    await page.locator('#azitDialog').screenshot({path:'output/playwright/tree-species-320.png',animations:'disabled'});
    await page.locator('[data-world-focus="tree-plant-pine"]').click();
    await page.waitForFunction(()=>!worldBusy&&gardenTree()?.species==='pine');
    check(await page.locator('#azitDialog [data-world-focus="tree-care"]').count()===1&&await page.locator('#azitDialog [data-world-focus^="tree-plant-"]').count()===0,'planting updates the same dialog to care controls');
    const plantedId=await page.evaluate(()=>gardenTree().id);
    await page.locator('#azitDialog .dialog-close').click();
    await page.reload({waitUntil:'load'});await page.waitForFunction(()=>typeof openGardenTree==='function'&&coupleBooted);
    await page.evaluate(()=>{go(5,document.querySelectorAll('nav button')[5]);setLoc('garden');});
    check(await page.evaluate(id=>gardenTree()?.id===id&&gardenTree().species==='pine',plantedId),'planted garden tree survives a page reload');
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});
      await page.evaluate(()=>{gardenTree().species='cherry';gardenTree().growth=80;renderLiving();});
      const bounds=await page.locator('#gardenTreePlot').boundingBox();
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)&&bounds.width>0&&bounds.x>=0&&bounds.x+bounds.width<=width+1,width+'px garden shows the tree without horizontal clipping');
      await captureGarden(`tree-in-garden-${width}`);
    }
    await page.setViewportSize({width:390,height:900});
    for(const species of ['apple','zelkova','cherry','pine']){
      const artwork=[],spriteHeights=[];
      for(const growth of [0,8,24,48,80]){
        await page.evaluate(({species,growth})=>{gardenTree().species=species;gardenTree().growth=growth;renderGardenTree();},{species,growth});
        artwork.push(await page.locator('#gardenTreePlot').innerHTML());
        spriteHeights.push(await page.locator('#gardenTreePlot > g').first().evaluate(el=>el.getBBox().height));
        check(await page.evaluate(({species,growth})=>{const state=JSON.parse(render_game_to_text()).sharedTree.tree;return state.species===species&&state.growth===growth;},{species,growth}),species+' '+growth+' scene and text state agree');
      }
      check(new Set(artwork).size===5,species+' changes its in-garden art at every growth stage');
      check(spriteHeights.every((height,index)=>height>0&&(index===0||height>spriteHeights[index-1])),species+' actual tree sprite grows taller at every stage');
      await captureGarden(`tree-in-garden-${species}`);
    }
    await page.evaluate(()=>{gardenTree().growth=0;renderGardenTree();});
    await captureGarden('tree-in-garden-sapling');
    await page.locator('[data-world-focus="pantry"]').click();
    await page.locator('#azitDialog button').filter({hasText:'우리 나무에 퇴비 주기'}).click();
    check(await page.locator('#azitDialog').evaluate(dialog=>dialog.open)&&await page.locator('#azitDialog [data-world-focus="tree-compost"]').count()===1,'pantry use opens the garden tree controls');
    await page.locator('#azitDialog .dialog-close').click();
    check(await page.locator('#gardenTreePlot').evaluate(el=>el===document.activeElement),'pantry-to-tree close returns focus to the garden tree');
    await page.evaluate(()=>{
      gardenTree().species='zelkova';gardenTree().growth=80;
      LV.garden.plots=['carrot','pumpkin','corn','blueberry','strawberry','grape'].map(type=>({type,stage:4,care:[]}));
      LV.pets=[{id:'cocker',type:'dog',breed:'cocker',place:'garden',care:[]},{id:'pomeranian',type:'dog',breed:'pomeranian',place:'garden',care:[]},{id:'norwegian',type:'cat',breed:'norwegian',place:'garden',care:[]}];
      LV.garden.decor='fountain';LV.furniture={yard:'greenhouse',yardLight:'firefly'};
      isNight=()=>false;isSleeping=()=>false;worldStill=true;renderLiving();
    });
    for(const width of [320,390]){
      await page.setViewportSize({width,height:900});await captureGarden(`tree-in-garden-populated-${width}`);
      check(await page.locator('.pixel-garden [data-pet-id]').count()===3&&await page.locator('.pixel-garden [data-pixel-plot]').count()===6,width+'px populated garden keeps three pets and six crop plots');
    }
    await page.locator('#gardenTreePlot').click();
    check(await page.locator('#azitDialog [data-world-focus="tree-archive"]').count()===1,'large mature tree remains selectable alongside pets and furniture');
    await page.locator('#azitDialog .dialog-close').click();
    for(const id of ['cocker','pomeranian','norwegian']){
      await page.locator(`.pixel-garden [data-world-focus="pet-${id}"]`).click();await page.waitForFunction(()=>!worldBusy);
      check(await page.evaluate(id=>LV.pets.find(p=>p.id===id).lastAction?.kind==='stroke',id),id+' remains clickable beside the large tree');
    }
    // Two browser clients use compare-and-set transactions with an intentional first retry.
    await Promise.all(pages.map(async page=>{
      await page.exposeFunction('__treeRead',async()=>clone(shared));
      await page.exposeFunction('__treeCas',async(revision,value)=>{
        if(revision!==shared.revision)return false;
        shared={value:clone(value),revision:shared.revision+1};return true;
      });
      await page.evaluate(()=>{
        let retry=true;
        db={ref(path){if(path!=='living')throw Error('unexpected transaction path');return{transaction:async edit=>{
          for(let attempt=0;attempt<30;attempt++){
            const current=await window.__treeRead(),revision=retry?-1:current.revision;retry=false;
            const value=edit(structuredClone(current.value));
            if(value===undefined)return{committed:false,snapshot:{val:()=>structuredClone(current.value)}};
            if(await window.__treeCas(revision,value))return{committed:true,snapshot:{val:()=>structuredClone(value)}};
          }throw Error('transaction retry limit');
        }}}};
      });
    }));
    shared={value:await page.evaluate(()=>{const state=defaultLiving();state.hearts=20;state.pantry={tomato:8};return state;}),revision:1};await sync();
    await Promise.all(pages.map(page=>page.evaluate(()=>plantGardenTree('zelkova'))));
    check(shared.value.hearts===12&&shared.value.garden.sharedTree.species==='zelkova','concurrent planting and callback replay charges once');
    await sync();await Promise.all(pages.map(page=>page.evaluate(()=>{who=1;return careGardenTree();})));
    check(shared.value.garden.sharedTree.growth===2,'concurrent same-person care commits once');
    await sync();await Promise.all(pages.map(page=>page.evaluate(()=>compostGardenTree())));
    check(shared.value.garden.sharedTree.growth===4&&shared.value.pantry.tomato===4,'concurrent compost spends exactly four produce');
    shared.value.garden.sharedTree.careDays={};shared.value.garden.sharedTree.bonusDay='';shared.value.garden.sharedTree.growth=0;shared.revision++;await sync();
    await Promise.all(pages.map((page,index)=>page.evaluate(slot=>{who=slot;return careGardenTree();},index+1)));
    check(shared.value.garden.sharedTree.growth===6&&Object.keys(shared.value.garden.sharedTree.careDays).length===2,'concurrent different-person care retains both and one bonus');
    shared.value.garden.sharedTree.growth=80;shared.revision++;await sync();
    await Promise.all(pages.map(page=>page.evaluate(()=>archiveGardenTree())));
    check(shared.value.garden.sharedTree===null&&shared.value.garden.treeCollection.zelkova===1,'concurrent archive collects exactly once');
    assert.deepEqual(errors,[],'no browser exceptions');
    process.stdout.write(`PASS shared trees: ${checks} checks; garden scene, keyboard, growth, co-op, compost, persistence, failure, concurrency, mobile UI\n`);
  }finally{await Promise.all(contexts.map(context=>context.close()));await browser.close();}
})().catch(error=>{process.stderr.write(error.stack+'\n');process.exitCode=1;});

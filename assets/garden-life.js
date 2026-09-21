/* A shared tree lives inside garden so existing saves, transactions and backups retain it. */
const GARDEN_TREES={
  apple:{name:'사과나무',hint:'빨간 열매가 주렁주렁',leaf:'#78a957',shade:'#477d48',light:'#a8cd74'},
  zelkova:{name:'느티나무',hint:'둘이 쉬어 갈 넓은 그늘',leaf:'#81ae63',shade:'#4f8057',light:'#b0cf7e'},
  cherry:{name:'벚꽃나무',hint:'우리 곁에 머무는 봄',leaf:'#efa9bf',shade:'#ce7e9f',light:'#ffd6df'},
  pine:{name:'소나무',hint:'사계절 한결같은 초록',leaf:'#508b77',shade:'#35695d',light:'#7db294'}
};
const TREE_THRESHOLDS=[0,8,24,48,80];
const TREE_STAGES=['묘목','어린 나무','자라는 나무','큰 나무','다 자란 나무'];
function gardenTree(state=LV){
  const tree=state.garden?.sharedTree;
  return tree&&Object.hasOwn(GARDEN_TREES,tree.species)&&typeof tree.id==='string'?tree:null;
}
function gardenTreeGrowth(tree){return Math.max(0,Math.min(80,Math.floor(Number(tree?.growth)||0)));}
function gardenTreeStage(tree){const growth=gardenTreeGrowth(tree);return TREE_THRESHOLDS.filter(value=>growth>=value).length-1;}
function gardenTreeTextState(){
  const tree=gardenTree(),day=dayKey();
  return{tree:tree?{species:tree.species,stage:TREE_STAGES[gardenTreeStage(tree)],growth:gardenTreeGrowth(tree),goal:80,cared:[1,2].filter(slot=>tree.careDays?.[slot]===day),composted:tree.compostDay===day}:null,collection:{...LV.garden?.treeCollection}};
}
function gardenTreeArt(species,stage=4){
  const t=GARDEN_TREES[species]||GARDEN_TREES.apple;
  let crown='';
  if(stage===0){
    crown=`<path d="M-2 0v-26h4V0Z" fill="#9b7653"/><path d="M0-20h-12v-4h-4v-8h8v4h8ZM0-12h12v-4h4v-8H8v4H0Z" fill="${t.leaf}"/>`;
  }else{
    const scale=[0,.45,.65,.84,1][stage];
    const trunk=`<path d="M-8 0v-68h16V0h8v5h-32V0Z" fill="#795943"/><path d="M0-7v-57h5v57Z" fill="#a17b50"/><path d="M-2-43-28-69v-10l30 28M3-57l25-25v-10L0-67" fill="none" stroke="#795943" stroke-width="7"/>`;
    if(species==='pine'){
      crown=`<path d="M0-151h8v15h8v16h8v16h10v16h12v16h14v18h-124v-18h14v-16h12v-16h10v-16h8v-16h8v-15Z" fill="${t.shade}"/><path d="M0-150h8v16h8v16h8v16h-52v-16h12v-16h8v-16ZM0-114h8v16h14v16h10v15h-70v-15h14v-16h14ZM0-82h8v15h18v14h18v14h-92v-14h20v-14h18Z" fill="${t.leaf}"/><path d="M0-145h5v25H0ZM-16-88h18v6h-18ZM-25-56h26v6h-26Z" fill="${t.light}"/>`;
    }else{
      const wide=species==='zelkova'?1.28:1;
      crown=`<g transform="scale(${wide},1)"><path d="M-28-150h52v8h24v12h16v18h8v32h-8v15H45v12h-85v-10h-25v-16h-8v-33h10v-19h15v-12h20Z" fill="${t.shade}"/><path d="M-30-151h51v10h24v13h14v29H42v13H10v9h-37v-10h-26v-17h-8v-21h14v-15h17Z" fill="${t.leaf}"/><path d="M-27-140h37v8h-29v10h-17v17h-12v-26h21ZM21-116h23v9H21Z" fill="${t.light}"/></g>`;
      if(species==='apple'&&stage>=3)crown+=[[-37,-112],[23,-132],[44,-86],[-14,-79],[5,-108]].map(([x,y])=>`<g transform="translate(${x},${y})"><path d="M-5-4h10v3h3v8H5v3H-5V7h-3V-1h3Z" fill="#d76260"/><rect x="-3" y="-2" width="3" height="3" fill="#ffd1a1"/><path d="M0-4v-5h4" fill="none" stroke="#645943" stroke-width="2"/></g>`).join('');
      if(species==='cherry')crown+=[[-34,-118],[18,-137],[46,-104],[-17,-88],[11,-111],[36,-77]].map(([x,y])=>`<path transform="translate(${x},${y})" d="M-3-8h6v5h5v6H3v5h-6V3h-5v-6h5Z" fill="#ffe7e9"/>`).join('');
    }
    crown=`<g transform="scale(${scale})">${trunk}${crown}</g>`;
  }
  return crown;
}
function gardenTreeSvg(species,stage=4){
  const t=GARDEN_TREES[species]||GARDEN_TREES.apple;
  return `<svg viewBox="0 0 240 190" role="img" aria-label="${t.name} · ${TREE_STAGES[stage]}" shape-rendering="crispEdges"><path d="M71 172h98v7H71Z" fill="#adc595"/><g transform="translate(120,172)">${gardenTreeArt(species,stage)}</g></svg>`;
}
// The same rooted sprite grows in place, inside the crop garden's SVG world.
function gardenTreeSceneG(){
  const tree=gardenTree(),growth=gardenTreeGrowth(tree),stage=gardenTreeStage(tree);
  const title=tree?GARDEN_TREES[tree.species].name:'묘목 심기';
  const status=tree?TREE_STAGES[stage]+' · '+growth+'/80':'빈 나무 자리 · 8하트';
  let art=tileRect(150,72,248,241,'transparent');
  art+='<path class="tree-ground" d="M219 249h110v7h22v15h-17v8H211v-8h-18v-15h26Z" fill="#9b8757"/><path d="M225 251h98v6h17v11H215v-11h10Z" fill="#b9a373"/><path d="M214 267h14v4h-14M303 253h12v3h-12M266 273h18v3h-18" fill="#7e794e"/>';
  if(tree){
    art+=tileGroup(274,265,1.18,gardenTreeArt(tree.species,stage));
    if(growth<80&&tree.careDays?.[Number(who)===2?2:1]!==dayKey())art+=tileGroup(335,245,1,'<path d="M0-8h4v4h4v8H4v4H0V4h-4V-4h4Z" fill="#cae9e0"/><path d="M0-3h2v6H0Z" fill="#fff9df"/>');
  }else{
    art+='<path d="M272 265v-27h4v27M274 244l-9-8m9 1 9-9" fill="none" stroke="#88704e" stroke-width="3"/><path d="M258 230h10v7h-10M280 223h10v8h-10" fill="#628559"/><path d="M226 237v-26h4v26M219 209h18v10h-18Z" fill="#9b7651"/><path d="M224 211v6m-3-3h6" stroke="#f7ddb2" stroke-width="2"/>';
  }
  art+=tileRect(190,281,168,21,'#69563e')+tileRect(193,283,162,17,'#f2d9a6')+tileLabel(274,296,title,'#604e37',14)+tileLabel(274,316,status,'#4f503b',12);
  return tileAction(title+' · '+status+' · 눌러서 '+(tree?'돌보기':'심기'),'openGardenTree()',art,'id="gardenTreePlot" class="clk garden-tree-plot" data-world-focus="tree-open" aria-haspopup="dialog"');
}
function gardenTreeCollectionHtml(){
  const collection=LV.garden?.treeCollection||{};
  const entries=Object.entries(GARDEN_TREES).filter(([key])=>Number(collection[key])>0);
  return entries.length?`<details class="tree-collection"><summary>함께 키운 나무 ${entries.reduce((n,[key])=>n+Number(collection[key]),0)}그루</summary><div>${entries.map(([key,t])=>`<figure>${gardenTreeSvg(key)}<figcaption>${t.name} · ${Math.floor(Number(collection[key]))}그루</figcaption></figure>`).join('')}</div><p>보관한 나무는 언제든 여기에서 감상할 수 있어요.</p></details>`:'';
}
function gardenTreeHtml(){
  const tree=gardenTree(),day=dayKey();
  if(!tree)return `<section id="gardenTreeCard" class="garden-tree-care" aria-label="텃밭에 나무 심기"><p class="tree-intro">텃밭의 빈 나무 자리에 어떤 묘목을 심을까요?<br>둘이 돌볼수록 그 자리에서 커다랗게 자라요.</p><div class="tree-seeds">${Object.entries(GARDEN_TREES).map(([key,t])=>`<button type="button" data-world-focus="tree-plant-${key}" onclick="plantGardenTree('${key}')" ${LV.hearts<8?'disabled':''}>${gardenTreeSvg(key)}<strong>${t.name}</strong><small>${t.hint}</small><span>묘목 심기 · 8💗</span></button>`).join('')}</div><p class="tree-fine">보유 ${LV.hearts}하트 · 나무는 한 번에 한 그루씩 키워요.<br>돌보지 못한 날에도 시들지 않아요.</p>${gardenTreeCollectionHtml()}</section>`;
  const growth=gardenTreeGrowth(tree),stage=gardenTreeStage(tree),mature=growth>=80,selected=Number(who)===2?2:1;
  const names={1:S.n1,2:S.n2},both=[1,2].every(slot=>tree.careDays?.[slot]===day);
  return `<section id="gardenTreeCard" class="garden-tree-care" aria-label="텃밭 나무 돌보기"><div class="tree-growth-heading"><strong>${GARDEN_TREES[tree.species].name}</strong><span>${TREE_STAGES[stage]} · ${growth} / 80</span></div><progress max="80" value="${growth}" aria-label="나무 성장">${growth} / 80</progress>${mature?`<p class="tree-intro">두 사람의 손길이 커다란 나무가 되었어요.<br>텃밭에서 계속 감상하거나, 우리 숲에 보관하고 이 자리에 새 묘목을 심어보세요.</p><button type="button" class="tree-main" data-world-focus="tree-archive" onclick="archiveGardenTree()">우리 숲에 보관하기</button>`:`<p class="tree-next">${TREE_STAGES[stage+1]}까지 ${TREE_THRESHOLDS[stage+1]-growth} · 하루 최대 성장 +8</p><div class="tree-people" role="group" aria-label="나무를 돌볼 사람">${[1,2].map(slot=>`<button type="button" data-world-focus="tree-person-${slot}" aria-pressed="${selected===slot}" onclick="chooseGardenTreePerson(${slot})"><strong>${esc(names[slot])}</strong><small>${tree.careDays?.[slot]===day?'오늘 돌봄 완료 ✓':'오늘의 손길을 기다려요'}</small></button>`).join('')}</div><button type="button" class="tree-main" data-world-focus="tree-care" ${tree.careDays?.[selected]===day?'disabled':''} onclick="careGardenTree()">${esc(names[selected])}${tree.careDays?.[selected]===day?' · 오늘 돌봄 완료':'의 손길 주기 · 성장 +2'}</button><p class="tree-coop">${both?'✓ 둘이 함께 돌봐서 성장 +2를 더 받았어요':'둘 다 돌보면 함께 돌봄 보너스 +2'}</p><button type="button" class="tree-compost" data-world-focus="tree-compost" ${tree.compostDay===day||produceCount()<4?'disabled':''} onclick="compostGardenTree()">${tree.compostDay===day?'오늘의 퇴비 주기 완료 ✓':'수확물 4개로 퇴비 주기 · 성장 +2'}</button><p class="tree-fine">수확물 ${produceCount()}개 보유 · 퇴비는 둘이 합쳐 하루 한 번<br>매일 한국 시간 자정에 다시 돌볼 수 있어요.</p>`}${gardenTreeCollectionHtml()}</section>`;
}
function openGardenTree(){
  openAzitDialog('텃밭의 우리 나무',gardenTreeHtml());
  $('azitDialog').addEventListener('close',restoreGardenTreeFocus);
}
function restoreGardenTreeFocus(){
  const dialog=$('azitDialog');
  // A previous dialog's queued close event can arrive after this one opens.
  if(dialog.open)return;
  dialog.removeEventListener('close',restoreGardenTreeFocus);
  document.querySelector('[data-world-focus="tree-open"]')?.focus({preventScroll:true});
}
function renderGardenTreeDialog(){
  const dialog=$('azitDialog'),card=$('gardenTreeCard');
  if(!dialog?.open||!card)return;
  const focusKey=card.contains(document.activeElement)?document.activeElement.dataset.worldFocus:null;
  const scroll=dialog.scrollTop;
  const collectionOpen=!!card.querySelector('.tree-collection[open]');
  card.outerHTML=gardenTreeHtml();
  const updated=$('gardenTreeCard');
  if(collectionOpen)updated.querySelector('.tree-collection')?.setAttribute('open','');
  updated.setAttribute('aria-busy',String(worldBusy));
  if(worldBusy)updated.querySelectorAll('button').forEach(button=>button.disabled=true);
  if(focusKey){
    const target=Array.from(updated.querySelectorAll('[data-world-focus]')).find(el=>el.dataset.worldFocus===focusKey&&!el.disabled);
    (target||dialog.querySelector('.dialog-close'))?.focus({preventScroll:true});
  }
  dialog.scrollTop=scroll;
}
function renderGardenTree(){
  if(locView==='garden')renderLiving();
  else renderGardenTreeDialog();
}
function chooseGardenTreePerson(slot){setWho(slot);renderGardenTree();document.querySelector(`[data-world-focus="tree-person-${Number(slot)===2?2:1}"]`)?.focus({preventScroll:true});}
async function plantGardenTree(species){
  if(!Object.hasOwn(GARDEN_TREES,species))return false;
  const id=coupleId(),plantedAt=appNow();
  return changeWorld(state=>{
    if(gardenTree(state))return worldFail('함께 키우는 나무가 이미 있어요');
    if(!spendWorld(state,8))return worldFail('묘목을 심으려면 8하트가 필요해요');
    state.garden.sharedTree={id,species,growth:0,plantedAt,careDays:{}};
    return{message:GARDEN_TREES[species].name+' 묘목을 함께 심었어요 🌱'};
  });
}
async function tendGardenTree(kind){
  const id=gardenTree()?.id,slot=Number(who)===2?2:1,day=dayKey(),now=appNow();
  if(!id||!['care','compost'].includes(kind))return false;
  return changeWorld(state=>{
    const tree=gardenTree(state);
    if(!tree||tree.id!==id)return worldFail('나무가 바뀌었어요. 다시 확인해 주세요');
    if(gardenTreeGrowth(tree)>=80)return worldFail('멋진 나무로 다 자랐어요');
    let amount=2,message='오늘의 손길로 나무가 자랐어요 🌿';
    if(kind==='care'){
      // A callback retried across midnight must never overwrite a later day's care.
      if(tree.careDays?.[slot]>=day)return worldFail('오늘은 이미 돌봤어요. 내일 또 만나요');
      tree.careDays={...tree.careDays,[slot]:day};
      if(tree.careDays[1]===day&&tree.careDays[2]===day&&!(tree.bonusDay>=day)){amount+=2;tree.bonusDay=day;message='두 사람의 손길이 모였어요! 함께 돌봄 보너스 +2 🌳';}
    }else{
      if(tree.compostDay>=day)return worldFail('오늘은 이미 퇴비를 주었어요');
      if(!spendProduce(state,4))return worldFail('퇴비를 만들 수확물 4개가 필요해요');
      tree.compostDay=day;message='남은 수확물이 나무를 키우는 퇴비가 되었어요 🌱';
    }
    tree.growth=Math.min(80,gardenTreeGrowth(tree)+amount);
    if(tree.growth===80){tree.maturedAt=now;message='함께 키운 나무가 다 자랐어요! 우리만의 숲이 시작돼요 🌳';}
    return{message};
  });
}
function careGardenTree(){return tendGardenTree('care');}
function compostGardenTree(){return tendGardenTree('compost');}
async function archiveGardenTree(){
  const id=gardenTree()?.id;
  if(!id)return false;
  return changeWorld(state=>{
    const tree=gardenTree(state);
    if(!tree||tree.id!==id||gardenTreeGrowth(tree)<80)return worldFail('다 자란 나무만 우리 숲에 보관할 수 있어요');
    const collection={...state.garden.treeCollection};
    collection[tree.species]=Math.max(0,Math.floor(Number(collection[tree.species])||0))+1;
    state.garden.treeCollection=collection;state.garden.sharedTree=null;
    return{message:'우리 숲에 나무를 보관했어요. 새 묘목도 함께 키워보세요 🌳'};
  });
}

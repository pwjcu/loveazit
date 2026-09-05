async (page) => {
  const results=await page.evaluate(async()=>{
    if(db!==null)throw new Error('Local preview required');
    const checks=[];const check=(ok,label)=>{if(!ok)throw new Error(label);checks.push(label);};
    const original=JSON.parse(JSON.stringify(LV));
    try{
      let remote=defaultLiving();remote.hearts=30;
      LV.hearts=999;
      db={ref:()=>({transaction:async(edit)=>{const next=edit(remote);if(next===undefined)return{committed:false};remote=next;return{committed:true,snapshot:{val:()=>remote}};}})};
      await buyPet('dog','husky');
      check(remote.hearts===30&&remote.pets.length===0,'거래가 최신 공유 잔액으로 하트 부족 판정');
      remote.hearts=100;
      await buyPet('dog','husky');
      check(remote.hearts===50&&remote.pets.length===1,'공유 거래 성공 시 펫과 잔액 함께 반영');
      await buyPet('dog','husky');
      check(remote.hearts===50&&remote.pets.length===1,'공유 거래 중복 구매 거절');
      const snapshot=JSON.stringify(LV);
      const oldError=console.error;console.error=()=>{};
      db={ref:()=>({transaction:async()=>{throw new Error('Simulated storage failure');}})};
      try{await buyFurniture('lamp');}finally{console.error=oldError;}
      check(JSON.stringify(LV)===snapshot&&!worldBusy,'저장 실패 시 하트·소품 변동 없음과 재시도 잠금 해제');
      const migrated=mergeLiving({hearts:47,pets:{savedDog:{type:'dog',breed:'husky',care:[1]}},garden:{plots:{0:{type:'tomato',stage:2,care:[7]},5:{e:1}},decor:'fountain'}});
      check(migrated.pets[0].place==='room'&&migrated.pets[0].id==='savedDog'&&migrated.hearts===47,'기존 객체형 펫 데이터와 구매 내역 유지');
      check(migrated.garden.plots.length===6&&migrated.garden.plots[0].stage===2&&migrated.garden.plots[0].care[0]===7&&migrated.garden.ownedDecor.includes('fountain'),'기존 텃밭 단계·물주기·장식 유지');
      const day=koreaDay,profile=JSON.parse(JSON.stringify(FT));
      try{
        koreaDay=()=> '2026-09-06';
        check(!todayFortune(1).tarot,'한국 시간 다음 날 카드 슬롯 갱신');
      }finally{koreaDay=day;FT=profile;}
      check(normalizePillar('갑자')==='甲子'&&normalizePillar('甲丑')===''&&normalizePillar('계해')==='癸亥','한글/한자 간지와 음양 조합 검증');
    }finally{db=null;LV=mergeLiving(original);renderLiving();renderHearts();renderCareList();renderFortune();}
    return checks;
  });
  for(let i=0;i<8;i++){
    await page.locator('nav button').nth(i).click();
    if(await page.locator('.page.on').count()!==1)throw new Error('Navigation page count '+i);
  }
  results.push('기존 7개 화면과 새 운세 화면 탐색');
  await page.locator('.fortune-profile').first().click();
  await page.keyboard.press('Escape');
  if(await page.locator('#azitDialog').isVisible())throw new Error('Escape should close dialog');
  results.push('프로필 대화상자 Escape 닫기');
  return results;
}

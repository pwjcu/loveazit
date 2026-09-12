async page=>{
  const checks=[],pageErrors=[];
  const check=(ok,name)=>{if(!ok)throw new Error(name);checks.push(name);};
  const waitForChalk=()=>page.waitForFunction(()=>typeof chalkSending==='boolean'&&!chalkSending);
  const closeChalk=()=>page.evaluate(()=>{const d=$('chalkDialog');if(d?.open)d.close();});
  const openChalkPage=async()=>{await page.locator('nav button').filter({hasText:'한마디'}).click();await page.locator('#chalkComposeOpen').waitFor();};
  page.on('pageerror',error=>pageErrors.push(error.message));
  page.on('dialog',dialog=>dialog.accept());

  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:4173/?local-preview=1',{waitUntil:'load'});
  check(await page.evaluate(()=>db===null),'로컬 미리보기에서 실제 Firebase를 사용하지 않음');
  await page.evaluate(()=>{
    for(const key of ['notes','living','who'])localStorage.removeItem(key);
  });
  await page.reload({waitUntil:'load'});
  await openChalkPage();
  await page.evaluate(async()=>{
    LV=defaultLiving();LV.hearts=0;LV.dailyEarn={};LV.rewardLedger={};await saveLiving();
    setWho(1);renderPostOffice();
  });

  // Korean composition events must update one draft without interpreting markup.
  await page.locator('#chalkComposeOpen').click();
  await page.locator('#chalkInput').evaluate(input=>{
    input.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true,data:'안'}));
    input.value='안녕';
    input.dispatchEvent(new InputEvent('input',{bubbles:true,data:'안녕',inputType:'insertCompositionText',isComposing:true}));
    input.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:'안녕'}));
  });
  check(await page.locator('#chalkPreviewText').textContent()==='안녕'&&await page.evaluate(()=>chalkDrafts[1].text)==='안녕','한글 IME 조합 입력을 초안과 미리보기에 반영');

  const first='안녕, 오늘도 고마워 <img src=x onerror="window.__chalkXss=1">';
  await page.locator('#chalkInput').fill(first);
  check(await page.locator('#chalkPreviewText .chalk-letter').count()>0,'키보드 입력을 분필 글씨 애니메이션으로 미리보기');
  check(await page.locator('#chalkPreviewText').textContent()===first&&await page.locator('#chalkPreviewText img').count()===0&&await page.evaluate(()=>!window.__chalkXss),'미리보기에서 HTML을 문자 그대로 안전하게 표시');

  // Each writer keeps an independent draft while switching in the same dialog.
  await page.getByRole('group',{name:'한마디를 남길 사람'}).getByRole('button',{name:'너',exact:true}).click();
  await page.locator('#chalkInput').fill('두 번째 사람의 독립 초안');
  await page.getByRole('group',{name:'한마디를 남길 사람'}).getByRole('button',{name:'나',exact:true}).click();
  check(await page.locator('#chalkInput').inputValue()===first,'작성자를 오가도 첫 번째 사람 초안 유지');
  await page.getByRole('group',{name:'한마디를 남길 사람'}).getByRole('button',{name:'너',exact:true}).click();
  check(await page.locator('#chalkInput').inputValue()==='두 번째 사람의 독립 초안','두 번째 사람 초안을 첫 번째 초안과 분리');
  await page.getByRole('group',{name:'한마디를 남길 사람'}).getByRole('button',{name:'나',exact:true}).click();

  await page.locator('#chalkSend').click();await waitForChalk();
  check(await page.evaluate(text=>notes.length===1&&notes[0].text===text&&notes[0].kind==='chalk',first),'첫 한마디를 기존 notes 저장소에 추가');
  check(await page.locator('.chalk-stack .chalk-copy').textContent()===first&&await page.locator('.chalk-stack img').count()===0&&await page.evaluate(()=>!window.__chalkXss),'게시된 칠판에서도 HTML 실행 없이 원문 표시');
  const firstReward=await page.evaluate(()=>({hearts:LV.hearts,count:LV.rewardLedger[dayKey()]?.counts?.note}));
  check(firstReward.hearts===2&&firstReward.count===1,'첫 한마디에 note 활동 보상 1회 지급');

  // New notes accumulate, including multiple messages by the same writer.
  await page.locator('#chalkComposeOpen').click();
  const second='지금 칠판에 남을 최신 한마디 ♡';
  await page.locator('#chalkInput').fill(second);await page.locator('#chalkSend').click();await waitForChalk();
  check((await page.locator('.chalk-stack .chalk-copy').allTextContents()).join('|')===[first,second].join('|'),'같은 사람이 쓴 여러 한마디가 칠판에 함께 누적');
  check(await page.locator('.chalk-added').count()===1&&await page.locator('.chalk-added .chalk-letter').count()>0,'새 글에만 분필 애니메이션을 적용하고 이전 글 유지');
  await page.locator('#chalkBoardOpen').click();
  const historyText=await page.locator('.chalk-history').innerText();
  check(await page.locator('.chalk-history article').count()===2&&historyText.includes(first)&&historyText.includes(second),'칠판을 누르면 현재 글과 이전 글을 모두 조회');
  await closeChalk();
  check(await page.evaluate(()=>LV.hearts)===firstReward.hearts,'같은 날 추가 한마디는 note 보상 상한을 공유');

  // Legacy text notes remain visible and history is paged at exactly 20 records.
  await page.evaluate(async()=>{
    const saved=JSON.parse(localStorage.getItem('notes')||'[]'),base=Date.now()-100000;
    for(let i=0;i<21;i++)saved.push({id:'legacy-chalk-'+i,who:i%2+1,text:'과거 메모 '+i,ts:base-i});
    localStorage.setItem('notes',JSON.stringify(saved));await refreshLocal('notes');
  });
  await page.locator('#chalkBoardOpen').click();
  check(await page.locator('.chalk-history article').count()===20&&(await page.locator('.chalk-pagination').innerText()).includes('1 / 2'),'한마디 기록을 페이지당 20개로 표시');
  await page.locator('[data-chalk-page="next"]').click();
  check(await page.locator('.chalk-history article').count()===3&&(await page.locator('.chalk-pagination').innerText()).includes('2 / 2')&&(await page.locator('.chalk-history').innerText()).includes('과거 메모 20'),'다음 페이지에서 오래된 기존 텍스트 메모까지 보존');
  await closeChalk();
  await page.reload({waitUntil:'load'});await openChalkPage();await page.locator('#chalkBoardOpen').waitFor();
  check(await page.locator('.chalk-entry').count()===4&&(await page.locator('.chalk-stack').innerText()).includes(second)&&await page.evaluate(()=>notes.length)===23,'새로고침 뒤 새 글 전체와 각 사람의 최근 기존 글 유지');

  // Browser pointer input is converted to normalized strokes and persisted as SVG.
  await page.locator('#chalkComposeOpen').click();
  await page.getByRole('button',{name:'손글씨로 쓰기',exact:true}).click();
  const canvas=page.locator('#chalkPad'),box=await canvas.boundingBox();
  if(!box)throw new Error('손글씨 칠판 위치를 찾지 못함');
  await page.mouse.move(box.x+35,box.y+45);await page.mouse.down();
  await page.mouse.move(box.x+box.width*.45,box.y+box.height*.55,{steps:8});
  await page.mouse.move(box.x+box.width*.72,box.y+box.height*.28,{steps:6});await page.mouse.up();
  check(await page.evaluate(()=>chalkDrafts[1].strokes.length===1&&chalkDrafts[1].strokes[0].length>2),'포인터 필기를 좌표 획으로 기록');
  await page.locator('#chalkSend').click();await waitForChalk();
  check(await page.locator('.chalk-stack svg.chalk-drawing').count()===1&&await page.locator('.chalk-stack polyline').count()===1,'손글씨 한마디를 최신 칠판에 SVG로 표시');
  const publishedCount=await page.evaluate(()=>notes.length);
  check(await page.evaluate(()=>{const n=chalkPosts()[0];return n.drawing?.width===640&&n.drawing?.height===360&&chalkStrokes(n).length===1;}),'손글씨 크기와 획 데이터를 notes에 저장');
  await page.reload({waitUntil:'load'});await openChalkPage();await page.locator('.chalk-stack svg.chalk-drawing').waitFor();
  check(await page.locator('.chalk-stack polyline').count()===1,'새로고침 뒤 손글씨 획 복원');

  // Undo/erase affect only the active draft, never append-only published history.
  await page.locator('#chalkComposeOpen').click();await page.getByRole('button',{name:'손글씨로 쓰기',exact:true}).click();
  const drawStroke=async(offset)=>{
    const b=await canvas.boundingBox();
    await page.mouse.move(b.x+30,b.y+offset);await page.mouse.down();await page.mouse.move(b.x+150,b.y+offset+20,{steps:5});await page.mouse.up();
  };
  await drawStroke(55);await drawStroke(115);
  check(await page.evaluate(()=>currentChalkDraft().strokes.length)===2,'새 손글씨 초안 두 획 작성');
  await page.getByRole('button',{name:'한 획 되돌리기',exact:true}).click();
  check(await page.evaluate(()=>currentChalkDraft().strokes.length)===1&&await page.evaluate(n=>notes.length===n,publishedCount),'되돌리기는 초안 한 획만 제거');
  await page.getByRole('button',{name:'지우개로 지우기',exact:true}).click();
  check(await page.evaluate(()=>currentChalkDraft().strokes.length)===0&&await page.evaluate(n=>notes.length===n,publishedCount),'지우개는 초안만 비우고 게시 기록을 삭제하지 않음');
  await closeChalk();await page.locator('#chalkBoardOpen').click();
  check(await page.locator('.chalk-history article').count()===20&&await page.locator('.chalk-history-drawing').count()>=1,'초안 삭제 뒤에도 게시된 손글씨가 기록에 남음');
  await closeChalk();

  // A failed save keeps the draft and recovers the send button.
  await page.evaluate(()=>setWho(2));await page.locator('#chalkComposeOpen').click();
  await page.getByRole('button',{name:'키보드로 쓰기',exact:true}).click();
  const failedDraft='연결 실패에도 사라지면 안 되는 초안';
  await page.locator('#chalkInput').fill(failedDraft);
  const beforeFailure=await page.evaluate(()=>notes.length);
  await page.evaluate(()=>{window.__chalkOriginalAdd=DB.add;DB.add=async()=>{throw new Error('simulated chalk failure');};});
  await page.locator('#chalkSend').click();await waitForChalk();
  check(await page.locator('#chalkInput').inputValue()===failedDraft&&await page.locator('#chalkSaveStatus').innerText().then(t=>t.includes('작성한 내용은 그대로'))&&!await page.locator('#chalkSend').isDisabled()&&await page.evaluate(n=>notes.length===n,beforeFailure),'저장 실패 시 초안·기록을 보존하고 재시도 가능');
  await page.evaluate(()=>{DB.add=window.__chalkOriginalAdd;delete window.__chalkOriginalAdd;});

  // A remote render may update the latest board while compose state and focus stay intact.
  await page.locator('#chalkInput').fill('원격 갱신 중에도 보존할 작성값');await page.locator('#chalkInput').focus();
  await page.locator('#chalkInput').evaluate(el=>el.setSelectionRange(5,5));
  const remote='다른 기기에서 도착한 한마디';
  await page.evaluate(text=>{notes.push({id:'remote-interleave',who:2,kind:'chalk',boardVersion:2,text,ts:Date.now()+1000});renderPostOffice();},remote);
  check(await page.locator('#chalkInput').inputValue()==='원격 갱신 중에도 보존할 작성값'&&await page.evaluate(()=>document.activeElement?.id)==='chalkInput'&&(await page.locator('.chalk-stack').innerText()).includes(remote)&&await page.locator('.chalk-writer-1').count()>0&&await page.locator('.chalk-writer-2').count()>0,'상대방 글도 함께 누적하고 작성값과 입력 포커스 유지');
  await closeChalk();

  // Chalk notes and pigeon letters consume the same daily note reward allowance.
  const beforeLetter=await page.evaluate(()=>LV.hearts);
  await page.locator('#letterBody').fill('칠판 보상 뒤에 보내는 편지');
  await page.getByRole('button',{name:'💌 봉인해서 보내기',exact:true}).click();
  await page.waitForFunction(()=>!letterSending&&Object.keys(LV.mailbox||{}).length===1);
  check(await page.evaluate(h=>LV.hearts===h&&LV.rewardLedger[dayKey()]?.counts?.note===1,beforeLetter),'칠판과 비둘기 편지가 note 보상 1회 제한을 공유');

  // Motion preference and narrow screens remain usable without horizontal overflow.
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#chalkComposeOpen').click();
  await page.getByRole('button',{name:'키보드로 쓰기',exact:true}).click();
  await page.locator('#chalkInput').fill('움직임 줄이기 확인');
  check(await page.locator('#chalkPreviewText .chalk-letter').count()===0&&await page.locator('.chalk-preview').evaluate(el=>getComputedStyle(el,'::after').animationName==='none'),'움직임 줄이기에서 분필·지우개 애니메이션 제거');
  await page.setViewportSize({width:320,height:780});
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&$('chalkDialog').scrollWidth<=$('chalkDialog').clientWidth+1),'320px 모바일 작성창 가로 넘침 없음');
  await closeChalk();
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'320px 모바일 칠판 가로 넘침 없음');

  // Erasing archives explicit IDs, preserves history, and never resurrects legacy posts.
  await page.evaluate(async()=>{
    notes=[{id:'old-1',who:1,text:'이전 기록',ts:1},{id:'old-2',who:1,text:'마지막 기존 글',ts:2},
      {id:'new-1',who:1,kind:'chalk',boardVersion:2,text:'나의 새 글',ts:3},
      {id:'new-2',who:2,kind:'chalk',boardVersion:2,text:'너의 새 글',ts:4}];
    localStorage.setItem('notes',JSON.stringify(notes));renderChalkboard();
  });
  await page.locator('[data-chalk-note="new-1"] .chalk-archive-note').click();
  await page.waitForFunction(()=>!chalkArchiving);
  check(await page.locator('.chalk-entry').count()===2&&await page.evaluate(()=>notes.length===4&&!!notes.find(n=>n.id==='new-1').boardArchivedAt),'개별 지우기는 선택한 글만 보관하고 전체 기록 유지');
  check(await page.evaluate(()=>document.activeElement?.dataset.noteId==='new-2'),'글 보관 뒤 다음 글 버튼으로 키보드 초점 유지');
  await page.locator('#chalkArchiveAll').click();await page.waitForFunction(()=>!chalkArchiving);
  check(await page.locator('.chalk-entry').count()===0&&await page.evaluate(()=>notes.length===4),'전체 지우기는 보관만 수행하며 더 오래된 기존 글이 다시 나타나지 않음');
  await page.reload({waitUntil:'load'});await openChalkPage();
  check(await page.locator('.chalk-entry').count()===0&&await page.locator('#chalkArchiveAll').isDisabled(),'새로고침 뒤에도 보관한 글은 칠판에 나타나지 않음');
  await page.locator('#chalkBoardOpen').click();
  check(await page.locator('.chalk-history article').count()===4&&(await page.locator('.chalk-history').innerText()).includes('기록 보관'),'보관한 글과 이전 글 모두 기록에서 읽기');await closeChalk();

  // Simulate a Firebase transaction retry after a partner appends during erase.
  await page.evaluate(async()=>{
    notes=[{id:'selected',who:1,boardVersion:2,text:'지울 글',ts:5}];renderChalkboard();
    window.__chalkSavedDB=db;
    db={ref:path=>({transaction:async edit=>{
      if(path!=='notes')throw Error('unexpected path');
      edit({selected:{who:1,boardVersion:2,text:'지울 글',ts:5}});
      const result=edit({selected:{who:1,boardVersion:2,text:'지울 글',ts:5},
        incoming:{who:2,boardVersion:2,text:'동시에 도착한 글',ts:6}});
      return{committed:true,snapshot:{val:()=>result}};
    }})};
    try{await archiveChalkNotes();}finally{db=window.__chalkSavedDB;}
  });
  check(await page.evaluate(()=>chalkVisiblePosts().length===1&&chalkVisiblePosts()[0].id==='incoming'&&notes.find(n=>n.id==='selected').boardArchivedAt),'지우기 도중 도착한 상대방의 새 글은 트랜잭션 재시도에서도 보존');
  await page.evaluate(async()=>{
    db={ref:()=>({transaction:async()=>{throw Error('simulated archive failure');}})};
    try{await archiveChalkNotes();}finally{db=window.__chalkSavedDB;delete window.__chalkSavedDB;}
  });
  check(await page.locator('.chalk-entry').count()===1&&await page.evaluate(()=>chalkVisiblePosts()[0].id==='incoming')&&!await page.locator('#chalkArchiveAll').isDisabled(),'보관 실패 시 글을 유지하고 지우기 재시도 가능');

  check(pageErrors.length===0,'페이지 JavaScript 오류 없음: '+pageErrors.join(' | '));
  return{count:checks.length,checks};
}

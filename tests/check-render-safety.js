async (page) => {
  return page.evaluate(async () => {
    if (db !== null) throw new Error('Local preview required');
    const checks = [];
    const check = (ok, label) => {
      if (!ok) throw new Error(label);
      checks.push(label);
    };
    const previous = { events, annis, qaList, selDate, del: DB.del, LV, who, openPigeonLetter, feedPigeon, toggleQAConsent, skipCoupleQA };
    const marker = 'UNTRUSTED_MARKUP';
    const eventId = `event-');window.__renderXss=1;//`;
    const anniId = `anni-');window.__renderXss=2;//`;
    const qaId = `qa-');window.__renderXss=3;//`;
    const title = `<img src=x onerror="window.__renderXss=4">${marker}`;
    const removed = [];
    try {
      window.__renderXss = 0;
      DB.del = async (kind, id) => removed.push([kind, id]);
      const date = todayStr();
      events = [{ id: eventId, date, title, emoji: '<svg onload="window.__renderXss=5">' }];
      annis = [{ id: anniId, date, title, emoji: '<img src=x onerror="window.__renderXss=6">' }];
      selDate = date;
      renderHome();
      renderCal();

      check(window.__renderXss === 0, '일정·기념일 HTML이 실행되지 않음');
      check(!document.querySelector('#uplist img, #upevlist img, #daylist img, #calgrid svg'), '일정·기념일 마크업을 DOM 요소로 만들지 않음');
      check(document.querySelector('#upevlist')?.textContent.includes(marker) && document.querySelector('#daylist')?.textContent.includes(marker), '일정·기념일 제목을 글자로 표시');

      const eventDelete = Array.from(document.querySelectorAll('#daylist [data-record-id]')).find(el => el.dataset.recordId === eventId);
      const anniDelete = Array.from(document.querySelectorAll('#daylist [data-record-id]')).find(el => el.dataset.recordId === anniId);
      eventDelete.click();
      anniDelete.click();
      check(removed.some(([kind, id]) => kind === 'events' && id === eventId) && removed.some(([kind, id]) => kind === 'annis' && id === anniId), '조작된 레코드 ID도 코드가 아닌 값으로 삭제 함수에 전달');
      check(window.__renderXss === 0, '삭제 버튼의 레코드 ID가 스크립트를 실행하지 않음');

      qaList = [{ id: qaId, question: marker, a1: '', a2: '', consent1: false, consent2: false, revealed: false, ts: Date.now() }];
      setWho(1);
      renderQA();
      const textarea = document.querySelector('#qaActive textarea');
      const submit = document.querySelector('#qaActive button[data-qa-id]');
      check(textarea?.dataset.qaId === qaId && submit?.dataset.qaId === qaId, 'Q&A 레코드 ID를 실행 코드 밖의 데이터로 유지');
      check(window.__renderXss === 0, 'Q&A 레코드 ID가 스크립트를 실행하지 않음');

      const hostile = `remote-'\" onmouseover=\"window.__renderXss=7`, now = Date.now(), calls=[];
      LV=mergeLiving({mailbox:{[hostile]:{from:1,to:2,body:title,sentAt:now-10000,deliveryAt:now-1,feeds:0}},pantry:{tomato:1}});
      who=2;renderPostOffice();
      check(document.querySelector('.letter-card').dataset.letter===hostile&&!document.querySelector('.letter-card [onmouseover]'), '편지 ID가 HTML 속성 경계를 벗어나지 않음');
      openPigeonLetter=id=>calls.push(['open',id]);document.querySelector('.envelope-open').click();
      LV.mailbox[hostile].deliveryAt=now+86400000;feedPigeon=id=>calls.push(['feed',id]);renderPostOffice();document.querySelector('.pigeon-feed button').click();
      check(calls.some(([kind,id])=>kind==='open'&&id===hostile)&&calls.some(([kind,id])=>kind==='feed'&&id===hostile), '편지 열기·먹이가 원래 ID를 안전하게 전달');

      qaList=[];LV.qaRounds={[hostile]:{question:title,a1:'답1',a2:'답2',consent1:false,consent2:false,revealed:false,ts:now}};
      toggleQAConsent=(id,slot)=>calls.push(['consent',id,slot]);skipCoupleQA=id=>calls.push(['skip',id]);renderQA();
      document.querySelector('.consent-action').click();document.querySelector('.qa-skip').click();
      check(calls.some(([kind,id,slot])=>kind==='consent'&&id===hostile&&slot===2)&&calls.some(([kind,id])=>kind==='skip'&&id===hostile), '새 Q&A 동의·건너뛰기가 원래 ID를 안전하게 전달');
      check(!document.querySelector('#qaActive img, #qaActive [onmouseover]')&&window.__renderXss===0, '새 Q&A 질문·ID가 실행 코드로 해석되지 않음');
    } finally {
      DB.del = previous.del;
      events = previous.events;
      annis = previous.annis;
      qaList = previous.qaList;
      selDate = previous.selDate;
      LV=previous.LV;who=previous.who;openPigeonLetter=previous.openPigeonLetter;feedPigeon=previous.feedPigeon;toggleQAConsent=previous.toggleQAConsent;skipCoupleQA=previous.skipCoupleQA;
      delete window.__renderXss;
      renderAll();
    }
    return checks;
  });
}

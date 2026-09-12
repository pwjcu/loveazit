async (page) => {
  return page.evaluate(async () => {
    if (db !== null) throw new Error('Local preview required');
    const checks = [];
    const check = (ok, label) => {
      if (!ok) throw new Error(label);
      checks.push(label);
    };
    const keys = [...BACKUP_MAIN_KEYS, 'azit-fortune-v1'];
    const stored = Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]));
    const globals = { S: { ...S }, AV: { ...AV }, LV: JSON.parse(JSON.stringify(LV)), events, annis, photos, notes, wishes, qaList, db };
    const nativeSetItem = Storage.prototype.setItem;
    try {
      for (const text of ['not json', '{"__proto__":{"polluted":true}}', '{"living":{"bad/key":1}}', '{"S":{"start":123}}', '{"living":{"pets":[{"care":"bad"}]}}', '{"events":[{"date":123,"title":"bad"}]}']) {
        let rejected = false;
        try { prepareBackup(text); } catch { rejected = true; }
        check(rejected, '잘못되거나 위험한 백업을 쓰기 전에 거부');
      }

      localStorage.setItem('settings', JSON.stringify({ start: '', n1: '기존', n2: '상대', h1: '#111111', h2: '#222222' }));
      localStorage.setItem('avatars', JSON.stringify({ p1: 10 }));
      localStorage.setItem('living', JSON.stringify(livingPayload({ ...defaultLiving(), hearts: 5 })));
      for (const branch of BACKUP_RECORD_BRANCHES) localStorage.setItem(branch, '[]');
      localStorage.setItem('events', JSON.stringify([{ id: 'same', title: '현재 일정', date: '2026-09-12', ts: 1 }]));
      const backup = prepareBackup(JSON.stringify({
        S: { start: '', n1: '백업 이름', n2: '백업 상대', h1: '#333333', h2: '#444444' },
        AV: { p1: 35 }, living: { hearts: 77,together:{total:1,days:{'2026-09-12':{completed:true,'1':{mood:'sun',answer:'함께'}}}} },
        notes:[{id:'archived-chalk',who:1,text:'보관할 마음',ts:1,boardVersion:2,boardArchivedAt:2}],
        events: [
          { id: 'same', title: '덮으면 안 됨', date: '2026-09-12', ts: 2 },
          { id: 'new-event', title: '백업 일정', date: '2026-09-13', ts: 12345 }
        ]
      }));
      let base = { values: Object.fromEntries(BACKUP_MAIN_KEYS.map(key => [key, localStorage.getItem(key)])) };
      await restoreBackupMain(backup, base);
      let restored = JSON.parse(localStorage.getItem('events'));
      check(JSON.parse(localStorage.getItem('settings')).n1 === '백업 이름' && JSON.parse(localStorage.getItem('living')).hearts === 77, '설정과 생활공간은 백업으로 교체');
      check(JSON.parse(localStorage.getItem('living')).together.total===1&&JSON.parse(localStorage.getItem('notes'))[0].boardArchivedAt===2,'참여 도장·일일 기록과 칠판 보관 상태를 백업에서 복원');
      check(restored.length === 2 && restored.find(row => row.id === 'same').title === '현재 일정', '기존 ID 항목을 우선하고 없는 기록만 추가');
      check(restored.find(row => row.id === 'new-event').ts === 12345, '백업 ID와 작성 시각을 보존');
      base = { values: Object.fromEntries(BACKUP_MAIN_KEYS.map(key => [key, localStorage.getItem(key)])) };
      await restoreBackupMain(backup, base);
      restored = JSON.parse(localStorage.getItem('events'));
      check(restored.length === 2, '같은 백업을 다시 복원해도 기록이 중복되지 않음');

      const beforeFailure = Object.fromEntries(BACKUP_MAIN_KEYS.map(key => [key, localStorage.getItem(key)]));
      let failOnce = true;
      Storage.prototype.setItem = function (key, value) {
        if (key === 'avatars' && failOnce) { failOnce = false; throw new Error('simulated quota'); }
        return nativeSetItem.call(this, key, value);
      };
      let rolledBack = false;
      try { await restoreBackupMain(prepareBackup(JSON.stringify({ S: { n1: '실패' }, AV: { p1: 99 } })), { values: beforeFailure }); }
      catch { rolledBack = BACKUP_MAIN_KEYS.every(key => localStorage.getItem(key) === beforeFailure[key]); }
      finally { Storage.prototype.setItem = nativeSetItem; }
      check(rolledBack, '로컬 저장 중 실패하면 모든 일반 데이터를 원상 복구');

      let remote = {
        settings: { start: '', n1: '원격', n2: '상대', h1: '#111111', h2: '#222222' }, avatars: {}, living: livingPayload({ ...defaultLiving(), hearts: 10 }),
        events: { same: { title: '원격 우선', date: '2026-09-12', ts: 1 } }, fortuneRooms: { secret: { cipher: 'keep' } }, fortuneContent: { v1: { keep: true } }
      };
      db = { ref: () => ({ transaction: async edit => { const next = edit(remote); if (next === undefined) return { committed: false }; remote = next; return { committed: true, snapshot: { val: () => remote } }; } }) };
      const remoteBase = JSON.parse(JSON.stringify(remote));
      await restoreBackupMain(backup, { root: remoteBase });
      check(remote.fortuneRooms.secret.cipher === 'keep' && remote.fortuneContent.v1.keep === true, '원격 복원에서 운세 방과 편집 콘텐츠를 건드리지 않음');
      check(remote.events.same.title === '원격 우선' && remote.events['new-event'].ts === 12345, '원격 루트 거래에서도 기존 기록 우선·백업 시각 보존');
      const conflictBase = JSON.parse(JSON.stringify(remote));
      remote.settings.n1 = '상대가 방금 변경';
      let conflict = false;
      try { await restoreBackupMain(backup, { root: conflictBase }); } catch { conflict = true; }
      check(conflict && remote.settings.n1 === '상대가 방금 변경' && JSON.stringify(remote).includes('fortuneRooms'), '확인 중 상대의 설정 변경이 있으면 원격 복원을 중단');
    } finally {
      Storage.prototype.setItem = nativeSetItem;
      db = null;
      for (const key of keys) stored[key] === null ? localStorage.removeItem(key) : localStorage.setItem(key, stored[key]);
      S = globals.S; AV = globals.AV; LV = mergeLiving(globals.LV);
      events = globals.events; annis = globals.annis; photos = globals.photos; notes = globals.notes; wishes = globals.wishes; qaList = globals.qaList;
      renderAll(); applySet(); applyAv();
    }
    return checks;
  });
}

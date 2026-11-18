const Personal = (() => {
  const cities = {
    '서울':[37.57,126.98], '인천':[37.46,126.71], '수원':[37.26,127.03], '대전':[36.35,127.38],
    '대구':[35.87,128.60], '부산':[35.18,129.08], '울산':[35.54,129.31], '광주':[35.16,126.85],
    '춘천':[37.88,127.73], '강릉':[37.75,128.90], '전주':[35.82,127.15], '제주':[33.50,126.53]
  };
  const prizes = [
    {icon:'🥠', title:'포춘쿠키', note:'오늘은 상대의 사소한 습관 하나를 기억해 주세요. 작은 관찰이 큰 다정함이 돼요.'},
    {icon:'🧺', title:'데이트 미션', note:'각자 디저트 하나를 골라 서로 바꿔 먹고, 제일 맛있었던 순간을 사진으로 남겨봐요.'},
    {icon:'💌', title:'소원권 · 왼쪽 프로필', note:'다음 데이트에서 하고 싶은 것 하나를 정할 수 있어요. 둘이 함께 수락하면 사용 완료!'},
    {icon:'🎟️', title:'소원권 · 오른쪽 프로필', note:'다음 데이트에서 하고 싶은 것 하나를 정할 수 있어요. 둘이 함께 수락하면 사용 완료!'},
    {icon:'📸', title:'추억 다시 보기', note:'아지트의 빔프로젝터를 켜고 사진 한 장에 얽힌 이야기를 서로 들려줘요.'},
    {icon:'🔮', title:'오늘의 타로', note:'운세 탭에서 둘이 카드를 한 장씩 고르고 이야기를 나눠봐요.'},
    {icon:'🌓', title:'궁합 같이 보기', note:'운세 탭에서 궁합을 함께 보고, 닮은 점 하나와 새로 알게 된 점 하나를 적어봐요.'},
    {icon:'🌿', title:'텃밭 소풍', note:'텃밭에 들렀다가 다음에 같이 먹고 싶은 음식을 하나씩 골라봐요.'}
  ];
  const maxImageLength = 450000;
  let forecast = 0, drawBusy = false, drawRef = null, drawMonth = '';
  const getLocal = (key, fallback) => {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  };
  const setLocal = (key, value) => localStorage.setItem(key, value);
  const offsetDate = (date, days = 0) => {
    const d = new Date(date + 'T00:00:00Z');
    if (Number.isNaN(+d)) return '';
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  };
  const nextAnniversary = (date, today) => {
    if (!/^\d{4}-\d\d-\d\d$/.test(date || '')) return '';
    const year = Number(today.slice(0,4)), suffix = date.slice(4);
    const inYear = y => y + (suffix === '-02-29' && new Date(Date.UTC(y, 1, 29)).getUTCMonth() !== 1 ? '-02-28' : suffix);
    return inYear(year) < today ? inYear(year + 1) : inYear(year);
  };
  const imageURL = url => typeof url === 'string' && url.length <= maxImageLength && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(url) ? url : '';
  const mapURL = place => 'https://map.kakao.com/link/search/' + encodeURIComponent(place);
  const dateLabel = date => date.slice(5).replace('-', '.');
  const compactDate = date => date.replace(/-/g, '');
  const leadDays = value => [0, 1, 3, 7].find(n => n === value);

  function day(ann, evs) {
    const row = (record, type) => {
      const {id, title, emoji, place, link, photo} = record;
      const href = safeWishLink(link), img = imageURL(photo), reminder = leadDays(record.remindDays);
      return `<article class="personal-day-item">
        <div class="personal-day-head"><span>${esc(emoji || (type === 'annis' ? '🎉' : '📅'))} ${esc(title)}${type === 'annis' ? ' <small>매년</small>' : ''}</span><button type="button" class="xb" data-personal-kind="${type}" data-personal-delete="${esc(id)}" aria-label="${esc(title)} 삭제">×</button></div>
        ${img ? `<img class="personal-event-photo" loading="lazy" src="${img}" alt="${esc(title)} 사진">` : ''}
        <div class="personal-event-links">
          ${place ? `<a href="${esc(mapURL(place))}" target="_blank" rel="noopener noreferrer">📍 ${esc(place)}</a>` : ''}
          ${href ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">🔗 링크 열기</a>` : ''}
          ${reminder !== undefined ? `<span>🔔 ${reminder ? reminder + '일 전' : '당일'}</span>` : ''}
          <button type="button" data-personal-kind="${type}" data-personal-export="${esc(id)}">내 캘린더에 추가</button>
        </div>
      </article>`;
    };
    return [...ann.map(a => row(a, 'annis')), ...evs.map(e => row(e, 'events'))].join('') || '<div class="mut">일정이 없어요</div>';
  }

  async function saveEvent() {
    const titleInput = $('evtitle'), button = $('evsave'), feedback = $('evfeedback');
    if (button.disabled) return;
    const title = titleInput.value.trim();
    if (!title) { titleInput.focus(); return; }
    const dayKey = selDate;
    const place = $('evplace').value.trim(), rawLink = $('evlink').value.trim();
    const link = safeWishLink(rawLink), file = $('evphoto').files[0];
    const remind = $('evremind').value;
    if (rawLink && !link) { feedback.textContent = 'https://로 시작하는 주소를 넣어주세요.'; $('evlink').focus(); return; }
    const fields = {date:dayKey,title,emoji:$('evemoji').value || '💕'};
    if (place) fields.place = place;
    if (link) fields.link = link;
    if (remind !== '' && leadDays(Number(remind)) !== undefined) fields.remindDays = Number(remind);
    const type = $('evyearly').checked ? 'annis' : 'events';
    button.disabled = true; feedback.textContent = '저장 중…';
    try {
      if (file) {
        if (!/^image\/(jpeg|png|webp|gif|avif)$/i.test(file.type) || file.size > 20000000) throw new Error('photo');
        const data = await compress(file, 760, .68);
        if (!imageURL(data)) throw new Error('photo');
        fields.photo = data;
      }
      await DB.add(type, fields);
      ['evtitle','evplace','evlink','evphoto','evremind'].forEach(id => { $(id).value = ''; });
      $('evyearly').checked = false;
      feedback.textContent = '저장했어요.';
      renderCal(); renderHome();
    } catch (error) {
      feedback.textContent = error?.message === 'photo' ? '사진을 열 수 없어요. 20MB 이하의 JPG, PNG, WebP 사진으로 다시 넣어주세요.' : '저장하지 못했어요. 연결을 확인하고 다시 시도해주세요.';
    } finally { button.disabled = false; }
  }

  function sync() {
    const today = todayStr();
    const list = [...events.map(e => ({...e, when:e.date})), ...annis.map(a => ({...a, when:nextAnniversary(a.date, today)}))]
      .filter(x => x.when && x.when >= today).sort((a,b) => a.when.localeCompare(b.when));
    const reminders = list.filter(x => leadDays(x.remindDays) !== undefined && offsetDate(x.when, -x.remindDays) <= today);
    if ($('personalReminderItems')) $('personalReminderItems').innerHTML = reminders.length ? reminders.map(item =>
      `<button type="button" class="personal-list-link" data-personal-date="${esc(item.when)}"><strong>${esc(item.emoji || '🔔')} ${esc(item.title)}</strong><span>${item.when === today ? '오늘' : esc(dateLabel(item.when))}</span></button>`
    ).join('') : '<p class="mut">지금 표시할 알림이 없어요.</p>';
    if ($('personalPlaceItems')) {
      const places = list.filter(item => typeof item.place === 'string' && item.place.trim());
      $('personalPlaceItems').innerHTML = places.length ? places.map(item =>
        `<a class="personal-list-link" href="${esc(mapURL(item.place))}" target="_blank" rel="noopener noreferrer"><strong>${esc(item.place)}</strong><span>${esc(dateLabel(item.when))} · ${esc(item.title)} ↗</span></a>`
      ).join('') : '<p class="mut">일정에 장소를 넣으면 여기에서 모아 볼 수 있어요.</p>';
    }
  }

  const icsText = value => String(value ?? '').replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/([;,])/g, '\\$1');
  function fold(line) {
    const enc = new TextEncoder();
    let size = 0, result = '';
    for (const char of line) {
      const len = enc.encode(char).length;
      if (size + len > 75) { result += '\r\n '; size = 1; }
      result += char; size += len;
    }
    return result;
  }
  function exportEvent(event, annual) {
    const day = annual ? nextAnniversary(event.date, todayStr()) : event.date;
    const next = offsetDate(day, 1), link = safeWishLink(event.link), lead = leadDays(event.remindDays);
    if (!next) return;
    const stamp = new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/, 'Z');
    const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//LoveAzit//Calendar//KO','BEGIN:VEVENT',
      'UID:' + icsText(event.id) + '@loveazit','DTSTAMP:' + stamp,'DTSTART;VALUE=DATE:' + compactDate(day),
      'DTEND;VALUE=DATE:' + compactDate(next),'SUMMARY:' + icsText(event.title)];
    if (annual) lines.push('RRULE:FREQ=YEARLY');
    if (event.place) lines.push('LOCATION:' + icsText(event.place));
    if (link) lines.push('URL:' + link);
    if (lead !== undefined) lines.push('BEGIN:VALARM',lead === 0 ? 'TRIGGER:PT0S' : 'TRIGGER:-P' + lead + 'D','ACTION:DISPLAY','DESCRIPTION:' + icsText(event.title),'END:VALARM');
    lines.push('END:VEVENT','END:VCALENDAR','');
    const url = URL.createObjectURL(new Blob([lines.map(fold).join('\r\n')], {type:'text/calendar;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = '우리 아지트 일정.ics';
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function weather(city) {
    if (!Object.hasOwn(cities, city)) city = '서울';
    try { setLocal('loveazitWeatherCity', city); } catch {}
    const key = ++forecast, hero = $('personalWeather').closest('.hero'), text = $('personalWeatherText');
    delete hero.dataset.weather;
    text.textContent = '☁️ ' + city + ' 날씨 확인 중';
    const [lat, lon] = cities[city];
    try {
      const url = new URL('https://api.open-meteo.com/v1/forecast');
      url.search = new URLSearchParams({latitude:lat,longitude:lon,current:'temperature_2m,is_day,weather_code',timezone:'Asia/Seoul'});
      const response = await fetch(url);
      if (!response.ok) throw new Error('weather');
      const {current} = await response.json();
      if (key !== forecast) return;
      const {weather_code:code, temperature_2m:temperature, is_day:isDay} = current || {};
      if (!Number.isFinite(code) || !Number.isFinite(temperature)) throw new Error('weather');
      const [scene, label] = code === 0 ? (isDay ? ['clear','☀️ 맑음'] : ['night','🌙 맑은 밤']) :
        (code >= 71 && code <= 77) || (code >= 85 && code <= 86) ? ['snow','❄️ 눈'] :
        code >= 95 ? ['rain','⛈️ 뇌우'] : code >= 51 ? ['rain','🌧️ 비'] :
        code >= 45 ? ['cloud','🌫️ 안개'] : ['cloud','☁️ 구름'];
      hero.dataset.weather = scene;
      text.textContent = label + ' · ' + Math.round(temperature) + '°';
    } catch { if (key === forecast) text.textContent = '☁️ 날씨를 불러오지 못했어요'; }
  }

  function showDraw(data, message = '') {
    const result = $('personalDrawResult'), button = $('personalDrawButton');
    const prize = data && Number.isInteger(data.prize) ? prizes[data.prize] : null;
    button.disabled = drawBusy || !!prize;
    button.textContent = prize ? '이번 달 뽑기 완료' : drawBusy ? '뽑는 중…' : '뽑기 열기';
    if (!prize) { result.textContent = message; return; }
    result.innerHTML = `<strong>${prize.icon} ${esc(prize.title)}</strong><p>${esc(prize.note)}</p>`;
  }

  function trackDraw() {
    const month = todayStr().slice(0,7);
    if (month === drawMonth) return;
    if (drawRef) drawRef.off('value');
    drawMonth = month;
    drawRef = db ? db.ref('personalDraws/' + month) : null;
    if (drawRef) drawRef.on('value', snap => showDraw(snap.val()), () => showDraw(null,'뽑기 기록을 불러오지 못했어요.'));
    else {
      try { showDraw(JSON.parse(getLocal('loveazitDraw:' + month,'null'))); } catch { showDraw(null); }
    }
  }

  async function draw() {
    if (drawBusy) return;
    trackDraw();
    const candidate = {prize:Math.floor(Math.random() * prizes.length), date:todayStr()};
    drawBusy = true; showDraw(null);
    try {
      let winner;
      if (drawRef) {
        const receipt = await drawRef.transaction(value => value === null ? candidate : undefined, undefined, false);
        winner = receipt.snapshot.val();
      } else {
        const key = 'loveazitDraw:' + drawMonth;
        winner = JSON.parse(getLocal(key,'null'));
        if (!winner) { setLocal(key, JSON.stringify(candidate)); winner = candidate; }
      }
      drawBusy = false;
      showDraw(winner);
    } catch { drawBusy = false; showDraw(null,'뽑지 못했어요. 연결을 확인하고 다시 눌러주세요.'); }
  }

  function init() {
    const picker = $('personalCity');
    Object.keys(cities).forEach(city => picker.add(new Option(city, city)));
    const preferred = getLocal('loveazitWeatherCity','서울');
    picker.value = Object.hasOwn(cities, preferred) ? preferred : '서울';
    picker.addEventListener('change', () => weather(picker.value));
    weather(picker.value);
    trackDraw(); sync();
    $('personalDrawButton').addEventListener('click', draw);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) { trackDraw(); sync(); }
    });
    $('personalReminderItems').addEventListener('click', e => {
      const btn = e.target.closest('[data-personal-date]');
      if (btn) openDay(btn.dataset.personalDate);
    });
    $('daylist').addEventListener('click', async e => {
      const button = e.target.closest('[data-personal-kind]');
      if (!button) return;
      const kind = button.dataset.personalKind, data = kind === 'annis' ? annis : events;
      const id = button.dataset.personalDelete || button.dataset.personalExport;
      const record = data.find(item => String(item.id) === id);
      if (!record) return;
      if (button.dataset.personalExport) { exportEvent(record, kind === 'annis'); return; }
      if (!confirm('이 일정을 삭제할까요?')) return;
      button.disabled = true;
      try { await DB.del(kind, id); renderCal(); renderHome(); }
      catch { button.disabled = false; $('evfeedback').textContent = '삭제하지 못했어요. 연결을 확인해주세요.'; }
    });
  }
  return {day,saveEvent,sync,init};
})();
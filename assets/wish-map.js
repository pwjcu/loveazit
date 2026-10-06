/* Place search is user-triggered only. Photon and OSM are best-effort public services.
 * https://photon.komoot.io/ · https://operations.osmfoundation.org/policies/tiles/
 * No background geocoding, prefetching, private notes, or device location requests. */
const WishMap=(()=>{
  const PAGE_SIZE=6,CACHE_KEY='azit-wish-places-v1',CACHE_AGE=30*86400000;
  const SEARCH_URL='https://photon.komoot.io/api/',TILE_URL='https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  let ready=false,map=null,layers=null,draftMarker=null,draft=null,picking=false,page=1,filter='all',selectedId=null;
  let searchController=null,searchVersion=0,lastSearchAt=0,results=[],mapSignature='',fitPending=true,mapError='';
  const el=id=>document.getElementById(id),text=value=>String(value??'');
  const sorted=()=>[...wishes].sort((a,b)=>(Number(b.ts)||0)-(Number(a.ts)||0)||text(a.id).localeCompare(text(b.id)));
  const point=location=>{
    if(!location||typeof location!=='object'||location.lat==null||location.lng==null||location.lat===''||location.lng==='')return null;
    const lat=Number(location.lat),lng=Number(location.lng);
    return Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=85.051129&&Math.abs(lng)<=180?{lat,lng}:null;
  };
  const visible=()=>sorted().filter(w=>filter==='all'||(filter==='mapped'?!!point(w.location):!point(w.location)));
  function init(){
    if(ready||!el('wishForm'))return;ready=true;
    const field=document.createElement('div');field.className='wish-location-field';
    field.innerHTML=`<label for="wishLocation">지도에 남길 위치 <small>선택</small></label><div class="wish-location-row"><input id="wishLocation" type="text" maxlength="180" placeholder="예: 서울숲, 강릉 안목해변" autocomplete="off" aria-describedby="wishLocationHint"><button id="wishFindLocation" type="button" class="btn ghost">위치 찾기</button></div><p id="wishLocationHint" class="wish-map-help">검색 결과를 선택하면 지도에 핀이 생겨요. 찾을 장소만 Photon 검색 서비스에 전달됩니다.</p><div id="wishLocationStatus" class="wish-map-help" role="status" aria-live="polite"></div><div id="wishLocationResults" class="wish-location-results"></div><div class="wish-location-actions"><button id="wishPickLocation" type="button" class="btn ghost sm">지도에서 직접 지정</button><button id="wishClearLocation" type="button" class="btn ghost sm" hidden>위치 지우기</button></div>`;
    el('wishTitle').insertAdjacentElement('afterend',field);
    const overview=document.createElement('section');overview.className='card wish-map-card';overview.setAttribute('aria-labelledby','wishMapTitle');
    overview.innerHTML=`<div class="wish-map-heading"><div><small>OUR SOMEDAY MAP</small><h2 id="wishMapTitle">함께 가고 싶은 세상</h2></div><span class="wish-map-stamp" aria-hidden="true">♡</span></div><p id="wishMapSummary" class="wish-map-help"></p><div id="wishMapCanvas" class="wish-map-canvas" role="region" aria-label="우리의 가고 싶은 곳 지도. 방향키로 이동하고 더하기와 빼기로 확대·축소할 수 있어요."></div><p id="wishMapNotice" class="wish-map-help" role="status"></p><div class="wish-map-tools"><button id="wishFitMap" type="button" class="btn ghost sm">저장한 곳 한눈에</button><button id="wishGoToForm" type="button" class="btn ghost sm">아이디어 남기기</button><button id="wishUseMapCenter" type="button" class="btn sm" hidden>지도 중심에 핀 놓기</button><button id="wishCancelMapPick" type="button" class="btn ghost sm" hidden>위치 지정 취소</button></div><p class="wish-map-credit">장소 검색 <a href="https://photon.komoot.io/" target="_blank" rel="noopener noreferrer">Photon</a> · 지도 <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>. 방문 전 실제 위치를 확인해 주세요.</p>`;
    el('wishesPanel').prepend(overview);
    const listCard=el('wishList').closest('.card');overview.insertAdjacentElement('afterend',listCard);listCard.classList.add('wish-shelf');
    el('wishList').insertAdjacentHTML('beforebegin','<div class="wish-map-filters" role="group" aria-label="가고 싶은 곳 분류"><button type="button" class="btn ghost sm" data-wish-filter="all" aria-pressed="true">전체</button><button type="button" class="btn ghost sm" data-wish-filter="mapped" aria-pressed="false">지도에 있는 곳</button><button type="button" class="btn ghost sm" data-wish-filter="unmapped" aria-pressed="false">위치 미정</button></div>');
    el('wishList').insertAdjacentHTML('afterend','<div class="wish-map-pages" id="wishMapPages" hidden><button type="button" class="btn ghost sm" id="wishMapPrev">이전</button><span id="wishMapPageLabel" aria-live="polite"></span><button type="button" class="btn ghost sm" id="wishMapNext">다음</button></div>');
    el('wishLocation').addEventListener('input',()=>{cancelSearch();draft=null;setPicking(false);renderDraft();status('위치를 검색하거나 지도에서 직접 지정해 주세요.');});
    el('wishLocation').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();search();}});
    el('wishFindLocation').addEventListener('click',search);
    el('wishLocationResults').addEventListener('click',e=>{const button=e.target.closest('[data-wish-result]');if(button)chooseResult(Number(button.dataset.wishResult));});
    el('wishPickLocation').addEventListener('click',()=>{if(wishBusy)return;onOpen();if(!map)return;setPicking(!picking);if(picking){el('wishMapCanvas').scrollIntoView({block:'center',behavior:'auto'});el('wishMapCanvas').focus();}});
    el('wishUseMapCenter').addEventListener('click',()=>{if(map&&picking)choosePoint(map.getCenter());});
    el('wishCancelMapPick').addEventListener('click',()=>setPicking(false));
    el('wishClearLocation').addEventListener('click',()=>{if(wishBusy)return;cancelSearch();draft=null;el('wishLocation').value='';wishDraft=true;setPicking(false);renderDraft();status('위치를 지웠어요. 메모는 그대로 저장할 수 있어요.');});
    el('wishFitMap').addEventListener('click',()=>fitMap());
    el('wishGoToForm').addEventListener('click',()=>{el('wishTitle').focus();el('wishForm').scrollIntoView({block:'start',behavior:'auto'});});
    listCard.addEventListener('click',e=>{const button=e.target.closest('[data-wish-filter]');if(button){filter=button.dataset.wishFilter;page=1;render();}const locate=e.target.closest('[data-wish-locate]');if(locate)selectPlace(locate.dataset.wishLocate,true);});
    el('wishMapPrev').addEventListener('click',()=>changePage(-1));el('wishMapNext').addEventListener('click',()=>changePage(1));
    if(window.ResizeObserver)new ResizeObserver(()=>{if(map&&el('wishMapCanvas').clientWidth){map.invalidateSize({pan:false});if(fitPending)fitMap();}}).observe(el('wishMapCanvas'));
  }
  function status(message){el('wishLocationStatus').textContent=message;}
  function cancelSearch(){searchVersion++;if(searchController)searchController.abort();searchController=null;results=[];el('wishLocationResults').replaceChildren();el('wishFindLocation').disabled=!!wishBusy;el('wishFindLocation').textContent='위치 찾기';}
  function cacheRead(query){try{const data=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}'),entry=data['q:'+query];return entry&&Date.now()-entry.ts<CACHE_AGE&&Array.isArray(entry.results)?entry.results.slice(0,5).filter(x=>point(x)&&typeof x.label==='string').map(x=>({...point(x),label:x.label.slice(0,500),source:'photon'})):null;}catch{return null;}}
  function cacheWrite(query,value){try{const data=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');data['q:'+query]={ts:Date.now(),results:value};const entries=Object.entries(data).filter(([,v])=>v&&Date.now()-v.ts<CACHE_AGE).sort((a,b)=>b[1].ts-a[1].ts).slice(0,50);localStorage.setItem(CACHE_KEY,JSON.stringify(Object.fromEntries(entries)));}catch{/* Search still works when storage is full. */}}
  function normaliseFeature(feature){
    const coords=feature?.geometry?.coordinates,p=feature?.properties;if(!Array.isArray(coords)||!p)return null;
    const loc=point({lat:coords[1],lng:coords[0]});if(!loc)return null;
    const label=[...new Set([p.name,p.street,p.housenumber,p.district,p.city,p.state,p.country].filter(v=>typeof v==='string'&&v.trim()))].join(' · ').slice(0,500);
    return label?{...loc,label,source:'photon'}:null;
  }
  async function search(){
    if(wishBusy)return;const query=el('wishLocation').value.trim().slice(0,180);if(query.length<2){status('찾을 장소나 주소를 두 글자 이상 적어주세요.');el('wishLocation').focus();return;}
    cancelSearch();const version=searchVersion,cached=cacheRead(query);
    if(cached){showResults(cached,query);return;}
    if(Date.now()-lastSearchAt<2000){status('검색 요청이 이어지고 있어요. 잠시 후 다시 눌러주세요.');return;}
    lastSearchAt=Date.now();searchController=new AbortController();const controller=searchController,timer=setTimeout(()=>controller.abort(),12000);
    el('wishFindLocation').disabled=true;el('wishFindLocation').textContent='찾는 중…';status('장소를 찾고 있어요.');
    try{
      const url=new URL(SEARCH_URL);url.search=new URLSearchParams({q:query,limit:'5',lat:'36.5',lon:'127.8',location_bias_scale:'0.2'});
      const response=await fetch(url,{signal:controller.signal,referrerPolicy:'strict-origin-when-cross-origin'});if(!response.ok)throw Error('search unavailable');
      const data=await response.json();if(version!==searchVersion||query!==el('wishLocation').value.trim())return;
      const found=(Array.isArray(data.features)?data.features:[]).slice(0,5).map(normaliseFeature).filter(Boolean);cacheWrite(query,found);showResults(found,query);
    }catch{if(version===searchVersion)status('지금은 장소를 찾지 못했어요. 지역명을 더해 다시 찾거나 지도에서 직접 지정해 주세요. 위치 없이 메모를 저장해도 괜찮아요.');}
    finally{clearTimeout(timer);if(version===searchVersion){searchController=null;el('wishFindLocation').disabled=!!wishBusy;el('wishFindLocation').textContent='위치 찾기';}}
  }
  function showResults(found,query){
    results=found.map(x=>({...x,query}));el('wishLocationResults').innerHTML=results.map((x,i)=>`<button type="button" data-wish-result="${i}"><strong>${esc(x.label)}</strong><span>이 위치 선택 · ${x.lat.toFixed(3)}, ${x.lng.toFixed(3)}</span></button>`).join('');
    status(results.length?'같은 이름의 장소가 있을 수 있어요. 주소를 확인하고 하나를 선택해 주세요.':'검색 결과가 없어요. 시·구 또는 주소를 더하거나 지도에서 직접 지정해 주세요.');
  }
  function chooseResult(index){
    if(wishBusy||!results[index])return;draft={...results[index]};el('wishLocation').value=draft.query;wishDraft=true;cancelSearch();setPicking(false);onOpen();renderDraft();if(map)map.setView([draft.lat,draft.lng],14,{animate:false});status('선택한 위치: '+draft.label+' · 저장하면 함께 보게 돼요.');
  }
  function choosePoint(latlng){
    if(wishBusy||!point(latlng))return;cancelSearch();const label=el('wishLocation').value.trim()||'지도에서 지정한 위치';draft={lat:Number(latlng.lat.toFixed(6)),lng:Number(latlng.lng.toFixed(6)),label,query:el('wishLocation').value.trim(),source:'manual'};wishDraft=true;setPicking(false);renderDraft();status('지도에 위치를 지정했어요. 메모와 함께 저장해 주세요.');el('wishLocation').focus();
  }
  function setPicking(value){picking=value;el('wishUseMapCenter').hidden=!value;el('wishCancelMapPick').hidden=!value;el('wishPickLocation').setAttribute('aria-pressed',String(value));el('wishMapCanvas').classList.toggle('is-picking',value);if(map)map.closePopup();if(value)el('wishMapNotice').textContent='지도를 눌러 위치를 지정하거나, 방향키로 이동한 뒤 ‘지도 중심에 핀 놓기’를 눌러주세요.';else el('wishMapNotice').textContent=mapError;}
  function onOpen(){
    init();if(!el('wishMapCanvas').clientWidth)return;
    if(!map){
      if(!window.L){mapError='지도를 불러오지 못했어요. 메모 저장과 수정은 계속할 수 있어요.';el('wishMapNotice').textContent=mapError;return;}
      map=L.map(el('wishMapCanvas'),{scrollWheelZoom:false,zoomControl:true,attributionControl:true,keyboard:true}).setView([36.2,127.8],6);
      map.zoomControl._zoomInButton.setAttribute('aria-label','지도 확대');map.zoomControl._zoomOutButton.setAttribute('aria-label','지도 축소');
      L.tileLayer(TILE_URL,{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',referrerPolicy:'strict-origin-when-cross-origin'}).on('tileerror',()=>{mapError='배경 지도를 불러오지 못했어요. 저장한 장소와 메모는 아래에서 확인할 수 있어요.';if(!picking)el('wishMapNotice').textContent=mapError;}).addTo(map);
      layers=L.layerGroup().addTo(map);map.on('click',e=>{if(picking)choosePoint(e.latlng);});fitPending=true;renderMarkers();
    }
    map.invalidateSize({pan:false});if(fitPending)fitMap();renderDraft();
  }
  function fitMap(){
    if(!map)return;map.invalidateSize({pan:false});const points=sorted().map(w=>point(w.location)).filter(Boolean);if(points.length)map.fitBounds(points.map(p=>[p.lat,p.lng]),{padding:[35,35],maxZoom:13,animate:false});else map.setView([36.2,127.8],6,{animate:false});fitPending=false;
  }
  function renderDraft(){
    el('wishClearLocation').hidden=!draft&&!el('wishLocation').value;
    if(draftMarker){draftMarker.remove();draftMarker=null;}if(!map||!point(draft))return;
    draftMarker=L.marker([draft.lat,draft.lng],{keyboard:false,interactive:false,zIndexOffset:1000,icon:L.divIcon({className:'wish-pin wish-pin-draft',html:'<span><b>♡</b></span>',iconSize:[34,42],iconAnchor:[17,40]})}).addTo(map);
  }
  function renderMarkers(){
    if(!map||!layers)return;const all=sorted(),signature=JSON.stringify(all.map(w=>[w.id,w.title,w.location]));if(signature===mapSignature)return;mapSignature=signature;layers.clearLayers();
    all.forEach((w,i)=>{const loc=point(w.location);if(!loc)return;const marker=L.marker([loc.lat,loc.lng],{title:text(w.title),alt:text(w.title),keyboard:true,icon:L.divIcon({className:'wish-pin',html:`<span><b>${i+1}</b></span>`,iconSize:[32,40],iconAnchor:[16,38]})}).addTo(layers);const popup=document.createElement('div');popup.className='wish-map-popup';const title=document.createElement('strong');title.textContent=w.title||'함께 가고 싶은 곳';const address=document.createElement('p');address.textContent=w.location.label||w.locationText||'지정한 위치';const button=document.createElement('button');button.className='btn ghost sm';button.textContent='메모 펼쳐 보기';button.addEventListener('click',()=>{selectPlace(w.id,false);map.closePopup();});popup.append(title,address,button);marker.bindPopup(popup);marker.on('click',()=>{if(picking)marker.closePopup();else selectedId=w.id;});});
    if(fitPending&&el('wishMapCanvas').clientWidth)fitMap();
  }
  function selectPlace(id,pan){
    const all=sorted(),index=all.findIndex(w=>w.id===id);if(index<0)return;selectedId=id;filter='all';page=Math.floor(index/PAGE_SIZE)+1;render();const record=all[index],loc=point(record.location);
    if(pan&&loc){onOpen();if(map)map.setView([loc.lat,loc.lng],14,{animate:false});el('wishMapCanvas').scrollIntoView({block:'center',behavior:'auto'});el('wishMapCanvas').focus();}
    else{const card=[...el('wishList').querySelectorAll('[data-wish-id]')].find(item=>item.dataset.wishId===id);if(card){card.querySelector('details').open=true;card.querySelector('summary').focus();card.scrollIntoView({block:'nearest',behavior:'auto'});}}
  }
  function render(){
    init();renderWishAuthor();const all=sorted(),mapped=all.filter(w=>point(w.location)),items=visible(),pages=Math.max(1,Math.ceil(items.length/PAGE_SIZE));page=Math.min(Math.max(1,page),pages);
    el('wishCount').textContent=all.length;el('wishMapSummary').textContent=`지도에 ${mapped.length}곳 · 위치 미정 ${all.length-mapped.length}개 · 핀을 누르면 메모를 볼 수 있어요.`;
    document.querySelectorAll('[data-wish-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.wishFilter===filter)));
    const expanded=new Set([...el('wishList').querySelectorAll('details[open]')].map(node=>node.closest('[data-wish-id]').dataset.wishId));
    el('wishList').innerHTML=items.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE).map(w=>{
      const link=safeWishLink(w.link),author=w.who===1?S.n1:w.who===2?S.n2:'우리',loc=point(w.location),number=all.findIndex(x=>x.id===w.id)+1;
      return `<article class="wish-item${selectedId===w.id?' wish-selected':''}" data-wish-id="${esc(w.id)}"><details${expanded.has(w.id)?' open':''}><summary><span class="wish-item-number${loc?'':' is-unmapped'}">${number}</span><span><h3>${esc(w.title||'함께 가고 싶은 곳')}</h3><span class="wish-item-location">${esc(w.locationText||w.location?.label||'위치 미정 · 마음에 모아둔 일')}</span></span></summary><small>${esc(author)}가 모아둔 아이디어${w.date?' · '+esc(w.date):''}</small>${w.note?`<p>${esc(w.note)}</p>`:'<p>메모를 더하고 싶다면 수정을 눌러주세요.</p>'}${loc?`<p class="wish-map-help">${esc(w.location?.label||'지도에서 지정한 위치')}</p>`:''}${link?`<a href="${esc(link)}" target="_blank" rel="noopener noreferrer">↗ ${esc(new URL(link).hostname)} 링크 열기</a>`:''}</details><div class="wish-actions">${loc?`<button type="button" class="btn ghost sm" data-wish-locate="${esc(w.id)}">지도</button>`:''}<button type="button" class="btn ghost sm" data-wish-action="edit">수정</button><button type="button" class="btn ghost sm" data-wish-action="delete">삭제</button></div></article>`;
    }).join('')||'<div class="wish-empty">'+(filter==='mapped'?'장소를 검색하거나 지도에서 위치를 지정해 주세요.':filter==='unmapped'?'모든 아이디어에 위치가 있어요.':'둘이 가고 싶은 곳과 해보고 싶은 일을 아래에 남겨보세요.')+'</div>';
    el('wishMapPages').hidden=pages<=1;el('wishMapPageLabel').textContent=`${page} / ${pages}`;el('wishMapPrev').disabled=page<=1;el('wishMapNext').disabled=page>=pages;
    renderMarkers();
  }
  function changePage(delta){page+=delta;render();el('wishList').scrollIntoView({block:'nearest',behavior:'auto'});}
  function reset(){if(!ready)return;cancelSearch();draft=null;setPicking(false);el('wishLocation').value='';renderDraft();status('');}
  function edit(w){init();cancelSearch();draft=point(w.location)?{...w.location}:null;el('wishLocation').value=text(w.locationText||draft?.query||draft?.label||'').slice(0,180);setPicking(false);renderDraft();status(draft?'선택한 위치: '+text(draft.label):'위치를 추가하면 지도에도 표시돼요.');}
  function formValue(){const locationText=el('wishLocation')?.value.trim().slice(0,180)||'';return{locationText,location:point(draft)?{lat:draft.lat,lng:draft.lng,label:text(draft.label).slice(0,500),query:locationText,source:draft.source==='photon'?'photon':'manual'}:null};}
  return{init,onOpen,render,reset,edit,formValue};
})();

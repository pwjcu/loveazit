/* Original tile-and-sprite art for the shared azit. All game actions remain in world.js. */
function tileRect(x,y,w,h,c,extra=''){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" ${extra}/>`;}
function tileGroup(x,y,scale,art){return `<g transform="translate(${x} ${y}) scale(${scale})" shape-rendering="crispEdges">${art}</g>`;}
function tileLabel(x,y,text,color='#fff1cc',size=10){return `<text x="${x}" y="${y}" text-anchor="middle" fill="${color}" font-family="Jua,sans-serif" font-size="${size}" shape-rendering="auto">${esc(text)}</text>`;}
function tileAction(label,action,art,attrs=''){return `<g ${attrs.includes('class=')?'':'class="clk"'} role="button" tabindex="0" aria-label="${esc(label)}" onclick="${action}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();${action}}" ${attrs}>${art}</g>`;}
function tileFlower(x,y,c='#edc894',s=1){return tileGroup(x,y,s,`<path d="M-1 5V-2M-1 3H-5V0H-2M1 5H5V2H1" fill="#547849"/><path d="M-2-7H2V-4H5V0H2V3H-2V0H-5V-4H-2Z" fill="${c}"/>${tileRect(-1,-3,2,2,'#f9e4a3')}`);}
function tileTree(x,y,s=1){
  const season=seasonOf(),pal={spring:['#a9687e','#dc9ca6','#f3bdb2'],summer:['#45684c','#618957','#8cae63'],fall:['#995f44','#c4844f','#e6af68'],winter:['#72929c','#c4d9d7','#eef0de']}[season];
  return tileGroup(x,y,s,`<path d="M-12 14H14V20H-12Z" fill="#304f4033"/><path d="M-4-16H5V16H-8V12H-4Z" fill="#775139"/>${tileRect(0,-12,3,24,'#b28253')}<path d="M-24-34H-20V-46H-10V-54H10V-50H19V-42H26V-24H21V-17H10V-13H-12V-17H-25V-24H-29V-34Z" fill="${pal[0]}"/><path d="M-22-36H-18V-46H-7V-51H9V-45H18V-39H22V-25H14V-21H-11V-24H-23Z" fill="${pal[1]}"/><path d="M-16-40H-11V-46H5V-42H14V-36H7V-32H-4V-35H-17Z" fill="${pal[2]}"/><path d="M-20-29H-14V-25H-20M7-23H13V-19H7M15-34H20V-30H15M-4-43H1V-40H-4" fill="${pal[2]}"/><path d="M-3-20H4V-17H-3M-17-36H-10V-33H-17" fill="${pal[0]}"/>`);
}
function tileCloud(x,y,s=1){return tileGroup(x,y,s,'<path d="M0 10H8V4H18V0H32V4H39V8H47V17H0Z" fill="#fff2d5"/><path d="M0 17H47V21H0Z" fill="#d8e5d7"/>');}
function tileLamp(x,y){return tileGroup(x,y,1,'<path d="M-2 3H2V44H6V48H-6V44H-2Z" fill="#594e4b"/><path d="M-8 0H8V5H11V19H8V23H-8V19H-11V5H-8Z" fill="#4c4b4a"/><path d="M-7 5H7V18H-7Z" fill="#edc47d"/><path d="M-5 6H-1V17H-5Z" fill="#fff0b2"/><path d="M-1 4H1V20H-1Z" fill="#9c7f57"/>');}

flowerHead=function(type){
  const f=FLOWERS[type]||FLOWERS.rose;
  if(type==='lavender')return Array.from({length:5},(_,i)=>tileRect(i%2?-2:-5,-i*4,7,4,i%2?f.c1:f.c2)).join('');
  if(type==='tulip')return `<path d="M-8-11H-4V-6H-1V-11H2V-6H5V-11H8V0H5V5H-5V0H-8Z" fill="${f.c1}"/><path d="M-5-8H-3V0H-5M0-3H3V3H0" fill="${f.c2}"/>`;
  if(type==='sunflower'||type==='daisy')return `<path d="M-3-14H3V-9H7V-11H11V-7H9V-3H14V3H9V7H11V11H7V9H3V14H-3V9H-7V11H-11V7H-9V3H-14V-3H-9V-7H-11V-11H-7V-9H-3Z" fill="${f.c1}"/><path d="M-4-6H4V-4H6V4H4V6H-4V4H-6V-4H-4Z" fill="${f.c2}"/>${tileRect(-3,-3,3,3,'#f9d792')}`;
  return `<path d="M-4-10H4V-7H8V-4H11V4H7V8H3V11H-4V7H-8V3H-11V-4H-7V-8H-4Z" fill="${f.c1}"/><path d="M-3-6H5V-3H8V2H4V6H-3V3H-6V-3H-3Z" fill="${f.c2}"/><path d="M-2-3H3V2H0V5H-3V0H-2Z" fill="${f.c1}"/>${tileRect(-1,-2,3,2,type==='rose'?'#efb5a5':'#f3d480')}`;
};
flowerG=function(type,x,y,k=1){return tileGroup(x,y,k,'<path d="M-1 0H2V20H-1M-1 12H-6V9H-9V5H-5V8H-1M2 16H6V13H9V9H5V12H2" fill="#6e8d4f"/>'+flowerHead(type));};
vaseG=function(x,y,k=1){return tileGroup(x,y,k,'<path d="M-6 0H6V4H8V12H5V15H-5V12H-8V4H-6Z" fill="#779a9d"/><path d="M-5 2H-2V10H-5Z" fill="#c3d7c5"/><path d="M-5 12H6V14H-5Z" fill="#547e87"/>');};
potSvg=function(type,size=44){return `<svg viewBox="0 0 60 60" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">${tileGroup(30,37,1,'<path d="M-12 0H12V6H10V17H7V20H-7V17H-10V6H-12Z" fill="#af774f"/><path d="M-12 0H12V4H-12M-7 7H-4V16H-7" fill="#e2ab6e"/>')}${cropG({type,stage:4},30,26)}</svg>`;};
indoorPotG=function(p,x,y,k){
  const ready=p.stage>=4,action=ready?'harvestIndoor(this.dataset.indoorId)':'careIndoor(this.dataset.indoorId)',name=(FRUITS[p.type]||FRUITS.tomato).n+(ready?' 수확하기':' 화분 케어하기');
  return tileAction(name,action,tileGroup(x,y,k,'<path d="M-12-1H12V5H10V17H7V20H-7V17H-10V5H-12Z" fill="#af774f"/><path d="M-12-1H12V3H-12M-7 5H-4V15H-7" fill="#e2ab6e"/><path d="M-6 18H7V20H-6Z" fill="#7e5841"/>'+cropG({...p,stage:Math.max(1,p.stage||0)},0,-14)+(dueCare(p.care)&&!ready?pinG(15,-29,'💧'):'')),`data-indoor-id="${esc(p.id)}"`);
};

/* Breed features are drawn in the same 24-by-16 sprite grid. */
petG=function(p,x,y,k,cls='',clk=''){
  const breed=(p.type==='dog'?DOG_BREEDS:CAT_BREEDS)[p.breed]||(p.type==='dog'?DOG_BREEDS.golden:CAT_BREEDS.cheese),a=breed.A,b=breed.B,dark='#494147';
  let art='';
  if(p.breed==='husky'&&p.type==='dog')art=pxg(HUSKY_MAP,{A:a,B:b,E:'#416c8e',N:dark,M:'#e690a2'});
  else if(p.type==='cat'){
    art=`<path d="M3 0H5V2H7V3H11V1H14V9H12V12H21V9H23V5H24V12H22V14H19V16H16V14H7V16H4V13H2V5H3Z" fill="${a}"/><path d="M4 1H5V4H4M12 2H13V4H12" fill="#d99798"/><path d="M3 7H12V10H10V12H5V10H3M6 13H17V14H6" fill="${b}"/><path d="M4 5H6V6H4M10 5H12V6H10" fill="${dark}"/><path d="M7 7H9V8H7" fill="#b47c84"/><path d="M5 15H7V16H5M17 15H19V16H17" fill="${b}"/>`;
    if(p.breed==='cheese'||p.breed==='calico')art+='<path d="M7 3H9V5H7M14 10H16V12H14M18 11H20V13H18" fill="'+(p.breed==='calico'?'#6e584d':'#c58049')+'"/>';
    if(p.breed==='siam')art+=`<path d="M3 4H6V7H3M10 4H13V7H10" fill="${b}"/><path d="M4 5H5V6H4M11 5H12V6H11" fill="#62919e"/>`;
  }else{
    const floppy=['golden','maltese','poodle','dachshund','beagle'].includes(p.breed),short=p.breed==='corgi'||p.breed==='dachshund',long=p.breed==='dachshund',bodyStart=long?8:10;
    art=`<path d="M3 3H12V5H14V9H20V7H23V12H21V${short?14:13}H20V16H17V${short?14:13}H9V16H6V13H4V10H2V5H3Z" fill="${a}"/><path d="M${bodyStart} 10H19V13H${bodyStart}Z" fill="${b}"/>`;
    art+=floppy?`<path d="M1 3H4V10H2V9H1M11 3H14V10H12V9H11" fill="${p.breed==='beagle'?'#685042':a}"/>`:`<path d="M2 0H4V2H6V4H2M10 3V1H12V0H14V5H11Z" fill="${a}"/><path d="M3 1H4V3H3M12 1H13V4H12" fill="#d89b91"/>`;
    art+=`<path d="M4 6H12V9H10V11H6V9H4" fill="${b}"/><path d="M4 4H6V5H4M10 4H12V5H10M7 6H9V7H7" fill="${dark}"/><path d="M7 8H9V9H7" fill="#cb9196"/><path d="M6 15H9V16H6M17 15H20V16H17" fill="${b}"/><path d="M15 8H19V9H15" fill="#ffffff" opacity=".3"/>`;
    if(p.breed==='poodle')art+=`<path d="M2 2H5V0H10V2H14V5H11V3H5V5H2M18 7H22V10H18M4 12H9V15H4" fill="${b}"/>`;
    if(p.breed==='maltese')art+=`<path d="M2 8H4V12H6V10H10V12H12V8H14V11H11V13H4V11H2" fill="${b}"/>`;
    if(p.breed==='chihuahua')art+=`<path d="M0 0H4V4H0M11 0H15V4H11" fill="${a}"/><path d="M1 1H3V3H1M12 1H14V3H12" fill="#e5b7a2"/>`;
    if(p.breed==='beagle')art+='<path d="M14 8H20V11H14" fill="#705345"/>';
  }
  const scale=k*(p.breed==='husky'?1:.75);
  return `<g ${clk} transform="translate(${x},${y}) scale(${scale})"><g class="${cls}" shape-rendering="crispEdges">${art}</g></g>`;
};
petSvg=function(type,breed,size=44){return `<svg viewBox="0 0 24 16" width="${size}" height="${Math.round(size*2/3)}" shape-rendering="crispEdges" aria-hidden="true">${petG({type,breed},0,0,breed==='husky'?1:4/3)}</svg>`;};

/* More screen area, no paper border. The dialog can switch to the complete original. */
let cinemaOriginalFit=false;
cinemaMemoryArt=function(){
  const p=cinemaMemory;
  return `<svg viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="cinema-memory cinema-memory-${cinemaStyle}" preserveAspectRatio="xMidYMid slice"><rect width="180" height="100" fill="#282939"/><image data-cinema-photo class="film-fullbleed-photo" href="${esc(p.src)}" x="0" y="0" width="180" height="100" preserveAspectRatio="xMidYMid slice" onerror="cinemaPhotoFailed(this)"/><rect class="film-memory-reveal" width="180" height="100" fill="#fff0d3"/></svg>`;
};
cinemaG=function(){
  return tileAction('아지트 시네마 크게 보기','openCinema()',`${tileRect(141,41,313,179,'#7c6651')}${tileRect(145,37,305,175,'#423e46')}${tileRect(149,41,297,167,'#ead6a9')}<svg x="153" y="45" width="289" height="159" viewBox="0 0 180 100" preserveAspectRatio="xMidYMid slice" class="${cinemaIsStill()?'cinema-paused':''}" data-cinema-frame>${cinemaFrameArt()}</svg>${tileRect(140,33,315,8,'#574b46')}${tileRect(143,33,309,2,'#b39c79')}${tileRect(143,209,309,5,'#443f42')}${tileRect(293,214,5,11,'#ac9574')}${tileRect(288,225,15,3,'#594c42')}`, 'data-world-focus="cinema-open"')+tileGroup(280,9,1,`${tileRect(0,0,28,14,'#faf0d0')}${tileRect(0,14,28,3,'#a79479')}${tileRect(18,8,7,7,'#486377')}${tileRect(19,9,4,4,'#b9e3e4')}${tileRect(10,-9,6,9,'#7e6a54')}<path d="M22 17-126 36H162Z" fill="#f1eccb" opacity=".08"/>`);
};
const tileRefreshCinema=refreshCinema;
refreshCinema=function(replaceFrame=true){tileRefreshCinema(replaceFrame);const frame=document.querySelector('#azitDialog [data-cinema-photo]');if(frame){frame.classList.toggle('cinema-original-photo',cinemaOriginalFit);frame.setAttribute('preserveAspectRatio',cinemaOriginalFit?'xMidYMid meet':'xMidYMid slice');}const fit=$('cinemaFit');if(fit){fit.setAttribute('aria-pressed',String(cinemaOriginalFit));fit.textContent=cinemaOriginalFit?'화면 채우기':'사진 전체 보기';fit.hidden=cinemaState().mode!=='memories';}};
function toggleCinemaFit(){cinemaOriginalFit=!cinemaOriginalFit;refreshCinema();}
openCinema=function(){
  cinemaOriginalFit=false;
  openAzitDialog('우리의 작은 영화관',`<div class="cinema-theater"><svg viewBox="0 0 180 100" role="img" aria-label="현재 상영 장면" class="${cinemaIsStill()?'cinema-paused':''}" data-cinema-frame>${cinemaFrameArt()}</svg></div><button type="button" id="cinemaFit" class="cinema-fit" aria-pressed="false" onclick="toggleCinemaFit()" ${cinemaState().mode==='memories'?'':'hidden'}>사진 전체 보기</button>${cinemaControls(true)}<p class="dialog-note">거실에서는 사진이 화면을 가득 채워요. 사진 전체 보기를 누르면 잘린 가장자리까지 볼 수 있어요.</p>`);
};

/* Crisp crop silhouettes make every seed and growth stage recognizable. */
cropG=function(p,cx,cy){
  const stage=Math.min(4,Math.max(0,Number(p.stage)||0)),type=FRUITS[p.type]?p.type:'tomato',color=FRUITS[type].c;
  if(!stage)return tileGroup(cx,cy,1,'<path d="M-9 7H-5V10H-9M1 10H5V13H1M8 5H11V8H8" fill="#e9c086"/><path d="M-8 7H-6V8H-8M2 10H4V11H2" fill="#fff0be"/>');
  let art='<path d="M-12 12H13V16H-12Z" fill="#3d392b33"/>';
  if(stage===1)art+='<path d="M-1 11V0H2V11Z" fill="#4f7648"/><path d="M-2 3H-8V0H-11V-4H-5V-1H-2M2 1H8V-2H11V-6H5V-3H2" fill="#92b767"/><path d="M-8-3H-5V0H-8M6-5H9V-2H6" fill="#c0d58a"/>';
  else{
    if(type==='grape')art+='<path d="M-15 13V-23H-12V13M13 13V-23H16V13M-17-22H18V-19H-17M-17-8H18V-5H-17" fill="#b59465"/><path d="M-14-22H15V-21H-14" fill="#e4be7c"/>';
    art+='<path d="M-2 12V-20H1V12M-10-5H8V-2H-10" fill="#4b703e"/><path d="M-13-4V-12H-5V-9H-1V-2H-8V-4M2-9V-17H11V-14H16V-7H8V-9M-6-18V-24H3V-21H7V-15H-1V-18" fill="#7f9e4d"/><path d="M-12-11H-6V-8H-12M4-16H11V-13H4M-4-23H2V-20H-4" fill="#b5c56d"/>';
    const fruit=(x,y)=>{
      let f=type==='strawberry'?`<path d="M-6-3H6V3H4V6H2V8H-2V6H-4V3H-6Z" fill="${color}"/><path d="M-6-5H-1V-3H1V-5H6V-2H2V0H-2V-2H-6" fill="#4e743f"/><path d="M-3 1H-2V3H-3M2 3H3V5H2M0 5H1V7H0" fill="#ffdf9b"/>`:type==='grape'?`<path d="M-6-3H5V0H8V5H5V8H3V11H-2V8H-5V5H-8V0H-6Z" fill="${color}"/><path d="M-4-2H-1V1H-4M2 0H5V3H2M-5 3H-2V6H-5M0 6H3V9H0" fill="#cba1dd"/>`:type==='cherry'?`<path d="M-1-8H2V-2H6V2H4V0H0V-3H-3V3H-5V-2H-2Z" fill="#456840"/><path d="M-9 2H-2V9H-9M2 0H9V7H2" fill="${color}"/><path d="M-8 3H-5V5H-8M3 1H6V3H3" fill="#ffb59c"/>`:`<path d="M-5-3H5V-1H7V6H4V8H-4V6H-7V-1H-5Z" fill="${color}"/><path d="M-4-5H-1V-7H1V-4H5V-2H1V0H-1V-2H-4Z" fill="#50713e"/><path d="M-4-1H0V1H-4V3H-6V0H-4Z" fill="#ffda99"/><path d="M2 6H5V4H6V6H4V8H2Z" fill="#614329" opacity=".23"/>`;
      return tileGroup(x,y,stage===3?.7:1,f);
    };
    if(stage>=3)art+=fruit(-7,1)+(stage===4?fruit(8,-5):'');
    if(stage===4)art+='<path class="spark" d="M18-22H20V-18H24V-16H20V-12H18V-16H14V-18H18Z" fill="#fff0a2"/>';
  }
  return tileGroup(cx,cy,1,art);
};

furnitureArt=function(kind){
  const wood='#85614c',light='#d8ac74',dark='#4b4548',cream='#f5dfaa';
  const art={
    bed:`<path d="M9 31H15V26H65V31H71V49H65V54H15V49H9Z" fill="#9f6974"/><path d="M13 32H19V29H62V33H67V45H62V49H18V45H13Z" fill="#dab2a0"/><path d="M21 33H59V44H21Z" fill="${cream}"/><path d="M29 37H34V40H29M35 40H44V44H35M43 37H48V40H43" fill="#ce997f"/>`,
    house:`<path d="M13 26H67V53H13Z" fill="${light}"/><path d="M10 26V21H16V16H23V11H30V6H49V11H57V16H64V21H70V26Z" fill="#786887"/><path d="M14 20H66V23H14M22 13H58V16H22" fill="#a091a3"/><path d="M28 53V35H33V30H47V35H52V53Z" fill="${dark}"/><path d="M31 50H49V54H31Z" fill="#dba5a3"/><path d="M38 12H42V16H46V20H42V24H38V20H34V16H38Z" fill="${cream}"/>`,
    aquarium:`${tileRect(7,12,66,40,dark)}${tileRect(10,16,60,31,'#619cab')}${tileRect(13,18,55,25,'#95c7bf')}<path d="M13 43H67V48H13Z" fill="#e5c795"/><path d="M18 44V28H21V33H24V24H27V41H23V44M56 44V33H53V29H57V24H60V36H64V43Z" fill="#507e5a"/><g class="film-wave"><path d="M30 26H39V29H42V32H39V35H30V32H26V27H30Z" fill="#f3bb77"/><path d="M45 35H51V38H54V41H45V39H42V36H45Z" fill="#d8887e"/>${tileRect(38,28,2,2,dark)}</g><path d="M62 18H64V21H62M58 23H60V26H58M14 17H30V19H14" fill="#e6f0d1"/>${tileRect(7,49,66,5,wood)}`,
    record:`${tileRect(9,21,62,32,wood)}${tileRect(12,18,56,19,light)}<path d="M18 23H24V20H42V23H48V30H42V33H24V30H18Z" fill="${dark}"/>${tileRect(29,23,8,7,'#c98081')}<path d="M57 21H60V30H48V27H57Z" fill="#665458"/><path d="M16 41H21V52H16M24 41H29V52H24M32 41H37V52H32M40 41H45V52H40" fill="#b894a4"/><path d="M53 41H64V44H53M53 47H64V50H53" fill="#4e4040"/>`,
    lamp:`<path d="M38 22H42V48H53V53H27V48H38Z" fill="#7a8160"/><path d="M39 38H46V35H52V29H47V32H42V35H39" fill="#a1b273"/><path d="M26 9H31V15H36V8H43V15H49V9H54V22H49V28H31V22H26Z" fill="#c7888b"/><path d="M29 11H31V18H36V12H39V24H33V20H29" fill="#efc2a3"/><path d="M30 49H50V51H30" fill="${cream}"/>`,
    arcade:`<path d="M21 4H61V34H66V39H69V55H13V38H18V34H21Z" fill="#7c6688"/>${tileRect(25,8,32,22,dark)}${tileRect(28,11,26,16,'#334b58')}<g class="film-star"><path d="M31 18H34V15H38V18H41V23H31M44 17H49V22H44" fill="#bfd07d"/></g><path d="M20 34H60V40H17V37H20Z" fill="#c5a5ae"/>${tileRect(29,33,3,7,dark)}${tileRect(47,35,5,3,'#eeb383')}${tileRect(27,46,27,5,dark)}`,
    picnic:`<path d="M12 29H65V34H69V41H74V53H6V41H9V34H12Z" fill="${cream}"/><path d="M15 29H22V53H15M34 29H41V53H34M54 29H61V53H54M7 40H73V46H7" fill="#c8867d"/>${tileRect(25,27,26,16,'#ae8054')}<path d="M29 27V20H33V16H43V20H47V27H43V21H33V27Z" fill="${wood}"/><path d="M29 30H47V33H29M29 36H47V38H29" fill="#e9c18b"/>${tileRect(55,43,10,6,'#fff2cb')}`,
    greenhouse:`<path d="M9 24H13V18H21V13H29V8H36V4H44V8H51V13H59V18H67V24H71V54H9Z" fill="#54827b"/><path d="M13 26H67V50H13M18 21H62V24H18M26 15H54V20H26M34 9H46V14H34Z" fill="#aac9b5"/><path d="M37 7H42V52H37M23 17H26V52H23M54 17H57V52H54M10 25H70V28H10" fill="#739b87"/><path d="M15 30H21V34H15M28 30H34V32H28M45 17H50V19H45" fill="#e8eace"/><path d="M15 45H32V52H15M46 45H63V52H46" fill="#b7855e"/><path d="M20 45V36H16V32H22V36H26V31H30V38H25V45M51 45V34H48V30H53V36H58V32H63V37H56V45" fill="#62884c"/>`,
    firefly:tileGroup(23,7,.83,tileLamp(0,0))+tileGroup(57,14,.83,tileLamp(0,0))
  };
  return `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" shape-rendering="crispEdges">${tileRect(9,53,62,4,'#69534922')}${art[kind]||''}</svg>`;
};
placedFurnitureG=function(place){
  const pos=place==='room'?{pet:[352,350,109,62],shelf:[368,207,63,45],light:[435,237,42,48]}:{yard:[316,113,102,74],yardLight:[132,127,82,60]};
  return Object.values(LV.furniture||{}).map(id=>{const f=FURNITURE[id],p=f&&pos[f.slot];return p?`<svg x="${p[0]}" y="${p[1]}" width="${p[2]}" height="${p[3]}" viewBox="0 0 80 60">${furnitureArt(f.kind)}</svg>`:'';}).join('');
};

const tileBasePetScene=petSceneG;
petSceneG=function(place){
  // Each pet has its own clear lane: three friends never share a furniture slot.
  return tileBasePetScene(place).replace(/translate\((185|249|316),260\)/g,(_,x)=>`translate(${({185:136,249:207,316:278})[x]},351)`).replace(/translate\((110|212|312),164\)/g,(_,x)=>`translate(${({110:120,212:208,312:294})[x]},185)`);
};

roomScene=function(){
  const th=THEMES[LV.theme]||THEMES.cozy,night=isNight(),sleeping=isSleeping();
  let g=`<svg class="scene pixel-scene" viewBox="0 0 480 420" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-label="큰 사진 스크린과 가구가 놓인 픽셀 거실">${tileRect(0,0,480,225,th.wall)}`;
  for(let x=0;x<480;x+=16)g+=tileRect(x,22,2,177,'#fff6d8','opacity=".13"');
  for(let y=28;y<204;y+=22)for(let x=7;x<480;x+=32)g+=`<path d="M${x} ${y}h2v2h2v2h-2v2h-2v-2h-2v-2h2Z" fill="#845e46" opacity=".12"/>`;
  g+=tileRect(0,201,480,24,th.trim)+tileRect(0,201,480,4,'#fcdfaa','opacity=".45"');
  for(let x=0;x<480;x+=24)g+=tileRect(x,205,2,20,th.floorLine);
  g+=tileRect(0,225,480,195,th.floor);
  for(let row=0;row<9;row++)for(let col=-1;col<9;col++){
    const x=col*68+(row%2)*34,y=227+row*24;
    g+=tileRect(x,y,67,22,row%3===0?'#edc58a':th.floor,'opacity=".36"')+tileRect(x,y+21,68,2,th.floorLine)+tileRect(x+67,y,2,24,th.floorLine)+tileRect(x+5,y+3,46,1,'#f7d99e','opacity=".35"')+tileRect(x+13,y+14,21,1,th.floorLine,'opacity=".4"');
  }
  g+=tileRect(0,223,480,5,'#684b39')+tileRect(0,228,480,3,'#513d34','opacity=".28"');
  // Timber ceiling and tiny warm string lamps.
  g+=tileRect(0,0,480,12,'#846044')+tileRect(0,12,480,4,'#b68a5c')+tileRect(0,0,9,225,'#a78059')+tileRect(471,0,9,225,'#795d47');
  for(let i=0;i<15;i++)g+=tileRect(18+i*31,15+(i%2)*3,3,5,i%3===0?'#e1a48a':'#f1d49a',`class="${night?'film-star':''}"`);
  // Seasonal window, curtains and a deep sill.
  g+=tileRect(17,36,97,76,'#735447')+tileRect(21,40,89,65,night?'#31475c':'#a1c8c6');
  g+=tileGroup(61,92,.75,tileTree(0,0,1))+tileRect(25,95,81,10,seasonOf()==='winter'?'#e7e9d3':'#87a875');
  g+=tileRect(61,40,5,65,'#795f49')+tileRect(21,71,89,4,'#795f49')+tileRect(14,109,103,6,'#4f463e')+tileRect(17,108,97,3,'#d9b47b');
  for(let x of [15,103])g+=tileRect(x,35,13,64,th.blanket)+tileRect(x+3,38,3,59,'#fff0d2','opacity=".3"')+tileRect(x,78,13,6,'#bd9867');
  // Masonry hearth with separated pixel flames.
  g+=tileRect(18,134,88,87,'#9a8875');
  for(let r=0;r<5;r++)for(let c=0;c<4;c++){const x=20+c*21+(r%2?9:0);if(x+18<108)g+=tileRect(x,137+r*16,18,13,r%2?'#b4a18a':'#c2b197')+tileRect(x+2,138+r*16,13,2,'#d9c4a5');}
  g+=tileRect(12,128,100,8,'#765441')+tileRect(12,128,100,2,'#d0a470')+tileRect(36,170,52,49,'#453c36')+tileRect(42,163,40,7,'#453c36')+tileRect(30,218,63,8,'#736153');
  g+=`<g class="pixel-fire"><path d="M45 210V196H49V187H53V178H57V187H62V199H66V183H70V192H76V210Z" fill="#dc8a4c"/><path d="M51 210V201H55V193H59V203H65V199H70V210Z" fill="#f3c778"/>${tileRect(42,212,37,5,'#70503b')}${tileRect(47,211,15,2,'#9e6c40')}</g>`;
  // Keepsakes on the mantle.
  g+=tileRect(43,115,29,14,'#765946')+tileRect(46,118,23,10,'#f1d3a2')+tileGroup(51,119,.3,charG(1,0,0,1))+tileGroup(60,118,.3,charG(2,0,0,1))+tileFlower(93,124,'#d99494',.9);
  // The garden door keeps its full-height keyboard and touch target.
  g+=tileAction('텃밭으로 이동',"setLoc('garden')",tileRect(112,135,32,91,'#624b3b')+tileRect(116,139,24,82,'#b18a58')+tileRect(119,144,18,24,'#d8b575')+tileRect(119,180,18,34,'#bd9762')+tileRect(135,174,3,4,'#f2d394')+tileRect(110,124,35,13,'#735c46')+tileLabel(127,134,'텃밭','#f9e0b1',9)+tileRect(107,126,38,107,'transparent'));
  g+=cinemaG();
  // Woven rug, running stitch and tassels.
  g+=tileRect(149,319,178,80,'#624c3c','opacity=".2"')+tileRect(145,315,178,80,th.rug)+tileRect(151,321,166,68,th.rug2)+tileRect(159,328,150,54,th.rug);
  for(let x=151;x<320;x+=8)g+=tileRect(x,313,3,4,th.rug2)+tileRect(x,395,3,4,th.rug2);
  for(let x=167;x<311;x+=16)g+=tileRect(x,332,6,2,th.rug2)+tileRect(x,377,6,2,th.rug2);
  g+='<path d="M206 344H212V338H221V344H227V350H233V356H227V362H221V368H212V362H206V356H200V350H206Z" fill="'+th.rug2+'" opacity=".55"/>';
  // Bed with checked cover, two pillows and wooden posts.
  g+=tileRect(338,268,121,72,'#614735')+tileRect(340,270,119,53,'#ecd9b2')+tileRect(340,286,118,44,th.blanket)+tileRect(337,251,7,91,'#886345')+tileRect(454,247,8,95,'#886345')+tileRect(337,252,125,9,'#c49b66');
  for(let x=345;x<454;x+=15)g+=tileRect(x,288,3,41,'#fff0d2','opacity=".24"');
  for(let y=292;y<330;y+=12)g+=tileRect(343,y,111,3,'#fff0d2','opacity=".24"');
  g+=tileRect(350,269,40,17,'#fff1cd')+tileRect(402,269,41,17,'#fff1cd')+tileRect(354,283,33,3,'#d5bc9a')+tileRect(406,283,33,3,'#d5bc9a')+tileRect(338,328,125,7,'#9d754e');
  // A cedar soaking tub on its own slate mat.
  g+=tileRect(16,291,99,78,'#716d63')+tileRect(20,295,91,70,'#969283')+'<path d="M27 309H97V314H106V353H98V359H27V353H20V314H27Z" fill="#775641"/><path d="M27 311H97V315H101V334H95V339H29V334H25V315H27Z" fill="#bf945e"/><path d="M32 313H94V318H98V328H92V332H34V328H28V318H32Z" fill="#87bfc3"/><path d="M37 319H56V321H37M65 325H87V327H65" fill="#d8e6d1"/>';
  for(let x=29;x<100;x+=11)g+=tileRect(x,340,2,14,'#b68b59');
  g+=tileRect(25,346,77,3,'#5b5148')+tileRect(22,335,83,3,'#dab375');
  // Coffee table, ceramics and living plants.
  g+=tileRect(148,287,84,8,'#664b38')+tileRect(152,279,76,10,'#c39761')+tileRect(154,280,71,2,'#ecc58b')+tileRect(155,295,6,19,'#765039')+tileRect(219,295,6,19,'#765039');
  g+=tileRect(162,275,10,5,'#f4dfb2')+tileRect(174,275,3,4,'#ead3a4')+tileRect(163,273,8,2,'#8c634c');
  if(LV.vase)g+=tileAction('화병 케어하기','careVase()',vaseG(208,272,.85)+flowerG(LV.vase.flower,208,258,.8)+(dueCare(LV.vase.care)?pinG(224,257,'💧'):''));else g+=vaseG(208,272,.85);
  LV.indoor.forEach((p,i)=>{g+=indoorPotG(p,i?308:126,i?287:278,1);});
  g+=placedFurnitureG('room');
  // Character lanes do not cross furniture or obscure the photo.
  if(!sleeping){g+=tileRect(161,277,35,5,'#463e3533')+tileRect(251,296,35,5,'#463e3533');g+=`<g class="bobp">${charG(1,160,234,2.15)}</g><g class="bobp b2">${charG(2,249,252,2.15)}</g>`;}
  g+=petSceneG('room');
  if((LV.seasonDecor||[]).includes(SEASON_ITEMS[seasonOf()].id)){
    const decoration={
      spring:tileFlower(30,30,'#efb2b9',.8)+tileFlower(54,30,'#efb2b9',.8)+tileFlower(78,30,'#efb2b9',.8)+tileFlower(102,30,'#efb2b9',.8),
      summer:tileGroup(28,259,1,'<path d="M-3-24H3V-20H6V-14H8V17H5V23H-5V17H-8V-14H-6V-20H-3Z" fill="#71a9b1"/><path d="M-2-21H2V19H-2Z" fill="#f5e0aa"/><path d="M-7 7H7V12H-7Z" fill="#d59584"/>'),
      fall:tileGroup(64,28,1,'<path d="M-9-7H8V-4H13V5H8V9H-9V5H-13V-4H-9Z" fill="#bc8254"/><path d="M-6-4H5V-1H8V3H5V6H-6V3H-9V-1H-6Z" fill="#ebba71"/><path d="M-4-2H4V4H-4Z" fill="'+th.wall+'"/><path d="M-2 7H3V15H-2Z" fill="#bf7370"/>'),
      winter:tileTree(29,260,.58)+'<path d="M20 229H23V235H20M34 241H37V246H34" fill="#c77f79"/>'
    };g+=decoration[seasonOf()];
  }
  if(LV.theme==='cafe')g+=tileRect(19,23,88,11,'#f9e4ba')+tileLabel(63,31,'AZIT COFFEE','#577568',7);
  if(LV.theme==='starlight')for(let i=0;i<8;i++)g+=`<path class="film-star" d="M${20+i*60} 22h2v3h3v2h-3v3h-2v-3h-3v-2h3Z" fill="#ebd19c"/>`;
  if(LV.theme==='ocean')g+=tileGroup(65,27,.7,'<path d="M-9-9H9V-6H12V6H9V9H-9V6H-12V-6H-9Z" fill="#f6e8c0"/><path d="M-5-5H5V5H-5Z" fill="#78a6b1"/><path d="M-9-9H-4V-4H-9M5 4H10V9H5" fill="#d98c7b"/>');
  if(night)g+=tileRect(0,0,480,420,'#25364d',`opacity="${sleeping?.24:.12}" pointer-events="none"`);
  if(sleeping)g+=charG(1,352,262,1.7)+charG(2,404,262,1.7)+tileRect(343,292,111,36,th.blanket)+`<text class="zz" x="394" y="252" fill="#fff1c9" font-size="15">z Z</text>`;
  g+='</svg>';
  return `<div class="living-scene pixel-room ${worldStill?'world-still':''}">${g}<div class="pixel-scene-caption"><span>OUR LITTLE HOME</span><small>${night?'따뜻한 불빛이 머무는 밤':'햇살 한 조각, 둘만의 오후'}</small></div></div>`;
};

gardenPlotsG=function(){
  return LV.garden.plots.map((p,i)=>{
    const x=19+(i%3)*150,y=265+Math.floor(i/3)*110,w=140,h=91,ready=p&&p.stage>=4,due=p&&!ready&&dueCare(p.care),f=p?(FRUITS[p.type]||FRUITS.tomato):null;
    const action=!p?`plotPicker(${i})`:ready?`collectPlot(${i})`:`waterPlot(${i})`,label=(i+1)+'번 밭 '+(!p?'씨앗 심기 · 3하트':f.n+(ready?' 수확하기 · 수확물 2개':` ${p.stage||0}/4 · `+(due?'지금 물주기':nextCareLabel(p.care))));
    let art=tileRect(x,y+5,w,h,'#795c3a')+tileRect(x,y,w,h,ready?'#e6c17c':'#c49a61')+tileRect(x+4,y+4,w-8,h-8,'#9a7148')+tileRect(x+7,y+7,w-14,h-25,p&&p.wateredAt&&Date.now()-p.wateredAt<3600000?'#695644':'#886442');
    for(let r=0;r<4;r++)art+=tileRect(x+10,y+15+r*14,w-20,3,'#4e4838','opacity=".36"');
    for(let n=0;n<17;n++)art+=tileRect(x+12+(n*37)%112,y+12+(n*17)%46,2,2,n%2?'#c49b65':'#574735');
    art+=tileRect(x+5,y+6,16,15,'#e1bd83')+tileLabel(x+13,y+17,String(i+1),'#6a5139',10);
    if(p){
      art+=`<g class="crop-sway">${cropG(p,x+35,y+37)}${cropG(p,x+72,y+30)}${cropG(p,x+108,y+40)}</g>`;
      for(let s=0;s<4;s++)art+=tileRect(x+44+s*14,y+61,10,4,s<(p.stage||0)?'#e5cd8a':'#5e513d');
      art+=tileRect(x+5,y+71,w-10,18,ready?'#ffedb6':'#e8cfa1')+tileLabel(x+w/2,y+84,f.n+' · '+(ready?'수확 +2':due?'물 주세요':'자라는 중'),'#624e3b',11);
      if(due)art+=pinG(x+w-15,y+17,'💧');
      if(p.wateredAt&&Date.now()-p.wateredAt<8000)art+=`<g class="water-sprinkles"><path d="M${x+37} ${y+8}h3v6h-3M${x+78} ${y+3}h3v6h-3M${x+106} ${y+11}h3v6h-3" fill="#b6e5e2"/></g>`;
    }else art+=tileRect(x+59,y+24,23,23,'#b89a69')+`<path d="M${x+65} ${y+35}h11m-5-5v11" stroke="#ffe5ae" stroke-width="2"/>`+tileLabel(x+w/2,y+69,'씨앗 고르기','#f9dfac',12);
    return tileAction(label,action,art,`data-world-focus="plot-${i}" data-pixel-plot="${i}" class="clk garden-plot ${ready?'plot-ready':''}"`);
  }).join('');
};
renderGarden=function(){
  const season=seasonOf(),night=isNight(),rows=Math.max(1,Math.ceil(LV.garden.plots.length/3)),H=278+rows*110;
  const pal={spring:['#b9d7d0','#b2bd7b','#89985e'],summer:['#a1cbd3','#9fae67','#788954'],fall:['#bfd0c7','#c4ae6e','#9d8b54'],winter:['#cadbd9','#e0e7d5','#bdcbbd']}[season];
  let g=`<svg class="scene pixel-scene" viewBox="0 0 480 ${H}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-label="계절 나무와 돌길, 작물이 자라는 픽셀 텃밭">${tileRect(0,0,480,H,pal[1])}${tileRect(0,0,480,118,night?'#34475d':pal[0])}`;
  g+=tileCloud(72,28,.95)+tileCloud(250,16,.7)+tileRect(408,28,24,24,night?'#e9e0b0':'#f4dca2')+tileRect(403,33,34,14,night?'#e9e0b0':'#f4dca2');
  g+='<path d="M0 88H20V80H47V72H78V63H103V72H126V80H150V91H177V84H200V77H227V68H253V74H278V83H306V92H331V82H356V72H386V64H411V74H442V85H480V125H0Z" fill="'+(night?'#465b5c':'#a2b397')+'"/>';
  for(let i=0;i<11;i++)g+=tileTree(i*49+8,131+(i%2)*7,.69);
  for(let n=0;n<185;n++){
    const x=(n*73+11)%478,y=142+(n*47)%(H-148);
    g+=`<path d="M${x} ${y}h2v3h3v-2h2v4h-5v-2h-2Z" fill="${pal[2]}" opacity=".45"/>`;
  }
  // Cottage entrance, shingled roof, flower boxes and a stone path.
  let house=tileRect(15,114,92,72,'#e6c797')+tileRect(19,130,84,49,'#f1d7a5')+'<path d="M7 117V109H14V101H23V93H33V84H91V93H101V101H110V109H117V117Z" fill="#7e6263"/>';
  for(let r=0;r<4;r++)house+=tileRect(15+r*7,111-r*7,94-r*14,3,r%2?'#be8981':'#a97774');
  house+=tileRect(49,139,25,44,'#7b5e43')+tileRect(52,143,19,37,'#a88652')+tileRect(65,160,3,4,'#e5c781')+tileRect(22,136,19,20,'#6d8c83')+tileRect(81,136,18,20,'#6d8c83')+tileRect(30,136,2,20,'#e5c894')+tileRect(88,136,2,20,'#e5c894')+tileRect(22,145,19,2,'#e5c894')+tileRect(81,145,18,2,'#e5c894');
  for(let x of [23,34,81,92])house+=tileFlower(x,163,'#d49591',.65);
  house+=tileRect(15,181,93,7,'#957854');
  g+=tileAction('거실로 이동',"setLoc('room')",house+tileRect(15,115,92,76,'transparent'));
  // Fences are visibly upgraded when purchased.
  const fence=LV.garden.decor==='fence'||LV.garden.decor==='fountain';
  for(let i=0;i<11;i++){const x=127+i*31;g+=tileRect(x,142,6,fence?35:20,fence?'#aa8153':'#798554')+tileRect(x,139,6,4,fence?'#e0b77a':'#a9b275');}
  g+=tileRect(125,153,345,4,fence?'#c59b65':'#91a365');if(fence)g+=tileRect(125,168,345,4,'#9a754d');
  g+=tileRect(0,229,480,25,'#aa966c')+tileRect(0,230,480,20,'#d3bd88');
  for(let x=0;x<480;x+=23)g+=tileRect(x,230,1,20,'#aa966c')+tileRect(x+3,233,15,2,'#ead3a1');
  for(let i=0;i<4;i++)g+=tileRect(35+i*7,190+i*9,30,6,'#c9ba93')+tileRect(38+i*7,190+i*9,23,2,'#e8d8ac');
  // Field sign and potting supplies.
  g+=tileRect(239,126,6,47,'#8a6847')+tileRect(208,126,70,28,'#735b43')+tileRect(211,129,64,22,'#a98857')+tileLabel(243,144,'우리 텃밭','#ffedbf',12);
  g+=tileGroup(440,202,1,'<path d="M-10-4H7V11H-10Z" fill="#7aa0a0"/><path d="M7-2H14V2H11V8H7M-10-2H-17V-6H-22V-9H-18V-7H-10" fill="#7aa0a0"/><path d="M-7-4V-9H4V-4" fill="none" stroke="#5e7f83" stroke-width="3"/><path d="M-7-1H-4V8H-7" fill="#b6c8b0"/>');
  if(LV.garden.decor==='fountain')g+=tileGroup(433,158,.72,'<path d="M-29 6H30V18H22V23H-21V18H-29Z" fill="#798d8e"/><path d="M-25 5H26V14H-25Z" fill="#9fc9c4"/><path d="M-5-23H5V7H-5M-15-26H15V-20H-15" fill="#a5b5a6"/><path class="water-sprinkles" d="M-1-41H2V-27H-1M7-37H10V-27H7M-9-35H-6V-27H-9" fill="#b8e0d5"/>');
  else g+=tileTree(444,166,.78);
  g+=placedFurnitureG('garden')+petSceneG('garden')+gardenPlotsG();
  for(let i=0;i<rows*4;i++)g+=tileFlower(i%2?469:8,278+Math.floor(i/2)*48,season==='winter'?'#f8edd7':i%3?'#f4dba0':'#d59e9e',.7);
  if(night)g+=tileRect(0,0,480,H,'#293c50','opacity=".15" pointer-events="none"');
  g+='</svg>';
  const empty=LV.garden.plots.filter(p=>!p).length,ready=LV.garden.plots.filter(p=>p&&p.stage>=4).length,growing=LV.garden.plots.length-empty-ready;
  $('livingView').innerHTML=sceneToolbar('햇살 머무는 우리 텃밭')+`<div class="living-scene pixel-garden ${worldStill?'world-still':''}">${g}<div class="pixel-scene-caption"><span>THE LITTLE GARDEN</span><small>${SEASON_META[season].n} · 함께 키우는 작은 선물</small></div></div><div class="garden-summary"><span class="garden-stat"><b>${growing}</b><small>자라는 중</small></span><span class="garden-stat ready"><b>${ready}</b><small>수확 가능</small></span><span class="garden-stat"><b>${empty}</b><small>빈 밭</small></span></div>`+worldDashboardHtml('garden')+gardenGuideHtml()+worldControls()+petFamilyHtml();
};

function pixelShopFront(){
  let art=tileRect(0,0,480,136,'#ccdbc5')+tileRect(0,100,480,36,'#a5ad7b')+tileTree(21,121,.8)+tileTree(457,119,.8)+tileRect(76,36,328,88,'#e4c18b')+tileRect(81,40,318,80,'#f4d9a7')+tileRect(94,73,79,40,'#775b49')+tileRect(300,73,80,40,'#775b49')+tileRect(207,62,66,62,'#876248')+tileRect(213,68,54,53,'#a7b7a0')+tileRect(238,68,4,55,'#795b45');
  for(let i=0;i<12;i++)art+=tileRect(73+i*28,36,28,28,i%2?'#efd29c':'#aa7370')+tileRect(73+i*28,64,28,7,i%2?'#d8b987':'#895d5d');
  art+=tileRect(89,18,303,19,'#705742')+tileRect(91,19,299,2,'#b79767')+tileLabel(240,32,'아지트 잡화점 · LITTLE FINDS','#ffe5b6',12);
  art+=tileGroup(103,82,.57,petG({type:'dog',breed:'shiba'},0,0,2))+tileGroup(150,106,.6,cropG({type:'strawberry',stage:4},0,0))+`<svg x="307" y="76" width="55" height="40" viewBox="0 0 80 60">${furnitureArt('record')}</svg>`;
  art+=tileRect(68,122,344,5,'#826949')+tileRect(63,127,354,5,'#b3996b')+tileLamp(52,77)+tileLamp(430,77);
  return `<div class="pixel-shopfront" aria-hidden="true"><svg viewBox="0 0 480 140" shape-rendering="crispEdges">${art}</svg></div>`;
}
seasonItemSvg=function(season){
  const art={
    spring:'<path d="M8 19H20V23H34V26H48V23H62V19H73" fill="none" stroke="#9a7b53" stroke-width="2"/>'+tileFlower(15,25,'#eab7b9',1)+tileFlower(39,32,'#eab7b9',1.1)+tileFlower(64,25,'#eab7b9',1),
    summer:tileGroup(40,29,1,'<path d="M-4-24H4V-20H8V-12H10V19H6V25H-6V19H-10V-12H-8V-20H-4Z" fill="#75aab3"/><path d="M-2-21H2V22H-2M-9 8H9V13H-9" fill="#f2dca9"/>'),
    fall:'<path d="M25 9H55V14H63V22H68V38H61V46H52V51H28V46H19V38H13V22H20V14H25Z" fill="#b37a4c"/><path d="M28 14H52V20H59V36H52V43H28V36H21V20H28Z" fill="#ddac63"/><path d="M30 22H50V37H30Z" fill="#f7ecd2"/><path d="M34 45H43V57H34M43 47H48V55H43" fill="#b87a79"/>',
    winter:tileTree(40,44,.77)+'<path d="M35 6H41V12H35M49 19H53V23H49M24 27H28V31H24" fill="#c3807f"/>'
  };
  return `<svg viewBox="0 0 80 60" shape-rendering="crispEdges" aria-hidden="true">${art[season]||''}</svg>`;
};
const tileShopCard=shopCard;
shopCard=function(image,name,status,action,disabled=false,extra=''){
  const themeId=/^buyTheme\('([a-z]+)'\)$/.exec(action)?.[1],itemKey=/^buyItem\('([a-zA-Z]+)'\)$/.exec(action)?.[1];
  if(themeId&&THEMES[themeId]){
    const th=THEMES[themeId];let art=tileRect(3,3,74,52,'#82664a')+tileRect(6,6,68,30,th.wall)+tileRect(6,36,68,16,th.floor)+tileRect(9,10,20,18,'#92754f')+tileRect(11,12,16,14,'#9cbab8')+tileRect(18,12,2,14,'#ead0a1')+tileRect(11,18,16,2,'#ead0a1')+tileRect(22,41,28,9,th.rug)+tileRect(25,43,22,5,th.rug2)+tileRect(47,30,24,14,th.blanket)+tileRect(49,28,20,5,'#f8e3bb');
    if(themeId==='starlight')art+='<path d="M37 12H40V15H43V18H40V21H37V18H34V15H37" fill="#edd496"/>';
    if(themeId==='cottage'||themeId==='mint')art+=tileFlower(36,35,'#d3a378',.8);
    image=`<svg viewBox="0 0 80 60" shape-rendering="crispEdges" aria-hidden="true">${art}</svg>`;
  }else if(itemKey&&SHOP[itemKey]&&SHOP[itemKey].type!=='indoor'){
    const kind=SHOP[itemKey].id;
    let art=kind==='fence'?'<path d="M9 19H15V52H9M28 14H34V52H28M47 14H53V52H47M66 19H72V52H66M6 27H74V32H6M6 42H74V47H6" fill="#b28a55"/><path d="M9 16H15V20H9M28 11H34V15H28M47 11H53V15H47M66 16H72V20H66M6 27H74V29H6" fill="#e9c28a"/>':kind==='fountain'?'<path d="M10 36H70V46H62V52H18V46H10Z" fill="#7d9392"/><path d="M15 35H65V42H15Z" fill="#a9cdc5"/><path d="M36 15H44V38H36M25 14H55V20H25" fill="#b1bbac"/><path d="M39 0H42V14H39M29 5H32V14H29M48 4H51V14H48" fill="#86b8bc"/>':tileRect(7,24,65,30,'#b8935c')+tileRect(11,28,57,20,'#8d6b48')+'<path d="M15 33H65V36H15M15 42H65V45H15" fill="#66513a"/>'+cropG({type:'tomato',stage:1},40,28);
    image=`<svg viewBox="0 0 80 60" shape-rendering="crispEdges" aria-hidden="true">${art}</svg>`;
  }
  return tileShopCard(image,name,status,action,disabled,extra);
};
const tileRenderShop=renderShop;
renderShop=function(){tileRenderShop();$('livingView').insertAdjacentHTML('afterbegin',pixelShopFront());};

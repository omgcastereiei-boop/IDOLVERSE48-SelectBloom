// =====================================================================================
//  IDOLVERSE48: Select Bloom! — in-game calendar for every date field
// -------------------------------------------------------------------------------------
//  Every <input type="date"> of the game is shown as a game-styled date button. Tapping it opens the
//  game's own calendar (month view, today marked, days outside the allowed range greyed out). Picking a
//  day writes the value into the original field and fires its normal "change" handler, so every screen
//  keeps working exactly as before. Works in pages and in pop-ups.
// =====================================================================================
const GC_TH=()=>typeof UIP!='undefined'&&UIP.lang=='th';
const gcIso=t=>`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
const gcParse=v=>{if(!v)return null;const t=new Date(v+'T00:00:00');return isNaN(t)?null:t};
function gcLabel(v){const t=gcParse(v);if(!t)return GC_TH()?'เลือกวันที่':'Choose a date';try{return GC_TH()?t.toLocaleDateString('th-TH-u-ca-gregory',{weekday:'short',day:'numeric',month:'short',year:'numeric'}):t.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}catch(e){return v}}
let GC=null;
function gcOpen(inp){const v=gcParse(inp.value)||gcParse(inp.min)||dayDate(S?S.day:0);GC={inp,y:v.getFullYear(),m:v.getMonth()};gcDraw()}
function gcClose(){GC=null;const o=document.getElementById('gcov');if(o)o.remove()}
function gcNav(d){if(!GC)return;GC.m+=d;if(GC.m<0){GC.m=11;GC.y--}if(GC.m>11){GC.m=0;GC.y++}gcDraw()}
function gcPick(iso){if(!GC)return;const inp=GC.inp;gcClose();inp.value=iso;try{inp.dispatchEvent(new Event('input',{bubbles:true}))}catch(e){}try{inp.dispatchEvent(new Event('change',{bubbles:true}))}catch(e){}const b=inp.nextElementSibling;if(b&&b.classList.contains('gcbtn'))b.querySelector('span').textContent=gcLabel(iso)}
function gcDraw(){if(!GC)return;let o=document.getElementById('gcov');if(!o){o=document.createElement('div');o.id='gcov';o.setAttribute('data-notr','');o.onclick=e=>{if(e.target===o)gcClose()};document.body.appendChild(o)}
 const th=GC_TH(),inp=GC.inp,mn=gcParse(inp.min),mx=gcParse(inp.max),sel=inp.value,today=gcIso(dayDate(S?S.day:0)),first=new Date(GC.y,GC.m,1),days=new Date(GC.y,GC.m+1,0).getDate(),lead=first.getDay();
 const title=first.toLocaleDateString(th?'th-TH-u-ca-gregory':'en-US',{month:'long',year:'numeric'}),wk=th?['อา','จ','อ','พ','พฤ','ศ','ส']:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
 let cells='';for(let i=0;i<lead;i++)cells+='<span class="gcd e"></span>';
 for(let d=1;d<=days;d++){const t=new Date(GC.y,GC.m,d),iso=gcIso(t),off=(mn&&t<mn)||(mx&&t>mx),cls=['gcd',iso==sel?'on':'',iso==today?'td':'',off?'off':'',t.getDay()==0||t.getDay()==6?'we':''].join(' ');cells+=off?`<span class="${cls}">${d}</span>`:`<button class="${cls}" onclick="gcPick('${iso}')">${d}</button>`}
 const canPrev=!mn||new Date(GC.y,GC.m,0)>=new Date(mn.getFullYear(),mn.getMonth(),1),canNext=!mx||new Date(GC.y,GC.m+1,1)<=mx;
 o.innerHTML=`<div class="gcbox" role="dialog"><div class="gchd"><span>📅 ${th?'เลือกวันที่':'Choose a date'}</span><button class="gcx" onclick="gcClose()" aria-label="Close">✕</button></div>
 <div class="gcsel">${esc(gcLabel(sel))}</div><div class="gcnav"><button class="b s" ${canPrev?'':'disabled'} onclick="gcNav(-1)">◀</button><b>${esc(title)}</b><button class="b s" ${canNext?'':'disabled'} onclick="gcNav(1)">▶</button></div>
 <div class="gcgrid">${wk.map((w,i)=>`<span class="gcw ${i==0||i==6?'we':''}">${w}</span>`).join('')}${cells}</div>
 <div class="gcleg"><span><i class="td"></i>${th?'วันนี้ในเกม':'Today (game)'}</span>${mn?`<span>${th?'เลือกได้ตั้งแต่':'From'} ${esc(gcLabel(inp.min))}</span>`:''}</div>
 <div class="row gcft"><button class="b s" onclick="gcPick('${gcIso(dayDate(S?S.day:0))}')" ${(mn&&dayDate(S?S.day:0)<mn)||(mx&&dayDate(S?S.day:0)>mx)?'disabled':''}>${th?'วันนี้':'Today'}</button><span style="flex:1"></span><button class="b s" onclick="gcClose()">${th?'ยกเลิก':'Cancel'}</button></div></div>`}
// replace the native fields (pages and pop-ups), whenever they appear
function gcEnhance(root){(root||document).querySelectorAll('input[type="date"]:not([data-gc])').forEach(inp=>{inp.setAttribute('data-gc','1');inp.classList.add('gchide');const b=document.createElement('button');b.type='button';b.className='gcbtn';b.disabled=inp.disabled;b.innerHTML=`<i>📅</i><span>${esc(gcLabel(inp.value))}</span>`;b.onclick=e=>{e.preventDefault();e.stopPropagation();gcOpen(inp)};inp.insertAdjacentElement('afterend',b)})}
{const f=render;render=function(){const r=f.apply(this,arguments);try{gcEnhance()}catch(e){console.error(e)}return r}}
try{new MutationObserver(()=>{if(document.querySelector('input[type="date"]:not([data-gc])'))gcEnhance()}).observe(document.documentElement,{childList:true,subtree:true})}catch(e){}
// ---- single details: the CD covers fill their cards (two per row) -------------------------------------------------------------
{const f=showEds;showEds=function(){const r=f.apply(this,arguments);try{if(ui.mod&&ui.mod.t=='html'&&ui.mod.h.indexOf('<div class="g"><div class="c m">')>=0){ui.mod.h=ui.mod.h.replace('<div class="g"><div class="c m">','<div class="g edcv"><div class="c m">');render()}}catch(e){console.error(e)}return r}}

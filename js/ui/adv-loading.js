// =====================================================================================
//  Next day / +7: a loading screen while the days are played (the page cannot redraw during the calculation,
//  so the screen is shown first, painted, and then the days run). Double taps are ignored while it runs.
// =====================================================================================
const ADVL_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
let ADVL_ON=0;
function advUI(n){n=Math.max(1,n|0);if(ADVL_ON||!S)return;ADVL_ON=1;let el=document.getElementById('advload');if(!el){el=document.createElement('div');el.id='advload';el.setAttribute('data-notr','1');document.body.appendChild(el)}
 const d0=S.day,from=jd(d0),to=jd(d0+n);
 el.innerHTML=`<div class="advlbox" role="status" aria-live="polite"><div class="advlspin"></div><b>${n>1?ADVL_T(`Playing the next ${n} days…`,`กำลังดำเนินเกม ${n} วันถัดไป…`):ADVL_T('Going to the next day…','กำลังไปวันถัดไป…')}</b><span>${from} → ${to}</span><div class="advlbar"><i></i></div><small>${ADVL_T('Theater shows, events, sales and fans are being calculated. Please wait.','กำลังคำนวณการแสดงเธียเตอร์ อีเวนต์ ยอดขาย และแฟนคลับ กรุณารอสักครู่')}</small></div>`;
 el.className='on';
 // let the browser paint the screen before the work starts
 requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>{try{adv(n)}catch(e){console.error(e)}finally{ADVL_ON=0;el.className='';setTimeout(()=>{if(!ADVL_ON)el.innerHTML=''},250)}},16)))}
// faster days: a group's fan count is counted once per day state (it loops over every fan cohort and is asked many times)
let ADVL_FC=null;
if(typeof fdGroupFans=='function'){const f=fdGroupFans;fdGroupFans=function(gid){if(typeof PD_IN=='undefined'||!PD_IN||!S||!S.fb||!S.fb.segs||arguments.length>1)return f.apply(this,arguments);const k=S.day+'|'+S.fb.segs.length+'|'+(S.fans|0)+'|'+(S.fb.ver|0);if(!ADVL_FC||ADVL_FC.k!==k)ADVL_FC={k,m:new Map()};if(!ADVL_FC.m.has(gid))ADVL_FC.m.set(gid,f.apply(this,arguments));return ADVL_FC.m.get(gid)}}
// smaller save: finished / expired / declined external events older than 120 days are removed (music programs stay:
// they are part of each single's history). Their money is in the ledger and the fans / experience they gave are kept.
function advlPruneXe(){try{const X=xeS(),lim=S.day-120,n=X.list.length;X.list=X.list.filter(r=>!(['done','expired','cancelled','declined'].includes(r.status)&&r.ch!='mp'&&(r.end??r.dl??r.day??S.day)<lim));return n-X.list.length}catch(e){return 0}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);advlPruneXe();return r}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(dt().getDate()==1)advlPruneXe()}catch(e){}return r}}
// ---- faster screens ----------------------------------------------------------------------------------------------------------
// member lookup by id: an index instead of scanning every member on each call (the handshake budget asked thousands of times)
{const f0=get;let IX=null,IA=null,IN=-1;const build=L=>{IX=new Map();L.forEach((m,i)=>{if(m)IX.set(String(m.id),i)});IA=L;IN=L.length};
 get=function(id){const L=S&&S.members;if(!L||id==null)return f0(id);if(IA!==L||IN!==L.length)build(L);let i=IX.get(String(id));if(i!=null){const m=L[i];if(m&&m.id==id)return m;build(L);i=IX.get(String(id));if(i!=null&&L[i]&&L[i].id==id)return L[i]}return f0(id)}}
// the single's budget: computed once per screen update / tap / day (the handshake estimate behind it is heavy)
let ADVL_GEN=0;
{const f=render;render=function(){ADVL_GEN++;try{return f.apply(this,arguments)}finally{ADVL_GEN++}}}
{const f=tick;tick=function(){ADVL_GEN++;try{return f.apply(this,arguments)}finally{ADVL_GEN++}}}
try{['pointerdown','click','change','input','keydown'].forEach(ev=>document.addEventListener(ev,()=>{ADVL_GEN++},true))}catch(e){}
{const f=cost;let C=null;cost=function(p){if(!p||!S)return f.apply(this,arguments);if(C&&C.p===p&&C.g===ADVL_GEN&&C.d===S.day)return{L:C.r.L.map(x=>x.slice()),u:new Set(C.r.u),t:C.r.t};const r=f.apply(this,arguments);try{C={p,g:ADVL_GEN,d:S.day,r:{L:r.L.map(x=>x.slice()),u:new Set(r.u),t:r.t}}}catch(e){C=null}return r}}
// ---- Lite mode (Management › Display): no animations, shadows or drawn scenery; on by default on phones / tablets ----------
try{if(UIP.lite==null){UIP.lite=(window.matchMedia&&matchMedia('(pointer:coarse)').matches)?1:0;localStorage.setItem('iv48ui',JSON.stringify(UIP))}}catch(e){}
{const f=applyPrefs;applyPrefs=function(){const r=f.apply(this,arguments);try{document.body.classList.toggle('lite',!!UIP.lite)}catch(e){}return r}}
try{document.body.classList.toggle('lite',!!UIP.lite)}catch(e){}
try{Object.assign(I18N_TH,{'Lite mode':'โหมดประหยัด','Lite mode turns off animations, shadows and the drawn scenery behind pages so the game runs smoothly on phones and older computers.':'โหมดประหยัดจะปิดแอนิเมชัน เงา และฉากวาดด้านหลังหน้าจอ ให้เกมลื่นขึ้นบนมือถือและคอมรุ่นเก่า'})}catch(e){}

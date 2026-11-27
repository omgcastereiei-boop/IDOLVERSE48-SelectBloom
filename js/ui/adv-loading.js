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

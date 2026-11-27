// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Request Hour concert: free scheduling & protection
// -------------------------------------------------------------------------------------
//  · Every performance of a Request Hour concert can be put on any date (and Afternoon / Evening); days may be apart.
//    Only the performance days are booked (no rent / no member booking for the days in between).
//  · After confirming, the whole concert can be postponed (all performances move together).
//  · Protection: two performances can never share a date and slot; a concert that was never confirmed is moved
//    forward instead of silently passing; a confirmed concert whose ticket sales would open after its first day opens
//    them; a cancelled (or lost) Request Hour concert can be organized again from the Request Hour page.
// =====================================================================================
const RHF_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
const rhfIs=C=>!!(C&&C.rh);
// no "consecutive days" rule for Request Hour concerts
{const f=ccGapErr;ccGapErr=function(C){if(rhfIs(C))return'';return f.apply(this,arguments)}}
// rent: performance days only (the days in between are not rented)
{const f=ccRent;ccRent=function(C){const r=f.apply(this,arguments);try{if(!rhfIs(C)||!r||!r.rows)return r;const hold=r.rows.filter(x=>x.kind=='Hold day');if(!hold.length)return r;const sub=hold.reduce((a,x)=>a+(x.a||0),0);return{...r,rows:r.rows.filter(x=>x.kind!='Hold day'),prep:r.prep-sub,total:r.total-sub}}catch(e){return r}}}
// the date selector: real dates instead of "Day 1 / 2 / 3"
function rhfMinDay(C){let P=1;try{P=ccPrepN(C)||1}catch(e){}return S.day+P+1}
{const f=ccPfSet;ccPfSet=function(pid,k,v){const C=ccCur();if(!rhfIs(C)||k!='d')return f.apply(this,arguments);const p=C.pf.find(x=>x.id==pid);if(!p)return;const day=+v;
 if(!Number.isFinite(day))return;if(day<rhfMinDay(C))return toast(RHF_T(`Choose ${jd(rhfMinDay(C))} or later (the stage needs its preparation days).`,`เลือกตั้งแต่ ${jd(rhfMinDay(C))} เป็นต้นไป (ต้องมีวันเตรียมเวที)`),'err');
 const nd=day-C.start;if(C.pf.some(x=>x!==p&&x.d==nd&&x.sl==p.sl))return toast(RHF_T('Another performance already uses that date and time.','มีอีกรอบใช้วันและช่วงเวลานี้แล้ว'),'err');
 if(C.status=='plan'){p.d=nd;ccNorm(C);ccRenum(C);render();return}
 return toast(RHF_T('After confirming, use “Postpone the concert”.','หลังยืนยันแล้ว ใช้ปุ่ม “เลื่อนคอนเสิร์ต”'),'err')}}
{const f=ccSchedHtml;ccSchedHtml=function(C){let h=f.apply(this,arguments);try{if(!rhfIs(C))return h;const lo=Math.min(rhfMinDay(C),C.start),hi=Math.max(S.day+150,C.start+60);
  C.pf.forEach(p=>{const re=new RegExp(`<select onchange="ccPfSet\\('${p.id}','d',this\\.value\\)">[\\s\\S]*?</select>`);const cur=C.start+p.d;let o='';for(let d=lo;d<=hi;d++)o+=`<option value="${d}" ${d==cur?'selected':''}>${jd(d)}</option>`;
   h=h.replace(re,`<select onchange="ccPfSet('${p.id}','d',this.value)">${o}</select>`)});
  h=h.replace('<div class="row ccpf">',`<p class="st">${RHF_T('Request Hour: every performance can be on any date and time; days may be apart. Two performances cannot share the same date and time.','Request Hour: แต่ละรอบเลือกวันและช่วงเวลาได้อิสระ เว้นวันได้ แต่สองรอบใช้วันและช่วงเวลาเดียวกันไม่ได้')}</p><div class="row ccpf">`)}catch(e){console.error(e)}return h}}
// postpone a confirmed Request Hour concert (all performances together)
function rhfPostpone(id,n){const C=ccGet(id);if(!rhfIs(C)||!['plan','conf','sales'].includes(C.status))return;n=Math.max(1,Math.min(60,+n||7));C.start+=n;if(C.sale&&C.sale.open!=null&&C.sale.open>C.start-1)C.sale.open=Math.max(S.day,C.start-7);
 try{ccLog(C,`Postponed by ${n} days (first performance ${jd(C.start)}).`)}catch(e){}toast(RHF_T(`Postponed: first performance ${jd(C.start)}.`,`เลื่อนแล้ว รอบแรก ${jd(C.start)}`));render()}
{const f=ccEditor;ccEditor=function(C){let h=f.apply(this,arguments);try{if(rhfIs(C)&&['conf','sales'].includes(C.status)){const b=`<div class="c rhfpp"><b>${RHF_T('Postpone the concert','เลื่อนคอนเสิร์ต')}</b> <span class="st">${RHF_T('All performances move together.','ทุกรอบเลื่อนไปพร้อมกัน')}</span><div class="row">${[7,14,21,30].map(n=>`<button class="b s" onclick="rhfPostpone('${C.id}',${n})">+${n} ${RHF_T('days','วัน')}</button>`).join('')}</div></div>`;h=b+h}}catch(e){console.error(e)}return h}}
// ---- protection -------------------------------------------------------------------------------------------------------------
function rhfGuard(){if(!S||!S.cc)return;const X=ccS();X.list.forEach(C=>{if(!rhfIs(C))return;try{
  // two performances on the same date and slot: move the later one to the next free slot
  const seen=new Set();ccPfOrder(C).forEach(p=>{let k=p.d+p.sl;while(seen.has(k)){if(p.sl=='a')p.sl='e';else{p.d++;p.sl='a'}k=p.d+p.sl}seen.add(k)});ccRenum(C);
  // never confirmed but its date has come: move it forward (keeps the spacing) and tell the player
  if(C.status=='plan'&&S.day>=C.start-((typeof ccPrepN=='function'&&ccPrepN(C))||1)){const to=rhfMinDay(C)+7,sh=to-C.start;if(sh>0){C.start+=sh;try{ccLog(C,`Not confirmed in time: moved to ${jd(C.start)}.`)}catch(e){}
   CTQ.push(`<div class="ctbd">${esc(RHF_T(`“${C.name}” was not confirmed in time, so it was moved to ${jd(C.start)}. Confirm it in Concerts.`,`“${C.name}” ยังไม่ได้ยืนยันทันเวลา จึงเลื่อนไปเป็น ${jd(C.start)} กรุณายืนยันในหน้าคอนเสิร์ต`))}</div>`)}}
  // confirmed, but ticket sales would open after the first performance: open them now
  if(C.status=='conf'&&C.sale&&C.sale.open!=null&&C.sale.open>=C.start)C.sale.open=Math.min(S.day,C.start-1)}catch(e){console.error('rh guard',e)}})}
{const f=ccDaily;ccDaily=function(){try{rhfGuard()}catch(e){}return f.apply(this,arguments)}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{rhfGuard()}catch(e){}return r}}
// a cancelled / lost Request Hour concert can be organized again (the ranking stays)
function rhfCcGone(E){if(!E||!E.rank||!E.rank.length||!E.cc)return false;const C=ccGet(E.cc);return!C||C.status=='cancel'||C.status=='cancelled'}
function rhfRemake(eid){const E=rhGet(eid);if(!E||!rhfCcGone(E))return;const old=E.cc;E.cc=null;const C=rhMakeConcert(E);if(!C){E.cc=old;return toast(RHF_T('The concert could not be created.','สร้างคอนเสิร์ตไม่สำเร็จ'),'err')}
 E.log.push({d:S.day,t:'concert-again',cc:C.id});ui.cc=C.id;toast(RHF_T('The Request Hour concert was created again. Choose the dates and confirm it.','สร้างคอนเสิร์ต Request Hour ใหม่แล้ว เลือกวันแล้วกดยืนยันได้เลย'));try{goView('concert')}catch(e){render()}}
{const f=rhResHtml;rhResHtml=function(E){let h=f.apply(this,arguments);try{if(rhfCcGone(E))h=`<div class="c rhfagain"><b>${RHF_T('The Request Hour concert was cancelled.','คอนเสิร์ต Request Hour ถูกยกเลิกไปแล้ว')}</b><p class="st">${RHF_T('The ranking is kept. You can organize the concert again.','อันดับยังอยู่ครบ จัดคอนเสิร์ตใหม่ได้')}</p><button class="b p" onclick="rhfRemake('${E.id}')">${RHF_T('Organize the concert again','จัดคอนเสิร์ตใหม่')}</button></div>`+h}catch(e){console.error(e)}return h}}

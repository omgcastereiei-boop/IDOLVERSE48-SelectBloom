// =====================================================================================
//  IDOLVERSE48: Select Bloom! — the first performance of a Stage is given by its own lineup only
// -------------------------------------------------------------------------------------
//  · The debut (first) performance of a new Stage is performed only by the members of the Stage — no substitutes.
//    When any of them cannot perform on that day, the show does not take place: it is cancelled, and the debut moves to
//    the next scheduled show of that theater where every member is free (the player can choose another one).
//  · Choosing the debut performance shows, for every scheduled show, whether all members of the Stage are free; a show
//    where someone is already busy cannot be confirmed.
//  · The chosen show is locked: it is a firm commitment of every member of the Stage, so other work on that day and
//    time (events, MV filming, other groups…) is refused like any other schedule conflict.
//  · Re-recording: a Stage whose first performance was given with substitutes can record its first-performance photos
//    again on a later show with its full lineup (same rules: locked, cancelled when someone cannot perform).
// =====================================================================================
const TF_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
let TF_SELF=null;
const tfShow=id=>(S&&S.th&&thS().sh.find(z=>z.id==id))||null;
// the Stage a locked show belongs to: a scheduled debut, or a re-recording of the first-performance photos
function tfHard(x){if(!x||x.st!='sched')return null;if(x.fx)return thStage(x.fx);const T=S.th&&S.th.T[x.k];if(T&&T.trans&&T.trans.debut==x.id)return thStage(T.trans.stage);return null}
// members of Stage s who cannot perform show x (energy is only known on the day itself)
function tfMissing(s,x){const out=[];if(!s||!x)return out;let ids=[];try{ids=thPerf(s).map(m=>m.id)}catch(e){}const p=TF_SELF;TF_SELF=x.id;try{ids.forEach(id=>{const m=get(id);let w;if(!m)w='Left the group';else{const L=m.wel&&m.wel.leave,back=L&&L.ret!=null&&L.ret<=x.day&&x.day>S.day;if(back)m.wel.leave=null;try{w=thWhy(m,x)}finally{if(back)m.wel.leave=L}}if(w)out.push({id,name:m?(m.stage||m.name):'#'+id,why:w})})}finally{TF_SELF=p}return out}
const tfTag=(s,x)=>{const M=tfMissing(s,x);return M.length?TF_T(` · ⚠ ${M.length} busy: ${M.slice(0,3).map(z=>z.name).join(', ')}${M.length>3?'…':''}`,` · ⚠ ไม่ว่าง ${M.length} คน: ${M.slice(0,3).map(z=>z.name).join(', ')}${M.length>3?'…':''}`):TF_T(' · ✓ all members free',' · ✓ เมมเบอร์ว่างครบ')};
// ---- the lock: a firm commitment for every member of the Stage ----------------------------------------------------------
{const f=gsCommits;gsCommits=function(mid,from,to){const L=f.apply(this,arguments);try{L.forEach(c=>{if(c.src!='th'||!c.id||c.id===TF_SELF)return;const x=tfShow(c.id),s=tfHard(x);if(s){c.src='thd';c.label=TF_T(`First performance of “${s.name}” (locked)`,`รอบแสดงแรกของ “${s.name}” (ล็อกไว้)`)}})}catch(e){}return L}}
// …also against work of the same group (gsConf only compares other groups)
{const f=gsConf;gsConf=function(ids,day,s,e,gid,exceptId){const out=f.apply(this,arguments);try{[...new Set(ids)].forEach(mid=>{gsCommits(mid,day,day).forEach(c=>{if(c.src=='thd'&&c.gid==gid&&c.id!=exceptId&&c.s<e&&s<c.e&&!out.some(o=>o.mid==mid&&o.id==c.id))out.push({mid,...c})})})}catch(x){}return out}}
// a show never conflicts with itself
{const f=thWhy;thWhy=function(m,x){const p=TF_SELF;TF_SELF=x?x.id:null;try{return f.apply(this,arguments)}finally{TF_SELF=p}}}
// ---- choosing the debut performance ---------------------------------------------------------------------------------------
{const f=V.thstage;V.thstage=function(){let h=f.apply(this,arguments);try{const P=ui.thtr,s=P&&thStage(P.stage);if(!s)return h;const key=thCur(),SH=thShowsOf(key).filter(x=>x.st=='sched');
  const i=h.indexOf('<select onchange="ui.thtr.debut=this.value;render()">');if(i<0)return h;const j=h.indexOf('</select>',i);
  const part=h.slice(i,j).replace(/<option value="([^"]+)"([^>]*)>([^<]*)<\/option>/g,(a,id,at,t)=>{const x=SH.find(z=>z.id==id);return x?`<option value="${id}"${at}>${t}${esc(tfTag(s,x))}</option>`:a});
  const D=SH.find(z=>z.id==P.debut),M=D?tfMissing(s,D):[];
  const note=`<p class="st">${TF_T('The first performance is given only by the members of this Stage (no substitutes). The chosen show is locked for all of them; if someone still cannot perform on the day, that show is cancelled and the debut moves to the next show where everyone is free.','รอบแสดงแรกต้องขึ้นแสดงโดยเมมเบอร์ของสเตจนี้เท่านั้น (ไม่มีตัวแทน) รอบที่เลือกจะถูกล็อกงานของทุกคนไว้ ถ้าวันนั้นยังมีคนแสดงไม่ได้ รอบนั้นจะงดแสดง และเลื่อนรอบแรกไปรอบถัดไปที่ทุกคนว่าง')}</p>`+
   (D?(M.length?`<div class="geerr c"><b>${TF_T(`${M.length} member(s) are not free for this show:`,`มีเมมเบอร์ ${M.length} คนไม่ว่างในรอบนี้:`)}</b><ul class="ms">${M.slice(0,10).map(z=>`<li>${esc(z.name)} — ${esc(z.why)}</li>`).join('')}</ul></div>`:`<p class="st" style="color:var(--ok,#3c9a6c)">✓ ${TF_T(`All ${(()=>{try{return thPerf(s).length}catch(e){return''}})()} members of the Stage are free for this show.`,`เมมเบอร์ของสเตจว่างครบทุกคนในรอบนี้`)}</p>`):'');
  const k=h.indexOf('</label>',j);h=h.slice(0,i)+part+h.slice(j,k+8)+note+h.slice(k+8)}catch(e){console.error(e)}return h}}
{const f=thTransConfirm;thTransConfirm=function(){try{if(typeof view!='undefined'&&view=='thstage'){const P=ui.thtr,s=P&&thStage(P.stage),D=P&&tfShow(P.debut);if(s&&D){const M=tfMissing(s,D);if(M.length)return toast(TF_T(`Not every member is free for this show (${M[0].name}: ${M[0].why}). Choose another show.`,`เมมเบอร์ไม่ว่างครบในรอบนี้ (${M[0].name}: ${M[0].why}) เลือกรอบอื่น`),'err')}}}catch(e){console.error(e)}return f.apply(this,arguments)}}
// ---- on the day: the full lineup, or no show --------------------------------------------------------------------------------
function tfNext(s,key,after){return thShowsOf(key).filter(x=>x.st=='sched'&&x.id!=after.id&&(x.day>after.day||x.day==after.day&&after.sl=='a'&&x.sl=='e')).sort((a,b)=>a.day-b.day||(a.sl=='a'?-1:1)).find(x=>!tfMissing(s,x).length)||null}
{const f=thDebut;thDebut=function(T,s,x){try{const M=tfMissing(s,x);if(M.length){x.st='cancel';x.why=TF_T('First performance: not every member can perform','รอบแสดงแรก: เมมเบอร์ไม่ครบ');const tr=T.trans,n=tfNext(s,T.key,x);
  const who=M.map(z=>`${z.name} (${z.why})`).join(', ');
  if(tr&&n){tr.debut=n.id;tr.dday=n.day;n.pin=1;thN(`<li>🎭 <b>${esc(thLabel(T.key))}</b> — ${TF_T(`the first performance of “${esc(s.name)}” on ${jd(x.day)} did not take place: ${esc(who)}. It moves to ${esc(thSlotTxt(n))} (every member is free). You can choose another show in Theater › Stages.`,`รอบแสดงแรกของ “${esc(s.name)}” วันที่ ${jd(x.day)} งดแสดง: ${esc(who)} เลื่อนไปเป็น ${esc(thSlotTxt(n))} (เมมเบอร์ว่างครบ) เลือกรอบอื่นได้ที่ เธียเตอร์ › สเตจ`)}</li>`)}
  else if(tr){const st=thStage(tr.stage);if(st)st.status=tr.prev||'draft';T.trans=null;thN(`<li>⚠ <b>${esc(thLabel(T.key))}</b> — ${TF_T(`the first performance of “${esc(s.name)}” on ${jd(x.day)} did not take place (${esc(who)}) and no later show has every member free. Schedule its debut again in Theater › Stages.`,`รอบแสดงแรกของ “${esc(s.name)}” วันที่ ${jd(x.day)} งดแสดง (${esc(who)}) และไม่มีรอบถัดไปที่ทุกคนว่าง กรุณาเลือกวันเปิดตัวใหม่ที่ เธียเตอร์ › สเตจ`)}</li>`)}
  return false}}catch(e){console.error(e)}return f.apply(this,arguments)}}
// ---- re-recording the first-performance photos with the full lineup --------------------------------------------------------
function tfRedoOpts(s){const T=thOf(s.k);return thShowsOf(s.k).filter(x=>x.st=='sched'&&x.day>S.day&&!x.fx&&thStageFor(T,x)===s&&!(T.trans&&(T.trans.debut==x.id||T.trans.final==x.id))).sort((a,b)=>a.day-b.day||(a.sl=='a'?-1:1)).slice(0,40)}
function tfRedoSet(sid){const s=thStage(sid),sel=document.getElementById('tfredo'),x=sel&&tfShow(sel.value);if(!s||!x)return toast(TF_T('Choose a show.','เลือกรอบการแสดง'),'err');
 const M=tfMissing(s,x);if(M.length)return toast(TF_T(`Not every member is free for this show (${M[0].name}: ${M[0].why}).`,`เมมเบอร์ไม่ว่างครบในรอบนี้ (${M[0].name}: ${M[0].why})`),'err');
 thShowsOf(s.k).forEach(z=>{if(z.fx==s.id){delete z.fx;delete z.pin}});x.fx=s.id;x.pin=1;toast(TF_T(`First-performance photos will be recorded again on ${thSlotTxt(x)} — locked for every member.`,`จะบันทึกภาพรอบแสดงแรกใหม่ ${thSlotTxt(x)} — ล็อกงานของเมมเบอร์ทุกคนแล้ว`));thOpenStage(sid)}
function tfRedoCancel(sid){thShowsOf((thStage(sid)||{}).k).forEach(z=>{if(z.fx==sid){delete z.fx;delete z.pin}});toast(TF_T('Re-recording cancelled.','ยกเลิกการบันทึกใหม่แล้ว'));thOpenStage(sid)}
function tfRedoHtml(s){if(!s||!(s.debutPics||[]).length||s.status!='active')return'';const T=thOf(s.k),cur=thShowsOf(s.k).find(z=>z.fx==s.id&&z.st=='sched');
 const rec=thS().pf.find(p=>p.st==s.id&&p.day==s.debut),subs=rec&&(rec.rp||[]).length;
 if(cur)return`<div class="c tfredo"><b>📸 ${TF_T('Re-recording the first performance','บันทึกรอบแสดงแรกใหม่')}</b><p class="st">${esc(thSlotTxt(cur))} · ${TF_T('locked for every member of the Stage','ล็อกงานของเมมเบอร์ทุกคนแล้ว')}${esc(tfTag(s,cur))}</p><button class="b s" onclick="tfRedoCancel('${s.id}')">${TF_T('Cancel','ยกเลิก')}</button></div>`;
 const L=tfRedoOpts(s);return`<div class="c tfredo"><b>📸 ${TF_T('Record the first performance again','บันทึกรอบแสดงแรกใหม่')}</b><p class="st">${subs?TF_T('The first performance was given with substitutes. ','รอบแสดงแรกมีตัวแทนขึ้นแสดง '):''}${TF_T('Choose a later show where every member of the Stage is free: it is locked, and its photos replace the first-performance photos (with the full lineup).','เลือกรอบถัดไปที่เมมเบอร์ของสเตจว่างครบ รอบนั้นจะถูกล็อกงาน และภาพของรอบนั้นจะแทนภาพรอบแสดงแรก (เมมเบอร์หลักครบ)')}</p>
  ${L.length?`<select id="tfredo">${L.map(x=>`<option value="${x.id}">${esc(thSlotTxt(x)+tfTag(s,x))}</option>`).join('')}</select> <button class="b s p" onclick="tfRedoSet('${s.id}')">${TF_T('Lock this show','ล็อกรอบนี้')}</button>`:`<p class="st">${TF_T('No later show is scheduled yet.','ยังไม่มีรอบการแสดงถัดไป')}</p>`}</div>`}
{const f=thOpenStage;thOpenStage=function(id){const r=f.apply(this,arguments);try{const s=thStage(id);if(ui.mod&&ui.mod.t=='html'&&s){const add=tfRedoHtml(s);if(add){const k=ui.mod.h.indexOf('<h3>Performances</h3>');ui.mod.h=k>=0?ui.mod.h.slice(0,k)+add+ui.mod.h.slice(k):ui.mod.h+add;render()}}}catch(e){console.error(e)}return r}}
{const f=thPerform;thPerform=function(x){const sid=x&&x.st=='sched'&&x.fx;if(!sid)return f.apply(this,arguments);const s=thStage(sid);delete x.fx;
 try{const M=s?tfMissing(s,x):[];if(M.length){x.st='cancel';x.why=TF_T('First-performance recording: not every member can perform','บันทึกรอบแสดงแรก: เมมเบอร์ไม่ครบ');delete x.pin;
  thN(`<li>🎭 <b>${esc(thLabel(x.k))}</b> — ${TF_T(`the show on ${jd(x.day)} (re-recording the first performance of “${esc(s.name)}”) did not take place: ${esc(M.map(z=>`${z.name} (${z.why})`).join(', '))}. Choose another show in the Stage details.`,`รอบวันที่ ${jd(x.day)} (บันทึกรอบแสดงแรกของ “${esc(s.name)}” ใหม่) งดแสดง: ${esc(M.map(z=>`${z.name} (${z.why})`).join(', '))} เลือกรอบอื่นได้ในรายละเอียดสเตจ`)}</li>`);return}}catch(e){console.error(e)}
 const H=thS(),n0=H.pf.length,r=f.apply(this,arguments);try{if(s&&H.pf.length>n0){const rec=H.pf.at(-1);if(rec.st==s.id&&!(rec.rp||[]).length){s.debutPics=thPicsFrom(rec);s.debutLu=rec.mem.slice();s.debutPicDay=rec.day;rec.pics=1;
  // the re-recorded show becomes the first performance everywhere: Original Setlist (as debuted), Units, Recording / Song Library / Request Hour
  try{const sn=(H.snap||{})[rec.snap];if(sn){s.orig=JSON.parse(JSON.stringify(sn));s.origUnits=JSON.parse(JSON.stringify(thUnits(s)))}}catch(e){console.error(e)}
  try{const R=typeof rcS=='function'?rcS():null;if(R&&R.fps){delete R.fps[s.id];if(typeof rcBuild=='function')rcBuild(s,rec)}}catch(e){console.error(e)}
  thN(`<li>📸 ${TF_T(`First-performance photos of <b>“${esc(s.name)}”</b> recorded again with the full lineup (${jd(rec.day)}).`,`บันทึกภาพรอบแสดงแรกของ <b>“${esc(s.name)}”</b> ใหม่ด้วยเมมเบอร์หลักครบ (${jd(rec.day)})`)} <button class="b s" onclick="thPics('${s.id}')">${TF_T('View photos','ดูภาพ')}</button></li>`)}}}catch(e){console.error(e)}return r}}
// the photo header shows the day the photos were taken
{const f=thPicsHtml;thPicsHtml=function(s){if(!s||s.debutPicDay==null)return f.apply(this,arguments);const d=s.debut;s.debut=s.debutPicDay;try{return f.apply(this,arguments)}finally{s.debut=d}}}
// ---- re-recording after a Formation / Center change: the change must already apply to the chosen show -------------------------
//  (a running Stage's changes are scheduled for a performance at least 7 days later; earlier shows keep the old configuration)
const tfLastEff=s=>{const Q=(s&&s.cfgQ)||[];return Q.reduce((a,q)=>!a||(q.eff&&!thSlotLe(q.eff,a))?q.eff:a,null)};
{const f=tfRedoOpts;tfRedoOpts=function(s){return f.apply(this,arguments)}}
{const f=tfRedoHtml;tfRedoHtml=function(s){let h=f.apply(this,arguments);try{if(!h||!s)return h;const E=tfLastEff(s),draft=typeof thCfgDirty=='function'?thCfgDirty(s):!!s.cfgEd;
  if(E)h=h.replace(/<option value="([^"]+)">([^<]*)<\/option>/g,(a,id,t)=>{const x=tfShow(id);return x&&!thSlotLe(E,x)?`<option value="${id}">${t}${esc(TF_T(' · ⚠ before your formation change',' · ⚠ ก่อนฟอร์เมชันใหม่มีผล'))}</option>`:a});
  const note=`<p class="st">${TF_T('Fixing the formation or Centers? Change them in the Setlist Editor (Centers & Formation) and schedule the change first — it applies from the performance you choose (at least 7 days ahead). Then record the first performance again on that show or a later one: its photos, the Original Setlist (as debuted) and the Recording first performance are all replaced.','จะแก้ฟอร์เมชันหรือเซ็นเตอร์? แก้ที่หน้าแก้เซ็ตลิสต์ (เซ็นเตอร์และฟอร์เมชัน) แล้วกำหนดวันที่การเปลี่ยนแปลงมีผลก่อน (รอบที่ห่างอย่างน้อย 7 วัน) จากนั้นบันทึกรอบแสดงแรกใหม่ในรอบนั้นหรือรอบหลังจากนั้น — ภาพรอบแรก เซ็ตลิสต์ต้นฉบับ (ตอนเปิดตัว) และรอบแรกในระบบบันทึกเสียง/วิดีโอ จะถูกแทนที่ทั้งหมด')}</p>${draft?`<p class="st thwarn">${TF_T('You have unscheduled Formation / Center changes: schedule them before choosing the show.','มีการแก้ฟอร์เมชัน/เซ็นเตอร์ที่ยังไม่ได้กำหนดวันมีผล: กำหนดก่อนเลือกรอบ')}</p>`:''}${E?`<p class="st">${TF_T('Latest scheduled change applies from','การเปลี่ยนแปลงล่าสุดมีผลตั้งแต่')} ${esc(thSlotTxt({day:E.day,sl:E.sl||'e'}))}</p>`:''}`;
  h=h.replace(/(<b>📸[^<]*<\/b>)/,`$1${note}`)}catch(e){console.error(e)}return h}}

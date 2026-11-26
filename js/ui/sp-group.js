// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Graduation & Birthday Stages on group stages · graduation choices
// -------------------------------------------------------------------------------------
//  · Graduation Stage: chosen by the player only (nothing is scheduled automatically). Besides her team's shows,
//    the player can choose a show of a group-wide stage (All-Team Stage) or a Special Stage of her group — only
//    shows she performs in.
//  · No Graduation Stage: she graduates on her last day (the graduation date) without a stage. Her final profile
//    picture is the costume of the last single she took part in; a member who completed her contract receives the
//    Honorary Graduate gown (grad2.js).
//  · Birthday Stage (automatic): when her team has no show around her birthday but a group-wide / Special Stage of her
//    group has one, that show is used — preferably one she performs in; otherwise the show closest to her birthday,
//    where she takes an empty position or the last position of the lineup (sp-fix.js).
//  · Leaving before the contract ends: the member herself decides whether she stays with the agency until the end of
//    her contract (Agency Retained) or ends the contract (termination fee) — the producer no longer chooses.
// =====================================================================================
const SPG_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
// the members who perform a scheduled show (its Stage lineup, Special Stage lineup…)
function spgIds(x){try{const C=thCheck(x);if(!C||!C.s)return[];return(C.B||thPerf(C.s)).map(m=>m.id)}catch(e){return[]}}
function spgKeys(m){const gid=typeof gsGid=='function'?gsGid(m):m.group,own=spKey(m);try{return thKeysAll().filter(K=>K.gid==gid&&K.key!=own&&K.kind!='team'&&K.kind!='tr').map(K=>K.key)}catch(e){return[]}}
function spgShows(m,kind,lo,hi){const keys=new Set(spgKeys(m));if(!keys.size)return[];return thS().sh.filter(x=>keys.has(x.k)&&x.st=='sched'&&x.day>=lo&&x.day<=hi&&(!x.sp||x.sp.kind==kind))}
// graduation: her team's shows + group / Special Stage shows she performs in
{const f=spOpts;spOpts=function(m,kind){const L=f.apply(this,arguments);try{if(kind=='grad'&&m){const[lo,hi]=spWin(m,kind),rb=spRelBlock(m);spgShows(m,kind,lo,hi).filter(x=>(rb==null||x.day>rb)&&spgIds(x).includes(m.id)).forEach(x=>{if(!L.includes(x))L.push(x)});L.sort((a,b)=>a.day-b.day||(a.sl=='a'?-1:1))}}catch(e){console.error(e)}return L}}
{const f=spPlan;spPlan=function(mid,kind){const r=f.apply(this,arguments);try{if(kind=='grad'&&ui.mod&&ui.mod.t=='html'){const m=get(mid);ui.mod.h=ui.mod.h.replace(/<p class="st">Choose a scheduled performance of [^<]*/,s=>s+SPG_T(' Shows of group stages and Special Stages of her group are listed too when she performs in them.',' แสดงรอบของสเตจรวมของวงและสเปเชียลสเตจของวงที่เธอขึ้นแสดงด้วย'));
  ui.mod.h=ui.mod.h.replace(/(<button class="b s spopt" onclick="spSet\('([^']+)'[^>]*>)([^<]*)/g,(a,b,id,t)=>{const x=spShow(id);return x&&x.k!=spKey(m)?b+t+' · '+esc(spLabel(x.k)):a})}}catch(e){console.error(e)}return r}}
// nothing is scheduled automatically for a graduation (the 🎲 button still proposes one when the player asks)
{const f=spAutoGrad;spAutoGrad=function(m,manual){if(!manual)return;return f.apply(this,arguments)}}
// birthday: group-wide / Special Stage shows when her team has none
{const f=spAutoBd;spAutoBd=function(m,manual){const n0=CTQ.length;const r=f.apply(this,arguments);try{if(!m||spCur(m,'bd'))return r;const c=spBdC(m);if((m.bdh||[]).some(b=>Math.abs(b.day-c)<=30))return r;if(spOpts(m,'bd').length)return r;
  const[lo,hi]=spWin(m,'bd'),L=spgShows(m,'bd',lo,hi);if(!L.length)return r;const near=(a,b)=>Math.abs(a.day-c)-Math.abs(b.day-c)||a.day-b.day;const mine=L.filter(x=>spgIds(x).includes(m.id)).sort(near),x=(mine[0]||L.slice().sort(near)[0]);
  // drop the "no performance" warning just queued for her
  for(let i=CTQ.length-1;i>=n0;i--)if(String(CTQ[i]).includes(m.name))CTQ.splice(i,1);
  const had=!!x.sp;x.sp=x.sp||{kind:'bd',mids:[],songs:[],cz:{}};if(!x.sp.mids.includes(m.id))x.sp.mids.push(m.id);if(!had)spAutoFill(x,'bd',m.id);x.sp.auto=1;m.bdA={c,x:x.id};
  const inL=!!mine.length;CTQ.push(`<div class="ctbd">🎂 ${SPG_T(`Birthday Stage auto-scheduled for <b>${esc(m.name)}</b> (birthday ${longDate(c)}) on ${esc(spLabel(x.k))}: ${wd(x.day)} ${TH_SLOT[x.sl]}${inL?'':` — she joins the lineup for this show (an empty position, or the last position sits out)`}.`,`จัดสเตจวันเกิดให้ <b>${esc(m.name)}</b> (วันเกิด ${longDate(c)}) อัตโนมัติที่ ${esc(spLabel(x.k))}: ${wd(x.day)} ${TH_SLOT[x.sl]}${inL?'':` — เธอเข้าไลน์อัปรอบนี้ (แทนตำแหน่งว่าง หรือแทนคนตำแหน่งสุดท้าย)`}`)} <button class="b s" onclick="ui.mod=null;ui.spx='${x.id}';goView('spst')">${SPG_T('Review','ดู')}</button></div>`);if(manual){ui.spx=x.id;goView('spst')}}catch(e){console.error(e)}return r}}
// no Graduation Stage: she graduates on her last day; final profile = costume of the last single she was part of
function spgFinalProfile(m){if(m.profCz&&m.profCz.p&&m.profCz.kind!='grad')return;const L=(m.czHist||[]).filter(z=>z&&z.p&&z.rid&&(z.kind=='title'||z.kind=='single')).sort((a,b)=>(b.day||0)-(a.day||0));if(L[0]){if(m.profCz)m.czHist.push(m.profCz);m.profCz=L[0]}}
// her last day: a fixed date (the graduation window otherwise moves with today): contract end for an expiring contract,
// otherwise 120 days after the announcement (90-day notice + 30-day window), later only while obligations are still pending
function spgDue(m){const G=m.grad;if(!G||G.kind=='dismiss')return S.day>=(G?G.target:1e9);const c=m.ct||{};let dl=G.reason=='exp'?Math.max(c.end||0,G.ann+14):G.ann+120;
 try{const st=oblState(m);if(st.pend)return false;if(st.last>=0)dl=Math.max(dl,st.last+1)}catch(e){}G.last=dl;return S.day>=dl}
function spgGradNoStage(m){if(!m||!m.grad||m.grad.done||m.grad.kind=='dismiss')return false;const G=m.grad;const cz=G.cz;G.cz=null;spgFinalProfile(m);
 try{ctComplete(m,{})}catch(e){console.error(e);G.cz=cz;return false}try{const i=CTQ.length-1;if(i>=0)CTQ[i]=String(CTQ[i]).replace('</h2>',`</h2><p class="st">${SPG_T('No Graduation Stage was held: she graduated on her last day.','ไม่มีสเตจแกรด: เธอจบการศึกษาในวันสุดท้ายของเธอ')}</p>`)}catch(e){}return true}
// ---- leaving early: the member decides (Agency Retained or contract termination) --------------------------------------------
function spgDecide(m){const l=m.loy??50,mor=m.mor??60,p=Math.max(.12,Math.min(.9,.2+l/140+(mor-60)/300));return Math.random()<p?'ret':'fee'}
{const f=ctAnnounce;ctAnnounce=function(m,o){try{if(m&&o&&o.kind!='dismiss'&&o.reason!='dis'&&m.ct&&o.target<m.ct.end-30){o.early=spgDecide(m);o.self=1}}catch(e){console.error(e)}const r=f.apply(this,arguments);
 try{if(m&&m.grad&&o&&o.self){const G=m.grad,txt=G.early=='ret'?SPG_T(`${m.name} decided to stay with the agency until her contract ends (${longDate(m.ct.end)}) — Agency Retained.`,`${m.name} ตัดสินใจอยู่กับค่ายต่อจนหมดสัญญา (${longDate(m.ct.end)}) — Agency Retained`):SPG_T(`${m.name} decided to end her contract when she graduates${G.fee>0?` (termination fee ${yen(G.fee)})`:''}.`,`${m.name} ตัดสินใจยกเลิกสัญญาเมื่อจบการศึกษา${G.fee>0?` (ค่ายกเลิกสัญญา ${yen(G.fee)})`:''}`);
  ctLog(m,'self',txt);hev(m,{t:'ct_self',early:G.early});if(ui.mod&&ui.mod.t=='html'&&ui.mod.h.includes('ctann'))ui.mod.h+=`<p class="ctsay">“${esc(G.early=='ret'?SPG_T('I want to stay with this agency, even after the group.','หนูอยากอยู่กับค่ายนี้ต่อ แม้จะจบจากวงแล้ว'):SPG_T('I want to start my next step on my own.','หนูอยากเริ่มก้าวต่อไปด้วยตัวเอง'))}”</p><p class="st">${esc(txt)}</p>`;else CTQ.push(`<div class="ctbd">🎓 ${esc(txt)}</div>`)}}catch(e){console.error(e)}return r}}
// the graduation dialog: the choice is hers
{const f=ctGradDlg;ctGradDlg=function(){const r=f.apply(this,arguments);try{if(ui.mod&&ui.mod.t=='html'){const h=ui.mod.h,i=h.indexOf('<div class="c"><h3>Early graduation'),j=h.indexOf('<div class="row"><button class="b p" onclick="ctGradGo');
  if(i>=0&&j>i)ui.mod.h=h.slice(0,i)+`<div class="c"><h3>${SPG_T('Early graduation','จบการศึกษาก่อนหมดสัญญา')}</h3><p class="st">${SPG_T('She decides for herself when the graduation is announced: stay with the agency until her contract ends (Agency Retained), or end her contract (a termination fee applies when she asked to leave).','เมมเบอร์ตัดสินใจเองตอนประกาศจบการศึกษา: อยู่กับค่ายต่อจนหมดสัญญา (Agency Retained) หรือยกเลิกสัญญา (ถ้าเธอขอออกเอง จะมีค่ายกเลิกสัญญา)')}</p></div>`+h.slice(j)}}catch(e){console.error(e)}return r}}

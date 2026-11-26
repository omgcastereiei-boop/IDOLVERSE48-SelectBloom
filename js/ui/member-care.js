// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Automatic Member Care (the only recovery system)
// -------------------------------------------------------------------------------------
//  Replaces every earlier recovery mechanic (base +15 Energy a day, the slow Physical / Mental drift recovery and leave
//  recovery of wellness.js, Rest / Recovery Day / Medical Treatment / Mental Recovery buttons, the automatic Reduced
//  Schedule / Recovery Day of fix10.js and the old Automatic Medical Treatment of auto-treat.js).
//  The three stats stay as they are (Energy m.en, Mental Health m.wel.mh, Physical Health m.wel.ph, all 0–100) with all
//  their consequences (leave at 0, injuries, performance, training…).
//  · Daily natural recovery (always, whatever the setting or the company's money): Energy +30, Mental +2, Physical +1.
//  · Automatic Member Care (one company-wide switch, ON by default): at the end of each day (before that day's natural
//    recovery, so a member worn out by the day's work is caught), every member of every
//    group (members, Under members, Trainees, every team and sister group) with a stat BELOW 20 gets the matching treatment:
//      Energy +40 (¥5,000) · Mental Health +30 (¥15,000) · Physical Health +30 (¥25,000) — each stat checked and charged
//    separately, at most once per stat per day. A treatment the company cannot afford is skipped (the balance never goes
//    negative) and retried the next day.
//  · One run per in-game day (S.care.last), so the daily update can never apply twice.
// =====================================================================================
const MC_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
const MC={nat:{en:30,mh:2,ph:1},th:20,amt:{en:40,mh:30,ph:30},cost:{en:5000,mh:15000,ph:25000},
 n:{en:['Energy','พลังงาน'],mh:['Mental Health','สุขภาพจิต'],ph:['Physical Health','สุขภาพกาย']}};
const MC_K=['en','mh','ph'];
const mcCl=v=>Math.max(0,Math.min(100,Number.isFinite(+v)?+v:0));
function mcS(){if(!S.care||typeof S.care!='object'){const old=S.autoCare;S.care={on:old&&old.set&&old.on===false?false:true,last:-1,spent:0,cnt:{en:0,mh:0,ph:0},log:[]}}
 const C=S.care;C.cnt=C.cnt||{en:0,mh:0,ph:0};C.log=Array.isArray(C.log)?C.log:[];C.spent=+C.spent||0;if(C.on==null)C.on=true;return C}
const mcEligible=()=>(S.members||[]).filter(m=>m&&m.status!='graduated');
const mcGet=(m,k)=>k=='en'?(+m.en||0):(+wlOf(m)[k]||0);
function mcSet(m,k,v){v=mcCl(v);if(k=='en')m.en=Math.round(v);else wlOf(m)[k]=v}
// one daily cycle: natural recovery for everyone, then paid treatment below the threshold (when ON)
function mcDaily(){if(!S||!S.members)return;const C=mcS();if(C.last===S.day)return;C.last=S.day;const L=mcEligible();
const natural=()=>L.forEach(m=>{try{MC_K.forEach(k=>mcSet(m,k,mcGet(m,k)+MC.nat[k]))}catch(e){console.error(e)}});
 // the day's activities are over: first the members below the threshold are treated (when ON), then everyone recovers naturally
 if(!C.on){natural();return}try{if(typeof moneyOk=='function')moneyOk()}catch(e){}
 const day={d:S.day,t:[],cost:0,skip:0};
 // the lowest first, so the most urgent are treated when money is short
 const need=[];L.forEach(m=>MC_K.forEach(k=>{const v=mcGet(m,k);if(v<MC.th)need.push([m,k,v])}));need.sort((a,b)=>a[2]-b[2]);
 need.forEach(([m,k,v])=>{const c=MC.cost[k];if(!(S.money>=c)){day.skip++;return}S.money-=c;S.exp=(+S.exp||0)+c;S.mOk=S.money;mcSet(m,k,v+MC.amt[k]);
  C.cnt[k]++;C.spent+=c;day.cost+=c;day.t.push([m.id,k,Math.round(v),Math.round(mcGet(m,k))]);try{wlLog(m,{t:'care',txt:`Automatic Member Care: ${MC.n[k][0]} ${Math.round(v)} → ${Math.round(mcGet(m,k))} (${yen(c)}).`})}catch(e){}});
 if(day.t.length){const by=MC_K.map(k=>[k,day.t.filter(z=>z[1]==k).length]).filter(z=>z[1]);
  S.led.unshift({d:S.day,l:`Automatic Member Care: ${by.map(([k,n])=>`${n}× ${MC.n[k][0]}`).join(', ')}`,a:-day.cost});S.led.length=Math.min(S.led.length,80);
  try{wlN(`<li>🩺 ${MC_T('Automatic Member Care','ดูแลเมมเบอร์อัตโนมัติ')} (${yen(day.cost)}): ${day.t.slice(0,12).map(([id,k,a,b])=>`${esc((get(id)||{}).name||'')} ${MC_T(MC.n[k][0],MC.n[k][1])} ${a}→${b}`).join(' · ')}${day.t.length>12?' …':''}</li>`)}catch(e){}}
 if(day.skip)try{wlN(`<li>⚠ ${MC_T(`Automatic Member Care: ${day.skip} treatment(s) skipped — not enough money. They are retried tomorrow.`,`ดูแลเมมเบอร์อัตโนมัติ: ข้าม ${day.skip} รายการเพราะเงินไม่พอ จะลองใหม่พรุ่งนี้`)}</li>`)}catch(e){}
 if(day.t.length||day.skip){C.log.unshift(day);if(C.log.length>120)C.log.length=120}
 natural()}
// the daily update: after every other daily process of the day (activities have used their Energy by then)
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{mcDaily()}catch(e){console.error('member care',e)}return r}}
// 0–100 everywhere, once at load (older saves could hold negative Energy)
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{mcS();delete S.autoCare;(S.members||[]).forEach(m=>{try{m.en=Math.round(mcCl(m.en));const w=wlOf(m);w.ph=mcCl(w.ph);w.mh=mcCl(w.mh);delete w.atr;if(w.redAuto){w.red=false;w.redAuto=0}}catch(e){}})}catch(e){console.error(e)}return r}}
function mcToggle(on){const C=mcS();C.on=!!on;toast(on?MC_T('Automatic Member Care is ON for the whole company.','เปิดการดูแลเมมเบอร์อัตโนมัติทั้งค่ายแล้ว'):MC_T('Automatic Member Care is OFF. Daily natural recovery continues.','ปิดการดูแลเมมเบอร์อัตโนมัติแล้ว การฟื้นตัวตามธรรมชาติรายวันยังทำงาน'));render()}
// ---- UI: one page (Members › Automatic Member Care) -------------------------------------------------------------------------------
V.care=function(){const C=mcS(),L=mcEligible(),low=k=>L.filter(m=>mcGet(m,k)<MC.th).length,n=k=>MC_T(...MC.n[k]);
 const row=k=>`<tr><td><b>${n(k)}</b></td><td>+${MC.nat[k]} / ${MC_T('day','วัน')}</td><td>&lt; ${MC.th}</td><td>+${MC.amt[k]}</td><td>${yen(MC.cost[k])}</td><td>${C.cnt[k]}</td><td>${low(k)}</td></tr>`;
 return`<div class="c mcc"><div class="row"><h3 style="margin:0">🩺 ${MC_T('Automatic Member Care','ดูแลเมมเบอร์อัตโนมัติ')}</h3><span style="flex:1"></span><button class="b s ${C.on?'p':''}" onclick="mcToggle(1)">${MC_T('ON','เปิด')}</button><button class="b s ${C.on?'':'p'}" onclick="mcToggle(0)">${MC_T('OFF','ปิด')}</button></div>
 <p class="st">${MC_T(`One setting for the whole company: every member, Under member and Trainee of every team and sister group (${L.length} now). Natural recovery happens every day whether it is ON or OFF. When ON, a member whose stat is below ${MC.th} at the end of the day is treated automatically and the cost is paid from company funds (never below ¥0 — an unaffordable treatment waits for the next day).`,`ตั้งค่าเดียวทั้งค่าย: เมมเบอร์ อันเดอร์ และเด็กฝึกทุกทีมทุกวง (ตอนนี้ ${L.length} คน) การฟื้นตัวตามธรรมชาติเกิดทุกวันทั้งตอนเปิดและปิด เมื่อเปิด เมมเบอร์ที่ค่าต่ำกว่า ${MC.th} ตอนจบวันจะได้รับการรักษาอัตโนมัติ จ่ายจากเงินบริษัท (ไม่ติดลบ — ถ้าเงินไม่พอจะรอวันถัดไป)`)}</p>
 <div class="tw"><table class="mct"><tr><th>${MC_T('Stat','ค่า')}</th><th>${MC_T('Natural recovery','ฟื้นตัวตามธรรมชาติ')}</th><th>${MC_T('Treated when','รักษาเมื่อ')}</th><th>${MC_T('Treatment','การรักษา')}</th><th>${MC_T('Cost / member','ค่ารักษา/คน')}</th><th>${MC_T('Treatments','ครั้งที่รักษา')}</th><th>${MC_T('Below now','ต่ำกว่าตอนนี้')}</th></tr>${MC_K.map(row).join('')}</table></div>
 <div class="fbkv">${[[MC_T('Status','สถานะ'),C.on?MC_T('ON','เปิด'):MC_T('OFF','ปิด')],[MC_T('Total spent','ค่าใช้จ่ายรวม'),yen(C.spent)],[MC_T('Treatments','จำนวนการรักษา'),C.cnt.en+C.cnt.mh+C.cnt.ph]].map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('')}</div></div>
 <div class="c"><h3>${MC_T('Treatment history','ประวัติการรักษา')}</h3>${C.log.length?`<ul class="ms mclog">${C.log.slice(0,40).map(d=>`<li><b>${jd(d.d)}</b> · ${yen(d.cost)}${d.skip?` · <span class="thwarn">${MC_T(`${d.skip} skipped (money)`,`ข้าม ${d.skip} (เงินไม่พอ)`)}</span>`:''}<div class="st">${d.t.map(([id,k,a,b])=>`${esc((get(id)||(S.alumni||[]).find(x=>x.id==id)||{}).name||'#'+id)} ${n(k)} ${a}→${b}`).join(' · ')||'—'}</div></li>`).join('')}</ul>`:`<p class="st">${MC_T('No automatic treatment yet.','ยังไม่มีการรักษาอัตโนมัติ')}</p>`}</div>`};
(function(){try{const M=SECS.find(s=>s.k=='members');if(M&&!M.v.some(x=>x[0]=='care'))M.v.push(['care','Automatic Member Care']);if(typeof SC_VIEW!='undefined')SC_VIEW.care=SC_VIEW.care||'office';if(typeof SUBLOC!='undefined')SUBLOC.care='Medical Office · Automatic Member Care'}catch(e){console.error(e)}})();
// the member profile points to it (the old per-member recovery buttons are gone)
if(typeof wlProfHtml=='function'){const f=wlProfHtml;wlProfHtml=function(m){let h=f.apply(this,arguments);try{h=h.replace('<div class="row wlact">',`<p class="st">🩺 ${MC_T(`Recovery: Energy +${MC.nat.en}, Mental +${MC.nat.mh}, Physical +${MC.nat.ph} every day; Automatic Member Care (${mcS().on?'ON':'OFF'}) treats any stat below ${MC.th}.`,`การฟื้นตัว: พลังงาน +${MC.nat.en} สุขภาพจิต +${MC.nat.mh} สุขภาพกาย +${MC.nat.ph} ทุกวัน · ดูแลเมมเบอร์อัตโนมัติ (${mcS().on?'เปิด':'ปิด'}) รักษาเมื่อค่าใดต่ำกว่า ${MC.th}`)} <button class="b s" onclick="goView('care')">${MC_T('Open','เปิด')}</button></p><div class="row wlact">`)}catch(e){console.error(e)}return h}}

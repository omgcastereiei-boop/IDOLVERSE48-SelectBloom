// =====================================================================================
//  Single release follow-up: announcement in the history, Release Day, Limited stock, Handshake,
//  election ceremony date
// -------------------------------------------------------------------------------------
//  · Discography: the Senbatsu announcement of each single (lists by group / team) can be opened again.
//  · Release Day: the player chooses the Release / Launch Day (at least the usual production time
//    ahead — production still takes CFG.prodDays days). Theater shows of the group on that day are
//    cancelled; other activities that clash with a member's schedule block the date.
//  · Limited Quantity editions keep selling (a slow tail never stops) until they are sold out.
//  · Handshake / Hi-Touch: tickets = CDs sold up to Day 2 of the event (Day 2 is recalculated).
//  · General Election: the Ranking Announcement Ceremony (date and venue) must be chosen before the
//    election single is released; it is booked automatically when voting closes. That single's
//    Handshake / Hi-Touch moves to the weekend after the ceremony.
// =====================================================================================
// ---- 1. the announcement in the single's history ----------------------------------------------------------------------
function seAnnOpen(i){const x=S.singles[i];if(!x||!x.ann)return toast('No announcement was recorded for this single.','err');const pd=CFG.prodDays||28;
 ui.mod={t:'html',h:plAnnounce({title:x.title,num:x.num,ann:x.ann,startDay:x.relDay-pd,releaseDay:x.relDay,id:x.pid})};render()}
{const f=showEds;showEds=function(i){f.apply(this,arguments);try{const x=S.singles[i];if(x&&x.ann&&ui.mod&&ui.mod.t=='html')ui.mod.h=ui.mod.h.replace('</h2>',`</h2><div class="row"><button class="b s p" onclick="seAnnOpen(${i})">📣 Senbatsu announcement</button></div>`)}catch(e){console.error(e)}}}
// ---- 2. Release Day ----------------------------------------------------------------------------------------------------
const seRelMin=()=>S.day+(CFG.prodDays||28);
function seRelMembers(p){return[...new Set((typeof usedSongs=='function'?usedSongs(p):[p.mainId]).flatMap(i=>(S.songs[i]&&S.songs[i].slots||[]).filter(Boolean)))]}
function seRelConf(p,d){const out=[];seRelMembers(p).forEach(id=>{const m=get(id);if(!m)return;busy(id,[d]).filter(e=>!(p.id&&e.pid==p.id)).forEach(e=>out.push(`${m.name}: ${e.title||e.type} (${jd(d)})`))});return[...new Set(out)]}
function seRelShows(d){try{return thKeys().filter(K=>K.gid==gsAg()).flatMap(K=>thShowsOf(K.key).filter(x=>x.st=='sched'&&x.day==d).map(x=>({x,K})))}catch(e){return[]}}
function seRelSet(v){const p=S.pj;if(!p||p.status!='draft')return;const d=dateDay(new Date(v+'T00:00:00'));if(!Number.isFinite(d))return;if(d<seRelMin())return toast(`Production takes ${CFG.prodDays} days: the earliest Release Day is ${jd(seRelMin())}.`,'err');p.relPick=d;render()}
function seRelCard(p){if(!p||p.status!='draft')return'';const d=seRel(p),C=seRelConf(p,d),SH=seRelShows(d);
 return`<div class="c serel"><h3>Release / Launch Day</h3><p class="st">Production takes ${CFG.prodDays} days. Choose the day the single goes on sale and its launch event is held (earliest ${jd(seRelMin())}).</p><label class="st">Release Day <input type="date" min="${thDateStr(seRelMin())}" value="${thDateStr(d)}" onchange="seRelSet(this.value)"></label> <b>${jd(d)}</b>
 ${SH.length?`<p class="st">⚠ ${SH.length} Theater performance(s) that day (${SH.map(z=>esc(z.K.label)+' '+TH_SLOT[z.x.sl]).join(', ')}) will be cancelled.</p>`:''}${C.length?`<div class="c geerr"><b>Members are busy that day:</b><ul class="ms">${C.slice(0,6).map(c=>`<li>${esc(c)}</li>`).join('')}</ul>Choose another day.</div>`:''}</div>`}
{const f=reqs;reqs=function(p){const r=f.apply(this,arguments);try{if(p&&p.status=='draft'){if(p.relPick!=null&&p.relPick<seRelMin())r.push(`Release Day ${jd(p.relPick)} is too early now (earliest ${jd(seRelMin())}): choose it again.`);const C=seRelConf(p,seRel(p));if(C.length)r.push(`Release Day ${jd(seRel(p))}: ${C[0]}`)}}catch(e){console.error(e)}return r}}
{const f=startSingle;startSingle=function(){const p=S.pj,was=p&&p.status,pick=p&&p.relPick;const r=f.apply(this,arguments);try{if(p&&was=='draft'&&p.status=='producing'&&pick!=null&&pick>p.releaseDay){const old=p.releaseDay,dd=pick-old;p.releaseDay=pick;if(S.prod)S.prod.left=pick-S.day;
  (S.cal||[]).forEach(e=>{if(e.done||e.pid!=p.id)return;if(e.day==old){e.day=pick;if(e.day2!=null)e.day2+=dd}});if(p.hs&&hsOn(p))try{hsSched2(p,null)}catch(e){}}
  if(p&&was=='draft'&&p.status=='producing')seRelShows(p.releaseDay).forEach(({x})=>{x.st='cancel';x.why=`Release Day of “${p.title}”`})}catch(e){console.error(e)}return r}}
// shows added later on the Release Day are cancelled too
{const f=thPerform;thPerform=function(x){try{if(x&&x.st=='sched'&&S.pj&&S.pj.status=='producing'&&S.pj.releaseDay==x.day){const K=thKeys().find(k=>k.key==x.k);if(K&&K.gid==gsAg()){x.st='cancel';x.why=`Release Day of “${S.pj.title}”`;return}}}catch(e){}return f.apply(this,arguments)}}
{const f=V.music;V.music=function(){let h=f.apply(this,arguments);try{const p=S.pj;if(p&&p.status=='draft'&&!(plAlb&&plAlb(p))){const c=seRelCard(p),i=h.indexOf('<div class="c sesale">');h=i>=0?h.slice(0,i)+c+h.slice(i):h+c}}catch(e){console.error(e)}return h}}
// ---- 3. Limited Quantity: keeps selling until sold out --------------------------------------------------------------
seCurve=function(t){if(t<0)return 0;if(t==0)return .55;if(t<7)return .45*IND_D[t-1];return Math.max(.0004,.12*Math.pow(.6,Math.floor(t/7)-1)/7)};
{const f=seDay;seDay=function(x,d){if(x&&x.sale)x.sale.eds.forEach(e=>{if(e.m=='qty'&&e.st=='ended')e.st='selling'});return f.apply(this,arguments)}}
// ---- 4. Handshake: tickets sold up to Day 2 ----------------------------------------------------------------------------
{const f=hsRun2;hsRun2=function(ev,part){const x=ev&&S.singles.find(s=>s.rid==ev.rid);try{if(x&&x.sale&&typeof seDay=='function')seDay(x,S.day)}catch(e){}
 if(part==2&&x&&ev.plan&&!ev.r2){try{const T0=ev.plan.tickets||0,T1=(x.cd&&x.cd.tickets)||0;if(T1>T0){const N=hsGo(ev,x),P=ev.plan;P.rows.forEach(r=>{const n=N.rows.find(z=>z.mid==r.mid);if(n){r.g2=Math.max(r.g2,n.gain-r.g1);r.gain=r.g1+r.g2}});Object.assign(P,{tickets:N.tickets,want:N.want,red:Math.max(P.red,N.red),att:Math.max(P.att,N.att),lost:N.lost,orders:N.orders,cds:N.cds,t2:1})}}catch(e){console.error(e)}}
 return f.apply(this,arguments)}}
// ---- 5. General Election: ceremony chosen before the election single is released ---------------------------------------
function geCerPlanHtml(e){const p=S.pj;if(!e||!p||p.ge!=e.id||p.status!='producing')return'';const vE=geEnd(p.releaseDay),D=[];for(let d=vE+1;d<=vE+70;d++)if(geIsWE(d))D.push(d);const P=e.cerPlan||{};
 return`<div class="c gesched"><h3>Ranking Announcement Ceremony</h3><p class="st">Choose the ceremony now — before the election single is released. Voting closes ${longDate(vE)}; the ceremony is booked automatically then (venue paid at booking). The single's Handshake / Hi-Touch takes place the weekend after the ceremony.</p>
 <div class="row"><label class="st">Date <select onchange="geCerPlanSet('day',this.value)"><option value="">Choose…</option>${D.map(d=>`<option value="${d}" ${d==P.day?'selected':''}>${dayDate(d).toLocaleDateString('en-US',{weekday:'short'})}, ${longDate(d)}</option>`).join('')}</select></label><label class="st">Venue <select onchange="geCerPlanSet('ven',this.value)"><option value="">Choose…</option>${GE_VEN.map(z=>`<option value="${z.id}" ${z.id==P.ven?'selected':''}>${esc(z.n)} · ${z.cap.toLocaleString()} seats · ${yen(z.cost)}</option>`).join('')}</select></label></div>${P.day&&P.ven?`<p class="st">✔ ${longDate(P.day)} · ${esc((GE_VEN.find(z=>z.id==P.ven)||{}).n||'')} · Handshake ${longDate(geHsDay(P.day))}</p>`:'<p class="st thwarn">Required before Release Day.</p>'}</div>`}
const geHsDay=c=>{let d=c+1;while(dowOf(d)!=6||d<=c+1)d++;return d};
function geCerPlanSet(k,v){const e=geCur();if(!e)return;e.cerPlan=e.cerPlan||{};e.cerPlan[k]=k=='day'?(+v||null):(v||null);render()}
{const f=readiness;readiness=function(p){const r=f.apply(this,arguments);try{if(p&&p.ge){const e=geGet(p.ge);if(e&&!(e.cerPlan&&e.cerPlan.day&&e.cerPlan.ven))r.push('General Election: choose the Ranking Announcement Ceremony date and venue before the election single is released.')}}catch(x){console.error(x)}return r}}
{const f=V.ge;V.ge=function(){let h=f.apply(this,arguments);try{const e=geCur();if(e&&e.st=='producing'){const c=geCerPlanHtml(e);const i=h.indexOf('<div class="c gecosc">');h=i>=0?h.slice(0,i)+c+h.slice(i):h+c}}catch(x){console.error(x)}return h}}
{const f=V.music;V.music=function(){let h=f.apply(this,arguments);try{const p=S.pj;if(p&&p.ge&&p.status=='producing'){const e=geGet(p.ge);h=geCerPlanHtml(e)+h}}catch(x){console.error(x)}return h}}
// the election single's Handshake / Hi-Touch: the weekend after the ceremony
{const f=doRelease;doRelease=function(){const p=S.pj;let H=null;try{if(p&&p.ge){const e=geGet(p.ge);if(e&&e.cerPlan&&e.cerPlan.day)H={pid:p.id,day:geHsDay(e.cerPlan.day)}}}catch(x){}GE_HSF=H;try{return f.apply(this,arguments)}finally{GE_HSF=null}}}
let GE_HSF=null;
{const f=scheduleHS;scheduleHS=function(o){const ev=f.apply(this,arguments);try{const H=GE_HSF;if(H&&ev&&o&&o.pid==H.pid&&!ev.done&&!ev.r1){ev.day=H.day;ev.day2=H.day+1;ev.geAfter=1}}catch(x){}return ev}}
// voting closes → the planned ceremony is booked automatically
{const f=geClose;geClose=function(e){const r=f.apply(this,arguments);try{if(e&&e.st=='closed'&&e.cerPlan&&e.cerPlan.day&&e.cerPlan.ven&&!e.cer){const d=e.cerPlan.day>S.day?e.cerPlan.day:geDates(e)[0];const g0=[ui.gecd,ui.gecv];ui.gecd=d;ui.gecv=e.cerPlan.ven;const cur=geS().cur;geS().cur=e.id;try{geBook()}finally{ui.gecd=g0[0];ui.gecv=g0[1];geS().cur=cur}}}catch(x){console.error(x)}return r}}

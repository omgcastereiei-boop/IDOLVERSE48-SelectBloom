// =====================================================================================
//  Theater operations & disbanding
// -------------------------------------------------------------------------------------
//  · Revival Stage: only an Original Stage can be revived (a Revival Stage cannot be revived
//    again). Every Revival Stage shows the Stage and team it was revived from.
//  · Trainee Theater with no Trainees left: performances stop. Scheduled performances are
//    cancelled, the active Stage retires and no new performance is scheduled until the group
//    has Trainees and a Stage again.
//  · Final performance & pause: any active Stage can hold a final performance with no next
//    Stage. After it the theater is paused (no performances); it can return later with a new,
//    revived or reused Stage. While paused, online memberships decline every month.
//  · Online membership needs a theater that has performed: a theater that never gave a
//    performance has no subscribers.
//  · Disband Team: its members become Regular Members (full members of the group with no team).
//  · Disband Group (sister groups only): each member moves to another group or graduates.
// =====================================================================================
const thOpsEver=key=>{try{const T=S.th&&S.th.T[key];return!!(T&&(T.no|0))||thS().pf.some(p=>p.k==key)||Object.values(thS().st).some(s=>s.k==key&&s.no)}catch(e){return false}};
const thOpsPaused=T=>!!T&&T.finEnd!=null&&!T.active&&!T.trans;
const thTrCnt=key=>thAllK(()=>thPool(key).filter(m=>m.status=='trainee').length);
const thRevSrc=s=>s&&(s.revOf||s.adopted)?true:false;
function thRevTxt(s){if(!s)return'';const r=s.revOf||{},k=r.k||s.srcK,no=r.no||s.srcNo,nm=r.name||((thStage(s.src)||{}).name)||'';if(!k&&!nm)return'';const lab=typeof thLabelAny=='function'?thLabelAny(k):thLabel(k);return`Revival of ${esc(lab)}${no?' '+ordN(no)+' Stage':''}${nm?' “'+esc(nm)+'”':''}`}

// ---- 1. Revival: original Stages only -----------------------------------------------------------------------------
{const f=thRevival;thRevival=function(sid){const src=thStage(sid);if(src&&thRevSrc(src)){const o=src.revOf&&thStage(src.revOf.sid);return toast(`“${src.name}” is a Revival Stage and cannot be revived. Only an Original Stage can be revived${o?` — revive “${o.name}” instead`:''}.`,'err')}return f.apply(this,arguments)}}
thAdopt=thRevival;
// Stage Management: Revival tag says where the Stage came from
{const f=V.thstage;V.thstage=function(){let h=f.apply(this,arguments);try{h=h.replace('<div class="c threv"><h3>Revival Stage</h3>','<div class="c threv"><h3>Revival Stage</h3><p class="st thokc">Only Original Stages can be revived — a Revival Stage cannot be revived again.</p>')}catch(e){console.error(e)}return h}}
// archive: "REVIVAL" tag + source
{const f=V.tharch;if(f)V.tharch=function(){let h=f.apply(this,arguments);try{Object.values(thS().st).filter(s=>s.revOf).forEach(s=>{const t=thRevTxt(s);if(!t)return;h=h.split(`onclick="thOpenStage('${s.id}')"><span class="tag threvt">REVIVAL</span>`).join(`onclick="thOpenStage('${s.id}')"><span class="tag threvt" title="${t.replace(/"/g,'&quot;')}">REVIVAL</span><small class="st threvf">${t}</small>`)})}catch(e){console.error(e)}return h}}
// Stage page banner and performance schedule rows
{const f=V.thset;V.thset=function(){let h=f.apply(this,arguments);try{const s=thEd();if(s&&s.revOf){const t=thRevTxt(s);h=h.replace(/(<div class="row threvb"><span class="tag threvt">REVIVAL STAGE<\/span><span class="st">)Based on [^—]*—/,`$1${t} —`)}
 if(s&&s.finAuto&&s.finAuto.man&&s.status=='active')h=h.replace(/<div class="row thfin"><span class="tag warn">FINAL PERFORMANCE<\/span><span class="st">[^<]*<\/span><\/div>/,`<div class="row thfin"><span class="tag warn">FINAL PERFORMANCE</span><span class="st">${jd(s.finAuto.day)} · ${TH_SLOT[s.finAuto.sl]} — no next Stage: the theater pauses after this performance.</span></div>`)}catch(e){console.error(e)}return h}}

// ---- 2. Trainee Theater with no Trainees ---------------------------------------------------------------------------
function thStopTheater(key,why,note){const T=thOf(key),s=thStage(T.active);let n=0;thShowsOf(key).forEach(x=>{if(x.st=='sched'&&x.day>=S.day){x.st='cancel';x.why=why;n++}});
 if(s&&s.status=='active'){s.status='retired';s.lastDay=S.day;s.final=s.final||S.day;s.runs=s.runs||[];const run=s.runs.at(-1);if(run&&run.to==null)run.to=S.day;delete s.finAuto;T.active=null}
 if(T.trans){const u=thStage(T.trans.stage);if(u&&u.status=='upcoming')u.status='draft';T.trans=null}
 T.finEnd=S.day;T.pause={day:S.day,why,sid:s?s.id:null};if(note)thN(note);return n}
function thTrZero(){if(!S||!S.th)return;try{thAllK(()=>thKeysAll().filter(K=>K.kind=='tr').forEach(K=>{const T=thOf(K.key);if(T.rx)return; // a restructuring transition handles its own final performance
  const s=thStage(T.active),busy=s&&s.status=='active'||T.trans||thShowsOf(K.key).some(x=>x.st=='sched'&&x.day>=S.day);if(!busy||thTrCnt(K.key)>0)return;
  thStopTheater(K.key,'No Trainees left',`<li>🎭 <b>${esc(thLabelAny(K.key))}</b> has no Trainees left${s?`, so “${esc(s.name)}” has ended`:''}. Performances stop until the group has Trainees and a Stage again.</li>`)}))}catch(e){console.error(e)}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);thTrZero();return r}}
{const f=thAdd;thAdd=function(key,d,sl,src){try{if(thTr(key)&&!(S.th.T[key]||{}).rx&&thTrCnt(key)==0)return'There are no Trainees to perform.'}catch(e){}return f.apply(this,arguments)}}
{const f=thTransConfirm;thTransConfirm=function(){try{const k=thCur();if(k&&thTr(k)&&thTrCnt(k)==0)return toast('There are no Trainees to perform this Stage.','err')}catch(e){}return f.apply(this,arguments)}}
// no automatic scheduling while a theater is paused, has no Trainees, or its final performance is set
{const f=thGen;thGen=function(key){try{const T=thOf(key),s=thStage(T.active);if(thOpsPaused(T)||(s&&s.finAuto))return;if(thTr(key)&&!T.rx&&thTrCnt(key)==0)return}catch(e){}return f.apply(this,arguments)}}

// ---- 3. Final performance & pause ----------------------------------------------------------------------------------
const thFinOpts=key=>thShowsOf(key).filter(x=>x.st=='sched'&&x.day>S.day).sort((a,b)=>a.day-b.day||(a.sl=='a'?-1:1));
function thFinSet(){const key=thCur(),T=key&&thOf(key),s=T&&thStage(T.active),id=ui.thfin;if(!s||s.status!='active')return toast('There is no active Stage.','err');if(T.trans)return toast('A Stage transition is already planned.','err');if(T.rx)return toast('A restructuring transition is in progress.','err');
 const L=thFinOpts(key),fin=L.find(x=>x.id==id);if(!fin)return toast('Choose the final performance.','err');const later=L.filter(x=>x!==fin&&(x.day>fin.day||(x.day==fin.day&&fin.sl=='a'&&x.sl=='e')));
 ask(`Hold the final performance of “${s.name}” on ${jd(fin.day)} (${TH_SLOT[fin.sl]})? ${later.length?`${later.length} later performance(s) will be cancelled. `:''}After it, ${thLabel(key)} has no Stage and the theater pauses: no performances, and online memberships decline every month until a Stage returns.`,()=>{
  s.finAuto={on:S.day,show:fin.id,day:fin.day,sl:fin.sl,man:1,cx:later.map(x=>x.id)};fin.fin=1;later.forEach(x=>{x.st='cancel';x.why=`Final performance of “${s.name}” on ${jd(fin.day)}`});ui.thfin=null;
  thN(`<li>🏁 <b>${esc(thLabel(key))}</b> — “${esc(s.name)}” will give its final performance on ${jd(fin.day)}. The theater pauses afterwards.</li>`);toast(`Final performance set for ${jd(fin.day)}.`);render()},'Set final performance')}
function thFinUndo(){const key=thCur(),T=key&&thOf(key),s=T&&thStage(T.active);if(!s||!s.finAuto||!s.finAuto.man)return;const F=s.finAuto,x=thShowsOf(key).find(z=>z.id==F.show);if(x)delete x.fin;
 thShowsOf(key).forEach(z=>{if((F.cx||[]).includes(z.id)&&z.st=='cancel'&&z.day>S.day){z.st='sched';delete z.why}});delete s.finAuto;toast('The final performance plan was cancelled. The Stage continues.');render()}
// a manual final performance pauses the theater
{const f=thPerform;thPerform=function(x){const T0=x&&thOf(x.k),s0=T0&&thStage(T0.active),man=!!(x&&x.fin&&x.st=='sched'&&s0&&s0.finAuto&&s0.finAuto.man&&s0.finAuto.show==x.id);const r=f.apply(this,arguments);
 try{if(man){const T=thOf(x.k);if(!T.active){T.pause={day:x.day,why:'final',sid:s0.id};thN(`<li>⏸ <b>${esc(thLabel(x.k))}</b> is now paused after the final performance of “${esc(s0.name)}”. Create a new Stage, revive one or reuse a retired Stage to bring it back.</li>`)}}}catch(e){console.error(e)}return r}}
// resuming: a new, revived or reused Stage ends the pause and restarts the schedule
const thStSig=k=>Object.values(thS().st).filter(s=>s.k==k).map(s=>s.id+':'+s.status).join(',');
['thNewStage','thRevival','thReuse'].forEach(fn=>{const f=window[fn];if(typeof f!='function')return;window[fn]=function(){const k=thCur(),T=k&&S.th&&S.th.T[k],sig=T&&(T.finEnd!=null||T.pause)?thStSig(k):null;const r=f.apply(this,arguments);
 try{if(sig!=null&&thStSig(k)!=sig){delete T.finEnd;if(T.pause){T.pauseH=T.pauseH||[];T.pauseH.push({...T.pause,to:S.day});delete T.pause}try{thGen(k)}catch(e){}}}catch(e){console.error(e)}return r}});thAdopt=thRevival;
// Stage Management panel
{const f=V.thstage;V.thstage=function(){let h=f.apply(this,arguments);try{const key=thCur();if(!key)return h;const T=thOf(key),s=thStage(T.active);let p='';
 if(thOpsPaused(T)){const P=T.pause||{day:T.finEnd},o=P.sid&&thStage(P.sid);p=`<div class="c thpause"><h3>⏸ Theater paused</h3><p class="st">${esc(thLabel(key))} has had no Stage since ${jd(P.day)}${o?` (final performance of “${esc(o.name)}”)`:''}${P.why=='No Trainees left'?' — there were no Trainees left':''}. No performances are held and online memberships decline every month while paused. Create a new Stage, revive one or reuse a retired Stage to bring the theater back.</p></div>`}
 else if(s&&s.status=='active'&&!T.trans&&!T.rx){if(s.finAuto)p=`<div class="c thpause"><h3>🏁 Final performance</h3><p class="st">“${esc(s.name)}” gives its final performance on <b>${jd(s.finAuto.day)}</b> (${TH_SLOT[s.finAuto.sl]}).${s.finAuto.man?' After it the theater pauses — no next Stage is needed.':''}</p>${s.finAuto.man?'<button class="b s" onclick="thFinUndo()">Cancel the final performance plan</button>':''}</div>`;
  else{const L=thFinOpts(key);p=`<div class="c thpause"><h3>🏁 Final performance &amp; pause</h3><p class="st">End “${esc(s.name)}” with a final performance without a next Stage. The theater then pauses; it can return later with a new, revived or reused Stage, or stay closed. Online memberships decline while it is paused.</p>${L.length?`<div class="row"><select onchange="ui.thfin=this.value"><option value="">Choose the final performance…</option>${L.map(x=>`<option value="${x.id}" ${x.id==ui.thfin?'selected':''}>${thSlotTxt(x)}</option>`).join('')}</select><button class="b s" onclick="thFinSet()">Set final performance</button></div>`:'<p class="st thwarn">No scheduled performance to choose.</p>'}</div>`}}
 if(p){const i=h.indexOf('<div class="c threv">');h=i<0?h+p:h.slice(0,i)+p+h.slice(i)}}catch(e){console.error(e)}return h}}

// ---- 4. Online membership (company-wide, th-online.js): needs performances; stopped theaters lose subscribers ------
const thAnyEver=()=>{try{const H=thS();return H.pf.length>0||Object.values(H.st).some(s=>s.no)||Object.values(H.T||{}).some(T=>T&&(T.no|0))}catch(e){return false}};
function thStopInfo(){const H=thS(),P=[],L=[];Object.entries(H.T||{}).forEach(([k,T])=>{if(!T||!thOpsEver(k))return;const s=thStage(T.active),live=s&&s.status=='active'&&!T.dis&&thAllK(()=>!!thK(k));
  if(live){L.push(k);return}const d=T.dis!=null?T.dis:T.pause?T.pause.day:T.finEnd;if(d!=null&&d>S.day-180)P.push(k)});return{P,L}}
{const f=thMonthly;thMonthly=function(){const M=thMShared(),mk=dt().getFullYear()*12+dt().getMonth();if(M.bill===mk)return f.apply(this,arguments);
 if(!thAnyEver()){const row={mon:mk,pk:{},rev:0,none:1};M.pk.forEach(pk=>{const cur=M.subs[pk.id]|0;row.pk[pk.id]={act:0,new:0,can:cur,rev:0};M.subs[pk.id]=0});M.bill=mk;M.subH.push(row);if(M.subH.length>36)M.subH.shift();Object.values(thS().T||{}).forEach(T=>{T.bill=mk});return}
 const I=thStopInfo(),ex={};if(I.P.length){const sh=I.L.length?.3*I.P.length/(I.P.length+I.L.length):0;M.pk.forEach(pk=>{const cur=M.subs[pk.id]|0;if(!cur)return;const x=I.L.length?Math.round(cur*sh*(.8+Math.random()*.4)):cur-Math.round(cur*(.62+Math.random()*.13));if(x>0){M.subs[pk.id]=cur-x;ex[pk.id]=x}})}
 if(!I.L.length){const row={mon:mk,pk:{},rev:0,pause:1};M.pk.forEach(pk=>{let act=M.subs[pk.id]|0;if(act<3&&act>0){ex[pk.id]=(ex[pk.id]|0)+act;act=0}if(!pk.on){ex[pk.id]=(ex[pk.id]|0)+act;act=0}const rev=act*pk.price;M.subs[pk.id]=act;row.pk[pk.id]={act,new:0,can:ex[pk.id]|0,rev};row.rev+=rev});
  M.bill=mk;M.subH.push(row);if(M.subH.length>36)M.subH.shift();Object.values(thS().T||{}).forEach(T=>{T.bill=mk});if(row.rev)earn(row.rev,`Online Theater Membership (${fbMonName(mk)})`);return}
 const r=f.apply(this,arguments);try{const row=M.subH.at(-1);if(row&&row.mon==mk){for(const k in ex)if(row.pk[k])row.pk[k].can+=ex[k];if(I.P.length)row.stop=I.P.length}}catch(e){}return r}}
// saves: no subscribers before the first performance
function thSubsFix(){try{if(!S||!S.th||thAnyEver())return;const M=thMShared();for(const id in M.subs)M.subs[id]=0}catch(e){console.error(e)}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);thSubsFix();try{if(S&&S.th)thTrZero()}catch(e){}return r}}

// ---- 5. Regular Members (full members without a team) ---------------------------------------------------------------
const isReg=m=>!!m&&m.reg&&isAct(m)&&!m.tid;
{const f=setTeamOf;setTeamOf=function(m,t){if(t&&m){delete m.reg;delete m.regSince}return f.apply(this,arguments)}}
{const f=demoteNow;demoteNow=function(m){if(m){delete m.reg;delete m.regSince}return f.apply(this,arguments)}}
{const f=transferGroup;transferGroup=function(mid){const m=get(mid);if(m){delete m.reg;delete m.regSince}return f.apply(this,arguments)}}
{const f=statusMigrate;statusMigrate=function(){const R=S.members.filter(m=>m.reg&&!m.tid&&(m.status||'active')=='active');R.forEach(m=>m.tid='__reg');try{return f.apply(this,arguments)}finally{R.forEach(m=>{m.tid=null;m.status='active'})}}}
// teamMatch (core): '@reg' filter = Regular Members; Regular Members are not counted as Trainees
{const f=mcardT;mcardT=function(m,g){let h=f.apply(this,arguments);if(!isReg(m))return h;try{h=h.replace(`<span class="tag" style="background:#ffe3a8">${esc(TL())}</span>`,'<span class="tag treg">Regular Member</span>').replace(`>${esc(TL())} since ${m.stSince!=null?jd(m.stSince):''}<`,`>Regular Member since ${jd(m.regSince!=null?m.regSince:S.day)}<`).replace('<option value="prof">Open profile</option>',`<option value="prof">Open profile</option><option value="st">Demote to ${esc(TL())}</option>`).split(' (becomes active)</option>').join('</option>')}catch(e){}return h}}
{const f=evText;evText=function(e){if(!e)return f.apply(this,arguments);if(e.t=='team_disband')return`${esc(e.tname||'Her team')} was disbanded — Regular Member (no team)`;if(e.t=='group_disband')return`${esc(e.gname||'The group')} was disbanded`;if(e.t=='reg_member')return`Became a Regular Member of ${esc(e.gname||'the group')} (no team)`;return f.apply(this,arguments)}}

// ---- 6. Disband Team ------------------------------------------------------------------------------------------------
const disOrgBusy=()=>{try{return orgS().plans.some(p=>['announced','scheduled','confirmed'].includes(p.st))}catch(e){return false}};
function disTheater(key,why,lbl){try{thAllK(()=>{const T=thOf(key),s=thStage(T.active);thStopTheater(key,why);if(s)s.lastDay=S.day;T.dis=S.day;if(lbl)T.lbl=lbl})}catch(e){console.error(e)}}
function teamDisband(gid,tid){const g=grp(gid),t=g&&(g.teams||[]).find(x=>x.id==tid);if(!t)return;if(disOrgBusy())return toast('A Team Restructuring / Shuffle is in progress. Finish it before disbanding a team.','err');
 const M=S.members.filter(m=>m.tid==tid),K=S.members.filter(m=>m.kn&&m.kn.tid==tid),T=S.th&&S.th.T['t'+tid],st=T&&thStage(T.active);
 ask(`Disband ${t.name}? Its ${M.length} member(s) become Regular Members of ${g.name}: full members with no team (they can join another team later).${K.length?` ${K.length} Concurrent Position(s) in ${t.name} end.`:''} ${t.name} Theater stops${st?` — “${st.name}” retires`:''}, scheduled performances are cancelled and online membership subscribers drop. Its Stages stay in the archive and other teams can revive them.`,()=>{
  K.forEach(m=>{try{gsKnEnd(m.id,1,'disband')}catch(e){delete m.kn}});
  M.forEach(m=>{hev(m,{t:'team_disband',tid:t.id,tname:t.name});const tr=toast;toast=()=>{};try{f0(m)}finally{toast=tr}});
  function f0(m){m.tid=null;m.team='—';m.tjoined=null;m.reg=1;m.regSince=S.day;m.status='active'}
  if(g.tl)delete g.tl[tid];g.teams=g.teams.filter(x=>x.id!=tid);S.disT=S.disT||[];S.disT.push({id:t.id,name:t.name,color:t.color,gid,day:S.day,mem:M.map(m=>m.id)});
  disTheater('t'+tid,`${t.name} was disbanded`,`${t.name} (disbanded)`);try{leadFix(true)}catch(e){}if(ui.gt==tid)ui.gt='all';if(ui.thk=='t'+tid)ui.thk=null;
  toast(`${t.name} was disbanded. ${M.length} member(s) are now Regular Members.`);render()},'Disband team')}
// Revival list: Stages of disbanded teams can still be revived
{const f=V.thstage;V.thstage=function(){let h=f.apply(this,arguments);try{const key=thCur();if(!key)return h;const L=Object.values(thS().st).filter(s=>s.no&&!thRevSrc(s)&&S.th.T[s.k]&&S.th.T[s.k].dis&&!thK(s.k));if(!L.length)return h;
 const add=L.map(s=>`<div class="thstc ${s.status}"><span class="thno sm">${ordN(s.no)}</span><b>${esc(s.name)}</b><small>${esc(thLabel(s.k))} · ${s.status}</small><button class="b s p" onclick="thRevival('${s.id}')">✦ Revival Stage</button></div>`).join('');
 const i=h.indexOf('<div class="thsth">',h.indexOf('<div class="c threv">'));return i<0?h:h.slice(0,i+19)+add+h.slice(i+19).replace('<p class="st">No Stage has debuted yet.</p>','')}catch(e){console.error(e);return h}}}
// (reviving a Stage of a disbanded team uses the normal Revival: only the target theater must exist)
thAdopt=thRevival;

// ---- 7. Disband Group -----------------------------------------------------------------------------------------------
const gLive=()=>S.groups.filter(g=>!g.dis);
{const f=thKeys;thKeys=function(){return f.apply(this,arguments).filter(K=>!(grp(K.gid)||{}).dis)}}
{const f=gsSelect;gsSelect=function(gid){const g=grp(+gid);if(g&&g.dis)return toast(`${g.name} was disbanded.`,'err');return f.apply(this,arguments)}}
{const f=chrome;chrome=function(){if(!S||!S.groups.some(g=>g.dis))return f.apply(this,arguments);const all=S.groups;S.groups=all.filter(g=>!g.dis);try{return f.apply(this,arguments)}finally{S.groups=all}}}
{const f=gsCard;gsCard=function(g){if(!g||!g.dis)return f.apply(this,arguments);const D=g.dis;return`<div class="c gscard gsdis" style="--gc:${g.color}"><div class="row">${gsLogo(g,40)}<div style="flex:1;min-width:0"><b class="gsnm">${esc(g.name)}</b><div><span class="tag warn">DISBANDED ${jd(D.day)}</span></div><small class="st">${D.n|0} member(s) at disbanding · ${D.moved|0} moved to other groups · ${D.grad|0} graduated</small></div></div></div>`}}
const gdisMem=gid=>S.members.filter(m=>gsGid(m)==gid&&m.status!='graduated');
const gdisDef=m=>{const mg=gsMain();return mg?`${mg.id}:${isAct(m)&&m.tid?'reg':'tr'}`:'grad'};
function gdisOpts(m,v){const o=[['grad','🎓 Graduate']];gLive().filter(g=>g.id!=gsGid(m)).forEach(g=>{o.push([`${g.id}:tr`,`→ ${g.name} · ${TL()}`]);if(isAct(m))o.push([`${g.id}:reg`,`→ ${g.name} · Regular Member (no team)`]);(g.teams||[]).forEach(t=>o.push([`${g.id}:${t.id}`,`→ ${g.name} · ${t.name}`]))});return o.map(([k,n])=>`<option value="${k}" ${k==v?'selected':''}>${esc(n)}</option>`).join('')}
function gdisHtml(){const D=ui.gdis,g=grp(D.gid),M=gdisMem(g.id);M.forEach(m=>{if(!D.ch[m.id])D.ch[m.id]=gdisDef(m)});const ng=M.filter(m=>D.ch[m.id]=='grad').length;
 return`<h2 class="ht">Disband ${esc(g.name)}</h2><p class="st">Choose for every member: move to another group (as a ${esc(TL())}, a Regular Member or straight into a team) or graduate. Members keep their history, fans and contracts. The group's teams and theaters end (online membership subscribers drop); its records stay in the company history.</p>
 <div class="row"><label class="st">Set everyone to <select onchange="gdisAll(this.value)"><option value="">Choose…</option><option value="grad">🎓 Graduate</option>${gLive().filter(x=>x.id!=g.id).map(x=>`<option value="${x.id}:tr">→ ${esc(x.name)} · ${esc(TL())}</option><option value="${x.id}:reg">→ ${esc(x.name)} · Regular Member (full members)</option>`).join('')}</select></label></div>
 <div class="gdisl">${M.map(m=>{const t=teamOf(m);return`<div class="row gdisr">${ptc(m,34)}<div style="flex:1;min-width:0"><b>${esc(m.name)}</b><div class="st">${t?esc(t.name):isReg(m)?'Regular Member':esc(TL())}${m.kn?' · Concurrent Position ends':''}</div></div><select onchange="ui.gdis.ch[${m.id}]=this.value;ui.mod.h=gdisHtml();render()">${gdisOpts(m,D.ch[m.id])}</select></div>`}).join('')||'<p class="st">No members.</p>'}</div>
 <p class="st">${M.length-ng} move · ${ng} graduate</p><div class="row"><button class="b p" onclick="gdisGo()">Disband ${esc(g.name)}</button><button class="b" onclick="ui.mod=null;ui.gdis=null;render()">Close</button></div>`}
function gdisAll(v){if(!v)return;const D=ui.gdis;gdisMem(D.gid).forEach(m=>{D.ch[m.id]=v=='grad'||!/:reg$/.test(v)||isAct(m)?v:v.replace(/:reg$/,':tr')});ui.mod.h=gdisHtml();render()}
function groupDisband(gid){const g=grp(gid);if(!g||g.dis)return;if(g===gsMain()||g.type=='main')return toast('The Main Group cannot be disbanded.','err');if(disOrgBusy())return toast('A Team Restructuring / Shuffle is in progress. Finish it first.','err');
 const p=gsCtx(gid,'pj');if(p&&p.status=='producing')return toast(`${g.name} has a single in production. Release it before disbanding the group.`,'err');
 ui.gdis={gid,ch:{}};ui.mod={t:'html',h:gdisHtml()};render()}
function gdisGo(){const D=ui.gdis,g=D&&grp(D.gid);if(!g)return;const M=gdisMem(g.id),ng=M.filter(m=>(D.ch[m.id]||gdisDef(m))=='grad').length;
 ask(`Disband ${g.name}? ${M.length-ng} member(s) move to other groups and ${ng} graduate. This cannot be undone.`,()=>{const q0=CTQ.length;let nT=0,nG=0;const tr=toast;toast=()=>{};
  try{if(S.ag==g.id)gsSwitch(gsMain().id);
   S.members.forEach(m=>{if(m.kn&&(m.kn.gid==g.id||gsGid(m)==g.id)){try{gsKnEnd(m.id,1,'disband')}catch(e){delete m.kn}}});
   M.forEach(m=>{const v=D.ch[m.id]||gdisDef(m);hev(m,{t:'group_disband',gid:g.id,gname:g.name});
    if(v=='grad'){m.grad={kind:'grad',reason:'disband',ann:S.day,target:S.day};try{ctComplete(m)}catch(e){console.error(e);try{ctLeave(m)}catch(e2){}}nG++;return}
    const [gs,mode]=v.split(':'),dst=grp(+gs);if(!dst||dst.dis){m.grad={kind:'grad',reason:'disband',ann:S.day,target:S.day};try{ctComplete(m)}catch(e){}nG++;return}
    const full=isAct(m);transferGroup(m.id,dst.id);m.trh=m.trh||[];m.trh.push({day:S.day,from:g.id,to:dst.id,mode,why:'disband'});
    if(mode=='reg'&&full){m.status='active';m.reg=1;m.regSince=S.day;hev(m,{t:'reg_member',gid:dst.id,gname:dst.name})}else if(mode!='tr'&&mode!='reg'){try{moveTeam(m.id,mode)}catch(e){console.error(e)}}nT++});
   const keys=Object.keys(S.th&&S.th.T||{}).filter(k=>k=='tr'+g.id||(g.teams||[]).some(t=>'t'+t.id==k));keys.forEach(k=>disTheater(k,`${g.name} was disbanded`,`${(S.th.T[k].lbl||thLabel(k))} · ${g.name} (disbanded)`));
   g.dis={day:S.day,n:M.length,moved:nT,grad:nG,teams:(g.teams||[]).map(t=>({id:t.id,name:t.name,color:t.color}))};g.teams=[];g.tl={};g.cap=null;try{leadFix(true)}catch(e){}}
  finally{toast=tr}
  CTQ.splice(q0);ui.gdis=null;ui.g=gsMain().id;ui.mod={t:'html',h:`<h2 class="ht">${esc(g.name)} was disbanded</h2><p>${nT} member(s) moved to other groups · ${nG} graduated.</p><p class="st">The Main Group and the other groups continue. ${esc(g.name)}'s records stay in the company history.</p><button class="b p" onclick="ui.mod=null;render()">OK</button>`};render()},'Disband group')}
// Groups page: disband buttons, Regular Members section; disbanded groups listed apart
{const f=V.groups;V.groups=function(){if(!S)return f.apply(this,arguments);const all=S.groups,dis=all.filter(g=>g.dis);if(grp(ui.g)&&grp(ui.g).dis)ui.g=gsMain().id;let h;S.groups=all.filter(g=>!g.dis);try{h=f.apply(this,arguments)}finally{S.groups=all}
 try{const g=grp(ui.g)||gsMain();if(!g)return h;(g.teams||[]).forEach(t=>{const b=`<button class="b s" onclick="ui.mod={t:'addm',gid:${g.id},tid:'${t.id}'};render()">+ Add Member</button>`;h=h.replace(b,b+`<button class="b s warn" onclick="teamDisband(${g.id},'${t.id}')">Disband team</button>`)});
  if(g!==gsMain()&&g.type!='main'){const b=`onclick="renameGroup(${g.id},$('#gnm').value)">Rename group</button>`;h=h.replace(b,b+`<button class="b s warn" onclick="groupDisband(${g.id})">Disband group</button>`)}
  const R=S.members.filter(m=>m.group==g.id&&isReg(m)),gt=ui.gt||'all';if(R.length&&(gt=='all'||gt=='@trainee')){const sec=`<div class="c treg-sec" style="margin-top:10px"><h3>Regular Members (${R.length})</h3><p class="st">Full members of ${esc(g.name)} with no team (their team was disbanded). Add them to a team from Actions or their profile.</p><div class="g">${R.map(m=>mcardT(m,g)).join('')}</div></div>`;const i=h.indexOf('<div class="c" style="margin-top:12px"><h3>Recruitment</h3>');h=i<0?h+sec:h.slice(0,i)+sec+h.slice(i)}
  if(dis.length){const sec=`<div class="c" style="margin-top:10px"><h3>Disbanded groups</h3>${dis.map(x=>`<div class="st">${esc(x.name)} — disbanded ${jd(x.dis.day)} · ${x.dis.moved|0} moved · ${x.dis.grad|0} graduated</div>`).join('')}</div>`;const i=h.indexOf('<div class="c" style="margin-top:12px"><h3>Recruitment</h3>');h=i<0?h+sec:h.slice(0,i)+sec+h.slice(i)}}catch(e){console.error(e)}return h}}

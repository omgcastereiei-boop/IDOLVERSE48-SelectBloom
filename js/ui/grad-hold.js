// =====================================================================================
//  IDOLVERSE48: Select Bloom! — a graduating member stays until her single is out (and its election single sold)
// -------------------------------------------------------------------------------------
//  · A member who takes part in a single that is still in production never graduates before its release.
//  · A member who takes part in a General Election single stays until that single's CD sales are over
//    (all editions closed / sold out) — e.g. a member who announced her graduation during the election.
//    Her graduation (Graduation Stage, last day, contract end…) waits and happens automatically on the first day
//    nothing holds her any more. Dismissals are not held.
//  · Repair: members who graduated while their election single was in production come back until it is released
//    and sold, and take their empty positions again.
// =====================================================================================
const GH_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
const ghSongs=x=>[x.mainId,...(x.coup||[]),...((x.tracks||[]).map(t=>t&&t.id))].filter(Boolean);
const ghSelling=x=>!!(x&&x.sale&&(x.sale.eds||[]).some(e=>e.st=='selling'||e.st=='open'||e.st=='upcoming'));
// what keeps her: singles in production she sings in; election singles of hers still on sale
function ghHolds(m){const out=[];if(!m)return out;(S.groups||[]).forEach(g=>{try{gsWith(g.id,()=>{const p=S.pj,inS=ids=>ids.some(i=>((S.songs[i]||{}).slots||[]).includes(m.id)||(((S.songs[i]||{}).fm||{}).sl||[]).some(z=>z&&z.m==m.id));
  if(p&&(p.status=='producing'||(p.status=='draft'&&p.ge))&&inS(usedSongs(p)))out.push({k:'rel',t:p.title||'',gid:g.id});
  (S.singles||[]).forEach(x=>{if(x.ge&&ghSelling(x)&&inS(ghSongs(x)))out.push({k:'sale',t:x.title||'',gid:g.id})})})}catch(e){console.error(e)}});return out}
const ghTxt=h=>h.k=='rel'?GH_T(`release of “${h.t}”`,`การปล่อยซิงเกิล “${h.t}”`):GH_T(`CD sales of “${h.t}”`,`การขายซีดี “${h.t}”`);
{const f=ctComplete;ctComplete=function(m,o){o=o||{};try{const G=m&&m.grad;if(G&&G.kind!='dismiss'&&!o.dismiss&&!o.ghForce){const H=ghHolds(m);if(H.length){const first=!G.hold;G.hold={since:(G.hold&&G.hold.since)||S.day,o:{...o},L:H.map(ghTxt)};
   if(first)CTQ.push(`<div class="ctbd">🎓 ${esc(GH_T(`${m.name} stays until the ${H.map(ghTxt).join(' and ')} is over, then graduates.`,`${m.name} จะอยู่ต่อจนกว่า${H.map(ghTxt).join(' และ ')}จะจบ แล้วจึงจบการศึกษา`))}</div>`);return null}}}catch(e){console.error(e)}return f.apply(this,arguments)}}
// the graduation window waits too (her last day is not reached while something holds her)
{const f=oblState;oblState=function(m){const r=f.apply(this,arguments);try{if(m&&m.grad&&m.grad.kind!='dismiss'){const H=ghHolds(m);if(H.length){r.pend=true;H.forEach(h=>r.L.push({t:ghTxt(h),day:null,done:false}))}}}catch(e){console.error(e)}return r}}
// the day nothing holds her any more, she graduates as planned
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(S&&S.members)S.members.slice().forEach(m=>{const G=m.grad;if(!G||!G.hold||!S.members.includes(m))return;if(ghHolds(m).length)return;const o={...(G.hold.o||{}),ghForce:1};delete G.hold;ctComplete(m,o)})}catch(e){console.error(e)}return r}}
// ---- repair: members who graduated during their election single's production come back -------------------------------------
function ghRepair(){let n=0;if(!S||!S.groups)return 0;(S.groups||[]).forEach(g=>{try{gsWith(g.id,()=>{const p=S.pj;if(!p||!(p.status=='producing'||p.status=='draft')||!p.ge)return;const e=typeof geGet=='function'?geGet(p.ge):null;if(!e||!e.final||!e.final.rows)return;
  const from=e.vStart??p.startDay??0,rk=new Map(e.final.rows.filter(r=>r.rank).map(r=>[r.id,r.rank]));
  const seats=usedSongs(p).reduce((a,i)=>a+((((S.songs[i]||{}).fm||{}).sl||[]).length),0);
  const back=(S.alumni||[]).filter(m=>m&&rk.has(m.id)&&rk.get(m.id)<=seats&&m.dep&&m.dep.kind=='grad'&&(m.gradDay??0)>=from).sort((a,b)=>rk.get(a.id)-rk.get(b.id));if(!back.length)return;
  back.forEach(m=>{const d=m.dep,tl=[...(m.mh||[])].reverse().find(h=>h.t=='team_leave'&&h.day>=(m.gradDay??0)-1),t=tl&&(g.teams||[]).find(x=>x.id==tl.tid);
   S.alumni=S.alumni.filter(x=>x!==m);if(!S.members.includes(m))S.members.push(m);m.status=t?'active':'trainee';try{if(t)setTeamOf(m,t)}catch(x){m.tid=t.id;m.team=t.name}
   m.grad={kind:'grad',reason:d.reason,ann:d.ann,target:d.target,early:d.early,fee:d.fee||0,songs:d.songs||[],singles:d.singles||[],obl:{ev:[],pj:[],ge:[]},hold:{since:S.day,o:{},L:[]}};delete m.dep;delete m.gradDay;delete m.career;
   try{if(m.ct&&m.ct.end<S.day+1)m.ct.end=S.day+90}catch(x){}hev(m,{t:'grad_hold',txt:'Returned until her election single is released and sold'});n++});
  // her empty positions: the songs of the single take her back (by election rank)
  usedSongs(p).forEach(i=>{const o=S.songs[i];if(!o||!o.fm||!o.fm.sl)return;const empty=o.fm.sl.filter(z=>!z.m);if(!empty.length)return;const have=new Set(o.fm.sl.map(z=>z.m).filter(Boolean));const ord=slotOrder(o.fm).map(k=>o.fm.sl[k]).filter(z=>!z.m);
   back.filter(m=>!have.has(m.id)).forEach((m,k)=>{if(ord[k])ord[k].m=m.id});try{fmSync(o,!fmCheck(o).length)}catch(x){console.error(x)}});
  if(back.length)CTQ.push(`<div class="ctbd">🎓 ${esc(GH_T(`${back.map(m=>m.name).join(', ')} stay${back.length==1?'s':''} until “${p.title}” is released and its CDs are sold, then graduate${back.length==1?'s':''}.`,`${back.map(m=>m.name).join(', ')} จะอยู่ต่อจนปล่อย “${p.title}” และขายซีดีจบ แล้วจึงจบการศึกษา`))}</div>`)})}catch(e){console.error(e)}});try{if(n&&typeof leadFix=='function')leadFix(true)}catch(e){}return n}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{const n=ghRepair();if(n)console.log('graduation hold repair:',n)}catch(e){console.error(e)}return r}}
// ---- a sister group's single whose Title Track comes from the Main Group election: members already reacted at the
//      ceremony, so the Title Track is only recorded; reactions are given for the Coupling Songs only -------------------------
{const f=wlReact;wlReact=function(p){if(!p||!p.geSub||p.geNext||typeof wlPositions!='function')return f.apply(this,arguments);const P0=wlPositions,cp=new Set();
 try{sr2Songs(p).forEach(o=>{if(o&&o.id!=p.mainId)sr2Pos(o).forEach((pos,id)=>cp.add(+id))})}catch(e){console.error(e)}
 wlPositions=function(pp){const M=P0.apply(this,arguments);if(!M||pp!==p)return M;const R=new Map(),title=String(p.title||'').trim();M.forEach((pos,id)=>{if(pos!='none'){const m=get(id);if(m)try{wlRecord(m,pos,p.id,title,S.day)}catch(e){}return}if(cp.has(+id))R.set(id,pos)});return R};
 try{return f.apply(this,arguments)}finally{wlPositions=P0}}}
// ---- history of a single: a member of another (sister) group is shown in HER group's profile costume of that time ----------------
const HX_RIDG=new Map();function hxRidGid(rid){if(rid==null)return null;if(HX_RIDG.has(rid))return HX_RIDG.get(rid);let g=null;try{(S.groups||[]).some(G=>{const L=gsCtx(G.id,'singles')||[];if(L.some(x=>x.rid==rid)){g=G.id;return true}return false})}catch(e){}if(HX_RIDG.size>3000)HX_RIDG.clear();HX_RIDG.set(rid,g);return g}
if(typeof apEff=='function'){const f=apEff;apEff=function(m){const a=f.apply(this,arguments);try{const A=typeof HX_AT!='undefined'?HX_AT:null;if(!A||!m||m._x||A.day==null)return a;const own=typeof gsGid=='function'?gsGid(m):m.group,cur=typeof gsAg=='function'?gsAg():null;if(own==null||own==cur)return a;
  const L=[...(m.czHist||[]),...(m.profCz?[m.profCz]:[])].filter(z=>z&&z.p&&(z.day??0)<=A.day);if(A.rid!=null&&L.some(z=>z.rid==A.rid))return a;
  const mine=L.filter(z=>z.rid==null?z.kind!='single':hxRidGid(z.rid)==own).sort((p,q)=>(q.day??0)-(p.day??0))[0];if(mine)return{...a,cd:mine.p}}catch(e){}return a}}

// ---- last resort: an election single can always be released. A position left empty by a member who cannot come back
//      (dismissed, or no record left) is taken by the best-ranked election participant who is not in the single yet;
//      if nobody is left, by the best eligible member. --------------------------------------------------------------
const ghGeSong=o=>!!(o&&(o.ge||o.geSub));
function ghGePj(p){try{return!!(p&&(p.ge||p.geSub||usedSongs(p).some(i=>ghGeSong(S.songs[i]))))}catch(e){return false}}
function ghFill(gid){let n=0;const run=()=>{const p=S.pj;if(!ghGePj(p)||!(p.status=='producing'||p.status=='draft'))return;const s0=usedSongs(p).map(i=>S.songs[i]).find(o=>o&&o.ge),eid=p.ge||(s0&&s0.ge&&s0.ge.eid);let e=null;try{e=typeof geGet=='function'&&eid?geGet(eid):null}catch(x){}
  if(!e&&eid)try{(S.groups||[]).some(g=>{const L=(gsCtx(g.id,'ge')||{}).list||[];e=L.find(z=>z.id==eid)||null;return!!e})}catch(x){}
  const songs=usedSongs(p).map(i=>S.songs[i]).filter(o=>o&&o.fm&&o.fm.sl);const used=new Set(songs.flatMap(o=>o.fm.sl.map(z=>z.m).filter(Boolean)));
  const ok=m=>m&&S.members.includes(m)&&m.status!='graduated'&&!(m.grad&&!m.grad.hold&&m.grad.kind=='dismiss');
  const ranked=((e&&e.final&&e.final.rows)||[]).filter(r=>r.rank).sort((a,b)=>a.rank-b.rank).map(r=>get(r.id)).filter(ok);
  songs.forEach(o=>{const ord=slotOrder(o.fm).map(k=>o.fm.sl[k]).filter(z=>!z.m||!ok(get(z.m)));if(!ord.length)return;const E=new Set(elig(o).map(m=>m.id));
   ord.forEach(z=>{const c=ranked.find(m=>!used.has(m.id)&&E.has(m.id))||elig(o).filter(m=>!used.has(m.id)).sort((a,b)=>b.pop-a.pop)[0];if(!c)return;z.m=c.id;used.add(c.id);n++;try{hev(c,{t:'ge_fill',txt:`Took an empty position in “${p.title||o.title}” (election single)`})}catch(x){}});
   // nobody left to take it: the empty position is removed (an election single's lineup cannot be edited by hand)
   const left=o.fm.sl.filter(z=>!z.m||!ok(get(z.m)));if(left.length){o.fm.sl=o.fm.sl.filter(z=>z.m&&ok(get(z.m)));const rows=[...new Set(o.fm.sl.map(z=>z.r))].sort((a,b)=>a-b);
    o.fm.sl.forEach(z=>{z.r=rows.indexOf(z.r)});rows.forEach((_,r)=>o.fm.sl.filter(z=>z.r==r).sort((a,b)=>a.i-b.i).forEach((z,i)=>{z.i=i}));try{fmRenum(o.fm.sl)}catch(x){}
    o.fm.size=o.fm.sl.length;o.fm.nc=o.fm.sl.filter(z=>z.c).length;o.fm.ge0=1;n+=left.length}
   try{fmSync(o,true)}catch(x){console.error(x)}});
  if(n){try{if(typeof syncSaved=='function')syncSaved()}catch(x){}CTQ.push(`<div class="ctbd">${esc(GH_T(`An empty position in “${p.title}” was filled by the next election ranking, so the single can be released.`,`ตำแหน่งว่างใน “${p.title}” ได้คนจากอันดับเลือกตั้งถัดไปมาแทนแล้ว ปล่อยซิงเกิลได้ตามปกติ`))}</div>`)}};
 try{gid==null?(S.groups||[]).forEach(g=>gsWith(g.id,run)):gsWith(gid,run)}catch(e){console.error(e)}return n}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{ghFill()}catch(e){console.error(e)}return r}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{ghFill()}catch(e){console.error(e)}return r}}
{const f=startSingle;startSingle=function(){return f.apply(this,arguments)}}

// an election single never waits for positions nobody can fill
{const f=fmCheck;fmCheck=function(o){const r=f.apply(this,arguments);try{const p=S.pj;if(o&&(ghGeSong(o)||(ghGePj(p)&&usedSongs(p).includes(o.id))))return r.filter(x=>!/still empty|Invalid Senbatsu size|Invalid number of centers|Center slots do not match/.test(x))}catch(e){}return r}}
{const f=reqs;reqs=function(p){const r=f.apply(this,arguments);try{if(ghGePj(p))return r.filter(x=>!/position\(s\) still empty|Invalid Senbatsu size|save the lineup|Center slots do not match|Invalid number of centers/.test(x))}catch(e){}return r}}

// release readiness: an election song is ready once its lineup is filled (or reduced) — never waits for an impossible position
{const f=readiness;readiness=function(p){return f.apply(this,arguments)}}
// the planning page builds its own check list: run the repair before every render of the music page
{const f=V.music;V.music=function(){return f.apply(this,arguments)}}

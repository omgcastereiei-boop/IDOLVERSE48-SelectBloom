// =====================================================================================
//  IDOLVERSE48: Select Bloom! — faster days on big saves
// -------------------------------------------------------------------------------------
//  · Schedule checks (who is busy on a day) are asked for every member before every Theater performance;
//    while a day is being played they are answered from a per-day table, rebuilt after every performance
//    and whenever the schedule list changes.
//  · Birthday photos kept their drawn pictures inside the save (megabytes): the drawings are now a cache
//    that is not saved (they are redrawn when opened); old saves are cleaned on load.
// =====================================================================================
let PD_IN=0,PD_C=null;
const pdSig=()=>{try{const sc=S.sched&&S.sched.res;return S.day+'|'+(sc?sc.length:0)}catch(e){return String(Math.random())}};
{const f=gsCommits;gsCommits=function(mid,from,to){if(!PD_IN||from==null||from!==to)return f.apply(this,arguments);const sig=pdSig();if(!PD_C||PD_C.sig!==sig)PD_C={sig,M:new Map()};const k=mid+'|'+from;
  if(!PD_C.M.has(k))PD_C.M.set(k,f.apply(this,arguments));return PD_C.M.get(k).map(c=>({...c}))}}
{const f=tick;tick=function(){const o=PD_IN;PD_IN=1;PD_C=null;try{return f.apply(this,arguments)}finally{PD_IN=o;PD_C=null}}}
{const f=thPerform;thPerform=function(){try{return f.apply(this,arguments)}finally{PD_C=null}}}
// birthday photo drawings are not part of the save
function pdStripBd(){try{const clean=o=>{if(o&&o.img&&typeof o.img=='object'&&Object.prototype.propertyIsEnumerable.call(o.img,'_c'))delete o.img._c};
  ((S.th&&S.th.pf)||[]).forEach(r=>clean(r.sp));[...(S.members||[]),...(S.alumni||[])].forEach(m=>(m.bdh||[]).forEach(clean))}catch(e){console.error(e)}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);pdStripBd();return r}}

// =====================================================================================
//  IDOLVERSE48: Select Bloom! — faster fan updates for large fanbases
// -------------------------------------------------------------------------------------
//  Same results, less repeated work (a big save spent most of "Next day" here):
//   · one fan sync asks "does this cohort support group G?" for every member whose fans changed × every cohort;
//     the answer cannot change during that sync, so it is computed once per cohort and reused
//   · counting a group's fans skips the interval layout when a cohort has no link to that group at all
// =====================================================================================
let FD_HC=null;
{const f=fdSegHas;fdSegHas=function(s,g){if(FD_HC&&s){let G=FD_HC.get(s);if(!G){G=fdSegGroups(s);FD_HC.set(s,G)}return G.has(g)}return f.apply(this,arguments)}}
{const f=fdSegGroupN;fdSegGroupN=function(s,gid){if(!s||s.k==null)return f.apply(this,arguments);if(fdGrpOf(s.k)==gid)return s.n;let hit=false;for(const j in s.o){if(fdGrpOf(+j)==gid){hit=true;break}}if(!hit)for(const j in s.u){if(fdGrpOf(+j)==gid){hit=true;break}}return hit?f.apply(this,arguments):0}}
// cohort merging: with many members the merge cannot go below the fixed cap (members × fan types × …), so it ran again every
// day and after every fan gain without shrinking anything. The cap now follows what a merge can actually reach: after a merge
// that stays above the cap, the next one waits until the fanbase has 20% more cohorts.
{const f=fdCompact;fdCompact=function(force){const fb=S&&S.fb;if(!fb||!Array.isArray(fb.segs))return;const cap=Math.max(FD_SEGCAP,fb.capEff||0);if(!force&&fb.segs.length<=cap)return;
 const r=f.call(this,true);try{const n=fb.segs.length;if(n>FD_SEGCAP)fb.capEff=Math.round(n*1.2);else delete fb.capEff}catch(e){}return r}}
// one fan sync: the cohorts that support each group are listed once (they do not change during the sync)
let FD_IP=null;
fdInterest=function(m,d,org){const fb=S.fb;if(!(d>0))return;const g=fdGrpOf(m.id),F=fb.segs.reduce((a,s)=>a+s.n,0);
 let P=FD_IP&&FD_IP[g];if(!P||P.a!==fb.segs||P.n!==fb.segs.length){P={a:fb.segs,n:fb.segs.length,L:fb.segs.filter(s=>fdSegHas(s,g))};if(FD_IP)FD_IP[g]=P}
 const pool=P.L.filter(s=>s.k!=m.id),free=s=>Math.max(0,s.n-(s.o[m.id]||0)-(s.u[m.id]||0));let FR=0;const fw=pool.map(s=>{const w=free(s)*(.3+s.eng/100);FR+=w;return w});
 const conv=Math.min(d*.35,FR*.04)*fdDim(F);let left=fbRound(conv);if(left>0&&FR>0)pool.forEach((s,i)=>{const c=Math.min(free(s),fbRound(conv*fw[i]/FR));if(c>0&&left>0){const cc=Math.min(c,left);s.u=s.u||{};s.u[m.id]=(s.u[m.id]||0)+cc;left-=cc}});
 const nw=fbRound(d*.012*fdDim(F));if(nw>0)fbAcquire(nw,{via:'member',mid:m.id,org:org||'Member buzz'})};
// ---- caches kept for the whole day and dropped whenever the cohorts are rebuilt -------------------------------------------------
//  (membership answers only change when cohorts are rebuilt / merged, Kami Oshi move, members change group, or a new day starts)
let FD_GF=null,FX_OK=null;
function fdCacheReset(){FD_HC=new WeakMap();FD_IP={};FD_GF=null;FX_OK=new WeakMap()}
fdCacheReset();
['fdFixAll','fbMerge','fbMonthly','fdMonthlyU','migrate'].forEach(n=>{try{const f=window[n];if(typeof f!='function')return;window[n]=function(){try{return f.apply(this,arguments)}finally{fdCacheReset()}}}catch(e){}});
{const f=tick;tick=function(){fdCacheReset();return f.apply(this,arguments)}}
{const f=svImportNow;if(typeof f=='function')svImportNow=function(){fdCacheReset();return f.apply(this,arguments)}}
// group fan totals: computed once per fan pass (refreshed after every full fan update and every day), not on every call
{const f=fdGroupFans;fdGroupFans=function(gid){const fb=S&&S.fb;if(!fb)return f.apply(this,arguments);if(!FD_GF||FD_GF.s!==S||FD_GF.d!==S.day)FD_GF={s:S,d:S.day,m:new Map()};const k=String(gid);if(!FD_GF.m.has(k))FD_GF.m.set(k,f.apply(this,arguments));return FD_GF.m.get(k)};
 if(typeof gsFans=='function')gsFans=function(gid){return fdGroupFans(gid)}}
{const f=fdWrite;fdWrite=function(){FD_GF=null;return f.apply(this,arguments)}}
// "does this cohort count for group G" (music preferences, fan economy): same per day
if(typeof fxGrpOk0=='function'){const f=fxGrpOk0;window.fxGrpOkCached=function(s,gid){if(!FX_OK||!s)return f(s,gid);let M=FX_OK.get(s);if(!M){M={};FX_OK.set(s,M)}const k=gid==null?'n':gid;if(!(k in M))M[k]=f(s,gid);return M[k]}}
// fbApply (after a fan boost) rebuilt every cohort at once, many times a day; during the daily update it now marks the fanbase as
// changed and the single clean-up at the end of the day does the work (outside the daily update it still applies at once)
{const f=fbApply;fbApply=function(){if(typeof FD_DEFER!='undefined'&&FD_DEFER&&S&&S.fb&&!FBW){S.fb.ver++;FD_DIRTY=1;return}return f.apply(this,arguments)}}

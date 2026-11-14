// =====================================================================================
//  Economy & fanbase safety — CD cap, diminishing fan growth, Kami Oshi / Oshi balance, NaN repair
// -------------------------------------------------------------------------------------
//  · CD_MAX (5,000,000) per single / album / election single: release day, daily edition sales,
//    album sales and election CD buying never go above it (game-systems.js, sales.js, here).
//  · Fan growth slows down as the fanbase gets very large (every fan gain goes through fbSync):
//    gain × 1 / (1 + (fans / 2.5M)^1.3) — about 77% at 1M fans, 50% at 2.5M, 29% at 5M.
//  · Kami Oshi adoption: each month some fans who only have Oshi choose their favourite Oshi as
//    Kami Oshi (no fans created or removed). Saves where Oshi-only fans heavily outnumber Kami Oshi
//    fans get a one-time rebalance on load.
//  · Fan segment values (loyalty, engagement, spending, size) are repaired if they ever become
//    invalid numbers, so averages never show NaN.
// =====================================================================================
const FAN_SOFT=2500000;
// ---- 1. election CDs: the election single obeys the same 5M cap -----------------------------------------------------------
let GE_REL=0;
{const f=geRelAttr;geRelAttr=function(){GE_REL++;try{return f.apply(this,arguments)}finally{GE_REL--}}}
{const f=geGive;geGive=function(e,P,u,FW){if(GE_REL||!e||!(u>0))return f.apply(this,arguments);try{const x=geSingleOf(e),base=x&&x.cd?x.cd.units|0:0,key=S.day+':'+base;if(e._cd!=key){e._cd=key;e._cu=0}const room=Math.max(0,CD_MAX-base-(e._cu|0));if(u>room)u=room;e._cu=(e._cu|0)+u;if(u<=0)return 0}catch(x){}return f.call(this,e,P,u,FW)}}
{const f=geDemand;geDemand=function(e,x){const u=f.apply(this,arguments);try{return Math.max(0,Math.min(u,CD_MAX-((x&&x.cd&&x.cd.units)|0)))}catch(z){return u}}}
// ---- 2. diminishing fan growth for very large fanbases ------------------------------------------------------------------
{const f=fbSync;fbSync=function(){try{const fb=S&&S.fb;if(fb&&!FBW&&Number.isFinite(S.fans)&&Number.isFinite(fb.lastS)){const d=S.fans-fb.lastS;if(d>0){const damp=1/(1+Math.pow(Math.max(0,fb.lastS)/FAN_SOFT,1.3));S.fans=fb.lastS+Math.round(d*damp)}}}catch(e){}return f.apply(this,arguments)}}
// ---- 3. repair invalid numbers in fan segments --------------------------------------------------------------------------
function fbRepair(){const fb=S&&S.fb;if(!fb||!Array.isArray(fb.segs))return 0;let n=0;fb.segs.forEach(s=>{const b=FB_BASE[s.ft]||[40,50,40];[['loy',0],['eng',1],['sp',2]].forEach(([k,i])=>{if(!Number.isFinite(s[k])){s[k]=b[i];n++}});if(!Number.isFinite(s.n)){s.n=0;n++}for(const j in s.o)if(!Number.isFinite(s.o[j])){delete s.o[j];n++}});if(!Number.isFinite(S.fans)||!Number.isFinite(fb.lastS)){fbApply();n++}return n}
// ---- 4. Kami Oshi adoption (Oshi-only fans choose a Kami Oshi among their Oshi) ----------------------------------------------
function fbKamiAdopt(rate){const fb=S&&S.fb;if(!fb||!Array.isArray(fb.segs))return 0;const act=new Map(fbActive().map(m=>[m.id,m]));let moved=0;
 fb.segs.slice().forEach(s=>{if(s.k!=null||!(s.n>1))return;const O=Object.entries(s.o||{}).filter(([j,c])=>c>0&&act.has(+j));if(!O.length)return;
  const r=typeof rate=='number'?rate:(s.ft=='casual'?.03:s.ft=='dormant'?0:.08)*((s.eng??50)>=40?1:.5);const c=Math.min(s.n-1,fbRound(s.n*r));if(c<=0)return;
  // the Oshi held by most fans of this segment is the most likely choice
  let tot=O.reduce((a,[,c])=>a+c,0),x=Math.random()*tot,pick=+O[0][0];for(const[j,cc]of O){x-=cc;if(x<=0){pick=+j;break}}
  const t=fbSplit(s,c),had=t.o[pick]||0;t.k=pick;delete t.o[pick];t.pat=fbPick();t.org=t.org||'Kami Oshi chosen';if(had)fbLife(pick,'ol',had);fbLife(pick,'kg',c);moved+=c});
 if(moved){try{fbMerge()}catch(e){}fbApply()}return moved}
const fbKamiStat=()=>{let k=0,o=0;((S.fb&&S.fb.segs)||[]).forEach(s=>{if(s.k!=null)k+=s.n;else if(Object.keys(s.o||{}).length)o+=s.n});return{k,o}};
{const f=fbMonthly;fbMonthly=function(){const r=f.apply(this,arguments);try{fbRepair();fbKamiAdopt()}catch(e){console.error(e)}return r}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(!S||!S.fb)return r;fbRepair();if(!S.fbKB1){const K=fbKamiStat();if(K.o>K.k*2&&K.o>1000)fbKamiAdopt(Math.min(.5,Math.max(.1,(K.o-K.k)/(2*K.o))));S.fbKB1=1}}catch(e){console.error(e)}return r}}

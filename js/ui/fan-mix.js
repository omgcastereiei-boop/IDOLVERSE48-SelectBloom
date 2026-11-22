// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Standard fan-type mix for every group
// -------------------------------------------------------------------------------------
//  Every group (the player's groups, OMG4ki, WINÉR4, SUMÉR4, Sefira and every act created later) aims
//  for the same fan structure: Casual 20% · Regular 40% · Dedicated 25% · Hardcore 15%.
//  It is a target, not a lock: the existing behaviour rules (fanbase.js EVO, theater, concerts, churn,
//  newcomers joining as Casual…) still move fans every day; once a month each group is pulled a small
//  step towards the target, always moving its most engaged cohorts up and its least engaged down,
//  one fan type at a time. Groups differ by total fans, popularity and support (loyalty / spending),
//  never by a different mix. Kami Oshi / Oshi rules are unchanged (fan-casual.js): Casual fans have
//  none; when a Casual cohort becomes Regular she takes her former favourite as Kami Oshi again
//  (or one from her group). Every fan is still counted once; totals never change here.
//  One-time migration (S.fb.mix1): existing saves are brought to the target mix at once.
// =====================================================================================
const FD_MIX={casual:.2,oshi:.4,dedicated:.25,hardcore:.15};
const FD_LADDER=['casual','oshi','dedicated','hardcore'];
// a split keeps the cohort's group, former favourite and purchase history (otherwise a small Casual part
// without a group could be dropped by fdFixAll)
{const f=fbSplit;fbSplit=function(s){const t=f.apply(this,arguments);try{if(t&&s){if(s.gs!=null)t.gs=s.gs;if(s.ck!=null)t.ck=s.ck;if(s.cdl!=null)t.cdl=s.cdl}}catch(e){}return t}}
const fmPg=s=>s.k!=null?fdGrpOf(s.k):s.gs;
const fmScore=s=>(s.loy||0)+(s.eng||0)*.5+(s.sp||0)*.3+(s.cdl!=null&&S.day-s.cdl<=200?15:0);
function fmCounts(L){const T={casual:0,oshi:0,dedicated:0,hardcore:0};L.forEach(s=>{if(T[s.ft]!=null)T[s.ft]+=s.n});return T}
function fmConvert(t,to,gid,act,w){const from=t.ft;t.ft=to;const b=FB_BASE[to];if(b){t.loy=fbCl(t.loy+(b[0]-t.loy)*w);t.eng=fbCl(t.eng+(b[1]-t.eng)*w);t.sp=fbCl(t.sp+(b[2]-t.sp)*w)}
 if(to=='casual'){fcCasualize(t);if(gid!=null)t.gs=gid;return}
 if(from=='casual'){t.u=t.u||{};const L=act.filter(m=>fdGrpOf(m.id)==gid);if(t.k!=null&&L.some(m=>m.id==t.k)){delete t.u[t.k]}else if(t.ck!=null&&L.some(m=>m.id==t.ck)){t.k=t.ck;delete t.u[t.k]}else if(L.length){t.k=null;fdSpreadKami(t,L.length?L:act,FD_KW);if(t.k!=null)delete t.u[t.k]}}
 if(w>=.5&&(to=='dedicated'||to=='hardcore')&&!(t.cdl!=null&&S.day-t.cdl<=200))t.cdl=S.day-45}
// move `amt` fans of group `gid` from one type to the next one (up: best cohorts first; down: weakest first)
function fmMove(gid,from,to,amt,act,w){let left=Math.round(amt);if(left<=0)return 0;const up=FD_LADDER.indexOf(to)>FD_LADDER.indexOf(from);
 const L=S.fb.segs.filter(s=>s.ft==from&&s.n>0&&fmPg(s)==gid).sort((a,b)=>up?fmScore(b)-fmScore(a):fmScore(a)-fmScore(b));let moved=0;
 for(const s of L){if(left<=0)break;const take=Math.min(s.n,left),t=take>=s.n?s:fbSplit(s,take);if(!t)continue;fmConvert(t,to,gid,act,w);left-=take;moved+=take}return moved}
// pull one group `frac` of the way to the target mix (frac 1 = migration)
function fmShiftGroup(gid,frac,act){const w=frac>=1?.5:.2;let moved=0;
 for(let i=FD_LADDER.length-1;i>=1;i--){const hi=FD_LADDER[i],lo=FD_LADDER[i-1];
  // everything at type `hi` and above should hold its target share; fill from / spill to the type below
  const L=S.fb.segs.filter(s=>fmPg(s)==gid),T=fmCounts(L),N=Object.values(T).reduce((a,b)=>a+b,0);if(N<50)return moved;
  let have=0,want=0;for(let j=i;j<FD_LADDER.length;j++){have+=T[FD_LADDER[j]];want+=N*FD_MIX[FD_LADDER[j]]}
  const gap=(want-have)*frac;if(Math.abs(gap)<1)continue;
  moved+=gap>0?fmMove(gid,lo,hi,Math.min(gap,T[lo]),act,w):fmMove(gid,hi,lo,Math.min(-gap,T[hi]),act,w)}
 return moved}
function fmShiftAll(frac){const fb=S&&S.fb;if(!fb||!Array.isArray(fb.segs))return 0;const act=fdAct();let n=0;
 // the migration repeats the cascade so fans can climb more than one step (Casual → Regular → Dedicated → Hardcore)
 for(let pass=0;pass<(frac>=1?5:1);pass++){let m=0;(S.groups||[{id:0}]).forEach(g=>{m+=fmShiftGroup(g.id,frac,act)});n+=m;if(!m)break}
 if(n){const ids=new Set(act.map(m=>m.id));fb.segs.forEach(s=>fdFixSeg(s,act,ids));fdFixAll();fdWrite()}return n}
function fmMixOf(gid){const T={casual:0,oshi:0,dedicated:0,hardcore:0};(S.fb&&S.fb.segs||[]).forEach(s=>{const n=fdSegGroupN(s,gid);if(n&&T[s.ft]!=null)T[s.ft]+=n});return T}
// monthly: a gentle pull (20% of the gap) after the behaviour rules ran
{const f=fbMonthly;fbMonthly=function(){const r=f.apply(this,arguments);try{fmShiftAll(.2)}catch(e){console.error(e)}return r}}
// one-time migration of existing saves
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S&&S.fb&&Array.isArray(S.fb.segs)&&!S.fb.mix1){S.fb.mix1=1;fmShiftAll(1)}}catch(e){console.error(e)}return r}}
// ---- rival / NPC acts: the same standard mix; OMG4ki is Japan's No.1 with about 10 million fans;
//  WINÉR4 / SUMÉR4 keep their market position against her (3.5M each), so the bigger fanbase is not an excuse for bigger CD sales ------------------------------
const FM_OMG=10000000,FM_OMG_FLOOR=9000000;
function fmRivals(){const I=S&&S.ind;if(!I||!I.A)return;Object.values(I.A).forEach(a=>{if(!a||a.cat=='player')return;a.mix={...RV_STD};if(a.id=='omg4ki')a.fans=Math.max(a.fans|0,FM_OMG);else if(a.id=='winer4'||a.id=='sumer4')a.fans=Math.max(a.fans|0,RV_PROF[a.id].fans)})}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S&&S.ind&&S.ind.A&&!S.ind.mix1){S.ind.mix1=1;fmRivals()}}catch(e){console.error(e)}return r}}
{const f=rvRoster;rvRoster=function(a){const r=f.apply(this,arguments);try{if(a&&a.cat!='player'){a.mix={...RV_STD};if(S.ind&&!S.ind.mix1&&RV_PROF[a.id])a.fans=Math.max(a.fans|0,a.id=='omg4ki'?FM_OMG:RV_PROF[a.id].fans)}}catch(e){}return r}}
// OMG4ki never sinks back to a few million: below 9M she recovers 10% of the gap each week
{const f=indFansAfter;indFansAfter=function(){const r=f.apply(this,arguments);try{const a=S.ind&&S.ind.A.omg4ki;if(a&&a.st!='disbanded'&&a.fans<FM_OMG_FLOOR)a.fans=Math.round(a.fans+(FM_OMG_FLOOR-a.fans)*.1)}catch(e){}return r}}

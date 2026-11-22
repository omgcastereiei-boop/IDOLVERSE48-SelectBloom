// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Casual fans have no Kami Oshi and no Oshi
// -------------------------------------------------------------------------------------
//  Extends fan3.js (same cohorts, same IDs, same counts). A Casual cohort keeps liking / following
//  members (they stay "other supporters" of her former favourites), but has no Kami Oshi and no Oshi;
//  (internally her former Oshi links keep their place so every group's unique fan count stays exact, but they are
//   counted and shown only as "other supporters", never as Oshi, and they never drive a purchase);
//  it belongs to its group through s.gs. When a Casual cohort becomes Regular, the existing rules give
//  it a valid Kami Oshi (her most-followed member first) and it may gain up to 5 Oshi again; when a fan
//  becomes Casual, her Kami Oshi and Oshi turn into "other supporter" links.
//  Every fan is still counted once for the group fanbase; member supporters (Kami + Oshi + other) are
//  unchanged by the conversion — only the Kami Oshi / Oshi counts no longer include Casual fans.
// =====================================================================================
function fcCasualize(s){if(!s||s.ft!='casual')return;s.o=s.o||{};s.u=s.u||{};
 if(s.k!=null){const g=fdGrpOf(s.k);if(g!=null)s.gs=g;s.ck=s.k;s.u[s.k]=Math.max(s.u[s.k]||0,s.n);s.k=null}
 for(const j in s.u){s.u[j]=Math.max(0,Math.min(s.n,Math.round(s.u[j])));if(!s.u[j])delete s.u[j]}}
{const f=fdFixSeg;fdFixSeg=function(s,act,ids){if(s&&s.ft=='casual'){fcCasualize(s);f.apply(this,arguments);fcCasualize(s);return}return f.apply(this,arguments)}}
fdFixAll=function(){const fb=S&&S.fb;if(!fb||!Array.isArray(fb.segs))return;const act=fdAct(),ids=new Set(act.map(m=>m.id));
 fb.segs.forEach(s=>{if(s.ft=='casual')fcCasualize(s)});
 fb.segs.filter(s=>s.ft!='casual'&&s.n>=8&&(s.k==null||!ids.has(s.k))).forEach(s=>{s.k=null;const L=s.gs!=null&&act.some(m=>fdGrpOf(m.id)==s.gs)?act.filter(m=>fdGrpOf(m.id)==s.gs):act;fdSpreadKami(s,L,FD_KW)});
 fb.segs.forEach(s=>fdFixSeg(s,act,ids));fb.segs=fb.segs.filter(s=>s.n>0&&(s.k!=null||(s.ft=='casual'&&s.gs!=null)));fb.ver=(fb.ver||0)+1};
// group membership of a Casual cohort: its group (s.gs) — all of its fans, counted once
{const f=fdSegGroupN;fdSegGroupN=function(s,gid){if(s&&s.k==null&&s.ft=='casual'&&s.gs!=null){if(s.gs==gid)return s.n;return f.apply(this,arguments)}return f.apply(this,arguments)}}
{const f=fdSegHas;fdSegHas=function(s,g){if(s&&s.k==null&&s.ft=='casual'&&s.gs!=null&&s.gs==g)return true;return f.apply(this,arguments)}}
{const f=fdSegGroups;fdSegGroups=function(s){const G=f.apply(this,arguments);if(s&&s.k==null&&s.ft=='casual'&&s.gs!=null)G.add(s.gs);return G}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S&&S.fb&&!S.fb.cas1){S.fb.cas1=1;(S.fb.segs||[]).forEach(z=>{if(z.ft!='casual'&&z.ft!='dormant'&&z.cdl==null)z.cdl=S.day-60});fdFixAll();fdWrite()}}catch(e){console.error(e)}return r}}
// member supporter counts: a Casual cohort's links are "other supporters", never Oshi
{const f=fdSup;fdSup=function(){const M=f.apply(this,arguments);try{(S.fb&&S.fb.segs||[]).forEach(s=>{if(s.ft!='casual')return;for(const j in s.o){const X=M[j];if(!X)continue;const c=s.o[j]||0;X.o-=c;X.u+=c}})}catch(e){}return M}}
// cohorts merge by Kami Oshi: Casual cohorts merge by their former favourite, so they stay as finely split as before
{const f=fbMerge;fbMerge=function(){const C=(S.fb&&S.fb.segs||[]).filter(s=>s.ft=='casual'&&s.k==null&&s.ck!=null);C.forEach(s=>{s.k=s.ck});let r;try{r=f.apply(this,arguments)}finally{(S.fb&&S.fb.segs||[]).forEach(s=>{if(s.ft=='casual'&&s.k!=null){fcCasualize(s)}})}return r}}

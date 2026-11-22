// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Casual fans: Kami Oshi and Oshi like every fan
// -------------------------------------------------------------------------------------
//  Extends fan3.js (same cohorts, same IDs, same counts). Casual fans now have the same relationships as
//  every fan: exactly one Kami Oshi (her former favourite when she is still active, else one from her group)
//  and 0–5 Oshi. They differ from Regular fans only in behaviour (lower loyalty, rarely buy CDs).
//  Every fan is still counted once for the group fanbase.
// =====================================================================================
// Casual fans have exactly one Kami Oshi and 0–5 Oshi, like every fan.
// A cohort without a Kami Oshi takes back her former favourite (s.ck) when she is still active.
function fcCasualize(s){if(!s||s.ft!='casual')return;s.o=s.o||{};s.u=s.u||{};
 if(s.k==null&&s.ck!=null){const m=get(s.ck);if(m&&isAct(m))s.k=s.ck}
 if(s.k!=null){const g=fdGrpOf(s.k);if(g!=null)s.gs=g;s.ck=s.k;delete s.u[s.k]}
 for(const j in s.u){s.u[j]=Math.max(0,Math.min(s.n,Math.round(s.u[j])));if(!s.u[j])delete s.u[j]}}
{const f=fdFixSeg;fdFixSeg=function(s,act,ids){if(s&&s.ft=='casual'){fcCasualize(s);f.apply(this,arguments);fcCasualize(s);return}return f.apply(this,arguments)}}
fdFixAll=function(){const fb=S&&S.fb;if(!fb||!Array.isArray(fb.segs))return;const act=fdAct(),ids=new Set(act.map(m=>m.id));
 fb.segs.forEach(s=>{if(s.ft=='casual')fcCasualize(s)});
 fb.segs.filter(s=>(s.ft=='casual'?s.n>0:s.n>=8)&&(s.k==null||!ids.has(s.k))).forEach(s=>{s.k=null;const L=s.gs!=null&&act.some(m=>fdGrpOf(m.id)==s.gs)?act.filter(m=>fdGrpOf(m.id)==s.gs):act;fdSpreadKami(s,L,FD_KW);if(s.ft=='casual')fcCasualize(s)});
 fb.segs.forEach(s=>fdFixSeg(s,act,ids));fb.segs=fb.segs.filter(s=>s.n>0&&(s.k!=null||(s.ft=='casual'&&s.gs!=null)));fb.ver=(fb.ver||0)+1};
// group membership of a Casual cohort: its group (s.gs) — all of its fans, counted once
{const f=fdSegGroupN;fdSegGroupN=function(s,gid){if(s&&s.k==null&&s.ft=='casual'&&s.gs!=null){if(s.gs==gid)return s.n;return f.apply(this,arguments)}return f.apply(this,arguments)}}
{const f=fdSegHas;fdSegHas=function(s,g){if(s&&s.k==null&&s.ft=='casual'&&s.gs!=null&&s.gs==g)return true;return f.apply(this,arguments)}}
{const f=fdSegGroups;fdSegGroups=function(s){const G=f.apply(this,arguments);if(s&&s.k==null&&s.ft=='casual'&&s.gs!=null)G.add(s.gs);return G}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S&&S.fb&&!S.fb.cas1){S.fb.cas1=1;(S.fb.segs||[]).forEach(z=>{if(z.ft!='casual'&&z.ft!='dormant'&&z.cdl==null)z.cdl=S.day-60});fdFixAll();fdWrite()}}catch(e){console.error(e)}return r}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S&&S.fb&&Array.isArray(S.fb.segs)&&!S.fb.cas2){S.fb.cas2=1;fdFixAll();fdWrite()}}catch(e){console.error(e)}return r}}

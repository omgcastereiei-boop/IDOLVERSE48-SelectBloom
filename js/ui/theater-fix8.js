// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Theater online viewers & member fans: realistic numbers
// -------------------------------------------------------------------------------------
//  · The Online Theater Membership is one company-wide membership, so its subscribers spread over
//    every Stage of every group: the online viewers of ONE performance are the subscribers who
//    watch live (35–60%) divided by the stages that perform in the month, and never more than 8%
//    of the group's fans.
//  · Online viewers count with a diminishing weight for member fans (theater-fans.js: thOnEff).
//  · Existing saves: member fans that past Theater shows gave above the new limit are removed once
//    (the performance records are corrected too, so the history shows the corrected numbers).
// =====================================================================================
function thOnlineN(subs,sat){const H=thS(),d0=S.day-31,keys=new Set((H.pf||[]).filter(p=>p.day>d0).map(p=>p.k));const nG=(S.groups||[]).filter(g=>!g.dis).length||1;
 const nT=Math.max(1,keys.size)+Math.max(0,nG-1),base=subs*(.35+Math.random()*.25)*(.8+sat/250)/nT,cap=Math.max(300,(S.fans|0)*.08);return Math.max(0,Math.round(Math.min(base,cap)))}
function thFix8(){if(!S||S.thFix8)return;const ex={};
 const run=()=>{const H=thS();(H.pf||[]).forEach(rec=>{const A=rec.aud;if(!A||!A.mem||A.on8)return;const live=A.live!=null?A.live:(rec.att|0),on=Math.min(A.online|0,Math.max(300,(S.fans|0)*.08)),elig=live+TH_MF.online*thOnEff(on),allow=Math.max(20,elig*TH_MF.cap*3),bt=new Map((A.mfBt||[]).map(b=>[String(b.mid),b]));
  let tot=0;Object.keys(A.mem).forEach(id=>{const g=A.mem[id]|0,lim=allow+(bt.has(id)?elig*.08:0);if(g>lim){const k=lim/g,cut=g-Math.round(lim);ex[id]=(ex[id]||0)+cut;A.mem[id]=Math.round(lim);const sc=(A.mfSrc||{})[id];if(sc)Object.keys(sc).forEach(q=>sc[q]=Math.round((sc[q]|0)*k));const fs=(A.mfs||{})[id];if(fs)Object.keys(fs).forEach(q=>fs[q]=Math.round((fs[q]|0)*k))}tot+=A.mem[id]|0});
  if(A.online>on){A.online=on;if(A.onFan>on)A.onFan=on}A.mfTot=tot;A.nf=tot;rec.nf=tot})};
 try{(S.groups||[]).length>1?S.groups.forEach(g=>{try{gsWith(g.id,run)}catch(e){console.error(e)}}):run()}catch(e){console.error(e)}
 Object.entries(ex).forEach(([id,n])=>{const m=get(+id)||(S.alumni||[]).find(x=>x.id==+id);if(!m)return;m.fans=Math.max(0,Math.round((m.fans||0)-n));try{if(S.fb&&S.fb.mf&&S.fb.mf[id]!=null)S.fb.mf[id]=m.fans}catch(e){}try{m.pop=popOf(m)}catch(e){}});
 S.thFix8={day:S.day,n:Object.keys(ex).length,cut:Object.values(ex).reduce((a,b)=>a+b,0)}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{thFix8()}catch(e){console.error(e)}return r}}
// subscribers can never outnumber the fans: Basic ≤ 25%, Premium ≤ 10% of the company's fans (all groups)
function thSubCap(){const M=S&&S.thM;if(!M||!M.subs)return;let F=0;try{F=(S.groups||[]).length>1&&typeof gsFans=='function'?S.groups.reduce((a,g)=>a+(gsFans(g.id)|0),0):(S.fans|0)}catch(e){F=S.fans|0}
 Object.keys(M.subs).forEach(k=>{const c=Math.round(Math.max(200,F)*(k=='pkp'?.1:.25));if((M.subs[k]|0)>c)M.subs[k]=c})}
{const f=thMonthly;thMonthly=function(){try{thSubCap()}catch(e){}const r=f.apply(this,arguments);try{thSubCap()}catch(e){}return r}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S&&S.thM)thSubCap()}catch(e){console.error(e)}return r}}
// performances counted with the new online numbers are never touched by the one-time repair
{const f=thAud;thAud=function(){const A=f.apply(this,arguments);try{if(A)A.on8=1}catch(e){}return A}}

// =====================================================================================
//  IDOLVERSE48: Select Bloom! — CD demand from the real fanbase (buyers × copies)
// -------------------------------------------------------------------------------------
//  The single's sales formula (doRelease) used "total fans × 12%" as its fan term, so every new
//  fan behaved like a CD buyer. This hook keeps the formula and every other factor (song quality,
//  Senbatsu, Center, concept fit, number of Types, handshake benefits, randomness) and only
//  replaces that fan term with the fans who really buy, from the existing fan database (fan3.js):
//   · Casual fans rarely buy (2.5%), Regular ≈20%, Dedicated ≈45% (more copies), Hardcore ≈75%
//     (multiple copies). Dormant fans do not buy.
//   · Spending power and loyalty of each fan cohort change the share; fans whose Kami Oshi sings
//     in the Senbatsu buy more often.
//   · Each fan is counted once for the group (fdSegGroupN), however many members she supports.
//   · Fan fatigue: a single released less than ~75 days after the previous one sells less.
//  It sits directly around the core formula (loaded right after game-systems.js), so every other
//  release hook sees the result exactly as before.
// =====================================================================================
const CDD_RATE={casual:[.025,1],oshi:[.2,1.05],dedicated:[.45,1.3],hardcore:[.75,2.1],dormant:[0,0]};
function cddDemand(gid,sen){const fb=S&&S.fb;if(!fb||!Array.isArray(fb.segs)||!fb.segs.length)return null;const senS=new Set(sen||[]);let u=0,n0=0,by={};
 fb.segs.forEach(s=>{const n=typeof fdSegGroupN=='function'?fdSegGroupN(s,gid):s.n;if(!n)return;n0+=n;const R=CDD_RATE[s.ft]||CDD_RATE.casual;let b=R[0]*(.55+.9*((s.sp==null?40:s.sp)/100))*(.8+.4*((s.loy==null?50:s.loy)/100));if(senS.has(s.k))b*=1.25;const v=n*Math.min(.95,b)*R[1];u+=v;by[s.ft]=(by[s.ft]||0)+v});
 let last=null;try{const L=(S.singles||[]).map(x=>x.relDay??x.day).filter(d=>d!=null&&d<S.day);last=L.length?Math.max(...L):null}catch(e){}
 const gap=last==null?999:S.day-last,fat=gap>=75?1:Math.max(.72,.72+.28*gap/75);return{units:u*fat,fans:n0,fat,gap,by}}
{const f=doRelease;doRelease=function(){const p=S&&S.pj;let D=null;try{if(p&&p.status=='producing'){const mn=S.songs[p.mainId];D=cddDemand(typeof gsAg=='function'?gsAg():0,mn&&mn.slots?mn.slots.filter(Boolean):[])}}catch(e){D=null}
 if(!D||!(D.fans>0))return f.apply(this,arguments);const n=S.singles.length,f0=S.fans,eff=Math.max(0,Math.round(D.units/.12));S.fans=eff;let r;
 try{r=f.apply(this,arguments)}finally{const dl=S.fans-eff;S.fans=f0+dl}
 try{const x=S.singles[n];if(x)x.cdd={buy:Math.round(D.units),fans:D.fans,fat:+D.fat.toFixed(2),by:Object.fromEntries(Object.entries(D.by).map(([k,v])=>[k,Math.round(v)]))}}catch(e){}return r}}

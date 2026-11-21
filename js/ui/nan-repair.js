// =====================================================================================
//  IDOLVERSE48: Select Bloom! — repair numbers broken by the old album-sales NaN bug
// -------------------------------------------------------------------------------------
//  Before the fix, an album release could compute NaN sales. That NaN then flowed into
//  S.fans, member popularity (grantRep), the fanbase segments and the album record, and
//  a save turns NaN into null. This repair runs on load, after each release and once a
//  day when something looks broken. It never touches Company Money (moneyOk does that).
//  · members / former members: a broken number takes the median of the other members
//  · fanbase segments: broken counts are dropped, broken traits get neutral values
//  · S.fans: rebuilt from the fanbase segments
//  · album / single records: broken sales, revenue and fans become 0
//  · any remaining NaN anywhere in the state becomes 0
// =====================================================================================
const nrBad=v=>v===null||(typeof v=='number'&&!Number.isFinite(v));
// null (a saved NaN) is only repaired on these stat fields; other fields can be null on purpose
const NR_STAT=new Set(['mor','fans','buzz','en','loy','pas','pop','st','sing','dance','variety','cha','age']);
const NR_DEF={mor:50,en:100,loy:50,pas:50,st:50,sing:40,dance:40,variety:40,cha:40,age:18,fans:0,buzz:0,pop:1};
function nrMembers(L){if(!Array.isArray(L)||!L.length)return 0;let n=0;const keys=new Set();L.forEach(m=>{for(const k in m)if(typeof m[k]=='number'||(NR_STAT.has(k)&&m[k]===null))keys.add(k)});
 keys.forEach(k=>{const ok=L.map(m=>m[k]).filter(v=>typeof v=='number'&&Number.isFinite(v)).sort((a,b)=>a-b);const med=ok.length?ok[Math.floor(ok.length/2)]:(NR_DEF[k]??0);const nul=NR_STAT.has(k);L.forEach(m=>{const v=m[k];if(k in m&&(nul?nrBad(v):typeof v=='number'&&!Number.isFinite(v))){m[k]=med;n++}})});return n}
function nrFb(fb){if(!fb||!Array.isArray(fb.segs))return 0;let n=0;const N0=fb.segs.length;fb.segs=fb.segs.filter(s=>s&&typeof s.n=='number'&&Number.isFinite(s.n)&&s.n>0);n+=N0-fb.segs.length;
 fb.segs.forEach(s=>{[['loy',40],['eng',50],['sp',40]].forEach(([k,d])=>{if(nrBad(s[k])){s[k]=d;n++}});for(const j in s.o||{})if(nrBad(s.o[j])){delete s.o[j];n++}});if(n)fb.ver=(fb.ver|0)+1;return n}
function nrRel(L){let n=0;(L||[]).forEach(r=>{if(!r)return;['sales','rev','fans','cost'].forEach(k=>{if(k in r&&nrBad(r[k])){r[k]=0;n++}})});return n}
function nrWalk(o,seen,skip){let n=0;if(!o||typeof o!='object'||seen.has(o))return 0;seen.add(o);for(const k in o){if(skip.has(k))continue;const v=o[k];if(typeof v=='number'){if(Number.isNaN(v)){o[k]=0;n++}}else if(v&&typeof v=='object')n+=nrWalk(v,seen,skip)}return n}

// fans of a member: use her supporters in the fanbase (Kami Oshi + Oshi), which survived the bug.
// Popularity of those members is re-estimated from the healthy members' popularity per supporter.
function nrSupporters(){try{const segs=S.fb&&S.fb.segs;if(!Array.isArray(segs)||!segs.length)return null;const r={};segs.forEach(s=>{const n=+s.n;if(!(n>0))return;if(s.k!=null)r[s.k]=(r[s.k]||0)+n;for(const j in s.o||{}){const c=+s.o[j];if(c>0)r[j]=(r[j]||0)+c}});for(const k in r)r[k]=Math.round(r[k]);return r}catch(e){return null}}
function nrFansFromFb(ids,popIds){popIds=popIds||new Set();const sup=nrSupporters();if(!sup||!ids.size)return 0;let n=0;const L=S.members||[];
 const healthy=L.filter(m=>!ids.has(m.id)&&Number.isFinite(m.pop)&&sup[m.id]>0),ratio=healthy.map(m=>m.pop/sup[m.id]).sort((a,b)=>a-b),rt=ratio.length?ratio[Math.floor(ratio.length/2)]:null,pmax=healthy.length?Math.max(...healthy.map(m=>m.pop)):100;
 L.forEach(m=>{if(!ids.has(m.id))return;const s=sup[m.id]|0;if(s>0){m.fans=s;if(S.fb&&S.fb.mf)S.fb.mf[m.id]=s;n++;if(rt!=null&&popIds.has(m.id)){const est=Math.round(rt*s);const cap=Math.min(100,Math.max(pmax*2,20));if(est>(m.pop||0))m.pop=Math.min(est,cap)}}});return n}
function nanRepair(quiet){if(!S)return 0;let n=0;try{
 const brk=new Set((S.members||[]).filter(m=>nrBad(m.fans)).map(m=>m.id)),brkPop=new Set((S.members||[]).filter(m=>nrBad(m.pop)).map(m=>m.id));n+=nrMembers(S.members)+nrMembers(S.alumni);n+=nrFb(S.fb);
 // a member with 0 fans who still has supporters in the fanbase is inconsistent (saves repaired by the first version): rebuild her fans
 (S.members||[]).forEach(m=>{if(!(+m.fans>0))brk.add(m.id)});
 n+=nrFansFromFb(brk,brkPop);
 n+=nrRel(S.albums)+nrRel(S.singles);(S.groups||[]).forEach(g=>{if(g&&g.ctx){n+=nrRel(g.ctx.albums)+nrRel(g.ctx.singles)}});
 n+=nrWalk(S,new WeakSet(),new Set(['money','mOk']));
 if(nrBad(S.fans)){S.fans=S.fb&&Array.isArray(S.fb.segs)?S.fb.segs.reduce((a,s)=>a+s.n,0):0;n++}
 if(n&&S.fb){S.fb.ver=(S.fb.ver|0)+1;if(S.fb.fx)S.fb.fx.tv=(S.fb.fx.tv|0)+1}
 if(n){console.warn('nanRepair: repaired '+n+' broken value(s)');if(!quiet)toast(`Repaired ${n} broken value(s) in this save (fans / popularity).`)}}catch(e){console.error(e)}return n}
function nrZeroWithSup(){const z=(S.members||[]).filter(m=>!(+m.fans>0));if(!z.length)return false;const sup=nrSupporters();return!!sup&&z.some(m=>sup[m.id]>0)}
const nrSuspect=()=>{try{return nrZeroWithSup()||nrBad(S.fans)||(S.members||[]).some(m=>nrBad(m.pop)||nrBad(m.fans))||(S.fb&&(S.fb.segs||[]).some(s=>nrBad(s.n)))}catch(e){return false}};
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);nanRepair(true);return r}}
{const f=doRelease;doRelease=function(){const r=f.apply(this,arguments);if(nrSuspect())nanRepair(true);return r}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);if(nrSuspect())nanRepair(true);return r}}

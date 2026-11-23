// =====================================================================================
//  IDOLVERSE48: Select Bloom! — stage pictures: one layout for Concerts, Theater and events
// -------------------------------------------------------------------------------------
//  · every member on stage is drawn at the same size (the size that fits the longest row)
//  · a very long row (e.g. 50 members) is split into several rows automatically
//  · when two neighbouring rows hold the same number of members, the back row stands
//    half a place to the side so every face stays visible
// =====================================================================================
let ST_ROWS=null; // member count per row, front row first (set while a stage picture is drawn)
const ST_MAX={th:12,cc:14};
// split a row length into near-equal parts of at most `max`
function stSplitN(n,max){if(n<=max)return[n];const k=Math.ceil(n/max),b=Math.floor(n/k),x=n%k;return Array.from({length:k},(_,i)=>b+(i<x?1:0))}
function stSplitCounts(c,max){return c.flatMap(n=>stSplitN(n,max))}
// stagger: rows with the same count as the row in front alternate half a place left/right
function stOff(C,back,step){let par=0;for(let i=1;i<=back;i++)par=C[i]==C[i-1]?par^1:0;return par?step/2:0}
stRowLay=function(n,back,RN,W,front,depth,maxFw){const C=ST_ROWS&&ST_ROWS.length==RN?ST_ROWS:null,avail=W-150;
 if(!C){const sc=1-back*.1,av=avail*(1-back*.05),fw=Math.min(maxFw*sc,av/Math.max(1,n)*1.12),step=Math.min(av/Math.max(1,n),fw*1.32),dy=RN>1?Math.min(40,depth/(RN-1)):0;return{fw,step,feet:front-back*dy}}
 let fw=Math.min(maxFw,...C.map(k=>avail/Math.max(1,k)*1.12));
 if(RN>1)fw=Math.min(fw,(front-24)/(2.3+.4*(RN-1)));
 const dy=RN>1?Math.max(Math.min(fw*.5,depth/(RN-1)),Math.min(fw*.75,(front-fw*2.3-24)/(RN-1))):0,step=Math.min(avail/Math.max(1,n),fw*1.32);
 return{fw,step,feet:front-back*dy,off:stOff(C,back,step)}};
// Theater-style pictures (Theater, Studio Recording, debut pictures…)
{const f=thStageSvg;thStageSvg=function(o,ids,rows,nc,cdOf,poseOf,mic,hue,w,deco){const L=(ids||[]).map(get).filter(Boolean);let R=(rows||[]).slice();const tot=R.reduce((a,b)=>a+b,0);if(tot!=L.length)R=L.length?[L.length]:[];
 R=stSplitCounts(R,ST_MAX.th);const prev=ST_ROWS;ST_ROWS=R.filter(x=>x>0);try{return f.call(this,o,ids,R,nc,cdOf,poseOf,mic,hue,w,deco)}finally{ST_ROWS=prev}}}
// Concert pictures
{const f=ccStageSvg;ccStageSvg=function(C,p,set,idx,W,H){try{const it=set&&set.items[idx];if(!it||!Array.isArray(it.pos))return f.apply(this,arguments);const out=((p&&p.res)||{}).out||{};
  const pos=it.pos.filter(z=>z.m!=null&&ccMem(z.m)&&!out[z.m]),Rk=[...new Set(pos.map(z=>z.r))].sort((a,b)=>a-b);const np=[];let r=0;const C2=[];
  // the rows stay exactly as the player arranged them (members just get smaller); a row is split only when its members
  // would become too small to see on the stage (it really overflows)
  const avail=(W||1200)-150,FWMIN=30,cap=Math.max(ST_MAX.cc,Math.floor(avail*1.12/FWMIN));
  Rk.forEach(rr=>{const row=pos.filter(z=>z.r==rr),parts=stSplitN(row.length,cap);let a=0;const chunks=parts.map(k=>{const c=row.slice(a,a+k);a+=k;return c});const ci=chunks.findIndex(c=>c.some(z=>z.c));if(ci>0)chunks.unshift(...chunks.splice(ci,1));chunks.forEach(c=>{c.forEach(z=>np.push({...z,r}));C2.push(c.length);r++})});
  const set2={...set,items:set.items.map((x,i)=>i==idx?{...x,pos:np}:x)},prev=ST_ROWS;ST_ROWS=C2;try{return f.call(this,C,p,set2,idx,W,H)}finally{ST_ROWS=prev}}catch(e){console.error(e);return f.apply(this,arguments)}}}
// External events / roadshow pictures: same size for everyone, rows of at most 9, staggered
evStageRows=function(sp,G,seed){const ord=evOrder(sp),N=ord.length;if(!N)return'';const r=mulb(seed);
 const nr=N<=G.single?1:Math.max(2,Math.ceil(N/9)),cnt=stSplitN(N,Math.ceil(N/nr));const rows=[];let a=0;cnt.forEach(k=>{rows.push(ord.slice(a,a+k));a+=k});
 const g0=nr==1?G.one:G.front,gb=G.back,w=g0.x1-g0.x0,maxN=Math.max(...cnt),s=Math.min(g0.smax,w/maxN/66);
 const dyv=nr==1?0:Math.min(Math.max((g0.y-gb.y)/(nr-1),s*36),(g0.y-s*175-8)/(nr-1)),ys=rows.map((_,i)=>g0.y-dyv*i);
 let out='';rows.map((L,ri)=>[L,ri]).reverse().forEach(([L,ri])=>{const n=L.length,step=Math.min(w/n,66*s*1.25),off=stOff(cnt,ri,step),x0=400-step*(n-1)/2+off,sl=evSlots(n),xs=[];
  L.forEach((z,i)=>xs.push([z,x0+step*sl[i],i]));
  out+=xs.sort((p,q)=>Math.abs(q[1]-400)-Math.abs(p[1]-400)).map(([z,cx,i])=>{const pose=ri==0&&i==0?13:EV_POSES[(i*3+Math.floor(r()*5))%EV_POSES.length];return evFigOne(sp,z,pose,[1,3,11,2][(i+Math.floor(r()*4))%4],cx,ys[ri],s)}).join('')});
 return out};

// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Release Day Mini Concert & Music Program pictures in dance formation
// -------------------------------------------------------------------------------------
//  · Members stand in the song's dance formation: Row 1 in front (Center in the middle),
//    the next rows behind, higher on the stage and a little smaller. Without a saved formation,
//    the default formation for that many members is used (Center first).
//  · Release Day Mini Concert: the LED screen behind the stage has no text any more; its graphic
//    uses the colours of the members' costumes.
// =====================================================================================
// members of a picture → rows (front first), each row left → right
function evdRows(sp){const M=(sp.m||[]).slice();if(!M.length)return[];const by=new Map(M.map(z=>[z.id,z]));
 let o=null;try{o=sp.song&&S.songs[sp.song]}catch(e){}
 const sl=o&&o.fm&&Array.isArray(o.fm.sl)?o.fm.sl.filter(x=>x.m!=null&&by.has(x.m)):[];
 if(sl.length>=Math.max(1,Math.ceil(M.length*.6))){const used=new Set(sl.map(x=>x.m)),R=[];sl.forEach(x=>{(R[x.r]=R[x.r]||[]).push(x)});let rows=R.filter(Boolean).map(L=>L.sort((a,b)=>a.i-b.i).map(x=>({z:by.get(x.m),c:!!x.c})));
  const extra=M.filter(z=>!used.has(z.id));if(extra.length){const last=rows[rows.length-1];if(rows.length<3)rows.push(extra.map(z=>({z,c:false})));else last.push(...extra.map(z=>({z,c:false})))}return rows}
 // default formation, Center first
 const ord=typeof evOrder=='function'?evOrder(sp):M,n=ord.length;let f;try{f={sl:genForm(n,1)};const so=slotOrder(f);so.forEach((k,i)=>{f.sl[k].m=i})}catch(e){return[ord.map((z,i)=>({z,c:i==0}))]}
 const R=[];f.sl.forEach(x=>{(R[x.r]=R[x.r]||[]).push(x)});return R.filter(Boolean).map(L=>L.sort((a,b)=>a.i-b.i).map(x=>({z:ord[x.m],c:!!x.c})))}
// draw the rows: G = {fy: front feet y, dy: rise per row, x0, x1, smax, shrink}
function evdDraw(sp,G,seed){const rows=evdRows(sp);if(!rows.length)return'';const r=typeof mulb=='function'?mulb(seed|0):Math.random,nR=rows.length,dy=nR>1?Math.min(G.dy,G.maxRise/(nR-1)):0;let out='';
 for(let ri=nR-1;ri>=0;ri--){const L=rows[ri],n=L.length,sc=G.smax*(1-ri*G.shrink),inset=(G.x1-G.x0)*ri*.07,x0=G.x0+inset,x1=G.x1-inset,step=Math.min((x1-x0)/Math.max(1,n),70*sc),s=Math.min(sc,step/58),mid=(x0+x1)/2,y=G.fy-ri*dy;
  const fn=rows[0].length,stag=ri%2==1&&(n%2)==(fn%2)?step/2:0,P=L.map((e,i)=>[e,mid+(i-(n-1)/2)*step+stag,i]).sort((a,b)=>Math.abs(b[1]-mid)-Math.abs(a[1]-mid));
  out+=P.map(([e,cx,i])=>{const pose=e.c?13:EV_POSES[(i*3+ri*5+Math.floor(r()*5))%EV_POSES.length];return evFigOne(sp,e.z,pose,[1,3,11,2][(i+ri+Math.floor(r()*4))%4],cx,y,s)}).join('')}
 return out}
// costume colours of a picture (most used colours of the designs on stage)
function evdColors(sp){const C={};(sp.cd||[]).forEach(p=>{const t=JSON.stringify(p||{});(t.match(/"c[12]":"#[0-9a-fA-F]{6}"/g)||[]).forEach(x=>{const c=x.slice(6,13).toLowerCase();C[c]=(C[c]||0)+1})});
 let L=Object.entries(C).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);if(!L.length)L=['#ff8fc0','#b98bff','#6fc8ff'];while(L.length<3)L.push(L[L.length-1]);return L.slice(0,4)}
function evdScreen(sp){const c=evdColors(sp),seed=(sp.day|0)*7+(sp.m||[]).length,r=typeof mulb=='function'?mulb(seed):Math.random;let s='';
 for(let i=0;i<16;i++){const x=196+r()*408,y=48+r()*100,rr=6+r()*18;s+=`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rr.toFixed(0)}" fill="${c[i%c.length]}" opacity="${(.25+r()*.35).toFixed(2)}"/>`}
 for(let i=0;i<9;i++){const x=200+i*50+r()*20,y=56+r()*86,k=4+r()*5;s+=`<path d="M${x.toFixed(0)} ${(y-k*2).toFixed(0)}L${(x+k*.6).toFixed(0)} ${(y-k*.6).toFixed(0)}L${(x+k*2).toFixed(0)} ${y.toFixed(0)}L${(x+k*.6).toFixed(0)} ${(y+k*.6).toFixed(0)}L${x.toFixed(0)} ${(y+k*2).toFixed(0)}L${(x-k*.6).toFixed(0)} ${(y+k*.6).toFixed(0)}L${(x-k*2).toFixed(0)} ${y.toFixed(0)}L${(x-k*.6).toFixed(0)} ${(y-k*.6).toFixed(0)}Z" fill="#ffffff" opacity=".75"/>`}
 return{grad:`<linearGradient id="evled" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset=".5" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></linearGradient>`,deco:s}}
// ---- Release Day Mini Concert -------------------------------------------------------------------------------------------------
{const f=evReleaseSvg;evReleaseSvg=function(sp){if(!sp||sp.k=='bd'||!(sp.m||[]).length)return f.apply(this,arguments);let s=f.call(this,{...sp,m:[]});
 try{if(sp.k!='bd'){const S2=evdScreen(sp);s=s.replace(/<linearGradient id="evled"[\s\S]*?<\/linearGradient>/,S2.grad).replace(/<text x="400" y="110"[^>]*>LIVE ✦ BLOOM<\/text><text x="400" y="138"[^>]*>[^<]*<\/text>/,S2.deco)}
  const fig=evdDraw(sp,{fy:334,dy:50,maxRise:96,x0:80,x1:720,smax:1.02,shrink:.11},(sp.day|0)*31+sp.m.length),k=s.indexOf('<rect y="370" width="800" height="80"');s=k>=0?s.slice(0,k)+fig+s.slice(k):s+fig}catch(e){console.error(e)}return s}}
// ---- Music programs -------------------------------------------------------------------------------------------------------------
{const f=xeScene;xeScene=function(sp){if(!sp||sp.scene!='mp'||!(sp.m||[]).length)return f.apply(this,arguments);let s=f.call(this,{...sp,m:[]});
 try{const fig=evdDraw(sp,{fy:350,dy:46,maxRise:90,x0:110,x1:690,smax:.98,shrink:.11},sp.seed|0),k=s.indexOf('<rect y="380" width="800" height="70" fill="#05060f"/>');s=k>=0?s.slice(0,k)+fig+s.slice(k):s+fig}catch(e){console.error(e)}return s}}

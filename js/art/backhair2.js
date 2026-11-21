// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Back Hair: more styles, mixed layers, fuller tails
// -------------------------------------------------------------------------------------
//  1. More back hair styles (index ≥ 25): short / medium / long cuts, tied styles, twin tails,
//     buns, braids and half-up styles, all drawn by the existing renderer from silhouettes,
//     extra layer shapes, tails, buns and braids.
//  2. Ponytails & twin tails (old and new) are drawn as full, voluminous tails: a rounded mass
//     that swells after the tie, stays thick down its length and splits into several layered
//     locks at the ends, with inner strand lines, a highlight streak and a puff at the tie.
//  3. Mixed back hair: m.ap.bkx = extra back-hair layers [{k,x,y,s}] stacked with the main back
//     hair (m.ap.bk). An entry {m:1} marks where the main back hair sits in the stack (default:
//     at the bottom). Each layer can be moved (x, y) and resized (s). All layers use the hair
//     colour and shading. Bangs, side locks and ahoge are not touched.
// =====================================================================================
const bhJ=(s,i)=>{const x=Math.sin((i+1)*12.9898+s*78.233)*43758.5453;return x-Math.floor(x)};
// ---- silhouettes ------------------------------------------------------------------------------------------------
// o: L length · fl flare at the ends · wave · n/dp tips · cv tip-row curve (U) · v V-shape depth · inw/out end curl
//    La left length (asymmetric) · cur curls along the outline · top crown half width
function bhMass(o,seed){const L=o.L,La=o.La??L,fl=o.fl||0,wv=o.wave||0,w=k=>wv?Math.sin(k*1.7+(seed%5))*wv:0,tw=o.top||0;
 const side=(len,sg)=>{const P=[[50,3.6],[74+tw*.4,6],[87+tw,22],[89+tw,44]];for(let k=1;k<=3;k++){const y=44+(len-48)*k/3;P.push([89+tw+fl*k/3+w(k*sg),y])}const e=P[P.length-1];if(o.inw)e[0]-=o.inw;if(o.out)e[0]+=o.out;P[P.length-1]=[e[0],len-4];return P};
 const R=side(L,1),Lf=side(La,-1).reverse().map(([x,y])=>[100-x,y]);
 const x0=R[R.length-1][0],x1=Lf[0][0],y0=L-4,y1=La-4,n=o.n||8,dp=o.dp??5;let B=[[x0,y0-dp*.2]];
 for(let i=0;i<n;i++){const t=(i+.5)/n,t2=(i+1)/n,yy=y0+(y1-y0)*t,yy2=y0+(y1-y0)*t2,arc=(o.v?(1-Math.abs(2*t-1))*o.v:Math.sin(t*Math.PI)*(o.cv||0)),arc2=(o.v?(1-Math.abs(2*t2-1))*o.v:Math.sin(t2*Math.PI)*(o.cv||0));
  B.push([x0+(x1-x0)*t+(bhJ(seed,i)-.5)*2,yy+arc+dp*(.7+bhJ(seed,i+9)*.5),'t']);if(i<n-1)B.push([x0+(x1-x0)*t2,yy2+arc2-dp*(.15+bhJ(seed,i+3)*.3)])}B.push([x1,y1-dp*.2]);
 let d=crPath(R)+clumpEdge(B)+crSeg(Lf)+'Z';
 if(o.cur){const r=o.cur*.7;for(let y=60;y<Math.min(L,La)-6;y+=r*1.25){[[R,1],[Lf,-1]].forEach(([P,sg])=>{const x=(sg>0?89+tw+fl*(y-44)/(L-48):11-tw-fl*(y-44)/(La-48))-sg*r*.45;d+=`M${N2(x+r)} ${N2(y)}a${r} ${r} 0 1 0 0 .1Z`})}
  if(Math.min(L,La)>100)for(let i=0;i<7;i++){const x=x0+(x1-x0)*(i+.5)/7,y=y0+(y1-y0)*(i+.5)/7+dp*.3;d+=`M${N2(x+r)} ${N2(y)}a${r} ${r} 0 1 0 0 .1Z`}}
 return d}
const BH_HEAD='M50 5C72 5 86 21 86 44C86 58 82 68 76 74L24 74C18 68 14 58 14 44C14 21 28 5 50 5Z';
const BH_HEAD2='M50 4C73 4 88 20 88 44C88 60 85 72 78 80L22 80C15 72 12 60 12 44C12 20 27 4 50 4Z';
// ---- styles ---------------------------------------------------------------------------------------------------------
// each entry: name, group, builder(D,seed) -> backHair object (b, sk, s + optional lay, vt tails, parts, tie, top, braids…)
const BHX=[];const bhAdd=(n,g,f)=>BHX.push({n,g,f});
// tails: {P centre line (tie first), W width, f front (over the shoulder), wave, cur curls, br braided, loose, lay layered}
const tl=(P,W,o={})=>({P,W,...o});
const TW_HI=(len,W,o,hy=25)=>[tl([[19,hy],[9,hy+2],[4,hy+20],[5,len*.6],[7,len]],W,o),tl([[81,hy],[91,hy+2],[96,hy+20],[95,len*.6],[93,len]],W,o)];
const TW_LO=(len,W,o)=>[tl([[21,76],[15,84],[12,104],[13,len*.75],[11,len]],W,{...o,f:1}),tl([[79,76],[85,84],[88,104],[87,len*.75],[89,len]],W,{...o,f:1})];
// Short
bhAdd('Rounded bob','Short',(D,s)=>({b:bhMass({L:80,n:5,dp:2.4,cv:3,inw:3,top:1},s),sk:0,s:80}));
bhAdd('Layered bob','Short',(D,s)=>({b:bhMass({L:84,n:6,dp:4},s),lay:[bhMass({L:68,n:7,dp:5,top:-1},s+1)],sk:0,s:80}));
bhAdd('Asymmetrical bob','Short',(D,s)=>({b:bhMass({L:96,La:72,n:7,dp:3},s),sk:0,s:80}));
bhAdd('Short wolf cut','Short',(D,s)=>({b:bhMass({L:78,n:7,dp:8,fl:2},s),vt:[tl([[24,60],[18,80],[17,100],[19,116]],9,{back:1}),tl([[76,60],[82,80],[83,100],[81,116]],9,{back:1})],sk:4,s:84}));
bhAdd('Short shaggy hair','Short',(D,s)=>({b:bhMass({L:80,n:10,dp:8,fl:3,wave:1},s),lay:[bhMass({L:64,n:9,dp:7,top:-2},s+2)],sk:4,s:80}));
bhAdd('Short fluffy hair','Short',(D,s)=>({b:bhMass({L:80,n:5,dp:3,cv:4,fl:6,inw:2,top:3},s),sk:5,s:76}));
bhAdd('Short curly hair','Short',(D,s)=>({b:bhMass({L:82,n:6,dp:3,fl:3,cur:6.5},s),sk:5,s:76}));
bhAdd('Chin-length hair','Short',(D,s)=>({b:bhMass({L:74,n:9,dp:1.6},s),sk:0,s:72}));
// Medium
bhAdd('Medium layered hair','Medium',(D,s)=>({b:bhMass({L:120,n:8,dp:6,fl:2},s),lay:[bhMass({L:96,n:8,dp:6,top:-1},s+1)],sk:1,s:104}));
bhAdd('Medium wavy hair','Medium',(D,s)=>({b:bhMass({L:118,n:7,dp:7,fl:4,wave:3},s),sk:2,s:104}));
bhAdd('Medium wolf cut','Medium',(D,s)=>({b:bhMass({L:98,n:8,dp:9,fl:3},s),vt:[tl([[22,70],[15,96],[14,120],[16,138]],10,{back:1}),tl([[78,70],[85,96],[86,120],[84,138]],10,{back:1})],sk:4,s:100}));
bhAdd('Medium shaggy hair','Medium',(D,s)=>({b:bhMass({L:116,n:11,dp:9,fl:3,wave:1.4},s),lay:[bhMass({L:90,n:9,dp:8},s+4)],sk:4,s:100}));
bhAdd('Feathered hair','Medium',(D,s)=>({b:bhMass({L:116,n:11,dp:11,fl:4},s),sk:2,s:104}));
bhAdd('Fluffy medium hair','Medium',(D,s)=>({b:bhMass({L:112,n:6,dp:4,cv:5,fl:8,inw:3,top:3},s),sk:5,s:100}));
bhAdd('Inward-curled hair','Medium',(D,s)=>({b:bhMass({L:110,n:6,dp:2.6,cv:4,inw:6},s),sk:1,s:100}));
bhAdd('Flipped-out hair','Medium',(D,s)=>({b:bhMass({L:104,n:7,dp:3,out:8,fl:3},s),sk:1,s:96}));
// Long
bhAdd('Long layered hair','Long',(D,s)=>({b:bhMass({L:166,n:9,dp:7,fl:3},s),lay:[bhMass({L:128,n:8,dp:7},s+1),bhMass({L:96,n:8,dp:6,top:-1},s+2)],sk:1,s:140}));
bhAdd('Long curly hair','Long',(D,s)=>({b:bhMass({L:160,n:8,dp:5,fl:5,cur:8},s),sk:2,s:132}));
bhAdd('Long fluffy hair','Long',(D,s)=>({b:bhMass({L:156,n:7,dp:5,cv:6,fl:9,wave:2,top:3},s),sk:2,s:130}));
bhAdd('Long feathered hair','Long',(D,s)=>({b:bhMass({L:168,n:12,dp:13,fl:4},s),sk:2,s:140}));
bhAdd('Long shaggy hair','Long',(D,s)=>({b:bhMass({L:162,n:12,dp:12,fl:4,wave:1.4},s),lay:[bhMass({L:112,n:10,dp:10},s+3)],sk:4,s:136}));
bhAdd('Long wolf cut','Long',(D,s)=>({b:bhMass({L:112,n:9,dp:10,fl:3},s),vt:[tl([[21,76],[13,110],[12,146],[15,172]],11,{back:1}),tl([[79,76],[87,110],[88,146],[85,172]],11,{back:1})],sk:4,s:120}));
bhAdd('Princess long hair','Long',(D,s)=>({b:bhMass({L:164,n:7,dp:4,cv:6,fl:5,wave:2.6,inw:5},s),lay:[bhMass({L:110,n:7,dp:4,cv:4,wave:2},s+1)],tie:[[50,10]],sk:2,s:136}));
bhAdd('V-shaped long hair','Long',(D,s)=>({b:bhMass({L:150,n:10,dp:5,v:30},s),sk:1,s:136}));
bhAdd('U-shaped long hair','Long',(D,s)=>({b:bhMass({L:156,n:10,dp:4,cv:16},s),sk:1,s:140}));
// Tied
bhAdd('Loose ponytail','Tied',(D,s)=>({b:BH_HEAD,vt:[tl([[26,78],[20,88],[17,108],[18,130],[16,152]],19,{f:1,loose:1,wave:2})],tie:[[26,79]],sk:0,s:76,ears:1}));
bhAdd('Wavy ponytail','Tied',(D,s)=>({b:BH_HEAD,vt:[tl([[62,9],[82,-2],[98,26],[99,70],[93,116],[88,152]],18,{wave:3})],tie:[[63,10]],sk:0,s:76,ears:1}));
bhAdd('Curly ponytail','Tied',(D,s)=>({b:BH_HEAD,vt:[tl([[62,9],[82,-2],[97,26],[98,68],[94,108],[90,138]],18,{cur:1})],tie:[[63,10]],sk:0,s:76,ears:1}));
bhAdd('Braided ponytail','Tied',(D,s)=>({b:BH_HEAD,vt:[tl([[62,9],[82,-2],[96,26],[96,70],[92,114],[90,150]],12,{br:1})],tie:[[63,10]],sk:0,s:76,ears:1}));
bhAdd('Half-up ponytail','Tied',(D,s)=>({b:bhMass({L:150,n:8,dp:5,fl:2},s),vt:[tl([[56,8],[70,-2],[80,8],[84,30],[82,52]],12,{})],tie:[[57,9]],sk:1,s:128}));
// Twin tails
bhAdd('Low twin tails','Twin tails',(D,s)=>({b:BH_HEAD2,vt:TW_LO(150,16,{}),tie:[[21,77],[79,77]],sk:1,s:96}));
bhAdd('Long slim twin tails','Twin tails',(D,s)=>({b:BH_HEAD2,vt:TW_HI(196,13,{n:3}),tie:[[19,26],[81,26]],sk:1,s:96}));
bhAdd('Short twin tails','Twin tails',(D,s)=>({b:BH_HEAD2,vt:[tl([[19,25],[9,28],[5,46],[7,70]],16,{}),tl([[81,25],[91,28],[95,46],[93,70]],16,{})],tie:[[19,26],[81,26]],sk:1,s:92}));
bhAdd('Soft wavy twin tails','Twin tails',(D,s)=>({b:BH_HEAD2,vt:TW_HI(160,16,{wave:3}),tie:[[19,26],[81,26]],sk:1,s:96}));
bhAdd('Curly twin tails','Twin tails',(D,s)=>({b:BH_HEAD2,vt:TW_HI(150,17,{cur:1}),tie:[[19,26],[81,26]],sk:1,s:96}));
bhAdd('Fluffy twin tails','Twin tails',(D,s)=>({b:BH_HEAD2,vt:TW_HI(140,22,{loose:1,n:6}),tie:[[19,26],[81,26]],sk:1,s:96}));
bhAdd('Layered twin tails','Twin tails',(D,s)=>({b:BH_HEAD2,vt:TW_HI(160,19,{n:5}),tie:[[19,26],[81,26]],sk:1,s:96}));
bhAdd('Braided twin tails','Twin tails',(D,s)=>({b:BH_HEAD2,vt:TW_HI(150,11,{br:1}),tie:[[19,26],[81,26]],sk:1,s:96}));
bhAdd('Loose twin tails','Twin tails',(D,s)=>({b:BH_HEAD2,vt:TW_LO(156,18,{loose:1,wave:2}),tie:[[21,77],[79,77]],sk:1,s:96}));
// Other
bhAdd('Low bun','Other',(D,s)=>({b:BH_HEAD,parts:[{k:'bun',x:63,y:72,r:10,back:1}],sk:0,s:76,ears:1}));
bhAdd('Messy bun','Other',(D,s)=>({b:BH_HEAD,parts:[{k:'bun',x:50,y:5,r:10.5,messy:1}],sk:5,s:76,ears:1}));
bhAdd('Braided bun','Other',(D,s)=>({b:BH_HEAD,parts:[{k:'bun',x:50,y:5,r:10.5,braid:1}],sk:0,s:76,ears:1}));
bhAdd('Side bun','Other',(D,s)=>({b:BH_HEAD,parts:[{k:'bun',x:80,y:30,r:10,back:1}],sk:0,s:76,ears:1}));
bhAdd('Single braid','Other',(D,s)=>({b:BH_HEAD2,vt:[tl([[75,74],[78,96],[78,124],[77,150]],11,{br:1,f:1})],tie:[[77,150]],sk:0,s:78}));
bhAdd('Half-up wavy hair','Other',(D,s)=>({b:bhMass({L:146,n:7,dp:7,fl:4,wave:3},s),top:1,tie:[[74,22]],sk:2,s:124}));
bhAdd('Half-up curly hair','Other',(D,s)=>({b:bhMass({L:142,n:7,dp:5,fl:5,cur:7.5},s),curl:1,top:1,tie:[[74,22]],sk:2,s:120}));
// added later (appended so earlier style numbers never change)
bhAdd('Slim twin tails','Twin tails',(D,s)=>({b:BH_HEAD2,vt:TW_HI(150,12,{n:3}),tie:[[19,26],[81,26]],sk:1,s:96}));
bhAdd('Medium twin tails','Twin tails',(D,s)=>({b:BH_HEAD2,vt:TW_HI(132,17,{}),tie:[[19,26],[81,26]],sk:1,s:96}));
bhAdd('High twin tails','Twin tails',(D,s)=>({b:BH_HEAD2,vt:TW_HI(146,16,{},14),tie:[[20,15],[80,15]],sk:1,s:96}));
// names: existing 12–14 had no names; new styles from 25
BKN[12]='Long hime hair';BKN[13]='Short spiky hair';BKN[14]='Long layered wolf';
while(BKN.length<25)BKN.push('Back hair '+BKN.length);
const BH0=25;BHX.forEach(x=>BKN.push(x.n));
// groups for the picker (old indices included where they fit)
const BH_GROUPS=[['Short',[0,15,16,13,...BHX.map((x,i)=>x.g=='Short'?BH0+i:-1).filter(i=>i>=0)]],['Medium',[1,17,19,...BHX.map((x,i)=>x.g=='Medium'?BH0+i:-1).filter(i=>i>=0)]],
 ['Long',[2,3,4,12,14,18,24,...BHX.map((x,i)=>x.g=='Long'?BH0+i:-1).filter(i=>i>=0)]],['Tied',[5,6,7,20,...BHX.map((x,i)=>x.g=='Tied'?BH0+i:-1).filter(i=>i>=0)]],
 ['Twin tails',[8,...BHX.map((x,i)=>x.g=='Twin tails'?BH0+i:-1).filter(i=>i>=0)]],['Buns, braids & half-up',[10,23,9,22,21,11,...BHX.map((x,i)=>x.g=='Other'?BH0+i:-1).filter(i=>i>=0)]]];
{const f=backHair;backHair=function(bk,D,seed){let B;const X=bk>=BH0&&BHX[bk-BH0];if(X)B=X.f(D,seed);else if(bk==4)B={b:bhMass({L:146,n:8,dp:4,fl:5,cur:7},seed),sk:2,s:120};else B=f.apply(this,arguments);if(!B)return B;B={...B};
 // the old thin tails become full tails (same paths, about twice as thick)
 const conv=(T,front)=>{const W=T[T.length-2],P=T.slice(0,-2).map(p=>p.slice());if(front&&P[0][1]>60){const o=P[0];P[0]=[o[0]<50?Math.min(o[0],24):Math.max(o[0],76),o[1]-2];if(B.tie)B.tie=B.tie.map(t=>Math.hypot(t[0]-o[0],t[1]-o[1])<6?[P[0][0],P[0][1]+1]:t)}return tl(P,Math.max(13,W*1.35),{f:front})};
 const brd=(BR)=>{const[x0,y0,x1,y1,mi]=BR,X=x=>mi?100-x:x,a=[X(x0<50?Math.min(x0,25):Math.max(x0,75)),y0-4];return tl([a,[X(x0-3+(x1-x0)*.3),y0+(y1-y0)*.3],[X(x1+1),y0+(y1-y0)*.7],[X(x1),y1]],11,{br:1,f:1})};
 if(B.braid||B.braids){B.vt=[...(B.vt||[]),...[...(B.braid?[B.braid]:[]),...(B.braids||[])].map(brd)];delete B.braid;delete B.braids}
 if(B.bun){B.parts=[...(B.parts||[]),{k:'bun',x:50,y:6,r:10.5}];delete B.bun}
 if(B.bun2){B.parts=[...(B.parts||[]),{k:'bun',x:27,y:9,r:9},{k:'bun',x:73,y:9,r:9}];delete B.bun2}
 if(B.tails){B.vt=[...(B.vt||[]),...B.tails.map(T=>conv(T,0))];delete B.tails}
 if(B.ftails){B.vt=[...(B.vt||[]),...B.ftails.map(T=>conv(T,1))];delete B.ftails}
 return B}}
// ---- drawing: tails made of several slim strands ----------------------------------------------------------------------
// A tail is gathered thin at the tie, opens to its width within the first fifth and is built from 3–6 tapered strands
// (outer ones a shade darker, drawn first), each with its own slight curve and length, so the ends separate naturally.
function bhOffset(S,i,o){const a=S[Math.max(0,i-1)].p,b=S[Math.min(S.length-1,i+1)].p,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return[S[i].p[0]-dy/l*o,S[i].p[1]+dx/l*o]}
function bhExt(P,e){const a=P[P.length-2],b=P[P.length-1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return[...P,[b[0]+dx/l*e,b[1]+dy/l*e]]}
function bhStrandTail(T,C,seed){const W=T.W,N=22,n=T.n||(W<13?3:W<19?4:W<24?5:6),S=limbPts(bhExt(T.P,0),()=>0,N),out=[];
 for(let j=0;j<n;j++){const k=n==1?0:-1+2*j/(n-1),len=.9+bhJ(seed,j*5+1)*.12+(Math.abs(k)<.4?.06:0),ph=bhJ(seed,j*3)*6.28,wa=(T.wave||0)*(.6+bhJ(seed,j+11)*.6),cur=T.cur?W*.13:0;
  const pts=[];for(let i=0;i<=N;i++){const t=i/N;if(t>len)break;const open=Math.sin(Math.min(1,t/.22)*Math.PI/2),spread=k*W*.3*open*(1+(T.loose?.55:.15)*t),wav=Math.sin(t*Math.PI*(cur?4.5:2.2)+ph)*(wa+cur)*Math.min(1,t*2.5);pts.push(bhOffset(S,i,spread+wav))}
  if(pts.length<3)continue;
  if(T.cur){const e=pts[pts.length-1],d=k<0?-1:1;pts.push([e[0]+d*W*.16,e[1]+W*.1],[e[0]+d*W*.2,e[1]-W*.04])}
  const w=W*(n>4?.42:.5)*(1-Math.abs(k)*.12),prof=t=>w*(.45+.55*Math.sin(Math.min(1,t/.25)*Math.PI/2))*(1-Math.pow(t,1.8))+.3;
  out.push({k,d:limbPath(limbPts(pts,prof,16),0,1,0,.9),pts,w})}
 const back=T.back?C.HD:C.HB;let s='';
 out.sort((a,b)=>Math.abs(b.k)-Math.abs(a.k)).forEach((o,i)=>{const outer=Math.abs(o.k)>.6;s+=`<path d="${o.d}" fill="${outer?C.HD:back}" stroke="${C.hl}" stroke-width=".55" stroke-linejoin="round"/>`;
  const q=o.pts,a=Math.max(1,Math.round(q.length*.12)),b=Math.max(a+2,Math.round(q.length*.55));if(!outer)s+=`<path d="${crPath(q.slice(a,b).map(([x,y])=>[x-o.w*.12,y]))}" fill="none" stroke="${C.hlite}" stroke-width="${N2(Math.max(.7,o.w*.16))}" opacity=".38" stroke-linecap="round"/>`});
 // gathered root at the tie (hidden under the ribbon)
 const p0=T.P[0],p1=T.P[1],an=Math.atan2(p1[1]-p0[1],p1[0]-p0[0])*180/Math.PI;s+=`<ellipse cx="${N2(p0[0])}" cy="${N2(p0[1])}" rx="${N2(W*.26)}" ry="${N2(W*.2)}" transform="rotate(${N2(an)} ${N2(p0[0])} ${N2(p0[1])})" fill="${back}" stroke="${C.hl}" stroke-width=".55"/>`;
 return s}
// braid: interlocking sections alternating left / right along the line, a small tuft at the end
function bhBraid(T,C,seed){const W=T.W,len=limbPts(T.P,()=>0,40),tot=len.reduce((a,s,i)=>i?a+Math.hypot(s.p[0]-len[i-1].p[0],s.p[1]-len[i-1].p[1]):0,0),step=W*.52,n=Math.max(4,Math.floor(tot/step)),S=limbPts(T.P,()=>0,n);let s='';
 for(let i=0;i<n;i++){const p=S[i].p,q=S[i+1].p,dx=q[0]-p[0],dy=q[1]-p[1],ang=Math.atan2(dy,dx)*180/Math.PI,sd=i%2?1:-1,w=W*(1-.25*i/n),fill=i%2?C.HB:C.HF;
  const cx=(p[0]+q[0])/2,cy=(p[1]+q[1])/2,L=Math.hypot(dx,dy)*1.35,h=w*.5;
  // one braid section: a leaf leaning across the braid
  s+=`<g transform="translate(${N2(cx)} ${N2(cy)}) rotate(${N2(ang+sd*28)})"><path d="M${N2(-L/2)} 0C${N2(-L/4)} ${N2(-h)} ${N2(L/4)} ${N2(-h)} ${N2(L/2)} 0C${N2(L/4)} ${N2(h*.8)} ${N2(-L/4)} ${N2(h*.8)} ${N2(-L/2)} 0Z" fill="${fill}" stroke="${C.hl}" stroke-width=".55"/><path d="M${N2(-L*.28)} ${N2(-h*.35)}Q0 ${N2(-h*.62)} ${N2(L*.28)} ${N2(-h*.35)}" fill="none" stroke="${C.hlite}" stroke-width=".7" opacity=".45" stroke-linecap="round"/></g>`}
 const e=S[n].p,d=S[n].p,pr=S[n-1].p,an=Math.atan2(e[1]-pr[1],e[0]-pr[0]);const tuft=[[0,0],[-.5,.2],[-.2,1],[0,.5],[.25,1.1],[.45,.3]].map(([u,v])=>[e[0]+Math.cos(an)*v*W*.9-Math.sin(an)*u*W*.7,e[1]+Math.sin(an)*v*W*.9+Math.cos(an)*u*W*.7]);
 s+=`<path d="M${tuft.map(([x,y])=>N2(x)+' '+N2(y)).join('L')}Z" fill="${C.HB}" stroke="${C.hl}" stroke-width=".55" stroke-linejoin="round"/>`;return s}
function bhTail(T,C,seed){return T.br?bhBraid(T,C,seed):bhStrandTail(T,C,seed)}
// bun: hair twisted into a coil (wrapped strands), small and attached at its base
function bhBun(p,C){const{x,y}=p,r=Math.min(p.r,11);let s=`<ellipse cx="${x}" cy="${N2(y+r*.25)}" rx="${N2(r*.7)}" ry="${N2(r*.45)}" fill="${C.HB}" stroke="${C.hl}" stroke-width=".6"/><circle cx="${x}" cy="${y}" r="${r}" fill="${C.HB}" stroke="${C.hl}" stroke-width=".7"/>`;
 if(p.braid){for(let i=0;i<9;i++){const a=i/9*Math.PI*2,cx=x+Math.cos(a)*r*.6,cy=y+Math.sin(a)*r*.6;s+=`<ellipse cx="${N2(cx)}" cy="${N2(cy)}" rx="${N2(r*.36)}" ry="${N2(r*.2)}" transform="rotate(${N2(a*180/Math.PI+62)} ${N2(cx)} ${N2(cy)})" fill="${i%2?C.HF:C.HB}" stroke="${C.hl}" stroke-width=".5"/>`}s+=`<circle cx="${x}" cy="${y}" r="${N2(r*.32)}" fill="${C.HF}" stroke="${C.hl}" stroke-width=".5"/>`}
 else{// three wrapped strands spiralling into the centre
  [[0,1],[2.1,.82],[4.2,.66]].forEach(([a0,sc],i)=>{const R=r*sc,pts=[];for(let t=0;t<=1.001;t+=.125){const a=a0+t*Math.PI*1.25,rr=R*(1-t*.55);pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr*.92])}
   s+=`<path d="${limbPath(limbPts(pts,t=>r*.5*(1-t*.6)+.3,12),0,1,0,.9)}" fill="${i==1?C.HB:C.HF}" stroke="${C.hl}" stroke-width=".55" stroke-linejoin="round"/>`});
  s+=`<path d="M${N2(x-r*.55)} ${N2(y-r*.5)}Q${N2(x-r*.1)} ${N2(y-r*.92)} ${N2(x+r*.35)} ${N2(y-r*.72)}" stroke="${C.hlite}" stroke-width="1" fill="none" opacity=".5" stroke-linecap="round"/>`}
 if(p.messy)s+=[[-1,-.3,-1.45,-1],[1,-.4,1.5,-.95],[.15,-1,.55,-1.55],[-.95,.5,-1.4,1.05]].map(([a,b,c,d])=>`<path d="${limbPath(limbPts([[x+a*r*.7,y+b*r*.7],[x+(a+c)*r*.55,y+(b+d)*r*.6],[x+c*r,y+d*r]],t=>r*.32*(1-t)+.3,8),0,1,0,.9)}" fill="${C.HF}" stroke="${C.hl}" stroke-width=".5"/>`).join('');
 return s}
// strand lines on a silhouette (long hair reads as hair, not a flat shape)
function bhStrands(B,C){if(B.s<90)return'';return`<g fill="none" stroke="${C.hl}" stroke-width=".55" opacity=".28" stroke-linecap="round"><path d="M20 70C16 92 16 116 19 ${Math.min(B.s+10,150)}M80 70C84 92 84 116 81 ${Math.min(B.s+10,150)}M30 84C28 104 29 124 31 ${Math.min(B.s+16,150)}M70 84C72 104 71 124 69 ${Math.min(B.s+16,150)}"/></g>`}
// all extra back-hair pieces of one style: [behind the main shape, in front of it, over the shoulders]
function bhExtras(B,C,seed){let pre='',post='',over='';
 (B.vt||[]).forEach((T,i)=>{const h=bhTail(T,C,seed+i*13);if(T.f)over+=h;else pre+=h});
 (B.lay||[]).forEach((d,i)=>post+=`<path d="${d}" fill="${C.HF}" stroke="${C.hl}" stroke-width=".65" stroke-linejoin="round" opacity=".96"/>`);
 (B.parts||[]).forEach(p=>{if(p.k=='bun'){const h=bhBun(p,C);if(p.back||p.y>60)pre+=h;else post+=h}});return{pre,post,over}}
// ---- head renderer hook: full tails, layers, buns, mixed back hair --------------------------------------------------------
function bhC(id,hb){return{HB:`url(#${id}bt)`,HD:`url(#${id}bu)`,HF:`url(#${id}hf)`,hl:mixc(hb[2],'#22121e',.4),hlite:mixc(hb[1],'#ffffff',.6)}}
function bhLayerXf(L){const x=+L.x||0,y=+L.y||0,s=Math.max(.5,Math.min(1.6,+L.s||1));return`translate(${N2(50+x)} ${N2(10+y)}) scale(${N2(s)}) translate(-50 -10)`}
{const f=headParts;headParts=function(m,ex,id,opt={}){const r=f.apply(this,arguments);try{const a=r.a,D=r.D,hb=apHairC(a),C=bhC(id,hb),seed=((m.id|0)+1)*131;
  if(!opt._bhDefs)r.defs+=`<linearGradient id="${id}bt" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="200"><stop offset="0" stop-color="${mixc(hb[1],hb[2],.25)}"/><stop offset=".5" stop-color="${mixc(hb[1],hb[2],.4)}"/><stop offset="1" stop-color="${mixc(hb[1],hb[2],.6)}"/></linearGradient><linearGradient id="${id}bu" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="200"><stop offset="0" stop-color="${mixc(hb[1],hb[2],.5)}"/><stop offset="1" stop-color="${mixc(hb[1],hb[2],.8)}"/></linearGradient>`;
  const B=backHair(a.bk,D,seed),E=bhExtras(B,C,seed);r.back=E.pre+r.back+E.post;r.over=E.over+r.over;
  // mixed back hair: other layers drawn around the main one
  const X=Array.isArray(a.bkx)?a.bkx.filter(L=>L&&(L.m||(L.k!=null&&BKN[L.k]!=null))).slice(0,6):[];
  if(X.length&&!opt._bhLayer){let back='',over='',ties=r.ties||'';const hasM=X.some(L=>L.m),stack=hasM?X:[{m:1},...X];
   stack.forEach(L=>{if(L.m){back+=r.back;over+=r.over;return}
    const r2=headParts(m,ex,id,{...opt,_bhLayer:1,_bhDefs:1,a:{...a,bk:L.k,bkx:null}});const t=bhLayerXf(L);back+=`<g transform="${t}">${r2.back}</g>`;if(r2.over)over+=`<g transform="${t}">${r2.over}</g>`;if(r2.ties)ties+=`<g transform="${t}">${r2.ties}</g>`});
   r.back=back;r.over=over;r.ties=ties}}catch(e){console.error(e)}return r}}
